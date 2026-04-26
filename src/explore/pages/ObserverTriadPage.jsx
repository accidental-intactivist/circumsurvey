import { useState, useEffect } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import NarrativeList from "../components/NarrativeList";
import DistributionChart from "../components/DistributionChart";

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

export default function ObserverTriadPage() {
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
      <header style={{ padding: "4rem 2rem 3rem", textAlign: "center", borderBottom: `1px solid ${C.ghost}`, background: C.bgCard }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "2.8rem", color: C.goldBright, marginBottom: "0.5rem" }}>
          The Observer Triad
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 800, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
          Compare the unique perspectives of the three primary "Observer" roles: Partners, Parents, and Healthcare Professionals. 
          Each column highlights the most revealing quantitative and qualitative data for that specific role.
        </p>
      </header>

      <div style={{ padding: "4rem 2rem", maxWidth: 1600, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem" }}>
        {TRIAD_COLUMNS.map(col => (
          <div key={col.role}>
            {/* Column Header */}
            <div style={{ 
              position: "sticky", 
              top: 0, 
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
