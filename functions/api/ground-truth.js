export async function onRequestGet(context) {
  const { env } = context;
  if (!env.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();

  const { results } = await env.SURVEY_DB.prepare('SELECT * FROM ground_truth ORDER BY id DESC').all();
  return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();

  const body = await request.json();
  if (body.action === 'delete') {
    await env.SURVEY_DB.prepare('DELETE FROM ground_truth WHERE id = ?').bind(body.id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Otherwise insert new
  const { keywords, statement } = body;
  await env.SURVEY_DB.prepare('INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)').bind(keywords, statement).run();
  
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
