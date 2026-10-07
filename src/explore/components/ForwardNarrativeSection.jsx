import React, { useState, useEffect } from "react";
import { C, FONT } from "../styles/tokens";
import { getNarratives } from "../lib/api";
import WordCloud from "./WordCloud";
import NarrativeList from "./NarrativeList";
import PathwayChips from "./PathwayChips";

export default function ForwardNarrativeSection({ qid, title, prompt, highlightedPrompt, cohort, color }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const [localPathway, setLocalPathway] = useState(() => {
    if (typeof cohort === "string") return cohort;
    return cohort?.pathway || null;
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);

    let fetchCohort = null;
    if (typeof cohort === "object" && cohort !== null) {
      fetchCohort = { ...cohort };
    } else if (typeof cohort === "string") {
      // Ignore string cohort here, as it's just pathway
      fetchCohort = {};
    } else {
      fetchCohort = {};
    }

    if (localPathway) {
      fetchCohort.pathway = localPathway;
    } else {
      delete fetchCohort.pathway;
    }

    getNarratives(qid, { cohort: Object.keys(fetchCohort).length > 0 ? fetchCohort : null })
      .then(d => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [qid, cohort, localPathway]);

  return (
    <div style={{ marginBottom: "5rem" }}>
      <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.5rem", color: color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>
        {title}
      </h2>
      <p style={{ fontFamily: FONT.display, fontSize: "1.35rem", color: C.textBright, fontStyle: "normal", maxWidth: 900, marginBottom: "2.5rem", lineHeight: 1.4 }}>
        "{highlightedPrompt || prompt}"
      </p>

      {/* Local Pathway Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "flex-start" }}>
        <PathwayChips 
          selected={localPathway} 
          onSelect={setLocalPathway} 
          compact={true} 
        />
      </div>

      {loading && <div style={{ color: C.dim, padding: "2rem", fontStyle: "italic", textAlign: "center" }}>Loading responses...</div>}
      {!loading && data && data.narratives && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.ghost}`, borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <WordCloud 
            narratives={data.narratives} 
            selectedWord={selectedWord} 
            onWordClick={(w) => setSelectedWord(w === selectedWord ? null : w)} 
          />
          <div style={{ marginTop: "1.5rem" }}>
            <NarrativeList 
              distribution={data.narratives} 
              highlightWord={selectedWord} 
              hideChart={true} 
              question={{ id: qid, prompt }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
