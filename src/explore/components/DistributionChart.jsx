import { useState, useMemo, useRef } from "react";
import { C, FONT } from "../styles/tokens";
import { colorForLabel } from "./MiniSparkline";
import { useTooltip, Tooltip } from "./Tooltip";
import AddToReportButton from "./AddToReportButton";
import SharePopover from "./SharePopover";
import { sortDistribution, applyLikert, shortLabel, getHarveyBallScore } from "../lib/formatters";
import HarveyBall from "./HarveyBall";

import { useTheme } from "../contexts/ThemeContext";

export default function DistributionChart({ title, distribution, cohortDistribution, question, cohort, hideHeader, shortenLabels, hideLegend, forceChartType, customColorMap, bare }) {
  const { colorblind, theme } = useTheme();
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [hiddenItems, setHiddenItems] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState("auto");
  const chartRef = useRef(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        style: {
          background: bare ? "transparent" : C.bgSoft,
        }
      });
      const link = document.createElement('a');
      link.download = `chart-${question?.id || 'export'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  const { parsedDist, parsedCohortDist } = useMemo(() => {
    let d = [...(distribution?.distribution || [])];
    let cd = [...(cohortDistribution?.distribution || [])];
    
    // Normalize Likert scales and fill in missing options
    d = applyLikert(d, question);
    cd = applyLikert(cd, question);

    // Apply custom sort for generation, politics, etc.
    d = sortDistribution(d, question);
    
    // Sort cohort distribution to match the overall distribution order
    const labelOrder = d.map(item => item.label);
    cd.sort((a, b) => {
      let idxA = labelOrder.indexOf(a.label);
      let idxB = labelOrder.indexOf(b.label);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });

    return { parsedDist: d, parsedCohortDist: cd };
  }, [distribution, cohortDistribution, question]);

  const toggleItem = (label) => {
    setHiddenItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Build a canonical color map from the overall distribution
  const colorMap = useMemo(() => {
    if (customColorMap) return customColorMap;
    const map = {};
    parsedDist.forEach((item, loopIndex) => {
      let colorIndex = loopIndex;
      if (question?.opts && Array.isArray(question.opts)) {
        const l = String(item.label || "").toLowerCase().trim();
        const match = question.opts.findIndex(opt => {
          const optLower = opt.toLowerCase().trim();
          return optLower === l || l === optLower.split(":")[0].trim();
        });
        if (match !== -1) colorIndex = match;
      }
      map[item.label] = colorForLabel(item.label, colorIndex);
    });
    return map;
  }, [parsedDist, question, customColorMap]);

  if (!distribution) {
    return <div style={{ padding: "2rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>Loading…</div>;
  }
  
  if (parsedDist.length === 0) {
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

  // Filter distributions based on hiddenItems
  const activeDist = parsedDist.filter(d => !hiddenItems.has(d.label));
  const activeCohortDist = parsedCohortDist.filter(d => !hiddenItems.has(d.label));

  const total = activeDist.reduce((s, d) => s + d.n, 0);
  const cohortTotal = activeCohortDist.reduce((s, d) => s + d.n, 0);

  // Build a map for cohort comparison
  const cohortMap = {};
  for (const d of parsedCohortDist) cohortMap[d.label] = d.n;

  const activeChartType = forceChartType || (chartType === "auto" ? (parsedDist.length < 8 ? "pie" : "bar") : chartType);

  return (
    <div ref={chartRef} style={{
      background: bare ? "transparent" : C.bgSoft,
      border: bare ? "none" : `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: bare ? 0 : "1.2rem",
      marginBottom: bare ? 0 : "1.2rem",
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
            maxWidth: "70%",
          }}>{cohortDistribution ? "Overall vs. Filtered distribution" : title}</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <div style={{
              fontFamily: FONT.mono,
              fontSize: "0.75rem",
              color: C.muted,
              marginRight: "0.5rem"
            }}>{hiddenItems.size > 0 ? "n (visible) = " : "n = "}{total}</div>

            {/* Chart Type Toggle */}
            <div style={{
              display: "flex",
              background: "rgba(0,0,0,0.2)",
              borderRadius: 20,
              padding: 2,
              border: `1px solid ${C.ghost}`,
            }}>
              <button
                onClick={() => setChartType("bar")}
                style={{
                  background: activeChartType === "bar" ? C.ghost : "transparent",
                  color: activeChartType === "bar" ? C.textBright : C.muted,
                  border: "none",
                  borderRadius: 18,
                  padding: "0.2rem 0.6rem",
                  fontFamily: FONT.condensed,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >Bar</button>
              <button
                onClick={() => setChartType("pie")}
                style={{
                  background: activeChartType === "pie" ? C.ghost : "transparent",
                  color: activeChartType === "pie" ? C.textBright : C.muted,
                  border: "none",
                  borderRadius: 18,
                  padding: "0.2rem 0.6rem",
                  fontFamily: FONT.condensed,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >Pie</button>
            </div>
            
            {question && <AddToReportButton questionId={question.id} cohort={cohort} iconOnly />}
            {question && <SharePopover url={window.location.origin + window.location.pathname + "#/question/" + question.id} questionId={question.id} questionPrompt={question.prompt} onExportImage={handleDownload} />}
            <button 
              onClick={handleDownload}
              title="Download as PNG"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.2rem",
                borderRadius: 4,
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.goldBright }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.muted }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Charts Area */}
      {activeChartType === "bar" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Overall Stacked Bar */}
          <div>
            {cohortDistribution && <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.muted, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Sample (n={total})</div>}
            <StackedBar dist={activeDist} total={total} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} colorMap={colorMap} />
          </div>

          {/* Cohort Stacked Bar */}
          {cohortDistribution && cohortTotal > 0 && (
            <div>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.goldBright, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filtered Cohort (n={cohortTotal})</div>
              <StackedBar dist={activeCohortDist} total={cohortTotal} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} colorMap={colorMap} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", margin: "1rem 0" }}>
          {/* Overall Pie Chart */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: "1 1 150px", maxWidth: 220 }}>
            {cohortDistribution && <div style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Sample (n={total})</div>}
            <PieChart dist={activeDist} total={total} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} colorMap={colorMap} />
          </div>
          
          {/* Cohort Pie Chart */}
          {cohortDistribution && cohortTotal > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: "1 1 150px", maxWidth: 220 }}>
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.08em" }}>Filtered Cohort (n={cohortTotal})</div>
              <PieChart dist={activeCohortDist} total={cohortTotal} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} colorMap={colorMap} />
            </div>
          )}
        </div>
      )}

      {!hideLegend && (() => {
          // Only use Harvey Balls when ALL items in the distribution have a score.
          // A mix of Harvey Balls and squares looks inconsistent.
          const useHarveyBalls = parsedDist.length > 0 && parsedDist.every(d => getHarveyBallScore(d.label) !== null);
          return (
        <>
          {/* Legend / per-option rows */}
          <div style={{ marginTop: "1.1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {(isExpanded ? parsedDist : parsedDist.slice(0, 10)).map((d, i) => {
              const isHidden = hiddenItems.has(d.label);
              // Percentages for the legend text
              const pct = total > 0 && !isHidden ? (d.n / total) * 100 : 0;
              const cohortN = cohortMap[d.label] || 0;
              const cohortPct = cohortTotal > 0 && !isHidden ? (cohortN / cohortTotal) * 100 : 0;
              const hasCohort = !!cohortDistribution;
              
              return (
                <div 
                  key={i} 
                  onClick={() => toggleItem(d.label)}
                  style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    gap: "0.6rem",
                    padding: "0.4rem 0.5rem",
                    margin: "0 -0.5rem",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    opacity: isHidden ? 0.4 : 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    if (shortenLabels) {
                      showTooltip(e, d.label);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (shortenLabels) {
                      moveTooltip(e);
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    if (shortenLabels) {
                      hideTooltip();
                    }
                  }}
                >
                  {useHarveyBalls ? (
                    <HarveyBall 
                      score={getHarveyBallScore(d.label)} 
                      color={isHidden ? C.ghost : (colorMap[d.label] || colorForLabel(d.label, i))} 
                      size={14} 
                      style={{ marginTop: "0.1rem" }}
                    />
                  ) : (
                    <div style={{
                      width: 10, height: 10, borderRadius: 2,
                      background: isHidden ? C.ghost : (colorMap[d.label] || colorForLabel(d.label, i)),
                      flexShrink: 0,
                      marginTop: "0.2rem",
                    }} />
                  )}
                  <div style={{
                    flex: 1, fontFamily: FONT.body, fontSize: "0.82rem",
                    color: isHidden ? C.muted : C.text, minWidth: 0,
                    textDecoration: isHidden ? "line-through" : "none",
                    lineHeight: 1.35,
                    whiteSpace: "normal"
                  }}>
                    {shortLabel(d.label)}
                  </div>
                  <div style={{
                    fontFamily: FONT.mono, fontSize: "0.74rem",
                    color: C.muted, minWidth: 70, textAlign: "right",
                    marginTop: "0.1rem",
                  }}>
                    {isHidden ? "Hidden" : `${d.n} · ${pct.toFixed(1)}%`}
                  </div>
                  {hasCohort && (
                    <div style={{
                      fontFamily: FONT.mono, fontSize: "0.72rem",
                      color: isHidden ? C.muted : (cohortPct > pct + 3 ? "#68b878" : cohortPct < pct - 3 ? C.red : C.muted),
                      minWidth: 90, textAlign: "right",
                      fontWeight: 600,
                      marginTop: "0.1rem",
                    }}>
                      {isHidden ? "—" : (cohortTotal > 0 ? `cohort ${cohortPct.toFixed(1)}%` : "cohort —")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {parsedDist.length > 10 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: "transparent",
                border: `1px solid ${C.ghost}`,
                color: C.muted,
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.5rem",
                borderRadius: 6,
                marginTop: "0.8rem",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.goldBright;
                e.currentTarget.style.borderColor = C.gold;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = C.muted;
                e.currentTarget.style.borderColor = C.ghost;
              }}
            >
              {isExpanded ? "Show Fewer" : `Show All Options (${parsedDist.length - 10} more)`}
            </button>
          )}
        </>
          );
      })()}

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

function StackedBar({ dist, total, showTooltip, moveTooltip, hideTooltip, colorMap }) {
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
            fill={colorMap[d.label] || colorForLabel(d.label, i)}
            onMouseEnter={(e) => showTooltip(e, `${shortLabel(d.label)}: ${d.n} (${pct.toFixed(1)}%)`)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          />
        );
      })}
    </svg>
  );
}

function getCoordinatesForPercent(percent) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

function PieChart({ dist, total, showTooltip, moveTooltip, hideTooltip, colorMap }) {
  if (total === 0) return null;
  let cumulativePercent = 0;
  
  return (
    <svg viewBox="-1.05 -1.05 2.1 2.1" style={{ transform: "rotate(-90deg)", width: "100%", height: "auto", maxWidth: "200px" }}>
      {dist.map((d, i) => {
        const percent = d.n / total;
        if (percent === 0) return null;
        
        // Render a full circle if it's 100%
        if (percent === 1) {
           return (
             <circle 
               key={i}
               cx={0} cy={0} r={1} 
               fill={colorMap[d.label] || colorForLabel(d.label, i)} 
               onMouseEnter={(e) => showTooltip(e, `${shortLabel(d.label)}: ${d.n} (${(percent*100).toFixed(1)}%)`)}
               onMouseMove={moveTooltip}
               onMouseLeave={hideTooltip}
               style={{ transition: "all 0.2s", cursor: "pointer" }}
             />
           );
        }

        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        
        const pathData = [
          `M 0 0`,
          `L ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`
        ].join(' ');

        return (
          <path 
            key={i} 
            d={pathData} 
            fill={colorMap[d.label] || colorForLabel(d.label, i)} 
            stroke={C.bgSoft}
            strokeWidth="0.02"
            onMouseEnter={(e) => showTooltip(e, `${shortLabel(d.label)}: ${d.n} (${(percent*100).toFixed(1)}%)`)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
            style={{ transition: "all 0.2s", cursor: "pointer" }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = 0.8 }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = 1 }}
          />
        );
      })}
    </svg>
  );
}
