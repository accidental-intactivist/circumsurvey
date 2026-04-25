// ═══════════════════════════════════════════════════════════════════════════
// CulturalAlignmentSection — findings.circumsurvey.online editorial wrapper
//
// Drop into the main report page after "Voices" or "Mirror cards".
// Uses pre-baked data (no API call) so findings stays fast and independent.
// The narrative cards below the matrix tell the three canonical stories.
//
// USAGE:
//   import CulturalAlignmentSection from './CulturalAlignmentSection';
//   // inside App.jsx render:
//   <CulturalAlignmentSection />
// ═══════════════════════════════════════════════════════════════════════════

import CulturalAlignmentMatrix from "./CulturalAlignmentMatrix";

// Pre-computed observed matrix — data frozen at 501 respondents, 480 who
// answered final_social_norm_perception. Regenerate by running:
//
//   SELECT COALESCE(resp.pathway, 'observer') AS pathway,
//          r.value_text AS norm, COUNT(*) AS n
//   FROM responses r
//   JOIN respondents resp ON resp.id = r.respondent_id
//   WHERE r.question_id = 'final_social_norm_perception'
//     AND r.value_text IS NOT NULL
//   GROUP BY pathway, norm;
//
const OBSERVED = {
  intact:      { "I+": 25, "I": 15, "=": 32, "C": 41, "C+": 23 },
  circumcised: { "I+": 31, "I": 24, "=": 35, "C": 59, "C+": 55 },
  restoring:   { "I+":  7, "I": 10, "=": 20, "C": 37, "C+": 33 },
  observer:    { "I+":  2, "I":  3, "=":  5, "C": 11, "C+": 12 },
};

// Curated stories — the editorial narrative Tone presented at the Summit
const STORIES = [
  {
    label: "The Defiers · intact × circ-overwhelming",
    headline: "23 intact men who grew up in cultures where circumcision was the overwhelming norm.",
    body: "19 of 23 were born in the USA. 16 of 23 are Millennial or Gen Z. These are the parents who chose against the unanimous cultural expectation — and they did it recently, in the crucible of peak-circumcision America. The cultural shift is visible in this one cell.",
    direction: "under",
  },
  {
    label: "The Chosen · circumcised × intact-normative cultures",
    headline: "55 circumcised men born into cultures that see intact as the standard.",
    body: "Concentrated in the UK, Germany, and Australia. Spread across every generation. The story here is different — religious tradition, medical necessity, or family-specific choice inside a culture that would not have defaulted to the procedure.",
    direction: "over",
  },
  {
    label: "Restoring without pressure · restoring × intact-overwhelming",
    headline: "Only 7 restorers grew up where intact was already the norm.",
    body: "Restoration concentrates where the wound was unanimous — the opposite cell (circ overwhelming) is overrepresented. When the whole culture cut you, the reversal is a collective act. When the culture was already intact, restoring is a much rarer, more private reckoning.",
    direction: "under",
  },
];

// Section header styles matching findings editorial rhythm
const SECTION_STYLE = {
  padding: "4rem 1.25rem",
  background: "#0a0a0c",
  borderTop: "1px solid #2a2a30",
  borderBottom: "1px solid #2a2a30",
};
const RAINBOW = "linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)";

export default function CulturalAlignmentSection() {
  return (
    <section style={SECTION_STYLE} aria-label="Cultural Alignment Matrix">
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ height: 2, background: RAINBOW, borderRadius: 2, opacity: 0.5, marginBottom: "2rem" }} />

        <CulturalAlignmentMatrix
          observed={OBSERVED}
          stories={STORIES}
          autoStories={false}
          eyebrow="Pathway × Cultural Norm"
          title="Cultural alignment &amp; defiance"
          subtitle="Each respondent's body arrived in a specific cultural context — a set of expectations about what is normal. This matrix asks: did their pathway match the culture, or contradict it? Cells are colored by standardized residual — how much higher or lower the count is than pure chance would predict if pathway and cultural norm were independent."
        />

        {/* Reading-the-matrix appendix */}
        <div style={{
          maxWidth: 720,
          margin: "2rem auto 0",
          padding: "1.25rem 1.5rem",
          background: "#131316",
          border: "1px solid #2a2a30",
          borderRadius: 8,
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.88rem",
          color: "#999",
          lineHeight: 1.65,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "#d4a030",
            marginBottom: "0.55rem",
          }}>How to read the matrix</div>
          <p style={{ marginBottom: "0.7rem" }}>
            The circumcised pathway is almost entirely neutral across all five cultural norms — circumcised men aren't especially clustered in circ-normative cultures. The pathway that <em>does</em> show strong alignment is <strong style={{ color: "#5b93c7", fontWeight: 600 }}>intact</strong>. Intact men cluster toward supportive cultures; circumcised men are everywhere.
          </p>
          <p>
            The three highlighted cells tell asymmetric stories. The Defiers are concentrated and recent (American Millennials bucking peak-pressure). The Chosen are spread (Europeans chosen for specific religious or medical reasons across all generations). The Restorers double-down on where they came from. Each one is a different shape of outlier.
          </p>
        </div>
      </div>
    </section>
  );
}
