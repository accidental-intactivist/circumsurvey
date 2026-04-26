import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
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
      if (!normalized) return;
      
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

          return (
            <div key={i} style={{
              background: C.bgSoft,
              borderLeft: `3px solid ${C.gold}`,
              padding: "1.2rem 1.5rem",
              borderRadius: "0 8px 8px 0",
              fontFamily: FONT.body,
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: C.textBright,
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ flex: 1, wordBreak: "break-word" }}>"{text}"</div>
                {count > 1 && (
                  <div style={{
                    fontFamily: FONT.mono,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: C.goldBright,
                    background: "rgba(212,160,48,0.12)",
                    border: `1px solid rgba(212,160,48,0.3)`,
                    padding: "0.25rem 0.5rem",
                    borderRadius: 6,
                    whiteSpace: "nowrap"
                  }}>
                    n = {count}
                  </div>
                )}
              </div>
              
              {hasMeta && (
                <div style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.75rem",
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}>
                  {genStr} {locStr ? ` · ${locStr}` : ""}
                  {' · '}{item.pathway ? item.pathway.charAt(0).toUpperCase() + item.pathway.slice(1) + " Pathway" : "Unknown Pathway"}
                </div>
              )}
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
