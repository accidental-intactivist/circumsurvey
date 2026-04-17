#!/usr/bin/env python3
"""
CircumSurvey — aggregate.py
============================
Converts data/raw/responses.csv → src/data/aggregates.json

NEVER commit data/raw/responses.csv to the repo.
Only the output aggregates.json should be deployed.

Usage:
    python scripts/aggregate.py data/raw/responses.csv > src/data/aggregates.json
    # or specify output explicitly:
    python scripts/aggregate.py data/raw/responses.csv src/data/aggregates.json
"""

import csv
import json
import sys
import os
from datetime import datetime
from collections import defaultdict


# ── Column index constants (0-based from CLAUDE.md) ──────────────────────────

COL_PATHWAY_ASSIGNMENT = 64        # Q65 — circumcision state
COL_APPEARANCE_FEELINGS = 46       # Q47
COL_SEX_INTENSITY      = 47        # Q48
COL_SEX_DURATION       = 48        # Q49
COL_SEX_EASE           = 49        # Q50
COL_SEX_LIGHT_TOUCH    = 50        # Q51
COL_SEX_MOBILE_SKIN    = 51        # Q52
COL_SEX_VARIETY        = 52        # Q53
COL_ORGASM_DURATION    = 55        # Q56
COL_ORGASM_CONFIDENCE  = 56        # Q57
COL_LUBRICATION_NEED   = 57        # Q58
COL_PRIDE_SATISFACTION = 63        # Q64
COL_INTACT_REGRET      = 71        # Q72  (intact pathway only)
COL_CIRC_RESENTMENT    = 102       # Q103 (circumcised + restoring)
COL_CIRC_HOW_HANDLED   = 94        # Q95  (circumcised only)
COL_CIRC_PRIMARY_DRIVER= 92        # Q93  (circumcised only)
COL_CIRC_CURIOSITY     = 98        # Q99  (circumcised only)
COL_INTACT_CURIOSITY   = 80        # Q81  (intact only)
COL_BODY_PHILOSOPHY    = 148       # Q149
COL_AESTHETIC_PREF     = 173       # Q174
COL_FUTURE_SON         = 176       # Q177
COL_BODILY_AUTONOMY    = 177       # Q178
COL_FATHER_CIRC_STATUS = 111       # Q112


# ── Pathway assignment logic ──────────────────────────────────────────────────

PATHWAY_MAP = {
    # Values from the survey's Q65 response options (adjust to match your CSV)
    "Intact / Never circumcised":   "intact",
    "Circumcised":                  "circumcised",
    "Restoring / Restored":         "restoring",
    "Observer / Partner / Ally":    "observer",
    "Trans":                        "trans",
    "Intersex":                     "intersex",
}


def get_pathway(row):
    """Determine a respondent's pathway from their Q65 response."""
    if len(row) <= COL_PATHWAY_ASSIGNMENT:
        return None
    val = row[COL_PATHWAY_ASSIGNMENT].strip()
    # Try exact match first
    if val in PATHWAY_MAP:
        return PATHWAY_MAP[val]
    # Try partial match (handles minor label variations)
    val_lower = val.lower()
    for key, pathway in PATHWAY_MAP.items():
        if key.lower() in val_lower or val_lower in key.lower():
            return pathway
    return None


# ── Distribution helper ───────────────────────────────────────────────────────

def compute_distribution(rows_for_pathway, col_index):
    """
    Given a list of rows for one pathway, compute percentage distribution
    for the column at col_index. Returns list of {label, percentage, n} dicts.
    """
    counts = defaultdict(int)
    total = 0
    for row in rows_for_pathway:
        if col_index >= len(row):
            continue
        val = row[col_index].strip()
        if val:  # skip blanks (pathway-branching left these empty)
            counts[val] += 1
            total += 1

    if total == 0:
        return [], 0

    return [
        {"label": label, "count": count, "percentage": round(count / total * 100, 1)}
        for label, count in sorted(counts.items(), key=lambda x: -x[1])
    ], total


def compute_mean(rows_for_pathway, col_index, scale=5):
    """Compute mean for 1-N scale questions."""
    values = []
    for row in rows_for_pathway:
        if col_index >= len(row):
            continue
        val = row[col_index].strip()
        try:
            values.append(float(val))
        except ValueError:
            pass
    if not values:
        return None
    return round(sum(values) / len(values), 2)


# ── Main pipeline ─────────────────────────────────────────────────────────────

def process_csv(filepath):
    """Read CSV and return grouped rows by pathway."""
    rows_by_pathway = defaultdict(list)
    all_rows = []
    skipped = 0

    with open(filepath, newline='', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        headers = next(reader)  # skip header row
        for row in reader:
            pathway = get_pathway(row)
            if pathway:
                rows_by_pathway[pathway].append(row)
                all_rows.append(row)
            else:
                skipped += 1

    print(f"[aggregate.py] Read {len(all_rows)} rows. Skipped {skipped} unclassified.", file=sys.stderr)
    for p, rows in rows_by_pathway.items():
        print(f"  {p}: n={len(rows)}", file=sys.stderr)

    return rows_by_pathway, headers


def build_question(qid, col, category, text, qtype, pathways_data):
    """Build a single question aggregate object."""
    return {
        "id": qid,
        "col": col,
        "category": category,
        "text": text,
        "type": qtype,
        "pathways": list(pathways_data.keys()),
        "distributions": {
            pathway: {
                "pathwayId": pathway,
                "n": data["n"],
                "options": data["options"],
            }
            for pathway, data in pathways_data.items()
            if data["n"] >= 5  # minimum n=5 per ethical guidelines
        }
    }


def build_aggregates(rows_by_pathway):
    """Build the full aggregates.json structure."""

    # ── Combine born-circumcised (circ + restoring) ──
    born_circ_rows = rows_by_pathway.get("circumcised", []) + rows_by_pathway.get("restoring", [])

    questions = []

    # ── Orgasm confidence (Q57) ──
    q_orgasm = {"id": "orgasm-confidence", "col": 56, "category": "Sexual Experience",
                 "text": "How confident are you that your orgasms are as good as they could be?", "type": "single"}
    for pathway, rows in [("intact", rows_by_pathway.get("intact", [])),
                           ("circumcised", rows_by_pathway.get("circumcised", [])),
                           ("restoring", rows_by_pathway.get("restoring", []))]:
        dist, n = compute_distribution(rows, COL_ORGASM_CONFIDENCE)
        if n >= 5:
            if "distributions" not in q_orgasm:
                q_orgasm["distributions"] = {}
                q_orgasm["pathways"] = []
            q_orgasm["distributions"][pathway] = {"pathwayId": pathway, "n": n, "options": dist}
            q_orgasm["pathways"].append(pathway)
    if "distributions" in q_orgasm:
        questions.append(q_orgasm)

    # ── Lubrication need (Q58) ──
    q_lube = {"id": "lubrication-need", "col": 57, "category": "Sexual Experience",
               "text": "How often do you need additional lubrication during sexual activity?", "type": "single"}
    for pathway, rows in [("intact", rows_by_pathway.get("intact", [])),
                           ("circumcised", rows_by_pathway.get("circumcised", [])),
                           ("restoring", rows_by_pathway.get("restoring", []))]:
        dist, n = compute_distribution(rows, COL_LUBRICATION_NEED)
        if n >= 5:
            if "distributions" not in q_lube:
                q_lube["distributions"] = {}
                q_lube["pathways"] = []
            q_lube["distributions"][pathway] = {"pathwayId": pathway, "n": n, "options": dist}
            q_lube["pathways"].append(pathway)
    if "distributions" in q_lube:
        questions.append(q_lube)

    # ── Future son intention (Q177) ──
    q_future = {"id": "future-son-intention", "col": 176, "category": "Attitudes & Beliefs",
                 "text": "If you were to have a son in the future (or if you have a son), what would your intention be regarding circumcision?",
                 "type": "single"}
    for pathway, rows in [("intact", rows_by_pathway.get("intact", [])),
                           ("circumcised", rows_by_pathway.get("circumcised", [])),
                           ("restoring", rows_by_pathway.get("restoring", [])),
                           ("observer", rows_by_pathway.get("observer", []))]:
        dist, n = compute_distribution(rows, COL_FUTURE_SON)
        if n >= 5:
            if "distributions" not in q_future:
                q_future["distributions"] = {}
                q_future["pathways"] = []
            q_future["distributions"][pathway] = {"pathwayId": pathway, "n": n, "options": dist}
            q_future["pathways"].append(pathway)
    if "distributions" in q_future:
        questions.append(q_future)

    # ── Bodily autonomy (Q178) ──
    q_autonomy = {"id": "bodily-autonomy", "col": 177, "category": "Attitudes & Beliefs",
                   "text": "Should parents have the right to make permanent, irreversible body modifications on a non-consenting infant for non-medical reasons?",
                   "type": "single"}
    for pathway, rows in [("intact", rows_by_pathway.get("intact", [])),
                           ("circumcised", rows_by_pathway.get("circumcised", [])),
                           ("restoring", rows_by_pathway.get("restoring", [])),
                           ("observer", rows_by_pathway.get("observer", []))]:
        dist, n = compute_distribution(rows, COL_BODILY_AUTONOMY)
        if n >= 5:
            if "distributions" not in q_autonomy:
                q_autonomy["distributions"] = {}
                q_autonomy["pathways"] = []
            q_autonomy["distributions"][pathway] = {"pathwayId": pathway, "n": n, "options": dist}
            q_autonomy["pathways"].append(pathway)
    if "distributions" in q_autonomy:
        questions.append(q_autonomy)

    # ── How circumcision was handled (Q95, circumcised only) ──
    dist_handled, n_handled = compute_distribution(rows_by_pathway.get("circumcised", []), COL_CIRC_HOW_HANDLED)
    if n_handled >= 5:
        questions.append({
            "id": "how-handled",
            "col": 94,
            "category": "Decision & Consent",
            "text": "How was circumcision handled around the time of your birth?",
            "type": "single",
            "pathways": ["circumcised"],
            "distributions": {
                "circumcised": {"pathwayId": "circumcised", "n": n_handled, "options": dist_handled}
            }
        })

    # ── Mirror pairs ──
    mirror_pairs = []

    # Resentment vs Regret
    dist_resentment, n_res = compute_distribution(rows_by_pathway.get("circumcised", []), COL_CIRC_RESENTMENT)
    dist_regret, n_reg = compute_distribution(rows_by_pathway.get("intact", []), COL_INTACT_REGRET)

    if n_res >= 5 and n_reg >= 5:
        mirror_pairs.append({
            "id": "resentment-regret",
            "concept": "Resentment / Regret about circumcision state",
            "languageNote": (
                "We use \"resentment\" for the Circumcised Pathway because the procedure was performed "
                "without their agency. We use \"regret\" for the Intact Pathway because that is the word "
                "that could meaningfully apply to a state they grew into. This distinction was shaped by "
                "community feedback."
            ),
            "intactQuestion": {
                "id": "intact-regret-feeling",
                "col": 71,
                "category": "Feelings & Identity",
                "text": "Have you ever wished you were circumcised, or felt regret about being intact?",
                "type": "single",
                "pathways": ["intact"],
                "distributions": {
                    "intact": {"pathwayId": "intact", "n": n_reg, "options": dist_regret}
                }
            },
            "circumcisedQuestion": {
                "id": "circ-resentment-feeling",
                "col": 102,
                "category": "Feelings & Identity",
                "text": "Have you experienced resentment, loss, anger, or grief about your circumcision?",
                "type": "single",
                "pathways": ["circumcised"],
                "distributions": {
                    "circumcised": {"pathwayId": "circumcised", "n": n_res, "options": dist_resentment}
                }
            }
        })

    # ── Compute sexual experience means for summary ──
    sex_means = {}
    for pathway, rows in [("intact", rows_by_pathway.get("intact", [])),
                           ("circumcised", rows_by_pathway.get("circumcised", [])),
                           ("restoring", rows_by_pathway.get("restoring", []))]:
        sex_means[pathway] = {
            "intensity":   compute_mean(rows, COL_SEX_INTENSITY),
            "duration":    compute_mean(rows, COL_SEX_DURATION),
            "ease":        compute_mean(rows, COL_SEX_EASE),
            "light_touch": compute_mean(rows, COL_SEX_LIGHT_TOUCH),
            "mobile_skin": compute_mean(rows, COL_SEX_MOBILE_SKIN),
            "variety":     compute_mean(rows, COL_SEX_VARIETY),
        }

    # ── Build output ──
    total = sum(len(r) for r in rows_by_pathway.values())

    return {
        "meta": {
            "totalRespondents": total,
            "lastUpdated": datetime.utcnow().strftime("%Y-%m"),
            "phase": "Phase 1 · Preliminary Findings",
            "pathwayCounts": {p: len(r) for p, r in rows_by_pathway.items()},
        },
        "sexualExperienceMeans": sex_means,
        "questions": questions,
        "mirrorPairs": mirror_pairs,
    }


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/aggregate.py <input.csv> [output.json]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found", file=sys.stderr)
        sys.exit(1)

    rows_by_pathway, _headers = process_csv(input_path)
    result = build_aggregates(rows_by_pathway)

    output = json.dumps(result, indent=2, ensure_ascii=False)

    if len(sys.argv) >= 3:
        with open(sys.argv[2], 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"[aggregate.py] Written to {sys.argv[2]}", file=sys.stderr)
    else:
        print(output)
