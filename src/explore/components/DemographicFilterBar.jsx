// ═══════════════════════════════════════════════════════════════════════════
// DemographicFilterBar — persistent "WHO" cohort selector
// Affects mini-sparklines on list view AND distribution charts on detail pages.
// Progressive multi-select: start with one dimension, add more to stack.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { C, FONT } from "../styles/tokens";

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
      { value: "observer", label: "Observer" },
      { value: "trans", label: "Transgender (All)" },
      { value: "trans_vaginoplasty", label: "Post-Vaginoplasty" },
      { value: "trans_phalloplasty", label: "Post-Phalloplasty" },
      { value: "intersex", label: "Intersex" }
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
      "Very liberal / progressive",
      "Liberal / progressive",
      "Moderate / centrist",
      "Conservative / traditional",
      "Very conservative / traditional",
      "Libertarian",
      "Other / mixed / non-traditional",
      "Apolitical / prefer not to say",
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
      "Hindu",
      "Buddhist",
      "Secular / Atheist / Agnostic",
      "Spiritual but not religious",
      "Pagan / Indigenous / Earth-based",
      "Other",
    ],
  },
];

export default function DemographicFilterBar({ cohort, onChange, compact = false }) {
  const [openDim, setOpenDim] = useState(null);

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
    }
    
    if (current.length === 0) {
      delete next[dimId];
    } else {
      next[dimId] = current;
    }
    onChange(Object.keys(next).length > 0 ? next : null);
  };
  
  const clearFilter = (dimId) => {
    const next = { ...(cohort || {}) };
    delete next[dimId];
    onChange(Object.keys(next).length > 0 ? next : null);
  };

  const clearAll = () => {
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
        <span>★ Filter by Cohort</span>
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

      {/* Dimension buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {DEMOGRAPHIC_DIMENSIONS.map((dim) => {
          const activeValue = cohort?.[dim.column];
          const isOpen = openDim === dim.id;
          return (
            <div key={dim.id} style={{ position: "relative" }}>
              <button
                onClick={() => setOpenDim(isOpen ? null : dim.id)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.65rem",
                  background: activeValue ? "rgba(212,160,48,0.1)" : C.bgCard,
                  border: `1px solid ${activeValue ? "rgba(212,160,48,0.35)" : C.ghost}`,
                  borderRadius: 6,
                  color: activeValue ? C.goldBright : C.text,
                  fontFamily: FONT.body,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.4rem",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.muted,
                  flexShrink: 0,
                }}>
                  {dim.label}
                </span>
                <span style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                  fontSize: "0.75rem",
                }}>
                  {getButtonLabel(activeValue)}
                </span>
                <span style={{
                  color: isOpen ? C.goldBright : C.dim,
                  fontSize: "0.6rem",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}>▼</span>
              </button>

              {/* Dropdown */}
              {isOpen && (
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
                    maxHeight: 260,
                    overflowY: "auto",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  }}>
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
                </>
              )}
            </div>
          );
        })}
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
