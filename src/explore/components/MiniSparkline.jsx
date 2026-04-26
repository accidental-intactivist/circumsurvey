// ═══════════════════════════════════════════════════════════════════════════
// MiniSparkline — compact horizontal distribution bar for list view
// Shows a stacked horizontal bar with segments colored by response value.
// Used inline in QuestionRow. Fed raw distribution data (label, n) pairs.
// ═══════════════════════════════════════════════════════════════════════════

import { C } from "../styles/tokens";
import { useTooltip, Tooltip } from "./Tooltip";


function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Heuristic: map a label to a color on the red–blue semantic gradient.
// Labels that sound negative/shocking skew red, positive/good skew blue,
// and unknown/opt-out labels go grey. This mirrors findings-chart logic.
function colorForLabel(label) {
  const l = (label || "").toLowerCase();
  
  // Distinctive vibrant colors for generation cohorts
  if (/gen alpha|2013-present/i.test(l)) return "#d94f4f"; // Red
  if (/gen z|1997-2012/i.test(l)) return "#e8a44a"; // Orange
  if (/millennial|1981-1996/i.test(l)) return "#e8c868"; // Yellow
  if (/xennial|1977-1983/i.test(l)) return "#68b878"; // Green
  if (/gen x|generation x|1965-1980/i.test(l)) return "#8bb8d9"; // Lt Blue
  if (/boomer|1946-1964/i.test(l)) return "#5b93c7"; // Blue
  if (/silent|1928-1945/i.test(l)) return "#7868b8"; // Purple
  
  if (!l || /^n\/a$|not applicable|don'?t know|unsure|not sure|prefer not|no idea|don'?t think|don'?t really frame/.test(l)) return C.grey;
  if (/very positive|confident|proud|never|\b1\+ min|strongly prefer intact|intact significantly|keep intact|child'?s right|neutral pros|uncommon|actively researching|no[,.]?$/i.test(l)) return C.blue;
  if (/positive|proud and satisfied|generally|light blue|moderately/i.test(l)) return C.ltBlue;
  if (/neutral|no difference|no preference|mix|50\/50|undecided|ambivalent|somewhat/i.test(l)) return C.yellow;
  if (/negative|somewhat dissatisfied|often|orange|depends|brief/i.test(l)) return C.orange;
  if (/very negative|dissatisfied|always|almost always|0.{0,2}5 sec|something is missing|routine|unquestioned|strongly prefer circ|circ significantly|circumcise|never considered|medical authorities/i.test(l)) return C.red;
  
  // Deterministic hash for unmatched labels generating a vibrant, distinct HSL color
  // We multiply the hash by the golden ratio angle (137.5 degrees) to ensure colors
  // are maximally distinct even for strings with similar hash values.
  const hue = (stringHash(l) * 137.5) % 360;
  return `hsl(${hue.toFixed(1)}, 65%, 55%)`;
}

export default function MiniSparkline({ distribution, width = 120, height = 8, cohortDistribution = null }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

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
              onMouseEnter={(e) => showTooltip(e, `${seg.label}: ${seg.n} (${Math.round(seg.n / total * 100)}%)`)}
              onMouseMove={moveTooltip}
              onMouseLeave={hideTooltip}
            />
          );
        })}
      </svg>

      {/* Cohort overlay bar (thinner) — only rendered when cohort is active */}
      {cohortDistribution && cohortDistribution.length > 0 && (
        <CohortBar distribution={cohortDistribution} width={width} height={4} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
      )}
      <Tooltip {...tooltip} />
    </div>
  );
}

function CohortBar({ distribution, width, height, showTooltip, moveTooltip, hideTooltip }) {
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
        return <rect 
          key={i} x={x} y={0} width={pct} height={height} fill={colorForLabel(seg.label)}
          onMouseEnter={(e) => showTooltip(e, `cohort → ${seg.label}: ${seg.n}`)}
          onMouseMove={moveTooltip}
          onMouseLeave={hideTooltip}
        />;
      })}
    </svg>
  );
}

export { colorForLabel };
