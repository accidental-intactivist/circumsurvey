export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;
  try {
    const { action } = await request.json(); // 'approve' or 'reject'
    
    if (action === 'reject') {
      await env.SURVEY_DB.prepare("UPDATE entity_nominations SET status = 'rejected' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: 'rejected' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    if (action === 'approve') {
      // 1. Fetch nomination
      const nom = await env.SURVEY_DB.prepare("SELECT * FROM entity_nominations WHERE id = ?").bind(id).first();
      if (!nom) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      
      // 2. Insert into entities
      const newEntityId = `entity-${Date.now()}`;
      await env.SURVEY_DB.prepare(
        "INSERT INTO entities (id, type, name, description, url) VALUES (?, ?, ?, ?, ?)"
      ).bind(
        newEntityId, nom.type, nom.name, nom.description, nom.url
      ).run();
      
      // 3. Mark approved
      await env.SURVEY_DB.prepare("UPDATE entity_nominations SET status = 'approved' WHERE id = ?").bind(id).run();
      
      return new Response(JSON.stringify({ success: true, status: 'approved' }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
