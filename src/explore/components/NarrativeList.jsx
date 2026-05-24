import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import DistributionChart from "./DistributionChart";

export default function NarrativeList({ 
  distribution, 
  highlightWord = null, 
  hideChart = false,
  viewMode: propViewMode,
  onViewModeChange
}) {
  const [limit, setLimit] = useState(20);
  const [localViewMode, setLocalViewMode] = useState("single");
  const viewMode = propViewMode !== undefined ? propViewMode : localViewMode;
  
  const setViewMode = (mode) => {
    if (propViewMode === undefined) {
      setLocalViewMode(mode);
    }
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };
  
  if (!distribution || distribution.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic" }}>No narrative responses found for this cohort.</div>;
  }

  // Detect which pathways have narratives present
  const availablePathways = useMemo(() => {
    const paths = new Set();
    distribution.forEach(item => {
      if (item.pathway) {
        paths.add(item.pathway.toLowerCase());
      }
    });
    return Array.from(paths);
  }, [distribution]);

  const activePathwaysOrdered = useMemo(() => {
    const ids = ["intact", "circumcised", "restoring", "observer", "trans_vaginoplasty", "trans_phalloplasty", "intersex"];
    return ids.filter(id => availablePathways.includes(id));
  }, [availablePathways]);

  // Helper to run independent cleaning, grouping, and filtering
  const getProcessedGrouped = useMemo(() => {
    return (items) => {
      let filteredDist = items;
      if (highlightWord) {
        const searchWord = highlightWord.toLowerCase();
        let regex;
        try {
          regex = new RegExp(`(?<![\\w'])${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w'])`, 'i');
        } catch (e) {
          regex = null;
        }
        
        filteredDist = items.filter(item => {
          const text = item.text || item.label || "";
          if (regex) return regex.test(text);
          return text.toLowerCase().includes(searchWord);
        });
      }

      const map = new Map();
      const fillers = [
        "n/a", "na", "no", "none", "nothing", "nil", "not applicable", 
        "no comment", "unsure", "unknown", "n.a", "n.a.", "none at all", 
        "no.", "no response", "don't know", "dont know", "no one", "not sure",
        "n a", "n / a", "none.", "no comments", "no comment.", "no one."
      ];

      filteredDist.forEach(item => {
        const text = item.text || item.label || "";
        const normalized = text.trim().toLowerCase();
        const clean = normalized.replace(/^[.\s\-_,]+|[.\s\-_,]+$/g, "").trim();
        if (!clean || fillers.includes(clean)) return;
        
        if (!map.has(normalized)) {
          map.set(normalized, {
            text: text.trim(), // keep original case of the first entry
            count: 1,
            items: [item]
          });
        } else {
          const group = map.get(normalized);
          group.count++;
          group.items.push(item);
        }
      });
      
      return Array.from(map.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.text.localeCompare(b.text);
      });
    };
  }, [highlightWord]);

  // Process the overall list
  const grouped = useMemo(() => {
    return getProcessedGrouped(distribution);
  }, [distribution, getProcessedGrouped]);

  const visible = grouped.slice(0, limit);
  
  const chartData = useMemo(() => {
    const hasGrouped = grouped.some(g => g.count > 1);
    if (!hasGrouped) return null;
    
    return {
      distribution: grouped.slice(0, 15).map(g => ({ label: g.text, n: g.count }))
    };
  }, [grouped]);

  const anyRemaining = useMemo(() => {
    if (viewMode === "single") {
      return limit < grouped.length;
    } else {
      return activePathwaysOrdered.some(pId => {
        const pItems = distribution.filter(item => item.pathway?.toLowerCase() === pId);
        const pGrouped = getProcessedGrouped(pItems);
        return limit < pGrouped.length;
      });
    }
  }, [viewMode, limit, grouped.length, activePathwaysOrdered, distribution, getProcessedGrouped]);
  
  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Layout Selector */}
      {availablePathways.length >= 2 && (
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.2rem",
        }}>
          <span style={{ fontFamily: FONT.condensed, fontSize: "0.74rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>View Mode:</span>
          <div style={{
            display: "flex",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 20,
            padding: 2,
            border: `1px solid ${C.ghost}`,
          }}>
            <button
              onClick={() => setViewMode("single")}
              style={{
                background: viewMode === "single" ? C.ghost : "transparent",
                color: viewMode === "single" ? C.textBright : C.muted,
                border: "none",
                borderRadius: 18,
                padding: "0.3rem 0.8rem",
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span>☰</span>
              <span>Single List</span>
            </button>
            <button
              onClick={() => setViewMode("side-by-side")}
              style={{
                background: viewMode === "side-by-side" ? C.ghost : "transparent",
                color: viewMode === "side-by-side" ? C.textBright : C.muted,
                border: "none",
                borderRadius: 18,
                padding: "0.3rem 0.8rem",
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span>📊</span>
              <span>Compare Cohorts</span>
            </button>
          </div>
        </div>
      )}

      {chartData && !hideChart && viewMode === "single" && (
        <div style={{ marginBottom: "2rem" }}>
          <DistributionChart 
            title="Most Common Responses" 
            distribution={chartData} 
          />
        </div>
      )}

      {/* Render layouts */}
      {viewMode === "single" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {visible.map((group, i) => {
            const text = group.text;
            const count = group.count;
            const item = group.items[0];
            
            // Only show metadata if this is a unique response
            const hasMeta = count === 1 && (item.pathway || item.generation);
            
            let genStr = item.generation || "Unknown Gen";
            if (genStr.includes("(born")) {
              genStr = genStr.split("(born")[0].trim();
            }
            if (genStr === "Boomer") genStr = "Baby Boomer";
            
            let locStr = "";
            let region = item.us_state_now || item.canada_province_now;
            if (region && typeof region === 'string' && region.includes(" - ")) {
              region = region.split(" - ").pop().trim();
            }
            let country = item.country_now;
            if (country === "United States of America (USA)") country = "USA";
            else if (country === "United Kingdom of Great Britain and Northern Ireland (UK)") country = "UK";

            if (region && country) locStr = `${region}, ${country}`;
            else if (country) locStr = country;
            
            const pathwayColor = item.pathway && PATHWAYS[item.pathway.toLowerCase()] 
              ? PATHWAYS[item.pathway.toLowerCase()].color 
              : C.gold;

            return (
              <div key={i} style={{
                background: "var(--c-bgSoft)",
                border: `1px solid var(--c-ghost)`,
                borderRadius: 8,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
              }}>
                {/* Colored top border strip */}
                <div style={{ height: 4, background: pathwayColor }} />
                
                <div style={{
                  background: "var(--c-ghost)",
                  color: "var(--c-textBright)",
                  padding: "0.4rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: pathwayColor, fontSize: "0.9rem" }}>★</span>
                    {item.pathway ? item.pathway.charAt(0).toUpperCase() + item.pathway.slice(1) + " Pathway" : "Response"}
                  </div>
                  <div style={{ color: "var(--c-muted)", fontFamily: FONT.mono, letterSpacing: "0.05em", fontSize: "0.65rem", display: "flex", gap: "0.5rem" }}>
                    {hasMeta && <span>{genStr} {locStr ? ` · ${locStr}` : ""}</span>}
                    <span style={{ 
                      color: C.goldBright, 
                      background: "rgba(212,160,48,0.12)", 
                      border: `1px solid rgba(212,160,48,0.3)`, 
                      padding: "0.15rem 0.4rem", 
                      borderRadius: 4 
                    }}>
                      n={count}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "1.25rem 1.5rem", color: "var(--c-textBright)", fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6 }}>
                  "{highlightWord ? <HighlightText text={text} highlight={highlightWord} /> : text}"
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Side-by-side layout: CSS grid of columns */
        <div style={{
          display: "grid",
          gridTemplateColumns: activePathwaysOrdered.length > 1 ? `repeat(auto-fit, minmax(240px, 1fr))` : "1fr",
          gap: "1.2rem",
          alignItems: "start",
          width: "100%",
        }}>
          {activePathwaysOrdered.map(pId => {
            const pathInfo = PATHWAYS[pId] || { label: pId, emoji: "💬", color: C.gold };
            const pItems = distribution.filter(item => item.pathway?.toLowerCase() === pId);
            const pGrouped = getProcessedGrouped(pItems);
            const pVisible = pGrouped.slice(0, limit);

            return (
              <div key={pId} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Column header */}
                <div style={{
                  background: "var(--c-bgSoft)",
                  border: `1px solid var(--c-ghost)`,
                  borderBottom: `3px solid ${pathInfo.color}`,
                  borderRadius: "8px 8px 0 0",
                  padding: "0.8rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: FONT.display, fontWeight: 700, fontSize: "0.95rem", color: "var(--c-textBright)" }}>
                    <span>{pathInfo.emoji}</span>
                    <span>{pathInfo.label}</span>
                  </div>
                  <span style={{
                    fontFamily: FONT.mono,
                    fontSize: "0.72rem",
                    color: C.muted,
                    background: "rgba(255,255,255,0.05)",
                    padding: "0.15rem 0.4rem",
                    borderRadius: 4
                  }}>
                    n={pGrouped.length}
                  </span>
                </div>

                {/* Column items */}
                {pVisible.map((group, idx) => {
                  const text = group.text;
                  const count = group.count;
                  const item = group.items[0];
                  
                  let genStr = item.generation || "";
                  if (genStr.includes("(born")) {
                    genStr = genStr.split("(born")[0].trim();
                  }
                  if (genStr === "Boomer") genStr = "Baby Boomer";
                  
                  let locStr = "";
                  let region = item.us_state_now || item.canada_province_now;
                  if (region && typeof region === 'string' && region.includes(" - ")) {
                    region = region.split(" - ").pop().trim();
                  }
                  let country = item.country_now;
                  if (country === "United States of America (USA)") country = "USA";
                  else if (country === "United Kingdom of Great Britain and Northern Ireland (UK)") country = "UK";

                  if (region && country) locStr = `${region}, ${country}`;
                  else if (country) locStr = country;

                  return (
                    <div key={idx} style={{
                      background: "var(--c-bgSoft)",
                      border: `1px solid var(--c-ghost)`,
                      borderRadius: 8,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                    }}>
                      <div style={{
                        background: "var(--c-ghost)",
                        color: "var(--c-textBright)",
                        padding: "0.3rem 0.6rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.62rem",
                        fontFamily: FONT.condensed,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}>
                        <div style={{ color: "var(--c-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                          {count === 1 && (genStr || locStr) ? `${genStr}${locStr ? ` · ${locStr}` : ""}` : ""}
                        </div>
                        {count > 1 && (
                          <span style={{ 
                            color: C.goldBright, 
                            background: "rgba(212,160,48,0.1)", 
                            padding: "0.05rem 0.25rem", 
                            borderRadius: 3 
                          }}>
                            n={count}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: "0.8rem 1rem", color: "var(--c-textBright)", fontFamily: FONT.body, fontSize: "0.92rem", lineHeight: 1.5 }}>
                        "{highlightWord ? <HighlightText text={text} highlight={highlightWord} /> : text}"
                      </div>
                    </div>
                  );
                })}

                {pGrouped.length === 0 && (
                  <div style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    color: C.muted,
                    fontStyle: "italic",
                    background: "rgba(255,255,255,0.01)",
                    border: `1px dashed ${C.ghost}`,
                    borderRadius: 8,
                    fontSize: "0.85rem"
                  }}>
                    No responses matching filters.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {anyRemaining && (
        <button 
          onClick={() => setLimit(l => l + 20)}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            background: "transparent",
            border: `1px solid ${C.ghost}`,
            color: C.goldBright,
            borderRadius: 6,
            fontFamily: FONT.condensed,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.2s"
          }}
          onMouseOver={e => e.target.style.background = C.ghost}
          onMouseOut={e => e.target.style.background = "transparent"}
        >
          Load More ({
            viewMode === "single" 
              ? grouped.length - limit 
              : "Next batch"
          })
        </button>
      )}
    </div>
  );
}

function HighlightText({ text, highlight }) {
  if (!highlight) return <>{text}</>;
  
  // Use word boundary matching with apostrophe awareness
  let parts;
  try {
    const regex = new RegExp(`(?<![\\w'])(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w'])`, 'gi');
    parts = text.split(regex);
  } catch (e) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} style={{ 
            background: "rgba(212,160,48,0.3)", 
            color: "var(--c-goldBright)", 
            padding: "0 2px", 
            borderRadius: 2 
          }}>
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}
