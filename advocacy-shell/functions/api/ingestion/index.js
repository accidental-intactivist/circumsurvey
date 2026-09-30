export async function onRequestGet(context) {
  const { env } = context;
  try {
    const result = await env.SURVEY_DB.prepare("SELECT * FROM ingestion_queue WHERE status = 'pending' ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(result.results || []), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
