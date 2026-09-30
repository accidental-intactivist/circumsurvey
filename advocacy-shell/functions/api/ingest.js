/**
 * Cloudflare Pages Function: /api/ingest
 * Handles uploading raw PDFs to R2, calling Gemini 1.5 Flash for OCR/Text Extraction,
 * chunking the text, generating embeddings via BGE, and storing in Vectorize.
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const metadataStr = formData.get('metadata');
    
    if (!file) {
      return new Response("Missing file", { status: 400 });
    }
    
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    const fileName = file.name || `doc_${Date.now()}.pdf`;
    
    // 1. Upload to R2
    console.log(`Uploading ${fileName} to R2...`);
    await env.ARCHIVE_BUCKET.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/pdf' }
    });
    const r2Url = `/api/assets/${fileName}`;
    
    // 2. OCR via Gemini 1.5 Flash
    console.log(`Sending to Gemini 1.5 Flash for OCR...`);
    const apiKey = env.GEMINI_API_KEY;
    let extractedText = "";
    
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, skipping OCR.");
      extractedText = `Mock extracted text from Gemini for ${fileName}...`;
    } else {
      try {
        // Step 2a: Upload to Gemini File API (required for large PDFs like the 27MB Awakenings)
        console.log("Uploading file to Gemini File API...");
        const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/pdf' },
          body: file // passing the File object / stream directly
        });
        
        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          throw new Error(`Gemini Upload failed: ${errText}`);
        }
        
        const uploadData = await uploadResponse.json();
        const fileUri = uploadData.file.uri;
        console.log(`Uploaded to Gemini File API, URI: ${fileUri}`);
        
        // Step 2b: Ask Gemini to extract text
        const prompt = "You are an expert archivist. Extract all text from this document. Output strict Markdown format. Use proper headers (##), bulleted lists, and format any tabular data as Markdown tables. Preserve all information, but format it cleanly in Markdown. Do not include any conversational filler.";
        const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { fileData: { mimeType: file.type || 'application/pdf', fileUri: fileUri } }
              ]
            }]
          })
        });
        
        if (!generateResponse.ok) {
           const errText = await generateResponse.text();
           throw new Error(`Gemini generateContent failed: ${errText}`);
        }
        
        const generateData = await generateResponse.json();
        extractedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log(`Successfully extracted ${extractedText.length} characters of text via Gemini.`);
        
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        // If it's a 404, let's list the available models to debug
        let modelsList = "Could not fetch models";
        try {
          const mRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const mData = await mRes.json();
          modelsList = mData.models ? mData.models.map(m => m.name).join(', ') : JSON.stringify(mData);
        } catch (e) {}
        return new Response(JSON.stringify({ error: `Gemini OCR Failed: ${geminiError.message}. Available models: ${modelsList}` }), { status: 500 });
      }
    }
    
    // 3. Chunking
    console.log(`Chunking text...`);
    // Basic chunking: split by paragraphs or a set number of characters
    // For a real implementation, we'd use a robust chunking algorithm like LangChain's RecursiveCharacterTextSplitter.
    const chunks = extractedText.match(/[^]{1,1000}/g) || []; 
    
    // 4. Generate Embeddings (Cloudflare AI / BGE model)
    console.log(`Generating embeddings...`);
    const aiBinding = env.AI || env.Workers_AI;
    const embeddingResponse = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
    const docId = crypto.randomUUID().split('-')[0];
    const vectors = embeddingResponse.data.map((vec, i) => ({
      id: `${docId}-chunk-${i}`,
      values: vec,
      metadata: { source: fileName, text: chunks[i], doc_id: docId, ...metadata }
    }));
    
    // 5. Store in Vectorize
    console.log(`Storing ${vectors.length} vectors in Vectorize...`);
    if (vectors.length > 0) {
      await env.ARCHIVE_INDEX.insert(vectors);
      
      // 6. Log to CMS Database
      console.log(`Logging to CMS database...`);
      if (env.SURVEY_DB) {
        await env.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (id, title, source_collection, url, type, status, chunks_vectorized)
          VALUES (?, ?, ?, ?, ?, 'ingested', ?)
        `).bind(
          docId,
          metadata.title || fileName,
          metadata.source_collection || "Manual Upload",
          r2Url,
          'pdf',
          vectors.length
        ).run();
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully ingested ${fileName}`,
      r2_url: r2Url,
      chunks_vectorized: vectors.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
