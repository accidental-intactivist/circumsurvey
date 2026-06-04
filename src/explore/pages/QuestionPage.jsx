// ═══════════════════════════════════════════════════════════════════════════
// QuestionPage — individual question detail
// Shows: prompt, distribution chart, pathway breakdown, cohort overlay
// Demographic filter chips at top integrate with persistent cohort state.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState, useRef } from "react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";
import { getQuestions, getResponseDistribution, getAggregate, getNarratives } from "../lib/api";
import { colorForLabel } from "../components/MiniSparkline";
import DemographicFilterBar from "../components/DemographicFilterBar";
import GeographicHeatmap from "../components/GeographicHeatmap";
import GenerationalTrendChart from "../components/GenerationalTrendChart";
import NarrativeList from "../components/NarrativeList";
import { useTooltip, Tooltip } from "../components/Tooltip";
import DistributionChart from "../components/DistributionChart";
import { MessageSquareText, BarChart2 } from "../components/Icons";
import { applyLikert, flattenMultiSelect, sortDistribution } from "../lib/formatters";
import CopilotChat from "../components/CopilotChat";

import SharePopover from "../components/SharePopover";
import AddToReportButton from "../components/AddToReportButton";
import WordCloud from "../components/WordCloud";

export default function QuestionPage({ routerState, navigate, updateState, setCustomMeta }) {
  const { params, cohort } = routerState;
  const questionId = params.id;

  // ── Data fetch ──────────────────────────────────────────────────────────
  const [question, setQuestion] = useState(null);
  const [prevQ, setPrevQ] = useState(null);
  const [nextQ, setNextQ] = useState(null);
  const [allDistribution, setAllDistribution] = useState(null);
  const [cohortDistribution, setCohortDistribution] = useState(null);
  const [byPathway, setByPathway] = useState(null);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showCopilot, setShowCopilot] = useState(true);
  const [viewMode, setViewMode] = useState("single");
  const [questions, setQuestions] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [notFoundSearch, setNotFoundSearch] = useState("");

  // Update dynamic header metadata when the question is loaded or not found
  useEffect(() => {
    if (question && setCustomMeta) {
      setCustomMeta({
        kicker: "The Accidental Intactivist's Inquiry",
        title: "Accidental Intactivists Inquiry Dataset",
        desc: `Detailed cohort breakdown and response narrative analysis for question ${question.id}.`,
        navTitle: question.section || "Question",
      });
    }
  }, [question, setCustomMeta]);

  useEffect(() => {
    if (notFound && setCustomMeta) {
      setCustomMeta({
        kicker: "The Accidental Intactivist's Inquiry",
        title: "Question Not Found",
        desc: `We couldn't find the requested question ID "${questionId}".`,
        navTitle: "Error",
      });
    }
  }, [notFound, questionId, setCustomMeta]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === "side-by-side") {
      setShowCopilot(false);
    } else if (mode === "single") {
      setShowCopilot(true);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setSelectedWord(null);
    setViewMode("single");
    setShowCopilot(true);
    setNotFound(false);
    setQuestion(null);
    setAllDistribution(null);
    setCohortDistribution(null);
    setByPathway(null);

    getQuestions({ counts: true }).then((d) => {
      if (cancelled) return;
      const allQs = d.questions || [];
      setQuestions(allQs);
      const foundIdx = allQs.findIndex((q) => q.id === questionId);
      
      if (foundIdx === -1) {
        setNotFound(true);
        // Auto-trigger AI Search fallback for non-found question
        const fallbackQuery = `I was looking for the survey question ID "${questionId}". It was not found. What are the closest matching questions or topics in the study? Please list them.`;
        if (updateState) {
          updateState({ ai_query: fallbackQuery });
        }
      } else {
        setNotFound(false);
        setQuestion(allQs[foundIdx]);
        setPrevQ(foundIdx > 0 ? allQs[foundIdx - 1] : null);
        setNextQ(foundIdx < allQs.length - 1 ? allQs[foundIdx + 1] : null);

        // Full-sample distribution
        getResponseDistribution(questionId).then((dist) => {
          if (!cancelled) setAllDistribution(dist);
        }).catch((e) => setError(e.message));

        // Pathway breakdown
        getAggregate(questionId, { by: "pathway" }).then((agg) => {
          if (!cancelled) setByPathway(agg);
        }).catch(() => {});  // aggregate can fail on pathway-specific questions — that's ok
      }
    }).catch((e) => setError(e.message));

    return () => { cancelled = true; };
  }, [questionId]);

  // ── Cohort distribution (separate fetch, re-runs when cohort changes) ──
  useEffect(() => {
    if (!cohort || notFound) {
      setCohortDistribution(null);
      return;
    }
    let cancelled = false;
    getResponseDistribution(questionId, { cohort })
      .then((d) => { if (!cancelled) setCohortDistribution(d); })
      .catch(() => { if (!cancelled) setCohortDistribution(null); });
    return () => { cancelled = true; };
  }, [questionId, JSON.stringify(cohort), notFound]);

  const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(question?.id);

  const isMulti = useMemo(() => {
    return question?.type === "multi_select" || ["demo_ethnicity", "demo_race_ethnicity", "demo_gender_identity", "demo_sexuality"].includes(question?.id);
  }, [question]);

  // ── Narrative fetch (if open_text and not geographic and not multi-select) ──
  useEffect(() => {
    if (!question || question.type !== "open_text" || isGeographic || isMulti) return;
    let cancelled = false;
    getNarratives(questionId).then((d) => {
      if (!cancelled && d.narratives) {
        setAllDistribution((prev) => ({ ...prev, distribution: d.narratives }));
      }
    }).catch(() => {});
    
    if (cohort) {
      getNarratives(questionId, { cohort }).then((d) => {
        if (!cancelled && d.narratives) {
          setCohortDistribution((prev) => ({ ...prev, distribution: d.narratives }));
        }
      }).catch(() => {});
    }

    return () => { cancelled = true; };
  }, [question, isGeographic, isMulti, JSON.stringify(cohort)]);

  // ── Render Formatted Data ───────────────────────────────────────────────
  

  const displayDist = useMemo(() => {
    if (!allDistribution) return null;
    let dist = allDistribution.distribution;
    if (isMulti) dist = flattenMultiSelect(dist, question);
    dist = applyLikert(dist, question);
    dist = sortDistribution(dist, question);
    return {
      ...allDistribution,
      distribution: dist
    };
  }, [allDistribution, question, isMulti]);

  const displayCohortDist = useMemo(() => {
    if (!cohortDistribution?.distribution) return null;
    let dist = cohortDistribution.distribution;
    if (isMulti) dist = flattenMultiSelect(dist, question);
    dist = applyLikert(dist, question);
    dist = sortDistribution(dist, question);
    return {
      ...cohortDistribution,
      distribution: dist
    };
  }, [cohortDistribution, question, isMulti]);

  const displayByPathway = useMemo(() => {
    if (!byPathway?.results) return null;
    const cloned = JSON.parse(JSON.stringify(byPathway));
    for (const p in cloned.results) {
      let dist = cloned.results[p].distribution;
      if (isMulti) dist = flattenMultiSelect(dist, question);
      cloned.results[p].distribution = applyLikert(dist, question);
    }
    return cloned;
  }, [byPathway, question, isMulti]);

  // ── Render ──────────────────────────────────────────────────────────────

  const pathwayObj = question?.pathway && question.pathway !== "all" ? PATHWAYS[question.pathway] : null;
  const isOpenText = question?.type === "open_text" && !isGeographic && !isMulti;

  const captureRef = useRef(null);

  const handleExport = async () => {
    if (!captureRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, { 
        backgroundColor: C.bg,
        style: { padding: "1.5rem" },
        filter: (node) => {
          if (node.classList && (node.classList.contains("no-capture") || node.classList.contains("no-print"))) {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `circumsurvey-${questionId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture image", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: showCopilot ? 1100 : 1400, margin: "0 auto", transition: "max-width 0.2s ease" }}>

        {/* Actions bar at top */}
        <div className="no-print no-capture" style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1.2rem",
          flexWrap: "wrap",
        }}>
          {!notFound && question && (
            <>
              <AddToReportButton questionId={question.id} />
              <SharePopover 
                url={window.location.href} 
                questionId={question.id} 
                questionPrompt={question.prompt}
                onExportImage={handleExport}
              />
              <div style={{ width: "1px", height: "20px", background: C.ghost }} />
            </>
          )}
          
          <button
            onClick={() => setShowCopilot(prev => !prev)}
            title={showCopilot ? "Hide AI Assistant" : "Show AI Assistant"}
            style={{
              background: showCopilot ? "rgba(212,160,48,0.12)" : "transparent",
              border: `1px solid ${showCopilot ? "rgba(212,160,48,0.3)" : C.ghost}`,
              borderRadius: 6,
              cursor: "pointer",
              color: showCopilot ? C.goldBright : C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.25rem 0.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              transition: "all 0.15s",
            }}
          >
            <span>🤖</span>
            <span>AI Copilot</span>
          </button>
        </div>

        {/* Loading and Error states (rendered outside/above the grid) */}
        {!question && !error && !notFound && (
          <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Loading question…
          </div>
        )}
        {error && <ErrorBlock msg={error} />}

        {/* Two-panel: not found UI on left, AI copilot on right */}
        {notFound && (
          <div
            className="explore-grid"
            style={{
              display: "grid",
              gridTemplateColumns: showCopilot ? "1fr 340px" : "1fr",
              gap: "1.2rem",
              alignItems: "start",
            }}
          >
            {/* LEFT: Not Found UI */}
            <main style={{
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 8,
              padding: "1.5rem",
              minHeight: "400px",
            }}>
              {/* Back to master index breadcrumb */}
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
                borderBottom: `1px solid ${C.ghost}`,
                paddingBottom: "0.6rem",
              }}>
                <a href="#/" style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.muted,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { e.target.style.color = C.goldBright; }}
                onMouseLeave={e => { e.target.style.color = C.muted; }}>
                  ← Master Index
                </a>
              </div>

              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.red,
                marginBottom: "0.6rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}>
                <span>★</span> Question Not Found
              </div>

              <h1 style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                color: C.textBright,
                lineHeight: 1.3,
                letterSpacing: "-0.015em",
                marginBottom: "0.8rem",
              }}>
                We couldn't find the requested question ID.
              </h1>

              <p style={{
                fontFamily: FONT.body,
                fontSize: "0.82rem",
                color: C.muted,
                lineHeight: 1.5,
                marginBottom: "1.2rem",
              }}>
                The question ID <code style={{ fontFamily: FONT.mono, color: C.goldBright, background: "rgba(255,255,255,0.05)", padding: "0.1rem 0.35rem", borderRadius: 4 }}>{questionId}</code> is not in our database of 355 survey questions. This can happen if the link has a typo or the question was renamed.
              </p>

              {/* Inline Interactive Search */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.gold,
                  marginBottom: "0.4rem"
                }}>
                  Search All 355 Questions
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.32rem 0.6rem",
                  background: C.bgSoft,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 6,
                }}>
                  <span style={{ color: C.dim, fontSize: "0.85rem" }}>⌕</span>
                  <input
                    type="text"
                    value={notFoundSearch}
                    onChange={(e) => setNotFoundSearch(e.target.value)}
                    placeholder="Type keyword, topic, or question ID..."
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: C.text,
                      fontFamily: FONT.body,
                      fontSize: "0.78rem",
                      flex: 1,
                    }}
                  />
                  {notFoundSearch && (
                    <button
                      onClick={() => setNotFoundSearch("")}
                      style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: "0.8rem" }}
                    >×</button>
                  )}
                </div>

                {/* Inline Search Results */}
                {notFoundSearch.trim().length >= 2 && (
                  <div style={{
                    marginTop: "0.5rem",
                    border: `1px solid ${C.ghost}`,
                    borderRadius: 6,
                    maxHeight: "220px",
                    overflowY: "auto",
                    background: C.bgSoft,
                  }}>
                    {(() => {
                      const query = notFoundSearch.toLowerCase();
                      const matches = questions.filter(q => 
                        (q.prompt || "").toLowerCase().includes(query) || 
                        (q.id || "").toLowerCase().includes(query)
                      ).slice(0, 15);

                      if (matches.length === 0) {
                        return (
                          <div style={{ padding: "0.8rem", color: C.dim, fontSize: "0.8rem", fontStyle: "italic", textAlign: "center" }}>
                            No matching questions found.
                          </div>
                        );
                      }

                      return matches.map(q => (
                        <a
                          key={q.id}
                          href={`#/q/${q.id}`}
                          style={{
                            display: "block",
                            padding: "0.6rem 0.8rem",
                            borderBottom: `1px solid ${C.ghost}`,
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.15rem" }}>
                            <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.gold }}>{q.id}</span>
                            <span style={{ fontFamily: FONT.condensed, fontSize: "0.62rem", color: C.dim, textTransform: "uppercase" }}>{q.section}</span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: C.textBright, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {q.prompt}
                          </div>
                        </a>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Canned Recommendations */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.gold,
                  marginBottom: "0.5rem"
                }}>
                  Popular &amp; High-Interest Questions
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {[
                    { id: "circ_message_to_parents", text: "💬 Message to Parents (from Circumcised respondents)", emoji: "⚖️" },
                    { id: "intact_message_to_others", text: "💬 Message to Others / Future Parents (from Intact respondents)", emoji: "⚖️" },
                    { id: "exp_sex_rating_orgasm_intensity", text: "📊 Orgasm Intensity comparison across cohorts", emoji: "⚖️" },
                    { id: "demo_sexuality", text: "📊 Sexual Orientation demographic profile", emoji: "📊" },
                    { id: "final_transparent_monster_reason", text: "📜 Societal pressures & cultural alignment", emoji: "📜" },
                  ].map(rec => (
                    <a
                      key={rec.id}
                      href={`#/q/${rec.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.45rem 0.7rem",
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${C.ghost}`,
                        borderRadius: 6,
                        color: C.textBright,
                        fontSize: "0.78rem",
                        textDecoration: "none",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.ghost; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    >
                      <span style={{ fontSize: "0.95rem" }}>{rec.emoji}</span>
                      <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{rec.text}</span>
                      <span style={{ fontSize: "0.7rem", color: C.dim, fontFamily: FONT.mono }}>{rec.id} →</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* AI Assistant guidance banner */}
              <div style={{
                padding: "0.5rem 0.8rem",
                background: "rgba(212,160,48,0.06)",
                border: `1px solid rgba(212,160,48,0.18)`,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <span style={{ fontSize: "1rem" }}>🤖</span>
                <span style={{ fontFamily: FONT.body, fontSize: "0.74rem", color: C.muted, lineHeight: 1.45 }}>
                  The <strong>AI Copilot</strong> on the right has been initialized to search for questions similar to <code style={{ color: C.goldBright }}>{questionId}</code>. See its recommendations or ask a follow-up.
                </span>
              </div>
            </main>

            {/* RIGHT: AI Assistant */}
            {showCopilot && (
              <aside style={{
                position: "sticky",
                top: "calc(var(--header-height, 56px) + 1rem)",
                maxHeight: "calc(100vh - var(--header-height, 56px) - 2rem)",
                overflowY: "auto",
                paddingRight: "0.4rem",
                zIndex: 100,
              }}>
                <CopilotChat routerState={routerState} updateState={updateState} question={null} />
              </aside>
            )}
          </div>
        )}

        {/* Two-panel: cohort filter on left, content on right */}
        {question && (
          <div
            className="explore-grid"
            style={{
              display: "grid",
              gridTemplateColumns: showCopilot ? "260px 1fr 340px" : "260px 1fr",
              gap: "1.2rem",
              alignItems: "start",
            }}
          >
            {/* LEFT: cohort filter */}
            <aside className="explore-nav" style={{
              position: "sticky",
              top: "calc(var(--header-height, 56px) + 1rem)",
              maxHeight: "calc(100vh - var(--header-height, 56px) - 2rem)",
              overflowY: "auto",
              paddingRight: "0.3rem",
              zIndex: 100,
            }}>
              <DemographicFilterBar
                cohort={cohort}
                onChange={(c) => updateState({ cohort: c })}
              />

              {/* Cohort size indicator */}
              {cohort && cohortDistribution && (
                <div style={{
                  marginTop: "1rem",
                  padding: "0.7rem 0.85rem",
                  background: C.bgCard,
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 7,
                }}>
                  <div style={{
                    fontFamily: FONT.condensed,
                    fontSize: "0.62rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: "0.35rem",
                  }}>Cohort size</div>
                  <div style={{
                    fontFamily: FONT.mono,
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    color: C.goldBright,
                  }}>{cohortDistribution.n || 0}</div>
                  <div style={{
                    fontFamily: FONT.body,
                    fontSize: "0.72rem",
                    color: C.dim,
                    marginTop: "0.2rem",
                  }}>
                    of {allDistribution?.n || "…"} total respondents
                  </div>
                </div>
              )}
            </aside>

            {/* CENTER: content */}
            <main>
              <div ref={captureRef}>
                {/* Combined Breadcrumb */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                  borderBottom: `1px solid ${C.ghost}`,
                  paddingBottom: "0.6rem",
                }}>
                  {/* Left: Breadcrumbs */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: FONT.condensed,
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    <a href="#/" className="no-capture no-print" style={{
                      color: C.muted,
                      transition: "color 0.15s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={e => { e.target.style.color = C.goldBright; }}
                    onMouseLeave={e => { e.target.style.color = C.muted; }}>
                      ← Master Index
                    </a>
                    <span className="no-capture no-print" style={{ color: C.dim }}>/</span>
                    {(() => {
                      const sectionStr = question.section || "Question";
                      const isRedundant = pathwayObj && sectionStr.toUpperCase().includes(pathwayObj.label.toUpperCase());
                      return (
                        <>
                          <span style={{ color: C.muted, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            {isRedundant && <span>{pathwayObj.emoji}</span>}
                            <span>{sectionStr}</span>
                          </span>
                          {pathwayObj && !isRedundant && (
                            <>
                              <span className="no-capture no-print" style={{ color: C.dim }}>/</span>
                              <span style={{
                                color: pathwayObj.color,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}>
                                <span>{pathwayObj.emoji}</span>
                                <span>{pathwayObj.label}</span>
                              </span>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Question Prompt */}
                <h1 style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: "clamp(1.4rem, 3vw, 2.0rem)",
                  color: C.textBright,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.8rem",
                  textTransform: "uppercase",
                }}>
                  {question.prompt}
                </h1>

                {/* Question Subtitle (context) */}
                {question.subtitle && (
                  <p style={{
                    fontFamily: FONT.body,
                    fontSize: "0.95rem",
                    color: C.muted,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    marginTop: "-0.4rem",
                    marginBottom: "1.2rem",
                  }}>
                    {question.subtitle}
                  </p>
                )}

                {/* Question metadata badges */}
                <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                  {question.tier === 1 && (
                    <span style={{
                      fontFamily: FONT.mono, fontSize: "0.62rem", fontWeight: 700,
                      letterSpacing: "0.08em", color: C.gold,
                      background: "rgba(212,160,48,0.12)", border: "1px solid rgba(212,160,48,0.3)",
                      borderRadius: 999, padding: "0.15rem 0.5rem",
                      flexShrink: 0,
                    }}>TIER 1 · CURATED</span>
                  )}
                  {/* Qual / Quant Badge */}
                  <span title={question.type === "open_text" ? "Qualitative Open Response" : "Quantitative Metric"} style={{
                    fontFamily: FONT.condensed, fontSize: "0.62rem", fontWeight: 700,
                    letterSpacing: "0.06em", 
                    color: question.type === "open_text" ? "#a8b5c4" : C.dim, 
                    background: question.type === "open_text" ? "rgba(168,181,196,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${question.type === "open_text" ? "rgba(168,181,196,0.25)" : C.ghost}`,
                    borderRadius: 999, padding: "0.15rem 0.5rem",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}>
                    {question.type === "open_text" ? (
                      <><MessageSquareText size={11} strokeWidth={3} /> QUAL</>
                    ) : (
                      <><BarChart2 size={11} strokeWidth={3} /> QUANT</>
                    )}
                  </span>
                  <span style={{
                    fontFamily: FONT.mono,
                    fontSize: "0.65rem",
                    color: C.dim,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.ghost}`,
                    borderRadius: 999, padding: "0.15rem 0.5rem",
                    flexShrink: 0,
                  }}>{question.id} · Index #{question.col_idx}</span>
                </div>

                {/* Top Split Navigation (Non-Printing) */}
                {!notFound && (
                  <div className="no-capture no-print" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "-0.5rem",
                    marginBottom: "1.5rem",
                    userSelect: "none",
                  }}>
                    {prevQ ? (
                      <a href={`#/q/${prevQ.id}`} style={{
                        fontFamily: FONT.condensed,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: C.gold,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.goldBright; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.gold; }}>
                        <span style={{ fontSize: "1.1rem" }}>←</span> Previous Question
                      </a>
                    ) : <div />}

                    {nextQ ? (
                      <a href={`#/q/${nextQ.id}`} style={{
                        fontFamily: FONT.condensed,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: C.gold,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.goldBright; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.gold; }}>
                        Next Question <span style={{ fontSize: "1.1rem" }}>→</span>
                      </a>
                    ) : <div />}
                  </div>
                )}

                {/* Main visualizations */}
                {isOpenText ? (
                  <>
                    <WordCloud 
                      narratives={cohortDistribution?.distribution || allDistribution?.distribution} 
                      selectedWord={selectedWord}
                      onWordClick={(word) => setSelectedWord(word === selectedWord ? null : word)}
                    />
                    <NarrativeList 
                      distribution={cohortDistribution?.distribution || allDistribution?.distribution} 
                      highlightWord={selectedWord}
                      viewMode={viewMode}
                      onViewModeChange={handleViewModeChange}
                    />
                  </>
                ) : isGeographic ? (
                  <>
                    <GeographicHeatmap 
                      questionId={question.id}
                      title="Geographic distribution"
                      distribution={allDistribution}
                      cohortDistribution={cohortDistribution}
                      byPathway={byPathway}
                    />
                    <GenerationalTrendChart questionId={question.id} overallDist={displayDist?.distribution} />
                  </>
                ) : (
                  <>
                    <DistributionChart 
                      question={question}
                      distribution={displayDist} 
                      cohortDistribution={displayCohortDist}
                      title="Overall vs. Filtered distribution" 
                    />

                    {(cohortDistribution?.distribution || allDistribution?.distribution)?.length > 15 && (
                      <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: `1px dashed var(--c-ghost)` }}>
                        <h3 style={{ fontFamily: "var(--f-condensed)", color: "var(--c-gold)", marginBottom: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "1.1rem" }}>
                          Explore The Long Tail ({(cohortDistribution?.distribution || allDistribution?.distribution).length} unique entries)
                        </h3>
                        <p style={{ color: "var(--c-dim)", fontSize: "0.9rem", marginBottom: "2rem", maxWidth: 800 }}>
                          This question contains a large number of unique responses or fragmented combinations (likely due to "Other" write-ins). Use the word cloud to filter and explore the full variety of answers below.
                        </p>
                        <WordCloud 
                          narratives={cohortDistribution?.distribution || allDistribution?.distribution} 
                          selectedWord={selectedWord}
                          onWordClick={(word) => setSelectedWord(word === selectedWord ? null : word)}
                        />
                        <NarrativeList 
                          distribution={cohortDistribution?.distribution || allDistribution?.distribution} 
                          highlightWord={selectedWord}
                          hideChart={true}
                        />
                      </div>
                    )}

                    {displayByPathway && Object.keys(displayByPathway.results || {}).length > 1 && (
                      <PathwayBreakdown byPathway={displayByPathway} overallDist={displayDist?.distribution || []} />
                    )}
                    
                    <GenerationalTrendChart questionId={question.id} overallDist={displayDist?.distribution} />
                  </>
                )}
              </div>
            </main>

            {/* RIGHT: AI Assistant */}
            {showCopilot && (
              <aside style={{
                position: "sticky",
                top: "calc(var(--header-height, 56px) + 1rem)",
                maxHeight: "calc(100vh - var(--header-height, 56px) - 2rem)",
                overflowY: "auto",
                paddingRight: "0.4rem",
                zIndex: 100,
              }}>
                <CopilotChat routerState={routerState} updateState={updateState} question={question} />
              </aside>
            )}
          </div>
        )}

        {/* Sequential Navigation */}
        {question && (
          <div className="no-capture no-print" style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: `1px solid ${C.ghost}`
          }}>
            {prevQ ? (
              <a href={`#/q/${prevQ.id}`} style={{
                fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.1em",
                color: C.gold, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                <span style={{ fontSize: "1.2rem" }}>←</span> Previous Question
              </a>
            ) : <div />}
            
            {nextQ ? (
              <a href={`#/q/${nextQ.id}`} style={{
                fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.1em",
                color: C.gold, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                Next Question <span style={{ fontSize: "1.2rem" }}>→</span>
              </a>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function PathwayBreakdown({ byPathway, overallDist = [] }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const results = byPathway.results || {};
  const pathwaysWithData = PATHWAY_IDS
    .filter((id) => results[id] && results[id].n > 0)
    .map((id) => ({ id, ...results[id] }));

  const colorMap = useMemo(() => {
    const map = {};
    if (overallDist) {
      overallDist.forEach((item, index) => {
        map[item.label] = colorForLabel(item.label, index);
      });
    }
    return map;
  }, [overallDist]);

  if (pathwaysWithData.length === 0) return null;

  // Compute missing major pathways for the "quick string"
  const missing = [];
  if (!results["observer"] || results["observer"].n === 0) missing.push("Observer");
  
  const transMissing = (!results["trans_vaginoplasty"] || results["trans_vaginoplasty"].n === 0) && (!results["trans_phalloplasty"] || results["trans_phalloplasty"].n === 0);
  if (transMissing) missing.push("Transgender");
  
  if (!results["intersex"] || results["intersex"].n === 0) missing.push("Intersex");

  let noDataMsg = null;
  if (missing.length > 0) {
    const last = missing.pop();
    const joined = missing.length > 0 ? `${missing.join(", ")} or ${last}` : last;
    noDataMsg = `No responses from ${joined} pathways for this question.`;
  }

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
    }}>
      <h2 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "1.15rem",
        color: C.textBright,
        marginBottom: "0.9rem",
        letterSpacing: "-0.01em",
      }}>By pathway</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {pathwaysWithData.map((p) => {
          const path = PATHWAYS[p.id];
          const total = p.distribution.reduce((s, d) => s + d.n, 0);

          const sortedDist = overallDist ? [...p.distribution].sort((a, b) => {
            const labelOrder = overallDist.map(item => item.label);
            let idxA = labelOrder.indexOf(a.label);
            let idxB = labelOrder.indexOf(b.label);
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            return idxA - idxB;
          }) : p.distribution;

          let xCursor = 0;
          return (
            <div key={p.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem" }}>{path.emoji}</span>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: path.color,
                }}>{path.label}</span>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.66rem",
                  color: C.muted,
                }}>n = {total}</span>
              </div>
              <svg width="100%" height={12} style={{ display: "block", borderRadius: 2, overflow: "hidden" }}>
                <rect x={0} y={0} width="100%" height={12} fill={C.ghost} />
                {sortedDist.map((d, i) => {
                  const pct = (d.n / total) * 100;
                  const x = xCursor;
                  xCursor += pct;
                  
                  // Use canonical index from the overall distribution for consistent coloring across charts
                  let canonicalIndex = overallDist.findIndex(od => od.label === d.label);
                  if (canonicalIndex === -1) canonicalIndex = i; // Fallback

                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorMap[d.label] || colorForLabel(d.label, canonicalIndex)}
                      onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
      
      {noDataMsg && (
        <div style={{
          marginTop: "1.1rem",
          fontFamily: FONT.body,
          fontSize: "0.72rem",
          color: C.dim,
          fontStyle: "italic",
          textAlign: "center"
        }}>
          {noDataMsg}
        </div>
      )}
      <Tooltip {...tooltip} />
    </div>
  );
}

function ErrorBlock({ msg }) {
  return (
    <div style={{
      padding: "1rem 1.2rem",
      background: "rgba(217,79,79,0.08)",
      border: `1px solid rgba(217,79,79,0.3)`,
      borderRadius: 8,
      color: C.red,
      fontFamily: FONT.mono,
      fontSize: "0.8rem",
    }}>
      <strong>API error:</strong> {msg}
    </div>
  );
}
