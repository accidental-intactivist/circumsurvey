export async function onRequestGet(context) {
  const { env } = context;
  try {
    const totalResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents").first();
    const activeResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents WHERE status = 'ingested'").first();
    const pendingResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents WHERE status = 'pending'").first();
    const rejectedResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents WHERE status = 'rejected'").first();
    
    // Items added in last 7 days
    const weekResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents WHERE created_at >= datetime('now', '-7 days')").first();
    
    // Items added in last 30 days
    const monthResult = await env.SURVEY_DB.prepare("SELECT count(*) as total FROM archive_documents WHERE created_at >= datetime('now', '-30 days')").first();

    return new Response(JSON.stringify({
      total: totalResult.total || 0,
      active: activeResult.total || 0,
      pending: pendingResult.total || 0,
      rejected: rejectedResult.total || 0,
      added_week: weekResult.total || 0,
      added_month: monthResult.total || 0
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
