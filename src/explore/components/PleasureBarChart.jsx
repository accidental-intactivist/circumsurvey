import React, { useMemo, useState } from 'react';
import { C, FONT } from '../styles/tokens';

export default function PleasureBarChart({ stats, activeCohortsList, groupBy, showTooltip, moveTooltip, hideTooltip }) {
  const [hoverState, setHoverState] = useState({ active: false, score: 3, colorVar: "--c-ghost" });
  const chartWidth = 900;
  const chartHeight = 360;
  const yMarginBottom = 70;
  const yMarginTop = 20;
  const xMarginLeft = 50;
  const xMarginRight = 20;

  const innerHeight = chartHeight - yMarginTop - yMarginBottom;
  const innerWidth = chartWidth - xMarginLeft - xMarginRight;

  const getY = (score) => yMarginTop + innerHeight - (((Math.max(1, score) - 1) / 4) * innerHeight);

  const ticks = [1, 2, 3, 4, 5];
  const halfTicks = [1.5, 2.5, 3.5, 4.5];

  let groups, innerItems;
  if (groupBy === "factor") {
    groups = stats.sortedQuestions.map(q => ({ id: q.id, label: q.label }));
    innerItems = activeCohortsList.map(c => ({ id: c.id, label: c.label, colorVar: c.colorVar }));
  } else {
    groups = activeCohortsList.map(c => ({ id: c.id, label: c.label }));
    innerItems = stats.sortedQuestions.map(q => ({ id: q.id, label: q.label, colorVar: q.colorVar }));
  }

  if (groups.length === 0) return null;

  const groupWidth = innerWidth / groups.length;
  const getGroupX = (idx) => xMarginLeft + (idx * groupWidth);

  const maxBarWidth = 45;
  const barWidth = Math.min(maxBarWidth, (groupWidth * 0.7) / Math.max(1, innerItems.length));
  const barGap = Math.min(8, barWidth * 0.2);
  const totalGroupWidth = (innerItems.length * barWidth) + ((innerItems.length - 1) * barGap);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <g className="column-grid">
        {ticks.map(t => (
          <g key={`tick-${t}`}>
            <line x1={xMarginLeft} y1={getY(t)} x2={chartWidth - xMarginRight} y2={getY(t)} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
            <text x={xMarginLeft - 10} y={getY(t)} alignmentBaseline="middle" textAnchor="end" style={{ fontFamily: FONT.mono, fontSize: "11px", fill: C.muted }}>
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        {halfTicks.map(t => (
          <line key={`tick-${t}`} x1={xMarginLeft} y1={getY(t)} x2={chartWidth - xMarginRight} y2={getY(t)} stroke={C.ghost} strokeWidth="1" strokeDasharray="2 4" opacity={0.15} />
        ))}
      </g>

      {groups.map((group, i) => {
        const groupX = getGroupX(i);
        const startXOffset = (groupWidth - totalGroupWidth) / 2;

        return (
          <g key={`group-${group.id}`} transform={`translate(${groupX}, 0)`}>
            <rect x={0} y={yMarginTop} width={groupWidth} height={innerHeight} fill={i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"} />
            <text x={groupWidth / 2} y={chartHeight - yMarginBottom + 20} textAnchor="middle" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "12px", fill: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {group.label.split(" ").map((word, wIdx) => (
                <tspan key={wIdx} x={groupWidth / 2} dy={wIdx > 0 ? "14" : "0"}>{word}</tspan>
              ))}
            </text>

            {innerItems.map((item, itemIdx) => {
              const qId = groupBy === "factor" ? group.id : item.id;
              const cId = groupBy === "factor" ? item.id : group.id;
              
              const score = stats.matrix[cId]?.[qId]?.average || 0;
              if (score === 0) return null;
              const n = stats.matrix[cId]?.[qId]?.n || 0;
              
              const barX = startXOffset + (itemIdx * (barWidth + barGap));
              const barY = getY(score);
              const barH = Math.max(2, (yMarginTop + innerHeight) - barY);

              return (
                <g key={`col-${item.id}`} style={{ transition: "all 0.3s ease" }}>
                  <rect 
                    x={barX} 
                    y={barY} 
                    width={barWidth} 
                    height={barH} 
                    fill={`var(${item.colorVar})`} 
                    opacity={0.85}
                    rx={3}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      e.target.setAttribute("opacity", "1");
                      setHoverState({ active: true, score, colorVar: item.colorVar });
                      const tooltipLabel = groupBy === "factor" 
                        ? `${group.label} · ${item.label}`
                        : `${item.label} · ${group.label}`;
                      showTooltip(e, `${tooltipLabel}: ${score.toFixed(2)} (n=${n})`);
                    }}
                    onMouseMove={moveTooltip}
                    onMouseLeave={(e) => {
                      e.target.setAttribute("opacity", "0.85");
                      setHoverState(prev => ({ ...prev, active: false }));
                      hideTooltip();
                    }}
                  />
                  <text 
                    x={barX + barWidth / 2} 
                    y={barY - 10} 
                    textAnchor="middle" 
                    style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: "13px", fill: `var(${item.colorVar})` }}
                  >
                    {score.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      <line
        x1={xMarginLeft - 10}
        y1={getY(hoverState.score)}
        x2={chartWidth - xMarginRight + 10}
        y2={getY(hoverState.score)}
        stroke={`var(${hoverState.colorVar})`}
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity={hoverState.active ? 1 : 0}
        style={{ transition: "all 0.15s ease-out", pointerEvents: "none", filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))" }}
      />
    </svg>
  );
}
