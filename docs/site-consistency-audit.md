# Site-Wide Consistency Audit — 2026-06-22

**Standard applied** (per Tone's intent):
- **The Special Report / narrative is a *frozen* ~500-respondent snapshot.** It need not match the live DB, but it must be **internally consistent** (one total, one pathway split) and ideally **labeled as a snapshot** ("as of …" / "first 500 respondents").
- **The Explore side is *live* from the data source.** Its counts must come from the API (`/count`, `/questions`), never hardcoded — otherwise they silently drift (live is now 518, but the code says 501).

Findings are ordered by severity against that standard.

---

## 🔴 Tier 1 — Count integrity (violates the stated intent)

### 1. Explore hardcodes its headline counts instead of being live
The `/count` endpoint exists and is used in only two places (`TheForwardViewPage`, `DemographicsDashboardPage`). Everywhere else the "live" Explore surface ships frozen literals that already disagree with the live 518:

| Location | Hardcoded | Should be |
|---|---|---|
| `components/ExploreMasthead.jsx:31` (index hero desc) | "**501 voices** … **355 questions**" | live `/count` + `/questions` |
| `pages/IndexPage.jsx` (status strip + loaders) | "501", "355 questions" (×) | live |
| `components/SurveyFlowchart.jsx:350,702` | "501" | live |
| `components/PathwayChips.jsx:41` | `All · {totalN}` where `totalN` sums `pathways.js` | live |
| `lib/pathways.js:14–38` | n: 142 / 213 / 109 / 37 | live per-pathway from `/count` |
| `pages/MethodologyPage.jsx:55` | "n=501" (see #3) | live |
| `pages/ReligiousMirrorsPage.jsx:87` | `totalRespondents = 501` | live |

**Fix:** fetch `/count` once at the Explore shell, thread totals down (or a tiny `useCount()` hook). Then the masthead, index, flowchart, chips, and Religious "Missing Congregation" all read the same live number and never drift again.

### 2. The frozen report contradicts *itself* (501 vs 496)
`src/data.js` carries **two different pathway splits**:
- `demographics` block → intact **142**, circ **213**, restoring 109, observer 37 = **501** ✓ (matches the stated total)
- `pathways[]` block → intact **140**, circ **210**, restoring 109, observer 37 = **496** ✗

The narrative renders the **140/210** set, so the Special Report shows a **501 total beside a split that sums to 496**. A careful reader (or hostile journalist) will notice the arithmetic doesn't close.

**Fix:** make the snapshot self-consistent — use **142/213/109/37** (sums to 501) everywhere in the narrative, and delete the stale 140/210 copy. Then add a one-line label ("Snapshot of the first 501 respondents; the live explorer reflects all current responses") so the frozen-vs-live gap is *explained*, not hidden.

### 3. Explore Methodology card breaks both standards at once
`pages/MethodologyPage.jsx` — header "**Survey Sample Demographics (n=501)**" with cohort tiles **210 / 140 / 109 / 37 = 496**. So: (a) parts don't sum to the header, **and** (b) it's on the *live* side showing frozen 2026-era numbers. This is the most visible single violation.
**Fix:** drive this card from `/count` (it's the one page explicitly about rigor — it must be exact).

---

## 🟠 Tier 2 — Visible labeling inconsistencies

### 4. Exhibit numbering still disagrees across the two catalogs
`ROUTE_META.kicker` (drives the hero) vs `EXHIBIT_ROUTES.num` (drives tiles + breadcrumb):
- **the-forward-view:** ROUTE_META kicker = "**Exhibit 16**", EXHIBIT_ROUTES num = "**Conclusion**" → the hero prints "Interactive Exhibit 16" while its dashboard tile and breadcrumb say "Conclusion."
- Numbering has gaps/dupes: `numbers` = 12, `adult-experience` = 11, `the-decision` = 13, `final-thoughts` = 15, **no 14**, `culture`/`generational-faultlines` both 07.
- `ROUTE_META.index.desc` also hardcodes "355 questions" (see #1).

**Fix:** make `EXHIBIT_ROUTES` the single source for number + kicker; derive ROUTE_META kickers from it (or delete the duplicate field).

### 5. "Sections" vs "Exhibits" is now split-brain
In `InlineBreadcrumb.jsx`, the crumb label reads "**Exhibits**" (line 46) but the dropdown items render "**Section NN**" (`ex.num.replace(/Exhibit/i,"Section")`, line 117). So one breadcrumb shows *"Exhibits / [name]"* over a menu of *"Section 01, Section 02…"*. (Looks like the crumb edit was reverted while the item transform stayed.) Pick one: crumb → "Sections" to match the items, or drop the `.replace` to keep "Exhibit." Same dropdown lives in `ExploreMasthead.jsx`.

---

## 🟡 Tier 3 — Verify / carry-over

### 6. Stray sample sizes in the narrative scrollytelling
`LandingPage.jsx` contains `n = 800`, `n = 1600`, `n=580`, `n=1001` — none match the 501 snapshot. These are likely **illustrative** (a sampling explainer, or specific cross-question n's), but they *read* as survey counts. Please confirm each is intentional; if illustrative, label it ("e.g.,") so it can't be mistaken for the real n.

### 7. Pathway color drift (still open from the exhibits review)
Some exhibits hardcode non-canonical pathway colors instead of the tokens: Forward View paints circumcised **blue**, Restoration paints restoring **purple**, the Methodology card uses circ **green** / intact **blue**. Route all pathway colors through `--path-*` tokens. (Detail: `docs/explore-exhibits-review.md` §5.)

### 8. Small-sample guardrail coverage (still open)
`SmallSampleBadge` (n<5 suppress, n<20 warn) is wired into only ~4 of ~16 exhibits; deep cohort filters can still render a confident chart on n=3 with no caveat. (Detail: review §4.)

---

## Summary

The frozen-vs-live split is a sound design — but right now **neither side fully honors it**: the live side is hardcoded (Tier 1 #1, #3), and the frozen side isn't internally consistent (#2). The single highest-leverage fix is a `useCount()` hook feeding every Explore headline number from `/count`, plus reconciling `data.js` to one 501 split and labeling the snapshot. That alone resolves #1, #2, #3, and most of #4.
