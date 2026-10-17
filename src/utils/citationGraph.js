/**
 * Citation Web.
 *
 * Builds a directed graph of "document A cites work B" from the free-text
 * `metadata.citations` arrays that Gemini extracts for archive documents.
 *
 * Citations arrive in mixed styles (APA, Vancouver, informal "Bratu et al., 2005"),
 * so each one is reduced to a coarse identity key of `<first-author>|<year>`.
 * That key lets "Anand KJS, Hickey PR. ... 1987" and "Anand, K. J. S., & Hickey,
 * P. R. (1987)" collapse into the same cited work. When a cited work is itself
 * in the archive (matched by title, or by a unique author+year), the edge
 * points at the archive document so the web links our own holdings together.
 */

export const NODE_KINDS = {
  archive: { label: 'In the archive', color: '#f2c14e' },
  external: { label: 'Cited work (not yet archived)', color: '#8f7ee7' },
};

const YEAR_RE = /\b(1[89]\d{2}|20[0-2]\d)\b/;
const STOPWORDS = new Set(['of', 'the', 'and', 'for', 'on', 'in', 'a', 'an', 'to', 'de', 'la']);
const CREDENTIALS = new Set(['md', 'phd', 'rn', 'mph', 'facs', 'faap', 'jd', 'dds', 'msw', 'ma', 'ms', 'bs', 'ba', 'jr', 'sr', 'ii', 'iii', 'esq']);
const ORG_WORDS = new Set([
  'academy', 'association', 'society', 'organization', 'organisation', 'council', 'college', 'journal',
  'institute', 'university', 'committee', 'task', 'force', 'foundation', 'center', 'centre', 'department',
  'board', 'agency', 'ministry', 'federation', 'network', 'news', 'times', 'press', 'nocirc', 'noharmm',
]);

const stripDiacritics = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const cleanToken = t => stripDiacritics(t).toLowerCase().replace(/[^a-z]/g, '');
const isInitials = t => /^([A-Z]\.?){1,3}$/.test(t) || /^([A-Z]\.){1,4}$/.test(t);
const capitalize = w => (w ? w[0].toUpperCase() + w.slice(1) : w);

export function extractYear(value) {
  const m = String(value ?? '').match(YEAR_RE);
  return m ? Number(m[1]) : null;
}

export function normalizeTitle(value) {
  return stripDiacritics(String(value ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Key words for an organisation-style author: first three significant words. */
function orgKey(tokens) {
  return tokens.map(cleanToken).filter(t => t && !STOPWORDS.has(t)).slice(0, 3).join(' ');
}

/**
 * First-author key for a citation string written in bibliography order
 * ("Surname I.", "Surname, I.", "Org Name. Title...").
 */
export function citationAuthorKey(citation) {
  let s = String(citation ?? '').trim()
    .replace(/^[^A-Za-z\u00C0-\u024F]+/, '')
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .replace(/^([A-Z]\.\s*)+(?=[A-Z][a-z])/, ''); // "R. H. Hunter" -> "Hunter"
  const cut = s.search(/,|\(|\.\s|;|:|\s&\s|\sand\s|\set al\b/i);
  if (cut > 0) s = s.slice(0, cut);
  const raw = s.split(/\s+/).filter(Boolean);
  if (!raw.length) return '';
  const tokens = [raw[0], ...raw.slice(1).filter(t => !isInitials(t))];
  const isOrg = tokens.length > 1 && tokens.some(t => ORG_WORDS.has(cleanToken(t)));
  if (isOrg) return orgKey(tokens);
  const significant = tokens.map(cleanToken).filter(t => t && !STOPWORDS.has(t) && !CREDENTIALS.has(t));
  return significant.slice(0, 3).join(' ');
}

/**
 * Author key for an archive document's own `author` field, which is usually in
 * natural order ("George C. Denniston, MD"). People reduce to their surname so
 * they line up with bibliography-style citations; organisations keep key words.
 */
export function documentAuthorKey(author) {
  let s = String(author ?? '').trim().replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '');
  const cut = s.search(/,|\(|;|\s&\s|\sand\s/i);
  if (cut > 0) s = s.slice(0, cut);
  const raw = s.split(/\s+/).filter(Boolean);
  if (!raw.length) return '';
  if (raw.some(t => ORG_WORDS.has(cleanToken(t)))) return orgKey(raw);
  const people = raw.filter(t => !isInitials(t)).map(cleanToken).filter(t => t && !CREDENTIALS.has(t));
  if (!people.length) return '';
  return people[people.length - 1];
}

/** A title needs at least two real words and must not start with punctuation (rules out "e756–e785"). */
const plausibleTitle = t => {
  const s = String(t || '').trim();
  return /^[A-Za-z0-9'"‘“\u00C0-\u024F]/.test(s) && (s.match(/[A-Za-z\u00C0-\u024F]{3,}/g) || []).length >= 2;
};

/** Best-effort title from an APA or Vancouver citation. */
export function citationTitle(citation) {
  const s = String(citation ?? '').trim();
  const apa = s.match(/\(\s*(?:1[89]|20)\d{2}[a-z]?\s*\)\.?\s*(.+?)(?:[.?!](?=\s|$)|$)/);
  if (apa && apa[1].trim().length >= 8 && plausibleTitle(apa[1])) return apa[1].trim();
  const parts = s.split(/\.\s+/);
  if (parts.length >= 3) {
    const candidate = parts.slice(1, -1).find(p => p.trim().length >= 12 && !YEAR_RE.test(p.slice(0, 6)) && plausibleTitle(p));
    if (candidate) return candidate.trim();
  }
  return null;
}

export function parseCitation(citation) {
  const raw = String(citation ?? '').trim();
  if (raw.length < 3) return null;
  const authorKey = citationAuthorKey(raw);
  const year = extractYear(raw);
  const title = citationTitle(raw);
  let key;
  if (authorKey) key = `${authorKey}|${year ?? ''}`;
  else {
    const t = normalizeTitle(raw).slice(0, 60);
    if (!t) return null;
    key = `raw|${t}`;
  }
  return { raw, authorKey, year, title, key };
}

export function citationLabel({ authorKey, year, raw }) {
  const who = authorKey ? authorKey.split(' ').map(capitalize).join(' ') : String(raw || '').slice(0, 40);
  return year ? `${who} (${year})` : who;
}

function safeMeta(doc) {
  if (doc?._meta) return doc._meta;
  try { return doc?.metadata_json ? JSON.parse(doc.metadata_json) || {} : {}; } catch { return {}; }
}

function docInfo(doc) {
  const meta = safeMeta(doc);
  const g = meta.gemini_extracted_metadata || {};
  const title = meta.academic_title || g.title || doc.title || 'Untitled document';
  const year = extractYear(meta.date) ?? extractYear(g.publication_date) ?? extractYear(doc.published_at);
  const author = meta.author || (Array.isArray(g.authors) ? g.authors[0] : '') || '';
  const citations = Array.isArray(meta.citations) ? meta.citations.filter(c => typeof c === 'string') : [];
  return { doc, meta, title, year, author, citations, category: doc.category || meta.category || null };
}

/**
 * @param {Array} docs - CMS documents (with metadata_json or pre-parsed _meta)
 * @returns {{ nodes: Map, links: Array, stats: Object }}
 */
export function buildCitationGraph(docs = []) {
  const all = (docs || []).filter(d => d && d.id && d.status !== 'rejected').map(docInfo);

  // Collapse duplicate copies (PDF + extracted text, re-ingests) so citations aren't double counted.
  const twins = new Map();
  const infos = [];
  for (const info of all) {
    const t = normalizeTitle(info.title);
    if (t.length < 20) { infos.push(info); continue; }
    const k = `${t}|${info.year ?? ''}`;
    const prev = twins.get(k);
    if (!prev) { twins.set(k, info); infos.push(info); }
    else if (info.citations.length > prev.citations.length) {
      infos[infos.indexOf(prev)] = info;
      twins.set(k, info);
    }
  }

  // Index archive documents so citations can resolve to our own holdings.
  const byTitle = new Map();
  const byAuthorYear = new Map();
  for (const info of infos) {
    const t = normalizeTitle(info.title);
    if (t.length >= 20) {
      // Same title twice is almost always the same work (PDF + text copy): first one wins.
      if (!byTitle.has(t)) byTitle.set(t, info.doc.id);
      const pk = `prefix:${t.slice(0, 40)}`;
      if (!byTitle.has(pk)) byTitle.set(pk, info.doc.id);
    }
    const ak = documentAuthorKey(info.author);
    if (ak && info.year) {
      const k = `${ak}|${info.year}`;
      byAuthorYear.set(k, byAuthorYear.has(k) && byAuthorYear.get(k) !== info.doc.id ? null : info.doc.id);
    }
  }
  const infoById = new Map(infos.map(i => [i.doc.id, i]));

  const nodes = new Map();
  const links = new Map();

  const archiveNode = (id) => {
    const nodeId = `doc:${id}`;
    if (!nodes.has(nodeId)) {
      const info = infoById.get(id);
      const isCanon = Boolean(
        info?.meta?.curated_seed || 
        info?.meta?.archive_source || 
        (info?.doc?.id && (info.doc.id.includes('taylor') || info.doc.id.includes('sorrells'))) ||
        (info?.meta?.collection === 'Curated Published Articles & Legal Filings') ||
        (info?.doc?.source_collection && info.doc.source_collection.startsWith('Published Canon'))
      );
      nodes.set(nodeId, {
        id: nodeId, kind: 'archive', docId: id, label: info.title, title: info.title, year: info.year,
        author: info.author || null, category: info.category, doc: info.doc, meta: info.meta,
        isCanon,
        citedBy: new Set(), cites: new Set(), raws: [],
      });
    }
    return nodes.get(nodeId);
  };

  const resolveArchive = (parsed) => {
    if (parsed.title) {
      const t = normalizeTitle(parsed.title);
      if (t.length >= 20) {
        const exact = byTitle.get(t);
        if (exact) return exact;
        const prefix = byTitle.get(`prefix:${t.slice(0, 40)}`);
        if (prefix && t.length >= 40) return prefix;
      }
    }
    if (parsed.authorKey && parsed.year) {
      const first = parsed.authorKey.split(' ')[0];
      return byAuthorYear.get(`${parsed.authorKey}|${parsed.year}`) || byAuthorYear.get(`${first}|${parsed.year}`) || null;
    }
    return null;
  };

  let citationCount = 0;
  for (const info of infos) {
    if (!info.citations.length) continue;
    const source = archiveNode(info.doc.id);
    const seen = new Set();
    for (const c of info.citations) {
      const parsed = parseCitation(c);
      if (!parsed) continue;
      const archiveId = resolveArchive(parsed);
      let target;
      if (archiveId && archiveId !== info.doc.id) {
        target = archiveNode(archiveId);
      } else if (archiveId === info.doc.id) {
        continue; // self-citation (usually the doc's own header parsed as a reference)
      } else {
        const nodeId = `ext:${parsed.key}`;
        if (!nodes.has(nodeId)) {
          nodes.set(nodeId, {
            id: nodeId, kind: 'external', label: citationLabel(parsed), title: parsed.title, year: parsed.year,
            authorKey: parsed.authorKey, category: null, citedBy: new Set(), cites: new Set(), raws: [],
          });
        }
        target = nodes.get(nodeId);
        if (!target.title && parsed.title) target.title = parsed.title;
        if (target.raws.length < 5 && !target.raws.includes(parsed.raw)) target.raws.push(parsed.raw);
      }
      if (seen.has(target.id)) continue;
      seen.add(target.id);
      citationCount += 1;
      source.cites.add(target.id);
      target.citedBy.add(source.id);
      const lk = `${source.id}->${target.id}`;
      if (!links.has(lk)) links.set(lk, { source: source.id, target: target.id, internal: target.kind === 'archive' });
    }
  }

  const linkList = [...links.values()];
  return {
    nodes,
    links: linkList,
    stats: {
      citingDocs: [...nodes.values()].filter(n => n.cites.size).length,
      citations: citationCount,
      works: nodes.size,
      internalLinks: linkList.filter(l => l.internal).length,
    },
  };
}

/** Nodes ranked by how many archive documents cite them. */
export function topCited(graph, limit = 20, { kind = null } = {}) {
  if (!graph) return [];
  return [...graph.nodes.values()]
    .filter(n => n.citedBy.size > 0 && (!kind || n.kind === kind))
    .sort((a, b) => b.citedBy.size - a.citedBy.size || (a.year ?? 9999) - (b.year ?? 9999) || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/** Year range of the archive documents that cite a node (how long it stayed influential). */
export function citationSpan(graph, nodeId) {
  const node = graph?.nodes.get(nodeId);
  if (!node) return null;
  const years = [...node.citedBy].map(id => graph.nodes.get(id)?.year).filter(y => typeof y === 'number');
  if (!years.length) return null;
  return { from: Math.min(...years), to: Math.max(...years), count: years.length };
}

/**
 * View selector for the citation force graph.
 *
 * Supported modes:
 * - 'landmarks': (Default) Curated constellation of canonical archive holdings
 *   and major external milestones (cited by >= 8 archive docs). Clean, spacious, and legible.
 * - 'spotlight': (Ego network) Isolates a single chosen work at the center and its direct
 *   1-hop (or 2-hop) citing and cited neighborhood. All unrelated noise is eliminated.
 * - 'all': (Deep archive) Full raw network with user-configurable minCitations and archiveOnly filters.
 */
export function selectView(graph, {
  viewMode = 'landmarks',
  minCitations = 2,
  archiveOnly = false,
  spotlightId = null,
  spotlightHops = 1,
} = {}) {
  if (!graph) return { nodes: [], links: [], mode: viewMode };

  // 1. SPOTLIGHT MODE: Focus on a single work and its neighborhood
  if (spotlightId && (viewMode === 'spotlight' || viewMode === 'neighborhood')) {
    const focal = graph.nodes.get(spotlightId);
    if (focal) {
      const neighborIds = new Set([spotlightId]);
      focal.citedBy.forEach(id => neighborIds.add(id));
      focal.cites.forEach(id => neighborIds.add(id));

      if (spotlightHops >= 2) {
        const hop1 = [...neighborIds];
        for (const hid of hop1) {
          const hn = graph.nodes.get(hid);
          if (hn) {
            hn.citedBy.forEach(id => neighborIds.add(id));
            hn.cites.forEach(id => neighborIds.add(id));
          }
        }
      }

      // Keep links where both source and target are in the neighborhood
      const links = graph.links.filter(l => neighborIds.has(l.source) && neighborIds.has(l.target));
      const nodes = [...neighborIds].map(id => {
        const n = graph.nodes.get(id);
        const isFocal = id === spotlightId;
        const isCiting = focal.citedBy.has(id);
        const isCited = focal.cites.has(id);
        return {
          id,
          kind: n?.kind || 'external',
          label: n?.label || 'Unknown',
          title: n?.title || n?.label || '',
          year: n?.year,
          citedBy: n?.citedBy?.size || 0,
          cites: n?.cites?.size || 0,
          isCanon: Boolean(n?.isCanon),
          isFocal,
          isCiting,
          isCited,
          role: isFocal ? 'focal' : (isCiting ? 'citing' : (isCited ? 'cited' : 'extended')),
        };
      });

      return {
        nodes,
        links: links.map(l => ({
          ...l,
          isFocalLink: l.source === spotlightId || l.target === spotlightId,
          direction: l.target === spotlightId ? 'incoming' : (l.source === spotlightId ? 'outgoing' : 'internal'),
        })),
        mode: 'spotlight',
        focalId: spotlightId,
        focalNode: focal,
      };
    }
  }

  // 2. LANDMARKS MODE (Default): Curated high-impact constellation (~60-90 works)
  if (viewMode === 'landmarks') {
    const extThreshold = Math.max(8, minCitations);
    const keepTarget = (n) => {
      if (!n) return false;
      if (n.kind === 'archive') {
        if (archiveOnly) return n.citedBy.size >= 1;
        return n.isCanon || n.citedBy.size >= 2;
      }
      return !archiveOnly && n.citedBy.size >= extThreshold;
    };

    let links = graph.links.filter(l => {
      const s = graph.nodes.get(l.source);
      const t = graph.nodes.get(l.target);
      return keepTarget(s) && keepTarget(t);
    });

    const ids = new Set();
    links.forEach(l => { ids.add(l.source); ids.add(l.target); });

    // Include top archive landmarks even if external links are sparse
    for (const [id, n] of graph.nodes) {
      if (n.isCanon && n.citedBy.size >= 1) {
        ids.add(id);
      }
    }

    const nodes = [...ids].map(id => {
      const n = graph.nodes.get(id);
      return {
        id,
        kind: n.kind,
        label: n.label,
        title: n.title,
        year: n.year,
        citedBy: n.citedBy.size,
        cites: n.cites.size,
        isCanon: Boolean(n.isCanon),
      };
    });

    const validIds = new Set(nodes.map(n => n.id));
    links = links.filter(l => validIds.has(l.source) && validIds.has(l.target));

    return { nodes, links: links.map(l => ({ ...l })), mode: 'landmarks' };
  }

  // 3. COMPLETE ARCHIVE VIEW: Deep full web
  const keepTarget = (n) => n && (n.kind === 'archive' ? n.citedBy.size >= 1 : !archiveOnly && n.citedBy.size >= minCitations);
  const links = graph.links.filter(l => keepTarget(graph.nodes.get(l.target)));
  const ids = new Set();
  links.forEach(l => { ids.add(l.source); ids.add(l.target); });
  const nodes = [...ids].map(id => {
    const n = graph.nodes.get(id);
    return {
      id,
      kind: n.kind,
      label: n.label,
      year: n.year,
      citedBy: n.citedBy.size,
      cites: n.cites.size,
      isCanon: Boolean(n.isCanon),
    };
  });
  return { nodes, links: links.map(l => ({ ...l })), mode: 'all' };
}
