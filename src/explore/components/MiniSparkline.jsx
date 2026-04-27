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

// 20 maximally distinct colors (Sasha Trubetskoy's palette)
const DISTINCT_COLORS = [
  "#e6194b", // Red
  "#3cb44b", // Green
  "#ffe119", // Yellow
  "#4363d8", // Blue
  "#f58231", // Orange
  "#911eb4", // Purple
  "#46f0f0", // Cyan
  "#f032e6", // Magenta
  "#bcf60c", // Lime
  "#fabebe", // Pink
  "#008080", // Teal
  "#e6beff", // Lavender
  "#9a6324", // Brown
  "#fffac8", // Beige
  "#800000", // Maroon
  "#aaffc3", // Mint
  "#808000", // Olive
  "#ffd8b1", // Apricot
  "#000075", // Navy
  "#808080"  // Grey
];

function getCategoricalColor(index) {
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
}

function adjustColor(hex, index) {
  if (index === 0) return hex;
  // Create variations by alternately darkening and lightening based on index
  const sign = index % 2 === 1 ? -1 : 1;
  // Cycle magnitude to prevent pushing to pure black/white for high indices
  const step = Math.ceil(index / 2) % 5; // 1, 2, 3, 4, 0
  const magnitude = (step === 0 ? 5 : step) * 0.15; // 0.15 to 0.75 max
  
  let color = hex.replace("#", "");
  if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  
  let r = parseInt(color.substr(0, 2), 16);
  let g = parseInt(color.substr(2, 2), 16);
  let b = parseInt(color.substr(4, 2), 16);
  
  // Blend towards white or black to preserve hue
  if (sign > 0) {
    r = r + (255 - r) * magnitude;
    g = g + (255 - g) * magnitude;
    b = b + (255 - b) * magnitude;
  } else {
    r = r * (1 - magnitude);
    g = g * (1 - magnitude);
    b = b * (1 - magnitude);
  }
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

// Heuristic: map a label to a color on the red–blue semantic gradient.
// Labels that sound negative/shocking skew red, positive/good skew blue,
// and unknown/opt-out labels go grey. This mirrors findings-chart logic.
// If it doesn't match a semantic bucket, it uses the index to pick a distinct categorical color.
function colorForLabel(label, index = 0) {
  const l = (label || "").toLowerCase();
  
  // Distinctive vibrant colors for generation cohorts (no variation needed as they are uniquely named)
  if (/gen alpha|2013-present/i.test(l)) return "#d94f4f"; // Red
  if (/gen z|1997-2012/i.test(l)) return "#e8a44a"; // Orange
  if (/millennial|1981-1996/i.test(l)) return "#e8c868"; // Yellow
  if (/xennial|1977-1983/i.test(l)) return "#68b878"; // Green
  if (/gen x|generation x|1965-1980/i.test(l)) return "#8bb8d9"; // Lt Blue
  if (/boomer|1946-1964/i.test(l)) return "#5b93c7"; // Blue
  if (/silent|1928-1945/i.test(l)) return "#7868b8"; // Purple
  
  if (!l || /^n\/a$|^not applicable$|^don'?t know$|^unsure$|^not sure$|^prefer not|^no idea$|^don'?t think$|^don'?t really frame$/.test(l)) return adjustColor(C.grey, index);
  if (/^very positive$|^confident$|^proud$|^never$|\b1\+ min|^strongly prefer intact$|^intact significantly$|^keep intact$|^child'?s right$|^neutral pros$|^uncommon$|^actively researching$|^no[,.]?$/i.test(l)) return adjustColor(C.blue, index);
  if (/^positive$|^proud and satisfied$|^generally$|^light blue$|^moderately$/i.test(l)) return adjustColor(C.ltBlue, index);
  if (/^neutral$|^no difference$|^no preference$|^mix$|^50\/50$|^undecided$|^ambivalent$|^somewhat$/i.test(l)) return adjustColor(C.yellow, index);
  if (/^negative$|^somewhat dissatisfied$|^often$|^orange$|^depends$|^brief$/i.test(l)) return adjustColor(C.orange, index);
  if (/^very negative$|^dissatisfied$|^always$|^almost always$|^0.{0,2}5 sec$|^something is missing$|^routine$|^unquestioned$|^strongly prefer circ$|^circ significantly$|^circumcise$|^never considered$|^medical authorities$/i.test(l)) return adjustColor(C.red, index);
  
  // Use programmatic distinct colors to guarantee no clashes.
  return getCategoricalColor(index);
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
                fill={colorForLabel(seg.label, i)}
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
          key={i} x={x} y={0} width={pct} height={height} fill={colorForLabel(seg.label, i)}
          onMouseEnter={(e) => showTooltip(e, `cohort → ${seg.label}: ${seg.n}`)}
          onMouseMove={moveTooltip}
          onMouseLeave={hideTooltip}
        />;
      })}
    </svg>
  );
}

export { colorForLabel };
