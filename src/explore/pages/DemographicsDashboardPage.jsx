import { useState, useEffect } from "react";
import { C, FONT, RAINBOW } from "../styles/tokens";
import { getResponseDistribution } from "../lib/api";
import DemographicFilterBar, { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import MiniSparkline, { colorForLabel } from "../components/MiniSparkline";
import ThemeToggle from "../components/ThemeToggle";

const OUTCOME_QUESTIONS = [
  { id: "circ_regret_feeling", text: "Circumcised: Resentment or Regret" },
  { id: "intact_regret_feeling", text: "Intact: Resentment or Regret" },
  { id: "circ_awareness_age", text: "Circumcised: Age of Awareness" },
  { id: "intact_circ_awareness_age", text: "Intact: Age of Awareness" },
  { id: "circ_notice_same_status", text: "Circumcised: Noticing Same Status" },
  { id: "intact_notice_same_status", text: "Intact: Noticing Same Status" },
  { id: "circ_prior_thought_level", text: "Circumcised: Prior Thought Level" },
  { id: "intact_prior_thought_level", text: "Intact: Prior Thought Level" },
];

export default function DemographicsDashboardPage({ routerState, navigate, updateState }) {
  const cohort = routerState?.cohort;
  const [activeDemographic, setActiveDemographic] = useState(DEMOGRAPHIC_DIMENSIONS[0]);
  const [activeOutcome, setActiveOutcome] = useState(OUTCOME_QUESTIONS[0]);
  
  const [crossTabData, setCrossTabData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Clean cohort: omit the active demographic column to avoid self-filtering conflicts
        const cleanCohort = { ...(cohort || {}) };
        delete cleanCohort[activeDemographic.column];

        // Fetch baseline (all respondents for this outcome under clean cohort)
        const baseDist = await getResponseDistribution(activeOutcome.id, { cohort: cleanCohort });
        
        // Fetch distributions for each option in the active demographic
        const promises = activeDemographic.options.map(async (opt) => {
          const optValue = typeof opt === "string" ? opt : opt.value;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          
          const optionCohort = { 
            ...cleanCohort, 
            [activeDemographic.column]: optValue 
          };
          const dist = await getResponseDistribution(activeOutcome.id, { cohort: optionCohort });
          return { option: optLabel, distribution: dist.distribution || [], n: dist.n || 0 };
        });
        
        const results = await Promise.all(promises);
        
        // Calculate max width for alignment
        const maxN = Math.max(...results.map(r => r.n), baseDist?.n || 0);
        
        setCrossTabData({
          baseline: { 
            option: Object.keys(cleanCohort).length > 0 ? "All Cohort Respondents" : "All Respondents", 
            distribution: baseDist?.distribution || [], 
            n: baseDist?.n || 0 
          },
          cohorts: results,
          maxN
        });
      } catch (err) {
        console.error("Failed to load cross-tab data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeDemographic, activeOutcome, JSON.stringify(cohort)]);

  const isLowN = crossTabData.baseline?.n > 0 && crossTabData.baseline.n < 20;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header: breadcrumb + back */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1.1rem",
          flexWrap: "wrap",
        }}>
          <a href="#/" style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.muted,
          }}>← Master Index</a>
          <span style={{ color: C.dim }}>/</span>
          <span style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.gold,
          }}>Demographics Dashboard</span>
          
          <div style={{ marginLeft: "auto" }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Rainbow accent */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, marginBottom: "1.5rem", opacity: 0.5 }} />

        <header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 800 }}>
            Demographics Dashboard
          </h1>
          <p style={{ fontFamily: FONT.body, color: C.muted, maxWidth: 650, margin: "0 auto", lineHeight: 1.6 }}>
            Cross-tabulate core demographic cohorts against key outcome variables to identify 
            statistical correlations across the survey population.
          </p>
        </header>

        {/* Two-panel: cohort filters on left, content on right */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: cohort filter */}
          <aside className="explore-nav" style={{ position: "sticky", top: "1rem", maxHeight: "calc(100vh - 2rem)", overflowY: "auto", paddingRight: "0.3rem" }}>
            <DemographicFilterBar
              cohort={cohort}
              onChange={(c) => updateState({ cohort: c })}
            />

            {/* Cohort size indicator */}
            {cohort && crossTabData.baseline && (
              <div style={{
                marginTop: "1.1rem",
                padding: "0.75rem 0.9rem",
                background: C.bgCard,
                border: `1px solid ${C.ghost}`,
                borderRadius: 8,
              }}>
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: "0.35rem",
                }}>Filtered Sample</div>
                <div style={{
                  fontFamily: FONT.mono,
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: C.goldBright,
                }}>{crossTabData.baseline.n}</div>
                <div style={{
                  fontFamily: FONT.body,
                  fontSize: "0.72rem",
                  color: C.dim,
                  marginTop: "0.2rem",
                }}>
                  respondents match active filters
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT: Main content */}
          <main>
            {/* Low n warning */}
            {isLowN && (
              <div style={{
                background: "rgba(217,79,79,0.08)",
                border: `1px solid rgba(217,79,79,0.25)`,
                borderRadius: 8,
                padding: "0.85rem 1.2rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.8rem"
              }}>
                <span style={{ fontSize: "1.2rem", marginTop: "-0.1rem" }}>⚠️</span>
                <div style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: C.red, lineHeight: 1.5 }}>
                  <strong style={{ fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.4rem" }}>Low Sample Warning:</strong> 
                  Sample size is below 20 (n = {crossTabData.baseline.n}). These percentages may not be representative of the broader population with these characteristics. Use for directional insight only.
                </div>
              </div>
            )}

            {/* Control Panel */}
            <div style={{
              background: C.bgSoft,
              border: `1px solid ${C.ghost}`,
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1.25rem"
            }}>
              <div style={{ flex: "1 1 240px" }}>
                <label style={{ display: "block", fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem", fontWeight: 700 }}>
                  Independent Variable (X)
                </label>
                <select 
                  value={activeDemographic.id} 
                  onChange={e => setActiveDemographic(DEMOGRAPHIC_DIMENSIONS.find(d => d.id === e.target.value))}
                  style={{ width: "100%", padding: "0.55rem", background: C.bgDeep, color: C.text, border: `1px solid ${C.ghost}`, borderRadius: 6, fontFamily: FONT.body, fontSize: "0.85rem" }}
                >
                  {DEMOGRAPHIC_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>

              <div style={{ flex: "1 1 320px" }}>
                <label style={{ display: "block", fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem", fontWeight: 700 }}>
                  Dependent Variable (Y)
                </label>
                <select 
                  value={activeOutcome.id} 
                  onChange={e => setActiveOutcome(OUTCOME_QUESTIONS.find(d => d.id === e.target.value))}
                  style={{ width: "100%", padding: "0.55rem", background: C.bgDeep, color: C.text, border: `1px solid ${C.ghost}`, borderRadius: 6, fontFamily: FONT.body, fontSize: "0.85rem" }}
                >
                  {OUTCOME_QUESTIONS.map(q => <option key={q.id} value={q.id}>{q.text}</option>)}
                </select>
              </div>
            </div>

            {/* Data Visualization */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "2rem" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: C.muted, fontStyle: "italic" }}>Calculating cross-tabulations...</div>
              ) : crossTabData.cohorts ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Baseline */}
                  <CrossTabRow data={crossTabData.baseline} maxN={crossTabData.maxN} isBaseline />
                  
                  <div style={{ height: 1, background: C.ghost, margin: "0.5rem 0" }} />
                  
                  {/* Cohorts */}
                  {crossTabData.cohorts.map((c, i) => (
                    <CrossTabRow key={i} data={c} maxN={crossTabData.maxN} />
                  ))}
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function CrossTabRow({ data, maxN, isBaseline = false }) {
  const widthPct = maxN > 0 ? (data.n / maxN) * 100 : 0;
  
  if (data.n === 0 && !isBaseline) return null; // Skip empty slices
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", alignItems: "baseline" }}>
        <span style={{ 
          fontFamily: isBaseline ? FONT.condensed : FONT.body, 
          fontWeight: isBaseline ? 700 : 500,
          textTransform: isBaseline ? "uppercase" : "none",
          letterSpacing: isBaseline ? "0.05em" : "normal",
          color: isBaseline ? C.goldBright : C.textBright, 
          fontSize: isBaseline ? "1rem" : "0.95rem" 
        }}>
          {data.option}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: "0.75rem", color: C.muted }}>n = {data.n}</span>
      </div>
      
      {data.n > 0 ? (
        <div style={{ display: "flex" }}>
          <MiniSparkline distribution={data.distribution} width={`${widthPct}%`} height={16} />
        </div>
      ) : (
        <div style={{ height: 16, background: C.bgDeep, borderRadius: 2, opacity: 0.5 }} />
      )}
      
      {isBaseline && data.n > 0 && (
        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
          {data.distribution.map((d, i) => {
            const pct = (d.n / data.n) * 100;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: 8, height: 8, background: colorForLabel(d.label), borderRadius: "50%" }} />
                <span style={{ fontFamily: FONT.body, fontSize: "0.7rem", color: C.muted }}>{d.label} ({pct.toFixed(0)}%)</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
