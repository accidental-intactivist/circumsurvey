// ═══════════════════════════════════════════════════════════════════════════
// QuestionRow — single row in the Master Index list
// Shows prompt, mini-sparkline, n=, pathway tag, T1 badge, search snippet
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT } from "../styles/tokens";
import { PATHWAYS } from "../lib/pathways";
import MiniSparkline from "./MiniSparkline";
import { MessageSquareText, CheckCircle2, ListChecks } from "./Icons";
import AddToReportButton from "./AddToReportButton";
import IconifyEmoji from "./IconifyEmoji";
import { QUESTION_EXHIBIT_MAP } from "../lib/coverage";
import { useTelemetry } from "../lib/telemetry";

const COMPONENT_TO_EXHIBIT = {
  Pathway: "01",
  MirrorPairs: "02",
  PleasureGap: "03",
  CorrelationExplorer: "04",
  DemographicsDashboard: "05",
  NarrativeMirrors: "06",
  CultureGenerations: "07",
  ObserverTriad: "08",
  ReligiousMirrors: "09",
  RestorationJourney: "10",
  AdultExperience: "11",
  ByTheNumbers: "12",
  Question: "—",
};

export default function QuestionRow({ q, index, distribution, cohortDistribution, cohort, onClick, searchTerm = "" }) {
  const { trackEvent } = useTelemetry();
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
      onClick={(e) => {
        trackEvent('question_clicked', { question_id: q.id });
        if (onClick) onClick(e);
      }}
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flexShrink: 0, minWidth: "1.6rem", paddingTop: "0.15rem" }}>
        {/* Row number */}
        <span style={{
          fontFamily: FONT.mono,
          fontSize: "0.64rem",
          color: C.dim,
        }}>{q.globalIndex ? String(q.globalIndex).padStart(2, "0") : String(index + 1).padStart(2, "0")}</span>

        {/* Format Badge */}
        <span title={q.type === "open_text" ? "Qualitative Open Response" : q.type === "single_select" ? "Single Select Choice" : "Multiple Select Choices"} style={{
          color: q.type === "open_text" ? "#a8b5c4" : C.dim,
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
        }}>
          {q.type === "open_text" ? (
            <MessageSquareText size={12} strokeWidth={2.5} />
          ) : q.type === "multi_select" ? (
            <ListChecks size={12} strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={12} strokeWidth={2.5} />
          )}
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Prompt and Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: 0 }}>
          
          {/* Badges Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
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
              }}>T1</span>
            )}

            {/* Pathway tag */}
            {pathwayObj && (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
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
              }}>
                <IconifyEmoji emoji={pathwayObj.emoji} size="0.65rem" /> <span>{pathwayObj.label}</span>
              </span>
            )}

          </div>

          {/* Prompt */}
          <div style={{ minWidth: 0 }}>
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

        {/* Right Column: Metadata and Sparkline */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.5rem",
          minWidth: 160
        }}>
          {/* id and n= badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.6rem",
              color: C.dim,
            }}>{q.id}</span>

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
          </div>

          {/* Mini sparkline */}
          {distribution && distribution.length > 0 && (
            <div style={{ width: "100%", maxWidth: 200, display: "flex", justifyContent: "flex-end" }}>
              <MiniSparkline
                distribution={distribution}
                cohortDistribution={cohortDistribution}
                width={160}
                height={10}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add to Report Button (Right aligned) */}
      <div onClick={(e) => e.stopPropagation()} style={{ paddingTop: "0.1rem", paddingRight: "0.2rem", flexShrink: 0 }}>
        <AddToReportButton questionId={q.id} cohort={cohort} iconOnly />
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
