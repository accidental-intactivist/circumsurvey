export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { text, metadata } = body;
    
    if (!text) {
      return new Response("Missing text", { status: 400 });
    }
    
    // Chunking text (max 1000 chars per chunk to avoid hitting BGE limits)
    const chunks = text.match(/[^]{1,1000}/g) || []; 
    
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const aiBinding = env.AI || env.Workers_AI;
    const embeddingResponse = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: chunks });
    
    const vectors = embeddingResponse.data.map((vec, i) => ({
      id: `${metadata.id || 'doc'}-${Date.now()}-chunk-${i}`,
      values: vec,
      metadata: { source: metadata.source || 'unknown', text: chunks[i], doc_id: metadata.id || null, ...metadata }
    }));
    
    console.log(`Storing ${vectors.length} vectors in Vectorize...`);
    if (vectors.length > 0) {
      await env.ARCHIVE_INDEX.insert(vectors);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully embedded and stored ${vectors.length} chunks`,
      chunks_vectorized: vectors.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
