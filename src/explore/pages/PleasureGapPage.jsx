import { useState, useEffect, useMemo } from "react";
import { getAggregate } from "../lib/api";
import { C, FONT, RAINBOW, resolveCssColor } from "../styles/tokens";
import DemographicFilterBar from "../components/DemographicFilterBar";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { PATHWAYS } from "../lib/pathways";

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
  { id: "circumcised", label: "Circumcised", colorVar: "--path-circumcised" },
  { id: "restoring", label: "Restoring/Restored", colorVar: "--path-restoring" }
];

// Helper to extract rating value from option text
function optionToValue(opt) {
  if (!opt) return null;
  const match = opt.match(/^([1-5])/);
  return match ? parseInt(match[1], 10) : null;
}

// Calculate mean rating score from pathway distribution results
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

export default function PleasureGapPage({ routerState, navigate, updateState }) {
  const { cohort } = routerState;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState("cohort"); // "cohort" or "factor"
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Fetch averages whenever the cohort filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      QUESTIONS.map(q => getAggregate(q.id, { by: "pathway", cohort }))
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

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(cohort)]);

  // Compute final statistics
  const stats = useMemo(() => {
    if (!data) return { matrix: {}, totalN: 0 };
    const matrix = {};
    let totalN = 0;
    
    COHORTS.forEach(c => {
      matrix[c.id] = {};
      QUESTIONS.forEach(q => {
        const pathData = data[q.id]?.[c.id];
        const res = calculateAverage(pathData);
        matrix[c.id][q.id] = res;
        totalN += res.n;
      });
    });
    
    // Average N across the factors for descriptive display
    const avgN = Math.round(totalN / QUESTIONS.length);

    return { matrix, totalN, avgN };
  }, [data]);

  // Cohort labels list for active description filter
  const cohortLabel = useMemo(() => {
    if (!cohort) return null;
    const parts = [];
    for (const [k, v] of Object.entries(cohort)) {
      let label = Array.isArray(v) ? v.join(", ") : String(v);
      label = label.replace(/\s*\([^)]*\)\s*$/, "");
      if (label.length > 25) label = label.slice(0, 22) + "…";
      parts.push(label);
    }
    return parts.join(" · ");
  }, [cohort]);

  // Render SVG Chart
  const svgChart = useMemo(() => {
    if (loading || error || !data) return null;

    const chartWidth = 550;
    const chartHeight = 300;
    const yTop = 30;
    const yBottom = 330;
    const xMarginLeft = 45;
    
    // Y scale mapping
    const getY = (score) => yBottom - (score / 5) * chartHeight;

    // Grid ticks (0 to 5)
    const ticks = [0, 1, 2, 3, 4, 5];
    const halfTicks = [0.5, 1.5, 2.5, 3.5, 4.5];

    if (groupBy === "cohort") {
      // Grouping by Cohort: X-axis has 3 cohorts. Under each, 6 factors.
      const groupWidth = 140;
      const groupGap = 25;
      
      return (
        <svg viewBox="0 0 740 380" style={{ width: "100%", height: "auto", overflow: "visible" }}>
          {/* Grid lines */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={xMarginLeft} y1={getY(t)} x2={chartWidth + 10} y2={getY(t)} stroke={C.ghost} strokeWidth="1" />
              <text x={xMarginLeft - 10} y={getY(t) + 4} textAnchor="end" style={{ fontFamily: FONT.mono, fontSize: "10px", fill: C.muted }}>
                {t.toFixed(1)}
              </text>
            </g>
          ))}
          {halfTicks.map(t => (
            <line key={t} x1={xMarginLeft} y1={getY(t)} x2={chartWidth + 10} y2={getY(t)} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          ))}

          {/* Render clusters */}
          {COHORTS.map((c, cIdx) => {
            const groupX = xMarginLeft + 20 + cIdx * (groupWidth + groupGap);
            const factorBarWidth = 16;
            const factorBarGap = 2;
            const clusterWidth = QUESTIONS.length * factorBarWidth + (QUESTIONS.length - 1) * factorBarGap;
            const offsetLeft = (groupWidth - clusterWidth) / 2;

            return (
              <g key={c.id}>
                {/* Cohort Label underneath cluster */}
                <text 
                  x={groupX + groupWidth / 2} 
                  y={yBottom + 22} 
                  textAnchor="middle" 
                  style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "12px", fill: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  {c.label}
                </text>

                {/* Factors inside this cohort */}
                {QUESTIONS.map((q, qIdx) => {
                  const factorRes = stats.matrix[c.id]?.[q.id] || { average: 0, n: 0 };
                  const barX = groupX + offsetLeft + qIdx * (factorBarWidth + factorBarGap);
                  const barHeight = (factorRes.average / 5) * chartHeight;
                  const barColor = resolveCssColor(q.colorVar);

                  return (
                    <g key={q.id}>
                      <rect
                        x={barX}
                        y={getY(factorRes.average)}
                        width={factorBarWidth}
                        height={barHeight}
                        fill={barColor}
                        rx="2"
                        onMouseEnter={(e) => showTooltip(e, `${c.label} · ${q.label}: ${factorRes.average.toFixed(2)} (n=${factorRes.n})`)}
                        onMouseMove={moveTooltip}
                        onMouseLeave={hideTooltip}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                      />
                      {/* Numeric value label on top of bar */}
                      {factorRes.average > 0 && (
                        <text
                          x={barX + factorBarWidth / 2}
                          y={getY(factorRes.average) - 6}
                          textAnchor="middle"
                          style={{ fontFamily: FONT.mono, fontSize: "9px", fill: C.textBright, fontWeight: 600 }}
                        >
                          {factorRes.average.toFixed(1)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Chart Legend on the Right */}
          <g transform={`translate(${chartWidth + 35}, ${yTop})`}>
            <text x="0" y="-8" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "11px", fill: C.goldBright, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Rating Factor
            </text>
            {QUESTIONS.map((q, idx) => (
              <g key={q.id} transform={`translate(0, ${idx * 22 + 10})`}>
                <rect width="12" height="12" rx="2" fill={resolveCssColor(q.colorVar)} />
                <text x="20" y="10" style={{ fontFamily: FONT.body, fontSize: "11px", fill: C.text }}>
                  {q.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      );
    } else {
      // Grouping by Factor: X-axis has 6 factors. Under each, 3 cohorts.
      const clusterWidth = 72;
      const clusterGap = 12;
      
      return (
        <svg viewBox="0 0 740 380" style={{ width: "100%", height: "auto", overflow: "visible" }}>
          {/* Grid lines */}
          {ticks.map(t => (
            <g key={t}>
              <line x1={xMarginLeft} y1={getY(t)} x2={chartWidth + 10} y2={getY(t)} stroke={C.ghost} strokeWidth="1" />
              <text x={xMarginLeft - 10} y={getY(t) + 4} textAnchor="end" style={{ fontFamily: FONT.mono, fontSize: "10px", fill: C.muted }}>
                {t.toFixed(1)}
              </text>
            </g>
          ))}
          {halfTicks.map(t => (
            <line key={t} x1={xMarginLeft} y1={getY(t)} x2={chartWidth + 10} y2={getY(t)} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          ))}

          {/* Render clusters */}
          {QUESTIONS.map((q, qIdx) => {
            const clusterX = xMarginLeft + 10 + qIdx * (clusterWidth + clusterGap);
            const cohortBarWidth = 18;
            const cohortBarGap = 2;
            const totalBarWidth = COHORTS.length * cohortBarWidth + (COHORTS.length - 1) * cohortBarGap;
            const offsetLeft = (clusterWidth - totalBarWidth) / 2;

            return (
              <g key={q.id}>
                {/* Factor Label underneath cluster */}
                <text 
                  x={clusterX + clusterWidth / 2} 
                  y={yBottom + 22} 
                  textAnchor="middle" 
                  style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "9px", fill: C.textBright, letterSpacing: "0.02em", textTransform: "uppercase" }}
                >
                  {q.label.split(" ").map((word, wIdx) => (
                    <tspan key={wIdx} x={clusterX + clusterWidth / 2} dy={wIdx > 0 ? "11" : "0"}>
                      {word}
                    </tspan>
                  ))}
                </text>

                {/* Cohorts inside this factor */}
                {COHORTS.map((c, cIdx) => {
                  const factorRes = stats.matrix[c.id]?.[q.id] || { average: 0, n: 0 };
                  const barX = clusterX + offsetLeft + cIdx * (cohortBarWidth + cohortBarGap);
                  const barHeight = (factorRes.average / 5) * chartHeight;
                  const barColor = resolveCssColor(c.colorVar);

                  return (
                    <g key={c.id}>
                      <rect
                        x={barX}
                        y={getY(factorRes.average)}
                        width={cohortBarWidth}
                        height={barHeight}
                        fill={barColor}
                        rx="2"
                        onMouseEnter={(e) => showTooltip(e, `${q.label} · ${c.label}: ${factorRes.average.toFixed(2)} (n=${factorRes.n})`)}
                        onMouseMove={moveTooltip}
                        onMouseLeave={hideTooltip}
                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                      />
                      {/* Numeric value label on top of bar */}
                      {factorRes.average > 0 && (
                        <text
                          x={barX + cohortBarWidth / 2}
                          y={getY(factorRes.average) - 6}
                          textAnchor="middle"
                          style={{ fontFamily: FONT.mono, fontSize: "9px", fill: C.textBright, fontWeight: 600 }}
                        >
                          {factorRes.average.toFixed(1)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Chart Legend on the Right */}
          <g transform={`translate(${chartWidth + 35}, ${yTop + 30})`}>
            <text x="0" y="-8" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "11px", fill: C.goldBright, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Cohort
            </text>
            {COHORTS.map((c, idx) => (
              <g key={c.id} transform={`translate(0, ${idx * 22 + 10})`}>
                <rect width="12" height="12" rx="2" fill={resolveCssColor(c.colorVar)} />
                <text x="20" y="10" style={{ fontFamily: FONT.body, fontSize: "11px", fill: C.text }}>
                  {c.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      );
    }
  }, [loading, error, data, groupBy, stats]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1.2rem",
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
          }}>Tools</span>
          <span style={{ color: C.dim }}>/</span>
          <span style={{
            fontFamily: FONT.condensed,
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.textBright,
          }}>The Pleasure Gap</span>
        </div>

        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.5, marginBottom: "1.5rem" }} />

        {/* Two-panel layout: cohort filter left, chart right */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1.2rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: cohort filter sidebar */}
          <aside className="explore-nav" style={{ position: "sticky", top: "1rem", maxHeight: "calc(100vh - 2rem)", overflowY: "auto", paddingRight: "0.3rem" }}>
            <DemographicFilterBar
              cohort={cohort}
              onChange={(c) => updateState({ cohort: c })}
            />

            <div style={{
              marginTop: "1.25rem",
              padding: "0.75rem 0.85rem",
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 7,
              fontFamily: FONT.body,
              fontSize: "0.78rem",
              color: C.muted,
              lineHeight: 1.55,
            }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: C.goldBright,
                marginBottom: "0.4rem",
                fontWeight: 700,
              }}>★ The Pleasure Gap</div>
              This comparison isolates average ratings (1 = Low/Poor to 5 = High/Excellent) for six critical factors of personal sexual experience.
              <br/><br/>
              Apply a demographic filter on the left to see how these ratios adapt across generations, locations, or upbringing environments.
            </div>
          </aside>

          {/* RIGHT: Main Chart Panel */}
          <main>
            <div className="crt-frame" style={{ borderRadius: 8, overflow: "hidden", marginBottom: "1.5rem" }}>
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>

              {/* Title Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.gold,
                    marginBottom: "0.35rem",
                  }}>★ Interactive Exhibit ★</div>
                  <h2 style={{
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: "1.8rem",
                    color: C.textBright,
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                    marginBottom: "0.4rem",
                  }}>A Look at the Pleasure Gap</h2>
                  <p style={{
                    fontFamily: FONT.body,
                    fontSize: "0.88rem",
                    color: C.muted,
                    lineHeight: 1.5,
                  }}>
                    Averaged scores for male-pathway sexual experiences. 
                    {stats.avgN > 0 && ` Mean sample size per factor: n≈${stats.avgN}.`}
                  </p>
                </div>

                {/* Group By Controls */}
                <div style={{
                  display: "flex",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 20,
                  padding: 3,
                  border: `1px solid ${C.ghost}`,
                }}>
                  <button
                    onClick={() => setGroupBy("cohort")}
                    style={{
                      background: groupBy === "cohort" ? C.ghost : "transparent",
                      color: groupBy === "cohort" ? C.textBright : C.muted,
                      border: "none",
                      borderRadius: 18,
                      padding: "0.35rem 0.8rem",
                      fontFamily: FONT.condensed,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >Group by Cohort</button>
                  <button
                    onClick={() => setGroupBy("factor")}
                    style={{
                      background: groupBy === "factor" ? C.ghost : "transparent",
                      color: groupBy === "factor" ? C.textBright : C.muted,
                      border: "none",
                      borderRadius: 18,
                      padding: "0.35rem 0.8rem",
                      fontFamily: FONT.condensed,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >Group by Factor</button>
                </div>
              </div>

              {/* Cohort badge */}
              {cohortLabel && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.3rem 0.7rem",
                  background: "rgba(212,160,48,0.1)",
                  border: `1px solid rgba(212,160,48,0.35)`,
                  borderRadius: 999,
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.goldBright,
                  marginBottom: "1rem",
                }}>
                  <span style={{ opacity: 0.7 }}>Cohort:</span>
                  <span style={{ fontWeight: 700 }}>{cohortLabel}</span>
                </div>
              )}

              {/* Chart rendering or loaders */}
              {loading && (
                <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
                  Calculating sexual experience averages...
                </div>
              )}
              {error && (
                <div style={{ padding: "2rem", color: C.red, fontFamily: FONT.mono, fontSize: "0.8rem", textAlign: "center" }}>
                  <strong>Failed to render Pleasure Gap:</strong> {error}
                </div>
              )}
              {!loading && !error && svgChart}
            </div>

            {/* Raw Numerical Table */}
            {!loading && !error && data && (
              <div style={{
                background: C.bgCard,
                border: `1px solid ${C.ghost}`,
                borderRadius: 8,
                padding: "1.2rem",
                overflowX: "auto"
              }}>
                <h3 style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: C.goldBright,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.8rem",
                  borderBottom: `1px solid ${C.ghost}`,
                  paddingBottom: "0.4rem"
                }}>
                  Detailed Matrix (Average Ratings &amp; Samples)
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.body, fontSize: "0.85rem", color: C.text }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.ghost}` }}>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: C.muted }}>Sexual Experience Factor</th>
                      {COHORTS.map(c => (
                        <th key={c.id} style={{ textAlign: "right", padding: "0.5rem", color: C.textBright, fontWeight: 600 }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {QUESTIONS.map((q, idx) => (
                      <tr key={q.id} style={{ borderBottom: `1px solid ${C.ghost}`, background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                        <td style={{ padding: "0.6rem 0.5rem", fontWeight: 500 }}>{q.label}</td>
                        {COHORTS.map(c => {
                          const valObj = stats.matrix[c.id]?.[q.id] || { average: 0, n: 0 };
                          return (
                            <td key={c.id} style={{ padding: "0.6rem 0.5rem", textAlign: "right" }}>
                              <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.textBright }}>{valObj.average.toFixed(2)}</span>
                              <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted, marginLeft: "0.3rem" }}>n={valObj.n}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
