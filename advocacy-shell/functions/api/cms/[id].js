export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;
  
  try {
    const stmt = env.SURVEY_DB.prepare("SELECT * FROM archive_documents WHERE id = ?").bind(id);
    const doc = await stmt.first();
    
    if (!doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify(doc), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;
  
  try {
    const data = await request.json();
    
    if (data.action === 'approve') {
      const stmt = env.SURVEY_DB.prepare(`
        UPDATE archive_documents 
        SET status = 'ingested', ingested_at = datetime('now')
        WHERE id = ?
      `).bind(id);
      
      await stmt.run();
      
      return new Response(JSON.stringify({ success: true, message: 'Document approved' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;
  
  try {
    const stmt = env.SURVEY_DB.prepare("DELETE FROM archive_documents WHERE id = ?").bind(id);
    await stmt.run();
    
    return new Response(JSON.stringify({ success: true, message: 'Document deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
