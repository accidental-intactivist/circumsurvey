# Worked example: Grofé, *Mississippi Suite* II "Huckleberry Finn"

Inputs: a piano-reduction MIDI (`examples/piano_theme.mid`), an orchestral
recording (MP3), the full score (PDF, pp. 16–33). Output: 8 game cues
(`examples/out/sections/huck_0N_*.sid`) and one 8-tune `huck_all.sid`.
Each row is: what the user said → what the tools showed → the fix.

| user | measured | fix (layer) |
|---|---|---|
| "falls apart at 0:11", flutes "janky" | the reduction syncopates the string chords onto eighth 2; the timing fit followed them (an eighth early); grace figures transcribed with wrong pitches | `--edits`: chords to the downbeat, filler deleted; `figure` overrides from the score (flute, not oboe); anchors for bars 11–20 from `barfit` (figures landed 50–70 ms late) |
| "high notes cut out at 0:22", "herky at 0:19" | map wobbled up to 200 ms inside bars | map straightening between bar lines (code) + bar anchors |
| "syncopated melody at 0:31 jumbled" | after the bass stab a freed voice re-struck a decayed chord tone for one eighth | arranger: no re-strike of a struck note past its decay; resumes <0.2 s dropped |
| "a note should be held longer at :38" (fermata) | reduction's chord ended 0.9 s before the orchestra's | `--edits` resize + anchors |
| "the French horns at 0:51 are too slow / come in late" | SID stabs 60–140 ms after the record | anchors for bars 52–53 at the recorded stabs |
| "horns almost perfect — polish" (then three worse rewrites) | my transcriptions from onset spectra contained notes not in the record | **went back to the reduction's version**; then fixed only what `cmp.py` flagged |
| "cadence off", "a couple too quick before the held note" | SID played the written beat-4 chord at 52.88 then re-attacked the fermata at 53.24; record: one broadened arrival at 53.20; written beat-6 eighth not played | `--edits`: merge into the arrival, delete the eighth, hold the chord |
| hummed reference "Bap, ba-ba-bup-bup, ba-bap, ba-baaaa" | `hornpitch.py` on the hum = F♯ D♯ B F♯ B D♯ F♯ D♯ F♯, the horns' *top line*; the reduction kept F♯ on top of every chord and had no chord on the downbeat | `--edits`: bars 51–54 written out — the line on top, B-major chord tones under it, bass on the stabs, final F♯ one note through the fermata; "ba" lengthened to a quarter at the user's request |
| "percussion appeared at 0:51" | I had given the timpani figure its own voice | removed; three voices are better spent on the line in octaves + bass |
| 0:58–1:29 (nobody complained; found by `dropped.py`) | the pp "bass" D eighths are the timpani figure (score), and a held inner chord tone kept them off the voices | timpani as its own part on the score's rhythm; arranger: melody weight only on a chord's top note |
| "tempo weird at 1:30", "1:30–1:52 needs polishing" | Tempo I downbeat 0.1 s late; bars 73–97 ran 30–180 ms behind | anchors from `barfit` for 73–97; flute pickup pinned |
| "1:59–2:05 herky" | reduction's tutti chords on off-beats 2/5; record and score accent 1/4 and attack 1,3,4,6; left-hand filler under a held chord | `--edits`: chords to 1/4, filler deleted; anchors 103–113 |
| "ending is solid" | — | left alone |

## Numbers that matter
- "SID attack within ~30 ms of REC attack" is the bar for "fixed".
- `dropped.py` top-notes-not-heard: 72 → 31 over the project. The rest are
  octave-doubled run tones and fermata chords.
- 6502 verification: every build says `OK (N attacks, 0 timing mismatches)`.
- A whole-piece build takes ~8 s, the sections+bundle ~40 s.

## Order of work that worked
1. Whole piece with the recording; fix the global things (lag, key, dynamics).
2. Save the map (`--map`) so later fixes are local.
3. Per passage, in the order the user names them: measure → classify → fix →
   re-measure → render close-up → send.
4. Only then split into sections and bundle; the sections inherit everything.
