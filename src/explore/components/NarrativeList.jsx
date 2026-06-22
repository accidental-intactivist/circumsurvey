import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import DistributionChart from "./DistributionChart";
import AddToReportButton from "./AddToReportButton";
import SharePopover from "./SharePopover";

export default function NarrativeList({ 
  question,
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
  
  // Detect which pathways have narratives present
  const availablePathways = useMemo(() => {
    if (!distribution) return [];
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
      if (!items) return [];
      let filteredDist = items;
      if (highlightWord) {
        const trimmedWord = highlightWord.trim();
        if (trimmedWord) {
          const searchWord = trimmedWord.toLowerCase();
          let regex;
          try {
            // Match the word with boundary checking and optional plural/possessive suffix ('s, s, ', s')
            regex = new RegExp(`(?<![a-zA-Z0-9])(${trimmedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:'s|s|'|s')?)(?![a-zA-Z0-9])`, 'i');
          } catch (e) {
            regex = null;
          }
          
          filteredDist = items.filter(item => {
            const text = item.text || item.label || "";
            if (regex) return regex.test(text);
            return text.toLowerCase().includes(searchWord);
          });
        }
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
    return getProcessedGrouped(distribution || []);
  }, [distribution, getProcessedGrouped]);

  // Stable shuffle for the main visual list
  const shuffledGrouped = useMemo(() => {
    const arr = [...grouped];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [grouped]);

  const visible = shuffledGrouped.slice(0, limit);
  
  const chartData = useMemo(() => {
    const hasGrouped = grouped.some(g => g.count > 1);
    if (!hasGrouped) return null;
    
    return {
      distribution: grouped.slice(0, 15).map(g => ({ label: g.text, n: g.count }))
    };
  }, [grouped]);

  // Pre-process and shuffle pathway-specific lists for side-by-side mode
  const pathwaysGrouped = useMemo(() => {
    const result = {};
    if (!distribution) return result;
    activePathwaysOrdered.forEach(pId => {
      const pItems = distribution.filter(item => item.pathway?.toLowerCase() === pId);
      const pGrouped = getProcessedGrouped(pItems);
      const arr = [...pGrouped];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      result[pId] = { grouped: pGrouped, shuffled: arr };
    });
    return result;
  }, [distribution, activePathwaysOrdered, getProcessedGrouped]);

  const anyRemaining = useMemo(() => {
    if (!distribution) return false;
    if (viewMode === "single") {
      return limit < grouped.length;
    } else {
      return activePathwaysOrdered.some(pId => {
        const pathData = pathwaysGrouped[pId];
        return pathData && limit < pathData.grouped.length;
      });
    }
  }, [viewMode, limit, grouped.length, activePathwaysOrdered, distribution, pathwaysGrouped]);

  if (!distribution || distribution.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic" }}>No narrative responses found for this cohort.</div>;
  }

  const MIN_NARRATIVE_COHORT = 20;
  if (distribution.length < MIN_NARRATIVE_COHORT) {
    return (
      <div style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.ghost}`, borderRadius: 8, textAlign: "center", marginTop: "1rem" }}>
        <div style={{ color: C.red, marginBottom: "0.5rem", fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <strong>Privacy Guardrail Active</strong>
        </div>
        <div style={{ color: C.muted, fontSize: "0.9rem", fontFamily: FONT.body }}>
          Verbatim narratives are suppressed for sub-cohorts with fewer than {MIN_NARRATIVE_COHORT} responses to prevent potential re-identification. (Available: n={distribution.length})
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Header controls */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1.2rem",
      }}>
        {question && <AddToReportButton questionId={question.id} iconOnly />}
        {question && <SharePopover url={window.location.origin + window.location.pathname + "#/question/" + question.id} questionId={question.id} questionPrompt={question.prompt} onExportImage={() => {}} />}
        
        {availablePathways.length >= 2 && (
          <>
            <div style={{ width: "1px", height: "16px", background: C.ghost, margin: "0 0.2rem" }} />
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
              <span>Compare Side by Side</span>
            </button>
          </div>
          </>
        )}
      </div>

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
            
            // Attribution is intentionally limited to generation (+ pathway, shown via
            // color) and deliberately omits geographic detail (state/province/country)
            // to prevent re-identification of respondents on a sensitive topic.
            let genStr = item.generation || "";
            if (genStr.includes("(born")) {
              genStr = genStr.split("(born")[0].trim();
            }
            if (genStr === "Boomer") genStr = "Baby Boomer";

            let respondentMeta = genStr;

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
                    <span style={{ 
                      color: C.goldBright, 
                      background: "rgba(212,160,48,0.12)", 
                      border: `1px solid rgba(212,160,48,0.3)`, 
                      padding: "0.15rem 0.4rem", 
                      borderRadius: 4 
                    }}>
                      {count === 1 ? (respondentMeta || `n=${count}`) : `n=${count}`}
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
            const pathData = pathwaysGrouped[pId] || { grouped: [], shuffled: [] };
            const pGrouped = pathData.grouped;
            const pVisible = pathData.shuffled.slice(0, limit);

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
                  
                  // Generation only — geographic attribution omitted to protect privacy.
                  let genStr = item.generation || "";
                  if (genStr.includes("(born")) {
                    genStr = genStr.split("(born")[0].trim();
                  }
                  if (genStr === "Boomer") genStr = "Baby Boomer";

                  let respondentMeta = genStr;

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
                          {count === 1 ? respondentMeta : ""}
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
  const trimmedHighlight = (highlight || "").trim();
  if (!trimmedHighlight) return <>{text}</>;
  
  let parts;
  try {
    // Capture the word plus its optional plural/possessive suffix
    const regex = new RegExp(`(?<![a-zA-Z0-9])(${trimmedHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:'s|s|'|s')?)(?![a-zA-Z0-9])`, 'gi');
    parts = text.split(regex);
  } catch (e) {
    return <>{text}</>;
  }

  const cleanHighlight = trimmedHighlight.toLowerCase();

  return (
    <>
      {parts.map((part, i) => {
        const cleanPart = part.toLowerCase();
        // Match base, plural, possessive singular/plural suffix variations
        const isMatch = cleanPart === cleanHighlight || 
                        cleanPart === cleanHighlight + "'s" || 
                        cleanPart === cleanHighlight + "s" || 
                        cleanPart === cleanHighlight + "'" || 
                        cleanPart === cleanHighlight + "s'";
        return isMatch ? (
          <mark key={i} style={{ 
            background: "rgba(212,160,48,0.3)", 
            color: "var(--c-goldBright)", 
            padding: "0 2px", 
            borderRadius: 2 
          }}>
            {part}
          </mark>
        ) : part;
      })}
    </>
  );
}
