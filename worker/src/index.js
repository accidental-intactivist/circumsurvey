// ═══════════════════════════════════════════════════════════════════════════
// circumsurvey-api Worker — v8.1 upgrade
// Changes from previous version:
//   • Added `filter` query param support to /api/response-distribution
//     (enables cohort-filtered per-question distributions for Explore v8.1)
//   • Everything else preserved as-is
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_TTL_SECONDS = 60;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

function errorJson(message, status = 500) {
  return json({ error: message }, status);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    try {
      const path = url.pathname.replace(/^\/api/, "") || "/";
      
      if (request.method === "POST" && path === "/ai/query") {
        return await handleCopilotQuery(env, request, url);
      }
      
      if (request.method !== "GET") {
        return errorJson("Method not allowed", 405);
      }
      
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      let response = await cache.match(cacheKey);
      if (response) return response;
      if (path === "/" || path === "/count") {
        response = await handleCount(env);
      } else if (path === "/questions") {
        response = await handleQuestions(env, url);
      } else if (path === "/sections") {
        response = await handleSections(env, url);
      } else if (path === "/aggregate") {
        response = await handleAggregate(env, url);
      } else if (path === "/response-distribution") {
        response = await handleResponseDistribution(env, url);
      } else if (path === "/narratives") {
        response = await handleNarratives(env, url);
      } else if (path === "/geo") {
        response = await handleGeo(env, url);
      } else if (path === "/ai/embed_batch") {
        response = await handleEmbedBatch(env, url);
      } else if (path === "/health") {
        response = json({ ok: true, ts: new Date().toISOString() });
      } else {
        response = errorJson(`Unknown endpoint: ${path}`, 404);
      }
      if (response.status === 200) {
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    } catch (err) {
      console.error("Worker error:", err);
      return errorJson(`Internal error: ${err.message || String(err)}`, 500);
    }
  }
};

async function handleCount(env) {
  const { results: totalResult } = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM respondents WHERE consent = 1`
  ).all();
  const total = totalResult[0]?.total ?? 0;
  const { results: pathwayResults } = await env.DB.prepare(
    `SELECT pathway, COUNT(*) AS n FROM respondents WHERE consent = 1 GROUP BY pathway`
  ).all();
  const by_pathway = {};
  let classified = 0;
  for (const row of pathwayResults) {
    if (row.pathway) {
      by_pathway[row.pathway] = row.n;
      if (row.pathway !== "observer") classified += row.n;
    } else {
      by_pathway.unclassified = row.n;
    }
  }
  return json({ total, classified, by_pathway, updated_at: new Date().toISOString() });
}

async function handleQuestions(env, url) {
  const tierParam = url.searchParams.get("tier");
  const sectionParam = url.searchParams.get("section");
  const pathwayParam = url.searchParams.get("pathway");
  const withCounts = url.searchParams.get("counts") === "1";
  let sql = `SELECT id, section, pathway, prompt, subtitle, type, opts_json, tier, col_idx
             FROM questions WHERE 1=1`;
  const bindings = [];
  if (tierParam) {
    const tiers = tierParam.split(",").map((t) => parseInt(t, 10)).filter((t) => !isNaN(t));
    if (tiers.length > 0) {
      sql += ` AND tier IN (${tiers.map(() => "?").join(",")})`;
      bindings.push(...tiers);
    }
  }
  if (sectionParam) {
    sql += ` AND section = ?`;
    bindings.push(sectionParam);
  }
  if (pathwayParam) {
    sql += ` AND (pathway = ? OR pathway = 'all')`;
    bindings.push(pathwayParam);
  }
  sql += ` ORDER BY tier, col_idx`;
  const stmt = bindings.length > 0 ? env.DB.prepare(sql).bind(...bindings) : env.DB.prepare(sql);
  const { results } = await stmt.all();
  let parsed = results.map((r) => ({
    ...r,
    opts: r.opts_json ? tryParseJson(r.opts_json) : null,
    opts_json: undefined,
  }));
  if (withCounts && parsed.length > 0) {
    // BUG FIX from v8.0: use GROUP BY (no IN clause) to avoid bind-parameter limit
    const idSet = new Set(parsed.map((p) => p.id));
    const { results: countRows } = await env.DB.prepare(
      `SELECT question_id, COUNT(*) AS n FROM responses GROUP BY question_id`
    ).all();
    const countMap = {};
    for (const row of countRows) {
      if (idSet.has(row.question_id)) countMap[row.question_id] = row.n;
    }
    parsed = parsed.map((p) => ({ ...p, n_responses: countMap[p.id] || 0 }));
  }
  return json({ count: parsed.length, questions: parsed });
}

async function handleSections(env, url) {
  const pathwayParam = url.searchParams.get("pathway");
  let sql = `SELECT section, pathway, COUNT(*) AS n,
                    SUM(CASE WHEN tier = 1 THEN 1 ELSE 0 END) AS n_curated
             FROM questions WHERE section IS NOT NULL`;
  const bindings = [];
  if (pathwayParam) {
    sql += ` AND (pathway = ? OR pathway = 'all')`;
    bindings.push(pathwayParam);
  }
  sql += ` GROUP BY section, pathway ORDER BY section, pathway`;
  const stmt = bindings.length > 0 ? env.DB.prepare(sql).bind(...bindings) : env.DB.prepare(sql);
  const { results } = await stmt.all();
  const bySection = {};
  for (const r of results) {
    if (!bySection[r.section]) {
      bySection[r.section] = { section: r.section, total: 0, curated: 0, by_pathway: {} };
    }
    bySection[r.section].total += r.n;
    bySection[r.section].curated += r.n_curated;
    bySection[r.section].by_pathway[r.pathway] = r.n;
  }
  return json({
    count: Object.keys(bySection).length,
    sections: Object.values(bySection).sort((a, b) => b.total - a.total)
  });
}

async function handleAggregate(env, url) {
  const questionId = url.searchParams.get("q");
  const by = url.searchParams.get("by") || "pathway";
  const byQuestion = url.searchParams.get("by_question");
  const filters = url.searchParams.getAll("filter");
  const pathways = url.searchParams.getAll("pathway");
  if (!questionId) return errorJson("Missing required parameter: q", 400);

  const bindings = [];
  
  let groupCol = "resp.pathway";
  let groupJoin = "JOIN respondents resp ON resp.id = r.respondent_id";
  if (byQuestion) {
    groupJoin = `JOIN responses r2 ON r2.respondent_id = r.respondent_id AND r2.question_id = ?`;
    groupCol = "r2.value_text";
    bindings.push(byQuestion);
  } else if (by === "generation") {
    groupJoin += " JOIN demographics dem ON dem.respondent_id = r.respondent_id";
    groupCol = "dem.generation";
  } else if (by === "religion") {
    groupJoin += " LEFT JOIN religion rel ON rel.respondent_id = r.respondent_id";
    groupCol = "rel.primary_tradition";
  } else if (by === "country_born") {
    groupJoin += " JOIN demographics dem ON dem.respondent_id = r.respondent_id";
    groupCol = "dem.country_born";
  }

  bindings.push(questionId);
  
  let pathwayWhere = "";
  if (pathways.length > 0) {
    if (pathways.length === 1) {
      pathwayWhere = " AND resp.pathway = ?";
      bindings.push(pathways[0]);
    } else {
      const placeholders = pathways.map(() => "?").join(",");
      pathwayWhere = ` AND resp.pathway IN (${placeholders})`;
      bindings.push(...pathways);
    }
  }

  const filterData = buildFilterWhere(filters);
  const filterWhere = filterData.filterWhere;
  const needsReligion = filterData.needsReligion;
  const needsDemographics = filterData.needsDemographics;
  bindings.push(...filterData.bindings);

  let filterJoin = "";
  if (needsReligion) filterJoin += " LEFT JOIN religion rg ON rg.respondent_id = r.respondent_id";
  if (needsDemographics) filterJoin += " LEFT JOIN demographics d ON d.respondent_id = r.respondent_id";

  const sql = `
    SELECT ${groupCol} AS bucket,
           COUNT(*) AS n,
           AVG(r.value_num) AS avg_num,
           r.value_text AS value_text
    FROM responses r
    ${groupJoin}
    ${filterJoin}
    WHERE r.question_id = ?
    ${pathwayWhere}
    ${filterWhere}
    GROUP BY bucket, r.value_text
    ORDER BY bucket, n DESC
  `;
  const { results } = await env.DB.prepare(sql).bind(...bindings).all();
  const byBucket = {};
  for (const row of results) {
    const key = row.bucket ?? "unknown";
    if (!byBucket[key]) byBucket[key] = { n: 0, sum_num: 0, count_num: 0, distribution: [] };
    byBucket[key].n += row.n;
    if (row.avg_num !== null) {
      byBucket[key].sum_num += row.avg_num * row.n;
      byBucket[key].count_num += row.n;
    }
    if (row.value_text) byBucket[key].distribution.push({ label: row.value_text, n: row.n });
  }
  const out = {};
  for (const [k, v] of Object.entries(byBucket)) {
    out[k] = {
      n: v.n,
      avg: v.count_num > 0 ? v.sum_num / v.count_num : null,
      distribution: v.distribution
    };
  }
  return json({
    question: questionId, by, filters,
    results: out, updated_at: new Date().toISOString()
  });
}

// ─── UPDATED: now supports `filter` param for cohort-filtered distributions ───
async function handleResponseDistribution(env, url) {
  const questionId = url.searchParams.get("q");
  const pathways = url.searchParams.getAll("pathway");
  const filters = url.searchParams.getAll("filter");

  if (!questionId) return errorJson("Missing required parameter: q", 400);

  const bindings = [questionId];
  let pathwayWhere = "";
  if (pathways.length > 0) {
    if (pathways.length === 1) {
      pathwayWhere = " AND resp.pathway = ?";
      bindings.push(pathways[0]);
    } else {
      const placeholders = pathways.map(() => "?").join(",");
      pathwayWhere = ` AND resp.pathway IN (${placeholders})`;
      bindings.push(...pathways);
    }
  }

  const filterData = buildFilterWhere(filters);
  const filterWhere = filterData.filterWhere;
  bindings.push(...filterData.bindings);

  let filterJoin = "";
  if (filterData.needsReligion) filterJoin += " LEFT JOIN religion rg ON rg.respondent_id = r.respondent_id";
  if (filterData.needsDemographics) filterJoin += " LEFT JOIN demographics d ON d.respondent_id = r.respondent_id";

  const sql = `
    SELECT r.value_text AS label, COUNT(*) AS n
    FROM responses r
    JOIN respondents resp ON resp.id = r.respondent_id
    ${filterJoin}
    WHERE r.question_id = ?
    ${pathwayWhere}
    ${filterWhere}
    AND r.value_text IS NOT NULL
    GROUP BY r.value_text
    ORDER BY n DESC
  `;
  const { results } = await env.DB.prepare(sql).bind(...bindings).all();
  const total = results.reduce((s, r) => s + r.n, 0);
  const distribution = results.map((r) => ({
    label: r.label, n: r.n,
    pct: total > 0 ? (r.n / total) * 100 : 0,
  }));
  return json({
    question: questionId,
    pathway: pathways.length > 0 ? pathways.join(",") : "all",
    filters,
    n: total,
    distribution
  });
}

async function handleNarratives(env, url) {
  const questionId = url.searchParams.get("q");
  const pathways = url.searchParams.getAll("pathway");
  const filters = url.searchParams.getAll("filter");
  if (!questionId) return errorJson("Missing required parameter: q", 400);

  const bindings = [questionId];
  let pathwayWhere = "";
  if (pathways.length > 0) {
    if (pathways.length === 1) {
      pathwayWhere = " AND resp.pathway = ?";
      bindings.push(pathways[0]);
    } else {
      const placeholders = pathways.map(() => "?").join(",");
      pathwayWhere = ` AND resp.pathway IN (${placeholders})`;
      bindings.push(...pathways);
    }
  }

  const filterData = buildFilterWhere(filters);
  const filterWhere = filterData.filterWhere;
  bindings.push(...filterData.bindings);

  let filterJoin = " LEFT JOIN demographics d ON d.respondent_id = r.respondent_id";
  if (filterData.needsReligion) filterJoin += " LEFT JOIN religion rg ON rg.respondent_id = r.respondent_id";

  const sql = `
    SELECT r.value_text AS text, resp.pathway, d.generation, d.age_bracket, 
           d.country_born, d.country_now, d.us_state_born, d.us_state_now,
           d.canada_province_born, d.canada_province_now
    FROM responses r
    JOIN respondents resp ON resp.id = r.respondent_id
    ${filterJoin}
    WHERE r.question_id = ?
    ${pathwayWhere}
    ${filterWhere}
    AND r.value_text IS NOT NULL
  `;
  const { results } = await env.DB.prepare(sql).bind(...bindings).all();
  return json({
    question: questionId,
    filters,
    n: results.length,
    narratives: results
  });
}

async function handleGeo(env, url) {
  const level = url.searchParams.get("level") || "country";
  const by = url.searchParams.get("by");
  const usingBorn = url.searchParams.get("when") !== "now";
  const colMap = {
    country: usingBorn ? "country_born" : "country_now",
    us_state: usingBorn ? "us_state_born" : "us_state_now",
    canada_province: usingBorn ? "canada_province_born" : "canada_province_now"
  };
  const col = colMap[level];
  if (!col) return errorJson(`Unknown level: ${level}`, 400);

  let sql;
  if (by === "pathway") {
    sql = `
      SELECT d.${col} AS location, resp.pathway AS pathway, COUNT(*) AS n
      FROM demographics d
      JOIN respondents resp ON resp.id = d.respondent_id
      WHERE d.${col} IS NOT NULL AND d.${col} != ''
      GROUP BY d.${col}, resp.pathway
      ORDER BY d.${col}, n DESC
    `;
  } else {
    sql = `
      SELECT d.${col} AS location, COUNT(*) AS n
      FROM demographics d
      WHERE d.${col} IS NOT NULL AND d.${col} != ''
      GROUP BY d.${col} ORDER BY n DESC
    `;
  }
  const { results } = await env.DB.prepare(sql).all();
  if (by === "pathway") {
    const byLoc = {};
    for (const row of results) {
      if (!byLoc[row.location]) byLoc[row.location] = { location: row.location, n: 0, by_pathway: {} };
      byLoc[row.location].n += row.n;
      byLoc[row.location].by_pathway[row.pathway || "unclassified"] = row.n;
    }
    return json({
      level, when: usingBorn ? "born" : "now", by,
      locations: Object.values(byLoc).sort((a, b) => b.n - a.n)
    });
  }
  return json({ level, when: usingBorn ? "born" : "now", locations: results });
}

function tryParseJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function parseFilter(filter) {
  const match = filter.match(/^([a-z_]+)\.([a-z_]+)=(.+)$/);
  if (!match) return null;
  const [, table, column, value] = match;
  const allowed = {
    demographics: [
      "country_born", "country_now", "us_state_born", "us_state_now",
      "race_ethnicity", "age_bracket", "generation", "education",
      "family_upbringing", "socioeconomic", "politics", "sexuality",
      "gender", "sex_assigned"
    ],
    religion: [
      "upbringing_significance", "primary_tradition", "cultural_background",
      "christian_denomination", "jewish_denomination", "islamic_madhhab"
    ]
  };
  if (!allowed[table] || !allowed[table].includes(column)) return null;
  return { table, column, value: decodeURIComponent(value) };
}

function buildFilterWhere(filters) {
  let needsReligion = false;
  let needsDemographics = false;
  const filterMap = {}; 
  
  for (const filter of filters) {
    const parsed = parseFilter(filter);
    if (parsed) {
      const key = `${parsed.table}.${parsed.column}`;
      if (!filterMap[key]) filterMap[key] = { table: parsed.table, col: parsed.column, values: [] };
      filterMap[key].values.push(parsed.value);
      if (parsed.table === "religion") needsReligion = true;
      if (parsed.table === "demographics") needsDemographics = true;
    }
  }

  let filterWhere = "";
  const bindings = [];
  
  for (const group of Object.values(filterMap)) {
    const alias = group.table === "religion" ? "rg" : "d";
    if (group.values.length === 1) {
      filterWhere += ` AND ${alias}.${group.col} = ?`;
      bindings.push(group.values[0]);
    } else {
      const placeholders = group.values.map(() => "?").join(",");
      filterWhere += ` AND ${alias}.${group.col} IN (${placeholders})`;
      bindings.push(...group.values);
    }
  }
  
  return { filterWhere, bindings, needsReligion, needsDemographics };
}

// ─── AI DATA COPILOT ENDPOINTS ───

async function handleEmbedBatch(env, url) {
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // Fetch responses
  const { results: rResults } = await env.DB.prepare(`
    SELECT r.respondent_id, r.question_id, r.value_text, resp.pathway,
           d.generation
    FROM responses r
    JOIN respondents resp ON resp.id = r.respondent_id
    LEFT JOIN demographics d ON d.respondent_id = r.respondent_id
    WHERE r.question_id IN (SELECT id FROM questions WHERE type = 'open_text')
    AND r.value_text IS NOT NULL AND r.value_text != '' AND r.value_text != '-'
    ORDER BY r.respondent_id, r.question_id
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  if (rResults.length === 0) {
    return json({ done: true, message: "No more records to embed." });
  }

  // 3. Prepare texts for embedding
  const texts = rResults.map(r => r.value_text);
  
  // 4. Generate embeddings using BGE-Small (384 dimensions)
  const aiResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: texts });
  
  // 5. Upsert to Vectorize
  const vectors = aiResponse.data.map((embedding, i) => {
    const r = rResults[i];
    return {
      id: `${r.respondent_id}_${r.question_id}`,
      values: embedding,
      metadata: {
        question_id: r.question_id,
        pathway: r.pathway || "unknown",
        generation: r.generation || "unknown",
        text: r.value_text.substring(0, 5000) // truncate just in case to fit metadata limits
      }
    };
  });

  await env.VECTORIZE.upsert(vectors);

  return json({
    success: true,
    processed: vectors.length,
    next_offset: offset + limit
  });
}

async function handleCopilotQuery(env, request, url) {
  try {
    const { query } = await request.json();
    if (!query) return errorJson("Missing query", 400);

    // Step 1: Detect Intent
    const intentPrompt = `Analyze the user query about a survey dataset.
Is the user asking for qualitative stories/feelings/quotes, or quantitative data/correlations/percentages?
Reply with ONLY valid JSON in this format: {"intent": "qualitative" | "quantitative"}
User Query: "${query}"`;

    const rawIntentResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: "user", content: intentPrompt }],
      max_tokens: 100
    });

    let intent = "qualitative";
    try {
      // Find JSON block in the response
      const jsonMatch = rawIntentResponse.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.intent === "quantitative") intent = "quantitative";
      }
    } catch (e) {
      console.error("Failed to parse intent:", e);
    }

    // ── QUANTITATIVE FLOW ──
    if (intent === "quantitative") {
      // 1. Fetch all quantitative questions
      const { results: questions } = await env.DB.prepare("SELECT id, prompt FROM questions WHERE type != 'open_text'").all();
      
      const qListStr = questions.map(q => `ID: ${q.id} | Prompt: ${q.prompt}`).join("\n");
      
      // 2. Ask Llama to pick the two best questions
      const pickPrompt = `You have access to a dataset with the following questions:
${qListStr}

The user asked: "${query}"

Which TWO question IDs should be cross-tabulated to answer this?
Reply with ONLY valid JSON in this format: {"q1": "question_id_1", "q2": "question_id_2"}
If only one question is needed, make q2 null.`;

      const rawPickResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: "user", content: pickPrompt }],
        max_tokens: 150
      });

      let q1 = null, q2 = null;
      try {
        const jsonMatch = rawPickResponse.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          q1 = parsed.q1;
          q2 = parsed.q2;
        }
      } catch (e) {
        console.error("Failed to parse question picks:", e);
      }

      if (!q1) {
        return json({ answer: "I couldn't identify the right quantitative metrics for that question. Try rephrasing?", quotes: [] });
      }

      // 3. Execute Cross-Tabulation
      let sql, bindings, dataStr;
      
      if (q2) {
        // Bivariate Cross-Tabulation
        sql = `
          SELECT r2.value_text AS bucket,
                 COUNT(*) AS n,
                 r1.value_text AS value_text
          FROM responses r1
          JOIN responses r2 ON r2.respondent_id = r1.respondent_id AND r2.question_id = ?
          WHERE r1.question_id = ?
          GROUP BY bucket, r1.value_text
        `;
        bindings = [q2, q1];
      } else {
        // Univariate
        sql = `
          SELECT r.value_text AS value_text, COUNT(*) AS n
          FROM responses r
          WHERE r.question_id = ?
          GROUP BY r.value_text
        `;
        bindings = [q1];
      }

      const { results: aggResults } = await env.DB.prepare(sql).bind(...bindings).all();
      
      if (!aggResults || aggResults.length === 0) {
        return json({ answer: "I couldn't find enough data for that correlation.", quotes: [] });
      }

      const synthPrompt = `You are a data scientist analyzing the "CircumSurvey" (The Accidental Intactivist's Inquiry).
Project Context: This survey explores perspectives on circumcision from a secular humanist framework that values bodily autonomy as a fundamental human right. It investigates the hypothesis that routine infant circumcision negatively impacts lifelong well-being.
The user asked: "${query}"

Here is the raw SQL aggregate data for their query (Variables: ${q1} ${q2 ? `cross-tabulated with ${q2}` : ''}):
${dataStr}

Write a concise, analytical answer interpreting this data. Mention specific percentages or counts to support your points. 
After presenting the objective data, draw 1-2 analytical conclusions about what this means for the broader societal context. Finally, provide 2-3 Suggested User Actions (SUAs) for advocates, educators, or policymakers based on these findings. Ensure your SUAs align with the project's focus on bodily autonomy and human rights. Format the SUAs clearly.`;

      const chatResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: "system", content: "You are a strategic and analytical data scientist." },
          { role: "user", content: synthPrompt }
        ],
        max_tokens: 1024
      });

      return json({
        answer: chatResponse.response,
        quotes: [],
        metadata: { intent, q1, q2, rawData: aggResults }
      });
    }

    // ── QUALITATIVE FLOW ──
    const aiResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: [query] });
    const queryVector = aiResponse.data[0];

    const matches = await env.VECTORIZE.query(queryVector, { topK: 15, returnMetadata: true });
    
    if (!matches || matches.matches.length === 0) {
      return json({ answer: "I couldn't find any relevant responses in the survey data.", quotes: [] });
    }

    const quotes = matches.matches.map(m => {
      const meta = m.metadata || {};
      return {
        text: meta.text,
        pathway: meta.pathway,
        generation: meta.generation,
        question_id: meta.question_id,
        score: m.score
      };
    });

    const contextStr = quotes.map((q, i) => `[Quote ${i+1}] (Pathway: ${q.pathway}, Gen: ${q.generation}): "${q.text}"`).join("\n\n");

    const prompt = `You are a research assistant analyzing a qualitative dataset from "The Accidental Intactivist's Inquiry".
Project Context: This survey explores perspectives on circumcision from a secular humanist framework that values bodily autonomy as a fundamental human right. It investigates the hypothesis that routine infant circumcision negatively impacts lifelong well-being. If respondents complain about "bias", understand that the survey transparently operates from this ethical framework.
The user is asking a question about the data.
Based ONLY on the following quotes from survey respondents, synthesize a thoughtful and objective answer.
You MUST use bracketed citations like [Quote 1], [Quote 3] when referencing specific perspectives or quotes.
Do not invent information. If the answer is not in the quotes, say so. 
After summarizing the quotes, draw 1-2 analytical conclusions about the underlying emotional or social themes. Finally, provide 2-3 Suggested User Actions (SUAs) for advocates, educators, or policymakers based on these insights. Ensure your SUAs align with the project's focus on bodily autonomy, education, and human rights. Format the SUAs clearly. Keep your total answer to 3-4 paragraphs.

User Question: ${query}

Survey Quotes:
${contextStr}`;

    const chatResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: "system", content: "You are a strategic and analytical qualitative research assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024
    });

    return json({
      answer: chatResponse.response,
      quotes: quotes,
      metadata: { intent }
    });
  } catch (err) {
    console.error("Copilot Error:", err);
    return errorJson(err.message, 500);
  }
}
