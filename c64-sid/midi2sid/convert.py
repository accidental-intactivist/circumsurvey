"""End-to-end conversion: MIDI (+ optional reference recording) -> .sid/.prg."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, replace

import numpy as np

from . import audio_align, compiler, emulate, instruments, psid
from .arranger import FNote, arrange, part_roles, salience
from .midi_in import load_midi
from .player import build_player, PAL_CLOCK, NTSC_CLOCK

# struck/plucked presets: seconds for a held note to fade (arranger weighting)
DECAYING = {"piano": 0.8, "pizzicato": 0.4, "harp": 0.8, "guitar": 0.8, "mallet": 0.6,
            "timpani": 0.8}

HELD_S = 1.0          # notes held this long (recording time) use the sustained variant

FPS = {"pal": 985248 / 19656, "ntsc": 1022727 / 17095}


@dataclass
class Options:
    audio: str | None = None
    sync: str = "auto"               # none | linear | dtw | auto (dtw if audio)
    match_key: bool = True           # follow the recording's key & tuning
    transpose: int | None = None     # force a transposition (semitones)
    tuning_cents: float | None = None
    video: str = "pal"
    model: str = "6581"
    load_addr: int = 0x1000
    zp: int = 0xFB
    loop: bool = True
    hard_restart: int = 2
    dynamics: str = "auto"           # none | recording | velocity | auto
    dyn_floor: int = 8
    max_arp: int = 4
    compress: bool = True
    keep_lead_in: bool = False       # keep the recording's leading silence
    lead_s: float | None = None      # SID frame 0 = this recording time (sections: the bar line)
    anticipate_s: float | None = None  # trigger notes this much early; default 0.04 s with --audio
                                       # (the SID's attack peaks later than an orchestra's measured onset)
    end_s: float | None = None       # tune length ends at this recording time (sections: next bar line)
    fixed_map: tuple | None = None   # (midi_s list, recording_s list): use this time map, skip alignment
    fixed_key: tuple | None = None   # (transpose, tuning semitones) to go with fixed_map
    straighten: bool = True          # fixed_map: steady tempo between bar lines / anchors
    overrides: dict = field(default_factory=dict)
    title: str = ""
    author: str = ""
    released: str = ""
    render_wav: bool = True
    recover_runs: bool = True        # add fast figures the MIDI lacks, found in the recording
    anchors: list = field(default_factory=list)   # score anchors: [{bar, beat|eighth, recording_s}]
    figures: list = field(default_factory=list)   # corrections to recovered figures: [{bar, notes}]
    verify: bool = True


def convert(midi_path, out_base, opt: Options):
    song = load_midi(midi_path)
    fps = FPS[opt.video]
    clock = PAL_CLOCK if opt.video == "pal" else NTSC_CLOCK
    report = {"input": os.path.relpath(midi_path), "output": os.path.relpath(out_base),
              "video": opt.video, "fps": round(fps, 4),
              "parts": [{"index": p.index, "name": p.name, "program": p.program,
                         "notes": len(p.notes), "drums": p.is_drum} for p in song.parts]}

    # ---- timing / key reference -----------------------------------------
    tmap = lambda t: t                                   # noqa: E731
    transpose, tuning = 0, 0.0
    feat = None
    if opt.audio and opt.fixed_map is not None:
        # time map supplied (e.g. a section cut from a whole-piece alignment)
        am_, ar_ = (np.asarray(x, float) for x in opt.fixed_map)
        pins = _resolve_anchors(song, opt.anchors)
        if pins:
            # score anchors on a fixed map are local corrections only: linear
            # between neighbouring pins, so fixing one passage never moves another
            am_, ar_ = audio_align.pin_map(am_, ar_, pins, fade_s=1.0, link_s=3.0)
        if opt.straighten:
            # an aligned map wobbles inside bars wherever the MIDI and the
            # recording differ (a note the reduction places on another eighth
            # pulls its neighbours); an orchestra's eighths within a bar are
            # far more even than that, so keep the bar lines (and the anchors)
            # and run straight between them
            grid = sorted({t for t, _, bt in song.beat_times() if bt == 1} | {m for m, _ in pins})
            am_, ar_ = audio_align.straighten_map(am_, ar_, grid)
        tm = audio_align.TimeMap(1.0, 0.0, (am_, ar_))
        y = audio_align.decode_audio(opt.audio)
        feat = audio_align.audio_features(y)
        tmap = tm
        transpose, tuning = opt.fixed_key if opt.fixed_key else (0, 0.0)
        report["alignment"] = {"method": "fixed (from whole-piece alignment)",
                               "onset_score_final": round(audio_align.onset_score(
                                   [n for n in song.notes if not n.is_drum], tm, feat["flux"]), 3),
                               "anchors_midi_s": [round(float(x), 3) for x in am_],
                               "anchors_recording_s": [round(float(x), 3) for x in ar_]}
    elif opt.audio:
        use_dtw = opt.sync in ("dtw", "auto")
        pins = _resolve_anchors(song, opt.anchors)
        tm, feat, info, key = audio_align.align(song.notes, song.length, opt.audio, use_dtw=use_dtw,
                                                transpose=opt.transpose, pins=pins,
                                                beat_times=song.beat_times())
        if pins:
            info["score_anchors"] = [{"midi_s": round(m, 3), "recording_s": r} for m, r in pins]
        report["alignment"] = info
        if tm.anchors is not None:
            report["alignment"]["anchors_midi_s"] = [round(float(x), 3) for x in tm.anchors[0]]
            report["alignment"]["anchors_recording_s"] = [round(float(x), 3) for x in tm.anchors[1]]
        if opt.sync != "none":
            tmap = tm
        if opt.match_key:
            transpose = key["transpose"]
            tuning = key["tuning"]
    if opt.transpose is not None:
        transpose = opt.transpose
    if opt.tuning_cents is not None:
        tuning = opt.tuning_cents / 100
    report["transpose"] = transpose
    report["tuning_cents"] = round(tuning * 100, 1)

    slur_pred = {}
    if opt.audio and opt.recover_runs and opt.sync != "none":
        tmap = _recover_runs(song, opt.audio, tmap, transpose, tuning, slur_pred, report,
                             flux=feat["flux"] if feat is not None else None,
                             adjust_map=opt.fixed_map is None, figures=opt.figures)
        if getattr(tmap, "anchors", None) is not None:
            report["alignment"]["anchors_midi_s"] = [round(float(x), 3) for x in tmap.anchors[0]]
            report["alignment"]["anchors_recording_s"] = [round(float(x), 3) for x in tmap.anchors[1]]

    mapped = [(n, tmap(n.start), tmap(n.end)) for n in song.notes]
    t_first = min(s for _, s, _ in mapped)
    lead = opt.lead_s if opt.lead_s is not None else (0.0 if opt.keep_lead_in else t_first)
    report["sid_starts_at_recording_s" if opt.audio else "sid_starts_at_midi_s"] = round(lead, 3)

    # ---- instruments & roles --------------------------------------------
    insts, part_inst, drum_inst = instruments.build_instruments(song, fps, opt.overrides)
    nbp = {}
    for n in song.notes:
        nbp.setdefault(n.track, []).append(n)
    roles, _ = part_roles(song, nbp)
    for p in song.parts:
        if p.name == RUNS_PART:
            roles[p.index] = ("runs", 1.5)
    for pi, (role, w) in list(roles.items()):
        ov = opt.overrides.get(song.parts[pi].name) or opt.overrides.get(str(pi)) or {}
        if "weight" in ov:
            roles[pi] = (ov.get("role", role), float(ov["weight"]))
    report["roles"] = {song.parts[i].name: {"role": r, "weight": w} for i, (r, w) in roles.items()}
    report["instruments"] = [i.to_json() for i in insts]

    # melodic motion: a note repeating the previous pitch of its part (pedal
    # tones, repeated chords) matters less than one that moves the line
    motion = {}
    last = {}
    for n in sorted(song.notes, key=lambda n: (n.start, n.pitch)):
        prev = last.get(n.track)
        repeat = prev and prev[0] == n.pitch and n.start - prev[1] < 0.6
        # long repeated notes are pedal tones: first to go when voices run out
        motion[n.id] = (0.45 if n.end - n.start > 1.0 else 0.7) if repeat else 1.0
        if prev is None or n.start > prev[2] - 1e-6 or n.pitch >= prev[0]:
            last[n.track] = (n.pitch, n.end, n.start)
    # held notes (fermatas, long chords) on struck/plucked sounds: a piano
    # envelope would die away under a held orchestral chord, so long notes
    # use a sustained variant of the part's instrument; the recording's
    # loudness (master volume) then shapes the swell
    held_inst = {}
    for pi, ii in list(part_inst.items()):
        base = insts[ii]
        if base.name.split(":")[0] in DECAYING:
            held_inst[ii] = len(insts)
            insts.append(replace(base, name="held:" + base.name, ad=0x28, sr=0xC9, pw_speed=12, table=[]))
    fnotes = []
    adv = opt.anticipate_s if opt.anticipate_s is not None else (ANTICIPATE_S if opt.audio else 0.0)
    report["anticipate_s"] = adv
    for n, s, e in mapped:
        if s < lead - 1e-6:
            continue
        f0 = max(0, int(round((s - lead - adv) * fps)))
        f1 = int(round((e - lead - adv) * fps))
        f1 = max(f1, f0 + 1)
        if n.is_drum:
            key = instruments.drum_preset(n.pitch)
            inst = drum_inst[key]
            f1 = f0 + max(len(insts[inst].table) + 3, 5)
            pitch = 60
        else:
            inst = part_inst[n.track]
            pitch = n.pitch + transpose
        if inst in held_inst and e - s >= HELD_S:
            inst = held_inst[inst]
        fn = FNote(n.id, f0, f1, pitch, n.track, inst, is_drum=n.is_drum, vel=n.velocity)
        kind = insts[inst].name.split(":")[0]
        fn.decay = int((HELD_DECAY_S if kind == "held" else DECAYING.get(kind, 0)) * fps)
        fn.pred = slur_pred.get(n.id)
        fn.sal = (salience(fn, roles.get(n.track, ("", 1.0))[1], fps) * (0.85 + 0.3 * n.velocity / 127)
                  * motion[n.id])
        fnotes.append(fn)
    report["instruments"] = [i.to_json() for i in insts]
    report["rolled_chord_notes_joined"] = _join_rolled_chords(fnotes, _ornament_ids(song))
    report["slurred_steps"] = _slur_steps(fnotes, fps)
    report["inner_bass_part_notes"] = _demote_inner_bass_notes(fnotes, roles)
    report["inner_melody_part_notes"] = _demote_inner_melody_notes(fnotes, roles)
    fnotes, report["unisons_merged"] = _merge_unisons(fnotes)
    n_frames = max(n.f1 for n in fnotes) + int(0.5 * fps)
    if opt.end_s is not None:                # exact length, so sections chain seamlessly
        n_frames = int(round((opt.end_s - lead) * fps))
        fnotes = [n for n in fnotes if n.f0 < n_frames]
        for n in fnotes:
            n.f1 = min(n.f1, n_frames)
    # dynamics first: a note that enters softly (the orchestra's p entries)
    # gets the sustained variant with its gentler attack instead of the hammer
    vols = _dynamics(opt, feat, fps, n_frames, lead, fnotes)
    soft = 0
    for n in fnotes:
        if n.inst in held_inst and 0 <= n.f0 < n_frames and vols[n.f0] <= SOFT_VOL:
            n.inst = held_inst[n.inst]
            n.decay = int(HELD_DECAY_S * fps)
            soft += 1
    report["soft_entries"] = soft
    arr = arrange(fnotes, n_frames, roles, fps, max_arp=opt.max_arp)
    report["short_resumes_dropped"] = _drop_short_resumes(arr, fnotes)
    arr.stats.update(_coverage(fnotes, arr, n_frames))
    report["arrangement"] = arr.stats
    report["frames"] = n_frames
    report["duration_s"] = round(n_frames / fps, 3)

    report["dynamics"] = _dyn_mode(opt, feat)

    # ---- compile ----------------------------------------------------------
    streams = [compiler.compile_voice(arr.voices[v], n_frames, opt.hard_restart) for v in range(3)]
    streams.append(compiler.compile_global(vols, n_frames))
    items = compiler.compress(streams, enabled=opt.compress)
    assert compiler.expand(items) == streams          # lossless
    code, asm = build_player(opt.load_addr, insts, items, clock=clock, tuning=tuning, zp=opt.zp,
                             loop=opt.loop,
                             layout_fn=lambda addr: compiler.layout(items, addr, loop=opt.loop))
    raw = sum(sum(t.size() for t in s) + 3 for s in streams)
    labels = asm.labels
    report["memory"] = {
        "load": f"${opt.load_addr:04X}", "end": f"${opt.load_addr + len(code) - 1:04X}",
        "total_bytes": len(code), "player_bytes": labels["sidoff"] - opt.load_addr,
        "song_bytes": opt.load_addr + len(code) - labels["song"],
        "song_bytes_uncompressed": raw,
        "init": f"${opt.load_addr:04X}", "play": f"${opt.load_addr + 3:04X}",
        "frame_counter": f"${labels['frame_lo']:04X}", "zero_page": f"${opt.zp:02X}-${opt.zp + 1:02X}",
    }
    if opt.load_addr + len(code) > 0xD000:
        raise ValueError("song does not fit below $D000; lower --load or shorten the song")

    os.makedirs(os.path.dirname(os.path.abspath(out_base)), exist_ok=True)
    title = opt.title or os.path.splitext(os.path.basename(midi_path))[0]
    psid.write_psid(out_base + ".sid", code, opt.load_addr, opt.load_addr, opt.load_addr + 3,
                    title, opt.author, opt.released, opt.video, opt.model)
    psid.write_prg(out_base + ".prg", code, opt.load_addr)
    with open(out_base + ".asm", "w") as f:
        f.write(asm.listing)
    with open(out_base + ".sync.json", "w") as f:
        json.dump(_sync_points(song, tmap, lead, fps), f)

    # ---- run the real 6502 code: verify + render ---------------------------
    if opt.verify or opt.render_wav:
        iw, fw, cycles = emulate.run(code, opt.load_addr, opt.load_addr, opt.load_addr + 3,
                                     n_frames, opt.video)
        report["cpu"] = {"max_cycles_per_frame": int(max(cycles)),
                         "avg_cycles_per_frame": int(np.mean(cycles)),
                         "max_rasterlines": round(max(cycles) / (63 if opt.video == "pal" else 65), 1)}
        if opt.verify:
            report["verification"] = verify(fw, streams, n_frames)
        if opt.render_wav:
            pcm = emulate.render(iw, fw, opt.video, opt.model)
            emulate.write_wav(out_base + ".wav", pcm)
    with open(out_base + ".report.json", "w") as f:
        json.dump(report, f, indent=2, default=_json_default)
    # compiled parts, for building several tunes into one player (bundle.py)
    report["_build"] = {"insts": insts, "streams": streams, "tuning": tuning, "clock": clock,
                        "n_frames": n_frames, "title": title}
    return report


ROLL_FRAMES = 8
SOFT_VOL = 10            # master volume at or below which a struck note enters with the sustained variant


def _dyn_mode(opt, feat):
    dyn = opt.dynamics
    if dyn == "auto":
        dyn = "recording" if feat is not None else "velocity"
    return dyn


def _dynamics(opt, feat, fps, n_frames, lead, fnotes):
    """Master-volume curve (0-15 per frame) from the recording's loudness,
    the MIDI velocities, or flat."""
    dyn = _dyn_mode(opt, feat)
    if dyn == "recording" and feat is not None:
        return audio_align.dynamics_curve(feat, fps, n_frames, time_offset=lead, floor=opt.dyn_floor)
    if dyn == "velocity":
        return _velocity_curve(fnotes, n_frames, fps, opt.dyn_floor)
    return np.full(n_frames, 15)
# Measured on the Huckleberry Finn example: SID notes triggered 40 ms ahead of
# the recording's onsets line up best with it (onset correlation 0.20 -> 0.46);
# the SID's attack is heard later than an orchestra's measured onset.
ANTICIPATE_S = 0.04


def _ornament_ids(song):
    """Notes written off the 16th-note grid (a third or two thirds into a
    beat): the grace notes and rolled-chord notes of a piano reduction."""
    if not song.notes or not song.ticks_per_beat:
        return set()
    num, den = (song.time_sigs[0][1], song.time_sigs[0][2]) if song.time_sigs else (4, 4)
    q = song.ticks_per_beat * 4 / den / 4
    return {n.id for n in song.notes
            if not n.is_drum and min(n.start_tick % q, q - n.start_tick % q) > 0.12 * q}


def _join_rolled_chords(fnotes, ornaments, roll=ROLL_FRAMES):
    """A rolled chord or a grace-note figure in a piano reduction (a short
    bass note, then chord tones a third and two thirds of a beat later)
    becomes one block chord that rings as long as its longest note.  Played
    as written, the bass voice hops through the roll and the bass is gone
    after a frame or two, where the orchestra holds it."""
    joined = 0
    by_part = {}
    for n in fnotes:
        if not n.is_drum:
            by_part.setdefault(n.part, []).append(n)
    for ns in by_part.values():
        ns.sort(key=lambda n: (n.f0, n.pitch))
        group = []
        for n in ns:
            if n.id in ornaments and group and n.f0 - group[0].f0 <= roll:
                group.append(n)
                continue
            if len(group) > 1:
                joined += _block(group)
            group = [n] if n.id not in ornaments else []
        if len(group) > 1:
            joined += _block(group)
    return joined


def _block(group):
    f0 = group[0].f0
    head = [g for g in group if g.f0 == f0]
    f1 = max(g.f1 for g in group)
    for g in group:
        g.f0, g.f1 = f0, f1
    return len(group) - len(head)


# a held chord (sustained variant) still matters less as it goes on: after a
# couple of seconds a new melody note should win a voice over a pad tone
HELD_DECAY_S = 2.0


def _demote_inner_bass_notes(fnotes, roles):
    """The bass role's extra weight belongs to the bass line: the part's
    lowest sounding note.  Chord tones the same hand holds above it (a
    left-hand chord in a piano reduction) are weighed like any chord tone,
    so they don't keep the melody off the voices."""
    bass_parts = {p for p, (role, _) in roles.items() if role == "bass"}
    chords_w = 0.8
    demoted = 0
    by_part = {}
    for n in fnotes:
        if n.part in bass_parts and not n.is_drum:
            by_part.setdefault(n.part, []).append(n)
    for p, ns in by_part.items():
        w = roles[p][1]
        for n in ns:
            if any(o is not n and o.pitch < n.pitch and o.f0 <= n.f0 < o.f1 for o in ns):
                n.sal *= chords_w / w
                demoted += 1
    return demoted


def _demote_inner_melody_notes(fnotes, roles, chords_w=0.8):
    """Likewise the melody role's weight belongs to the top note of each
    chord the part strikes: the tones struck under it (the harmony a piano
    reduction puts in the right hand) are weighed like any chord tone, so a
    held inner tone does not keep a bass or timpani entry off the voices.  A
    note that enters alone under a held higher note is a moving line and
    keeps the melody weight."""
    melody_parts = {p for p, (role, _) in roles.items() if role == "melody"}
    demoted = 0
    by_onset = {}
    for n in fnotes:
        if n.part in melody_parts and not n.is_drum:
            by_onset.setdefault((n.part, n.f0), []).append(n)
    for (p, _), ns in by_onset.items():
        top = max(n.pitch for n in ns)
        for n in ns:
            if n.pitch < top:
                n.sal *= chords_w / roles[p][1]
                demoted += 1
    return demoted


def _slur_steps(fnotes, fps, max_step=2):
    """A single note of a part that starts as the part's previous onset ends
    (no rest; the previous onset's top note, so a melody note after a chord
    counts) and moves by a step is slurred to it: the voice glides to the
    new pitch without re-attacking, as a wind or string player would, instead
    of a hard restart and a fresh hammer on every eighth of a melody.  The
    two are made contiguous (a 1-frame rounding gap would free the voice for
    a frame and lose the slur).  Repeated pitches and leaps keep their
    attacks."""
    by_part = {}
    for n in fnotes:
        if not n.is_drum and n.pred is None:
            by_part.setdefault(n.part, {}).setdefault(n.f0, []).append(n)
    count = 0
    for onsets in by_part.values():
        frames = sorted(onsets)
        for a, b in zip(frames, frames[1:]):
            if len(onsets[b]) != 1:
                continue
            m, n = max(onsets[a], key=lambda x: x.pitch), onsets[b][0]
            if not (-1 <= n.f0 - m.f1 <= 1) or n.pred is not None:
                continue
            m.f1 = n.f0            # contiguous even without a slur: no 1-frame hole for another note to fill
            if 0 < abs(n.pitch - m.pitch) <= max_step:
                n.pred = m.id
                count += 1
    return count


def _merge_unisons(fnotes):
    """The same pitch struck twice at once (a doubled chord tone, often one
    copy much shorter) is one note on a SID: keep the longest, with the
    higher salience, so no voice is spent on a 1-frame duplicate."""
    best = {}
    out = []
    for n in fnotes:
        if n.is_drum:
            out.append(n)
            continue
        k = (n.f0, n.pitch)
        if k in best:
            b = best[k]
            b.f1, b.sal = max(b.f1, n.f1), max(b.sal, n.sal)
            continue
        best[k] = n
        out.append(n)
    return out, len(fnotes) - len(out)


def _drop_short_resumes(arr, fnotes, min_frames=10):
    """A voice that is free for a moment should not pick up a note that is
    already sounding elsewhere if it must leave it again within a few
    frames: after the 2-frame hard restart only a blip is heard, and a
    chord tone that pops up for a fifth of a second between two melody
    notes jumbles the line."""
    by_id = {n.id: n for n in fnotes}
    dropped = 0
    for evs in arr.voices:
        for k, e in enumerate(evs):
            if e.kind != "attack" or not e.ids:
                continue
            if min(by_id[i].f0 for i in e.ids if i in by_id) >= e.frame:
                continue                                  # a new note: keep it
            nxt = next((x for x in evs[k + 1:] if x.frame > e.frame), None)
            if nxt is not None and nxt.kind != "legato" and nxt.frame - e.frame < min_frames:
                evs[k] = type(e)(e.frame, "off")
                dropped += 1
    return dropped


def _quantize_figure(notes, beat_times):
    """Snap a recovered figure's notes (MIDI time) to the half-beat grid
    (16ths in 6/8), keeping their order.  Transcribed onsets jitter by
    15-45 ms around the beat, which sounds like notes firing late.  Figures
    faster than the grid (flourishes) are left as transcribed."""
    if len(notes) < 2:
        return
    bts = [t for t, _, _ in beat_times]
    import bisect

    def grid_near(t):
        i = max(0, min(len(bts) - 2, bisect.bisect_right(bts, t) - 1))
        step = (bts[i + 1] - bts[i]) / 2
        k = round((t - bts[i]) / step)
        return bts[i] + k * step, step
    ioi = [b.start - a.start for a, b in zip(notes, notes[1:])]
    _, step = grid_near(notes[0].start)
    if sorted(ioi)[len(ioi) // 2] < 0.6 * step:
        return
    prev = None
    for n in notes:
        q, step = grid_near(n.start)
        if prev is not None and q <= prev + 1e-6:
            q = prev + step
        shift = q - n.start
        n.start, n.end = q, n.end + shift
        prev = q
    for a, b in zip(notes, notes[1:]):           # the figure stays legato
        a.end = b.start
    if notes[-1].end <= notes[-1].start:
        notes[-1].end = notes[-1].start + 0.05


def _resolve_anchors(song, anchors):
    """[{bar, beat (or eighth), recording_s} | {midi_s, recording_s}] -> [(midi_s, rec_s)].
    Beats count the time signature's beat unit (eighths in 6/8), starting at 1."""
    pins = []
    beats = song.beat_times()
    for a in anchors or []:
        if "midi_s" in a:
            m = float(a["midi_s"])
        else:
            bar, beat = int(a["bar"]), float(a.get("beat", a.get("eighth", 1)))
            row = [t for t, b, bt in beats if b == bar]
            if not row:
                raise ValueError(f"anchor bar {bar} is outside the MIDI")
            step = row[1] - row[0] if len(row) > 1 else 0.0
            m = row[0] + (beat - 1) * step
        pins.append((m, float(a["recording_s"])))
    return sorted(pins)


RUNS_PART = "Flute runs (from recording)"


def _recover_runs(song, audio, tmap, transpose, tuning, slur_pred, report, flux=None, adjust_map=True,
                  figures=()):
    """Transcribe fast runs the MIDI lacks from the recording and add them to
    the song as an extra part (MIDI time, MIDI key).  With adjust_map the
    figures also pin the time map where they land; a fixed map is kept."""
    from . import recover
    from .midi_in import Note, Part
    y = audio_align.decode_audio(audio)
    mapped = [(tmap(n.start), tmap(n.end), n.pitch + transpose) for n in song.notes if not n.is_drum]
    found = recover.recover_runs(y, tuning, transpose, mapped)
    found = _override_figures(song, tmap, transpose, found, figures, report)
    if not found:
        report["recovered_runs"] = []
        return tmap
    if adjust_map:
        tmap = _landing_anchors(song, tmap, found, report)
    if adjust_map and flux is not None and getattr(tmap, "anchors", None) is not None and report.get("landing_anchors"):
        # with the figures pinned, neighbouring onsets are now within reach:
        # one more snapping pass settles the bars around them
        notes = [n for n in song.notes if not n.is_drum]
        am2, aa2, _ = audio_align.snap_onsets(notes, *tmap.anchors, flux)
        for a in report["landing_anchors"]:                 # keep the pins
            k = int(np.argmin(np.abs(am2 - a["midi_s"])))
            if abs(am2[k] - a["midi_s"]) < 1e-3:
                aa2[k] = a["recording_s"]
        tmap = audio_align.TimeMap(tmap.scale, tmap.offset, (am2, audio_align.clamp_tempo(am2, aa2)))
    # recording time -> MIDI time (the map is monotone: invert by sampling)
    grid = np.linspace(-5, song.length + 5, 20000)
    rec = np.array([tmap(t) for t in grid])
    inv = lambda a: float(np.interp(a, rec, grid))       # noqa: E731
    part = Part(len(song.parts), RUNS_PART, 73, False)
    nid = max(n.id for n in song.notes) + 1
    prev = None
    figs = []
    fig_notes = []
    for a, b, p, sc, slurred in found:
        n = Note(nid, inv(a), inv(b), p, 100, part.index, 73)
        part.notes.append(n)
        if slurred and prev is not None:
            slur_pred[nid] = prev
        else:
            figs.append({"recording_s": round(a, 2), "notes": []})
            fig_notes.append([])
        figs[-1]["notes"].append(p + transpose)
        fig_notes[-1].append(n)
        prev = nid
        nid += 1
    beats = song.beat_times()
    for ns in fig_notes:
        _quantize_figure(ns, beats)
    song.parts.append(part)
    song.notes = sorted(song.notes + part.notes, key=lambda n: (n.start, -n.pitch))
    names = "C C# D Eb E F F# G Ab A Bb B".split()
    report["recovered_runs"] = [{"recording_s": f["recording_s"],
                                 "notes": " ".join(names[q % 12] + str(q // 12 - 1) for q in f["notes"])}
                                for f in figs]
    return tmap


_NAMES = {n: i for i, n in enumerate("C C# D Eb E F F# G Ab A Bb B".split())}
_NAMES.update({"Db": 1, "D#": 3, "Gb": 6, "G#": 8, "A#": 10, "Cb": 11, "E#": 5, "Fb": 4, "B#": 0})


def _pitch(name):
    """'Eb6' -> 87 (C4 = 60)."""
    if isinstance(name, int):
        return name
    i = 1 + (name[1] in "#b")
    return 12 * (int(name[i:]) + 1) + _NAMES[name[:i]]


def _override_figures(song, tmap, transpose, found, figures, report):
    """Replace (or add) the grace-note figure that lands on a bar's downbeat
    with the notes given in a `figures` entry [{bar, notes, eighth?}]: the
    transcription from the recording can pick a neighbouring instrument's
    line.  Notes are written in the recording's key (as the transcription
    reports them); the last one lands on the beat, the others precede it a
    sixteenth apart, slurred."""
    if not figures:
        return found
    beats = song.beat_times()
    out = list(found)
    applied = []
    for fig in figures:
        bar, beat = int(fig["bar"]), float(fig.get("eighth", fig.get("beat", 1)))
        row = [t for t, b, _ in beats if b == bar]
        if not row:
            raise ValueError(f"figure bar {bar} is outside the MIDI")
        step = row[1] - row[0] if len(row) > 1 else 0.5
        m_land = row[0] + (beat - 1) * step
        land = tmap(m_land)
        sixteenth = (tmap(m_land + step) - land) / 2
        # drop recovered figures landing on this beat (last note of a slurred group)
        groups, cur = [], []
        for item in out:
            if item[4] and cur:
                cur.append(item)
            else:
                if cur:
                    groups.append(cur)
                cur = [item]
        if cur:
            groups.append(cur)
        out = [it for g in groups for it in g if abs(g[-1][0] - land) > 0.3]
        pitches = [_pitch(n) - transpose for n in fig["notes"]]
        n = len(pitches)
        for k, p in enumerate(pitches):
            a = land - (n - 1 - k) * sixteenth
            b = a + (sixteenth if k < n - 1 else 3 * sixteenth)
            out.append((a, b, p, 1.0, k > 0))
        applied.append({"bar": bar, "recording_s": round(land, 2), "notes": list(fig["notes"])})
    out.sort(key=lambda it: it[0])
    report["figure_corrections"] = applied
    return out


def _landing_anchors(song, tmap, found, report, reach=0.45, fade_s=2.0):
    """Fast figures (grace-note runs, scales) land on an accented chord.
    Pin the nearest multi-note MIDI chord to where each recovered figure
    lands, one-to-one and in order, fading the correction out within about
    a bar on either side."""
    if getattr(tmap, "anchors", None) is None:
        return tmap
    am, aa = (np.array(x, float) for x in tmap.anchors)
    clusters = {}
    for n in song.notes:
        if not n.is_drum:
            clusters.setdefault(round(n.start, 3), []).append(n)
    chords = sorted(t for t, ns in clusters.items() if len({n.pitch for n in ns}) >= 3)
    if not chords:
        return tmap
    ch_rec = np.array([tmap(t) for t in chords])
    landings = []
    for i, (a, b, p, sc, slurred) in enumerate(found):
        nxt_slurred = i + 1 < len(found) and found[i + 1][4]
        if not nxt_slurred:
            landings.append(a)                       # start of the figure's last note
    # only a regular series (3+ figures, 0.4-1.6 s apart, e.g. one per bar)
    # is trusted as an anchor; isolated flourishes are left alone
    series, cur = [], [landings[0]] if landings else []
    for x in landings[1:]:
        if 0.4 <= x - cur[-1] <= 1.6:
            cur.append(x)
        else:
            series.append(cur)
            cur = [x]
    if cur:
        series.append(cur)
    landings = [x for sr in series if len(sr) >= 3 for x in sr]
    pairs, used, last_midi = [], set(), -1e9
    for land in landings:
        cand = [j for j in range(len(chords)) if abs(ch_rec[j] - land) <= reach
                and j not in used and chords[j] > last_midi]
        if not cand:
            continue
        j = min(cand, key=lambda jj: abs(ch_rec[jj] - land))
        used.add(j)
        last_midi = chords[j]
        pairs.append((chords[j], land))
    if not pairs:
        return tmap
    pts_m, pts_d = [pairs[0][0] - fade_s], [0.0]
    for k, (mt, land) in enumerate(pairs):
        if k and mt - pairs[k - 1][0] > 2 * fade_s:
            pts_m += [pairs[k - 1][0] + fade_s, mt - fade_s]
            pts_d += [0.0, 0.0]
        pts_m.append(mt)
        pts_d.append(land - tmap(mt))
    pts_m.append(pairs[-1][0] + fade_s)
    pts_d.append(0.0)
    grid = np.union1d(am, np.array(pts_m))
    grid = grid[np.concatenate([[True], np.diff(grid) > 1e-3])]     # merge near-duplicates
    new_a = np.interp(grid, am, aa) + np.interp(grid, pts_m, pts_d, left=0.0, right=0.0)
    new_a = audio_align.clamp_tempo(grid, new_a)
    report["landing_anchors"] = [{"midi_s": round(m, 3), "recording_s": round(r, 3),
                                  "moved_ms": round(1000 * (r - tmap(m)))} for m, r in pairs]
    return audio_align.TimeMap(tmap.scale, tmap.offset, (grid, new_a))


def _json_default(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    raise TypeError(type(o))


def _velocity_curve(fnotes, n_frames, fps, floor):
    """Master volume following MIDI velocities (flat 15 if the file has none)."""
    vels = [n.vel for n in fnotes if not n.is_drum]
    if not vels or max(vels) - min(vels) < 8:
        return np.full(n_frames, 15)
    acc = np.zeros(n_frames)
    cnt = np.zeros(n_frames)
    for n in fnotes:
        acc[n.f0:n.f1] += n.vel
        cnt[n.f0:n.f1] += 1
    mean = np.where(cnt > 0, acc / np.maximum(cnt, 1), np.nan)
    idx = np.arange(n_frames)
    ok = ~np.isnan(mean)
    mean = np.interp(idx, idx[ok], mean[ok])
    w = max(1, int(0.4 * fps))
    mean = np.convolve(np.pad(mean, w, mode="edge"), np.ones(2 * w + 1) / (2 * w + 1), mode="valid")
    return np.clip(np.round(floor + (15 - floor) * mean / max(vels)), floor, 15).astype(int)


def _coverage(fnotes, arr, n_frames):
    """How much of the MIDI piano roll is audible on the 3 voices."""
    sounding = [dict() for _ in range(3)]
    heard_onsets = 0
    roll = {}
    for v in range(3):
        evs = arr.voices[v] + [type(arr.voices[v][0])(n_frames, "off")] if arr.voices[v] else []
        for a, b in zip(evs, evs[1:]):
            if a.kind == "off":
                continue
            for f in range(a.frame, b.frame):
                roll.setdefault(f, set()).update(a.notes)
    uniq = {}
    for n in fnotes:
        if not n.is_drum:
            uniq[(n.f0, n.pitch)] = n
    for (f0, p), n in uniq.items():
        if p in roll.get(f0, ()) or p in roll.get(f0 + 1, ()):
            heard_onsets += 1
    cells = heard = 0
    for n in fnotes:
        if n.is_drum:
            continue
        for f in range(n.f0, n.f1):
            cells += 1
            if n.pitch in roll.get(f, ()):
                heard += 1
    return {"pitch_onsets_heard_pct": round(100 * heard_onsets / max(1, len(uniq)), 1),
            "note_time_heard_pct": round(100 * heard / max(1, cells), 1)}


def _sync_points(song, tmap, lead, fps):
    beats = []
    for sec, bar, beat in song.beat_times():
        f = int(round((tmap(sec) - lead) * fps))
        if f >= 0:
            beats.append({"frame": f, "bar": bar, "beat": beat})
    markers = [{"frame": int(round((tmap(s) - lead) * fps)), "text": t} for s, t in song.markers]
    return {"fps": fps, "beats": beats, "markers": markers}


def verify(frame_writes, streams, n_frames):
    """Replay the byte-code in Python and check the 6502 output frame by frame:
    gate on/off timing and the attack frames must match exactly."""
    expected = [[] for _ in range(3)]      # per voice: list of (frame, 'on'/'off'/'attack')
    for v in range(3):
        f = 0
        for t in streams[v]:
            if t.dur is None:
                continue
            if t.op <= compiler.NOTE_MAX or t.op == compiler.ARPN:
                expected[v].append((f, "attack"))
            elif t.op in (compiler.OFF, compiler.HR):
                expected[v].append((f, "off"))
            f += t.dur
    got = [[] for _ in range(3)]
    gate = [0, 0, 0]
    for fi, writes in enumerate(frame_writes):
        for _, reg, val in writes:
            if reg in (4, 11, 18):
                v = reg // 7
                g = val & 1
                if g and not gate[v]:
                    got[v].append((fi, "attack"))
                elif not g and gate[v]:
                    got[v].append((fi, "off"))
                gate[v] = g
    # the first play call is frame 0 of the song
    mism = 0
    for v in range(3):
        e_att = [f for f, k in expected[v] if k == "attack"]
        g_att = [f for f, k in got[v] if k == "attack"]
        mism += len(set(e_att) ^ set(g_att))
    return {"attacks_expected": sum(1 for v in range(3) for _, k in expected[v] if k == "attack"),
            "attack_timing_mismatches": mism, "ok": mism == 0}


def load_map(path):
    """A saved time map: a report JSON (its alignment) or {midi_s, recording_s,
    transpose, tuning_cents}.  Returns ((midi_s, recording_s), (transpose, tuning))."""
    with open(path) as f:
        d = json.load(f)
    al = d.get("alignment", d)
    am = al.get("anchors_midi_s", al.get("midi_s"))
    ar = al.get("anchors_recording_s", al.get("recording_s"))
    return (list(am), list(ar)), (int(d.get("transpose", 0)), float(d.get("tuning_cents", 0.0)) / 100)
