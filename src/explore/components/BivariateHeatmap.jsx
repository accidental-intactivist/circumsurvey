import { useMemo } from "react";
import { C, FONT } from "../styles/tokens";

// Color scale for the heatmap (min to max density)
function getHeatmapColor(value, max) {
  if (value === 0 || max === 0) return "transparent";
  
  // Calculate intensity 0.0 to 1.0
  const intensity = Math.min(1, Math.max(0.1, value / max));
  
  // Use the brand Gold/Teal/Red scale. Let's use a nice Teal for data density.
  // rgb(91, 147, 199) is C.blue
  return `rgba(91, 147, 199, ${intensity * 0.8})`;
}

export default function BivariateHeatmap({ metadata }) {
  if (!metadata || metadata.intent !== "quantitative" || !metadata.rawData || !metadata.q1) {
    return null;
  }

  const { q1, q2, rawData } = metadata;

  // Process data into a matrix
  const { rowLabels, colLabels, matrix, maxN } = useMemo(() => {
    const rows = new Set();
    const cols = new Set();

    // Collect all unique row/col labels
    rawData.forEach(d => {
      // If Univariate (no q2), we just use "Count" as the only row.
      const rLabel = q2 ? (d.bucket || "N/A") : "Total Count";
      const cLabel = d.value_text || "N/A";
      rows.add(rLabel);
      cols.add(cLabel);
    });

    const rArr = Array.from(rows).sort();
    const cArr = Array.from(cols).sort();

    // Initialize matrix
    const mat = {};
    rArr.forEach(r => {
      mat[r] = {};
      cArr.forEach(c => {
        mat[r][c] = 0;
      });
    });

    let m = 0;
    rawData.forEach(d => {
      const rLabel = q2 ? (d.bucket || "N/A") : "Total Count";
      const cLabel = d.value_text || "N/A";
      const n = d.n || 0;
      mat[rLabel][cLabel] = n;
      if (n > m) m = n;
    });

    return { rowLabels: rArr, colLabels: cArr, matrix: mat, maxN: m };
  }, [rawData, q2]);

  return (
    <div style={{
      marginTop: "2rem",
      paddingTop: "2rem",
      borderTop: `1px dashed ${C.ghost}`,
      overflowX: "auto"
    }}>
      <h5 style={{
        fontFamily: FONT.condensed,
        fontSize: "0.85rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.goldBright,
        marginBottom: "1rem"
      }}>
        {q2 ? "Bivariate Cross-Tabulation" : "Univariate Distribution"}
      </h5>
      
      <div style={{
        fontFamily: FONT.mono,
        fontSize: "0.75rem",
        color: C.dim,
        marginBottom: "1.5rem"
      }}>
        <div>X-Axis: {q1}</div>
        {q2 && <div>Y-Axis: {q2}</div>}
      </div>

      <table style={{
        borderCollapse: "collapse",
        width: "100%",
        fontFamily: FONT.body,
        fontSize: "0.85rem",
        color: C.textBright,
      }}>
        <thead>
          <tr>
            <th style={{ padding: "0.5rem", borderBottom: `2px solid ${C.ghost}`, textAlign: "left" }}>
              {q2 ? "▼ Y \\ X ▶" : ""}
            </th>
            {colLabels.map(c => (
              <th key={c} style={{
                padding: "0.5rem",
                borderBottom: `2px solid ${C.ghost}`,
                textAlign: "center",
                fontWeight: 600,
                color: C.text
              }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map(r => (
            <tr key={r}>
              <td style={{
                padding: "0.75rem 0.5rem",
                borderBottom: `1px solid ${C.ghost}`,
                fontWeight: 600,
                color: C.text,
                maxWidth: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }} title={r}>
                {r}
              </td>
              {colLabels.map(c => {
                const val = matrix[r][c];
                return (
                  <td key={c} style={{
                    padding: "0.75rem 0.5rem",
                    borderBottom: `1px solid ${C.ghost}`,
                    textAlign: "center",
                    background: getHeatmapColor(val, maxN),
                    color: val > (maxN * 0.6) ? "#fff" : C.textBright,
                    transition: "background 0.2s"
                  }}>
                    {val > 0 ? val : <span style={{ color: C.dim }}>-</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
