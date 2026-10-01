"""Split a piece into sections (e.g. dramatic cues for a game), each its own
SID tune with its own alignment to the matching stretch of the recording.

  python -m midi2sid.sections song.mid --audio rec.mp3 --bars 23,51,55,73,98,103,113 -o out/song

Writes one tune per section (out/song_01_....sid ...) and, unless --no-bundle,
out/song_all.sid: every section as a tune of ONE player (init with A = tune).

Sections are cut on MIDI bar lines, so every mini-tune starts on a downbeat.
The whole piece is aligned once (or loaded with --map, then corrected locally
with --anchors) to find where each bar line falls in the recording; each
section then plays its slice of that one map, so sections join seamlessly and
a correction in one section never moves another.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile

import mido
import numpy as np

from .bundle import bundle
from .convert import Options, convert, load_map
from .midi_in import load_midi


def cut_midi(path, tick0, tick1, out_path):
    """Notes starting in [tick0, tick1), shifted to start at 0; tempo kept."""
    mf = mido.MidiFile(path)
    out = mido.MidiFile(ticks_per_beat=mf.ticks_per_beat, type=1)
    for tr in mf.tracks:
        abs_ev, tick = [], 0
        tempo_at0 = None
        on = {}
        for msg in tr:
            tick += msg.time
            if msg.type == "set_tempo":
                if tick <= tick0:
                    tempo_at0 = msg
                elif tick < tick1:
                    abs_ev.append((tick - tick0, msg))
            elif msg.is_meta and msg.type in ("track_name", "time_signature", "key_signature"):
                abs_ev.append((0, msg))
            elif msg.type == "program_change":
                abs_ev.append((0, msg))
            elif msg.type == "note_on" and msg.velocity > 0:
                if tick0 <= tick < tick1:
                    on.setdefault((msg.channel, msg.note), []).append(tick)
                    abs_ev.append((tick - tick0, msg))
            elif msg.type == "note_off" or (msg.type == "note_on" and msg.velocity == 0):
                stack = on.get((msg.channel, msg.note))
                if stack:
                    stack.pop(0)
                    abs_ev.append((min(tick, tick1 + mf.ticks_per_beat * 4) - tick0, msg))
        if tempo_at0 is not None:
            abs_ev.insert(0, (0, tempo_at0))
        abs_ev.sort(key=lambda e: e[0])
        new, last = mido.MidiTrack(), 0
        for t, msg in abs_ev:
            new.append(msg.copy(time=max(0, t - last)))
            last = max(last, t)
        out.tracks.append(new)
    out.save(out_path)


def cut_audio(src, t0, t1, out_path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}",
                    "-i", src, "-ac", "1", out_path], check=True)


def bar_ticks(path):
    s = load_midi(path)
    tpb = s.ticks_per_beat
    num, den = (s.time_sigs[0][1], s.time_sigs[0][2]) if s.time_sigs else (4, 4)
    return tpb * 4 * num // den, s


def main(argv=None):
    ap = argparse.ArgumentParser(prog="midi2sid.sections")
    ap.add_argument("midi")
    ap.add_argument("-a", "--audio", required=True)
    ap.add_argument("--bars", required=True, help="comma-separated first bars of sections 2..N")
    ap.add_argument("--anchors", help="score anchors JSON for the whole-piece alignment")
    ap.add_argument("--edits", help="JSON of score corrections applied to a copy of the MIDI first")
    ap.add_argument("--map", help="saved whole-piece time map to start from instead of aligning; "
                    "--anchors then only correct it locally (see python -m midi2sid --map)")
    ap.add_argument("-o", "--out", required=True, help="output prefix, e.g. out/huck")
    ap.add_argument("--names", help="comma-separated section names")
    ap.add_argument("--video", default="pal")
    ap.add_argument("--title", default="", help="title of the multi-tune .sid with every section")
    ap.add_argument("--no-bundle", action="store_true",
                    help="don't build the multi-tune {out}_all.sid holding every section")
    args = ap.parse_args(argv)

    anchors = json.load(open(args.anchors)) if args.anchors else []
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    if args.edits:
        from .edits import apply_edits, load_edits
        edited = args.out + ".edited.mid"
        summary = apply_edits(args.midi, load_edits(args.edits), edited)
        print(f"applied {summary['edits']} score corrections ({summary['moved']} notes moved, "
              f"{summary['resized']} resized, {summary['deleted']} deleted, {summary['added']} added)")
        args.midi = edited
    # 1. whole piece: where does each bar line fall in the recording?
    wopt = Options(audio=args.audio, anchors=anchors, render_wav=False, verify=False,
                   recover_runs=True, video=args.video)
    if args.map:
        wopt.fixed_map, wopt.fixed_key = load_map(args.map)
    whole = convert(args.midi, args.out + "_whole", wopt)
    al = whole["alignment"]
    am, ar = np.array(al["anchors_midi_s"]), np.array(al["anchors_recording_s"])
    bar_len, song = bar_ticks(args.midi)
    last_tick = max(n.start_tick for n in song.notes) + bar_len
    starts = [1] + [int(b) for b in args.bars.split(",")]
    names = args.names.split(",") if args.names else [f"section{i + 1:02d}" for i in range(len(starts))]
    audio_len = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", args.audio],
        capture_output=True, text=True).stdout)
    summary, builds = [], []
    with tempfile.TemporaryDirectory() as d:
        for i, b0 in enumerate(starts):
            t0 = (b0 - 1) * bar_len
            t1 = (starts[i + 1] - 1) * bar_len if i + 1 < len(starts) else last_tick
            m0, m1 = song.tick_to_sec(t0), song.tick_to_sec(t1)
            r0 = float(np.interp(m0, am, ar))
            r1 = float(np.interp(m1, am, ar)) if i + 1 < len(starts) else audio_len
            mid, wav = os.path.join(d, f"s{i}.mid"), os.path.join(d, f"s{i}.wav")
            cut_midi(args.midi, t0, t1, mid)
            # a little context on both sides; the section's own lead-in trim
            # removes it again
            pad0 = min(0.3, r0)
            cut_audio(args.audio, r0 - pad0, min(audio_len, r1 + 0.6), wav)
            # the section uses the whole-piece time map (aligned once, with the
            # score anchors): sections then join seamlessly and agree with it
            cut0 = r0 - pad0
            grid = np.concatenate([[m0], am[(am > m0) & (am < m1 + 2.0)], [m1 + 2.0]])
            sec_map = (list(grid - m0), list(np.interp(grid, am, ar) - cut0))
            out = f"{args.out}_{i + 1:02d}_{names[i]}"
            rep = convert(mid, out, Options(audio=wav, fixed_map=sec_map,
                                            fixed_key=(whole["transpose"], whole["tuning_cents"] / 100),
                                            video=args.video,
                                            lead_s=pad0,             # frame 0 = the section's first bar line
                                            end_s=pad0 + (r1 - r0),  # ends on the next section's bar line
                                            title=f"{names[i]} (bars {b0}-{(starts[i + 1] - 1) if i + 1 < len(starts) else 'end'})"))
            builds.append(rep["_build"])
            summary.append({"section": i + 1, "name": names[i], "bars": [b0, (starts[i + 1] - 1) if i + 1 < len(starts) else None],
                            "recording_s": [round(r0, 2), round(r1, 2)],
                            "sid": os.path.basename(out) + ".sid", "frames": rep["frames"],
                            "bytes": rep["memory"]["total_bytes"],
                            "onset_match": rep["alignment"]["onset_score_final"],
                            "verified": rep["verification"]["ok"]})
            print(f"section {i + 1:2d} bars {b0:3d}-{summary[-1]['bars'][1] or 'end'}: "
                  f"recording {r0:6.2f}-{r1:6.2f} s -> {out}.sid  ({rep['memory']['total_bytes']} bytes, "
                  f"onset match {rep['alignment']['onset_score_final']}, "
                  f"6502 {'OK' if rep['verification']['ok'] else 'MISMATCH'})")
    if not args.no_bundle:
        b = bundle(builds, args.out + "_all", video=args.video,
                   title=args.title or os.path.basename(args.out))
        m = b["memory"]
        print(f"all {len(builds)} sections as tunes 0-{len(builds) - 1} of one player -> {args.out}_all.sid  "
              f"({m['total_bytes']} bytes, {m['load']}-{m['end']}; separately "
              f"{sum(s['bytes'] for s in summary)} bytes; 6502 {'OK' if b['verified'] else 'MISMATCH'})")
        for s in summary:
            s["tune_in_all_sid"] = s["section"] - 1
    with open(args.out + "_sections.json", "w") as f:
        json.dump(summary, f, indent=2)


if __name__ == "__main__":
    main()
