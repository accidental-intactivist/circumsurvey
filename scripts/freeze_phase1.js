#!/usr/bin/env node
/**
 * freeze_phase1.js — stamp / verify the Phase 1 frozen headline numbers.
 *
 * Reads the canonical table produced by scripts/compute_stats.py
 * (src/data/phase1_frozen.json) and reconciles the pleasure-gap means that are
 * hand-baked into two source files so every surface reads from one computed run:
 *
 *   - src/components/GuidedTour/tourData.js   → the PLEASURE_METRICS array
 *   - src/data.js                             → the six "type":"avg" rating objects
 *
 * Modes:
 *   node scripts/freeze_phase1.js            # --check (default): report drift, exit 1 if any
 *   node scripts/freeze_phase1.js --check    # same, explicit
 *   node scripts/freeze_phase1.js --write    # rewrite the numbers in place, then re-verify
 *
 * The --check mode is safe to run in CI: it fails the build if the displayed
 * numbers ever drift from the computed snapshot again (the bug the peer review
 * found — the tour showing 4.47 while data.js showed 3.88).
 *
 * Values are compared/stamped at 2 decimal places, matching how the site
 * displays them. Node built-ins only; no dependencies.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");
const FROZEN = path.join(REPO, "src", "data", "phase1_frozen.json");
const TOURDATA = path.join(REPO, "src", "components", "GuidedTour", "tourData.js");
const DATAJS = path.join(REPO, "src", "data.js");

// Canonical metric label → the "id" used in src/data.js avg objects.
const LABEL_TO_DATAJS_ID = {
  Intensity: "intensity",
  Duration: "duration_r",
  Ease: "ease",
  "Light touch": "light",
  "Mobile skin": "mobile",
  Variety: "variety",
};

const round2 = (x) => Math.round(x * 100) / 100;

function loadFrozen() {
  if (!fs.existsSync(FROZEN)) {
    fail(
      `Missing ${rel(FROZEN)}.\n` +
        `Run:  python3 scripts/compute_stats.py   (needs the raw local DB)`
    );
  }
  const frozen = JSON.parse(fs.readFileSync(FROZEN, "utf8"));
  const byLabel = new Map();
  for (const m of frozen.pleasure_metrics) {
    byLabel.set(m.label, {
      intact: round2(m.intact),
      restoring: round2(m.restoring),
      circumcised: round2(m.circumcised),
    });
  }
  return { frozen, byLabel };
}

// ── Render the canonical PLEASURE_METRICS array (tourData.js) ──────────────────
function renderPleasureMetricsArray(byLabel) {
  const order = ["Mobile skin", "Light touch", "Variety", "Duration", "Ease", "Intensity"];
  const lines = order.map((label) => {
    const m = byLabel.get(label);
    const pad = `"${label}",`.padEnd(15, " ");
    return `  { label: ${pad} intact: ${m.intact.toFixed(2)}, restoring: ${m.restoring.toFixed(
      2
    )}, circumcised: ${m.circumcised.toFixed(2)} },`;
  });
  return "export const PLEASURE_METRICS = [\n" + lines.join("\n") + "\n];";
}

// ── tourData.js: check / write the PLEASURE_METRICS block ──────────────────────
const PM_BLOCK = /export const PLEASURE_METRICS = \[[\s\S]*?\n\];/;
const PM_ROW = /\{\s*label:\s*"([^"]+)",\s*intact:\s*([\d.]+),\s*restoring:\s*([\d.]+),\s*circumcised:\s*([\d.]+)\s*\}/g;

function checkTourData(byLabel, drifts) {
  const src = fs.readFileSync(TOURDATA, "utf8");
  const block = src.match(PM_BLOCK);
  if (!block) fail(`Could not locate PLEASURE_METRICS array in ${rel(TOURDATA)}`);
  let m;
  PM_ROW.lastIndex = 0;
  while ((m = PM_ROW.exec(block[0])) !== null) {
    const [, label, intact, restoring, circ] = m;
    const want = byLabel.get(label);
    if (!want) {
      drifts.push(`tourData.js: unexpected metric "${label}" (not in frozen table)`);
      continue;
    }
    compare(drifts, `tourData.js PLEASURE_METRICS "${label}"`, want, {
      intact: parseFloat(intact),
      restoring: parseFloat(restoring),
      circumcised: parseFloat(circ),
    });
  }
}

function writeTourData(byLabel) {
  const src = fs.readFileSync(TOURDATA, "utf8");
  if (!PM_BLOCK.test(src)) fail(`Could not locate PLEASURE_METRICS array in ${rel(TOURDATA)}`);
  const next = src.replace(PM_BLOCK, renderPleasureMetricsArray(byLabel));
  if (next !== src) {
    fs.writeFileSync(TOURDATA, next);
    return true;
  }
  return false;
}

// ── data.js: check / write each avg object's `data` block ──────────────────────
function dataObjRegex(id) {
  // Matches the `data: { intact, circumcised, restoring }` inside the object whose id is `id`.
  return new RegExp(
    `("id":\\s*"${id}"[\\s\\S]*?"data":\\s*\\{)\\s*` +
      `"intact":\\s*([\\d.]+),\\s*` +
      `"circumcised":\\s*([\\d.]+),\\s*` +
      `"restoring":\\s*([\\d.]+)\\s*(\\})`
  );
}

function checkDataJs(byLabel, drifts) {
  const src = fs.readFileSync(DATAJS, "utf8");
  for (const [label, id] of Object.entries(LABEL_TO_DATAJS_ID)) {
    const re = dataObjRegex(id);
    const m = src.match(re);
    if (!m) {
      drifts.push(`data.js: could not find avg object id="${id}" (${label})`);
      continue;
    }
    const want = byLabel.get(label);
    compare(drifts, `data.js "${id}" (${label})`, want, {
      intact: parseFloat(m[2]),
      circumcised: parseFloat(m[3]),
      restoring: parseFloat(m[4]),
    });
  }
}

function writeDataJs(byLabel) {
  let src = fs.readFileSync(DATAJS, "utf8");
  let changed = false;
  for (const [label, id] of Object.entries(LABEL_TO_DATAJS_ID)) {
    const re = dataObjRegex(id);
    const want = byLabel.get(label);
    const next = src.replace(
      re,
      (_full, head, _i, _c, _r, tail) =>
        `${head}\n      "intact": ${want.intact},\n      "circumcised": ${want.circumcised},\n` +
        `      "restoring": ${want.restoring}\n    ${tail}`
    );
    if (next !== src) {
      changed = true;
      src = next;
    }
  }
  if (changed) fs.writeFileSync(DATAJS, src);
  return changed;
}

// ── Comparison helpers ────────────────────────────────────────────────────────
function compare(drifts, where, want, got) {
  for (const k of ["intact", "circumcised", "restoring"]) {
    if (round2(want[k]) !== round2(got[k])) {
      drifts.push(`${where}: ${k} is ${got[k]} but should be ${round2(want[k])}`);
    }
  }
}

function rel(p) {
  return path.relative(REPO, p);
}
function fail(msg) {
  console.error("ERROR: " + msg);
  process.exit(2);
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const write = process.argv.includes("--write");
  const { frozen, byLabel } = loadFrozen();

  console.log(
    `Frozen snapshot: ${frozen.total_respondents} respondents, source=${frozen.rating_source} ` +
      `(${rel(FROZEN)})`
  );

  if (write) {
    const a = writeTourData(byLabel);
    const b = writeDataJs(byLabel);
    console.log(
      `Stamped: tourData.js ${a ? "updated" : "unchanged"}, data.js ${b ? "updated" : "unchanged"}.`
    );
  }

  const drifts = [];
  checkTourData(byLabel, drifts);
  checkDataJs(byLabel, drifts);

  if (drifts.length === 0) {
    console.log("OK — all displayed pleasure-gap numbers match the computed snapshot.");
    process.exit(0);
  }
  console.error(`\nDRIFT (${drifts.length}):`);
  for (const d of drifts) console.error("  - " + d);
  if (!write) {
    console.error(`\nRun \`node scripts/freeze_phase1.js --write\` to stamp the canonical values.`);
  }
  process.exit(1);
}

main();
