// Atlas query helpers + the rule-based Validator (pure functions, unit-tested).
import { METRICS } from './metrics.js';

/** Merge observation lists; later lists win on id collisions (curated seed should come last). */
export function mergeObservations(...lists) {
  const map = new Map();
  for (const list of lists) for (const o of list || []) if (o?.id) map.set(o.id, o);
  return [...map.values()];
}

export function mergeSources(...lists) {
  const map = new Map();
  for (const list of lists) for (const s of list || []) if (s?.id) map.set(s.id, s);
  return map;
}

const approved = o => !o.status || o.status === 'approved';

/** Latest observation per geo for a metric at or before maxYear. */
export function latestByGeo(observations, { metric, level = 'country', parent, maxYear = Infinity } = {}) {
  const out = new Map();
  for (const o of observations) {
    if (!approved(o) || o.metric !== metric || o.level !== level) continue;
    if (parent !== undefined && o.parent !== parent) continue;
    if (o.period > maxYear) continue;
    const prev = out.get(o.geo);
    if (!prev || o.period > prev.period || (o.period === prev.period && (o.n || 0) > (prev.n || 0))) out.set(o.geo, o);
  }
  return out;
}

/** Time series (ascending by period) for one geo + metric. */
export function seriesFor(observations, geo, metric) {
  return observations
    .filter(o => approved(o) && o.geo === geo && o.metric === metric)
    .sort((a, b) => a.period - b.period);
}

export function yearsAvailable(observations, metric) {
  const ys = new Set(observations.filter(o => o.metric === metric && approved(o)).map(o => o.period));
  return [...ys].sort((a, b) => a - b);
}

/** Metrics with at least one observation for a geo (used to badge the country panel). */
export function metricsForGeo(observations, geo) {
  return [...new Set(observations.filter(o => o.geo === geo && approved(o)).map(o => o.metric))];
}

/** Regions of a country for the latest survey that has regional data (avoids mixing survey boundaries). */
export function latestRegionalSet(observations, parent, metric) {
  const rows = observations.filter(o => approved(o) && o.parent === parent && o.metric === metric && o.level === 'region');
  if (!rows.length) return { period: null, rows: [] };
  const period = Math.max(...rows.map(r => r.period));
  const latest = rows.filter(r => r.period === period && r.depth === Math.min(...rows.filter(x => x.period === period).map(x => x.depth || 1)));
  return { period, rows: latest.sort((a, b) => b.value - a.value) };
}

export function summarizeCoverage(observations, metric) {
  const latest = latestByGeo(observations, { metric });
  const years = [...latest.values()].map(o => o.period);
  return {
    countries: latest.size,
    newest: years.length ? Math.max(...years) : null,
    oldest: years.length ? Math.min(...years) : null,
  };
}

// ---------------------------------------------------------------------------
// Validator — rule-based checks every observation passes before publication.
// Returns { ok, errors[], flags[] }: errors block, flags send to curator review.
// ---------------------------------------------------------------------------
export function validateObservation(o, { history = [], nowYear = new Date().getFullYear() } = {}) {
  const errors = [];
  const flags = [];
  if (!o || typeof o !== 'object') return { ok: false, errors: ['not an object'], flags };
  if (!o.id) errors.push('missing id');
  if (!o.geo) errors.push('missing geo');
  if (!METRICS[o.metric]) errors.push(`unknown metric "${o.metric}"`);
  if (!o.source_id) errors.push('missing source_id');
  if (typeof o.value !== 'number' || Number.isNaN(o.value)) errors.push('value is not a number');
  else if (o.value < 0 || o.value > 100) errors.push('value outside 0–100%');
  if (!Number.isInteger(o.period) || o.period < 1900 || o.period > nowYear) errors.push('implausible period');
  if (o.ci_low != null && o.ci_high != null && !(o.ci_low <= o.value && o.value <= o.ci_high)) errors.push('value outside its own CI');
  if (o.level === 'region' && !o.parent) errors.push('region without parent');
  if (!o.population) flags.push('population definition missing');
  if (o.n != null && o.n < 100) flags.push(`small denominator (n=${o.n})`);

  // Outlier vs. same geo+metric history: a swing of >20 points within 6 years is suspicious.
  const comparable = history.filter(h => h.geo === o.geo && h.metric === o.metric && h.id !== o.id);
  for (const h of comparable) {
    if (Math.abs(h.period - o.period) <= 6 && Math.abs(h.value - o.value) > 20) {
      flags.push(`jump of ${Math.abs(h.value - o.value).toFixed(1)} pts vs ${h.period}`);
      break;
    }
  }
  return { ok: errors.length === 0, errors, flags };
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------
export function formatValue(v) {
  if (v == null) return '—';
  return `${Number(v).toFixed(1).replace(/\.0$/, '')}%`;
}

/** Markdown snippet for "Add to Report", including the source and coverage gaps. */
export function observationToMarkdown(o, source) {
  const m = METRICS[o.metric];
  const lines = [
    `### ${o.geo_name}: ${m?.label || o.metric}`,
    `**${formatValue(o.value)}** (${o.period})${o.n ? ` · n = ${o.n.toLocaleString('en-US')}` : ''} · 📄 Documented`,
    `*Population:* ${o.population || m?.population || 'not stated'}`,
  ];
  if (source) lines.push(`*Source:* ${source.citation}${source.url ? ` (${source.url})` : ''}`);
  if (source?.bias_note) lines.push(`> Note: ${source.bias_note}`);
  if (m?.coverageGaps?.length && o.metric === 'newborn_inpatient') {
    lines.push('', '**Not counted in this figure:**', ...m.coverageGaps.map(g => `- ${g}`));
  }
  return lines.join('\n');
}
