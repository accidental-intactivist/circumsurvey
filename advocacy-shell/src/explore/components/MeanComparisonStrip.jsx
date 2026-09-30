// ═══════════════════════════════════════════════════════════════════════════
// MeanComparisonStrip — visual inter-pathway Likert mean comparison
//
// Renders a horizontal strip showing per-pathway numeric averages with
// the delta between extremes annotated. Used on QuestionPage for
// scale_1_5 and likert-type questions.
//
// Props:
//   byPathway — the aggregate response object { results: { intact: { avg, n }, ... } }
//   scaleMax  — the maximum value on the scale (default 5)
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";
import IconifyEmoji from "./IconifyEmoji";

export default function MeanComparisonStrip({ byPathway, scaleMax = 5 }) {
  const pathwayMeans = useMemo(() => {
    if (!byPathway?.results) return [];
    return PATHWAY_IDS
      .filter((id) => {
        const r = byPathway.results[id];
        return r && r.avg !== null && r.avg !== undefined && r.n > 0;
      })
      .map((id) => ({
        id,
        avg: byPathway.results[id].avg,
        n: byPathway.results[id].n,
        ...PATHWAYS[id],
      }));
  }, [byPathway]);

  if (pathwayMeans.length < 2) return null;

  const minMean = Math.min(...pathwayMeans.map((p) => p.avg));
  const maxMean = Math.max(...pathwayMeans.map((p) => p.avg));
  const delta = maxMean - minMean;

  // Sort by mean for display
  const sorted = [...pathwayMeans].sort((a, b) => b.avg - a.avg);

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1rem 1.2rem",
      marginBottom: "1rem",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "0.8rem",
      }}>
        <h3 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1rem",
          color: C.textBright,
          letterSpacing: "-0.01em",
          margin: 0,
        }}>Pathway Means</h3>
        {delta > 0 && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.72rem",
            color: delta >= 1.0 ? C.red : delta >= 0.5 ? C.gold : C.muted,
            fontWeight: 700,
            background: delta >= 1.0
              ? "rgba(217, 79, 79, 0.1)"
              : delta >= 0.5
                ? "rgba(212, 160, 48, 0.1)"
                : "rgba(255,255,255,0.03)",
            border: `1px solid ${delta >= 1.0
              ? "rgba(217, 79, 79, 0.25)"
              : delta >= 0.5
                ? "rgba(212, 160, 48, 0.25)"
                : C.ghost}`,
            borderRadius: 999,
            padding: "0.15rem 0.55rem",
          }}>
            Δ {delta.toFixed(2)}
          </span>
        )}
      </div>

      {/* Scale track + pathway markers */}
      <div style={{ position: "relative", margin: "0.6rem 0 1.4rem" }}>
        {/* Background track */}
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${C.ghost} 0%, rgba(212,160,48,0.2) 50%, ${C.ghost} 100%)`,
          borderRadius: 3,
          position: "relative",
        }}>
          {/* Scale labels */}
          <span style={{
            position: "absolute",
            left: 0,
            top: -16,
            fontFamily: FONT.mono,
            fontSize: "0.6rem",
            color: C.dim,
          }}>1</span>
          <span style={{
            position: "absolute",
            right: 0,
            top: -16,
            fontFamily: FONT.mono,
            fontSize: "0.6rem",
            color: C.dim,
          }}>{scaleMax}</span>

          {/* Pathway markers */}
          {sorted.map((p) => {
            const pct = ((p.avg - 1) / (scaleMax - 1)) * 100;
            return (
              <div
                key={p.id}
                title={`${p.label}: ${p.avg.toFixed(2)} (n=${p.n})`}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: p.color || PATH_COLORS[p.id] || C.muted,
                  border: `2px solid ${C.bgSoft}`,
                  boxShadow: `0 0 0 1px ${p.color || C.muted}44`,
                  zIndex: 10,
                  cursor: "default",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Legend rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {sorted.map((p) => (
          <div key={p.id} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <IconifyEmoji emoji={p.emoji} size="0.85rem" style={{ color: p.color }} />
            <span style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: p.color,
              flex: 1,
            }}>{p.label}</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.78rem",
              fontWeight: 700,
              color: C.textBright,
            }}>{p.avg.toFixed(2)}</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.62rem",
              color: C.dim,
              minWidth: 48,
              textAlign: "right",
            }}>n={p.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
