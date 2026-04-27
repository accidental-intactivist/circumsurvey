// ═══════════════════════════════════════════════════════════════════════════
// API client for the CircumSurvey Worker (findings.circumsurvey.online/api/*)
// Includes in-memory caching + cohort-filter-aware parameter serialization.
// ═══════════════════════════════════════════════════════════════════════════

import { API_BASE } from "../styles/tokens";

// ── Simple in-memory cache with 5-minute TTL ──────────────────────────────
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

async function fetchJson(url) {
  const key = url;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.ts < TTL_MS) {
    return cached.data;
  }
  const r = await fetch(url);
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`API ${r.status}: ${text.slice(0, 200)}`);
  }
  const data = await r.json();
  cache.set(key, { ts: now, data });
  return data;
}

// ── Cohort filter serialization ────────────────────────────────────────────
// Cohort is an object like: { generation: "Millennial/Gen Y (born 1981-1996)", country_born: "USA" }
// We convert to the Worker's `filter=table.column=value` format, picking the FIRST
// non-null filter (Worker currently supports one filter at a time — multi-filter
// requires a Worker upgrade, scheduled for v8.2).

export function cohortToFilterParams(cohort) {
  if (!cohort) return [];
  const entries = Object.entries(cohort).filter(([k, v]) => k !== "pathway" && v !== null && v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0));
  if (entries.length === 0) return [];
  
  const demoCols = ["country_born", "country_now", "us_state_born", "us_state_now",
    "race_ethnicity", "age_bracket", "generation", "education",
    "family_upbringing", "socioeconomic", "politics", "sexuality", "gender", "sex_assigned"];
  const religionCols = ["upbringing_significance", "primary_tradition", "cultural_background",
    "christian_denomination", "jewish_denomination", "islamic_madhhab"];
    
  const filters = [];
  for (const [col, val] of entries) {
    const table = religionCols.includes(col) ? "religion" : demoCols.includes(col) ? "demographics" : null;
    if (!table) continue;
    
    // Support multi-select arrays or single strings
    const values = Array.isArray(val) ? val : [val];
    for (const v of values) {
      filters.push(`${table}.${col}=${encodeURIComponent(v)}`);
    }
  }
  return filters;
}

// ── Public API methods ─────────────────────────────────────────────────────

export async function getHealth() {
  return fetchJson(`${API_BASE}/health`);
}

export async function getCount() {
  return fetchJson(`${API_BASE}/count`);
}

export async function getQuestions({ counts = true, pathway = null, tier = null, section = null } = {}) {
  const params = new URLSearchParams();
  if (counts) params.set("counts", "1");
  if (pathway) params.set("pathway", pathway);
  if (tier) params.set("tier", tier);
  if (section) params.set("section", section);
  const data = await fetchJson(`${API_BASE}/questions?${params.toString()}`);
  
  if (data && data.questions) {
    data.questions.forEach(q => {
      if (q.section === "Uncategorized" || !q.section) {
        if (q.col_idx >= 346 && q.col_idx <= 355) {
          q.section = "Gender-Affirming Surgery (Transmasculine / Transfeminine)";
        } else if (q.col_idx >= 357 && q.col_idx <= 359) {
          q.section = "Intersex Experience";
        } else if (q.id.startsWith("observe_parent_") || q.id.startsWith("observe_undecided_")) {
          q.section = "Parents & Guardians";
        } else if (q.id.startsWith("observe_partner_") || ["q255", "q269", "q272", "q302"].includes(q.id)) {
          q.section = "Partners & Intimacy";
        } else if (q.id.startsWith("observe_student_") || q.id.startsWith("observe_curious_")) {
          q.section = "Researchers & Students";
        } else if (q.id.startsWith("observe_skeptic_")) {
          q.section = "Skeptics & Critics";
        } else if (q.id.startsWith("observe_healthcare_") || q.id.startsWith("observe_professional_")) {
          q.section = "Medical Professionals";
        } else if (q.id.startsWith("observe_advocate_") || q.id === "q262") {
          q.section = "Advocates & Ethicists";
        } else if (q.pathway === "observer") {
          q.section = "Universal Observer";
        }
      }
    });
  }
  return data;
}

export async function getResponseDistribution(questionId, { pathway = null, cohort = null } = {}) {
  const params = new URLSearchParams();
  params.set("q", questionId);
  
  let pathways = pathway ? (Array.isArray(pathway) ? pathway : [pathway]) : [];
  if (pathways.length === 0 && cohort && cohort.pathway) {
    pathways = Array.isArray(cohort.pathway) ? cohort.pathway : [cohort.pathway];
  }
  for (const p of pathways) {
    params.append("pathway", p);
  }
  
  const filters = cohortToFilterParams(cohort);
  for (const f of filters) {
    params.append("filter", f);
  }
  return fetchJson(`${API_BASE}/response-distribution?${params.toString()}`);
}

export async function getNarratives(questionId, { pathway = null, cohort = null } = {}) {
  const params = new URLSearchParams();
  params.set("q", questionId);
  
  let pathways = pathway ? (Array.isArray(pathway) ? pathway : [pathway]) : [];
  if (pathways.length === 0 && cohort && cohort.pathway) {
    pathways = Array.isArray(cohort.pathway) ? cohort.pathway : [cohort.pathway];
  }
  for (const p of pathways) {
    params.append("pathway", p);
  }
  
  const filters = cohortToFilterParams(cohort);
  for (const f of filters) {
    params.append("filter", f);
  }
  return fetchJson(`${API_BASE}/narratives?${params.toString()}`);
}

export async function getAggregate(questionId, { by = "pathway", cohort = null } = {}) {
  const params = new URLSearchParams();
  params.set("q", questionId);
  params.set("by", by);
  
  let pathways = [];
  if (cohort && cohort.pathway) {
    pathways = Array.isArray(cohort.pathway) ? cohort.pathway : [cohort.pathway];
  }
  for (const p of pathways) {
    params.append("pathway", p);
  }
  
  const filters = cohortToFilterParams(cohort);
  for (const f of filters) {
    params.append("filter", f);
  }
  return fetchJson(`${API_BASE}/aggregate?${params.toString()}`);
}

export async function getSections(pathway = null) {
  const params = new URLSearchParams();
  if (pathway) params.set("pathway", pathway);
  return fetchJson(`${API_BASE}/sections?${params.toString()}`);
}

export async function queryCopilot(queryText) {
  const r = await fetch(`${API_BASE}/ai/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText }),
  });
  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${r.status}`);
  }
  return await r.json();
}

export function clearCache() {
  cache.clear();
}
