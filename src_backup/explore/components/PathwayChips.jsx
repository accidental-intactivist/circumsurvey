// ═══════════════════════════════════════════════════════════════════════════
// PathwayChips — horizontal pill row for selecting the "I am viewing as..." pathway
// Used at the top of every page and in the left nav panel
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";

export default function PathwayChips({ selected, onSelect, compact = false }) {
  const size = compact ? {
    padding: "0.28rem 0.6rem",
    fontSize: "0.68rem",
    gap: "0.3rem",
  } : {
    padding: "0.42rem 0.85rem",
    fontSize: "0.76rem",
    gap: "0.4rem",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: size.gap, alignItems: "center" }}>
      {/* "All respondents" chip */}
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: size.padding,
          background: !selected ? "rgba(212,160,48,0.15)" : "transparent",
          border: `1px solid ${!selected ? "rgba(212,160,48,0.4)" : C.ghost}`,
          borderRadius: 999,
          color: !selected ? C.goldBright : C.muted,
          fontFamily: FONT.condensed,
          fontSize: size.fontSize,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        All · 501
      </button>

      {PATHWAY_IDS.map((id) => {
        const p = PATHWAYS[id];
        const isSelected = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              padding: size.padding,
              background: isSelected ? `${p.color}22` : "transparent",
              border: `1px solid ${isSelected ? p.color : C.ghost}`,
              borderRadius: 999,
              color: isSelected ? p.color : C.muted,
              fontFamily: FONT.condensed,
              fontSize: size.fontSize,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              opacity: p.waiting ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: "0.9em" }}>{p.emoji}</span>
            <span>{p.label}</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.82em",
              color: isSelected ? p.color : C.dim,
              fontWeight: 400,
              letterSpacing: "0",
              textTransform: "none",
              opacity: 0.75,
            }}>
              {p.waiting ? "✦" : p.n}
            </span>
          </button>
        );
      })}
    </div>
  );
}
