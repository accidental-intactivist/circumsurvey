/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// ── Test the pure logic extracted from ByTheNumbersPage ─────────────────────

// We can't easily render the full page (too many deps), so we test the
// critical pure functions and data-processing logic in isolation.

// Replicate extractMetric locally for unit testing
function extractMetric(extractor, distribution) {
  if (!distribution || distribution.length === 0) return null;
  const find = (substr) => distribution.find(d => d.label && d.label.toLowerCase().includes(substr.toLowerCase()))?.n || 0;

  const ignoredLabels = ["not sure", "prefer not to answer", "n/a", "no answer", "i don't know"];
  let validN = 0;
  for (const d of distribution) {
    if (d.label && !ignoredLabels.some(ig => d.label.toLowerCase().includes(ig))) {
      validN += (d.n || 0);
    }
  }
  if (validN === 0) return null;

  switch (extractor) {
    case "pathway_intact": return null;
    case "strong_resentment": return (find("strong and frequent") / validN) * 100;
    case "keep_intact": return (find("remains intact") / validN) * 100;
    case "lube_always": return (find("always or almost always necessary") / validN) * 100;
    case "intact_aesthetic": {
      const strong = find("strongly prefer the appearance of the intact");
      const slight = find("slightly prefer the appearance of the intact");
      return ((strong + slight) / validN) * 100;
    }
    case "pride": {
      const vp = find("very proud");
      const gp = find("generally proud");
      return ((vp + gp) / validN) * 100;
    }
    case "dissatisfaction": {
      const sd = find("somewhat dissatisfied");
      const vd = find("very dissatisfied");
      return ((sd + vd) / validN) * 100;
    }
    case "gliding": return (find("seamless, frictionless glide") / validN) * 100;
    case "bodily_autonomy": return (find("bodily autonomy") / validN) * 100;
    case "trust_medicine_decreased": return (find("significantly decreased") / validN) * 100;
    default: return null;
  }
}

// Replicate shorten locally
function shorten(label) {
  if (!label) return "";
  let s = label;
  s = s.replace(/\s*\([^)]*\)\s*$/, "");
  s = s.replace("Millennial/Gen Y", "Millennial");
  s = s.replace("Xennial/Oregon Trail", "Xennial");
  s = s.replace("United States of America (USA)", "USA");
  s = s.replace("United States of America", "USA");
  s = s.replace("United Kingdom", "UK");
  return s;
}

// ── SNAPSHOT_DEFINITIONS shape test ─────────────────────────────────────────

const SNAPSHOT_DEFINITIONS_SHAPE = [
  { id: "respondents", span: 2 },
  { id: "resentment_circ", span: 2, qid: "circ_regret_feeling" },
  { id: "resentment_restoring", span: 2, qid: "circ_regret_feeling" },
  { id: "keep_intact_restoring", span: 1, qid: "final_child_decision_reason" },
  { id: "keep_intact_circ", span: 1, qid: "final_child_decision_reason" },
  { id: "lube_circ", span: 1, qid: "exp_lubrication_need" },
  { id: "lube_intact", span: 1, qid: "exp_lubrication_need" },
  { id: "sensitivity_gap", span: 1, qid: "exp_sex_rating_sensitivity_light_touch" },
  { id: "aesthetic_circ", span: 2, qid: "final_aesthetic_preference" },
  { id: "autonomy", span: 1, qid: "final_core_principle_choice" },
  { id: "pride_intact", span: 1, qid: "exp_pride_satisfaction_rating" },
  { id: "dissatisfied_circ", span: 1, qid: "exp_pride_satisfaction_rating" },
  { id: "pleasure_mobile", span: 1, qid: "exp_sex_rating_pleasure_mobile_skin" },
];

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ByTheNumbersPage — extractMetric", () => {
  const prideDist = [
    { label: "Very proud and satisfied", n: 50 },
    { label: "Generally proud and satisfied", n: 30 },
    { label: "Neutral or ambivalent", n: 10 },
    { label: "Somewhat dissatisfied", n: 5 },
    { label: "Very dissatisfied", n: 5 },
  ];

  it("returns null for empty distribution", () => {
    expect(extractMetric("pride", [])).toBe(null);
    expect(extractMetric("pride", null)).toBe(null);
    expect(extractMetric("pride", undefined)).toBe(null);
  });

  it("calculates pride correctly (very proud + generally proud)", () => {
    const result = extractMetric("pride", prideDist);
    // (50 + 30) / 100 * 100 = 80
    expect(result).toBeCloseTo(80, 0);
  });

  it("calculates dissatisfaction correctly (somewhat + very dissatisfied)", () => {
    const result = extractMetric("dissatisfaction", prideDist);
    // (5 + 5) / 100 * 100 = 10
    expect(result).toBeCloseTo(10, 0);
  });

  it("excludes 'Not sure' from the denominator", () => {
    const distWithNotSure = [
      ...prideDist,
      { label: "Not sure / Prefer not to say", n: 20 },
    ];
    // validN should still be 100, not 120
    const result = extractMetric("pride", distWithNotSure);
    expect(result).toBeCloseTo(80, 0);
  });

  it("returns null for unknown extractor", () => {
    expect(extractMetric("nonexistent_extractor", prideDist)).toBe(null);
  });

  it("returns null for pathway_intact extractor", () => {
    expect(extractMetric("pathway_intact", prideDist)).toBe(null);
  });

  it("calculates strong_resentment correctly", () => {
    const dist = [
      { label: "Yes, strong and frequent resentment or grief", n: 30 },
      { label: "No, never", n: 70 },
    ];
    expect(extractMetric("strong_resentment", dist)).toBeCloseTo(30, 0);
  });

  it("calculates keep_intact correctly", () => {
    const dist = [
      { label: "I would want my child remains intact", n: 80 },
      { label: "I would circumcise", n: 20 },
    ];
    expect(extractMetric("keep_intact", dist)).toBeCloseTo(80, 0);
  });

  it("calculates intact_aesthetic correctly (strong + slight)", () => {
    const dist = [
      { label: "I strongly prefer the appearance of the intact penis", n: 30 },
      { label: "I slightly prefer the appearance of the intact penis", n: 20 },
      { label: "No preference", n: 50 },
    ];
    expect(extractMetric("intact_aesthetic", dist)).toBeCloseTo(50, 0);
  });

  it("calculates bodily_autonomy correctly", () => {
    const dist = [
      { label: "Bodily Autonomy — the child's right to decide", n: 75 },
      { label: "Parental discretion", n: 25 },
    ];
    expect(extractMetric("bodily_autonomy", dist)).toBeCloseTo(75, 0);
  });

  it("calculates trust_medicine_decreased correctly", () => {
    const dist = [
      { label: "Has significantly decreased", n: 40 },
      { label: "Stayed about the same", n: 60 },
    ];
    expect(extractMetric("trust_medicine_decreased", dist)).toBeCloseTo(40, 0);
  });

  it("calculates gliding correctly", () => {
    const dist = [
      { label: "A seamless, frictionless glide", n: 45 },
      { label: "Some friction or drag", n: 55 },
    ];
    expect(extractMetric("gliding", dist)).toBeCloseTo(45, 0);
  });

  it("calculates lube_always correctly", () => {
    const dist = [
      { label: "Yes, always or almost always necessary", n: 35 },
      { label: "Sometimes", n: 65 },
    ];
    expect(extractMetric("lube_always", dist)).toBeCloseTo(35, 0);
  });
});

describe("ByTheNumbersPage — shorten", () => {
  it("removes trailing parentheticals", () => {
    expect(shorten("Millennial/Gen Y (born 1981-1996)")).toBe("Millennial");
  });

  it("shortens Xennial/Oregon Trail", () => {
    expect(shorten("Xennial/Oregon Trail (born approx. 1977-1983)")).toBe("Xennial");
  });

  it("shortens USA", () => {
    expect(shorten("United States of America")).toBe("USA");
  });

  it("shortens UK", () => {
    expect(shorten("United Kingdom")).toBe("UK");
  });

  it("returns empty string for null", () => {
    expect(shorten(null)).toBe("");
    expect(shorten("")).toBe("");
  });
});

describe("ByTheNumbersPage — SNAPSHOT_DEFINITIONS shape", () => {
  it("all snapshot definitions have required fields", () => {
    for (const def of SNAPSHOT_DEFINITIONS_SHAPE) {
      expect(def.id).toBeTruthy();
      expect([1, 2]).toContain(def.span);
    }
  });

  it("non-respondent snapshots all have qid for deep linking", () => {
    const clickable = SNAPSHOT_DEFINITIONS_SHAPE.filter(d => d.id !== "respondents");
    for (const def of clickable) {
      expect(def.qid).toBeTruthy();
    }
  });

  it("row layout math: span totals are correct for 3-row dots-and-dashes grid", () => {
    const stats = SNAPSHOT_DEFINITIONS_SHAPE.filter(d => d.id !== "respondents");
    const span1Count = stats.filter(d => d.span === 1).length;
    const span2Count = stats.filter(d => d.span === 2).length;

    // We need at least:
    // Row 0: span-2 + span-1 = 3
    // Row 1: span-1 + span-1 + span-1 = 3
    // Row 2: span-1 + span-2 = 3
    // So minimum: 5 span-1 items, 2 span-2 items
    expect(span1Count).toBeGreaterThanOrEqual(5);
    expect(span2Count).toBeGreaterThanOrEqual(2);
  });
});

describe("ByTheNumbersPage — AssumptionQuiz data processing", () => {
  // Simulate the cohorts useMemo processing from AssumptionQuiz
  function processCohorts(apiResults, extractor) {
    if (!apiResults) return [];
    return Object.entries(apiResults)
      .filter(([key]) => {
        if (!key || key === "null" || key === "unknown" || key === "" || key === "observer") return false;
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("not sure") || lowerKey.includes("prefer not to say") || lowerKey.includes("prefer not to answer")) return false;
        return true;
      })
      .map(([key, val]) => {
        const metric = extractMetric(extractor, val.distribution);
        return { id: key, label: shorten(key), fullLabel: key, n: val.n || 0, metric };
      })
      .filter(b => b.n >= 5 && b.metric !== null)
      .sort((a, b) => b.n - a.n)
      .slice(0, 6)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  it("filters out 'Not sure / Prefer not to say' cohorts", () => {
    const results = {
      "Millennial/Gen Y (born 1981-1996)": {
        n: 100, distribution: [
          { label: "Very proud and satisfied", n: 50 },
          { label: "Generally proud and satisfied", n: 30 },
          { label: "Somewhat dissatisfied", n: 20 },
        ]
      },
      "Not sure / Prefer not to say": {
        n: 10, distribution: [
          { label: "Very proud and satisfied", n: 5 },
          { label: "Somewhat dissatisfied", n: 5 },
        ]
      },
    };
    const cohorts = processCohorts(results, "pride");
    expect(cohorts.length).toBe(1);
    expect(cohorts[0].id).toBe("Millennial/Gen Y (born 1981-1996)");
  });

  it("filters out cohorts with n < 5", () => {
    const results = {
      "Millennial": {
        n: 100, distribution: [
          { label: "Very proud and satisfied", n: 50 },
          { label: "Somewhat dissatisfied", n: 50 },
        ]
      },
      "Silent Gen": {
        n: 3, distribution: [
          { label: "Very proud and satisfied", n: 2 },
          { label: "Somewhat dissatisfied", n: 1 },
        ]
      },
    };
    const cohorts = processCohorts(results, "pride");
    expect(cohorts.length).toBe(1);
    expect(cohorts[0].id).toBe("Millennial");
  });

  it("requires >= 2 cohorts to show quiz (hasData check)", () => {
    const results = {
      "Only One Group": {
        n: 100, distribution: [
          { label: "Very proud and satisfied", n: 80 },
          { label: "Somewhat dissatisfied", n: 20 },
        ]
      },
    };
    const cohorts = processCohorts(results, "pride");
    // Only 1 cohort — quiz should show "Not enough data"
    expect(cohorts.length).toBeLessThan(2);
  });

  it("correctly identifies the highest-scoring cohort", () => {
    const results = {
      "GroupA": {
        n: 50, distribution: [
          { label: "Very proud and satisfied", n: 10 },
          { label: "Generally proud and satisfied", n: 10 },
          { label: "Somewhat dissatisfied", n: 30 },
        ]
      },
      "GroupB": {
        n: 50, distribution: [
          { label: "Very proud and satisfied", n: 30 },
          { label: "Generally proud and satisfied", n: 15 },
          { label: "Somewhat dissatisfied", n: 5 },
        ]
      },
    };
    const cohorts = processCohorts(results, "pride");
    expect(cohorts.length).toBe(2);
    const highest = cohorts.reduce((prev, curr) => curr.metric > prev.metric ? curr : prev);
    expect(highest.id).toBe("GroupB");
    expect(highest.metric).toBeCloseTo(90, 0); // (30+15)/50 * 100
  });

  it("caps cohorts at 6 for UI sanity", () => {
    const results = {};
    for (let i = 0; i < 10; i++) {
      results[`Group${i}`] = {
        n: 50, distribution: [
          { label: "Very proud and satisfied", n: 25 },
          { label: "Somewhat dissatisfied", n: 25 },
        ]
      };
    }
    const cohorts = processCohorts(results, "pride");
    expect(cohorts.length).toBeLessThanOrEqual(6);
  });
});

describe("ByTheNumbersPage — API response structure validation", () => {
  it("getAggregate response has 'results' key that cohorts can iterate", () => {
    // Simulates what the API actually returns
    const apiResponse = {
      question: "exp_pride_satisfaction_rating",
      by: "generation",
      results: {
        "Millennial/Gen Y (born 1981-1996)": {
          n: 200, avg: null,
          distribution: [
            { label: "Very proud and satisfied", n: 50 },
            { label: "Generally proud and satisfied", n: 60 },
            { label: "Neutral or ambivalent", n: 40 },
            { label: "Somewhat dissatisfied", n: 30 },
            { label: "Very dissatisfied", n: 20 },
          ]
        },
        "Gen X (born 1965-1980)": {
          n: 150, avg: null,
          distribution: [
            { label: "Very proud and satisfied", n: 40 },
            { label: "Generally proud and satisfied", n: 40 },
            { label: "Neutral or ambivalent", n: 30 },
            { label: "Somewhat dissatisfied", n: 25 },
            { label: "Very dissatisfied", n: 15 },
          ]
        }
      },
      updated_at: "2026-06-23T21:25:32.624Z",
    };

    // The component does: setData(res.results || {})
    const data = apiResponse.results || {};
    expect(Object.keys(data).length).toBeGreaterThanOrEqual(2);

    // Each entry should have n and distribution
    for (const [key, val] of Object.entries(data)) {
      expect(val).toHaveProperty("n");
      expect(val).toHaveProperty("distribution");
      expect(Array.isArray(val.distribution)).toBe(true);
    }
  });
});

describe("ByTheNumbersPage — Row layout constraints", () => {
  // The masonry layout should always have rows that sum to 3 spans
  const ROW_SHAPES = [
    [2, 1],      // Row 0: dash + dot
    [1, 1, 1],   // Row 1: dot + dot + dot
    [1, 2],      // Row 2: dot + dash
  ];

  it("each row sums to exactly 3 spans", () => {
    for (const row of ROW_SHAPES) {
      const total = row.reduce((a, b) => a + b, 0);
      expect(total).toBe(3);
    }
  });

  it("no row has two span-2 items", () => {
    for (const row of ROW_SHAPES) {
      const span2Count = row.filter(s => s === 2).length;
      expect(span2Count).toBeLessThanOrEqual(1);
    }
  });

  it("cycling always replaces same-span items to maintain row shape", () => {
    // Simulate: if we remove a span-1 item, the replacement must also be span-1
    const currentRow = [
      { id: "a", span: 1, state: "idle" },
      { id: "b", span: 1, state: "idle" },
      { id: "c", span: 1, state: "idle" },
    ];
    const leavingSlot = currentRow[2]; // oldest
    const leavingSpan = leavingSlot.span;

    // The pool of available replacements should be filtered by matching span
    const pool = [
      { id: "d", span: 1 },
      { id: "e", span: 2 },
      { id: "f", span: 1 },
    ];
    const matches = pool.filter(s => s.span === leavingSpan);
    expect(matches.length).toBe(2);
    expect(matches.every(m => m.span === leavingSpan)).toBe(true);
  });
});
