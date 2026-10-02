# Diagnostic tools

Run from `c64-sid/` with `PYTHONPATH=.`. Each file's docstring has its usage.

| tool | question it answers |
|---|---|
| `cmp.py` | Are the SID's attacks where the recording's are? (interleaved REC/sid list, ms) |
| `voices.py` | What does each SID voice play, frame by frame? |
| `midibars.py` | What does the MIDI have in these bars (eighth positions, lengths, velocities)? |
| `assign.py` + `show.py` | Which voice got each note, and with what salience? What was dropped? |
| `dropped.py` | Which top notes of the MIDI does no voice play, per bar? |
| `barfit.py` | Where are the bar lines really? (DP fit of onsets to the recording) |
| `hornpitch.py` | Which pitches dominate at each 20 ms (transcribing a line, or a hummed reference)? |
| `lowband.py` | Where are the timpani / bass strokes? |
| `finelib.py` | shared 2.5 ms onset analysis |

These grew out of polishing `examples/huckleberry_finn_piano*`; see
`.claude/skills/midi2sid/` for the method.
