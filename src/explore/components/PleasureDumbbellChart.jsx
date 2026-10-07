import React from 'react';
import { C, FONT } from '../styles/tokens';

export default function PleasureDumbbellChart({ stats, activeCohortsList, showGap, quotes, showTooltip, moveTooltip, hideTooltip }) {
  const chartWidth = 900;
  const rowHeight = 60;
  const chartHeight = Math.max(300, stats.sortedQuestions.length * rowHeight + 80);
  
  const yMarginTop = 40;
  const xMarginLeft = 200; // Room for labels
  const xMarginRight = 40;

  const innerWidth = chartWidth - xMarginLeft - xMarginRight;

  // X-axis: Map 1.0 to 5.0
  const getX = (score) => xMarginLeft + (((Math.max(1, Math.min(5, score)) - 1) / 4) * innerWidth);

  const ticks = [1, 2, 3, 4, 5];

  if (activeCohortsList.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="gapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.purple} />
          <stop offset="100%" stopColor={C.green} />
        </linearGradient>
        <pattern id="deficitPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={C.red} strokeWidth="3" opacity="0.6" />
        </pattern>
      </defs>

      {/* Grid */}
      <g className="dumbbell-grid">
        {ticks.map(t => {
          const x = getX(t);
          return (
            <g key={`tick-${t}`}>
              <line x1={x} y1={yMarginTop - 20} x2={x} y2={chartHeight - 20} stroke={C.ghost} strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
              <text x={x} y={yMarginTop - 25} textAnchor="middle" style={{ fontFamily: FONT.mono, fontSize: "12px", fill: C.muted }}>
                {t.toFixed(1)}
              </text>
            </g>
          );
        })}
      </g>

      {/* Rows */}
      {stats.sortedQuestions.map((q, i) => {
        const y = yMarginTop + (i * rowHeight) + (rowHeight / 2);
        
        // Find min and max for the gap
        let scores = [];
        activeCohortsList.forEach(c => {
          const s = stats.matrix[c.id]?.[q.id]?.average;
          if (s) scores.push({ c, score: s });
        });
        
        if (scores.length === 0) return null;
        
        scores.sort((a, b) => a.score - b.score);
        const minScore = scores[0].score;
        const maxScore = scores[scores.length - 1].score;

        return (
          <g key={q.id}>
            {/* Row Label */}
            <text x={xMarginLeft - 20} y={y} alignmentBaseline="middle" textAnchor="end" style={{ fontFamily: FONT.condensed, fontWeight: 700, fontSize: "14px", fill: C.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {q.label}
            </text>

            {/* Base Track */}
            <line x1={getX(1)} y1={y} x2={getX(5)} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />

            {/* The Gap Line */}
            {minScore !== maxScore && (
              <line 
                x1={getX(minScore)} 
                y1={y} 
                x2={getX(maxScore)} 
                y2={y} 
                stroke={showGap ? "url(#deficitPattern)" : "url(#gapGradient)"} 
                strokeWidth={showGap ? "20" : "6"} 
                strokeLinecap="round"
                opacity={showGap ? 1 : 0.8}
                style={{ transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
              />
            )}

            {/* Gap Label */}
            {minScore !== maxScore && (
              <text 
                x={getX(minScore) + (getX(maxScore) - getX(minScore)) / 2} 
                y={y - (showGap ? 18 : 12)} 
                textAnchor="middle" 
                style={{ 
                  fontFamily: FONT.mono, 
                  fontSize: showGap ? "13px" : "11px", 
                  fill: showGap ? C.red : C.goldBright, 
                  fontWeight: 700,
                  transition: "all 0.4s ease"
                }}
              >
                {showGap ? "GAP " : ""}-{(maxScore - minScore).toFixed(2)}
              </text>
            )}

            {/* Dots */}
            {scores.map(({ c, score }) => {
              const x = getX(score);
              const n = stats.matrix[c.id]?.[q.id]?.n || 0;
              return (
                <g 
                  key={c.id} 
                  style={{ transition: "all 0.5s ease", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector('.dot-halo').setAttribute("opacity", "0.4");
                    e.currentTarget.querySelector('.dot-core').setAttribute("r", "10");
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
                    e.currentTarget.querySelector('.dot-halo').setAttribute("opacity", "0.2");
                    e.currentTarget.querySelector('.dot-core').setAttribute("r", "8");
                    hideTooltip();
                  }}
                >
                  {/* Halo */}
                  <circle className="dot-halo" cx={x} cy={y} r={14} fill={`var(${c.colorVar})`} opacity={0.2} style={{ transition: "all 0.2s" }} />
                  {/* Dot */}
                  <circle className="dot-core" cx={x} cy={y} r={8} fill={C.bgCard} stroke={`var(${c.colorVar})`} strokeWidth="4" style={{ transition: "all 0.2s" }} />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
