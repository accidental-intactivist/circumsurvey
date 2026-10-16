export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const docId = url.searchParams.get('doc_id');
  const figureId = url.searchParams.get('id');
  const query = url.searchParams.get('q');
  const category = url.searchParams.get('category');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30', 10), 100);

  if (!env.SURVEY_DB) {
    return new Response(JSON.stringify({ error: "Database binding SURVEY_DB not found" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    let sql = "SELECT * FROM media_assets WHERE 1=1";
    const params = [];

    if (figureId) {
      sql += " AND id = ?";
      params.push(figureId);
    } else if (docId) {
      sql += " AND doc_id = ?";
      params.push(docId);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (query) {
      sql += " AND (caption LIKE ? OR keywords LIKE ? OR doc_title LIKE ?)";
      const wild = `%${query}%`;
      params.push(wild, wild, wild);
    }

    sql += " ORDER BY page_number ASC LIMIT ?";
    params.push(limit);

    const statement = env.SURVEY_DB.prepare(sql).bind(...params);
    const result = await statement.all();

    const figures = (result.results || []).map(row => ({
      id: row.id,
      doc_id: row.doc_id,
      doc_title: row.doc_title,
      page_number: row.page_number,
      bounding_box: row.bounding_box ? JSON.parse(row.bounding_box) : null,
      image_url: row.image_url,
      caption: row.caption,
      category: row.category,
      keywords: row.keywords ? JSON.parse(row.keywords) : [],
      is_sensitive: Boolean(row.is_sensitive),
      created_at: row.created_at
    }));

    return new Response(JSON.stringify({
      figures,
      total: figures.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
