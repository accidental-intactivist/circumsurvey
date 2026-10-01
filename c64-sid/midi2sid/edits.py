"""Score corrections applied to a MIDI file before conversion.

A piano reduction is not the score: an arranger may syncopate a held chord
into off-beat stabs, fill a fermata with figuration, or shorten a bar.  Where
the full score (and the recording) disagree with the reduction, an edits file
puts the notes where the orchestra plays them, and documents every change:

[
 {"part": "Piano", "bars": [13, 19], "eighth": 2, "to_eighth": 1, "len_eighths": 3,
  "why": "score p.18: the string chords are on the downbeat, held a dotted quarter"},
 {"part": "Piano", "bars": [13, 18], "eighth": [3, 5, 6], "delete": true,
  "why": "broken-chord figuration of the reduction; the orchestra has only the bass line"},
 {"part": "Piano", "bar": 13, "eighth": 1, "add": [87], "len_eighths": 1,
  "why": "piccolo accent"}
]

`part` is the part name as the converter reports it ("Piano", "Piano #2" for a
second track of the same name).  `eighth` counts the time signature's beat
unit from 1 (eighths in 6/8); a note is selected when it starts within a
quarter of a unit of that position.  `bars` is inclusive; `bar` selects one.
Operations: move (`to_eighth`), resize (`len_eighths`), `delete`, `add`
(pitches, with `len_eighths` and optional `velocity`).  The source MIDI is
never changed: the edited copy is written next to the output.
"""

from __future__ import annotations

import json

import mido

from .midi_in import load_midi


def _units(song):
    """(ticks per bar, ticks per beat unit) from the first time signature."""
    num, den = (song.time_sigs[0][1], song.time_sigs[0][2]) if song.time_sigs else (4, 4)
    unit = song.ticks_per_beat * 4 // den
    return unit * num, unit


def _part_tracks(path, song):
    """part name -> (mido track index, channel) via the loader's numbering."""
    mf = mido.MidiFile(path)
    keys = []
    for ti, tr in enumerate(mf.tracks):
        chans = sorted({m.channel for m in tr if m.type in ("note_on", "note_off")})
        keys += [(ti, ch) for ch in chans]
    # load_midi numbers parts in order of first note-off per (track, channel)
    return {p.name: keys[p.index] for p in song.parts if p.index < len(keys)}, mf


def apply_edits(midi_path, edits, out_path):
    """Write the edited MIDI to out_path; returns a summary dict."""
    song = load_midi(midi_path)
    bar_ticks, unit = _units(song)
    part_of, mf = _part_tracks(midi_path, song)
    summary = {"moved": 0, "resized": 0, "deleted": 0, "added": 0, "edits": len(edits)}

    for ti, tr in enumerate(mf.tracks):
        # absolute-tick events; pair the notes
        abs_ev, tick = [], 0
        for msg in tr:
            tick += msg.time
            abs_ev.append((tick, msg))
        notes, others, active = [], [], {}
        for t, msg in abs_ev:
            if msg.type == "note_on" and msg.velocity > 0:
                active.setdefault((msg.channel, msg.note), []).append((t, msg))
            elif msg.type == "note_off" or (msg.type == "note_on" and msg.velocity == 0):
                stack = active.get((msg.channel, msg.note))
                if stack:
                    t0, on = stack.pop(0)
                    notes.append({"start": t0, "end": max(t, t0 + 1), "pitch": msg.note,
                                  "vel": on.velocity, "ch": msg.channel})
                else:
                    others.append((t, msg))
            else:
                others.append((t, msg))
        for (ch, pitch), stack in active.items():
            for t0, on in stack:
                notes.append({"start": t0, "end": tick, "pitch": pitch, "vel": on.velocity, "ch": ch})

        for ed in edits:
            tic = part_of.get(ed["part"])
            if tic is None:
                raise ValueError(f"edit names unknown part {ed['part']!r}; parts: {sorted(part_of)}")
            if tic[0] != ti:
                continue
            ch = tic[1]
            bars = ed.get("bars") or [ed["bar"], ed["bar"]]
            eighths = ed.get("eighth", [])
            eighths = eighths if isinstance(eighths, list) else [eighths]
            for bar in range(int(bars[0]), int(bars[1]) + 1):
                b0 = (bar - 1) * bar_ticks
                if "add" in ed:
                    pos = b0 + (float(ed["eighth"]) - 1) * unit
                    ln = float(ed.get("len_eighths", 1)) * unit
                    for p in ed["add"]:
                        notes.append({"start": int(round(pos)), "end": int(round(pos + ln)),
                                      "pitch": int(p), "vel": int(ed.get("velocity", 90)), "ch": ch})
                        summary["added"] += 1
                    continue
                for e in eighths:
                    pos = b0 + (float(e) - 1) * unit
                    sel = [n for n in notes if n["ch"] == ch and abs(n["start"] - pos) <= unit / 4]
                    if ed.get("delete"):
                        for n in sel:
                            notes.remove(n)
                        summary["deleted"] += len(sel)
                        continue
                    for n in sel:
                        ln = n["end"] - n["start"]
                        if "to_eighth" in ed:
                            n["start"] = int(round(b0 + (float(ed["to_eighth"]) - 1) * unit))
                            summary["moved"] += 1
                        if "len_eighths" in ed:
                            ln = int(round(float(ed["len_eighths"]) * unit))
                            summary["resized"] += 1
                        n["end"] = n["start"] + max(1, ln)

        # rebuild: offs before ons at the same tick
        ev = list(others)
        for n in notes:
            ev.append((n["start"], mido.Message("note_on", note=n["pitch"], velocity=n["vel"], channel=n["ch"])))
            ev.append((n["end"], mido.Message("note_off", note=n["pitch"], velocity=0, channel=n["ch"])))
        order = {"note_off": 0, "note_on": 2}
        ev.sort(key=lambda x: (x[0], order.get(x[1].type, 1)))
        new, last = mido.MidiTrack(), 0
        for t, msg in ev:
            new.append(msg.copy(time=max(0, t - last)))
            last = max(last, t)
        mf.tracks[ti] = new
    mf.save(out_path)
    return summary


def load_edits(path):
    with open(path) as f:
        return json.load(f)
