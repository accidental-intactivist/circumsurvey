// ═══════════════════════════════════════════════════════════════════════════
// CulturalAlignmentMatrix — shared core component
//
// Renders a 4×5 heatmap of Pathway × Cultural Norm, colored by standardized
// residual (over/under-representation vs chance). Below the matrix, three
// "story" callout cards highlight the most notable cells.
//
// Can operate in two modes:
//   • editorial: you pass in `data` + `stories` as props (findings site)
//   • live:      pass `fetchUrl` + optional `cohortFilter` (explore site)
//
// Self-styled with inline CSS-in-JS — no external token file needed.
// Colors match the findings / explore design language exactly.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";

// ── Design tokens (inline — matches findings / explore palette) ────────────
const C = {
  bg: "#0a0a0c",
  bgSoft: "#131316",
  bgCard: "#18181c",
  text: "#eee",
  textBright: "#fff",
  muted: "#999",
  dim: "#555",
  ghost: "#2a2a30",
  gold: "#d4a030",
  goldBright: "#e8b840",
  red: "#d94f4f",
  blue: "#5b93c7",
  green: "#68b878",
};
const FONT = {
  display: "'Playfair Display', serif",
  body: "'Barlow', sans-serif",
  condensed: "'Barlow Condensed', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ── Column schema (ordered left → right: intact-norm → circ-norm) ──────────
// These are the canonical answer strings from D1 — must match exactly.
export const NORM_COLUMNS = [
  {
    key: "I+",
    short: "Intact overwhelming",
    label: "Intact is the overwhelming standard",
    match: "The intact state is overwhelmingly seen as the normal and expected standard.",
  },
  {
    key: "I",
    short: "Intact emerging",
    label: "Intact is becoming the new standard",
    match: "The intact state is generally seen as more normal or is becoming the new standard.",
  },
  {
    key: "=",
    short: "Both equally",
    label: "Both seen as equally acceptable",
    match: "Both are seen as equally normal and acceptable.",
  },
  {
    key: "C",
    short: "Circ favored",
    label: "Circumcised state is socially advantageous",
    match: "The circumcised state is generally seen as more normal and socially advantageous.",
  },
  {
    key: "C+",
    short: "Circ overwhelming",
    label: "Circumcised state is the overwhelming standard",
    match: "The circumcised state is overwhelmingly seen as the normal and expected standard.",
  },
];

// ── Row schema ─────────────────────────────────────────────────────────────
export const PATHWAY_ROWS = [
  { key: "intact", label: "Intact", color: "#5b93c7" },
  { key: "circumcised", label: "Circumcised", color: "#d94f4f" },
  { key: "restoring", label: "Restoring", color: "#e8c868" },
  { key: "observer", label: "Observer", color: "#e8a44a" },
];

// The aggregate API returns observers as `unknown` (they have NULL pathway_state).
// This helper normalizes that key.
const pathwayKeyFromApi = (k) => (k === "unknown" || k == null ? "observer" : k);

// ── Residual math ──────────────────────────────────────────────────────────
// Given the full matrix of observed counts, computes:
//   rowTotals, colTotals, N, expected, residuals, stdResiduals (Pearson z)
export function computeResiduals(observed) {
  const rowTotals = {};
  const colTotals = {};
  let N = 0;
  for (const p of PATHWAY_ROWS) {
    rowTotals[p.key] = 0;
    for (const c of NORM_COLUMNS) {
      const v = observed[p.key]?.[c.key] || 0;
      rowTotals[p.key] += v;
      colTotals[c.key] = (colTotals[c.key] || 0) + v;
      N += v;
    }
  }
  const cells = {};
  for (const p of PATHWAY_ROWS) {
    cells[p.key] = {};
    for (const c of NORM_COLUMNS) {
      const obs = observed[p.key]?.[c.key] || 0;
      const exp = N > 0 && rowTotals[p.key] > 0 && colTotals[c.key] > 0
        ? (rowTotals[p.key] * colTotals[c.key]) / N
        : 0;
      const residual = obs - exp;
      const z = exp > 0 ? residual / Math.sqrt(exp) : 0;
      cells[p.key][c.key] = { obs, exp, residual, z };
    }
  }
  return { rowTotals, colTotals, N, cells };
}

// Convert aggregate API response → observed matrix
export function aggregateToObserved(aggregateResults) {
  const observed = {};
  for (const p of PATHWAY_ROWS) observed[p.key] = {};
  for (const [rawPathway, val] of Object.entries(aggregateResults || {})) {
    const pathKey = pathwayKeyFromApi(rawPathway);
    if (!observed[pathKey]) continue;
    for (const d of val.distribution || []) {
      const col = NORM_COLUMNS.find((c) => c.match === d.label);
      if (col) observed[pathKey][col.key] = (observed[pathKey][col.key] || 0) + d.n;
    }
  }
  return observed;
}

// ── Color scale (diverging: teal = over, red = under) ──────────────────────
function cellStyle(z) {
  // Returns { bg, fg } for the cell based on standardized residual magnitude
  const abs = Math.abs(z);
  if (abs < 0.5) return { bg: C.ghost, fg: C.muted };
  if (z > 0) {
    if (abs >= 1.5) return { bg: "#1d9e75", fg: "#e1f5ee" };  // strong over — teal 400
    return { bg: "#0f6e56", fg: "#9fe1cb" };                  // mild over — teal 600
  } else {
    if (abs >= 1.5) return { bg: "#a32d2d", fg: "#fcebeb" };  // strong under — red 600
    return { bg: "#791f1f", fg: "#f7c1c1" };                  // mild under — red 800
  }
}

// ── Auto-story generation (used in interactive/explore mode) ───────────────
// Given a computed matrix, returns the 3 most notable cells as story objects
export function generateStories(residualsData) {
  const { cells } = residualsData;
  const all = [];
  for (const p of PATHWAY_ROWS) {
    for (const c of NORM_COLUMNS) {
      const cell = cells[p.key][c.key];
      if (cell.obs < 3) continue; // skip tiny cells — not interesting
      all.push({ pathway: p, column: c, ...cell });
    }
  }
  all.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  return all.slice(0, 3).map((s) => ({
    pathway: s.pathway.key,
    columnKey: s.column.key,
    headline: `${s.obs} ${s.pathway.label.toLowerCase()} respondents · "${s.column.short}" culture`,
    body: s.z > 0
      ? `Overrepresented by ${Math.abs(s.residual).toFixed(0)} people vs chance (z = +${s.z.toFixed(2)}). Expected ~${s.exp.toFixed(0)}.`
      : `Underrepresented by ${Math.abs(s.residual).toFixed(0)} people vs chance (z = ${s.z.toFixed(2)}). Expected ~${s.exp.toFixed(0)}.`,
    direction: s.z > 0 ? "over" : "under",
  }));
}

// ── Main component ────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {object} [props.observed] - Pre-computed observed matrix: {pathway: {colKey: n}}
 * @param {string} [props.fetchUrl] - If provided, fetches live data from this URL
 * @param {string} [props.cohortLabel] - Display label for active cohort filter
 * @param {Array} [props.stories] - Override stories (editorial mode)
 * @param {boolean} [props.autoStories=true] - Auto-generate stories from top |z| cells
 * @param {string} [props.title] - Heading text
 * @param {string} [props.subtitle] - Subtitle text
 * @param {string} [props.eyebrow] - Eyebrow text above title
 * @param {boolean} [props.showLegend=true]
 * @param {function} [props.onCellClick] - Click handler: (pathway, column, cell) => void
 */
export default function CulturalAlignmentMatrix({
  observed: observedProp,
  fetchUrl,
  cohortLabel,
  stories: storiesProp,
  autoStories = true,
  title = "Cultural alignment & defiance",
  subtitle = "How each respondent's body maps onto their culture's expectation. Cells are colored by standardized residual — how much higher or lower the count is than pure chance would predict.",
  eyebrow = "Pathway × Cultural Norm",
  showLegend = true,
  onCellClick,
}) {
  const [fetched, setFetched] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(!!fetchUrl && !observedProp);

  // Fetch live data if fetchUrl provided
  useEffect(() => {
    if (!fetchUrl || observedProp) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch(fetchUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setFetched(aggregateToObserved(data.results || {}));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setFetchError(e.message || String(e));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchUrl, observedProp]);

  const observed = observedProp || fetched;

  const residuals = useMemo(() => {
    if (!observed) return null;
    return computeResiduals(observed);
  }, [observed]);

  const stories = useMemo(() => {
    if (storiesProp) return storiesProp;
    if (autoStories && residuals) return generateStories(residuals);
    return [];
  }, [storiesProp, autoStories, residuals]);

  return (
    <div style={{
      fontFamily: FONT.body,
      color: C.text,
      background: "transparent",
      maxWidth: 820,
      margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .cam-matrix { width: 100%; border-collapse: separate; border-spacing: 3px; table-layout: fixed; }
        .cam-matrix th, .cam-matrix td { padding: 0; }
        .cam-cell { border-radius: 6px; padding: 12px 4px; text-align: center; line-height: 1.2; transition: transform 0.15s; }
        .cam-cell.clickable { cursor: pointer; }
        .cam-cell.clickable:hover { transform: scale(1.05); }
      `}</style>

      {/* Eyebrow + title */}
      {eyebrow && (
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.35rem",
        }}>★ {eyebrow} ★</div>
      )}
      <h2 style={{
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
        color: C.textBright,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        marginBottom: "0.4rem",
      }}>{title}</h2>
      <p style={{
        fontFamily: FONT.body,
        fontSize: "0.92rem",
        color: C.muted,
        lineHeight: 1.55,
        marginBottom: "1.5rem",
        maxWidth: 720,
      }}>{subtitle}</p>

      {/* Cohort badge */}
      {cohortLabel && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.3rem 0.7rem",
          background: "rgba(212,160,48,0.1)",
          border: `1px solid rgba(212,160,48,0.35)`,
          borderRadius: 999,
          fontFamily: FONT.condensed,
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.goldBright,
          marginBottom: "1.25rem",
        }}>
          <span style={{ opacity: 0.7 }}>Cohort</span>
          <span style={{ fontWeight: 700 }}>{cohortLabel}</span>
        </div>
      )}

      {/* Loading / error states */}
      {loading && (
        <div style={{
          padding: "2.5rem",
          textAlign: "center",
          color: C.muted,
          fontStyle: "italic",
          background: C.bgSoft,
          border: `1px solid ${C.ghost}`,
          borderRadius: 8,
        }}>
          Computing alignment matrix…
        </div>
      )}
      {fetchError && (
        <div style={{
          padding: "1rem 1.2rem",
          background: "rgba(217,79,79,0.08)",
          border: `1px solid rgba(217,79,79,0.3)`,
          borderRadius: 8,
          color: C.red,
          fontFamily: FONT.mono,
          fontSize: "0.82rem",
        }}>
          <strong>Matrix unavailable:</strong> {fetchError}
        </div>
      )}

      {/* Axis sweep + matrix */}
      {!loading && !fetchError && residuals && (
        <>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: 155,
            marginRight: 8,
            marginBottom: "0.6rem",
            fontFamily: FONT.condensed,
            fontSize: "0.62rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.dim,
          }}>
            <span>Intact is the norm</span>
            <div style={{ flex: 1, height: 1, background: C.ghost, margin: "0 0.5rem" }} />
            <span>Circ is the norm</span>
          </div>

          <table className="cam-matrix">
            <thead>
              <tr>
                <th style={{ width: 155 }}></th>
                {NORM_COLUMNS.map((c) => (
                  <th key={c.key} style={{
                    fontSize: "0.68rem",
                    fontFamily: FONT.body,
                    color: C.muted,
                    textAlign: "center",
                    paddingBottom: 8,
                    lineHeight: 1.3,
                    fontWeight: 500,
                  }}>
                    {c.short.split(" ").map((w, i) => <div key={i}>{w}</div>)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PATHWAY_ROWS.map((p) => (
                <tr key={p.key}>
                  <td style={{
                    textAlign: "right",
                    paddingRight: 12,
                    verticalAlign: "middle",
                    fontFamily: FONT.body,
                    fontSize: "0.9rem",
                    color: C.text,
                    whiteSpace: "nowrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <span style={{ fontWeight: 500 }}>{p.label}</span>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: p.color, flexShrink: 0,
                      }} />
                    </div>
                    <div style={{
                      fontSize: "0.66rem",
                      fontFamily: FONT.mono,
                      color: C.dim,
                      marginTop: 2,
                    }}>n = {residuals.rowTotals[p.key]}</div>
                  </td>
                  {NORM_COLUMNS.map((c) => {
                    const cell = residuals.cells[p.key][c.key];
                    const style = cellStyle(cell.z);
                    const zStr = cell.z >= 0 ? `+${cell.z.toFixed(2)}` : cell.z.toFixed(2);
                    return (
                      <td key={c.key}>
                        <div
                          className={`cam-cell ${onCellClick ? "clickable" : ""}`}
                          style={{ background: style.bg, color: style.fg }}
                          title={`${p.label} × ${c.label}\nObserved: ${cell.obs}\nExpected: ${cell.exp.toFixed(1)}\nStandardized residual: ${zStr}`}
                          onClick={onCellClick ? () => onCellClick(p, c, cell) : undefined}
                        >
                          <div style={{
                            fontFamily: FONT.body,
                            fontSize: "1.15rem",
                            fontWeight: 600,
                            lineHeight: 1,
                          }}>{cell.obs}</div>
                          <div style={{
                            fontFamily: FONT.mono,
                            fontSize: "0.62rem",
                            marginTop: 3,
                            opacity: 0.85,
                            letterSpacing: "-0.02em",
                          }}>z {zStr}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          {showLegend && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              justifyContent: "center",
              marginTop: "1rem",
              fontFamily: FONT.condensed,
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.muted,
              flexWrap: "wrap",
            }}>
              <LegendSwatch color="#1d9e75" label="More than chance" />
              <LegendSwatch color="#0f6e56" label="Mildly more" />
              <LegendSwatch color={C.ghost} label="As expected" />
              <LegendSwatch color="#791f1f" label="Mildly fewer" />
              <LegendSwatch color="#a32d2d" label="Fewer than chance" />
            </div>
          )}

          {/* Story callouts */}
          {stories.length > 0 && (
            <div style={{
              marginTop: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}>
              {stories.map((s, i) => (
                <StoryCard key={i} story={s} residuals={residuals} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function LegendSwatch({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
      <span>{label}</span>
    </div>
  );
}

function StoryCard({ story, residuals }) {
  // Accent color based on direction
  const accent = story.direction === "over" ? "#0f6e56" : story.direction === "under" ? "#a32d2d" : C.gold;
  const pathwayRow = PATHWAY_ROWS.find((p) => p.key === story.pathway);
  const pathwayColor = pathwayRow ? pathwayRow.color : C.gold;

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 6,
      padding: "0.85rem 1rem",
    }}>
      {story.label && (
        <div style={{
          fontFamily: FONT.condensed,
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: accent,
          marginBottom: "0.35rem",
        }}>{story.label}</div>
      )}
      <div style={{
        fontFamily: FONT.body,
        fontSize: "0.95rem",
        fontWeight: 500,
        color: C.textBright,
        lineHeight: 1.4,
        marginBottom: "0.4rem",
      }}>{story.headline}</div>
      <div style={{
        fontFamily: FONT.body,
        fontSize: "0.83rem",
        color: C.muted,
        lineHeight: 1.55,
      }}>{story.body}</div>
    </div>
  );
}
