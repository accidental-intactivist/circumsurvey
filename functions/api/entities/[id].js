import { verifyToken } from '@clerk/backend';

async function checkAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.replace('Bearer ', '').trim();
  if (env.ADMIN_TOKEN && token === env.ADMIN_TOKEN) return true;
  if (env.CLERK_SECRET_KEY) {
    try {
      const verified = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      if (verified && verified.sub) return true; 
    } catch (e) {
      console.error("Clerk Token Verification Failed:", e);
    }
  }
  return false;
}

export async function onRequestDelete(context) {
  const { request, params, env } = context;
  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const id = params.id;
  try {
    await env.SURVEY_DB.prepare('DELETE FROM entities WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
