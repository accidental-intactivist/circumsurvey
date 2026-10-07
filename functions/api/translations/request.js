export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { document_id, target_languages } = await request.json();

    // Verify auth - checking if userId exists via Clerk (simplified check for now)
    // Normally we'd use Clerk JWT verification, but for simplicity we rely on the client passing the clerk ID
    // or we assume it's protected by middleware.
    // Let's assume the client sends userId in headers or body.
    const url = new URL(request.url);
    const userId = request.headers.get("x-user-id") || "anonymous";

    if (!document_id || !target_languages || !Array.isArray(target_languages)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const stmt = env.SURVEY_DB.prepare(
      `INSERT INTO translation_requests (id, document_id, target_language, requested_by) VALUES (?, ?, ?, ?)`
    );

    const batch = [];
    for (const lang of target_languages) {
      const id = crypto.randomUUID();
      batch.push(stmt.bind(id, document_id, lang, userId));
    }

    await env.SURVEY_DB.batch(batch);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
