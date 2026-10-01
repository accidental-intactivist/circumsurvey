"""End-to-end conversion: MIDI (+ optional reference recording) -> .sid/.prg."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field

import numpy as np

from . import audio_align, compiler, emulate, instruments, psid
from .arranger import FNote, arrange, part_roles, salience
from .midi_in import load_midi
from .player import build_player, PAL_CLOCK, NTSC_CLOCK

# struck/plucked presets: seconds for a held note to fade (arranger weighting)
DECAYING = {"piano": 0.8, "pizzicato": 0.4, "harp": 0.8, "guitar": 0.8, "mallet": 0.6,
            "timpani": 0.8}

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
    overrides: dict = field(default_factory=dict)
    title: str = ""
    author: str = ""
    released: str = ""
    render_wav: bool = True
    recover_runs: bool = True        # add fast figures the MIDI lacks, found in the recording
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
    if opt.audio:
        use_dtw = opt.sync in ("dtw", "auto")
        tm, feat, info, key = audio_align.align(song.notes, song.length, opt.audio, use_dtw=use_dtw,
                                                transpose=opt.transpose)
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
                             flux=feat["flux"] if feat is not None else None)
        if getattr(tmap, "anchors", None) is not None:
            report["alignment"]["anchors_midi_s"] = [round(float(x), 3) for x in tmap.anchors[0]]
            report["alignment"]["anchors_recording_s"] = [round(float(x), 3) for x in tmap.anchors[1]]

    mapped = [(n, tmap(n.start), tmap(n.end)) for n in song.notes]
    t_first = min(s for _, s, _ in mapped)
    lead = 0.0 if opt.keep_lead_in else t_first
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
    fnotes = []
    for n, s, e in mapped:
        f0 = int(round((s - lead) * fps))
        f1 = int(round((e - lead) * fps))
        if f0 < 0:
            continue
        f1 = max(f1, f0 + 1)
        if n.is_drum:
            key = instruments.drum_preset(n.pitch)
            inst = drum_inst[key]
            f1 = f0 + max(len(insts[inst].table) + 3, 5)
            pitch = 60
        else:
            inst = part_inst[n.track]
            pitch = n.pitch + transpose
        fn = FNote(n.id, f0, f1, pitch, n.track, inst, is_drum=n.is_drum, vel=n.velocity)
        fn.decay = int(DECAYING.get(insts[inst].name.split(":")[0], 0) * fps)
        fn.pred = slur_pred.get(n.id)
        fn.sal = (salience(fn, roles.get(n.track, ("", 1.0))[1], fps) * (0.85 + 0.3 * n.velocity / 127)
                  * motion[n.id])
        fnotes.append(fn)
    n_frames = max(n.f1 for n in fnotes) + int(0.5 * fps)
    arr = arrange(fnotes, n_frames, roles, fps, max_arp=opt.max_arp)
    arr.stats.update(_coverage(fnotes, arr, n_frames))
    report["arrangement"] = arr.stats
    report["frames"] = n_frames
    report["duration_s"] = round(n_frames / fps, 3)

    # ---- dynamics -> master volume --------------------------------------
    dyn = opt.dynamics
    if dyn == "auto":
        dyn = "recording" if feat is not None else "velocity"
    if dyn == "recording" and feat is not None:
        vols = audio_align.dynamics_curve(feat, fps, n_frames, time_offset=lead, floor=opt.dyn_floor)
    elif dyn == "velocity":
        vols = _velocity_curve(fnotes, n_frames, fps, opt.dyn_floor)
    else:
        vols = np.full(n_frames, 15)
    report["dynamics"] = dyn

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
    return report


RUNS_PART = "Flute runs (from recording)"


def _recover_runs(song, audio, tmap, transpose, tuning, slur_pred, report, flux=None):
    """Transcribe fast runs the MIDI lacks from the recording and add them to
    the song as an extra part (MIDI time, MIDI key)."""
    from . import recover
    from .midi_in import Note, Part
    y = audio_align.decode_audio(audio)
    mapped = [(tmap(n.start), tmap(n.end), n.pitch + transpose) for n in song.notes if not n.is_drum]
    found = recover.recover_runs(y, tuning, transpose, mapped)
    if not found:
        report["recovered_runs"] = []
        return tmap
    tmap = _landing_anchors(song, tmap, found, report)
    if flux is not None and getattr(tmap, "anchors", None) is not None and report.get("landing_anchors"):
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
    for a, b, p, sc, slurred in found:
        n = Note(nid, inv(a), inv(b), p, 100, part.index, 73)
        part.notes.append(n)
        if slurred and prev is not None:
            slur_pred[nid] = prev
        else:
            figs.append({"recording_s": round(a, 2), "notes": []})
        figs[-1]["notes"].append(p + transpose)
        prev = nid
        nid += 1
    song.parts.append(part)
    song.notes = sorted(song.notes + part.notes, key=lambda n: (n.start, -n.pitch))
    names = "C C# D Eb E F F# G Ab A Bb B".split()
    report["recovered_runs"] = [{"recording_s": f["recording_s"],
                                 "notes": " ".join(names[q % 12] + str(q // 12 - 1) for q in f["notes"])}
                                for f in figs]
    return tmap


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
