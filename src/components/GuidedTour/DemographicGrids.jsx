import React from "react";
import { C, FONT } from "../../explore/styles/tokens";
import { DEMOGRAPHIC_DIMENSIONS } from "../../demographics";

export function DemographicGrids() {
  const dimensionsToRender = [
    { id: "generation", type: "bar", titleColor: C.blue },
    { id: "primary_tradition", type: "pie", titleColor: C.green },
    { id: "family_politics", type: "bar", titleColor: C.gold },
    { id: "family_ses", type: "pie", titleColor: C.orange },
    { id: "sexuality", type: "bar", titleColor: C.ltBlue },
    { id: "race", type: "pie", titleColor: C.red }
  ];
  
  const PALETTE = [C.red, C.orange, C.gold, C.green, C.ltBlue, C.blue];

  const TOOLTIPS = {
    generation: "The age cohort of the respondent.",
    primary_tradition: "The religious tradition the respondent was raised in. Notably, nearly half of all participants identified as having no religious tradition.",
    family_politics: "The political leaning of the family the respondent was raised in.",
    family_ses: "Socioeconomic Status (SES) indicates the financial and social class the respondent grew up in.",
    sexuality: "The sexual orientation of the respondent.",
    race: "The racial and ethnic background of the respondent."
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", margin: "1.4rem 0" }}>
      {dimensionsToRender.map(({ id, type, titleColor }) => {
        const dim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === id);
        if (!dim) return null;
        
        const validCats = dim.categories
          .filter(c => c.total > 0 && !c.category.toLowerCase().includes("prefer not to say") && !c.category.toLowerCase().includes("unknown"))
          .sort((a, b) => b.total - a.total);
          
        const totalN = dim.categories.reduce((sum, c) => sum + c.total, 0);

        // SVG math for pie charts
        const radius = 34;
        const circumference = 2 * Math.PI * radius;
        let currentOffset = 0;

        return (
          <div key={dim.id} style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${C.ghost}`,
            borderRadius: 12,
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.15)`,
          }}>
            <h4 style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "0.75rem",
              color: titleColor,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: `1px solid ${C.ghost}`,
              paddingBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap"
            }}>
              <span 
                title={TOOLTIPS[dim.id]}
                style={{ cursor: TOOLTIPS[dim.id] ? "help" : "default" }}
              >
                {dim.short || dim.label}
              </span>
              <span style={{
                fontFamily: FONT.mono,
                fontSize: "0.55rem",
                color: C.muted,
                background: "rgba(255,255,255,0.05)",
                padding: "0.1rem 0.35rem",
                borderRadius: 999,
                border: `1px solid ${C.ghost}`,
                marginLeft: "auto"
              }}>n={totalN}</span>
            </h4>
            
            {type === "pie" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", flexShrink: 0, overflow: "visible" }}>
                  {/* Background track for remainder */}
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="32" />
                  
                  {validCats.slice(0, 5).map((c, i) => {
                    const pct = c.total / totalN;
                    const dash = pct * circumference;
                    const gap = circumference - dash;
                    const offset = currentOffset;
                    currentOffset -= dash;
                    const segmentColor = PALETTE[i % PALETTE.length];
                    
                    return (
                      <circle
                        key={c.category}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={segmentColor}
                        strokeWidth="32"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dasharray 0.5s ease-out" }}
                      >
                        <title>{`${c.category}: ${(pct * 100).toFixed(1)}% (${c.total} respondents)`}</title>
                      </circle>
                    );
                  })}
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1, minWidth: 0 }}>
                  {validCats.slice(0, 5).map((c, i) => {
                    const pct = (c.total / totalN) * 100;
                    const segmentColor = PALETTE[i % PALETTE.length];
                    return (
                      <div key={c.category} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} title={`${c.category}: ${pct.toFixed(1)}% (${c.total} respondents)`}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: segmentColor, flexShrink: 0 }} />
                        <span style={{ fontFamily: FONT.body, fontSize: "0.68rem", color: C.text, flex: 1, cursor: "default", lineHeight: 1.2 }}>{c.category.split(" /")[0]}</span>
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.muted, cursor: "default", flexShrink: 0 }}>{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {validCats.slice(0, 5).map((c, i) => {
                  const pct = (c.total / totalN) * 100;
                  const segmentColor = PALETTE[i % PALETTE.length];
                  return (
                    <div key={c.category} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }} title={`${c.category}: ${pct.toFixed(1)}% (${c.total} respondents)`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: FONT.body, fontSize: "0.72rem", color: C.text, lineHeight: 1.2, gap: "0.5rem" }}>
                        <span style={{ cursor: "default" }}>{c.category.split(" /")[0]}</span>
                        <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.muted, fontWeight: 600, cursor: "default", flexShrink: 0 }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: segmentColor, borderRadius: 2, opacity: 0.85 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {validCats.length > 5 && (
              <div style={{ fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.dim, textAlign: "right", marginTop: "0.2rem", letterSpacing: "0.02em" }}>
                + {validCats.length - 5} other groups
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
