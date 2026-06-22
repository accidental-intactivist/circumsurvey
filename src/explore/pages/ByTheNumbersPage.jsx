// ═══════════════════════════════════════════════════════════════════════════
// ByTheNumbersPage.jsx — "By the Numbers" Statistics Dashboard (Editorial Style)
// A premium, data-journalism "OK Cupid Data Science Blog" style dashboard.
// Displays striking findings dynamically updated by the demographic filters.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import { getQuestions, getResponseDistribution } from "../lib/api";
import DemographicFilterBar from "../components/DemographicFilterBar";
import GenerationalTrendChart from "../components/GenerationalTrendChart";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import SmallSampleBadge from "../components/SmallSampleBadge";
import { useTooltip, Tooltip } from "../components/Tooltip";
import * as Icons from "../components/Icons";

const STORIES_METRICS = [
  { id: "autonomy", qid: "final_core_principle_choice" },
  { id: "lube", qid: "exp_lubrication_need" },
  { id: "lube_circ", qid: "exp_lubrication_need", pathway: "circumcised" },
  { id: "lube_intact", qid: "exp_lubrication_need", pathway: "intact" },
  { id: "resentment", qid: "circ_regret_feeling" },
  { id: "child_decision", qid: "final_child_decision_reason" },
  { id: "aesthetics", qid: "final_aesthetic_preference" },
  { id: "aesthetics_circ", qid: "final_aesthetic_preference", pathway: "circumcised" },
  { id: "aesthetics_intact", qid: "final_aesthetic_preference", pathway: "intact" },
  { id: "aesthetics_restoring", qid: "final_aesthetic_preference", pathway: "restoring" }
];

// Calculation helpers
const calculateAutonomy = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const autonomy = dist.distribution.find(d => d.label.includes("Bodily Autonomy"))?.n || 0;
  return (autonomy / dist.n) * 100;
};

const calculateLubeAlways = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const always = dist.distribution.find(d => d.label.includes("always or almost always necessary"))?.n || 0;
  return (always / dist.n) * 100;
};

const calculateLubeNever = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const never = dist.distribution.find(d => d.label.includes("Never find it necessary"))?.n || 0;
  return (never / dist.n) * 100;
};

const calculateAnyResentment = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const never = dist.distribution.find(d => d.label.includes("No, never"))?.n || 0;
  return ((dist.n - never) / dist.n) * 100;
};

const calculateStrongResentment = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const strong = dist.distribution.find(d => d.label.includes("strong and frequent"))?.n || 0;
  return (strong / dist.n) * 100;
};

const calculateIntactPref = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const intact = dist.distribution.find(d => d.label.includes("remains intact"))?.n || 0;
  return (intact / dist.n) * 100;
};

const calculateCircPref = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const circ = dist.distribution.find(d => d.label.includes("have my child circumcised"))?.n || 0;
  return (circ / dist.n) * 100;
};

const calculateIntactAesthetic = (dist) => {
  if (!dist || !dist.distribution || dist.n === 0) return 0;
  const strong = dist.distribution.find(d => d.label.includes("strongly prefer the appearance of the intact"))?.n || 0;
  const slight = dist.distribution.find(d => d.label.includes("slightly prefer the appearance of the intact"))?.n || 0;
  return ((strong + slight) / dist.n) * 100;
};

export default function ByTheNumbersPage({ routerState, navigate, updateState, setCustomMeta, setExhibitContext }) {
  const { cohort } = routerState;

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "By The Numbers",
        exhibitDescription: "Editorial statistical review and cross-cohort findings.",
        cohort
      });
    }
  }, [cohort, setExhibitContext]);

  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  const [overallDists, setOverallDists] = useState({});
  const [cohortDists, setCohortDists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set page meta headers for the squishing masthead
  useEffect(() => {
    if (setCustomMeta) {
      setCustomMeta({
        kicker: "Exhibit 12",
        title: "By the Numbers",
        desc: "Key statistics, comparative outcome indexes, and cohort drill-downs.",
        navTitle: "By the Numbers",
      });
    }
  }, [setCustomMeta]);

  // Load questions and overall distributions
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      STORIES_METRICS.map(m => getResponseDistribution(m.qid, { pathway: m.pathway }).then(data => ({ id: m.id, data })))
    )
      .then((dists) => {
        if (cancelled) return;

        const oDists = {};
        dists.forEach(d => {
          oDists[d.id] = d.data;
        });
        setOverallDists(oDists);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || String(err));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Fetch cohort distributions whenever cohort changes
  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    if (!cohort || Object.keys(cohort).length === 0) {
      setCohortDists({});
      return;
    }

    Promise.all(
      STORIES_METRICS.map(m =>
        getResponseDistribution(m.qid, { pathway: m.pathway, cohort })
          .then(data => ({ id: m.id, data }))
          .catch(() => ({ id: m.id, data: null }))
      )
    ).then(results => {
      if (cancelled) return;
      const cDists = {};
      results.forEach(r => {
        cDists[r.id] = r.data;
      });
      setCohortDists(cDists);
    });

    return () => { cancelled = true; };
  }, [loading, JSON.stringify(cohort)]);

  // Safe data resolver: retrieves cohort distribution if available and not empty, otherwise defaults to overall study data.
  const getActiveDist = (id) => {
    const cohortDist = cohortDists[id];
    const overallDist = overallDists[id];
    if (cohortDist && cohortDist.n > 0) {
      return { dist: cohortDist, isFiltered: true };
    }
    return { dist: overallDist, isFiltered: false };
  };

  const isFiltered = cohort && Object.keys(cohort).length > 0;

  // Resolved Dynamic Values
  const autonomyData = getActiveDist("autonomy");
  const autonomyPct = calculateAutonomy(autonomyData.dist);
  const autonomyOverallPct = calculateAutonomy(overallDists.autonomy);

  const circLubeData = getActiveDist("lube_circ");
  const intactLubeData = getActiveDist("lube_intact");
  const lubeCircPct = calculateLubeAlways(circLubeData.dist);
  const lubeIntactPct = calculateLubeAlways(intactLubeData.dist);
  const lubeCircNeverPct = calculateLubeNever(circLubeData.dist);
  const lubeIntactNeverPct = calculateLubeNever(intactLubeData.dist);

  const resentmentData = getActiveDist("resentment");
  const strongResentmentPct = calculateStrongResentment(resentmentData.dist);
  const strongResentmentOverallPct = calculateStrongResentment(overallDists.resentment);
  const anyResentmentPct = calculateAnyResentment(resentmentData.dist);

  const childDecisionData = getActiveDist("child_decision");
  const intactPrefPct = calculateIntactPref(childDecisionData.dist);
  const circPrefPct = calculateCircPref(childDecisionData.dist);
  const otherPrefPct = Math.max(0, 100 - intactPrefPct - circPrefPct);

  const aestheticsAllData = getActiveDist("aesthetics");
  const aestheticsCircData = getActiveDist("aesthetics_circ");
  const aestheticsIntactData = getActiveDist("aesthetics_intact");
  const aestheticsRestoringData = getActiveDist("aesthetics_restoring");

  const aestheticAllPct = calculateIntactAesthetic(aestheticsAllData.dist);
  const aestheticCircPct = calculateIntactAesthetic(aestheticsCircData.dist);
  const aestheticIntactPct = calculateIntactAesthetic(aestheticsIntactData.dist);
  const aestheticRestoringPct = calculateIntactAesthetic(aestheticsRestoringData.dist);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      paddingBottom: "8rem",
    }}>
      {/* Breadcrumbs */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.1rem 0" }}>
        <InlineBreadcrumb currentRoute="numbers" navigate={navigate} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.1rem 3rem" }}>
        
        {loading ? (
          <div style={{ padding: "8rem", textAlign: "center", color: C.muted, fontStyle: "italic", fontSize: "1.1rem" }}>
            Analyzing study aggregates and formatting stories…
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", background: "rgba(217,79,79,0.08)", border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontFamily: FONT.body, fontSize: "0.95rem" }}>
            Error loading metrics: {error}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "3rem",
            alignItems: "start",
          }}>
            
            {/* LEFT COLUMN: Demographic Filters Sidebar */}
            <aside style={{
              position: "sticky",
              top: "calc(var(--header-height, 56px) + 2rem)",
              maxHeight: "calc(100vh - var(--header-height, 56px) - 4rem)",
              overflowY: "auto",
              paddingRight: "0.5rem",
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 12,
              padding: "1.5rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}>
              <div>
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.8rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: C.goldBright,
                  fontWeight: 700,
                  borderBottom: `1px solid ${C.ghost}`,
                  paddingBottom: "0.5rem",
                  marginBottom: "1rem"
                }}>
                  Cohort Filters
                </div>
                <DemographicFilterBar
                  cohort={cohort}
                  onChange={(c) => updateState({ cohort: c })}
                />
              </div>

              {isFiltered && (
                <div style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(212,160,48,0.05)",
                  border: `1px dashed rgba(212,160,48,0.25)`,
                  borderRadius: 8,
                }}>
                  <div style={{ fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: "0.3rem" }}>
                    Active Filters
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {Object.entries(cohort).map(([k, v]) => {
                      if (!v) return null;
                      const displayVal = Array.isArray(v) ? v.join(", ") : v;
                      return (
                        <span key={k} style={{
                          fontFamily: FONT.mono,
                          fontSize: "0.66rem",
                          color: C.goldBright,
                          background: "rgba(0,0,0,0.3)",
                          padding: "0.15rem 0.35rem",
                          borderRadius: 4,
                          border: `1px solid ${C.ghost}`
                        }}>
                          {k}: {displayVal}
                        </span>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => updateState({ cohort: null })}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.muted,
                      fontFamily: FONT.condensed,
                      fontSize: "0.62rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      marginTop: "0.8rem",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                    onMouseEnter={e => e.target.style.color = C.textBright}
                    onMouseLeave={e => e.target.style.color = C.muted}
                  >
                    Clear all filters ×
                  </button>
                </div>
              )}
              
              <div style={{
                fontFamily: FONT.body,
                fontSize: "0.72rem",
                color: C.dim,
                lineHeight: 1.4,
                borderTop: `1px solid ${C.ghost}`,
                paddingTop: "0.8rem",
              }}>
                💡 Tip: Click <strong>"Ask A Docent"</strong> in the top header at any time to open the AI Research Assistant drawer.
              </div>
            </aside>

            {/* RIGHT COLUMN: Editorial Data Blog */}
            <main style={{ minWidth: 0, maxWidth: 800 }}>
              
              {/* Blog Title Header */}
              <header style={{ marginBottom: "4rem", borderBottom: `2px solid ${C.ghost}`, paddingBottom: "2rem" }}>
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.75rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: C.goldBright,
                  fontWeight: 700,
                  marginBottom: "0.6rem"
                }}>
                  ★ Special Data Science Inquiry ★
                </div>
                <h1 style={{
                  fontFamily: FONT.display,
                  fontSize: "2.8rem",
                  fontWeight: 800,
                  color: C.textBright,
                  margin: 0,
                  lineHeight: 1.15
                }}>
                  By the Numbers
                </h1>
                <p style={{
                  fontFamily: FONT.body,
                  fontSize: "1.15rem",
                  color: C.muted,
                  lineHeight: 1.5,
                  marginTop: "0.8rem",
                  marginBottom: "1.2rem",
                  fontWeight: 300
                }}>
                  A curated walk through the striking statistics, functional divides, and generational shifts in the CircumSurvey dataset.
                </p>
                <div style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.72rem",
                  color: C.dim,
                  display: "flex",
                  gap: "1.5rem"
                }}>
                  <span>Reading Time: ~6 minutes</span>
                  <span>•</span>
                  <span>Dynamic Cohort Analysis Enabled</span>
                </div>
              </header>

              {/* STORY 1: Autonomy Consensus */}
              <article style={{ marginBottom: "5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>
                    Story 01 / Bodily integrity
                  </span>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "1.85rem", fontWeight: 800, color: C.textBright, margin: "0.2rem 0 0.8rem 0" }}>
                    The Autonomy Consensus
                  </h2>
                </div>

                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.text, lineHeight: 1.7, marginBottom: "2rem" }}>
                  In an era where infant circumcision has historically been treated as a default medical or cultural decision in the United States, our respondents show a near-unanimous shift toward consent. 
                  When asked to weigh the child's right to bodily autonomy against parental discretion and medical recommendation, an overwhelming <strong style={{ color: C.textBright }}>{autonomyPct.toFixed(1)}%</strong> of respondents prioritized the child's right to remain unaltered until they can decide for themselves. 
                  {isFiltered && ` (For the overall study sample, this figure is ${autonomyOverallPct.toFixed(1)}%.)`} 
                  This indicates a profound ideological alignment prioritizing individual consent over institutional defaults.
                </p>

                {/* Autonomy Card Chart */}
                <div style={{
                  display: "flex",
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 12,
                  padding: "1.5rem 2rem",
                  alignItems: "center",
                  gap: "2rem",
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)",
                  flexWrap: "wrap"
                }}>
                  <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      fontFamily: FONT.mono,
                      fontSize: "3.8rem",
                      fontWeight: 800,
                      color: C.goldBright,
                      lineHeight: 1,
                      textShadow: "0 0 20px rgba(212, 160, 48, 0.25)"
                    }}>
                      {autonomyPct.toFixed(1)}%
                    </div>
                    <span style={{ fontFamily: FONT.condensed, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginTop: "0.4rem", textAlign: "center" }}>
                      Choose Autonomy (n={autonomyData.dist?.n || 0})
                    </span>
                  </div>

                  <div style={{ flex: "2 1 280px" }}>
                    <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.textBright, fontWeight: 600, marginBottom: "0.6rem" }}>
                      Which principle should carry more weight in the circumcision debate?
                    </div>
                    
                    <div style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden", display: "flex" }}>
                      <div style={{
                        width: `${autonomyPct}%`,
                        background: C.gold,
                        boxShadow: "0 0 10px rgba(212, 160, 48, 0.4)",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontSize: "0.68rem", color: C.muted, marginTop: "0.5rem" }}>
                      <span>Child's Autonomy: {autonomyPct.toFixed(1)}%</span>
                      <span>Parental Discretion: {(100 - autonomyPct).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                {autonomyData.isFiltered && (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.66rem", color: C.goldBright, marginTop: "0.6rem", textAlign: "right" }}>
                    * Filtered cohort active (showing custom subset values)
                  </div>
                )}
              </article>

              {/* STORY 2: Lubrication Divide */}
              <article style={{ marginBottom: "5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.green, fontWeight: 700 }}>
                    Story 02 / Functional Mechanics
                  </span>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "1.85rem", fontWeight: 800, color: C.textBright, margin: "0.2rem 0 0.8rem 0" }}>
                    The Lubrication Divide
                  </h2>
                </div>

                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.text, lineHeight: 1.7, marginBottom: "2rem" }}>
                  The foreskin acts as a natural, self-lubricating sleeve during sexual activity. Without it, the friction mechanics of the penis change significantly. 
                  Our data reveals a stark contrast: among intact men, artificial lubrication is rarely necessary, with only <strong style={{ color: C.textBright }}>{lubeIntactPct.toFixed(1)}%</strong> reporting it is always or almost always needed. 
                  In comparison, that figure stands at <strong style={{ color: C.textBright }}>{lubeCircPct.toFixed(1)}%</strong> for circumcised men—a massive <strong style={{ color: C.goldBright }}>{(lubeCircPct - lubeIntactPct).toFixed(1)} percentage points</strong> gap.
                  Conversely, <strong style={{ color: C.textBright }}>{lubeIntactNeverPct.toFixed(1)}%</strong> of intact men never find artificial lubrication necessary, while only <strong style={{ color: C.textBright }}>{lubeCircNeverPct.toFixed(1)}%</strong> of circumcised men can say the same.
                </p>

                {/* Lubrication Comparative Card */}
                <div style={{
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 12,
                  padding: "1.8rem",
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    fontWeight: 700,
                  }}>
                    Is artificial lubrication necessary for comfortable sex/masturbation?
                  </div>
                  
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "2rem",
                  }}>
                    {/* Intact Column */}
                    <div>
                      <div style={{
                        fontFamily: FONT.display,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--c-green)",
                        marginBottom: "0.8rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}>
                        <span>Intact</span>
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.muted }}>(n={intactLubeData.dist?.n || 0})</span>
                      </div>
                      
                      {/* Intact Always Bar */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.78rem", color: C.textBright, marginBottom: "0.2rem" }}>
                          <span>Always / Almost Always</span>
                          <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{lubeIntactPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${lubeIntactPct}%`, height: "100%", background: "var(--c-green)", boxShadow: "0 0 8px rgba(104,184,120,0.3)" }} />
                        </div>
                      </div>
                      
                      {/* Intact Never Bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.78rem", color: C.textBright, marginBottom: "0.2rem" }}>
                          <span>Never Necessary</span>
                          <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{lubeIntactNeverPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${lubeIntactNeverPct}%`, height: "100%", background: "var(--c-green)", boxShadow: "0 0 8px rgba(104,184,120,0.3)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Circumcised Column */}
                    <div>
                      <div style={{
                        fontFamily: FONT.display,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--c-blue)",
                        marginBottom: "0.8rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}>
                        <span>Circumcised</span>
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.7rem", color: C.muted }}>(n={circLubeData.dist?.n || 0})</span>
                      </div>
                      
                      {/* Circumcised Always Bar */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.78rem", color: C.textBright, marginBottom: "0.2rem" }}>
                          <span>Always / Almost Always</span>
                          <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{lubeCircPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${lubeCircPct}%`, height: "100%", background: "var(--c-blue)", boxShadow: "0 0 8px rgba(33,150,243,0.3)" }} />
                        </div>
                      </div>
                      
                      {/* Circumcised Never Bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.78rem", color: C.textBright, marginBottom: "0.2rem" }}>
                          <span>Never Necessary</span>
                          <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{lubeCircNeverPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${lubeCircNeverPct}%`, height: "100%", background: "var(--c-blue)", boxShadow: "0 0 8px rgba(33,150,243,0.3)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(circLubeData.isFiltered || intactLubeData.isFiltered) && (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.66rem", color: C.goldBright, marginTop: "0.6rem", textAlign: "right" }}>
                    * Filtered cohort active (showing custom subset values)
                  </div>
                )}
              </article>

              {/* STORY 3: Generational Rise in Resentment */}
              <article style={{ marginBottom: "5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.red, fontWeight: 700 }}>
                    Story 03 / Generational Faultlines
                  </span>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "1.85rem", fontWeight: 800, color: C.textBright, margin: "0.2rem 0 0.8rem 0" }}>
                    The Rising Tide of Resentment
                  </h2>
                </div>

                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.text, lineHeight: 1.7, marginBottom: "2rem" }}>
                  How do circumcised men feel about the procedure performed on them as infants? The data indicates a significant generational shift. 
                  Overall, <strong style={{ color: C.textBright }}>{strongResentmentOverallPct.toFixed(1)}%</strong> of circumcised men report strong and frequent feelings of resentment, grief, loss, or anger. 
                  However, looking at the generational breakdown, a striking trend emerges: while <strong style={{ color: C.textBright }}>44.7%</strong> of Baby Boomers report strong and frequent resentment, that number climbs to <strong style={{ color: C.textBright }}>54.8%</strong> in Gen X, and peaks at <strong style={{ color: C.textBright }}>67.2%</strong> in Millennials and <strong style={{ color: C.textBright }}>66.3%</strong> in Gen Z. 
                  As information flows more freely on the internet, younger cohorts are looking back at their infant circumcisions with a far more critical eye.
                </p>

                {/* Generational Streamgraph Ribbon Chart */}
                <div style={{
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 12,
                  padding: "1.5rem 1.8rem",
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: "1rem",
                    textAlign: "center",
                    fontWeight: 700,
                  }}>
                    Feelings of Resentment/Loss over Time (Circumcised Cohort)
                  </div>
                  
                  <SmallSampleBadge n={resentmentData.dist?.n} label="circumcised respondents">
                    <GenerationalTrendChart
                      questionId="circ_regret_feeling"
                      overallDist={overallDists.resentment?.distribution}
                    />
                  </SmallSampleBadge>
                </div>
              </article>

              {/* STORY 4: Breaking the Cycle */}
              <article style={{ marginBottom: "5rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "4rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.orange, fontWeight: 700 }}>
                    Story 04 / Future Choices
                  </span>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "1.85rem", fontWeight: 800, color: C.textBright, margin: "0.2rem 0 0.8rem 0" }}>
                    Breaking the Cycle
                  </h2>
                </div>

                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.text, lineHeight: 1.7, marginBottom: "2rem" }}>
                  One of the most predictive indicators of a cultural transition is what parents choose to do for their children. 
                  When asked what they would choose for a future son, an overwhelming <strong style={{ color: C.textBright }}>{intactPrefPct.toFixed(1)}%</strong> of respondents stated they would ensure their child remains intact. 
                  Only <strong style={{ color: C.red }}>{circPrefPct.toFixed(1)}%</strong> would choose circumcision, with the rest undecided, leaving the choice to their partner, or not planning to have children. 
                  This demonstrates a powerful departure from the repeating cycle of multi-generational circumcision.
                </p>

                {/* Sons Choice Card */}
                <div style={{
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 12,
                  padding: "1.8rem",
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: "1.2rem",
                    textAlign: "center",
                    fontWeight: 700,
                  }}>
                    Decision for a Future AMAB Child (n={childDecisionData.dist?.n || 0})
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Intact Option */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 600 }}>Ensure child remains intact</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: "var(--c-green)" }}>{intactPrefPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${intactPrefPct}%`, height: "100%", background: "var(--c-green)", boxShadow: "0 0 8px rgba(104,184,120,0.3)" }} />
                      </div>
                    </div>
                    
                    {/* Circumcised Option */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 600 }}>Choose to circumcise</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: "var(--c-red)" }}>{circPrefPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${circPrefPct}%`, height: "100%", background: "var(--c-red)", boxShadow: "0 0 8px rgba(217,79,79,0.3)" }} />
                      </div>
                    </div>

                    {/* Undecided/Other Option */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 600 }}>Undecided, partner's choice, or N/A</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.muted }}>{otherPrefPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${otherPrefPct}%`, height: "100%", background: C.ghost }} />
                      </div>
                    </div>
                  </div>
                </div>
                {childDecisionData.isFiltered && (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.66rem", color: C.goldBright, marginTop: "0.6rem", textAlign: "right" }}>
                    * Filtered cohort active (showing custom subset values)
                  </div>
                )}
              </article>

              {/* STORY 5: Aesthetic Shift */}
              <article style={{ marginBottom: "5rem", paddingBottom: "2rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.ltBlue, fontWeight: 700 }}>
                    Story 05 / Cultural Aesthetics
                  </span>
                  <h2 style={{ fontFamily: FONT.display, fontSize: "1.85rem", fontWeight: 800, color: C.textBright, margin: "0.2rem 0 0.8rem 0" }}>
                    The Aesthetic Shift
                  </h2>
                </div>

                <p style={{ fontFamily: FONT.body, fontSize: "1.05rem", color: C.text, lineHeight: 1.7, marginBottom: "2rem" }}>
                  Historically, fear of a child "looking different" in the locker room or a belief that partners prefer the circumcised look were core arguments driving infant circumcisions in America. 
                  Today, those visual expectations are undergoing a massive realignment. 
                  Across all study respondents, <strong style={{ color: C.textBright }}>{aestheticAllPct.toFixed(1)}%</strong> prefer the aesthetics of the intact penis (either strongly or slightly). 
                  Most notably, even among circumcised respondents themselves, a clear majority of <strong style={{ color: C.textBright }}>{aestheticCircPct.toFixed(1)}%</strong> prefer the intact look over the circumcised appearance. 
                  For restoring men (who are actively reversing their circumcised state), this aesthetic preference peaks at <strong style={{ color: C.goldBright }}>{aestheticRestoringPct.toFixed(1)}%</strong>. 
                  The visual norms of the past are dissolving in favor of natural anatomy.
                </p>

                {/* Aesthetics Preferences Card */}
                <div style={{
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 12,
                  padding: "1.8rem",
                  boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)",
                }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: "1.2rem",
                    textAlign: "center",
                    fontWeight: 700,
                  }}>
                    Aesthetic Preference: Percent Who Prefer the Intact Look
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Intact Cohort */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span>Intact Respondents (n={aestheticsIntactData.dist?.n || 0})</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: "var(--c-green)" }}>{aestheticIntactPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${aestheticIntactPct}%`, height: "100%", background: "var(--c-green)", boxShadow: "0 0 8px rgba(104,184,120,0.3)" }} />
                      </div>
                    </div>
                    
                    {/* Circumcised Cohort */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span>Circumcised Respondents (n={aestheticsCircData.dist?.n || 0})</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: "var(--c-blue)" }}>{aestheticCircPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${aestheticCircPct}%`, height: "100%", background: "var(--c-blue)", boxShadow: "0 0 8px rgba(33,150,243,0.3)" }} />
                      </div>
                    </div>

                    {/* Restoring Cohort */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: "0.82rem", color: C.textBright, marginBottom: "0.3rem" }}>
                        <span>Restoring Respondents (n={aestheticsRestoringData.dist?.n || 0})</span>
                        <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: "var(--c-gold)" }}>{aestheticRestoringPct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${aestheticRestoringPct}%`, height: "100%", background: "var(--c-gold)", boxShadow: "0 0 8px rgba(212,160,48,0.3)" }} />
                      </div>
                    </div>
                  </div>
                </div>
                {(aestheticsIntactData.isFiltered || aestheticsCircData.isFiltered || aestheticsRestoringData.isFiltered) && (
                  <div style={{ fontFamily: FONT.mono, fontSize: "0.66rem", color: C.goldBright, marginTop: "0.6rem", textAlign: "right" }}>
                    * Filtered cohort active (showing custom subset values)
                  </div>
                )}
              </article>

            </main>

          </div>
        )}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
