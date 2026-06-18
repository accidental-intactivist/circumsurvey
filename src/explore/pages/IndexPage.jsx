// ═══════════════════════════════════════════════════════════════════════════
// IndexPage — the Master Index, two-panel layout
// Left: SurveyMapNav + DemographicFilterBar (sticky sidebar)
// Right: question list grouped by section, with search + relevance toggle
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { C, FONT, RAINBOW, resolveCssColor } from "../styles/tokens";
import { PATHWAYS, PATHWAY_IDS, SURVEY_PHASES, isQuestionRelevant, phaseForQuestion, observerSubrolesForQuestion, circumcisedSubrolesForQuestion } from "../lib/pathways";
import { getQuestions, getResponseDistribution } from "../lib/api";
import DemographicFilterBar from "../components/DemographicFilterBar";
import SurveyMapNav from "../components/SurveyMapNav";
import ExhibitsDashboard from "../components/ExhibitsDashboard";
import PathwayChips from "../components/PathwayChips";
import RelevanceToggle from "../components/RelevanceToggle";
import QuestionRow from "../components/QuestionRow";
import CopilotChat from "../components/CopilotChat";
import * as Icons from "../components/Icons";
import IconifyEmoji from "../components/IconifyEmoji";
import { QUESTION_EXHIBIT_MAP } from "../lib/coverage";
import { EXHIBIT_ROUTES } from "../components/ExploreMasthead";

export default function IndexPage({ routerState, navigate, updateState, setExhibitContext }) {
  const { pathway, view, search, section, cohort, observerRole, format } = routerState;
  const hasPathway = pathway && (Array.isArray(pathway) ? pathway.length > 0 : true);

  // ── Data fetch ──────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUnsurfacedOnly, setShowUnsurfacedOnly] = useState(false);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({ cohort, search });
    }
  }, [cohort, search, setExhibitContext]);

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

    // 3b. Apply circumcised sub-role filter (only meaningful if pathway includes circumcised)
    const hasCircumcisedSelected = Array.isArray(pathway) ? pathway.includes("circumcised") : pathway === "circumcised";
    if (hasCircumcisedSelected && observerRole && observerRole !== "universal") {
      filtered = filtered.filter((q) => {
        const roles = circumcisedSubrolesForQuestion(q);
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

    // 5b. Apply unsurfaced filter
    if (showUnsurfacedOnly) {
      filtered = filtered.filter(q => !QUESTION_EXHIBIT_MAP[q.id] || QUESTION_EXHIBIT_MAP[q.id].length === 0);
    }

    // 6. Group by Pathway instead of survey sections
    const groups = [];
    const pathwayOrder = ["universal", "amab_anatomy", "circumcised", "intact", "restoring", "observer", "trans", "intersex", "universal_end"];
    
    for (const pid of pathwayOrder) {
      const pQs = filtered.filter(q => {
        if (pid === "universal") {
           const isUniversal = q.pathway === "all" || q.pathway === "universal" || !q.pathway || (Array.isArray(q.pathway) && (q.pathway.includes("universal") || q.pathway.includes("all")));
           return isUniversal && ((q.col_idx === undefined || q.col_idx < 100) || q.section === "Demographics");
        } else if (pid === "universal_end") {
           const isUniversal = q.pathway === "all" || q.pathway === "universal" || !q.pathway || (Array.isArray(q.pathway) && (q.pathway.includes("universal") || q.pathway.includes("all")));
           return isUniversal && q.col_idx >= 100 && q.section !== "Demographics";
        } else {
           return q.pathway === pid || (Array.isArray(q.pathway) && q.pathway.includes(pid));
        }
      });
      
      if (pQs.length === 0) continue;

      // Sort by original col_idx to maintain some logic
      pQs.sort((a, b) => (a.col_idx || 0) - (b.col_idx || 0));

      if (pid === "universal" || pid === "universal_end" || pid === "observer" || pid === "trans") {
        const sectionsMap = {};
        const orderedKeys = [];
        pQs.forEach(q => {
          let s = q.section || (pid === "universal_end" ? "Culture & Perspectives" : (pid === "observer" ? "Universal Observer" : "Universal"));
          if (!sectionsMap[s]) {
            sectionsMap[s] = [];
            orderedKeys.push(s);
          }
          sectionsMap[s].push(q);
        });
        for (const secName of orderedKeys) {
           let roleId = secName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
           if (pid === "observer") {
             if (secName === "Parents & Guardians") roleId = "parent";
             else if (secName === "Partners & Intimacy") roleId = "partner";
             else if (secName === "Researchers & Students") roleId = "curious";
             else if (secName === "Skeptics & Critics") roleId = "skeptic";
             else if (secName === "Medical Professionals") roleId = "healthcare";
             else if (secName === "Advocates & Ethicists") roleId = "advocate";
             else if (secName === "Women") roleId = "woman";
             else if (secName === "Universal Observer") roleId = "universal";
           } else if (pid === "trans") {
             if (secName === "Post-Vaginoplasty") roleId = "vaginoplasty";
             else if (secName === "Post-Phalloplasty") roleId = "phalloplasty";
           }

           groups.push({
             pathway: pid,
             section: (pid === "observer" || pid === "trans") ? `${PATHWAYS[pid]?.label} — ${secName}` : secName,
             questions: sectionsMap[secName],
             id: (pid === "observer" || pid === "trans")
               ? `role-${roleId}`
               : `section-${secName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
           });
        }
      } else {
        groups.push({
          pathway: pid,
          section: PATHWAYS[pid]?.label || "Universal",
          questions: pQs,
          id: `pathway-${pid}`,
        });
      }
    }

    return groups;
  }, [questions, pathway, view, search, section, observerRole, format, showUnsurfacedOnly]);

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

  // ── IntersectionObserver for Scroll Spy (SurveyMapNav) ─────────────────
  const [activeSectionId, setActiveSectionId] = useState(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the visible section closest to the top
        for (const entry of entries) {
          if (entry.isIntersecting) {
             setActiveSectionId(entry.target.id);
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 } // Triggers when section top hits the top 10% of screen
    );

    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredGrouped]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Extract pathway/section from the activeSectionId
  const activePathway = activeSectionId?.startsWith("pathway-") 
    ? activeSectionId.replace("pathway-", "") 
    : (activeSectionId?.startsWith("role-") ? "observer" : null);
  const activeSectionLabel = activeSectionId?.startsWith("section-") 
    ? activeSectionId.replace("section-", "") 
    : null;
  const activeObserverRole = activeSectionId?.startsWith("role-") 
    ? activeSectionId.replace("role-", "") 
    : null;

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

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1.1rem 3rem" }}>

        {(!hasPathway && !section && !search && !cohort && !observerRole) && (
          <div style={{ marginBottom: "2rem" }}>
            <ExhibitsDashboard />
          </div>
        )}

        {/* Three-panel grid */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 340px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: Scroll Spy Navigator */}
          <aside style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            paddingRight: "0.4rem",
            zIndex: 100,
          }}>
            <SurveyMapNav 
              selectedPathway={activePathway}
              selectedSection={activeSectionLabel}
              selectedObserverRole={activeObserverRole}
              onSelectPathway={(pid) => scrollToSection(`pathway-${pid}`)}
              onSelectSection={(secName) => scrollToSection(`section-${secName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`)}
              onSelectObserverRole={(roleId) => scrollToSection(`role-${roleId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`)}
            />
          </aside>

          {/* CENTER: question list */}
          <main style={{ minWidth: 0 }}>
            {/* ── Core Filter Controls ─────────────────────────────────────────── */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              marginBottom: "1rem",
            }}>
              {/* Universal Search Box */}
              <div style={{ width: "100%" }}>
                <SearchBox value={search || ""} onChange={(s) => updateState({ search: s })} />
              </div>
              
              {/* Core Dimensions */}
              <div style={{ 
                display: "flex", 
                gap: "1.5rem", 
                flexWrap: "wrap",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.ghost}50`,
                padding: "0.85rem 1rem",
                borderRadius: 10,
                alignItems: "flex-start",
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <PathwayDropdown
                    selected={pathway}
                    onChange={(next) => updateState({ pathway: next, section: null, observerRole: null })}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <SectionDropdown
                    selected={section}
                    onChange={(s) => updateState({ section: s })}
                  />
                </div>
                <div style={{ flex: 1.5, minWidth: 280 }}>
                  <DemographicFilterBar
                    cohort={cohort}
                    onChange={(c) => updateState({ cohort: c })}
                  />
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

            {/* Status strip with View Toggles */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "0.25rem 0.5rem 0.75rem",
              borderBottom: `1px solid ${C.ghost}`,
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}>
              <div style={{
                fontFamily: FONT.condensed,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.muted,
              }}>
                <span style={{ color: C.goldBright, fontWeight: 700, fontSize: "0.8rem", marginRight: "0.2rem" }}>
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
                      : <span style={{ color: PATHWAYS[pathway]?.color || C.gold }}>{PATHWAYS[pathway]?.label || pathway}</span>
                    }
                  </span>
                )}
                {section && <span style={{ color: C.gold, marginLeft: "0.5rem" }}>· {section}</span>}
              </div>

              {/* View Presentation Toggles */}
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <FormatToggle mode={format} onChange={(m) => updateState({ format: m })} />
                <div style={{ width: 1, height: 16, background: C.ghost }} />
                <RelevanceToggle mode={view} onChange={(m) => updateState({ view: m })} totalQuestions={questions ? questions.length : null} />
                <div style={{ width: 1, height: 16, background: C.ghost }} />
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: showUnsurfacedOnly ? C.goldBright : C.dim,
                  fontFamily: FONT.condensed,
                  fontSize: "0.68rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}>
                  <input 
                    type="checkbox" 
                    checked={showUnsurfacedOnly}
                    onChange={(e) => setShowUnsurfacedOnly(e.target.checked)}
                    style={{ accentColor: C.gold, margin: 0, width: 14, height: 14 }}
                  />
                  Unmapped
                </label>

                {/* Clear Filters Button */}
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
                      marginLeft: "0.5rem"
                    }}
                  >
                    clear all filters ×
                  </button>
                )}
              </div>
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
                    navigate={navigate}
                    searchTerm={search || ""}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Filter Tool: Unsurfaced Toggle (Moved to left sidebar) */}
          {/* Wait, the left sidebar is at the top of the grid. Let's fix the syntax first. */}
          {/* Actually, the previous main was closing before the RIGHT aside. I will just close main properly. */}
          <aside style={{
            position: "sticky",
            top: "calc(var(--header-height, 56px) + 1.5rem)",
            maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
            overflowY: "auto",
            paddingRight: "0.4rem",
            zIndex: 100,
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section id={group.id} style={{ scrollMarginTop: "5rem" }}>
      {/* Section header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
        display: "flex",
        alignItems: "baseline",
        gap: "0.6rem",
        marginBottom: "0.55rem",
        paddingBottom: "0.35rem",
        borderBottom: `1px solid ${pathwayObj ? pathwayObj.color + "35" : C.ghost}`,
        cursor: "pointer",
        userSelect: "none",
      }}>
        <h3 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1.08rem",
          color: pathwayObj ? pathwayObj.color : C.textBright,
          letterSpacing: "-0.01em",
        }}>
          <span style={{ 
            display: "inline-block", 
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", 
            transition: "transform 0.2s", 
            marginRight: "0.4rem", 
            fontSize: "0.75rem",
            color: C.dim 
          }}>▶</span>
          {pathwayObj && <IconifyEmoji emoji={pathwayObj.emoji} style={{ marginRight: "0.4rem", color: pathwayObj.color }} />}
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
      {isOpen && (
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
                <div style={{ display: "flex", flexDirection: "column", gap: "0.12rem" }}>
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
      )}
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
      Pulling the question index…
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
                <IconifyEmoji emoji={p.emoji} size="0.9rem" style={{ marginRight: "0.25rem", color: p.color }} />
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

function SectionDropdown({ selected, onChange }) {
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

  const clearAll = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.32rem 0.6rem",
          background: C.bgCard,
          border: `1px solid ${selected ? "rgba(212,160,48,0.35)" : C.ghost}`,
          borderRadius: 6,
          color: selected ? C.goldBright : C.text,
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
          Section
        </span>
        <span style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.74rem",
        }}>
          {selected || "All Sections"}
        </span>
        {selected && (
          <span 
            onClick={clearAll}
            style={{
              color: C.muted,
              fontSize: "0.8rem",
              padding: "0 0.2rem",
              cursor: "pointer",
            }}
            title="Clear section filter"
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
            — All Sections —
          </button>
          {SURVEY_PHASES.map((phase) => (
            <div key={phase.id}>
              {phase.sections && phase.sections.length > 0 && (
                <div style={{
                  padding: "0.4rem 0.7rem 0.2rem",
                  fontFamily: FONT.condensed,
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: C.gold,
                  textTransform: "uppercase",
                }}>
                  {phase.label} Phase
                </div>
              )}
              {phase.sections?.map(s => {
                const isSelected = selected === s.name;
                return (
                  <div
                    key={s.name}
                    onClick={() => { onChange(s.name); setIsOpen(false); }}
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.7rem",
                      background: isSelected ? "rgba(212,160,48,0.12)" : "transparent",
                      color: isSelected ? C.goldBright : C.text,
                      fontFamily: FONT.body,
                      fontSize: "0.76rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isSelected ? "rgba(212,160,48,0.18)" : "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "rgba(212,160,48,0.12)" : "transparent"; }}
                  >
                    <div style={{
                      width: 13, height: 13, borderRadius: 3, flexShrink: 0,
                      border: `1px solid ${isSelected ? C.goldBright : C.dim}`,
                      background: isSelected ? C.goldBright : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {isSelected && <span style={{ color: C.bgCard, fontSize: "0.55rem", fontWeight: "bold" }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
