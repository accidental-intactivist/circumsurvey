import { useState, useEffect, useMemo } from "react";
import { getAggregate } from "../lib/api";
import { C, FONT, RAINBOW, resolveCssColor } from "../styles/tokens";
import DemographicFilterBar from "../components/DemographicFilterBar";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { PATHWAYS } from "../lib/pathways";
import PleasureBarChart from "../components/PleasureBarChart";
import PleasureDumbbellChart from "../components/PleasureDumbbellChart";
import PleasureRadarChart from "../components/PleasureRadarChart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";

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

const QUALITATIVE_QUOTES = {
  "intact": {
    "exp_sex_rating_ease_of_orgasm": "It’s not a struggle to reach orgasm. The head of my penis is sensitive and feels every thrust.",
    "exp_sex_rating_sensitivity_light_touch": "It is very sensitive to all types of touch and I love that. The most sensitive areas for me are my glans and of course my frenulum.",
    "exp_sex_rating_variety_of_sensation": "The most pleasurable parts are the tip of the foreskin and the inner foreskin. The glans is sensitive too.",
    "exp_sex_rating_orgasm_duration": "The feeling kind of pulses out from the genitals. Lasts about 15-20 seconds... always satisfying.",
    "exp_sex_rating_pleasure_mobile_skin": "The build-up is usually very gradual and long-lasting. The final release is intensely pleasurable, focused mainly on the foreskin opening and inner foreskin.",
    "exp_sex_rating_orgasm_intensity": "When I reach orgasm it starts from the top of my foreskin and sends a wave of full body release that is incredibly intense."
  },
  "circumcised": {
    "exp_sex_rating_ease_of_orgasm": "Currently my penis is less sensitive and requires effort to erect and orgasm.",
    "exp_sex_rating_sensitivity_light_touch": "My penis roughly the same degree of sensitivity as my forearm, with it being the most sensitive at its base and getting less sensitive towards the tip.",
    "exp_sex_rating_variety_of_sensation": "The most sensitive parts (inner skin and frenulum remnant) ends abruptly into the rest of the shaft skin.",
    "exp_sex_rating_orgasm_duration": "I feel very little build up. It comes on suddenly... short and unsatisfying.",
    "exp_sex_rating_pleasure_mobile_skin": "Lube for masturbation makes things messier and less easy. Female partners don't seem to realize they require lube.",
    "exp_sex_rating_orgasm_intensity": "There is almost no sensation during buildup. Upon getting close to orgasm, the sensitivity increases and then quickly drops off. It feels like a release, like a sneeze."
  },
  "restoring": {
    "exp_sex_rating_ease_of_orgasm": "Relatively quick build up then release is largely focused on genital areas but this is improving with restoration.",
    "exp_sex_rating_sensitivity_light_touch": "Not very sensitive outside of the frenulum remnant and the area at the base of my glans that has started to dekeratinize from restoration.",
    "exp_sex_rating_variety_of_sensation": "Specific sensitive areas before foreskin restoration: frenulum remnants. Specific sensitive areas after starting: glans, sulcus, frenulum remnants.",
    "exp_sex_rating_orgasm_duration": "Quick, mild, underwhelming... but I've started noticing more reaction/sensation as I've been restoring.",
    "exp_sex_rating_pleasure_mobile_skin": "Usually the slower build up leads to more intense orgasm. I almost exclusively stimulate myself by rolling the foreskin back and forth over my corona.",
    "exp_sex_rating_orgasm_intensity": "Gradual, and in no hurry, ending with a breathtaking whole body orgasm... total release... feeling of completeness."
  }
};

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

export default function PleasureGapPage({ routerState, navigate, updateState, setExhibitContext }) {
  const { cohort } = routerState;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState("cohort"); // "cohort" or "factor"
  const [viewMode, setViewMode] = useState("dumbbell");
  const [activeQuestionId, setActiveQuestionId] = useState(QUESTIONS[0].id);
  const [showGap, setShowGap] = useState(false);
  const [activeCohorts, setActiveCohorts] = useState({ intact: true, circumcised: true, restoring: true });
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "The Pleasure Gap",
        exhibitDescription: "Analyze discrepancies in subjective sexual pleasure ratings between intact, circumcised, and restoring pathways.",
        activeMetric: QUESTIONS.find(q => q.id === activeQuestionId)?.label || activeQuestionId
      });
    }
  }, [activeQuestionId, setExhibitContext]);

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

    // Dynamic Sorting: Sort QUESTIONS based on Intact score (lowest to highest)
    const sortedQuestions = [...QUESTIONS].sort((a, b) => {
      const scoreA = matrix["intact"]?.[a.id]?.average || 0;
      const scoreB = matrix["intact"]?.[b.id]?.average || 0;
      return scoreA - scoreB;
    });

    return { matrix, totalN, avgN, sortedQuestions };
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

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <InlineBreadcrumb currentRoute="pleasure-gap" navigate={navigate} />

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
                  }}>The Pleasure Gap</h2>
                  <p style={{
                    fontFamily: FONT.body,
                    fontSize: "0.88rem",
                    color: C.muted,
                    lineHeight: 1.5,
                  }}>
                    Across six measures of sexual experience, circumcised respondents rated their experiences lower than intact respondents on every axis. The largest gap, pleasure from mobile skin, was 2.5 points on a 5-point scale.
                    {stats.avgN > 0 && ` (Mean sample size per factor: n≈${stats.avgN}.)`}
                  </p>
                </div>

                {/* Control Panel */}
                {!error && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    
                    {/* View Toggles */}
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.3rem", border: `1px solid ${C.ghost}` }}>
                      <button
                        onClick={() => setViewMode("dumbbell")}
                        style={{
                          background: viewMode === "dumbbell" ? C.bgCard : "transparent",
                          color: viewMode === "dumbbell" ? C.textBright : C.muted,
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          fontFamily: FONT.condensed,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: viewMode === "dumbbell" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        The Gap Plot
                      </button>
                      <button
                        onClick={() => setViewMode("radar")}
                        style={{
                          background: viewMode === "radar" ? C.bgCard : "transparent",
                          color: viewMode === "radar" ? C.textBright : C.muted,
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          fontFamily: FONT.condensed,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: viewMode === "radar" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        Radar View
                      </button>
                      <button
                        onClick={() => setViewMode("columns")}
                        style={{
                          background: viewMode === "columns" ? C.bgCard : "transparent",
                          color: viewMode === "columns" ? C.textBright : C.muted,
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          fontFamily: FONT.condensed,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: viewMode === "columns" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                          transition: "all 0.2s"
                        }}
                      >
                        Classic Columns
                      </button>
                    </div>

                    {/* Show Deficit Toggle */}
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.3rem", border: `1px solid ${showGap ? C.red : C.ghost}` }}>
                      <button
                        onClick={() => setShowGap(!showGap)}
                        style={{
                          background: showGap ? C.bgCard : "transparent",
                          color: showGap ? C.red : C.muted,
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: 6,
                          fontFamily: FONT.condensed,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          boxShadow: showGap ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: showGap ? 700 : 500
                        }}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: showGap ? C.red : "transparent", border: `1px solid ${showGap ? C.red : C.muted}` }} />
                        Highlight Sensation Gap
                      </button>
                    </div>

                    {/* Group By Pivot (Only for Columns) */}
                    {viewMode === "columns" && (
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.3rem", border: `1px solid ${C.ghost}` }}>
                        <button
                          onClick={() => setGroupBy("factor")}
                          style={{
                            background: groupBy === "factor" ? C.bgCard : "transparent",
                            color: groupBy === "factor" ? C.textBright : C.muted,
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: 6,
                            fontFamily: FONT.condensed,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            cursor: "pointer",
                            boxShadow: groupBy === "factor" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          By Parameter
                        </button>
                        <button
                          onClick={() => setGroupBy("cohort")}
                          style={{
                            background: groupBy === "cohort" ? C.bgCard : "transparent",
                            color: groupBy === "cohort" ? C.textBright : C.muted,
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: 6,
                            fontFamily: FONT.condensed,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            cursor: "pointer",
                            boxShadow: groupBy === "cohort" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          By Cohort
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chart rendering or loaders */}
              {loading && !data && (
                <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
                  Calculating sexual experience averages...
                </div>
              )}
              {error && (
                <div style={{ padding: "2rem", color: C.red, fontFamily: FONT.mono, fontSize: "0.8rem", textAlign: "center" }}>
                  <strong>Failed to render Pleasure Gap:</strong> {error}
                </div>
              )}
              {!error && data && (
                <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s", pointerEvents: loading ? "none" : "auto" }}>
                  {viewMode === "dumbbell" && <PleasureDumbbellChart stats={stats} activeCohortsList={COHORTS.filter(c => activeCohorts[c.id])} showGap={showGap} quotes={QUALITATIVE_QUOTES} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />}
                  {viewMode === "radar" && <PleasureRadarChart stats={stats} activeCohortsList={COHORTS.filter(c => activeCohorts[c.id])} showGap={showGap} quotes={QUALITATIVE_QUOTES} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />}
                  {viewMode === "columns" && <PleasureBarChart stats={stats} activeCohortsList={COHORTS.filter(c => activeCohorts[c.id])} groupBy={groupBy} showGap={showGap} quotes={QUALITATIVE_QUOTES} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />}
                </div>
              )}
            </div>

            {/* Bottom Controls (Legend and Toggles) */}
            {!error && data && (
              <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                
                {/* Interactive Toggles */}
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {COHORTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCohorts(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                      style={{
                        background: activeCohorts[c.id] ? `var(${c.colorVar})` : "transparent",
                        color: activeCohorts[c.id] ? C.bg : `var(${c.colorVar})`,
                        border: `1px solid var(${c.colorVar})`,
                        padding: "0.3rem 0.8rem",
                        borderRadius: 20,
                        fontFamily: FONT.condensed,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Numerical Table */}
            {!error && data && (
              <div style={{
                background: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(12px)",
                border: `1px solid rgba(255,255,255,0.05)`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                borderRadius: 12,
                padding: "1.5rem",
                overflowX: "auto",
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.2s"
              }}>
                <h3 style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: C.goldBright,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "1rem",
                  borderBottom: `1px solid rgba(255,255,255,0.08)`,
                  paddingBottom: "0.6rem"
                }}>
                  Detailed Matrix (Average Ratings &amp; Samples)
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT.body, fontSize: "0.85rem", color: C.text }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid rgba(255,255,255,0.1)` }}>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: C.muted, position: "sticky", top: 0 }}>Sexual Experience Factor</th>
                      {COHORTS.map(c => (
                        <th key={c.id} style={{ textAlign: "right", padding: "0.5rem", color: C.textBright, fontWeight: 600, position: "sticky", top: 0 }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.sortedQuestions.map((q, idx) => (
                      <tr key={q.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)`, background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}>
                        <td style={{ padding: "0.8rem 0.5rem", fontWeight: 500 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: `var(${q.colorVar})` }} />
                            <span>{q.label}</span>
                          </div>
                        </td>
                        {COHORTS.map(c => {
                          const valObj = stats.matrix[c.id]?.[q.id] || { average: 0, n: 0 };
                          return (
                            <td key={c.id} style={{ padding: "0.8rem 0.5rem", textAlign: "right" }}>
                              <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.textBright, fontSize: "0.9rem" }}>{valObj.average.toFixed(2)}</span>
                              <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.muted, marginLeft: "0.4rem" }}>n={valObj.n}</span>
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
