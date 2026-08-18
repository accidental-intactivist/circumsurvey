import { useState, useEffect, useRef, useMemo } from "react";
import { GitCompare } from "lucide-react";
import { Sparkles, RefreshCw } from "../components/Icons";
import { hashLink } from "../lib/router";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import { getQuestions, getResponseDistribution, getAggregate, getNarratives } from "../lib/api";
import DistributionChart from "../components/DistributionChart";
import { PATHWAYS, PATHWAY_IDS } from "../lib/pathways";
import { useTooltip, Tooltip } from "../components/Tooltip";
import ExhibitHero from "../components/ExhibitHero";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import { colorForLabel } from "../components/MiniSparkline";
import { sortDistribution, flattenMultiSelect } from "../lib/formatters";
import IconifyEmoji from "../components/IconifyEmoji";
import SmallSampleBadge from "../components/SmallSampleBadge";

const MIRROR_PAIRS = [
  { id: "advantages", concept: "Perceived Advantages", intact: "intact_advantages_desc", circ: "circ_advantages_desc" },
  { id: "drawbacks", concept: "Perceived Drawbacks", intact: "intact_drawbacks_desc", circ: "circ_drawbacks_desc" },
  { id: "awareness_age", concept: "Age of Awareness", intact: "intact_circ_awareness_age", circ: "circ_awareness_age" },
  { id: "parents_reason", concept: "Parents' Stated Reason", intact: "intact_parents_reason", circ: "circ_parents_reason" },
  { id: "primary_driver", concept: "Primary Driver", intact: "intact_parents_driver", circ: "circ_parents_driver" },
  { id: "resentment", concept: "Resentment / Regret", intact: "intact_regret_feeling", circ: "circ_regret_feeling" },
  { id: "triggers", concept: "Triggers for Regret", intact: "intact_regret_triggers", circ: "circ_regret_triggers" },
  { id: "convo", concept: "Conversations with Parents", intact: "intact_parents_convo", circ: "circ_parents_convo" },
  { id: "why_not", concept: "Why Not Asked?", intact: "intact_parents_convo_why_not", circ: "circ_parents_convo_why_not" },
  { id: "medical", concept: "Medical Interventions", intact: "intact_medical_intervention", circ: "circ_medical_intervention" },
  { id: "notice_same", concept: "Noticing Cohort States", intact: "intact_notice_same_status", circ: "circ_notice_same_status" },
  { id: "curiosity", concept: "Curiosity About the Other", intact: "intact_curiosity_about_circ", circ: "circ_curiosity_about_intact" },
  { id: "curiosity_aspects", concept: "Curiosity (Specifics)", intact: "intact_curiosity_about_circ_aspects", circ: "circ_curiosity_about_intact_aspects" },
  { id: "thought_level", concept: "Prior Thought Level", intact: "intact_prior_thought_level", circ: "circ_prior_thought_level" },
  { id: "ppp", concept: "Pearly Penile Papules (PPP)", intact: "intact_ppp_awareness", circ: "circ_ppp_awareness", intactImpact: "intact_ppp_impact", circImpact: "circ_ppp_impact" },
  { id: "community_norm", concept: "Community Expectation", intact: "norm", circ: "norm" },
  
  // Perceptions of Society's Thoughts & Norms (Universal Questions)
  { id: "social_norm_perception", concept: "Social Norm Perception", universal: "final_social_norm_perception" },
  { id: "social_pressure_locker_rooms", concept: "Social Pressures & Locker Rooms", universal: "culture_social_pressure_role" },
  { id: "media_penile_ideal", concept: "Media Shaping the Penile Ideal", universal: "final_ethical_consideration_belief" },
  { id: "partner_preference", concept: "Partner Preference", universal: "final_partner_preference_belief" },
  
  // Attitudes on Intact vs. Circumcised Differences (Universal Questions)
  { id: "medically_healthier", concept: "Medically Healthier / More Hygienic?", universal: "final_healthier_hygienic_belief" },
  { id: "pleasure_potential", concept: "Pleasure & Sensation Potential", universal: "final_pleasure_potential_belief" },
  { id: "average_pleasure_fulfillment", concept: "Average Pleasure & Orgasm", universal: "final_avg_pleasure_belief" },
  { id: "aesthetic_appeal", concept: "Aesthetic Appeal (Visual)", universal: "final_aesthetic_preference" },
  { id: "future_child_decision", concept: "Decision for AMAB Child Today", universal: "final_child_decision_reason" },
  
  // Physical & Sensory Experience (Universal Questions)
  { id: "sensory_light_touch", concept: "Sensitivity to Light Touch", universal: "exp_sex_rating_sensitivity_light_touch" },
  { id: "sensory_mobile_skin", concept: "Pleasure of Mobile Skin", universal: "exp_sex_rating_pleasure_mobile_skin" },
  { id: "sensory_variety", concept: "Variety of Sensation", universal: "exp_sex_rating_variety_of_sensation" },
  { id: "orgasm_intensity", concept: "Orgasm Intensity", universal: "exp_sex_rating_orgasm_intensity" },
  { id: "lubrication_need", concept: "Need for Artificial Lubrication", universal: "exp_lubrication_need" }
];


function normalizeMirrorLabel(label) {
  if (!label) return "";
  let clean = String(label).trim();
  let lower = clean.toLowerCase();
  
  // 9. Curiosity about the other cohort (Checked first to avoid catch-all word collision, e.g. "never")
  if (lower.includes("being intact is preferable") || lower.includes("being circumcised is preferable")) {
    return "Believe own state preferable";
  }
  if (lower.includes("experienced this before")) {
    return "Experienced natural state before";
  }
  if (lower.includes("often wondered")) {
    return "I've often wondered";
  }
  if (lower.includes("occasionally wondered")) {
    return "I've occasionally wondered";
  }
  if (lower.includes("happy with my experience")) {
    return "I'm happy with my experience";
  }
  if (lower.includes("never thought about it") || lower.includes("never really thought about it") || lower.includes("grew up where intact is the norm")) {
    return "Never thought about it";
  }

  // 1. Age of awareness normalization
  if (lower.includes("always just known") || lower.includes("always known")) {
    return "I've always just known";
  }
  if (lower.includes("early childhood")) {
    return "Early childhood";
  }
  if (lower.includes("pre-teen")) {
    return "Pre-teen years";
  }
  if (lower.includes("teenage")) {
    return "Teenage years";
  }
  if (lower.includes("adulthood")) {
    return "Adulthood";
  }
  if (lower.includes("not applicable - grew up intact") || lower.includes("not entirely sure what was done") || lower.includes("not applicable") || lower.includes("not sure what was done")) {
    return "Not applicable / Unsure";
  }

  // 2. Conversations with parents
  if (lower.includes("detailed conversation")) {
    return "Detailed conversation";
  }
  if (lower.includes("discussed it briefly") || lower.includes("discussed briefly")) {
    return "Discussed briefly";
  }
  if (lower.includes("tried to bring it up") || lower.includes("tried to bring up")) {
    return "Tried to ask";
  }
  if (lower.includes("never asked") || lower.includes("never discussed")) {
    return "Never asked";
  }
  if (lower.includes("parents are deceased")) {
    return "Not applicable";
  }

  // 3. Resentment / Regret
  if (lower.includes("strong and frequent") || lower.includes("frequent resentment")) {
    return "Strong and frequent";
  }
  if (lower.includes("experience some of these") || lower.includes("sometimes")) {
    return "Sometimes";
  }
  if (lower.includes("rarely")) {
    return "Rarely";
  }
  if (lower.includes("never")) {
    return "Never";
  }

  // 4. Primary Driver
  if (lower.includes("primarily my mother")) {
    return "Mother";
  }
  if (lower.includes("primarily my father")) {
    return "Father";
  }
  if (lower.includes("mutual")) {
    return "Mutual decision";
  }
  if (lower.includes("midwife") || lower.includes("doctor's or hospital's") || lower.includes("doctor's or midwife's") || lower.includes("driven by a doctor")) {
    return "Doctor / midwife advice";
  }
  if (lower.includes("grandparents")) {
    return "Grandparents / relatives";
  }
  if (lower.includes("no way of knowing")) {
    return "Unsure";
  }

  // 5. Why Not Asked?
  if (lower.includes("never felt the need") || lower.includes("never really felt the need")) {
    return "Never felt need / normal";
  }
  if (lower.includes("awkward or uncomfortable")) {
    return "Afraid of awkwardness";
  }
  if (lower.includes("never occurred to me")) {
    return "Never occurred to me";
  }
  if (lower.includes("wouldn't remember")) {
    return "Assumed they forgot";
  }
  if (lower.includes("blaming or criticizing")) {
    return "Worried of seeming critical";
  }

  // 6. Prior Thought Level
  if (lower.includes("virtually no thought")) {
    return "Virtually no thought";
  }
  if (lower.includes("great deal")) {
    return "A great deal";
  }
  if (lower.includes("moderate amount")) {
    return "A moderate amount";
  }
  if (lower.includes("some thought")) {
    return "Some thought";
  }
  if (lower.includes("little thought")) {
    return "Little thought";
  }

  // 7. Pearly Penile Papules (PPP) Awareness
  if (lower.includes("do not have them")) {
    return "Do not have them";
  }
  if (lower.includes("not sure if i have them")) {
    return "Not sure";
  }
  if (lower.includes("used to have them")) {
    return "Used to have them";
  }
  if (lower.includes("concerned about their appearance")) {
    return "Have them, concerned";
  }
  if (lower.includes("always known what they were")) {
    return "Have them, always known";
  }
  if (lower.includes("worried about them until i learned")) {
    return "Have them, worried";
  }
  if (lower.includes("didn't know what they were")) {
    return "Have them, didn't know";
  }
  if (lower.includes("faded over time")) {
    return "Faded over time";
  }

  // 8. Noticing same/different status
  if (lower.includes("almost always notice")) {
    return "Almost always notice";
  }
  if (lower.includes("frequently notice")) {
    return "Frequently notice";
  }
  if (lower.includes("sometimes notice")) {
    return "Sometimes notice";
  }
  if (lower.includes("rarely notice")) {
    return "Rarely notice";
  }
  if (lower.includes("never really notice")) {
    return "Never notice";
  }
  if (lower.includes("rarely or never in such situations")) {
    return "Not applicable";
  }

  return clean;
}

const alignAndSortPair = (intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ) => {
  if (!intactDist?.distribution || !circDist?.distribution) return null;

  const processSide = (dist, cohortDist, q) => {
    let cleanDist = dist;
    let cleanCohortDist = cohortDist;
    if (q && q.type === "multi_select") {
      cleanDist = {
        ...dist,
        distribution: flattenMultiSelect(dist.distribution, q)
      };
      if (cohortDist?.distribution) {
        cleanCohortDist = {
          ...cohortDist,
          distribution: flattenMultiSelect(cohortDist.distribution, q)
        };
      }
    }

    const rawItems = cleanDist.distribution || [];
    const cohortMap = new Map();
    if (cleanCohortDist?.distribution) {
      cleanCohortDist.distribution.forEach(d => {
        cohortMap.set(normalizeMirrorLabel(d.label), d.n);
      });
    }


    const standardLabels = q?.opts ? new Set(q.opts.map(normalizeMirrorLabel)) : null;

    const aggregated = new Map();
    const otherNarratives = [];

    rawItems.forEach(item => {
      const normLabel = normalizeMirrorLabel(item.label);
      if (!normLabel) return;
      
      const isStandard = !standardLabels || standardLabels.has(normLabel);
      
      if (isStandard) {
        const existing = aggregated.get(normLabel) || { label: normLabel, n: 0, cohortN: null, rawLabels: new Set() };
        existing.n += item.n;
        existing.rawLabels.add(item.label);
        if (cohortDist?.distribution) {
          existing.cohortN = (existing.cohortN || 0) + (cohortMap.get(normLabel) || 0);
        }
        aggregated.set(normLabel, existing);
      } else {
        otherNarratives.push({
          text: item.label,
          n: item.n
        });

        const otherLabel = "Other";
        const existing = aggregated.get(otherLabel) || { label: otherLabel, n: 0, cohortN: null, rawLabels: new Set() };
        existing.n += item.n;
        existing.rawLabels.add(item.label);
        if (cohortDist?.distribution) {
          existing.cohortN = (existing.cohortN || 0) + (cohortMap.get(normLabel) || 0);
        }
        aggregated.set(otherLabel, existing);
      }
    });

    return { aggregated, otherNarratives };
  };

  const intactData = processSide(intactDist, intactCohortDist, intactQ);
  const circData = processSide(circDist, circCohortDist, circQ);

  const intactMap = intactData.aggregated;
  const circMap = circData.aggregated;

  const allLabels = Array.from(new Set([
    ...intactMap.keys(),
    ...circMap.keys()
  ]));

  let unionObjects = allLabels.map(label => {
    const intactN = intactMap.get(label)?.n || 0;
    const circN = circMap.get(label)?.n || 0;
    return { label, n: intactN + circN };
  });

  let sortedUnion = [];
  if (circQ) {
    sortedUnion = sortDistribution(unionObjects, circQ);
  } else if (intactQ) {
    sortedUnion = sortDistribution(unionObjects, intactQ);
  } else {
    sortedUnion = [...unionObjects].sort((a, b) => b.n - a.n);
  }

  // Move "Other" to the end of sortedUnion if present
  const otherIndex = sortedUnion.findIndex(u => u.label === "Other");
  if (otherIndex !== -1) {
    const [otherItem] = sortedUnion.splice(otherIndex, 1);
    sortedUnion.push(otherItem);
  }

  const intactResult = [];
  const circResult = [];

  const intactTotal = Array.from(intactMap.values()).reduce((sum, item) => sum + item.n, 0);
  const circTotal = Array.from(circMap.values()).reduce((sum, item) => sum + item.n, 0);

  const intactCohortTotal = intactCohortDist?.distribution
    ? Array.from(intactMap.values()).reduce((sum, item) => sum + (item.cohortN || 0), 0)
    : 0;
  const circCohortTotal = circCohortDist?.distribution
    ? Array.from(circMap.values()).reduce((sum, item) => sum + (item.cohortN || 0), 0)
    : 0;

  sortedUnion.forEach(u => {
    const label = u.label;
    
    const intactItem = intactMap.get(label) || { label, n: 0, cohortN: null, rawLabels: new Set() };
    intactResult.push({
      label,
      n: intactItem.n,
      cohortN: intactItem.cohortN,
      rawLabel: Array.from(intactItem.rawLabels || []).filter(l => l !== "Other").join(", ") || label
    });

    const circItem = circMap.get(label) || { label, n: 0, cohortN: null, rawLabels: new Set() };
    circResult.push({
      label,
      n: circItem.n,
      cohortN: circItem.cohortN,
      rawLabel: Array.from(circItem.rawLabels || []).filter(l => l !== "Other").join(", ") || label
    });
  });

  return {
    intactList: intactResult,
    circList: circResult,
    intactTotal,
    circTotal,
    intactCohortTotal,
    circCohortTotal,
    intactOtherNarratives: intactData.otherNarratives,
    circOtherNarratives: circData.otherNarratives
  };
};

export default function MirrorPairsPage({ routerState, navigate, setExhibitContext }) {
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activePairId, setActivePairId] = useState(MIRROR_PAIRS[0].id);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        page_description: "The user is viewing the 'Mirror Pairs' exhibit, comparing responses to similar or identical questions between the Intact and Circumcised pathways. Data is shown in diverging 'Butterfly' charts for direct comparison.",
        active_pair: MIRROR_PAIRS.find(p => p.id === activePairId)?.concept || activePairId,
        exhibitName: "Mirror Pairs",
        exhibitDescription: "Compare similarly themed questions asked specifically to the Intact versus Circumcised pathways to isolate the subjective gap.",
        pairs: MIRROR_PAIRS.map(p => p.concept).join(", "),
        cohort: routerState?.cohort || {}
      });
    }
  }, [setExhibitContext, activePairId, routerState?.cohort]);

  useEffect(() => {
    async function load() {
      try {
        const { questions } = await getQuestions();
        const map = {};
        for (const q of (questions || [])) map[q.id] = q;
        setQuestionsMap(map);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActivePairId(entry.target.id.replace("pair-", ""));
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    
    setTimeout(() => {
      document.querySelectorAll('section[id^="pair-"]').forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: C.muted }}>Loading pairs...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <InlineBreadcrumb currentRoute="pairs" navigate={navigate} />
      
      <ExhibitHero
        title="Mirror Pairs & Cohort Contrasts"
        color={C.goldBright}
        gradientColor={C.gold}
        BackgroundIcon={GitCompare}
        description="Compare similarly themed questions asked specifically to the Intact versus Circumcised pathways to isolate the subjective gap."
      />

      {/* How to Read This Exhibit Toggle */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          style={{
            background: "transparent",
            border: "none",
            color: C.muted,
            fontFamily: FONT.condensed,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: 0,
          }}
        >
          <span style={{ fontSize: "1rem" }}>{showHowTo ? "−" : "+"}</span> How to Read These Charts
        </button>
        
        {showHowTo && (
          <div style={{
            marginTop: "1rem",
            background: C.bgSoft,
            border: `1px solid ${C.ghost}`,
            borderRadius: 8,
            padding: "1.5rem",
            color: C.textBright,
            fontFamily: FONT.body,
            fontSize: "0.95rem",
            lineHeight: 1.6,
            animation: "fadeIn 0.2s ease-out"
          }}>
            <p style={{ margin: "0 0 0.8rem 0" }}>
              <strong>The Butterfly Chart</strong> directly compares how the Intact and Circumcised pathways answered structurally identical questions. 
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>The <strong>Green Bars (Left)</strong> represent responses from Intact respondents.</li>
              <li style={{ marginBottom: "0.5rem" }}>The <strong>Blue Bars (Right)</strong> represent responses from Circumcised respondents.</li>
              <li style={{ marginBottom: "0.5rem" }}>The length of each bar represents the <em>percentage</em> of the pathway that selected that option.</li>
              <li>You can sort the responses by the largest absolute difference between the two groups.</li>
            </ul>
          </div>
        )}
      </div>

      <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "3rem", alignItems: "flex-start" }}>
        
        {/* Sticky Sidebar Navigation */}
        <aside className="explore-nav" style={{
          position: "sticky",
          top: "calc(var(--header-height, 56px) + 1.5rem)",
          flex: "0 0 260px",
          background: C.bgCard,
          border: `1px solid ${C.ghost}`,
          borderRadius: 12,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxHeight: "calc(100vh - var(--header-height, 56px) - 3rem)",
          overflowY: "auto",
          zIndex: 100,
        }}>
          <h3 style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", color: C.goldBright, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Jump to Concept
          </h3>
          {MIRROR_PAIRS.map(pair => {
            const isActive = activePairId === pair.id;
            return (
              <a key={pair.id} href={`#pair-${pair.id}`} style={{
                fontFamily: FONT.body,
                fontSize: "0.9rem",
                color: isActive ? C.goldBright : C.text,
                fontWeight: isActive ? 700 : 400,
                textDecoration: "none",
                padding: "0.4rem 0.6rem",
                borderRadius: 6,
                background: isActive ? `${C.gold}15` : "transparent",
                borderLeft: isActive ? `3px solid ${C.goldBright}` : `3px solid transparent`,
                transition: "all 0.2s"
              }}
              onMouseOver={e => { if (!isActive) e.target.style.background = C.bgSoft; }}
              onMouseOut={e => { if (!isActive) e.target.style.background = "transparent"; }}>
                {pair.concept}
              </a>
            );
          })}
        </aside>

        {/* Content Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4rem" }}>
          {MIRROR_PAIRS.map(pair => (
            <MirrorPairBlock key={pair.id} pair={pair} questionsMap={questionsMap} cohort={routerState.cohort} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ButterflyChart({ aligned, intactQ, circQ, hasCohort }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [sortBy, setSortBy] = useState("diff"); // "diff", "intact", "circ"

  const intactTotal = hasCohort && aligned.intactCohortTotal > 0 ? aligned.intactCohortTotal : aligned.intactTotal;
  const circTotal = hasCohort && aligned.circCohortTotal > 0 ? aligned.circCohortTotal : aligned.circTotal;

  const mergedList = useMemo(() => {
    return aligned.intactList.map((intactItem, i) => {
      const circItem = aligned.circList[i];
      const intactN = hasCohort ? (intactItem.cohortN || 0) : intactItem.n;
      const circN = hasCohort ? (circItem.cohortN || 0) : circItem.n;
      
      const intactPct = intactTotal > 0 ? (intactN / intactTotal) * 100 : 0;
      const circPct = circTotal > 0 ? (circN / circTotal) * 100 : 0;
      const diff = Math.abs(intactPct - circPct);

      return {
        label: intactItem.label,
        intactRawLabel: intactItem.rawLabel,
        circRawLabel: circItem.rawLabel,
        intactN,
        circN,
        intactOverallN: intactItem.n,
        circOverallN: circItem.n,
        intactPct,
        circPct,
        intactOverallPct: aligned.intactTotal > 0 ? (intactItem.n / aligned.intactTotal) * 100 : 0,
        circOverallPct: aligned.circTotal > 0 ? (circItem.n / aligned.circTotal) * 100 : 0,
        diff
      };
    });
  }, [aligned, hasCohort, intactTotal, circTotal]);

  const sortedList = useMemo(() => {
    return [...mergedList].sort((a, b) => {
      if (a.label === "Other") return 1;
      if (b.label === "Other") return -1;
      if (sortBy === "diff") return b.diff - a.diff;
      if (sortBy === "intact") return b.intactPct - a.intactPct;
      if (sortBy === "circ") return b.circPct - a.circPct;
      return 0;
    });
  }, [mergedList, sortBy]);

  return (
    <SmallSampleBadge n={Math.min(intactTotal, circTotal)} label="the compared pathways">
    <div className="mobile-scroll-hint" style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem", minWidth: "600px" }}>
      {/* Pathway Headers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
        {/* Intact Header */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.intact, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <IconifyEmoji emoji="🟢" style={{ color: PATH_COLORS.intact }} />
            <span>Intact Pathway</span>
          </h3>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", lineHeight: 1.4, color: C.textBright, margin: 0 }}>
            {intactQ ? intactQ.prompt : "No matching question."}
          </p>
          <div style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted, marginTop: "0.3rem" }}>
            {hasCohort && aligned.intactCohortTotal > 0 ? `n = ${aligned.intactCohortTotal} / ${aligned.intactTotal}` : `n = ${aligned.intactTotal}`}
          </div>
        </div>

        {/* Circ Header */}
        <div style={{ flex: 1, minWidth: 200, textAlign: "right" }}>
          <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.circumcised, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
            <span>Circumcised Pathway</span>
            <IconifyEmoji emoji="🔵" style={{ color: PATH_COLORS.circumcised }} />
          </h3>
          <p style={{ fontFamily: FONT.body, fontSize: "0.95rem", lineHeight: 1.4, color: C.textBright, margin: 0 }}>
            {circQ ? circQ.prompt : "No matching question."}
          </p>
          <div style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted, marginTop: "0.3rem" }}>
            {hasCohort && aligned.circCohortTotal > 0 ? `n = ${aligned.circCohortTotal} / ${aligned.circTotal}` : `n = ${aligned.circTotal}`}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sort By</span>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            {["intact", "diff", "circ"].map(opt => {
              const isActive = sortBy === opt;
              // Green / Yellow / Red, matching the Pleasure Gap cohort toggles.
              const color = opt === "intact" ? PATH_COLORS.intact
                : opt === "circ" ? PATH_COLORS.circumcised
                : PATH_COLORS.restoring;
              return (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  style={{
                    background: isActive ? color : "transparent",
                    color: isActive ? "#050505" : color,
                    border: `1px solid ${color}`,
                    padding: "0.4rem 1rem",
                    borderRadius: 20,
                    fontFamily: FONT.condensed,
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 800 : 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {opt === "diff" ? "Difference" : opt === "intact" ? "Intact" : "Circumcised"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Butterfly Chart Rows */}
      <div 
        role="figure"
        aria-label="Comparison chart between intact and circumcised pathways"
        style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}
      >
        {sortedList.map((item, i) => {
          const isSignificant = item.diff > 15 && item.label !== "Other";
          
          return (
             <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Intact Left Side */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.6rem" }}>
                   <span style={{ fontFamily: FONT.mono, fontSize: "0.76rem", color: C.textBright }}>{item.intactPct.toFixed(1)}%</span>
                   <div 
                      style={{ width: "70%", height: 16, background: C.ghost, borderRadius: 4, display: "flex", justifyContent: "flex-end", overflow: "hidden", cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const tooltipText = hasCohort
                          ? `${item.intactRawLabel}: ${item.intactPct.toFixed(1)}% (n=${item.intactN}) vs overall ${item.intactOverallPct.toFixed(1)}% (n=${item.intactOverallN})`
                          : `${item.intactRawLabel}: ${item.intactPct.toFixed(1)}% (n=${item.intactN})`;
                        showTooltip(e, tooltipText);
                      }}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                   >
                     <div style={{ width: `${item.intactPct}%`, height: "100%", background: PATH_COLORS.intact, borderRadius: 4, transition: "width 0.6s ease-in-out" }} />
                   </div>
                </div>

                {/* Center Label */}
                <div style={{ width: 160, textAlign: "center", position: "relative", padding: "0 0.5rem" }}>
                  {isSignificant && (
                    <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", lineHeight: 0, filter: "drop-shadow(0 0 8px rgba(212,160,48,0.8))", cursor: "help" }} title="Significant Divergence (>15%)">
                      <Sparkles size={13} color={C.goldBright} />
                    </div>
                  )}
                  <span style={{ fontFamily: FONT.body, fontSize: "0.78rem", color: isSignificant ? C.goldBright : C.text, fontWeight: isSignificant ? 700 : 400, textTransform: "uppercase", letterSpacing: "0.03em", wordWrap: "break-word", lineHeight: 1.2, display: "inline-block" }}>
                    {item.label}
                  </span>
                </div>

                {/* Circ Right Side */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                   <div 
                      style={{ width: "70%", height: 16, background: C.ghost, borderRadius: 4, display: "flex", overflow: "hidden", cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const tooltipText = hasCohort
                          ? `${item.circRawLabel}: ${item.circPct.toFixed(1)}% (n=${item.circN}) vs overall ${item.circOverallPct.toFixed(1)}% (n=${item.circOverallN})`
                          : `${item.circRawLabel}: ${item.circPct.toFixed(1)}% (n=${item.circN})`;
                        showTooltip(e, tooltipText);
                      }}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                   >
                     <div style={{ width: `${item.circPct}%`, height: "100%", background: PATH_COLORS.circumcised, borderRadius: 4, transition: "width 0.6s ease-in-out" }} />
                   </div>
                   <span style={{ fontFamily: FONT.mono, fontSize: "0.76rem", color: C.textBright }}>{item.circPct.toFixed(1)}%</span>
                </div>
             </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />

      {/* Action links */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${C.ghost}` }}>
        <a 
          href={hashLink("question", { id: intactQ?.id })}
          style={{ fontFamily: FONT.condensed, fontSize: "0.74rem", color: PATH_COLORS.intact, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none" }}
        >
          ← See Intact Responses
        </a>
        <a 
          href={hashLink("question", { id: circQ?.id })}
          style={{ fontFamily: FONT.condensed, fontSize: "0.74rem", color: PATH_COLORS.circumcised, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none" }}
        >
          See Circ Responses →
        </a>
      </div>

      {/* Write-ins section */}
      {(aligned.intactOtherNarratives?.length > 0 || aligned.circOtherNarratives?.length > 0) && (
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            {aligned.intactOtherNarratives?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <h4 style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  Other Intact Write-Ins ({aligned.intactOtherNarratives.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.4rem" }}>
                  {aligned.intactOtherNarratives.map((item, idx) => (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${PATH_COLORS.intact}`, borderRadius: 4, padding: "0.6rem 0.8rem" }}>
                      <p style={{ margin: 0, fontFamily: FONT.display, fontStyle: "italic", fontSize: "0.85rem", color: C.textBright }}>"{item.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            {aligned.circOtherNarratives?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <h4 style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  Other Circ Write-Ins ({aligned.circOtherNarratives.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.4rem" }}>
                  {aligned.circOtherNarratives.map((item, idx) => (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${PATH_COLORS.circumcised}`, borderRadius: 4, padding: "0.6rem 0.8rem" }}>
                      <p style={{ margin: 0, fontFamily: FONT.display, fontStyle: "italic", fontSize: "0.85rem", color: C.textBright }}>"{item.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
    </SmallSampleBadge>
  );
}

function MirrorPairBlock({ pair, questionsMap, cohort }) {
  const isUniversal = !!pair.universal;
  const intactQ = isUniversal ? null : questionsMap[pair.intact];
  const circQ = isUniversal ? null : questionsMap[pair.circ];
  const universalQ = isUniversal ? questionsMap[pair.universal] : null;

  const isNarrative = useMemo(() => {
    return (intactQ && intactQ.type === "open_text") || (circQ && circQ.type === "open_text");
  }, [intactQ, circQ]);

  const [intactDist, setIntactDist] = useState(null);
  const [circDist, setCircDist] = useState(null);
  const [intactCohortDist, setIntactCohortDist] = useState(null);
  const [circCohortDist, setCircCohortDist] = useState(null);

  const [intactNarratives, setIntactNarratives] = useState(null);
  const [circNarratives, setCircNarratives] = useState(null);
  const [intactCohortNarratives, setIntactCohortNarratives] = useState(null);
  const [circCohortNarratives, setCircCohortNarratives] = useState(null);

  // Universal state
  const [universalDist, setUniversalDist] = useState(null);
  const [universalCohortDist, setUniversalCohortDist] = useState(null);
  const [byPathway, setByPathway] = useState(null);

  const [inView, setInView] = useState(false);
  const blockRef = useRef(null);

  const aligned = useMemo(() => {
    if (isUniversal || isNarrative) return null;
    return alignAndSortPair(intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ);
  }, [intactDist, circDist, intactCohortDist, circCohortDist, intactQ, circQ, isUniversal, isNarrative]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: "200px" }
    );
    if (blockRef.current) observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    
    async function fetchDist() {
      try {
        if (isUniversal) {
          if (universalQ && !universalDist) {
            const d = await getResponseDistribution(pair.universal);
            setUniversalDist(d);
            
            // Get pathway breakdown
            const pathAgg = await getAggregate(pair.universal, { by: "pathway" }).catch(() => null);
            setByPathway(pathAgg);
          }
          if (universalQ && cohort) {
            const cd = await getResponseDistribution(pair.universal, { cohort });
            setUniversalCohortDist(cd);
          } else {
            setUniversalCohortDist(null);
          }
        } else {
          if (isNarrative) {
            if (intactQ && !intactDist) {
              const d = await getNarratives(pair.intact);
              setIntactDist(d);
            }
            if (intactQ && cohort) {
              const cd = await getNarratives(pair.intact, { cohort });
              setIntactCohortDist(cd);
            } else {
              setIntactCohortDist(null);
            }

            if (circQ && !circDist) {
              const d = await getNarratives(pair.circ);
              setCircDist(d);
            }
            if (circQ && cohort) {
              const cd = await getNarratives(pair.circ, { cohort });
              setCircCohortDist(cd);
            } else {
              setCircCohortDist(null);
            }
          } else {
            if (intactQ && !intactDist) {
              const d = await getResponseDistribution(pair.intact);
              setIntactDist(d);
            }
            if (intactQ && cohort) {
              const cd = await getResponseDistribution(pair.intact, { cohort });
              setIntactCohortDist(cd);
            } else {
              setIntactCohortDist(null);
            }

            if (circQ && !circDist) {
              const d = await getResponseDistribution(pair.circ);
              setCircDist(d);
            }
            if (circQ && cohort) {
              const cd = await getResponseDistribution(pair.circ, { cohort });
              setCircCohortDist(cd);
            } else {
              setCircCohortDist(null);
            }
          }

          // Fetch narrative impact if present (e.g. combined PPP block)
          if (pair.intactImpact && !intactNarratives) {
            const d = await getNarratives(pair.intactImpact);
            setIntactNarratives(d);
          }
          if (pair.intactImpact && cohort) {
            const cd = await getNarratives(pair.intactImpact, { cohort });
            setIntactCohortNarratives(cd);
          } else {
            setIntactCohortNarratives(null);
          }

          if (pair.circImpact && !circNarratives) {
            const d = await getNarratives(pair.circImpact);
            setCircNarratives(d);
          }
          if (pair.circImpact && cohort) {
            const cd = await getNarratives(pair.circImpact, { cohort });
            setCircCohortNarratives(cd);
          } else {
            setCircCohortNarratives(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch distributions for pair", pair.id, err);
      }
    }
    fetchDist();
  }, [inView, pair, intactQ, circQ, universalQ, cohort, isUniversal, isNarrative]);


  if (isUniversal) {
    return (
      <section id={`pair-${pair.id}`} ref={blockRef} style={{
        background: C.bgSoft,
        border: `1px solid ${C.ghost}`,
        borderRadius: 12,
        overflow: "hidden"
      }}>
        <div style={{
          padding: "1rem 1.5rem",
          borderBottom: `1px solid ${C.ghost}`,
          background: C.bgCard,
          textAlign: "center"
        }}>
          <h2 style={{
            fontFamily: FONT.condensed,
            fontSize: "1.2rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.goldBright,
            margin: 0
          }}>{pair.concept}</h2>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div>
            <h3 style={{ fontFamily: FONT.condensed, color: C.gold, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
              Universal Question (All Cohorts)
            </h3>
            <p style={{ fontFamily: FONT.body, fontSize: "1rem", lineHeight: 1.4, color: C.textBright, marginBottom: universalQ?.subtitle ? "0.5rem" : "1.5rem" }}>
              {universalQ ? universalQ.prompt : "No matching question."}
            </p>
            {universalQ?.subtitle && (
              <p style={{ fontFamily: FONT.body, fontSize: "0.9rem", lineHeight: 1.4, color: C.muted, marginBottom: "1.5rem", fontStyle: "italic" }}>
                {universalQ.subtitle}
              </p>
            )}

            {universalDist ? (
              universalQ.type === "open_text" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "1rem", background: C.bgDeep, borderRadius: 6, color: C.dim, fontSize: "0.85rem", fontStyle: "italic" }}>
                    Open text responses are available in the individual question view or Narrative Mirrors.
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: universalQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: C.goldBright,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${C.goldBright}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = C.goldBright}
                      onMouseOut={e => e.target.style.borderBottomColor = `${C.goldBright}40`}
                    >
                      See all answers →
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  <DistributionChart 
                    title="Overall Distribution"
                    distribution={universalDist} 
                    cohortDistribution={universalCohortDist} 
                    question={universalQ}
                  />
                  {byPathway && Object.keys(byPathway.results || {}).length > 0 && (
                    <PathwayBreakdown byPathway={byPathway} overallDist={universalDist?.distribution || []} />
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a 
                      href={hashLink("question", { id: universalQ.id })}
                      style={{
                        fontFamily: FONT.condensed,
                        fontSize: "0.74rem",
                        color: C.goldBright,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        borderBottom: `1px solid ${C.goldBright}40`,
                        paddingBottom: "0.1rem",
                        transition: "border-color 0.2s"
                      }}
                      onMouseOver={e => e.target.style.borderBottomColor = C.goldBright}
                      onMouseOut={e => e.target.style.borderBottomColor = `${C.goldBright}40`}
                    >
                      See all answers & full breakdown →
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div style={{ color: C.dim }}>Loading...</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Normal Side-by-side Mirror Pair
  return (
    <section id={`pair-${pair.id}`} ref={blockRef} style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 12,
      overflow: "hidden"
    }}>
      <div style={{
        padding: "1rem 1.5rem",
        borderBottom: `1px solid ${C.ghost}`,
        background: C.bgCard,
        textAlign: "center"
      }}>
        <h2 style={{
          fontFamily: FONT.condensed,
          fontSize: "1.2rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.goldBright,
          margin: 0
        }}>{pair.concept}</h2>
      </div>
      
      {/* Educational callout and PPP diagram for Pearly Penile Papules */}
      {pair.id === "ppp" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          padding: "1.5rem 1.5rem 0",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${C.ghost}`,
            borderRadius: 8,
            padding: "1.2rem",
            width: "100%",
            maxWidth: "800px",
            flexWrap: "wrap",
          }}>
            <div style={{
              flex: "1 1 200px",
              background: "#fff",
              padding: "0.8rem",
              borderRadius: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <img 
                src="/ppp_diagram.png" 
                alt="Pearly Penile Papules (PPP) Diagram" 
                style={{ width: "100%", maxWidth: "240px", height: "auto", display: "block" }} 
              />
            </div>
            <div style={{ flex: "2 1 300px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4 style={{ fontFamily: FONT.condensed, color: C.goldBright, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                What are Pearly Penile Papules (PPP)?
              </h4>
              <p style={{ fontFamily: FONT.body, fontSize: "0.88rem", lineHeight: 1.5, color: C.textBright, margin: 0 }}>
                Pearly Penile Papules (PPP) are small, harmless, dome-shaped bumps that often appear in rows around the corona (ridge of the glans). They are an entirely normal, non-contagious anatomical variation present in many men.
              </p>
              <p style={{ fontFamily: FONT.body, fontSize: "0.82rem", lineHeight: 1.5, color: C.muted, margin: 0 }}>
                Despite their harmless nature, they are frequently mistaken for STIs (like HPV/genital warts), leading to significant anxiety, confusion, or medical consultations. The survey findings below highlight the levels of awareness, worry, and social impact across cohorts.
              </p>
            </div>
          </div>
        </div>
      )}

      {isNarrative ? (
        (intactQ && !intactDist) || (circQ && !circDist) ? (
          <div style={{ padding: "3rem", textAlign: "center", color: C.dim }}>Loading narratives...</div>
        ) : (
          <MirrorNarrativeBlock 
            intactQ={intactQ}
            circQ={circQ}
            intactDist={intactDist}
            circDist={circDist}
            intactCohortDist={intactCohortDist}
            circCohortDist={circCohortDist}
            hasCohort={!!cohort}
          />
        )
      ) : (
        <>
          {aligned ? (
            <ButterflyChart 
              aligned={aligned}
              intactQ={intactQ}
              circQ={circQ}
              hasCohort={!!cohort}
            />
          ) : (
            <div style={{ padding: "3rem", textAlign: "center", color: C.dim }}>Loading comparison...</div>
          )}
          
          {pair.intactImpact && pair.circImpact && (
            <div style={{ borderTop: `1px solid ${C.ghost}`, marginTop: "1rem" }}>
              {intactNarratives && circNarratives ? (
                <MirrorNarrativeBlock 
                  intactQ={questionsMap[pair.intactImpact] || { id: pair.intactImpact }}
                  circQ={questionsMap[pair.circImpact] || { id: pair.circImpact }}
                  intactDist={intactNarratives}
                  circDist={circNarratives}
                  intactCohortDist={intactCohortNarratives}
                  circCohortDist={circCohortNarratives}
                  hasCohort={!!cohort}
                />
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: C.dim }}>Loading narrative impact...</div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PathwayBreakdown({ byPathway, overallDist = [] }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const results = byPathway.results || {};
  const pathwaysWithData = PATHWAY_IDS
    .filter((id) => results[id] && results[id].n > 0)
    .map((id) => ({ id, ...results[id] }));

  const colorMap = useMemo(() => {
    const map = {};
    if (overallDist) {
      overallDist.forEach((item, index) => {
        map[item.label] = colorForLabel(item.label, index);
      });
    }
    return map;
  }, [overallDist]);

  if (pathwaysWithData.length === 0) return null;

  return (
    <div style={{
      background: C.bgDeep,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.2rem",
      marginTop: "1.5rem"
    }}>
      <h3 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "1.1rem",
        color: C.textBright,
        marginBottom: "0.9rem",
        letterSpacing: "-0.01em",
      }}>Response Breakdown by Pathway</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {pathwaysWithData.map((p) => {
          const path = PATHWAYS[p.id];
          const total = p.distribution.reduce((s, d) => s + d.n, 0);

          const sortedDist = overallDist ? [...p.distribution].sort((a, b) => {
            const labelOrder = overallDist.map(item => item.label);
            let idxA = labelOrder.indexOf(a.label);
            let idxB = labelOrder.indexOf(b.label);
            if (idxA === -1) idxA = 999;
            if (idxB === -1) idxB = 999;
            return idxA - idxB;
          }) : p.distribution;

          let xCursor = 0;
          return (
            <div key={p.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                <IconifyEmoji emoji={path.emoji} size="0.85rem" style={{ color: path.color }} />
                <span style={{
                  fontFamily: FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: path.color,
                }}>{path.label}</span>
                <span style={{
                  fontFamily: FONT.mono,
                  fontSize: "0.66rem",
                  color: C.muted,
                }}>n = {total}</span>
              </div>
              <svg width="100%" height={12} style={{ display: "block", borderRadius: 2, overflow: "hidden" }}>
                <rect x={0} y={0} width="100%" height={12} fill={C.ghost} />
                {sortedDist.map((d, i) => {
                  const pct = (d.n / total) * 100;
                  const x = xCursor;
                  xCursor += pct;
                  
                  let canonicalIndex = overallDist.findIndex(od => od.label === d.label);
                  if (canonicalIndex === -1) canonicalIndex = i;

                  return (
                    <rect 
                      key={i} x={`${x}%`} y={0} width={`${pct}%`} height={12} fill={colorMap[d.label] || colorForLabel(d.label, canonicalIndex)}
                      onMouseEnter={(e) => showTooltip(e, `${d.label}: ${d.n} (${pct.toFixed(1)}%)`)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
}

function MirrorNarrativeBlock({ intactQ, circQ, intactDist, circDist, intactCohortDist, circCohortDist, hasCohort }) {
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  const getActiveNarratives = (fullDist, cohortDist) => {
    if (hasCohort) {
      return cohortDist?.narratives || [];
    }
    return fullDist?.narratives || [];
  };

  const intactNarratives = getActiveNarratives(intactDist, intactCohortDist);
  const circNarratives = getActiveNarratives(circDist, circCohortDist);

  const cleanFilter = (items) => {
    const fillers = [
      "n/a", "na", "no", "none", "nothing", "nil", "not applicable", 
      "no comment", "unsure", "unknown", "n.a", "n.a.", "none at all", 
      "no.", "no response", "don't know", "dont know", "no one", "not sure",
      "n a", "n / a", "none.", "no comments", "no comment.", "no one."
    ];
    return items.filter(item => {
      const text = item.text || item.label || "";
      const clean = text.trim().toLowerCase().replace(/^[.\s\-_,]+|[.\s\-_,]+$/g, "");
      return clean && !fillers.includes(clean);
    });
  };

  const cleanIntact = useMemo(() => cleanFilter(intactNarratives), [intactNarratives]);
  const cleanCirc = useMemo(() => cleanFilter(circNarratives), [circNarratives]);

  const randomIntact = useMemo(() => {
    if (cleanIntact.length === 0) return [];
    const shuffled = [...cleanIntact].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [cleanIntact, shuffleTrigger]);

  const randomCirc = useMemo(() => {
    if (cleanCirc.length === 0) return [];
    const shuffled = [...cleanCirc].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [cleanCirc, shuffleTrigger]);

  const renderQuoteCard = (item, idx, pathwayColor) => {
    let genStr = item.generation || "";
    if (genStr.includes("(born")) {
      genStr = genStr.split("(born")[0].trim();
    }
    if (genStr === "Boomer") genStr = "Baby Boomer";

    return (
      <div key={idx} style={{
        background: "var(--c-bgSoft)",
        border: `1px solid var(--c-ghost)`,
        borderLeft: `3px solid ${pathwayColor}`,
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "1.2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      }}>
        <div style={{
          color: "var(--c-muted)",
          fontSize: "0.65rem",
          fontFamily: FONT.condensed,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>{genStr || "Unknown Gen"}</span>
        </div>
        <p style={{
          margin: 0,
          fontFamily: FONT.display,
          fontStyle: "italic",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          color: "var(--c-textBright)"
        }}>
          "{item.text || item.label}"
        </p>
      </div>
    );
  };

  const hasResponses = cleanIntact.length > 0 || cleanCirc.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        
        {/* Left Column: Intact */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.intact, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Intact Pathway
            </h3>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
                Pool: {cleanIntact.length}
              </span>
              <span style={{ color: C.dim, fontSize: "0.7rem" }}>·</span>
              <a 
                href={hashLink("question", { id: intactQ.id })}
                style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  color: PATH_COLORS.intact,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  borderBottom: `1px solid ${PATH_COLORS.intact}40`,
                  paddingBottom: "0.1rem",
                  transition: "border-color 0.2s"
                }}
                onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.intact}
                onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.intact}40`}
              >
                See all →
              </a>
            </div>
          </div>
          
          {intactQ?.prompt && (
            <div style={{
              background: "rgba(255,255,255,0.01)",
              borderLeft: `3px solid ${PATH_COLORS.intact}`,
              borderRadius: "0 4px 4px 0",
              padding: "0.5rem 0.8rem",
              marginBottom: "0.2rem"
            }}>
              <p style={{
                margin: 0,
                fontFamily: FONT.body,
                fontSize: "0.85rem",
                lineHeight: 1.45,
                color: C.muted,
                fontStyle: "italic"
              }}>
                "{intactQ.prompt}"
              </p>
            </div>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {randomIntact.map((item, idx) => renderQuoteCard(item, idx, PATH_COLORS.intact))}
            {cleanIntact.length === 0 && (
              <div style={{ color: C.dim, fontStyle: "italic", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                No matching narrative responses.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Circumcised */}
        <div style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${C.ghost}`, paddingBottom: "0.5rem" }}>
            <h3 style={{ fontFamily: FONT.condensed, color: PATH_COLORS.circumcised, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Circumcised Pathway
            </h3>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.muted }}>
                Pool: {cleanCirc.length}
              </span>
              <span style={{ color: C.dim, fontSize: "0.7rem" }}>·</span>
              <a 
                href={hashLink("question", { id: circQ.id })}
                style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.72rem",
                  color: PATH_COLORS.circumcised,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  borderBottom: `1px solid ${PATH_COLORS.circumcised}40`,
                  paddingBottom: "0.1rem",
                  transition: "border-color 0.2s"
                }}
                onMouseOver={e => e.target.style.borderBottomColor = PATH_COLORS.circumcised}
                onMouseOut={e => e.target.style.borderBottomColor = `${PATH_COLORS.circumcised}40`}
              >
                See all →
              </a>
            </div>
          </div>

          {circQ?.prompt && (
            <div style={{
              background: "rgba(255,255,255,0.01)",
              borderLeft: `3px solid ${PATH_COLORS.circumcised}`,
              borderRadius: "0 4px 4px 0",
              padding: "0.5rem 0.8rem",
              marginBottom: "0.2rem"
            }}>
              <p style={{
                margin: 0,
                fontFamily: FONT.body,
                fontSize: "0.85rem",
                lineHeight: 1.45,
                color: C.muted,
                fontStyle: "italic"
              }}>
                "{circQ.prompt}"
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {randomCirc.map((item, idx) => renderQuoteCard(item, idx, PATH_COLORS.circumcised))}
            {cleanCirc.length === 0 && (
              <div style={{ color: C.dim, fontStyle: "italic", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                No matching narrative responses.
              </div>
            )}
          </div>
        </div>

      </div>

      {hasResponses && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
          <button
            onClick={() => setShuffleTrigger(s => s + 1)}
            style={{
              padding: "0.5rem 1.2rem",
              background: "transparent",
              border: `1px solid ${C.ghost}`,
              color: C.goldBright,
              borderRadius: 6,
              fontFamily: FONT.condensed,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = C.ghost;
              e.currentTarget.style.borderColor = C.gold;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = C.ghost;
            }}
          >
            <span>Shuffle Responses</span>
            <RefreshCw size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
