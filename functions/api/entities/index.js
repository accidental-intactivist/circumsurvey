export async function onRequestGet(context) {
  const { env, request } = context;
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 0;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const search = url.searchParams.get('search') || '';
    const fields = url.searchParams.get('fields') || 'full'; // 'slim' = id,type,name,tagline,role,featured
    const type = url.searchParams.get('type') || ''; // 'person' or 'organization'

    // Build query
    let whereClause = '';
    const bindings = [];

    if (search) {
      whereClause = 'WHERE name LIKE ?';
      bindings.push(`%${search}%`);
      if (type) {
        whereClause += ' AND type = ?';
        bindings.push(type);
      }
    } else if (type) {
      whereClause = 'WHERE type = ?';
      bindings.push(type);
    }

    // Get total count
    const countStmt = env.SURVEY_DB.prepare(`SELECT COUNT(*) as total FROM entities ${whereClause}`);
    const countResult = await (bindings.length ? countStmt.bind(...bindings) : countStmt).first();
    const total = countResult?.total || 0;

    // Select columns based on field mode
    const columns = fields === 'slim'
      ? 'id, type, name, tagline, stance, featured, image_url'
      : '*';

    let query = `SELECT ${columns} FROM entities ${whereClause} ORDER BY name`;
    if (limit > 0) {
      query += ` LIMIT ? OFFSET ?`;
      bindings.push(limit, offset);
    }

    const stmt = env.SURVEY_DB.prepare(query);
    const result = await (bindings.length ? stmt.bind(...bindings) : stmt).all();

    // If no pagination params, return flat array for backwards compatibility
    if (!limit && !url.searchParams.has('total')) {
      return new Response(JSON.stringify(result.results), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
      });
    }

    // Paginated response
    return new Response(JSON.stringify({
      data: result.results,
      total,
      limit,
      offset,
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

import { verifyToken } from '@clerk/backend';

async function checkAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.replace('Bearer ', '').trim();

  // 1. Try generic ADMIN_TOKEN fallback
  if (env.ADMIN_TOKEN && token === env.ADMIN_TOKEN) return true;

  // 2. Try verifying Clerk JWT if Secret Key is provided
  if (env.CLERK_SECRET_KEY) {
    try {
      const verified = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      if (verified && verified.sub) {
        // You could also check if verified.publicMetadata.role === 'admin' here
        return true; 
      }
    } catch (e) {
      console.error("Clerk Token Verification Failed:", e);
    }
  }
  return false;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const data = await request.json();
    const id = `entity-${Date.now()}`;
    await env.SURVEY_DB.prepare(
      `INSERT INTO entities (id, type, name, project_context, universal_summary, metadata, wikipedia_url, image_url, stance, tagline, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, data.type, data.name, data.project_context || '', data.universal_summary || '', data.metadata || '', data.wikipedia_url || '', data.image_url || '', data.stance || '', data.tagline || '', data.tags || '').run();
    return new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
export async function onRequestPut(context) {
  const { request, env } = context;
  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.id) throw new Error("Missing entity ID for update");

    // Build dynamic SET clause for provided fields
    const updates = [];
    const bindings = [];

    if (data.project_context !== undefined) { updates.push('project_context = ?'); bindings.push(data.project_context || ''); }
    if (data.universal_summary !== undefined) { updates.push('universal_summary = ?'); bindings.push(data.universal_summary || ''); }
    if (data.metadata !== undefined) { updates.push('metadata = ?'); bindings.push(data.metadata || ''); }
    if (data.wikipedia_url !== undefined) { updates.push('wikipedia_url = ?'); bindings.push(data.wikipedia_url || ''); }
    if (data.tags !== undefined) { updates.push('tags = ?'); bindings.push(data.tags || ''); }
    if (data.image_url !== undefined) { updates.push('image_url = ?'); bindings.push(data.image_url || ''); }
    if (data.stance !== undefined) { updates.push('stance = ?'); bindings.push(data.stance); }
    if (data.tagline !== undefined) { updates.push('tagline = ?'); bindings.push(data.tagline || ''); }
    if (data.featured !== undefined) { updates.push('featured = ?'); bindings.push(data.featured ? 1 : 0); }
    if (data.see_also_json !== undefined) { updates.push('see_also_json = ?'); bindings.push(data.see_also_json || ''); }
    if (data.url !== undefined) { updates.push('url = ?'); bindings.push(data.url || ''); }

    if (updates.length === 0) throw new Error("No fields to update");

    bindings.push(data.id);
    await env.SURVEY_DB.prepare(
      `UPDATE entities SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
