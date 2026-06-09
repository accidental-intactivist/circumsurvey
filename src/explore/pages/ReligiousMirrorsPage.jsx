import { useState, useEffect, useMemo } from "react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import { flattenMultiSelect } from "../lib/formatters";

const UNIVERSAL_QUESTIONS = [
  { id: "culture_body_intervention_view", concept: "Body & Interventions" },
  { id: "final_core_principle_choice", concept: "Core Ethical Principle" },
];

const THEOLOGICAL_MIRRORS = [
  { 
    id: "upbringing_view", 
    concept: "Upbringing View", 
    jewish: "religion_jewish_brit_milah_view", 
    islamic: "religion_islamic_khitan_view", 
    christian: "religion_christian_circ_view" 
  },
  { 
    id: "identity_importance", 
    concept: "Importance to Identity", 
    jewish: "religion_jewish_identity_importance", 
    islamic: "religion_islamic_identity_importance", 
    christian: null
  },
  { 
    id: "theology_awareness", 
    concept: "Theological Awareness", 
    jewish: "religion_jewish_theology_awareness", 
    islamic: "religion_islamic_religious_awareness", 
    christian: null 
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
    jewish: "religion_jewish_alt_thoughts",
    islamic: "religion_islamic_alt_thoughts",
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
  { id: "Atheist / Agnostic / Secular", label: "Atheist / Secular", emoji: "⚛️", color: "#8bb8d9", filter: "religion.primary_tradition=No significant religious/spiritual/cultural tradition influencing this topic." },
  { id: "Christian", label: "Christian", emoji: "✝️", color: "#5b93c7", filter: "religion.primary_tradition=Christian" },
  { id: "Jewish", label: "Jewish", emoji: "✡️", color: "#d4a030", filter: "religion.primary_tradition=Jewish" },
  { id: "Islamic", label: "Islamic", emoji: "☪️", color: "#68b878", filter: "religion.primary_tradition=Islamic" },
];

export default function ReligiousMirrorsPage({ navigate }) {
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
        <InlineBreadcrumb currentRoute="religious-mirrors" navigate={navigate} />
        
        {/* Header Callout */}
        <div style={{
          background: `linear-gradient(135deg, rgba(212,160,48,0.08) 0%, rgba(212,160,48,0.01) 100%)`,
          border: `1px solid rgba(212,160,48,0.22)`,
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "4rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})` }} />
          <div style={{
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "0.6rem"
          }}>
            ★ Interactive Exhibit 09 ★
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
            Religious Mirrors &amp; Theology
          </h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            color: C.text,
            lineHeight: 1.6,
            maxWidth: 900,
            margin: 0
          }}>
            How do religious traditions shape perspectives on bodily modification? This exhibit cross-tabulates survey outcomes across four primary groups: <strong>Secular/Atheist</strong>, <strong>Christian</strong>, <strong>Jewish</strong>, and <strong>Islamic</strong>.
            <br /><br />
            Explore general cultural attitudes (Section A) and compare matched theological narratives side-by-side (Section B) to observe how scriptural interpretation and family covenant traditions drive the dataset.
          </p>
        </div>

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
    <section style={{
      background: "rgba(255, 255, 255, 0.01)",
      border: `1px solid ${C.ghost}`,
      borderRadius: 16,
      padding: "2rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    }}>
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "-0.015em" }}>
          {qDef.concept}
        </h3>
        {q && (
          <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.muted, fontStyle: "italic", maxWidth: 800, margin: "0 auto", lineHeight: 1.45 }}>
            "{q.prompt}"
          </p>
        )}
      </div>

      {/* Shared Key definition for long options */}
      {q && q.opts && q.opts.some(opt => opt.includes(":")) && (
        <div style={{
          maxWidth: 900,
          margin: "0 auto 2.5rem",
          padding: "1.2rem 1.6rem",
          background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
          border: `1px solid ${C.ghost}`,
          borderRadius: 12,
          fontSize: "0.84rem",
          color: C.text,
          lineHeight: 1.5,
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
        }}>
          <div style={{
            fontFamily: FONT.condensed,
            color: C.gold,
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "0.2rem"
          }}>
            <span>★</span> Shared Response Legend / Key
          </div>
          {q.opts.map((opt, idx) => {
            if (!opt.includes(":")) return null;
            const [title, desc] = opt.split(":");
            return (
              <div key={idx} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, color: C.textBright }}>{title}:</span>
                <span style={{ color: C.muted }}>{desc.trim()}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {TRADITIONS.map(tradition => (
          <div key={tradition.id} style={{ 
            flex: "1 1 250px", 
            minWidth: 250, 
            background: C.bgCard, 
            border: `1px solid ${C.ghost}`, 
            borderRadius: 12, 
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h4 style={{ fontFamily: FONT.condensed, color: tradition.color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, textAlign: "center", display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
              <IconifyEmoji emoji={tradition.emoji} />
              <span>{tradition.label}</span>
            </h4>
            
            {q ? (
              <DataLoader question={q} filter={tradition.filter} shortenLabels={true} />
            ) : (
              <div style={{ color: C.dim, textAlign: "center", fontStyle: "italic", fontSize: "0.85rem" }}>Loading question...</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── THEOLOGICAL ROW (3 Columns) ────────────────────────────────────────────
function TheologicalRow({ pair, questionsMap }) {
  // Filter TRADITIONS to exclude Atheist/Secular for the theological mirrors (which are Abrahamic/3-column)
  const abrahamicTraditions = TRADITIONS.filter(t => t.id !== "Atheist / Agnostic / Secular");

  return (
    <section style={{
      background: "rgba(255, 255, 255, 0.01)",
      border: `1px solid ${C.ghost}`,
      borderRadius: 16,
      padding: "2rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    }}>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "-0.015em" }}>
          {pair.concept}
        </h3>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {abrahamicTraditions.map(tradition => {
          let qKey = tradition.id.toLowerCase();
          
          const qId = pair[qKey];
          const q = qId ? questionsMap[qId] : null;

          return (
            <div key={tradition.id} style={{ 
              flex: "1 1 300px", 
              minWidth: 250, 
              background: C.bgCard, 
              border: `1px solid ${C.ghost}`, 
              borderRadius: 12, 
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <h4 style={{ fontFamily: FONT.condensed, color: tradition.color, fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <IconifyEmoji emoji={tradition.emoji} />
                <span>{tradition.label}</span>
              </h4>

              {q ? (
                <>
                  <div style={{ 
                    fontFamily: FONT.body, 
                    fontSize: "0.88rem", 
                    color: C.textBright, 
                    fontStyle: "italic", 
                    lineHeight: 1.45,
                    borderLeft: `2px solid ${tradition.color}`,
                    paddingLeft: "0.75rem",
                    minHeight: 45,
                    display: "flex",
                    alignItems: "center"
                  }}>
                    "{q.prompt}"
                  </div>
                  
                  {/* Badges for Question Meta */}
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{
                      fontFamily: FONT.condensed, fontSize: "0.58rem", fontWeight: 700,
                      letterSpacing: "0.05em", color: q.type === "open_text" ? "#a8b5c4" : C.dim,
                      background: q.type === "open_text" ? "rgba(168,181,196,0.1)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${q.type === "open_text" ? "rgba(168,181,196,0.2)" : C.ghost}`,
                      borderRadius: 999, padding: "0.1rem 0.4rem",
                    }}>
                      {q.type === "open_text" ? "QUAL" : "QUANT"}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: "0.58rem", color: C.dim }}>
                      {q.id}
                    </span>
                  </div>

                  <DataLoader question={q} />
                </>
              ) : (
                <div style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px dashed ${C.ghost}`,
                  borderRadius: 8,
                  padding: "2rem 1rem",
                  color: C.dim,
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.005)",
                  minHeight: 180
                }}>
                  This topic was not asked of {tradition.label} respondents.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
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

