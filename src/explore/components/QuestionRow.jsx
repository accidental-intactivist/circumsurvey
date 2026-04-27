// ═══════════════════════════════════════════════════════════════════════════
// QuestionRow — single row in the Master Index list
// Shows prompt, mini-sparkline, n=, pathway tag, T1 badge, search snippet
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import MiniSparkline from "./MiniSparkline";
import { MessageSquareText, BarChart2 } from "./Icons";

export default function QuestionRow({ q, index, distribution, cohortDistribution, onClick, searchTerm = "" }) {
  // Pathway tag (for non-"all" questions)
  const pathwayObj = q.pathway && q.pathway !== "all" ? PATHWAYS[q.pathway] : null;

  // Highlight search term matches
  let promptDisplay = q.prompt;
  if (searchTerm && searchTerm.length >= 2) {
    const re = new RegExp(`(${escapeRegex(searchTerm)})`, "gi");
    const parts = q.prompt.split(re);
    promptDisplay = parts.map((part, i) =>
      re.test(part) && part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} style={{ background: "rgba(212,160,48,0.3)", color: C.goldBright, padding: "0 2px", borderRadius: 2 }}>{part}</mark>
      ) : part
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: "0.7rem",
        alignItems: "flex-start",
        padding: "0.55rem 0.75rem",
        background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
        borderRadius: 5,
        cursor: "pointer",
        transition: "background 0.15s",
        borderLeft: `2px solid transparent`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderLeftColor = pathwayObj ? pathwayObj.color : C.gold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent";
        e.currentTarget.style.borderLeftColor = "transparent";
      }}
    >
      {/* Row number */}
      <span style={{
        fontFamily: FONT.mono,
        fontSize: "0.64rem",
        color: C.dim,
        minWidth: "1.6rem",
        paddingTop: "0.15rem",
        flexShrink: 0,
      }}>{String(index + 1).padStart(2, "0")}</span>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", flexWrap: "wrap" }}>
          {/* Tier 1 badge */}
          {q.tier === 1 && (
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: C.gold,
              background: "rgba(212,160,48,0.12)",
              border: "1px solid rgba(212,160,48,0.3)",
              borderRadius: 999,
              padding: "0.1rem 0.35rem",
              flexShrink: 0,
              marginTop: "0.15rem",
            }}>T1</span>
          )}

          {/* Pathway tag */}
          {pathwayObj && (
            <span style={{
              fontFamily: FONT.condensed,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: pathwayObj.color,
              background: `${pathwayObj.color}18`,
              border: `1px solid ${pathwayObj.color}40`,
              borderRadius: 999,
              padding: "0.1rem 0.4rem",
              flexShrink: 0,
              marginTop: "0.15rem",
            }}>
              {pathwayObj.emoji} {pathwayObj.label}
            </span>
          )}

          {/* Qual / Quant Badge */}
          <span title={q.type === "open_text" ? "Qualitative Open Response" : "Quantitative Metric"} style={{
            fontFamily: FONT.condensed,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: q.type === "open_text" ? "#a8b5c4" : C.dim,
            background: q.type === "open_text" ? "rgba(168,181,196,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${q.type === "open_text" ? "rgba(168,181,196,0.25)" : C.ghost}`,
            borderRadius: 999,
            padding: "0.1rem 0.4rem",
            flexShrink: 0,
            marginTop: "0.15rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}>
            {q.type === "open_text" ? (
              <><MessageSquareText size={10} strokeWidth={3} /> QUAL</>
            ) : (
              <><BarChart2 size={10} strokeWidth={3} /> QUANT</>
            )}
          </span>

          {/* Prompt */}
          <div style={{
            flex: "1 1 60%",
            minWidth: 0,
          }}>
            <div style={{
              fontFamily: FONT.body,
              fontSize: "0.83rem",
              color: C.text,
              lineHeight: 1.4,
            }}>
              {promptDisplay}
            </div>
            {q.subtitle && (
              <div style={{
                fontFamily: FONT.body,
                fontSize: "0.75rem",
                color: C.muted,
                marginTop: "0.25rem",
                lineHeight: 1.35,
                fontStyle: "italic",
              }}>
                {q.subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: ID + n= + sparkline */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginTop: "0.25rem",
          flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.6rem",
            color: C.dim,
          }}>{q.id}</span>

          {/* n= badge */}
          {q.n_responses !== undefined && q.n_responses > 0 && (
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.62rem",
              color: C.muted,
              background: "rgba(255,255,255,0.04)",
              padding: "0.08rem 0.32rem",
              borderRadius: 999,
              border: `1px solid ${C.ghost}`,
            }}>n={q.n_responses}</span>
          )}

          {/* Mini sparkline */}
          {distribution && distribution.length > 0 && (
            <MiniSparkline
              distribution={distribution}
              cohortDistribution={cohortDistribution}
              width={110}
              height={7}
            />
          )}
        </div>
      </div>

      {/* Chevron */}
      <span style={{
        color: C.dim,
        fontSize: "0.7rem",
        paddingTop: "0.2rem",
        flexShrink: 0,
      }}>›</span>
    </div>
  );
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
