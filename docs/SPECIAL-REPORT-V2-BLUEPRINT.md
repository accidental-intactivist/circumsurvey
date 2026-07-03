# The Special Report, Reinvented
## "The Inquiry" — Phase 1 Results · Design Blueprint v2.0

**Status:** Proposal for Tone's approval — supersedes the v1 ScrollyEngine build
**Voice:** Full Inquiry Frame. **Canonical N:** 500 (the milestone snapshot).
**Principle:** The reader doesn't get told the findings. The reader *performs the inquiry* and discovers them.

---

## 1. The Concept: The Reader Becomes the Asker

Every great scrollytelling piece has one idea that organizes everything. Ours:

> **You are about to do what almost nobody does: ask 500 people how they actually feel about their circumcision status — and hear them answer.**

The report is structured as the inquiry itself, recreating Tone's journey in the reader:
notice → wonder → ask → listen → understand. The reader arrives with whatever
assumptions they have, makes predictions, and watches the real answers separate
from their guesses. Nothing is asserted that a chart or a testimonial doesn't say
first. The editorial conclusion is the reader's own — that's what makes it stick,
and that's what makes it shareable ("look what I found," not "look what they claim").

This resolves the voice problem permanently: the Inquiry Frame isn't a copyediting
pass, it's the information architecture.

### Why this beats the v1 build

The v1 ScrollyEngine was written before the full cross-pathway question catalog
existed, so it could only narrate a handful of pre-picked charts — which forced the
copy to do the persuading. Now the Worker serves every question across all pathways
(`/questions`, `/aggregate`, `/narratives`), so the *structure* can do the persuading:
baseline-before-status reveals, mirror pairs, and demographic invariance checks are
all directly buildable. The data carries the argument; the copy only asks questions.

---

## 2. The Signature Device: 500 Threads

The single unifying visual metaphor that makes this report unlike anything else:

**Each respondent is one thread. The Harmonic Loom masthead is not decoration — it
IS the dataset.** 500 luminous threads weave the masthead. As the reader scrolls
out of the masthead, the threads flow *down the page with them* and become the data:

- In **Who Answered**, threads bundle into pathway-colored streams (blue Intact / red Circumcised / yellow Restoring / grey Observer, with per-pathway n's stamped from the frozen 500-snapshot — never hand-typed) — a living Sankey.
- At the **Cultural Gateway**, the stream splits the way the survey itself branches.
- In **baseline questions**, threads are indistinguishable — one braided cord.
- At the **status reveal**, the cord *separates* — the emotional core of the piece.
- In chart sections, threads terminate into bars/dots (each bar is literally a bundle of threads; hover a bar, the bundle glints).
- In testimonial moments, a single thread detaches, draws a line-art vignette, and the quote typesets beside it.
- In the finale, all 500 threads reconverge — plus one dim, unlit thread: *yours*. The CTA is "add your thread."

Technically: one persistent full-viewport canvas layer (the Loom engine generalized
from the masthead) sitting under the content, driven by scroll progress + section
state. HarmonicCanvas's math (traveling waves, moiré phase, glints) is the perfected
asset we keep; everything else from v1 is quarry, not foundation.

This device delivers all three of Tone's asks at once: the Harmonic Loom investment
pays off across the whole page, the wireframe/laser line-art style has a *reason* to
exist (threads draw the illustrations), and the reader never loses the thread —
literally — between sections.

---

## 3. The Visual Language: "Laser-Plotted Bureau"

An evolution of Tomorrow's Bureau: the report looks like a set of archival bureau
documents whose diagrams are being plotted live by a laser as you read.

**Line-art rules (the whole style in six constraints):**

1. **Single-weight strokes only.** 1.5–2px, no fills except pathway-color glows at 8–12% opacity. Everything reads as drawn, not rendered.
2. **Everything draws on.** Every SVG illustration animates via `stroke-dashoffset` tied to scroll entry (600–900ms, ease-out, once). Charts *plot* — axes first, then data strokes, then labels stamp in.
3. **Anatomical subjects are abstracted to schematic.** Continuous-line figure drawings (one unbroken stroke — thread-consistent), cross-section-style diagrams like a patent filing or Gray's Anatomy plate, never photographic, never cartoonish. This keeps the piece safe to share on any platform and serious in tone.
4. **Registration marks, plate numbers, and specimen labels** (JetBrains Mono, e.g. `FIG. 04 — LUBRICATION REQUIREMENT, N=486`) give every visualization an archival identity — and double as the share-card captions.
5. **Two paper stocks.** Cream editorial sections = printed bureau memos (paper grain, teal headings). Black data sections = the plotter bed where threads and lasers live. The cream↔black alternation is the page-turn rhythm from the design system, kept.
6. **No emojis anywhere** (active convention). Pathways identified by color, name, and a small line-art glyph set (to be drawn: a minimal mark per pathway, used like a cartographer's legend).

**Illustration inventory to commission from the line-art system** (each is a scroll-triggered draw-on moment): the observer at the fence (Act I), the branching survey map (Act II), the braided cord and its separation (Act III), the mirror (Act IV), the delivery-room conveyor abstraction (Act V — systemic, not blaming any parent), the generational gate (Act VI), the loom rejoined (finale).

---

## 4. The Narrative Arc — Seven Movements

Inquiry Frame throughout: every section *opens with the question the survey asked*,
shows the answers, and lets curated voices react. Copy never concludes; captions never editorialize.

### Movement I — The Question (cold open)
Harmonic Loom masthead. One line, centered, Playfair 800:
*"If someone asked you honestly how you felt about your circumcision status — what would you say?"*
Beat. *"We asked. Five hundred people answered."*
Scroll cue. Threads begin to descend.
Then the condensed origin note — the site-approved framing ("This inquiry began with a simple observation…"), 90 words, signed, with links out to the manifesto and About page for anyone who wants the researcher's full perspective. **The advocacy lives off-page; the report links to it honestly instead of performing it.**

### Movement II — Who Answered (the reader meets the 500)
Threads bundle into the four main streams + trans/intersex threads held visible but
unaggregated (small-n rule). Live-drawn survey map: the Cultural Gateway branch, the
pathway structure — the reader learns *how the instrument works* before seeing results,
which is what makes the results trustworthy. Demographics as plotted small-multiples
(age, geography at country level, religiosity, politics). Methodology and limitations
get a bureau-memo card *here, up front* — self-selection acknowledged in plain language.
Skeptics are met where they are: showing the caveats first is the credibility move.

### Movement III — Before You Knew Who Was Who (the discovery core)
The survey's unique design becomes the report's unique moment. The baseline
experience questions (sensation, orgasm quality, lubrication, body image) were asked
*before* status pathways. So we show them the same way:

1. Reader sees the aggregate distribution — one braided, uncolored cord feeding grey charts. "Five hundred people rated their own sexual experience."
2. **Predict-then-reveal:** "The survey then asked one question: *Are you circumcised?* — What do you expect happened to these numbers?" Reader taps a prediction (splits apart / stays the same / small difference).
3. On scroll: the cord separates. Grey charts split into blue/red/yellow. The gaps draw themselves: mobile-skin pleasure 3.88 vs 2.49, light touch 3.67 vs 2.60, lubrication never-needed 55.5% vs 5.5%.
4. The reader's own prediction is shown against the result. No caption needed.

This is the money sequence — the screenshot, the screen-recording clip, the thing
people describe to each other. Everything in the build plan prioritizes it.

### Movement IV — The Mirrors (same question, both sides of the fence)
Split-screen synced scroll: the mirror-pair instrument. Curiosity asymmetry (67.8%
of circumcised often wonder vs 27.3% of intact), resentment vs regret (86% some
resentment vs 38% ever wished circumcised), each with the language-sensitivity note
("we asked it this way, and here's why") — methodological transparency as a feature.
Voices from *both* panels in every gallery, including satisfied circumcised
respondents, prominently. The mirror illustration draws itself between the panels.

### Movement V — How Did It Happen? (the system, not the parents)
The decision data: 47.6% routine/automatic, 23.2% no idea, 2.7% neutral pros-and-cons —
plotted as a conveyor schematic where the 2.7% sliver is the visual story. Parents'
reasons mirror-paired with intact parents' reasons. Father-status correlation as a
two-generation thread diagram. Copy rule for this movement: every sentence is a
question or a description of what respondents said. The system indicts itself.

### Movement VI — What They'd Do Now (the convergence)
Future-son intentions across all four pathways converging on "keep intact"
(88.8 / 78.1 / 98.1 / 90.9) — threads from every stream bending toward the same gate.
Then the invariance sweep: the "keep intact" majority re-plotted across age, politics,
income, religiosity — a small-multiples grid where the reader can flip dimensions and
fail to find a counterexample. Bodily autonomy consensus (96.4 / 81.3 / 100 / 97.0)
as three large plotted circles. This is where a skeptical reader runs out of outs —
because *they* did the checking.

### Movement VII — Now You Know. Now You're Asked. (the finale)
Threads reconverge into the Loom. The unlit 501st thread appears.
Three doors, bureau-stamped: **Take the survey** (add your thread) · **Explore the
full dataset** (the Explore site — every question, live) · **Read the researcher's
perspective** (Substack/manifesto — clearly labeled as interpretation).
Closing plate: attribution, methodology link, partner organizations, license.

---

## 5. Interaction Catalogue (every animation serves comprehension)

- **Thread flow** — persistent canvas, scroll-driven, the connective tissue. Reduced-motion users get static plotted frames of the same states.
- **Predict-then-reveal** — 3 uses maximum (Movements III, V, VI) so it stays potent. Predictions stored in-memory only; aggregate nothing.
- **Draw-on charts** — axes → strokes → labels; once, on entry.
- **Mirror sync-scroll** — both panels advance together; mobile stacks with a "flip" affordance.
- **Bundle hover** — hovering any bar/dot glints the corresponding threads; the number and n stamp in beside the cursor.
- **Dimension flipper** (Movement VI) — reader-driven invariance checking; the one true "explorer" moment in an otherwise authored piece.
- **Voice cards** — testimonials typeset as bureau index cards; attribution = pathway + generation ONLY (active convention; never geography).
- **Never animates:** body text, nav, anything on loop.

## 6. Dissemination Architecture (built-in, not bolted on)

- **Every FIG. is a share unit.** Each plate exports 1080×1080 and 1600×900 PNGs with the plate number, caption, n, and circumsurvey.online baked in. One "share this figure" affordance per plate — anchor deep-link + copy-citation + image.
- **Per-movement OG images and anchors** so a link to #the-separation unfurls with the right card on any platform.
- **The 30-second clip:** Movement III's separation sequence designed to be screen-recorded (steady pacing, no cursor needed) — the organic-video artifact for Reddit/Substack/TikTok without us producing video.
- **Print stylesheet** → the whole report prints as a coherent ~24pp document; doubles as the Summit handout PDF.
- **Performance budget:** thread canvas ≤ 4ms/frame mid-tier mobile (the Loom's low-power mode generalizes); LCP is styled text, not canvas; total JS for the report route < 250KB gz.

## 7. Data Architecture (kills the 496/500/501 problem)

One script — `scripts/freeze_phase1.js` — hits the live Worker (`/questions`,
`/aggregate` per question × pathway, curated narrative IDs) and emits
`src/report/data/phase1.json`: a single frozen snapshot at the 500-respondent
milestone, with per-question n, pathway n's, and a `frozen_at` stamp rendered in the
colophon. Every number in the report reads from this file; nothing is hand-typed.
The old `src/data.js` blocks are retired from the report path. (Observer/Trans
late-arrivals fold in per the existing exception, re-run the script, diff, commit.)
Small-n rules enforced at the component level: n<5 suppressed, n<20 badged.

## 8. Build Plan

New tree: `src/report/` (engine, plates, movements, data). v1 Scrollytelling
components are quarry — keep HarmonicCanvas math, GSAP/ScrollTrigger stack, theme
tokens, CIRODotExplorer's dot logic; retire the v1 copy and act structure entirely.

1. **Phase A — the spine:** freeze script + thread-canvas engine + movement scaffold with static plates. The report is readable end-to-end with no animation.
2. **Phase B — the money sequence:** Movement III separation + predict-reveal, polished to done. If only one thing ships animated, it's this.
3. **Phase C — the rest of the motion:** draw-on plates, mirrors sync-scroll, dimension flipper, bundle hover.
4. **Phase D — dissemination:** share/export pipeline, OG images, print stylesheet, reduced-motion/perf pass, accessibility audit.

Each phase ends deployable. Copy is drafted per-movement during Phase A in Inquiry
Frame and reviewed by Tone before Phase B.

---

*Blueprint prepared 2026-07-01. The reader asks; the data answers; the voices are heard; the conclusion is theirs.*
