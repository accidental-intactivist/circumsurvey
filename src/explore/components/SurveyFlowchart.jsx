// ═══════════════════════════════════════════════════════════════════════════
// SurveyFlowchart — Interactive vertical flowchart of the survey architecture.
// Renders: Universal → Fork → Pathway branches → Synthesis
// Built as HTML/CSS with SVG connection lines (not a chart library).
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { C, FONT, RAINBOW, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, OBSERVER_SUBROLES, observerSubrolesForQuestion, CIRCUMCISED_SUBROLES, circumcisedSubrolesForQuestion, phaseForQuestion } from "../lib/pathways";
import { getQuestions } from "../lib/api";
import { useTooltip, Tooltip } from "./Tooltip";
import { useReport } from "../contexts/ReportContext";

// ── Constants ────────────────────────────────────────────────────────────────

const UNIVERSAL_SECTIONS = [
  { name: "Demographics", emoji: "📊", desc: "Country, age, generation, education, sexuality, gender" },
  { name: "Family", emoji: "👨‍👩‍👦", desc: "Parents, upbringing, politics, socioeconomic status" },
  { name: "Religion", emoji: "🕊️", desc: "Tradition, significance, denomination details" },
  { name: "Appearance", emoji: "👁️", desc: "Body image and self-perception" },
  { name: "Sexual Experience", emoji: "💡", desc: "Sensation, orgasm, lubrication, communication" },
  { name: "Experience", emoji: "📝", desc: "Pre-ejaculate, needs, partner communication" },
  { name: "Pride & Regret", emoji: "⚖️", desc: "Overall satisfaction and emotional impact" },
  { name: "Pathway Routing", emoji: "🔀", desc: "Circumcision state — determines branching" },
];

const SYNTHESIS_SECTIONS = [
  { name: "Culture & Attitudes", emoji: "🌍", desc: "Norms, stereotypes, ethics, autonomy, media" },
  { name: "Follow-up", emoji: "📨", desc: "Contact consent, final reflections" },
];

const BRANCH_CONFIGS = [
  { id: "intact", label: "Intact", emoji: "🟢", color: PATH_COLORS.intact, desc: "Never circumcised", sections: ["Intact Pathway"] },
  { id: "circumcised", label: "Circumcised", emoji: "🔵", color: PATH_COLORS.circumcised, desc: "Circumcised as infants or later in life", sections: ["Circumcised Pathway"], hasSubRoles: true },
  { id: "restoring", label: "Restoring", emoji: "🟣", color: PATH_COLORS.restoring, desc: "Actively restoring foreskin", sections: ["Restoring Pathway"] },
  { id: "observer", label: "Observer", emoji: "🟠", color: PATH_COLORS.observer, desc: "Partners, parents, providers, advocates", sections: ["Observer Pathway"], hasSubRoles: true },
  { id: "trans", label: "Trans", emoji: "🔴", color: PATH_COLORS.trans_vaginoplasty, desc: "Post-vaginoplasty / Post-phalloplasty", sections: ["Post-Vaginoplasty Pathway", "Post-Phalloplasty Pathway"], waiting: true },
  { id: "intersex", label: "Intersex", emoji: "⚪", color: PATH_COLORS.intersex, desc: "Intersex perspectives", sections: ["Intersex Pathway"], waiting: true },
];

// ── Main Component ───────────────────────────────────────────────────────────

export default function SurveyFlowchart({ navigate, pathwayId }) {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(() => {
    const exp = searchParams.get("expanded");
    if (exp) {
      const res = {};
      exp.split(",").forEach(k => res[k] = true);
      return res;
    }
    if (pathwayId) {
      if (pathwayId === "synthesis-view") return { synthesis: true };
      return { [pathwayId]: true };
    }
    return { universal: true };
  });
  const [expandedSections, setExpandedSections] = useState({});
  const [compareMode, setCompareMode] = useState(() => {
    const exp = searchParams.get("expanded");
    return exp && exp.split(",").length > 1;
  });
  const containerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Sync expanded state to URL
  useEffect(() => {
    const active = Object.keys(expanded).filter(k => expanded[k]);
    setSearchParams(prev => {
      if (active.length === 0) {
        prev.delete("expanded");
      } else {
        prev.set("expanded", active.join(","));
      }
      return prev;
    }, { replace: true });
  }, [expanded, setSearchParams]);

  const expandedPathways = useMemo(() => {
    return BRANCH_CONFIGS.filter((b) => expanded[b.id]);
  }, [expanded]);

  // Fetch questions
  useEffect(() => {
    getQuestions({ counts: true })
      .then((d) => setQuestions(d.questions || []))
      .catch((e) => setError(e.message || String(e)));
  }, []);

  const handleToggleCompareMode = useCallback(() => {
    setCompareMode((prev) => {
      const nextMode = !prev;
      if (!nextMode) {
        // Collapsing all other pathways except the first active one we find
        setExpanded((prevExp) => {
          const nextExp = { ...prevExp };
          let foundActive = false;
          for (const branch of BRANCH_CONFIGS) {
            if (nextExp[branch.id]) {
              if (foundActive) {
                nextExp[branch.id] = false;
              } else {
                foundActive = true;
              }
            }
          }
          return nextExp;
        });
      }
      return nextMode;
    });
  }, []);

  const toggleNode = useCallback((nodeId) => {
    setExpanded((prev) => {
      const isPathway = BRANCH_CONFIGS.some((b) => b.id === nodeId);
      if (isPathway && !prev[nodeId] && !compareMode) {
        const next = { ...prev };
        for (const branch of BRANCH_CONFIGS) {
          if (branch.id !== nodeId) {
            next[branch.id] = false;
          }
        }
        next[nodeId] = true;
        return next;
      }
      return { ...prev, [nodeId]: !prev[nodeId] };
    });
  }, [compareMode]);

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }, []);

  // Group questions by phase and pathway
  const grouped = useMemo(() => {
    if (!questions) return null;
    const universal = {};
    const synthesis = {};
    const branches = {};

    const query = searchQuery.toLowerCase().trim();

    for (const q of questions) {
      if (query) {
        const promptMatch = q.prompt && q.prompt.toLowerCase().includes(query);
        const idMatch = q.id && q.id.toLowerCase().includes(query);
        if (!promptMatch && !idMatch) {
          continue;
        }
      }

      const phase = phaseForQuestion(q);
      if (phase === "universal") {
        const sec = q.section || "Other";
        if (!universal[sec]) universal[sec] = [];
        universal[sec].push(q);
      } else if (phase === "synthesis") {
        const sec = q.section || "Other";
        if (!synthesis[sec]) synthesis[sec] = [];
        synthesis[sec].push(q);
      } else {
        const pw = q.pathway || "unknown";
        if (!branches[pw]) branches[pw] = {};
        const sec = q.section || "Other";
        if (!branches[pw][sec]) branches[pw][sec] = [];
        branches[pw][sec].push(q);
      }
    }

    // Sort within each section
    const sortQs = (arr) => arr.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
    for (const sec of Object.values(universal)) sortQs(sec);
    for (const sec of Object.values(synthesis)) sortQs(sec);
    for (const pw of Object.values(branches)) {
      for (const sec of Object.values(pw)) sortQs(sec);
    }

    return { universal, synthesis, branches };
  }, [questions]);

  // Count questions per section
  const countForSection = useCallback((sectionName, pathwayId) => {
    if (!grouped) return 0;
    if (pathwayId === "universal") return (grouped.universal[sectionName] || []).length;
    if (pathwayId === "synthesis") return (grouped.synthesis[sectionName] || []).length;
    return (grouped.branches[pathwayId]?.[sectionName] || []).length;
  }, [grouped]);

  // Count total questions for a pathway
  const totalForPathway = useCallback((pathwayId) => {
    if (!grouped) return 0;
    if (pathwayId === "universal") return Object.values(grouped.universal).reduce((s, a) => s + a.length, 0);
    if (pathwayId === "synthesis") return Object.values(grouped.synthesis).reduce((s, a) => s + a.length, 0);
    const pw = grouped.branches[pathwayId];
    if (!pw) return 0;
    return Object.values(pw).reduce((s, a) => s + a.length, 0);
  }, [grouped]);

  // Get N (respondent count) from pathway config
  const nForPathway = useCallback((pathwayId) => {
    const p = PATHWAYS[pathwayId];
    return p ? p.n : null;
  }, []);

  const getFlowInfo = useCallback((branch) => {
    const isObserver = branch.hasSubRoles;
    const isTrans = branch.id === "trans";
    const n = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
    const qCount = isTrans
      ? (totalForPathway("trans_vaginoplasty") + totalForPathway("trans_phalloplasty"))
      : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));
    return { n, qCount };
  }, [nForPathway, totalForPathway]);


  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: C.red, fontFamily: FONT.mono }}>
        <strong>API error:</strong> {error}
      </div>
    );
  }

  if (!questions) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontStyle: "italic", fontFamily: FONT.body }}>
        Loading survey architecture…
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`
        .flowchart-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.75rem;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .flowchart-connectors {
          display: flex;
        }
        .flowchart-mobile-connector {
          display: none;
        }
        @media (max-width: 1100px) {
          .flowchart-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .flowchart-connectors {
            display: none !important;
          }
          .flowchart-mobile-connector {
            display: flex !important;
          }
        }
        @media (max-width: 600px) {
          .flowchart-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>

      {/* ═══ SEARCH BAR ═══ */}
      <div style={{
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
        }}>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem 1rem 0.8rem 2.5rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${C.ghost}`,
              borderRadius: 24,
              color: C.textBright,
              fontFamily: FONT.body,
              fontSize: "0.9rem",
              outline: "none",
              transition: "all 0.2s ease",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.ghost;
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
          />
          <span style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: C.dim,
            pointerEvents: "none",
          }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: C.dim,
                cursor: "pointer",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ═══ UNIVERSAL BLOCK ═══ */}
      <FlowNode
        nodeId="universal"
        title="Universal Questions"
        emoji="📋"
        color={C.gold}
        desc="Questions every respondent answered"
        qCount={totalForPathway("universal")}
        nCount={501}
        isExpanded={searchQuery ? totalForPathway("universal") > 0 : expanded.universal}
        onToggle={() => toggleNode("universal")}
        style={{ marginBottom: 0 }}
      >
        {UNIVERSAL_SECTIONS.map((sec) => {
          const qs = grouped?.universal[sec.name] || [];
          if (qs.length === 0) return null;
          const secKey = `universal-${sec.name}`;
          return (
            <SectionBlock
              key={secKey}
              section={sec}
              questions={qs}
              color={C.gold}
              isExpanded={searchQuery ? true : expandedSections[secKey]}
              onToggle={() => toggleSection(secKey)}
              navigate={navigate}
            />
          );
        })}
      </FlowNode>

      {/* ═══ VERTICAL CONNECTOR: Universal → Fork ═══ */}
      <VerticalConnector color={C.gold} height={48} />
      <MobileConnector color={C.gold} height={24} />

      {/* ═══ FORK DIAMOND ═══ */}
      <ForkDiamond />

      {/* ═══ COMPARE MODE TOGGLE ═══ */}
      <div className="flowchart-connectors" style={{
        justifyContent: "center",
        alignItems: "center",
        margin: "0.25rem 0 0.75rem",
        zIndex: 10,
        position: "relative"
      }}>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          cursor: "pointer",
          fontSize: "0.72rem",
          fontFamily: FONT.mono,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: compareMode ? C.goldBright : C.dim,
          background: "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${compareMode ? C.gold + "50" : C.ghost}`,
          borderRadius: 20,
          padding: "0.3rem 0.8rem",
          transition: "all 0.2s ease",
          userSelect: "none",
          boxShadow: compareMode ? `0 0 10px ${C.gold}15` : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.gold;
          e.currentTarget.style.color = C.textBright;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = compareMode ? C.gold + "50" : C.ghost;
          e.currentTarget.style.color = compareMode ? C.goldBright : C.dim;
        }}
        >
          <input
            type="checkbox"
            checked={compareMode}
            onChange={handleToggleCompareMode}
            style={{
              accentColor: C.gold,
              cursor: "pointer",
              margin: 0,
            }}
          />
          <span>Compare Mode (Unfold Multiple)</span>
        </label>
      </div>

      {/* ═══ BRANCH CONNECTORS ═══ */}
      <BranchConnectors 
        branches={BRANCH_CONFIGS} 
        onHover={showTooltip} 
        onMove={moveTooltip} 
        onLeave={hideTooltip} 
        getFlowInfo={getFlowInfo} 
      />
      <MobileConnector color={C.gold} height={24} />

      {/* ═══ PATHWAY BRANCHES ═══ */}
      <div className="flowchart-grid">
        {BRANCH_CONFIGS.map((branch) => {
          const isObserver = branch.hasSubRoles;
          const isTrans = branch.id === "trans";
          const branchN = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
          const branchQCount = isTrans
            ? (totalForPathway("trans_vaginoplasty") + totalForPathway("trans_phalloplasty"))
            : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));

          return (
            <FlowNode
              key={branch.id}
              nodeId={branch.id}
              title={branch.label}
              emoji={branch.emoji}
              color={branch.color}
              desc={branch.desc}
              qCount={branchQCount}
              nCount={branchN}
              isExpanded={searchQuery ? branchQCount > 0 : expanded[branch.id]}
              onToggle={() => toggleNode(branch.id)}
              waiting={branch.waiting}
              compact
            />
          );
        })}

        {/* Expanded Full-Width Content Container */}
        {(() => {
          const activePathways = searchQuery
            ? BRANCH_CONFIGS.filter(b => {
                const isTrans = b.id === "trans";
                const count = isTrans
                  ? (totalForPathway("trans_vaginoplasty") + totalForPathway("trans_phalloplasty"))
                  : (b.id === "observer" ? totalForPathway("observer") : totalForPathway(b.id));
                return count > 0;
              })
            : expandedPathways;

          if (activePathways.length === 0) return null;

          return (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: `repeat(${activePathways.length}, 1fr)`,
                gap: "1rem",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              {activePathways.map((branch) => {
                const isObserver = branch.hasSubRoles;
                const isTrans = branch.id === "trans";
                const branchN = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
                const branchQCount = isTrans
                  ? (totalForPathway("trans_vaginoplasty") + totalForPathway("trans_phalloplasty"))
                  : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));
                const k = activePathways.length;

                return (
                <div
                  key={`expanded-content-${branch.id}`}
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    border: `2px solid ${branch.color}`,
                    borderRadius: 12,
                    padding: "1.2rem 1.4rem",
                    position: "relative",
                    boxShadow: `0 0 32px ${branch.color}15, 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {/* Header inside the expanded content block to show which pathway it is */}
                  <div style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    background: "rgba(18, 18, 18, 0.8)",
                    backdropFilter: "blur(12px)",
                    margin: "-1.2rem -1.4rem 0.8rem",
                    padding: "1rem 1.4rem",
                    borderRadius: "12px 12px 0 0",
                    borderBottom: `1px solid ${branch.color}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>{branch.emoji}</span>
                    <span style={{
                      fontFamily: FONT.display,
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: branch.color,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}>{branch.label} PATHWAY QUESTIONS</span>
                    
                    <span style={{
                      fontFamily: FONT.mono,
                      fontSize: "0.65rem",
                      color: C.muted,
                      background: "rgba(255,255,255,0.05)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 999,
                      border: `1px solid ${C.ghost}`,
                    }}>{branchQCount}q</span>

                    {branchN !== null && (
                      <span style={{
                        fontFamily: FONT.mono,
                        fontSize: "0.65rem",
                        color: branch.waiting ? C.dim : C.muted,
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: 999,
                        border: `1px solid ${branch.waiting ? C.ghost : branch.color + "40"}`,
                      }}>{branch.waiting ? "n=0" : `n=${branchN}`}</span>
                    )}

                    <button
                      onClick={() => toggleNode(branch.id)}
                      style={{
                        marginLeft: "auto",
                        background: "transparent",
                        border: `1px solid ${C.ghost}`,
                        color: C.dim,
                        fontSize: "0.6rem",
                        fontFamily: FONT.mono,
                        textTransform: "uppercase",
                        padding: "0.15rem 0.55rem",
                        borderRadius: 4,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = branch.color;
                        e.currentTarget.style.color = C.textBright;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.ghost;
                        e.currentTarget.style.color = C.dim;
                      }}
                    >
                      Close ✕
                    </button>
                  </div>

                  {!branch.hasSubRoles && !isTrans && branch.sections.length === 1 ? (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                      border: `1px solid ${branch.color}15`,
                      background: "rgba(0, 0, 0, 0.22)",
                      borderRadius: 8,
                      padding: "0.6rem 0.8rem",
                    }}>
                      {(grouped?.branches?.[branch.id]?.[branch.sections[0]] || []).map((q, i) => (
                        <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: k === 1 ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr",
                      gap: "0.85rem",
                    }}>
                      {/* Circumcised: show sub-roles */}
                      {branch.id === "circumcised" && (
                        <CircumcisedSubRoles
                          questions={questions}
                          navigate={navigate}
                          isSingleColumn={k > 1}
                        />
                      )}

                      {/* Observer: show sub-roles */}
                      {isObserver && (
                        <ObserverSubRoles
                          questions={questions}
                          navigate={navigate}
                          isSingleColumn={k > 1}
                        />
                      )}

                      {/* Trans: show both sub-pathways */}
                      {isTrans && (
                        <>
                          {["Post-Vaginoplasty Pathway", "Post-Phalloplasty Pathway"].map((secName) => {
                            const qs = [
                              ...(grouped?.branches?.trans_vaginoplasty?.[secName] || []),
                              ...(grouped?.branches?.trans_phalloplasty?.[secName] || []),
                            ];
                            const secKey = `trans-${secName}`;
                            return (
                              <SectionBlock
                                key={secKey}
                                section={{ name: secName.toUpperCase(), emoji: "🔴", desc: "" }}
                                questions={qs}
                                color={branch.color}
                                isExpanded={searchQuery ? true : expandedSections[secKey]}
                                onToggle={() => toggleSection(secKey)}
                                navigate={navigate}
                                staticOpen={true}
                              />
                            );
                          })}
                        </>
                      )}

                      {/* Regular pathways with multiple sections (fallback) */}
                      {!isObserver && !isTrans && branch.sections.map((secName) => {
                        const qs = grouped?.branches?.[branch.id]?.[secName] || [];
                        if (qs.length === 0) return null;
                        const secKey = `${branch.id}-${secName}`;
                        return (
                          <SectionBlock
                            key={secKey}
                            section={{ name: secName.toUpperCase(), emoji: branch.emoji, desc: "" }}
                            questions={qs}
                            color={branch.color}
                            isExpanded={searchQuery ? true : expandedSections[secKey]}
                            onToggle={() => toggleSection(secKey)}
                            navigate={navigate}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
      </div>

      {/* ═══ MERGE CONNECTORS ═══ */}
      <MergeConnectors 
        branches={BRANCH_CONFIGS} 
        onHover={showTooltip} 
        onMove={moveTooltip} 
        onLeave={hideTooltip} 
        getFlowInfo={getFlowInfo} 
      />
      <MobileConnector color={C.gold} height={24} />

      {/* ═══ SYNTHESIS BLOCK ═══ */}
      <FlowNode
        nodeId="synthesis"
        title="SYNTHESIS"
        emoji="🔀"
        color={C.gold}
        desc="All pathways reconvene"
        qCount={totalForPathway("synthesis")}
        nCount={501}
        isExpanded={expanded.synthesis}
        onToggle={() => toggleNode("synthesis")}
        style={{ marginTop: 0 }}
      >
        {(() => {
          const visible = SYNTHESIS_SECTIONS.filter((sec) => (grouped?.synthesis[sec.name] || []).length > 0);
          return visible.map((sec) => {
            const qs = grouped?.synthesis[sec.name] || [];
            const secKey = `synthesis-${sec.name}`;
            return (
              <SectionBlock
                key={secKey}
                section={sec}
                questions={qs}
                color={C.gold}
                isExpanded={expandedSections[secKey]}
                onToggle={() => toggleSection(secKey)}
                navigate={navigate}
                staticOpen={visible.length === 1}
              />
            );
          });
        })()}
      </FlowNode>

      <Tooltip {...tooltip} />

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════════

// ── FlowNode ────────────────────────────────────────────────────────────────
// Glassmorphic card for each major block (Universal, pathway, Synthesis)

function FlowNode({ nodeId, title, emoji, color, desc, qCount, nCount, isExpanded, onToggle, children, waiting, compact, style }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
        border: `1px solid ${isExpanded ? color : C.ghost}`,
        borderRadius: 12,
        padding: compact ? "0.85rem" : "1.1rem 1.3rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: isExpanded ? `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)` : `inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {/* Glow accent bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: isExpanded ? 0.8 : 0.3,
        transition: "opacity 0.3s",
      }} />

      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: compact ? "1rem" : "1.2rem" }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: compact ? "0.95rem" : "1.15rem",
              color: isExpanded ? color : C.textBright,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>{title}</span>

            {/* Question count badge */}
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.62rem",
              color: C.muted,
              background: "rgba(255,255,255,0.05)",
              padding: "0.1rem 0.4rem",
              borderRadius: 999,
              border: `1px solid ${C.ghost}`,
            }}>{qCount}q</span>

            {/* Respondent count */}
            {nCount !== null && nCount !== undefined && (
              <span style={{
                fontFamily: FONT.mono,
                fontSize: "0.62rem",
                fontWeight: 600,
                color: waiting ? C.dim : C.muted,
                background: "rgba(255,255,255,0.05)",
                padding: "0.1rem 0.4rem",
                borderRadius: 999,
                border: `1px solid ${waiting ? C.ghost : color + "40"}`,
              }}>{waiting ? "n=0 ✦" : `n=${nCount}`}</span>
            )}

            {waiting && (
              <span style={{
                fontFamily: FONT.condensed,
                fontSize: "0.54rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.dim,
                background: "rgba(255,255,255,0.03)",
                padding: "0.08rem 0.4rem",
                borderRadius: 999,
                border: `1px dashed ${C.ghost}`,
              }}>awaiting voices</span>
            )}
          </div>
          <div style={{
            fontFamily: FONT.body,
            fontSize: compact ? "0.72rem" : "0.8rem",
            color: C.dim,
            marginTop: "0.15rem",
          }}>{desc}</div>
        </div>

        {/* Expand chevron */}
        <div style={{
          color: isExpanded ? color : C.dim,
          fontSize: "0.75rem",
          transition: "transform 0.25s ease, color 0.25s ease",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>▼</div>
      </div>

      {/* Expandable content */}
      <div style={{
        display: "grid",
        gridTemplateRows: isExpanded ? "1fr" : "0fr",
        transition: "grid-template-rows 0.3s ease-in-out",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            marginTop: isExpanded ? "0.85rem" : 0,
            paddingTop: isExpanded ? "0.7rem" : 0,
            borderTop: isExpanded ? `1px solid ${color}25` : "1px solid transparent",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            opacity: isExpanded ? 1 : 0,
            transition: "all 0.3s ease-in-out",
            pointerEvents: isExpanded ? "auto" : "none",
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SectionBlock ─────────────────────────────────────────────────────────────
// Expandable section within a FlowNode

function SectionBlock({ section, questions, color, isExpanded, onToggle, navigate, staticOpen }) {
  const showExpanded = staticOpen || isExpanded;
  return (
    <div style={{
      borderRadius: 6,
      overflow: "hidden",
      border: `1px solid ${showExpanded ? color + "50" : C.ghost}`,
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={staticOpen ? undefined : onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.6rem",
          background: showExpanded ? `${color}0A` : "transparent",
          cursor: staticOpen ? "default" : "pointer",
          userSelect: "none",
          transition: "background 0.2s",
        }}
      >
        <span style={{ fontSize: "0.8rem" }}>{section.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: "0.78rem",
            color: showExpanded ? C.textBright : C.text,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}>{section.name}</span>
          <span style={{
            marginLeft: "0.4rem",
            fontFamily: FONT.mono,
            fontSize: "0.58rem",
            color: C.muted,
            background: "rgba(255,255,255,0.05)",
            padding: "0.05rem 0.3rem",
            borderRadius: 999,
            border: `1px solid ${C.ghost}`,
          }}>{questions.length}q</span>
        </div>
        {!staticOpen && (
          <div style={{
            color: isExpanded ? color : C.dim,
            fontSize: "0.6rem",
            transition: "transform 0.2s",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</div>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateRows: showExpanded ? "1fr" : "0fr",
        transition: "grid-template-rows 0.25s ease-in-out",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            borderTop: showExpanded ? `1px solid ${color}19` : "1px solid transparent",
            background: "rgba(0,0,0,0.22)",
            padding: showExpanded ? "0.3rem 0.2rem 0.5rem" : "0 0.2rem",
            maxHeight: 500,
            overflowY: "auto",
            opacity: showExpanded ? 1 : 0,
            transition: "all 0.25s ease-in-out",
            pointerEvents: showExpanded ? "auto" : "none",
          }}>
            {questions.map((q, i) => (
              <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QuestionRow ──────────────────────────────────────────────────────────────
// Individual question with full text, meta tags, and "See Responses" button

function QuestionRow({ q, index, navigate }) {
  const { reportItems, toggleInReport } = useReport();
  const isInReport = reportItems?.includes(q.id);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.45rem",
        padding: "0.5rem 0.5rem",
        background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
        borderRadius: 4,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"; }}
    >
      {/* +/- Toggle Switch for Custom Report */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleInReport(q.id);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          border: `1px solid ${isInReport ? C.gold : "rgba(255,255,255,0.2)"}`,
          borderRadius: "50%",
          background: isInReport ? `${C.gold}20` : "rgba(255,255,255,0.03)",
          color: isInReport ? C.goldBright : C.dim,
          cursor: "pointer",
          marginTop: "0.12rem",
          transition: "all 0.15s ease",
          userSelect: "none",
          flexShrink: 0,
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: "0.8rem",
          lineHeight: 1,
          padding: 0,
          outline: "none",
          boxShadow: isInReport ? `0 0 8px ${C.gold}20` : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isInReport ? C.red : C.gold;
          e.currentTarget.style.background = isInReport ? "rgba(217, 79, 79, 0.15)" : `${C.gold}15`;
          e.currentTarget.style.color = isInReport ? C.red : C.goldBright;
          e.currentTarget.style.boxShadow = isInReport ? `0 0 8px rgba(217, 79, 79, 0.3)` : `0 0 8px ${C.gold}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isInReport ? C.gold : "rgba(255,255,255,0.2)";
          e.currentTarget.style.background = isInReport ? `${C.gold}20` : "rgba(255,255,255,0.03)";
          e.currentTarget.style.color = isInReport ? C.goldBright : C.dim;
          e.currentTarget.style.boxShadow = isInReport ? `0 0 8px ${C.gold}20` : "none";
        }}
        title={isInReport ? "Remove from Custom Report" : "Add to Custom Report"}
      >
        {isInReport ? "−" : "+"}
      </button>

      {/* Index */}
      <span style={{
        fontFamily: FONT.mono,
        fontSize: "0.55rem",
        color: C.dim,
        minWidth: "1.4rem",
        paddingTop: "0.12rem",
        textAlign: "right",
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Question text */}
        <div style={{
          fontFamily: FONT.body,
          fontSize: "0.78rem",
          color: C.text,
          lineHeight: 1.45,
        }}>{q.prompt}</div>

        {/* Meta row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          marginTop: "0.25rem",
          flexWrap: "wrap",
        }}>
          {/* Question ID */}
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.55rem",
            color: C.dim,
          }}>{q.id}</span>

          {/* Tier badge */}
          {q.tier === 1 && (
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.52rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: C.gold,
              background: "rgba(212,160,48,0.12)",
              border: "1px solid rgba(212,160,48,0.3)",
              borderRadius: 999,
              padding: "0.03rem 0.3rem",
            }}>T1</span>
          )}

          {/* Type badge */}
          {q.type && (
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.52rem",
              color: C.muted,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${C.ghost}`,
              borderRadius: 999,
              padding: "0.03rem 0.3rem",
            }}>{q.type}</span>
          )}

          {/* See Responses button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("question", { id: q.id });
            }}
            style={{
              marginLeft: "auto",
              fontFamily: FONT.condensed,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.gold,
              background: "rgba(212,160,48,0.08)",
              border: `1px solid rgba(212,160,48,0.25)`,
              borderRadius: 999,
              padding: "0.15rem 0.55rem",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,160,48,0.18)";
              e.currentTarget.style.borderColor = "rgba(212,160,48,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(212,160,48,0.08)";
              e.currentTarget.style.borderColor = "rgba(212,160,48,0.25)";
            }}
          >
            See Responses →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ForkDiamond ──────────────────────────────────────────────────────────────
// The dramatic CIRO routing decision point

function ForkDiamond() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      margin: "0.25rem 0",
      position: "relative",
    }}>
      {/* Pulsing glow */}
      <div style={{
        position: "absolute",
        width: 120, height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}15, transparent 70%)`,
        animation: "pulse 3s ease-in-out infinite",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      {/* Diamond shape */}
      <div style={{
        width: 80,
        height: 80,
        transform: "rotate(45deg)",
        background: `linear-gradient(135deg, rgba(212,160,48,0.15) 0%, rgba(212,160,48,0.05) 100%)`,
        border: `2px solid ${C.gold}60`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: `0 0 24px ${C.gold}20`,
      }}>
        <div style={{
          transform: "rotate(-45deg)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.gold,
            lineHeight: 1.3,
          }}>PATHWAY</div>
          <div style={{
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.gold,
            lineHeight: 1.3,
          }}>FORK</div>
          <div style={{
            fontSize: "0.9rem",
            marginTop: "0.1rem",
          }}>🔀</div>
        </div>
      </div>

      {/* Inline CSS animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ── VerticalConnector ────────────────────────────────────────────────────────

function VerticalConnector({ color, height = 48 }) {
  const trunkW = 160;
  const svgW = 1200;
  return (
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible" }}>
      <svg viewBox={`0 0 ${svgW} ${height}`} style={{ width: "100%", height, overflow: "visible" }}>
        <defs>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <rect
          x={(svgW - trunkW) / 2}
          y={0}
          width={trunkW}
          height={height}
          fill="url(#trunkGrad)"
          opacity={0.3}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
        {/* Glowing flow dot in the center of the trunk */}
        <circle
          cx={svgW / 2}
          r={3}
          fill={color}
          opacity={0.8}
          style={{
            animation: `flowDotVertical 2s infinite ease-in-out`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </svg>
      <style>{`
        @keyframes flowDotVertical {
          0% { cy: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { cy: ${height}px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── MobileConnector ──────────────────────────────────────────────────────────

function MobileConnector({ color, height = 24 }) {
  return (
    <div className="flowchart-mobile-connector" style={{
      display: "none",
      justifyContent: "center",
      height,
      position: "relative",
    }}>
      <div style={{
        width: 2,
        height: "100%",
        background: `linear-gradient(to bottom, ${color}60, ${color}30)`,
      }} />
    </div>
  );
}

// ── BranchConnectors ─────────────────────────────────────────────────────────
// Vertical Sankey ribbons fanning out from the fork to each pathway card

function BranchConnectors({ branches, onHover, onMove, onLeave, getFlowInfo }) {
  const count = branches.length;
  const svgW = 1200;
  const svgH = 80;

  const flows = branches.map((b, i) => {
    const info = getFlowInfo(b);
    return {
      id: b.id,
      label: b.label,
      color: b.color,
      n: info.n,
      qCount: info.qCount,
      weight: Math.max(15, info.n),
      i,
    };
  });

  const totalWeight = flows.reduce((s, f) => s + f.weight, 0);

  const trunkW = 160;
  const trunkLeft = (svgW - trunkW) / 2;

  let currentX = trunkLeft;

  return (
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: svgH, overflow: "visible" }}>
        {flows.map((f) => {
          const w = (f.weight / totalWeight) * trunkW;
          const topL = currentX;
          const topR = currentX + w;
          currentX += w;

          const cardW = (svgW - 5 * 12) / 6; // 190px
          const gap = 12;
          const botL = f.i * (cardW + gap);
          const botR = botL + cardW;

          const cpY = svgH * 0.55;

          const d = `
            M ${topL} 0
            C ${topL} ${cpY}, ${botL} ${svgH - cpY}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${svgH - cpY}, ${topR} ${cpY}, ${topR} 0
            Z
          `;

          const baseOpacity = f.n === 0 ? 0.18 : 0.38;
          const isDormant = f.n === 0;

          return (
            <g key={f.id}>
              <path
                d={d}
                fill={f.color}
                opacity={baseOpacity}
                stroke={f.color}
                strokeWidth={0.5}
                strokeOpacity={0.6}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.25s, fill 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 0.85;
                  onHover(
                    e,
                    `<strong>${f.label} Pathway</strong><br/>` +
                    `Questions: ${f.qCount}<br/>` +
                    `Respondents: ${isDormant ? "0 (Awaiting voices)" : `n = ${f.n}`}`
                  );
                }}
                onMouseMove={onMove}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = baseOpacity;
                  onLeave();
                }}
                strokeDasharray={isDormant ? "4,3" : "none"}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── MergeConnectors ──────────────────────────────────────────────────────────
// Vertical Sankey ribbons merging from each pathway card back to the synthesis trunk

function MergeConnectors({ branches, onHover, onMove, onLeave, getFlowInfo }) {
  const count = branches.length;
  const svgW = 1200;
  const svgH = 80;

  const flows = branches.map((b, i) => {
    const info = getFlowInfo(b);
    return {
      id: b.id,
      label: b.label,
      color: b.color,
      n: info.n,
      qCount: info.qCount,
      weight: Math.max(15, info.n),
      i,
    };
  });

  const totalWeight = flows.reduce((s, f) => s + f.weight, 0);

  const trunkW = 160;
  const trunkLeft = (svgW - trunkW) / 2;

  let currentX = trunkLeft;

  return (
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: svgH, overflow: "visible" }}>
        {flows.map((f) => {
          const w = (f.weight / totalWeight) * trunkW;
          const botL = currentX;
          const botR = currentX + w;
          currentX += w;

          const cardW = (svgW - 5 * 12) / 6; // 190px
          const gap = 12;
          const topL = f.i * (cardW + gap);
          const topR = topL + cardW;

          const cpY = svgH * 0.55;

          const d = `
            M ${topL} 0
            C ${topL} ${cpY}, ${botL} ${svgH - cpY}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${svgH - cpY}, ${topR} ${cpY}, ${topR} 0
            Z
          `;

          const baseOpacity = f.n === 0 ? 0.18 : 0.38;
          const isDormant = f.n === 0;

          return (
            <g key={f.id}>
              <path
                d={d}
                fill={f.color}
                opacity={baseOpacity}
                stroke={f.color}
                strokeWidth={0.5}
                strokeOpacity={0.6}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.25s, fill 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 0.85;
                  onHover(
                    e,
                    `<strong>${f.label} Pathway (Reconvening)</strong><br/>` +
                    `Questions: ${f.qCount}<br/>` +
                    `Respondents: ${isDormant ? "0 (Awaiting voices)" : `n = ${f.n}`}`
                  );
                }}
                onMouseMove={onMove}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = baseOpacity;
                  onLeave();
                }}
                strokeDasharray={isDormant ? "4,3" : "none"}
              />
            </g>
          );
        })}
        <circle cx={svgW / 2} cy={svgH} r={3} fill={C.gold} opacity={0.6} />
      </svg>
    </div>
  );
}

// ── ObserverSubRoles ─────────────────────────────────────────────────────────
// Observer pathway with nested sub-role chips

function ObserverSubRoles({ questions, navigate, isSingleColumn }) {
  const [selectedRoleId, setSelectedRoleId] = useState("universal");

  const observerQuestions = useMemo(() =>
    questions.filter((q) => q.pathway === "observer"),
    [questions]
  );

  const universalRole = OBSERVER_SUBROLES.find(r => r.id === "universal");
  const universalQs = useMemo(() => {
    return observerQuestions.filter((q) =>
      observerSubrolesForQuestion(q).includes("universal")
    );
  }, [observerQuestions]);

  const activeRole = OBSERVER_SUBROLES.find((r) => r.id === selectedRoleId);
  const activeRoleQs = useMemo(() => {
    return observerQuestions.filter((q) =>
      observerSubrolesForQuestion(q).includes(selectedRoleId)
    ).sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
  }, [observerQuestions, selectedRoleId]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.8rem",
      gridColumn: "1 / -1"
    }}>

      {/* 1. Universal entry node */}
      <div
        onClick={() => setSelectedRoleId("universal")}
        style={{
          borderRadius: 8,
          border: `1px solid ${selectedRoleId === "universal" ? PATH_COLORS.observer : C.ghost}`,
          background: selectedRoleId === "universal" ? `${PATH_COLORS.observer}15` : "rgba(255, 255, 255, 0.02)",
          cursor: "pointer",
          padding: "0.6rem 0.8rem",
          userSelect: "none",
          transition: "all 0.2s ease",
          boxShadow: selectedRoleId === "universal" ? `0 0 12px ${PATH_COLORS.observer}25` : "none",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
        }}
        onMouseEnter={(e) => {
          if (selectedRoleId !== "universal") {
            e.currentTarget.style.borderColor = `${PATH_COLORS.observer}80`;
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedRoleId !== "universal") {
            e.currentTarget.style.borderColor = C.ghost;
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
          }
        }}
      >
        <span style={{ fontSize: "1.4rem" }}>👥</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "0.82rem",
              color: selectedRoleId === "universal" ? C.textBright : C.text,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>UNIVERSAL (ALL OBSERVERS)</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.55rem",
              color: selectedRoleId === "universal" ? PATH_COLORS.observer : C.muted,
              background: "rgba(255,255,255,0.03)",
              padding: "0.05rem 0.3rem",
              borderRadius: 4,
              border: `1px solid ${selectedRoleId === "universal" ? PATH_COLORS.observer + "30" : C.ghost}`,
            }}>{universalQs.length}q · n={universalRole.n}</span>
          </div>
          <div style={{
            fontFamily: FONT.body,
            fontSize: "0.68rem",
            color: selectedRoleId === "universal" ? C.text : C.dim,
            marginTop: "0.1rem",
          }}>{universalRole.desc}</div>
        </div>
        {selectedRoleId === "universal" && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.6rem",
            color: PATH_COLORS.observer,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>Active Entry</span>
        )}
      </div>

      {/* Downward branching connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", margin: "0.1rem 0" }}>
        <div style={{
          width: 2,
          height: 24,
          background: `linear-gradient(to bottom, ${PATH_COLORS.observer}, ${PATH_COLORS.observer}50)`,
        }} />
        <span style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          background: C.bgSoft,
          border: `1px solid ${PATH_COLORS.observer}40`,
          borderRadius: 4,
          padding: "0.1rem 0.4rem",
          fontFamily: FONT.mono,
          fontSize: "0.55rem",
          textTransform: "uppercase",
          color: PATH_COLORS.observer,
          letterSpacing: "0.05em",
        }}>BRANCH INTO ROLE(S)</span>
      </div>

      {/* 2. Specific Roles Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isSingleColumn ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "0.6rem",
      }}>
        {OBSERVER_SUBROLES.filter(r => r.id !== "universal" && !r.multi).map((role) => {
          const roleQs = observerQuestions.filter((q) =>
            observerSubrolesForQuestion(q).includes(role.id)
          );
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${isSelected ? PATH_COLORS.observer : C.ghost}`,
                background: isSelected ? `${PATH_COLORS.observer}15` : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                padding: "0.55rem 0.7rem",
                userSelect: "none",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? `0 0 12px ${PATH_COLORS.observer}25` : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.25rem",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${PATH_COLORS.observer}80`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = C.ghost;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.9rem", marginTop: "0.05rem" }}>{role.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: FONT.body,
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      color: isSelected ? C.textBright : C.text,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}>{role.label}</span>
                    {role.rare && (
                      <span style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.45rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#f09060",
                        background: "rgba(240,144,96,0.12)",
                        padding: "0.02rem 0.25rem",
                        borderRadius: 10,
                      }}>rare</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: FONT.body,
                    fontSize: "0.62rem",
                    color: isSelected ? C.text : C.dim,
                    marginTop: "0.05rem",
                    lineHeight: 1.2,
                  }}>{role.desc}</div>
                </div>
              </div>
              <div style={{
                alignSelf: "flex-end",
                fontFamily: FONT.mono,
                fontSize: "0.52rem",
                color: isSelected ? PATH_COLORS.observer : C.muted,
                background: "rgba(255,255,255,0.03)",
                padding: "0.05rem 0.3rem",
                borderRadius: 4,
                border: `1px solid ${isSelected ? PATH_COLORS.observer + "30" : C.ghost}`,
                marginTop: "0.2rem",
              }}>
                {roleQs.length}q · n={role.n}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loop-back callout */}
      <div style={{
        padding: "0.45rem 0.6rem",
        background: `${PATH_COLORS.observer}08`,
        border: `1px dashed ${PATH_COLORS.observer}30`,
        borderRadius: 6,
        fontFamily: FONT.body,
        fontSize: "0.7rem",
        color: C.muted,
        lineHeight: 1.5,
        marginTop: "0.2rem",
      }}>
        <span style={{ color: PATH_COLORS.observer, fontWeight: 600 }}>🎭 MULTIPLE HATS:</span>{" "}
        Observers can loop back and fill out additional roles — 16 respondents wore 2+ hats.
      </div>

      {/* Downward connector to questions */}
      {activeRoleQs.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", margin: "0.1rem 0" }}>
          <div style={{
            width: 2,
            height: 16,
            background: `${PATH_COLORS.observer}40`,
          }} />
        </div>
      )}

      {/* Questions list container below */}
      {activeRoleQs.length > 0 && (
        <div style={{
          background: "rgba(0, 0, 0, 0.22)",
          border: `1px solid ${PATH_COLORS.observer}15`,
          borderRadius: 8,
          padding: "0.6rem 0.8rem",
        }}>
          <div style={{
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: "0.85rem",
            color: PATH_COLORS.observer,
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: `1px solid ${PATH_COLORS.observer}15`,
            paddingBottom: "0.4rem",
          }}>
            <span>{activeRole.emoji}</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>{activeRole.label} Questions</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.62rem",
              color: C.muted,
              background: "rgba(255,255,255,0.05)",
              padding: "0.1rem 0.4rem",
              borderRadius: 999,
              border: `1px solid ${C.ghost}`,
            }}>{activeRoleQs.length}q</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {activeRoleQs.map((q, i) => (
              <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Downward merging connector */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0.2rem 0 0.1rem" }}>
        <div style={{
          width: 2,
          height: 16,
          background: `linear-gradient(to bottom, ${PATH_COLORS.observer}40, ${C.gold}40)`,
        }} />
      </div>

      {/* 3. Exit Flow Nodes */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isSingleColumn ? "1fr" : "1fr 1fr",
        gap: "0.8rem",
        marginTop: "0.1rem",
      }}>
        {/* Loop Back Node */}
        <div style={{
          border: `1px dashed ${PATH_COLORS.observer}40`,
          borderRadius: 8,
          padding: "0.6rem 0.8rem",
          background: "rgba(249, 115, 22, 0.02)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontFamily: FONT.body,
          fontSize: "0.72rem",
          color: C.muted,
          lineHeight: 1.4,
        }}>
          <span style={{ fontSize: "1.2rem", filter: `drop-shadow(0 0 4px ${PATH_COLORS.observer}40)` }}>🔄</span>
          <div>
            <strong style={{ color: PATH_COLORS.observer, fontSize: "0.78rem", display: "block" }}>Loop back to Pool</strong>
            Select another hat to contribute additional observer perspectives (16 respondents did this)
          </div>
        </div>

        {/* Merge Node */}
        <div style={{
          border: `1px dashed ${C.gold}40`,
          borderRadius: 8,
          padding: "0.6rem 0.8rem",
          background: "rgba(212, 160, 48, 0.02)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontFamily: FONT.body,
          fontSize: "0.72rem",
          color: C.muted,
          lineHeight: 1.4,
        }}>
          <span style={{ fontSize: "1.2rem", filter: `drop-shadow(0 0 4px ${C.gold}40)` }}>🔀</span>
          <div>
            <strong style={{ color: C.goldBright, fontSize: "0.78rem", display: "block" }}>Merge to Synthesis</strong>
            Proceed to the final survey phase to answer the Culture & Attitudes and Follow-up sections
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CircumcisedSubRoles ───────────────────────────────────────────────────────
// Circumcised pathway with nested timing sub-role chips

function CircumcisedSubRoles({ questions, navigate, isSingleColumn }) {
  const [selectedRoleId, setSelectedRoleId] = useState("universal");

  const circumcisedQuestions = useMemo(() =>
    questions.filter((q) => q.pathway === "circumcised"),
    [questions]
  );

  const universalRole = CIRCUMCISED_SUBROLES.find(r => r.id === "universal");
  const universalQs = useMemo(() => {
    return circumcisedQuestions.filter((q) =>
      circumcisedSubrolesForQuestion(q).includes("universal")
    );
  }, [circumcisedQuestions]);

  const activeRole = CIRCUMCISED_SUBROLES.find((r) => r.id === selectedRoleId);
  const activeRoleQs = useMemo(() => {
    return circumcisedQuestions.filter((q) =>
      circumcisedSubrolesForQuestion(q).includes(selectedRoleId)
    ).sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
  }, [circumcisedQuestions, selectedRoleId]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.8rem",
      gridColumn: "1 / -1"
    }}>

      {/* 1. Universal entry node */}
      <div
        onClick={() => setSelectedRoleId("universal")}
        style={{
          borderRadius: 8,
          border: `1px solid ${selectedRoleId === "universal" ? PATH_COLORS.circumcised : C.ghost}`,
          background: selectedRoleId === "universal" ? `${PATH_COLORS.circumcised}15` : "rgba(255, 255, 255, 0.02)",
          cursor: "pointer",
          padding: "0.6rem 0.8rem",
          userSelect: "none",
          transition: "all 0.2s ease",
          boxShadow: selectedRoleId === "universal" ? `0 0 12px ${PATH_COLORS.circumcised}25` : "none",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
        }}
        onMouseEnter={(e) => {
          if (selectedRoleId !== "universal") {
            e.currentTarget.style.borderColor = `${PATH_COLORS.circumcised}80`;
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedRoleId !== "universal") {
            e.currentTarget.style.borderColor = C.ghost;
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
          }
        }}
      >
        <span style={{ fontSize: "1.4rem" }}>👥</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: "0.82rem",
              color: selectedRoleId === "universal" ? C.textBright : C.text,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>UNIVERSAL (ALL CIRCUMCISED)</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.55rem",
              color: selectedRoleId === "universal" ? PATH_COLORS.circumcised : C.muted,
              background: "rgba(255,255,255,0.03)",
              padding: "0.05rem 0.3rem",
              borderRadius: 4,
              border: `1px solid ${selectedRoleId === "universal" ? PATH_COLORS.circumcised + "30" : C.ghost}`,
            }}>{universalQs.length}q · n={universalRole.n}</span>
          </div>
          <div style={{
            fontFamily: FONT.body,
            fontSize: "0.68rem",
            color: selectedRoleId === "universal" ? C.text : C.dim,
            marginTop: "0.1rem",
          }}>{universalRole.desc}</div>
        </div>
        {selectedRoleId === "universal" && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.6rem",
            color: PATH_COLORS.circumcised,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>Active Entry</span>
        )}
      </div>

      {/* Downward branching connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", margin: "0.1rem 0" }}>
        <div style={{
          width: 2,
          height: 24,
          background: `linear-gradient(to bottom, ${PATH_COLORS.circumcised}, ${PATH_COLORS.circumcised}50)`,
        }} />
        <span style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          background: C.bgSoft,
          border: `1px solid ${PATH_COLORS.circumcised}40`,
          borderRadius: 4,
          padding: "0.1rem 0.4rem",
          fontFamily: FONT.mono,
          fontSize: "0.55rem",
          textTransform: "uppercase",
          color: PATH_COLORS.circumcised,
          letterSpacing: "0.05em",
        }}>BRANCH BY TIMING</span>
      </div>

      {/* 2. Specific Roles Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isSingleColumn ? "1fr" : "1fr 1fr",
        gap: "0.6rem",
      }}>
        {CIRCUMCISED_SUBROLES.filter(r => r.id !== "universal").map((role) => {
          const roleQs = circumcisedQuestions.filter((q) =>
            circumcisedSubrolesForQuestion(q).includes(role.id)
          );
          const isSelected = selectedRoleId === role.id;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${isSelected ? PATH_COLORS.circumcised : C.ghost}`,
                background: isSelected ? `${PATH_COLORS.circumcised}15` : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                padding: "0.55rem 0.7rem",
                userSelect: "none",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? `0 0 12px ${PATH_COLORS.circumcised}25` : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.25rem",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${PATH_COLORS.circumcised}80`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = C.ghost;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.9rem", marginTop: "0.05rem" }}>{role.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: FONT.body,
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      color: isSelected ? C.textBright : C.text,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}>{role.label}</span>
                  </div>
                  <div style={{
                    fontFamily: FONT.body,
                    fontSize: "0.62rem",
                    color: isSelected ? C.text : C.dim,
                    marginTop: "0.05rem",
                    lineHeight: 1.2,
                  }}>{role.desc}</div>
                </div>
              </div>
              <div style={{
                alignSelf: "flex-end",
                fontFamily: FONT.mono,
                fontSize: "0.55rem",
                color: isSelected ? PATH_COLORS.circumcised : C.muted,
                background: "rgba(255,255,255,0.03)",
                padding: "0.02rem 0.25rem",
                borderRadius: 4,
                border: `1px solid ${isSelected ? PATH_COLORS.circumcised + "30" : C.ghost}`,
              }}>
                {roleQs.length}q · n={role.n}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Selected Sub-role Questions List */}
      {selectedRoleId && (
        <div style={{
          border: `1px solid ${PATH_COLORS.circumcised}20`,
          borderRadius: 8,
          background: "rgba(0, 0, 0, 0.15)",
          padding: "0.8rem 1rem",
          marginTop: "0.4rem",
        }}>
          <div style={{
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: "0.85rem",
            color: PATH_COLORS.circumcised,
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: `1px solid ${PATH_COLORS.circumcised}15`,
            paddingBottom: "0.4rem",
          }}>
            <span>{activeRole.emoji}</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>{activeRole.label} Questions</span>
            <span style={{
              fontFamily: FONT.mono,
              fontSize: "0.62rem",
              color: C.muted,
              background: "rgba(255,255,255,0.05)",
              padding: "0.1rem 0.4rem",
              borderRadius: 999,
              border: `1px solid ${C.ghost}`,
            }}>{activeRoleQs.length}q</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {activeRoleQs.map((q, i) => (
              <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Downward merging connector */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0.2rem 0 0.1rem" }}>
        <div style={{
          width: 2,
          height: 16,
          background: `linear-gradient(to bottom, ${PATH_COLORS.circumcised}40, ${C.gold}40)`,
        }} />
      </div>

      {/* Exit Node */}
      <div style={{
        border: `1px dashed ${C.gold}40`,
        borderRadius: 8,
        padding: "0.6rem 0.8rem",
        background: "rgba(212, 160, 48, 0.02)",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        fontFamily: FONT.body,
        fontSize: "0.72rem",
        color: C.muted,
        lineHeight: 1.4,
        marginTop: "0.1rem",
      }}>
        <span style={{ fontSize: "1.2rem", filter: `drop-shadow(0 0 4px ${C.gold}40)` }}>🔀</span>
        <div>
          <strong style={{ color: C.goldBright, fontSize: "0.78rem", display: "block" }}>Merge to Synthesis</strong>
          Proceed to the final survey phase to answer the Culture & Attitudes and Follow-up sections
        </div>
      </div>
    </div>
  );
}
