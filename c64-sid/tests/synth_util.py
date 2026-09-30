"""Helpers for tests: render MIDI notes to a crude audio signal with a known time warp."""
import numpy as np


def warp_fn(length):
    # 3 s of silence, then tempo drifting +/-8% (a slow sinusoidal rubato)
    def f(t):
        return 3.0 + 0.95 * t + 0.08 * length / (2 * np.pi) * np.sin(2 * np.pi * t / length)
    return f


def render(notes, fn, sr=22050, transpose=0, cents=0.0):
    end = max(fn(n.end) for n in notes) + 1.0
    y = np.zeros(int(end * sr), np.float32)
    for n in notes:
        s, e = int(fn(n.start) * sr), int(fn(n.end) * sr)
        t = np.arange(e - s) / sr
        f0 = 440 * 2 ** ((n.pitch + transpose + cents / 100 - 69) / 12)
        env = np.exp(-t / 0.25)
        sig = sum(np.sin(2 * np.pi * f0 * h * t) / h for h in (1, 2, 3))
        y[s:e] += 0.1 * env * sig
    return y
