import { useState, useEffect } from "react";
import { C, FONT } from "../styles/tokens";
import { getResponseDistribution } from "../lib/api";
import { DEMOGRAPHIC_DIMENSIONS } from "../components/DemographicFilterBar";
import MiniSparkline, { colorForLabel } from "../components/MiniSparkline";

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

export default function DemographicsDashboardPage() {
  const [activeDemographic, setActiveDemographic] = useState(DEMOGRAPHIC_DIMENSIONS[0]);
  const [activeOutcome, setActiveOutcome] = useState(OUTCOME_QUESTIONS[0]);
  
  const [crossTabData, setCrossTabData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch baseline (all respondents for this outcome)
        const baseDist = await getResponseDistribution(activeOutcome.id);
        
        // Fetch distributions for each option in the active demographic
        const promises = activeDemographic.options.map(async (opt) => {
          const cohort = { [activeDemographic.column]: opt };
          const dist = await getResponseDistribution(activeOutcome.id, { cohort });
          return { option: opt, distribution: dist.distribution || [], n: dist.n || 0 };
        });
        
        const results = await Promise.all(promises);
        
        // Calculate max width for alignment
        const maxN = Math.max(...results.map(r => r.n), baseDist?.n || 0);
        
        setCrossTabData({
          baseline: { option: "All Respondents", distribution: baseDist?.distribution || [], n: baseDist?.n || 0 },
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
  }, [activeDemographic, activeOutcome]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: C.textBright, marginBottom: "0.5rem" }}>
          Demographics Dashboard
        </h1>
        <p style={{ fontFamily: FONT.body, color: C.muted, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Cross-tabulate core demographic cohorts against key outcome variables to identify 
          statistical correlations across the survey population.
        </p>
      </header>

      {/* Control Panel */}
      <div style={{
        background: C.bgSoft,
        border: `1px solid ${C.ghost}`,
        borderRadius: 12,
        padding: "1.5rem",
        marginBottom: "3rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "2rem"
      }}>
        <div style={{ flex: "1 1 300px" }}>
          <label style={{ display: "block", fontFamily: FONT.condensed, fontSize: "0.8rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Independent Variable (X)
          </label>
          <select 
            value={activeDemographic.id} 
            onChange={e => setActiveDemographic(DEMOGRAPHIC_DIMENSIONS.find(d => d.id === e.target.value))}
            style={{ width: "100%", padding: "0.6rem", background: C.bgDeep, color: C.text, border: `1px solid ${C.ghost}`, borderRadius: 6, fontFamily: FONT.body }}
          >
            {DEMOGRAPHIC_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div style={{ flex: "1 1 400px" }}>
          <label style={{ display: "block", fontFamily: FONT.condensed, fontSize: "0.8rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Dependent Variable (Y)
          </label>
          <select 
            value={activeOutcome.id} 
            onChange={e => setActiveOutcome(OUTCOME_QUESTIONS.find(d => d.id === e.target.value))}
            style={{ width: "100%", padding: "0.6rem", background: C.bgDeep, color: C.text, border: `1px solid ${C.ghost}`, borderRadius: 6, fontFamily: FONT.body }}
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
      
      {isBaseline && (
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
