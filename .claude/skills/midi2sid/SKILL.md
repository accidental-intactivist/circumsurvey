---
name: midi2sid
description: Convert MIDI files (optionally matched to a reference recording and a score) into Commodore 64 SID tunes with the in-repo midi2sid converter in c64-sid/, then polish them passage by passage until the SID tracks the recording. Use this skill whenever the user mentions SID files, C64 music, chiptune conversion of a MIDI, a .sid/.prg for a game, syncing a SID to an MP3/recording, "the horns at 0:51 are off", splitting a piece into game cues/sections, or wants OGG renders to compare against a recording — even if they do not say "midi2sid".
---

# MIDI → C64 SID with midi2sid

The converter lives in `c64-sid/` (run everything from there). It turns a
MIDI into a PSID `.sid` + `.prg` with a 6502 player, arranging N parts onto
the SID's 3 voices, and — with a recording — fits the timing, key, dynamics
and attack placement to that recording. `README.md` there documents the
pipeline; this skill is the working method that got Grofé's *Huckleberry
Finn* from "sounds pretty good" to "nailed it".

## The loop

1. **Convert**: `python3 -m midi2sid SONG.mid -a REC.mp3 -o out/name`
   (add `--edits`, `--anchors`, `--map` once they exist — see below).
2. **Render for the ear**: an OGG with the recording on the left channel and
   the SID on the right (see *Renders*). Send it, plus a SID-only OGG. The
   user listens; you measure.
3. **Measure, don't guess**: for every passage the user flags, compare
   recording attacks and SID attacks at millisecond resolution
   (`tools/cmp.py`), look at what each voice plays (`tools/voices.py`) and
   what the MIDI has there (`tools/midibars.py`). Decide from the numbers
   which of the three failure kinds it is (below).
4. **Fix at the right layer** — a score correction (`--edits`), a bar-line
   anchor (`--anchors`), or an arranger rule in the code — never by hand in
   the output. Rebuild (8 s), re-measure the same window, then rebuild the
   sections and renders, run `python3 -m unittest discover -s tests`, commit.
5. Repeat per passage. Ask the user to name passages by time ("0:31") and
   describe what they hear; "herky", "jumbled", "late" each point to a
   different cause.

## Three kinds of wrong, and how each shows up

**Timing (bar lines / lag).** `tools/cmp.py` shows SID attacks consistently
40–80 ms after the REC attacks, or a bar whose attacks drift inside the bar.
Causes: the feature-level alignment runs ~60 ms behind true attacks, and
wobbles within bars. Fix with anchors: pin bar lines (`{"bar": 73, "beat": 1,
"recording_s": 88.97}`) to times from `tools/barfit.py` (a DP fit of each
bar's onset positions to the recording, bar length free) or from
`finelib.onsets`. With `--map` (a saved alignment) anchors are local
corrections and the map is straightened between bar lines, so eighths land
on an even grid. Keep fermata bars out of a `barfit` range; the user hears
whether a fermata is right, and the recording's attack after it tells you
where the next bar starts.

**Wrong notes / wrong rhythm (the reduction is not the score).** The MIDI is
usually a piano reduction: it syncopates held chords into stabs, writes a
timpani figure as bass notes, stacks a horn line as block chords, keeps the
same top note on every chord, adds filler under a held chord, or has an
accidental the orchestra doesn't play. Signs: `tools/cmp.py` shows SID attacks
with no REC counterpart (or REC attacks with no SID one), `tools/hornpitch.py`
shows a pitch class the MIDI lacks, the user says a passage is "jumbled" or
"off". Fix with `--edits` (a JSON of move/resize/delete/add by bar and
eighth, `pitches` to pick notes out of a chord, `add` with `program` to create
a new part, `figure` to override a transcribed grace figure), each with a
`why`. Read `midi2sid/edits.py`'s docstring for the format. The edited copy
is written next to the output; the source MIDI is never touched.

**Voice allocation (3 voices, N parts).** The notes are right and on time but
a voice "hops": a freed voice re-strikes a chord tone that died away, a bass
entry is missing because a right-hand inner tone holds a voice, a melody
glides where it should re-attack. `tools/show.py` (after `tools/assign.py`)
prints every note's salience and which voice got it; `tools/dropped.py`
counts top notes no voice plays, per bar — drive that number down. Fixes are
arranger rules in `midi2sid/arranger.py` / `convert.py`; the current ones are
described in README "Arrangement". Add a rule only when it generalizes (it
will apply to the whole piece); check `dropped.py` and the test suite after.

## Sources, ranked by how much they settled

1. **The recording.** Ground truth for timing, pitches, and what the
   orchestra actually plays (not what is written). Every fix is measured
   against it; every claim of "fixed" means SID attacks within ~30 ms of REC
   attacks in `tools/cmp.py`.
2. **A hummed or sung reference from the user.** When a passage stays in
   dispute after two attempts, ask for one: "hum how it should go". Run
   `tools/hornpitch.py` on it; it isolates the *line* the user hears from
   the whole texture and resolves in one pass what the record's spectrum
   cannot (brass in octaves, doublings). Match the hummed line to the
   recording's pitch trace, then write that line out explicitly as the top
   voice with chord tones under it.
3. **The score.** Essential for *who* and *where*: which instrument has a
   figure (a pp "bass" that is really timpani), where bar lines fall through
   fermatas and tempo changes, accents that explain a rhythm, grace-note
   directions. Render pages with `pdftoppm -r 300` and crop per staff and
   bar before reading. Do not trust pitches read off a scan at low
   resolution, and do not trust the score over the recording for how a
   phrase is played (a written eighth the players tie through, a broadened
   cadence).

## Things that cost us time — avoid

- Re-transcribing a passage from the recording's onset spectrum (peaks pick
  wrong partials in brass octaves). Use `hornpitch.py` (harmonic sum) or a
  hummed reference; and before replacing the reduction's version of a
  passage, ask whether the user liked it — "almost perfect" means polish,
  not rewrite, and keep a copy to go back to.
- Spending a voice on a percussion figure under a tutti. On three voices it
  reads as noise; the user preferred doubling the line in octaves or
  sustaining the bass.
- Fixing timing by eye from the alignment plot. Use `cmp.py` / `barfit.py`.
- Trusting onset detection for soft bass/timpani — use `tools/lowband.py`.

## Renders

```bash
# L = recording, R = SID, for the whole piece (sections mixed at their start times)
# see .claude/skills/midi2sid/references/renders.md for the ffmpeg recipe
```
Always send: the full L/R comparison, a SID-only run, and a 10 s close-up
of each passage under discussion (`ffmpeg -ss 0:49 -to 0:59 ...`). Use
`SendUserFile` with a one-line caption saying what changed.

## Sections and the bundle

`python3 -m midi2sid.sections SONG.mid -a REC.mp3 --edits E --map M --anchors A --bars 25,51,55,73 --title "Name" -o out/name`
cuts the piece at bar lines into separate tunes plus one multi-tune
`name_all.sid` (init with A = tune). Every section plays a slice of the one
whole-piece map, so they chain seamlessly. Rebuild sections after every
change to the full tune. Commit `.sid/.prg/.report.json/.sync.json` and the
edited MIDI; never the `.wav`.

## Open questions to settle early with the user
Section names; target chip (6581 / 8580 / both); whether filter sweeps are
wanted; tuning (the whole bundle shares one frequency table).

See `references/workflow-example.md` for the full worked example (what was
asked, what was measured, what fixed it), and `references/renders.md` for
the render commands.
