// ═══════════════════════════════════════════════════════════════════════════
// IndexPage — the Master Index, two-panel layout
// Left: SurveyMapNav + DemographicFilterBar (sticky sidebar)
// Right: question list grouped by section, with search + relevance toggle
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { C, FONT, RAINBOW, resolveCssColor } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS, SURVEY_PHASES, isQuestionRelevant, phaseForQuestion, observerSubrolesForQuestion } from "../lib/pathways";
import { getQuestions, getResponseDistribution } from "../lib/api";
import SurveyMapNav from "../components/SurveyMapNav";
import DemographicFilterBar from "../components/DemographicFilterBar";
import PathwayChips from "../components/PathwayChips";
import RelevanceToggle from "../components/RelevanceToggle";
import QuestionRow from "../components/QuestionRow";
import CopilotChat from "../components/CopilotChat";
import ThemeToggle from "../components/ThemeToggle";
import HarmonicCanvas from "../../components/HarmonicCanvas";

const EXHIBITS = [
  { id: "pairs", num: "01", title: "Mirror Pairs", emoji: "⚖️", desc: "Compare parallel question responses across Intact and Circumcised cohorts side-by-side.", link: "#/pairs", colorVar: "var(--c-gold)" },
  { id: "pleasure", num: "02", title: "The Pleasure Gap", emoji: "⚖️", desc: "Clustered ratings comparing sensation, sensitivity, and orgasms across cohorts.", link: "#/pleasure-gap", colorVar: "var(--c-red)" },
  { id: "alignment", num: "03", title: "Cultural Alignment", emoji: "📊", desc: "Dynamic heatmap exploring how personal pathways align with or defy cultural norms.", link: "#/tools/cultural-alignment", colorVar: "var(--c-blue)" },
  { id: "demographics", num: "04", title: "Demographics", emoji: "📊", desc: "Explore the age, sexuality, generation, education, and geography profile of respondents.", link: "#/demographics", colorVar: "var(--c-ltBlue)" },
  { id: "narrative", num: "05", title: "Narrative Mirrors", emoji: "📜", desc: "Side-by-side Word Clouds and text search for open-ended narratives across cohorts.", link: "#/narrative-mirrors", colorVar: "var(--c-green)" },
  { id: "generational", num: "06", title: "Generational Faultlines", emoji: "⏳", desc: "Chronological attitude tracking from the Silent Generation down to Gen Z.", link: "#/generational-faultlines", colorVar: "var(--c-orange)" },
  { id: "observer", num: "07", title: "The Observer Triad", emoji: "👁️", desc: "Analyze perspectives of partners, parents, and medical professionals.", link: "#/observer-triad", colorVar: "var(--c-purple)" },
  { id: "religion", num: "08", title: "Religious Mirrors", emoji: "⚖️", desc: "Compare Jewish, Christian, and Islamic attitudes and norms on circumcision.", link: "#/religious-mirrors", colorVar: "var(--c-gold)" }
];

export default function IndexPage({ routerState, navigate, updateState }) {
  const { pathway, view, search, section, cohort, observerRole, format } = routerState;
  const hasPathway = pathway && (Array.isArray(pathway) ? pathway.length > 0 : true);

  // ── Data fetch ──────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getQuestions({ counts: true })
      .then((data) => {
        if (cancelled) return;
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || String(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Distributions (lazy-loaded per visible question) ───────────────────
  const [distributions, setDistributions] = useState({});
  const [cohortDistributions, setCohortDistributions] = useState({});
  const fetchedIds = useRef(new Set());
  const fetchedCohortKeys = useRef(new Set());

  // Reset cohort cache when cohort changes
  useEffect(() => {
    fetchedCohortKeys.current = new Set();
    setCohortDistributions({});
  }, [JSON.stringify(cohort)]);

  const loadDistribution = useCallback((qid) => {
    if (fetchedIds.current.has(qid)) return;
    fetchedIds.current.add(qid);
    getResponseDistribution(qid).then((data) => {
      setDistributions((prev) => ({ ...prev, [qid]: data.distribution || [] }));
    }).catch(() => {});
  }, []);

  const loadCohortDistribution = useCallback((qid) => {
    if (!cohort) return;
    const key = `${qid}|${JSON.stringify(cohort)}`;
    if (fetchedCohortKeys.current.has(key)) return;
    fetchedCohortKeys.current.add(key);
    getResponseDistribution(qid, { cohort }).then((data) => {
      setCohortDistributions((prev) => ({ ...prev, [qid]: data.distribution || [] }));
    }).catch(() => {});
  }, [cohort]);

  // ── Filter + group questions ────────────────────────────────────────────
  const filteredGrouped = useMemo(() => {
    if (!questions) return null;

    // 1. Apply section filter (if selected) and exclude mechanical/meta questions
    const EXCLUDED_IDS = [
      "q347",
      "observe_healthcare_stance_rec_against",
      "observe_healthcare_stance_lean_against",
      "observe_healthcare_stance_neutral",
      "observe_healthcare_stance_lean_for",
      "observe_healthcare_stance_rec_for",
      "observe_healthcare_stance_avoid"
    ];
    let filtered = questions.filter(q => 
      !EXCLUDED_IDS.includes(q.id) && 
      !q.id.startsWith("meta_") &&
      q.section !== "Follow-up"
    );
    if (section) {
      filtered = filtered.filter((q) => q.section === section);
    }

    // 2. Apply relevance + pathway filter
    filtered = filtered.filter((q) => isQuestionRelevant(q, pathway, view));

    // 3. Apply observer sub-role filter (only meaningful if pathway includes observer)
    const hasObserverSelected = Array.isArray(pathway) ? pathway.includes("observer") : pathway === "observer";
    if (hasObserverSelected && observerRole && observerRole !== "universal") {
      filtered = filtered.filter((q) => {
        const roles = observerSubrolesForQuestion(q);
        return roles.includes(observerRole);
      });
    }

    // 4. Apply search
    if (search && search.length >= 2) {
      const needle = search.toLowerCase();
      filtered = filtered.filter((q) =>
        (q.prompt || "").toLowerCase().includes(needle) ||
        (q.id || "").toLowerCase().includes(needle)
      );
    }

    // 5. Apply format filter
    if (format) {
      if (format === "open_text") {
        filtered = filtered.filter(q => q.type === "open_text");
      } else if (format === "multiple_choice") {
        filtered = filtered.filter(q => q.type !== "open_text");
      }
    }

    // 6. Group by phase → section (in survey order)
    const groups = [];
    const phaseOrder = ["universal", "branches", "synthesis"];
    for (const phaseId of phaseOrder) {
      const phaseQs = filtered.filter((q) => phaseForQuestion(q) === phaseId);
      if (phaseQs.length === 0) continue;

      // Sub-group by section, preserving col_idx order within each section
      const sectionMap = new Map();
      for (const q of phaseQs) {
        const secName = q.section || "Uncategorized";
        if (!sectionMap.has(secName)) sectionMap.set(secName, []);
        sectionMap.get(secName).push(q);
      }

      // Preserve section order: follow SURVEY_PHASES where defined, else fall back to first-appearance
      const phase = SURVEY_PHASES.find((p) => p.id === phaseId);
      let sectionOrder;
      if (phase && phase.sections) {
        sectionOrder = phase.sections.map((s) => s.name).filter((name) => sectionMap.has(name));
        // Append any sections not in the canonical list (appears in D1 but not listed)
        for (const secName of sectionMap.keys()) {
          if (!sectionOrder.includes(secName)) sectionOrder.push(secName);
        }
      } else {
        sectionOrder = [...sectionMap.keys()];
      }

      for (const secName of sectionOrder) {
        const secQs = sectionMap.get(secName);
        if (!secQs || secQs.length === 0) continue;
        // Sort by col_idx within section
        secQs.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));
        groups.push({
          phase: phaseId,
          section: secName,
          questions: secQs,
        });
      }
    }

    return groups;
  }, [questions, pathway, view, search, section, observerRole, format]);

  // ── IntersectionObserver for lazy distribution loading ─────────────────
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const qid = e.target.getAttribute("data-qid");
            if (qid) {
              loadDistribution(qid);
              if (cohort) loadCohortDistribution(qid);
            }
          }
        }
      },
      { rootMargin: "200px" }
    );
    // Attach to all question rows (they have data-qid)
    document.querySelectorAll("[data-qid]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filteredGrouped, loadDistribution, loadCohortDistribution, cohort]);

  // ── Totals for masthead ─────────────────────────────────────────────────
  const totalVisible = filteredGrouped ? filteredGrouped.reduce((s, g) => s + g.questions.length, 0) : 0;
  const totalAll = questions ? questions.length : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
    }}>
      <Masthead />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.1rem 3rem" }}>

        {/* Relocated controls moved into the center panel main column */}

        {/* Interactive Exhibits Grid */}
        {(!hasPathway && !section && !search && !cohort && !observerRole) && (
          <div style={{ marginBottom: "1.2rem", marginTop: "0.4rem" }}>
            <div style={{
              fontFamily: FONT.condensed,
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.goldBright,
              fontWeight: 700,
              marginBottom: "0.6rem",
              paddingLeft: "0.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span style={{ color: "var(--c-red)" }}>★</span> Interactive Exhibits &amp; Tools
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "0.5rem"
            }}>
              {EXHIBITS.map(ex => {
                const accentColor = resolveCssColor(ex.colorVar);
                return (
                  <a
                    key={ex.id}
                    href={ex.link}
                    className="exhibit-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      background: C.bgCard,
                      border: `1px solid ${C.ghost}`,
                      borderLeft: `3px solid ${accentColor}`,
                      borderRadius: 6,
                      padding: "0.5rem 0.75rem",
                      textDecoration: "none",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.4), inset 0 0 6px ${accentColor}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = C.ghost;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", display: "inline-flex", alignItems: "center" }}>{ex.emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: FONT.display,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: C.textBright,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {ex.title}
                      </h3>
                      <span style={{ fontFamily: FONT.mono, fontSize: "0.55rem", color: C.muted, marginTop: "0.05rem" }}>
                        EXHIBIT {ex.num}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Three-panel grid */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 340px",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: Survey map + demographic filter */}
          <aside
            className="explore-nav"
            style={{
              position: "sticky",
              top: "5rem",
              maxHeight: "calc(100vh - 6.5rem)",
              overflowY: "auto",
              paddingRight: "0.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
              transition: "top 0.3s ease, maxHeight 0.3s ease",
            }}
          >
            <SurveyMapNav
              selectedPathway={pathway}
              onSelectPathway={(id) => updateState({ pathway: id, section: null, observerRole: null })}
              selectedSection={section}
              onSelectSection={(s) => updateState({ section: s })}
              selectedObserverRole={observerRole}
              onSelectObserverRole={(r) => updateState({ observerRole: r })}
            />

            <DemographicFilterBar
              cohort={cohort}
              onChange={(c) => updateState({ cohort: c })}
            />

            {/* Tools Section */}
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.68rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.goldBright,
                fontWeight: 700,
                marginBottom: "0.6rem",
                paddingLeft: "0.2rem"
              }}>Tools</div>

              <a
                href="#/pairs"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.5rem",
                }}
              >
                ⚖️ Mirror Pairs View →
              </a>

              <a
                href="#/demographics"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                📊 Demographics Dashboard →
              </a>

              <a
                href="#/religious-mirrors"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                ⚖️ Religious Mirrors View →
              </a>

              <a
                href="#/narrative-mirrors"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                📜 Narrative Mirrors View →
              </a>

              <a
                href="#/generational-faultlines"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                ⏳ Generational Faultlines →
              </a>

              <a
                href="#/observer-triad"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 6,
                  color: C.textBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                👁️ The Observer Triad →
              </a>

              <a
                href="#/tools/cultural-alignment"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(91,147,199,0.08)",
                  border: `1px solid rgba(91,147,199,0.25)`,
                  borderRadius: 6,
                  color: C.blue,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                📊 Cultural Alignment Matrix →
              </a>

              <a
                href="#/pleasure-gap"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(217,79,79,0.08)",
                  border: `1px solid rgba(217,79,79,0.25)`,
                  borderRadius: 6,
                  color: C.red,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  marginBottom: "0.8rem",
                }}
              >
                ⚖️ The Pleasure Gap Matrix →
              </a>

              {/* Link to Pathway Map page */}
              <a
                href="#/pathways"
                style={{
                  display: "block",
                  padding: "0.55rem 0.7rem",
                  background: "rgba(212,160,48,0.08)",
                  border: `1px solid rgba(212,160,48,0.25)`,
                  borderRadius: 6,
                  color: C.goldBright,
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                🗺 View Full Pathway Map →
              </a>
            </div>
          </aside>

          {/* CENTER: question list */}
          <main>
            {/* Relocated Controls Block */}
            <div style={{
              background: C.bgCard,
              border: `1px solid ${C.ghost}`,
              borderRadius: 8,
              padding: "0.6rem 0.8rem",
              marginBottom: "0.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}>
              {/* Pathway Selector Dropdown */}
              <PathwayDropdown
                selected={pathway}
                onChange={(next) => updateState({ pathway: next, section: null, observerRole: null })}
              />

              {/* Search and Filters row */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.6rem",
              }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <SearchBox value={search || ""} onChange={(s) => updateState({ search: s })} />
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                  <FormatToggle mode={format} onChange={(m) => updateState({ format: m })} />
                  <RelevanceToggle mode={view} onChange={(m) => updateState({ view: m })} />
                </div>
              </div>
            </div>

            {/* Instructive Guidance Banner */}
            {(!hasPathway && !section && !search && !cohort && !observerRole) && (
              <div style={{
                background: `linear-gradient(135deg, rgba(212,160,48,0.08) 0%, rgba(212,160,48,0.02) 100%)`,
                border: `1px solid rgba(212,160,48,0.25)`,
                borderRadius: 8,
                padding: "0.5rem 0.8rem",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem"
              }}>
                <span style={{ fontSize: "1rem", marginTop: "-0.05rem" }}>💡</span>
                <div style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: C.textBright, lineHeight: 1.45 }}>
                  <strong style={{ color: C.goldBright, fontFamily: FONT.condensed, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.4rem" }}>How to explore:</strong> 
                  Use the <strong>Cohort / Pathway</strong> dropdown above to isolate respondents (multiple selections allowed). Combine <strong>Map Navigation</strong> (which questions) and <strong>Cohort Filter</strong> (whose responses) on the left — they work in tandem to dynamically update all chart data.
                </div>
              </div>
            )}

            {/* Status strip */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              padding: "0.35rem 0.5rem 0.9rem",
              borderBottom: `1px dashed ${C.ghost}`,
              marginBottom: "0.9rem",
              flexWrap: "wrap",
            }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.muted,
              }}>
                <span style={{ color: C.goldBright, fontWeight: 700 }}>
                  {loading ? "—" : totalVisible}
                </span>
                <span> of {totalAll} questions</span>
                {hasPathway && (
                  <span style={{ marginLeft: "0.5rem" }}>
                    · viewing: {Array.isArray(pathway) 
                      ? pathway.map((p, i) => (
                          <span key={p} style={{ color: PATHWAYS[p]?.color || C.gold }}>
                            {i > 0 && ", "}{PATHWAYS[p]?.label || p}
                          </span>
                        ))
                      : <span style={{ color: PATHWAYS[pathway]?.color }}>{PATHWAYS[pathway]?.label}</span>
                    }
                  </span>
                )}
                {section && <span style={{ color: C.gold, marginLeft: "0.5rem" }}>· {section}</span>}
              </div>
              {(hasPathway || section || search || cohort || observerRole || format) && (
                <button
                  onClick={() => updateState({ pathway: null, section: null, search: "", cohort: null, observerRole: null, format: null })}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.ghost}`,
                    color: C.muted,
                    fontFamily: FONT.condensed,
                    fontSize: "0.64rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: "0.25rem 0.55rem",
                    borderRadius: 4,
                  }}
                >
                  clear all filters ×
                </button>
              )}
            </div>

            {/* Content */}
            {loading && <LoadingNotice />}
            {error && <ErrorNotice msg={error} />}
            {!loading && !error && filteredGrouped && filteredGrouped.length === 0 && (
              <EmptyNotice updateState={updateState} />
            )}
            {!loading && !error && filteredGrouped && filteredGrouped.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                {filteredGrouped.map((group) => (
                  <SectionGroup
                    key={`${group.phase}-${group.section}`}
                    group={group}
                    pathway={pathway}
                    distributions={distributions}
                    cohortDistributions={cohortDistributions}
                    navigate={navigate}
                    searchTerm={search || ""}
                  />
                ))}
              </div>
            )}
          </main>

          {/* RIGHT: AI Assistant */}
          <aside style={{
            position: "sticky",
            top: "5rem",
            maxHeight: "calc(100vh - 6.5rem)",
            overflowY: "auto",
            paddingRight: "0.4rem",
            transition: "top 0.3s ease, maxHeight 0.3s ease",
          }}>
            <CopilotChat routerState={routerState} updateState={updateState} />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function Masthead() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header style={{
      padding: scrolled ? "0.65rem 1.1rem" : "1.5rem 1.1rem 1rem",
      textAlign: "center",
      borderBottom: `1px solid ${C.ghost}`,
      background: scrolled ? "rgba(10, 10, 12, 0.88)" : C.bg,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      overflow: "visible",
      transition: "padding 0.3s ease, background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
    }}>
      <HarmonicCanvas opacity={scrolled ? 0.15 : 0.3} />
      
      {/* Absolute positioned settings button inside header */}
      <div style={{
        position: "absolute",
        top: scrolled ? "50%" : "2.4rem",
        transform: scrolled ? "translateY(-50%)" : "none",
        right: "1.5rem",
        zIndex: 10,
        transition: "all 0.3s ease",
      }}>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Under full mode, render the rainbow accent line */}
        <div style={{
          height: scrolled ? 0 : 3,
          opacity: scrolled ? 0 : 1,
          background: RAINBOW,
          borderRadius: 2,
          marginBottom: scrolled ? 0 : "1rem",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }} />

        {/* Kicker */}
        <div style={{
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: scrolled ? "0px" : "0.7rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: scrolled ? 0 : "0.3rem",
          opacity: scrolled ? 0 : 1,
          height: scrolled ? 0 : "auto",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}>★ The Accidental Intactivist's Inquiry ★</div>

        {/* Main Title */}
        <h1 style={{
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: scrolled ? "1.2rem" : "clamp(1.6rem, 3.5vw, 2.2rem)",
          color: C.textBright,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          margin: 0,
          transition: "all 0.3s ease",
        }}>Explore the Data</h1>

        {/* Subtitle */}
        <div style={{
          fontFamily: FONT.display,
          fontStyle: "italic",
          fontSize: scrolled ? "0px" : "0.88rem",
          color: C.muted,
          marginTop: scrolled ? 0 : "0.25rem",
          opacity: scrolled ? 0 : 1,
          height: scrolled ? 0 : "auto",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}>501 Voices · 8 Pathways · 355 Questions</div>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.35rem",
      padding: "0.32rem 0.6rem",
      background: C.bgCard,
      border: `1px solid ${C.ghost}`,
      borderRadius: 6,
      minWidth: 180,
    }}>
      <span style={{ color: C.dim, fontSize: "0.85rem" }}>⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions…"
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: C.text,
          fontFamily: FONT.body,
          fontSize: "0.78rem",
          flex: 1,
          minWidth: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
          aria-label="clear search"
        >×</button>
      )}
    </div>
  );
}

function SectionGroup({ group, pathway, distributions, cohortDistributions, navigate, searchTerm }) {
  const phase = SURVEY_PHASES.find((p) => p.id === group.phase);
  const phaseDef = phase ? phase.sections?.find((s) => s.name === group.section) : null;
  const pathwayObj = group.phase === "branches" && group.questions[0]?.pathway && group.questions[0].pathway !== "all"
    ? PATHWAYS[group.questions[0].pathway]
    : null;

  return (
    <section>
      {/* Section header */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: "0.6rem",
        marginBottom: "0.55rem",
        paddingBottom: "0.35rem",
        borderBottom: `1px solid ${pathwayObj ? pathwayObj.color + "35" : C.ghost}`,
      }}>
        <h3 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1.08rem",
          color: pathwayObj ? pathwayObj.color : C.textBright,
          letterSpacing: "-0.01em",
        }}>
          {pathwayObj && <span style={{ marginRight: "0.4rem" }}>{pathwayObj.emoji}</span>}
          {group.section}
        </h3>
        <span style={{
          fontFamily: FONT.mono,
          fontSize: "0.68rem",
          color: C.muted,
          background: "rgba(255,255,255,0.04)",
          padding: "0.1rem 0.4rem",
          borderRadius: 999,
          border: `1px solid ${C.ghost}`,
        }}>{group.questions.length}</span>
        {phaseDef?.desc && (
          <span style={{
            fontFamily: FONT.body,
            fontSize: "0.76rem",
            color: C.dim,
            fontStyle: "italic",
          }}>{phaseDef.desc}</span>
        )}
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.12rem" }}>
        {group.section === "Religion" ? (
          ["Universal", "Jewish", "Christian", "Islamic"].map(sub => {
            const subQuestions = group.questions.filter(q => {
              if (sub === "Jewish") return q.id.includes("jewish");
              if (sub === "Christian") return q.id.includes("christian");
              if (sub === "Islamic") return q.id.includes("islamic");
              return !q.id.includes("jewish") && !q.id.includes("christian") && !q.id.includes("islamic");
            });
            if (subQuestions.length === 0) return null;
            return (
              <div key={sub} style={{ marginBottom: "1rem" }}>
                <div style={{
                  fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.goldBright, 
                  textTransform: "uppercase", letterSpacing: "0.12em", padding: "0.5rem 0.5rem 0.3rem"
                }}>
                  {sub === "Universal" ? "🌐 Universal Religion" : 
                   sub === "Jewish" ? "✡️ Jewish Perspectives" :
                   sub === "Christian" ? "✝️ Christian Perspectives" : "☪️ Islamic Perspectives"}
                </div>
                {subQuestions.map((q, i) => (
                  <div key={q.id} data-qid={q.id}>
                    <QuestionRow
                      q={q} index={i}
                      distribution={distributions[q.id]} cohortDistribution={cohortDistributions[q.id]}
                      onClick={() => navigate("question", { id: q.id })} searchTerm={searchTerm}
                    />
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          group.questions.map((q, i) => (
            <div key={q.id} data-qid={q.id}>
              <QuestionRow
                q={q}
                index={i}
                distribution={distributions[q.id]}
                cohortDistribution={cohortDistributions[q.id]}
                onClick={() => navigate("question", { id: q.id })}
                searchTerm={searchTerm}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function LoadingNotice() {
  return (
    <div style={{
      padding: "2rem",
      textAlign: "center",
      color: C.muted,
      fontFamily: FONT.body,
      fontStyle: "italic",
    }}>
      Loading 355 questions from D1…
    </div>
  );
}

function ErrorNotice({ msg }) {
  return (
    <div style={{
      padding: "1rem 1.2rem",
      background: "rgba(217,79,79,0.08)",
      border: `1px solid rgba(217,79,79,0.3)`,
      borderRadius: 8,
      color: C.red,
      fontFamily: FONT.mono,
      fontSize: "0.8rem",
    }}>
      <strong>API error:</strong> {msg}
    </div>
  );
}

function EmptyNotice({ updateState }) {
  return (
    <div style={{
      padding: "2.5rem 1.2rem",
      textAlign: "center",
      color: C.muted,
      fontFamily: FONT.body,
      background: C.bgSoft,
      border: `1px dashed ${C.ghost}`,
      borderRadius: 8,
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>∅</div>
      <p style={{ marginBottom: "0.8rem" }}>No questions match these filters.</p>
      <button
        onClick={() => updateState({ pathway: null, section: null, search: "", cohort: null, observerRole: null, format: null, view: "all" })}
        style={{
          background: "transparent",
          border: `1px solid ${C.gold}`,
          padding: "0.45rem 0.9rem",
          borderRadius: 4,
        }}
      >
        Show all 355 questions
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "2rem 1.1rem 3rem", textAlign: "center" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.4, marginBottom: "1rem" }} />
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.66rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.dim,
        }}>
          <a href="https://findings.circumsurvey.online" style={{ color: C.muted, marginRight: "0.8rem" }}>← Back to the Special Report</a>
          ·
          <a href="#/methodology" style={{ color: C.goldBright, margin: "0 0.8rem" }}>Methodology & Data Rigor</a>
          ·
          <a href="https://circumsurvey.online" style={{ color: C.muted, marginLeft: "0.8rem" }}>circumsurvey.online</a>
        </div>
      </div>
    </footer>
  );
}

function FormatToggle({ mode, onChange }) {
  return (
    <div style={{
      display: "flex",
      background: "var(--c-bgSoft)",
      border: `1px solid var(--c-ghost)`,
      borderRadius: 6,
      overflow: "hidden",
    }}>
      <button
        onClick={() => onChange(null)}
        style={{
          background: !mode ? "rgba(255,255,255,0.05)" : "transparent",
          border: "none",
          color: !mode ? "var(--c-textBright)" : "var(--c-muted)",
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.7rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "0.32rem 0.6rem",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        All Types
      </button>
      <button
        onClick={() => onChange("multiple_choice")}
        style={{
          background: mode === "multiple_choice" ? "rgba(255,255,255,0.05)" : "transparent",
          border: "none",
          borderLeft: `1px solid var(--c-ghost)`,
          color: mode === "multiple_choice" ? "var(--c-textBright)" : "var(--c-muted)",
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.7rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "0.32rem 0.6rem",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Choices
      </button>
      <button
        onClick={() => onChange("open_text")}
        style={{
          background: mode === "open_text" ? "rgba(255,255,255,0.05)" : "transparent",
          border: "none",
          borderLeft: `1px solid var(--c-ghost)`,
          color: mode === "open_text" ? "var(--c-textBright)" : "var(--c-muted)",
          fontFamily: "var(--f-condensed, 'Barlow Condensed', sans-serif)",
          fontSize: "0.7rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "0.32rem 0.6rem",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Narratives
      </button>
    </div>
  );
}

function PathwayDropdown({ selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function clickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [isOpen]);

  const toggleOption = (id) => {
    let next;
    const current = selected ? (Array.isArray(selected) ? selected : [selected]) : [];
    if (current.includes(id)) {
      next = current.filter(v => v !== id);
    } else {
      next = [...current, id];
    }
    onChange(next.length === 0 ? null : next);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const currentList = selected ? (Array.isArray(selected) ? selected : [selected]) : [];
  
  // Compute display label
  let displayLabel = "All (501)";
  if (currentList.length === 1) {
    displayLabel = `${PATHWAYS[currentList[0]]?.label || currentList[0]} (${PATHWAYS[currentList[0]]?.n || 0})`;
  } else if (currentList.length > 1) {
    const totalN = currentList.reduce((acc, id) => acc + (PATHWAYS[id]?.n || 0), 0);
    displayLabel = `${currentList.map(id => PATHWAYS[id]?.label).join(", ")} (${totalN})`;
  }

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: 60 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.32rem 0.6rem",
          background: C.bgCard,
          border: `1px solid ${currentList.length > 0 ? "rgba(212,160,48,0.35)" : C.ghost}`,
          borderRadius: 6,
          color: currentList.length > 0 ? C.goldBright : C.text,
          fontFamily: FONT.body,
          fontSize: "0.78rem",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          transition: "all 0.15s",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: FONT.condensed,
          fontSize: "0.68rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.muted,
          flexShrink: 0,
        }}>
          Cohort / Pathway
        </span>
        <span style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.74rem",
        }}>
          {displayLabel}
        </span>
        {currentList.length > 0 && (
          <span 
            onClick={clearAll}
            style={{
              color: C.muted,
              fontSize: "0.8rem",
              padding: "0 0.2rem",
              cursor: "pointer",
            }}
            title="Clear cohort pathway filter"
          >
            ×
          </span>
        )}
        <span style={{
          color: isOpen ? C.goldBright : C.dim,
          fontSize: "0.55rem",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 4,
          background: C.bgSoft,
          border: `1px solid ${C.ghost}`,
          borderRadius: 6,
          zIndex: 70,
          maxHeight: 260,
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          minWidth: 220,
        }}>
          <button
            onClick={clearAll}
            style={{
              width: "100%",
              padding: "0.45rem 0.7rem",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${C.ghost}`,
              color: C.muted,
              fontFamily: FONT.condensed,
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              textAlign: "left",
              fontStyle: "italic",
            }}
          >
            — All Pathways (501) —
          </button>
          {PATHWAY_IDS.map((id) => {
            const p = PATHWAYS[id];
            const isSelected = currentList.includes(id);
            return (
              <div
                key={id}
                onClick={() => toggleOption(id)}
                style={{
                  width: "100%",
                  padding: "0.4rem 0.7rem",
                  background: isSelected ? `${p.color}15` : "transparent",
                  color: isSelected ? p.color : C.text,
                  fontFamily: FONT.body,
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isSelected ? `${p.color}25` : "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? `${p.color}15` : "transparent"; }}
              >
                <div style={{
                  width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                  border: `1px solid ${isSelected ? p.color : C.dim}`,
                  background: isSelected ? p.color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {isSelected && <span style={{ color: C.bgCard, fontSize: "0.55rem", fontWeight: "bold" }}>✓</span>}
                </div>
                <span style={{ fontSize: "0.9rem", marginRight: "0.25rem" }}>{p.emoji}</span>
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.label}
                </div>
                <span style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.muted }}>
                  n={p.n || 0}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
