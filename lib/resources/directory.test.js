import { describe, it, expect } from 'vitest';
import { RESOURCES, RESOURCE_KINDS, resourcesForTags, groupByKind } from './directory.js';

describe('resource directory', () => {
  it('has unique ids, valid kinds and https-or-null urls', () => {
    const ids = new Set(RESOURCES.map(r => r.id));
    expect(ids.size).toBe(RESOURCES.length);
    for (const r of RESOURCES) {
      expect(RESOURCE_KINDS[r.kind], r.id).toBeTruthy();
      expect(r.url === null || r.url.startsWith('https://'), r.id).toBe(true);
      expect(r.tags.length, r.id).toBeGreaterThan(0);
      expect(r.blurb.length, r.id).toBeGreaterThan(10);
    }
  });
  it('ranks by number of matching tags, then directory order', () => {
    const list = resourcesForTags(['restoration', 'support'], { limit: 3 });
    expect(list.map(r => r.id)).toEqual(['bruvvers', 'norm', 'r-foreskin-restoration']);
  });
  it('filters by kind and returns nothing for no tags', () => {
    expect(resourcesForTags([], {})).toEqual([]);
    expect(resourcesForTags(['faith'], { kinds: ['faith'] }).every(r => r.kind === 'faith')).toBe(true);
  });
  it('groups in kind order and drops empty groups', () => {
    const groups = groupByKind();
    expect(groups[0].kind).toBe('org');
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(RESOURCES.length);
  });
});
