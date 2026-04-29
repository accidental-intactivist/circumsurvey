import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import DistributionChart from "./DistributionChart";

export default function NarrativeList({ distribution }) {
  const [limit, setLimit] = useState(20);
  
  if (!distribution || distribution.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic" }}>No narrative responses found for this cohort.</div>;
  }
  
  // Group identical responses (case-insensitive)
  const grouped = useMemo(() => {
    const map = new Map();
    distribution.forEach(item => {
      const text = item.text || item.label || "";
      const normalized = text.trim().toLowerCase();
      if (!normalized || normalized === "-" || normalized === "—") return;
      
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
    
    // Sort by count descending, then alphabetically
    return Array.from(map.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.text.localeCompare(b.text);
    });
  }, [distribution]);

  const visible = grouped.slice(0, limit);
  
  const chartData = useMemo(() => {
    const hasGrouped = grouped.some(g => g.count > 1);
    if (!hasGrouped) return null;
    
    return {
      distribution: grouped.slice(0, 15).map(g => ({ label: g.text, n: g.count }))
    };
  }, [grouped]);
  
  return (
    <div style={{ marginTop: "1rem" }}>
      {chartData && (
        <div style={{ marginBottom: "2rem" }}>
          <DistributionChart 
            title="Most Common Responses" 
            distribution={chartData} 
          />
        </div>
      )}

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
              border: `2px solid var(--c-ghost)`,
              borderRadius: 8,
              position: "relative",
              overflow: "hidden",
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
                  {count > 1 && (
                    <span style={{ 
                      color: C.goldBright, 
                      background: "rgba(212,160,48,0.12)", 
                      border: `1px solid rgba(212,160,48,0.3)`, 
                      padding: "0.15rem 0.4rem", 
                      borderRadius: 4 
                    }}>
                      n={count}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: "1.25rem 1.5rem", color: "var(--c-textBright)", fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.6 }}>
                "{text}"
              </div>
            </div>
          );
        })}
      </div>
      
      {limit < grouped.length && (
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
          Load More ({grouped.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
