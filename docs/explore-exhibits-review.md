# Explore Exhibitions — Premium Elevation Review

*Prepared for: Tone Pettit · CircumSurvey / findings.circumsurvey.online*
*Scope: every exhibit in the Explore view (`circumsurvey/src/explore/**`) and its live data + theming layer. This is the canonical, actively developed copy of the project.*

---

## 1. Executive Summary

This is a different product than it was a few months ago. The Explore side has gone from three competent views to a genuine, themed exhibition hall — ~16 live exhibits, a CSS-variable theming engine with multiple skins (Standard, Vaporwave, light/dark, colorblind, typeface switches), a collapsing "harmonic canvas" masthead, a global "Ask a Docent" drawer, a report builder, and chart vocabulary that now includes dumbbell plots, multi-stage Sankeys, correlation matrices, geographic heatmaps, divergence radars, and word clouds. Several exhibits (Pleasure Gap, By the Numbers, Religious Mirrors, Restoration Journey, the Correlations Explorer) are legitimately award-shortlist quality. The cross-comparison ambition you set out to maximize is now the backbone of the whole experience.

So the bar for "what would elevate this further" has moved. You're past the feature-acquisition phase. **The work that now separates "very impressive" from "ultra-premium" is cohesion and trust** — making 16 independently-excellent exhibits feel like one authored instrument, and making every number and quote on the page unimpeachable. Almost everything below is in service of those two goals, not new features.

The single most important item is **#3 (the trust layer)** — raw open-text responses are being rendered live with location attribution (generation + state/province + country). To be clear about the severity: direct identifiers like name and email are stripped from the dataset, so this is *not* a contact-info leak. The residual risk is re-identification from quasi-identifiers — a verbatim, intimate free-text answer tagged "Gen Z · Wyoming, USA" from a sub-cohort of a few dozen people can, in the tail cases (rare demographic combinations, distinctive content, very small sub-roles), point back to a real person. For the median quote the risk is low; it's concentrated in the tail.

Two things still make it worth handling first. One, it contradicts commitments written into your own `CLAUDE.md`: quotes "individually curated by Tone, reviewed for identifying details… Never dynamically pulled from the CSV," carrying "only the question it was answering and the pathway — nothing more," plus the on-page disclaimer "all identifying details removed" — which the state/generation tags technically break. (These are *your own self-imposed rules*. If you've since decided live narratives are acceptable, the fix may be to revise `CLAUDE.md` rather than the code — but right now the doc and the product disagree, and a careful reader could point to that gap.) Two, the mitigation is cheap (drop location attribution; gate verbatim text behind a minimum cohort size) while the downside, if a respondent is identified on a topic this sensitive, is high. That asymmetry — low cost, high consequence — is why it leads, not because the risk is large in every case.

---

## 2. Exhibit-by-Exhibit

A quick verdict on each live exhibit, with the one change that would most elevate it.

**01 · The Survey Map** (`PathwayPage` → `SurveyFlowchart`). A full-page interactive flowchart of the survey architecture — a strong, orienting opener. *Elevate:* let nodes deep-link into the matching exhibit/question so the map becomes a navigational hub, not just a diagram.

**02 · Mirror Pairs** (`MirrorPairsPage`, ~1,480 lines). The flagship of the comparative thesis — now 30 pairs (up from 18), including universal questions split by pathway, with a `normalizeMirrorLabel` layer that reconciles divergent option wording between the intact and circumcised instruments. Genuinely sophisticated. *Elevate:* add a one-line "divergence magnitude" indicator per pair so a scanner can see *which* mirrors are the dramatic ones without reading every chart.

**03 · The Pleasure Gap** (`PleasureGapPage`). Dumbbell "gap plot" + classic columns, group-by pivot, show-gap toggle, a detailed matrix, and keyword-matched live quotes. Beautiful. *Elevate:* the hero sentence ("the largest gap… was 2.5 points") is static while the data is cohort-filterable — make the headline stat recompute with the filter, or label it explicitly as the full-sample figure.

**04 · Correlations Explorer** (`CorrelationExplorerPage`, ~1,010 lines). An X×Y matrix engine with a clever `MIRROR_AGGREGATES` concept that *unions* pathway-routed mirror questions into one whole-population variable (no double-count, since each respondent saw only one source). This is your Swiss-army surface. *Elevate:* surface a plain-language significance/effect-size cue (even "strong / weak / n too small") so non-statisticians trust what they're seeing.

**05 · Demographic Explorer / "Cohort X-Ray"** (`DemographicsDashboardPage`, ~1,540 lines). GSAP scroll-triggered, world/US `GeographicHeatmap`, demographic Sankey, "DNA strips," divergence radar. The most visually ambitious exhibit — and, notably, it correctly pulls pathway colors from the shared tokens. *Elevate:* it's the heaviest page (GSAP + maps + multiple aggregates); add skeleton loaders and lazy-mount below-the-fold sections so first paint feels instant.

**06 · The Voices / Narrative Mirrors** (`NarrativeMirrorsPage`). Side-by-side word clouds + narrative lists across pathways, with click-to-filter words. Powerful. *Elevate:* this is ground-zero for the privacy fix (§3) and naming drift (the card says "The Voices," the page says "Narrative Mirrors," the nav says "Narratives," the hero says "Exhibit 03").

**07 · Culture & Generations** (`CultureGenerationsPage`). Generational/attitudinal shifts; uses `SmallSampleBadge` (good). *Elevate:* a consistent generational color ramp shared with By-the-Numbers' generational trend chart.

**08 · The Observer Lens** (`ObserverLensPage`). Tabbed by sub-role (partner, parent, healthcare, advocate…). Honest about thin data and routes people to take the survey. *Elevate:* the sub-roles are very small (healthcare n=2, etc.) and it currently drops quant <5 silently while still showing raw narratives — needs the §3 + §4 guardrails most acutely.

**09 · Religious Mirrors / "The Missing Congregation"** (`ReligiousMirrorsPage`). The model exhibit for ethics: it *opens* with a self-selection-bias callout, flags small samples with `SmallSampleBadge`, and tells each tradition's story only where data exists. This is the template the other exhibits should follow. *Elevate:* almost nothing — extend its small-sample discipline to its own narrative blocks.

**10 · Restoration Journey** (`RestorationJourneyPage`). A 4-stage Sankey (start RCI → current RCI → outcome → years) with an RCI reference legend. Stunning. *Elevate:* two issues — it hardcodes a non-canonical restoring color (purple `#a855f7`), and its copy editorializes ("the data speaks for itself… restoration is achievable"; "the tangible, physical rewards") in a way that crosses from instrument into advocacy (see §6).

**11 · Before & After: The Adult Experience** (`AdultExperiencePage`). Six paired before/after Sankeys for the n≈22 who remember both states — "forensically valuable," as the copy rightly says, and it uses the semantic red→blue spectrum consistently. *Elevate:* with n≈22 split across before×after, individual flows get tiny; add small-sample suppression to the Sankey ribbons.

**By the Numbers** (`ByTheNumbersPage`). Six live KPI cards that recompute on cohort filter, each with a drill-down (distribution + generational trend) and an embedded Copilot. One of the best. *Elevate:* the KPI math relies on exact option-label string matches (e.g. `label === "No, never"`); add a guard/telemetry so a future label tweak doesn't silently zero a headline number.

**The Forward View** (`TheForwardViewPage`). A cohort→decision Sankey showing the convergence on "keep intact." Clean. *Elevate:* it hardcodes circumcised = blue and restoring = purple — directly contradicting the canonical red/yellow used elsewhere (see §5). It also overlaps thematically with a By-the-Numbers KPI and Adult Experience; consider cross-linking rather than restating.

**Methodology** (`MethodologyPage`). Excellent, rigorous prose on selection bias, the "official baseline" flaw, and an open offer of the anonymized dataset. *Elevate:* its demographic card is stale — it shows 210 / 140 / 109 / 37 (which sums to 496) under an "n=501" header, contradicting the live 213 / 142 / 109 / 37 used everywhere else, and it paints circumcised green / intact blue (a third palette). Drive these from `/count` (see §7).

**Report Builder** (`ReportBuilderPage`) + Docent drawer + Copilot. A real differentiator — visitors assemble their own findings. *Elevate:* make sure exported/shared reports carry the methodology caveat and small-sample flags with the charts.

**Placeholders.** The Decision, Final Thoughts, and Trans & Intersex are "Coming Soon (Phase 2)" stubs. They're correctly hidden from the dashboard grid, but still reachable by URL with full "Exhibit 13/15" numbering in metadata (see §5).

---

## 3. The Trust Layer — Raw Narratives & Privacy *(highest priority)*

Your own `CLAUDE.md` ethics are explicit: qualitative quotes should be "individually curated by Tone, reviewed for identifying details… Never dynamically pulled from the CSV," and each quote should carry "only the question it was answering and the pathway — nothing more."

Several exhibits now do the opposite. The Pleasure Gap "Voices from the Gap," Narrative Mirrors, the Religious "In Their Own Words" blocks, Observer Lens, Restoration, and Adult Experience all fetch **raw open-text responses live** from `/narratives` and render them verbatim — and the attribution helper (`formatAttribution`) appends **generation + US state/Canadian province + country**. Direct identifiers (name, email) are stripped from the dataset, so the concern isn't a contact-info leak — it's that a verbatim free-text answer about an intimate topic, tagged "Gen Z · Wyoming, USA," from a sub-cohort of a few dozen people, becomes a re-identification vector in the tail cases, and none of it has passed the human-curation step your `CLAUDE.md` and on-page disclaimer promise readers. (That curation rule is self-imposed — if you've decided to allow live narratives, updating the rule is a legitimate alternative to changing the code; the point is that doc and product should agree.)

This is the one issue that could plausibly harm a respondent — low-probability but high-consequence — and it's cheap to mitigate, so it's first. Options, roughly in order of preference:

1. **Curated quote pool.** Move to a reviewed, hand-approved quote set (a `quotes.json` Tone signs off on), exactly as the ethics doc specifies. The live `/narratives` endpoint becomes an internal curation tool, not a public surface.
2. **If quotes stay live (decided approach):** attribute by **pathway + generation only** — drop all geographic detail (state/province/country). Then enforce a minimum cohort size before any verbatim text renders (reuse the `SmallSampleBadge` n≥20 gate), and run a server-side scrub for names/places/handles.
3. **At minimum, immediately:** suppress verbatim narratives wherever the filtered/sub-role n is below the suppression threshold (Observer healthcare n=2 is the urgent case).

Word clouds (aggregate term frequencies) are fine and don't carry this risk — it's the verbatim text + location pairing that does.

---

## 4. One Ethics Guardrail, Applied Everywhere

You built the right tool — `SmallSampleBadge` (suppress n<5, warn n<20) — and it's excellent. But it's only wired into 4 surfaces (Religious Mirrors, Culture & Generations, Question Detail, and the orphaned Culture & Attitudes page). The exhibits that need it most don't use it: Observer Lens (sub-roles down to n=1–2), Restoration and Adult Experience (small cohorts sliced by before/after), the Forward View Sankey under a cohort filter, and any deep demographic filter on Pleasure Gap / By the Numbers.

Right now a visitor can filter to "Jewish × Gen Z × Restoring" and get a confident-looking chart on n=3 with no caveat. Make the guardrail a property of the shared chart/data loader (see §7) so *every* chart inherits suppression and warning automatically. This is both an ethics requirement and, frankly, a credibility shield against the skeptics the project explicitly wants to win over.

---

## 5. One Color System & One Numbering System

The theming engine is the project's crown jewel, which makes the inconsistencies more jarring. Two single-source-of-truth fixes:

**Pathway colors have drifted across exhibits.** The canonical evergreen set lives in tokens (`--path-intact` #34d399 green, `--path-circumcised` #ef4444 red, `--path-restoring` #fcd34d yellow, `--path-observer` #f97316 orange). The best pages (Demographics, Narrative Mirrors, Pleasure Gap) use them. But others hardcode their own: the Forward View paints circumcised **blue** and restoring **purple**; Restoration uses **purple** for restoring; Methodology uses **green** for circumcised and **blue** for intact. So "circumcised" is red on one screen and blue on another, and the green that means "intact" elsewhere means "circumcised" on the methodology card. Route every pathway color through the tokens and delete the per-page hex maps (keep custom maps only for genuinely local scales like RCI or the rating spectrum). Bonus: this is also where the long-standing emoji-vs-color mismatch (🔵 for the red circumcised series, 🟣 for the yellow restoring series) could finally be reconciled.

**Exhibit numbers contradict themselves.** There are three sources of truth — `ROUTE_META.kicker`, `EXHIBIT_ROUTES.num`, and each page's hardcoded `exhibitNumber` on `ExhibitHero` — and they disagree. "Exhibit 11" is currently used by Adult Experience, the Forward View's hero, *and* By the Numbers' metadata. Narrative Mirrors renders "Exhibit 03" but the catalog calls it 06. Methodology shows "01," colliding with the Survey Map. The numbers also skip 12 and 14 and assign 13/15 to hidden stubs. Make `EXHIBIT_ROUTES` the only source: derive the hero number and kicker from it, delete the hardcoded `exhibitNumber` props. While there, unify the name drift (The Voices / Narrative Mirrors / Narratives; Observer Lens / Observer Triad).

---

## 6. Voice & Framing Consistency

Your thesis is the project's spine: *"We are not telling people how to feel. We are creating a platform for them to anonymously share how they actually feel."* Most exhibits honor it. A few have drifted into advocacy voice that, ironically, weakens the data's authority with the skeptical reader. Examples: Restoration's "The data speaks for itself: restoration is achievable to those who are willing to put in the time" and "the tangible, physical rewards of this commitment"; Observer Lens framing observers as those who "witness the… consequences of circumcision." These read as conclusions rather than findings. The fix isn't to neuter the copy — it's to let the numbers carry the verdict and keep the prose descriptive ("109 respondents reported their outcomes; here is the distribution"). Save the editorializing for Substack, per your own rule. A quick consistency pass on hero/section copy across all exhibits would lock this in.

---

## 7. Data Fidelity & Code Hygiene

Mostly small, but they're the kind of thing a journalist or academic will catch:

- **Methodology counts are stale and don't sum.** 210/140/109/37 = 496 under an "n=501" header. Drive the demographic card (and any other hardcoded totals, like the masthead's "501 voices · 355 questions") from the live `/count` and `/questions` endpoints so they can never drift again.
- **KPI label-matching is brittle.** By-the-Numbers metrics key off exact option strings; a future wording tweak silently returns 0%. Add a dev-time assertion or a "label not found" telemetry log.
- **Dead code.** `GenerationalFaultlinesPage.jsx` and `CultureAttitudesPage.jsx` are no longer imported by `ExploreShell` (superseded by Culture & Generations) — remove them. And there are five leftover editor temp files in `pages/` (`*.jsx.tmp.5.*` for Correlation and Demographics) that should be deleted from the repo.
- **`DataLoader` is copy-pasted** into ~5 exhibits (Religious, Restoration, Adult Experience, plus inline variants in Observer and Narrative Mirrors), each with subtle drift (only the Religious copy handles narrative-multi-selects). Extract one shared `<ExhibitDataLoader>` that owns endpoint selection, multi-select flattening, small-sample gating (§4), and color resolution (§5). This single refactor makes §3–§5 enforceable in one place instead of sixteen.

---

## 8. Premium Interaction Polish

The "ultra-premium" finishing touches, once the above is solid:

- **A shared chart shell.** Standardize entrance animation (draw-in), hover/tooltip behavior, the "Add to Report" + "Share" affordances, and a loading skeleton across every chart. Right now polish varies by exhibit (Pleasure Gap's CRT frame vs. plain cards elsewhere). Consistency *is* the luxury signal.
- **Performance.** The big three (Mirror Pairs, Demographics, Correlations) fire many aggregate calls on mount. Add skeleton states, lazy-mount below-the-fold sections, and consider prefetching the next likely exhibit. First paint should feel instant even on the heaviest page.
- **Deep-linking & share.** The hash router already serializes pathway/cohort/filters — make sure every exhibit's interesting state (active metric, selected mirror, chosen cohorts) is in the URL so a shared link reopens the exact view. This is what turns a "money-shot" chart into something a journalist can cite.
- **Accessibility.** Verify the colorblind theme actually remaps the distribution spectrum (not just backgrounds), add `prefers-reduced-motion` handling for the GSAP/scroll animations and the harmonic canvas, and ensure SVG charts have text alternatives. Premium includes "works for everyone."
- **The Docent as connective tissue.** The global Docent is a great asset — let exhibits hand it richer context (they already pass `exhibitContext`) so a visitor on the Pleasure Gap can ask "why is mobile-skin the biggest gap?" and get an answer grounded in *this* exhibit, with links to the Mirror Pair and the underlying question.

---

## 9. Prioritized Roadmap

**Tier 1 — Trust (do before promoting it as finished)**
1. Curate or privacy-harden live narratives; drop location attribution (§3).
2. Apply `SmallSampleBadge` suppression/warning to every chart and quote via the shared loader (§4).
3. Fix Methodology's stale counts; drive headline totals from the API (§7).

**Tier 2 — Cohesion (the ultra-premium leap)**
4. Route all pathway colors through tokens; delete per-page hex maps (§5).
5. Single source of truth for exhibit numbers + names (§5).
6. Voice pass: descriptive, not declarative, across hero/section copy (§6).
7. Extract one shared `ExhibitDataLoader` / chart shell (§7, §8).

**Tier 3 — Polish**
8. Delete dead pages + `.tmp` files (§7).
9. Skeletons, lazy-mount, performance on the big three (§8).
10. Full deep-link state, reduced-motion, colorblind spectrum, SVG a11y (§8).
11. Per-exhibit Docent context + cross-exhibit linking (§8).

---

*Bottom line: the exhibitions have genuinely achieved the cross-examination depth you were aiming for — Mirror Pairs, the Correlations Explorer, and the Sankey-driven journeys are the real thing. The leap to "ultra-premium" is no longer about building; it's about making all of it trustworthy enough to hand to a hostile journalist, and cohesive enough that 16 exhibits read as one authored instrument. Religious Mirrors already shows you exactly what that looks like — the task is to make every other exhibit meet the standard it set.*
