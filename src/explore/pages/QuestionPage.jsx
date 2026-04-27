// ═══════════════════════════════════════════════════════════════════════════
// QuestionPage — individual question detail
// Shows: prompt, distribution chart, pathway breakdown, cohort overlay
// Demographic filter chips at top integrate with persistent cohort state.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { C, FONT, RAINBOW, PATH_COLORS } from "../styles/tokens";
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
import { applyLikert } from "../lib/formatters";
import CopilotChat from "../components/CopilotChat";

export default function QuestionPage({ routerState, navigate, updateState }) {
  const { params, cohort } = routerState;
  const questionId = params.id;

  // ── Data fetch ──────────────────────────────────────────────────────────
  const [question, setQuestion] = useState(null);
  const [allDistribution, setAllDistribution] = useState(null);
  const [cohortDistribution, setCohortDistribution] = useState(null);
  const [byPathway, setByPathway] = useState(null);
  const [error, setError] = useState(null);



  useEffect(() => {
    let cancelled = false;

    // Fetch the question metadata
    getQuestions({ counts: true }).then((d) => {
      if (cancelled) return;
      const found = (d.questions || []).find((q) => q.id === questionId);
      setQuestion(found || null);
    }).catch((e) => setError(e.message));

    // Full-sample distribution
    getResponseDistribution(questionId).then((d) => {
      if (!cancelled) setAllDistribution(d);
    }).catch((e) => setError(e.message));

    // Pathway breakdown
    getAggregate(questionId, { by: "pathway" }).then((d) => {
      if (!cancelled) setByPathway(d);
    }).catch(() => {});  // aggregate can fail on pathway-specific questions — that's ok

    return () => { cancelled = true; };
  }, [questionId]);

  // ── Cohort distribution (separate fetch, re-runs when cohort changes) ──
  useEffect(() => {
    if (!cohort) {
      setCohortDistribution(null);
      return;
    }
    let cancelled = false;
    getResponseDistribution(questionId, { cohort })
      .then((d) => { if (!cancelled) setCohortDistribution(d); })
      .catch(() => { if (!cancelled) setCohortDistribution(null); });
    return () => { cancelled = true; };
  }, [questionId, JSON.stringify(cohort)]);

  const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current", "demo_can_province_born", "demo_can_province_current"].includes(question?.id);

  // ── Narrative fetch (if open_text and not geographic) ─────────────────────
  useEffect(() => {
    if (!question || question.type !== "open_text" || isGeographic) return;
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
  }, [question, isGeographic, JSON.stringify(cohort)]);

  // ── Render Formatted Data ───────────────────────────────────────────────
  


  const displayDist = useMemo(() => {
    if (!allDistribution) return null;
    return {
      ...allDistribution,
      distribution: applyLikert(allDistribution.distribution, question)
    };
  }, [allDistribution, question]);

  const displayCohortDist = useMemo(() => {
    if (!cohortDistribution?.distribution) return null;
    return {
      ...cohortDistribution,
      distribution: applyLikert(cohortDistribution.distribution, question)
    };
  }, [cohortDistribution, question]);

  const displayByPathway = useMemo(() => {
    if (!byPathway?.results) return null;
    const cloned = JSON.parse(JSON.stringify(byPathway));
    for (const p in cloned.results) {
      cloned.results[p].distribution = applyLikert(cloned.results[p].distribution, question);
    }
    return cloned;
  }, [byPathway, question]);

  // ── Render ──────────────────────────────────────────────────────────────

  const pathwayObj = question?.pathway && question.pathway !== "all" ? PATHWAYS[question.pathway] : null;
  const isOpenText = question?.type === "open_text" && !isGeographic;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

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
          }}>{question?.section || "…"}</span>
          {pathwayObj && (
            <>
              <span style={{ color: C.dim }}>/</span>
              <span style={{
                fontFamily: FONT.condensed,
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: pathwayObj.color,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}>
                <span>{pathwayObj.emoji}</span>
                <span>{pathwayObj.label}</span>
              </span>
            </>
          )}
          
          <button
            onClick={(e) => {
              navigator.clipboard.writeText(window.location.href);
              const origText = e.target.innerText;
              e.target.innerText = "✓ COPIED";
              setTimeout(() => { e.target.innerText = origText; }, 2000);
            }}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: `1px solid ${C.ghost}`,
              color: C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.64rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.25rem 0.6rem",
              borderRadius: 4,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.target.style.color = C.goldBright; e.target.style.borderColor = C.gold; }}
            onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderColor = C.ghost; }}
          >
            🔗 COPY LINK
          </button>
        </div>

        {/* Rainbow accent */}
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, marginBottom: "1rem", opacity: 0.5 }} />

        {/* Question heading */}
        {!question && !error && (
          <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
            Loading question…
          </div>
        )}
        {error && <ErrorBlock msg={error} />}
        {question && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {question.tier === 1 && (
               <span style={{
                 fontFamily: FONT.mono, fontSize: "0.62rem", fontWeight: 700,
                 letterSpacing: "0.08em", color: C.gold,
                 background: "rgba(212,160,48,0.12)", border: "1px solid rgba(212,160,48,0.3)",
                 borderRadius: 999, padding: "0.15rem 0.5rem",
                 flexShrink: 0, marginTop: "0.4rem",
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
                flexShrink: 0, marginTop: "0.4rem",
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
            </div>
            <h1 style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "clamp(1.35rem, 3vw, 1.8rem)",
              color: C.textBright,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              marginBottom: "0.45rem",
            }}>{question.prompt}</h1>
            {question.subtitle && (
              <p style={{
                fontFamily: FONT.body,
                fontSize: "1.1rem",
                lineHeight: 1.5,
                color: C.muted,
                marginTop: "1rem",
                marginBottom: 0,
                maxWidth: 800
              }}>{question.subtitle}</p>
            )}
            <div style={{
              fontFamily: FONT.mono,
              fontSize: "0.7rem",
              color: C.dim,
              marginTop: "0.5rem"
            }}>{question.id} · col_idx {question.col_idx}</div>
          </div>
        )}

        {/* Two-panel: cohort filter on left, content on right */}
        {question && (
          <div
            className="explore-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr 340px",
              gap: "1.2rem",
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
              {isOpenText ? (
                <NarrativeList distribution={cohortDistribution?.distribution || allDistribution?.distribution} />
              ) : isGeographic ? (
                <>
                  <GeographicHeatmap 
                    questionId={question.id}
                    title="Geographic distribution"
                    distribution={allDistribution}
                    cohortDistribution={cohortDistribution}
                    byPathway={byPathway}
                  />
                  <GenerationalTrendChart questionId={question.id} />
                </>
              ) : (
                <>
                  <DistributionChart 
                    distribution={displayDist} 
                    cohortDistribution={displayCohortDist}
                    title="Overall vs. Filtered distribution" 
                  />

                  {displayByPathway && Object.keys(displayByPathway.results || {}).length > 1 && (
                    <PathwayBreakdown byPathway={displayByPathway} overallDist={displayDist.distribution} />
                  )}
                  
                  <GenerationalTrendChart questionId={question.id} />
                </>
              )}
            </main>

            {/* RIGHT: AI Assistant */}
            <aside style={{
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
              paddingRight: "0.4rem"
            }}>
              <CopilotChat routerState={routerState} updateState={updateState} />
            </aside>
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
                {p.distribution.map((d, i) => {
                  const pct = (d.n / total) * 100;
                  const x = xCursor;
                  xCursor += pct;
                  
                  // Use canonical index from the overall distribution for consistent coloring across charts
                  let canonicalIndex = overallDist.findIndex(od => od.label === d.label);
                  if (canonicalIndex === -1) canonicalIndex = i; // Fallback

                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorForLabel(d.label, canonicalIndex)}
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
