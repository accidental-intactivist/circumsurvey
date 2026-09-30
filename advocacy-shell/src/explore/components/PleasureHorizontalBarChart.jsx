import React, { useState } from 'react';
import { C, FONT } from '../styles/tokens';

export default function PleasureHorizontalBarChart({ stats, activeCohortsList, groupBy, showGap, quotes, showTooltip, moveTooltip, hideTooltip }) {
  const [hoverState, setHoverState] = useState({ active: false, score: 3, colorVar: "--c-ghost" });
  
  let groups, innerItems;
  if (groupBy === "factor") {
    groups = stats.sortedQuestions.map(q => ({ id: q.id, label: q.label }));
    innerItems = activeCohortsList.map(c => ({ id: c.id, label: c.label, colorVar: c.colorVar }));
  } else {
    groups = activeCohortsList.map(c => ({ id: c.id, label: c.label }));
    innerItems = stats.sortedQuestions.map(q => ({ id: q.id, label: q.label, colorVar: q.colorVar }));
  }

  if (groups.length === 0) return null;

  const chartWidth = 500;
  const xMarginLeft = 20;
  const xMarginRight = 40;
  const yMarginTop = 30;
  const yMarginBottom = 20;

  const innerWidth = chartWidth - xMarginLeft - xMarginRight;
  const getX = (score) => xMarginLeft + (((Math.max(1, score) - 1) / 4) * innerWidth);

  const ticks = [1, 2, 3, 4, 5];
  const halfTicks = [1.5, 2.5, 3.5, 4.5];

  const barHeight = 24;
  const barGap = 6;
  const groupGap = 40;
  const groupLabelHeight = 20;

  const groupContentHeight = (innerItems.length * barHeight) + ((innerItems.length - 1) * barGap);
  const totalGroupHeight = groupLabelHeight + groupContentHeight;
  const chartHeight = yMarginTop + (groups.length * totalGroupHeight) + ((groups.length - 1) * groupGap) + yMarginBottom;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <pattern id="deficitPatternH" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={C.red} strokeWidth="2" opacity="0.6" />
        </pattern>
      </defs>
      
      {/* Grid Lines */}
      <g className="column-grid">
        {ticks.map(t => (
          <g key={`tick-${t}`}>
            <line x1={getX(t)} y1={yMarginTop} x2={getX(t)} y2={chartHeight - yMarginBottom} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
            <text x={getX(t)} y={15} alignmentBaseline="middle" textAnchor="middle" style={{ fontFamily: FONT.mono, fontSize: "11px", fill: C.muted }}>
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        {halfTicks.map(t => (
          <line key={`tick-${t}`} x1={getX(t)} y1={yMarginTop} x2={getX(t)} y2={chartHeight - yMarginBottom} stroke={C.ghost} strokeWidth="1" strokeDasharray="2 4" opacity={0.15} />
        ))}
      </g>

      {/* Groups */}
      {groups.map((group, i) => {
        const groupY = yMarginTop + (i * (totalGroupHeight + groupGap));

        return (
          <g key={`group-${group.id}`} transform={`translate(0, ${groupY})`}>
            {/* Group background alternating */}
            <rect x={0} y={0} width={chartWidth} height={totalGroupHeight} fill={i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"} rx={4} />
            
            {/* Group Label */}
            <text x={xMarginLeft} y={groupLabelHeight / 2} alignmentBaseline="middle" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "13px", fill: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {group.label}
            </text>

            {/* Inner Bars */}
            {innerItems.map((item, itemIdx) => {
              const qId = groupBy === "factor" ? group.id : item.id;
              const cId = groupBy === "factor" ? item.id : group.id;
              
              const score = stats.matrix[cId]?.[qId]?.average || 0;
              const intactScore = stats.matrix['intact']?.[qId]?.average || score;
              if (score === 0) return null;
              const n = stats.matrix[cId]?.[qId]?.n || 0;
              
              const barY = groupLabelHeight + (itemIdx * (barHeight + barGap));
              const barX = getX(1); // Bar always starts at 1
              const barW = Math.max(2, getX(score) - barX);

              const gapX = getX(score);
              const gapW = Math.max(0, getX(intactScore) - gapX);
              const isGapVisible = showGap && cId !== 'intact' && gapW > 5;

              return (
                <g key={`row-${item.id}`} style={{ transition: "all 0.3s ease" }}>
                  {/* The actual score bar */}
                  <rect 
                    x={barX} 
                    y={barY} 
                    width={barW} 
                    height={barHeight} 
                    fill={`var(${item.colorVar})`} 
                    opacity={0.85}
                    rx={3}
                    style={{ cursor: "pointer", transition: "all 0.4s ease" }}
                    onMouseEnter={(e) => {
                      e.target.setAttribute("opacity", "1");
                      setHoverState({ active: true, score, colorVar: item.colorVar });
                      const tooltipLabel = groupBy === "factor" 
                        ? `${group.label} · ${item.label}`
                        : `${item.label} · ${group.label}`;
                        
                      const tooltipQuote = quotes?.[cId]?.[qId];
                      showTooltip(e, (
                        <div style={{ maxWidth: 260, fontFamily: FONT.body, fontSize: "0.85rem", lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 700, color: C.goldBright, marginBottom: "0.2rem" }}>{tooltipLabel}</div>
                          <div style={{ fontFamily: FONT.mono, fontSize: "1rem", color: C.textBright, marginBottom: "0.4rem" }}>
                            Avg Score: {score.toFixed(2)} <span style={{ fontSize: "0.7rem", color: C.muted }}>(n={n})</span>
                          </div>
                          {tooltipQuote && (
                            <div style={{ fontStyle: "italic", color: C.muted, borderTop: `1px solid ${C.ghost}`, paddingTop: "0.5rem", marginTop: "0.3rem" }}>
                              "{tooltipQuote}"
                            </div>
                          )}
                        </div>
                      ));
                    }}
                    onMouseMove={moveTooltip}
                    onMouseLeave={(e) => {
                      e.target.setAttribute("opacity", "0.85");
                      setHoverState(prev => ({ ...prev, active: false }));
                      hideTooltip();
                    }}
                  />
                  
                  {/* Explicit Deficit Gap */}
                  {isGapVisible && (
                    <rect
                      x={gapX}
                      y={barY}
                      width={gapW}
                      height={barHeight}
                      fill="url(#deficitPatternH)"
                      opacity={1}
                      rx={3}
                      style={{ transition: "all 0.5s ease", pointerEvents: "none" }}
                    />
                  )}

                  {/* Explicit Deficit Label */}
                  {isGapVisible && (
                    <text
                      x={gapX + gapW / 2}
                      y={barY + (barHeight / 2)}
                      alignmentBaseline="middle"
                      textAnchor="middle"
                      style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: "11px", fill: C.red, transition: "all 0.4s ease" }}
                    >
                      -{ (intactScore - score).toFixed(2) }
                    </text>
                  )}

                  {/* Standard Score Label */}
                  <text 
                    x={isGapVisible ? gapX - 6 : barX + barW + 6} 
                    y={barY + (barHeight / 2)} 
                    alignmentBaseline="middle"
                    textAnchor={isGapVisible ? "end" : "start"} 
                    style={{ 
                      fontFamily: FONT.mono, 
                      fontWeight: 700, 
                      fontSize: "12px", 
                      fill: isGapVisible ? C.bg : `var(${item.colorVar})`,
                      transition: "all 0.4s ease",
                      pointerEvents: "none"
                    }}
                  >
                    {score.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Hover Line */}
      <line
        x1={getX(hoverState.score)}
        y1={yMarginTop}
        x2={getX(hoverState.score)}
        y2={chartHeight - yMarginBottom + 10}
        stroke={`var(${hoverState.colorVar})`}
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity={hoverState.active ? 1 : 0}
        style={{ transition: "all 0.15s ease-out", pointerEvents: "none", filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))" }}
      />
    </svg>
  );
}
