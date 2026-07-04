// ═══════════════════════════════════════════════════════════════════════════
// copilotLib.js — pure, dependency-free logic for the AI Docent.
//
// Everything here is deterministic and unit-tested (see worker/test/copilot.test.js).
// The Worker (index.js) imports these so the tested code IS the production code.
// ═══════════════════════════════════════════════════════════════════════════

// ── Intent classification ────────────────────────────────────────────────────
export function parseIntent(rawText) {
  try {
    const m = String(rawText || "").match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      if (parsed.intent === "quantitative") return "quantitative";
    }
  } catch {
    /* fall through to default */
  }
  return "qualitative";
}

// ── Tool-call parsing ────────────────────────────────────────────────────────
export function parseToolCall(rawText) {
  try {
    const m = String(rawText || "").match(/\{[\s\S]*\}/);
    if (!m) return null;
    const obj = JSON.parse(m[0]);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

// ── Tool-call validation (allowlist + privacy blocklist) ─────────────────────
export function validateToolCall(toolCall, { validIds = [], excludedIds = [] } = {}) {
  if (!toolCall || !toolCall.tool) return { ok: false, reason: "no_tool" };
  const valid = validIds instanceof Set ? validIds : new Set(validIds);
  const excluded = excludedIds instanceof Set ? excludedIds : new Set(excludedIds);
  const refs = [toolCall.args?.questionId, toolCall.args?.q1, toolCall.args?.q2].filter(Boolean);
  if (refs.some((id) => excluded.has(id))) return { ok: false, reason: "excluded" };
  if (refs.some((id) => !valid.has(id))) return { ok: false, reason: "unknown" };
  return { ok: true };
}

// ── Suggested User Actions (SUA) ─────────────────────────────────────────────
// Each suggestion runs from an opening <SUA> to either its closing tag, the
// NEXT opening tag (lookahead so it isn't consumed), or end-of-string. This
// survives the model dropping a closing tag — a suggestion is never lost or
// merged into its neighbor. [\s\S] lets a suggestion span a line break.
const SUA_REGEX = /[<\[]S?UA[>\]]*\s*([\s\S]*?)\s*(?:[<\[]\/S?UA[>\]]*|(?=[<\[]S?UA)|$)/gi;

export function extractSuggestions(rawAnswer) {
  const out = [];
  const re = new RegExp(SUA_REGEX.source, SUA_REGEX.flags);
  let m;
  while ((m = re.exec(String(rawAnswer || ""))) !== null) {
    if (m[1] && m[1].trim()) out.push(m[1].trim());
    if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width loops
  }
  return out;
}

export function stripSuggestions(rawAnswer) {
  const re = new RegExp(SUA_REGEX.source, SUA_REGEX.flags);
  return String(rawAnswer || "")
    .replace(re, "")
    .replace(/Suggested User Actions?:?/i, "")
    .trim();
}

// ── Untrusted-content fencing (indirect prompt-injection defense) ─────────────
export function wrapUntrusted(text) {
  return `<<<BEGIN_UNTRUSTED_DATA>>>\n${String(text ?? "")}\n<<<END_UNTRUSTED_DATA>>>`;
}

// ── Source classification & labeling (survey vs about-the-survey) ────────────
export function classifySource(item) {
  return item && item.type === "static_context" ? "documentation" : "survey";
}

function cleanGeneration(gen) {
  if (!gen) return "";
  let g = String(gen).split("(born")[0].trim();
  if (g === "Boomer") g = "Baby Boomer";
  return g;
}

function titleCase(s) {
  if (!s) return "";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

export function formatSourceLabel(item) {
  const kind = classifySource(item);
  if (kind === "documentation") {
    return {
      kind,
      label: item.title || "About the Survey",
      detail: "Project documentation",
    };
  }
  const parts = [titleCase(item.pathway), cleanGeneration(item.generation)].filter(Boolean);
  return {
    kind,
    label: "Respondent voice",
    detail: parts.join(" · ") || "Survey response",
  };
}

export function decorateSources(quotes) {
  return (quotes || []).map((q) => {
    const s = formatSourceLabel(q);
    return { ...q, source_type: s.kind, source_label: s.label, source_detail: s.detail };
  });
}
