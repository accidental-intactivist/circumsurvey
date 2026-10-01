"""Polyphony reduction: N-part orchestral MIDI -> 3 SID voices.

Voice roles (soft, cost-driven rather than hard rules):
  voice 0  "bass"     - single notes, prefers the lowest sounding note
  voice 1  "lead"     - single notes, prefers the most salient / highest line
  voice 2  "harmony"  - single notes, drum hits, or a fast *arpeggio* that
                        cycles through the remaining chord tones every frame
                        (the classic C64 way to fake a chord on one voice)

At every point where something changes (a note starts, or a voice goes idle)
the arranger scores candidate assignments and keeps the best one.  The score
rewards playing salient notes (melody > bass > inner parts, longer and louder
notes, new attacks) and penalises the things that sound worst on a SID:
cutting a note that is still ringing, moving a note between voices
(a re-attack), bass above lead, sprawling arpeggios and instrument hopping.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import itertools
import math

ARP_WEIGHT = 0.6
CUT_PENALTY = 0.7
RESUME_PENALTY = 0.45
ROLE_BONUS = 0.25
PART_STICKY = 0.15
SLUR_BONUS = 1.2


@dataclass
class FNote:
    id: int
    f0: int              # first frame
    f1: int              # frame after last (exclusive)
    pitch: int           # MIDI pitch after transposition
    part: int
    inst: int
    sal: float = 1.0
    is_drum: bool = False
    vel: int = 64
    decay: int = 0       # frames for a held note to fade (0 = sustained instrument)
    pred: int | None = None  # previous note of a slurred run (glide, no re-attack)


@dataclass
class VoiceEvent:
    frame: int
    kind: str            # 'attack' | 'legato' | 'off'
    notes: tuple = ()    # pitches (sorted); >1 = arpeggio
    inst: int = 0
    ids: tuple = ()


@dataclass
class Arrangement:
    voices: list                         # 3 lists of VoiceEvent
    stats: dict = field(default_factory=dict)


def part_roles(song, notes_by_part):
    """Guess each part's musical role -> salience weight."""
    info = {}
    for p in song.parts:
        ns = notes_by_part.get(p.index, [])
        if not ns:
            continue
        starts = {}
        for n in ns:
            starts.setdefault(n.start, 0)
            starts[n.start] += 1
        poly = sum(1 for c in starts.values() if c > 1) / max(1, len(starts))
        mean = sum(n.pitch for n in ns) / len(ns)
        distinct = len({n.pitch for n in ns})
        info[p.index] = dict(poly=poly, mean=mean, distinct=distinct, drum=p.is_drum)
    tonal = [i for i, d in info.items() if not d["drum"]]
    roles = {}
    if tonal:
        low = min(tonal, key=lambda i: info[i]["mean"])
        mono = [i for i in tonal if info[i]["poly"] < 0.4 and i != low] or [i for i in tonal if i != low]
        # melody: high, monophonic, and melodic (many distinct pitches)
        lead = max(mono, key=lambda i: info[i]["mean"] + 1.5 * info[i]["distinct"]) if mono else None
        for i in tonal:
            if i == lead:
                roles[i] = ("melody", 1.5)
            elif i == low:
                roles[i] = ("bass", 1.3)
            elif info[i]["poly"] >= 0.4:
                roles[i] = ("chords", 0.8)
            else:
                roles[i] = ("counter", 1.0)
    for i, d in info.items():
        if d["drum"]:
            roles[i] = ("drums", 1.1)
    return roles, info


def salience(n: FNote, weight, fps):
    dur = (n.f1 - n.f0) / fps
    return weight * (0.7 + 0.3 * min(1.0, dur / 0.5))


def arrange(fnotes, n_frames, roles, fps, max_arp=4):
    by_id = {n.id: n for n in fnotes}
    starts = {}
    for n in fnotes:
        starts.setdefault(n.f0, []).append(n)
    event_frames = sorted({n.f0 for n in fnotes} | {n.f1 for n in fnotes if n.f1 < n_frames})

    voices = [[], [], []]
    vc = [(), (), ()]            # current note ids per voice
    last_part = [None, None, None]
    active = {}
    played_onsets = 0
    arp_frames = 0

    def pitch(i):
        return by_id[i].pitch

    for f in event_frames:
        for n in starts.get(f, []):
            active[n.id] = n
        for i in [i for i, n in active.items() if n.f1 <= f]:
            del active[i]
        new_ids = {n.id for n in starts.get(f, [])}

        before = list(vc)
        # prune ended notes from voices -> release or shrink arpeggio (legato)
        freed = False
        for v in range(3):
            if not vc[v]:
                continue
            keep = tuple(i for i in vc[v] if i in active)
            if keep != vc[v]:
                vc[v] = keep
                if not keep:
                    voices[v].append(VoiceEvent(f, "off"))
                    freed = True
                else:
                    voices[v].append(VoiceEvent(f, "legato", tuple(sorted(pitch(i) for i in keep)),
                                                by_id[keep[0]].inst, keep))
        if not new_ids and not freed:
            continue

        # de-duplicate unisons (keep the most salient owner)
        best_for_pitch = {}
        for n in active.values():
            key = ("d", n.inst) if n.is_drum else n.pitch
            if key not in best_for_pitch or n.sal > best_for_pitch[key].sal:
                best_for_pitch[key] = n
        cand_notes = list(best_for_pitch.values())
        on_voice = {i: v for v in range(3) for i in vc[v]}
        # keep currently-sounding notes even if a unison twin was preferred
        for i in on_voice:
            if active[i] not in cand_notes:
                cand_notes.append(active[i])
        tonal = sorted((n for n in cand_notes if not n.is_drum), key=lambda n: n.pitch)
        if not tonal and not any(n.is_drum for n in cand_notes):
            continue
        lo_p = tonal[0].pitch if tonal else None
        hi_p = tonal[-1].pitch if tonal else None
        by_sal = sorted(cand_notes, key=lambda n: -n.sal)

        def opts_single(extra):
            s = {()}
            for n in extra:
                s.add((n.id,))
            return s

        c0_opts = opts_single(tonal[:2]) | ({vc[0]} if len(vc[0]) == 1 else set())
        c1_opts = opts_single(tonal[-3:] + [n for n in by_sal if not n.is_drum][:2])
        if len(vc[1]) == 1:
            c1_opts.add(vc[1])

        best, best_cfg = -1e9, None
        for c0 in c0_opts:
            for c1 in c1_opts:
                if c0 and c1 and c0 == c1:
                    continue
                used = set(c0) | set(c1)
                rest = [n for n in by_sal if n.id not in used]
                c2_opts = {()}
                if vc[2]:
                    kept = tuple(i for i in vc[2] if i not in used)
                    if kept:
                        c2_opts.add(kept)
                for n in rest[:6]:
                    c2_opts.add((n.id,))
                rest_tonal = [n for n in rest if not n.is_drum]
                if len(rest_tonal) >= 2:
                    grp = _chord_group(rest_tonal, used, by_id, max_arp)
                    if len(grp) >= 2:
                        c2_opts.add(grp)
                    for part in {n.part for n in rest_tonal}:
                        pg = _chord_group([n for n in rest_tonal if n.part == part], used, by_id, max_arp)
                        if len(pg) >= 2:
                            c2_opts.add(pg)
                for c2 in c2_opts:
                    sc = _score((c0, c1, c2), vc, active, new_ids, by_id, f, lo_p, hi_p, last_part, before)
                    if sc > best:
                        best, best_cfg = sc, (c0, c1, c2)

        cfg = best_cfg
        for v in range(3):
            c = tuple(sorted(cfg[v], key=pitch))
            if c == tuple(sorted(vc[v], key=pitch)):
                continue
            if not c:
                if vc[v]:
                    voices[v].append(VoiceEvent(f, "off"))
                vc[v] = ()
                continue
            lead = max(c, key=lambda i: by_id[i].sal)
            inst = by_id[lead].inst
            pitches = tuple(sorted({pitch(i) for i in c})) if not by_id[lead].is_drum else (pitch(lead),)
            has_new = any(i in new_ids for i in c)
            # a subset of what this voice was already playing -> no re-attack
            kind = "legato" if vc[v] and set(c) <= set(vc[v]) and not has_new else "attack"
            # slurred run: the next note of the figure glides on the same voice
            if len(c) == 1 and by_id[c[0]].pred is not None and by_id[c[0]].pred in before[v]:
                kind = "legato"
            voices[v].append(VoiceEvent(f, kind, pitches, inst, c))
            vc[v] = c
            last_part[v] = by_id[lead].part
        for v in range(3):
            played_onsets += sum(1 for i in vc[v] if i in new_ids)

    # arpeggio usage statistics
    for v in range(3):
        evs = voices[v] + [VoiceEvent(n_frames, "off")]
        for a, b in zip(evs, evs[1:]):
            if a.kind != "off" and len(a.notes) > 1:
                arp_frames += b.frame - a.frame
    total_onsets = len(fnotes)
    dedup_onsets = len({(n.f0, n.pitch) for n in fnotes})
    stats = {
        "midi_notes": total_onsets,
        "unique_onsets": dedup_onsets,
        "onsets_played": played_onsets,
        "onset_coverage_pct": round(100 * played_onsets / max(1, dedup_onsets), 1),
        "arpeggio_seconds": round(arp_frames / fps, 2),
    }
    return Arrangement(voices, stats)


def _chord_group(notes, used, by_id, max_arp):
    """Pick up to max_arp chord tones, preferring distinct pitch classes."""
    used_pcs = {by_id[i].pitch % 12 for i in used}
    seen, grp = set(), []
    for n in sorted(notes, key=lambda n: (-n.sal, -n.pitch)):
        pc = n.pitch % 12
        if pc in seen:
            continue
        seen.add(pc)
        grp.append(n)
    # tones not already heard in bass/lead first
    grp.sort(key=lambda n: (n.pitch % 12 in used_pcs, -n.sal))
    grp = grp[:max_arp]
    return tuple(n.id for n in sorted(grp, key=lambda n: n.pitch))


def _value(n, f):
    """What a note is worth at frame f. Struck/plucked notes (piano, harp,
    pizzicato...) fade, so a chord held for bars matters less than a fresh
    note in another line; sustained instruments keep their full value."""
    if not n.decay:
        return n.sal
    age = max(0, f - n.f0)
    return n.sal * (0.25 + 0.75 * math.exp(-age / n.decay))


def _score(cfg, vc, active, new_ids, by_id, f, lo_p, hi_p, last_part, before=None):
    sc = 0.0
    # slurred runs stay on the voice that played the previous note of the figure
    if before is not None:
        for v, c in enumerate(cfg):
            if len(c) == 1 and by_id[c[0]].pred is not None and by_id[c[0]].pred in before[v]:
                sc += SLUR_BONUS
    placed = {}
    for v, c in enumerate(cfg):
        if not c:
            continue
        w = 1.0 if len(c) == 1 else ARP_WEIGHT
        prev = set(vc[v])
        attack = not (set(c) <= prev and not (set(c) & new_ids))
        for i in c:
            n = by_id[i]
            sc += _value(n, f) * w
            placed[i] = v
            if attack and i not in new_ids:
                sc -= RESUME_PENALTY * _value(n, f)   # re-attacking a note mid-way
        if len(c) > 1:
            ps = [by_id[i].pitch for i in c]
            if max(ps) - min(ps) > 19:
                sc -= 0.3
            sc -= 0.1 * (len({by_id[i].part for i in c}) - 1)
        lead_part = by_id[max(c, key=lambda i: by_id[i].sal)].part
        if last_part[v] is not None and lead_part == last_part[v]:
            sc += PART_STICKY
    # cutting or moving notes that are still ringing
    for v in range(3):
        for i in vc[v]:
            if i not in active:
                continue
            if placed.get(i) != v:
                n = by_id[i]
                remain = (n.f1 - f) / max(1, n.f1 - n.f0)
                sc -= CUT_PENALTY * _value(n, f) * remain
    c0, c1, c2 = cfg
    if c0 and c1:
        if by_id[c0[0]].pitch > by_id[c1[0]].pitch:
            sc -= 0.5
    if c0 and lo_p is not None and by_id[c0[0]].pitch == lo_p:
        sc += ROLE_BONUS
    if c1 and hi_p is not None and by_id[c1[0]].pitch == hi_p:
        sc += ROLE_BONUS
    return sc
