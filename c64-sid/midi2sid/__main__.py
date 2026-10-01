import argparse
import json
import sys

from .convert import Options, convert, load_map


def _addr(s):
    s = s.strip().lower()
    return int(s[1:], 16) if s.startswith("$") else int(s, 0)


def main(argv=None):
    ap = argparse.ArgumentParser(
        prog="midi2sid",
        description="Convert a MIDI file (optionally synced to a reference recording) into a "
                    "3-voice C64 SID tune: .sid (PSID), .prg (for your game), .asm listing, "
                    ".wav preview rendered by running the real 6502 code through reSID.")
    ap.add_argument("midi")
    ap.add_argument("-o", "--out", help="output path without extension (default: next to the MIDI)")
    ap.add_argument("-a", "--audio", help="reference recording (mp3/wav/...) to sync timing, key and dynamics to")
    ap.add_argument("--sync", choices=["auto", "dtw", "linear", "none"], default="auto",
                    help="how to follow the recording's timing (default: dtw when --audio is given)")
    ap.add_argument("--midi-key", action="store_true",
                    help="keep the MIDI's key/tuning instead of matching the recording")
    ap.add_argument("--transpose", type=int, help="force transposition in semitones")
    ap.add_argument("--tuning-cents", type=float, help="force SID tuning offset in cents (A=440 is 0)")
    ap.add_argument("--video", choices=["pal", "ntsc"], default="pal")
    ap.add_argument("--model", choices=["6581", "8580"], default="6581", help="SID model for preview + header")
    ap.add_argument("--load", type=_addr, default=0x1000, help="load/init address (default $1000; play = +3)")
    ap.add_argument("--zp", type=_addr, default=0xFB, help="zero-page pointer pair used during play (default $FB)")
    ap.add_argument("--no-loop", action="store_true", help="stop at the end instead of looping")
    ap.add_argument("--hard-restart", type=int, default=2, help="frames of hard restart before each note (0-3)")
    ap.add_argument("--dynamics", choices=["auto", "recording", "velocity", "none"], default="auto")
    ap.add_argument("--dyn-floor", type=int, default=8, help="lowest master volume used for dynamics (0-15)")
    ap.add_argument("--max-arp", type=int, default=4, help="max notes in an arpeggio chord (1 disables arps)")
    ap.add_argument("--no-compress", action="store_true")
    ap.add_argument("--keep-lead-in", action="store_true", help="keep the recording's leading silence")
    ap.add_argument("--instruments", help="JSON overrides per part name: preset/ad/sr/wave/pw/.../weight")
    ap.add_argument("--title", default=""); ap.add_argument("--author", default="")
    ap.add_argument("--released", default="")
    ap.add_argument("--anchors", help="JSON list of score anchors pinning MIDI bars to recording times, "
                    "e.g. [{\"bar\": 73, \"beat\": 3, \"recording_s\": 89.38}] (fermatas, tempo changes)")
    ap.add_argument("--edits", help="JSON of score corrections applied to a copy of the MIDI first "
                    "(move/resize/delete/add notes by bar and eighth; see midi2sid/edits.py)")
    ap.add_argument("--map", help="saved time map (a .report.json or {midi_s, recording_s, transpose, "
                    "tuning_cents}) to use instead of aligning; --anchors then only correct it locally")
    ap.add_argument("--anticipate-ms", type=float,
                    help="trigger notes this many ms early (default 40 with --audio, else 0)")
    ap.add_argument("--no-recover-runs", action="store_true",
                    help="don't add fast runs found in the recording but missing from the MIDI")
    ap.add_argument("--no-wav", action="store_true", help="skip the audio preview")
    args = ap.parse_args(argv)

    overrides = {}
    if args.instruments:
        with open(args.instruments) as f:
            overrides = json.load(f)
    anchors = []
    if args.anchors:
        with open(args.anchors) as f:
            anchors = json.load(f)
    out = args.out or args.midi.rsplit(".", 1)[0]
    midi, figures = args.midi, []
    if args.edits:
        from .edits import apply_edits, load_edits, split_edits
        note_edits, figures = split_edits(load_edits(args.edits))
        midi = out + ".edited.mid"
        summary = apply_edits(args.midi, note_edits, midi)
        print(f"applied {summary['edits']} score corrections -> {midi} "
              f"({summary['moved']} notes moved, {summary['resized']} resized, "
              f"{summary['deleted']} deleted, {summary['added']} added)")
    opt = Options(audio=args.audio, sync=args.sync, match_key=not args.midi_key,
                  transpose=args.transpose, tuning_cents=args.tuning_cents, video=args.video,
                  model=args.model, load_addr=args.load, zp=args.zp, loop=not args.no_loop,
                  hard_restart=args.hard_restart, dynamics=args.dynamics, dyn_floor=args.dyn_floor,
                  max_arp=max(1, args.max_arp), compress=not args.no_compress,
                  keep_lead_in=args.keep_lead_in, overrides=overrides, title=args.title,
                  author=args.author, released=args.released, render_wav=not args.no_wav,
                  recover_runs=not args.no_recover_runs, anchors=anchors, figures=figures)
    if args.map:
        opt.fixed_map, opt.fixed_key = load_map(args.map)
    if args.anticipate_ms is not None:
        opt.anticipate_s = args.anticipate_ms / 1000
    rep = convert(midi, out, opt)
    m = rep["memory"]
    print(f"wrote {out}.sid / .prg / .asm / .sync.json / .report.json" + ("" if args.no_wav else " / .wav"))
    print(f"  memory {m['load']}-{m['end']} ({m['total_bytes']} bytes: player {m['player_bytes']}, "
          f"song {m['song_bytes']} (raw {m['song_bytes_uncompressed']}))")
    print(f"  init {m['init']}  play {m['play']}  frame counter {m['frame_counter']}  zp {m['zero_page']}")
    a = rep["arrangement"]
    print(f"  arrangement: {a['pitch_onsets_heard_pct']}% of note onsets and {a['note_time_heard_pct']}% "
          f"of note-time audible on 3 voices; {a['arpeggio_seconds']} s of arpeggio")
    if "cpu" in rep:
        print(f"  cpu: max {rep['cpu']['max_cycles_per_frame']} cycles/frame "
              f"(~{rep['cpu']['max_rasterlines']} raster lines)")
    if "verification" in rep:
        v = rep["verification"]
        print(f"  6502 verification: {'OK' if v['ok'] else 'MISMATCH'} "
              f"({v['attacks_expected']} attacks, {v['attack_timing_mismatches']} timing mismatches)")
    if "alignment" in rep:
        al = rep["alignment"]
        tempo = f"tempo x{1 / al['scale']:.3f}, " if "scale" in al else "saved time map, "
        before = f"{al['onset_score_unaligned']} -> " if "onset_score_unaligned" in al else ""
        print(f"  recording: transpose {rep['transpose']:+d}, tuning {rep['tuning_cents']:+.1f} cents, "
              f"{tempo}onset match {before}{al['onset_score_final']}")
        print(f"  start the SID when the recording is at {rep.get('sid_starts_at_recording_s', 0)} s "
              f"to play them in sync")
    for r in rep.get("recovered_runs", []):
        print(f"  recovered run at {r['recording_s']:7.2f} s: {r['notes']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
