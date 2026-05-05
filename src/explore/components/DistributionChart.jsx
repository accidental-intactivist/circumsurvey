import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import { colorForLabel } from "./MiniSparkline";
import { useTooltip, Tooltip } from "./Tooltip";

export default function DistributionChart({ title, distribution, cohortDistribution, question, hideHeader }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [hiddenItems, setHiddenItems] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const { parsedDist, parsedCohortDist } = useMemo(() => {
    let d = [...(distribution?.distribution || [])];
    let cd = [...(cohortDistribution?.distribution || [])];
    
    if (question?.id === "demo_generation") {
      const genOrder = [
        "Generation Alpha (born 2013-Present)",
        "Generation Z (born 1997-2012)",
        "Millennial/Gen Y (born 1981-1996)",
        "Xennial/Oregon Trail (born approx. 1977-1983)",
        "Generation X (born 1965-1980)",
        "Baby Boomer (born 1946-1964)",
        "Silent Generation (born 1928-1945)",
        "Not sure / Prefer not to say"
      ];
      d.sort((a, b) => {
        let idxA = genOrder.indexOf(a.label);
        let idxB = genOrder.indexOf(b.label);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        if (idxA === 999 && idxB === 999) return b.n - a.n;
        return idxA - idxB;
      });
      cd.sort((a, b) => {
        let idxA = genOrder.indexOf(a.label);
        let idxB = genOrder.indexOf(b.label);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        if (idxA === 999 && idxB === 999) return b.n - a.n;
        return idxA - idxB;
      });
    }

    // Heuristic: Auto-parse multi-select strings (lots of combinations joined by comma-space-Capital)
    if (d.length > 15) {
      const counts = {};
      const cohortCounts = {};
      
      d.forEach(x => {
        if (x.label) {
          x.label.split(/, (?=[A-Z])/).forEach(p => {
            const k = p.trim();
            counts[k] = (counts[k] || 0) + x.n;
          });
        }
      });
      
      cd.forEach(x => {
        if (x.label) {
          x.label.split(/, (?=[A-Z])/).forEach(p => {
            const k = p.trim();
            cohortCounts[k] = (cohortCounts[k] || 0) + x.n;
          });
        }
      });
      
      const parsedKeys = Object.keys(counts);
      
      // If parsing reduced categories by at least 40%, it's definitely a multi-select
      if (parsedKeys.length > 0 && parsedKeys.length < d.length * 0.6) {
        let entries = parsedKeys.map(label => ({ label, n: counts[label] }));
        entries.sort((a, b) => b.n - a.n);
        
        let cEntries = Object.keys(cohortCounts).map(label => ({ label, n: cohortCounts[label] }));
        
        // Bucket long tail into "Other / Custom Responses"
        if (entries.length > 12) {
          const top = entries.slice(0, 12);
          const topSet = new Set(top.map(e => e.label));
          
          const otherN = entries.slice(12).reduce((s, e) => s + e.n, 0);
          if (otherN > 0) top.push({ label: "Other / Custom Responses", n: otherN });
          
          const cTop = [];
          let cOtherN = 0;
          cEntries.forEach(ce => {
            if (topSet.has(ce.label)) {
              cTop.push(ce);
            } else {
              cOtherN += ce.n;
            }
          });
          if (cOtherN > 0) cTop.push({ label: "Other / Custom Responses", n: cOtherN });
          
          return { parsedDist: top, parsedCohortDist: cTop };
        }
        
        return { parsedDist: entries, parsedCohortDist: cEntries };
      }
    }
    
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

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginBottom: "1.2rem",
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
          }}>{cohortDistribution ? "Overall vs. Filtered distribution" : title}</h2>
          <div style={{
            fontFamily: FONT.mono,
            fontSize: "0.75rem",
            color: C.muted,
          }}>{hiddenItems.size > 0 ? "n (visible) = " : "n = "}{total}</div>
        </div>
      )}

      {/* Stacked horizontal bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* Overall Stacked Bar */}
        <div>
          {cohortDistribution && <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.muted, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Sample (n={total})</div>}
          <StackedBar dist={activeDist} total={total} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
        </div>

        {/* Cohort Stacked Bar */}
        {cohortDistribution && cohortTotal > 0 && (
          <div>
            <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.goldBright, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filtered Cohort (n={cohortTotal})</div>
            <StackedBar dist={activeCohortDist} total={cohortTotal} showTooltip={showTooltip} moveTooltip={moveTooltip} hideTooltip={hideTooltip} />
          </div>
        )}
      </div>

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
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: isHidden ? C.ghost : colorForLabel(d.label, i),
                flexShrink: 0,
                marginTop: "0.2rem",
              }} />
              <div style={{
                flex: 1, fontFamily: FONT.body, fontSize: "0.82rem",
                color: isHidden ? C.muted : C.text, minWidth: 0,
                textDecoration: isHidden ? "line-through" : "none",
                lineHeight: 1.35
              }}>{d.label}</div>
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
          {isExpanded ? "Show Less" : `Show All Options (${parsedDist.length - 10} more)`}
        </button>
      )}

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

function StackedBar({ dist, total, showTooltip, moveTooltip, hideTooltip }) {
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
            fill={colorForLabel(d.label, i)}
            onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          />
        );
      })}
    </svg>
  );
}
