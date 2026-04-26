import { useState, useEffect } from "react";
import { C, FONT, API_BASE, PATH_COLORS } from "../styles/tokens";
import NarrativeList from "../components/NarrativeList";

const NARRATIVE_PAIRS = [
  { 
    id: "final_message", 
    concept: "The Final Message", 
    desc: "What respondents wish they could say to parents or others.",
    intact: "intact_message_to_others", 
    circ: "circ_message_to_parents" 
  },
  { 
    id: "perceived_advantages", 
    concept: "Perceived Advantages", 
    desc: "How respondents describe the benefits of their state.",
    intact: "intact_advantages_desc", 
    circ: "circ_advantages_desc" 
  },
  { 
    id: "perceived_drawbacks", 
    concept: "Perceived Drawbacks", 
    desc: "The challenges or regrets associated with their state.",
    intact: "intact_drawbacks_desc", 
    circ: "circ_drawbacks_desc" 
  },
];

export default function NarrativeMirrorsPage() {
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
          Narrative Mirrors
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 800, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
          Qualitative data holds the emotional heart of this survey. 
          Read the long-form narrative responses from Intact and Circumcised respondents side-by-side to understand the sharp contrast in their lived experiences.
        </p>
      </header>

      <div style={{ padding: "3rem 0" }}>
        {NARRATIVE_PAIRS.map(pair => (
          <NarrativePairRow key={pair.id} pair={pair} questionsMap={questionsMap} />
        ))}
      </div>
    </div>
  );
}

// ── NARRATIVE PAIR ROW ─────────────────────────────────────────────────────
function NarrativePairRow({ pair, questionsMap }) {
  const intQ = questionsMap[pair.intact];
  const circQ = questionsMap[pair.circ];

  return (
    <div style={{ marginBottom: "6rem", padding: "0 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "2.2rem", color: C.textBright, marginBottom: "0.5rem" }}>
          {pair.concept}
        </h2>
        <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.muted }}>
          {pair.desc}
        </p>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "2rem", 
        maxWidth: 1600, 
        margin: "0 auto", 
        flexDirection: "row",
        alignItems: "flex-start" 
      }}>
        {/* INTACT COLUMN */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ 
            position: "sticky", 
            top: 0, 
            background: `linear-gradient(to bottom, ${C.bg} 80%, transparent)`, 
            padding: "1rem 0 2rem", 
            zIndex: 10 
          }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.intact, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              🟢 Intact Pathway
            </h3>
            <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, fontStyle: "italic" }}>
              {intQ ? `"${intQ.prompt}"` : "Loading prompt..."}
            </p>
          </div>
          {intQ ? <NarrativeLoader question={intQ} /> : <div style={{ color: C.dim }}>Loading...</div>}
        </div>

        <div style={{ width: 1, background: C.ghost, flexShrink: 0 }} />

        {/* CIRCUMCISED COLUMN */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ 
            position: "sticky", 
            top: 0, 
            background: `linear-gradient(to bottom, ${C.bg} 80%, transparent)`, 
            padding: "1rem 0 2rem", 
            zIndex: 10 
          }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.circumcised, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              🔵 Circumcised Pathway
            </h3>
            <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, fontStyle: "italic" }}>
              {circQ ? `"${circQ.prompt}"` : "Loading prompt..."}
            </p>
          </div>
          {circQ ? <NarrativeLoader question={circQ} /> : <div style={{ color: C.dim }}>Loading...</div>}
        </div>
      </div>
    </div>
  );
}

// ── DATA LOADER HELPER ─────────────────────────────────────────────────────
function NarrativeLoader({ question }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/narratives?q=${question.id}`)
      .then(r => r.json())
      .then(d => setData(d));
  }, [question.id]);

  if (!data) return <div style={{ color: C.dim, padding: "2rem" }}>Loading narratives...</div>;
  if (data.n === 0 || !data.narratives || data.narratives.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", padding: "2rem" }}>No narrative responses available.</div>;
  }

  // Use the existing NarrativeList component
  return (
    <div style={{ marginTop: "-1rem" }}>
      <NarrativeList question={question} distribution={data.narratives} />
    </div>
  );
}
