import { useEffect, useState } from "react";
import { getAggregate } from "../lib/api";
import { C, FONT } from "../styles/tokens";
import { colorForLabel } from "./MiniSparkline";
import { useTooltip, Tooltip } from "./Tooltip";

export default function GenerationalTrendChart({ questionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAggregate(questionId, { by: "generation" })
      .then(res => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [questionId]);

  if (loading) {
    return <div style={{ padding: "1rem", color: C.dim, fontStyle: "italic" }}>Loading generation trends...</div>;
  }
  
  if (!data || !data.results || Object.keys(data.results).length === 0) {
    return null;
  }

  // Order generations chronologically from oldest to newest
  const genOrder = ["Silent", "Boomer", "Gen X", "Millennial", "Gen Z", "Gen Alpha"];
  
  const generations = genOrder.filter(g => data.results[g] && data.results[g].n > 0).map(g => ({
    id: g,
    label: g,
    ...data.results[g]
  }));

  if (generations.length === 0) return null;

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginTop: "1.2rem",
    }}>
      <h2 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "1.15rem",
        color: C.textBright,
        marginBottom: "0.9rem",
        letterSpacing: "-0.01em",
      }}>By generation</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {generations.map((g) => {
          const total = g.distribution.reduce((s, d) => s + d.n, 0);
          let xCursor = 0;
          return (
            <div key={g.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: C.text,
                }}>{g.label}</span>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.66rem",
                  color: C.muted,
                }}>n = {total}</span>
              </div>
              <svg width="100%" height={12} style={{ display: "block", borderRadius: 2, overflow: "hidden" }}>
                <rect x={0} y={0} width="100%" height={12} fill={C.ghost} />
                {g.distribution.map((d, i) => {
                  const pct = (d.n / total) * 100;
                  const x = xCursor;
                  xCursor += pct;
                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorForLabel(d.label)}
                      onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}
