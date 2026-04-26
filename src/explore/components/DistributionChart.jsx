import { C, FONT } from "../styles/tokens";
import { colorForLabel } from "./MiniSparkline";
import { useTooltip, Tooltip } from "./Tooltip";

export default function DistributionChart({ title, distribution, cohortDistribution, question, hideHeader }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  if (!distribution) {
    return <div style={{ padding: "2rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>Loading…</div>;
  }
  let dist = distribution.distribution || [];
  
  if (question?.id === "demo_generation") {
    const genOrder = [
      "Generation Alpha (born 2013-Present)",
      "Generation Z (born 1997-2012)",
      "Millennial/Gen Y (born 1981-1996)",
      "Xennial/Oregon Trail (born approx. 1977-1983)",
      "Generation X (born 1965-1980)",
      "Baby Boomer (born 1946-1964)",
      "Silent Generation (born 1928-1945)",
      "Not sure / Prefer not to say"
    ];
    dist = [...dist].sort((a, b) => {
      let idxA = genOrder.indexOf(a.label);
      let idxB = genOrder.indexOf(b.label);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      if (idxA === 999 && idxB === 999) return b.n - a.n;
      return idxA - idxB;
    });
  }
  
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
      position: "relative" // for absolute tooltip positioning if needed
    }}>
      {!hideHeader && (
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
      )}

      {/* Stacked horizontal bar */}
      <StackedBar dist={dist} total={total} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />

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
      <Tooltip {...tooltip} />
    </div>
  );
}

function StackedBar({ dist, total, showTooltip, moveTooltip, hideTooltip }) {
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
            onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          />
        );
      })}
    </svg>
  );
}
