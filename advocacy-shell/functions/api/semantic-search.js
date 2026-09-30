export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { query } = await request.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });
    }

    const aiBinding = env.AI || env.Workers_AI;
    if (!aiBinding) {
      return new Response(JSON.stringify({ error: "AI binding missing" }), { status: 500 });
    }

    if (!env.ARCHIVE_INDEX) {
      return new Response(JSON.stringify({ error: "Vectorize binding ARCHIVE_INDEX missing" }), { status: 500 });
    }

    // Embed the query
    const queryEmbedding = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [query] });
    const vector = queryEmbedding.data[0];

    // Search the vector DB
    const searchResults = await env.ARCHIVE_INDEX.query(vector, { topK: 20, returnMetadata: 'all' });
    
    // Format the response
    const matches = searchResults.matches.map(m => {
      let rawId = m.metadata ? (m.metadata.doc_id || m.id) : m.id;
      // Strip "-chunk-X" or any trailing timestamp/chunk parts
      let doc_id = rawId.split('-chunk-')[0];
      // Also handle case where it's split by simple dash but doc_id is first 8 chars
      if (doc_id.includes('-') && doc_id.length > 8) {
         doc_id = doc_id.split('-')[0];
      }
      return { doc_id, score: m.score };
    });

    return new Response(JSON.stringify({ matches }), { 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Semantic Search Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
