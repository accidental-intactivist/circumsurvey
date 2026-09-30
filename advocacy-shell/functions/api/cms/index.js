/**
 * CMS API Endpoint: /api/cms
 * GET: Lists all archive_documents with optional filtering
 * POST: Create a new manual document entry
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit')) || 100;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  
  try {
    let query = "SELECT * FROM archive_documents ";
    let countQuery = "SELECT count(*) as total FROM archive_documents ";
    let params = [];
    
    if (status) {
      query += "WHERE status = ? ";
      countQuery += "WHERE status = ? ";
      params = [status];
    } else if (type) {
      query += "WHERE type = ? ";
      countQuery += "WHERE type = ? ";
      params = [type];
    }

    query += `ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const { results } = await env.SURVEY_DB.prepare(query).bind(...params).all();
    const countResult = await env.SURVEY_DB.prepare(countQuery).bind(...params).first();
    
    return new Response(JSON.stringify({ 
      data: results, 
      total: countResult.total 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const id = crypto.randomUUID().split('-')[0];
    
    const stmt = env.SURVEY_DB.prepare(`
      INSERT INTO archive_documents (
        id, title, source_collection, url, type, status, media_urls, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || "Untitled",
      data.source_collection || "Uncategorized",
      data.url || null,
      data.type || "web_page",
      data.status || "pending",
      data.media_urls ? JSON.stringify(data.media_urls) : null,
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    await stmt.run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
