# Phase 1 Launch-Readiness Review — findings.circumsurvey.online

**Prepared for:** Tone Pettit
**Scope:** Pre-launch review of the CircumSurvey Phase 1 results site, covering (1) researcher peer review, (2) content flow & dissemination, (3) functionality, security & data-integrity.
**Date:** 2026-08-03
**Reviewed at commit:** `2329c1c`

---

## TL;DR — Verdict: **Do not launch yet. Major revisions required.**

The site is genuinely strong data journalism. The narrative structure (hook → blinded-data reveal → human voices → culture → observers → restoration → next generation) is award-caliber, the restraint furniture (self-selection caveats, small-sample stamps, satisfied-respondent acknowledgement) is real and not decorative, and the "Inquiry Frame" voice is intact throughout most of the tour.

But there are **four launch blockers that would each, on their own, be weaponized by a hostile reader** — and this topic guarantees hostile readers. All are fixable, most in days:

1. **The raw individual-level dataset is publicly exposed** — both in the GitHub repo (committed) and live through the API. This violates the project's #1 security rule and the respondents' promise of anonymity.
2. **The numbers don't agree with themselves.** The flagship "Pleasure Gap" is published as two different sets of means on the same site; the inferential statistics don't match either; and three demographic dimensions appear to be hand-fabricated placeholder data shipped as real results.
3. **The production build is broken** at HEAD and the apex domain (`circumsurvey.online`) is down.
4. **The AI docent is instructed to refuse legitimate methodological criticism** — the opposite of the site's stated ethics, and a screenshot waiting to happen.

The single most damaging scenario is not a critic disproving a finding — it's a critic proving the site is *internally inconsistent or serving fabricated numbers*. That taints every real, defensible finding at once. Fixing consistency and integrity is therefore higher-leverage than any new feature.

---

## PART 1 — Researcher Peer Review

**Reviewer posture:** survey methodology + applied statistics. **Verdict: major revisions.**

The limitations *language* is often better than published convenience-sample research: the self-selection caveat appears in at least five places, the resentment/regret distinction is well-reasoned, and the FAQ's "Is this survey biased?" answer is disarmingly honest. The problem is not the framing — it's that the underlying numbers are not reconciled.

### 1.1 — Launch blockers

**PR-1. Contradictory flagship "Pleasure Gap" means (VERIFIED).**
The most-cited number on the site disagrees with itself:
- Guided Tour dumbbell chart (`src/components/GuidedTour/tourData.js:137`): mobile skin **intact 4.47 vs circumcised 1.96**.
- Explore data layer (`src/data.js:221-222`) and the Landing scrollytelling: mobile skin **intact 3.88 vs circumcised 2.49** ("a 36% gap, the widest measured").
- Stats file (`src/components/GuidedTour/tourStats.json`): 3.889 / 2.506, agreeing with `data.js`, **not** the tour chart drawn on the same page.

A journalist who screenshots the tour (4.47 vs 1.96) then opens Explore (3.88 vs 2.49) catches the site contradicting itself by half a scale point on its headline finding. **One dataset must be declared canonical and the other purged.**

**PR-2. Broken inferential statistics.**
- The `ResearcherFootnote` (`src/components/GuidedTour/GuidedTour.jsx:589-594`) claims "all six metrics p < .001" and "mobile skin t(243.8) = 15.68, p = 7.73e-39, d = 1.78." The repo's own stats file gives ease **p = 0.0013** (i.e. < .01, not < .001) and mobile skin **t = 11.211, p = 5.05e-20**. The df of 243.8 is impossible given the file's per-metric n's (36 + 83).
- The `meta` block of `tourStats.json` reports **816 total responses** with 338 unclassified — so the t-tests were computed on a *different, larger, later* dataset than the N=500 frozen means displayed beside them.
- The scripts the code headers cite as provenance — `scripts/freeze_phase1.js` and `scripts/compute_stats.py` — **do not exist in the repo.** Reproducibility claims are currently unbacked.
- The Methodology page says "Descriptive, not inferential statistics," while the tour runs Welch's t-tests and stars p-values. Pick one; if you keep inferential stats, state that p-values on a non-probability sample describe within-sample separation only.

**PR-3. Apparently fabricated demographic dimensions (VERIFIED).**
`src/demographics.js` is machine-generated with a "DO NOT EDIT MANUALLY" contract and coherent cross-tabs summing to 459. But lines ~1040-1194 **hand-append three dimensions after** the auto-generated block — "Mother's profession," "Father's profession," "Sexual Orientation." The two profession dimensions:
- sum to exactly **500** (the file's own `totalRespondents` is **459**);
- have every cell as a round multiple of 5;
- fail their own arithmetic — Mother's "Other" row claims total 60 but its pathway cells sum to **24**; Father's "Other" claims 110 but sums to **74**.

These are served through the Demographics Dashboard as survey results. **This is the single most urgent integrity item. Remove or regenerate before launch** — if a critic finds one fabricated table, they will argue every table is fabricated.

**PR-4. The 86%/79% resentment figure is misattributed.**
The tour's own frozen mirror data (`tourData.js:154-160`) shows circumcised-pathway resentment = **79%** (21% "no, never"). But the callout directly beneath says "86% vs 38%" and `LandingPage.jsx:861` attaches "86%" to "circumcised respondents." 86% is the *combined* infant-circumcised (circ + restoring, n=319) figure. Folding in restoring respondents (0% "never") inflates the circumcised-labeled number — critics will correctly call this cohort-shopping. Use **79% for "circumcised pathway," 86% for "infant-circumcised (n=319)"** and label which one every time. Same object even briefs the AI docent inconsistently: `tourData.js:40` says "79%," `tourData.js:41` says "86%."

**PR-5. Causal claims from cross-sectional, self-selected, self-reported data.**
The prologue pledges "summarized and never argued." The epilogue then argues causation:
- `GuidedTour.jsx:1133`: circumcision "**results in** measurable drops in sexual pleasure."
- `GuidedTour.jsx:612`: lubrication need "is a **consequence of** altered anatomy."
- `AboutPage.jsx:77-88`: "this dataset **rigorously tests**" a causal hypothesis.

A between-person, cross-sectional, self-selected design cannot establish causation. Replace "results in / consequence of / rigorously tests" with "respondents report / is associated in this sample with / examines." The findings stay striking in that phrasing — they don't need the causal upgrade.

**PR-6. The AI docent is instructed to refuse methodological criticism (VERIFIED).**
`worker/src/index.js:1123`: *"DO NOT suggest the survey is flawed for doing so."*
`worker/src/index.js:1337`: *"DEFEND the methodology—do not validate complaints that the survey is 'biased'."*
This directly contradicts CLAUDE.md's agent spec ("always caveats self-reported data, sample size, self-selection bias") and the site's public posture ("radical transparency"). A visitor asking a fair question ("isn't this just intactivist forums answering?") gets rehearsed deflection from a bot on a site whose own Methodology page agrees with them. Instruct the docent to **concede and quantify the limitation first, then explain what the data still supports.** Concession-first is the only posture that survives an adversarial screenshot.

### 1.2 — Secondary issues (verify against the freeze)

- **"96% across every pathway" is wrong (VERIFIED).** `data.js:457-473`: intact 96.4, circumcised **81.3**, restoring 100, observer 97.0 (weighted ≈ 90.8%). Fix `GuidedTour.jsx:418` and the epilogue tile `:1114`. The hero-fact rotation already words it correctly ("Every pathway lands between 81% and 100%").
- **A "mirror" chart compares two different questions.** `GuidedTour.jsx:728-751` shows two panels both titled "What was the norm in your community?", but the circumcised panel (47.6/18.9/7.6/2.7) is actually the *"how was it handled at birth"* distribution with relabeled options. The circumcised community-norm question's real values are 22.9/47.3/14.4/6.0/9.5. Same conflation in `ScrollyEngine.jsx:108`. The two bars are not comparable.
- **Total-N chaos:** 459, 496, 500, 501, 507, 816 appear across surfaces. Some is legitimate (frozen vs. live vs. observer-excluded). Add one sentence per surface: *"The Special Report is frozen at the 500-respondent milestone; the Explore tool updates live; demographic cross-tabs exclude observers (n=459)."*
- **The 2.7% framing over-reaches.** "This exhibit exists for the other 97.3%" (`GuidedTour.jsx:1068`) counts the 23.2% who answered "No idea" as "not offered a neutral choice." Say: "Only 2.7% report a neutral pros-and-cons choice; 47.6% describe it as routine/automatic; 23.2% don't know."
- **Small-n rule enforced inconsistently.** The `SmallSampleBadge` guardrail is good and wired into 6 pages, but imported-and-unused in `ObserverLensPage`, `AdultExperiencePage`, `ByTheNumbersPage`, `RestorationJourneyPage`; an n=3 "Medical Professional" tile renders in `ObserverLens.jsx:24-48` (below the n=5 floor); observer roles sum to 23 in `data_exhibits.js:180` vs the claimed 37.
- **The N=18 adult-testimony card** (`GuidedTour.jsx:1010-1040`) shows one-decimal percentages with three different implied denominators (72.2%→18, 62.2%→37, 54.5%→22). On n=18, report counts ("13 of 18"), not decimals.
- **Methodology page details:** it never names the actual recruitment channels (the About page does — Reddit r/FriendsOfTheFrenulum + intactivist communities); cites a "Johns Hopkins Medical Journal" that doesn't exist under that title; and its Section 2 slips into advocacy register on the one page that must read neutral. Move the (commendable) IRB disclosure here from the FAQ.
- **Add the uncertainty you already computed.** `tourStats.json` has 95% CIs — draw them as whiskers on the dumbbell/bar money-shots. A 2.5-point gap with visible CIs is *more* credible, not less.

---

## PART 2 — Content Flow & Dissemination

**What works (keep it):** The front door is a narrative tour, not a dashboard. The "blinding-first" device — explaining the six metrics *before* revealing pathway assignment, then performing "The Separation" — pre-empts the biased-sample objection at the exact moment a reader would raise it; this is a first-rate move. The Report→Explorer layering (skim / read / interrogate) gives three reading depths. Stable per-question URLs, PNG export, and a build-your-own-report flow all exist.

### 2.1 — Top 5 highest-leverage improvements

**CF-1. Fix the "cohort" vocabulary — 415 occurrences across 46 files, many user-visible.** CLAUDE.md's first language rule is "pathways, not cohorts," and the site violates it in the tour's own narrative voice and Explore's UI chrome. Journalists quote the site's own labels. Examples: `tourData.js:37` "cohort question contrasts"; `GuidedTour.jsx:655` "the intact cohort scores higher"; `MethodologyPage.jsx:73-81` pathway definitions headed "Circumcised Cohort"; `QuestionPage.jsx:573` "Cohort B Filter." A user-facing-strings sweep is ~a day with outsized payoff. Internal variable names can stay.

**CF-2. The ending breaks the site's own contract.** The prologue promises data "never argued." The epilogue then argues ("it is hard not to walk away as an accidental intactivist yourself," `GuidedTour.jsx:1142`) and hits the reader with a **"$5,000 Match Campaign · Donate Now & Match My Gift"** box and a "Exposing the Monster We Agree Not to See" manifesto link (`ResourcesCTA.jsx:26-51`). A skeptic won over by 14 chapters of restraint hits a fundraising appeal and retroactively re-frames everything above it as advocacy. **Move the donation match and manifesto link off the findings flow** (or behind a clearly separated "From the author" page); keep the survey CTA and community resources. Label the epilogue essay as signed editorial, like the prologue letter.

**CF-3. Shareability bugs on the exact surfaces meant to be shared (VERIFIED).**
- `DistributionChart.jsx:191` and `NarrativeList.jsx:177` build share URLs as `…#/question/<id>`. The router rewrites that to `/explore/question/<id>`, but `parseLocation` only recognizes the segment `q` (`router.js:33`) — so **every link copied from these components 404s.** These components appear on 8+ pages.
- `NarrativeList.jsx:177` passes `onExportImage={() => {}}` — the "Save as Image" button silently does nothing.
- Exported PNGs don't bake in the `circumsurvey.online` URL or attribution (CLAUDE.md requires this for money-shots) — screenshots circulate uncredited.
- The Special Report itself, the most shareable artifact, has no share affordance anywhere in the tour (SharePopover exists only in Explore). Add per-station share buttons for at least Pleasure Gap, Mirror Pairs, and Convergence.

**CF-4. Delete or gate the dead/competing entry surfaces.**
- `/landing` still serves the entire 4,985-line legacy `LandingPage.jsx` — a complete parallel site with its own nav, hero facts, and *older, conflicting numbers*. Nothing links to it, but it's indexable. Redirect to `/`.
- The Scrollytelling suite (~6,400 lines) is dead code (only `SquishHeader` is imported) and carries stale, voice-noncompliant narrative that could resurface.
- `GetInvolvedPage`/`ResourcesPage` (which hold the primary survey CTA) exist but `router.js` never parses their route segments — they fall through to not-found. Wire them in or remove.

**CF-5. Surface the strongest finding sooner.** The pleasure gap arrives ~4,000 words in. The "Global Reach" station (interactive globe + two paragraphs) is the least essential content and sits between the hook and the payoff — demote it into a one-line census card + link. Consider putting the pleasure-gap headline (4.47 vs 1.96) in the masthead; the unused `HERO_FACTS` rotating-stat data (`tourData.js:439`) was clearly built for exactly this and is currently dead code.

### 2.2 — Voice/language violations (CLAUDE.md rules)

- **"Men" instead of "respondents"** in site voice: `SnapshotWall.jsx:46-182` (seven stat-wall labels, "of circumcised men report…"); `CulturalAlignmentSection.jsx:54-121`; `GuidedTour.jsx:645,1056`; `MethodologyPage.jsx:122`.
- **"Regret" applied to circumcised respondents:** `SnapshotWall.jsx:46,182` renders "Q: Feelings of Regret/Resentment" and "never feel regret or resentment"; `tourData.js:216` concept button "Triggers for Regret."
- **"MGM"/"mutilation":** all live occurrences are inside verbatim respondent quotes (`voices.js`, `formatters.js:436,479`) — permitted by the rule, but since quotes are individually curated, Tone should consciously review which MGM-containing quotes sit in default/rotating positions.
- **Advocacy tone:** `ResourcesCTA.jsx:14` "…find new ways to explore the data! Get involved" (exclamation-point recruitment on the findings site) and the "Exposing the Monster" link ("EXPOSED!" register the design anti-patterns ban).

### 2.3 — Cognitive load & mobile risk

- Explore has 14 exhibits + ~13 more routes + ~40 chart types. The tour mitigates this, but add a "Start with these 3" band to the Explore index (Pleasure Gap, Mirror Pairs, Forward View) and demote power tools (Correlations, Report Builder).
- Three near-duplicate mirror surfaces (Mirror Pairs / Narrative Mirrors / Religious Mirrors) compete with no explanation of the distinction.
- **Mobile:** `SquishHeader` pins an 85vh header with a one-time height measurement — the classic iOS Safari tearing recipe as the URL bar collapses; test on real iOS and consider `svh` units + ScrollTrigger refresh on resize. Sankeys with negative margins (`GuidedTour.jsx:768`) are the likeliest horizontal-overflow culprits — verify each sits in an `overflow-x` container. `WireframeGlobe` fetches topojson from unpkg/jsdelivr at runtime on the front door — if the CDN hiccups, Chapter 1's centerpiece silently fails.

---

## PART 3 — Functionality, Security & Data Integrity

### 3.1 — CRITICAL: raw individual-level respondent data is exposed

This is the gravest category. Respondents were promised anonymity; the current build breaks that promise two ways.

**SEC-1. Raw data committed to the public GitHub repo (VERIFIED).** The repo is public. Tracked since June 9:
- `local_db.sqlite` (10.5 MB) — **501 respondents, 52,784 individual answers**, including 7,304 free-text responses up to 9,619 characters, joined to full demographics (state, race, sexuality, politics, parents' professions).
- `Circumsurvey - Resonses.pdf` (8.7 MB).
- `output*.json`, `scratch/*_raw.*` — aggregated and raw extracts.

This violates security rule #1 ("The raw CSV never leaves your local machine"). **Deleting the files in a new commit is not enough — the data stays in git history.** Required: purge from history (`git filter-repo` / BFG), force-push, rotate anything derived, and add `*.sqlite` + `*.pdf` + `output*.json` to `.gitignore` (only `data/raw/` and `*.csv` are currently covered). Consider whether the repo should be private until this is done.

**SEC-2. The live API serves re-identifiable microdata (VERIFIED).** `GET /api/narratives?q=<open_text_q>` (`worker/src/index.js:606-654`) returns, per respondent, the **raw free-text answer plus** `pathway, generation, age_bracket, country_born, us_state_born, …` — with **no minimum-n, no auth**, and it accepts arbitrary `&filter=` params that narrow to individuals. Free text + sub-national geography + generation is textbook re-identifiable data. The scrollytelling engine already renders these as "verbatim narratives… unedited" (`ScrollyEngine.jsx:527`, tour teaser `tourData.js:101`) — so the site itself publishes uncurated responses, contradicting the rule that every quote is personally reviewed by Tone. `/api/aggregate?by_question=<open_text>` and `/api/sankey-path` leak the same way; the documented "min n=5 / n=20" rule **is implemented nowhere in the worker.**
- **Fix:** serve only Tone-curated hardcoded quotes (the stated model), or — if dynamic — strip all demographics except coarse pathway, reject `filter` params, remove sub-national geography, and enforce a central min-cell-size suppressor (n<20 for cross-tabs) applied uniformly, including in the copilot tool executors.

**SEC-3. The AI copilot retrieves uncurated raw responses.** `handleEmbedBatch` (`:839-888`) embeds **every** open-text response (up to 5,000 chars of raw answer + pathway + generation) into Vectorize; the copilot returns them in `quotes[]` (`:1281`). The retrieval layer contains raw survey responses, not curated content. **Populate Vectorize only with approved quote strings.**

### 3.2 — HIGH

**SEC-4. Unauthenticated Vectorize write → copilot poisoning.** `POST /api/ai/embed_static` and `GET /api/ai/embed_batch` have **no auth** (just path routing, verified) — anyone can upsert arbitrary vectors/prompt-injection text that the docent then surfaces to all visitors as genuine survey data, and can run unbounded (billable) embedding jobs. **Remove these routes from the public worker** (run embedding as an offline job) or require a bearer secret.

**SEC-5. Stored XSS via unsanitized respondent text.** `Tooltip.jsx:47` renders string content with `dangerouslySetInnerHTML` (verified). Chart tooltips build that string from respondent `value_text` (Sankey/distribution nodes). A respondent who submits an answer containing `<img src=x onerror=…>` gets it persisted and executed in every viewer's browser who hovers the node. **Fix:** render `content` as a plain React child (`{content}`), never `dangerouslySetInnerHTML`.

**SEC-6. Build is broken at HEAD (VERIFIED).** The latest commit's `ThemeContext.jsx:2` imports `../lib/telemetry`, which does not exist in the repo (likely untracked on the dev machine). `npm run build` fails; 5 of 10 test files can't load for the same reason (the 227 tests that do load pass). **The site cannot be built from a clean checkout.** Commit the missing `telemetry` module or remove the import.

**SEC-7. Apex domain down (VERIFIED).** `https://circumsurvey.online` returns **HTTP 525** (Cloudflare SSL handshake failure); `www.` works. The site's own "share this link" CTA points to the broken apex (`GetInvolvedPage.jsx:115`). Fix the SSL/origin config or repoint the shared URL to `www`.

### 3.3 — MEDIUM / LOW

- **SEC-8.** Rate limiter is fail-open: only throttles if `env.AI_RATE_LIMITER` exists (`:290`), and the repo ships **two conflicting wrangler configs** (`wrangler.toml` defines the binding; `wrangler.jsonc` says it's dashboard-configured). Delete one; make the AI handler fail-closed if the binding is missing. Only `/ai/query` is limited — the embed and D1 endpoints have none.
- **SEC-9.** CORS `Access-Control-Allow-Origin: *` on all data endpoints (`:20`) — restrict to the site origin to stop cross-site scraping/differencing.
- **SEC-10.** `metadata.sql` (internal table/column names) is echoed to the browser (`:1050`, shown in `CopilotChat.jsx:621`) — aids enumeration; ship a human-readable description instead.
- **SEC-11.** Verbose error disclosure (`errorJson(\`Internal error: ${err.message}\`)`, `:344`) and full raw visitor queries logged to `ai_queries` (`:956`) — sensitive on this topic; confirm retention/anonymization.
- **SEC-12.** 6 npm vulnerabilities (4 high — react-router DoS/open-redirect/XSS advisories); `npm audit fix` resolves them without breaking changes.
- **Good, for the record:** no hardcoded secrets in `worker/src` or `src` (Gemini key correctly `env`-only); all D1 queries use `.bind()` parameters — **no SQL injection found**; dynamic column fragments are allowlist-validated; `react-markdown` renders AI output without `rehype-raw` (no XSS via copilot answers); the copilot uses untrusted-data fencing and a tool allowlist. `_headers` sets `X-Frame-Options: DENY` + `nosniff`.
- **Repo hygiene:** `node_modules/` (2,550 files) and `dist/` are committed; ~150 `vite.config.js.timestamp-*.mjs` files, `desktop.ini`, and scratch debris are tracked. Because `node_modules` was committed from Windows, a fresh clone can't build. Clean these out and rely on `npm install`.
- **External links:** all partner links, the survey form, Drive files, and CDN geo sources return 200. (Medium manifesto returns 403 to bots but works in browsers; Formspree returns 405 to GET, correct for a POST endpoint.) The only real link problem is the apex-domain 525 above and the internal share-link 404s (CF-3).

---

## Recommended pre-launch sequence

**Blockers (must fix before any launch):**
1. Purge raw data from git history + fix the live API microdata leak (SEC-1, SEC-2, SEC-3).
2. Remove/regenerate the fabricated demographic dimensions (PR-3).
3. Reconcile to one canonical frozen dataset; rebuild every number from it; commit the freeze/stats scripts (PR-1, PR-2).
4. Restore the build and the apex domain (SEC-6, SEC-7).
5. Rewrite the docent to concede limitations (PR-6); remove the XSS sink and the unauth embed endpoints (SEC-4, SEC-5).

**High-value, do-before-launch-if-possible:**
6. De-causalize the epilogue and move the donation/manifesto out of the findings flow (PR-5, CF-2).
7. Fix the resentment/96% mislabels and the community-norm mirror chart (PR-4, §1.2).
8. Fix the internal share-link 404s and bake attribution into PNG exports (CF-3).

**Polish (fast-follow acceptable):**
9. The "cohort/men/regret" vocabulary sweep (CF-1, §2.2).
10. Delete dead entry surfaces; enforce small-n badges everywhere; add CIs to money-shots (CF-4, §1.2).

The thesis — *"we are not telling people how to feel; we are creating a platform for them to share how they actually feel"* — is a genuinely strong methodological position. These revisions are what make it load-bearing rather than decorative. The site is close. It should launch when its numbers can survive a hostile reader opening two tabs.
