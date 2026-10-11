import { collapseMatches } from '../../lib/search/docIds.js';

// Document types surfaced by the News Feed (keep in sync with src/pages/NewsFeed.jsx).
// Inlined as SQL literals so the ID list can use the full D1 100-parameter budget.
const NEWS_TYPES = ['external_news', 'recap', 'essay', 'article', 'internal_news', 'press_release', 'blog_post'];
const NEWS_TYPES_SQL = NEWS_TYPES.map(t => `'${t}'`).join(',');

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { query, scope, limit } = await request.json();
    if (!query || !String(query).trim()) return json({ error: 'Missing query' }, 400);

    const aiBinding = env.AI || env.Workers_AI;
    if (!aiBinding) return json({ error: 'AI binding missing' }, 500);
    if (!env.ARCHIVE_INDEX) return json({ error: 'Vectorize binding ARCHIVE_INDEX missing' }, 500);

    // Embed the query
    const queryEmbedding = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [String(query).slice(0, 1000)] });
    const vector = queryEmbedding.data[0];

    if (scope === 'news') {
      // News shares the index with archive chunks, so cast a wide net (topK 100 is
      // only allowed without metadata) and then keep only news-type documents.
      const res = await env.ARCHIVE_INDEX.query(vector, { topK: 100, returnMetadata: 'none' });
      let matches = collapseMatches(res.matches);

      if (env.SURVEY_DB && matches.length) {
        const ids = matches.map(m => m.doc_id).slice(0, 100);
        const { results } = await env.SURVEY_DB.prepare(
          `SELECT id FROM archive_documents
           WHERE id IN (${ids.map(() => '?').join(',')})
             AND type IN (${NEWS_TYPES_SQL})
             AND (status IS NULL OR status != 'rejected')`
        ).bind(...ids).all();
        const allowed = new Set((results || []).map(r => r.id));
        matches = matches.filter(m => allowed.has(m.doc_id));
      }

      const cap = Math.min(Math.max(Number(limit) || 50, 1), 100);
      return json({ matches: matches.slice(0, cap), scope: 'news' });
    }

    // Default: archive-wide search
    const searchResults = await env.ARCHIVE_INDEX.query(vector, { topK: 20, returnMetadata: 'all' });
    return json({ matches: collapseMatches(searchResults.matches) });
  } catch (err) {
    console.error('Semantic Search Error:', err);
    return json({ error: err.message }, 500);
  }
}
