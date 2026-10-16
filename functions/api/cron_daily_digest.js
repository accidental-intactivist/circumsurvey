/**
 * Daily Digest: "Pulse of the Movement"
 * Synthesizes the last N days of analyzed news (default 7) into a categorized
 * digest with coverage balance and any new circumcision-rate data points.
 * Re-running on the same day updates that day's digest instead of duplicating it.
 *
 * Query params: ?days=7
 */
const LEAN_KEYS = ['pro_cutting', 'lean_cutting', 'neutral', 'lean_intact', 'pro_intact'];
const safeJson = (s, fallback = {}) => { try { return JSON.parse(s || ''); } catch { return fallback; } };

export async function onRequest(context) {
  const { env, request } = context;

  if (!env.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }

  try {
    const days = Math.max(1, Math.min(30, parseInt(new URL(request.url).searchParams.get('days'), 10) || 7));
    const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

    // 1. Recent, relevant, analyzed news
    const { results: rows } = await env.SURVEY_DB.prepare(`
      SELECT id, title, url, category, published_at, metadata_json
      FROM archive_documents
      WHERE type = 'external_news' AND status = 'indexed' AND published_at >= ?
      ORDER BY published_at DESC
      LIMIT 30
    `).bind(sinceIso).all();

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ success: true, message: `No analyzed news in the last ${days} days to digest.` }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Deterministic aggregates (computed in code, not by the model)
    const coverage_balance = Object.fromEntries(LEAN_KEYS.map(k => [k, 0]));
    const category_counts = {};
    const rate_datapoints = [];
    const items = rows.map(r => {
      const meta = safeJson(r.metadata_json);
      const lens = meta.lens || {};
      const outlets = 1 + (meta.also_covered_by || []).length;
      if (lens.coverage_lean && coverage_balance[lens.coverage_lean] !== undefined) coverage_balance[lens.coverage_lean] += 1;
      if (r.category) category_counts[r.category] = (category_counts[r.category] || 0) + 1;
      if (lens.rate_datapoint) rate_datapoints.push({ ...lens.rate_datapoint, doc_id: r.id, outlet: meta.source_publication });
      return {
        id: r.id,
        title: r.title,
        outlet: meta.source_publication || 'Unknown',
        outlets,
        date: (r.published_at || '').split('T')[0],
        category: r.category || 'Uncategorized',
        lean: lens.coverage_lean || 'neutral',
        abstract: meta.abstract || '',
        why: meta.why_it_matters || '',
        flagged: (lens.claims || []).filter(c => c.assessment !== 'accurate').map(c => `${c.claim} → ${c.assessment}: ${c.context_note}`),
        image_url: meta.image_url || (meta.media_urls?.[0]) || null,
        url: r.url || meta.url || null,
      };
    });
    const validIds = new Set(items.map(i => i.id));

    // 3. Approved community comments from the same window (if the table exists)
    let commentsText = '';
    try {
      const { results: comments } = await env.SURVEY_DB.prepare(
        `SELECT comment FROM item_comments WHERE status = 'approved' AND created_at >= ? ORDER BY created_at DESC LIMIT 25`
      ).bind(sinceIso.replace('T', ' ').slice(0, 19)).all();
      commentsText = (comments || []).map(c => `- ${String(c.comment).slice(0, 300)}`).join('\n');
    } catch { /* table may not exist yet */ }

    const contextText = items.map(i =>
      `[${i.id}] ${i.title}\n  Outlet: ${i.outlet}${i.outlets > 1 ? ` (+${i.outlets - 1} more outlets)` : ''} | Date: ${i.date} | Category: ${i.category} | Lean: ${i.lean}\n  Abstract: ${i.abstract}\n  Why it matters: ${i.why}${i.flagged.length ? `\n  Context notes: ${i.flagged.join(' || ')}` : ''}`
    ).join('\n\n');

    const prompt = `
You are the Senior Research Assistant and Editor for "The Accidental Intactivist Field Dispatch". Write today's dispatch:
a synthesis of the current state of the genital autonomy movement and the decline of routine infant circumcision (RIC)
in the United States and globally, based ONLY on the analyzed stories below.

Take on the explicit role and editorial voice of the Accidental Intactivist. 
Your core operating thesis is: "Why isn't this weird to more of us, given everything we know laid out here?"
Voice: Calm, curious, scientifically rigorous, accessible, compassionate, and sharp. Never hyperbolic, sensationalist, or conspiratorial. Reject all anti-vaccine or anti-abortion rhetoric—we stand squarely with peer-reviewed evidence-based medicine and universal bodily integrity.

Contemporary Baseline to Keep in Mind:
1. The AAP 2012 policy statement officially expired in August 2017 and was never renewed. In 2025 (J Med Ethics), task force chair Dr. Andrew Freedman admitted on record that circumcision is "not really a medical practice", while bioethicist Dr. Douglas Diekema conceded that benefits do not outweigh risks.
2. In 2024 (J Pediatr Surg, Fendereski et al.), a matched cohort of 1.7 million boys followed over 5 years proved that circumcised boys have nearly 3x MORE documented penile complications requiring medical care (1.7% vs 0.5%) compared to intact boys.
3. Epidemiological reality (Institut Pasteur): Circumcision provides 0% physical barrier protection upon viral exposure. Real prevention relies on condoms and PrEP.
4. "Disease of the Decade": For 150 years, the target disease has been retconned every generation (paralysis, masturbation, syphilis, cervical cancer, UTIs, HIV) while the knife always removes the exact same erogenous tissue.
5. Inpatient birth rates in the US have dropped below 50% (JAMA Peds 2025: 49.3%), with the West down to 19.7%.

Do not merely regurgitate headlines. Apply sharp editorial acumen to daylight the cognitive dissonance in these stories. Point out the absurdity of a tradition rooted in censoring sexual gratification, and actively call out the gaslighting that a normal, healthy penis needs surgical modification.
Provide a fair-use, strategic analysis of the news, interpreting events through the lens of our core principles (bodily autonomy, equal protection).
Follow the "Inquiry Frame": lead with curiosity, respect lived experiences, and focus on systemic impact.
Never use the phrase "So what"; embed the significance in the analysis itself. Where a story carries context notes,
reflect that context accurately; do not overstate it or add claims not present below.

CRITICAL INSTRUCTION FOR LIGHT NEWS DAYS:
If there are few headlines provided, or if the news is largely trivial, dynamically pivot the "abstract" and "sections" to serve as an inspiring, supportive Field Note. Creatively invite people to use various aspects of the site in their journey as Intactivists—whether accidental or intentional:
- Exploring the 150-year Retcon Timeline at /to/disease-of-the-decade
- Reading the Expectant Parents Guide and Recite-Back Consent Form at /to/expectant-parents
- Testing assumptions in the Live CircumSurvey Data Explorer at /explore
- Reviewing peer-reviewed micrographs in the Histology Archive.
Speak directly and encouragingly to the reader: "Why isn't this weird to more of us?"`;

Stories from the last ${days} days:
${contextText}

Coverage balance (count of analyzed stories by framing): ${JSON.stringify(coverage_balance)}
New rate data points: ${rate_datapoints.length ? JSON.stringify(rate_datapoints) : 'none'}
Approved community comments: ${commentsText || 'none this period'}

Return ONLY a raw JSON object:
{
  "abstract": "1-2 paragraph overview of the movement's pulse this period.",
  "community_zeitgeist": "1 paragraph on the mood of community comments, with **bold** emphasis allowed. If there are no comments, return an empty string.",
  "sections": [
    { "category": "one of the story categories above", "headline": "short section headline", "body": "1-2 paragraphs synthesizing these stories", "item_ids": ["story ids from above"] }
  ],
  "decline_note": "1-2 sentences on what this period's coverage says about the trajectory of RIC in the US, or empty string if nothing relevant.",
  "suggested_ground_truths": [
    {
      "keywords": "comma separated keywords",
      "statement": "An absolute, factual truth grounded in this news cycle that should supersede ambiguous or outdated literature in AI retrieval.",
      "zeitgeist_impact": "1 sentence explaining why this fact impacts the cultural, legal, or medical zeitgeist."
    }
  ]
}
Order sections by importance. Use only story ids listed above. Focus suggested_ground_truths on high-impact legal, anatomical, or institutional developments.`;

    let raw = "";
    if (env.GEMINI_API_KEY) {
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
        })
      });
      const aiData = await aiRes.json();
      raw = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      // Fallback to Cloudflare AI if Gemini isn't available
      const aiBinding = env.AI || env.Workers_AI;
      if (aiBinding) {
        const response = await aiBinding.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [{ role: "system", content: "You write daily news digests. Respond with raw JSON only." }, { role: "user", content: prompt }],
          max_tokens: 2000
        });
        raw = response.response;
      }
    }
    if (!raw) throw new Error("Failed to generate digest content.");

    let cleanJson = raw.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7, -3).trim();
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3, -3).trim();
    let digestData;
    try {
      digestData = JSON.parse(cleanJson);
    } catch (e) {
      throw new Error("Failed to parse JSON from AI: " + e.message);
    }

    const itemById = Object.fromEntries(items.map(i => [i.id, i]));
    const sections = (Array.isArray(digestData.sections) ? digestData.sections : []).map(s => ({
      category: s.category || 'Uncategorized',
      headline: s.headline || s.category || '',
      body: s.body || '',
      items: (Array.isArray(s.item_ids) ? s.item_ids : [])
        .filter(id => validIds.has(id))
        .map(id => ({
          id,
          title: itemById[id].title,
          outlet: itemById[id].outlet,
          lean: itemById[id].lean,
          image_url: itemById[id].image_url,
          url: itemById[id].url
        })),
    })).filter(s => s.body);

    // 4. Save (one digest per Pacific-time day)
    const tz = 'America/Los_Angeles';
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: tz });
    const localDate = new Date().toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    const digestTitle = `Pulse of the Movement: ${today}`;

    const metadata_json = JSON.stringify({
      abstract: digestData.abstract || "A synthesized roundup of the period's top stories.",
      community_zeitgeist: digestData.community_zeitgeist || "",
      decline_note: digestData.decline_note || "",
      sections,
      // Backward-compatible flat list for older renderers
      digest_items: sections.map(s => ({ title: s.headline, body: s.body, item_id: s.items[0]?.id || null })),
      coverage_balance,
      category_counts,
      rate_datapoints,
      story_count: items.length,
      window_days: days,
      author: "AI Research Assistant",
      date: localDate,
      source_publication: "Internal Archives",
      tags: ["Daily Digest", "Pulse of the Movement", "AI Synthesis"]
    });

    const existing = await env.SURVEY_DB.prepare(
      `SELECT id FROM archive_documents WHERE type = 'recap' AND title = ? LIMIT 1`
    ).bind(digestTitle).first();

    let docId;
    if (existing) {
      docId = existing.id;
      await env.SURVEY_DB.prepare(`UPDATE archive_documents SET metadata_json = ?, published_at = ? WHERE id = ?`)
        .bind(metadata_json, new Date().toISOString(), docId).run();
    } else {
      docId = `digest-${Date.now()}`;
      await env.SURVEY_DB.prepare(`
        INSERT INTO archive_documents (id, title, source_collection, type, status, metadata_json, category, published_at)
        VALUES (?, ?, ?, 'recap', 'indexed', ?, 'Pulse of the Movement', ?)
      `).bind(docId, digestTitle, "Daily Digests", metadata_json, new Date().toISOString()).run();
    }

    // 4b. Index suggested ground truths for editorial review
    if (Array.isArray(digestData.suggested_ground_truths) && digestData.suggested_ground_truths.length > 0) {
      try {
        await env.SURVEY_DB.prepare(`
          CREATE TABLE IF NOT EXISTS ground_truth_suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keywords TEXT NOT NULL,
            statement TEXT NOT NULL,
            zeitgeist_impact TEXT,
            source_id TEXT,
            source_title TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `).run();

        for (const sug of digestData.suggested_ground_truths) {
          if (sug && sug.keywords && sug.statement) {
            const exists = await env.SURVEY_DB.prepare(
              "SELECT id FROM ground_truth_suggestions WHERE statement = ?"
            ).bind(sug.statement).first();
            if (!exists) {
              await env.SURVEY_DB.prepare(`
                INSERT INTO ground_truth_suggestions (keywords, statement, zeitgeist_impact, source_id, source_title)
                VALUES (?, ?, ?, ?, ?)
              `).bind(
                Array.isArray(sug.keywords) ? sug.keywords.join(', ') : String(sug.keywords),
                sug.statement,
                sug.zeitgeist_impact || '',
                docId,
                digestTitle
              ).run();
            }
          }
        }
      } catch (e) {
        console.error("Failed to persist suggested ground truths:", e);
      }
    }

    // 5. Vectorize the digest so the assistant can search it
    if (env.ARCHIVE_INDEX) {
      try {
        const aiBinding = env.AI || env.Workers_AI;
        const text = `${digestTitle}. ${digestData.abstract || ''}`.slice(0, 1000);
        const vectorData = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [text] });
        if (vectorData && vectorData.data && vectorData.data[0]) {
          await env.ARCHIVE_INDEX.upsert([{
            id: docId,
            values: vectorData.data[0],
            metadata: { source: "Daily Digest", text, doc_id: docId }
          }]);
        }
      } catch (e) {
        console.error("Vectorization failed for digest", e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${existing ? 'Updated' : 'Saved'} digest: ${digestTitle}`,
      stories: items.length,
      sections: sections.length,
      coverage_balance
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Cron Digest Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
