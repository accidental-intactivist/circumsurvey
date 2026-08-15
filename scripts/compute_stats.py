#!/usr/bin/env python3
"""
compute_stats.py — Phase 1 statistics from the raw response database.

Reads the local SQLite database (the raw individual-level responses that never
leave your machine) and emits two artifacts:

  1. src/components/GuidedTour/tourStats.json  — per-metric means, SD, n, 95% CI,
     and Welch's t-test / Cohen's d for the six sexual-experience ("pleasure gap")
     ratings. This is the file the Guided Tour's ResearcherFootnote cites.

  2. src/data/phase1_frozen.json — a compact canonical table of the frozen
     headline numbers (pleasure-metric means + pathway n's). scripts/freeze_phase1.js
     reads THIS file to stamp/verify the values baked into tourData.js and data.js,
     so every surface reads from one computed source of truth.

Provenance note (important — this is what the peer review flagged):
  The 1–5 rating for each metric is stored in `responses.value_text`
  (e.g. "3 (Medium/Average)"). The `responses.value_num` column is only
  sparsely back-filled (~30% of rows). Computing off value_num alone silently
  drops ~two-thirds of respondents and biases every mean (that is how the site
  ended up with two different "pleasure gap" numbers). This script parses the
  leading 1–5 digit out of value_text and falls back to value_num, so it uses
  the COMPLETE set of responses. Use --rating-source to compare strategies.

Stdlib only — no numpy/scipy (matches the rest of scripts/). Welch's t-test,
the Student-t CDF (regularized incomplete beta) and the t critical value used
for the confidence interval are implemented below.

Usage:
  python3 scripts/compute_stats.py                         # writes both artifacts
  python3 scripts/compute_stats.py --db local_db.sqlite    # explicit DB path
  python3 scripts/compute_stats.py --check                 # compute + print, write nothing
  python3 scripts/compute_stats.py --rating-source value_num   # legacy (biased) subset

Exit code is 0 on success, non-zero on error (missing DB, empty metric, etc.).
"""

import argparse
import json
import math
import os
import re
import sqlite3
import sys

# ── The six sexual-experience ("pleasure gap") ratings ─────────────────────────
# question_id in the `questions`/`responses` tables → display label.
# Order here is the order written to tourStats.json.
METRICS = [
    ("exp_sex_rating_orgasm_intensity",        "Intensity"),
    ("exp_sex_rating_orgasm_duration",         "Duration"),
    ("exp_sex_rating_ease_of_orgasm",          "Ease"),
    ("exp_sex_rating_sensitivity_light_touch", "Light touch"),
    ("exp_sex_rating_pleasure_mobile_skin",    "Mobile skin"),
    ("exp_sex_rating_variety_of_sensation",    "Variety"),
]

PATHWAYS = ("intact", "circumcised", "restoring")

# Pairwise comparisons emitted per metric (name → (group_a, group_b)).
COMPARISONS = {
    "intact_vs_circ":    ("intact", "circumcised"),
    "restoring_vs_circ": ("restoring", "circumcised"),
}

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DEFAULT_DB = os.path.join(REPO, "local_db.sqlite")
TOURSTATS_OUT = os.path.join(REPO, "src", "components", "GuidedTour", "tourStats.json")
FROZEN_OUT = os.path.join(REPO, "src", "data", "phase1_frozen.json")


# ── Rating extraction ─────────────────────────────────────────────────────────
_LEAD = re.compile(r"\s*([1-5])")


def parse_rating(value_num, value_text, source):
    """Return an int 1–5 for a rating cell, or None if unusable.

    source="text"     : parse leading digit from value_text, fall back to value_num.
                        This is the canonical path — it uses every answered cell.
    source="value_num": use value_num only (legacy; biased ~30% subset).
    """
    if source == "value_num":
        if value_num is None:
            return None
        v = int(round(value_num))
        return v if 1 <= v <= 5 else None
    # source == "text"
    if value_text is not None:
        m = _LEAD.match(str(value_text))
        if m:
            return int(m.group(1))
    if value_num is not None:
        v = int(round(value_num))
        if 1 <= v <= 5:
            return v
    return None


def collect(cur, question_id, pathway, source):
    rows = cur.execute(
        """SELECT r.value_num, r.value_text
             FROM responses r
             JOIN respondents resp ON resp.id = r.respondent_id
            WHERE r.question_id = ? AND resp.pathway = ?""",
        (question_id, pathway),
    ).fetchall()
    out = []
    for value_num, value_text in rows:
        v = parse_rating(value_num, value_text, source)
        if v is not None:
            out.append(float(v))
    return out


# ── Descriptive statistics ────────────────────────────────────────────────────
def mean(xs):
    return sum(xs) / len(xs)


def sample_variance(xs, m):
    if len(xs) < 2:
        return 0.0
    return sum((x - m) ** 2 for x in xs) / (len(xs) - 1)


def describe(xs):
    m = mean(xs)
    var = sample_variance(xs, m)
    sd = math.sqrt(var)
    df = len(xs) - 1
    if df >= 1 and sd > 0:
        tcrit = t_critical_two_sided(0.95, df)
        half = tcrit * sd / math.sqrt(len(xs))
    else:
        half = 0.0
    return {
        "mean": round(m, 3),
        "sd": round(sd, 3),
        "n": len(xs),
        "ci95": [round(m - half, 3), round(m + half, 3)],
        "_mean": m, "_var": var, "_n": len(xs),  # unrounded, for downstream tests
    }


# ── Student-t distribution (stdlib only) ──────────────────────────────────────
def _betacf(a, b, x):
    """Continued fraction for the incomplete beta function (Numerical Recipes)."""
    MAXIT, EPS, FPMIN = 200, 3.0e-12, 1.0e-300
    qab, qap, qam = a + b, a + 1.0, a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < FPMIN:
        d = FPMIN
    d = 1.0 / d
    h = d
    for m in range(1, MAXIT + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < FPMIN:
            d = FPMIN
        c = 1.0 + aa / c
        if abs(c) < FPMIN:
            c = FPMIN
        d = 1.0 / d
        de = d * c
        h *= de
        if abs(de - 1.0) < EPS:
            break
    return h


def betai(a, b, x):
    """Regularized incomplete beta function I_x(a, b)."""
    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    lbeta = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b)
    bt = math.exp(lbeta + a * math.log(x) + b * math.log(1.0 - x))
    if x < (a + 1.0) / (a + b + 2.0):
        return bt * _betacf(a, b, x) / a
    return 1.0 - bt * _betacf(b, a, 1.0 - x) / b


def t_sf_two_sided(t, df):
    """Two-tailed p-value P(|T| >= |t|) for Student-t with df degrees of freedom."""
    if df <= 0:
        return float("nan")
    x = df / (df + t * t)
    return betai(df / 2.0, 0.5, x)


def t_cdf(t, df):
    """CDF of Student-t at t."""
    p_tail = 0.5 * t_sf_two_sided(t, df)  # one tail area beyond |t|
    return 1.0 - p_tail if t > 0 else p_tail


def t_critical_two_sided(conf, df):
    """t value such that P(-t < T < t) = conf, via bisection on the CDF."""
    target = 1.0 - (1.0 - conf) / 2.0  # upper-tail cumulative probability
    lo, hi = 0.0, 1000.0
    for _ in range(200):
        mid = (lo + hi) / 2.0
        if t_cdf(mid, df) < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2.0


# ── Welch's t-test + Cohen's d ────────────────────────────────────────────────
def stars(p):
    if p < 0.001:
        return "***"
    if p < 0.01:
        return "**"
    if p < 0.05:
        return "*"
    return "ns"


def welch(a, b):
    """Welch's t-test between describe() dicts a and b. Returns t, df, p, d, stars."""
    na, nb = a["_n"], b["_n"]
    ma, mb = a["_mean"], b["_mean"]
    va, vb = a["_var"], b["_var"]
    if na < 2 or nb < 2 or (va == 0 and vb == 0):
        return {"cohens_d": 0.0, "t_stat": 0.0, "df": 0.0, "p_value": float("nan"), "stars": "ns"}
    se = math.sqrt(va / na + vb / nb)
    t = (ma - mb) / se if se > 0 else 0.0
    # Welch–Satterthwaite degrees of freedom
    num = (va / na + vb / nb) ** 2
    den = (va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1)
    df = num / den if den > 0 else 0.0
    p = t_sf_two_sided(t, df)
    # Cohen's d with pooled SD
    pooled = math.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    d = (ma - mb) / pooled if pooled > 0 else 0.0
    return {
        "cohens_d": round(d, 3),
        "t_stat": round(t, 3),
        "df": round(df, 1),
        "p_value": p,
        "stars": stars(p),
    }


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Compute Phase 1 pleasure-gap statistics from the raw DB.")
    ap.add_argument("--db", default=DEFAULT_DB, help="Path to the SQLite response DB (default: local_db.sqlite)")
    ap.add_argument("--rating-source", choices=["text", "value_num"], default="text",
                    help="How to read the 1-5 rating. 'text' (default, canonical, full sample) "
                         "or 'value_num' (legacy, biased ~30%% subset).")
    ap.add_argument("--check", action="store_true", help="Compute and print a summary; do not write files.")
    ap.add_argument("--tourstats-out", default=TOURSTATS_OUT)
    ap.add_argument("--frozen-out", default=FROZEN_OUT)
    args = ap.parse_args()

    if not os.path.exists(args.db):
        sys.exit(f"ERROR: database not found: {args.db}\n"
                 f"       This script needs the raw local response DB (never committed).")

    con = sqlite3.connect(args.db)
    cur = con.cursor()

    pathway_counts = dict(cur.execute(
        "SELECT COALESCE(pathway,'null'), COUNT(*) FROM respondents GROUP BY pathway").fetchall())
    total = cur.execute("SELECT COUNT(*) FROM respondents").fetchone()[0]

    pleasure_gap = {}
    frozen_metrics = []
    print(f"Rating source: {args.rating_source}   DB: {os.path.relpath(args.db, REPO)}   total respondents: {total}")
    print(f"{'metric':12} {'intact':>18} {'circumcised':>18} {'restoring':>18}   {'d(I-C)':>7} {'p(I-C)':>10}")

    for qid, label in METRICS:
        stat = {"label": label}
        groups = {}
        for p in PATHWAYS:
            xs = collect(cur, qid, p, args.rating_source)
            if not xs:
                sys.exit(f"ERROR: no usable ratings for {qid} / {p}")
            groups[p] = describe(xs)
            stat[p] = {k: v for k, v in groups[p].items() if not k.startswith("_")}
        for name, (ga, gb) in COMPARISONS.items():
            stat[name] = welch(groups[ga], groups[gb])
        pleasure_gap[qid_short(qid)] = strip_private(stat)

        ic = stat["intact_vs_circ"]
        print(f"{label:12} "
              f"{groups['intact']['mean']:>7.2f} (n={groups['intact']['n']:>3}) "
              f"{groups['circumcised']['mean']:>7.2f} (n={groups['circumcised']['n']:>3}) "
              f"{groups['restoring']['mean']:>7.2f} (n={groups['restoring']['n']:>3})   "
              f"{ic['cohens_d']:>7.2f} {ic['p_value']:>10.2e}")

        frozen_metrics.append({
            "label": label,
            "intact": groups["intact"]["mean"],
            "restoring": groups["restoring"]["mean"],
            "circumcised": groups["circumcised"]["mean"],
            "n": {p: groups[p]["n"] for p in PATHWAYS},
        })

    tourstats = {
        "pleasure_gap": pleasure_gap,
        "meta": {
            "total_responses": total,
            "pathway_counts": pathway_counts,
            "rating_source": args.rating_source,
            "note": "Phase 1 frozen snapshot. Self-selected, predominantly North American "
                    "sample; non-probability. Percentages and means describe this sample only. "
                    "All tests two-tailed Welch's t-test.",
        },
    }
    frozen = {
        "generated_from": os.path.basename(args.db),
        "rating_source": args.rating_source,
        "total_respondents": total,
        "pathway_counts": pathway_counts,
        "pleasure_metrics": frozen_metrics,
    }

    if args.check:
        print("\n--check: no files written.")
        return

    write_json(args.tourstats_out, tourstats)
    write_json(args.frozen_out, frozen)
    print(f"\nWrote {os.path.relpath(args.tourstats_out, REPO)}")
    print(f"Wrote {os.path.relpath(args.frozen_out, REPO)}")
    print("Next: `node scripts/freeze_phase1.js --check` to verify tourData.js / data.js match.")


def qid_short(qid):
    """Map the DB question_id to the short key used in tourStats.json."""
    return {
        "exp_sex_rating_orgasm_intensity": "intensity",
        "exp_sex_rating_orgasm_duration": "duration",
        "exp_sex_rating_ease_of_orgasm": "ease",
        "exp_sex_rating_sensitivity_light_touch": "light_touch",
        "exp_sex_rating_pleasure_mobile_skin": "mobile_skin",
        "exp_sex_rating_variety_of_sensation": "variety",
    }[qid]


def strip_private(stat):
    """Drop the unrounded helper keys (_mean/_var/_n) before serialization."""
    clean = {}
    for k, v in stat.items():
        if isinstance(v, dict):
            clean[k] = {kk: vv for kk, vv in v.items() if not kk.startswith("_")}
        else:
            clean[k] = v
    return clean


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")


if __name__ == "__main__":
    main()
