"""MIDI loading: flatten every track into absolute-time notes.

Notes are identified by *track* as well as channel, because many orchestral
MIDI exports (including the Grofé file this was built against) put every
instrument on channel 0 and differentiate them only by track + program change.
"""

from __future__ import annotations

import bisect
from dataclasses import dataclass, field

import mido


@dataclass
class Note:
    id: int
    start: float          # seconds (MIDI clock)
    end: float
    pitch: int
    velocity: int
    track: int            # "part" index (track, or track+channel split)
    program: int
    is_drum: bool = False
    start_tick: int = 0


@dataclass
class Part:
    index: int
    name: str
    program: int
    is_drum: bool
    notes: list = field(default_factory=list)


@dataclass
class Song:
    parts: list
    notes: list
    length: float
    tempo_map: list        # [(tick, sec, usec_per_beat)]
    ticks_per_beat: int
    time_sigs: list        # [(tick, num, den)]
    markers: list          # [(sec, text)]

    def tick_to_sec(self, tick):
        i = bisect.bisect_right([t for t, _, _ in self.tempo_map], tick) - 1
        t0, s0, tempo = self.tempo_map[max(i, 0)]
        return s0 + (tick - t0) * tempo / 1e6 / self.ticks_per_beat

    def beat_times(self):
        """(sec, bar, beat) for every beat, honouring time signatures."""
        last_tick = max((n.start_tick for n in self.notes), default=0)
        sigs = self.time_sigs or [(0, 4, 4)]
        out, tick, bar = [], 0, 1
        si = 0
        while tick <= last_tick + self.ticks_per_beat:
            while si + 1 < len(sigs) and sigs[si + 1][0] <= tick:
                si += 1
            _, num, den = sigs[si]
            step = self.ticks_per_beat * 4 // den
            for b in range(num):
                out.append((self.tick_to_sec(tick), bar, b + 1))
                tick += step
            bar += 1
        return out


def load_midi(path: str) -> Song:
    mf = mido.MidiFile(path)
    tpb = mf.ticks_per_beat

    # Global tempo map / time signatures / markers (from any track).
    tempo_events, sig_events, marker_events = [], [], []
    for tr in mf.tracks:
        tick = 0
        for msg in tr:
            tick += msg.time
            if msg.type == "set_tempo":
                tempo_events.append((tick, msg.tempo))
            elif msg.type == "time_signature":
                sig_events.append((tick, msg.numerator, msg.denominator))
            elif msg.type in ("marker", "cue_marker"):
                marker_events.append((tick, msg.text))
    tempo_events.sort()
    tempo_map, sec, last_tick, tempo = [], 0.0, 0, 500000
    if not tempo_events or tempo_events[0][0] != 0:
        tempo_map.append((0, 0.0, tempo))
    for tick, t in tempo_events:
        sec += (tick - last_tick) * tempo / 1e6 / tpb
        last_tick, tempo = tick, t
        if tempo_map and tempo_map[-1][0] == tick:
            tempo_map[-1] = (tick, sec, t)
        else:
            tempo_map.append((tick, sec, t))

    song = Song([], [], 0.0, tempo_map, tpb, sorted(sig_events), [])
    song.markers = [(song.tick_to_sec(t), txt) for t, txt in sorted(marker_events)]

    parts: dict = {}
    nid = 0
    for ti, tr in enumerate(mf.tracks):
        tick = 0
        name = ""
        program = {}          # channel -> program
        active = {}           # (ch, pitch) -> [(start_tick, vel)]
        for msg in tr:
            tick += msg.time
            if msg.type == "track_name":
                name = msg.name.replace("\x00", "").strip()
            elif msg.type == "program_change":
                program[msg.channel] = msg.program
            elif msg.type == "note_on" and msg.velocity > 0:
                active.setdefault((msg.channel, msg.note), []).append((tick, msg.velocity))
            elif msg.type == "note_off" or (msg.type == "note_on" and msg.velocity == 0):
                stack = active.get((msg.channel, msg.note))
                if not stack:
                    continue
                st, vel = stack.pop(0)
                ch = msg.channel
                key = (ti, ch)
                if key not in parts:
                    parts[key] = Part(len(parts), name or f"Track {ti}", program.get(ch, 0), ch == 9)
                p = parts[key]
                if not p.name or p.name.startswith("Track "):
                    p.name = name or p.name
                s0, s1 = song.tick_to_sec(st), song.tick_to_sec(tick)
                if s1 <= s0:
                    s1 = s0 + 0.02
                n = Note(nid, s0, s1, msg.note, vel, p.index, program.get(ch, p.program), ch == 9, st)
                nid += 1
                p.notes.append(n)
        # dangling notes: end at last tick of track
        for (ch, pitch), stack in active.items():
            for st, vel in stack:
                key = (ti, ch)
                if key not in parts:
                    parts[key] = Part(len(parts), name or f"Track {ti}", program.get(ch, 0), ch == 9)
                p = parts[key]
                n = Note(nid, song.tick_to_sec(st), song.tick_to_sec(tick), pitch, vel, p.index,
                         program.get(ch, 0), ch == 9, st)
                nid += 1
                p.notes.append(n)

    song.parts = sorted(parts.values(), key=lambda p: p.index)
    # duplicate track names (e.g. two "Piano" hands) -> "Piano", "Piano #2"
    seen = {}
    for p in song.parts:
        seen[p.name] = seen.get(p.name, 0) + 1
        if seen[p.name] > 1:
            p.name = f"{p.name} #{seen[p.name]}"
    song.notes = sorted((n for p in song.parts for n in p.notes), key=lambda n: (n.start, -n.pitch))
    song.length = max((n.end for n in song.notes), default=0.0)
    return song
