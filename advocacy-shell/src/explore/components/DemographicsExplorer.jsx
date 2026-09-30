import { useState, useMemo } from "react";
import { C, FONT } from "../styles/tokens";
import {
  DEMOGRAPHIC_DIMENSIONS,
  DEMOGRAPHIC_BASE_RATE,
  DEMOGRAPHIC_OUTLIERS,
  DEMOGRAPHIC_META,
} from "../../demographics";

export default function DemographicsExplorer({ isBureauCard = false }) {
  const [selectedDim, setSelectedDim] = useState("family_politics");
  const [sortMode, setSortMode] = useState("natural"); // natural | intact | size

  const currentDim = DEMOGRAPHIC_DIMENSIONS.find(d => d.id === selectedDim) || DEMOGRAPHIC_DIMENSIONS[0];
  const baseRate = DEMOGRAPHIC_BASE_RATE;

  // Sort categories based on current mode
  const categories = useMemo(() => {
    const cats = [...currentDim.categories];
    if (sortMode === "intact") {
      cats.sort((a, b) => b.pct_intact - a.pct_intact);
    } else if (sortMode === "size") {
      cats.sort((a, b) => b.total - a.total);
    }
    return cats;
  }, [currentDim, sortMode]);

  // Find max bar width for proportional rendering — use count of largest category
  const maxTotal = Math.max(...categories.map(c => c.total), 1);

  // Colors for the two outcome segments (stacked)
  const colorIntact = "var(--path-intact, #5b93c7)";      // blue
  const colorCirc = "var(--path-circumcised, #d94f4f)";    // red
  const colorBase = isBureauCard ? "#eae4da" : "color-mix(in srgb, var(--c-bg) 50%, transparent)"; // neutral fill

  // Dynamic style values based on context
  const textTitle = isBureauCard ? "#2a2622" : C.textBright;     // C.paperInk vs textBright
  const textBody = isBureauCard ? "#3a3530" : C.text;           // C.paperSubtle vs text
  const textMuted = isBureauCard ? "#5a5450" : C.dim;           // C.paperDim vs dim
  const accentGold = isBureauCard ? "#d4a030" : C.gold;
  const accentBlue = isBureauCard ? "#5b93c7" : C.blue;
  const cardBorder = isBureauCard ? "#d4cfc4" : C.ghost;        // C.paperRuleDash vs ghost
  const bgSoft = isBureauCard ? "rgba(255,255,255,0.6)" : "color-mix(in srgb, var(--c-bg) 60%, transparent)";
  const bgHover = isBureauCard ? "rgba(255,255,255,0.95)" : "color-mix(in srgb, var(--c-ghost) 20%, transparent)";
  const activeBg = isBureauCard ? "#2a2622" : C.textBright;
  const activeText = isBureauCard ? "#faf6f0" : C.bg;

  return (
    <div style={{ padding: isBureauCard ? "0" : "1.5rem" }}>
      {/* Intro copy */}
      <h3 style={{
        fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.display,
        fontWeight: isBureauCard ? 800 : 700,
        fontSize: "clamp(1.3rem, 2vw, 1.65rem)",
        color: textTitle,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
        marginBottom: "0.75rem",
      }}>Why did <em>outlier parents</em> leave us intact, while so many were convinced otherwise?</h3>

      <p style={{
        fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.body,
        fontWeight: 400,
        fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
        color: textBody,
        lineHeight: 1.7,
        marginBottom: "1.5rem",
      }}>
        Routine infant circumcision is the default in American hospitals. But not every family
        followed the default. Slice the respondent pool by the demographic signals that shape
        parenting decisions — politics, education, religion, generation, country — and a portrait
        of the "outlier parent" begins to emerge.
      </p>

      {/* Base rate context banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: "rgba(91,147,199,0.06)",
        borderLeft: `3px solid ${accentBlue}`,
        borderRadius: "0 4px 4px 0",
        padding: "0.85rem 1.15rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}>
        <div style={{
          fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: accentBlue,
        }}>Overall base rate</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.9rem",
          fontWeight: 700,
          color: textTitle,
        }}>
          <span style={{ color: colorIntact }}>{baseRate.pct_intact}% intact</span>
          {" · "}
          <span style={{ color: colorCirc }}>{baseRate.pct_circumcised}% circumcised</span>
          {" · "}
          <span style={{ color: textMuted }}>n = {baseRate.total}</span>
        </div>
        <div style={{
          flex: 1,
          minWidth: 200,
          fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
          fontSize: "0.75rem",
          fontStyle: "italic",
          color: textMuted,
          lineHeight: 1.5,
        }}>
          Self-selected sample. The broader U.S. rate is higher. This tool shows variation{" "}
          <em>within our respondents</em>, not absolute circumcision prevalence.
        </div>
      </div>

      {/* Dimension selector */}
      <div style={{
        fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: accentGold,
        marginBottom: "0.6rem",
      }}>Slice by dimension:</div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        marginBottom: "1.25rem",
      }}>
        {DEMOGRAPHIC_DIMENSIONS.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDim(d.id)}
            style={{
              padding: "0.5rem 0.95rem",
              border: `1.5px solid ${d.id === selectedDim ? activeBg : cardBorder}`,
              borderRadius: 20,
              background: d.id === selectedDim ? activeBg : bgSoft,
              color: d.id === selectedDim ? activeText : textBody,
              fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (d.id !== selectedDim) e.currentTarget.style.background = bgHover;
            }}
            onMouseLeave={(e) => {
              if (d.id !== selectedDim) e.currentTarget.style.background = bgSoft;
            }}
          >{d.short}</button>
        ))}
      </div>

      {/* Sort toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "1.25rem",
      }}>
        <span style={{
          fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: textMuted,
          fontWeight: 700,
        }}>Sort:</span>
        {[
          { id: "natural", label: "Natural order" },
          { id: "intact",  label: "% Intact (high→low)" },
          { id: "size",    label: "Sample size" },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setSortMode(opt.id)}
            style={{
              padding: "0.35rem 0.7rem",
              background: "transparent",
              border: "none",
              borderBottom: opt.id === sortMode ? `2px solid ${accentGold}` : "2px solid transparent",
              color: opt.id === sortMode ? textTitle : textMuted,
              fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
              fontWeight: opt.id === sortMode ? 700 : 400,
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >{opt.label}</button>
        ))}
      </div>

      {/* Dimension title */}
      <div style={{
        fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.display,
        fontWeight: 700,
        fontSize: "1.2rem",
        color: textTitle,
        marginBottom: "0.3rem",
      }}>{currentDim.label}</div>
      {currentDim.note && (
        <div style={{
          fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
          fontSize: "0.75rem",
          fontStyle: "italic",
          color: textMuted,
          marginBottom: "0.5rem",
        }}>{currentDim.note}</div>
      )}

      {/* The bar chart */}
      <div style={{ marginTop: "0.75rem", marginBottom: "1.5rem" }}>
        {categories.map((cat) => {
          const relativeWidth = Math.max((cat.total / maxTotal) * 100, 8); // floor at 8% for readability
          const deviation = cat.pct_intact - baseRate.pct_intact;
          const segWidthEstimate = (relativeWidth / 100) * 720;
          const intactLabelFits = (cat.pct_intact / 100) * segWidthEstimate >= 32;
          const circLabelFits   = (cat.pct_circumcised / 100) * segWidthEstimate >= 32;
          return (
            <div key={cat.category} style={{ marginBottom: "0.95rem" }}>
              {/* Header row: label + stats */}
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}>
                <div style={{
                  fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: textTitle,
                  flex: 1,
                  minWidth: 180,
                }}>{cat.category}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.78rem",
                  color: textMuted,
                  whiteSpace: "nowrap",
                }}>
                  {cat.pct_intact}% intact
                  {" · "}
                  n = {cat.total}
                  {" · "}
                  <span style={{
                    color: deviation > 3 ? colorIntact : deviation < -3 ? colorCirc : textMuted,
                    fontWeight: 700,
                  }}>
                    {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}pp
                  </span>
                </div>
              </div>

              {/* Stacked bar — intact (blue) vs circumcised (red) */}
              <div style={{
                position: "relative",
                height: 24,
                width: `${relativeWidth}%`,
                background: colorBase,
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                minWidth: 140,
              }}>
                <div style={{
                  width: `${cat.pct_intact}%`,
                  background: colorIntact,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.95)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}>
                  {intactLabelFits ? `${cat.pct_intact}%` : ""}
                </div>
                <div style={{
                  width: `${cat.pct_circumcised}%`,
                  background: colorCirc,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.95)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}>
                  {circLabelFits ? `${cat.pct_circumcised}%` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "1.25rem",
        fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
        fontSize: "0.72rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: textMuted,
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 12, height: 12, background: colorIntact, borderRadius: 2 }} /> Intact
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ width: 12, height: 12, background: colorCirc, borderRadius: 2 }} /> Circumcised (incl. restoring)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontWeight: 700, color: textMuted }}>pp vs base</span> = percentage points above / below the {baseRate.pct_intact}% baseline
        </span>
      </div>

      {/* Outlier insights panel */}
      <div style={{
        background: "rgba(212,160,48,0.06)",
        border: `1px solid ${cardBorder}`,
        borderLeft: `4px solid ${accentGold}`,
        borderRadius: "0 4px 4px 0",
        padding: "1.25rem 1.5rem",
        marginBottom: "0.5rem",
      }}>
        <div style={{
          fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accentGold,
          marginBottom: "0.5rem",
        }}>★ Outlier Signal</div>
        <div style={{
          fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.display,
          fontWeight: 700,
          fontSize: "1.05rem",
          color: textTitle,
          lineHeight: 1.3,
          marginBottom: "0.85rem",
        }}>Which dimensions most distinguish households that kept their boys intact?</div>
        <div style={{
          fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
          fontSize: "0.85rem",
          color: textBody,
          lineHeight: 1.65,
        }}>
          Ranked by the <em>spread</em> between the most-intact and least-intact categories within
          each dimension. Larger spread = stronger signal.
        </div>

        <ol style={{
          listStyle: "none",
          padding: 0,
          margin: "1rem 0 0 0",
          counterReset: "outlier",
        }}>
          {DEMOGRAPHIC_OUTLIERS.slice(0, 6).map((o, i) => (
            <li
              key={o.dimension_id}
              onClick={() => setSelectedDim(o.dimension_id)}
              style={{
                counterIncrement: "outlier",
                padding: "0.65rem 0",
                borderBottom: i < 5 ? `1px dashed ${cardBorder}` : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.display,
                fontWeight: 800,
                fontSize: "1.4rem",
                color: accentGold,
                width: 28,
                flexShrink: 0,
              }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: textMuted,
                  marginBottom: "0.15rem",
                }}>{o.dimension_label}  ·  Spread {o.spread}pp</div>
                <div style={{
                  fontFamily: isBureauCard ? "'Playfair Display', serif" : FONT.body,
                  fontWeight: 400,
                  fontSize: "0.92rem",
                  color: textTitle,
                  lineHeight: 1.4,
                }}>
                  <strong style={{ color: colorIntact, fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body, fontWeight: 700 }}>{o.most_intact_pct}% intact</strong>
                  {" "}among{" "}
                  <em>{o.most_intact_category}</em>
                  {" "}(n={o.most_intact_n})
                  {" "}vs.{" "}
                  <strong style={{ color: colorCirc, fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body, fontWeight: 700 }}>{o.least_intact_pct}%</strong>
                  {" "}among{" "}
                  <em>{o.least_intact_category}</em>
                  {" "}(n={o.least_intact_n})
                </div>
              </div>
              <span style={{
                fontFamily: isBureauCard ? "'Barlow Condensed', sans-serif" : FONT.condensed,
                fontSize: "0.68rem",
                color: accentGold,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
                flexShrink: 0,
              }}>View →</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reflection pull quote */}
      {isBureauCard && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1.25rem 1.5rem",
          background: "rgba(91,147,199,0.06)",
          borderLeft: `3px solid ${accentBlue}`,
          borderRadius: "0 4px 4px 0",
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "1rem",
            color: textBody,
            lineHeight: 1.65,
          }}>
            My own parents made a "conscious choice" in the 1970s, waving off a life-altering procedure that 90% of my peers went through. Today, we can say that choice has finally become mainstream. Thanks to a significant historical decrease, routine infant circumcision (RIC) is officially a minority procedure in the United States. Neonatal rates have dropped below 49%—a decline famously lamented in a Johns Hopkins press release. Yet, nearly 50% of parents still opt for it. For what? Modern neuroscience and anatomical evidence unequivocally support the obvious claim that removing highly sensitive, functional tissue dictates dysfunction. Expectant parents and medical professionals are finally choosing a question mark over the default.
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: textMuted,
            marginTop: "0.85rem",
            fontWeight: 700,
          }}>— Tone Pettit, Lead Researcher</div>
        </div>
      )}

      {/* Methodology note */}
      <div style={{
        marginTop: "1.5rem",
        fontFamily: isBureauCard ? "'Barlow', sans-serif" : FONT.body,
        fontSize: "0.72rem",
        color: textMuted,
        lineHeight: 1.55,
        fontStyle: "italic",
      }}>
        Aggregates shown include only respondents with a classified pathway
        (intact, circumcised, or restoring; n = {baseRate.total}). Observer pathway respondents
        are excluded from this view since their demographics describe themselves, not a
        circumcision decision made about them. Minimum cell size: {DEMOGRAPHIC_META.minCellSize}.
        Smaller cells are combined into "Other" to protect anonymity.
      </div>
    </div>
  );
}
