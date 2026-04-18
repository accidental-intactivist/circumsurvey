#!/usr/bin/env python3
"""
CircumSurvey — demographics.py
==============================
Reads raw Form Responses CSV, outputs src/demographics.js with cross-tab
aggregations: for each demographic dimension, the distribution of
circumcision outcomes within each category.

The explorer interface uses this to answer: "what distinguishes the
households that left their boys intact from those that didn't?"

Usage:
    python3 scripts/demographics.py data/raw/responses.csv src/demographics.js

Security: raw CSV never ships. Only demographics.js is committed/deployed.
All aggregates are anonymized — minimum cell size of 5 for category display
(smaller cells collapsed into "Other / prefer not to say").
"""

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone

# Column indices in the Form Responses CSV
COL_COUNTRY_BIRTH = 2
COL_COUNTRY_NOW = 3
COL_US_STATE_BIRTH = 4
COL_US_STATE_NOW = 5
COL_RACE = 6
COL_AGE = 7
COL_GENERATION = 8
COL_RESP_EDU = 9
COL_FAMILY_TYPE = 10
COL_MOTHER_EDU = 11
COL_MOTHER_PROFESSION = 12
COL_FATHER_EDU = 13
COL_FATHER_PROFESSION = 14
COL_FAMILY_SES = 15
COL_FAMILY_POLITICS = 16
COL_SEXUALITY = 17
COL_GENDER = 18
COL_SEX_AT_BIRTH = 19
COL_CA_PROVINCE_BIRTH = 20
COL_CA_PROVINCE_NOW = 21
COL_RELIGION_SIGNIFICANT = 22
COL_PRIMARY_TRADITION = 23

COL_PATHWAY = 65  # "What is your circumcision state?"

# Pathway classification matches aggregate.py
def classify_pathway(cell: str) -> str:
    """Returns 'intact', 'circumcised', 'restoring', 'observer', or None."""
    if not cell:
        return None
    v = cell.strip().lower()
    if not v:
        return None
    if "intact" in v and "restor" not in v:
        return "intact"
    if "restor" in v:
        return "restoring"
    if "circumcised" in v or "cut" in v:
        return "circumcised"
    if "observer" in v or "partner" in v or "ally" in v:
        return "observer"
    return None


# Category normalization for cleaner display
# (We take the raw CSV values and bucket them into tidy labels)

def norm_mother_edu(v: str) -> str:
    v = (v or "").strip()
    if not v or v.lower() in ("unsure", "prefer not to say", "i don't know"):
        return "Unknown / prefer not to say"
    vl = v.lower()
    if "doctorate" in vl or "phd" in vl or "professional degree" in vl or "jd" in vl or "md" in vl:
        return "Doctorate / Professional"
    if "master" in vl:
        return "Master's degree"
    if "bachelor" in vl:
        return "Bachelor's degree"
    if "associate" in vl or "some college" in vl or "trade" in vl or "vocational" in vl:
        return "Associate's / Some college / Trade"
    if "high school" in vl or "ged" in vl or "secondary" in vl:
        return "High school or GED"
    if "less than" in vl or "no formal" in vl:
        return "Less than high school"
    return v[:40]

def norm_father_edu(v: str) -> str:
    return norm_mother_edu(v)  # Same buckets

def norm_ses(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown"
    vl = v.lower()
    if "wealthy" in vl or "upper class" in vl or "affluent" in vl:
        return "Upper / wealthy"
    if "upper-middle" in vl or "upper middle" in vl:
        return "Upper-middle"
    if "middle" in vl and "lower" not in vl and "upper" not in vl:
        return "Middle"
    if "lower-middle" in vl or "lower middle" in vl or "working" in vl:
        return "Working / lower-middle"
    if "poor" in vl or "struggle" in vl or "poverty" in vl or "below" in vl:
        return "Poor / struggling"
    return v[:40]

def norm_politics(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown / prefer not to say"
    vl = v.lower()
    # Order checks carefully — "very liberal" must match before "liberal"
    if "very liberal" in vl or "very progressive" in vl or "far left" in vl:
        return "Very liberal / far left"
    if "liberal" in vl or "progressive" in vl or "left-leaning" in vl or "lean left" in vl:
        return "Liberal / left-leaning"
    if "moderate" in vl or "centrist" in vl or "mixed" in vl:
        return "Moderate / centrist"
    if "very conservative" in vl or "far right" in vl or "very traditional" in vl:
        return "Very conservative / far right"
    if "conservative" in vl or "traditional" in vl or "right-leaning" in vl or "lean right" in vl:
        return "Conservative / right-leaning"
    if "libertarian" in vl or "independent" in vl or "apolitical" in vl or "non-political" in vl:
        return "Libertarian / independent / apolitical"
    if "religious" in vl:
        return "Religious (not left/right)"
    return "Other / prefer not to say"

def norm_religion_significant(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown"
    vl = v.lower()
    if vl.startswith("yes") or "significant" in vl or "very important" in vl:
        return "Yes — significant"
    if "somewhat" in vl or "partially" in vl or "moderate" in vl:
        return "Somewhat"
    if vl.startswith("no") or "not religious" in vl or "secular" in vl:
        return "No / secular"
    return "Other"

def norm_tradition(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "None / secular"
    vl = v.lower()
    # Match in specificity order — most specific first
    if "jewish" in vl or "judaism" in vl:
        return "Jewish"
    if "muslim" in vl or "islam" in vl:
        return "Muslim / Islamic"
    if "catholic" in vl:
        return "Catholic"
    if "evangelical" in vl or "fundamentalist" in vl or "pentecost" in vl or "southern baptist" in vl:
        return "Evangelical Christian"
    if "mormon" in vl or "lds" in vl or "latter-day" in vl:
        return "LDS / Mormon"
    if "christian" in vl or "protestant" in vl or "methodist" in vl or "baptist" in vl or "lutheran" in vl or "presbyterian" in vl or "episcopal" in vl or "anglican" in vl:
        return "Other Christian"
    if "hindu" in vl:
        return "Hindu"
    if "buddhist" in vl:
        return "Buddhist"
    if "sikh" in vl:
        return "Sikh"
    if "none" in vl or "atheist" in vl or "agnostic" in vl or "secular" in vl or "no religion" in vl or "n/a" in vl or "not applicable" in vl:
        return "None / atheist / agnostic / secular"
    if "spiritual" in vl and "not religious" in vl:
        return "Spiritual but not religious"
    return "Other / mixed"

def norm_generation(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown"
    vl = v.lower()
    if "silent" in vl or "greatest" in vl:
        return "Silent / Greatest (pre-1946)"
    if "boomer" in vl:
        return "Boomer (1946-1964)"
    if "gen x" in vl or "generation x" in vl:
        return "Gen X (1965-1980)"
    if "millennial" in vl or "gen y" in vl:
        return "Millennial (1981-1996)"
    if "gen z" in vl or "generation z" in vl or "zoomer" in vl:
        return "Gen Z (1997-2012)"
    return v[:30]

def norm_race(v: str) -> list[str]:
    """Race is multi-select, so this returns a list of normalized labels."""
    v = (v or "").strip()
    if not v:
        return ["Unknown"]
    parts = [p.strip() for p in re.split(r'[,;]|(?<=[a-z])/(?=[A-Z])', v) if p.strip()]
    result = []
    for p in parts:
        pl = p.lower()
        if "white" in pl or "european" in pl or "caucasian" in pl:
            result.append("White / European")
        elif "black" in pl or "african" in pl:
            result.append("Black / African heritage")
        elif "asian" in pl:
            result.append("Asian")
        elif "hispanic" in pl or "latino" in pl or "latina" in pl or "latinx" in pl:
            result.append("Hispanic / Latino")
        elif "native" in pl or "indigenous" in pl or "first nations" in pl or "american indian" in pl:
            result.append("Native / Indigenous")
        elif "middle east" in pl or "arab" in pl or "persian" in pl or "iranian" in pl or "turkish" in pl:
            result.append("Middle Eastern / North African")
        elif "pacific" in pl:
            result.append("Pacific Islander")
        elif "mixed" in pl or "multi" in pl:
            result.append("Mixed / multiple")
        elif "prefer not" in pl or "decline" in pl:
            result.append("Prefer not to say")
        else:
            # Truncate long freetext to keep category clean
            if len(p) < 25:
                result.append(p)
            else:
                result.append("Other")
    # Dedup but preserve order
    seen = set()
    dedup = []
    for r in result:
        if r not in seen:
            seen.add(r)
            dedup.append(r)
    return dedup

def norm_country(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown"
    vl = v.lower()
    if "united states" in vl or vl == "usa" or vl == "us" or "america" in vl:
        return "USA"
    if "united kingdom" in vl or vl == "uk" or "england" in vl or "britain" in vl or "wales" in vl or "scotland" in vl:
        return "United Kingdom"
    if "canada" in vl:
        return "Canada"
    if "australia" in vl:
        return "Australia"
    if "germany" in vl:
        return "Germany"
    if "france" in vl:
        return "France"
    if "israel" in vl:
        return "Israel"
    return v[:30]

def norm_resp_edu(v: str) -> str:
    return norm_mother_edu(v)  # Same buckets

def norm_age(v: str) -> str:
    v = (v or "").strip()
    if not v:
        return "Unknown"
    # Try to extract a number
    m = re.search(r'\d+', v)
    if not m:
        return v[:20]
    age = int(m.group())
    if age < 18:
        return "Under 18"
    if age < 25:
        return "18-24"
    if age < 35:
        return "25-34"
    if age < 45:
        return "35-44"
    if age < 55:
        return "45-54"
    if age < 65:
        return "55-64"
    return "65+"


# Dimensions we want to expose in the explorer, in display order
DIMENSIONS = [
    {
        "id": "family_politics",
        "label": "Family's political lean during upbringing",
        "short": "Politics",
        "col": COL_FAMILY_POLITICS,
        "normalizer": norm_politics,
        "order": ["Very liberal / far left", "Liberal / left-leaning", "Libertarian / independent / apolitical", "Moderate / centrist", "Religious (not left/right)", "Conservative / right-leaning", "Very conservative / far right", "Other / prefer not to say", "Unknown / prefer not to say"],
    },
    {
        "id": "mother_edu",
        "label": "Mother's education level",
        "short": "Mother's education",
        "col": COL_MOTHER_EDU,
        "normalizer": norm_mother_edu,
        "order": ["Less than high school", "High school or GED", "Associate's / Some college / Trade", "Bachelor's degree", "Master's degree", "Doctorate / Professional", "Unknown / prefer not to say"],
    },
    {
        "id": "father_edu",
        "label": "Father's education level",
        "short": "Father's education",
        "col": COL_FATHER_EDU,
        "normalizer": norm_father_edu,
        "order": ["Less than high school", "High school or GED", "Associate's / Some college / Trade", "Bachelor's degree", "Master's degree", "Doctorate / Professional", "Unknown / prefer not to say"],
    },
    {
        "id": "family_ses",
        "label": "Family's socioeconomic status (childhood)",
        "short": "Family SES",
        "col": COL_FAMILY_SES,
        "normalizer": norm_ses,
        "order": ["Poor / struggling", "Working / lower-middle", "Middle", "Upper-middle", "Upper / wealthy", "Unknown"],
    },
    {
        "id": "religion_significant",
        "label": "Religion significant during upbringing",
        "short": "Religious upbringing",
        "col": COL_RELIGION_SIGNIFICANT,
        "normalizer": norm_religion_significant,
        "order": ["Yes — significant", "Somewhat", "No / secular", "Other", "Unknown"],
    },
    {
        "id": "primary_tradition",
        "label": "Primary religious tradition during upbringing",
        "short": "Religious tradition",
        "col": COL_PRIMARY_TRADITION,
        "normalizer": norm_tradition,
        "order": ["Jewish", "Muslim / Islamic", "Catholic", "Evangelical Christian", "Other Christian", "LDS / Mormon", "Hindu", "Buddhist", "Sikh", "Spiritual but not religious", "None / atheist / agnostic / secular", "Other / mixed", "None / secular"],
    },
    {
        "id": "generation",
        "label": "Generation",
        "short": "Generation",
        "col": COL_GENERATION,
        "normalizer": norm_generation,
        "order": ["Silent / Greatest (pre-1946)", "Boomer (1946-1964)", "Gen X (1965-1980)", "Millennial (1981-1996)", "Gen Z (1997-2012)", "Unknown"],
    },
    {
        "id": "age",
        "label": "Current age",
        "short": "Age",
        "col": COL_AGE,
        "normalizer": norm_age,
        "order": ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"],
    },
    {
        "id": "resp_edu",
        "label": "Respondent's education level",
        "short": "Your education",
        "col": COL_RESP_EDU,
        "normalizer": norm_resp_edu,
        "order": ["Less than high school", "High school or GED", "Associate's / Some college / Trade", "Bachelor's degree", "Master's degree", "Doctorate / Professional", "Unknown / prefer not to say"],
    },
    {
        "id": "country_birth",
        "label": "Country of birth",
        "short": "Country",
        "col": COL_COUNTRY_BIRTH,
        "normalizer": norm_country,
        "order": ["USA", "Canada", "United Kingdom", "Australia", "Germany", "France", "Israel", "Unknown"],
    },
]

# Race is special — multi-select, handled separately
RACE_DIMENSION = {
    "id": "race",
    "label": "Race / ethnicity",
    "short": "Race / ethnicity",
    "col": COL_RACE,
    "order": ["White / European", "Black / African heritage", "Asian", "Hispanic / Latino", "Middle Eastern / North African", "Native / Indigenous", "Pacific Islander", "Mixed / multiple", "Other", "Unknown"],
}

# Minimum cell size for display (cells smaller than this are aggregated into "Other")
MIN_CELL_SIZE = 5


def crosstab(rows, col, normalizer):
    """For a given dimension, return {category: {pathway: count, ...}}"""
    tab = defaultdict(lambda: defaultdict(int))
    for row in rows:
        if len(row) <= max(col, COL_PATHWAY):
            continue
        pathway = classify_pathway(row[COL_PATHWAY])
        if pathway is None:
            continue
        category = normalizer(row[col])
        tab[category][pathway] += 1
        tab[category]["_total"] += 1
    return tab

def crosstab_multi(rows, col, multi_normalizer):
    """Same as crosstab, but for multi-select columns like race.
    A respondent checking multiple boxes counts once in each category."""
    tab = defaultdict(lambda: defaultdict(int))
    for row in rows:
        if len(row) <= max(col, COL_PATHWAY):
            continue
        pathway = classify_pathway(row[COL_PATHWAY])
        if pathway is None:
            continue
        categories = multi_normalizer(row[col])
        for category in categories:
            tab[category][pathway] += 1
            tab[category]["_total"] += 1
    return tab

def format_crosstab(tab, order):
    """Turn the tab dict into an ordered list of {category, counts, pct}, respecting display order and min cell size."""
    result = []
    # Aggregate small cells into 'Other'
    other = defaultdict(int)
    other_has_data = False
    for cat, counts in tab.items():
        total = counts.get("_total", 0)
        if total < MIN_CELL_SIZE:
            for k, v in counts.items():
                other[k] += v
            other_has_data = True

    # Use the declared order if available, then append anything else
    cats_in_tab = set(tab.keys())
    ordered_cats = [c for c in order if c in cats_in_tab and tab[c].get("_total", 0) >= MIN_CELL_SIZE]
    extras = sorted(
        [c for c in cats_in_tab if c not in order and tab[c].get("_total", 0) >= MIN_CELL_SIZE],
        key=lambda c: -tab[c].get("_total", 0)
    )
    all_cats = ordered_cats + extras

    for cat in all_cats:
        counts = tab[cat]
        total = counts.get("_total", 0)
        if total < MIN_CELL_SIZE:
            continue
        result.append({
            "category": cat,
            "total": total,
            "intact": counts.get("intact", 0),
            "circumcised": counts.get("circumcised", 0),
            "restoring": counts.get("restoring", 0),
            "observer": counts.get("observer", 0),
            "pct_intact": round(counts.get("intact", 0) / total * 100, 1),
            "pct_circumcised": round((counts.get("circumcised", 0) + counts.get("restoring", 0)) / total * 100, 1),
            "pct_observer": round(counts.get("observer", 0) / total * 100, 1),
        })

    # Append the "Other / too small" bucket if anything went there
    if other_has_data and other["_total"] >= MIN_CELL_SIZE:
        total = other["_total"]
        result.append({
            "category": "Other / smaller groups (combined)",
            "total": total,
            "intact": other.get("intact", 0),
            "circumcised": other.get("circumcised", 0),
            "restoring": other.get("restoring", 0),
            "observer": other.get("observer", 0),
            "pct_intact": round(other.get("intact", 0) / total * 100, 1),
            "pct_circumcised": round((other.get("circumcised", 0) + other.get("restoring", 0)) / total * 100, 1),
            "pct_observer": round(other.get("observer", 0) / total * 100, 1),
        })

    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 demographics.py <responses.csv> [output.js]", file=sys.stderr)
        sys.exit(1)

    csv_path = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else None

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)

    print(f"Loaded {len(rows)} respondents from {csv_path}", file=sys.stderr)

    # Filter to respondents with a classified pathway
    classified_rows = [r for r in rows if len(r) > COL_PATHWAY and classify_pathway(r[COL_PATHWAY])]
    print(f"Classified pathway: {len(classified_rows)}", file=sys.stderr)

    # Build all dimension cross-tabs
    dimensions_out = []
    for dim in DIMENSIONS:
        tab = crosstab(classified_rows, dim["col"], dim["normalizer"])
        formatted = format_crosstab(tab, dim["order"])
        dimensions_out.append({
            "id": dim["id"],
            "label": dim["label"],
            "short": dim["short"],
            "categories": formatted,
        })
        # Log for dev visibility
        print(f"  {dim['short']}: {len(formatted)} categories", file=sys.stderr)

    # Race (multi-select)
    race_tab = crosstab_multi(classified_rows, RACE_DIMENSION["col"], norm_race)
    race_formatted = format_crosstab(race_tab, RACE_DIMENSION["order"])
    dimensions_out.append({
        "id": RACE_DIMENSION["id"],
        "label": RACE_DIMENSION["label"],
        "short": RACE_DIMENSION["short"],
        "categories": race_formatted,
        "note": "Multi-select: respondents identifying with multiple categories count in each.",
    })
    print(f"  Race: {len(race_formatted)} categories (multi-select)", file=sys.stderr)

    # Outlier analysis — for each dimension, which category has the highest % intact?
    # (This drives the "outlier profile" side card.)
    outlier_findings = []
    for d in dimensions_out:
        if not d["categories"]:
            continue
        # Find the category with highest intact rate among those with enough data
        viable = [c for c in d["categories"] if c["total"] >= 10 and c["category"] not in (
            "Unknown / prefer not to say", "Unknown", "Other / smaller groups (combined)",
            "Other / mixed", "Other", "None / secular"
        )]
        if not viable:
            continue
        viable.sort(key=lambda c: -c["pct_intact"])
        top = viable[0]
        bottom = viable[-1]
        outlier_findings.append({
            "dimension_id": d["id"],
            "dimension_label": d["short"],
            "most_intact_category": top["category"],
            "most_intact_pct": top["pct_intact"],
            "most_intact_n": top["total"],
            "least_intact_category": bottom["category"],
            "least_intact_pct": bottom["pct_intact"],
            "least_intact_n": bottom["total"],
            "spread": round(top["pct_intact"] - bottom["pct_intact"], 1),
        })

    # Sort outliers by spread — biggest distinguishing factors first
    outlier_findings.sort(key=lambda f: -f["spread"])

    # Overall base rate for context
    total_classified = len(classified_rows)
    n_intact = sum(1 for r in classified_rows if classify_pathway(r[COL_PATHWAY]) == "intact")
    n_circ = sum(1 for r in classified_rows if classify_pathway(r[COL_PATHWAY]) in ("circumcised", "restoring"))
    n_observer = sum(1 for r in classified_rows if classify_pathway(r[COL_PATHWAY]) == "observer")

    base_rate = {
        "total": total_classified,
        "intact": n_intact,
        "circumcised": n_circ,
        "observer": n_observer,
        "pct_intact": round(n_intact / total_classified * 100, 1) if total_classified else 0,
        "pct_circumcised": round(n_circ / total_classified * 100, 1) if total_classified else 0,
        "pct_observer": round(n_observer / total_classified * 100, 1) if total_classified else 0,
    }

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalRespondents": total_classified,
        "minCellSize": MIN_CELL_SIZE,
        "baseRate": base_rate,
        "dimensions": dimensions_out,
        "outlierFindings": outlier_findings,
    }

    js = (
        "// ═══════════════════════════════════════════════════════════════\n"
        "// CircumSurvey — Auto-generated demographic cross-tabs\n"
        f"// Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
        "// DO NOT EDIT MANUALLY — regenerated by scripts/demographics.py\n"
        "// ═══════════════════════════════════════════════════════════════\n\n"
        "const _demographics = "
        + json.dumps(output, indent=2)
        + ";\n\n"
        "export const DEMOGRAPHIC_DIMENSIONS = _demographics.dimensions;\n"
        "export const DEMOGRAPHIC_BASE_RATE   = _demographics.baseRate;\n"
        "export const DEMOGRAPHIC_OUTLIERS    = _demographics.outlierFindings;\n"
        "export const DEMOGRAPHIC_META        = {\n"
        "  generatedAt: _demographics.generatedAt,\n"
        "  totalRespondents: _demographics.totalRespondents,\n"
        "  minCellSize: _demographics.minCellSize,\n"
        "};\n"
    )

    if out_path:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print(f"\nWrote {out_path}", file=sys.stderr)
    else:
        print(js)

if __name__ == "__main__":
    main()
