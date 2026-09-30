export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.SURVEY_DB) return new Response("Missing DB", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS item_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  const url = new URL(request.url);
  const doc_id = url.searchParams.get('doc_id');
  const all = url.searchParams.get('all') === 'true'; // For admin to see all comments

  let results;
  if (all) {
    // Admin view
    const query = await env.SURVEY_DB.prepare("SELECT * FROM item_comments ORDER BY created_at DESC").all();
    results = query.results;
  } else if (doc_id) {
    // Public view for a specific document
    const query = await env.SURVEY_DB.prepare("SELECT * FROM item_comments WHERE doc_id = ? AND status = 'approved' ORDER BY created_at ASC").bind(doc_id).all();
    results = query.results;
  } else {
    return new Response("Missing doc_id or all flag", { status: 400 });
  }

  return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.SURVEY_DB) return new Response("Missing DB", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS item_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  const body = await request.json();
  const { doc_id, user_id, user_name, comment } = body;

  if (!doc_id || !user_id || !comment) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Length limit
  if (comment.length > 2000) {
    return new Response(JSON.stringify({ error: "Comment exceeds 2000 characters limit." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Rate limiting (max 5 comments per user per hour)
  const recent = await env.SURVEY_DB.prepare(
    "SELECT COUNT(*) as cnt FROM item_comments WHERE user_id = ? AND created_at > datetime('now', '-1 hour')"
  ).bind(user_id).first();

  if (recent && recent.cnt >= 5) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Maximum 5 comments per hour allowed." }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }

  await env.SURVEY_DB.prepare(
    "INSERT INTO item_comments (doc_id, user_id, user_name, comment, status) VALUES (?, ?, ?, ?, 'pending')"
  ).bind(doc_id, user_id, user_name || 'Anonymous', comment).run();

  return new Response(JSON.stringify({ success: true, message: "Comment submitted for moderation." }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  if (!env.SURVEY_DB) return new Response("Missing DB", { status: 500 });

  const body = await request.json();
  const { id, status } = body; // status can be 'approved' or 'rejected'

  if (!id || !status) return new Response("Missing id or status", { status: 400 });

  await env.SURVEY_DB.prepare(
    "UPDATE item_comments SET status = ? WHERE id = ?"
  ).bind(status, id).run();

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
