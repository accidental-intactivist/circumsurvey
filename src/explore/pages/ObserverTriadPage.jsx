import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import NarrativeList from "../components/NarrativeList";
import DistributionChart from "../components/DistributionChart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";

// Curated flagship questions for each Observer sub-role
const TRIAD_COLUMNS = [
  {
    role: "Partners",
    description: "Intimate and sexual perspective",
    color: "#e86e82", // Rose
    questions: [
      "observe_partner_emotional_state",
      "observe_partner_observations",
      "observe_partner_comm_challenges",
      "observe_partner_advice"
    ]
  },
  {
    role: "Parents",
    description: "Caregiving and decision-making perspective",
    color: "#6e8be8", // Blue
    questions: [
      "observe_parent_emotional_state",
      "observe_parent_circ_advice",
      "observe_parent_intact_factors",
      "observe_parent_intact_regret_reconsider"
    ]
  },
  {
    role: "Healthcare",
    description: "Clinical and systemic perspective",
    color: "#4ab588", // Mint
    questions: [
      "observe_healthcare_blind_spot_v2",
      "observe_healthcare_counseling_stance",
      "observe_healthcare_complications_seen_v2",
      "observe_healthcare_prediction_future_ric"
    ]
  }
];

export default function ObserverTriadPage({ navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "The Observer Triad",
        exhibitDescription: "Comparative analysis of Partner, Parental, and Medical Observer perspectives on bodily modifications and circumcision.",
        perspectives: ["Partner", "Parental", "Medical"]
      });
    }
  }, [setExhibitContext]);

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
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <InlineBreadcrumb currentRoute="observer-triad" navigate={navigate} />
        
        {/* Editorial introduction block */}
        <div style={{ marginTop: "2.5rem", marginBottom: "1rem", maxWidth: 900 }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "0.4rem",
          }}>★ Special Perspective ★</div>
          <h1 style={{
            fontFamily: FONT.display,
            fontSize: "2.2rem",
            fontWeight: 800,
            color: C.textBright,
            margin: 0,
            lineHeight: 1.2,
          }}>The Observer Triad</h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.muted,
            lineHeight: 1.6,
            marginTop: "0.6rem",
            marginBottom: 0
          }}>
            Not all respondents were writing about their own bodies. The Observer pathway captures testimonies from partners, parents, and healthcare professionals—those who witness the physical, emotional, and systemic consequences of circumcision from the outside. Their perspectives form a critical triangulation of the practice.
          </p>
        </div>

        <div style={{
          background: "rgba(212,160,48,0.06)",
          border: `1px solid ${C.gold}`,
          borderRadius: 8,
          padding: "1.2rem 1.8rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "3rem"
        }}>
          <div>
            <h4 style={{ fontFamily: FONT.condensed, color: C.goldBright, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 0.3rem 0" }}>
              Underrepresented Voices
            </h4>
            <p style={{ fontFamily: FONT.body, color: C.textBright, fontSize: "0.9rem", margin: 0, lineHeight: 1.4, maxWidth: 600 }}>
              Are you a partner, parent, or healthcare professional? Your perspective is crucial to understanding the full picture, but we have limited data.
            </p>
          </div>
          <a href="https://circumsurvey.online" target="_blank" rel="noopener noreferrer" style={{
            background: C.goldBright,
            color: C.bgDeep,
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.7rem 1.4rem",
            borderRadius: 4,
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}>Take the Survey →</a>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: 1600, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem" }}>
        {TRIAD_COLUMNS.map(col => (
          <div key={col.role}>
            {/* Column Header */}
            <div style={{ 
              position: "sticky", 
              top: "var(--header-height, 56px)", 
              background: `linear-gradient(to bottom, ${C.bg} 85%, transparent)`, 
              padding: "1rem 0 2rem", 
              zIndex: 10,
              borderBottom: `2px solid ${col.color}`,
              marginBottom: "2rem"
            }}>
              <h2 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.3rem" }}>
                {col.role}
              </h2>
              <p style={{ fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.85rem", color: col.color }}>
                {col.description}
              </p>
            </div>

            {/* Questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
              {col.questions.map(qId => {
                const q = questionsMap[qId];
                if (!q) return <div key={qId} style={{ color: C.dim }}>Loading...</div>;
                return <QuestionWidget key={qId} question={q} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── UNIVERSAL QUESTION WIDGET ──────────────────────────────────────────────
function QuestionWidget({ question }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const endpoint = question.type === "open_text" ? "narratives" : "response-distribution";
    fetch(`${API_BASE}/${endpoint}?q=${question.id}`)
      .then(r => r.json())
      .then(d => setData(d));
  }, [question.id, question.type]);

  if (!data) return <div style={{ color: C.dim, fontStyle: "italic" }}>Loading data...</div>;

  const dist = question.type === "open_text" ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return (
      <div>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.textBright, marginBottom: "0.5rem" }}>
          {question.prompt}
        </h3>
        <div style={{ color: C.dim, fontStyle: "italic" }}>No responses available yet.</div>
      </div>
    );
  }

  const quantTotal = question.type !== "open_text" && data.distribution?.distribution ? data.distribution.distribution.reduce((acc, curr) => acc + curr.n, 0) : 0;
  if (question.type !== "open_text" && quantTotal < 5) {
    return null;
  }

  return (
    <div style={{ background: C.bgSoft, borderRadius: 8, padding: "1.5rem", border: `1px solid ${C.ghost}` }}>
      <h3 style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.textBright, marginBottom: "1.5rem", lineHeight: 1.4 }}>
        {question.prompt}
      </h3>
      {question.type === "open_text" ? (
        <div style={{ marginTop: "-1rem" }}>
          <NarrativeList question={question} distribution={dist} />
        </div>
      ) : (
        <DistributionChart title={null} distribution={dist} cohortDistribution={null} hideHeader />
      )}
    </div>
  );
}
