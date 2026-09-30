/**
 * Cloudflare Pages Function: /api/cms/pending-ocr
 * Fetches a batch of 'pending_ocr' documents from D1.
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.SURVEY_DB) {
    return new Response(JSON.stringify({ error: "Missing bindings" }), { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 10;

    // Fetch batch of pending documents
    const { results } = await env.SURVEY_DB.prepare(
      "SELECT * FROM archive_documents WHERE status = 'pending_ocr' LIMIT ?"
    ).bind(limit).all();

    return new Response(JSON.stringify({
      success: true,
      documents: results || []
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
