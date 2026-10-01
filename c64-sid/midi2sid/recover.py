"""Recover fast figures the MIDI is missing, straight from the recording.

Piano reductions routinely drop orchestral filigree: flute and piccolo runs,
string flourishes.  When a reference recording is given, this module looks
for *runs*, i.e. 3 or more quick notes stepping steadily in one direction in
a register above what the MIDI plays at that moment, and returns them as
notes of an extra part.

The detector is deliberately strict: only contiguous stepwise runs survive,
and pitches that are overtones of MIDI notes sounding at the time are
rejected, so sustained orchestral lines and harmonics are not transcribed.
"""

from __future__ import annotations

import numpy as np

from . import audio_align as aa

N, H = 2048, 64                      # ~93 ms window, 2.9 ms hop


def _band_energy(y, tuning, pitches):
    win = np.hanning(N).astype(np.float32)
    fr = np.fft.rfftfreq(N, 1 / aa.SR)
    bands = []
    for p in pitches:
        f0 = 440 * 2 ** ((p - 69 + tuning) / 12)
        b = np.where((fr > f0 * 2 ** (-0.5 / 12)) & (fr < f0 * 2 ** (0.5 / 12)))[0]
        bands.append(b if len(b) else np.array([int(np.argmin(np.abs(fr - f0)))]))
    n = (len(y) - N) // H
    E = np.zeros((n, len(pitches)), np.float32)
    for c0 in range(0, n, 2000):
        c1 = min(n, c0 + 2000)
        idx = np.arange(N)[None, :] + H * np.arange(c0, c1)[:, None]
        mag = np.abs(np.fft.rfft(y[idx] * win, axis=1))
        for k, b in enumerate(bands):
            E[c0:c1, k] = mag[:, b].max(axis=1)
    t = (np.arange(n) * H + N / 2) / aa.SR
    return t, 20 * np.log10(E + 1e-6)


def _running_median(L, w):
    """Median over +/- w frames, computed on a decimated grid for speed."""
    step = max(1, w // 8)
    centres = np.arange(0, len(L), step)
    med = np.array([np.median(L[max(0, c - w):c + w], axis=0) for c in centres])
    out = np.empty_like(L)
    for k in range(L.shape[1]):
        out[:, k] = np.interp(np.arange(len(L)), centres, med[:, k])
    return out


def _track(y, tuning, lo, hi, contrast_db):
    """Monophonic pitch track in [lo, hi) -> short note segments."""
    pitches = np.arange(lo, hi)
    t, L = _band_energy(y, tuning, pitches)
    fps = aa.SR / H
    # contrast against the recording's own background: sustained lines and
    # steady harmonics sit in the running median and are subtracted out
    bg_t = _running_median(L, int(0.6 * fps))
    nb = np.maximum(np.roll(L, 1, axis=1), np.roll(L, -1, axis=1))
    C = np.minimum(L - bg_t, L - nb + 6.0)
    best = np.argmax(C, axis=1)
    val = C[np.arange(len(C)), best]
    track = np.where(val >= contrast_db, pitches[best], -1)
    # mode filter over ~26 ms removes one-frame blips from other instruments
    w = 4
    sm = track.copy()
    for i in range(len(track)):
        win = track[max(0, i - w):i + w + 1]
        win = win[win >= 0]
        if len(win) * 2 > 2 * w + 1:
            vals, cnt = np.unique(win, return_counts=True)
            sm[i] = vals[np.argmax(cnt)]
        else:
            sm[i] = -1
    segs, i = [], 0
    while i < len(sm):
        if sm[i] < 0:
            i += 1
            continue
        j = i
        while j + 1 < len(sm) and sm[j + 1] == sm[i]:
            j += 1
        if t[j] - t[i] >= 0.02:
            segs.append((float(t[i]), float(t[j]), int(sm[i]), float(val[i:j + 1].max())))
        i = j + 1
    return segs


def _chains(segs, max_gap=0.15, max_run_s=0.6, min_notes=3):
    """Stepwise runs (1..4 semitones, one direction), allowed to skip over
    segments that do not fit (other instruments poking through)."""
    used, runs = set(), []
    for k in range(len(segs)):
        if k in used:
            continue
        chain, direction = [k], 0
        for m in range(k + 1, len(segs)):
            last = segs[chain[-1]]
            s = segs[m]
            if s[0] - last[1] > max_gap or s[1] - segs[chain[0]][0] > max_run_s:
                if s[0] - last[1] > max_gap:
                    break
                continue
            step = s[2] - last[2]
            if 0 < abs(step) <= 4 and (direction == 0 or np.sign(step) == direction):
                direction = np.sign(step)
                chain.append(m)
        if len(chain) >= min_notes:
            runs.append([segs[c] for c in chain])
            used.update(chain)
    return runs


def _contrast(y, tuning, lo, hi):
    pitches = np.arange(lo, hi)
    t, L = _band_energy(y, tuning, pitches)
    fps = aa.SR / H
    bg_t = _running_median(L, int(0.6 * fps))
    nb = np.maximum(np.roll(L, 1, axis=1), np.roll(L, -1, axis=1))
    C = np.minimum(L - bg_t, L - nb + 6.0)
    return t, pitches, np.clip(C, 0, 20)


def _sweeps(t, pitches, C, dur=0.24, speeds=(6, 8, 10, 14, 20, 28, 40), thr=7.0, signs=(1, -1)):
    """Score straight rising/falling lines in the (time, pitch) plane.
    Sustained notes and noise score low on a diagonal; runs score high."""
    fps = 1 / (t[1] - t[0])
    nT, nP = C.shape
    ks = np.arange(0, dur, 0.012)
    best = np.zeros((nT, nP))
    arg = np.zeros((nT, nP), np.int8)
    vels = [sp * d for sp in speeds for d in signs]
    for vi, v in enumerate(vels):
        S = np.zeros((nT, nP))
        cnt = 0
        for k in ks:
            dt, dp = int(round(k * fps)), int(round(v * k))
            if abs(dp) >= nP:
                continue
            src = C[dt:, max(0, dp):nP + min(0, dp)]
            S[:nT - dt, max(0, -dp):nP - max(0, dp)] += np.maximum(
                src, 0)[:, :] if dp >= 0 else src
            cnt += 1
        S /= cnt
        upd = S > best
        best[upd], arg[upd] = S[upd], vi
    # non-maximum suppression: one figure per ~0.2 s
    peaks = []
    flat = best.max(axis=1)
    pbest = best.argmax(axis=1)
    w = int(0.2 * fps)
    for i in range(nT):
        if (flat[i] >= thr and flat[i] == flat[max(0, i - w):i + w + 1].max()
                and (not peaks or t[i] - peaks[-1][0] > 0.2)):
            peaks.append((t[i], int(pitches[pbest[i]]), vels[arg[i, pbest[i]]], float(flat[i])))
    return peaks


def _ridge_notes(t, pitches, C, t0, p0, v, span=0.42, change_pen=2.5, lead_s=0.2):
    """Best monotone pitch path through the figure (dynamic programming):
    each frame the pitch may stay or move 1..4 semitones in the figure's
    direction.  Constant-pitch stretches of the path become notes."""
    fps = 1 / (t[1] - t[0])
    i0 = max(0, int(np.searchsorted(t, t0)) - int(lead_s * fps))
    i1 = min(len(t), int(np.searchsorted(t, t0)) + int(span * fps))
    sgn = 1 if v > 0 else -1
    j0 = int(p0 - pitches[0])
    lo_j, hi_j = (j0 - 6, j0 + 10) if sgn > 0 else (j0 - 10, j0 + 6)
    lo_j, hi_j = max(0, lo_j), min(len(pitches), hi_j)
    W = C[i0:i1, lo_j:hi_j] - 3.0                      # reward only real contrast
    n, m = W.shape
    if n < 3 or m < 2:
        return []
    D = np.full((n, m), -1e9)
    B = np.zeros((n, m), int)
    D[0] = W[0]
    for i in range(1, n):
        for j in range(m):
            best, bj = D[i - 1, j], j                  # stay
            for d in range(1, 5):
                jj = j - sgn * d
                if 0 <= jj < m and D[i - 1, jj] - change_pen > best:
                    best, bj = D[i - 1, jj] - change_pen, jj
            best = max(best, W[i, j] * 0 + 0) if False else best
            D[i, j] = best + W[i, j]
            B[i, j] = bj
    j = int(np.argmax(D[-1]))
    path = [j]
    for i in range(n - 1, 0, -1):
        j = B[i, j]
        path.append(j)
    path = path[::-1]
    # constant-pitch stretches of the path, trimmed to the frames that
    # actually sound (the path also "parks" on a pitch before the run starts)
    notes, k = [], 0
    while k < len(path):
        m2 = k
        while m2 + 1 < len(path) and path[m2 + 1] == path[k]:
            m2 += 1
        cs = C[i0 + k:i0 + m2 + 1, lo_j + path[k]]
        on = np.where(cs >= 4.0)[0]
        if len(on):
            a, b = on[0], on[-1]
            seg = cs[a:b + 1]
            ta, tb = t[i0 + k + a], t[i0 + k + b]
            if tb - ta >= 0.015 and seg.mean() >= 5.0:
                notes.append([ta, tb, int(pitches[lo_j + path[k]])])
        k = m2 + 1
    good = notes
    # a figure is a quick succession: stop at the first gap > 0.18 s
    out = good[:1]
    for nn in good[1:]:
        if nn[0] - out[-1][0] > 0.18:
            break
        out.append(nn)
    return [nn[:3] for nn in out]


def recover_runs(y, tuning, transpose, mapped_notes, lo=74, hi=101, min_notes=3, thr=11.0, strong=14.0,
                 direction="up"):
    """Return [(t0, t1, pitch_in_midi_key, strength, slurred)] in recording time.

    mapped_notes: [(start_s, end_s, pitch)] of the MIDI in recording time,
    in the recording's key.  direction: 'up', 'down' or 'both'."""
    t, pitches, C = _contrast(y, tuning, lo, hi)
    starts = np.array([m[0] for m in mapped_notes])
    mn = [mapped_notes[i] for i in np.argsort(starts)]

    # a figure the MIDI already plays (or its overtones) shows up as MIDI
    # notes *starting* together with the figure's notes; sustained MIDI
    # notes never form a fast diagonal, so they are not counted
    ons = np.array([m[0] for m in mn])

    def explained(n, slack=0.16):
        lo_i, hi_i = np.searchsorted(ons, n[0] - slack), np.searchsorted(ons, n[0] + slack)
        return any((n[2] - mn[i][2]) in (0, 12, 19, 24, 28, 31, 36) for i in range(lo_i, hi_i))

    def already_in_midi(notes):
        """True if MIDI onsets trace the same figure at one constant interval
        (unison, octaves, or a harmonic of it)."""
        for d in (0, 12, 19, 24, 28, 31, 36, -12):
            hits = 0
            for t0_, _, p in notes:
                lo_i, hi_i = np.searchsorted(ons, t0_ - 0.12), np.searchsorted(ons, t0_ + 0.12)
                hits += any(p - mn[i][2] == d for i in range(lo_i, hi_i))
            if hits * 3 >= 2 * len(notes):
                return True
        return False

    out = []
    signs = {"up": (1,), "down": (-1,), "both": (1, -1)}[direction]
    for t0, p0, v, sc in _sweeps(t, pitches, C, thr=thr, signs=signs):
        if (direction == "up" and v < 0) or (direction == "down" and v > 0):
            continue
        notes = _ridge_notes(t, pitches, C, t0, p0, v)
        # a very strong diagonal is a figure even if only 2 notes read cleanly
        if len(notes) < (2 if sc >= strong else min_notes):
            continue
        if already_in_midi(notes) or (len(notes) == 2 and any(explained(n) for n in notes)):
            continue
        for i, n in enumerate(notes):
            end = notes[i + 1][0] if i + 1 < len(notes) else n[1] + 0.06
            out.append((float(n[0]), float(max(end, n[0] + 0.04)), n[2] - transpose, sc, i > 0))
    return out
