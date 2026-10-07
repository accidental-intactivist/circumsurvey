// ═══════════════════════════════════════════════════════════════════════════
// DemographicFilterBar — persistent "WHO" cohort selector
// Affects mini-sparklines on list view AND distribution charts on detail pages.
// Progressive multi-select: start with one dimension, add more to stack.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { C, FONT } from "../styles/tokens";
import { useTelemetry } from "../lib/telemetry";

// Hardcoded option lists — these mirror the actual values in the D1 database.
// Kept static because (a) they're small and (b) the alternative (API call)
// adds a loading state that hurts first-paint perf.

export const DEMOGRAPHIC_DIMENSIONS = [
  {
    id: "pathway",
    label: "Pathway",
    column: "pathway",
    options: [
      { value: "intact", label: "Intact" },
      { value: "circumcised", label: "Circumcised" },
      { value: "restoring", label: "Restoring" },
      { value: "observer", label: "Observer" }
    ],
  },
  {
    id: "generation",
    label: "Generation",
    column: "generation",
    options: [
      "Silent Generation (born 1928-1945)",
      "Baby Boomer (born 1946-1964)",
      "Generation X (born 1965-1980)",
      "Xennial/Oregon Trail (born approx. 1977-1983)",
      "Millennial/Gen Y (born 1981-1996)",
      "Generation Z (born 1997-2012)",
      "Generation Alpha (born 2013-Present)",
    ],
  },
  {
    id: "country_born",
    label: "Country Born",
    column: "country_born",
    options: [
      "United States of America (USA)",
      "Canada",
      "United Kingdom",
      "Australia",
      "Germany",
      "South Africa",
      "France",
    ],
  },
  {
    id: "politics",
    label: "Politics",
    column: "politics",
    options: [
      "Very Liberal / Progressive / Left-Leaning",
      "Liberal / Progressive",
      "Moderate / Centrist",
      "Conservative",
      "Very Conservative / Right-Leaning",
      "Libertarian",
      "Apolitical / Not focused on politics",
      "Prefer not to say / Unsure",
    ],
  },
  {
    id: "primary_tradition",
    label: "Religion",
    column: "primary_tradition",
    options: [
      "Christian",
      "Jewish",
      "Islamic",
      "Hinduism",
      "Buddhism",
      "New Age / Spiritual but not religious",
      { value: "Atheist / Agnostic / Secular", label: "Atheist / Secular" },
    ],
  },
  {
    id: "sexuality",
    label: "Sexuality",
    column: "sexuality",
    options: [
      "Straight/Heterosexual",
      "Gay",
      "Bisexual",
      "Pansexual",
      "Lesbian",
      "Asexual",
      "Questioning",
    ],
  },
  {
    id: "education",
    label: "Education",
    column: "education",
    options: [
      "Less than high school diploma or equivalent",
      "High school diploma or GED (or equivalent)",
      "Trade School Certificate / Pre-Apprenticeship Program",
      "Journeyman Certification / Licensed Tradesperson",
      "Some college / Associate's degree",
      "Bachelor's degree (e.g., BA, BS)",
      "Master's degree (e.g., MA, MS, MBA, MEd)",
      "Professional degree (e.g., MD, JD, DDS, PharmD)",
      "Doctoral degree (e.g., PhD, EdD)",
    ],
  },
  {
    id: "socioeconomic",
    label: "Socioeconomic Status",
    column: "socioeconomic",
    options: [
      "Upper income / Wealthy (Family had significant financial resources, wealth, or passive income)",
      "Upper-middle income (Family was financially secure, could comfortably afford needs and wants, saved regularly, maybe owned property beyond primary home)",
      "Middle income (Family was generally comfortable, could afford needs and some wants, maybe saved a bit)",
      "Working class / Lower-middle income (Family generally met basic needs but had few financial extras or savings)",
      "Lower income (Family struggled to consistently meet basic needs like housing, food, healthcare)",
      "Prefer not to say / Unsure"
    ],
  },
  {
    id: "family_upbringing",
    label: "Family Upbringing",
    column: "family_upbringing",
    options: [
      "I was raised by one or both of my birth/biological parents.",
      "I was adopted as an infant (typically within the first year of life).",
      "I was adopted as a child or teenager (after the age of one).",
      "I was raised primarily in a different family structure (e.g., by other relatives like grandparents, in foster care, with legal guardians).",
      "Prefer not to say.",
    ],
  },
];

export default function DemographicFilterBar({ cohort, onChange, compact = false }) {
  const [openDim, setOpenDim] = useState(null);
  const { trackEvent } = useTelemetry();

  const toggleFilter = (dimId, value) => {
    const next = { ...(cohort || {}) };
    let current = next[dimId];
    
    // Support legacy string state -> array
    if (current && !Array.isArray(current)) current = [current];
    else if (!current) current = [];
    
    if (current.includes(value)) {
      current = current.filter(v => v !== value);
    } else {
      current = [...current, value];
      trackEvent('filter_added', { dimension_id: dimId, value });
    }
    
    if (current.length === 0) {
      delete next[dimId];
      trackEvent('filter_cleared', { dimension_id: dimId });
    } else {
      next[dimId] = current;
    }
    onChange(Object.keys(next).length > 0 ? next : null);
  };
  
  const clearFilter = (dimId) => {
    const next = { ...(cohort || {}) };
    delete next[dimId];
    trackEvent('filter_cleared', { dimension_id: dimId });
    onChange(Object.keys(next).length > 0 ? next : null);
  };

  const clearAll = () => {
    trackEvent('filter_cleared_all');
    onChange(null);
    setOpenDim(null);
  };

  const activeDims = cohort ? Object.keys(cohort) : [];

  return (
    <div style={{ position: "relative" }}>
      {/* Section label */}
      <div style={{
        fontFamily: FONT.condensed,
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span>★</span> Cohort Filter
          <span 
            title="Respondent Filter: Restricts charts and counts dynamically to show only responses from specific demographics (e.g., Millennials, USA). Updates sparklines and response percentages."
            style={{
              cursor: "help",
              color: C.muted,
              fontSize: "0.7rem",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.ghost}`,
              width: 15,
              height: 15,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.mono,
              fontWeight: "normal",
              textTransform: "none",
              letterSpacing: "normal",
            }}
          >
            ?
          </span>
        </span>
        {activeDims.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: "transparent",
              border: "none",
              color: C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0.15rem 0.4rem",
              borderRadius: 4,
            }}
          >
            clear ×
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeDims.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.8rem" }}>
          {activeDims.map(dimCol => {
            const dim = DEMOGRAPHIC_DIMENSIONS.find(d => d.column === dimCol);
            if (!dim) return null;
            const activeValue = cohort[dimCol];
            return (
              <div key={dimCol} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.5rem",
                background: "rgba(212,160,48,0.15)",
                border: `1px solid rgba(212,160,48,0.35)`,
                borderRadius: 4,
                fontFamily: FONT.body,
                fontSize: "0.7rem",
                color: C.goldBright,
              }}>
                <span style={{ fontWeight: 600, opacity: 0.8 }}>{dim.label}:</span>
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {getButtonLabel(activeValue)}
                </span>
                <button
                  onClick={() => clearFilter(dimCol)}
                  style={{
                    background: "none", border: "none", color: C.goldBright, cursor: "pointer",
                    padding: 0, marginLeft: "0.2rem", fontSize: "0.8rem", opacity: 0.7
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                >×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Add Filter Button */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpenDim(openDim ? null : "menu")}
          style={{
            width: "100%",
            padding: "0.45rem 0.65rem",
            background: openDim ? "rgba(255,255,255,0.05)" : C.bgCard,
            border: `1px dashed ${openDim ? C.goldBright : C.dim}`,
            borderRadius: 6,
            color: openDim ? C.goldBright : C.text,
            fontFamily: FONT.condensed,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            transition: "all 0.15s",
          }}
        >
          <span>+ Add Filter...</span>
        </button>

        {/* Dropdowns */}
        {openDim && (
          <>
            <div 
              style={{ position: "fixed", inset: 0, zIndex: 40 }} 
              onClick={() => setOpenDim(null)} 
            />
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: C.bgSoft,
              border: `1px solid ${C.ghost}`,
              borderRadius: 6,
              zIndex: 50,
              maxHeight: 320,
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}>
              
              {/* Main Menu (List of Dimensions) */}
              {openDim === "menu" && (
                <div>
                  <div style={{
                    padding: "0.5rem 0.7rem",
                    borderBottom: `1px solid ${C.ghost}`,
                    fontFamily: FONT.condensed,
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: C.muted,
                    textTransform: "uppercase",
                  }}>
                    Select Demographic Dimension
                  </div>
                  {DEMOGRAPHIC_DIMENSIONS.map((dim) => (
                    <div
                      key={dim.id}
                      onClick={() => setOpenDim(dim.id)}
                      style={{
                        padding: "0.45rem 0.7rem",
                        color: C.textBright,
                        fontFamily: FONT.body,
                        fontSize: "0.76rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <span>{dim.label}</span>
                      <span style={{ color: C.dim, fontSize: "0.6rem" }}>▶</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dimension Options Menu */}
              {openDim !== "menu" && (() => {
                const dim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === openDim);
                if (!dim) return null;
                const activeValue = cohort?.[dim.column];
                return (
                  <div>
                    <div style={{
                      padding: "0.4rem 0.7rem",
                      borderBottom: `1px solid ${C.ghost}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenDim("menu"); }}
                        style={{
                          background: "none", border: "none", color: C.goldBright,
                          cursor: "pointer", fontSize: "0.7rem", padding: "0.2rem",
                        }}
                      >
                        ◀ Back
                      </button>
                      <span style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        color: C.textBright,
                        textTransform: "uppercase",
                      }}>
                        {dim.label}
                      </span>
                    </div>

                    <button
                      onClick={() => clearFilter(dim.column)}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.7rem",
                        background: "transparent",
                        border: "none",
                        borderBottom: `1px solid ${C.ghost}`,
                        color: C.muted,
                        fontFamily: FONT.condensed,
                        fontSize: "0.7rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        textAlign: "left",
                        fontStyle: "italic",
                      }}
                    >
                      — clear selection —
                    </button>
                    {dim.options.map((opt) => {
                      const optValue = typeof opt === "string" ? opt : opt.value;
                      const optLabel = typeof opt === "string" ? opt : opt.label;
                      const isSelected = Array.isArray(activeValue) ? activeValue.includes(optValue) : activeValue === optValue;
                      
                      return (
                        <div
                          key={optValue}
                          onClick={() => toggleFilter(dim.column, optValue)}
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.7rem",
                            background: isSelected ? `rgba(212,160,48,0.12)` : "transparent",
                            color: isSelected ? C.goldBright : C.text,
                            fontFamily: FONT.body,
                            fontSize: "0.76rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = isSelected ? `rgba(212,160,48,0.18)` : "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? `rgba(212,160,48,0.12)` : "transparent"; }}
                        >
                          <div style={{
                            width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                            border: `1px solid ${isSelected ? C.goldBright : C.dim}`,
                            background: isSelected ? C.goldBright : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {isSelected && <span style={{ color: C.bgCard, fontSize: "0.55rem", fontWeight: "bold" }}>✓</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {optLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* Helper text */}
      {activeDims.length > 0 && (
        <div style={{
          marginTop: "0.55rem",
          padding: "0.5rem 0.65rem",
          background: "rgba(212,160,48,0.05)",
          border: `1px solid rgba(212,160,48,0.18)`,
          borderRadius: 5,
          fontFamily: FONT.body,
          fontSize: "0.72rem",
          color: C.muted,
          lineHeight: 1.5,
        }}>
          <span style={{ color: C.goldBright, fontWeight: 600 }}>Cohort filter active.</span>{" "}
          Charts on question pages will show this cohort's responses alongside the full sample.
        </div>
      )}
    </div>
  );
}

function getButtonLabel(activeValue) {
  if (!activeValue || (Array.isArray(activeValue) && activeValue.length === 0)) {
    return <span style={{ color: C.dim }}>any</span>;
  }
  
  const values = Array.isArray(activeValue) ? activeValue : activeValue.split(",");
  return values.map(v => shortLabel(v.trim())).join(", ");
}

// Shorten long labels for display in the button
function shortLabel(value) {
  if (!value) return "";
  // Handle pathways gracefully
  if (value === "trans") return "Transgender (All)";
  if (value === "trans_vaginoplasty") return "Post-Vaginoplasty";
  if (value === "trans_phalloplasty") return "Post-Phalloplasty";
  if (value === "intact" || value === "circumcised" || value === "restoring" || value === "observer" || value === "intersex") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  // Trim parenthetical era ranges from generation labels
  let v = value.replace(/\s*\([^)]*\)\s*$/, "");
  if (value.includes("United States")) v = "USA";
  if (v.length > 28) v = v.slice(0, 25) + "…";
  return v;
}
