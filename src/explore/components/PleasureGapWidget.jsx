import { useState, useEffect, useMemo } from "react";
import { getAggregate } from "../lib/api";
import { C, FONT } from "../styles/tokens";
import PleasureBarChart from "./PleasureBarChart";
import PleasureHorizontalBarChart from "./PleasureHorizontalBarChart";
import { useTooltip, Tooltip } from "./Tooltip";

const QUESTIONS = [
  { id: "exp_sex_rating_ease_of_orgasm", label: "Ease of Orgasm", colorVar: "--chart-0" },
  { id: "exp_sex_rating_sensitivity_light_touch", label: "Light Touch Sensitivity", colorVar: "--chart-1" },
  { id: "exp_sex_rating_variety_of_sensation", label: "Variety of Sensation", colorVar: "--chart-2" },
  { id: "exp_sex_rating_orgasm_duration", label: "Duration of Orgasm", colorVar: "--chart-3" },
  { id: "exp_sex_rating_pleasure_mobile_skin", label: "Pleasure from Mobile Skin", colorVar: "--chart-4" },
  { id: "exp_sex_rating_orgasm_intensity", label: "Orgasm Intensity", colorVar: "--chart-5" }
];

const COHORTS = [
  { id: "intact", label: "Intact", colorVar: "--path-intact" },
  { id: "restoring", label: "Restoring/Restored", colorVar: "--path-restoring" },
  { id: "circumcised", label: "Circumcised", colorVar: "--path-circumcised" }
];

function optionToValue(opt) {
  if (!opt) return null;
  const match = opt.match(/^([1-5])/);
  return match ? parseInt(match[1], 10) : null;
}

function calculateAverage(pathwayData) {
  if (!pathwayData || !pathwayData.distribution) return { average: 0, n: 0 };
  let sumProduct = 0;
  let totalN = 0;
  
  pathwayData.distribution.forEach(d => {
    const val = optionToValue(d.label);
    if (val !== null) {
      sumProduct += val * d.n;
      totalN += d.n;
    }
  });
  
  return {
    average: totalN > 0 ? parseFloat((sumProduct / totalN).toFixed(2)) : 0,
    n: totalN
  };
}

export default function PleasureGapWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCohorts, setActiveCohorts] = useState({ intact: true, restoring: true, circumcised: true });
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      QUESTIONS.map(q => getAggregate(q.id, { by: "pathway", cohort: "all" }))
    )
      .then(results => {
        if (cancelled) return;
        const mappedData = {};
        QUESTIONS.forEach((q, idx) => {
          mappedData[q.id] = results[idx].results || {};
        });
        setData(mappedData);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error("Failed to fetch aggregate scores", err);
        setError(err.message || String(err));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const activeCohortsList = useMemo(() => COHORTS.filter(c => activeCohorts[c.id]), [activeCohorts]);

  const stats = useMemo(() => {
    if (!data) return { matrix: {}, totalN: 0, sortedQuestions: QUESTIONS };
    const matrix = {};
    let totalN = 0;
    
    COHORTS.forEach(c => {
      if (!activeCohorts[c.id]) return;
      matrix[c.id] = {};
      QUESTIONS.forEach(q => {
        const pathData = data[q.id]?.[c.id];
        const res = calculateAverage(pathData);
        matrix[c.id][q.id] = res;
        totalN += res.n;
      });
    });
    
    const sortedQuestions = [...QUESTIONS].sort((a, b) => {
      const scoreA = matrix["intact"]?.[a.id]?.average || 0;
      const scoreB = matrix["intact"]?.[b.id]?.average || 0;
      return scoreA - scoreB;
    });

    return { matrix, totalN, sortedQuestions };
  }, [data, activeCohorts]);

  if (loading) return <div style={{ color: C.dim, padding: "2rem", textAlign: "center" }}>Loading Pleasure Gap Data...</div>;
  if (error) return <div style={{ color: C.red, padding: "2rem", textAlign: "center" }}>Error: {error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <style>{`
        @media (min-width: 768px) {
          .mobile-only-inline { display: none !important; }
          .desktop-hide { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-hide { display: none !important; }
        }
      `}</style>
      {/* ── Main Chart ── */}
      <div className="mobile-hide" style={{ 
        position: "relative", 
        width: "100%", 
        overflowX: "auto", 
        WebkitOverflowScrolling: "touch",
        paddingBottom: "1rem"
      }}>
        <div style={{ minWidth: 760 }}>
          <PleasureBarChart 
            stats={stats} 
            activeCohortsList={activeCohortsList} 
            groupBy="cohort" 
            showGap={true} 
            showTooltip={showTooltip} 
            moveTooltip={moveTooltip} 
            hideTooltip={hideTooltip} 
          />
        </div>
      </div>

      <div className="desktop-hide" style={{ position: "relative", width: "100%" }}>
        <PleasureHorizontalBarChart 
          stats={stats} 
          activeCohortsList={activeCohortsList} 
          groupBy="cohort" 
          showGap={true} 
          showTooltip={showTooltip} 
          moveTooltip={moveTooltip} 
          hideTooltip={hideTooltip} 
        />
      </div>

      {/* ── Cohort toggle pills ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "-1rem" }}>
        {COHORTS.map(c => {
          const active = activeCohorts[c.id];
          return (
            <button key={c.id} onClick={() => setActiveCohorts(prev => ({ ...prev, [c.id]: !prev[c.id] }))} style={{
              background: active ? `var(${c.colorVar})` : "transparent",
              color: active ? C.bg : C.muted,
              border: active ? "none" : `1px solid ${C.ghost}`,
              padding: "0.2rem 1rem",
              borderRadius: 20,
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: FONT.condensed,
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: active ? 1 : 0.5,
            }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Detailed Matrix ── */}
      <div style={{
        background: C.bgCard,
        borderTop: `4px solid ${C.ghost}`,
        borderRadius: 12,
        padding: "clamp(0.8rem, 3vw, 1.5rem)",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: "0.6rem" }}>
          <h3 style={{
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.85rem",
            color: C.goldBright,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0
          }}>
            Detailed Matrix (Average Ratings &amp; Samples)
          </h3>
          <span style={{ fontFamily: FONT.body, fontSize: "0.65rem", color: C.dim, fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "1rem" }} className="mobile-only-inline">
            Scroll →
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.body, fontSize: "0.85rem", color: C.text }}>
          <thead>
            <tr style={{ borderBottom: `2px solid rgba(255,255,255,0.1)` }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: C.muted }}>Sexual Experience Factor</th>
              {activeCohortsList.map(c => (
                <th key={c.id} style={{ textAlign: "right", padding: "0.5rem", color: C.textBright, fontWeight: 600 }}>{c.label}</th>
              ))}
              <th style={{ textAlign: "right", padding: "0.5rem", color: C.red, fontWeight: 700 }}>The Gap<br/><span style={{fontSize:"0.65rem", color: C.muted}}>(Intact vs. Circ)</span></th>
            </tr>
          </thead>
          <tbody>
            {stats.sortedQuestions.map((q, idx) => (
              <tr key={q.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)`, background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                <td style={{ padding: "0.8rem 0.5rem", fontWeight: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: `var(${q.colorVar})` }} />
                    <span>{q.label}</span>
                  </div>
                </td>
                {activeCohortsList.map(c => {
                  const valObj = stats.matrix[c.id]?.[q.id] || { average: 0, n: 0 };
                  return (
                    <td key={c.id} style={{ padding: "0.8rem 0.5rem", textAlign: "right" }}>
                      <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.textBright, fontSize: "0.9rem" }}>{valObj.average.toFixed(2)}</span>
                      <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.muted, marginLeft: "0.4rem" }}>n={valObj.n}</span>
                    </td>
                  );
                })}
                <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", borderLeft: `1px solid rgba(255,255,255,0.05)` }}>
                  {(() => {
                    const intactAvg = stats.matrix["intact"]?.[q.id]?.average || 0;
                    const circAvg = stats.matrix["circumcised"]?.[q.id]?.average || 0;
                    const diff = intactAvg - circAvg;
                    return (
                      <span style={{ fontFamily: FONT.mono, fontWeight: 800, color: diff > 0 ? C.red : C.green, fontSize: "0.95rem" }}>
                        {diff > 0 ? "-" : "+"}{Math.abs(diff).toFixed(2)}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
