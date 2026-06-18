import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import SankeyChart from "../components/SankeyChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import { flattenMultiSelect } from "../lib/formatters";

const CONTEXT_QUESTIONS = [
  { id: "circ_adult_context", label: "Context of the Procedure", width: "1fr" },
  { id: "circ_adult_consent_status", label: "Consent Status", width: "1fr" },
  { id: "circ_adult_decision_role", label: "Role in Decision Making", width: "1fr" },
  { id: "circ_adult_info_quality", label: "Quality of Information Provided", width: "1fr" },
];

const MOTIVATION_QUESTIONS = [
  { id: "circ_adult_motivation_details", label: "Motivations & Details", width: "1fr" }
];

const BEFORE_RATINGS = [
  { id: "circ_adult_before_rating_appearance", label: "Before: Appearance" },
  { id: "circ_adult_before_rating_function", label: "Before: Mechanical Function" },
  { id: "circ_adult_before_rating_orgasm_intensity", label: "Before: Orgasm Intensity" },
  { id: "circ_adult_before_rating_ease_of_orgasm", label: "Before: Ease of Orgasm" },
  { id: "circ_adult_before_rating_sensitivity", label: "Before: Sensitivity" },
  { id: "circ_adult_before_rating_hygiene", label: "Before: Hygiene" },
];

const AFTER_RATINGS = [
  { id: "circ_adult_after_change_appearance", label: "Change: Appearance" },
  { id: "circ_adult_after_change_function", label: "Change: Mechanical Function" },
  { id: "circ_adult_after_change_orgasm_intensity", label: "Change: Orgasm Intensity" },
  { id: "circ_adult_after_change_ease_of_orgasm", label: "Change: Ease of Orgasm" },
  { id: "circ_adult_after_change_sensitivity", label: "Change: Sensitivity" },
  { id: "circ_adult_after_change_hygiene", label: "Change: Hygiene" },
];

const NEW_NORMAL_QUESTIONS = [
  { id: "circ_adult_new_normal_desc", label: "Adjusting to the New Normal" }
];

const LOOKING_BACK_QUESTIONS = [
  { id: "circ_adult_retrospective_feeling", label: "Retrospective Feeling" }
];

const LOOKING_BACK_NARRATIVES = [
  { id: "circ_adult_advice_to_others", label: "Advice to Others Considering It" },
  { id: "circ_adult_final_thoughts", label: "Final Thoughts on the Experience" }
];

export default function AdultExperiencePage({ routerState, navigate, updateState, setExhibitContext }) {
  const { cohort } = routerState;
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "Before & After: The Adult Experience",
        exhibitDescription: "Analysis of the unique perspectives of individuals who were circumcised as adults and can compare both states.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        setQuestionsMap(map);
      });
  }, []);

  const glassStyle = {
    background: "rgba(24, 24, 28, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${C.ghost}`,
    borderRadius: 12,
    padding: "1.5rem"
  };

  const RATING_COLOR_MAP = {
    // After Change labels
    "Significantly Decreased": "#e6194b",
    "Somewhat Decreased": "#f58231",
    "No Change": "#ffe119",
    "Somewhat Increased": "#3cb44b",
    "Significantly Increased": "#4363d8",
    // Before labels
    "Very Dissatisfied / Poor": "#e6194b",
    "Somewhat Dissatisfied / Below Average": "#f58231",
    "Neutral / Average": "#ffe119",
    "Somewhat Satisfied / Above Average": "#3cb44b",
    "Very Satisfied / Excellent": "#4363d8"
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem", position: "relative" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem", position: "relative", zIndex: 10 }}>
        <InlineBreadcrumb currentRoute="adult-experience" navigate={navigate} />

        {/* Header Callout */}
        <div style={{
          background: `linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(212,160,48,0.05) 100%)`,
          backdropFilter: "blur(16px)",
          border: `1px solid rgba(249,115,22,0.3)`,
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "4rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, #d4a030, #f97316)` }} />
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#f97316",
            marginBottom: "0.6rem"
          }}>
            <IconifyEmoji symbol="sparkles" /> Interactive Exhibit 11 <IconifyEmoji symbol="sparkles" />
          </div>
          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: "2.5rem",
            color: C.textBright,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "1rem"
          }}>
            Before &amp; After: The Adult Experience
          </h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.text,
            lineHeight: 1.6,
            maxWidth: 900,
            margin: 0
          }}>
            This exhibit isolates one of the most forensically valuable datasets in the survey: the experiences of respondents who were circumcised as teenagers or adults.
            <br /><br />
            Unlike those altered in infancy, these individuals possess a <strong style={{ color: C.gold }}>first-person comparative baseline</strong>. They are uniquely positioned to articulate how the procedure changed their anatomy, mechanics, and sensation.
          </p>
        </div>

        {/* SECTION 1: CONTEXT */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="orange-book" /> Section 1: Context &amp; Consent
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            Understanding the circumstances surrounding an adult circumcision—whether medically indicated, socially driven, or cosmetic—provides crucial context for their subsequent satisfaction levels.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {CONTEXT_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          {MOTIVATION_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{...glassStyle, display: "flex", flexDirection: "column"}}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
          })}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 0 5rem" }} />

        {/* SECTION 2: RATINGS */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="balance-scale" /> Section 2: Before &amp; After Ratings
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            Respondents were asked to rate six distinct dimensions of their genital experience before the procedure, and then assess how those dimensions changed post-healing.
          </p>

          {/* Unified Legend */}
          <div style={{
            display: "flex",
            gap: "1.2rem",
            padding: "1rem 1.5rem",
            background: "rgba(24, 24, 28, 0.4)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${C.ghost}`,
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            marginBottom: "2rem",
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            <span style={{ fontFamily: FONT.condensed, color: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase", marginRight: "1rem" }}>Rating Color Scale:</span>
            {[
              { color: "#e6194b", label: "Poor / Significantly Decreased" },
              { color: "#f58231", label: "Below Avg / Somewhat Decreased" },
              { color: "#ffe119", label: "Neutral / No Change" },
              { color: "#3cb44b", label: "Above Avg / Somewhat Increased" },
              { color: "#4363d8", label: "Excellent / Significantly Increased" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.85rem", color: C.text, fontFamily: FONT.body, fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
             {/* Render Pairs in single cards */}
             {[0,1,2,3,4,5].map(i => {
                const qBefore = questionsMap[BEFORE_RATINGS[i].id];
                const qAfter = questionsMap[AFTER_RATINGS[i].id];
                if (!qBefore || !qAfter) return null;
                const dimensionLabel = BEFORE_RATINGS[i].label.replace("Before: ", "");
                return (
                  <SankeyChart
                    key={i}
                    title={dimensionLabel}
                    beforeQuestion={qBefore}
                    afterQuestion={qAfter}
                    filter=""
                    customColorMap={RATING_COLOR_MAP}
                    height={420}
                  />
                );
             })}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 0 5rem" }} />

        {/* SECTION 3 & 4: NARRATIVES */}
        <div>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconifyEmoji symbol="speech-balloon" /> Section 3: The New Normal &amp; Looking Back
          </h2>
          <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
            In their own words: how respondents adjusted to the changes, their retrospective feelings, and the advice they would give to an adult considering circumcision today.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {NEW_NORMAL_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
            {LOOKING_BACK_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={glassStyle}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  {q ? <DataLoader question={q} hideLegend={false} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {LOOKING_BACK_NARRATIVES.map(qDef => {
              const q = questionsMap[qDef.id];
              const promptText = q?.prompt?.trim();
              return (
                <div key={qDef.id} style={{ ...glassStyle, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {promptText && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{promptText}"</p>}
                  <div style={{ flex: 1 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── DATA LOADER HELPER ─────────────────────────────────────────────────────
function DataLoader({ question, filter, shortenLabels, hideLegend, forceChartType, customColorMap, bare }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!question) return;
    setLoading(true);
    const endpoint = question.type === "open_text" ? "narratives" : "response-distribution";
    let url = `${API_BASE}/${endpoint}?q=${question.id}`;
    if (filter) url += `&filter=${filter}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [question, filter]);

  if (loading) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>Loading data...</div>;
  if (!data) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>No data.</div>;

  const dist = question.type === "open_text" ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem", padding: "0.5rem" }}>No responses.</div>;
  }

  const isMulti = question.type === "multi_select" || ["demo_ethnicity", "demo_race_ethnicity", "demo_gender_identity", "demo_sexuality"].includes(question.id);
  const chartData = isMulti && question.type !== "open_text" ? {
    ...data,
    distribution: flattenMultiSelect(data.distribution, question)
  } : data;

  return question.type === "open_text" ? (
    <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "0.25rem", marginTop: "-0.5rem" }}>
      <NarrativeList distribution={dist} hideChart={true} />
    </div>
  ) : (
    <DistributionChart 
      title="" 
      distribution={chartData} 
      cohortDistribution={null} 
      question={question}
      hideHeader 
      hideLegend={hideLegend}
      shortenLabels={shortenLabels}
      forceChartType={forceChartType}
      customColorMap={customColorMap}
      bare={bare}
    />
  );
}
