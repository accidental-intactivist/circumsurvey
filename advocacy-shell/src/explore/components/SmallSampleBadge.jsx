// ═══════════════════════════════════════════════════════════════════════════
// SmallSampleBadge — ethics guardrail for small sample sizes
//
// n < 5  → suppress chart, show "Sample too small" message
// n < 20 → show warning badge above chart
// n ≥ 20 → render nothing (children pass through)
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";

const SUPPRESS_THRESHOLD = 5;
const WARN_THRESHOLD = 20;

export function shouldSuppress(n) {
  return typeof n === "number" && n > 0 && n < SUPPRESS_THRESHOLD;
}

export function shouldWarn(n) {
  return typeof n === "number" && n >= SUPPRESS_THRESHOLD && n < WARN_THRESHOLD;
}

export default function SmallSampleBadge({ n, label, children, inline }) {
  if (shouldSuppress(n)) {
    return (
      <div style={{
        padding: "1.5rem",
        background: "rgba(217, 79, 79, 0.06)",
        border: `1px solid rgba(217, 79, 79, 0.25)`,
        borderRadius: 8,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: C.red,
          marginBottom: "0.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.35rem",
        }}>
          <span>⊘</span> Sample Too Small
        </div>
        <div style={{
          fontFamily: FONT.body,
          fontSize: "0.8rem",
          color: C.muted,
          lineHeight: 1.5,
        }}>
          {label ? `The "${label}" cohort has` : "This filter yields"} only <strong style={{ color: C.textBright }}>{n}</strong> respondent{n !== 1 ? "s" : ""}.
          Results are suppressed to protect individual privacy and prevent misleading interpretation.
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <div style={{ position: "relative" }}>
        {children}
        {shouldWarn(n) && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem",
            padding: "0.25rem 0.5rem",
            marginTop: "0.4rem",
            background: "rgba(245, 180, 60, 0.06)",
            border: "1px solid rgba(245, 180, 60, 0.15)",
            borderRadius: 4,
            fontSize: "0.65rem",
            color: C.muted,
            lineHeight: 1.3,
          }}>
            <span>⚠</span>
            <span style={{ fontFamily: FONT.mono, color: C.goldBright }}>n={n}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {shouldWarn(n) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.4rem 0.7rem",
          marginBottom: "0.6rem",
          background: "rgba(245, 180, 60, 0.08)",
          border: "1px solid rgba(245, 180, 60, 0.25)",
          borderRadius: 6,
        }}>
          <span style={{ fontSize: "0.85rem" }}>⚠</span>
          <span style={{
            fontFamily: FONT.body,
            fontSize: "0.75rem",
            color: C.muted,
            lineHeight: 1.4,
          }}>
            <strong style={{ color: C.goldBright }}>Small sample</strong> — {label ? `"${label}"` : "this cohort"} has only <strong style={{ fontFamily: FONT.mono, color: C.goldBright }}>n={n}</strong> respondent{n !== 1 ? "s" : ""}. Interpret with caution.
          </span>
        </div>
      )}
      {children}
    </>
  );
}
