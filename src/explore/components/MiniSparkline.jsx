// ═══════════════════════════════════════════════════════════════════════════
// MiniSparkline — compact horizontal distribution bar for list view
// Shows a stacked horizontal bar with segments colored by response value.
// Used inline in QuestionRow. Fed raw distribution data (label, n) pairs.
// ═══════════════════════════════════════════════════════════════════════════

import { C, resolveCssColor } from "../styles/tokens";
import { useTooltip, Tooltip } from "./Tooltip";
import { shortLabel } from "../lib/formatters";
import { useTheme } from "../contexts/ThemeContext";

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 20 maximally distinct colors (Sasha Trubetskoy's palette)
export const DISTINCT_COLORS = [
  "#4363d8", // Blue
  "#f58231", // Orange
  "#3cb44b", // Green
  "#e6194b", // Red
  "#911eb4", // Purple
  "#ffe119", // Yellow
  "#46f0f0", // Cyan
  "#f032e6", // Magenta
  "#bcf60c", // Lime
  "#fabebe", // Pink
  "#008080", // Teal
  "#e6beff", // Lavender
  "#fffac8", // Beige
  "#aaffc3", // Mint
  "#ffd8b1", // Apricot
  "#808080"  // Grey
];

function getCategoricalColor(index) {
  const varName = `--chart-${index % 10}`;
  if (typeof window !== "undefined") {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (val) return val;
  }
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
}

function adjustColor(colorVal, index) {
  const hex = resolveCssColor(colorVal);
  if (index === 0) return hex;
  // Create variations by alternately darkening and lightening based on index
  const sign = index % 2 === 1 ? -1 : 1;
  // Cycle magnitude to prevent pushing to pure black/white for high indices
  const step = Math.ceil(index / 2) % 5; // 1, 2, 3, 4, 0
  const magnitude = (step === 0 ? 5 : step) * 0.15; // 0.15 to 0.75 max
  
  let color = hex.replace("#", "");
  if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  
  let r = parseInt(color.substr(0, 2), 16) || 0;
  let g = parseInt(color.substr(2, 2), 16) || 0;
  let b = parseInt(color.substr(4, 2), 16) || 0;
  
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
  if (/gen alpha|2013-present/i.test(l)) return resolveCssColor("var(--c-red)");
  if (/gen z|1997-2012/i.test(l)) return resolveCssColor("var(--c-orange)");
  if (/millennial|1981-1996/i.test(l)) return resolveCssColor("var(--c-yellow)");
  if (/xennial|1977-1983/i.test(l)) return resolveCssColor("var(--c-green)");
  if (/gen x|generation x|1965-1980/i.test(l)) return resolveCssColor("var(--c-ltBlue)");
  if (/boomer|1946-1964/i.test(l)) return resolveCssColor("var(--c-blue)");
  if (/silent|1928-1945/i.test(l)) return resolveCssColor("var(--c-purple)");
  
  // Flat, consistent vibrant colors for restoration outcome ratings
  if (/^significantly improved$/i.test(l)) return resolveCssColor("var(--c-green)");
  if (/^somewhat improved$/i.test(l)) return resolveCssColor("var(--c-blue)");
  if (/^no noticeable change$/i.test(l)) return resolveCssColor("var(--c-yellow)");
  if (/^somewhat diminished$/i.test(l)) return resolveCssColor("var(--c-orange)");
  if (/^significantly diminished$/i.test(l)) return resolveCssColor("var(--c-red)");
  if (/^not a primary goal \/ not applicable to me$|^not a primary goal/i.test(l)) return resolveCssColor("var(--c-grey)");

  if (!l || /^n\/a$|^not applicable$|^don'?t know$|^unsure$|^not sure$|^prefer not|^no idea$|^don'?t think$|^don'?t really frame$|not a significant topic|not a major topic|non-issue/i.test(l)) return resolveCssColor(C.grey);
  if (/^very positive$|^confident$|^proud$|^never$|\b1\+ min|^strongly prefer intact$|^intact significantly$|^keep intact$|^child'?s right$|^neutral pros$|^uncommon$|^actively researching$|^no[,.]?$|questioned or chose|discouraged or seen as|^yes, extensively$/i.test(l)) return resolveCssColor(C.blue);
  if (/^positive$|^proud and satisfied$|^generally$|^light blue$|^moderately$|^yes, somewhat$/i.test(l)) return resolveCssColor(C.ltBlue);
  if (/^neutral$|^no difference$|^no preference$|^mix$|^50\/50$|^undecided$|^ambivalent$|^somewhat$|open to discussion|left to parents/i.test(l)) return resolveCssColor(C.yellow);
  if (/^negative$|^somewhat dissatisfied$|^often$|^orange$|^depends$|^brief$|important tradition|strong cultural practice|cultural norm|^yes[,.]?$|^no, not really$/i.test(l)) return resolveCssColor(C.orange);
  if (/^very negative$|^dissatisfied$|^always$|^almost always$|^0.{0,2}5 sec$|^something is missing$|^routine$|^unquestioned$|^strongly prefer circ$|^circ significantly$|^circumcise$|^never considered$|^medical authorities$|non-negotiable|highly recommended|recommended practice/i.test(l)) return resolveCssColor(C.red);
  
  // Use programmatic distinct colors to guarantee no clashes.
  return getCategoricalColor(index);
}

export default function MiniSparkline({ distribution, width = 120, height = 8, cohortDistribution = null }) {
  const { colorblind, theme } = useTheme();
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

  // Build a canonical color map from the overall distribution
  const colorMap = {};
  distribution.forEach((item, index) => {
    colorMap[item.label] = colorForLabel(item.label, index);
  });

  // Sort cohort distribution to match the overall distribution label order
  let sortedCohortDist = null;
  if (cohortDistribution && cohortDistribution.length > 0) {
    const labelOrder = distribution.map(item => item.label);
    sortedCohortDist = [...cohortDistribution].sort((a, b) => {
      let idxA = labelOrder.indexOf(a.label);
      let idxB = labelOrder.indexOf(b.label);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });
  }

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
                fill={colorMap[seg.label] || colorForLabel(seg.label, i)}
                onMouseEnter={(e) => showTooltip(e, `${shortLabel(seg.label)}: ${seg.n} (${Math.round(seg.n / total * 100)}%)`)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              />
          );
        })}
      </svg>

      {/* Cohort overlay bar (thinner) — only rendered when cohort is active */}
      {sortedCohortDist && sortedCohortDist.length > 0 && (
        <CohortBar distribution={sortedCohortDist} width={width} height={4} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} colorMap={colorMap} />
      )}
      <Tooltip {...tooltip} />
    </div>
  );
}

function CohortBar({ distribution, width, height, showTooltip, moveTooltip, hideTooltip, colorMap }) {
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
          key={i} x={x} y={0} width={pct} height={height} fill={colorMap[seg.label] || colorForLabel(seg.label, i)}
          onMouseEnter={(e) => showTooltip(e, `cohort → ${shortLabel(seg.label)}: ${seg.n}`)}
          onMouseMove={moveTooltip}
          onMouseLeave={hideTooltip}
        />;
      })}
    </svg>
  );
}

export { colorForLabel };
