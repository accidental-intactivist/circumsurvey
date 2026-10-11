/**
 * Shared helpers for turning raw Vectorize matches into archive document IDs.
 *
 * Vectors are stored either as `<docId>` (news, digests) or `<docId>-chunk-<n>`
 * (chunked archive documents). Some legacy vectors also carry a timestamp
 * suffix (`<docId>-<ts>`), which is stripped unless the ID uses one of the
 * known hyphenated prefixes.
 */

const HYPHENATED_PREFIXES = ['umass-', 'digest-'];

export function normalizeDocId(raw = '') {
  let id = String(raw ?? '').split('-chunk-')[0];
  const keepsHyphens = HYPHENATED_PREFIXES.some(p => id.startsWith(p));
  if (id.includes('-') && id.length > 8 && !keepsHyphens) id = id.split('-')[0];
  return id;
}

/**
 * Collapse chunk-level matches into one entry per document, keeping the best
 * score, and return them sorted by score (highest first).
 */
export function collapseMatches(matches = []) {
  const best = new Map();
  for (const m of matches || []) {
    if (!m) continue;
    const doc_id = normalizeDocId(m.metadata?.doc_id || m.id);
    if (!doc_id) continue;
    const score = typeof m.score === 'number' ? m.score : 0;
    const prev = best.get(doc_id);
    if (!prev || score > prev.score) best.set(doc_id, { doc_id, score });
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}
