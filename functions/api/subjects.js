export async function onRequestGet(context) {
  const { env } = context;
  try {
    const result = await env.SURVEY_DB.prepare('SELECT * FROM subjects ORDER BY name').all();
    return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
