// ═══════════════════════════════════════════════════════════════════════════
// ByTheNumbersPage.jsx — "By the Numbers" Statistics Dashboard
// Displays key high-level statistics with dynamic cohort filter support,
// interactive drill-downs, and pathway comparisons.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useCallback } from "react";
import { C, FONT, resolveCssColor } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getCount } from "../lib/api";
import DemographicFilterBar from "../components/DemographicFilterBar";
import DistributionChart from "../components/DistributionChart";
import GenerationalTrendChart from "../components/GenerationalTrendChart";
import CopilotChat from "../components/CopilotChat";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import { useTooltip, Tooltip } from "../components/Tooltip";
import * as Icons from "../components/Icons";

const KPI_METRICS = [
  {
    id: "resentment",
    title: "Circumcised Resentment",
    qid: "circ_regret_feeling",
    icon: "AlertTriangle",
    desc: "Circumcised men who report experiencing resentment, loss, anger, or grief.",
    color: "var(--c-red)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const never = dist.distribution.find(d => d.label === "No, never")?.n || 0;
      return ((dist.n - never) / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Report ever feeling negative about it"
  },
  {
    id: "sons_decision",
    title: "Intact-Preference for Future Sons",
    qid: "final_child_decision_reason",
    icon: "Shield",
    desc: "Respondents who would choose to keep a future AMAB child intact.",
    color: "var(--c-green)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const intact = dist.distribution.find(d => d.label.includes("remains intact"))?.n || 0;
      return (intact / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Would ensure their child remains intact"
  },
  {
    id: "intact_satisfaction",
    title: "Intact Contentment",
    qid: "intact_regret_feeling",
    icon: "Smile",
    desc: "Intact men who have never wished to be circumcised or regretted being intact.",
    color: "var(--c-blue)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const never = dist.distribution.find(d => d.label.includes("No, never"))?.n || 0;
      return (never / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Have never wished to be circumcised"
  },
  {
    id: "lube_dependence",
    title: "Lubrication Always Needed",
    qid: "exp_lubrication_need",
    icon: "Droplets",
    desc: "Respondents who report artificial lubrication is always or almost always necessary.",
    color: "var(--c-orange)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const always = dist.distribution.find(d => d.label.includes("always or almost always necessary"))?.n || 0;
      return (always / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Always/almost always need lube"
  },
  {
    id: "autonomy_stance",
    title: "Bodily Autonomy Priority",
    qid: "final_core_principle_choice",
    icon: "Scale",
    desc: "Respondents prioritizing a child's right to bodily autonomy over parental discretion.",
    color: "var(--c-gold)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const autonomy = dist.distribution.find(d => d.label.includes("Bodily Autonomy"))?.n || 0;
      return (autonomy / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Prioritize bodily autonomy"
  },
  {
    id: "aesthetic_appeal",
    title: "Intact Aesthetic Appeal",
    qid: "final_aesthetic_preference",
    icon: "Eye",
    desc: "Respondents who prefer the appearance of the intact (uncircumcised) penis.",
    color: "var(--c-ltBlue)",
    calculate: (dist) => {
      if (!dist || dist.n === 0) return 0;
      const strong = dist.distribution.find(d => d.label.includes("strongly prefer the appearance of the intact"))?.n || 0;
      const slight = dist.distribution.find(d => d.label.includes("slightly prefer the appearance of the intact"))?.n || 0;
      return ((strong + slight) / dist.n) * 100;
    },
    formatValue: (val) => `${val.toFixed(1)}%`,
    subLabel: "Prefer intact visual appearance"
  }
];

export default function ByTheNumbersPage({ routerState, navigate, updateState, setCustomMeta }) {
  const { cohort } = routerState;
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  
  const [activeMetricId, setActiveMetricId] = useState("resentment");
  const [questionsMap, setQuestionsMap] = useState({});
  const [overallDists, setOverallDists] = useState({});
  const [cohortDists, setCohortDists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set page meta headers
  useEffect(() => {
    if (setCustomMeta) {
      setCustomMeta({
        kicker: "The Accidental Intactivist's Inquiry",
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

    Promise.all([
      getQuestions({ counts: true }),
      ...KPI_METRICS.map(m => getResponseDistribution(m.qid).then(data => ({ id: m.id, data })))
    ])
      .then(([qData, ...dists]) => {
        if (cancelled) return;

        // Map questions by ID
        const qMap = {};
        (qData.questions || []).forEach(q => {
          qMap[q.id] = q;
        });
        setQuestionsMap(qMap);

        // Map overall distributions
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

    if (!cohort) {
      setCohortDists({});
      return;
    }

    Promise.all(
      KPI_METRICS.map(m =>
        getResponseDistribution(m.qid, { cohort })
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

  const activeMetric = useMemo(() => {
    return KPI_METRICS.find(m => m.id === activeMetricId);
  }, [activeMetricId]);

  const activeQuestion = useMemo(() => {
    if (!activeMetric) return null;
    return questionsMap[activeMetric.qid];
  }, [activeMetric, questionsMap]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      paddingBottom: "5rem",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1.1rem 0" }}>
        <InlineBreadcrumb currentRoute="numbers" navigate={navigate} />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1.1rem 3rem" }}>
        
        {/* Three panel explorer grid */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 340px",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* LEFT PANEL: Filters */}
          <aside
            className="explore-nav"
            style={{
              position: "sticky",
              top: "calc(var(--header-height, 56px) + 1.5rem)",
              maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
              overflowY: "auto",
              paddingRight: "0.4rem",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
            }}
          >
            <DemographicFilterBar
              cohort={cohort}
              onChange={(c) => updateState({ cohort: c })}
            />

            {cohort && (
              <div style={{
                padding: "0.75rem 1rem",
                background: C.bgCard,
                border: `1px solid ${C.ghost}`,
                borderRadius: 8,
              }}>
                <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: "0.25rem" }}>
                  Active Filter
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.goldBright, lineHeight: 1.35 }}>
                  {Object.entries(cohort).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")}
                </div>
              </div>
            )}
          </aside>

          {/* CENTER PANEL: Main metrics view */}
          <main>
            {/* Header intro */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.goldBright,
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}>
                ★ Key Findings Dashboard
              </div>
              <h1 style={{
                fontFamily: FONT.display,
                fontSize: "2rem",
                fontWeight: 800,
                color: C.textBright,
                margin: 0,
                lineHeight: 1.25,
              }}>
                By The Numbers
              </h1>
              <p style={{
                fontFamily: FONT.body,
                fontSize: "0.95rem",
                color: C.muted,
                lineHeight: 1.5,
                marginTop: "0.4rem",
                marginBottom: 0
              }}>
                The core findings of the study summarized in key outcome metrics. Use the cohort filters on the left to examine specific subsets (e.g. Jewish upbringing, Gen Z, or European residents) and watch the metrics shift dynamically.
              </p>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
                Calculating survey metrics…
              </div>
            ) : error ? (
              <div style={{ padding: "2rem", background: "rgba(217,79,79,0.1)", border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontFamily: FONT.body, fontSize: "0.85rem" }}>
                Error loading data: {error}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* KPI Cards Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "0.75rem",
                }}>
                  {KPI_METRICS.map(m => {
                    const overallDist = overallDists[m.id];
                    const cohortDist = cohortDists[m.id];
                    const isActive = activeMetricId === m.id;
                    const accentColor = resolveCssColor(m.color);
                    
                    const valueOverall = m.calculate(overallDist);
                    const valueCohort = cohortDist ? m.calculate(cohortDist) : null;
                    const displayVal = valueCohort !== null ? valueCohort : valueOverall;
                    
                    const IconComponent = Icons[m.icon];

                    return (
                      <div
                        key={m.id}
                        onClick={() => setActiveMetricId(m.id)}
                        style={{
                          background: C.bgCard,
                          border: `1px solid ${isActive ? accentColor : C.ghost}`,
                          borderLeft: `4px solid ${accentColor}`,
                          borderRadius: 8,
                          padding: "1.1rem 1.25rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          boxShadow: isActive ? `0 4px 16px rgba(0,0,0,0.5), inset 0 0 10px ${accentColor}10` : "none",
                          transform: isActive ? "translateY(-2px)" : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = C.ghost;
                            e.currentTarget.style.transform = "none";
                          }
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.4rem" }}>
                          <span style={{
                            fontFamily: FONT.condensed,
                            fontSize: "0.7rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: C.muted,
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {m.title}
                          </span>
                          {IconComponent && <IconComponent size={15} color={accentColor} style={{ flexShrink: 0 }} />}
                        </div>

                        <div style={{
                          fontFamily: FONT.mono,
                          fontSize: "2.2rem",
                          fontWeight: 700,
                          color: C.textBright,
                          lineHeight: 1.1,
                          marginBottom: "0.3rem"
                        }}>
                          {m.formatValue(displayVal)}
                        </div>

                        <div style={{
                          fontFamily: FONT.body,
                          fontSize: "0.76rem",
                          color: C.muted,
                          lineHeight: 1.3
                        }}>
                          {m.subLabel}
                        </div>

                        {valueCohort !== null && (
                          <div style={{
                            marginTop: "0.6rem",
                            paddingTop: "0.6rem",
                            borderTop: `1px dashed ${C.ghost}`,
                            fontFamily: FONT.mono,
                            fontSize: "0.65rem",
                            color: C.muted,
                            display: "flex",
                            justifyContent: "space-between"
                          }}>
                            <span>Sample Overall: {m.formatValue(valueOverall)}</span>
                            <span style={{ color: C.goldBright }}>
                              (n={cohortDist.n})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Drill-down Header */}
                <div style={{ marginTop: "1rem", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.4rem" }}>
                  <h2 style={{
                    fontFamily: FONT.display,
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: C.textBright,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <span style={{ color: resolveCssColor(activeMetric.color) }}>◎</span>
                    <span>Drill Down: {activeMetric.title}</span>
                  </h2>
                </div>

                {/* Drill-down content */}
                {activeQuestion && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* Exact Question Wording Panel */}
                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${C.ghost}`,
                      borderRadius: 8,
                      padding: "1rem 1.25rem"
                    }}>
                      <div style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.62rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: resolveCssColor(activeMetric.color),
                        fontWeight: 700,
                        marginBottom: "0.4rem"
                      }}>
                        Exact Survey Question
                      </div>
                      <p style={{
                        fontFamily: FONT.body,
                        fontSize: "1.05rem",
                        color: C.textBright,
                        margin: 0,
                        lineHeight: 1.4,
                        fontWeight: 500
                      }}>
                        {activeQuestion.prompt}
                      </p>
                      {activeQuestion.subtitle && (
                        <p style={{
                          fontFamily: FONT.body,
                          fontSize: "0.85rem",
                          color: C.muted,
                          margin: "0.4rem 0 0 0",
                          fontStyle: "italic",
                          lineHeight: 1.35
                        }}>
                          {activeQuestion.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Interactive Charts Panels */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "1.25rem"
                    }}>
                      {/* Left: Overall vs Cohort Distribution Chart */}
                      <DistributionChart
                        title="Response Distribution"
                        distribution={overallDists[activeMetric.id]}
                        cohortDistribution={cohortDists[activeMetric.id]}
                        question={activeQuestion}
                        hideHeader={false}
                      />

                      {/* Right: Generational Trends Flow */}
                      <div style={{
                        background: C.bgCard,
                        border: `1px solid ${C.ghost}`,
                        borderRadius: 8,
                        padding: "1.2rem",
                      }}>
                        <h3 style={{
                          fontFamily: FONT.display,
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: C.textBright,
                          letterSpacing: "-0.01em",
                          margin: "0 0 0.8rem 0",
                        }}>
                          Generational Shift
                        </h3>
                        <p style={{
                          fontFamily: FONT.body,
                          fontSize: "0.82rem",
                          color: C.muted,
                          lineHeight: 1.4,
                          margin: "0 0 1.2rem 0"
                        }}>
                          How responses flow chronologically from the Silent Generation through to Gen Z.
                        </p>
                        <GenerationalTrendChart
                          questionId={activeMetric.qid}
                          overallDist={overallDists[activeMetric.id]?.distribution}
                        />
                      </div>
                    </div>

                    {/* Drill-down Quick Actions */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.8rem 1rem",
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${C.ghost}`,
                      borderRadius: 8,
                      flexWrap: "wrap",
                      gap: "0.6rem"
                    }}>
                      <span style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.muted }}>
                        Want to explore qualitative testimonials or correlations for this question?
                      </span>
                      <div style={{ display: "flex", gap: "0.6rem" }}>
                        <a
                          href={`#/q/${activeMetric.qid}`}
                          style={{
                            fontFamily: FONT.condensed,
                            fontSize: "0.72rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: C.goldBright,
                            padding: "0.35rem 0.6rem",
                            border: `1px solid ${C.ghost}`,
                            borderRadius: 4,
                            textDecoration: "none",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBright }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.ghost }}
                        >
                          View Question Details &amp; Narratives →
                        </a>
                        <a
                          href="#/correlations"
                          style={{
                            fontFamily: FONT.condensed,
                            fontSize: "0.72rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: C.muted,
                            padding: "0.35rem 0.6rem",
                            border: `1px solid ${C.ghost}`,
                            borderRadius: 4,
                            textDecoration: "none",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = C.textBright; e.currentTarget.style.borderColor = C.textBright }}
                          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.ghost }}
                        >
                          Explore Correlations
                        </a>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </main>

          {/* RIGHT PANEL: AI Copilot */}
          <aside style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            paddingRight: "0.4rem",
            zIndex: 100,
          }}>
            <CopilotChat routerState={routerState} updateState={updateState} question={activeQuestion} />
          </aside>

        </div>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
