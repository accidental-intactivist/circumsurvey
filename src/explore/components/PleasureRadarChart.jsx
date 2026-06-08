import React from 'react';
import { C, FONT } from '../styles/tokens';

export default function PleasureRadarChart({ stats, activeCohortsList, showGap, quotes, showTooltip, moveTooltip, hideTooltip }) {
  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 80; // Leave room for labels
  const questions = stats.sortedQuestions;
  const numAxes = questions.length;

  if (numAxes === 0 || activeCohortsList.length === 0) return null;

  // Map 1.0 to 5.0 onto radius 0 to maxRadius
  // Alternatively, map 0 to 5.0 so center is 0.
  const getCoordinates = (score, index) => {
    const normalizedScore = Math.max(0, Math.min(5, score));
    const r = (normalizedScore / 5) * maxRadius;
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2; // Start at top
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const ticks = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: 650, height: "auto", overflow: "visible" }}>
        
        <defs>
          <pattern id="deficitPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={C.red} strokeWidth="2" opacity="0.6" />
          </pattern>
        </defs>

        {/* Background Grids (Concentric Polygons) */}
        {ticks.map(t => {
          const points = questions.map((_, i) => {
            const { x, y } = getCoordinates(t, i);
            return `${x},${y}`;
          }).join(" ");
          
          return (
            <g key={`grid-${t}`}>
              <polygon points={points} fill={t % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"} stroke={C.ghost} strokeWidth="1" opacity={0.5} />
              <text x={center} y={center - (t / 5) * maxRadius - 4} textAnchor="middle" style={{ fontFamily: FONT.mono, fontSize: "10px", fill: C.muted }}>
                {t}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        {questions.map((q, i) => {
          const { x: endX, y: endY } = getCoordinates(5, i);
          const { x: labelX, y: labelY } = getCoordinates(5.7, i); // Push labels out
          
          let textAnchor = "middle";
          if (labelX > center + 10) textAnchor = "start";
          if (labelX < center - 10) textAnchor = "end";

          return (
            <g key={`axis-${q.id}`}>
              <line x1={center} y1={center} x2={endX} y2={endY} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity={0.5} />
              <text x={labelX} y={labelY} alignmentBaseline="middle" textAnchor={textAnchor} style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "12px", fill: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {q.label}
              </text>
            </g>
          );
        })}

        {/* Cohort Polygons */}
        {activeCohortsList.map(c => {
          const points = questions.map((q, i) => {
            const score = stats.matrix[c.id]?.[q.id]?.average || 0;
            const { x, y } = getCoordinates(score, i);
            return `${x},${y}`;
          }).join(" ");

          return (
            <polygon 
              key={`poly-${c.id}`}
              points={points}
              fill={showGap && c.id === 'intact' ? "url(#deficitPattern)" : showGap && c.id !== 'intact' ? C.bg : `var(${c.colorVar})`}
              fillOpacity={showGap && c.id === 'intact' ? 1 : showGap ? 0.95 : 0.15}
              stroke={showGap && c.id === 'intact' ? C.red : `var(${c.colorVar})`}
              strokeWidth={showGap && c.id === 'intact' ? "4" : "3"}
              style={{ transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)", cursor: "pointer", mixBlendMode: showGap ? "normal" : "screen" }}
              onMouseEnter={(e) => {
                e.target.setAttribute("fill-opacity", "0.35");
                e.target.setAttribute("stroke-width", "5");
              }}
              onMouseLeave={(e) => {
                e.target.setAttribute("fill-opacity", "0.15");
                e.target.setAttribute("stroke-width", "3");
              }}
            />
          );
        })}

        {/* Data Dots on Vertices */}
        {activeCohortsList.map(c => {
          return questions.map((q, i) => {
            const score = stats.matrix[c.id]?.[q.id]?.average || 0;
            if (score === 0) return null;
            const n = stats.matrix[c.id]?.[q.id]?.n || 0;
            const { x, y } = getCoordinates(score, i);

            return (
              <circle
                key={`dot-${c.id}-${q.id}`}
                cx={x}
                cy={y}
                r={5}
                fill={C.bgCard}
                stroke={`var(${c.colorVar})`}
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.5s ease" }}
                onMouseEnter={(e) => {
                  e.target.setAttribute("r", "7");
                  const quote = quotes?.[c.id]?.[q.id];
                  showTooltip(e, (
                    <div style={{ maxWidth: 260, fontFamily: FONT.body, fontSize: "0.85rem", lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 700, color: C.goldBright, marginBottom: "0.2rem" }}>{c.label} &middot; {q.label}</div>
                      <div style={{ fontFamily: FONT.mono, fontSize: "1rem", color: C.textBright, marginBottom: "0.4rem" }}>
                        Avg Score: {score.toFixed(2)} <span style={{ fontSize: "0.7rem", color: C.muted }}>(n={n})</span>
                      </div>
                      {quote && (
                        <div style={{ fontStyle: "italic", color: C.muted, borderTop: `1px solid ${C.ghost}`, paddingTop: "0.5rem", marginTop: "0.3rem" }}>
                          "{quote}"
                        </div>
                      )}
                    </div>
                  ));
                }}
                onMouseMove={moveTooltip}
                onMouseLeave={(e) => {
                  e.target.setAttribute("r", "5");
                  hideTooltip();
                }}
              />
            );
          });
        })}

      </svg>
    </div>
  );
}
