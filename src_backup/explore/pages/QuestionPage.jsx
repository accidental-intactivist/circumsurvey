// ═══════════════════════════════════════════════════════════════════════════
// QuestionPage — individual question detail
// Shows: prompt, distribution chart, pathway breakdown, cohort overlay
// Demographic filter chips at top integrate with persistent cohort state.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { C, FONT, RAINBOW, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";
import { getQuestions, getResponseDistribution, getAggregate } from "../lib/api";
import { colorForLabel } from "../components/MiniSparkline";
import DemographicFilterBar from "../components/DemographicFilterBar";

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

  // ── Render ──────────────────────────────────────────────────────────────

  const pathwayObj = question?.pathway && question.pathway !== "all" ? PATHWAYS[question.pathway] : null;
  const isOpenText = question?.type === "open_text";

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
            <div style={{
              fontFamily: FONT.mono,
              fontSize: "0.7rem",
              color: C.dim,
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
                <OpenTextNotice />
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

function OpenTextNotice() {
  return (
    <div style={{
      padding: "2rem 1.5rem",
      textAlign: "center",
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>📝</div>
      <h3 style={{
        fontFamily: FONT.display,
        fontWeight: 600,
        fontSize: "1.1rem",
        color: C.text,
        marginBottom: "0.5rem",
      }}>Open-response question</h3>
      <p style={{
        fontFamily: FONT.body,
        fontSize: "0.88rem",
        color: C.muted,
        maxWidth: 500,
        margin: "0 auto",
        lineHeight: 1.5,
      }}>
        This question collects free-text responses. Qualitative narrative analysis isn't available in the API yet — coming in a future release. For now, contact the research team for access to these responses.
      </p>
    </div>
  );
}

function DistributionChart({ title, distribution, cohortDistribution }) {
  if (!distribution) {
    return <div style={{ padding: "2rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>Loading…</div>;
  }
  const dist = distribution.distribution || [];
  if (dist.length === 0) {
    return (
      <div style={{
        padding: "1.5rem",
        background: C.bgSoft,
        border: `1px solid ${C.ghost}`,
        borderRadius: 8,
        color: C.muted,
        fontStyle: "italic",
        textAlign: "center",
      }}>No distribution data available for this question.</div>
    );
  }

  const total = dist.reduce((s, d) => s + d.n, 0);
  const cohortDist = cohortDistribution?.distribution || [];
  const cohortTotal = cohortDist.reduce((s, d) => s + d.n, 0);

  // Build a map for cohort comparison
  const cohortMap = {};
  for (const d of cohortDist) cohortMap[d.label] = d.n;

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginBottom: "1.2rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.9rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1.15rem",
          color: C.textBright,
          letterSpacing: "-0.01em",
        }}>{title}</h2>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: "0.75rem",
          color: C.muted,
        }}>n = {total}</div>
      </div>

      {/* Stacked horizontal bar */}
      <StackedBar dist={dist} total={total} />

      {/* Legend / per-option rows */}
      <div style={{ marginTop: "1.1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {dist.map((d, i) => {
          const pct = total > 0 ? (d.n / total) * 100 : 0;
          const cohortN = cohortMap[d.label] || 0;
          const cohortPct = cohortTotal > 0 ? (cohortN / cohortTotal) * 100 : 0;
          const hasCohort = !!cohortDistribution;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: colorForLabel(d.label),
                flexShrink: 0,
              }} />
              <div style={{
                flex: 1, fontFamily: FONT.body, fontSize: "0.82rem",
                color: C.text, minWidth: 0, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{d.label}</div>
              <div style={{
                fontFamily: FONT.mono, fontSize: "0.74rem",
                color: C.muted, minWidth: 70, textAlign: "right",
              }}>
                {d.n} · {pct.toFixed(1)}%
              </div>
              {hasCohort && (
                <div style={{
                  fontFamily: FONT.mono, fontSize: "0.72rem",
                  color: cohortPct > pct + 3 ? "#68b878" : cohortPct < pct - 3 ? C.red : C.muted,
                  minWidth: 90, textAlign: "right",
                  fontWeight: 600,
                }}>
                  {cohortTotal > 0 ? `cohort ${cohortPct.toFixed(1)}%` : "cohort —"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cohort caption */}
      {cohortDistribution && cohortTotal > 0 && (
        <div style={{
          marginTop: "0.9rem",
          padding: "0.55rem 0.8rem",
          background: "rgba(212,160,48,0.06)",
          border: "1px solid rgba(212,160,48,0.2)",
          borderRadius: 6,
          fontFamily: FONT.body,
          fontSize: "0.76rem",
          color: C.muted,
          lineHeight: 1.5,
        }}>
          <span style={{ color: C.goldBright, fontWeight: 600 }}>Cohort:</span>{" "}
          {cohortTotal} respondents match your filter. Green values are <em>overrepresented</em> in the cohort relative to the full sample; red is <em>underrepresented</em>.
        </div>
      )}
    </div>
  );
}

function StackedBar({ dist, total }) {
  if (total === 0) return null;
  let xCursor = 0;
  return (
    <svg width="100%" height="24" style={{ display: "block", borderRadius: 4, overflow: "hidden" }}>
      <rect x={0} y={0} width="100%" height="24" fill={C.ghost} />
      {dist.map((d, i) => {
        const pct = (d.n / total) * 100;
        const x = xCursor;
        xCursor += pct;
        return (
          <rect
            key={i}
            x={`${x}%`}
            y={0}
            width={`${pct}%`}
            height={24}
            fill={colorForLabel(d.label)}
          >
            <title>{`${d.label}: ${d.n} (${pct.toFixed(1)}%)`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function PathwayBreakdown({ byPathway }) {
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
                    <rect key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorForLabel(d.label)}>
                      <title>{`${d.label}: ${d.n} (${pct.toFixed(1)}%)`}</title>
                    </rect>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
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
