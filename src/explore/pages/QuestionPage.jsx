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

  // ── Narrative fetch (if open_text) ──────────────────────────────────────
  useEffect(() => {
    if (!question || question.type !== "open_text") return;
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
  }, [question, JSON.stringify(cohort)]);

  // ── Render ──────────────────────────────────────────────────────────────

  const pathwayObj = question?.pathway && question.pathway !== "all" ? PATHWAYS[question.pathway] : null;
  const isGeographic = ["demo_country_born", "demo_country_current", "demo_us_state_born", "demo_us_state_current"].includes(question?.id);
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
              {isOpenText && (
                <span style={{
                  fontFamily: FONT.condensed, fontSize: "0.62rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: C.muted, background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.ghost}`,
                  borderRadius: 999, padding: "0.15rem 0.5rem",
                  flexShrink: 0, marginTop: "0.4rem",
                }}>open response</span>
              )}
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
              gridTemplateColumns: "260px 1fr",
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

            {/* RIGHT: content */}
            <main>
              {isOpenText ? (
                <NarrativeList distribution={cohortDistribution || allDistribution?.distribution} />
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
                    title="Overall distribution"
                    distribution={allDistribution}
                    cohortDistribution={cohortDistribution}
                  />

                  {byPathway && Object.keys(byPathway.results || {}).length > 1 && (
                    <PathwayBreakdown byPathway={byPathway} />
                  )}
                  
                  <GenerationalTrendChart questionId={question.id} />
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function PathwayBreakdown({ byPathway }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const results = byPathway.results || {};
  const pathwaysWithData = PATHWAY_IDS
    .filter((id) => results[id] && results[id].n > 0)
    .map((id) => ({ id, ...results[id] }));

  if (pathwaysWithData.length === 0) return null;

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
                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorForLabel(d.label)}
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
