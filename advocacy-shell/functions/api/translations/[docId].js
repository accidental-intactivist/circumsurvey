export async function onRequestGet(context) {
  const { params, env } = context;
  const docId = params.docId;

  if (!docId) {
    return new Response(JSON.stringify({ error: "Missing docId" }), { status: 400 });
  }

  try {
    const { results } = await env.SURVEY_DB.prepare(
      `SELECT language, translated_text FROM document_translations WHERE document_id = ?`
    ).bind(docId).all();

    return new Response(JSON.stringify({ translations: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
