import { useState } from "react";
import { C, FONT } from "../styles/tokens";

export default function NarrativeList({ distribution }) {
  const [limit, setLimit] = useState(20);
  
  if (!distribution || distribution.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic" }}>No narrative responses found for this cohort.</div>;
  }
  
  // The API returns narratives as `{ text, pathway, generation }` (or legacy `{ label, n }`)
  const visible = distribution.slice(0, limit);
  
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {visible.map((item, i) => {
          const text = item.text || item.label;
          const hasMeta = item.pathway || item.generation;
          
          let genStr = item.generation || "Unknown Gen";
          // Simplify "Millennial/Gen Y (born 1981-1996)" to "Millennial/Gen Y"
          if (genStr.includes("(born")) {
            genStr = genStr.split("(born")[0].trim();
          }
          if (genStr === "Boomer") {
            genStr = "Baby Boomer";
          }
          
          let locStr = "";
          const region = item.us_state_now || item.canada_province_now;
          if (region && item.country_now) {
            locStr = `${region}, ${item.country_now}`;
          } else if (item.country_now) {
            locStr = item.country_now;
          }

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
              <div>"{text}"</div>
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
      
      {limit < distribution.length && (
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
          Load More ({distribution.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
