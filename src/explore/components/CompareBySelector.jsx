// ═══════════════════════════════════════════════════════════════════════════
// CompareBySelector — pivot control for cross-dimensional analysis
//
// Lets the user switch the "By pathway" breakdown to
// "By generation", "By religion", "By country", etc.
//
// The Worker API already supports all these dimensions via
// `getAggregate(qid, { by: "generation" })` — zero backend changes needed.
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";

const COMPARE_DIMENSIONS = [
  { id: "pathway",            label: "Pathway",    icon: "⑂", group: "core" },
  { id: "generation",         label: "Generation", icon: "◷", group: "demographics" },
  { id: "primary_tradition",  label: "Religion",   icon: "✦", group: "demographics" },
  { id: "country_born",       label: "Country (Born)", icon: "⊕", group: "demographics" },
  { id: "country_now",        label: "Country (Now)",  icon: "⊕", group: "demographics" },
  { id: "sexuality",          label: "Sexuality",  icon: "◈", group: "demographics" },
  { id: "education",          label: "Education",  icon: "▣", group: "demographics" },
  { id: "politics",           label: "Politics",   icon: "◇", group: "demographics" },
];

export default function CompareBySelector({ selected, onChange }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.35rem",
      flexWrap: "wrap",
    }}>
      <span style={{
        fontFamily: FONT.condensed,
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.muted,
        marginRight: "0.2rem",
      }}>
        Compare by
      </span>
      {COMPARE_DIMENSIONS.map((dim) => {
        const isActive = selected === dim.id;
        return (
          <button
            key={dim.id}
            onClick={() => onChange(dim.id)}
            title={`Break down responses by ${dim.label}`}
            style={{
              padding: "0.22rem 0.5rem",
              background: isActive ? "rgba(212,160,48,0.15)" : "transparent",
              border: `1px solid ${isActive ? "rgba(212,160,48,0.4)" : C.ghost}`,
              borderRadius: 999,
              color: isActive ? C.goldBright : C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{dim.icon}</span>
            {dim.label}
          </button>
        );
      })}
    </div>
  );
}

export { COMPARE_DIMENSIONS };
