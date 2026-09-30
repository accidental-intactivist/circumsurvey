export async function onRequestGet(context) {
  const { env } = context;
  try {
    const result = await env.SURVEY_DB.prepare("SELECT * FROM entity_nominations WHERE status = 'pending' ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(result.results || []), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const id = `nom-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    
    await env.SURVEY_DB.prepare(
      "INSERT INTO entity_nominations (id, type, name, description, url, justification, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    ).bind(
      id, data.type, data.name, data.description || '', data.url || '', data.justification || 'Manually nominated by curator.'
    ).run();
    
    return new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
