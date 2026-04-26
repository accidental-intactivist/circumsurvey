// ═══════════════════════════════════════════════════════════════════════════
// Pathway configuration — the survey's branching architecture.
// This is the canonical source of truth for ordering, labels, and n values.
// ═══════════════════════════════════════════════════════════════════════════

import { PATH_COLORS } from "../styles/tokens";

export const PATHWAYS = {
  intact: {
    id: "intact",
    label: "Intact",
    emoji: "🟢",
    color: PATH_COLORS.intact,
    n: 142,
    desc: "Never circumcised",
  },
  circumcised: {
    id: "circumcised",
    label: "Circumcised",
    emoji: "🔵",
    color: PATH_COLORS.circumcised,
    n: 213,
    desc: "Circumcised, generally as infants",
  },
  restoring: {
    id: "restoring",
    label: "Restoring",
    emoji: "🟣",
    color: PATH_COLORS.restoring,
    n: 109,
    desc: "Actively restoring foreskin",
  },
  observer: {
    id: "observer",
    label: "Observer",
    emoji: "🟠",
    color: PATH_COLORS.observer,
    n: 37,
    desc: "Partners, parents, providers, advocates",
  },
  trans_vaginoplasty: {
    id: "trans_vaginoplasty",
    label: "Post-Vaginoplasty",
    emoji: "🔴",
    color: PATH_COLORS.trans_vaginoplasty,
    n: 0,
    desc: "Trans women who have undergone vaginoplasty",
    waiting: true,
  },
  trans_phalloplasty: {
    id: "trans_phalloplasty",
    label: "Post-Phalloplasty",
    emoji: "🔴",
    color: PATH_COLORS.trans_phalloplasty,
    n: 0,
    desc: "Trans men who have undergone phalloplasty",
    waiting: true,
  },
  intersex: {
    id: "intersex",
    label: "Intersex",
    emoji: "⚪",
    color: PATH_COLORS.intersex,
    n: 0,
    desc: "Intersex perspectives",
    waiting: true,
  },
};

export const PATHWAY_IDS = ["intact", "circumcised", "restoring", "observer", "trans_vaginoplasty", "trans_phalloplasty", "intersex"];

// ── Survey phase ordering ──────────────────────────────────────────────────
// The survey has three phases: Universal questions, then Pathway-specific,
// then Synthesis questions where all pathways reconvene.

export const SURVEY_PHASES = [
  {
    id: "universal",
    label: "Universal",
    emoji: "📋",
    desc: "Questions every respondent saw",
    sections: [
      { name: "Demographics", desc: "Country, age, generation, education, sexuality, gender" },
      { name: "Family", desc: "Parents, upbringing, politics, socioeconomic status" },
      { name: "Religion", desc: "Tradition, significance, denomination details" },
      { name: "Appearance", desc: "Body image" },
      { name: "Sexual Experience", desc: "Sensation, orgasm, lubrication, communication" },
      { name: "Experience", desc: "Pre-ejaculate, needs communication" },
      { name: "Pride & Regret", desc: "Overall satisfaction" },
      { name: "Pathway Routing", desc: "Circumcision state — determines branching" },
    ],
  },
  {
    id: "branches",
    label: "Pathway Branches",
    emoji: "🌿",
    desc: "Survey splits — each respondent answered ONE of these",
    // pathways injected at render time
  },
  {
    id: "synthesis",
    label: "Synthesis",
    emoji: "🔀",
    desc: "All pathways reconvene",
    sections: [
      { name: "Culture & Attitudes", desc: "Norms, stereotypes, ethics, autonomy, media" },
      { name: "Follow-up", desc: "Contact consent, final reflections" },
    ],
  },
];

// ── Observer sub-pathways ──────────────────────────────────────────────────
// The Observer pathway is further divided by role. Questions are tagged by
// prompt prefix (e.g., [PARTNER], [PARENT]) — we detect and route accordingly.
// The `match` regex is used to classify Observer questions into sub-roles.

export const OBSERVER_SUBROLES = [
  {
    id: "universal",
    label: "Universal (all observers)",
    emoji: "👥",
    desc: "Questions every observer answered regardless of role",
    match: (q) => /^\[ALL\]|^What primarily motivated|Are You Wearing Any Other Hat/i.test(q.prompt || ""),
    n: 37,
  },
  {
    id: "partner",
    label: "As a Partner",
    emoji: "🤝",
    desc: "Intimacy observations, cultural difference impact",
    match: (q) => /^\[PARTNER\]|as a PARTNER/i.test(q.prompt || ""),
    n: 5,
  },
  {
    id: "parent",
    label: "As a Parent / Guardian",
    emoji: "👶",
    desc: "Decision factors, info quality, emotional state, regret",
    match: (q) => /^\[PARENT\]|as a PARENT|PARENT or GUARDIAN|PARENTS\/GUARDIANS/i.test(q.prompt || ""),
    n: 7,
  },
  {
    id: "expectant",
    label: "As an Expectant Parent",
    emoji: "🤰",
    desc: "Decision in progress, information gaps, cultural pressure",
    match: (q) => /currently pregnant|expectant parent/i.test(q.prompt || ""),
    n: 1,
    rare: true,
  },
  {
    id: "healthcare",
    label: "As a Healthcare Provider",
    emoji: "🏥",
    desc: "Counseling stance, training protocols, attitude changes",
    match: (q) => /^\[HEALTHCARE\]|HEALTHCARE PROVIDER|MEDICAL PROFESSIONAL|HEALTHCARE/i.test(q.prompt || ""),
    n: 2,
  },
  {
    id: "advocate",
    label: "As an Advocate / Intactivist",
    emoji: "📣",
    desc: "Tipping point, strategies, FGM parallels",
    match: (q) => /^\[ADVOCATE\]|advocate|intactivist|tipping point|FGM/i.test(q.prompt || ""),
    n: 7,
  },
  {
    id: "woman",
    label: "As a Woman",
    emoji: "♀",
    desc: "Blind spots, societal misconceptions",
    match: (q) => /^\[WOMAN\]|As a WOMAN/i.test(q.prompt || ""),
    n: 3,
  },
  {
    id: "curious",
    label: "Curious / Researcher",
    emoji: "🎓",
    desc: "Shaping factors, social climate, researcher perspective",
    match: (q) => /^\[CURIOUS\]|student_|curious_/i.test(q.prompt || "") || /observe_(curious|student)_/i.test(q.id || ""),
    n: 5,
  },
  {
    id: "multi",
    label: "Wearing Multiple Hats",
    emoji: "🎭",
    desc: "Respondents who selected more than one Observer role",
    match: () => false,  // synthetic — shown as meta-callout
    n: 16,
    multi: true,
  },
];

// Classify an observer question by which sub-role it belongs to.
// Returns an array of sub-role IDs (a question may belong to multiple).
export function observerSubrolesForQuestion(q) {
  const hits = [];
  for (const r of OBSERVER_SUBROLES) {
    if (r.multi) continue;
    if (r.match(q)) hits.push(r.id);
  }
  return hits.length > 0 ? hits : ["universal"];
}

// ── Section → phase resolution ─────────────────────────────────────────────
// Given a question, return which phase it belongs to (universal/branches/synthesis)

export function phaseForQuestion(q) {
  if (q.pathway === "all") {
    const section = (q.section || "").toLowerCase();
    if (section.includes("culture") || section.includes("follow")) return "synthesis";
    return "universal";
  }
  return "branches";
}

// Relevance filter: given selected pathway + mode, decide if question is visible
// modes: "mine" | "relevant" | "all"
export function isQuestionRelevant(q, selectedPathway, mode) {
  if (mode === "all") return true;

  const phase = phaseForQuestion(q);

  if (mode === "mine") {
    // Only show pathway-specific questions for the selected pathway
    return q.pathway === selectedPathway;
  }

  if (mode === "relevant") {
    // Universal and Synthesis always visible; pathway-specific only if matches
    if (phase === "universal" || phase === "synthesis") return true;
    if (!selectedPathway) return false;  // when no pathway selected, hide all branches
    return q.pathway === selectedPathway;
  }

  return true;
}
