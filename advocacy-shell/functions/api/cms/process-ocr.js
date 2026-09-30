/**
 * Cloudflare Pages Function: /api/cms/process-ocr
 * Fetches ONE 'pending_ocr' document from D1, reads it from R2, runs Gemini OCR, 
 * generates Vectorize embeddings, and marks it as 'ingested'.
 */
export async function onRequestPost(context) {
  const { env } = context;

  if (!env.SURVEY_DB || !env.ARCHIVE_BUCKET || !env.ARCHIVE_INDEX) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }

  try {
    // 1. Fetch one pending_ocr document
    const doc = await env.SURVEY_DB.prepare("SELECT * FROM archive_documents WHERE status = 'pending_ocr' LIMIT 1").first();
    
    if (!doc) {
      return new Response(JSON.stringify({ success: true, message: "No pending documents", processed: 0 }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (!doc.url) {
      await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
      throw new Error(`Document ${doc.id} has no URL.`);
    }

    // The url is /api/assets/{filename}, so let's extract the filename
    const filename = doc.url.replace('/api/assets/', '');
    console.log(`Processing ${filename} for OCR...`);

    // 2. Fetch the file from R2
    let r2Object = await env.ARCHIVE_BUCKET.get(filename);
    let pdfBuffer;
    if (!r2Object) {
      const fallbackRes = await fetch(`https://advocacy-shell.pages.dev/api/assets/${filename}`);
      if (!fallbackRes.ok) {
        await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
        throw new Error(`File ${filename} not found locally or in production R2.`);
      }
      pdfBuffer = await fallbackRes.arrayBuffer();
    } else {
      pdfBuffer = await r2Object.arrayBuffer();
    }

    // 3. Run Gemini OCR
    const apiKey = env.GEMINI_API_KEY;
    let extractedText = "";

    const ext = filename.split('.').pop().toLowerCase();
    let mimeType = 'application/pdf';
    if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'mp4') mimeType = 'video/mp4';

    if (!apiKey) {
      // Mock for local dev
      extractedText = `Mock extracted text for ${filename}`;
    } else {
      // Upload to Gemini File API
      const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': mimeType },
        body: pdfBuffer,
        duplex: 'half' // Required for streaming bodies in Cloudflare Workers Fetch
      });

      if (!uploadResponse.ok) {
        const err = await uploadResponse.text();
        await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
        throw new Error(`Gemini Upload failed: ${err}`);
      }

      const uploadData = await uploadResponse.json();
      const fileUri = uploadData.file.uri;

      // Ask Gemini to extract text and generate a friendly title
      const prompt = "You are an expert archivist. Extract all text from this document. Output strict Markdown format. Use proper headers (##), bulleted lists, and format any tabular data as Markdown tables. Preserve all information, but format it cleanly in Markdown. Do not include any conversational filler. IMPORTANT: Your very first line MUST be '# TITLE: ' followed by a concise, friendly title you generate for this document based on its contents.";
      const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { fileData: { mimeType: mimeType, fileUri: fileUri } }
            ]
          }]
        })
      });

      if (!generateResponse.ok) {
         const err = await generateResponse.text();
         await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'error' WHERE id = ?").bind(doc.id).run();
         throw new Error(`Gemini generateContent failed: ${err}`);
      }

      const generateData = await generateResponse.json();
      extractedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    let newTitle = doc.title;
    const titleMatch = extractedText.match(/^# TITLE:\s*(.*)/i);
    if (titleMatch) {
      newTitle = titleMatch[1].trim();
      extractedText = extractedText.replace(/^# TITLE:\s*(.*)\n*/i, '').trim();
    }

    // 4. Chunk text
    const chunks = extractedText.match(/[^]{1,1000}/g) || [];

    // 5. Generate embeddings and Vectorize
    const aiBinding = env.AI || env.Workers_AI;
    if (chunks.length > 0) {
      const embeddingResponse = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
      const vectors = embeddingResponse.data.map((vec, i) => ({
        id: `${doc.id}-chunk-${i}`,
        values: vec,
        metadata: { source: filename, text: chunks[i], title: doc.title }
      }));
      
      await env.ARCHIVE_INDEX.insert(vectors);
      
      // 6. Save Markdown to R2
      const mdFilename = filename.replace(/\.[^/.]+$/, "") + ".md";
      await env.ARCHIVE_BUCKET.put(`documents/${mdFilename}`, extractedText, {
        httpMetadata: { contentType: 'text/markdown' }
      });
      
      // 7. Update CMS
      await env.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', 
            chunks_vectorized = ?,
            title = ?,
            metadata_json = json_set(ifnull(metadata_json, '{}'), '$.extracted_text_url', ?)
        WHERE id = ?
      `).bind(vectors.length, newTitle, `/api/assets/${mdFilename}`, doc.id).run();
    } else {
      // No text extracted
      await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'ingested', chunks_vectorized = 0 WHERE id = ?").bind(doc.id).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${filename} successfully.`,
      docId: doc.id,
      chunks: chunks.length,
      processed: 1
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
