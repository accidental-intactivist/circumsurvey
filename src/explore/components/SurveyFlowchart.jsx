// ═══════════════════════════════════════════════════════════════════════════
// SurveyFlowchart — Interactive vertical flowchart of the survey architecture.
// Renders: Universal → Fork → Pathway branches → Synthesis
// Built as HTML/CSS with SVG connection lines (not a chart library).
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { C, FONT, RAINBOW, PATH_COLORS } from "../styles/tokens";
import { PATHWAYS, OBSERVER_SUBROLES, observerSubrolesForQuestion, CIRCUMCISED_SUBROLES, circumcisedSubrolesForQuestion, TRANS_SUBROLES, transSubrolesForQuestion, phaseForQuestion } from "../lib/pathways";
import { getQuestions } from "../lib/api";
import { useTooltip, Tooltip } from "./Tooltip";
import { useReport } from "../contexts/ReportContext";
import * as Icons from "./Icons";

// ── Global Animations ────────────────────────────────────────────────────────
const FLOWCHART_STYLES = `
  @keyframes sfFlowDash {
    to { stroke-dashoffset: -40; }
  }
  @keyframes sfPulseGlow {
    0% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px var(--pulse-color-rgba), 0 0 0 0 var(--pulse-color-rgba); }
    70% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px var(--pulse-color-rgba), 0 0 0 8px transparent; }
    100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px var(--pulse-color-rgba), 0 0 0 0 transparent; }
  }
  @keyframes flowDotVertical {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  .sf-flow-anim {
    animation: sfFlowDash 1.2s linear infinite;
  }
  .sf-card {
    transition: box-shadow 0.2s;
  }
`;

// ── Constants ────────────────────────────────────────────────────────────────

const UNIVERSAL_SECTIONS = [
  { name: "Demographics", icon: Icons.PieChart, desc: "Country, age, generation, education, sexuality, gender" },
  { name: "Family", icon: Icons.Users, desc: "Parents, upbringing, politics, socioeconomic status" },
  { name: "Religion", icon: Icons.Feather, desc: "Tradition, significance, denomination details" },
  { name: "Appearance", icon: Icons.Eye, desc: "Body image and self-perception" },
  { name: "Sexual Experience", icon: Icons.Zap, desc: "Sensation, orgasm, lubrication, communication" },
  { name: "Experience", icon: Icons.FileText, desc: "Pre-ejaculate, needs, partner communication" },
  { name: "Pride & Regret", icon: Icons.Award, desc: "Overall satisfaction and emotional impact" },
  { name: "Pathway Routing", icon: Icons.GitBranch, desc: "Circumcision state — determines branching" },
];

const SYNTHESIS_SECTIONS = [
  { name: "Culture & Attitudes", icon: Icons.Globe, desc: "Norms, stereotypes, ethics, autonomy, media" },
  { name: "Follow-up", icon: Icons.Mail, desc: "Contact consent, final reflections" },
];

const BRANCH_CONFIGS = [
  { id: "intact", label: "Intact", icon: Icons.Circle, color: PATH_COLORS.intact, desc: "Never circumcised", sections: ["Intact Pathway"] },
  { id: "circumcised", label: "Circumcised", icon: Icons.Circle, color: PATH_COLORS.circumcised, desc: "Circumcised as infants or later in life", sections: ["Circumcised Pathway"], hasSubRoles: true },
  { id: "restoring", label: "Restoring", icon: Icons.Circle, color: PATH_COLORS.restoring, desc: "Actively restoring foreskin", sections: ["Restoring Pathway"] },
  { id: "observer", label: "Observer", icon: Icons.Circle, color: PATH_COLORS.observer, desc: "Partners, parents, providers, advocates", sections: ["Observer Pathway"], hasSubRoles: true },
  { id: "trans", label: "Transgender", icon: Icons.Circle, color: PATH_COLORS.trans_vaginoplasty, desc: "Post-vaginoplasty / Post-phalloplasty", sections: ["Post-Vaginoplasty Pathway", "Post-Phalloplasty Pathway"], waiting: true },
  { id: "intersex", label: "Intersex", icon: Icons.Circle, color: PATH_COLORS.intersex, desc: "Intersex perspectives", sections: ["Intersex Pathway"], waiting: true },
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
  const [pinned, setPinned] = useState({});
  const [hoveredPathway, setHoveredPathway] = useState(null);
  const [copied, setCopied] = useState(false);

  // Search only "activates" at 2+ characters — a single keystroke matches
  // nearly every question and would blast the whole board open.
  const effectiveQuery = searchQuery.trim().length >= 2 ? searchQuery : "";

  // One-click reset: clear search + close every node, section, and pin.
  const collapseAll = useCallback(() => {
    setSearchQuery("");
    setExpanded({});
    setExpandedSections({});
    setPinned({});
  }, []);
  const containerRef = useRef(null);
  const expandedContentRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();

  // Read & Erase URL state: Pulls `expanded` on mount (done in useState), then cleans the URL immediately.
  useEffect(() => {
    if (searchParams.has("expanded")) {
      setSearchParams(prev => {
        prev.delete("expanded");
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleShare = useCallback(() => {
    const active = Object.keys(expanded).filter(k => expanded[k]);
    const url = new URL(window.location.href);
    // Since HashRouter puts the search inside the hash (e.g. #/explore?expanded=...), 
    // we need to construct it carefully depending on how window.location is structured.
    // React Router's useSearchParams handles the ? within the hash. 
    // Let's rebuild the hash path:
    const hashSplit = window.location.hash.split("?");
    const path = hashSplit[0] || "#/";
    const newSearchParams = new URLSearchParams(hashSplit[1] || "");
    
    if (active.length > 0) {
      newSearchParams.set("expanded", active.join(","));
    } else {
      newSearchParams.delete("expanded");
    }
    
    const finalUrl = window.location.origin + window.location.pathname + path + "?" + newSearchParams.toString();
    
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expanded]);

  const expandedPathways = useMemo(() => {
    return BRANCH_CONFIGS.filter((b) => expanded[b.id]);
  }, [expanded]);

  // Fetch questions
  useEffect(() => {
    getQuestions({ counts: true })
      .then((d) => setQuestions(d.questions || []))
      .catch((e) => setError(e.message || String(e)));
  }, []);

  const toggleNode = useCallback((nodeId) => {
    setExpanded((prev) => {
      const isPathway = BRANCH_CONFIGS.some((b) => b.id === nodeId);
      if (isPathway) {
        if (prev[nodeId]) {
          setPinned(p => ({ ...p, [nodeId]: false }));
          return { ...prev, [nodeId]: false };
        } else {
          const next = { ...prev };
          for (const branch of BRANCH_CONFIGS) {
            if (branch.id !== nodeId && !pinned[branch.id]) {
              next[branch.id] = false;
            }
          }
          next[nodeId] = true;
          return next;
        }
      }
      return { ...prev, [nodeId]: !prev[nodeId] };
    });
  }, [pinned]);

  const togglePin = useCallback((nodeId, e) => {
    e.stopPropagation();
    setPinned(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    setExpanded(prev => ({ ...prev, [nodeId]: true }));
  }, []);

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => {
      const isReligion = sectionKey.startsWith("religion-");
      if (isReligion) {
        if (prev[sectionKey]) {
          return { ...prev, [sectionKey]: false };
        } else {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
            if (k.startsWith("religion-")) next[k] = false;
          });
          next[sectionKey] = true;
          return next;
        }
      }
      return { ...prev, [sectionKey]: !prev[sectionKey] };
    });
  }, []);

  // Group questions by phase and pathway
  const grouped = useMemo(() => {
    if (!questions) return null;
    const universal = {};
    const synthesis = {};
    const branches = {};

    const query = effectiveQuery.toLowerCase().trim();

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
    // effectiveQuery is used in the filter above — without it in the deps the
    // counts never re-filter while typing, so every node claimed matches and
    // the whole board expanded on the first keystroke.
  }, [questions, effectiveQuery]);

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
    const isTrans = branch.id === "trans";
    const n = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
    const qCount = isTrans
      ? totalForPathway("trans")
      : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));
    return { n, qCount };
  }, [nForPathway, totalForPathway]);
  const activePathways = effectiveQuery
    ? BRANCH_CONFIGS.filter(b => {
        const isTrans = b.id === "trans";
        const count = isTrans
          ? (totalForPathway("trans_vaginoplasty") + totalForPathway("trans_phalloplasty"))
          : (b.id === "observer" ? totalForPathway("observer") : totalForPathway(b.id));
        return count > 0;
      })
    : expandedPathways;

  const activeCircuitBranch = hoveredPathway 
    ? BRANCH_CONFIGS.find(b => b.id === hoveredPathway) 
    : (activePathways.length === 1 ? activePathways[0] : null);

  const isCircuitActive = hoveredPathway !== null || activePathways.length > 0;
  
  // Smooth scroll to expanded content
  useEffect(() => {
    if (expandedContentRef.current && activePathways.length > 0) {
      const timer = setTimeout(() => {
        // Find header offset to prevent scrolling under sticky headers if applicable
        const yOffset = -60;
        const element = expandedContentRef.current;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

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


  const universalColor = C.ltBlue;
  const synthesisColor = C.gold;

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
      <style>{FLOWCHART_STYLES}</style>
      <style>{`
        .flowchart-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          column-gap: 0;
          row-gap: 0;
          margin-top: 0;
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
            column-gap: 1rem;
            row-gap: 1rem;
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
            column-gap: 1rem;
            row-gap: 1rem;
          }
        }
      `}</style>

      {/* ═══ SEARCH BAR ═══ */}
      <div style={{
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        gap: "0.6rem",
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

        {/* Collapse All — one click closes search, nodes, sections & pins */}
        <button
          onClick={collapseAll}
          title="Close every open card on the board"
          style={{
            flexShrink: 0,
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.muted,
            background: "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${C.ghost}`,
            borderRadius: 24,
            padding: "0 1.1rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.gold;
            e.currentTarget.style.color = C.goldBright;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.ghost;
            e.currentTarget.style.color = C.muted;
          }}
        >
          Collapse All
        </button>

        {/* Share View */}
        <button
          onClick={handleShare}
          title="Copy a link to this exact view"
          style={{
            flexShrink: 0,
            fontFamily: FONT.condensed,
            fontWeight: 700,
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: copied ? C.bgDeep : C.muted,
            background: copied ? C.green : "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${copied ? C.green : C.ghost}`,
            borderRadius: 24,
            padding: "0 1.1rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.color = C.goldBright;
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.borderColor = C.ghost;
              e.currentTarget.style.color = C.muted;
            }
          }}
        >
          {copied ? <><Icons.Check size={12}/> Copied!</> : <><Icons.Link size={12}/> Share View</>}
        </button>
      </div>

      {/* ═══ UNIVERSAL BLOCK ═══ */}
      <FlowNode
        nodeId="universal"
        title="Universal Questions"
        icon={Icons.FileText}
        color={universalColor}
        desc="Questions every respondent answered"
        qCount={totalForPathway("universal")}
        nCount={501}
        isExpanded={effectiveQuery ? totalForPathway("universal") > 0 : expanded.universal}
        isHighlighted={true}
        onToggle={() => toggleNode("universal")}
        style={{ marginBottom: 0, borderRadius: "12px 12px 0 0" }}
      >
        {UNIVERSAL_SECTIONS.map((sec) => {
          const qs = grouped?.universal[sec.name] || [];
          if (qs.length === 0) return null;
          const secKey = `universal-${sec.name}`;
          if (sec.name === "Religion") {
            return (
              <ReligionPathways 
                key={secKey}
                section={sec}
                questions={qs}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                searchQuery={effectiveQuery}
                navigate={navigate}
              />
            );
          }

          return (
            <SectionBlock
              key={secKey}
              section={sec}
              questions={qs}
              color={C.ltBlue}
              isExpanded={effectiveQuery ? true : expandedSections[secKey]}
              onToggle={() => toggleSection(secKey)}
              navigate={navigate}
            />
          );
        })}
      </FlowNode>

      {/* ═══ FORK CONNECTORS: Universal → Pathways ═══ */}
      <UniversalForkConnector
        branches={BRANCH_CONFIGS}
        onHover={showTooltip}
        onMove={moveTooltip}
        onLeave={hideTooltip}
        getFlowInfo={getFlowInfo}
        activePathways={activePathways}
        hoveredPathway={hoveredPathway}
        onHoverChange={setHoveredPathway}
        searchActive={!!effectiveQuery}
      />
      <MobileConnector color={C.gold} height={24} />

      {/* ═══ PATHWAY BRANCHES ═══ */}
      <div className="flowchart-grid" style={{ position: "relative", zIndex: 1 }}>
        {BRANCH_CONFIGS.map((branch) => {
          const isTrans = branch.id === "trans";
          const branchN = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
          const branchQCount = isTrans
            ? totalForPathway("trans")
            : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));

          return (
            <FlowNode
              key={branch.id}
              nodeId={branch.id}
              title={branch.label}
              icon={branch.icon}
              color={branch.color}
              desc={branch.desc}
              qCount={branchQCount}
              nCount={branchN}
              isExpanded={effectiveQuery ? branchQCount > 0 : expanded[branch.id]}
              isHovered={hoveredPathway === branch.id}
              onHoverChange={(h) => setHoveredPathway(h ? branch.id : null)}
              onToggle={() => toggleNode(branch.id)}
              waiting={branch.waiting}
              compact
            />
          );
        })}

        {/* Expanded Full-Width Content Container */}
        {(() => {
          if (activePathways.length === 0) return null;

          return (
            <>
              <ExpandedConnectors branches={BRANCH_CONFIGS} activePathways={activePathways} />
              <div
                  ref={expandedContentRef}
                  style={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`,
                    gap: "1rem",
                    marginTop: 0,
                    marginBottom: 0,
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  {activePathways.map((branch) => {
                    const isObserver = branch.id === "observer";
                    const isTrans = branch.id === "trans";
                    const isPinned = pinned[branch.id];
                    const branchN = isTrans ? 0 : (branch.id === "observer" ? 37 : nForPathway(branch.id));
                    const branchQCount = isTrans
                      ? totalForPathway("trans")
                      : (branch.id === "observer" ? totalForPathway("observer") : totalForPathway(branch.id));
                    const k = activePathways.length;

                    return (
                      <div
                        key={`expanded-content-${branch.id}`}
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                          border: `2px solid ${branch.color}`,
                          borderRadius: 0,
                          padding: "1.2rem 1.4rem",
                          position: "relative",
                          boxShadow: `0 0 32px color-mix(in srgb, ${branch.color}, transparent 92%), 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
                          backdropFilter: "blur(12px)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.8rem",
                        }}
                      >
                        <div style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 20,
                          background: branch.color,
                          margin: "-1.2rem -1.4rem 0.8rem",
                          padding: "1rem 1.4rem",
                          borderRadius: 0,
                          borderBottom: `1px solid color-mix(in srgb, ${branch.color}, transparent 50%)`,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          flexWrap: "wrap",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}>
                          {branch.icon && <branch.icon size={22} color={C.bg} fill={C.bg} />}
                          <span style={{
                            fontFamily: FONT.display,
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: C.bg,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}>{branch.label} PATHWAY QUESTIONS</span>
                          
                          <span style={{
                            fontFamily: FONT.mono,
                            fontSize: "0.65rem",
                            color: C.bg,
                            background: "rgba(0,0,0,0.15)",
                            padding: "0.1rem 0.4rem",
                            borderRadius: 999,
                            border: "1px solid transparent",
                          }}>{branchQCount}q</span>

                          {branchN !== null && (
                            <span style={{
                              fontFamily: FONT.mono,
                              fontSize: "0.65rem",
                              color: branch.waiting ? "rgba(255,255,255,0.6)" : C.bg,
                              background: "rgba(0,0,0,0.15)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: 999,
                              border: `1px solid ${branch.waiting ? "rgba(0,0,0,0.1)" : "transparent"}`,
                            }}>{branch.waiting ? "n=0" : `n=${branchN}`}</span>
                          )}

                          <button
                            onClick={(e) => togglePin(branch.id, e)}
                            style={{
                              marginLeft: "auto",
                              background: isPinned ? C.bg : "rgba(0,0,0,0.1)",
                              border: `1px solid ${isPinned ? "transparent" : "rgba(0,0,0,0.25)"}`,
                              color: isPinned ? branch.color : C.bg,
                              fontSize: "0.6rem",
                              fontFamily: FONT.mono,
                              textTransform: "uppercase",
                              padding: "0.15rem 0.55rem",
                              borderRadius: 4,
                              cursor: "pointer",
                              transition: "all 0.15s",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                            onMouseEnter={(e) => {
                              if (!isPinned) {
                                e.currentTarget.style.background = "rgba(0,0,0,0.2)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isPinned) {
                                e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                              }
                            }}
                          >
                            <Icons.Pin size={12} fill={isPinned ? branch.color : "transparent"} style={{ marginBottom: "-1px", marginRight: "4px" }} /> {isPinned ? "Pinned" : "Pin to compare"}
                          </button>

                          <button
                            onClick={() => toggleNode(branch.id)}
                            style={{
                              background: "rgba(0,0,0,0.1)",
                              border: "1px solid rgba(0,0,0,0.25)",
                              color: C.bg,
                              fontSize: "0.6rem",
                              fontFamily: FONT.mono,
                              textTransform: "uppercase",
                              padding: "0.15rem 0.55rem",
                              borderRadius: 4,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(0,0,0,0.1)";
                            }}
                          >
                            Close ✕
                          </button>
                        </div>

                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: "0.85rem",
                        }}>
                          {branch.id === "circumcised" && (
                            <CircumcisedSubRoles
                              questions={questions}
                              navigate={navigate}
                              isSingleColumn={k > 1}
                            />
                          )}
                          {isObserver && (
                            <ObserverSubRoles
                              questions={questions}
                              navigate={navigate}
                              isSingleColumn={k > 1}
                            />
                          )}
                          {isTrans && (
                            <TransSubRoles
                              questions={questions}
                              navigate={navigate}
                              isSingleColumn={k > 1}
                            />
                          )}
                          {!isObserver && !isTrans && branch.id === "intersex" && (() => {
                            const qs = Object.values(grouped?.branches?.intersex || {}).flat();
                            if (qs.length === 0) return null;
                            const secKey = `intersex-all`;
                            return (
                              <SectionBlock
                                key={secKey}
                                section={{ name: "Intersex Perspectives", icon: Icons.Atom, desc: "" }}
                                questions={qs}
                                color={branch.color}
                                isExpanded={effectiveQuery ? true : expandedSections[secKey]}
                                onToggle={() => toggleSection(secKey)}
                                navigate={navigate}
                                staticOpen={true}
                              />
                            );
                          })()}
                          {!isObserver && !isTrans && branch.id !== "intersex" && branch.id !== "circumcised" && (() => {
                            const allQs = branch.sections.flatMap(secName => grouped?.branches?.[branch.id]?.[secName] || []);
                            if (allQs.length === 0) return null;
                            return allQs.map((q, i) => (
                              <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
                            ));
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
            </>
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
        activePathways={activePathways}
        hoveredPathway={hoveredPathway}
        onHoverChange={setHoveredPathway}
      />
      <MobileConnector color={C.gold} height={24} />

      {/* ═══ SYNTHESIS BLOCK ═══ */}
      <FlowNode
        nodeId="synthesis"
        title="SYNTHESIS"
        icon={Icons.Grid}
        color={synthesisColor}
        desc="All pathways reconvene"
        qCount={totalForPathway("synthesis")}
        nCount={501}
        isExpanded={expanded.synthesis}
        isHighlighted={isCircuitActive}
        onToggle={() => toggleNode("synthesis")}
        style={{ marginTop: 0, borderRadius: "0 0 12px 12px" }}
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
                staticOpen={true}
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

function FlowNode({ nodeId, title, icon: Icon, color, desc, qCount, nCount, isExpanded, isHovered: controlledIsHovered, isHighlighted, onHoverChange, onToggle, children, waiting, compact, style }) {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = controlledIsHovered !== undefined ? controlledIsHovered : localHovered;
  const active = isHighlighted !== undefined ? (isHighlighted || isHovered) : (isExpanded || isHovered);

  return (
    <div
      className="sf-card"
      onMouseEnter={() => {
        setLocalHovered(true);
        if (onHoverChange) onHoverChange(true);
      }}
      onMouseLeave={() => {
        setLocalHovered(false);
        if (onHoverChange) onHoverChange(false);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: active
          ? `linear-gradient(135deg, color-mix(in srgb, ${color}, transparent 75%) 0%, color-mix(in srgb, ${color}, transparent 85%) 100%)`
          : `linear-gradient(135deg, color-mix(in srgb, ${color}, transparent 75%) 0%, color-mix(in srgb, ${color}, transparent 85%) 100%)`,
        borderTop: compact ? "none" : `1px solid ${active ? color : `color-mix(in srgb, ${color}, transparent 70%)`}`,
        borderBottom: compact ? "none" : `1px solid ${active ? color : `color-mix(in srgb, ${color}, transparent 70%)`}`,
        borderLeft: compact
          ? `1px solid color-mix(in srgb, ${color}, transparent ${active ? "0%" : "50%"})`
          : `1px solid ${active ? color : `color-mix(in srgb, ${color}, transparent 70%)`}`,
        borderRight: compact
          ? `1px solid color-mix(in srgb, ${color}, transparent ${active ? "0%" : "50%"})`
          : `1px solid ${active ? color : `color-mix(in srgb, ${color}, transparent 70%)`}`,
        borderRadius: compact ? 0 : 12,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
        boxShadow: active ? `0 0 20px color-mix(in srgb, ${color}, transparent 85%)` : `none`,
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={children ? isExpanded : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onToggle) onToggle();
          }
        }}
        style={{
          display: "flex",
          flex: 1,
          flexDirection: compact ? "column" : "row",
          alignItems: compact ? "center" : "flex-start",
          textAlign: compact ? "center" : "left",
          gap: compact ? "0.5rem" : "0.6rem",
          cursor: "pointer",
          userSelect: "none",
          background: active ? color : "transparent",
          padding: compact ? "0.85rem 0.5rem" : "1.1rem 1.3rem",
          transition: "background 0.3s ease",
        }}
      >
        {Icon && (
          <div style={{ marginTop: compact ? 0 : "0.15rem", display: "flex", transition: "color 0.3s, fill 0.3s" }}>
            <Icon size={compact ? 20 : 24} color={active ? C.bg : color} fill={Icon === Icons.Circle ? (active ? C.bg : color) : "transparent"} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: compact ? "center" : "flex-start", gap: compact ? "0.4rem" : 0 }}>
          <div style={{
            display: "flex",
            flexDirection: compact ? "column" : "row",
            alignItems: "center",
            justifyContent: compact ? "center" : "flex-start",
            gap: compact ? "0.35rem" : "0.5rem",
            flexWrap: "wrap",
            minWidth: 0
          }}>
            <span style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: compact ? "0.85rem" : "0.95rem",
              color: active ? C.bg : C.textBright,
              letterSpacing: compact ? "0.01em" : "0.03em",
              textTransform: "uppercase",
              transition: "color 0.3s",
              lineHeight: 1.1,
              textAlign: compact ? "center" : "left",
            }}>{title}</span>

            {/* Pills Group */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap", justifyContent: compact ? "center" : "flex-start" }}>
              {/* Question count badge */}
              <span style={{
                fontFamily: FONT.mono,
                fontSize: "0.62rem",
                color: active ? C.bg : C.muted,
                background: active ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.05)",
                padding: "0.1rem 0.4rem",
                borderRadius: 999,
                border: `1px solid ${active ? "transparent" : C.ghost}`,
                transition: "color 0.3s, background 0.3s, border-color 0.3s"
              }}>{qCount}q</span>

              {/* Respondent count */}
              {nCount !== null && nCount !== undefined && (
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  color: active ? C.bg : (waiting ? C.dim : C.muted),
                  background: active ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.05)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 999,
                  border: `1px solid ${active ? "transparent" : (waiting ? C.ghost : `color-mix(in srgb, ${color}, transparent 75%)`)}`,
                  transition: "color 0.3s, background 0.3s, border-color 0.3s"
                }}>{waiting ? "n=0 ✦" : `n=${nCount}`}</span>
              )}

              {waiting && (
                <span style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.54rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: active ? "rgba(0,0,0,0.5)" : C.dim,
                  background: active ? "transparent" : "rgba(255,255,255,0.03)",
                  padding: "0.08rem 0.4rem",
                  borderRadius: 999,
                  border: `1px dashed ${active ? "rgba(0,0,0,0.3)" : C.ghost}`,
                  transition: "color 0.3s, background 0.3s, border-color 0.3s"
                }}>coming in phase 2</span>
              )}
            </div>
          </div>
          <div style={{
            fontFamily: FONT.body,
            fontSize: compact ? "0.72rem" : "0.8rem",
            color: active ? "rgba(0,0,0,0.7)" : C.dim,
            marginTop: "0.15rem",
            transition: "color 0.3s"
          }}>{desc}</div>
        </div>

        {/* Expand chevron */}
        {children && (
          <div style={{
            color: active ? C.bg : (isExpanded ? color : C.dim),
            fontSize: "0.75rem",
            transition: "transform 0.25s ease, color 0.3s ease",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</div>
        )}
      </div>

      {/* Expandable content */}
      {children && (
        <div style={{
          display: "grid",
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease-in-out",
        }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              padding: compact ? "0 0.85rem 0.85rem" : "0 1.3rem 1.3rem",
              paddingTop: isExpanded ? "0.7rem" : 0,
              borderTop: isExpanded ? `1px solid color-mix(in srgb, ${color}, transparent 85%)` : "1px solid transparent",
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
      )}
    </div>
  );
}

// ── ReligionPathways ─────────────────────────────────────────────────────────
// Custom side-by-side layout for Religion sub-pathways

function ReligionPathways({ section, questions, expandedSections, toggleSection, searchQuery, navigate }) {
  const isExpanded = searchQuery ? true : expandedSections[`universal-${section.name}`];
  
  // Group questions by subsection
  const subQs = {
    "General": [],
    "Christianity": [],
    "Judaism": [],
    "Islam": []
  };
  questions.forEach(q => {
    subQs[q.subsection || "General"].push(q);
  });

  const cards = [
    { id: "General", label: "General", icon: Icons.FileText, color: C.ltBlue },
    { id: "Christianity", label: "Christian", icon: Icons.Cross, color: PATH_COLORS.restoring },
    { id: "Judaism", label: "Jewish", icon: Icons.Star, color: PATH_COLORS.intact },
    { id: "Islam", label: "Muslim", icon: Icons.Moon, color: PATH_COLORS.circumcised }
  ];

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div 
        onClick={() => toggleSection(`universal-${section.name}`)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection(`universal-${section.name}`);
          }
        }}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
          padding: "0.5rem 0.6rem", background: isExpanded ? `color-mix(in srgb, ${C.ltBlue}, transparent 96%)` : "transparent",
          border: `1px solid ${isExpanded ? `color-mix(in srgb, ${C.ltBlue}, transparent 69%)` : C.ghost}`,
          borderRadius: 6, transition: "background 0.2s"
        }}
      >
        {section.icon && <section.icon size={16} color={isExpanded ? C.textBright : C.dim} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: "0.78rem",
            color: isExpanded ? C.textBright : C.text,
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
        <div style={{
          color: isExpanded ? C.gold : C.dim,
          fontSize: "0.75rem",
          transition: "transform 0.25s ease, color 0.25s ease",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          ▼
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateRows: isExpanded ? "1fr" : "0fr",
        transition: "grid-template-rows 0.25s ease-in-out",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "0.8rem 0", display: "flex", flexDirection: "column", gap: 0 }}>
            
            {/* The Side-by-Side Cards */}
            <div className="flowchart-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", margin: 0, position: "relative", zIndex: 1 }}>
              {cards.map(c => {
                const qs = subQs[c.id];
                if (qs.length === 0) return null;
                const isSubExpanded = searchQuery ? true : expandedSections[`religion-${c.id}`];
                return (
                  <FlowNode
                    key={c.id}
                    nodeId={`religion-${c.id}`}
                    title={c.label}
                    icon={c.icon}
                    color={c.color}
                    desc=""
                    qCount={qs.length}
                    isExpanded={isSubExpanded}
                    onToggle={() => toggleSection(`religion-${c.id}`)}
                    compact
                  />
                );
              })}
            </div>

            {/* Expanded Content for Religion Sub-pathways */}
            {cards.map(c => {
              const qs = subQs[c.id];
              const isSubExpanded = searchQuery ? true : expandedSections[`religion-${c.id}`];
              if (!isSubExpanded || qs.length === 0) return null;
              
              return (
                <div key={`expanded-${c.id}`} style={{
                  position: "relative",
                  zIndex: 2,
                  marginTop: "-2px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  border: `2px solid ${c.color}`,
                  borderRadius: c.id === "General" ? "0 12px 12px 12px" : c.id === "Islam" ? "12px 0 12px 12px" : 12,
                  padding: "1.2rem",
                  boxShadow: `0 0 20px color-mix(in srgb, ${c.color}, transparent 92%), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}>
                  <div style={{
                     fontFamily: FONT.display, fontWeight: 700, color: c.color, marginBottom: "1rem", 
                     textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    {c.icon && <c.icon size={18} color={c.color} />}
                    {c.label} Questions
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}>
                    {qs.map((q, i) => (
                      <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
                    ))}
                  </div>
                </div>
              );
            })}
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
      border: `1px solid ${showExpanded ? `color-mix(in srgb, ${color}, transparent 69%)` : C.ghost}`,
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={staticOpen ? undefined : onToggle}
        role={staticOpen ? undefined : "button"}
        tabIndex={staticOpen ? undefined : 0}
        aria-expanded={showExpanded}
        onKeyDown={(e) => {
          if (!staticOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            if (onToggle) onToggle();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.6rem",
          background: showExpanded ? `color-mix(in srgb, ${color}, transparent 96%)` : "transparent",
          cursor: staticOpen ? "default" : "pointer",
          userSelect: "none",
          transition: "background 0.2s",
        }}
      >
        {section.icon && <section.icon size={16} color={showExpanded ? C.textBright : C.dim} />}
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
            borderTop: showExpanded ? `1px solid color-mix(in srgb, ${color}, transparent 90%)` : "1px solid transparent",
            background: "rgba(0,0,0,0.22)",
            padding: showExpanded ? "0.8rem 0.6rem" : "0 0.6rem",
            maxHeight: 500,
            overflowY: "auto",
            opacity: showExpanded ? 1 : 0,
            transition: "all 0.25s ease-in-out",
            pointerEvents: showExpanded ? "auto" : "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem"
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
  const { isQuestionInReport, toggleInReport } = useReport();
  const isInReport = isQuestionInReport(q.id);
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={(e) => { setIsHovered(true); e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { setIsHovered(false); e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"; }}
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

          {/* See Responses button — only on hover */}
          {isHovered && (
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
          )}
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

function VerticalConnector({ branches, activePathways, hoveredPathway, onHoverChange, getFlowInfo, height = 48 }) {
  const svgW = 1200;
  const trunkW = 160;
  const trunkLeft = (svgW - trunkW) / 2;

  const flows = branches.map((b, i) => {
    const info = getFlowInfo(b);
    return {
      id: b.id,
      color: b.color,
      n: info.n,
      weight: Math.max(15, info.n),
      i,
    };
  });
  const totalWeight = flows.reduce((s, f) => s + f.weight, 0);

  let currentX = trunkLeft;
  
  return (
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible" }}>
      <svg aria-hidden="true" role="presentation" viewBox={`0 0 ${svgW} ${height}`} style={{ width: "100%", height, overflow: "visible", display: "block" }}>
        <defs>
          {flows.map(f => (
            <linearGradient id={`grad-vert-${f.id}`} x1="0" y1="0" x2="0" y2="1" key={f.id}>
              <stop offset="0%" stopColor={C.ltBlue} />
              <stop offset="100%" stopColor={f.color} />
            </linearGradient>
          ))}
        </defs>
        {flows.map((f) => {
          const w = (f.weight / totalWeight) * trunkW;
          const x = currentX;
          currentX += w;
          
          const isDormant = f.n === 0;
          const isActive = (activePathways && activePathways.some(p => p.id === f.id)) || hoveredPathway === f.id;
          const fill = `url(#grad-vert-${f.id})`;
          const opacity = isActive ? 0.85 : (isDormant ? 0.1 : 0.25);

          return (
            <rect
              key={f.id}
              x={x}
              y={0}
              width={w}
              height={height}
              fill={fill}
              opacity={opacity}
              stroke="none"
              style={{ transition: "opacity 0.25s, fill 0.25s", cursor: "pointer" }}
              strokeDasharray={isDormant ? "4,3" : "none"}
              onMouseEnter={() => onHoverChange && onHoverChange(f.id)}
              onMouseLeave={() => onHoverChange && onHoverChange(null)}
            />
          );
        })}
      </svg>
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
        background: color,
        opacity: 0.3,
      }} />
    </div>
  );
}

// ── BranchConnectors ─────────────────────────────────────────────────────────
// Vertical Sankey ribbons fanning out from the fork to each pathway card

// ── UniversalForkConnector ───────────────────────────────────────────────────
// Unified Sankey funnel from Universal Questions → each pathway card.
// Mirrors MergeConnectors but fanning out (top = trunk, bottom = cards).

function UniversalForkConnector({ branches, onHover, onMove, onLeave, getFlowInfo, activePathways, hoveredPathway, onHoverChange, searchActive }) {
  const svgW = 1200;
  const svgH = 220;

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

  // The trunk at top spans the full SVG width (flush with the Universal block)
  const trunkW = svgW;
  // Hourglass band — the cinch point
  const bandW = 180;
  const bandLeft = (svgW - bandW) / 2;
  const bandTop = 50;  // start of hourglass band
  const bandBot = 100; // end of hourglass band

  let currentXBandTop = bandLeft;
  let currentXBandBot = bandLeft;
  let currentXTop = 0;

  return (
    <div style={{ position: "relative", overflow: "visible", marginTop: "-1px", marginBottom: 0 }}>
      {/* Instruction text over the hourglass band */}
      <div style={{
        position: "absolute",
        top: 65,
        left: 0,
        right: 0,
        zIndex: 2,
        pointerEvents: "none",
        textAlign: "center",
        padding: "0 1rem",
        fontFamily: FONT.body,
        fontSize: "0.82rem",
        color: C.dim,
        lineHeight: 1.5,
        maxWidth: 640,
        margin: "0 auto",
        letterSpacing: "0.01em",
      }}>
        <p style={{ margin: "0 0 0.4rem", color: "rgba(0,0,0,0.75)", fontWeight: 500, textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
          From here the survey forks into <strong style={{ color: "rgba(0,0,0,0.9)", fontWeight: 700 }}>six distinct pathways</strong> based on each respondent's circumcision status.
        </p>
        <p style={{ margin: 0, color: "rgba(0,0,0,0.65)", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
          Click any pathway below to explore its questions, or select multiple to compare side by side.
        </p>
      </div>

      {/* SVG Sankey funnel with hourglass */}
      <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible", position: "relative", zIndex: 1 }}>
        <svg aria-hidden="true" role="presentation" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: "100%", height: svgH, overflow: "visible", display: "block" }}>
          <defs>
            {flows.map(f => (
              <linearGradient id={`grad-fork-${f.id}`} x1="0" y1="0" x2="0" y2="1" key={f.id}>
                <stop offset="0%" stopColor={C.ltBlue} />
                <stop offset="40%" stopColor={f.color} />
                <stop offset="100%" stopColor={f.color} />
              </linearGradient>
            ))}
          </defs>
          {flows.map((f) => {
            // Top edge: full-width proportional slice
            const wTop = (f.weight / totalWeight) * trunkW;
            const topL = currentXTop;
            const topR = currentXTop + wTop;
            currentXTop += wTop;

            // Hourglass band: cinched proportional slice
            const wBand = (f.weight / totalWeight) * bandW;
            const bandL = currentXBandTop;
            const bandR = currentXBandTop + wBand;
            currentXBandTop += wBand;

            // Bottom edge: evenly divided across 6 card slots
            const cardW = svgW / 6;
            const botL = f.i * cardW;
            const botR = botL + cardW;

            // Control points for smooth S-curves
            const cp1Y = bandTop * 0.35;
            const cp2Y = bandTop * 0.65;
            const cp3Y = bandBot + (svgH - bandBot) * 0.4;
            const cp4Y = svgH - (svgH - bandBot) * 0.25;

            const d = `
              M ${topL} 0
              C ${topL} ${cp1Y}, ${bandL} ${cp2Y}, ${bandL} ${bandTop}
              L ${bandL} ${bandBot}
              C ${bandL} ${cp3Y}, ${botL} ${cp4Y}, ${botL} ${svgH}
              L ${botR} ${svgH}
              C ${botR} ${cp4Y}, ${bandR} ${cp3Y}, ${bandR} ${bandBot}
              L ${bandR} ${bandTop}
              C ${bandR} ${cp2Y}, ${topR} ${cp1Y}, ${topR} 0
              Z
            `;

            const isDormant = f.n === 0;
            const isMatch = searchActive && activePathways && activePathways.some(p => p.id === f.id);
            const isActive = (activePathways && activePathways.some(p => p.id === f.id)) || hoveredPathway === f.id;
            const fill = `url(#grad-fork-${f.id})`;
            const opacity = searchActive
              ? (isMatch ? 0.95 : 0.06)
              : (isActive ? 0.9 : (isDormant ? 0.12 : 0.45));

            // Center spine for search animation
            const topC = (topL + topR) / 2;
            const bandC = (bandL + bandR) / 2;
            const botC = (botL + botR) / 2;
            const spineD = `
              M ${topC} 0 
              C ${topC} ${cp1Y}, ${bandC} ${cp2Y}, ${bandC} ${bandTop}
              L ${bandC} ${bandBot}
              C ${bandC} ${cp3Y}, ${botC} ${cp4Y}, ${botC} ${svgH}
            `;

            return (
              <g key={f.id}>
                <path
                  d={d}
                  fill={fill}
                  opacity={opacity}
                  stroke={C.gold}
                  strokeWidth={0.5}
                  strokeOpacity={0.25}
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.25s, fill 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    if (onHoverChange) onHoverChange(f.id);
                    onHover(
                      e,
                      `<strong>${f.label} Pathway</strong><br/>` +
                      `Questions: ${f.qCount}<br/>` +
                      `Respondents: ${isDormant ? "0 (Coming in Phase 2)" : `n = ${f.n}`}`
                    );
                  }}
                  onMouseMove={onMove}
                  onMouseLeave={(e) => {
                    if (onHoverChange) onHoverChange(null);
                    onLeave();
                  }}
                  strokeDasharray={isDormant ? "4,3" : "none"}
                />
                {isMatch && (
                  <path
                    d={spineD}
                    fill="none"
                    stroke={f.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray="6 10"
                    className="sf-flow-anim"
                    opacity={0.9}
                    style={{
                      filter: `drop-shadow(0 0 6px ${f.color})`,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function BranchConnectors({ branches, onHover, onMove, onLeave, getFlowInfo, activePathways, hoveredPathway, onHoverChange }) {
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
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible", marginBottom: 0, position: "relative", zIndex: 0 }}>
      <svg aria-hidden="true" role="presentation" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: "100%", height: svgH, overflow: "visible", display: "block" }}>
        {flows.map((f) => {
          const w = (f.weight / totalWeight) * trunkW;
          const topL = currentX;
          const topR = currentX + w;
          currentX += w;

          const cardW = svgW / 6;
          const botL = f.i * cardW;
          const botR = botL + cardW;

          const cpY = svgH * 0.55;

          const d = `
            M ${topL} 0
            C ${topL} ${cpY}, ${botL} ${svgH - cpY}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${svgH - cpY}, ${topR} ${cpY}, ${topR} 0
            Z
          `;

          const isDormant = f.n === 0;
          const isActive = (activePathways && activePathways.some(p => p.id === f.id)) || hoveredPathway === f.id;
          const fill = f.color;
          const opacity = isActive ? 0.9 : (isDormant ? 0.12 : 0.45);

          return (
            <g key={f.id}>
              <path
                d={d}
                fill={fill}
                opacity={opacity}
                stroke={C.gold}
                strokeWidth={0.5}
                strokeOpacity={0.25}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.25s, fill 0.25s",
                }}
                onMouseEnter={(e) => {
                  if (onHoverChange) onHoverChange(f.id);
                  onHover(
                    e,
                    `<strong>${f.label} Pathway</strong><br/>` +
                    `Questions: ${f.qCount}<br/>` +
                    `Respondents: ${isDormant ? "0 (Coming in Phase 2)" : `n = ${f.n}`}`
                  );
                }}
                onMouseMove={onMove}
                onMouseLeave={(e) => {
                  if (onHoverChange) onHoverChange(null);
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

function MergeConnectors({ branches, onHover, onMove, onLeave, getFlowInfo, activePathways, hoveredPathway, onHoverChange }) {
  const svgW = 1200;
  const svgH = 80;

  const isExpandedMode = activePathways && activePathways.length > 0;
  const activeSet = isExpandedMode ? activePathways : branches;

  const flows = activeSet.map((b) => {
    const origIndex = branches.findIndex(br => br.id === b.id);
    const info = getFlowInfo(b);
    return {
      id: b.id,
      label: b.label,
      color: b.color,
      n: info.n,
      qCount: info.qCount,
      weight: Math.max(15, info.n),
      origIndex,
    };
  });

  const totalWeight = flows.reduce((s, f) => s + f.weight, 0);

  const trunkW = 160;
  const trunkLeft = (svgW - trunkW) / 2;

  let currentX = trunkLeft;

  return (
    <div className="flowchart-connectors" style={{ justifyContent: "center", overflow: "visible", marginTop: 0, marginBottom: "-1px", position: "relative", zIndex: 0 }}>
      <svg aria-hidden="true" role="presentation" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: "100%", height: svgH, overflow: "visible", display: "block" }}>
        <defs>
          {flows.map(f => (
            <linearGradient id={`grad-merge-${f.id}`} x1="0" y1="0" x2="0" y2="1" key={f.id}>
              <stop offset="0%" stopColor={f.color} />
              <stop offset="100%" stopColor={C.gold} />
            </linearGradient>
          ))}
        </defs>
        {flows.map((f, j) => {
          const w = (f.weight / totalWeight) * trunkW;
          const botL = currentX;
          const botR = currentX + w;
          currentX += w;

          let topL, topR;
          if (isExpandedMode) {
            const k = activeSet.length;
            const boxGap = 16;
            const boxW = (svgW - (k - 1) * boxGap) / k;
            topL = j * (boxW + boxGap);
            topR = topL + boxW;
          } else {
            const cardW = svgW / 6;
            topL = f.origIndex * cardW;
            topR = topL + cardW;
          }

          const cpY = svgH * 0.55;

          const d = `
            M ${topL} 0
            C ${topL} ${cpY}, ${botL} ${svgH - cpY}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${svgH - cpY}, ${topR} ${cpY}, ${topR} 0
            Z
          `;

          const isDormant = f.n === 0;
          const isActive = (activePathways && activePathways.some(p => p.id === f.id)) || hoveredPathway === f.id;
          const fill = `url(#grad-merge-${f.id})`;
          const opacity = isActive ? 0.9 : (isDormant ? 0.12 : 0.45);

          return (
            <g key={f.id}>
              <path
                d={d}
                fill={fill}
                opacity={opacity}
                stroke={C.gold}
                strokeWidth={0.5}
                strokeOpacity={0.25}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.25s, fill 0.25s",
                }}
                onMouseEnter={(e) => {
                  if (onHoverChange) onHoverChange(f.id);
                  onHover(
                    e,
                    `<strong>${f.label} Pathway (Reconvening)</strong><br/>` +
                    `Questions: ${f.qCount}<br/>` +
                    `Respondents: ${isDormant ? "0 (Coming in Phase 2)" : `n = ${f.n}`}`
                  );
                }}
                onMouseMove={onMove}
                onMouseLeave={(e) => {
                  if (onHoverChange) onHoverChange(null);
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
        <Icons.Users size={24} color={selectedRoleId === "universal" ? PATH_COLORS.observer : C.dim} />
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
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedRoleId(role.id);
                }
              }}
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
                {(() => {
                  const Icon = Icons[role.icon];
                  return Icon ? <Icon size={18} color={isSelected ? PATH_COLORS.observer : C.dim} /> : null;
                })()}
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
        <Icons.Users size={24} color={selectedRoleId === "universal" ? PATH_COLORS.circumcised : C.dim} />
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
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedRoleId(role.id);
                }
              }}
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
                {(() => {
                  const Icon = Icons[role.icon];
                  return Icon ? <Icon size={18} color={isSelected ? PATH_COLORS.circumcised : C.dim} /> : null;
                })()}
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
            {(() => {
              const Icon = activeRole.id === "universal" ? Icons.Users : Icons[activeRole.icon];
              return Icon ? <Icon size={18} color={PATH_COLORS.circumcised} /> : null;
            })()}
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

// ── TransSubRoles ────────────────────────────────────────────────────────────
// Sub-role selector for the Trans pathway (Universal, Post-Vaginoplasty, Post-Phalloplasty)

function TransSubRoles({ questions, navigate, isSingleColumn }) {
  const [selectedRoleId, setSelectedRoleId] = useState("vaginoplasty");

  const transQuestions = useMemo(() =>
    questions.filter((q) => q.pathway === "trans"),
    [questions]
  );

  const activeRole = TRANS_SUBROLES.find((r) => r.id === selectedRoleId);
  const activeRoleQs = useMemo(() => {
    return transQuestions.filter((q) =>
      transSubrolesForQuestion(q).includes(selectedRoleId)
    ).sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
  }, [transQuestions, selectedRoleId]);

  const transColor = PATH_COLORS.trans_vaginoplasty;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.8rem",
      gridColumn: "1 / -1"
    }}>

      {/* Sub-role selector tabs */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}>
        {TRANS_SUBROLES.map((role) => {
          const isSelected = selectedRoleId === role.id;
          const roleQs = transQuestions.filter((q) =>
            transSubrolesForQuestion(q).includes(role.id)
          );
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              style={{
                flex: 1,
                minWidth: 120,
                borderRadius: 8,
                border: `1px solid ${isSelected ? transColor : C.ghost}`,
                background: isSelected ? `color-mix(in srgb, ${transColor}, transparent 85%)` : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                padding: "0.6rem 0.8rem",
                userSelect: "none",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? `0 0 12px color-mix(in srgb, ${transColor}, transparent 75%)` : "none",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${transColor}, transparent 50%)`;
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: FONT.display,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: isSelected ? transColor : C.muted,
                  transition: "color 0.2s",
                }}>{role.label}</span>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.55rem",
                  color: isSelected ? transColor : C.dim,
                  background: "rgba(255,255,255,0.05)",
                  padding: "0.05rem 0.3rem",
                  borderRadius: 999,
                  border: `1px solid ${C.ghost}`,
                }}>{roleQs.length}q</span>
              </div>
              <div style={{
                fontFamily: FONT.body,
                fontSize: "0.68rem",
                color: C.dim,
                marginTop: "0.2rem",
              }}>{role.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Questions for selected sub-role */}
      {activeRoleQs.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: isSingleColumn ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "0.85rem",
        }}>
          {activeRoleQs.map((q, i) => (
            <QuestionRow key={q.id} q={q} index={i} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          color: C.dim,
          fontFamily: FONT.body,
          fontSize: "0.82rem",
          border: `1px dashed color-mix(in srgb, ${transColor}, transparent 60%)`,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: "1.2rem" }}>🏳️‍⚧️</span>
          <div style={{ marginTop: "0.5rem" }}>
            <strong style={{ color: C.muted }}>Coming in Phase 2</strong>
          </div>
          <div style={{ marginTop: "0.3rem", fontSize: "0.75rem" }}>
            This pathway is structured and ready — awaiting voices from Phase 2 outreach
          </div>
        </div>
      )}
    </div>
  );
}

// ── ExpandedConnectors ───────────────────────────────────────────────────────
// Sankey ribbons that flow from the bottom of selected pathway cards down 
// and outward to the top of the expanded questions box grid.

function ExpandedConnectors({ branches, activePathways, svgW = 1200, svgH = 50 }) {
  if (!activePathways || activePathways.length === 0) return null;

  const cardW = svgW / 6;
  const gap = 0;

  const k = activePathways.length;
  const boxGap = 16; // 1rem
  const boxW = (svgW - (k - 1) * boxGap) / k;

  return (
    <div style={{
      gridColumn: "1 / -1",
      height: svgH,
      width: "100%",
      marginTop: 0,
      marginBottom: 0,
      display: "flex",
      justifyContent: "center",
      overflow: "visible",
      position: "relative",
      zIndex: 0,
    }}>
      <svg aria-hidden="true" role="presentation" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: "100%", height: svgH, overflow: "visible", display: "block" }}>
        {activePathways.map((branch, j) => {
          // Top coordinates (from the bottom of the card)
          const i = branches.findIndex(b => b.id === branch.id);
          const topL = i * (cardW + gap);
          const topR = topL + cardW;

          // Bottom coordinates (to the top of the expanded box)
          const botL = j * (boxW + boxGap);
          const botR = botL + boxW;

          const cpY = svgH * 0.5;

          const d = `
            M ${topL} 0
            C ${topL} ${cpY}, ${botL} ${svgH - cpY}, ${botL} ${svgH}
            L ${botR} ${svgH}
            C ${botR} ${svgH - cpY}, ${topR} ${cpY}, ${topR} 0
            Z
          `;

          return (
            <g key={branch.id}>
              <path
                d={d}
                fill={branch.color}
                opacity={0.85}
              />
              {/* Subtle edge highlight */}
              <path
                d={d}
                fill="transparent"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={0.5}
                style={{ pointerEvents: "none" }}
              />
              {/* Waypoint glowing node at bottom */}
              <circle
                cx={botL + boxW / 2}
                cy={svgH}
                r={4}
                fill={branch.color}
                opacity={0.8}
                style={{ boxShadow: `0 0 8px ${branch.color}` }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
