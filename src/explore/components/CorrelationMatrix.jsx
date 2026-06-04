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

  if (loading) {
    return <div style={{ padding: "2rem", color: C.dim, textAlign: "center" }}>Calculating correlation matrix...</div>;
  }
  
  if (!matrix || matrix.length === 0 || maxN === 0) {
    return <div style={{ padding: "2rem", color: C.dim }}>No intersection data available for these factors.</div>;
  }

  // SVG Geometry
  const CELL_SIZE = 40;
  const MARGIN_LEFT = 180;
  const MARGIN_BOTTOM = 180;
  
  const width = MARGIN_LEFT + (colLabels.length * CELL_SIZE);
  const height = (rowLabels.length * CELL_SIZE) + MARGIN_BOTTOM;

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

      <div style={{ minWidth: width }}>
        <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
          {/* Row Labels */}
          {rowLabels.map((rLabel, rIdx) => (
            <text
              key={`row-${rIdx}`}
              x={MARGIN_LEFT - 10}
              y={(rIdx * CELL_SIZE) + (CELL_SIZE / 2)}
              textAnchor="end"
              alignmentBaseline="middle"
              fill={C.text}
              style={{ fontFamily: FONT.condensed, fontSize: "0.75rem" }}
            >
              {rLabel.length > 30 ? rLabel.substring(0, 27) + "..." : rLabel}
            </text>
          ))}

          {/* Column Labels (Rotated) */}
          {colLabels.map((cLabel, cIdx) => (
            <g key={`col-${cIdx}`} transform={`translate(${MARGIN_LEFT + (cIdx * CELL_SIZE) + (CELL_SIZE / 2)}, ${(rowLabels.length * CELL_SIZE) + 10})`}>
              <text
                x={0}
                y={0}
                transform="rotate(-45)"
                textAnchor="end"
                fill={C.text}
                style={{ fontFamily: FONT.condensed, fontSize: "0.75rem" }}
              >
                {cLabel.length > 30 ? cLabel.substring(0, 27) + "..." : cLabel}
              </text>
            </g>
          ))}

          {/* Matrix Cells */}
          {matrix.map((row, rIdx) => {
            return row.map((val, cIdx) => {
              if (val === 0) return null;
              
              // Map count to radius (square root scale so area is proportional to count)
              const maxRadius = (CELL_SIZE / 2) - 2;
              const radius = Math.sqrt(val / maxN) * maxRadius;
              
              // We could change the ellipse rotation here if we had expected values to calculate Pearson r.
              // For now, we use a perfectly scaled circle/ellipse to denote density.
              
              const cx = MARGIN_LEFT + (cIdx * CELL_SIZE) + (CELL_SIZE / 2);
              const cy = (rIdx * CELL_SIZE) + (CELL_SIZE / 2);

              return (
                <circle
                  key={`cell-${rIdx}-${cIdx}`}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={C.ltBlue}
                  opacity={0.8}
                  style={{ transition: "all 0.2s ease", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    e.target.setAttribute("fill", C.goldBright);
                    e.target.setAttribute("opacity", "1");
                    showTooltip(e, `Count: ${val}`);
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={(e) => {
                    e.target.setAttribute("fill", C.ltBlue);
                    e.target.setAttribute("opacity", "0.8");
                    hideTooltip();
                  }}
                />
              );
            });
          })}
        </svg>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
