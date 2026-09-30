export async function onRequestGet(context) {
  const { env } = context;
  if (!env.SURVEY_DB) return new Response("Missing DB", { status: 500 });
  
  const { results } = await env.SURVEY_DB.prepare(
    "SELECT * FROM archive_documents WHERE type = 'external_news' ORDER BY id DESC LIMIT 50"
  ).all();
  
  return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
}
