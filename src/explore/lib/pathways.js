// ═══════════════════════════════════════════════════════════════════════════
// Pathway configuration — the survey's branching architecture.
// This is the canonical source of truth for ordering, labels, and n values.
// ═══════════════════════════════════════════════════════════════════════════

import { PATH_COLORS } from "../styles/tokens";

export const PATHWAYS = {
  intact: {
    id: "intact",
    label: "Intact",
    icon: "Circle",
    color: PATH_COLORS.intact,
    n: 142,
    desc: "Never circumcised",
  },
  circumcised: {
    id: "circumcised",
    label: "Circumcised",
    icon: "Activity",
    color: PATH_COLORS.circumcised,
    n: 213,
    desc: "Circumcised as infants or later in life",
  },
  restoring: {
    id: "restoring",
    label: "Restoring",
    icon: "RefreshCw",
    color: PATH_COLORS.restoring,
    n: 109,
    desc: "Actively restoring foreskin",
  },
  observer: {
    id: "observer",
    label: "Observer",
    icon: "Eye",
    color: PATH_COLORS.observer,
    n: 37,
    desc: "Partners, parents, providers, advocates",
  },
  trans: {
    id: "trans",
    label: "Transgender",
    icon: "Sparkles",
    color: PATH_COLORS.trans_vaginoplasty, // or a generic trans color if we have one
    n: 0,
    desc: "Transgender respondents",
    waiting: true,
  },
  intersex: {
    id: "intersex",
    label: "Intersex",
    icon: "Atom",
    color: PATH_COLORS.intersex,
    n: 0,
    desc: "Intersex perspectives",
    waiting: true,
  },
  amab_anatomy: {
    id: "amab_anatomy",
    label: "Anatomy & Appearance",
    icon: "Info",
    color: PATH_COLORS.all,
    n: 0,
    desc: "Appearance, sensation, and physical experience (AMAB only)",
  },
};

export const PATHWAY_IDS = ["intact", "circumcised", "restoring", "observer", "trans", "intersex", "amab_anatomy"];

// ── Survey phase ordering ──────────────────────────────────────────────────
// The survey has three phases: Universal questions, then Pathway-specific,
// then Synthesis questions where all pathways reconvene.

export const SURVEY_PHASES = [
  {
    id: "universal",
    label: "Universal",
    icon: "FileText",
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
    icon: "Compass",
    desc: "Survey splits — each respondent answered ONE of these",
    // pathways injected at render time
  },
  {
    id: "synthesis",
    label: "Synthesis",
    icon: "Grid",
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
    icon: "Users",
    desc: "Questions every observer answered regardless of role",
    match: (q) => (q.id || "").startsWith("observe_all_") || q.id === "observe_motivation" || q.id === "observe_multi_hat_selection" || /^\[ALL\]|^What primarily motivated|Are You Wearing Any Other Hat/i.test(q.prompt || ""),
    n: 37,
  },
  {
    id: "partner",
    label: "As a Partner",
    icon: "Heart",
    desc: "Intimacy observations, cultural difference impact",
    match: (q) => (q.id || "").startsWith("observe_partner_") || /^\[PARTNER\]|as a PARTNER/i.test(q.prompt || ""),
    n: 5,
  },
  {
    id: "parent",
    label: "As a Parent / Guardian",
    icon: "Circle",
    desc: "Decision factors, info quality, emotional state, regret",
    match: (q) => (q.id || "").startsWith("observe_parent_") || /^\[PARENT\]|as a PARENT|PARENT or GUARDIAN|PARENTS\/GUARDIANS/i.test(q.prompt || ""),
    n: 7,
  },
  {
    id: "expectant",
    label: "As an Expectant Parent",
    icon: "Clock",
    desc: "Decision in progress, information gaps, cultural pressure",
    match: (q) => (q.id || "").startsWith("observe_undecided_") || /currently pregnant|expectant parent/i.test(q.prompt || ""),
    n: 1,
    rare: true,
  },
  {
    id: "woman",
    label: "Woman / AFAB",
    icon: "Eye",
    desc: "Blind spots, societal misconceptions",
    match: (q) => (q.id || "").startsWith("observe_woman_") || /^\[WOMAN\]|As a WOMAN/i.test(q.prompt || ""),
    n: 3,
  },
  {
    id: "healthcare",
    label: "As a Healthcare Provider",
    icon: "Activity",
    desc: "Counseling stance, training protocols, attitude changes",
    match: (q) => (q.id || "").startsWith("observe_healthcare_") || (q.id || "").startsWith("observe_professional_") || /^\[HEALTHCARE\]|HEALTHCARE PROVIDER|MEDICAL PROFESSIONAL|HEALTHCARE/i.test(q.prompt || ""),
    n: 2,
  },
  {
    id: "skeptic",
    label: "Skeptic / Critic",
    icon: "HelpCircle",
    desc: "Persuasion factors, weakest arguments, intactivist critique",
    match: (q) => (q.id || "").startsWith("observe_skeptic_") || /^\[SKEPTIC\]|skeptic|critic/i.test(q.prompt || ""),
    n: 4,
  },
  {
    id: "advocate",
    label: "As an Advocate / Intactivist",
    icon: "AlertTriangle",
    desc: "Tipping point, strategies, FGM parallels",
    match: (q) => (q.id || "").startsWith("observe_advocate_") || /^\[ADVOCATE\]|advocate|intactivist|tipping point|FGM/i.test(q.prompt || ""),
    n: 7,
  },
  {
    id: "curious",
    label: "Curious / Researcher",
    icon: "BookOpen",
    desc: "Shaping factors, social climate, researcher perspective",
    match: (q) => (q.id || "").startsWith("observe_curious_") || (q.id || "").startsWith("observe_student_") || /^\[CURIOUS\]|student_|curious_/i.test(q.prompt || "") || /observe_(curious|student)_/i.test(q.id || ""),
    n: 5,
  },
  {
    id: "multi",
    label: "Wearing Multiple Hats",
    icon: "Users",
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

// ── Transgender sub-pathways ───────────────────────────────────────────────
export const TRANS_SUBROLES = [
  {
    id: "vaginoplasty",
    label: "Post-Vaginoplasty",
    icon: "Sparkles",
    desc: "Trans women who have undergone vaginoplasty",
    match: (q) => q.section?.toLowerCase().includes("vaginoplasty") || /vaginoplasty/i.test(q.prompt || ""),
    n: 0,
  },
  {
    id: "phalloplasty",
    label: "Post-Phalloplasty",
    icon: "Sparkles",
    desc: "Trans men who have undergone phalloplasty",
    match: (q) => q.section?.toLowerCase().includes("phalloplasty") || /phalloplasty/i.test(q.prompt || ""),
    n: 0,
  },
];

export function transSubrolesForQuestion(q) {
  const hits = [];
  for (const r of TRANS_SUBROLES) {
    if (r.match(q)) hits.push(r.id);
  }
  return hits.length > 0 ? hits : [TRANS_SUBROLES[0].id];
}

export const CIRCUMCISED_SUBROLES = [
  {
    id: "universal",
    label: "Universal (all circumcised)",
    icon: "Users",
    desc: "Questions every circumcised respondent saw",
    match: (q) => (q.id || "").startsWith("circ_") && !q.id.startsWith("circ_parents_") && !q.id.startsWith("circ_adult_"),
    n: 213,
  },
  {
    id: "infant",
    label: "Circumcised as Infant / Parent Decision",
    icon: "Circle",
    desc: "Information quality, emotional state, and parent reasons",
    match: (q) => (q.id || "").startsWith("circ_parents_"),
    n: 191,
  },
  {
    id: "adult",
    label: "Circumcised Later in Life / Teen & Adult",
    icon: "Clock",
    desc: "Before/after satisfaction comparison, consent, and new normal",
    match: (q) => (q.id || "").startsWith("circ_adult_"),
    n: 22,
  }
];

export function circumcisedSubrolesForQuestion(q) {
  const hits = [];
  for (const r of CIRCUMCISED_SUBROLES) {
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
    // Only show pathway-specific questions for the selected pathway(s)
    if (Array.isArray(selectedPathway)) {
      return selectedPathway.includes(q.pathway);
    }
    return q.pathway === selectedPathway;
  }

  if (mode === "relevant") {
    // Universal and Synthesis always visible; pathway-specific only if matches
    if (phase === "universal" || phase === "synthesis") return true;
    if (!selectedPathway || (Array.isArray(selectedPathway) && selectedPathway.length === 0)) return false;
    if (Array.isArray(selectedPathway)) {
      return selectedPathway.includes(q.pathway);
    }
    return q.pathway === selectedPathway;
  }

  return true;
}
