// ═══════════════════════════════════════════════════════════════════════════
// PathwayPage — the interactive Pathway Map
// Left panel: pathway nav (integrates with router state)
// Right panel: selected pathway's sections with expandable question rows
// Questions are fetched live from D1 via the Worker API.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { C, FONT, RAINBOW } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS, OBSERVER_SUBROLES, observerSubrolesForQuestion, phaseForQuestion } from "../lib/pathways";
import { getQuestions } from "../lib/api";

// Pathway metadata specific to this diagram (layout-local)
const PATHWAY_CARDS = {
  universal: {
    id: "universal",
    label: "Universal",
    emoji: "📋",
    color: C.gold,
    bg: "rgba(212,160,48,0.08)",
    border: "rgba(212,160,48,0.3)",
    n: 501,
    desc: "All respondents",
    sections: ["Demographics", "Family", "Religion", "Appearance", "Sexual Experience", "Experience", "Pride & Regret", "Pathway Routing"],
  },
  intact: { ...PATHWAYS.intact, bg: "rgba(91,147,199,0.08)", border: "rgba(91,147,199,0.3)", sections: ["Intact Pathway"] },
  circumcised: { ...PATHWAYS.circumcised, bg: "rgba(217,79,79,0.08)", border: "rgba(217,79,79,0.3)", sections: ["Circumcised Pathway"] },
  restoring: { ...PATHWAYS.restoring, bg: "rgba(232,200,104,0.08)", border: "rgba(232,200,104,0.3)", sections: ["Restoring Pathway"] },
  observer: { ...PATHWAYS.observer, bg: "rgba(232,164,74,0.08)", border: "rgba(232,164,74,0.3)", sections: ["Observer Pathway"] },
  trans: { ...PATHWAYS.trans, bg: "rgba(232,93,80,0.05)", border: "rgba(232,93,80,0.2)", sections: ["Post-Vaginoplasty Pathway", "Post-Phalloplasty Pathway"] },
  intersex: { ...PATHWAYS.intersex, bg: "rgba(176,168,136,0.05)", border: "rgba(176,168,136,0.2)", sections: ["Intersex Pathway"] },
  synthesis: {
    id: "synthesis",
    label: "Synthesis",
    emoji: "🔀",
    color: C.gold,
    bg: "rgba(212,160,48,0.06)",
    border: "rgba(212,160,48,0.2)",
    n: 501,
    desc: "All pathways reconvene",
    sections: ["Culture & Attitudes", "Follow-up"],
  },
};

const BRANCH_IDS = ["intact", "circumcised", "restoring", "observer", "trans", "intersex"];

export default function PathwayPage({ routerState, navigate, updateState }) {
  const { pathway } = routerState;
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [observerRoleExpanded, setObserverRoleExpanded] = useState(null);

  // Default to Intact if no pathway selected (otherwise the page looks empty)
  const selectedKey = pathway || "intact";

  useEffect(() => {
    getQuestions({ counts: true })
      .then((d) => setQuestions(d.questions || []))
      .catch((e) => setError(e.message || String(e)));
  }, []);

  // Reset expansion state when selected pathway changes
  useEffect(() => {
    setExpanded({});
    setObserverRoleExpanded(null);
  }, [selectedKey]);

  const p = PATHWAY_CARDS[selectedKey] || PATHWAY_CARDS.intact;
  const isBranch = BRANCH_IDS.includes(selectedKey);

  // Build the sections for the right panel
  const displaySections = useMemo(() => {
    if (!questions) return [];
    const result = [];

    // Special handling for "universal": show the Universal phase sections
    if (selectedKey === "universal") {
      for (const secName of p.sections) {
        const qs = questions.filter((q) => q.section === secName && phaseForQuestion(q) === "universal");
        if (qs.length === 0 && secName !== "Pathway Routing") continue;
        result.push({
          name: secName,
          questions: qs.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0)),
        });
      }
      // Pathway Routing is technically universal
      const routing = questions.filter((q) => q.section === "Pathway Routing");
      if (routing.length > 0 && !result.find(r => r.name === "Pathway Routing")) {
        result.push({ name: "Pathway Routing", questions: routing });
      }
      return result;
    }

    // Synthesis
    if (selectedKey === "synthesis") {
      for (const secName of p.sections) {
        const qs = questions.filter((q) => q.section === secName && phaseForQuestion(q) === "synthesis");
        if (qs.length === 0) continue;
        result.push({
          name: secName,
          questions: qs.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0)),
        });
      }
      return result;
    }

    // Branch pathways
    for (const secName of p.sections) {
      const qs = questions.filter((q) => q.section === secName && q.pathway === selectedKey);
      if (qs.length === 0) continue;
      result.push({
        name: secName,
        questions: qs.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0)),
      });
    }
    return result;
  }, [questions, selectedKey, p.sections]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.75rem 1.1rem 3rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Masthead */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ height: 3, background: RAINBOW, borderRadius: 2, marginBottom: "1rem" }} />
          <div style={{
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: "0.3rem",
          }}>★ Survey Architecture ★</div>
          <h1 style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: "clamp(1.7rem, 4vw, 2.5rem)",
            color: C.textBright,
            lineHeight: 1.1,
            marginBottom: "0.3rem",
          }}>Pathway Map</h1>
          <div style={{
            fontFamily: FONT.display,
            fontStyle: "italic",
            fontSize: "0.9rem",
            color: C.muted,
          }}>Click any section to reveal its questions</div>
          <div style={{ marginTop: "0.8rem" }}>
            <a href="#/" style={{
              fontFamily: FONT.condensed,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.muted,
            }}>← Back to Master Index</a>
          </div>
        </div>

        {/* Two-panel layout */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "1.2rem",
            alignItems: "start",
          }}
        >
          {/* Left: pathway nav */}
          <aside
            className="explore-nav"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              position: "sticky",
              top: "1rem",
            }}
          >
            <PathCard cardKey="universal" card={PATHWAY_CARDS.universal} isSelected={selectedKey === "universal"} onClick={() => updateState({ pathway: null })} onClickLabel="universal" />
            <Divider label="↓ Pathway Splits ↓" />
            {BRANCH_IDS.map((id) => (
              <PathCard
                key={id}
                cardKey={id}
                card={PATHWAY_CARDS[id]}
                isSelected={selectedKey === id}
                onClick={() => updateState({ pathway: id })}
              />
            ))}
            <Divider label="↓ Reconvenes ↓" />
            <PathCard cardKey="synthesis" card={PATHWAY_CARDS.synthesis} isSelected={selectedKey === "synthesis"} onClick={() => { /* synthesis is not a pathway but we use a flag */ updateState({ pathway: "synthesis-view" }); }} />
          </aside>

          {/* Right: detail panel */}
          <main style={{
            background: C.bgSoft,
            border: `1px solid ${p.border}`,
            borderRadius: 10,
            padding: "1.1rem",
          }}>
            <PanelHeader card={p} />
            <div style={{ height: 1, background: `linear-gradient(90deg, color-mix(in srgb, p.color 31%, transparent), transparent)`, marginBottom: "0.9rem" }} />

            {p.waiting && <WaitingNotice card={p} />}

            {error && (
              <div style={{ padding: "1rem", color: C.red, fontFamily: FONT.mono, fontSize: "0.8rem" }}>
                <strong>API error:</strong> {error}
              </div>
            )}

            {!questions && !error && (
              <div style={{ padding: "2rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
                Loading questions from D1…
              </div>
            )}

            {questions && displaySections.length === 0 && !p.waiting && (
              <div style={{ padding: "1rem", color: C.muted, fontStyle: "italic" }}>
                No sections defined for this pathway yet.
              </div>
            )}

            <div style={{
              fontFamily: FONT.condensed,
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: "0.6rem",
            }}>
              {selectedKey === "observer" ? "Sub-Pathways — click to expand" :
                selectedKey === "trans" ? "Two Distinct Trans Pathways — click to expand" :
                  "Sections — click to expand"}
            </div>

            {/* Observer-specific: show sub-role selector first */}
            {selectedKey === "observer" && (
              <ObserverRolesPanel
                expandedRole={observerRoleExpanded}
                onToggleRole={(id) => setObserverRoleExpanded((prev) => prev === id ? null : id)}
                allObserverQuestions={questions ? questions.filter((q) => q.pathway === "observer") : []}
                navigate={navigate}
              />
            )}

            {/* Section rows */}
            {selectedKey !== "observer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {displaySections.map((sec) => (
                  <SectionExpansion
                    key={sec.name}
                    section={sec}
                    color={p.color}
                    isExpanded={!!expanded[sec.name]}
                    onToggle={() => toggle(sec.name)}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}

            {/* Trans bridge note */}
            {selectedKey === "trans" && (
              <div style={{
                marginTop: "0.85rem",
                padding: "0.7rem 0.9rem",
                background: "rgba(232,93,80,0.05)",
                border: "1px solid rgba(232,93,80,0.2)",
                borderRadius: 6,
                fontFamily: FONT.body,
                fontSize: "0.78rem",
                color: C.muted,
                lineHeight: 1.55,
              }}>
                <span style={{ color: PATHWAYS.trans.color, fontWeight: 600 }}>Bridge question:</span>{" "}
                Post-vaginoplasty respondents are offered an optional bridge back to the Intact or Circumcised pathway to answer questions from their pre-surgery perspective — if they feel comfortable doing so.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function PathCard({ card, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "0.7rem 0.85rem",
        borderRadius: 7,
        cursor: "pointer",
        background: isSelected ? card.bg : "transparent",
        border: `1px solid ${isSelected ? card.border : C.ghost}`,
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {isSelected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: card.color, borderRadius: "3px 0 0 3px" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.9rem" }}>{card.emoji}</span>
        <span style={{
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: isSelected ? card.color : C.text,
        }}>{card.label}</span>
        {card.n !== null && (
          <span style={{
            marginLeft: "auto",
            fontFamily: FONT.mono,
            fontSize: "0.66rem",
            color: card.waiting ? C.dim : C.muted,
          }}>{card.waiting ? "n=0 ✦" : `n=${card.n}`}</span>
        )}
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: "0.72rem", color: C.dim, paddingLeft: "1.4rem", marginTop: "0.1rem" }}>
        {card.desc}
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.5rem" }}>
      <div style={{ flex: 1, height: 1, background: C.ghost }} />
      <span style={{
        fontFamily: FONT.condensed,
        fontSize: "0.58rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.dim,
        whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.ghost }} />
    </div>
  );
}

function PanelHeader({ card }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "1.3rem" }}>{card.emoji}</span>
        <h2 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1.3rem",
          color: card.color,
          letterSpacing: "-0.01em",
        }}>{card.label}</h2>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          {card.waiting && (
            <span style={{
              fontFamily: FONT.condensed,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.dim,
              background: "rgba(255,255,255,0.04)",
              padding: "0.1rem 0.45rem",
              borderRadius: 999,
              border: `1px dashed ${C.ghost}`,
            }}>waiting for voices</span>
          )}
          {card.n !== null && card.n !== undefined && (
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: card.waiting ? C.dim : C.textBright,
              background: "rgba(255,255,255,0.05)",
              padding: "0.18rem 0.55rem",
              borderRadius: 999,
              border: `1px solid ${card.waiting ? C.ghost : card.border}`,
            }}>n = {card.n}</span>
          )}
        </div>
      </div>
      <p style={{
        fontFamily: FONT.display,
        fontStyle: "italic",
        fontSize: "0.9rem",
        color: C.muted,
        paddingLeft: "2rem",
      }}>{card.desc}</p>
    </div>
  );
}

function WaitingNotice({ card }) {
  return (
    <div style={{
      padding: "0.75rem 0.9rem",
      background: "rgba(255,255,255,0.02)",
      border: `1px dashed ${C.ghost}`,
      borderRadius: 8,
      marginBottom: "0.85rem",
      fontFamily: FONT.body,
      fontSize: "0.79rem",
      color: C.dim,
      lineHeight: 1.6,
    }}>
      <span style={{ color: card.color, fontWeight: 600 }}>✦ This pathway is ready.</span>{" "}
      The questions are seeded in D1 and the infrastructure is in place — no respondents have taken this pathway yet. These voices represent some of the most valuable perspectives in the dataset.
    </div>
  );
}

function SectionExpansion({ section, color, isExpanded, onToggle, navigate }) {
  return (
    <div style={{
      borderRadius: 6,
      overflow: "hidden",
      border: `1px solid ${isExpanded ? color + "50" : C.ghost}`,
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.65rem 0.75rem",
          background: isExpanded ? `color-mix(in srgb, color 7%, transparent)` : "transparent",
          cursor: "pointer",
          userSelect: "none",
          transition: "background 0.2s",
        }}
      >
        <div style={{ width: 3, minHeight: 18, alignSelf: "stretch", background: color, borderRadius: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: "0.85rem",
            color: isExpanded ? C.textBright : C.text,
          }}>{section.name}</span>
          <span style={{
            marginLeft: "0.5rem",
            fontFamily: FONT.mono,
            fontSize: "0.65rem",
            color: C.muted,
            background: "rgba(255,255,255,0.05)",
            padding: "0.1rem 0.38rem",
            borderRadius: 999,
            border: `1px solid ${C.ghost}`,
          }}>{section.questions.length}q</span>
        </div>
        <div style={{
          color: isExpanded ? color : C.dim,
          fontSize: "0.72rem",
          transition: "transform 0.2s",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>▼</div>
      </div>
      {isExpanded && (
        <div style={{
          borderTop: `1px solid color-mix(in srgb, color 19%, transparent)`,
          background: "rgba(0,0,0,0.22)",
          padding: "0.3rem 0.35rem 0.5rem",
          maxHeight: 380,
          overflowY: "auto",
        }}>
          {section.questions.map((q, i) => (
            <QuestionRowMini key={q.id} q={q} index={i} onClick={() => navigate("question", { id: q.id })} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRowMini({ q, index, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem",
        padding: "0.42rem 0.55rem",
        background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
        borderRadius: 4,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"; }}
    >
      <span style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, minWidth: "1.6rem", paddingTop: "0.05rem" }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT.body, fontSize: "0.8rem", color: C.text, lineHeight: 1.4 }}>{q.prompt}</span>
          {q.tier === 1 && (
            <span style={{
              fontFamily: FONT.mono, fontSize: "0.58rem", fontWeight: 700,
              letterSpacing: "0.08em", color: C.gold,
              background: "rgba(212,160,48,0.12)", border: "1px solid rgba(212,160,48,0.3)",
              borderRadius: 999, padding: "0.05rem 0.35rem",
            }}>T1</span>
          )}
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim, marginTop: "0.08rem" }}>{q.id}</div>
      </div>
      <span style={{ color: C.dim, fontSize: "0.7rem", paddingTop: "0.05rem" }}>›</span>
    </div>
  );
}

function ObserverRolesPanel({ expandedRole, onToggleRole, allObserverQuestions, navigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      {OBSERVER_SUBROLES.map((role) => {
        const isExpanded = expandedRole === role.id;
        let roleQuestions = [];
        if (!role.multi) {
          roleQuestions = allObserverQuestions
            .filter((q) => observerSubrolesForQuestion(q).includes(role.id))
            .sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
        }
        return (
          <div
            key={role.id}
            style={{
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${isExpanded ? PATHWAYS.observer.color + "50" : C.ghost}`,
            }}
          >
            <div
              onClick={() => !role.multi && onToggleRole(role.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "0.6rem 0.75rem",
                background: isExpanded ? `color-mix(in srgb, PATHWAYS.observer.color 8%, transparent)` : "transparent",
                cursor: role.multi ? "default" : "pointer",
                userSelect: "none",
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>{role.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: "0.82rem", color: C.text }}>{role.label}</span>
                  <span style={{
                    fontFamily: FONT.mono, fontSize: "0.62rem", color: C.muted,
                    background: "rgba(255,255,255,0.05)", padding: "0.08rem 0.35rem",
                    borderRadius: 999, border: `1px solid ${C.ghost}`,
                  }}>n={role.n}</span>
                  {role.rare && (
                    <span style={{
                      fontFamily: FONT.condensed, fontSize: "0.54rem",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#f09060", background: "rgba(240,144,96,0.12)",
                      padding: "0.05rem 0.3rem", borderRadius: 10,
                    }}>rare · precious</span>
                  )}
                  {role.multi && (
                    <span style={{
                      fontFamily: FONT.condensed, fontSize: "0.54rem",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: C.gold, background: "rgba(212,160,48,0.12)",
                      padding: "0.05rem 0.3rem", borderRadius: 10,
                    }}>synthetic · multi-hat</span>
                  )}
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: "0.72rem", color: C.dim, marginTop: "0.1rem" }}>{role.desc}</div>
              </div>
              {!role.multi && (
                <div style={{
                  color: isExpanded ? PATHWAYS.observer.color : C.dim,
                  fontSize: "0.7rem",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}>▼</div>
              )}
            </div>
            {isExpanded && roleQuestions.length > 0 && (
              <div style={{
                borderTop: `1px solid color-mix(in srgb, PATHWAYS.observer.color 19%, transparent)`,
                background: "rgba(0,0,0,0.2)",
                padding: "0.3rem 0.35rem 0.5rem",
                maxHeight: 340,
                overflowY: "auto",
              }}>
                {roleQuestions.map((q, i) => (
                  <QuestionRowMini key={q.id} q={q} index={i} onClick={() => navigate("question", { id: q.id })} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
