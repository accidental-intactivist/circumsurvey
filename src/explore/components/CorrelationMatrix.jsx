import { useEffect, useState, useMemo } from "react";
import { getAggregate } from "../lib/api";
import { C, FONT } from "../styles/tokens";
import { useTooltip, Tooltip } from "./Tooltip";

/**
 * Renders a cross-tabulation matrix (bubble chart) between two questions.
 * Helps visualize categorical correlation.
 */
export default function CorrelationMatrix({ rowQuestion, colQuestion, cohort = null, crossTabData = null }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!crossTabData);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    if (crossTabData) {
      // Data provided externally
      return;
    }
    
    let cancelled = false;
    setLoading(true);
    // Group rowQuestion's responses BY colQuestion's responses
    getAggregate(rowQuestion.id, { by: colQuestion.id, cohort })
      .then(res => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("CorrelationMatrix error:", err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [rowQuestion?.id, colQuestion?.id, cohort, crossTabData]);

  const { rowLabels, colLabels, matrix, maxN } = useMemo(() => {
    if (crossTabData) {
      // Process pre-calculated crossTabData (from DemographicsDashboard)
      // crossTabData.cohorts = [{ option: "Gen Z", distribution: [...] }]
      if (!crossTabData.cohorts) return { rowLabels: [], colLabels: [], matrix: [], maxN: 0 };
      
      const cols = crossTabData.cohorts.map(c => c.option);
      const rowSet = new Set();
      crossTabData.cohorts.forEach(c => {
        c.distribution.forEach(d => {
          if (d.label && d.label !== "null" && d.label !== "") rowSet.add(d.label);
        });
      });
      
      const rows = Array.from(rowSet).sort();
      let max = 0;
      const mat = rows.map(r => {
        return crossTabData.cohorts.map(c => {
          const found = c.distribution.find(d => d.label === r);
          const n = found ? found.n : 0;
          if (n > max) max = n;
          return n;
        });
      });
      return { rowLabels: rows, colLabels: cols, matrix: mat, maxN: max };
    }

    if (!data || !data.results) return { rowLabels: [], colLabels: [], matrix: [], maxN: 0 };
    
    // The keys of data.results are the answers to colQuestion
    const cols = Object.keys(data.results).filter(k => k !== "null" && k !== "");
    const rowSet = new Set();
    
    cols.forEach(c => {
      if (data.results[c].distribution) {
        data.results[c].distribution.forEach(d => {
          if (d.label && d.label !== "null" && d.label !== "") rowSet.add(d.label);
        });
      }
    });
    
    const rows = Array.from(rowSet).sort(); // Ideally sort by actual survey order if available
    
    let max = 0;
    const mat = rows.map(r => {
      return cols.map(c => {
        const dist = data.results[c].distribution || [];
        const found = dist.find(d => d.label === r);
        const n = found ? found.n : 0;
        if (n > max) max = n;
        return n;
      });
    });
    
    return { rowLabels: rows, colLabels: cols, matrix: mat, maxN: max };
  }, [data]);

  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  if (loading) {
    return <div style={{ padding: "2rem", color: C.dim, textAlign: "center" }}>Calculating correlation matrix...</div>;
  }
  
  if (!matrix || matrix.length === 0 || maxN === 0) {
    return <div style={{ padding: "2rem", color: C.dim }}>No intersection data available for these factors.</div>;
  }

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      padding: "1.5rem",
      overflowX: "auto"
    }}>
      <h3 style={{
        fontFamily: FONT.display,
        color: C.textBright,
        margin: "0 0 0.5rem 0",
        fontSize: "1.2rem"
      }}>
        Correlation Matrix
      </h3>
      <p style={{ fontFamily: FONT.body, color: C.text, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Comparing <strong>{rowQuestion.prompt}</strong> (Rows) against <strong>{colQuestion.prompt}</strong> (Columns).
      </p>

      <div style={{ minWidth: "fit-content", paddingBottom: "1rem" }}>
        
        {/* Column Headers */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: `minmax(200px, 1fr) repeat(${colLabels.length}, 40px)`, 
          gap: "2px", 
          marginBottom: "4px" 
        }}>
          <div></div> {/* Empty top-left cell */}
          {colLabels.map((cLabel, cIdx) => (
            <div 
              key={`col-${cIdx}`}
              style={{
                display: "flex",
                alignItems: "flex-end", // Push text to bottom near the grid
                justifyContent: "center",
                height: "140px",
              }}
            >
              <div style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontFamily: FONT.condensed,
                fontSize: "0.75rem",
                color: hoveredCol === cIdx ? C.goldBright : C.muted,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxHeight: "140px",
                transition: "color 0.2s"
              }}>
                {cLabel}
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {matrix.map((row, rIdx) => {
          const rLabel = rowLabels[rIdx];
          const isRowHovered = hoveredRow === rIdx;
          
          return (
            <div key={`row-${rIdx}`} style={{
              display: "grid", 
              gridTemplateColumns: `minmax(200px, 1fr) repeat(${colLabels.length}, 40px)`, 
              gap: "2px",
              marginBottom: "2px",
              background: isRowHovered ? "rgba(255,255,255,0.03)" : "transparent",
              borderRadius: 4,
              transition: "background 0.15s"
            }}>
              {/* Row Header */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "0.8rem",
                  fontFamily: FONT.body,
                  fontSize: "0.75rem",
                  color: isRowHovered ? C.textBright : C.text,
                  textAlign: "right",
                  lineHeight: 1.3,
                  transition: "color 0.15s"
                }}
              >
                {rLabel}
              </div>

              {/* Data Cells */}
              {row.map((val, cIdx) => {
                const isColHovered = hoveredCol === cIdx;
                const isHovered = isRowHovered && isColHovered;
                const cLabel = colLabels[cIdx];
                
                return (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    onMouseEnter={(e) => {
                      setHoveredRow(rIdx);
                      setHoveredCol(cIdx);
                      if (val > 0) {
                        showTooltip(e, (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div>Row: {rLabel}</div>
                            <div>Col: {cLabel}</div>
                            <div style={{ color: "var(--c-gold)", fontWeight: "bold", marginTop: "4px" }}>Count: {val}</div>
                          </div>
                        ));
                      }
                    }}
                    onMouseMove={moveTooltip}
                    onMouseLeave={() => {
                      setHoveredRow(null);
                      setHoveredCol(null);
                      hideTooltip();
                    }}
                    style={{
                      height: "40px",
                      background: val === 0 
                        ? "transparent" 
                        : `color-mix(in srgb, var(--c-gold) ${Math.max(12, (val / maxN) * 100)}%, transparent)`,
                      border: val === 0 
                        ? `1px dashed ${C.ghost}`
                        : isHovered ? `1px solid var(--c-goldBright)` : `1px solid transparent`,
                      borderRadius: 4,
                      cursor: val > 0 ? "pointer" : "default",
                      transition: "all 0.15s",
                      position: "relative",
                      zIndex: isHovered ? 2 : 1,
                      boxShadow: isHovered && val > 0 ? "0 4px 12px rgba(0,0,0,0.3)" : "none"
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
