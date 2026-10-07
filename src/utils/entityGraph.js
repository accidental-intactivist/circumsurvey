/**
 * Entity co-mention graph.
 *
 * Two entities are connected when they are both named in the same document's
 * metadata (organizations, key_people, authors, or Gemini-extracted
 * authors/organizations). Every edge keeps the list of documents that justify
 * it, so the UI can always show the evidence behind a connection.
 */

export const TYPE_GROUPS = [
  { key: 'person', label: 'People', color: 'var(--c-gold)' },
  { key: 'organization', label: 'Organizations', color: 'var(--c-blue)' },
  { key: 'community', label: 'Communities & Groups', color: 'var(--chart-3)' },
  { key: 'other', label: 'Publications & Other', color: 'var(--c-purple)' },
];

export const GROUP_COLOR = Object.fromEntries(TYPE_GROUPS.map(g => [g.key, g.color]));

export const STANCES = [
  { key: 'champion', label: 'Champion', color: 'var(--c-green)' },
  { key: 'notable', label: 'Neutral / Notable', color: 'var(--c-grey)' },
  { key: 'critic', label: 'Critic', color: 'var(--c-red)' },
  { key: 'unknown', label: 'Unclassified', color: 'var(--c-ghost)' },
];

export const STANCE_COLOR = Object.fromEntries(STANCES.map(s => [s.key, s.color]));

/** Entities tried, in order, as the default Six Degrees center. */
export const PREFERRED_CENTERS = ['Tim Hammond'];

export function groupOf(type) {
  const t = (type || '').toLowerCase();
  if (t === 'person') return 'person';
  if (t === 'organization' || t === 'institution') return 'organization';
  if (['community', 'subreddit', 'social_group', 'forum', 'group', 'social_media'].includes(t)) return 'community';
  return 'other';
}

export function stanceOf(raw) {
  const s = (raw || '').toLowerCase().trim();
  if (s === 'champion' || s === 'critic' || s === 'notable') return s;
  if (s === 'neutral') return 'notable';
  return 'unknown';
}

const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Name keys an entity can be matched by: the full name, the name without a
 * trailing "(ACRONYM)", the acronym itself, the name without middle initials
 * for people ("Robert S. Van Howe" -> "robert van howe"), and explicit aliases.
 */
function nameVariants(name, group, aliases = []) {
  const out = new Set();
  const addOne = raw => {
    if (typeof raw !== 'string' || !raw.trim()) return;
    const base = norm(raw);
    out.add(base);
    const m = base.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (m) {
      out.add(m[1].trim());
      if (/^[a-z][a-z.&-]{1,11}$/.test(m[2].trim())) out.add(m[2].trim());
    }
    if (group === 'person') {
      for (const v of [...out]) {
        const tokens = v.split(' ');
        if (tokens.length >= 3) {
          const kept = tokens.filter((tok, i) => i === 0 || i === tokens.length - 1 || !/^[a-z]\.?$/.test(tok));
          out.add(kept.join(' '));
        }
      }
    }
  };
  addOne(name);
  aliases.forEach(addOne);
  return [...out];
}

function aliasesOf(e) {
  const list = [];
  if (Array.isArray(e.aliases)) list.push(...e.aliases);
  let meta = e.metadata;
  if (typeof meta === 'string' && meta.trim().startsWith('{')) {
    try { meta = JSON.parse(meta); } catch (err) { meta = null; }
  }
  if (meta && Array.isArray(meta.aliases)) list.push(...meta.aliases);
  return list;
}

export const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function collectTerms(meta) {
  const out = new Set();
  const add = v => {
    if (Array.isArray(v)) v.forEach(add);
    else if (typeof v === 'string' && v.trim()) out.add(norm(v));
  };
  add(meta.organizations);
  add(meta.key_people);
  add(meta.authors);
  // Note: meta.tags is deliberately excluded. Tags are collection-level labels
  // (e.g. a donor's name on every item in their archive) and would turn one
  // person into a hub "connected" to everything.
  const g = meta.gemini_extracted_metadata;
  if (g) {
    add(g.authors);
    add(g.organizations);
    add(g.key_people);
  }
  return out;
}

/**
 * @returns {{
 *   nodes: Map<string, object>, edges: Map<string, object>,
 *   adj: Map<string, Map<string, string>>, docs: Map<string, object>,
 *   aliasToId: Map<string, string>
 * }}
 */
export function buildEntityGraph(entities = [], docs = []) {
  const nodes = new Map();
  const byName = new Map();
  const aliasToId = new Map();

  // Merge entities that share any name variant. First occurrence keeps its id
  // (live API data loads before local mock data); the more descriptive name wins.
  for (const e of entities) {
    if (!e || !e.name || !e.id) continue;
    const group = groupOf(e.type);
    const variants = nameVariants(e.name, group, aliasesOf(e));
    const existingId = variants.map(v => byName.get(v)).find(Boolean);
    if (existingId) {
      aliasToId.set(e.id, existingId);
      const node = nodes.get(existingId);
      if (e.name.length > node.name.length) node.name = e.name;
      if (node.stance === 'unknown') node.stance = stanceOf(e.stance || e.role);
      if (!node.slug && e.slug) node.slug = e.slug;
      for (const v of variants) if (!byName.has(v)) byName.set(v, existingId);
      continue;
    }
    for (const v of variants) if (!byName.has(v)) byName.set(v, e.id);
    aliasToId.set(e.id, e.id);
    nodes.set(e.id, {
      id: e.id,
      name: e.name,
      type: e.type,
      group,
      stance: stanceOf(e.stance || e.role),
      slug: e.slug,
      tagline: e.tagline,
      docIds: [],
    });
  }

  const edges = new Map();
  const adj = new Map();
  const docIndex = new Map();

  for (const doc of docs) {
    if (!doc || !doc.id) continue;
    let meta = {};
    if (doc.metadata_json) {
      try {
        meta = typeof doc.metadata_json === 'string' ? JSON.parse(doc.metadata_json) : doc.metadata_json;
      } catch (e) { /* ignore malformed metadata */ }
    }

    const ids = [];
    for (const term of collectTerms(meta || {})) {
      let id = byName.get(term);
      if (!id) id = nameVariants(term, 'person').map(v => byName.get(v)).find(Boolean);
      if (id && !ids.includes(id)) ids.push(id);
    }
    if (ids.length === 0) continue;

    docIndex.set(doc.id, {
      id: doc.id,
      title: doc.title || 'Untitled document',
      type: doc.type,
      date: meta.date || meta.year || meta.publication_date || '',
      metadata_json: doc.metadata_json,
    });

    for (const id of ids) nodes.get(id).docIds.push(doc.id);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i];
        const b = ids[j];
        const key = edgeKey(a, b);
        let edge = edges.get(key);
        if (!edge) {
          edge = { key, a: a < b ? a : b, b: a < b ? b : a, docIds: [] };
          edges.set(key, edge);
          if (!adj.has(a)) adj.set(a, new Map());
          if (!adj.has(b)) adj.set(b, new Map());
          adj.get(a).set(b, key);
          adj.get(b).set(a, key);
        }
        edge.docIds.push(doc.id);
      }
    }
  }

  return { nodes, edges, adj, docs: docIndex, aliasToId, byName };
}

/** Resolve a display name / alias to a canonical node id. */
export function findByName(graph, name) {
  if (!graph || !name) return null;
  return nameVariants(name, 'person').map(v => graph.byName.get(v)).find(Boolean) || null;
}

export const degreeOf = (graph, id) => graph.adj.get(id)?.size || 0;

/** True when an edge joins a champion and a critic: the two sides in the same document. */
export function isCrossStance(graph, a, b) {
  const s1 = graph.nodes.get(a)?.stance;
  const s2 = graph.nodes.get(b)?.stance;
  return (s1 === 'champion' && s2 === 'critic') || (s1 === 'critic' && s2 === 'champion');
}

/** Count of an entity's connections by stance: { champion, notable, critic, unknown }. */
export function stanceBreakdown(graph, id) {
  const out = { champion: 0, notable: 0, critic: 0, unknown: 0 };
  for (const nb of graph.adj.get(id)?.keys() || []) out[graph.nodes.get(nb).stance] += 1;
  return out;
}

export const CROSS_STANCE_COLOR = 'var(--c-orange)';

export function nodeColor(node, colorBy) {
  return colorBy === 'stance' ? STANCE_COLOR[node.stance] : GROUP_COLOR[node.group];
}

/** Line color: by type, or (stance mode) same-camp color / orange for champion↔critic / muted for mixed-neutral. */
export function edgeColor(graph, a, b, colorBy) {
  const na = graph.nodes.get(a);
  const nb = graph.nodes.get(b);
  if (colorBy !== 'stance') return GROUP_COLOR[na.group];
  if (isCrossStance(graph, a, b)) return CROSS_STANCE_COLOR;
  if (na.stance === nb.stance) return STANCE_COLOR[na.stance];
  return 'var(--c-muted)';
}

export const edgeWeight = (graph, a, b) => {
  const key = graph.adj.get(a)?.get(b);
  return key ? graph.edges.get(key).docIds.length : 0;
};

/**
 * Breadth-first "degrees of separation" from a center entity. Each node's
 * parent is its strongest-tied neighbor in the previous layer, so traced
 * paths favour the best-documented route.
 */
export function bfsFrom(graph, centerId) {
  const depth = new Map([[centerId, 0]]);
  const parent = new Map();
  const layers = [[centerId]];

  while (layers[layers.length - 1].length) {
    const current = layers[layers.length - 1];
    const d = layers.length;
    const next = [];
    for (const id of current) {
      const nbrs = graph.adj.get(id);
      if (!nbrs) continue;
      for (const nb of nbrs.keys()) {
        if (!depth.has(nb)) {
          depth.set(nb, d);
          next.push(nb);
        }
      }
    }
    for (const id of next) {
      let best = null;
      let bestW = -1;
      for (const [nb, key] of graph.adj.get(id)) {
        if (depth.get(nb) === d - 1) {
          const w = graph.edges.get(key).docIds.length;
          if (w > bestW) { bestW = w; best = nb; }
        }
      }
      parent.set(id, best);
    }
    layers.push(next);
  }
  layers.pop();

  return { centerId, depth, parent, layers };
}

/** Path from the BFS center to `targetId` (inclusive), or null if unreachable. */
export function pathTo(bfs, targetId) {
  if (!bfs || !bfs.depth.has(targetId)) return null;
  const path = [targetId];
  let cur = targetId;
  while (cur !== bfs.centerId) {
    cur = bfs.parent.get(cur);
    if (!cur) return null;
    path.unshift(cur);
  }
  return path;
}
