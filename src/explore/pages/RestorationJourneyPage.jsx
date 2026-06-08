import { useState, useEffect, useMemo } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import { flattenMultiSelect } from "../lib/formatters";

const SECTION_A_QUESTIONS = [
  { id: "restore_feelings_before", label: "Feelings Before Restoring", width: "1fr" },
  { id: "restore_motivations", label: "Primary Motivations", width: "1fr" },
];

const RCI_QUESTIONS = [
  { id: "restore_rci_start", label: "Starting Coverage (RCI Score)" },
  { id: "restore_rci_current", label: "Current Coverage (RCI Score)" },
];

const TIMELINE_QUESTIONS = [
  { id: "restore_age_started", label: "Age Started Restoring" },
  { id: "restore_duration", label: "Restoration Journey Duration" },
];

const TIMELINE_QUAL = [
  { id: "restore_methods", label: "Methods & Techniques Used" },
  { id: "restore_challenge_reward", label: "Challenges & Rewards Encountered" },
];

const SENSATION_QUESTIONS = [
  { id: "restore_lubrication_change", label: "Impact on Lubrication Needs" },
];

const SENSATION_QUAL = [
  { id: "restore_sensitivity_change_desc", label: "Penile Sensitivity Changes" },
  { id: "restore_orgasm_change_desc", label: "Orgasm Quality & Sensation Shifts" },
];

const RATING_QUESTIONS = [
  { id: "restore_impact_rating_sensation", label: "Sensation & Pleasure" },
  { id: "restore_impact_rating_orgasm", label: "Orgasm Quality & Intensity" },
  { id: "restore_impact_rating_function", label: "Mechanical Function (gliding, lubrication)" },
  { id: "restore_impact_rating_comfort", label: "Physical Comfort (glans protection)" },
  { id: "restore_impact_rating_aesthetics", label: "Aesthetics & Appearance" },
  { id: "restore_impact_rating_psychology", label: "Psychological & Emotional Well-being" },
];

export default function RestorationJourneyPage({ navigate }) {
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.questions.forEach(q => map[q.id] = q);
        setQuestionsMap(map);
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <InlineBreadcrumb currentRoute="restoration-journey" navigate={navigate} />

        {/* Header Callout */}
        <div style={{
          background: `linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.01) 100%)`,
          border: `1px solid rgba(168,85,247,0.22)`,
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "4rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, purple, #a855f7)` }} />
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#a855f7",
            marginBottom: "0.6rem"
          }}>
            ★ Interactive Exhibit 10 ★
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
            Restoration Journey &amp; Outcomes
          </h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.text,
            lineHeight: 1.6,
            maxWidth: 900,
            margin: 0
          }}>
            Foreskin restoration represents an active, self-directed physical process undertaken by circumcised individuals to reclaim gliding mechanics and protective coverage.
            <br /><br />
            This exhibit details the experiences of <strong>{109} restoring respondents</strong>. Explore starting motivations and Real Coverage Index (RCI) changes, track methods and timelines, read firsthand reports of sensitivity gains, and review final outcome ratings across physical and psychological domains.
          </p>
        </div>

        {/* SECTION A: MOTIVATIONS & RCI */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "2rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🟣</span> Section A: Starting Points &amp; Motivations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {SECTION_A_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {RCI_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: C.ghost, margin: "0 0 5rem" }} />

        {/* SECTION B: METHODS & TIMELINE */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "2rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⏱️</span> Section B: Timelines &amp; Methods
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {TIMELINE_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {TIMELINE_QUAL.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  <div style={{ flex: 1 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: C.ghost, margin: "0 0 5rem" }} />

        {/* SECTION C: SENSATION & SENSITIVITY */}
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "2rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚡</span> Section C: Sensation &amp; Sensitivity Shifts
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {SENSATION_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {SENSATION_QUAL.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.25rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt}"</p>}
                  <div style={{ flex: 1 }}>
                    {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: C.ghost, margin: "0 0 5rem" }} />

        {/* SECTION D: OUTCOME RATINGS */}
        <div>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "2rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🌟</span> Section D: Physical &amp; Psychological Outcome Ratings
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {RATING_QUESTIONS.map(qDef => {
              const q = questionsMap[qDef.id];
              return (
                <div key={qDef.id} style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.15rem", color: C.textBright, marginBottom: "0.4rem", fontWeight: 700 }}>
                    {qDef.label}
                  </h3>
                  {q && <p style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.dim, fontStyle: "italic", marginBottom: "1.2rem", lineHeight: 1.35 }}>"{q.prompt.replace("Overall, how would you rate the impact of your restoration journey on the following aspects of your experience?", "").trim()}"</p>}
                  {q ? <DataLoader question={q} /> : <div style={{ color: C.dim }}>Loading...</div>}
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
function DataLoader({ question, filter, shortenLabels }) {
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
      shortenLabels={shortenLabels}
    />
  );
}
