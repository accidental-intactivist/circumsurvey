// ═══════════════════════════════════════════════════════════════════════════
// RelevanceToggle — the three-state view selector
// "My Pathway Only" / "Relevant to Me" / "All 355 Questions"
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";

const MODES = [
  { id: "mine", label: "My Pathway Only", tooltip: "Only questions in the selected pathway" },
  { id: "relevant", label: "Relevant", tooltip: "Universal + selected pathway + synthesis" },
  { id: "all", label: "All 355", tooltip: "Every question, including other pathways" },
];

export default function RelevanceToggle({ mode, onChange, disabled = false }) {
  return (
    <div style={{
      display: "inline-flex",
      background: C.bgCard,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: 2,
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? "none" : "auto",
    }}>
      {MODES.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            title={m.tooltip}
            style={{
              padding: "0.32rem 0.75rem",
              background: isActive ? C.bgSoft : "transparent",
              border: "none",
              borderRadius: 6,
              color: isActive ? C.goldBright : C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: isActive ? `inset 0 -2px 0 ${C.gold}` : "none",
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
