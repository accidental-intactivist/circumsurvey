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
    const searchResults = await env.ARCHIVE_INDEX.query(vector, { topK: 20 });
    
    // Format the response
    const matches = searchResults.matches.map(m => ({
      doc_id: m.id,
      score: m.score
    }));

    return new Response(JSON.stringify({ matches }), { 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Semantic Search Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
