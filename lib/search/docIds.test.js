import { describe, it, expect } from 'vitest';
import { normalizeDocId, collapseMatches } from './docIds.js';

describe('normalizeDocId', () => {
  it('returns short news IDs unchanged', () => {
    expect(normalizeDocId('a1b2c3d4')).toBe('a1b2c3d4');
  });

  it('strips chunk suffixes', () => {
    expect(normalizeDocId('a1b2c3d4-chunk-7')).toBe('a1b2c3d4');
  });

  it('strips legacy timestamp suffixes', () => {
    expect(normalizeDocId('a1b2c3d4-1712345678')).toBe('a1b2c3d4');
  });

  it('keeps hyphenated umass- and digest- IDs intact', () => {
    expect(normalizeDocId('umass-mums00123')).toBe('umass-mums00123');
    expect(normalizeDocId('umass-mums00123-chunk-2')).toBe('umass-mums00123');
    expect(normalizeDocId('digest-2026-10-07')).toBe('digest-2026-10-07');
  });

  it('keeps long hash IDs without hyphens intact', () => {
    const hash = '13c607aac464b477b3658df1c26cb735e0754589d1578cb0dc09c2ca691815be';
    expect(normalizeDocId(hash)).toBe(hash);
    expect(normalizeDocId(`${hash}-chunk-0`)).toBe(hash);
  });

  it('handles empty / nullish input', () => {
    expect(normalizeDocId()).toBe('');
    expect(normalizeDocId(null)).toBe('');
  });
});

describe('collapseMatches', () => {
  it('keeps the best score per document and sorts descending', () => {
    const out = collapseMatches([
      { id: 'aaaa1111-chunk-0', score: 0.61 },
      { id: 'bbbb2222', score: 0.72 },
      { id: 'aaaa1111-chunk-3', score: 0.81 },
    ]);
    expect(out).toEqual([
      { doc_id: 'aaaa1111', score: 0.81 },
      { doc_id: 'bbbb2222', score: 0.72 },
    ]);
  });

  it('prefers metadata.doc_id over the vector id', () => {
    const out = collapseMatches([{ id: 'whatever-chunk-1', score: 0.7, metadata: { doc_id: 'cccc3333' } }]);
    expect(out).toEqual([{ doc_id: 'cccc3333', score: 0.7 }]);
  });

  it('tolerates missing input and junk entries', () => {
    expect(collapseMatches()).toEqual([]);
    expect(collapseMatches(null)).toEqual([]);
    expect(collapseMatches([null, { id: '' , score: 1 }])).toEqual([]);
  });
});
