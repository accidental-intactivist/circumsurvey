"""SID instrument model and General-MIDI -> SID preset mapping.

An instrument is what a C64 tracker (GoatTracker, SID-Wizard, ...) calls an
instrument: ADSR, a short "wavetable" that shapes the first frames of every
note (noise-burst plucks, drum pitch drops, octave blips), a sustain waveform,
pulse-width modulation and delayed vibrato.

SID ADSR reference (per nibble value 0..F):
  attack : 2 8 16 24 38 56 68 80 100 250 500 800 1000 3000 5000 8000 ms
  decay/release: 6 24 48 72 114 168 204 240 300 750 1500 2400 3000 9000 15000 24000 ms
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict, replace

TRI, SAW, PULSE, NOISE = 0x10, 0x20, 0x40, 0x80
ATTACK_MS = [2, 8, 16, 24, 38, 56, 68, 80, 100, 250, 500, 800, 1000, 3000, 5000, 8000]
DECAY_MS = [6, 24, 48, 72, 114, 168, 204, 240, 300, 750, 1500, 2400, 3000, 9000, 15000, 24000]


@dataclass
class Instrument:
    name: str
    wave: int = PULSE                 # sustain waveform bits (no gate bit)
    ad: int = 0x09
    sr: int = 0x00
    pw: int = 0x0800                  # initial 12-bit pulse width
    pw_speed: int = 0                 # PWM step per frame (0 = off), bounces between pw_min/max
    pw_min: int = 0x0200
    pw_max: int = 0x0E00
    vib_delay: int = 0                # frames before vibrato starts (0 = no vibrato)
    vib_depth: int = 0                # shift: freq delta = (f(n+1)-f(n)) >> vib_depth, 0 = off
    vib_speed: int = 0                # frames per quarter LFO cycle
    # wavetable: list of (waveform, note) for the first frames of each note.
    # note = +k/-k relative semitones, or "abs:N" absolute note index (0..95).
    # After the table the sustain `wave` with the played note is used.
    table: list = field(default_factory=list)

    def to_json(self):
        return asdict(self)


def ms_to_attack(ms):
    return min(range(16), key=lambda i: abs(ATTACK_MS[i] - ms))


def ms_to_decay(ms):
    return min(range(16), key=lambda i: abs(DECAY_MS[i] - ms))


# ---------------------------------------------------------------------------
# Presets. Values chosen by ear against reSID (6581 & 8580) for a
# "chip-orchestra" sound: pulse for reeds, saw for brass/bowed strings,
# triangle for flutes, noise-burst attacks for plucked sounds.
# ---------------------------------------------------------------------------
PRESETS = {
    # bright one-frame saw "hammer" at the same pitch (an octave blip reads as a wrong note)
    "piano":      Instrument("piano", PULSE, 0x0A, 0x49, 0x0600, 24),
    "mallet":     Instrument("mallet", TRI, 0x09, 0x00, table=[(PULSE, 12), (TRI, 0)]),
    "organ":      Instrument("organ", PULSE, 0x03, 0xC5, 0x0400, 16, 0x0300, 0x0C00),
    "guitar":     Instrument("guitar", PULSE, 0x09, 0x55, 0x0500, 20, table=[(NOISE, 24)]),
    "bass":       Instrument("bass", PULSE, 0x08, 0x98, 0x0300, 12, 0x0200, 0x0700,
                             table=[(PULSE | SAW, 0)]),
    "bowed":      Instrument("bowed", SAW, 0x68, 0xA8, vib_delay=14, vib_depth=3, vib_speed=3),
    "pizzicato":  Instrument("pizzicato", PULSE, 0x08, 0x00, 0x0600, 0,
                             table=[(NOISE, 36)]),
    "harp":       Instrument("harp", TRI, 0x0A, 0x00, table=[(PULSE, 12)]),
    "timpani":    Instrument("timpani", TRI, 0x0A, 0x00, table=[(NOISE, 12), (TRI, 0)]),
    "ensemble":   Instrument("ensemble", SAW, 0x6A, 0xA9, vib_delay=18, vib_depth=3, vib_speed=4),
    "choir":      Instrument("choir", TRI, 0x88, 0xB9, vib_delay=10, vib_depth=3, vib_speed=4),
    "brass":      Instrument("brass", SAW, 0x39, 0xA7, vib_delay=18, vib_depth=4, vib_speed=3,
                             table=[(PULSE, 0)]),
    "horn":       Instrument("horn", PULSE, 0x49, 0x97, 0x0300, 10, 0x0200, 0x0600,
                             vib_delay=20, vib_depth=4, vib_speed=4),
    "reed":       Instrument("reed", PULSE, 0x28, 0xA6, 0x0500, 18, 0x0300, 0x0900,
                             vib_delay=16, vib_depth=4, vib_speed=3),
    "bassoon":    Instrument("bassoon", PULSE, 0x18, 0x96, 0x0280, 8, 0x0180, 0x0500),
    "flute":      Instrument("flute", TRI, 0x38, 0xA7, vib_delay=12, vib_depth=3, vib_speed=3,
                             table=[(NOISE, 24)]),
    "lead":       Instrument("lead", PULSE, 0x09, 0xA8, 0x0400, 32, vib_delay=10, vib_depth=3,
                             vib_speed=3),
    "pad":        Instrument("pad", SAW, 0x9A, 0xAA, vib_delay=20, vib_depth=4, vib_speed=5),
    # drums: absolute-pitch wavetables (classic C64 "drum table" technique)
    "kick":       Instrument("kick", TRI, 0x08, 0x00,
                             table=[(NOISE, "abs:60"), (PULSE, "abs:40"), (TRI, "abs:33"),
                                    (TRI, "abs:28"), (TRI, "abs:24")]),
    "snare":      Instrument("snare", NOISE, 0x09, 0x00,
                             table=[(NOISE, "abs:72"), (PULSE, "abs:44"), (NOISE, "abs:70")]),
    "hihat":      Instrument("hihat", NOISE, 0x05, 0x00, table=[(NOISE, "abs:92")]),
    "cymbal":     Instrument("cymbal", NOISE, 0x0A, 0x00, table=[(NOISE, "abs:90")]),
    "tom":        Instrument("tom", TRI, 0x09, 0x00,
                             table=[(NOISE, "abs:55"), (TRI, "abs:40"), (TRI, "abs:36")]),
}

# GM program -> preset name
GM = {}
for p in range(0, 8): GM[p] = "piano"
for p in range(8, 16): GM[p] = "mallet"
for p in range(16, 24): GM[p] = "organ"
for p in range(24, 32): GM[p] = "guitar"
for p in range(32, 40): GM[p] = "bass"
for p in range(40, 45): GM[p] = "bowed"
GM[45] = "pizzicato"; GM[46] = "harp"; GM[47] = "timpani"
for p in range(48, 52): GM[p] = "ensemble"
for p in range(52, 56): GM[p] = "choir"
for p in range(56, 60): GM[p] = "brass"
GM[60] = "horn"
for p in range(61, 64): GM[p] = "brass"
for p in range(64, 68): GM[p] = "reed"
GM[68] = "reed"; GM[69] = "reed"; GM[70] = "bassoon"; GM[71] = "reed"
for p in range(72, 80): GM[p] = "flute"
for p in range(80, 88): GM[p] = "lead"
for p in range(88, 128): GM[p] = "pad"
for p in (104, 105, 106, 107): GM[p] = "guitar"
for p in range(112, 120): GM[p] = "mallet"

# Track-name keywords beat the program number (MIDI exports often have
# placeholder programs; names are usually right).
KEYWORDS = [
    ("pizz", "pizzicato"), ("bassoon", "bassoon"), ("bass clar", "bassoon"),
    ("contrabass", "bass"), ("tuba", "bass"), ("flute", "flute"), ("piccolo", "flute"),
    ("recorder", "flute"), ("horn", "horn"), ("trumpet", "brass"), ("trombone", "brass"),
    ("cornet", "brass"), ("brass", "brass"), ("oboe", "reed"), ("clarinet", "reed"),
    ("sax", "reed"), ("violin", "bowed"), ("viola", "bowed"), ("cello", "bowed"),
    ("strings", "ensemble"), ("harp", "harp"), ("piano", "piano"), ("organ", "organ"),
    ("guitar", "guitar"), ("banjo", "guitar"), ("choir", "choir"), ("voice", "choir"),
    ("timpani", "timpani"), ("xylo", "mallet"), ("glock", "mallet"), ("celesta", "mallet"),
    ("bass", "bass"),
]


def drum_preset(pitch):
    if pitch in (35, 36):
        return "kick"
    if pitch in (38, 40, 37, 39):
        return "snare"
    if pitch in (42, 44, 46, 54, 69, 70):
        return "hihat"
    if pitch in (49, 51, 52, 53, 55, 57, 59):
        return "cymbal"
    if pitch in (41, 43, 45, 47, 48, 50):
        return "tom"
    return "hihat"


def preset_for_part(part):
    name = part.name.lower()
    for kw, preset in KEYWORDS:
        if kw in name:
            return preset
    return GM.get(part.program, "lead")


def adapt_to_articulation(inst: Instrument, notes, fps) -> Instrument:
    """Shape the envelope around how the part is actually played.

    Staccato parts get a quick decay to sustain 0 so repeated notes separate;
    legato parts get a longer release so the release tail bridges the
    hard-restart gap instead of leaving audible holes.
    """
    if not notes:
        return inst
    durs = sorted(n.end - n.start for n in notes)
    med = durs[len(durs) // 2]
    a, d = inst.ad >> 4, inst.ad & 15
    s, r = inst.sr >> 4, inst.sr & 15
    # attack can never exceed ~1/3 of the typical note, or notes never speak
    a = min(a, ms_to_attack(med * 1000 / 3))
    if med < 0.18:                         # staccato / plucked
        d = min(d, ms_to_decay(med * 1000 * 1.5))
        r = min(r, ms_to_decay(med * 1000 * 1.2))
    else:
        r = max(r, ms_to_decay(min(med, 0.6) * 1000 * 0.5))
    return replace(inst, ad=(a << 4) | d, sr=(s << 4) | r)


def load_overrides(path):
    """JSON: {"<part name or index>": {"preset": "flute", "ad": 34, ...}}"""
    with open(path) as f:
        return json.load(f)


def build_instruments(song, fps, overrides=None):
    """Return (instruments list, part->instrument index, drum pitch->index)."""
    overrides = overrides or {}
    insts, part_inst, drum_inst = [], {}, {}
    for part in song.parts:
        if part.is_drum:
            for n in part.notes:
                key = drum_preset(n.pitch)
                if key not in drum_inst:
                    drum_inst[key] = len(insts)
                    insts.append(replace(PRESETS[key]))
            continue
        ov = overrides.get(part.name) or overrides.get(str(part.index)) or {}
        base = PRESETS[ov.get("preset", preset_for_part(part))]
        inst = adapt_to_articulation(replace(base, name=f"{base.name}:{part.name}"), part.notes, fps)
        fields = {k: v for k, v in ov.items() if k in Instrument.__dataclass_fields__ and k != "name"}
        if fields:
            inst = replace(inst, **fields)
        part_inst[part.index] = len(insts)
        insts.append(inst)
    return insts, part_inst, drum_inst
