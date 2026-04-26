// ═══════════════════════════════════════════════════════════════════════════
// SurveyMapNav — left sidebar showing the survey's branching architecture
// Universal → Pathways (with Observer sub-roles) → Synthesis
// ═══════════════════════════════════════════════════════════════════════════

import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS, SURVEY_PHASES, OBSERVER_SUBROLES } from "../lib/pathways";

// A single nav row
function NavRow({ emoji, label, desc, count, selected, onClick, color = C.gold, indent = 0, smaller = false, rare = false, waiting = false, multi = false }) {
  const fontSize = smaller ? "0.72rem" : "0.78rem";
  const sublabelSize = smaller ? "0.64rem" : "0.7rem";
  return (
    <div style={{ position: "relative" }}>
      {/* Subway node dot */}
      <div style={{
        position: "absolute",
        left: "-0.65rem",
        top: "1.1rem",
        transform: "translateY(-50%)",
        width: selected ? 8 : 6,
        height: selected ? 8 : 6,
        borderRadius: "50%",
        background: selected ? color : `${color}80`,
        border: `2px solid ${C.bg}`,
        zIndex: 2,
        transition: "all 0.2s",
      }} />

      <div
        onClick={onClick}
        style={{
          padding: smaller ? "0.32rem 0.5rem" : "0.52rem 0.65rem",
          paddingLeft: `${0.65 + indent * 0.8}rem`,
        background: selected ? `${color}14` : "transparent",
        border: `1px solid ${selected ? `${color}50` : "transparent"}`,
        borderRadius: 6,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.15s",
        position: "relative",
      }}
        onMouseEnter={(e) => { if (onClick && !selected) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
        onMouseLeave={(e) => { if (onClick && !selected) e.currentTarget.style.background = "transparent"; }}
      >
        {selected && (
          <div style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 2,
            background: color,
            borderRadius: 2,
          }} />
        )}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {emoji && <span style={{ fontSize: smaller ? "0.8rem" : "0.95rem" }}>{emoji}</span>}
        <span style={{
          fontFamily: smaller ? FONT.body : FONT.condensed,
          fontWeight: smaller ? 500 : 700,
          fontSize,
          letterSpacing: smaller ? "0" : "0.06em",
          textTransform: smaller ? "none" : "uppercase",
          color: selected ? color : C.text,
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {label}
          {rare && <span style={{
            marginLeft: "0.35rem",
            fontFamily: FONT.condensed,
            fontSize: "0.54rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#f09060",
            background: "rgba(240,144,96,0.12)",
            padding: "0.05rem 0.3rem",
            borderRadius: 10,
            verticalAlign: "middle",
          }}>rare · precious</span>}
          {multi && <span style={{
            marginLeft: "0.35rem",
            fontFamily: FONT.condensed,
            fontSize: "0.54rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.gold,
            background: "rgba(212,160,48,0.12)",
            padding: "0.05rem 0.3rem",
            borderRadius: 10,
            verticalAlign: "middle",
          }}>multi-hat</span>}
        </span>
        {(count !== undefined && count !== null) && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.62rem",
            color: waiting ? C.dim : C.muted,
          }}>{waiting ? "n=0 ✦" : `n=${count}`}</span>
        )}
      </div>
      {desc && (
        <div style={{
          fontFamily: FONT.body,
          fontSize: sublabelSize,
          color: C.dim,
          paddingLeft: emoji ? "1.4rem" : "0",
          marginTop: "0.1rem",
          lineHeight: 1.35,
        }}>{desc}</div>
        )}
      </div>
    </div>
  );
}

// Phase header (Universal / Branches / Synthesis)
function PhaseHeader({ phase }) {
  return (
    <div style={{
      padding: "0.4rem 0.65rem 0.2rem",
      fontFamily: FONT.condensed,
      fontSize: "0.6rem",
      fontWeight: 700,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: C.gold,
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
    }}>
      <span>{phase.emoji}</span>
      <span>{phase.label}</span>
    </div>
  );
}

// Divider between phases
function PhaseDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.55rem" }}>
      <div style={{ flex: 1, height: 1, background: C.ghost }} />
      <span style={{
        fontFamily: FONT.condensed,
        fontSize: "0.56rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.dim,
        whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.ghost }} />
    </div>
  );
}

export default function SurveyMapNav({
  selectedPathway,
  onSelectPathway,
  selectedSection,
  onSelectSection,
  selectedObserverRole,
  onSelectObserverRole,
}) {
  const universalPhase = SURVEY_PHASES.find(p => p.id === "universal");
  const synthesisPhase = SURVEY_PHASES.find(p => p.id === "synthesis");

  return (
    <nav style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "0.2rem", 
      position: "relative",
      paddingLeft: "0.9rem" 
    }}>
      {/* The main trunk line (Subway map style) */}
      <div style={{
        position: "absolute",
        left: "0.25rem",
        top: "1.2rem",
        bottom: "1rem",
        width: 2,
        background: `linear-gradient(to bottom, ${C.gold}40 0%, ${PATH_COLORS.observer}60 40%, ${PATH_COLORS.intact}60 60%, ${C.gold}40 100%)`,
        zIndex: 1,
        borderRadius: 2,
      }} />

      {/* Universal phase */}
      <PhaseHeader phase={universalPhase} />
      {universalPhase.sections.map((s) => (
        <NavRow
          key={s.name}
          label={s.name}
          desc={s.desc}
          smaller
          indent={1}
          selected={selectedSection === s.name}
          onClick={() => onSelectSection(selectedSection === s.name ? null : s.name)}
          color={C.gold}
        />
      ))}

      <PhaseDivider label="↓ Pathway Routing ↓" />

      {/* Pathway branches */}
      {PATHWAY_IDS.map((id) => {
        const p = PATHWAYS[id];
        const isSelected = selectedPathway === id;
        return (
          <div key={id}>
            <NavRow
              emoji={p.emoji}
              label={p.label}
              desc={p.desc}
              count={p.n}
              selected={isSelected}
              color={p.color}
              waiting={p.waiting}
              onClick={() => onSelectPathway(isSelected ? null : id)}
            />

            {/* Observer sub-pathways expand inline when Observer is selected */}
            {id === "observer" && isSelected && (
              <div style={{
                marginLeft: "0.6rem",
                marginTop: "0.1rem",
                paddingLeft: "0.5rem",
                borderLeft: `1px dashed ${p.color}40`,
              }}>
                {OBSERVER_SUBROLES.map((role) => {
                  const isRoleSelected = selectedObserverRole === role.id;
                  return (
                    <NavRow
                      key={role.id}
                      emoji={role.emoji}
                      label={role.label}
                      desc={null}
                      count={role.n}
                      smaller
                      indent={0}
                      rare={role.rare}
                      multi={role.multi}
                      selected={isRoleSelected}
                      color={p.color}
                      onClick={() => onSelectObserverRole(isRoleSelected ? null : role.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <PhaseDivider label="↓ Reconvenes ↓" />

      {/* Synthesis phase */}
      <PhaseHeader phase={synthesisPhase} />
      {synthesisPhase.sections.map((s) => (
        <NavRow
          key={s.name}
          label={s.name}
          desc={s.desc}
          smaller
          indent={1}
          selected={selectedSection === s.name}
          onClick={() => onSelectSection(selectedSection === s.name ? null : s.name)}
          color={C.gold}
        />
      ))}
    </nav>
  );
}
