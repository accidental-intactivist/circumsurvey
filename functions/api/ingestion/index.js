export async function onRequestGet(context) {
  const { env } = context;
  try {
    // Ensure table exists to prevent 500 errors on empty databases
    await env.SURVEY_DB.prepare(`
      CREATE TABLE IF NOT EXISTS ingestion_queue (
        id TEXT PRIMARY KEY, 
        url TEXT, 
        title TEXT, 
        abstract TEXT, 
        source TEXT, 
        reason TEXT, 
        status TEXT DEFAULT 'pending', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    const result = await env.SURVEY_DB.prepare("SELECT * FROM ingestion_queue WHERE status = 'pending' ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(result.results || []), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
