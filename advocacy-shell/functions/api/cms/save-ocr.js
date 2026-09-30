/**
 * Cloudflare Pages Function: /api/cms/save-ocr
 * Accepts extracted OCR text and metadata from the Python script,
 * generates Vectorize embeddings, and marks it as 'ingested'.
 */
export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.SURVEY_DB || !env.ARCHIVE_BUCKET || !env.ARCHIVE_INDEX) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }

  try {
    const payload = await request.json();
    const { docId, filename, originalTitle, extractedText, newTitle, metadata, errorMessage } = payload;

    if (!docId || !filename) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (errorMessage) {
      // Handle fatal OCR errors (like recitation blocks)
      const existingDoc = await env.SURVEY_DB.prepare("SELECT metadata_json FROM archive_documents WHERE id = ?").bind(docId).first();
      let updatedMetadata = {};
      try {
        if (existingDoc && existingDoc.metadata_json) {
          updatedMetadata = JSON.parse(existingDoc.metadata_json);
        }
      } catch(e) {}
      updatedMetadata.ocr_error = errorMessage;

      await env.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'error', 
            metadata_json = ?
        WHERE id = ?
      `).bind(JSON.stringify(updatedMetadata), docId).run();

      return new Response(JSON.stringify({ success: true, message: "Marked as error." }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (!extractedText) {
      return new Response(JSON.stringify({ error: "Missing extractedText" }), { status: 400 });
    }

    // 1. Chunk text (paragraph-aware, never break mid-sentence, sub-chunk large blocks)
    const paragraphs = extractedText.split(/\n\n+/);
    const chunks = [];
    let currentChunk = '';

    for (const rawPara of paragraphs) {
      const para = (rawPara || '').trim();
      if (!para) continue;

      if (para.length > 1200) {
        // Flush any pending accumulator
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // Sub-chunk oversized paragraphs/tables by sentence or ~1000 char slices
        const sentences = para.match(/[^.!?\n]+[.!?\n]+|\S+/g) || [para];
        let subChunk = '';
        for (const sent of sentences) {
          if ((subChunk + ' ' + sent).length > 1000 && subChunk.length > 0) {
            chunks.push(subChunk.trim());
            subChunk = sent;
          } else {
            subChunk = subChunk ? subChunk + ' ' + sent : sent;
          }
        }
        if (subChunk.trim()) chunks.push(subChunk.trim());
      } else {
        if ((currentChunk + '\n\n' + para).length > 1200 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = para;
        } else {
          currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
        }
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    // 2. Generate embeddings and Vectorize
    const aiBinding = env.AI || env.Workers_AI;
    if (chunks.length > 0) {
      const embeddingResponse = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
      const vectors = embeddingResponse.data.map((vec, i) => {
        // Enforce hard ceiling to strictly adhere to Vectorize's 10,240-byte metadata limit
        const chunkText = chunks[i] || '';
        const safeText = chunkText.length > 2500 ? chunkText.slice(0, 2500) + '...' : chunkText;
        return {
          id: `${docId}-chunk-${i}`,
          values: vec,
          metadata: { 
            source: filename, 
            text: safeText, 
            title: (originalTitle || '').slice(0, 250) 
          }
        };
      });
      
      await env.ARCHIVE_INDEX.insert(vectors);
      
      // 3. Save Markdown to R2
      const baseFilename = filename.replace(/^documents\//, "");
      const cleanMdName = baseFilename.replace(/\.[^/.]+$/, "") + ".md";
      const r2Key = `documents/${cleanMdName}`;

      await env.ARCHIVE_BUCKET.put(r2Key, extractedText, {
        httpMetadata: { contentType: 'text/markdown' }
      });
      
      // 4. Update CMS with metadata
      const existingDoc = await env.SURVEY_DB.prepare("SELECT metadata_json FROM archive_documents WHERE id = ?").bind(docId).first();
      let updatedMetadata = {};
      try {
        if (existingDoc && existingDoc.metadata_json) {
          updatedMetadata = JSON.parse(existingDoc.metadata_json);
        }
      } catch(e) {}
      
      updatedMetadata.extracted_text_url = `/api/assets/documents/${cleanMdName}`;
      updatedMetadata.gemini_extracted_metadata = metadata; // The date, authors, etc.

      await env.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', 
            chunks_vectorized = ?,
            title = ?,
            metadata_json = ?
        WHERE id = ?
      `).bind(vectors.length, newTitle || originalTitle, JSON.stringify(updatedMetadata), docId).run();
    } else {
      // No text extracted
      await env.SURVEY_DB.prepare("UPDATE archive_documents SET status = 'ingested', chunks_vectorized = 0 WHERE id = ?").bind(docId).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Saved ${filename} successfully.`,
      docId: docId,
      chunks: chunks.length
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
