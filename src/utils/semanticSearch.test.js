import { describe, it, expect } from 'vitest';
import { shouldRunSemanticSearch, rankBySemanticMatches, matchStrength, SEMANTIC_MIN_SCORE } from './semanticSearch';

describe('shouldRunSemanticSearch', () => {
  it('rejects empty, single-word and very short queries', () => {
    expect(shouldRunSemanticSearch('')).toBe(false);
    expect(shouldRunSemanticSearch(null)).toBe(false);
    expect(shouldRunSemanticSearch('circumcision')).toBe(false);
    expect(shouldRunSemanticSearch('a b')).toBe(false);
  });

  it('accepts multi-word phrases', () => {
    expect(shouldRunSemanticSearch('infant pain')).toBe(true);
    expect(shouldRunSemanticSearch('  media minimizing bodily integrity  ')).toBe(true);
  });

  it('splits on any whitespace (regression: double-escaped regex)', () => {
    expect(shouldRunSemanticSearch('infant\tpain')).toBe(true);
    expect(shouldRunSemanticSearch('infant\npain')).toBe(true);
  });
});

describe('rankBySemanticMatches', () => {
  const items = [
    { id: 'a', title: 'A' },
    { id: 'b', title: 'B' },
    { id: 'c', title: 'C' },
    { id: 'd', title: 'D' },
  ];

  it('orders by score, attaches _score, and drops unmatched items', () => {
    const out = rankBySemanticMatches(items, [
      { doc_id: 'c', score: 0.9 },
      { doc_id: 'a', score: 0.7 },
    ]);
    expect(out.map(i => i.id)).toEqual(['c', 'a']);
    expect(out[0]._score).toBe(0.9);
  });

  it('drops matches below the minimum score', () => {
    const out = rankBySemanticMatches(items, [
      { doc_id: 'a', score: SEMANTIC_MIN_SCORE - 0.01 },
      { doc_id: 'b', score: SEMANTIC_MIN_SCORE },
    ]);
    expect(out.map(i => i.id)).toEqual(['b']);
  });

  it('uses the best score when a doc appears more than once', () => {
    const out = rankBySemanticMatches(items, [
      { doc_id: 'b', score: 0.55 },
      { doc_id: 'b', score: 0.8 },
    ]);
    expect(out[0]._score).toBe(0.8);
  });

  it('does not mutate the input items', () => {
    rankBySemanticMatches(items, [{ doc_id: 'a', score: 0.9 }]);
    expect(items[0]._score).toBeUndefined();
  });

  it('ignores malformed matches and handles empty input', () => {
    expect(rankBySemanticMatches(items, [null, { doc_id: 'a' }, { score: 0.9 }])).toEqual([]);
    expect(rankBySemanticMatches()).toEqual([]);
  });

  it('supports a custom id key', () => {
    const out = rankBySemanticMatches([{ doc_id: 'x' }], [{ doc_id: 'x', score: 0.6 }], { idKey: 'doc_id' });
    expect(out).toHaveLength(1);
  });
});

describe('matchStrength', () => {
  it('buckets scores into three levels', () => {
    expect(matchStrength(0.8).level).toBe(3);
    expect(matchStrength(0.7).level).toBe(2);
    expect(matchStrength(0.55).level).toBe(1);
  });

  it('returns null for non-numeric input', () => {
    expect(matchStrength(undefined)).toBeNull();
    expect(matchStrength(NaN)).toBeNull();
  });
});
