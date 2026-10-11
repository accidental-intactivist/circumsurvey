// Client-side helpers for concept ("semantic") search over vector matches.
// Matches come from POST /api/semantic-search as [{ doc_id, score }].

export const SEMANTIC_MIN_CHARS = 8;
export const SEMANTIC_MIN_SCORE = 0.5;

export const EXAMPLE_CONCEPT_QUERIES = [
  'media minimizing bodily integrity',
  'bias against male infant pain',
  'doctors reconsidering routine newborn surgery',
  'parents regretting the decision',
  'legal challenges on behalf of children',
];

/**
 * Concept search only makes sense for phrases. Single words are better served
 * by the instant keyword filter.
 */
export function shouldRunSemanticSearch(query) {
  const q = String(query ?? '').trim();
  if (q.length < SEMANTIC_MIN_CHARS) return false;
  return q.split(/\s+/).filter(Boolean).length >= 2;
}

/**
 * Join items with semantic matches, drop weak/absent matches, and sort by score.
 * Each returned item is a shallow copy with a `_score` field.
 */
export function rankBySemanticMatches(items = [], matches = [], { minScore = SEMANTIC_MIN_SCORE, idKey = 'id' } = {}) {
  const scores = new Map();
  for (const m of matches || []) {
    if (!m || m.doc_id == null || typeof m.score !== 'number') continue;
    const prev = scores.get(m.doc_id);
    if (prev === undefined || m.score > prev) scores.set(m.doc_id, m.score);
  }
  return (items || [])
    .filter(item => item && scores.has(item[idKey]) && scores.get(item[idKey]) >= minScore)
    .map(item => ({ ...item, _score: scores.get(item[idKey]) }))
    .sort((a, b) => b._score - a._score);
}

/**
 * Human-friendly strength label for a cosine similarity score (bge-small range).
 */
export function matchStrength(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  if (score >= 0.75) return { level: 3, label: 'Strong match', color: '#5cc8a1' };
  if (score >= 0.65) return { level: 2, label: 'Good match', color: '#5aa9e6' };
  return { level: 1, label: 'Related', color: '#9aa0ad' };
}
