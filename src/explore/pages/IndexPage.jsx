// ═══════════════════════════════════════════════════════════════════════════
// IndexPage — the Master Index, two-panel layout
// Left: SurveyMapNav + DemographicFilterBar (sticky sidebar)
// Right: question list grouped by section, with search + relevance toggle
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { C, FONT, RAINBOW } from "../styles/tokens";
import { PATHWAYS, SURVEY_PHASES, isQuestionRelevant, phaseForQuestion, observerSubrolesForQuestion } from "../lib/pathways";
import { getQuestions, getResponseDistribution } from "../lib/api";
import SurveyMapNav from "../components/SurveyMapNav";
import DemographicFilterBar from "../components/DemographicFilterBar";
import PathwayChips from "../components/PathwayChips";
import RelevanceToggle from "../components/RelevanceToggle";
import QuestionRow from "../components/QuestionRow";

export default function IndexPage({ routerState, navigate, updateState }) {
  const { pathway, view, search, section, cohort, observerRole } = routerState;

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

    // 1. Apply section filter (if selected)
    let filtered = questions;
    if (section) {
      filtered = filtered.filter((q) => q.section === section);
    }

    // 2. Apply relevance + pathway filter
    filtered = filtered.filter((q) => isQuestionRelevant(q, pathway, view));

    // 3. Apply observer sub-role filter (only meaningful if pathway=observer)
    if (pathway === "observer" && observerRole && observerRole !== "universal") {
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

    // 5. Group by phase → section (in survey order)
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
  }, [questions, pathway, view, search, section, observerRole]);

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

        {/* Top control strip: pathway chips + view toggle + search */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.8rem",
          alignItems: "center",
          padding: "1rem 0 1.1rem",
          borderBottom: `1px solid ${C.ghost}`,
          marginBottom: "1rem",
        }}>
          <PathwayChips
            selected={pathway}
            onSelect={(id) => updateState({ pathway: id, section: null, observerRole: null })}
          />
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            <SearchBox value={search || ""} onChange={(s) => updateState({ search: s })} />
            <RelevanceToggle mode={view} onChange={(m) => updateState({ view: m })} />
          </div>
        </div>

        {/* Two-panel grid */}
        <div
          className="explore-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* LEFT: Survey map + demographic filter */}
          <aside
            className="explore-nav"
            style={{
              position: "sticky",
              top: "1rem",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
              paddingRight: "0.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
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

          {/* RIGHT: question list */}
          <main>
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
                {pathway && (
                  <span style={{ color: PATHWAYS[pathway].color, marginLeft: "0.5rem" }}>
                    · viewing as {PATHWAYS[pathway].label}
                  </span>
                )}
                {section && <span style={{ color: C.gold, marginLeft: "0.5rem" }}>· {section}</span>}
              </div>
              {(pathway || section || search || cohort || observerRole) && (
                <button
                  onClick={() => updateState({ pathway: null, section: null, search: "", cohort: null, observerRole: null })}
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function Masthead() {
  return (
    <header style={{
      padding: "1.5rem 1.1rem 1rem",
      textAlign: "center",
      borderBottom: `1px solid ${C.ghost}`,
      background: C.bg,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ height: 3, background: RAINBOW, borderRadius: 2, marginBottom: "1rem" }} />
        <div style={{
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.3rem",
        }}>★ The Accidental Intactivist's Inquiry ★</div>
        <h1 style={{
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
          color: C.textBright,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginBottom: "0.25rem",
        }}>Explore the Data</h1>
        <div style={{
          fontFamily: FONT.display,
          fontStyle: "italic",
          fontSize: "0.88rem",
          color: C.muted,
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
        {group.questions.map((q, i) => (
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
        ))}
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
        onClick={() => updateState({ pathway: null, section: null, search: "", cohort: null, observerRole: null, view: "all" })}
        style={{
          background: "transparent",
          border: `1px solid ${C.gold}`,
          color: C.gold,
          fontFamily: FONT.condensed,
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
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
          <a href="https://circumsurvey.online" style={{ color: C.muted, marginLeft: "0.8rem" }}>circumsurvey.online</a>
        </div>
      </div>
    </footer>
  );
}
