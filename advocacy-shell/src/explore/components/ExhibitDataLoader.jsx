import { useState, useEffect } from "react";
import { C } from "../styles/tokens";
import { flattenMultiSelect } from "../lib/formatters";
import { getResponseDistribution, getNarratives } from "../lib/api";
import DistributionChart from "./DistributionChart";
import NarrativeList from "./NarrativeList";
import SmallSampleBadge from "./SmallSampleBadge";
import HarmonicLoader from "./HarmonicLoader";

// Questions tagged as multi_select in the DB but whose responses are actually
// free-text narratives. They should NOT be comma-split by flattenMultiSelect.
export const NARRATIVE_MULTI_SELECT = new Set([
  "religion_jewish_alternatives_thoughts",
  "religion_jewish_diversity_view",
  "religion_jewish_brit_shalom_awareness",
  "religion_islamic_alternatives_thoughts",
  "religion_islamic_intact_reconciliation",
]);

export default function ExhibitDataLoader({ 
  question, 
  cohort,
  shortenLabels, 
  hideLegend, 
  forceChartType, 
  customColorMap, 
  bare,
  height,
  hideHeader
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Treat narrative multi-selects as open_text for API endpoint selection
  const effectiveType = NARRATIVE_MULTI_SELECT.has(question?.id) ? "open_text" : question?.type;

  useEffect(() => {
    if (!question) return;
    let cancelled = false;
    setLoading(true);

    const promise = effectiveType === "open_text" 
      ? getNarratives(question.id, { cohort })
      : getResponseDistribution(question.id, { cohort });

    promise
      .then(d => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("DataLoader fetch failed:", err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [question?.id, effectiveType, JSON.stringify(cohort)]);

  if (loading) return <HarmonicLoader text={`Retrieving Data...`} />;
  if (!data) return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem" }}>No data.</div>;

  const dist = effectiveType === "open_text" ? data.narratives : data.distribution;
  if (!dist || dist.length === 0) {
    return <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.82rem", padding: "0.5rem" }}>No responses.</div>;
  }

  const isMulti = question.type === "multi_select" || ["demo_ethnicity", "demo_race_ethnicity", "demo_gender_identity", "demo_sexuality", "observe_advocate_primary_role"].includes(question.id);
  const chartData = isMulti && effectiveType !== "open_text" ? {
    ...data,
    distribution: flattenMultiSelect(dist, question)
  } : data;

  const quantTotal = effectiveType !== "open_text" && dist ? dist.reduce((acc, curr) => acc + curr.n, 0) : 0;

  return effectiveType === "open_text" ? (
    <div style={{ height: height || "100%", overflowY: "auto", paddingRight: "0.25rem", marginTop: "-0.5rem" }}>
      <NarrativeList 
        question={question} 
        distribution={dist} 
        hideChart={true} 
        viewMode={bare ? "side-by-side" : "list"} 
        cohort={cohort}
      />
    </div>
  ) : (
    <SmallSampleBadge n={quantTotal} label="this group" inline={bare}>
      <DistributionChart 
        title="" 
        distribution={chartData} 
        cohortDistribution={null} 
        question={question}
        hideHeader={hideHeader !== undefined ? hideHeader : true}
        hideLegend={hideLegend}
        shortenLabels={shortenLabels}
        forceChartType={forceChartType}
        customColorMap={customColorMap}
        bare={bare}
        cohort={cohort}
      />
    </SmallSampleBadge>
  );
}
