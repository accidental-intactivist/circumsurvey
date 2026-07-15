import React, { useEffect, useState, useCallback } from "react";
import { C, FONT, PATH_COLORS, resolveCssColor } from "../styles/tokens";
import { getResponseDistribution, getCount } from "../lib/api";
import SmallSampleBadge from "./SmallSampleBadge";
import IconifyEmoji from "./IconifyEmoji";

function SectionHeader({ number, title, subtitle, icon }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        marginBottom: "0.6rem",
      }}>
        <span style={{
          fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.18em",
          textTransform: "uppercase", color: C.goldBright, fontWeight: 700,
        }}>
          <IconifyEmoji emoji={icon} size="0.9rem" style={{marginRight: "0.2rem", transform: "translateY(-1px)"}} /> {number}
        </span>
      </div>
      <h2 style={{
        fontFamily: FONT.display, fontSize: "2rem", fontWeight: 700,
        color: C.textBright, margin: 0, lineHeight: 1.2, letterSpacing: "-0.015em",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontFamily: FONT.body, fontSize: "1rem", color: C.muted,
          lineHeight: 1.5, marginTop: "0.6rem", marginBottom: 0,
          maxWidth: 700, fontWeight: 300,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

const SNAPSHOT_DEFINITIONS = [
  {
    id: "respondents", label: "Total Respondents", big: true, span: 2, color: C.goldBright,
    fetch: () => getCount().then(d => ({ value: d.total, note: `${d.by_pathway?.circumcised || 0} circumcised ┬╖ ${d.by_pathway?.intact || 0} intact ┬╖ ${d.by_pathway?.restoring || 0} restoring ┬╖ ${d.by_pathway?.observer || 0} observing` })),
  },
  {
    id: "resentment_circ", qid: "circ_regret_feeling", label: "of circumcised men report strong, frequent resentment or grief about their circumcision", span: 2, color: C.red, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "resentment_restoring", qid: "circ_regret_feeling", label: "of restoring men report strong, frequent resentment ΓÇö the highest of any group", span: 2, color: C.red, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "restoring" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strong and frequent"));
      return { value: strong ? `${strong.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "keep_intact_restoring", qid: "final_child_decision_reason", label: "of restoring men say they would keep a future son intact ΓÇö a near-unanimous consensus", span: 1, color: C.green, attribution: "Q: Hypothetical Decision for a Son",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "restoring" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "keep_intact_circ", qid: "final_child_decision_reason", label: "of circumcised men would keep a future son intact", span: 1, color: C.green, attribution: "Q: Hypothetical Decision for a Son",
    fetch: () => getResponseDistribution("final_child_decision_reason", { pathway: "circumcised" }).then(d => {
      const intact = d.distribution?.find(x => x.label?.includes("remains intact"));
      return { value: intact ? `${intact.pct.toFixed(1)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "lube_circ", qid: "exp_lubrication_need", label: "of circumcised men say artificial lube is always or almost always needed", span: 1, color: C.blue, attribution: "Q: Artificial Lubrication Need",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "circumcised" }).then(d => {
      const always = d.distribution?.find(x => x.label?.includes("always or almost always"));
      return { value: always ? `${always.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "lube_intact", qid: "exp_lubrication_need", label: "of intact men never find artificial lubrication necessary", span: 1, color: C.blue, attribution: "Q: Artificial Lubrication Need",
    fetch: () => getResponseDistribution("exp_lubrication_need", { pathway: "intact" }).then(d => {
      const never = d.distribution?.find(x => x.label?.includes("Never find it necessary"));
      return { value: never ? `${never.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "sensitivity_gap", qid: "exp_sex_rating_sensitivity_light_touch", label: "avg. light-touch sensitivity: Intact vs Circumcised", span: 1, color: PATH_COLORS.intact, attribution: "Q: Light Touch Sensitivity Rating (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_sensitivity_light_touch", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "aesthetic_circ", qid: "final_aesthetic_preference", label: "of circumcised men actually prefer the intact aesthetic over their own", span: 2, color: C.ltBlue, attribution: "Q: Final Aesthetic Preference",
    fetch: () => getResponseDistribution("final_aesthetic_preference", { pathway: "circumcised" }).then(d => {
      const strong = d.distribution?.find(x => x.label?.includes("strongly prefer the appearance of the intact"))?.n || 0;
      const slight = d.distribution?.find(x => x.label?.includes("slightly prefer the appearance of the intact"))?.n || 0;
      const pct = d.n > 0 ? ((strong + slight) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "autonomy", qid: "final_core_principle_choice", label: "prioritize the child's right to bodily autonomy over parental/medical discretion", span: 1, color: C.purple, attribution: "Q: Final Core Principle Choice",
    fetch: () => getResponseDistribution("final_core_principle_choice").then(d => {
      const auto = d.distribution?.find(x => x.label?.includes("Bodily Autonomy"));
      return { value: auto ? `${auto.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
  {
    id: "pride_intact", qid: "exp_pride_satisfaction_rating", label: "of intact men feel very proud or satisfied with their status", span: 1, color: PATH_COLORS.intact, attribution: "Q: Pride and Satisfaction",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "intact" }).then(d => {
      const vp = d.distribution?.find(x => x.label?.includes("Very proud"))?.n || 0;
      const gp = d.distribution?.find(x => x.label?.includes("Generally proud"))?.n || 0;
      const pct = d.n > 0 ? ((vp + gp) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "dissatisfied_circ", qid: "exp_pride_satisfaction_rating", label: "of circumcised men feel somewhat or very dissatisfied with their status", span: 1, color: PATH_COLORS.circumcised, attribution: "Q: Pride and Satisfaction",
    fetch: () => getResponseDistribution("exp_pride_satisfaction_rating", { pathway: "circumcised" }).then(d => {
      const sd = d.distribution?.find(x => x.label?.includes("Somewhat dissatisfied"))?.n || 0;
      const vd = d.distribution?.find(x => x.label?.includes("Very dissatisfied"))?.n || 0;
      const pct = d.n > 0 ? ((sd + vd) / d.n * 100) : 0;
      return { value: `${pct.toFixed(0)}%`, n: d.n };
    }),
  },
  {
    id: "pleasure_mobile", qid: "exp_sex_rating_pleasure_mobile_skin", label: "avg. pleasure from mobile skin: Intact vs Circumcised", span: 1, color: PATH_COLORS.intact, attribution: "Q: Pleasure from Mobile Skin (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_pleasure_mobile_skin", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_pleasure_mobile_skin", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "ease_orgasm", qid: "exp_sex_rating_ease_of_orgasm", label: "avg. ease of orgasm: Intact vs Circumcised", span: 1, color: C.teal, attribution: "Q: Ease of Reaching Orgasm (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_ease_of_orgasm", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_ease_of_orgasm", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "variety_sensation", qid: "exp_sex_rating_variety_of_sensation", label: "avg. variety of sensation: Intact vs Circumcised", span: 1, color: C.purple, attribution: "Q: Variety of Sensation (1-5)",
    fetch: () => Promise.all([
      getResponseDistribution("exp_sex_rating_variety_of_sensation", { pathway: "intact" }),
      getResponseDistribution("exp_sex_rating_variety_of_sensation", { pathway: "circumcised" }),
    ]).then(([intact, circ]) => {
      const avg = (d) => {
        if (!d.distribution || d.n === 0) return 0;
        let sum = 0, total = 0;
        d.distribution.forEach(x => { const v = parseFloat(x.label); if (!isNaN(v)) { sum += v * x.n; total += x.n; } });
        return total > 0 ? sum / total : 0;
      };
      return { value: `${avg(intact).toFixed(1)} vs ${avg(circ).toFixed(1)}`, suffix: "/5", n: intact.n + circ.n };
    }),
  },
  {
    id: "never_regret_circ", qid: "circ_regret_feeling", label: "of circumcised men say they 'never' feel regret or resentment", span: 1, color: C.muted, attribution: "Q: Feelings of Regret/Resentment",
    fetch: () => getResponseDistribution("circ_regret_feeling", { pathway: "circumcised" }).then(d => {
      const never = d.distribution?.find(x => x.label?.includes("No, never"));
      return { value: never ? `${never.pct.toFixed(0)}%` : "ΓÇö", n: d.n };
    }),
  },
];

export default function SnapshotWall({ navigate, isWidget = false }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowSlots, setRowSlots] = useState([[], [], []]); // Array of 3 rows, each containing { id, uniqueKey, state }
  const [isHovered, setIsHovered] = useState(false);

  // Initial fetch
  useEffect(() => {
    Promise.all(
      SNAPSHOT_DEFINITIONS.map(def =>
        def.fetch()
          .then(result => ({ ...def, ...result }))
          .catch(() => ({ ...def, value: "ΓÇö", note: "Error loading" }))
      )
    ).then(results => {
      setSnapshots(results);
      setLoading(false);
      // Pick initial visible set strictly by spans:
      // Row 0: [2, 1]
      // Row 1: [1, 1, 1]
      // Row 2: [1, 2]
      const stats = results.filter(s => s.id !== "respondents");
      const span1 = stats.filter(s => s.span === 1).sort(() => 0.5 - Math.random());
      const span2 = stats.filter(s => s.span === 2).sort(() => 0.5 - Math.random());
      
      setRowSlots([
        [
          { id: span2.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() }
        ],
        [
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() }
        ],
        [
          { id: span1.pop().id, state: "idle", uniqueKey: Math.random() },
          { id: span2.pop().id, state: "idle", uniqueKey: Math.random() }
        ]
      ]);
    });
  }, []);

  // Cycle interval with sliding queue transitions per row
  useEffect(() => {
    if (loading || isHovered || snapshots.length === 0 || rowSlots[0].length === 0) return;
    
    // Check if ANY slot in ANY row is currently transitioning
    if (rowSlots.some(row => row.some(s => s.state !== "idle"))) return;

    const timer = setInterval(() => {
      // Pick a random row to update
      const targetRowIdx = Math.floor(Math.random() * 3);
      
      setRowSlots(prevRows => {
        const stats = snapshots.filter(s => s.id !== "respondents");
        // Collect all currently visible IDs across all rows
        const currentIds = prevRows.flatMap(row => row.map(s => s.id));
        const hidden = stats.filter(s => !currentIds.includes(s.id));
        if (hidden.length === 0) return prevRows; // nothing to swap
        
        const nextRows = [...prevRows];
        const targetRow = [...nextRows[targetRowIdx]];
        
        // Pick the OLDEST item in this row to leave (the last item in the array)
        const idleItems = targetRow.filter(s => s.state === "idle");
        if (idleItems.length === 0) return prevRows;
        const leavingSlot = idleItems[idleItems.length - 1];
        const leavingDef = snapshots.find(s => s.id === leavingSlot.id);
        
        // Find a hidden item with the SAME span to replace it
        const hiddenMatches = hidden.filter(s => s.span === leavingDef.span);
        if (hiddenMatches.length === 0) return prevRows; // no replacement available
        
        const inDef = hiddenMatches[Math.floor(Math.random() * hiddenMatches.length)];
        
        // Mark the leaving item as leaving
        const leaveIdx = targetRow.findIndex(s => s.uniqueKey === leavingSlot.uniqueKey);
        targetRow[leaveIdx] = { ...targetRow[leaveIdx], state: "leaving" };
        
        // Add entering item
        nextRows[targetRowIdx] = [{ id: inDef.id, state: "entering", uniqueKey: Math.random() }, ...targetRow];
        return nextRows;
      });

      // 1. Trigger the idle state for the new item so it animates in
      setTimeout(() => {
        setRowSlots(prevRows => {
          const nextRows = [...prevRows];
          nextRows[targetRowIdx] = nextRows[targetRowIdx].map((s, i) => i === 0 ? { ...s, state: "idle" } : s);
          return nextRows;
        });
      }, 50);

      // 2. Wait for the transition to finish, then remove leaving items
      setTimeout(() => {
        setRowSlots(prevRows => {
          const nextRows = [...prevRows];
          nextRows[targetRowIdx] = nextRows[targetRowIdx].filter(s => s.state !== "leaving");
          return nextRows;
        });
      }, 650);

    }, 4500);

    return () => clearInterval(timer);
  }, [loading, isHovered, snapshots, rowSlots]);

  if (loading) {
    return (
      <div className="snapshot-widget-container" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
        {!isWidget && <SectionHeader number="Section 1" title="At a Glance" subtitle="Key statistics from the dataset — the numbers that define the conversation." icon="★" />}
        <div style={{ padding: "4rem", textAlign: "center", color: C.muted, fontStyle: "italic" }}>
          Compiling snapshot statisticsΓÇª
        </div>
      </div>
    );
  }

  const totalSnap = snapshots.find(s => s.id === "respondents");

  return (
    <div className="snapshot-widget-container" style={{ scrollMarginTop: "2rem", marginBottom: "5rem" }}>
      <style>{`
        .snap-row-container {
          display: flex;
          flex-wrap: nowrap;
          margin: -0.6rem -0.6rem 0.6rem -0.6rem;
          overflow: hidden;
          container-type: inline-size;
        }
        @media (min-width: 768px) {
          .snap-row-container.reverse {
            flex-direction: row-reverse;
          }
        }
        
        .snap-outer {
          transition: margin 600ms ease-in-out, border-color 600ms ease-in-out;
          overflow: hidden;
          box-sizing: border-box;
          border-radius: 10px;
          background: ${C.bgCard};
          flex-shrink: 0;
          cursor: pointer;
        }
        
        .snap-outer.span-1 { width: calc(33.333cqw - 1.2rem); margin: 0.6rem; border: 1px solid ${C.ghost}; }
        .snap-outer.span-2 { width: calc(66.666cqw - 1.2rem); margin: 0.6rem; border: 1px solid ${C.ghost}; }
        
        /* Entering state pushes it off-screen to start */
        .snap-row-container:not(.reverse) .snap-outer.entering.span-1 { margin-left: calc(-33.333cqw + 0.6rem); }
        .snap-row-container:not(.reverse) .snap-outer.entering.span-2 { margin-left: calc(-66.666cqw + 0.6rem); }
        
        .snap-row-container.reverse .snap-outer.entering.span-1 { margin-right: calc(-33.333cqw + 0.6rem); }
        .snap-row-container.reverse .snap-outer.entering.span-2 { margin-right: calc(-66.666cqw + 0.6rem); }

        .snap-inner {
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          min-height: 140px;
          box-sizing: border-box;
        }
        .span-1 .snap-inner { width: calc(33.333cqw - 1.2rem); min-width: 220px; }
        .span-2 .snap-inner { width: calc(66.666cqw - 1.2rem); min-width: 440px; }
      `}</style>
      
      {!isWidget && <SectionHeader number="Section 1" title="At a Glance" subtitle="Key statistics from the dataset — the numbers that define the conversation." icon="★" />}

      {/* Hero stat: total respondents */}
      {(!isWidget && totalSnap) && (
        <SmallSampleBadge n={parseInt(String(totalSnap.value).replace(/,/g, '')) || 0} label="the current cohort">
        <div style={{
          background: C.bgCard, border: `1px solid ${resolveCssColor(totalSnap.color || C.ghost)}`, borderRadius: 12,
          padding: "2rem 2.5rem", marginBottom: "1.5rem", textAlign: "center",
          boxShadow: `0 4px 20px ${resolveCssColor(totalSnap.color || C.gold).replace(')', ', 0.15)').replace('rgb', 'rgba')}`,
        }}>
          <div style={{
            fontFamily: FONT.mono, fontSize: "4.5rem", fontWeight: 800,
            color: resolveCssColor(totalSnap.color || C.goldBright), lineHeight: 1,
            textShadow: `0 0 30px ${resolveCssColor(totalSnap.color || C.gold).replace(')', ', 0.25)').replace('rgb', 'rgba')}`,
          }}>
            {totalSnap.value}
          </div>
          <div style={{
            fontFamily: FONT.condensed, fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: C.muted, marginTop: "0.5rem", fontWeight: 700,
          }}>
            {totalSnap.label}
          </div>
          {totalSnap.note && (
            <div style={{
              fontFamily: FONT.mono, fontSize: "0.68rem", color: C.dim, marginTop: "0.5rem",
            }}>
              {totalSnap.note}
            </div>
          )}
        </div>
        </SmallSampleBadge>
      )}

      {/* Dynamic Cycling Flexbox Queue Grid - 3 Rows */}
      <div 
        style={{ display: "flex", flexDirection: "column" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {rowSlots.map((row, rIdx) => (
          <div key={rIdx} className={`snap-row-container ${rIdx === 1 ? 'reverse' : ''}`}>
            {row.map((slot) => {
              const snap = snapshots.find(s => s.id === slot.id);
              if (!snap) return null;
              
              const themeColor = snap.color || C.gold;
              
              return (
                <div key={slot.uniqueKey} className={`snap-outer ${slot.state} ${snap.span === 2 ? 'span-2' : 'span-1'}`}
                  onClick={() => {
                    if (snap.qid) {
                      if (isWidget) {
                        window.location.href = `/explore#/q/${snap.qid}`;
                      } else {
                        navigate("question", { id: snap.qid });
                      }
                    }
                  }}
                  onMouseEnter={e => {
                    if (slot.state !== "idle") return; // don't animate hover while transitioning
                    e.currentTarget.style.borderColor = resolveCssColor(themeColor);
                    e.currentTarget.style.boxShadow = `0 6px 24px ${resolveCssColor(themeColor).replace('hsl(', 'hsla(').replace('rgb(', 'rgba(').replace(')', ', 0.15)')}`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    if (slot.state !== "idle") return;
                    e.currentTarget.style.borderColor = resolveCssColor(C.ghost);
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <div className="snap-inner">
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 3,
                      background: resolveCssColor(themeColor), opacity: 0.7
                    }} />
                    
                    <div style={{
                      fontFamily: FONT.mono, fontSize: typeof snap.value === "string" && snap.value.includes("vs") ? "2rem" : "2.8rem", fontWeight: 800,
                      color: resolveCssColor(themeColor), lineHeight: 1,
                      letterSpacing: "-0.03em", whiteSpace: "nowrap"
                    }}>
                      {snap.value}
                      {snap.suffix && <span style={{ fontSize: "1rem", color: resolveCssColor(C.muted), marginLeft: "0.3rem", fontWeight: 600 }}>{snap.suffix}</span>}
                    </div>
                    <div style={{
                      fontFamily: FONT.body, fontSize: "0.85rem", color: C.text,
                      lineHeight: 1.4, marginTop: "0.8rem", flex: 1, fontWeight: 500
                    }}>
                      {snap.label}
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                      marginTop: "1.2rem", paddingTop: "0.8rem", borderTop: `1px solid ${C.ghost}`
                    }}>
                      {snap.attribution && (
                        <div style={{
                          fontFamily: FONT.condensed, fontSize: "0.65rem", color: C.dim,
                          textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap"
                        }}>
                          {snap.attribution}
                        </div>
                      )}
                      {snap.n && (
                        <div style={{
                          fontFamily: FONT.mono, fontSize: "0.6rem", color: C.dim,
                        }}>
                          n={snap.n}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div style={{
        textAlign: "right", marginTop: "1rem", fontFamily: FONT.condensed, 
        fontSize: "0.65rem", color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase"
      }}>
        {isHovered ? "ΓÅ╕ Cycling paused" : "Γû╢ Auto-cycling statistics..."}
      </div>
    </div>
  );
}
