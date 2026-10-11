// GET /api/stats/observations?metric=&level=&parent=&geo=
// Public read API for the Global Circumcision Atlas (and later Glenda + guide embeds).
// Returns approved observations + their sources. Always merges the curated seed so the
// verified figures are present even before the collector has run.
import { SEED_OBSERVATIONS, SEED_SOURCES } from '../../../lib/atlas/seed.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=3600',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const metric = url.searchParams.get('metric');
  const level = url.searchParams.get('level');
  const parent = url.searchParams.get('parent');
  const geo = url.searchParams.get('geo');

  const match = o =>
    (!metric || o.metric === metric) && (!level || o.level === level) &&
    (!parent || o.parent === parent) && (!geo || o.geo === geo);

  let rows = [];
  let sources = [];
  let ledger = 'seed-only';
  try {
    if (env.SURVEY_DB) {
      const where = ["status = 'approved'"];
      const binds = [];
      if (metric) { where.push('metric = ?'); binds.push(metric); }
      if (level) { where.push('level = ?'); binds.push(level); }
      if (parent) { where.push('parent = ?'); binds.push(parent); }
      if (geo) { where.push('geo = ?'); binds.push(geo); }
      const res = await env.SURVEY_DB.prepare(
        `SELECT id, geo, geo_name, level, parent, depth, period, metric, value, ci_low, ci_high, n,
                population, method, source_id, tier, extracted_by, status, flags
         FROM stat_observations WHERE ${where.join(' AND ')} ORDER BY period`
      ).bind(...binds).all();
      rows = res.results || [];
      const srcIds = [...new Set(rows.map(r => r.source_id))];
      if (srcIds.length) {
        // D1 caps bound params; chunk the IN() lookup.
        for (let i = 0; i < srcIds.length; i += 90) {
          const chunk = srcIds.slice(i, i + 90);
          const s = await env.SURVEY_DB.prepare(
            `SELECT id, citation, url, kind, access, bias_note, weight FROM stat_sources WHERE id IN (${chunk.map(() => '?').join(',')})`
          ).bind(...chunk).all();
          sources.push(...(s.results || []));
        }
      }
      ledger = rows.length ? 'd1' : 'empty';
    }
  } catch (e) {
    // Table not migrated yet: fall through to seed-only (client will also fetch DHS directly).
    ledger = `unavailable: ${e.message}`;
  }

  const seed = SEED_OBSERVATIONS.filter(match);
  const byId = new Map(rows.map(r => [r.id, r]));
  for (const o of seed) byId.set(o.id, o);
  const srcById = new Map(sources.map(s => [s.id, s]));
  for (const s of SEED_SOURCES) srcById.set(s.id, s);

  return new Response(JSON.stringify({
    ledger,
    observations: [...byId.values()],
    sources: [...srcById.values()],
  }), { headers: JSON_HEADERS });
}
