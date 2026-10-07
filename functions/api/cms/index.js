console.log("LOADED CMS API ROUTE");

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
  const types = (url.searchParams.get('types') || '').split(',').map(t => t.trim()).filter(Boolean);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 100, 1000);
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  
  try {
    console.log("API /api/cms called!");
    let query = "SELECT * FROM archive_documents ";
    let countQuery = "SELECT count(*) as total FROM archive_documents ";
    const clauses = [];
    const params = [];
    
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    } else if (url.searchParams.get('hide_rejected') === '1') {
      clauses.push("COALESCE(status, '') != 'rejected'");
    }
    if (types.length) {
      clauses.push(`type IN (${types.map(() => '?').join(',')})`);
      params.push(...types);
    } else if (type) {
      clauses.push("type = ?");
      params.push(type);
    }
    const category = url.searchParams.get('category');
    if (category) {
      clauses.push("category = ?");
      params.push(category);
    }
    if (clauses.length) {
      const where = `WHERE ${clauses.join(' AND ')} `;
      query += where;
      countQuery += where;
    }

    const orderBy = url.searchParams.get('sort') === 'published'
      ? 'COALESCE(published_at, created_at) DESC'
      : 'created_at DESC';
    query += `ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;

    console.log("Executing D1 query:", query);
    const { results } = await env.SURVEY_DB.prepare(query).bind(...params).all();
    console.log("Query returned", results?.length, "results");
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
        id, title, source_collection, url, type, status, media_urls, content, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || "Untitled",
      data.source_collection || "Uncategorized",
      data.url || null,
      data.type || "web_page",
      data.status || "pending",
      data.media_urls ? JSON.stringify(data.media_urls) : null,
      data.content || null,
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    await stmt.run();

    // If it's an article, recap, or field note and has content, vectorize it
    if ((data.type === 'article' || data.type === 'recap' || data.type === 'field_note') && data.content && env.ARCHIVE_INDEX) {
        try {
            const aiBinding = env.AI || env.Workers_AI;
            const vectorData = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [data.content.slice(0, 1000)] });
            if (vectorData && vectorData.data && vectorData.data[0]) {
                const vector = vectorData.data[0];
                await env.ARCHIVE_INDEX.upsert([{
                    id: id,
                    values: vector,
                    metadata: { 
                        source: data.type === 'field_note' ? "Field Note (Accidental Intactivist)" : "CMS Authoring Studio", 
                        text: data.content.slice(0, 1000), 
                        doc_id: id 
                    }
                }]);
            }
        } catch(e) {
            console.error("Vectorization failed during CMS POST", e);
        }
    }

    let coaching_feedback = null;
    if (data.type === 'field_note') {
        try {
            const aiBinding = env.AI || env.Workers_AI;
            if (aiBinding) {
                const prompt = `You are Glenda, an expert writing coach, senior research assistant, and strategic thought partner for the "Accidental Intactivist" (an advocate for genital autonomy). The author just dumped the following private field note:

Title: ${data.title}
Content: ${data.content}

Your task:
1. Briefly validate their thoughts and observations (do not judge their unfiltered tone).
2. Suggest 1 or 2 specific ways they could adapt this raw idea into a professional blog post, a polite conversation starter, or a scholarly argument.
Keep your response concise, encouraging, and highly actionable.`;

                const aiRes = await aiBinding.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
                    messages: [{ role: "system", content: prompt }]
                });
                coaching_feedback = aiRes.response;
            }
        } catch(e) {
            console.error("Coaching feedback failed:", e);
        }
    }

    return new Response(JSON.stringify({ success: true, id, coaching_feedback }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
