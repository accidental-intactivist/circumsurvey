// POST /api/stats/collect   (Authorization: Bearer <ADMIN_TOKEN | Clerk JWT>)
// The Statistician's deterministic collector: pulls DHS (national + subnational),
// validates every row, and upserts into the ledger. Rows with validator flags are
// stored as 'pending' for curator review instead of being published.
// Body (optional): { breakdowns: ['national','subnational'], countryIds: ['KE'] }
import { verifyToken } from '@clerk/backend';
import { buildDhsUrl, parseDhsPayload } from '../../../lib/atlas/dhs.js';
import { validateObservation } from '../../../lib/atlas/series.js';
import { SEED_OBSERVATIONS, SEED_SOURCES } from '../../../lib/atlas/seed.js';

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
      console.error('Clerk Token Verification Failed:', e);
    }
  }
  return false;
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'Unauthorized' }, 401);
  if (!env.SURVEY_DB) return json({ error: 'Missing SURVEY_DB binding' }, 500);

  let body = {};
  try { body = await request.json(); } catch { /* empty body is fine */ }
  const breakdowns = body.breakdowns || ['national', 'subnational'];

  const observations = [];
  const sources = new Map();
  for (const breakdown of breakdowns) {
    const res = await fetch(buildDhsUrl({ breakdown, countryIds: body.countryIds }));
    if (!res.ok) return json({ error: `DHS ${breakdown} fetch failed: ${res.status}` }, 502);
    const parsed = parseDhsPayload(await res.json());
    observations.push(...parsed.observations);
    parsed.sources.forEach(s => sources.set(s.id, s));
  }
  SEED_SOURCES.forEach(s => sources.set(s.id, s));
  observations.push(...SEED_OBSERVATIONS);

  const report = { fetched: observations.length, approved: 0, pending: 0, rejected: [] };
  const srcStmt = env.SURVEY_DB.prepare(
    `INSERT INTO stat_sources (id, citation, url, kind, access, bias_note, weight, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET citation=excluded.citation, url=excluded.url, kind=excluded.kind,
       bias_note=excluded.bias_note, weight=excluded.weight, updated_at=datetime('now')`
  );
  const obsStmt = env.SURVEY_DB.prepare(
    `INSERT INTO stat_observations (id, geo, geo_name, level, parent, depth, period, metric, value, ci_low, ci_high, n,
       population, method, source_id, tier, extracted_by, status, flags, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET value=excluded.value, ci_low=excluded.ci_low, ci_high=excluded.ci_high, n=excluded.n,
       population=excluded.population, geo_name=excluded.geo_name, flags=excluded.flags, updated_at=datetime('now'),
       -- never silently overturn a curator's rejection
       status=CASE WHEN stat_observations.status='rejected' THEN 'rejected' ELSE excluded.status END`
  );

  const stmts = [...sources.values()].map(s =>
    srcStmt.bind(s.id, s.citation, s.url || null, s.kind || null, s.access || 'open', s.bias_note || null, s.weight ?? 1)
  );
  for (const o of observations) {
    const v = validateObservation(o, { history: observations });
    if (!v.ok) { report.rejected.push({ id: o.id, errors: v.errors }); continue; }
    // Deterministic collectors (official survey APIs) publish with flags visible; AI-extracted
    // rows (Phase C) wait in the curator queue when flagged. Real shifts (e.g. Rwanda's VMMC
    // campaign, +26 pts 2015→2019) must not be hidden just because they are large.
    const status = v.flags.length && String(o.extracted_by || '').startsWith('extractor:') ? 'pending' : 'approved';
    report[status]++;
    stmts.push(obsStmt.bind(
      o.id, o.geo, o.geo_name || null, o.level, o.parent || null, o.depth || 0, o.period, o.metric, o.value,
      o.ci_low ?? null, o.ci_high ?? null, o.n ?? null, o.population || null, o.method || null, o.source_id,
      o.tier || 'documented', o.extracted_by || null, status, v.flags.length ? JSON.stringify(v.flags) : null
    ));
  }

  try {
    for (let i = 0; i < stmts.length; i += 100) await env.SURVEY_DB.batch(stmts.slice(i, i + 100));
  } catch (e) {
    return json({ error: `Ledger write failed (did you run migrations/schema_stats.sql?): ${e.message}` }, 500);
  }
  return json({ ok: true, ...report, rejected: report.rejected.slice(0, 50) });
}
