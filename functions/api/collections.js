/**
 * GET /api/collections
 * Returns a list of all archive collections.
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.SURVEY_DB.prepare("SELECT * FROM archive_collections ORDER BY title ASC").all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
