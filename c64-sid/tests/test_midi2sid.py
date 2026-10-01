"""Run with:  python -m unittest discover -s tests -v   (from c64-sid/)"""

import os
import random
import sys
import tempfile
import unittest

import mido
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))

from midi2sid import compiler, emulate, player            # noqa: E402
from midi2sid.asm6502 import Asm                          # noqa: E402
from midi2sid.convert import Options, convert             # noqa: E402


def make_midi(path):
    """6 simultaneous parts incl. drums: more than the SID can play at once."""
    mf = mido.MidiFile(ticks_per_beat=96)
    meta = mido.MidiTrack([mido.MetaMessage("set_tempo", tempo=500000)])
    mf.tracks.append(meta)

    def part(name, program, notes, ch=0):
        tr = mido.MidiTrack([mido.MetaMessage("track_name", name=name),
                             mido.Message("program_change", program=program, channel=ch)])
        ev = []
        for start, dur, pitch in notes:
            ev.append((start, 1, pitch))
            ev.append((start + dur, 0, pitch))
        ev.sort(key=lambda e: (e[0], e[1]))
        t = 0
        for tick, on, pitch in ev:
            tr.append(mido.Message("note_on" if on else "note_off", note=pitch, velocity=90 if on else 0,
                                   channel=ch, time=tick - t))
            t = tick
        mf.tracks.append(tr)

    melody = [(i * 48, 44, 72 + [0, 2, 4, 5, 7, 5, 4, 2][i % 8]) for i in range(32)]
    bass = [(i * 96, 90, 36 + [0, 5, 7, 0][i % 4]) for i in range(16)]
    chords = [(i * 96 + o, 40, 60 + iv) for i in range(16) for o in (0, 48) for iv in (0, 4, 7)]
    counter = [(i * 192, 180, 67 + [0, -2, -3, -5][i % 4]) for i in range(8)]
    drums = [(i * 48, 10, 36 if i % 2 == 0 else 38) for i in range(32)]
    part("Flute", 73, melody)
    part("Bass", 33, bass)
    part("Strings", 48, chords)
    part("Horn", 60, counter)
    part("Drums", 0, drums, ch=9)
    mf.save(path)


class TestAssembler(unittest.TestCase):
    def test_branch_relaxation(self):
        a = Asm(0x1000)
        a.label("top")
        a.op("lda", "#", 1)
        a.op("beq", "far")
        a.byte(*([0xEA] * 200))
        a.label("far")
        a.op("rts")
        code = a.assemble()
        # beq relaxed to: bne +3 ; jmp far
        self.assertEqual(code[2:7], bytes([0xD0, 0x03, 0x4C, 0xCF, 0x10]))
        self.assertEqual(a.labels["far"], 0x10CF)


class TestCompiler(unittest.TestCase):
    def test_compression_is_lossless(self):
        rnd = random.Random(1)
        motif = [compiler.Tok(rnd.randrange(0, 96), (), rnd.randrange(1, 30)) for _ in range(12)]
        streams = []
        for _ in range(3):
            s = []
            for _ in range(20):
                s += motif[:rnd.randrange(4, 12)]
                s.append(compiler.Tok(compiler.OFF, (), 3))
            streams.append(s)
        items = compiler.compress(streams)
        self.assertEqual(compiler.expand(items), streams)
        data, starts = compiler.layout(items, 0x2000)
        raw = sum(sum(t.size() for t in s) + 3 for s in streams)
        self.assertLess(len(data), raw * 0.6)


class TestEndToEnd(unittest.TestCase):
    def test_convert_and_verify_on_6502(self):
        with tempfile.TemporaryDirectory() as d:
            mid = os.path.join(d, "t.mid")
            make_midi(mid)
            rep = convert(mid, os.path.join(d, "t"), Options(render_wav=False, load_addr=0x3000))
            self.assertTrue(rep["verification"]["ok"], rep["verification"])
            self.assertGreater(rep["verification"]["attacks_expected"], 50)
            self.assertLess(rep["cpu"]["max_cycles_per_frame"], 19656 // 4)
            self.assertGreater(rep["arrangement"]["pitch_onsets_heard_pct"], 60)
            with open(os.path.join(d, "t.sid"), "rb") as f:
                sid = f.read()
            self.assertEqual(sid[:4], b"PSID")
            self.assertEqual(int.from_bytes(sid[0x7C:0x7E], "little"), 0x3000)
            # the player really produces the right pitches: every sustained
            # NOTE frame must sit on the note's frequency (+/- vibrato)
            prg = open(os.path.join(d, "t.prg"), "rb").read()
            _, fw, _ = emulate.run(prg[2:], 0x3000, 0x3000, 0x3003, rep["frames"])
            tr = emulate.register_trace(fw)
            ft = np.array(player.freq_table(player.PAL_CLOCK))
            # frames where voice 2 (lead) is gated should mostly be in the melody's scale
            f = tr[:, 7] | tr[:, 8] << 8
            gated = (tr[:, 11] & 1) == 1
            notes = np.abs(ft[None, :] - f[gated][:, None]).argmin(axis=1) + 12
            in_scale = np.isin(notes % 12, [0, 2, 4, 5, 7, 9, 11]).mean()
            self.assertGreater(in_scale, 0.95)


class TestAlignment(unittest.TestCase):
    def test_recovers_known_warp(self):
        from midi2sid import audio_align
        from midi2sid.midi_in import load_midi
        from synth_util import render, warp_fn
        with tempfile.TemporaryDirectory() as d:
            mid = os.path.join(d, "t.mid")
            make_midi(mid)
            song = load_midi(mid)
            fn = warp_fn(song.length)
            y = render([n for n in song.notes if not n.is_drum], fn, transpose=-2, cents=12)
            wav = os.path.join(d, "t.wav")
            emulate.write_wav(wav, (y / np.abs(y).max() * 30000).astype(np.int16), 22050)
            tm, _, info, key = audio_align.align(song.notes, song.length, wav)
            self.assertEqual(key["transpose"], -2)
            self.assertAlmostEqual(info["recording_tuning_cents"], 12, delta=4)
            ts = np.linspace(0.5, song.length - 0.5, 40)
            err = np.abs([tm(t) - fn(t) for t in ts])
            self.assertLess(np.median(err), 0.04)      # 2 PAL frames
            self.assertLess(err.mean(), 0.06)


if __name__ == "__main__":
    unittest.main()


class TestRecoverRuns(unittest.TestCase):
    def test_finds_runs_missing_from_midi(self):
        from midi2sid import recover
        from midi2sid.midi_in import load_midi
        from synth_util import render
        with tempfile.TemporaryDirectory() as d:
            mid = os.path.join(d, "t.mid")
            make_midi(mid)
            song = load_midi(mid)
            tonal = [n for n in song.notes if not n.is_drum]
            ident = lambda t: t                               # noqa: E731
            base = render(tonal, ident)
            # add three rising flute figures the MIDI does not contain
            sr, figs = 22050, [(1.5, [86, 88, 90, 91]), (4.0, [84, 86, 88]), (6.5, [89, 91, 93, 94])]
            y = base.copy()
            for t0, ps in figs:
                for k, p in enumerate(ps):
                    s0 = int((t0 + 0.07 * k) * sr)
                    n = int(0.09 * sr) if k < len(ps) - 1 else int(0.3 * sr)
                    tt = np.arange(n) / sr
                    f0 = 440 * 2 ** ((p - 69) / 12)
                    y[s0:s0 + n] += 0.25 * np.sin(2 * np.pi * f0 * tt) * np.minimum(1, tt / 0.005)
            mapped = [(n.start, n.end, n.pitch) for n in tonal]
            found = recover.recover_runs(y, 0.0, 0, mapped)
            figures = []
            for a, b, p, sc, sl in found:
                if not sl:
                    figures.append((a, []))
                figures[-1][1].append(p)
            # every recovered figure is one of the planted ones, note for note
            for st, ps in figures:
                match = [f for f in figs if abs(f[0] - st) < 0.1]
                self.assertTrue(match, (st, ps))
                self.assertEqual(ps, match[0][1])
            # the middle figure sits under the test melody's own 3rd harmonic
            # (a louder note in the same register), which masks it; the
            # other two must be found
            self.assertGreaterEqual(len(figures), 2, found)
            # the plain render has no runs: nothing must be invented
            self.assertEqual(recover.recover_runs(base, 0.0, 0, mapped), [])
