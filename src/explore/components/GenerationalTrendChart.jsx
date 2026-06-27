import { useEffect, useState, useMemo } from "react";
import { area, line, curveCatmullRom } from "d3-shape";
import { getAggregate } from "../lib/api";
import { C, FONT } from "../styles/tokens";
import { scaleOrdinal } from "d3-scale";
import { useTooltip, Tooltip } from "./Tooltip";
import { colorForLabel } from "./MiniSparkline";
import { shortLabel } from "../lib/formatters";

export default function GenerationalTrendChart({ questionId, overallDist }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAggregate(questionId, { by: "generation" })
      .then(res => {
        if (!cancelled) {
          // Normalize circ regret labels to match intact style
          if (questionId === "circ_regret_feeling" && res.results) {
            Object.values(res.results).forEach(gen => {
              gen.distribution?.forEach(d => {
                if (d.label === "No, never") {
                  d.label = "No, never; I have always been glad to be circumcised.";
                }
              });
            });
          }
          // Filter out the non-opinion category for pride & satisfaction
          if (questionId === "exp_pride_satisfaction_rating" && res.results) {
            Object.values(res.results).forEach(gen => {
              if (gen.distribution) {
                gen.distribution = gen.distribution.filter(d => 
                  d.label !== "I don't really frame my feelings about it in terms of 'pride' or 'dissatisfaction'."
                );
              }
            });
          }
          // Filter out Unsure/NA from Social Climate
          if (questionId === "observe_all_social_climate_discussion" && res.results) {
            Object.values(res.results).forEach(gen => {
              if (gen.distribution) {
                gen.distribution = gen.distribution.filter(d => 
                  d.label !== "Unsure / Not Applicable"
                );
              }
            });
          }
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [questionId]);

  const colorMap = useMemo(() => {
    const map = {};
    if (overallDist) {
      overallDist.forEach((item, index) => {
        map[item.label] = colorForLabel(item.label, index);
      });
    }
    return map;
  }, [overallDist]);

  // Determine the superset of all labels (to be the layers of the streamgraph)
  const xLabels = useMemo(() => {
    if (overallDist) return overallDist.map(d => d.label);
    if (!data || !data.results) return [];
    
    // Process exact API keys
    const genKeys = [
      "Silent Generation (born 1928-1945)",
      "Baby Boomer (born 1946-1964)",
      "Generation X (born 1965-1980)",
      "Millennial/Gen Y (born 1981-1996)",
      "Generation Z (born 1997-2012)",
      "Generation Alpha (born 2013-Present)"
    ];

    const set = new Set();
    genKeys.forEach(key => {
      const gData = data.results[key];
      if (gData && gData.distribution) {
        gData.distribution.forEach(d => set.add(d.label));
      }
    });

    const labels = Array.from(set);

    const PREFERRED_ORDER = [
      // Pride and Satisfaction scale (Inverted)
      "Very dissatisfied",
      "Somewhat dissatisfied",
      "Neutral or ambivalent",
      "Generally proud and satisfied",
      "Very proud and satisfied",

      // Regret / Resentment scales (Intact & Circ)
      "Yes, these feelings are or have been strong and frequent.",
      "Yes, these feelings are or have been strong and frequent",
      "Yes, I experience some of these feelings sometimes.",
      "Yes, I experience some of these feelings sometimes",
      "Yes, but rarely.",
      "Rarely",
      "No, never; I have always been glad to be intact.",
      "No, never; I have always been glad to be circumcised.",
      "No, never",

      // Social Climate scale
      "It's generally viewed negatively, with intactness being the norm.",
      "It's becoming a topic of active debate and diverse opinions.",
      "It's considered a private, almost taboo subject that isn't discussed.",
      "It's rarely discussed, but when it is, it's assumed to be a normal, positive choice.",
      "It's a complete non-issue; circumcision is the unquestioned default.",

      // Shifting Norms scale
      "The intact state is overwhelmingly seen as the normal and expected standard.",
      "The intact state is generally seen as more normal or is becoming the new standard.",
      "Both are seen as equally normal and acceptable.",
      "The circumcised state is generally seen as more normal and socially advantageous.",
      "The circumcised state is overwhelmingly seen as the normal and expected standard.",
      
      // Cultural Associations scale
      "Definitely Intact",
      "Likely Intact",
      "No Significant Difference / Equally Likely",
      "Likely Circumcised",
      "Definitely Circumcised",
      "Unsure / Don't Know"
    ];

    return labels.sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a);
      const idxB = PREFERRED_ORDER.indexOf(b);
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      
      return a.localeCompare(b);
    });
  }, [overallDist, data]);

  if (loading) {
    return <div style={{ padding: "1rem", color: C.dim, fontStyle: "italic" }}>Loading generational tides...</div>;
  }
  
  if (!data || !data.results || Object.keys(data.results).length === 0) {
    return null;
  }

  // Order generations chronologically
  const genKeys = [
    { key: "Silent Generation (born 1928-1945)", label: "Silent" },
    { key: "Baby Boomer (born 1946-1964)", label: "Boomer" },
    { key: "Generation X (born 1965-1980)", label: "Gen X" },
    { key: "Millennial/Gen Y (born 1981-1996)", label: "Millennial" },
    { key: "Generation Z (born 1997-2012)", label: "Gen Z" }
  ];
  
  const generations = genKeys.filter(g => data.results[g.key] && data.results[g.key].n > 0).map(g => ({
    id: g.label,
    label: g.label,
    ...data.results[g.key]
  }));

  if (generations.length < 2) return null; // Need at least 2 generations to draw a flow

  // Chart dimensions
  const chartWidth = 640;
  const chartHeight = 350;
  const xMarginLeft = 40;
  const xMarginRight = 40;
  const innerWidth = chartWidth - xMarginLeft - xMarginRight;

  const getX = (genIdx) => xMarginLeft + (genIdx * (innerWidth / (generations.length - 1)));
  const getY = (pct) => (pct / 100) * chartHeight; // 0% = top (0), 100% = bottom (350)

  // Build the stacked boundaries for each label across generations
  // layers = [ { label, points: [ {x, y0, y1, gen, pct, n} ] } ]
  const layers = xLabels.map(label => ({
    label,
    points: []
  }));

  generations.forEach((g, gIdx) => {
    const total = g.distribution.reduce((sum, d) => sum + d.n, 0);
    let accumPct = 0;

    xLabels.forEach((label, lIdx) => {
      const found = g.distribution.find(d => d.label === label);
      const n = found ? found.n : 0;
      const pct = total > 0 ? (n / total) * 100 : 0;
      
      const y0 = accumPct;
      const y1 = accumPct + pct;
      
      layers[lIdx].points.push({
        x: getX(gIdx),
        y0: getY(y0),
        y1: getY(y1),
        gen: g.label,
        pct,
        n
      });

      accumPct += pct;
    });
  });

  // SVG Area Generator
  const areaGen = area()
    .x(d => d.x)
    .y0(d => d.y0)
    .y1(d => d.y1)
    .curve(curveCatmullRom.alpha(0.5));

  // The Top Stroke for definition
  const lineGen = line()
    .x(d => d.x)
    .y(d => d.y0)
    .curve(curveCatmullRom.alpha(0.5));

  return (
    <div style={{ position: "relative", width: "100%", marginTop: "3rem" }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        
        {/* X-Axis Generation Labels (Bottom & Top lines) */}
        {generations.map((g, idx) => (
          <g key={`axis-${idx}`}>
            {/* Vertical grid line */}
            <line x1={getX(idx)} y1={0} x2={getX(idx)} y2={chartHeight} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
            {/* Label below */}
            <text x={getX(idx)} y={chartHeight + 20} textAnchor="middle" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "11px", fill: C.textBright, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {g.label}
            </text>
            <text x={getX(idx)} y={chartHeight + 32} textAnchor="middle" style={{ fontFamily: FONT.mono, fontSize: "9px", fill: C.muted }}>
              n={g.distribution.reduce((s, d) => s + d.n, 0)}
            </text>
          </g>
        ))}

        {/* Ribbons */}
        {layers.map((layer, lIdx) => {
          const rowColor = colorMap[layer.label] || colorForLabel(layer.label, lIdx);
          
          // Find the best point to place the label (where the ribbon is thickest, or simply largest pct)
          let bestPt = null;
          let maxPct = 0;
          layer.points.forEach((pt, i) => {
            // Avoid placing labels on the very first or very last generation if possible, unless it's the only thick part
            const isEdge = i === 0 || i === layer.points.length - 1;
            const weight = isEdge ? 0.8 : 1.2; // Prefer middle points
            if (pt.pct * weight > maxPct) {
              maxPct = pt.pct * weight;
              bestPt = pt;
            }
          });

          return (
            <g key={`ribbon-${layer.label}`}>
              {/* Ribbon Fill */}
              <path
                d={areaGen(layer.points)}
                fill={rowColor}
                opacity={0.65}
                style={{ transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1), fill 0.8s ease" }}
              />
              {/* Ribbon Top Edge Line */}
              <path
                d={lineGen(layer.points)}
                fill="none"
                stroke={C.bgSoft}
                strokeWidth={1}
                style={{ transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />

              {/* Interaction Overlay (Invisible Rects + Visible Circles on Hover) */}
              {layer.points.map((pt, pIdx) => {
                if (pt.pct < 1) return null; // Don't show dots for ~0% flows
                const midY = pt.y0 + (pt.y1 - pt.y0) / 2;
                return (
                  <circle
                    key={`pt-${layer.label}-${pIdx}`}
                    cx={pt.x}
                    cy={midY}
                    r={pt.pct > 5 ? 5 : 3}
                    fill={C.bg}
                    stroke={rowColor}
                    strokeWidth={1.5}
                    opacity={0.2}
                    style={{ cursor: "pointer", transition: "cy 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, r 0.2s ease, stroke-width 0.2s ease" }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "1";
                      e.target.setAttribute("r", 7);
                      e.target.setAttribute("stroke-width", 2.5);
                      showTooltip(e, `${pt.gen} · ${layer.label}: ${pt.pct.toFixed(1)}% (n=${pt.n})`);
                    }}
                    onMouseMove={moveTooltip}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "0.2";
                      e.target.setAttribute("r", pt.pct > 5 ? 5 : 3);
                      e.target.setAttribute("stroke-width", 1.5);
                      hideTooltip();
                    }}
                  />
                );
              })}

              {/* Inline Ribbon Label */}
              {bestPt && bestPt.pct > 6 && (
                <text
                  x={bestPt.x}
                  y={bestPt.y0 + (bestPt.y1 - bestPt.y0) / 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={C.textBright}
                  stroke={C.bg}
                  strokeWidth="3px"
                  strokeLinejoin="round"
                  style={{
                    fontFamily: FONT.condensed,
                    fontSize: bestPt.pct > 12 ? "11px" : "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    pointerEvents: "none",
                    paintOrder: "stroke fill",
                    opacity: 0.9,
                  }}
                >
                  {(() => {
                    const txt = shortLabel(layer.label);
                    if (txt.length <= 12) return txt;
                    
                    // Find a space near the middle
                    const mid = Math.floor(txt.length / 2);
                    let splitIdx = txt.lastIndexOf(" ", mid);
                    
                    // If no space before mid, or the space is too far, look forward
                    if (splitIdx === -1 || (mid - splitIdx) > 5) {
                      const forwardIdx = txt.indexOf(" ", mid);
                      if (forwardIdx !== -1) splitIdx = forwardIdx;
                    }
                    
                    if (splitIdx === -1) return txt;
                    
                    const line1 = txt.slice(0, splitIdx);
                    const line2 = txt.slice(splitIdx + 1);
                    
                    return (
                      <>
                        <tspan x={bestPt.x} dy="-0.5em">{line1}</tspan>
                        <tspan x={bestPt.x} dy="1.1em">{line2}</tspan>
                      </>
                    );
                  })()}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legible Answer Legend below chart */}
      <div style={{
        marginTop: "3rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        paddingTop: "1.5rem",
        borderTop: `1px solid ${C.ghost}`
      }}>
        <h3 style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "0.75rem", color: C.goldBright, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Legend
        </h3>
        {layers.map((layer, idx) => {
          const rowColor = colorMap[layer.label] || colorForLabel(layer.label, idx);
          return (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: rowColor, flexShrink: 0, marginTop: "0.15rem" }}></div>
              <div style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.text, lineHeight: 1.4 }}>
                {layer.label}
              </div>
            </div>
          );
        })}
      </div>
      
      <Tooltip {...tooltip} />
    </div>
  );
}
