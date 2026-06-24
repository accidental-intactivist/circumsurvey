// ═══════════════════════════════════════════════════════════════════════════
// ByTheNumbersPage.jsx — "By the Numbers: Which Factors Matter?"
// An interactive factor-analysis explorer. Four sections:
//   1. Factor Finder — animated bubble cluster sized by n, colored by outcome
//   2. How Many Are Like Me? — persona builder with live delta comparisons
//   3. Test Your Assumptions — dynamic quiz against the data
//   4. Factor Grid — heatmap of which demographics predict which outcomes
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback, Fragment } from "react";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { getAggregate, getResponseDistribution, getCount } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import ExhibitHero from "../components/ExhibitHero";
import { useTooltip, Tooltip } from "../components/Tooltip";
import IconifyEmoji from "../components/IconifyEmoji";
import HarveyBall from "../components/HarveyBall";
import * as Icons from "../components/Icons";

// ── Dimensions & Outcomes ──────────────────────────────────────────────────

const ANALYSIS_DIMENSIONS = [
  { id: "generation", label: "Generation", column: "generation" },
  { id: "country_born", label: "Country of Birth", column: "country_born" },
  { id: "education", label: "Education", column: "education" },
  { id: "politics", label: "Political Leaning", column: "politics" },
  { id: "primary_tradition", label: "Religion", column: "primary_tradition" },
  { id: "socioeconomic", label: "Socioeconomic Status", column: "socioeconomic" },
  { id: "sexuality", label: "Sexuality", column: "sexuality" },
  { id: "family_upbringing", label: "Family Upbringing", column: "family_upbringing" },
];

const OUTCOME_METRICS = [
  { id: "pride", label: "General Pride & Satisfaction", qid: "exp_pride_satisfaction_rating", extractor: "pride", color: C.goldBright, unit: "%" },
  { id: "keep_intact", label: "Would Keep Son Intact", qid: "final_child_decision_reason", extractor: "keep_intact", color: C.green, unit: "%" },
  { id: "bodily_autonomy", label: "Prioritizes Bodily Autonomy", qid: "final_core_principle_choice", extractor: "bodily_autonomy", color: C.purple, unit: "%" },
  { id: "intact_aesthetic", label: "Prefers Intact Aesthetic", qid: "final_aesthetic_preference", extractor: "intact_aesthetic", color: C.ltBlue, unit: "%" },
  { id: "resentment", label: "Strong Resentment", qid: "circ_regret_feeling", extractor: "strong_resentment", color: C.red, unit: "%" },
  { id: "dissatisfaction", label: "Strong Dissatisfaction", qid: "exp_pride_satisfaction_rating", extractor: "dissatisfaction", color: C.orange, unit: "%" },
  { id: "healthier_belief", label: "Believes Intact Is Healthier", qid: "final_healthier_hygienic_belief", extractor: "healthier_intact", color: C.teal, unit: "%" },
  { id: "social_norm", label: "Believes Circumcision Is the Norm", qid: "final_social_norm_perception", extractor: "circ_norm", color: C.muted, unit: "%" },
  { id: "positive_appearance", label: "Positive Appearance Feeling", qid: "exp_appearance_feeling", extractor: "positive_appearance", color: C.green, unit: "%" },
  { id: "natural_state", label: "Leans Towards Natural State", qid: "culture_body_intervention_view", extractor: "natural_state", color: C.teal, unit: "%" },
  { id: "considered_restoration", label: "Considered Restoration", qid: "circ_restoration_awareness", extractor: "considered_restoration", color: C.blue, unit: "%" },
  { id: "circ_aesthetic", label: "Prefers Circumcised Aesthetic", qid: "culture_assoc_more_aesthetic", extractor: "circ_aesthetic", color: C.orange, unit: "%" },
];

// ── Extractors: pull a single % from a distribution ────────────────────────

function extractMetric(extractor, distribution) {
  if (!distribution || distribution.length === 0) return null;
  const find = (substr) => distribution.find(d => d.label && d.label.toLowerCase().includes(substr.toLowerCase()))?.n || 0;

  // Surgically filter out non-answers to ensure accurate representation
  const ignoredLabels = ["not sure", "prefer not to answer", "n/a", "no answer", "i don't know"];
  let validN = 0;
  for (const d of distribution) {
    if (d.label && !ignoredLabels.some(ig => d.label.toLowerCase().includes(ig))) {
      validN += (d.n || 0);
    }
  }
  
  if (validN === 0) return null;

  switch (extractor) {
    case "pathway_intact":
      return null;
    case "strong_resentment":
      return (find("strong and frequent") / validN) * 100;
    case "keep_intact":
      return (find("remains intact") / validN) * 100;
    case "lube_always":
      return (find("always or almost always necessary") / validN) * 100;
    case "intact_aesthetic": {
      const strong = find("strongly prefer the appearance of the intact");
      const slight = find("slightly prefer the appearance of the intact");
      return ((strong + slight) / validN) * 100;
    }
    case "pride": {
      const vp = find("very proud");
      const gp = find("generally proud");
      return ((vp + gp) / validN) * 100;
    }
    case "dissatisfaction": {
      const sd = find("somewhat dissatisfied");
      const vd = find("very dissatisfied");
      return ((sd + vd) / validN) * 100;
    }
    case "gliding": {
      const sg = find("seamless, frictionless glide");
      return (sg / validN) * 100;
    }
    case "bodily_autonomy": {
      const ba = find("bodily autonomy");
      return (ba / validN) * 100;
    }
    case "trust_medicine_decreased": {
      const sd = find("significantly decreased");
      return (sd / validN) * 100;
    }
    case "healthier_intact": {
      const sig = find("intact state (with normal hygiene) is significantly healthier");
      const slight = find("intact state (with normal hygiene) is slightly healthier");
      return ((sig + slight) / validN) * 100;
    }
    case "circ_norm": {
      const gen = find("circumcised state is generally seen as more normal");
      const over = find("circumcised state is overwhelmingly seen as the normal");
      return ((gen + over) / validN) * 100;
    }
    case "positive_appearance": {
      const pos = find("Positive");
      const vpos = find("Very Positive");
      return ((pos + vpos) / validN) * 100;
    }
    case "natural_state": {
      return (find("lean towards natural state") / validN) * 100;
    }
    case "considered_restoration": {
      const active = find("actively researching");
      const serious = find("seriously considered");
      return ((active + serious) / validN) * 100;
    }
    case "circ_aesthetic": {
      const def = find("definitely circumcised");
      const likely = find("likely circumcised");
      return ((def + likely) / validN) * 100;
    }
    default:
      return null;
  }
}

// ── Shorten labels ─────────────────────────────────────────────────────────

function shorten(label) {
  if (!label) return "";
  let s = label;
  s = s.replace(/\s*\([^)]*\)\s*$/, "");
  s = s.replace("Millennial/Gen Y", "Millennial");
  s = s.replace("Xennial/Oregon Trail", "Xennial");
  s = s.replace("United States of America (USA)", "USA");
  s = s.replace("United States of America", "USA");
  s = s.replace("United Kingdom", "UK");
  s = s.replace("Atheist / Agnostic / Secular", "Secular");
  s = s.replace("Secular / Atheist / Agnostic", "Secular");
  s = s.replace("No significant religious/spiritual/cultural tradition influencing this topic.", "Secular");
  s = s.replace("Spiritual but not religious", "Spiritual");
  s = s.replace("New Age / Spiritual but not religious", "New Age");
  s = s.replace("Very Liberal / Progressive / Left-Leaning", "V. Liberal");
  s = s.replace("Very Conservative / Right-Leaning", "V. Conservative");
  s = s.replace("Liberal / Progressive", "Liberal");
  s = s.replace("Moderate / Centrist", "Moderate");
  s = s.replace("Apolitical / Not focused on politics", "Apolitical");
  s = s.replace("Prefer not to say / Unsure", "Undisclosed");
  s = s.replace("Straight/Heterosexual", "Straight");
  s = s.replace(/^I was raised by one or both.*$/, "Biological Parents");
  s = s.replace(/^I was adopted as an infant.*$/, "Adopted (Infant)");
  s = s.replace(/^I was adopted as a child.*$/, "Adopted (Child)");
  s = s.replace(/^I was raised primarily.*$/, "Other Structure");
  s = s.replace("Prefer not to say.", "Undisclosed");
  // Shorten education
  s = s.replace("Less than high school diploma or equivalent", "< High School");
  s = s.replace("High school diploma or GED", "High School");
  s = s.replace("Trade School Certificate / Pre-Apprenticeship Program", "Trade School");
  s = s.replace("Journeyman Certification / Licensed Tradesperson", "Journeyman");
  s = s.replace("Some college / Associate's degree", "Some College");
  s = s.replace("Bachelor's degree", "Bachelor's");
  s = s.replace("Master's degree", "Master's");
  s = s.replace("Professional degree", "Prof. Degree");
  s = s.replace("Doctoral degree", "Doctorate");
  // Shorten SES
  s = s.replace(/^Upper income.*$/, "Upper Income");
  s = s.replace(/^Upper-middle income.*$/, "Upper-Middle");
  s = s.replace(/^Middle income.*$/, "Middle");
  s = s.replace(/^Working class.*$/, "Working Class");
  s = s.replace(/^Lower income.*$/, "Lower Income");

  if (s.length > 22) s = s.slice(0, 20) + "…";
  return s;
}

// ── Harvey Ball scale: map percentage to 1–5 ──────────────────────────────
function percentToHarveyScore(pct) {
  if (pct == null) return 1;
  if (pct <= 20) return 1;
  if (pct <= 40) return 2;
  if (pct <= 60) return 3;
  if (pct <= 80) return 4;
  return 5;
}

// Map a delta/range value (0–50pp) to Harvey Ball 1–5
function rangeToHarveyScore(range) {
  if (range == null) return 1;
  if (range <= 8) return 1;
  if (range <= 18) return 2;
  if (range <= 28) return 3;
  if (range <= 40) return 4;
  return 5;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function SectionHeader({ number, title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        marginBottom: "0.6rem",
      }}>
        <span style={{
          fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
        }}>
          <IconifyEmoji emoji={icon} size="0.9rem" style={{marginRight: "0.2rem", transform: "translateY(-1px)"}} /> {number}
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT.display, fontSize: "2rem", fontWeight: 700,
        color: C.textBright, margin: 0, lineHeight: 1.2, letterSpacing: "-0.015em",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontFamily: FONT.body, fontSize: "1rem", color: C.muted,
          lineHeight: 1.5, marginTop: "0.6rem", marginBottom: 0,
          maxWidth: 700, fontWeight: 300,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: FACTOR FINDER — Bubble Cluster
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 0: SNAPSHOT WALL — Striking standalone statistics
// ═══════════════════════════════════════════════════════════════════════════

const SNAPSHOT_DEFINITIONS = [
  {
    id: "respondents", label: "Total Respondents", big: true, span: 2, color: C.goldBright,
    fetch: () => getCount().then(d => ({ value: d.total, note: `${d.by_pathway?.circumcised || 0} circumcised · ${d.by_pathway?.intact || 0} intact · ${d.by_pathway?.restoring || 0} restoring · ${d.by_pathway?.observer || 0} observing` })),
  },
  {
    id: "resentment_circ", qid: "circ_regret_feeling", label: "of circumcised men report strong, frequent resentment or grief about their circumcision", span: 2, color: C.red, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "resentment_restoring", qid: "circ_regret_feeling", label: "of restoring men report strong, frequent resentment — the highest of any group", span: 2, color: C.red, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "restoring" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "keep_intact_restoring", qid: "final_child_decision_reason", label: "of restoring men say they would keep a future son intact — a near-unanimous consensus", span: 1, color: C.green, attribution: "Q: Hypothetical Decision for a Son",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "restoring" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "—", n: d.n };
    }),
  },
  {
    id: "keep_intact_circ", qid: "final_child_decision_reason", label: "of circumcised men would keep a future son intact", span: 1, color: C.green, attribution: "Q: Hypothetical Decision for a Son",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "circumcised" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "—", n: d.n };
    }),
  },
  {
    id: "lube_circ", qid: "exp_lubrication_need", label: "of circumcised men say artificial lube is always or almost always needed", span: 1, color: C.blue, attribution: "Q: Artificial Lubrication Need",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "circumcised" }).then(d => {
      const always = d.distribution?.find(x => x.label?.includes("always or almost always"));
      return { value: always ? `${always.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "lube_intact", qid: "exp_lubrication_need", label: "of intact men never find artificial lubrication necessary", span: 1, color: C.blue, attribution: "Q: Artificial Lubrication Need",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "intact" }).then(d => {
      const never = d.distribution?.find(x => x.label?.includes("Never find it necessary"));
      return { value: never ? `${never.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "sensitivity_gap", qid: "exp_sex_rating_sensitivity_light_touch", label: "avg. light-touch sensitivity: Intact vs Circumcised", span: 1, color: PATH_COLORS.intact, attribution: "Q: Light Touch Sensitivity Rating (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "aesthetic_circ", qid: "final_aesthetic_preference", label: "of circumcised men actually prefer the intact aesthetic over their own", span: 2, color: C.ltBlue, attribution: "Q: Final Aesthetic Preference",
    fetch: () => getResponseDistribution("final_aesthetic_preference", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strongly prefer the appearance of the intact"))?.n || 0;
      const slight = d.distribution?.find(x => x.label?.includes("slightly prefer the appearance of the intact"))?.n || 0;
      const pct = d.n > 0 ? ((strong + slight) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "autonomy", qid: "final_core_principle_choice", label: "prioritize the child's right to bodily autonomy over parental/medical discretion", span: 1, color: C.purple, attribution: "Q: Final Core Principle Choice",
    fetch: () => getResponseDistribution("final_core_principle_choice").then(d => {
      const auto = d.distribution?.find(x => x.label?.includes("Bodily Autonomy"));
      return { value: auto ? `${auto.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
  {
    id: "pride_intact", qid: "exp_pride_satisfaction_rating", label: "of intact men feel very proud or satisfied with their status", span: 1, color: PATH_COLORS.intact, attribution: "Q: Pride and Satisfaction",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "intact" }).then(d => {
      const vp = d.distribution?.find(x => x.label?.includes("Very proud"))?.n || 0;
      const gp = d.distribution?.find(x => x.label?.includes("Generally proud"))?.n || 0;
      const pct = d.n > 0 ? ((vp + gp) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "dissatisfied_circ", qid: "exp_pride_satisfaction_rating", label: "of circumcised men feel somewhat or very dissatisfied with their status", span: 1, color: PATH_COLORS.circumcised, attribution: "Q: Pride and Satisfaction",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "circumcised" }).then(d => {
      const sd = d.distribution?.find(x => x.label?.includes("Somewhat dissatisfied"))?.n || 0;
      const vd = d.distribution?.find(x => x.label?.includes("Very dissatisfied"))?.n || 0;
      const pct = d.n > 0 ? ((sd + vd) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "pleasure_mobile", qid: "exp_sex_rating_pleasure_mobile_skin", label: "avg. pleasure from mobile skin: Intact vs Circumcised", span: 1, color: PATH_COLORS.intact, attribution: "Q: Pleasure from Mobile Skin (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_pleasure_mobile_skin", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_pleasure_mobile_skin", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "ease_orgasm", label: "avg. ease of orgasm: Intact vs Circumcised", span: 1, color: C.teal, attribution: "Q: Ease of Reaching Orgasm (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_ease_of_orgasm", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_ease_of_orgasm", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "variety_sensation", label: "avg. variety of sensation: Intact vs Circumcised", span: 1, color: C.purple, attribution: "Q: Variety of Sensation (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_variety_of_sensation", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_variety_of_sensation", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "never_regret_circ", label: "of circumcised men say they 'never' feel regret or resentment", span: 1, color: C.muted, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "circumcised" }).then(d => {
      const never = d.distribution?.find(x => x.label?.includes("No, never"));
      return { value: never ? `${never.pct.toFixed(0)}%` : "—", n: d.n };
    }),
  },
];

function SnapshotWall({ navigate }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowSlots, setRowSlots] = useState([[], [], []]); // Array of 3 rows, each containing { id, uniqueKey, state }
  const [isHovered, setIsHovered] = useState(false);

  // Initial fetch
  useEffect(() => {
    Promise.all(
      SNAPSHOT_DEFINITIONS.map(def =>
        def.fetch()
          .then(result => ({ ...def, ...result }))
          .catch(() => ({ ...def, value: "—", note: "Error loading" }))
      )
    ).then(results => {
      setSnapshots(results);
      setLoading(false);
      // Pick initial visible set strictly by spans:
      // Row 0: [2, 1]
      // Row 1: [1, 1, 1]
      // Row 2: [1, 2]
      const stats = results.filter(s => s.id !== "respondents");
      const span1 = stats.filter(s => s.span === 1).sort(() => 0.5 - Math.random());
      const span2 = stats.filter(s => s.span === 2).sort(() => 0.5 - Math.random());
      
      setRowSlots([
        [
          { id: span2.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() }
        ],
        [
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() }
        ],
        [
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span2.pop().id, state: "idle", uniqueKey: Math.random() }
        ]
      ]);
    });
  }, []);

  // Cycle interval with sliding queue transitions per row
  useEffect(() => {
    if (loading || isHovered || snapshots.length === 0 || rowSlots[0].length === 0) return;
    
    // Check if ANY slot in ANY row is currently transitioning
    if (rowSlots.some(row => row.some(s => s.state !== "idle"))) return;

    const timer = setInterval(() => {
      // Pick a random row to update
      const targetRowIdx = Math.floor(Math.random() * 3);
      
      setRowSlots(prevRows => {
        const stats = snapshots.filter(s => s.id !== "respondents");
        // Collect all currently visible IDs across all rows
        const currentIds = prevRows.flatMap(row => row.map(s => s.id));
        const hidden = stats.filter(s => !currentIds.includes(s.id));
        if (hidden.length === 0) return prevRows; // nothing to swap
        
        const nextRows = [...prevRows];
        const targetRow = [...nextRows[targetRowIdx]];
        
        // Pick the OLDEST item in this row to leave (the last item in the array)
        const idleItems = targetRow.filter(s => s.state === "idle");
        if (idleItems.length === 0) return prevRows;
        const leavingSlot = idleItems[idleItems.length - 1];
        const leavingDef = snapshots.find(s => s.id === leavingSlot.id);
        
        // Find a hidden item with the SAME span to replace it
        const hiddenMatches = hidden.filter(s => s.span === leavingDef.span);
        if (hiddenMatches.length === 0) return prevRows; // no replacement available
        
        const inDef = hiddenMatches[Math.floor(Math.random() * hiddenMatches.length)];
        
        // Mark the leaving item as leaving
        const leaveIdx = targetRow.findIndex(s => s.uniqueKey === leavingSlot.uniqueKey);
        targetRow[leaveIdx] = { ...targetRow[leaveIdx], state: "leaving" };
        
        // Add entering item
        nextRows[targetRowIdx] = [{ id: inDef.id, state: "entering", uniqueKey: Math.random() }, ...targetRow];
        return nextRows;
      });

      // 1. Trigger the idle state for the new item so it animates in
      setTimeout(() => {
        setRowSlots(prevRows => {
          const nextRows = [...prevRows];
          nextRows[targetRowIdx] = nextRows[targetRowIdx].map((s, i) => i === 0 ? { ...s, state: "idle" } : s);
          return nextRows;
        });
      }, 50);

      // 2. Wait for the transition to finish, then remove leaving items
      setTimeout(() => {
        setRowSlots(prevRows => {
          const nextRows = [...prevRows];
          nextRows[targetRowIdx] = nextRows[targetRowIdx].filter(s => s.state !== "leaving");
          return nextRows;
        });
      }, 650);

    }, 4500);

    return () => clearInterval(timer);
  }, [loading, isHovered, snapshots, rowSlots]);

  if (loading) {
    return (
      <section id="snapshots" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
        <SectionHeader number="The Data" title="At a Glance" subtitle="Key statistics from the dataset — the numbers that define the conversation." icon="★" />
        <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
          Compiling snapshot statistics…
        </div>
      </section>
    );
  }

  const totalSnap = snapshots.find(s => s.id === "respondents");

  return (
    <section id="snapshots" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <style>{`
        .snap-row-container {
          display: flex;
          flex-wrap: nowrap;
          margin: -0.6rem -0.6rem 0.6rem -0.6rem;
          overflow: hidden;
          container-type: inline-size;
        }
        @media (min-width: 768px) {
          .snap-row-container.reverse {
            flex-direction: row-reverse;
          }
        }
        
        .snap-outer {
          transition: margin 600ms ease-in-out, border-color 600ms ease-in-out;
          overflow: hidden;
          box-sizing: border-box;
          border-radius: 10px;
          background: ${C.bgCard};
          flex-shrink: 0;
          cursor: pointer;
        }
        
        .snap-outer.span-1 { width: calc(33.333cqw - 1.2rem); margin: 0.6rem; border: 1px solid ${C.ghost}; }
        .snap-outer.span-2 { width: calc(66.666cqw - 1.2rem); margin: 0.6rem; border: 1px solid ${C.ghost}; }
        
        /* Entering state pushes it off-screen to start */
        .snap-row-container:not(.reverse) .snap-outer.entering.span-1 { margin-left: calc(-33.333cqw + 0.6rem); }
        .snap-row-container:not(.reverse) .snap-outer.entering.span-2 { margin-left: calc(-66.666cqw + 0.6rem); }
        
        .snap-row-container.reverse .snap-outer.entering.span-1 { margin-right: calc(-33.333cqw + 0.6rem); }
        .snap-row-container.reverse .snap-outer.entering.span-2 { margin-right: calc(-66.666cqw + 0.6rem); }

        .snap-inner {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          min-height: 140px;
          box-sizing: border-box;
        }
        .span-1 .snap-inner { width: calc(33.333cqw - 1.2rem); min-width: 220px; }
        .span-2 .snap-inner { width: calc(66.666cqw - 1.2rem); min-width: 440px; }
      `}</style>
      
      <SectionHeader number="The Data" title="At a Glance" subtitle="Key statistics from the dataset — the numbers that define the conversation." icon="★" />

      {/* Hero stat: total respondents */}
      {totalSnap && (
        <div style={{
          background: C.bgCard, border: `1px solid ${resolveCssColor(totalSnap.color || C.ghost)}`, borderRadius: 12,
          padding: "2rem 2.5rem", marginBottom: "1.5rem", textAlign: "center",
          boxShadow: `0 4px 20px ${resolveCssColor(totalSnap.color || C.gold).replace(')', ', 0.15)').replace('rgb', 'rgba')}`,
        }}>
          <div style={{
            fontFamily: FONT.mono, fontSize: "4.5rem", fontWeight: 800,
            color: resolveCssColor(totalSnap.color || C.goldBright), lineHeight: 1,
            textShadow: `0 0 30px ${resolveCssColor(totalSnap.color || C.gold).replace(')', ', 0.25)').replace('rgb', 'rgba')}`,
          }}>
            {totalSnap.value}
          </div>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: C.muted, marginTop: "0.5rem", fontWeight: 700,
          }}>
            {totalSnap.label}
          </div>
          {totalSnap.note && (
            <div style={{
              fontFamily: FONT.mono, fontSize: "0.68rem", color: C.dim, marginTop: "0.5rem",
            }}>
              {totalSnap.note}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Cycling Flexbox Queue Grid - 3 Rows */}
      <div 
        style={{ display: "flex", flexDirection: "column" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {rowSlots.map((row, rIdx) => (
          <div key={rIdx} className={`snap-row-container ${rIdx === 1 ? 'reverse' : ''}`}>
            {row.map((slot) => {
              const snap = snapshots.find(s => s.id === slot.id);
              if (!snap) return null;
              
              const themeColor = snap.color || C.gold;
              
              return (
                <div key={slot.uniqueKey} className={`snap-outer ${slot.state} ${snap.span === 2 ? 'span-2' : 'span-1'}`}
                  onClick={() => {
                    if (snap.qid) navigate("question", { id: snap.qid });
                  }}
                  onMouseEnter={e => {
                    if (slot.state !== "idle") return; // don't animate hover while transitioning
                    e.currentTarget.style.borderColor = resolveCssColor(themeColor);
                    e.currentTarget.style.boxShadow = `0 6px 24px ${resolveCssColor(themeColor).replace('hsl(', 'hsla(').replace('rgb(', 'rgba(').replace(')', ', 0.15)')}`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    if (slot.state !== "idle") return;
                    e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <div className="snap-inner">
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 3,
                      background: resolveCssColor(themeColor), opacity: 0.7
                    }} />
                    
                    <div style={{
                      fontFamily: FONT.mono, fontSize: "2.8rem", fontWeight: 800,
                      color: resolveCssColor(themeColor), lineHeight: 1,
                      letterSpacing: "-0.03em", whiteSpace: "nowrap"
                    }}>
                      {snap.value}
                      {snap.suffix && <span style={{ fontSize: "1rem", color: resolveCssColor(C.muted), marginLeft: "0.3rem", fontWeight: 600 }}>{snap.suffix}</span>}
                    </div>
                    <div style={{
                      fontFamily: FONT.body, fontSize: "0.85rem", color: C.text,
                      lineHeight: 1.4, marginTop: "0.8rem", flex: 1, fontWeight: 500
                    }}>
                      {snap.label}
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                      marginTop: "1.2rem", paddingTop: "0.8rem", borderTop: `1px solid ${C.ghost}`
                    }}>
                      {snap.attribution && (
                        <div style={{
                          fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.dim,
                          textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap"
                        }}>
                          {snap.attribution}
                        </div>
                      )}
                      {snap.n && (
                        <div style={{
                          fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim,
                        }}>
                          n={snap.n}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div style={{
        textAlign: "right", marginTop: "1rem", fontFamily: FONT.condensed, 
        fontSize: "0.65rem", color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase"
      }}>
        {isHovered ? "⏸ Cycling paused" : "▶ Auto-cycling statistics..."}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: ASSUMPTION QUIZ — "Test Your Assumptions"
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_TOGGLES = [
  { id: "all", label: "All Pathways" },
  { id: "circumcised", label: "Circumcised" },
  { id: "intact", label: "Intact" },
  { id: "restoring", label: "Restoring" },
];

const getRandomMetric = () => OUTCOME_METRICS[Math.floor(Math.random() * OUTCOME_METRICS.length)];

function AssumptionQuiz() {
  const [selectedPathway, setSelectedPathway] = useState(PATHWAY_TOGGLES[0]);
  const [selectedDim, setSelectedDim] = useState(ANALYSIS_DIMENSIONS[0]);
  const [selectedMetric, setSelectedMetric] = useState(() => getRandomMetric());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz state: 'guessing' | 'revealed'
  const [quizState, setQuizState] = useState("guessing");
  const [guessId, setGuessId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setQuizState("guessing");
    setGuessId(null);
    
    const params = { by: selectedDim.column };
    if (selectedPathway.id !== "all") {
      params.cohort = { pathway: selectedPathway.id };
    }
    
    getAggregate(selectedMetric.qid, params)
      .then(res => {
        setData(res.results || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDim.column, selectedMetric.qid, selectedPathway.id]);

  // Process data into two cohorts to compare
  const cohorts = useMemo(() => {
    if (!data) return [];
    
    const processed = Object.entries(data)
      .filter(([key]) => {
        if (!key || key === "null" || key === "unknown" || key === "" || key === "observer") return false;
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("not sure") || lowerKey.includes("prefer not to say") || lowerKey.includes("prefer not to answer")) return false;
        return true;
      })
      .map(([key, val]) => {
        const metric = extractMetric(selectedMetric.extractor, val.distribution);
        return {
          id: key,
          label: shorten(key),
          fullLabel: key,
          n: val.n || 0,
          metric: metric,
        };
      })
      .filter(b => b.n >= 5 && b.metric !== null) // Minimum N for validity
      .sort((a, b) => b.n - a.n); // Sort by sample size

    // We take up to 6 cohorts by sample size to avoid overwhelming the screen,
    // but shuffle them so the order isn't predictably by size.
    const top = processed.slice(0, 6);
    // Simple deterministic shuffle based on labels so it doesn't jump on re-renders unless data changes
    return top.sort((a, b) => a.label.localeCompare(b.label));
  }, [data, selectedMetric.extractor]);

  // Handle guess interaction
  const handleGuess = (id) => {
    if (quizState === "revealed") return;
    setGuessId(id);
    setQuizState("revealed");
  };

  const hasData = cohorts.length >= 2;
  const highestId = hasData ? cohorts.reduce((prev, curr) => (curr.metric > prev.metric ? curr : prev), cohorts[0]).id : null;
  const isCorrect = guessId === highestId;

  // Thematic CSS variables
  const themeColor = selectedMetric.color || C.gold;
  const neonShadow = `0 4px 20px ${resolveCssColor(themeColor).replace('hsl(', 'hsla(').replace('rgb(', 'rgba(').replace(')', ', 0.15)')}`;

  return (
    <section id="factor-finder" data-docent-context="interactive-explorer" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Section 1"
        title="Interactive Explorer"
        subtitle="How well do you know the data? Select a pathway, demographic, and an outcome, then guess which cohort scores higher. Averages exclude 'Not sure' or 'N/A' responses to ensure accuracy."
        icon="◉"
      />

      {/* Controls Container (Glassmorphic) */}
      <div style={{
        background: resolveCssColor(C.bgSoft),
        backdropFilter: "blur(12px)",
        border: `1px solid ${C.ghost}`,
        borderRadius: 12,
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>
        
        {/* Pathway Row */}
        <div>
          <label style={{
            fontFamily: FONT.condensed, fontSize: "0.75rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.text, display: "block", marginBottom: "0.6rem", fontWeight: 600
          }}>
            1. Select Pathway Filter
          </label>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {PATHWAY_TOGGLES.map(p => {
              const active = selectedPathway.id === p.id;
              const pColor = p.id === "all" ? C.gold : PATH_COLORS[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPathway(p)}
                  style={{
                    background: active ? resolveCssColor(pColor) : resolveCssColor(C.bgCard),
                    color: active ? "#111" : resolveCssColor(C.text),
                    border: `1px solid ${active ? resolveCssColor(pColor) : resolveCssColor(C.ghost)}`,
                    borderRadius: 20, padding: "0.4rem 1rem", fontFamily: FONT.condensed, fontSize: "0.85rem",
                    textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", outline: "none",
                    fontWeight: active ? 700 : 500,
                    transition: "all 0.2s ease"
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension Row */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 250px" }}>
            <label style={{
              fontFamily: FONT.condensed, fontSize: "0.75rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.text, display: "block", marginBottom: "0.6rem", fontWeight: 600
            }}>
              2. Select Demographic
            </label>
            <select
              value={selectedDim.id}
              onChange={e => setSelectedDim(ANALYSIS_DIMENSIONS.find(d => d.id === e.target.value))}
              style={{
                width: "100%", background: resolveCssColor(C.bgDeep), color: resolveCssColor(C.textBright),
                border: `1px solid ${resolveCssColor(C.ghost)}`, borderRadius: 6,
                padding: "0.6rem 0.8rem", fontFamily: FONT.condensed, fontSize: "0.9rem",
                textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", outline: "none",
              }}
            >
              {ANALYSIS_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Interactive Arena */}
      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "3rem 1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        {loading ? (
          <div style={{ color: C.muted, fontStyle: "italic", fontFamily: FONT.body }}>Querying database...</div>
        ) : !hasData ? (
          <div style={{ color: C.muted, fontStyle: "italic", fontFamily: FONT.body, maxWidth: 400, textAlign: "center" }}>
            Not enough data for this specific cross-section. Try a different pathway or demographic.
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: FONT.condensed, fontSize: "1.4rem", color: C.textBright, textAlign: "center",
              marginBottom: "3rem", textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              Which group scores {cohorts.length > 2 ? "highest" : "higher"} for <span style={{ color: resolveCssColor(themeColor) }}>{selectedMetric.label}</span>?
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${cohorts.length > 4 ? '140px' : '180px'}, 1fr))`, gap: "1rem", width: "100%", maxWidth: 800, margin: "0 auto" }}>
              {cohorts.map((cohort) => {
                const isGuessed = guessId === cohort.id;
                const isHighest = highestId === cohort.id;
                const revealed = quizState === "revealed";

                let cardBg = `linear-gradient(135deg, ${C.bgDeep}, ${C.bgCard})`;
                let borderColor = C.ghost;
                let cardTransform = "scale(1)";
                let cardOpacity = 1;
                let cardShadow = "none";
                let cardZIndex = 1;

                if (revealed) {
                  if (isHighest) {
                    borderColor = resolveCssColor(themeColor);
                    cardShadow = neonShadow;
                    cardTransform = "scale(1.05)";
                    cardZIndex = 10;
                  } else {
                    cardOpacity = 0.45;
                    cardTransform = "scale(0.97)";
                  }
                }

                return (
                  <div
                    key={cohort.id}
                    onClick={() => handleGuess(cohort.id)}
                    style={{
                      background: cardBg,
                      border: `2px solid ${typeof borderColor === "string" && borderColor.startsWith("var(") ? resolveCssColor(borderColor) : borderColor}`,
                      borderRadius: 10,
                      padding: "1.2rem 1rem",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      textAlign: "center",
                      cursor: revealed ? "default" : "pointer",
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: cardTransform,
                      opacity: cardOpacity,
                      boxShadow: cardShadow,
                      zIndex: cardZIndex,
                      position: "relative",
                      minHeight: 100,
                    }}
                    onMouseEnter={e => {
                      if (!revealed) {
                        e.currentTarget.style.borderColor = resolveCssColor(themeColor);
                        e.currentTarget.style.transform = "scale(1.04)";
                        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.3)`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!revealed) {
                        e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={{
                      fontFamily: FONT.condensed, fontSize: "0.95rem", fontWeight: 600,
                      color: C.textBright, letterSpacing: "0.04em", lineHeight: 1.3,
                    }}>
                      {cohort.label}
                    </div>
                    
                    {/* Revealed metric — slides open */}
                    <div style={{
                      maxHeight: revealed ? 80 : 0, opacity: revealed ? 1 : 0, overflow: "hidden",
                      transition: "all 0.5s ease", marginTop: revealed ? "0.6rem" : 0,
                    }}>
                      <div style={{
                        fontFamily: FONT.mono, fontSize: "2rem", fontWeight: 800,
                        color: resolveCssColor(themeColor), lineHeight: 1,
                      }}>
                        {cohort.metric.toFixed(0)}%
                      </div>
                      <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, marginTop: "0.25rem" }}>
                        n={cohort.n}
                      </div>
                    </div>

                    {/* Winner badge */}
                    {revealed && isHighest && (
                      <div style={{
                        position: "absolute", top: -8, right: -8,
                        background: resolveCssColor(themeColor), color: "#0a0a0c",
                        borderRadius: "50%", width: 24, height: 24,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.7rem",
                        boxShadow: `0 2px 8px ${resolveCssColor(themeColor).replace(')', ', 0.4)').replace('rgb(', 'rgba(').replace('hsl(', 'hsla(')}`,
                      }}>
                        ★
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Feedback */}
            <div style={{
              height: "auto", minHeight: 40, marginTop: "3rem", display: "flex", alignItems: "center", justifyContent: "center",
              opacity: quizState === "revealed" ? 1 : 0, transform: quizState === "revealed" ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.5s ease", textAlign: "center", padding: "0 1rem",
            }}>
              {quizState === "revealed" && (() => {
                const winner = cohorts.find(c => c.id === highestId);
                const guessed = cohorts.find(c => c.id === guessId);
                const sorted = [...cohorts].sort((a, b) => b.metric - a.metric);
                const runnerUp = sorted[1];
                const spread = winner && runnerUp ? (winner.metric - runnerUp.metric).toFixed(1) : "0";
                const isClose = parseFloat(spread) < 5;
                const isDominant = parseFloat(spread) > 20;
                const guessedRank = sorted.findIndex(c => c.id === guessId) + 1;

                let commentary;
                if (isCorrect) {
                  if (isClose) {
                    commentary = `Sharp eye! ${winner?.label} edges out ${runnerUp?.label} by just ${spread} percentage points — this was a genuinely close call.`;
                  } else if (isDominant) {
                    commentary = `Well spotted. ${winner?.label} leads by a commanding ${spread}pp — a clear standout in this demographic split.`;
                  } else {
                    commentary = `Nailed it. ${winner?.label} leads at ${winner?.metric.toFixed(0)}%, with a ${spread}pp gap over ${runnerUp?.label}.`;
                  }
                } else {
                  if (isClose) {
                    commentary = `Close — ${guessed?.label} (${guessed?.metric.toFixed(0)}%) was a reasonable guess, but ${winner?.label} edges ahead at ${winner?.metric.toFixed(0)}%. The spread is only ${spread}pp; this one could flip with more data.`;
                  } else if (guessedRank === 2) {
                    commentary = `Not far off. ${guessed?.label} comes in second at ${guessed?.metric.toFixed(0)}%, but ${winner?.label} takes the lead at ${winner?.metric.toFixed(0)}% — a ${spread}pp gap that might challenge expectations.`;
                  } else if (isDominant) {
                    commentary = `${winner?.label} stands out at ${winner?.metric.toFixed(0)}% — a ${spread}pp lead that signals a strong demographic pattern here. ${guessed?.label} came in at ${guessed?.metric.toFixed(0)}%.`;
                  } else {
                    commentary = `${winner?.label} leads this one at ${winner?.metric.toFixed(0)}%, with ${guessed?.label} at ${guessed?.metric.toFixed(0)}%. The ${spread}pp gap shows how ${selectedDim?.label?.toLowerCase() || "demographics"} can shape outcomes in unexpected ways.`;
                  }
                }

                return (
                  <div style={{
                    fontFamily: FONT.body, fontSize: "0.95rem",
                    color: isCorrect ? resolveCssColor(C.goldBright) : resolveCssColor(C.text),
                    fontWeight: isCorrect ? 600 : 400,
                    lineHeight: 1.5, maxWidth: 600,
                  }}>
                    {commentary}
                  </div>
                );
              })()}
            </div>

            {/* Reset Button */}
            {quizState === "revealed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuizState("guessing");
                  setGuessId(null);
                  setSelectedMetric(getRandomMetric());
                }}
                style={{
                  marginTop: "1rem", background: "transparent", border: "none", color: resolveCssColor(C.blue),
                  fontFamily: FONT.condensed, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em",
                  cursor: "pointer", textDecoration: "underline"
                }}
              >
                Try Another
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: PERSONA BUILDER — "How Many Are Like Me?"
// ═══════════════════════════════════════════════════════════════════════════

const PERSONA_OUTCOMES = [
  { id: "keep_intact", label: "Would Keep Son Intact", qid: "final_child_decision_reason", extractor: "keep_intact", icon: "🛡" },
  { id: "resentment", label: "Strong Resentment/Grief", qid: "circ_regret_feeling", extractor: "strong_resentment", icon: "💔" },
  { id: "intact_aesthetic", label: "Prefers Intact Look", qid: "final_aesthetic_preference", extractor: "intact_aesthetic", icon: "👁" },
  { id: "autonomy", label: "Prioritizes Autonomy", qid: "final_core_principle_choice", extractor: "autonomy", icon: "⚖" },
  { id: "pride", label: "Pride & Satisfaction", qid: "exp_pride_satisfaction_rating", extractor: "pride", icon: "🌟" },
  { id: "dissatisfaction", label: "Strong Dissatisfaction", qid: "exp_pride_satisfaction_rating", extractor: "dissatisfaction", icon: "📉" },
  { id: "healthier_belief", label: "Believes Intact Is Healthier", qid: "final_healthier_hygienic_belief", extractor: "healthier_intact", icon: "🩺" },
  { id: "circ_norm", label: "Believes Circ Is the Norm", qid: "final_social_norm_perception", extractor: "circ_norm", icon: "📊" },
  { id: "positive_appearance", label: "Positive Appearance Feeling", qid: "exp_appearance_feeling", extractor: "positive_appearance", icon: "😊" },
  { id: "natural_state", label: "Leans Towards Natural State", qid: "culture_body_intervention_view", extractor: "natural_state", icon: "🌿" },
  { id: "considered_restoration", label: "Considered Restoration", qid: "circ_restoration_awareness", extractor: "considered_restoration", icon: "🔄" },
  { id: "circ_aesthetic", label: "Prefers Circumcised Aesthetic", qid: "culture_assoc_more_aesthetic", extractor: "circ_aesthetic", icon: "✂" },
];

function extractPersonaMetric(extractor, distribution) {
  if (!distribution || distribution.length === 0) return null;
  const find = (substr) => distribution.find(d => d.label && d.label.toLowerCase().includes(substr.toLowerCase()))?.n || 0;
  
  const ignoredLabels = ["not sure", "prefer not to answer", "n/a", "no answer", "i don't know", "genuinely unsure"];
  let validN = 0;
  for (const d of distribution) {
    if (d.label && !ignoredLabels.some(ig => d.label.toLowerCase().includes(ig))) {
      validN += (d.n || 0);
    }
  }
  
  if (validN === 0) return null;

  switch (extractor) {
    case "keep_intact": return (find("remains intact") / validN) * 100;
    case "strong_resentment": return (find("strong and frequent") / validN) * 100;
    case "intact_aesthetic": {
      const s = find("strongly prefer the appearance of the intact");
      const sl = find("slightly prefer the appearance of the intact");
      return ((s + sl) / validN) * 100;
    }
    case "autonomy": return (find("Bodily Autonomy") / validN) * 100;
    case "pride": {
      const vp = find("very proud");
      const gp = find("generally proud");
      return ((vp + gp) / validN) * 100;
    }
    case "dissatisfaction": {
      const sd = find("somewhat dissatisfied");
      const vd = find("very dissatisfied");
      return ((sd + vd) / validN) * 100;
    }
    case "healthier_intact": {
      const sig = find("intact state (with normal hygiene) is significantly healthier");
      const slight = find("intact state (with normal hygiene) is slightly healthier");
      return ((sig + slight) / validN) * 100;
    }
    case "circ_norm": {
      const gen = find("circumcised state is generally seen as more normal");
      const over = find("circumcised state is overwhelmingly seen as the normal");
      return ((gen + over) / validN) * 100;
    }
    case "positive_appearance": {
      const pos = find("Positive");
      const vpos = find("Very Positive");
      return ((pos + vpos) / validN) * 100;
    }
    case "natural_state": {
      return (find("lean towards natural state") / validN) * 100;
    }
    case "considered_restoration": {
      const active = find("actively researching");
      const serious = find("seriously considered");
      return ((active + serious) / validN) * 100;
    }
    case "circ_aesthetic": {
      const def = find("definitely circumcised");
      const likely = find("likely circumcised");
      return ((def + likely) / validN) * 100;
    }
    default: return null;
  }
}

function PersonaBuilder() {
  const dims = DEMOGRAPHIC_DIMENSIONS.filter(d => d.id !== "pathway");
  const [selections, setSelections] = useState({});
  const [personaData, setPersonaData] = useState(null);
  const [baselineData, setBaselineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch baseline (overall) on mount
  useEffect(() => {
    Promise.all(
      PERSONA_OUTCOMES.map(o =>
        getResponseDistribution(o.qid)
          .then(d => ({ id: o.id, dist: d }))
          .catch(() => ({ id: o.id, dist: null }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.dist; });
      setBaselineData(map);
    });
  }, []);

  // Fetch persona-specific data whenever selections change
  useEffect(() => {
    const activeSelections = Object.entries(selections).filter(([, v]) => v);
    if (activeSelections.length === 0) { setPersonaData(null); return; }

    setLoading(true);
    const cohort = {};
    activeSelections.forEach(([k, v]) => { cohort[k] = v; });

    Promise.all(
      PERSONA_OUTCOMES.map(o =>
        getResponseDistribution(o.qid, { cohort })
          .then(d => ({ id: o.id, dist: d }))
          .catch(() => ({ id: o.id, dist: null }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.dist; });
      setPersonaData(map);
      setLoading(false);
    });
  }, [JSON.stringify(selections)]);

  const activeCount = Object.values(selections).filter(Boolean).length;
  const personaN = personaData ? Object.values(personaData).find(d => d && d.n)?.n || 0 : 0;

  return (
    <section id="persona-builder" data-docent-context="persona-builder" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Section 2"
        title="How Many Are Like Me?"
        subtitle="Building demographic personas to see how many share your background. See how many respondents match — and what their outcomes look like compared to the overall population."
        icon="◈"
      />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
      }}>
        {/* Left: Selectors */}
        <div style={{
          background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
          padding: "1.5rem",
        }}>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.72rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
            marginBottom: "1.2rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem",
          }}>
            Build Your Profile
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <label style={{
              fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.dim, display: "block", marginBottom: "-0.2rem",
            }}>
              Pathway
            </label>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {[{ id: "", label: "Any" }, { id: "circumcised", label: "Circumcised" }, { id: "intact", label: "Intact" }, { id: "restoring", label: "Restoring" }, { id: "observer", label: "Observer" }].map(p => {
                const active = (selections["pathway"] || "") === p.id;
                const pColor = p.id ? PATH_COLORS[p.id] : C.gold;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelections(prev => {
                        const next = { ...prev };
                        if (p.id) next["pathway"] = p.id;
                        else delete next["pathway"];
                        return next;
                      });
                    }}
                    style={{
                      background: active ? resolveCssColor(pColor) : "transparent",
                      color: active ? "#111" : resolveCssColor(C.muted),
                      border: `1px solid ${active ? resolveCssColor(pColor) : resolveCssColor(C.ghost)}`,
                      borderRadius: 20, padding: "0.3rem 0.8rem", fontFamily: FONT.condensed, fontSize: "0.75rem",
                      textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", outline: "none",
                      fontWeight: active ? 700 : 500,
                      transition: "all 0.2s ease", flex: 1, minWidth: "fit-content"
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {dims.map(dim => {
              const options = dim.options.map(o => typeof o === "string" ? o : o.value);
              return (
                <div key={dim.id}>
                  <label style={{
                    fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.1em",
                    textTransform: "uppercase", color: C.dim, display: "block", marginBottom: "0.2rem",
                  }}>
                    {dim.label}
                  </label>
                  <select
                    value={selections[dim.column] || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setSelections(prev => {
                        const next = { ...prev };
                        if (val) next[dim.column] = val;
                        else delete next[dim.column];
                        return next;
                      });
                    }}
                    style={{
                      width: "100%", background: resolveCssColor(C.bgDeep),
                      color: selections[dim.column] ? resolveCssColor(C.textBright) : resolveCssColor(C.muted),
                      border: `1px solid ${selections[dim.column] ? resolveCssColor(C.gold) : resolveCssColor(C.ghost)}`,
                      borderRadius: 6, padding: "0.4rem 0.6rem",
                      fontFamily: FONT.body, fontSize: "0.78rem", cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="">— Any —</option>
                    {options.map(o => (
                      <option key={o} value={o}>{shorten(o)}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {activeCount > 0 && (
            <button
              onClick={() => setSelections({})}
              style={{
                marginTop: "1rem", background: "transparent", border: "none",
                color: C.muted, fontFamily: FONT.condensed, fontSize: "0.65rem",
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Reset all selections
            </button>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {/* Persona count badge */}
          <div style={{
            background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
            padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center",
          }}>
            {activeCount === 0 ? (
              <div style={{
                fontFamily: FONT.body, fontSize: "0.9rem", color: C.muted,
                fontStyle: "italic", padding: "1rem",
              }}>
                Select one or more dimensions to see how many respondents match your profile.
              </div>
            ) : loading ? (
              <div style={{ color: C.muted, fontStyle: "italic", padding: "1rem" }}>
                Searching…
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: FONT.mono, fontSize: "3.5rem", fontWeight: 800,
                  color: personaN >= 5 ? resolveCssColor(C.goldBright) : resolveCssColor(C.red),
                  lineHeight: 1,
                  textShadow: personaN >= 5 ? "0 0 20px rgba(212,160,48,0.3)" : "none",
                }}>
                  {personaN}
                </div>
                <div style={{
                  fontFamily: FONT.condensed, fontSize: "0.72rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: C.muted, marginTop: "0.3rem",
                }}>
                  respondents match your profile
                </div>
                {personaN > 0 && personaN < 5 && (
                  <div style={{
                    marginTop: "0.8rem", padding: "0.5rem 0.8rem",
                    background: "rgba(217,79,79,0.08)", border: `1px solid rgba(217,79,79,0.25)`,
                    borderRadius: 6, fontFamily: FONT.body, fontSize: "0.72rem", color: C.red,
                  }}>
                    ⚠ Too few respondents for meaningful percentages. Try removing a filter.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Outcome metrics with deltas */}
          {personaN >= 5 && baselineData && personaData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {PERSONA_OUTCOMES.map(outcome => {
                const pDist = personaData[outcome.id];
                const bDist = baselineData[outcome.id];
                const pVal = pDist ? extractPersonaMetric(outcome.extractor, pDist.distribution) : null;
                const bVal = bDist ? extractPersonaMetric(outcome.extractor, bDist.distribution) : null;
                const delta = pVal !== null && bVal !== null ? pVal - bVal : null;

                return (
                  <div key={outcome.id} style={{
                    background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 8,
                    padding: "0.8rem 1rem", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "1rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
                        <IconifyEmoji emoji={outcome.icon} />
                      </span>
                      <span style={{
                        fontFamily: FONT.body, fontSize: "0.8rem", color: C.textBright,
                        fontWeight: 500,
                      }}>
                        {outcome.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{
                        fontFamily: FONT.mono, fontSize: "1.1rem", fontWeight: 700,
                        color: resolveCssColor(C.textBright),
                      }}>
                        {pVal !== null ? `${pVal.toFixed(1)}%` : "—"}
                      </span>

                      {delta !== null && Math.abs(delta) >= 1 && (
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.72rem", fontWeight: 600,
                          color: delta > 0 ? resolveCssColor(C.green) : resolveCssColor(C.red),
                          background: delta > 0 ? "rgba(104,184,120,0.1)" : "rgba(217,79,79,0.1)",
                          border: `1px solid ${delta > 0 ? "rgba(104,184,120,0.25)" : "rgba(217,79,79,0.25)"}`,
                          padding: "0.15rem 0.5rem", borderRadius: 4,
                          whiteSpace: "nowrap",
                        }}>
                          {delta > 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{
                fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, textAlign: "right",
                marginTop: "0.3rem",
              }}>
                Deltas shown vs. overall population (pp = percentage points)
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: TEST YOUR ASSUMPTIONS — Auto-generated Quiz with Harvey Balls
// ═══════════════════════════════════════════════════════════════════════════

const CURATED_QUIZ = [
  {
    dimId: "politics", metricId: "keep_intact",
    question: "Which political group has the HIGHEST rate of saying they'd keep a future son intact?",
    note: "All political groups show remarkably similar rates — this issue transcends party lines.",
  },
  {
    dimId: "generation", metricId: "resentment",
    question: "Which generation reports the STRONGEST feelings of resentment about their circumcision?",
    note: "Younger generations, raised with greater access to information about bodily autonomy, consistently report stronger feelings.",
  },
  {
    dimId: "primary_tradition", metricId: "intact_aesthetic",
    question: "Which religious tradition's respondents are MOST likely to prefer the intact aesthetic?",
    note: "Aesthetic preference follows personal experience more than theological doctrine.",
  },
  {
    dimId: "education", metricId: "healthier_belief",
    question: "Which education level is MOST likely to believe the intact state is healthier?",
    note: "Health beliefs cut across education levels in surprising ways.",
  },
  {
    dimId: "socioeconomic", metricId: "bodily_autonomy",
    question: "Which socioeconomic background has the HIGHEST rate of prioritizing bodily autonomy?",
    note: "The autonomy principle resonates across class lines, though the framing of the debate may differ by community.",
  },
];

function generateRandomQuiz(exclude = []) {
  const excludeSet = new Set(exclude.map(e => `${e.dimId}-${e.metricId}`));
  const dim = ANALYSIS_DIMENSIONS[Math.floor(Math.random() * ANALYSIS_DIMENSIONS.length)];
  const metric = OUTCOME_METRICS[Math.floor(Math.random() * OUTCOME_METRICS.length)];
  const key = `${dim.id}-${metric.id}`;
  // Retry if we hit an excluded combo (simple retry, not infinite)
  if (excludeSet.has(key)) {
    const dim2 = ANALYSIS_DIMENSIONS[Math.floor(Math.random() * ANALYSIS_DIMENSIONS.length)];
    const metric2 = OUTCOME_METRICS[Math.floor(Math.random() * OUTCOME_METRICS.length)];
    return {
      dimId: dim2.id, metricId: metric2.id,
      question: `Which ${dim2.label.toLowerCase()} group scores HIGHEST for "${metric2.label}"?`,
      note: null,
    };
  }
  return {
    dimId: dim.id, metricId: metric.id,
    question: `Which ${dim.label.toLowerCase()} group scores HIGHEST for "${metric.label}"?`,
    note: null,
  };
}

function QuizSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState(() => [...CURATED_QUIZ]);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const q = questions[currentQ];
  const dim = ANALYSIS_DIMENSIONS.find(d => d.id === q.dimId);
  const metric = OUTCOME_METRICS.find(m => m.id === q.metricId);

  useEffect(() => {
    if (!dim || !metric) return;
    setLoading(true);
    setGuess(null);
    setRevealed(false);
    getAggregate(metric.qid, { by: dim.column })
      .then(res => {
        setQuizData(res.results || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentQ, questions.length, dim?.column, metric?.qid]);

  const choices = useMemo(() => {
    if (!quizData || !metric) return [];
    return Object.entries(quizData)
      .filter(([key]) => key && key !== "null" && key !== "unknown" && key !== "" && key !== "observer" && !key.toLowerCase().includes("prefer not to say") && !key.toLowerCase().includes("not sure"))
      .map(([key, val]) => {
        const m = extractMetric(metric.extractor, val.distribution);
        return { id: key, label: shorten(key), fullLabel: key, n: val.n, metric: m };
      })
      .filter(c => c.n >= 5 && c.metric !== null)
      .sort((a, b) => b.metric - a.metric);
  }, [quizData, metric]);

  // Shuffle choices for button display so the answer isn't always first
  const shuffledChoices = useMemo(() => {
    if (choices.length === 0) return [];
    const arr = [...choices];
    // Simple Fisher-Yates shuffle seeded by question index for stability
    let seed = currentQ * 7 + choices.length * 13;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [choices, currentQ]);

  const correctAnswer = choices[0]?.id;
  const isCorrect = guess === correctAnswer;
  const hasData = choices.length >= 2;

  const handleGuess = (choiceId) => {
    if (revealed) return;
    setGuess(choiceId);
    setRevealed(true);
    setAnswered(a => a + 1);
    if (choiceId === choices[0]?.id) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      // Generate a random new question
      const newQ = generateRandomQuiz(questions);
      setQuestions(prev => [...prev, newQ]);
      setCurrentQ(prev => prev + 1);
    }
  };

  const themeColor = metric?.color || C.goldBright;

  return (
    <section id="quiz" data-docent-context="test-your-assumptions" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Section 3"
        title="Test Your Assumptions"
        subtitle="Can you guess how different demographic groups answered key questions? Guess which group leads — then see if the data agrees."
        icon="◇"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}>
        {/* Progress */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: C.dim,
          }}>
            {currentQ < CURATED_QUIZ.length ? `Question ${currentQ + 1} of ${CURATED_QUIZ.length}` : "Bonus Question"}
          </div>
          <div style={{
            fontFamily: FONT.mono, fontSize: "0.72rem", color: C.goldBright,
          }}>
            Score: {score}/{answered}
          </div>
        </div>

        {/* Question */}
        <h3 style={{
          fontFamily: FONT.display, fontSize: "1.35rem", fontWeight: 700,
          color: C.textBright, lineHeight: 1.35, marginBottom: "1.5rem",
          letterSpacing: "-0.01em",
        }}>
          {q.question}
        </h3>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Loading data…
          </div>
        ) : !hasData ? (
          <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Not enough data for this combination. <button onClick={handleNext} style={{ background: "none", border: "none", color: resolveCssColor(C.blue), cursor: "pointer", textDecoration: "underline", fontFamily: FONT.body }}>Try another →</button>
          </div>
        ) : (
          <>
            {/* Answer options as cards */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.6rem", marginBottom: "1.5rem",
            }}>
              {shuffledChoices.map(choice => {
                const isGuessed = guess === choice.id;
                const isAnswer = revealed && choice.id === correctAnswer;
                const isWrong = revealed && isGuessed && !isCorrect;

                let bg = "rgba(255,255,255,0.03)";
                let border = C.ghost;
                let textColor = C.textBright;

                if (isGuessed && !revealed) { bg = "rgba(212,160,48,0.12)"; border = C.goldBright; }
                if (isAnswer) { bg = "rgba(104,184,120,0.12)"; border = "rgba(104,184,120,0.6)"; textColor = C.green; }
                if (isWrong) { bg = "rgba(217,79,79,0.12)"; border = "rgba(217,79,79,0.6)"; textColor = C.red; }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleGuess(choice.id)}
                    disabled={revealed}
                    style={{
                      background: bg,
                      border: `1px solid ${typeof border === "string" && border.startsWith("var(") ? resolveCssColor(border) : border}`,
                      borderRadius: 8, padding: "0.7rem 0.9rem",
                      color: typeof textColor === "string" && textColor.startsWith("var(") ? resolveCssColor(textColor) : textColor,
                      fontFamily: FONT.body, fontSize: "0.82rem", fontWeight: 500,
                      cursor: revealed ? "default" : "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                      opacity: revealed && !isAnswer && !isWrong ? 0.5 : 1,
                    }}
                  >
                    <div>{choice.label}</div>
                    {revealed && (
                      <div style={{
                        fontFamily: FONT.mono, fontSize: "0.68rem", marginTop: "0.3rem",
                        opacity: 0.8, display: "flex", alignItems: "center", gap: "0.3rem",
                      }}>
                        <HarveyBall score={percentToHarveyScore(choice.metric)} color={isAnswer ? resolveCssColor(C.green) : resolveCssColor(C.dim)} size="0.9em" />
                        {choice.metric.toFixed(1)}% (n={choice.n})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Post-reveal controls */}
            {revealed && (
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  flex: 1, fontFamily: FONT.body, fontSize: "0.85rem",
                  color: isCorrect ? resolveCssColor(C.green) : resolveCssColor(C.muted),
                  fontStyle: "italic", lineHeight: 1.4,
                }}>
                  {isCorrect ? "✓ Correct! " : "✗ Not quite. "}
                  {q.note || "The data often challenges our assumptions."}
                </div>
                <button
                  onClick={handleNext}
                  style={{
                    background: resolveCssColor(C.goldBright), color: "#0a0a0c",
                    border: "none", borderRadius: 8, padding: "0.6rem 1.5rem",
                    fontFamily: FONT.condensed, fontSize: "0.85rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  {currentQ < CURATED_QUIZ.length - 1 ? "Next →" : "Try Another →"}
                </button>
              </div>
            )}

            {/* Harvey Ball ranked reveal */}
            {revealed && (
              <div style={{ marginTop: "2rem", borderTop: `1px solid ${C.ghost}`, paddingTop: "1.5rem" }}>
                <div style={{
                  fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: C.dim, marginBottom: "0.8rem",
                }}>
                  Full Ranking
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {choices.map((choice, i) => {
                    const maxMetric = choices[0]?.metric || 100;
                    const barWidth = (choice.metric / maxMetric) * 100;
                    const isTop = i === 0;
                    const ballColor = isTop ? resolveCssColor(themeColor) : resolveCssColor(C.dim);
                    return (
                      <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <HarveyBall score={percentToHarveyScore(choice.metric)} color={ballColor} size="1.2em" />
                        <span style={{
                          fontFamily: FONT.body, fontSize: "0.72rem", color: C.text,
                          minWidth: 100, textAlign: "right",
                        }}>
                          {choice.label}
                        </span>
                        <div style={{
                          flex: 1, height: 18, background: "rgba(255,255,255,0.04)",
                          borderRadius: 4, overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${barWidth}%`, height: "100%",
                            background: isTop ? resolveCssColor(themeColor) : resolveCssColor(C.dim),
                            borderRadius: 4, transition: "width 0.4s ease",
                            display: "flex", alignItems: "center", justifyContent: "flex-end",
                            paddingRight: "0.4rem",
                          }}>
                            <span style={{
                              fontFamily: FONT.mono, fontSize: "0.58rem",
                              color: isTop ? "#0a0a0c" : "#fff",
                              fontWeight: 600, whiteSpace: "nowrap",
                            }}>
                              {choice.metric.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontFamily: FONT.mono, fontSize: "0.58rem", color: C.dim,
                          minWidth: 35, textAlign: "right",
                        }}>
                          n={choice.n}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: FACTOR GRID — Harvey Ball Dot Matrix
// ═══════════════════════════════════════════════════════════════════════════

// Use all 12 outcomes from the main OUTCOME_METRICS
const GRID_OUTCOMES = OUTCOME_METRICS.map(m => ({
  id: m.id,
  label: m.label,
  short: m.label.replace(/^(Believes |General |Prefers |Strong |Positive |Leans |Considered )/i, "").slice(0, 12),
  qid: m.qid,
  extractor: m.extractor,
  color: m.color,
}));

function FactorGrid() {
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCell, setExpandedCell] = useState(null);

  useEffect(() => {
    const tasks = [];
    for (const dim of ANALYSIS_DIMENSIONS) {
      for (const out of GRID_OUTCOMES) {
        tasks.push(
          getAggregate(out.qid, { by: dim.column })
            .then(res => ({ dimId: dim.id, outId: out.id, results: res.results || {} }))
            .catch(() => ({ dimId: dim.id, outId: out.id, results: {} }))
        );
      }
    }

    Promise.all(tasks).then(results => {
      const grid = {};
      for (const r of results) {
        if (!grid[r.dimId]) grid[r.dimId] = {};
        const outcome = GRID_OUTCOMES.find(o => o.id === r.outId);

        const categories = Object.entries(r.results)
          .filter(([k]) => k && k !== "null" && k !== "unknown" && k !== "" && k !== "observer" && !k.toLowerCase().includes("prefer not to say") && !k.toLowerCase().includes("not sure"))
          .map(([k, v]) => ({
            label: shorten(k),
            fullLabel: k,
            n: v.n,
            metric: extractMetric(outcome.extractor, v.distribution),
          }))
          .filter(c => c.n >= 5 && c.metric !== null)
          .sort((a, b) => b.metric - a.metric);

        const metrics = categories.map(c => c.metric);
        const range = metrics.length > 1 ? Math.max(...metrics) - Math.min(...metrics) : 0;

        grid[r.dimId][r.outId] = {
          categories,
          min: metrics.length > 0 ? Math.min(...metrics) : 0,
          max: metrics.length > 0 ? Math.max(...metrics) : 0,
          range,
          avg: metrics.length > 0 ? metrics.reduce((s, m) => s + m, 0) / metrics.length : 0,
        };
      }
      setGridData(grid);
      setLoading(false);
    });
  }, []);

  const mostPredictive = useMemo(() => {
    if (!gridData) return {};
    const mp = {};
    for (const out of GRID_OUTCOMES) {
      let maxRange = 0, maxDim = null;
      for (const dim of ANALYSIS_DIMENSIONS) {
        const cell = gridData[dim.id]?.[out.id];
        if (cell && cell.range > maxRange) { maxRange = cell.range; maxDim = dim.id; }
      }
      mp[out.id] = maxDim;
    }
    return mp;
  }, [gridData]);

  return (
    <section id="factor-grid" data-docent-context="factor-grid" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Part IV"
        title="The Factor Grid"
        subtitle="Where does the data diverge most? Harvey Balls show strength of demographic divergence — fuller circles mean wider spread. The ★ marks the most predictive dimension for each outcome. Click any cell to expand."
        icon="▦"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        overflowX: "auto",
      }}>
        {/* Reading Guide */}
        {!loading && gridData && (
          <div style={{
            background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8,
            padding: "0.8rem 1.2rem", marginBottom: "1.2rem",
          }}>
            <div style={{
              fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.text, marginBottom: "0.6rem", fontWeight: 700,
            }}>
              How to Read This Grid
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "center",
              fontFamily: FONT.body, fontSize: "0.72rem", color: C.dim,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HarveyBall score={1} color={resolveCssColor(C.textBright)} size="1.3em" />
                <span>Minimal divergence<br/><span style={{ fontFamily: FONT.mono, fontSize: "0.58rem" }}>&lt;8pp spread</span></span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HarveyBall score={2} color={resolveCssColor(C.textBright)} size="1.3em" />
                <span>Slight divergence<br/><span style={{ fontFamily: FONT.mono, fontSize: "0.58rem" }}>8–18pp</span></span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HarveyBall score={3} color={resolveCssColor(C.textBright)} size="1.3em" />
                <span>Moderate divergence<br/><span style={{ fontFamily: FONT.mono, fontSize: "0.58rem" }}>18–28pp</span></span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HarveyBall score={4} color={resolveCssColor(C.textBright)} size="1.3em" />
                <span>Strong divergence<br/><span style={{ fontFamily: FONT.mono, fontSize: "0.58rem" }}>28–40pp</span></span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HarveyBall score={5} color={resolveCssColor(C.textBright)} size="1.3em" />
                <span>Extreme divergence<br/><span style={{ fontFamily: FONT.mono, fontSize: "0.58rem" }}>40pp+</span></span>
              </span>
            </div>
            <div style={{
              fontFamily: FONT.body, fontSize: "0.65rem", color: C.dim,
              marginTop: "0.5rem", lineHeight: 1.5,
            }}>
              <strong style={{ color: C.text }}>Δ</strong> = the percentage-point spread between the highest and lowest scoring groups.
              <strong style={{ color: resolveCssColor(C.goldBright) }}> ★</strong> = the dimension with the widest spread for that outcome (most predictive).
              Click any cell to see the full breakdown.
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Computing factor grid across {ANALYSIS_DIMENSIONS.length * GRID_OUTCOMES.length} combinations…
          </div>
        ) : gridData && (
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontFamily: FONT.body, fontSize: "0.78rem",
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: "left", padding: "0.6rem 0.8rem",
                  fontFamily: FONT.condensed, fontSize: "0.6rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: C.dim, fontWeight: 700,
                  borderBottom: `2px solid ${C.ghost}`,
                  position: "sticky", left: 0, background: resolveCssColor(C.bgCard), zIndex: 2,
                }}>
                  Dimension
                </th>
                {GRID_OUTCOMES.map(out => (
                  <th key={out.id} style={{
                    textAlign: "center", padding: "0.4rem 0.3rem",
                    fontFamily: FONT.condensed, fontSize: "0.55rem", letterSpacing: "0.06em",
                    textTransform: "uppercase", color: C.dim, fontWeight: 700,
                    borderBottom: `2px solid ${C.ghost}`, minWidth: 60, maxWidth: 80,
                    lineHeight: 1.2,
                  }}>
                    {out.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ANALYSIS_DIMENSIONS.map(dim => (
                <Fragment key={dim.id}>
                  <tr>
                    <td style={{
                      padding: "0.5rem 0.8rem", fontWeight: 600, color: C.textBright,
                      borderBottom: `1px solid ${C.ghost}`, whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                      position: "sticky", left: 0, background: resolveCssColor(C.bgCard), zIndex: 1,
                    }}>
                      {dim.label}
                    </td>
                    {GRID_OUTCOMES.map(out => {
                      const cell = gridData[dim.id]?.[out.id];
                      const isMostPredictive = mostPredictive[out.id] === dim.id;
                      const isExpanded = expandedCell === `${dim.id}-${out.id}`;
                      const ballScore = cell ? rangeToHarveyScore(cell.range) : 1;
                      const ballColor = out.color ? resolveCssColor(out.color) : resolveCssColor(C.goldBright);

                      return (
                        <td
                          key={out.id}
                          onClick={() => setExpandedCell(isExpanded ? null : `${dim.id}-${out.id}`)}
                          style={{
                            padding: "0.4rem 0.2rem",
                            textAlign: "center",
                            borderBottom: `1px solid ${C.ghost}`,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            position: "relative",
                            background: isExpanded ? "rgba(212,160,48,0.08)" : "transparent",
                            boxShadow: isMostPredictive ? `inset 0 0 0 2px ${resolveCssColor(C.goldBright)}` : "none",
                          }}
                          title={cell ? `${cell.min.toFixed(0)}–${cell.max.toFixed(0)}% (Δ${cell.range.toFixed(0)}pp)` : "No data"}
                        >
                          {cell && cell.categories.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem" }}>
                              <HarveyBall
                                score={ballScore}
                                color={isMostPredictive ? resolveCssColor(C.goldBright) : ballColor}
                                size="1.4em"
                              />
                              <div style={{
                                fontFamily: FONT.mono, fontSize: "0.48rem", color: C.dim,
                                lineHeight: 1,
                              }}>
                                Δ{cell.range.toFixed(0)}
                              </div>
                              {isMostPredictive && (
                                <div style={{
                                  position: "absolute", top: 1, right: 2,
                                  fontFamily: FONT.mono, fontSize: "0.45rem",
                                  color: resolveCssColor(C.goldBright),
                                }}>
                                  ★
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: C.dim, fontSize: "0.65rem" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded detail row */}
                  {GRID_OUTCOMES.map(out => {
                    if (expandedCell !== `${dim.id}-${out.id}`) return null;
                    const cell = gridData[dim.id]?.[out.id];
                    if (!cell || cell.categories.length === 0) return null;
                    const outColor = out.color ? resolveCssColor(out.color) : resolveCssColor(C.goldBright);

                    return (
                      <tr key={`${dim.id}-${out.id}-detail`}>
                        <td colSpan={GRID_OUTCOMES.length + 1} style={{
                          padding: "1rem 1.5rem",
                          background: "rgba(212,160,48,0.03)",
                          borderBottom: `1px solid ${C.ghost}`,
                        }}>
                          <div style={{
                            fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.1em",
                            textTransform: "uppercase", color: C.goldBright, marginBottom: "0.8rem",
                            fontWeight: 700,
                          }}>
                            {dim.label} → {out.label} (sorted highest → lowest)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            {cell.categories.map((cat, i) => {
                              const barWidth = cell.max > 0 ? (cat.metric / cell.max) * 100 : 0;
                              const isTop = i === 0;
                              return (
                                <div key={cat.fullLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <HarveyBall
                                    score={percentToHarveyScore(cat.metric)}
                                    color={isTop ? outColor : resolveCssColor(C.dim)}
                                    size="1em"
                                  />
                                  <span style={{
                                    fontFamily: FONT.body, fontSize: "0.7rem", color: C.text,
                                    minWidth: 100, textAlign: "right",
                                  }}>
                                    {cat.label}
                                  </span>
                                  <div style={{
                                    flex: 1, height: 16, background: "rgba(255,255,255,0.04)",
                                    borderRadius: 3, overflow: "hidden",
                                  }}>
                                    <div style={{
                                      width: `${barWidth}%`, height: "100%",
                                      background: isTop ? outColor : resolveCssColor(C.dim),
                                      borderRadius: 3,
                                      display: "flex", alignItems: "center", justifyContent: "flex-end",
                                      paddingRight: "0.3rem",
                                    }}>
                                      {barWidth > 15 && (
                                        <span style={{
                                          fontFamily: FONT.mono, fontSize: "0.55rem",
                                          color: isTop ? "#0a0a0c" : "#fff", fontWeight: 600,
                                        }}>
                                          {cat.metric.toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {barWidth <= 15 && (
                                    <span style={{
                                      fontFamily: FONT.mono, fontSize: "0.55rem", color: C.dim,
                                    }}>
                                      {cat.metric.toFixed(1)}%
                                    </span>
                                  )}
                                  <span style={{
                                    fontFamily: FONT.mono, fontSize: "0.5rem", color: C.dim,
                                    minWidth: 30,
                                  }}>
                                    n={cat.n}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* Compact footer reminder */}
        {!loading && gridData && (
          <div style={{
            display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem",
            fontFamily: FONT.mono, fontSize: "0.55rem", color: C.dim, alignItems: "center",
          }}>
            <span>Δ = percentage-point spread</span>
            <span style={{ color: resolveCssColor(C.goldBright) }}>★ = most predictive</span>
            <span>Click any cell to expand</span>
          </div>
        )}
      </div>
    </section>
  );
}



// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function ByTheNumbersPage({ routerState, navigate, updateState, setCustomMeta, setExhibitContext }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [activeSection, setActiveSection] = useState("factor-finder");

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "By The Numbers",
        exhibitDescription: "Interactive factor analysis: which demographics predict which outcomes?",
      });
    }
  }, [setExhibitContext]);

  useEffect(() => {
    if (setCustomMeta) {
      setCustomMeta({
        kicker: "Exhibit 12",
        title: "By the Numbers",
        desc: "Which factors matter? An interactive exploration of demographic predictors.",
        navTitle: "By the Numbers",
      });
    }
  }, [setCustomMeta]);

  const sections = [
    { id: "snapshots", label: "At a Glance", icon: "★" },
    { id: "factor-finder", label: "Interactive Explorer", icon: "◉" },
    { id: "persona-builder", label: "Persona Builder", icon: "◈" },
    { id: "quiz", label: "Test Your Assumptions", icon: "◇" },
    { id: "factor-grid", label: "Factor Grid", icon: "▦" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: FONT.body, paddingBottom: "8rem",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="numbers" navigate={navigate} />
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <ExhibitHero
          title="By the Numbers"
          color="var(--c-goldBright)"
          gradientColor="var(--c-gold)"
          BackgroundIcon={Icons.BarChart2}
          description="Which factors really matter? Explore how education, politics, religion, generation, and socioeconomic status predict real outcomes — from resentment to aesthetic preferences. Build your own demographic persona, test your assumptions against the data, and discover which dimensions create the widest divides."
        />

        <div style={{
          display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem",
          alignItems: "start", marginTop: "3rem",
        }}>
          {/* LEFT: Nav sidebar */}
          <aside style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: "0.5rem",
            zIndex: 100,
          }}>
            <div style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.8rem", color: C.text, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Sections
            </div>

            {sections.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  cursor: "pointer", fontFamily: FONT.body, fontSize: "0.85rem",
                  color: activeSection === s.id ? resolveCssColor(C.goldBright) : C.text,
                  padding: "0.45rem 0.75rem", borderRadius: 6,
                  background: activeSection === s.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeSection === s.id ? resolveCssColor(C.gold) : C.ghost}`,
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}
                onMouseEnter={e => {
                  if (activeSection !== s.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = resolveCssColor(C.gold);
                  }
                }}
                onMouseLeave={e => {
                  if (activeSection !== s.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  <IconifyEmoji emoji={s.icon} size="1.1em" />
                </span> {s.label}
              </div>
            ))}
          </aside>

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>
            <SnapshotWall navigate={navigate} />
            <AssumptionQuiz />
            <PersonaBuilder />
            <QuizSection />
            <FactorGrid />
          </div>
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
}
