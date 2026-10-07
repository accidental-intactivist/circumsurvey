/**
 * Field Notes: News Lens ingest
 * -----------------------------
 * 1. Pulls fresh headlines (Bing News RSS; Google News 503s Cloudflare edge IPs).
 * 2. Drops stale items (older than FRESHNESS_DAYS) and clusters near-duplicate
 *    stories from multiple outlets onto one record ("also covered by").
 * 3. For each new story: scrapes the page (rejecting error/bot pages), retrieves
 *    related passages from our own archive (Vectorize), and asks Gemini for a
 *    structured "Source Lens": category, relevance, coverage lean, study context,
 *    and claim checks grounded ONLY in the evidence brief or archive excerpts.
 * 4. Low-relevance stories are stored with status='rejected' (so they are not
 *    re-analyzed) and hidden from the feed.
 *
 * Query params (all optional):
 *   ?max=4     max new stories to analyze this call (keeps us under subrequest/CPU limits)
 *   ?days=30   freshness window
 *   ?dry=1     report what would be processed without writing
 *
 * We store ONLY metadata and our own summary, never the article's full text.
 */
import { EVIDENCE_BRIEF, formatEvidenceBrief } from '../../lib/news/evidence_brief.js';

const QUERIES = [
  // Decline of RIC / rates & financing
  '"circumcision rate"',
  '"newborn circumcision"',
  '"infant circumcision"',
  'circumcision Medicaid',
  // Policy & medical
  'circumcision AAP OR CDC policy',
  // Legal
  'circumcision lawsuit OR bill OR ban',
  // Rights & movement
  '"genital autonomy"',
  'intactivist OR intactivism',
  '"Intact America" OR "Bloodstained Men" OR "Doctors Opposing Circumcision"',
  '"foreskin restoration"',
  // Global
  'VMMC OR "voluntary medical male circumcision"',
  'circumcision study',
  // Broad net, newest first; the relevance gate filters out noise
  'circumcision',
  'circumcised',
];

export const NEWS_CATEGORIES = [
  'Rates & Demographics',
  'Medical Policy & Guidance',
  'Research & Studies',
  'Legal & Legislative',
  'Human Rights & Ethics',
  'Movement & Activism',
  'Restoration & Recovery',
  'Culture & Media',
  'Global / VMMC',
];
const LEANS = ['pro_cutting', 'lean_cutting', 'neutral', 'lean_intact', 'pro_intact'];
const OUTLET_TYPES = ['mainstream', 'medical_journal', 'advocacy', 'religious', 'industry', 'government', 'other'];
const ASSESSMENTS = ['accurate', 'missing_context', 'disputed', 'unsupported', 'needs_review'];
const RELEVANCE_MIN = 5;
// Must appear in the headline or snippet before we spend an analysis call on it.
const TOPIC_RE = /circumcis|foreskin|prepuce|intactiv|intact america|genital (autonomy|integrity|cutting|mutilation)|bloodstained men|vmmc|phimosis|bris\b|brit milah/i;
const BRIEF_IDS = new Set(EVIDENCE_BRIEF.map(e => e.id));
const BRIEF_LABELS = Object.fromEntries(EVIDENCE_BRIEF.map(e => [e.id, e.label]));
const BRIEF_URLS = Object.fromEntries(EVIDENCE_BRIEF.map(e => [e.id, e.url]));
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; AccidentalIntactivistBot/1.0)' };

// ── helpers ──────────────────────────────────────────────────────────────
const decode = (s = '') => s
  .replace(/^<!\[CDATA\[|\]\]>$/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&')
  .trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};
const STOP = new Set('a an the of in on to for and or is are was were be by with as at from that this it its after over into about new says say said will can how why what who'.split(' '));
const tokens = (t = '') => new Set(
  t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))
);
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
};
// Same story if titles are broadly similar, OR the shorter headline's distinctive words
// are mostly contained in the longer one (outlets write headlines of very different lengths).
const sameStory = (a, b) => {
  if (!a.size || !b.size) return false;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return jaccard(a, b) >= 0.5 || (inter >= 4 && inter / Math.min(a.size, b.size) >= 0.7);
};
const normalizeDocId = (raw = '') => {
  let id = String(raw).split('-chunk-')[0];
  if (id.includes('-') && id.length > 8 && !id.startsWith('umass-') && !id.startsWith('digest-')) id = id.split('-')[0];
  return id;
};
const safeJson = (s, fallback = {}) => { try { return JSON.parse(s || ''); } catch { return fallback; } };

async function fetchFeeds(fetchLog) {
  const results = await Promise.all(QUERIES.map(async (q) => {
    // sortbydate: Bing defaults to relevance ranking, which surfaces decade-old articles
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&mkt=en-US&qft=sortbydate%3d%221%22`;
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) { fetchLog.push(`${q}: HTTP ${res.status}`); return []; }
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
        const block = m[1];
        let link = tag(block, 'link');
        try { const real = new URL(link).searchParams.get('url'); if (real) link = real; } catch {}
        const pubDate = tag(block, 'pubDate');
        const ts = Date.parse(pubDate);
        return {
          title: tag(block, 'title'),
          link,
          ts: Number.isFinite(ts) ? ts : null,
          pubDate,
          description: tag(block, 'description').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
          source: tag(block, 'News:Source') || tag(block, 'source'),
          query: q,
        };
      }).filter(a => a.title && a.link);
      fetchLog.push(`${q}: ${items.length}`);
      return items;
    } catch (e) {
      fetchLog.push(`${q}: ${e.message}`);
      return [];
    }
  }));
  return results.flat();
}

async function scrape(article) {
  try {
    const res = await fetch(article.link, { headers: UA });
    const isHtml = (res.headers.get('content-type') || '').includes('html');
    const html = res.ok && isHtml ? await res.text() : '';
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const pageTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const blocked =
      !res.ok || !isHtml || stripped.length < 1500 ||
      /error code:?\s*\d{3}|too many requests|access denied|attention required|just a moment|verify you are (a )?human|enable javascript and cookies|captcha|403 forbidden|404 not found|service unavailable/i
        .test(`${pageTitle} ${stripped.slice(0, 2000)}`);
    if (blocked) return { text: '', image: null, blocked: true };
    const og = html.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i) ||
               html.match(/<meta[^>]*content=['"]([^'"]+)['"][^>]*property=['"]og:image['"]/i);
    const image = og && og[1] && !/gstatic\.com|google\.com|bing\.com/i.test(og[1]) ? og[1] : null;
    return { text: stripped.slice(0, 12000), image, blocked: false };
  } catch {
    return { text: '', image: null, blocked: true };
  }
}

async function retrieveArchive(env, ai, article) {
  try {
    const emb = await ai.run('@cf/baai/bge-small-en-v1.5', { text: [`${article.title}. ${article.description}`.slice(0, 1000)] });
    const vector = emb?.data?.[0];
    if (!vector) return [];
    const res = await env.ARCHIVE_INDEX.query(vector, { topK: 10, returnMetadata: 'all' });
    const snippets = new Map();
    for (const m of res.matches || []) {
      const id = normalizeDocId(m.metadata?.doc_id || m.id);
      if (!id || snippets.has(id) || id.startsWith('digest-')) continue;
      snippets.set(id, (m.metadata?.text || '').slice(0, 500));
      if (snippets.size >= 5) break;
    }
    if (!snippets.size) return [];
    const ids = [...snippets.keys()];
    const { results } = await env.SURVEY_DB.prepare(
      `SELECT id, title, type, metadata_json FROM archive_documents WHERE id IN (${ids.map(() => '?').join(',')}) AND type NOT IN ('external_news','recap')`
    ).bind(...ids).all();
    return (results || []).map(r => {
      const meta = safeJson(r.metadata_json);
      const g = meta.gemini_extracted_metadata || {};
      return {
        id: r.id,
        title: meta.academic_title || g.title || r.title,
        date: g.publication_date || meta.date || '',
        authors: (g.authors || []).slice(0, 3).join(', '),
        excerpt: snippets.get(r.id) || meta.abstract || meta.summary || '',
      };
    });
  } catch (e) {
    console.error('Archive retrieval failed', e);
    return [];
  }
}

function buildPrompt(article, isoDate, pageText, archive) {
  const archiveBlock = archive.length
    ? archive.map(a => `[${a.id}] ${a.title}${a.date ? ` (${a.date})` : ''}${a.authors ? ` by ${a.authors}` : ''}\n  Excerpt: ${a.excerpt || '(no excerpt)'}`).join('\n')
    : '(none retrieved)';

  return `
You are the analysis desk for "The Accidental Intactivist's Guide", a news site that tracks the
genital autonomy movement and the decline of routine infant circumcision (RIC) in the United States.
Think of it as Ground News for this topic: we show every outlet's coverage, label where it comes from,
and add calm, sourced context. Editorial voice: the Inquiry Frame (lead with curiosity, respect lived
experience, centre bodily autonomy and equal protection; never write "So what").

ARTICLE (headline, outlet and date come from the news feed and are authoritative):
Headline: ${article.title}
Outlet: ${article.source || 'unknown'}
Date: ${isoDate}
Feed snippet: ${article.description || '(none)'}
Page text: ${pageText || '(unavailable: base analysis on headline and snippet only)'}

EVIDENCE BRIEF (editor-approved reference; cite by [id]):
${formatEvidenceBrief()}

ARCHIVE EXCERPTS (documents from our own archive; cite by [id]):
${archiveBlock}

RULES
- "summary" and "abstract" describe what THE ARTICLE says, neutrally. Perspective goes in "why_it_matters" and "claims".
- "relevance": 0-10. 8-10 = directly about RIC, its decline, policy, law, rights, or the movement. 5-7 = substantive
  but secondary. 0-4 = passing mention, listicle, unrelated procedure, or a different "circumcision" topic.
- "coverage_lean" describes the ARTICLE's framing of infant circumcision:
    pro_cutting = strongly promotes or defends routine circumcision;
    lean_cutting = somewhat favors circumcision, or provides standard informational coverage that fails to challenge routine circumcision as medically unnecessary;
    neutral = genuinely balances both sides without assuming circumcision as a default;
    lean_intact = raises ethical, medical or rights concerns;
    pro_intact = written from a genital-autonomy advocacy stance.
- For any study the article reports, describe the population, setting and design, and judge honestly whether the
  findings generalize to healthy US newborns (who cannot consent and are not sexually active).
- "claims": up to 4 central factual claims about medicine, statistics, law or policy.
  * Mark accurate claims "accurate". Credibility depends on acknowledging what an article gets right.
  * Any other assessment MUST cite at least one [id] from the EVIDENCE BRIEF or ARCHIVE EXCERPTS that directly supports
    your note. If you cannot, use "needs_review" and explain what an editor should verify.
  * Cite an archive [id] ONLY if its excerpt text above actually supports the note. Never cite a document just because it
    is on a related topic. An empty sources list is better than a loose one.
  * Claims about what happened in the story itself (events, rulings, quotes) are attributed to the article; do not attach
    archive or brief sources to them.
  * Never invent statistics, studies or quotes that are not in the article, the brief or the excerpts.
  * Context notes: 1-3 sentences, precise and non-sarcastic.
- "rate_datapoint": only if the article states a circumcision rate figure; otherwise null.

Return ONLY a raw JSON object:
{
  "relevance": 0,
  "category": one of ${JSON.stringify(NEWS_CATEGORIES)},
  "summary": "1-2 paragraphs",
  "abstract": "1-2 sentences",
  "why_it_matters": "1-3 sentences of fair-use editorial analysis written explicitly in the voice of the Accidental Intactivist. Interpret the strategic implications of this event for the genital autonomy movement, drawing on our core principles (e.g., the risks of constitutional challenges, bodily autonomy, and equal protection).",
  "author": "string or null",
  "image_attribution": "string or null (extract photographer or publication credit if found in the text)",
  "tags": ["..."],
  "key_people": ["..."],
  "organizations": ["..."],
  "coverage_lean": one of ${JSON.stringify(LEANS)},
  "outlet_type": one of ${JSON.stringify(OUTLET_TYPES)},
  "study": null or {
    "population": "...", "setting": "...", "design": "...",
    "funding_or_coi": "string or null",
    "generalizes_to_us_newborns": "yes" | "no" | "partially" | "unclear",
    "why": "1-2 sentences"
  },
  "claims": [ { "claim": "...", "assessment": one of ${JSON.stringify(ASSESSMENTS)}, "context_note": "...", "sources": ["id"] } ],
  "rate_datapoint": null or { "year": 2024, "rate_percent": 0, "population": "...", "source": "..." }
}`;
}

function sanitizeLens(ai, archive) {
  const archiveTitles = Object.fromEntries(archive.map(a => [a.id, a.title]));
  const clampEnum = (v, list, dflt) => (list.includes(v) ? v : dflt);
  const claims = (Array.isArray(ai.claims) ? ai.claims : []).slice(0, 4).map(c => {
    const sources = (Array.isArray(c.sources) ? c.sources : [])
      .map(s => String(s).replace(/^\[|\]$/g, ''))
      .filter(s => BRIEF_IDS.has(s) || archiveTitles[s])
      .map(s => BRIEF_IDS.has(s)
        ? { id: s, kind: 'brief', label: BRIEF_LABELS[s], url: BRIEF_URLS[s] }
        : { id: s, kind: 'archive', label: archiveTitles[s] });
    let assessment = clampEnum(c.assessment, ASSESSMENTS, 'needs_review');
    // Enforce grounding: no citation, no verdict.
    if (assessment !== 'accurate' && assessment !== 'needs_review' && sources.length === 0) assessment = 'needs_review';
    return { claim: String(c.claim || '').slice(0, 400), assessment, context_note: String(c.context_note || '').slice(0, 800), sources };
  }).filter(c => c.claim);

  return {
    relevance: Math.max(0, Math.min(10, parseInt(ai.relevance, 10) || 0)),
    category: clampEnum(ai.category, NEWS_CATEGORIES, 'Culture & Media'),
    coverage_lean: clampEnum(ai.coverage_lean, LEANS, 'neutral'),
    outlet_type: clampEnum(ai.outlet_type, OUTLET_TYPES, 'other'),
    study: ai.study && typeof ai.study === 'object' ? ai.study : null,
    claims,
    rate_datapoint: ai.rate_datapoint && typeof ai.rate_datapoint === 'object' ? ai.rate_datapoint : null,
    archive_refs: archive.map(a => ({ id: a.id, title: a.title })),
    analyzed_at: new Date().toISOString(),
  };
}

async function callGemini(env, prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini returned no content (HTTP ${res.status})`);
  return JSON.parse(text);
}

// ── handler ──────────────────────────────────────────────────────────────
export async function onRequest(context) {
  const { env, request } = context;
  if (!env.SURVEY_DB) return new Response('Database binding not found', { status: 500 });
  const ai = env.AI || env.Workers_AI;
  if (!ai) return new Response('AI binding not found', { status: 500 });
  if (!env.ARCHIVE_INDEX) return new Response('ARCHIVE_INDEX binding not found', { status: 500 });

  const params = new URL(request.url).searchParams;
  const maxNew = Math.max(1, Math.min(8, parseInt(params.get('max'), 10) || 4));
  const days = Math.max(1, Math.min(365, parseInt(params.get('days'), 10) || parseInt(env.NEWS_FRESHNESS_DAYS, 10) || 30));
  const dry = params.get('dry') === '1';
  const cutoff = Date.now() - days * 86400000;

  const fetchLog = [];
  const log = [];
  const stats = { fetched: 0, fresh: 0, known: 0, clustered: 0, analyzed: 0, published: 0, rejected: 0, errors: 0 };

  try {
    // 1. Gather & filter
    const raw = await fetchFeeds(fetchLog);
    stats.fetched = raw.length;
    const byLink = new Map();
    for (const a of raw) {
      if (a.ts && a.ts >= cutoff && !byLink.has(a.link) && TOPIC_RE.test(`${a.title} ${a.description}`)) byLink.set(a.link, a);
    }
    const fresh = [...byLink.values()].sort((a, b) => b.ts - a.ts);
    stats.fresh = fresh.length;

    // 2. Load recent stories for URL dedupe + clustering
    const cutoffIso = new Date(cutoff - 14 * 86400000).toISOString();
    const { results: recentRows } = await env.SURVEY_DB.prepare(
      `SELECT id, title, url, status, metadata_json FROM archive_documents
       WHERE type = 'external_news' AND COALESCE(published_at, created_at) >= ? LIMIT 500`
    ).bind(cutoffIso).all();
    const knownUrls = new Set();
    const clusters = [];
    for (const r of recentRows || []) {
      knownUrls.add(r.url);
      const meta = safeJson(r.metadata_json);
      (meta.also_covered_by || []).forEach(c => knownUrls.add(c.url));
      if (r.status !== 'rejected') clusters.push({ id: r.id, tokens: tokens(r.title), meta });
    }
    // Also guard against URLs older than the recent window
    if (fresh.length) {
      const urls = fresh.map(a => a.link).slice(0, 90);
      const { results: exist } = await env.SURVEY_DB.prepare(
        `SELECT url FROM archive_documents WHERE url IN (${urls.map(() => '?').join(',')})`
      ).bind(...urls).all();
      (exist || []).forEach(r => knownUrls.add(r.url));
    }

    // 3. Process
    for (const article of fresh) {
      if (knownUrls.has(article.link)) { stats.known++; continue; }
      const isoDate = new Date(article.ts).toISOString();

      // 3a. Cluster near-duplicates onto the existing story
      const tk = tokens(article.title);
      const match = tk.size >= 4 ? clusters.find(c => sameStory(tk, c.tokens)) : null;
      if (match) {
        stats.clustered++;
        knownUrls.add(article.link);
        log.push(`clustered: "${article.title}" → ${match.id}`);
        if (!dry) {
          const also = match.meta.also_covered_by || [];
          also.push({ source: article.source || 'Unknown outlet', url: article.link, title: article.title, date: isoDate.split('T')[0] });
          match.meta.also_covered_by = also;
          await env.SURVEY_DB.prepare('UPDATE archive_documents SET metadata_json = ? WHERE id = ?')
            .bind(JSON.stringify(match.meta), match.id).run();
        }
        continue;
      }

      if (stats.analyzed >= maxNew) continue;
      stats.analyzed++;
      knownUrls.add(article.link);
      if (dry) { log.push(`would analyze: ${article.title}`); clusters.push({ id: `(new) ${article.title.slice(0, 40)}`, tokens: tk, meta: {} }); continue; }

      try {
        const [page, archive] = await Promise.all([scrape(article), retrieveArchive(env, ai, article)]);
        let meta = {
          academic_title: article.title,
          abstract: article.description,
          date: isoDate.split('T')[0],
          source_publication: article.source || 'News Source',
          url: article.link,
          found_via: article.query,
        };
        let status = 'indexed';
        let category = null;

        if (env.GEMINI_API_KEY) {
          const out = await callGemini(env, buildPrompt(article, isoDate.split('T')[0], page.text, archive));
          const lens = sanitizeLens(out, archive);
          category = lens.category;
          status = lens.relevance >= RELEVANCE_MIN ? 'indexed' : 'rejected';
          meta = {
            ...meta,
            summary: out.summary || '',
            abstract: out.abstract || article.description,
            why_it_matters: out.why_it_matters || '',
            author: out.author || null,
            image_attribution: out.image_attribution || null,
            tags: Array.isArray(out.tags) ? out.tags.slice(0, 8) : [],
            key_people: Array.isArray(out.key_people) ? out.key_people.slice(0, 10) : [],
            organizations: Array.isArray(out.organizations) ? out.organizations.slice(0, 10) : [],
            lens,
          };
        }
        if (page.image) meta.image_url = page.image;
        if (page.blocked) meta.scrape_blocked = true;

        const docId = crypto.randomUUID().split('-')[0];
        await env.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (id, title, source_collection, url, type, status, metadata_json, category, published_at)
          VALUES (?, ?, ?, ?, 'external_news', ?, ?, ?, ?)
        `).bind(docId, article.title, 'Global News Monitoring', article.link, status, JSON.stringify(meta), category, isoDate).run();

        if (status === 'indexed') {
          stats.published++;
          clusters.push({ id: docId, tokens: tk, meta });
          try {
            const text = `${article.title}. ${meta.abstract || ''}`.slice(0, 1000);
            const v = await ai.run('@cf/baai/bge-small-en-v1.5', { text: [text] });
            if (v?.data?.[0]) {
              await env.ARCHIVE_INDEX.upsert([{ id: docId, values: v.data[0], metadata: { source: article.link, text, doc_id: docId } }]);
            }
          } catch (e) { console.error('Vectorization failed', e); }
          log.push(`published [${category} · ${meta.lens?.coverage_lean ?? 'n/a'} · rel ${meta.lens?.relevance ?? 'n/a'}]: ${article.title}`);
        } else {
          stats.rejected++;
          log.push(`rejected (rel ${meta.lens?.relevance}): ${article.title}`);
        }
      } catch (e) {
        stats.errors++;
        log.push(`error: ${article.title}: ${e.message}`);
        console.error('Analyze failed', article.link, e);
      }
    }

    const remaining = fresh.filter(a => !knownUrls.has(a.link)).length;
    const sample = dry ? raw.slice(0, 6).map(a => ({ title: a.title.slice(0, 60), pubDate: a.pubDate, ts: a.ts })) : undefined;
    return new Response(JSON.stringify({ success: true, days, maxNew, dry, stats, remaining, log, fetchLog, sample }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, stats, log, fetchLog }), { status: 500 });
  }
}
