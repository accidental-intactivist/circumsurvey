// ═══════════════════════════════════════════════════════════════════════════
// tourStats.js — Pre-computed statistical analysis for the Special Report.
//
// Computed from the raw XLSX responses via scripts/compute_stats.py.
// All tests: two-tailed Welch's t-test (unequal variances).
// Effect sizes: Cohen's d with pooled standard deviation.
// Confidence intervals: 95%, t-distribution.
//
// DO NOT HAND-EDIT — regenerate from the XLSX when data updates.
// ═══════════════════════════════════════════════════════════════════════════

import raw from "./tourStats.json";

export const STATS = raw;

// Ordered array matching the tourData.js PLEASURE_METRICS order
export const PLEASURE_GAP_STATS = [
  raw.pleasure_gap.mobile_skin,
  raw.pleasure_gap.light_touch,
  raw.pleasure_gap.variety,
  raw.pleasure_gap.duration,
  raw.pleasure_gap.ease,
  raw.pleasure_gap.intensity,
];

// ── Significance helpers ──────────────────────────────────────────────────
export function sigStars(p) {
  if (p < 0.001) return "★★★";
  if (p < 0.01)  return "★★";
  if (p < 0.05)  return "★";
  return "ns";
}

export function sigLabel(p) {
  if (p < 0.001) return "p < .001";
  if (p < 0.01)  return "p < .01";
  if (p < 0.05)  return "p < .05";
  return "not significant";
}

export function dMagnitude(d) {
  const abs = Math.abs(d);
  if (abs >= 1.5) return "enormous";
  if (abs >= 1.0) return "very large";
  if (abs >= 0.8) return "large";
  if (abs >= 0.5) return "medium";
  if (abs >= 0.2) return "small";
  return "negligible";
}

// ── Reference benchmarks for the comparison chart ─────────────────────────
export const EFFECT_BENCHMARKS = [
  { label: "Aspirin → heart attacks",          d: 0.07, color: "var(--c-grey)" },
  { label: "SAT prep → scores",                d: 0.20, color: "var(--c-grey)" },
  { label: "Psychotherapy → depression",        d: 0.68, color: "var(--c-grey)" },
  { label: "Height: men vs women",              d: 1.60, color: "var(--c-grey)" },
  { label: "This dataset: mobile skin",         d: 1.78, color: "var(--c-red)", highlight: true },
];
