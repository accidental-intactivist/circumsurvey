// ═══════════════════════════════════════════════════════════════════════════
// ByTheNumbersPage.jsx — "By the Numbers: Which Factors Matter?"
// An interactive factor-analysis explorer. Four sections:
//   1. At a Glance — key snapshot statistics
//   2. Challenge Your Assumptions — dynamic quiz against the data
//   3. Persona Builder — how many are like me? with live delta comparisons
//   4. Factor Grid — heatmap of which demographics predict which outcomes
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback, Fragment } from "react";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { getAggregate, getResponseDistribution, getCount } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import ExhibitHero from "../components/ExhibitHero";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { useReport } from "../contexts/ReportContext";
import IconifyEmoji from "../components/IconifyEmoji";
import HarveyBall from "../components/HarveyBall";
import * as Icons from "../components/Icons";
import SmallSampleBadge from "../components/SmallSampleBadge";
import SnapshotWall from "../components/SnapshotWall";

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



// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: TEST YOUR ASSUMPTIONS — Auto-generated Quiz with Harvey Balls
// ═══════════════════════════════════════════════════════════════════════════

const CURATED_QUIZ = [
  {
    dimId: "politics", metricId: "bodily_autonomy",
    question: "Bodily autonomy is often framed as a progressive value. Which political group in this survey MOST strongly prioritizes it?",
    note: "This result challenges the assumption that bodily autonomy is partisan. Across the political spectrum, this principle resonates when people confront the question directly.",
  },
  {
    dimId: "generation", metricId: "social_norm",
    question: "Cultural norms shift across generations. Which generation is MOST likely to perceive circumcision as 'the norm' in their society?",
    note: "Generational norms are a window into how cultural practices persist — not through evidence, but through the assumption that 'everyone does it.'",
  },
  {
    dimId: "education", metricId: "natural_state",
    question: "Does higher education correlate with leaning toward the natural state? Which education level leans MOST toward leaving the body unaltered?",
    note: "The relationship between education and medical skepticism is more complex than it appears. What you're seeing here is the intersection of access to information and cultural conditioning.",
  },
  {
    dimId: "country_born", metricId: "keep_intact",
    question: "Circumcision rates vary wildly by country. Respondents born in which country are MOST likely to say they'd keep a future son intact?",
    note: "National culture shapes the 'default setting' more than individual preference. Notice how strongly geography predicts this choice — and ask yourself why.",
  },
  {
    dimId: "generation", metricId: "resentment",
    question: "Younger generations grew up with the internet and access to anatomical information older cohorts never had. Which generation reports the STRONGEST resentment about being circumcised?",
    note: "This is the information asymmetry question. When people learn what was removed — and that it was their choice to make — the emotional response intensifies across younger cohorts.",
  },
];

function generateRandomQuiz(exclude = []) {
  const excludeSet = new Set(exclude.map(e => `${e.dimId}-${e.metricId}`));
  // Curated anthropological pairings that produce meaningful, robust results
  const ANTHROPOLOGICAL_COMBOS = [
    { dimId: "politics", metricId: "keep_intact", q: "Is the decision to keep a future son intact actually a left-vs-right issue? Which political group scores HIGHEST?" },
    { dimId: "generation", metricId: "dissatisfaction", q: "Dissatisfaction with one's own circumcision — is this a modern phenomenon? Which generation reports the MOST dissatisfaction?" },
    { dimId: "country_born", metricId: "social_norm", q: "The sense that circumcision is 'normal' is deeply geographic. Respondents from which country MOST strongly perceive it as the norm?" },
    { dimId: "education", metricId: "bodily_autonomy", q: "Does formal education change how people weigh bodily autonomy? Which education level prioritizes it MOST?" },
    { dimId: "politics", metricId: "circ_aesthetic", q: "Aesthetic preference for circumcision — is it political? Which political leaning MOST prefers the circumcised look?" },
    { dimId: "generation", metricId: "considered_restoration", q: "Foreskin restoration is a growing movement. Which generation has MOST seriously considered it?" },
    { dimId: "country_born", metricId: "bodily_autonomy", q: "Different legal and cultural traditions produce different views on bodily autonomy. Which country of birth scores HIGHEST?" },
    { dimId: "education", metricId: "healthier_belief", q: "The medical framing of circumcision varies by culture. Which education level is MOST convinced the intact state is healthier?" },
    { dimId: "politics", metricId: "social_norm", q: "Who perceives circumcision as 'the norm'? Is that perception ideological? Which political group scores HIGHEST?" },
    { dimId: "generation", metricId: "pride", q: "Pride and satisfaction with one's body — does this change across generations? Which generation reports the HIGHEST pride?" },
  ];
  const available = ANTHROPOLOGICAL_COMBOS.filter(c => !excludeSet.has(`${c.dimId}-${c.metricId}`));
  if (available.length > 0) {
    const pick = available[Math.floor(Math.random() * available.length)];
    return { dimId: pick.dimId, metricId: pick.metricId, question: pick.q, note: null };
  }
  // Fallback: truly random
  const dim = ANALYSIS_DIMENSIONS[Math.floor(Math.random() * ANALYSIS_DIMENSIONS.length)];
  const metric = OUTCOME_METRICS[Math.floor(Math.random() * OUTCOME_METRICS.length)];
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
      .filter(c => c.n >= 25 && c.metric !== null) // n≥25 minimum for quiz — small subgroups produce misleading percentages
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

  const topMetric = choices[0]?.metric || 0;
  const margin = 2.0; // Treat results within 2% as a statistical tie for first place
  const correctChoices = choices.filter(c => topMetric - c.metric <= margin).map(c => c.id);
  const isCorrect = correctChoices.includes(guess);
  const hasData = choices.length >= 2;

  const handleGuess = (choiceId) => {
    if (revealed) return;
    setGuess(choiceId);
    setRevealed(true);
    if (correctChoices.includes(choiceId)) setScore(s => s + 1);
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
  const questionsAttempted = revealed ? currentQ + 1 : currentQ;

  return (
    <section id="quiz" data-docent-context="test-your-assumptions" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <SectionHeader
        number="Section 2"
        title="Challenge Your Assumptions"
        subtitle="Think you know how culture, politics, education, and geography shape attitudes about the body? Each question is designed to expose a blind spot. Guess first — then follow the thread."
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
            {currentQ < CURATED_QUIZ.length ? `Question ${currentQ + 1} of ${CURATED_QUIZ.length}` : `Question ${currentQ + 1}`}
          </div>
          <div style={{
            fontFamily: FONT.mono, fontSize: "0.72rem", color: C.goldBright,
          }}>
            Score: {score}/{questionsAttempted}
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
                const isAnswer = revealed && correctChoices.includes(choice.id);
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
                  {isCorrect ? (correctChoices.length > 1 ? "✓ Correct! It's a statistical tie." : "✓ Correct!") : "✗ Not quite. "}
                  {q.note && ` ${q.note}`}
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

function PersonaBuilder({ showTooltip, moveTooltip, hideTooltip }) {
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
        number="Section 3"
        title="Persona Builder"
        subtitle="How many respondents share your background? See how many match your profile — and what their outcomes look like compared to the overall population."
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
                fontFamily: FONT.mono, fontSize: "0.65rem", color: C.dim, textAlign: "right",
                marginTop: "0.3rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem"
              }}>
                <span
                  style={{ cursor: "help", borderBottom: `1px dotted ${C.dim}` }}
                  onMouseEnter={(e) => showTooltip("Percentage points. The absolute numerical difference between two percentages (e.g., 50% vs 40% is a 10pp delta).", e)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  pp = percentage points
                </span>
                <span>|</span>
                <span
                  style={{ cursor: "help", borderBottom: `1px dotted ${C.dim}` }}
                  onMouseEnter={(e) => showTooltip("The percentage point difference between your persona's outcome and the overall baseline population.", e)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  Δ = Deltas shown vs. overall population
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: FACTOR GRID — The Heatmap Matrix
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

function FactorGrid({ showTooltip, moveTooltip, hideTooltip }) {
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCell, setExpandedCell] = useState(null);
  const [showHowToRead, setShowHowToRead] = useState(false);
  const { addExhibitToReport, isExhibitInReport } = useReport();

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
          .filter(c => c.n >= 15 && c.metric !== null)
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
        number="Section 4"
        title="The Factor Grid"
        subtitle="A birds-eye view of how specific demographic cohorts diverge from the survey baseline on key metrics. Darker squares indicate stronger divergence."
        icon="▦"
      />

      <div style={{
        background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12,
        padding: "1rem 2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        
        {/* Toggle How To Read and Add to Report */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
          <button
            onClick={() => addExhibitToReport('factor_grid', {}, null)}
            disabled={isExhibitInReport('factor_grid', {}, null)}
            style={{
              background: isExhibitInReport('factor_grid', {}, null) ? "rgba(255,255,255,0.05)" : `linear-gradient(to right, rgba(234, 186, 107, 0.15), rgba(234, 186, 107, 0.05))`,
              border: `1px solid ${isExhibitInReport('factor_grid', {}, null) ? C.ghost : resolveCssColor(C.gold)}`,
              color: isExhibitInReport('factor_grid', {}, null) ? C.muted : resolveCssColor(C.goldBright), 
              padding: "0.3rem 0.8rem", borderRadius: 20,
              fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: isExhibitInReport('factor_grid', {}, null) ? "default" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.4rem"
            }}
          >
            {isExhibitInReport('factor_grid', {}, null) ? "✓ Added to Report" : "+ Add to Report"}
          </button>

          <button
            onClick={() => setShowHowToRead(!showHowToRead)}
            style={{
              background: showHowToRead ? "rgba(212,160,48,0.15)" : "transparent",
              border: `1px solid ${showHowToRead ? resolveCssColor(C.gold) : resolveCssColor(C.ghost)}`,
              color: resolveCssColor(C.goldBright), padding: "0.3rem 0.8rem", borderRadius: 20,
              fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.4rem"
            }}
          >
            <IconifyEmoji emoji="💡" size="1.1em" /> {showHowToRead ? "Hide Guide" : "How to Read This Grid"}
          </button>
        </div>

        {/* How To Read Box */}
        {showHowToRead && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.ghost}`, borderRadius: 8,
            padding: "1.2rem 1.5rem", marginBottom: "1.5rem",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem"
          }}>
            <div>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: 700 }}>What am I looking at?</div>
              <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.muted, lineHeight: 1.5 }}>
                This heatmap shows how heavily outcomes (columns) are influenced by different demographics (rows). We measure this by looking at the <strong>spread</strong> between the highest and lowest scoring groups within a demographic.
              </div>
            </div>
            <div>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", color: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: 700 }}>The Legend</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontFamily: FONT.body, fontSize: "0.8rem", color: C.muted }}>
                <div><strong style={{ color: C.textBright }}>More filled circle</strong> = Wider gap between groups (more polarization).</div>
                <div><strong style={{ color: C.textBright }}>Empty circle</strong> = Very little difference between groups.</div>
                <div><strong style={{ color: resolveCssColor(C.goldBright) }}>★ Star</strong> = The demographic factor that creates the largest divide for that outcome.</div>
                <div><strong style={{ color: C.textBright }}>+ / -</strong> = Indicates whether the highest scoring cohort in this cell is significantly above or below the survey average.</div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Computing factor grid across {ANALYSIS_DIMENSIONS.length * GRID_OUTCOMES.length} combinations…
          </div>
        ) : gridData && (
          <div className="mobile-scroll-hint" style={{ overflowX: "auto", paddingBottom: "1rem", position: "relative" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontFamily: FONT.body, fontSize: "0.78rem", minWidth: "800px"
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
                          onMouseEnter={(e) => cell && showTooltip(e, `${cell.min.toFixed(0)}–${cell.max.toFixed(0)}% range (Δ${cell.range.toFixed(0)}pp)`)}
                          onMouseMove={moveTooltip}
                          onMouseLeave={hideTooltip}
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
                        >
                          {cell && cell.categories.length > 0 ? (() => {
                            const diffFromAvg = cell.max - cell.avg;
                            const isHigh = diffFromAvg > 5;
                            const isLow = diffFromAvg < -5;
                            return (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem" }}>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                  <HarveyBall
                                    score={ballScore}
                                    color={isMostPredictive ? resolveCssColor(C.goldBright) : ballColor}
                                    size="1.4em"
                                  />
                                  {isMostPredictive && (
                                    <div style={{
                                      position: "absolute", top: -2, right: -4,
                                      fontFamily: FONT.mono, fontSize: "0.55rem",
                                      color: resolveCssColor(C.goldBright),
                                      textShadow: "0 0 4px rgba(0,0,0,0.8)"
                                    }}>
                                      ★
                                    </div>
                                  )}
                                  {(isHigh || isLow) && ballScore >= 3 && (
                                    <div style={{
                                      position: "absolute", bottom: -2, right: -4,
                                      fontFamily: FONT.mono, fontSize: "0.55rem", fontWeight: 800,
                                      color: isHigh ? resolveCssColor(C.green) : resolveCssColor(C.red),
                                      textShadow: "0 0 4px rgba(0,0,0,0.8)"
                                    }}>
                                      {isHigh ? "+" : "-"}
                                    </div>
                                  )}
                                </div>
                                <div style={{
                                  fontFamily: FONT.mono, fontSize: "0.48rem", color: C.dim,
                                  lineHeight: 1, marginTop: "0.1rem"
                                }}>
                                  Δ{cell.range.toFixed(0)}
                                </div>
                              </div>
                            );
                          })() : (
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
          </div>
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
  const [activeSection, setActiveSection] = useState("snapshots");

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'By The Numbers' exhibit. This page features interactive factor-analysis including: At a Glance (Standalone Stats), Challenge Your Assumptions (a quiz game), Persona Builder (dynamic subset exploration), Factor Finder (bubble clusters), and The Factor Grid (heatmap of which demographics predict which outcomes).",
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
    { id: "snapshots", label: "At a Glance", icon: "★", desc: "Top-level takeaways and standout statistics." },
    { id: "quiz", label: "Challenge Your Assumptions", icon: "◇", desc: "Test your intuition against the actual data." },
    { id: "persona-builder", label: "Persona Builder", icon: "◈", desc: "Filter the dataset dynamically by demographic traits." },
    { id: "factor-grid", label: "The Factor Grid", icon: "▦", desc: "A dense heatmap showing which demographics predict which outcomes." },
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

        <div className="explore-grid" style={{
          display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem",
          alignItems: "start", marginTop: "3rem",
        }}>
          {/* LEFT: Nav sidebar */}
          <aside className="explore-nav" style={{
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ display: "flex", alignItems: "center", color: activeSection === s.id ? resolveCssColor(C.goldBright) : C.dim }}>
                      <IconifyEmoji emoji={s.icon} size="1.1em" />
                    </span>
                    <span style={{ fontWeight: activeSection === s.id ? 600 : 400 }}>{s.label}</span>
                  </div>
                  {s.desc && (
                    <div style={{
                      fontSize: "0.7rem", color: activeSection === s.id ? C.text : C.dim,
                      lineHeight: 1.3, paddingLeft: "1.6rem",
                      transition: "color 0.2s"
                    }}>
                      {s.desc}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </aside>

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>
            <SnapshotWall navigate={navigate} />
            <QuizSection />
            <PersonaBuilder showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
            <FactorGrid showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
          </div>
        </div>
      </div>

      <Tooltip {...tooltip} />
    </div>
  );
}
