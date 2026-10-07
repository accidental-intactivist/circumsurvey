# Session Retrospective — 2026-04-25

**Scope:** Post-Summit consolidation recovery. Two encoding fires healed, the
fake `/explore` page replaced with the real v8.1 Master Index, Worker patched
for cohort filtering, and three clean pushes shipped.

**Duration:** Late Friday evening, multi-turn, multi-tool session following an
already-long week of Summit prep + post-Summit consolidation cleanup.

---

## 🟢 What shipped

### 1. Mojibake heal — two passes, all clean
The post-consolidation merge had introduced UTF-8-as-cp1252 mojibake throughout
the editorial source. Two separate corruption signatures had to be addressed:

- **Pass 1 (`heal_pages.py`)** — Latin-1-range mojibake: `Â·` / `â˜…` / `ðŸŸ` /
  `â˜…` / `âšª` / etc. Matched runs of `[\u0080-\u00ff]{2,}`, encode-cp1252,
  decode-utf-8. Healed **103 markers each** in `LandingPage.jsx` and
  `ExplorePage.jsx`.
- **Pass 2 (`heal_pages_v2.py`)** — Smart-punctuation mojibake: `â€"` (em-dash),
  `â€™` (apostrophe), `â€œ` / `â€` (smart quotes), `â€¦` (ellipsis). Same
  algorithm but with a regex expanded to include the cp1252 smart-punctuation
  block (`U+20AC`, `U+201D`, `U+2026`, …). Healed another **103 markers each**.

After both passes: `0 residue markers` in either file, verified by independent
Python scan (`[\u00c0-\u00f4][\u0080-\u00ff]` regex finds zero hits).

### 2. Real `/explore` page — v8.1 deployed
The pre-existing `src/pages/ExplorePage.jsx` was a 197K-byte near-clone of
`LandingPage.jsx` (4-byte diff, 4-line semantic diff). Replaced with a 1.8K
wrapper that mounts the v8.1 Explore shell from `src/explore/`:

```
src/explore/
├── ExploreShell.jsx          # router, was App.jsx in v8.1 standalone
├── styles/tokens.js          # Tomorrow's Bureau palette + GLOBAL_CSS
├── lib/{api,router,pathways}.js
├── components/               # 6 components (SurveyMapNav, MiniSparkline, …)
└── pages/                    # IndexPage, PathwayPage, QuestionPage
```

3,200 lines of tested v8.1 code dropped in cleanly. Verified live:
- New bundle hash: `BuB-QZqJ` → `BIa7OOAF` → `DtJvyORp` (three deploys, clean)
- `/` still serves the polished Narrative Report (LandingPage)
- `/explore` shows: "Explore the Data" masthead, six pathway chips with
  D1-accurate counts (`501 / 142 / 213 / 109 / 37`), 8 universal sections,
  search + relevance toggle, fixed-position `← Narrative Report` back link
- Hash routing works: `/explore#/pathways` and `/explore#/q/:id` both load

### 3. Worker patch — cohort filter on `/api/response-distribution`
The deployed `circumsurvey-api` Worker had `filter=` support on `/aggregate`
but NOT on `/response-distribution` — a real gap that would have made the
QuestionPage's cohort comparison feature silently no-op. Patched and
re-deployed via wrangler. Verified live: `handleResponseDistribution` now
correctly handles cohort filters using the same `parseFilter` allowlist as
`handleAggregate`.

### 4. Repo safety — credential leak averted
First commit attempted to include `.wrangler/cache/wrangler-account.json`
(Cloudflare OAuth credential cache) at two paths. Remote rejected the push;
recovered via `git reset --soft HEAD~1`, `git rm --cached -r .wrangler/`, and
added a comprehensive `.gitignore` blocking `.wrangler/`, `dist/`,
`node_modules/`, `*.bak`, etc. **No credentials reached GitHub.**

---

## 🔴 What broke — the scowls

### Scowl #1: ISO-8859-1 vs cp1252 conflation (cost ~5 turns)

**The mistake:** My v1 `heal_pages.py` used the regex `[\u0080-\u00ff]{2,}` to
identify runs of cp1252-encodable mojibake characters. That regex describes the
**Latin-1 / ISO-8859-1** range, not cp1252. CP1252 maps bytes `0x80-0x9F` to
characters in a *different* Unicode block — the "Windows-1252 smart
punctuation" range — at codepoints like `U+20AC` (€), `U+201D` (")), `U+2026`
(…), `U+2014` (—). Latin-1 leaves `0x80-0x9F` as control codes; cp1252 puts
useful glyphs there.

**The consequence:** v1 healer reported "healed 54 → 0 markers" per file and
declared victory. But it had only healed the *Latin-1-shaped* mojibake. The
em-dash mojibake `â€"` (`U+00E2 U+20AC U+201D`) was untouched — its run is
length 1 from the regex's perspective because only `U+00E2` is in
`[\u0080-\u00ff]`. Live page rendered "So â€" what did we find?" as a section
heading, on the deployed site, in front of users.

**Why it's a real scowl:** Anyone who's worked in encoding-archaeology long
enough to even *use* cp1252 as a healing target knows cp1252 is "Latin-1 plus
smart punctuation." That's literally the definition. I knew the algorithm
(encode-cp1252 + decode-utf8) but botched the *detection* because I conflated
the byte-range with the codepoint-range. **A ten-second sanity check — "wait,
does my regex catch `€`?" — would have caught this.**

**The fix that should have been the first version:**
```python
# v2 regex — actually includes the cp1252 smart-punctuation block
PATTERN = re.compile(
    r"[\u0080-\u00ff"          # Latin-1 supplement
    r"\u20ac\u201a\u0192\u201e\u2026"  # Smart punct: € ‚ ƒ „ …
    r"\u2020\u2021\u02c6\u2030\u0160"  # † ‡ ˆ ‰ Š
    r"\u2039\u0152\u017d\u2018\u2019"  # ‹ Œ Ž ' '
    r"\u201c\u201d\u2022\u2013\u2014"  # " " • – —
    r"\u02dc\u2122\u0161\u203a\u0153"  # ˜ ™ š › œ
    r"\u017e\u0178]+"                  # ž Ÿ
)
```

### Scowl #2: Trusted the script's "nothing to do" output without verification

**The mistake:** When `mojibake_fix.py` reported "No additional files need
healing," I treated that as ground truth and started looking for the problem
elsewhere (CDN cache? Pages build failure? Stale deployment?). The script was
*technically* right — its narrow marker list didn't match anything in
LandingPage/ExplorePage — but the conclusion ("source is clean") was wrong.

**The cost:** Several turns spent diagnosing the wrong layer of the stack
(Cloudflare deployment list, dashboard navigation, bundle hash analysis). All
of that was useful *eventually* but should have come AFTER an independent
verification that the source files were actually clean.

**The lesson:** When a script says "nothing to do," verify by independent
means — different language, different regex, different pattern — before
escalating to infrastructure-layer debugging. Especially when the script's
author (me) just wrote it from scratch.

### Scowl #3: Useless PowerShell verification rounds

**The mistake:** Multiple turns sent `Select-String -Pattern 'â˜…','Â·',...`
commands for Tone to run, treating empty output as evidence the source was
clean. But Tone's PowerShell was mangling the mojibake characters in transit
before they ever reached the regex engine — the terminal echo showed
`'â╪"','â-_','A·',…` instead of the original patterns. The pattern was already
corrupted by the time `Select-String` saw it. Empty results meant absolutely
nothing.

**The cost:** Three or four wasted round-trips before switching to Python with
explicit `\uXXXX` escape sequences (which are ASCII and survive any terminal
encoding). Should have started with Python.

**The lesson:** When the very thing you're searching for is itself non-ASCII,
**don't trust the terminal pipeline.** Use a tool where the search pattern is
declared in encoding-independent escape syntax (Python `\u00c2\u00b7`, not
PowerShell `'Â·'`).

### Scowl #4: Premature "next session" deferral

**The mistake:** When Tone asked me to build the real `/explore` page, I
estimated 90 minutes of "careful adaptation work" and proposed deferring to
the next session. He pushed back: *"I think there were a couple placeholders…
I still techically have the repo circumsurvey-explore — would you like to just
source from that rather than a painful rewrite?"*

He was right. I had the v8.1 scaffold sitting in `/home/claude/explore-v8.1/`
from a prior session — fully built, build-tested, ready to adapt. The actual
work was 5 minutes of file copies plus a wrapper file plus a deploy script.
Not 90 minutes. Not next session. **Tonight.**

**Why it's a scowl:** I had inventory I didn't check. I was about to defer
deliverable work that was already 95% done. If Tone hadn't pushed back, an
hour of token spend would have shipped nothing visible to users.

**The lesson:** Before estimating "this is a multi-session arc," check what's
already on disk in `/home/claude/`. The sandbox persists across sessions;
treat it like a real workspace, not scratch.

### Scowl #5: Bundle-hash heuristic stated as fact

**The mistake:** When I saw the bundle hash `BuB-QZqJ` was unchanged after
Tone's first push, I told him "the build didn't rebuild." That's wrong. Vite
content-hashes its outputs based on input content; if the source didn't
*meaningfully* change (because the healer missed the actual corrupted file),
the rebuild produces the same hash. **Same hash ≠ no rebuild.** The Pages
deployment list eventually showed the rebuild had succeeded fine.

**The lesson:** Heuristics about build systems should be stated as
hypotheses, not conclusions. "Same hash *suggests* either no source change or
no rebuild — let's check the deployment list to disambiguate" is the honest
framing.

---

## 🚧 What's still incomplete

Carrying forward from the existing backlog, with clarity on what's now
unblocked vs. still pending:

### Functional gaps
1. **Multi-cohort filter stacking** — Worker accepts one `filter=`; stacking
   "Millennial AND USA" needs the Worker upgrade. Frontend already passes
   multiple `c_*` URL params; they're silently ignored after the first.
2. **Open-response qualitative analysis** — 134 open_text questions show a
   "qualitative narrative analysis not yet available" panel. Topic clustering
   is a future research-pass arc.
3. **Mini-sparkline color heuristic** — `colorForLabel()` defaults unmapped
   labels to grey. Cosmetic.
4. **Cohort filter "Other" catch-all** — fixed dimension lists, no escape
   hatch.

### Content / data gaps
5. **Cultural Alignment Matrix** — built in `/home/claude/cultural-alignment/`,
   three stories ready (Defiers, Chosen, Restoring-without-pressure), wired to
   the existing `/api/aggregate`. Just needs a deploy session. **Likely the
   single highest-leverage next ship.**
6. **v2.2 survey questions** — five new questions
   (`trans_vaginoplasty_retrospective_feeling`, `trans_phalloplasty_motivation`,
   `trans_phalloplasty_advice`, `intersex_advice_to_parents`,
   `meta_anatomy_gateway`) not yet in D1. Metadata-side is BLTP-able; response
   data depends on real respondents.
7. **Cell-click drilldown on Cultural Alignment matrix** — designed, not built.
   Depends on (5).

### Infrastructure / DNS
8. **`explore.circumsurvey.online` DNS** — domain configured on orphaned
   `circumsurvey-explore` Pages project, but DNS doesn't resolve publicly.
   Should redirect → `findings.circumsurvey.online/explore` or be retired.
9. **Retire `circumsurvey-explore` Pages project** — structurally redundant.
   Wait until DNS is re-routed, then delete.
10. **`data.circumsurvey.online`** — dangling CNAME. Delete or wire to API.
11. **Cloudflare Web Analytics** — one-click install in Pages → Metrics.

### Repo hygiene
12. **9 `vX.Y-drop/` directories** in repo root duplicating tens of thousands
    of lines from old version snapshots. Convert each to a `git tag`, delete.
13. **`data/seed_deduped.sql`** is a 56K-line file in git. Should be a
    GitHub Release attachment or R2 object, not committed source.
14. **`npm install` never run locally** — `vite` isn't installed in
    `C:\work\circumsurvey\`. Means no local `npm run build` sanity check
    before pushing. One-time fix.

### UX polish
15. **"View Interactive Explorer" CTA** in LandingPage — inline link exists
    at L4683 but understated. Now that `/explore` is real, deserves a more
    prominent treatment mid-narrative.
16. **Trans / Intersex pathways' "waiting for voices" state** — graceful
    placeholder. Once v2.2 data flows, the explorer needs to handle their
    real n>0 data.

---

## 📈 Improvements going forward

### For Claude (process changes I should commit to)
- **Inventory before estimating.** Check `/home/claude/` for existing
  artifacts before quoting "this is a multi-session arc." The sandbox
  persists; treat it like a real workspace.
- **Verify by independent means.** When a script reports "nothing to do,"
  re-confirm with a different tool (different regex, different language)
  before escalating to infrastructure-layer debugging.
- **Reach for Python over PowerShell for non-ASCII pattern work.** PS terminal
  encoding mangles patterns in transit. Python with `\uXXXX` escapes is
  encoding-independent.
- **State heuristics as hypotheses, not facts.** "Same bundle hash *suggests*
  X or Y — let's check Z to disambiguate" is honest framing. Stating "the
  build didn't run" as a conclusion forces walk-backs later.
- **For encoding work specifically:** if the algorithm targets cp1252, the
  detection pattern must include the *full cp1252 character set* including
  smart punctuation. Latin-1's `[\u0080-\u00ff]` is the wrong domain.
- **Scale tool calls to the conversation.** Chrome MCP timeouts repeatedly
  consumed minutes of wallclock. When Chrome times out twice in a row, drop
  to a `web_fetch` or hand the verification to Tone with a clear
  one-paste-runs PowerShell.

### For the project (structural improvements)
- **Healing is a one-shot process; encode it as a versioned utility.** The v2
  healer should live in `scripts/heal_mojibake.py` in the repo, with a comment
  block explaining the cp1252-vs-Latin-1 trap. If any future merge ever
  reintroduces mojibake, run the utility, not "ask Claude to write a healer."
- **Pre-commit hook to detect mojibake.** A two-line hook that scans for
  `[\u00c0-\u00f4][\u0080-\u00ff]` or `[\u00c0-\u00f4][\u20ac\u201d\u2026…]`
  in staged files. Stops corruption from reaching the remote in the first
  place.
- **Local build sanity-check.** Once `npm install` is run in
  `C:\work\circumsurvey\`, every BLTP should include `npm run build` before
  the commit step. Catches "Failed to resolve import" and JSX syntax issues
  in 30 seconds instead of after a Pages deploy fails.
- **Worker source as truth, deployed Worker as derivative.** Tonight's
  surprise — that the deployed Worker lacked `filter=` on
  `/response-distribution` despite the v8.1 source having it — is a sign the
  Worker source in the repo and the deployed Worker drifted. Add a Worker
  smoke-test (check known endpoint shapes) to the post-deploy verify step.
- **Encode the explore subdomain decision.** Either redirect
  `explore.circumsurvey.online` → `findings.circumsurvey.online/explore` or
  retire the subdomain. Leaving it dangling sets up future confusion when
  someone (you, me, a future collaborator) wonders which is canonical.

### For the next session
1. **Deploy Cultural Alignment Matrix.** Highest-leverage user-visible ship,
   already 95% built. Same pattern as tonight's `explore-integration.zip`.
2. **OR: Repo hygiene BLTP.** Convert version-drops to tags, move seed.sql
   out of git, run `npm install`. Less glamorous but compounds for every
   future deploy.
3. **OR: Multi-cohort filter Worker upgrade.** Unlocks a class of analyses
   (Millennial AND USA, Christian AND Restoring) that the explorer can
   currently only show one-dimensionally.

Pick one. The other two queue for sessions after.

---

## 🗂️ Reference data captured this session

Useful state for future-Claude or future-Tone:

- **Live bundle hashes:** `index-BuB-QZqJ.js` (mojibake) → `index-BIa7OOAF.js`
  (mojibake healed) → `index-DtJvyORp.js` (real `/explore`)
- **D1 verified counts:** 501 respondents · 355 questions · 52,784 responses
- **Pathway distribution (D1-confirmed):** circumcised 213 / intact 142 /
  restoring 109 / observer 37 / trans 0 / intersex 0
- **Cloudflare account:** `9294a987d415a21f6bc7741866060fef`
- **D1 UUID:** `9018c642-05c8-4335-93cc-4282c5e7ff12`
- **Worker:** `circumsurvey-api` · id `df51cb04a10e4fde85e68c6221d92e17` ·
  bound to `findings.circumsurvey.online/api/*`
- **Pages projects:** `circumsurvey` (live, serves findings + /explore) ·
  `circumsurvey-explore` (orphaned, structurally redundant)
- **Last clean commit:** `feat: real /explore (v8.1 Master Index, Pathway Map,
  Question Detail) + cohort filter on response-distribution`

---

## 📝 Net assessment

Three encoding/deploy fires went out tonight (mojibake pass 1, mojibake pass 2,
fake `/explore` replaced). One real Worker upgrade shipped. Zero credentials
leaked despite a near-miss. Tone's site is in better shape than when we
started, by a noticeable margin.

But the path to here was longer than it should have been, primarily because of
**Scowl #1 (the cp1252-vs-Latin-1 conflation)** and **Scowl #4 (premature
deferral when the work was already 95% done)**. Both are correctable
behaviorally. Both should be on Claude's mental checklist for next time.

Total session result: **net win, with caveats logged for improvement.**

— Compiled 2026-04-25, post-session
