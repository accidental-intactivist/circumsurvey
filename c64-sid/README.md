# midi2sid: orchestral MIDI → Commodore 64 SID tunes

Turns a multi-track MIDI file, optionally paired with a reference recording
(MP3/WAV), into a 3-voice SID tune for a C64 game:

| output | what it is |
|---|---|
| `NAME.sid` | PSID v2 file: plays in SIDPlay / sidplayfp / VICE `vsid` |
| `NAME.prg` | the same player + song as a raw C64 binary with load address, to link into the game |
| `NAME.asm` | ACME-syntax listing of the player and data (readable, auditable, re-assemblable) |
| `NAME.sync.json` | frame number of every bar/beat (and MIDI markers), for syncing gameplay to the music |
| `NAME.report.json` | arrangement, alignment, memory and CPU statistics |
| `NAME.wav` | preview rendered by **running the generated 6502 code** on an emulated CPU (py65) into reSID |

```bash
cd c64-sid
pip install -r requirements.txt          # + ffmpeg on PATH for --audio
python -m midi2sid song.mid                                   # MIDI timing
python -m midi2sid song.mid --audio recording.mp3             # follow the recording
python -m midi2sid.compare song.report.json recording.mp3     # sync-check mp3 + piano-roll png
python -m unittest discover -s tests                          # tests
```

## How it works

```
MIDI ──► notes per part ─┐
                          ├─► time map ─► frame-quantised notes ─► arranger ─► byte-code ─► 6502 player ─► .sid/.prg
recording ─► tuning, key, ┘   (DTW)          (50.125 / 59.826 Hz)   (3 voices)   (+ repeat      │
             tempo curve,                                                        compression)   └─► py65 + reSID ─► .wav
             loudness ───────────────────────────────► master-volume stream                           + verification
```

### 1. Timing: MIDI or recording

Without `--audio`, note times come from the MIDI tempo map. Each note start
and end is rounded to the nearest C64 frame from its absolute time (PAL
50.125 Hz, NTSC 59.826 Hz), so rounding error never accumulates: the tune
lasts exactly as long as the MIDI, ±½ frame.

With `--audio`, the recording is analysed first:

* **Tuning**: spectral-peak deviation from A440. The SID frequency table is
  rebuilt for it (e.g. +10 cents).
* **Key**: MIDI arrangements are often in a different key from the
  recording. The best transposition is chosen by DTW cost among the most
  likely keys.
* **Tempo curve**, in four steps:
  1. **Audio-to-audio DTW.** The MIDI is rendered to audio internally and
     analysed exactly like the recording, so their analysis delays cancel.
     Comparing audio with audio proved far less ambiguous on orchestral
     recordings than comparing audio with symbolic note features. A coarse
     pass at 10 fps is followed by a banded pass at 50 fps. Every step pays
     for the frames it skips, so skipping silence or mismatched material is
     never "free". Both ends are pinned to where the recording's music
     starts and stops.
  2. **Closed-loop correction.** The MIDI is re-rendered at the current
     sync and its delay against the recording is measured in 3 s windows
     (median of neighbours, low-confidence windows ignored). The map is then
     shifted by that delay, repeating until the average error is under
     20 ms. This fixes stretches where repetitive music let the DTW latch
     onto the neighbouring repetition, a beat or a bar off.
  3. **Onset snapping.** Each MIDI chord or note onset is pulled onto the
     nearest strong onset in the recording (within ±0.35 s). The correction
     is median-smoothed across neighbouring onsets, so one bad match can't
     cause a glitch.
  4. The result is a monotone MIDI-time → recording-time map that follows
     rubato, ritardandos and fermatas.
* **Recovered runs**: piano reductions drop orchestral filigree, such as
  flute runs. `recover.py` scores straight diagonal streaks in the
  recording's upper register (relative to its own running background, so
  held notes don't count) and reads each figure's notes along a monotone
  best path. A figure is only added if MIDI notes don't already trace it at
  a constant interval (unison, octave or a harmonic). The figures become an
  extra "Flute runs (from recording)" part. Their notes are slurred, so a
  run glides on one voice instead of re-attacking every 40–100 ms note.
  Use `--no-recover-runs` to turn this off.
* **Dynamics**: the recording's loudness drives the SID master volume
  (`$D418`), smoothed and hysteresis-limited to avoid the 6581 volume click.
  Use `--dynamics none` to turn this off.

On a synthetic test (the MIDI rendered with ±8% tempo drift, transposed,
detuned and with leading silence) the recovered map is within **~20 ms
(about one PAL frame)** of the truth. The report gives
`onset_score_unaligned` → `onset_score_final` so you can see how much the
alignment helped on your recording.

### 2. Arrangement: N parts → 3 voices

At every point where a note starts or a voice goes idle, the arranger scores
candidate assignments and keeps the best:

* **voice 1**: single notes, prefers the lowest line (bass)
* **voice 2**: single notes, prefers the most salient/highest line (melody)
* **voice 3**: single notes, drum hits, or a **1-frame arpeggio** through the
  remaining chord tones (the classic C64 chord trick), preferring chord tones
  not already heard in voices 1–2

**How important a note is (salience):**
* **Part role**, detected automatically (melody 1.5, bass 1.3, counter-line
  1.0, chords 0.8, drums 1.1).
* **Duration and velocity.**
* **Melodic motion**: repeated pitches and pedal tones count for less.

**Penalties** for what sounds worst on a SID:
* cutting a note that is still ringing
* re-attacking a note on another voice
* bass above melody
* arpeggios spanning more than 19 semitones
* instrument hopping

Unison doublings across parts are merged.

**Struck and plucked notes fade.** For piano, harp, guitar, mallets,
timpani and pizzicato, a held note's claim on its voice decays over about
0.4–0.8 s. Without this, a chord held for a bar would keep all three voices
while the left hand's moving bass line (usually what the listener follows)
was dropped. Sustained instruments (strings, winds, organ) keep their full
weight.

### 3. Instruments and envelopes

Each part gets a SID instrument, chosen from its track name ("pizz",
"bassoon", "flute", "horn" …) or its GM program. An instrument has:
* ADSR
* sustain waveform
* a **wavetable** for the first frames, e.g. a noise-burst pluck for
  pizzicato, drum pitch-drops or octave blips
* bouncing pulse-width modulation
* delayed vibrato

ADSR is then **adapted to how the part is played**:
* attack capped at ⅓ of the median note length
* staccato parts get a fast decay and release
* legato parts get enough release to bridge the hard-restart gap

Drums (MIDI channel 10) map to kick, snare, hat, cymbal and tom drum tables.

Every new note is preceded by a **2-frame hard restart** (gate off + ADSR
$00/$00), the standard fix for the SID's ADSR bug. Without it, repeated
notes swallow their attacks.

Override anything per part with `--instruments overrides.json`:

```json
{
  "Flutes / Piccolo": {"preset": "lead", "ad": 34, "sr": 168, "vib_depth": 2},
  "Horns":            {"weight": 0.6},
  "Strings (Pizzicato)": {"table": [[128, 24], [64, 0]]}
}
```

(`wave`/table waveforms: 16 triangle, 32 saw, 64 pulse, 128 noise. Table notes
are relative semitones, or `"abs:N"` for an absolute note.)

### 4. Player and data

The player is written in Python against a small built-in 6502 assembler
(`asm6502.py`), so the tune can be **relocated anywhere** (`--load $C000`)
with no external toolchain. It takes about 1 KB of code and tables plus the
song data.

Song data is a compact per-voice byte-code: note, off, hard-restart, wait,
instrument, legato, arpeggio, call, jump (see `compiler.py`). Repeated
passages are compressed LZ-style into `CALL`s of earlier data. The example
compresses from 3.6 KB to 2.0 KB with MIDI timing. With recording sync,
repeats are less exact (the tempo breathes), so it compresses less.

## Sections (game cues) and score anchors

```bash
python -m midi2sid.sections examples/piano_theme.mid -a recording.mp3 \
    --anchors examples/huckleberry_finn_piano.anchors.json \
    --bars 21,40,50,54,73,98,101,116 -o out/huck
```

This splits a piece at bar lines into separate tunes (`out/huck_01_….sid`
… `_09_….sid`, plus `out/huck_sections.json`):
* **Each section is aligned on its own** to its stretch of the recording,
  so a fermata or tempo change at a boundary can't drag a neighbouring
  section's tempo around.
* **Each tune starts exactly on its first bar line** and lasts exactly
  until the next section's bar line, so playing section N then N+1 is
  seamless. Each tune loops on its own if left running.

**Score anchors** (`--anchors`) pin moments you know from the score, such as
a fermata or a *Tempo I*, to times in the recording:

```json
[{"bar": 72, "beat": 1, "recording_s": 84.65, "note": "last ritard. chord, held (fermata)"},
 {"bar": 73, "beat": 1, "recording_s": 89.07, "note": "rehearsal 7, Tempo I"}]
```

Beats count the time signature's beat unit (eighths in 6/8), starting at
1. The alignment is forced through the pins, and its long hold steps
(up to 4× per step) let a fermata stretch between them. A steady-tempo
check then replaces lurching stretches with a constant tempo whenever that
explains the recording's attacks at least as well.

## Using it in the game

```
init  = load+0   ; jsr once
play  = load+3   ; jsr once per frame (raster IRQ)
frame = load+6   ; 16-bit frame counter (lo, hi), updated by play
zp    = $FB/$FC  ; temp pointer during play (--zp to move)
```

```asm
        sei
        jsr $1000            ; init music
        lda #<irq
        sta $0314
        lda #>irq
        sta $0315
        lda #$7f
        sta $dc0d            ; CIA IRQs off
        lda $dc0d
        lda #$01
        sta $d01a            ; raster IRQ on
        lda #$f8
        sta $d012
        lda $d011
        and #$7f
        sta $d011
        cli
        ...
irq     inc $d019
        jsr $1003            ; play one frame
        jmp $ea31
```

To sync gameplay to the music, compare the frame counter at `$1006/$1007`
with the frame numbers in `NAME.sync.json` (every bar and beat). The tune
loops by default (`--no-loop` stops at the end). All three voices loop on the
same frame, so they never drift apart.

CPU cost for the example is about 2,000 cycles per frame worst case (~33
raster lines).

## Example: Grofé, *Mississippi Suite*, "Huckleberry Finn"

`examples/huckleberry_finn.mid` has 4 parts: bassoons, pizzicato strings,
flutes and horns, with up to 8 simultaneous notes.

| | MIDI timing | synced to the MP3 |
|---|---|---|
| note onsets audible on 3 voices | 85.1 % | 84.3 % |
| note-time audible | 90.0 % | 89.6 % |
| size (player + song) | 3,345 bytes | 4,393 bytes |
| 6502 verification | 564/564 attacks on the exact frame | 561/561 |

The reference MP3 is a **different performance** from the MIDI:
* it is in B♭ (the MIDI is in C) and 10 cents sharp
* it is about 12% faster
* it starts after 9.6 s of silence
* it contains material the MIDI arrangement does not have (e.g. a rising run
  around 25–30 s)

The synced build follows its key, tuning, tempo curve and dynamics. It starts
at 11.27 s into the recording, which `sync-check.mp3` (recording left, SID
right) lets you judge by ear. Where the recording and the MIDI disagree
musically, no alignment can make them agree. A MIDI transcribed from that
exact recording will sync much more tightly.

![comparison](examples/out/huckleberry_finn_synced.compare.png)

## Example: Grofé, *Mississippi Suite*, mvt. 3 (piano reduction)

`examples/piano_theme.mid` is a two-hand piano reduction: E♭, 6/8, with
tempo changes and velocity dynamics. `piano_theme_synced` follows an
orchestral recording of the movement:
* same key, +8 cents
* about 7% slower overall, with strong rubato
* onset match rises from 0.00 to 0.51
* checked by rendering the SID and measuring its delay against the
  recording in 1.5 s steps: the median offset is 60 ms (about 3 frames).
  The broad ending (five closing chords, final hit at 143.3 s) lands
  within 30 ms.

| | MIDI timing | synced to the recording |
|---|---|---|
| note onsets audible on 3 voices | 90.2 % | 90.2 % |
| size (player + song) | 7,143 bytes | 7,321 bytes |
| 6502 verification | 1125/1125 | 1116/1116 |

**Checked against the full score.** The MIDI is a piano reduction of
*Huckleberry Finn* (E♭, 6/8, *Allegro moderato scherzando*), and the
recording is the same movement. Rehearsal **2** (bar 13) is marked *poco a
poco cresc. e accel.*; there piccolo, flutes, oboes, English horn and
clarinets play a rising grace-note figure into an accented chord, one per
bar for six bars. Those are the six recovered runs. Because each figure
lands on its bar's accented chord, the converter pins the matching MIDI
chord (the right hand's 2nd eighth in bars 14–19) to the moment the figure
lands ("landing anchors": three or more regular figures, chords of three or
more notes, one-to-one). That made the piano chords and the flute runs
coincide within 17 ms through the accelerando; before, they drifted up to
0.4 s apart.

**Missing flute runs.** The piano reduction leaves out the flutes' rising
figures, about one every 0.9 s from 12.3 s. They are recovered from the
recording: D6–E♭6–E6, C♯6–F6–F♯6–G6, E♭6–F6–F♯6–G6, A♭6–A6–B♭6, B5–C6–E♭6–E6
and A♭5–A5–B♭5, plus two flourishes over the closing chords. On a synthetic
test with planted runs the detector recovers them note-exactly, and it adds
nothing to a render that has no runs. Its known limit: a run masked by a
louder held note in the same register is missed.

**Wrong-note audit.** Each MIDI note was checked against the recording's
chroma at the aligned time, looking for its pitch class being weak while a
neighbouring semitone is strong.
* No note met that test (0 of 1,467). The MIDI's notes agree with the
  recording.
* The audible differences came from the arrangement (the dropped bass
  lines described above) and from the piano preset's old one-frame
  octave-up attack. That preset now uses a same-pitch sawtooth burst.

## Verification

`convert` checks its own output. It runs the generated `.prg` on py65 and
compares every gate-on edge the player writes to `$D404/$D40B/$D412`
against the frame the compiler scheduled it for. The tests also check:
* register pitches match the notes
* compression is lossless
* branch relaxation in the assembler works
* alignment recovers a known tempo warp

The `.sid` files were also checked in sidplayfp (libsidplayfp 2.6).

## Limitations / next steps

* No filter or ring-mod/sync yet. Everything is waveform + ADSR +
  arpeggio + PWM + vibrato.
* One tune per file. Several songs could share one player (subtunes).
* The arranger is greedy, deciding at each event. A look-ahead (Viterbi)
  pass could improve voice continuity further.
* Master-volume dynamics click slightly on real 6581s. Use `--dynamics none`
  or `--model 8580` if that bothers you.
