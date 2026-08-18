import { useState, useEffect, useMemo } from "react";
import { Activity } from "lucide-react";
import { getAggregate, getNarratives } from "../lib/api";
import { C, FONT, RAINBOW, resolveCssColor } from "../styles/tokens";
import DemographicFilterBar from "../components/DemographicFilterBar";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { useTooltip, Tooltip } from "../components/Tooltip";
import { PATHWAYS } from "../lib/pathways";
import PleasureBarChart from "../components/PleasureBarChart";
import PleasureHorizontalBarChart from "../components/PleasureHorizontalBarChart";
import PleasureDumbbellChart from "../components/PleasureDumbbellChart";
import ExhibitHero from "../components/ExhibitHero";
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

const FACTOR_KEYWORDS = {
  "exp_sex_rating_ease_of_orgasm": ["orgasm", "climax", "finish", "cum", "hard", "difficult", "effort", "easy", "reach"],
  "exp_sex_rating_sensitivity_light_touch": ["touch", "sensitive", "light", "feeling", "frenulum", "glans", "numb", "friction", "rubbing"],
  "exp_sex_rating_variety_of_sensation": ["variety", "different", "sensation", "kinds", "types", "nuance", "feeling", "parts"],
  "exp_sex_rating_orgasm_duration": ["duration", "long", "short", "time", "quick", "seconds", "minutes", "build", "sudden"],
  "exp_sex_rating_pleasure_mobile_skin": ["glide", "mobile", "skin", "movement", "rubbing", "lube", "friction", "roll", "sliding"],
  "exp_sex_rating_orgasm_intensity": ["intense", "intensity", "powerful", "weak", "strong", "release", "full body", "sneezing", "sneeze"]
};

function getRandomQuote(quotesArray, keywords) {
  if (!quotesArray || quotesArray.length === 0) return null;
  let matches = quotesArray.filter(q => {
    if (!q.text) return false;
    const lower = q.text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  });
  
  if (matches.length === 0) matches = quotesArray;
  
  const shortMatches = matches.filter(q => q.text.length > 20 && q.text.length < 400);
  const finalPool = shortMatches.length > 0 ? shortMatches : matches;
  
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function formatAttribution(item) {
  // Generation only — geographic detail (state/province/country) is intentionally
  // omitted to prevent re-identification of respondents on a sensitive topic.
  let genStr = item.generation || "";
  if (genStr.includes("(born")) genStr = genStr.split("(born")[0].trim();
  if (genStr === "Boomer") genStr = "Baby Boomer";

  return genStr || "Anonymous";
}

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
  const [viewMode, setViewMode] = useState("columns");
  const [activeQuestionId, setActiveQuestionId] = useState(QUESTIONS[0].id);
  const [showGap, setShowGap] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [activeCohorts, setActiveCohorts] = useState({ intact: true, circumcised: true, restoring: true });
  const [liveQuotes, setLiveQuotes] = useState({ intact: [], circumcised: [], restoring: [] });
  const [quoteSeed, setQuoteSeed] = useState(0);
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
    
    // AI Docent Context
    setExhibitContext({
      page_description: "The user is looking at 'The Pleasure Gap', an exhibit charting self-reported pleasure and physical sensitivity ratings across Intact, Circumcised, and Restoring cohorts. Data is displayed as diverging dumbbells indicating the spread between cohorts on a 1 to 5 scale.",
      active_cohorts: activeCohortsList.map(c => c.label).join(", "),
      active_demographic_filter: cohortLabel || "None"
    });

    async function load() {
      try {
        const promises = QUESTIONS.map(q => 
          getAggregate(q.id, { by: "pathway", cohort })
        );
        const results = await Promise.all(promises);
        if (cancelled) return;
        const mappedData = {};
        QUESTIONS.forEach((q, idx) => {
          mappedData[q.id] = results[idx].results || {};
        });
        setData(mappedData);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch aggregate scores", err);
        setError(err.message || String(err));
        setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(cohort)]);

  // Fetch live quotes for the 3 pathways once on mount
  useEffect(() => {
    let cancelled = false;
    async function loadQuotes() {
      try {
        const [intactData, circData, restData] = await Promise.all([
          getNarratives("intact_foreskin_role_sex"),
          getNarratives("circ_drawbacks_desc"),
          getNarratives("restore_sensitivity_change_desc")
        ]);
        if (!cancelled) {
          setLiveQuotes({
            intact: intactData.narratives || [],
            circumcised: circData.narratives || [],
            restoring: restData.narratives || []
          });
        }
      } catch (e) {
        console.error("Failed to load real quotes", e);
      }
    }
    loadQuotes();
    return () => { cancelled = true; };
  }, []);

  const activeCohortsList = useMemo(() => COHORTS.filter(c => activeCohorts[c.id]), [activeCohorts]);

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

    let minN = Infinity;
    COHORTS.forEach(c => {
      if (!activeCohortsList.find(ac => ac.id === c.id)) return;
      QUESTIONS.forEach(q => {
        const res = matrix[c.id][q.id];
        if (res && res.n > 0 && res.n < minN) minN = res.n;
      });
    });
    if (minN === Infinity) minN = 0;

    return { matrix, totalN, avgN, minN, sortedQuestions };
  }, [data, activeCohortsList]);

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

  const selectedQuotes = useMemo(() => {
    const quotes = {};
    const keywords = FACTOR_KEYWORDS[activeQuestionId] || [];
    COHORTS.forEach(c => {
      quotes[c.id] = getRandomQuote(liveQuotes[c.id], keywords);
    });
    return quotes;
  }, [activeQuestionId, liveQuotes, quoteSeed]);

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
          <style>{`
            @media (min-width: 768px) {
              .mobile-only-inline { display: none !important; }
              .desktop-hide { display: none !important; }
            }
            @media (max-width: 767px) {
              .mobile-hide { display: none !important; }
            }
          `}</style>
          <main>
            <div className="crt-frame" style={{ borderRadius: 8, overflow: "hidden", marginBottom: "1.5rem" }}>
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>

              {/* Title Header */}
              <ExhibitHero
                title="The Pleasure Gap"
                color={C.goldBright}
                gradientColor={C.gold}
                BackgroundIcon={Activity}
                description={
                  <>
                    Across six measures of sexual experience, circumcised respondents rated their experiences lower than intact respondents on every axis. The largest gap, pleasure from mobile skin, was 2.5 points on a 5-point scale.
                    {stats.avgN > 0 && ` (Mean sample size per factor: n≈${stats.avgN}.)`}
                  </>
                }
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div></div>

                {/* Control Panel */}
                {!error && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "nowrap", gap: "0.5rem" }}>
                    
                    {/* LEFT CONTROLS */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap", justifyContent: "flex-end", flex: 1, alignItems: "center" }}>
                      {/* View Toggles */}
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.2rem", border: `1px solid ${C.ghost}` }}>
                        <button
                          onClick={() => setViewMode("dumbbell")}
                          style={{
                            background: viewMode === "dumbbell" ? C.bgCard : "transparent",
                            color: viewMode === "dumbbell" ? C.textBright : C.muted,
                            border: "none",
                            padding: "0.3rem 0.6rem",
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
                          onClick={() => setViewMode("columns")}
                          style={{
                            background: viewMode === "columns" ? C.bgCard : "transparent",
                            color: viewMode === "columns" ? C.textBright : C.muted,
                            border: "none",
                            padding: "0.3rem 0.6rem",
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

                      {/* Group By Pivot (Only for Columns) */}
                      {viewMode === "columns" && (
                        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.2rem", border: `1px solid ${C.ghost}` }}>
                          <button
                            onClick={() => setGroupBy("factor")}
                            style={{
                              background: groupBy === "factor" ? C.bgCard : "transparent",
                              color: groupBy === "factor" ? C.textBright : C.muted,
                              border: "none",
                              padding: "0.3rem 0.6rem",
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
                              padding: "0.3rem 0.6rem",
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
                            By Pathway
                          </button>
                        </div>
                      )}

                      {/* Show Deficit Toggle */}
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "0.2rem", border: `1px solid ${showGap ? C.red : C.ghost}` }}>
                        <button
                          onClick={() => setShowGap(!showGap)}
                          style={{
                            background: showGap ? C.bgCard : "transparent",
                            color: showGap ? C.red : C.muted,
                            border: "none",
                            padding: "0.3rem 0.6rem",
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
                          Show Gap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* How to Read This Grid Toggle */}
                {viewMode === "dumbbell" && (
                  <div style={{ marginBottom: "2rem" }}>
                    <button
                      onClick={() => setShowHowTo(!showHowTo)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: C.muted,
                        fontFamily: FONT.condensed,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: 0,
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>{showHowTo ? "−" : "+"}</span> How to Read This Chart
                    </button>
                    
                    {showHowTo && (
                      <div style={{
                        marginTop: "1rem",
                        background: C.bgSoft,
                        border: `1px solid ${C.ghost}`,
                        borderRadius: 8,
                        padding: "1.5rem",
                        color: C.textBright,
                        fontFamily: FONT.body,
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        animation: "fadeIn 0.2s ease-out"
                      }}>
                        <p style={{ margin: "0 0 0.8rem 0" }}>
                          <strong>The Dumbbell Plot</strong> visualizes the "gap" in self-reported physical pleasure and sensitivity across pathways. 
                        </p>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                          <li style={{ marginBottom: "0.5rem" }}>Each row represents a specific aspect of the sexual experience.</li>
                          <li style={{ marginBottom: "0.5rem" }}>The <strong>Circles</strong> represent the average score (out of 5) for a given pathway.</li>
                          <li style={{ marginBottom: "0.5rem" }}>The <strong>Connecting Line</strong> illustrates the <em>spread</em> or <em>gap</em> between those averages.</li>
                          <li>Toggle <strong>Show Gap</strong> to explicitly highlight the numerical deficit or advantage between the lowest and highest scoring pathways in each category.</li>
                        </ul>
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
                  <SmallSampleBadge n={stats.minN} label="one or more of the selected pathways">
                    {viewMode === "dumbbell" && <PleasureDumbbellChart stats={stats} activeCohortsList={activeCohortsList} showGap={showGap} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />}
                    {viewMode === "columns" && (
                      <>
                        <div className="mobile-hide" style={{ width: "100%", overflowX: "auto" }}>
                          <div style={{ minWidth: 760 }}>
                            <PleasureBarChart stats={stats} activeCohortsList={activeCohortsList} groupBy={groupBy} showGap={showGap} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
                          </div>
                        </div>
                        <div className="desktop-hide" style={{ width: "100%" }}>
                          <PleasureHorizontalBarChart stats={stats} activeCohortsList={activeCohortsList} groupBy={groupBy} showGap={showGap} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
                        </div>
                      </>
                    )}
                  </SmallSampleBadge>
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
                        color: activeCohorts[c.id] ? "#050505" : `var(${c.colorVar})`,
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
                      <th style={{ textAlign: "right", padding: "0.5rem", color: C.red, fontWeight: 700, position: "sticky", top: 0 }}>The Gap<br/><span style={{fontSize:"0.65rem", color: C.muted}}>(Intact vs. Circ)</span></th>
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
            )}

            {/* Voices Spotlight Panel */}
            {!error && data && (
              <div style={{ marginTop: "4rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: C.goldBright,
                    marginBottom: "0.5rem"
                  }}>
                    Lived Reality
                  </div>
                  <h3 style={{ fontFamily: FONT.display, fontSize: "1.8rem", color: C.textBright, margin: 0 }}>
                    Voices from the Gap
                  </h3>
                  <p style={{ fontFamily: FONT.body, color: C.muted, maxWidth: 600, margin: "0.5rem auto 0" }}>
                    Select a sensation factor to read representative quotes from each pathway, grounding the numerical ratings in physical experience.
                  </p>
                </div>
                
                {/* Selector */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  {QUESTIONS.map(q => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveQuestionId(q.id);
                        setQuoteSeed(s => s + 1);
                      }}
                      style={{
                        background: activeQuestionId === q.id ? `var(${q.colorVar})` : "transparent",
                        color: activeQuestionId === q.id ? "#111" : C.textBright,
                        border: `1px solid ${activeQuestionId === q.id ? `var(${q.colorVar})` : C.ghost}`,
                        padding: "0.5rem 1rem",
                        borderRadius: 20,
                        fontFamily: FONT.condensed,
                        fontSize: "0.8rem",
                        fontWeight: activeQuestionId === q.id ? 800 : 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                {/* Quotes Display */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  {COHORTS.filter(c => activeCohorts[c.id]).map(c => {
                    const quoteItem = selectedQuotes[c.id];
                    if (!quoteItem) return null;
                    
                    const attribution = formatAttribution(quoteItem);

                    return (
                      <div key={c.id} style={{
                        background: C.bgCard,
                        border: `1px solid ${C.ghost}`,
                        borderTop: `4px solid var(${c.colorVar})`,
                        borderRadius: "8px",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}>
                        <div style={{ 
                          fontFamily: FONT.condensed, 
                          fontSize: "0.95rem", 
                          color: `var(${c.colorVar})`, 
                          textTransform: "uppercase", 
                          letterSpacing: "0.1em", 
                          fontWeight: 800,
                          textShadow: "1px 1px 0 rgba(0,0,0,0.8)"
                        }}>
                          {c.label} Voice
                        </div>
                        <div style={{ fontFamily: FONT.display, fontSize: "1.05rem", color: C.textBright, fontStyle: "italic", lineHeight: 1.6 }}>
                          "{quoteItem.text}"
                        </div>
                        <div style={{ 
                          fontFamily: FONT.mono, 
                          fontSize: "0.65rem", 
                          color: C.dim, 
                          marginTop: "auto", 
                          paddingTop: "1rem",
                          borderTop: `1px solid ${C.ghost}`,
                          textTransform: "uppercase"
                        }}>
                          {attribution}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
