// ═══════════════════════════════════════════════════════════════════════════
// MiniSparkline — compact horizontal distribution bar for list view
// Shows a stacked horizontal bar with segments colored by response value.
// Used inline in QuestionRow. Fed raw distribution data (label, n) pairs.
// ═══════════════════════════════════════════════════════════════════════════

import { C } from "../styles/tokens";

// Heuristic: map a label to a color on the red–blue semantic gradient.
// Labels that sound negative/shocking skew red, positive/good skew blue,
// and unknown/opt-out labels go grey. This mirrors findings-chart logic.
function colorForLabel(label) {
  const l = (label || "").toLowerCase();
  if (!l || /^n\/a$|not applicable|don'?t know|unsure|not sure|prefer not|no idea|don'?t think|don'?t really frame/.test(l)) return C.grey;
  if (/very positive|confident|proud|never|\b1\+ min|strongly prefer intact|intact significantly|keep intact|child'?s right|neutral pros|uncommon|actively researching|no[,.]?$/i.test(l)) return C.blue;
  if (/positive|proud and satisfied|generally|light blue|moderately/i.test(l)) return C.ltBlue;
  if (/neutral|no difference|no preference|mix|50\/50|undecided|ambivalent|somewhat/i.test(l)) return C.yellow;
  if (/negative|somewhat dissatisfied|often|orange|depends|brief/i.test(l)) return C.orange;
  if (/very negative|dissatisfied|always|almost always|0.{0,2}5 sec|something is missing|routine|unquestioned|strongly prefer circ|circ significantly|circumcise|never considered|medical authorities/i.test(l)) return C.red;
  return C.grey;
}

export default function MiniSparkline({ distribution, width = 120, height = 8, cohortDistribution = null }) {
  if (!distribution || distribution.length === 0) {
    return <div style={{
      width, height,
      background: C.ghost,
      borderRadius: 2,
      opacity: 0.3,
    }} />;
  }

  const total = distribution.reduce((s, d) => s + (d.n || 0), 0);
  if (total === 0) return null;

  let xCursor = 0;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      {/* Full-sample bar */}
      <svg width={width} height={height} style={{ display: "block", borderRadius: 2, overflow: "hidden" }} aria-label="distribution">
        <rect x={0} y={0} width={width} height={height} fill={C.ghost} />
        {distribution.map((seg, i) => {
          const pct = (seg.n / total) * width;
          const x = xCursor;
          xCursor += pct;
          return (
            <rect
              key={i}
              x={x}
              y={0}
              width={pct}
              height={height}
              fill={colorForLabel(seg.label)}
            >
              <title>{`${seg.label}: ${seg.n} (${Math.round(seg.n / total * 100)}%)`}</title>
            </rect>
          );
        })}
      </svg>

      {/* Cohort overlay bar (thinner) — only rendered when cohort is active */}
      {cohortDistribution && cohortDistribution.length > 0 && (
        <CohortBar distribution={cohortDistribution} width={width} height={4} />
      )}
    </div>
  );
}

function CohortBar({ distribution, width, height }) {
  const total = distribution.reduce((s, d) => s + (d.n || 0), 0);
  if (total === 0) return null;
  let xCursor = 0;
  return (
    <svg width={width} height={height} style={{ display: "block", borderRadius: 2, overflow: "hidden", opacity: 0.9 }} aria-label="cohort distribution">
      <rect x={0} y={0} width={width} height={height} fill={C.bgDeep} />
      {distribution.map((seg, i) => {
        const pct = (seg.n / total) * width;
        const x = xCursor;
        xCursor += pct;
        return <rect key={i} x={x} y={0} width={pct} height={height} fill={colorForLabel(seg.label)}>
          <title>{`cohort → ${seg.label}: ${seg.n}`}</title>
        </rect>;
      })}
    </svg>
  );
}

export { colorForLabel };
