export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Get pending requests grouped by document and language to get a tally
    const { results } = await env.SURVEY_DB.prepare(`
      SELECT 
        tr.document_id,
        tr.target_language,
        ad.title as document_title,
        COUNT(tr.id) as request_count,
        MIN(tr.created_at) as first_requested_at
      FROM translation_requests tr
      LEFT JOIN archive_documents ad ON tr.document_id = ad.id
      WHERE tr.status = 'pending'
      GROUP BY tr.document_id, tr.target_language
      ORDER BY request_count DESC, first_requested_at ASC
    `).all();

    return new Response(JSON.stringify({ requests: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
