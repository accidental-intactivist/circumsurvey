import { useState, useEffect, useMemo } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";

const UNIVERSAL_QUESTIONS = [
  { id: "culture_body_intervention_view", concept: "Body & Interventions" },
  { id: "final_core_principle_choice", concept: "Core Ethical Principle" },
  { id: "final_transparent_monster_resonance", concept: "'Transparent Monster' Resonance" },
];

const THEOLOGICAL_MIRRORS = [
  { 
    id: "identity_importance", 
    concept: "Importance to Identity", 
    jewish: "religion_jewish_identity_importance", 
    islamic: "religion_islamic_identity_importance", 
    christian: "religion_christian_circ_view" 
  },
  { 
    id: "theology_reasons", 
    concept: "Theological Basis", 
    jewish: "religion_jewish_theology_reasons", 
    islamic: "religion_islamic_religious_reasons", 
    christian: "religion_christian_theology_basis" 
  },
  { 
    id: "alt_interpretations", 
    concept: "Alternative Interpretations", 
    jewish: "religion_jewish_alt_interpretations", 
    islamic: "religion_islamic_alt_interpretations", 
    christian: "religion_christian_comments" 
  },
  { 
    id: "diversity_room", 
    concept: "Room for Diversity", 
    jewish: "religion_jewish_diversity_room", 
    islamic: "religion_islamic_diversity_room", 
    christian: null 
  },
];

const TRADITIONS = [
  { id: "Atheist / Agnostic / Secular", label: "Atheist / Secular", emoji: "⚛️", color: "#8bb8d9" },
  { id: "Christian", label: "Christian", emoji: "✝️", color: "#5b93c7" },
  { id: "Jewish", label: "Jewish", emoji: "✡️", color: "#d4a030" },
  { id: "Islamic", label: "Islamic", emoji: "☪️", color: "#68b878" },
];

export default function ReligiousMirrorsPage() {
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
          Religious & Secular Mirrors
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: C.muted, maxWidth: 800, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
          Explore how foundational beliefs and theological paradigms shape the circumcision debate. 
          The first section compares Universal perspectives across all four major belief cohorts. 
          The second section dives into the theological weeds for the three Abrahamic traditions.
        </p>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 2rem" }}>
        
        {/* SECTION A: UNIVERSAL (4-COLUMN) */}
        <div style={{ marginBottom: "6rem" }}>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.gold, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "3rem", textAlign: "center" }}>
            Section A: Universal Cross-Tradition Views
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
            {UNIVERSAL_QUESTIONS.map(qDef => (
              <UniversalRow key={qDef.id} qDef={qDef} questionsMap={questionsMap} />
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: C.ghost, margin: "0 0 6rem" }} />

        {/* SECTION B: THEOLOGICAL (3-COLUMN) */}
        <div>
          <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: C.gold, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "3rem", textAlign: "center" }}>
            Section B: Abrahamic Theological Mirrors
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
            {THEOLOGICAL_MIRRORS.map(pair => (
              <TheologicalRow key={pair.id} pair={pair} questionsMap={questionsMap} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── UNIVERSAL ROW (4 Columns) ──────────────────────────────────────────────
function UniversalRow({ qDef, questionsMap }) {
  const q = questionsMap[qDef.id];

  return (
    <section>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright, marginBottom: "0.5rem" }}>
          {qDef.concept}
        </h3>
        {q && (
          <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.muted, fontStyle: "italic", maxWidth: 800, margin: "0 auto" }}>
            "{q.prompt}"
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {TRADITIONS.map(tradition => (
          <div key={tradition.id} style={{ flex: "1 1 250px", minWidth: 250, background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
            <h4 style={{ fontFamily: FONT.condensed, color: tradition.color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", textAlign: "center" }}>
              {tradition.emoji} {tradition.label}
            </h4>
            {q ? (
              <DataLoader questionId={q.id} filter={`religion.primary_tradition=${encodeURIComponent(tradition.id)}`} />
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── THEOLOGICAL ROW (3 Columns) ────────────────────────────────────────────
function TheologicalRow({ pair, questionsMap }) {
  const cQ = pair.christian ? questionsMap[pair.christian] : null;
  const jQ = pair.jewish ? questionsMap[pair.jewish] : null;
  const iQ = pair.islamic ? questionsMap[pair.islamic] : null;

  return (
    <section>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright, marginBottom: "0.5rem" }}>
          {pair.concept}
        </h3>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Christian Column */}
        <div style={{ flex: "1 1 300px", minWidth: 250, background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
          <h4 style={{ fontFamily: FONT.condensed, color: TRADITIONS[1].color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            ✝️ Christian
          </h4>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, fontStyle: "italic", marginBottom: "1.5rem", minHeight: 45 }}>
            {cQ ? `"${cQ.prompt}"` : "Not asked in survey."}
          </p>
          {cQ && <DataLoader questionId={cQ.id} />}
        </div>

        {/* Jewish Column */}
        <div style={{ flex: "1 1 300px", minWidth: 250, background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
          <h4 style={{ fontFamily: FONT.condensed, color: TRADITIONS[2].color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            ✡️ Jewish
          </h4>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, fontStyle: "italic", marginBottom: "1.5rem", minHeight: 45 }}>
            {jQ ? `"${jQ.prompt}"` : "Not asked in survey."}
          </p>
          {jQ && <DataLoader questionId={jQ.id} />}
        </div>

        {/* Islamic Column */}
        <div style={{ flex: "1 1 300px", minWidth: 250, background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem" }}>
          <h4 style={{ fontFamily: FONT.condensed, color: TRADITIONS[3].color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            ☪️ Islamic
          </h4>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.muted, fontStyle: "italic", marginBottom: "1.5rem", minHeight: 45 }}>
            {iQ ? `"${iQ.prompt}"` : "Not asked in survey."}
          </p>
          {iQ && <DataLoader questionId={iQ.id} />}
        </div>
      </div>
    </section>
  );
}

// ── DATA LOADER HELPER ─────────────────────────────────────────────────────
function DataLoader({ questionId, filter }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let url = `${API_BASE}/response-distribution?q=${questionId}`;
    if (filter) url += `&filter=${filter}`;

    fetch(url)
      .then(r => r.json())
      .then(d => setData(d));
  }, [questionId, filter]);

  if (!data) return <div style={{ color: C.dim }}>Loading data...</div>;
  if (data.n === 0) return <div style={{ color: C.dim, fontStyle: "italic" }}>No responses.</div>;

  return (
    <DistributionChart 
      title="" 
      distribution={data} 
      cohortDistribution={null} 
      hideHeader 
    />
  );
}
