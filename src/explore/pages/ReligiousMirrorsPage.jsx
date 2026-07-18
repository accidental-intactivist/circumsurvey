import { useState, useEffect, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { C, FONT, API_BASE } from "../styles/tokens";
import DistributionChart from "../components/DistributionChart";
import NarrativeList from "../components/NarrativeList";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import IconifyEmoji from "../components/IconifyEmoji";
import SmallSampleBadge from "../components/SmallSampleBadge";
import ExhibitHero from "../components/ExhibitHero";
import { flattenMultiSelect } from "../lib/formatters";
import ExhibitDataLoader from "../components/ExhibitDataLoader";
import { colorForLabel } from "../components/MiniSparkline";
import ExhibitSidebarNav from "../components/ExhibitSidebarNav";

const RELIGION_SECTIONS = [
  { id: "section-congregation", label: "The Missing Congregation" },
  { id: "section-a-universal", label: "A: Cross-Tradition Views" },
  { id: "section-b-departure", label: "B: Departure Stories" },
  { id: "section-c-cultural", label: "C: Cultural Mechanics" },
];

// ── TRADITIONS (filter syntax for cross-tabbing) ───────────────────────────
const TRADITIONS = [
  { id: "Christian",  label: "Christian",  emoji: "✝️",  color: "#5b93c7", cohort: { primary_tradition: "Christian" } },
  { id: "Jewish",     label: "Jewish",     emoji: "✡️",  color: "#d4a030", cohort: { primary_tradition: "Jewish" } },
  { id: "Islamic",    label: "Islamic",    emoji: "☪️",  color: "#68b878", cohort: { primary_tradition: "Islamic" } },
];

const ALL_TRADITIONS = [
  { id: "Secular",    label: "Secular / No Tradition", emoji: "⚛️", color: "#8bb8d9", cohort: { primary_tradition: "No significant religious/spiritual/cultural tradition influencing this topic." } },
  ...TRADITIONS,
];

// ── SECTION A: Universal questions cross-tabbed by ALL traditions ──────────
const UNIVERSAL_QUESTIONS = [
  { id: "culture_body_intervention_view", concept: "Body & Interventions" },
  { id: "final_core_principle_choice", concept: "Core Ethical Principle" },
];

// ── SECTION B: Departure stories — only render where data exists ──────────
// Each tradition gets its own story arc: view → awareness → depth → alternatives
const TRADITION_STORIES = {
  Jewish: {
    primary: { id: "religion_jewish_brit_milah_view", label: "View of Brit Milah" },
    depth: [
      { id: "religion_jewish_theology_awareness", label: "Theological Awareness" },
      { id: "religion_jewish_identity_importance", label: "Importance to Identity" },
    ],
    narratives: [
      { id: "religion_jewish_alternatives_awareness", label: "Alternative Awareness" },
      { id: "religion_jewish_alternatives_thoughts", label: "Thoughts on Alternatives" },
      { id: "religion_jewish_diversity_view", label: "Room for Diversity" },
      { id: "religion_jewish_brit_shalom_awareness", label: "Brit Shalom Awareness" },
    ],
    denomination: "religion_jewish_denomination",
  },
  Islamic: {
    primary: { id: "religion_islamic_khitan_view", label: "View of Khitan" },
    depth: [
      { id: "religion_islamic_theology_awareness", label: "Religious Awareness" },
      { id: "religion_islamic_fard_vs_sunnah", label: "Fard vs. Sunnah" },
      { id: "religion_islamic_identity_importance", label: "Importance to Identity" },
      { id: "religion_islamic_theology_reasons", label: "Theological Reasons", fullWidth: true },
    ],
    narratives: [
      { id: "religion_islamic_alternatives_awareness", label: "Alternative Awareness" },
      { id: "religion_islamic_alternatives_thoughts", label: "Thoughts on Alternatives" },
      { id: "religion_islamic_intact_reconciliation", label: "Reconciling Intactness" },
    ],
    denomination: "religion_islamic_school",
  },
  Christian: {
    primary: { id: "religion_christian_circ_view", label: "View of Circumcision" },
    depth: [],
    narratives: [
      { id: "religion_christian_theology_basis", label: "Theological Basis" },
      { id: "religion_christian_comments", label: "Additional Thoughts" },
    ],
    denomination: "religion_christian_denomination",
  },
};

// ── SECTION C: Cultural Mechanics cross-tabbed by religion ────────────────
const CULTURAL_QUESTIONS = [
  { id: "final_ethical_consideration_belief", concept: "Media & The 'Default' Penis" },
  { id: "culture_social_pressure_role", concept: "Social Pressure & 'Looking Different'" },
  { id: "final_ethics_cosmetic_alteration_minor", concept: "Non-Consensual Cosmetic Alteration of Minors" },
  { id: "final_prediction_future_of_ric", concept: "20-30 Year Prediction for RIC" },
];


export default function ReligiousMirrorsPage({ navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [traditionCounts, setTraditionCounts] = useState(null);
  const [totalRespondents, setTotalRespondents] = useState(501);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Religious Mirrors' exhibit. This exhibit contains 3 sections: Universal Cross-Tradition Views, Departure Stories (tradition-specific deep dives for Jewish, Islamic, and Christian respondents), and Cultural Mechanics (cross-tabbed by religion).",
        exhibitName: "The Missing Congregation",
        exhibitDescription: "Who speaks about religion and circumcision — and who stays silent?",
        traditionsCompared: ["Secular", "Christian", "Jewish", "Islamic"],
        sectionA: "Universal Cross-Tradition Views",
        sectionB: "Departure Stories — Tradition-Specific Deep Dives",
        sectionC: "Cultural Mechanics — Cross-Tabbed by Religion",
      });
    }
  }, [setExhibitContext]);

  // Fetch questions metadata
  useEffect(() => {
    fetch(`${API_BASE}/questions`)
      .then(res => res.json())
      .then(data => {
        const qMap = {};
        data.questions.forEach(q => {
          if (q.id === "final_core_principle_choice") {
            q.type = "single_select";
            q.opts = [
              "The Child's Right to Bodily Autonomy: Prioritizing the principle that a person's body should not be permanently and non-consensually altered without a clear and present medical necessity, preserving their right to make that decision for themselves as an adult.",
              "The recommendation of Medical Authorities and Parental Discretion: Prioritizing the professional guidance given to parents and the right of parents to make preventative health and cultural choices they believe are in their child's best interest."
            ];
          }
          qMap[q.id] = q;
        });
        setQuestionsMap(qMap);
      });
  }, []);

  // Fetch tradition counts for "The Missing Congregation"
  useEffect(() => {
    fetch(`${API_BASE}/response-distribution?q=religion_primary_tradition`)
      .then(res => res.json())
      .then(data => {
        const counts = {};
        (data.distribution || []).forEach(d => {
          counts[d.label] = d.n;
        });
        setTraditionCounts(counts);
      })
      .catch(() => setTraditionCounts({}));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <InlineBreadcrumb currentRoute="religious-mirrors" navigate={navigate} />

        <ExhibitHero
          title="Religious Mirrors"
          color={C.goldBright}
          gradientColor={C.gold}
          BackgroundIcon={BookOpen}
          description="Religion is the oldest driver of ritual circumcision — yet in a survey promoted through bodily autonomy communities, deeply religious respondents are starkly underrepresented. This exhibit explores how the remaining cohort reconciles faith, body image, and medical history."
        />

        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem", alignItems: "start", marginTop: "3rem" }}>
          
          {/* LEFT: Nav sidebar */}
          <ExhibitSidebarNav sections={RELIGION_SECTIONS} />

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem" }}>

        {/* ── THE MISSING CONGREGATION CALLOUT ────────────────────── */}
        <div id="section-congregation">
          <MissingCongregation
          traditionCounts={traditionCounts}
          totalRespondents={totalRespondents}
          questionsMap={questionsMap}
        />
        </div>

        {/* ── SECTION A: Universal Cross-Tradition Views ──────────── */}
        <SectionHeader id="section-a-universal" title="Section A" subtitle="Universal Cross-Tradition Views" />
        <p style={{ color: C.muted, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 900, margin: "0 auto 3rem", textAlign: "center" }}>
          These questions were asked of all respondents. Here we cross-tabulate by the four largest religious groupings
          to reveal where worldview diverges.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "5rem", marginBottom: "6rem" }}>
          {UNIVERSAL_QUESTIONS.map(qDef => (
            <UniversalRow key={qDef.id} qDef={qDef} questionsMap={questionsMap} />
          ))}
        </div>

        <div style={{ borderBottom: "5px dotted var(--c-ghost)", margin: "5rem 0 1rem", opacity: 0.5 }} />

        {/* ── SECTION B: Departure Stories ─────────────────────────── */}
        <SectionHeader id="section-b-departure" title="Section B" subtitle="Departure Stories" />
        <p style={{ color: C.muted, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 900, margin: "0 auto 3rem", textAlign: "center" }}>
          Each tradition has its own set of questions exploring theological awareness, identity importance,
          and openness to alternatives. Rather than a sparse comparison grid, we present each tradition's
          full story — showing only the data that exists.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4rem", marginBottom: "6rem" }}>
          {TRADITIONS.map(tradition => (
            <DepartureStory
              key={tradition.id}
              tradition={tradition}
              story={TRADITION_STORIES[tradition.id]}
              questionsMap={questionsMap}
              traditionCounts={traditionCounts}
            />
          ))}
        </div>

        <div style={{ borderBottom: "5px dotted var(--c-ghost)", margin: "5rem 0 1rem", opacity: 0.5 }} />

        {/* ── SECTION C: Cultural Mechanics ────────────────────────── */}
        <SectionHeader id="section-c-cultural" title="Section C" subtitle="Cultural Mechanics" />
        <p style={{ color: C.muted, fontSize: "0.92rem", lineHeight: 1.6, maxWidth: 900, margin: "0 auto 3rem", textAlign: "center" }}>
          Universal questions about the cultural forces that perpetuate circumcision — media, social pressure,
          consent ethics, and future predictions — cross-tabulated by religious background.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
          {CULTURAL_QUESTIONS.map(qDef => (
            <UniversalRow key={qDef.id} qDef={qDef} questionsMap={questionsMap} />
          ))}
        {questionsMap["culture_body_intervention_view"] && (
          <SharedLegend q={questionsMap["culture_body_intervention_view"]} />
        )}
        </div> {/* End right column */}
        </div> {/* End grid */}

      </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// THE MISSING CONGREGATION — data callout
// ═══════════════════════════════════════════════════════════════════════════
function MissingCongregation({ traditionCounts, totalRespondents, questionsMap }) {
  if (!traditionCounts) {
    return <div style={{ color: C.dim, fontStyle: "italic", padding: "2rem", textAlign: "center" }}>Loading tradition data...</div>;
  }

  const answeredTotal = Object.values(traditionCounts).reduce((a, b) => a + b, 0);
  const didNotAnswer = totalRespondents - answeredTotal;

  const rows = [
    { label: "Christian", n: traditionCounts["Christian"] || 0, emoji: "✝️", color: "#5b93c7" },
    { label: "Jewish", n: traditionCounts["Jewish"] || 0, emoji: "✡️", color: "#d4a030" },
    { label: "Islamic", n: traditionCounts["Islamic"] || 0, emoji: "☪️", color: "#68b878" },
    { label: "Other Traditions", n: (traditionCounts["Hinduism"] || 0) + (traditionCounts["Buddhism"] || 0) + (traditionCounts["New Age / Spiritual but not religious"] || 0), emoji: "🕉️", color: "#a07cc5" },
    { label: "No Tradition / Skipped", n: didNotAnswer + (traditionCounts["No significant religious/spiritual/cultural tradition influencing this topic."] || 0), emoji: "—", color: C.muted },
  ];

  const maxN = Math.max(...rows.map(r => r.n));

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,180,60,0.04) 0%, rgba(255,180,60,0.01) 100%)",
      border: `1px solid rgba(212,160,48,0.18)`,
      borderRadius: 16,
      padding: "2.5rem",
      marginTop: 0,
      marginBottom: "4rem",
      position: "relative",
    }}>
      {/* Accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, #d4a030, #68b878, #5b93c7)`, borderRadius: "16px 16px 0 0" }} />

      <h2 style={{
        fontFamily: FONT.display,
        fontSize: "1.6rem",
        fontWeight: 700,
        color: C.textBright,
        marginBottom: "0.6rem",
        letterSpacing: "-0.015em",
      }}>
        <IconifyEmoji emoji="🕯️" /> The Missing Congregation
      </h2>
      <p style={{
        fontFamily: FONT.body,
        fontSize: "0.95rem",
        color: C.text,
        lineHeight: 1.6,
        maxWidth: 800,
        marginBottom: "2rem",
      }}>
        Of <strong style={{ color: C.textBright }}>{totalRespondents}</strong> respondents, only <strong style={{ color: C.textBright }}>{answeredTotal}</strong> identified
        a religious tradition as significant to their perspective on this topic.
        The overwhelming majority of religiously-identified respondents are <strong style={{ color: "#5b93c7" }}>Christian ({traditionCounts["Christian"] || 0})</strong>.
        <br /><br />
        The traditions with the deepest historical investment in ritual circumcision — Judaism and Islam —
        are represented by just <strong style={{ color: "#d4a030" }}>{traditionCounts["Jewish"] || 0}</strong> and <strong style={{ color: "#68b878" }}>{traditionCounts["Islamic"] || 0}</strong> respondents
        respectively. These small samples are genuine and valuable, but they represent people who chose to engage
        with a survey promoted through bodily autonomy communities — a self-selection pattern worth noting.
      </p>

      {/* Bar chart visualization */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {rows.map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 140,
              fontFamily: FONT.condensed,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: row.color,
              textAlign: "right",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "0.3rem",
            }}>
              {row.emoji !== "—" && <IconifyEmoji emoji={row.emoji} />}
              <span>{row.label}</span>
            </div>
            <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{
                width: `${Math.max((row.n / maxN) * 100, 1)}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${row.color}44, ${row.color}88)`,
                borderRadius: 4,
                transition: "width 0.8s ease-out",
                display: "flex",
                alignItems: "center",
                paddingLeft: "0.5rem",
              }}>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: C.textBright,
                  whiteSpace: "nowrap",
                }}>
                  n={row.n}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Methodological note */}
      <div style={{
        marginTop: "1.5rem",
        padding: "0.8rem 1rem",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${C.ghost}`,
        borderRadius: 8,
        fontSize: "0.8rem",
        color: C.muted,
        lineHeight: 1.5,
        fontStyle: "italic",
      }}>
        <strong style={{ color: C.dim, fontStyle: "normal" }}>Note:</strong> Small samples (n&lt;20) are flagged
        throughout this exhibit. They represent real voices but should not be treated as statistically representative
        of their broader religious communities.
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════════════════
function SectionHeader({ title, subtitle, id }) {
  return (
    <h2 id={id} style={{
      fontFamily: FONT.condensed,
      fontSize: "1.5rem",
      color: C.gold,
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      textAlign: "center",
      marginBottom: "0.5rem",
    }}>
      <span style={{ fontSize: "0.7em", color: C.muted, display: "block", marginBottom: "0.2rem" }}>{title}</span>
      {subtitle}
    </h2>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL ROW — 4 columns (Secular, Christian, Jewish, Islamic)
// ═══════════════════════════════════════════════════════════════════════════
function UniversalRow({ qDef, questionsMap }) {
  const q = questionsMap[qDef.id];

  return (
    <section style={{
      background: "rgba(255, 255, 255, 0.01)",
      border: `1px solid ${C.ghost}`,
      borderRadius: 16,
      padding: "2rem",
      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
    }}>
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.textBright, marginBottom: "0.5rem", fontWeight: 700, letterSpacing: "-0.015em" }}>
          {qDef.concept}
        </h3>
        {q && (
          <p style={{ fontFamily: FONT.body, fontSize: "1rem", color: C.muted, fontStyle: "italic", maxWidth: 800, margin: "0 auto", lineHeight: 1.45 }}>
            "{q.prompt}"
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {ALL_TRADITIONS.map(tradition => (
          <div key={tradition.id} style={{
            flex: "1 1 250px",
            minWidth: 250,
            background: C.bgCard,
            border: `1px solid ${C.ghost}`,
            borderRadius: 12,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <h4 style={{ fontFamily: FONT.condensed, color: tradition.color, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, textAlign: "center", display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}>
              <IconifyEmoji emoji={tradition.emoji} />
              <span>{tradition.label}</span>
            </h4>

            {q ? (
              <ExhibitDataLoader question={q} cohort={tradition.cohort} shortenLabels={true} hideLegend={true} />
            ) : (
              <div style={{ color: C.dim, textAlign: "center", fontStyle: "italic", fontSize: "0.85rem" }}>Loading question...</div>
            )}
          </div>
        ))}
      </div>

      {/* Shared legend for long option labels */}
      {q && q.opts && (
        <SharedLegend q={q} />
      )}
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// DEPARTURE STORY — one per Abrahamic tradition, vertical layout
// ═══════════════════════════════════════════════════════════════════════════
function DepartureStory({ tradition, story, questionsMap, traditionCounts }) {
  if (!story) return null;
  const n = traditionCounts?.[tradition.id] || 0;

  return (
    <section style={{
      background: `linear-gradient(135deg, ${tradition.color}08 0%, ${tradition.color}02 100%)`,
      border: `1px solid ${tradition.color}33`,
      borderRadius: 16,
      padding: "2.5rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: tradition.color }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
        <IconifyEmoji emoji={tradition.emoji} />
        <h3 style={{
          fontFamily: FONT.display,
          fontSize: "1.8rem",
          fontWeight: 700,
          color: C.textBright,
          margin: 0,
          letterSpacing: "-0.015em",
        }}>
          {tradition.label} Perspectives
        </h3>
        <SmallSampleBadge n={n} label={`${tradition.label} respondents`}>
          <span style={{
            fontFamily: FONT.mono,
            fontSize: "0.75rem",
            color: tradition.color,
            background: `${tradition.color}15`,
            padding: "0.15rem 0.5rem",
            borderRadius: 999,
            border: `1px solid ${tradition.color}30`,
          }}>
            n={n}
          </span>
        </SmallSampleBadge>
      </div>

      {/* Denomination breakdown (if available) */}
      {story.denomination && questionsMap[story.denomination] && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: FONT.condensed, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim, marginBottom: "0.6rem" }}>
            Denomination Breakdown
          </div>
          <ExhibitDataLoader question={questionsMap[story.denomination]} shortenLabels={true} cohort={tradition.cohort} />
        </div>
      )}

      {/* Primary view question */}
      {story.primary && questionsMap[story.primary.id] && (
        <div style={{ marginBottom: "2.5rem" }}>
          <QuestionCard
            question={questionsMap[story.primary.id]}
            label={story.primary.label}
            color={tradition.color}
            cohort={tradition.cohort}
          />
        </div>
      )}

      {/* Depth questions (quantitative) */}
      {story.depth.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: FONT.condensed, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: "1rem" }}>
            Theological Depth
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {story.depth.map(dq => {
              const q = questionsMap[dq.id];
              if (!q) return null;
              return (
                <div key={dq.id} style={{ flex: dq.fullWidth ? "1 1 100%" : "1 1 280px", minWidth: 250 }}>
                  <QuestionCard question={q} label={dq.label} color={tradition.color} compact={!dq.fullWidth} cohort={tradition.cohort} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative questions (qualitative) */}
      {story.narratives.length > 0 && (
        <div>
          <div style={{ fontFamily: FONT.condensed, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: "1rem" }}>
            In Their Own Words
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {story.narratives.map(nq => {
              const q = questionsMap[nq.id];
              if (!q) return null;
              return (
                <QuestionCard key={nq.id} question={q} label={nq.label} color={tradition.color} cohort={tradition.cohort} />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// QUESTION CARD — renders a single question with its data
// ═══════════════════════════════════════════════════════════════════════════
function QuestionCard({ question, label, color, compact, cohort }) {
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      padding: compact ? "1rem" : "1.5rem",
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <h4 style={{
          fontFamily: FONT.condensed,
          fontSize: compact ? "0.85rem" : "1rem",
          fontWeight: 700,
          color: C.textBright,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {label}
        </h4>
        <span style={{
          fontFamily: FONT.condensed,
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: question.type === "open_text" ? "#a8b5c4" : C.dim,
          background: question.type === "open_text" ? "rgba(168,181,196,0.1)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${question.type === "open_text" ? "rgba(168,181,196,0.2)" : C.ghost}`,
          borderRadius: 999,
          padding: "0.1rem 0.4rem",
        }}>
          {question.type === "open_text" ? "QUAL" : "QUANT"}
        </span>
      </div>

      <p style={{
        fontFamily: FONT.body,
        fontSize: "0.85rem",
        color: C.muted,
        fontStyle: "italic",
        lineHeight: 1.4,
        margin: "0 0 0.8rem",
      }}>
        "{question.prompt}"
      </p>

      <ExhibitDataLoader question={question} shortenLabels={!compact} cohort={cohort} />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SHARED LEGEND (for long option labels)
// ═══════════════════════════════════════════════════════════════════════════
function SharedLegend({ q }) {
  if (!q) return null;
  const opts = q.id === "culture_body_intervention_view" ? [
    "Balanced View: \"I believe in preserving the natural state but am also very open to preventative or elective medical procedures if they offer potential future benefits.\"",
    "Context-Dependent: \"My view depends entirely on the specific procedure or situation.\"",
    "Lean Towards Medical Optimization: \"I believe medical science can and often should be used to improve upon, manage, or optimize the body's natural state, even in the absence of disease.\"",
    "Lean Towards Natural State: \"I believe the body's natural design should be trusted and preserved unless there is a clear, present medical problem.\""
  ] : q.opts;

  return (
    <div style={{
      maxWidth: 900,
      margin: "2.5rem auto 0",
      padding: "1.2rem 1.6rem",
      background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      fontSize: "0.84rem",
      color: C.text,
      lineHeight: 1.5,
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
    }}>
      <div style={{
        fontFamily: FONT.condensed,
        color: C.gold,
        fontSize: "0.72rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        marginBottom: "0.2rem"
      }}>
        <span>★</span> Shared Legend
      </div>
      {opts.map((opt, idx) => {
        const hasColon = opt.includes(":");
        if (!hasColon && q.id !== "culture_body_intervention_view") return null;

        const title = hasColon ? opt.split(":")[0] : opt;
        const desc = hasColon ? opt.slice(title.length + 1) : "";
        const color = colorForLabel(title, idx);

        return (
          <div key={idx} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <div style={{
              width: 12, height: 12, borderRadius: 2,
              background: color,
              flexShrink: 0,
              marginTop: "0.3rem"
            }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, color: C.textBright }}>{title}{hasColon ? ":" : ""} </span>
              {hasColon && <span style={{ color: C.muted }}>{desc.trim()}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}



