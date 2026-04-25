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
    if (request.method !== "GET") {
      return errorJson("Method not allowed", 405);
    }
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);
    if (response) return response;

    try {
      const path = url.pathname.replace(/^\/api/, "") || "/";
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
      } else if (path === "/geo") {
        response = await handleGeo(env, url);
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
  const filter = url.searchParams.get("filter");
  if (!questionId) return errorJson("Missing required parameter: q", 400);

  let filterJoin = "";
  let filterWhere = "";
  const bindings = [questionId];
  if (filter) {
    const parsed = parseFilter(filter);
    if (parsed) {
      if (parsed.table === "religion") {
        filterJoin = "LEFT JOIN religion rg ON rg.respondent_id = r.respondent_id";
        filterWhere = `AND rg.${parsed.column} = ?`;
        bindings.push(parsed.value);
      } else if (parsed.table === "demographics") {
        filterJoin = "LEFT JOIN demographics d ON d.respondent_id = r.respondent_id";
        filterWhere = `AND d.${parsed.column} = ?`;
        bindings.push(parsed.value);
      }
    }
  }

  let groupCol = "resp.pathway";
  let groupJoin = "JOIN respondents resp ON resp.id = r.respondent_id";
  if (by === "generation") {
    groupJoin += " JOIN demographics dem ON dem.respondent_id = r.respondent_id";
    groupCol = "dem.generation";
  } else if (by === "religion") {
    groupJoin += " LEFT JOIN religion rel ON rel.respondent_id = r.respondent_id";
    groupCol = "rel.primary_tradition";
  } else if (by === "country_born") {
    groupJoin += " JOIN demographics dem ON dem.respondent_id = r.respondent_id";
    groupCol = "dem.country_born";
  }

  const sql = `
    SELECT ${groupCol} AS bucket,
           COUNT(*) AS n,
           AVG(r.value_num) AS avg_num,
           r.value_text AS value_text
    FROM responses r
    ${groupJoin}
    ${filterJoin}
    WHERE r.question_id = ?
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
    question: questionId, by, filter: filter || null,
    results: out, updated_at: new Date().toISOString()
  });
}

// ─── UPDATED: now supports `filter` param for cohort-filtered distributions ───
async function handleResponseDistribution(env, url) {
  const questionId = url.searchParams.get("q");
  const pathway = url.searchParams.get("pathway");
  const filter = url.searchParams.get("filter");

  if (!questionId) return errorJson("Missing required parameter: q", 400);

  const bindings = [questionId];
  let pathwayWhere = "";
  if (pathway) {
    pathwayWhere = "AND resp.pathway = ?";
    bindings.push(pathway);
  }

  // ── NEW: cohort filter support ─────────────────────────────────────────
  let filterJoin = "";
  let filterWhere = "";
  if (filter) {
    const parsed = parseFilter(filter);
    if (parsed) {
      if (parsed.table === "religion") {
        filterJoin = "LEFT JOIN religion rg ON rg.respondent_id = r.respondent_id";
        filterWhere = `AND rg.${parsed.column} = ?`;
        bindings.push(parsed.value);
      } else if (parsed.table === "demographics") {
        filterJoin = "LEFT JOIN demographics d ON d.respondent_id = r.respondent_id";
        filterWhere = `AND d.${parsed.column} = ?`;
        bindings.push(parsed.value);
      }
    }
  }

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
    pathway: pathway || "all",
    filter: filter || null,
    n: total,
    distribution
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
