"""Align MIDI time to a reference recording and extract its dynamics.

Two stages:
  1. Global fit  - offset + tempo-scale grid search maximising the correlation
                   between the MIDI onset envelope and the audio onset envelope
                   (spectral flux).  Exact when the recording is a render of
                   the MIDI; a good start when it is a live performance.
  2. DTW (opt.)  - chroma+onset dynamic time warping (step sizes (1,1),(1,2),
                   (2,1) so tempo can locally vary 0.5x..2x), smoothed into a
                   monotone piecewise-linear map.  Handles rubato, fermatas and
                   tempo changes in a live recording.

The result is a function midi_seconds -> recording_seconds, which the
converter applies to every note before quantising to C64 frames, so the SID
tune lines up with the recording (e.g. for cross-fades or cut-scene sync).
"""

from __future__ import annotations

import shutil
import subprocess

import numpy as np

SR = 22050
HOP = 441            # 20 ms feature frames (50 fps, close to the PAL frame)
NFFT = 2048
FPS = SR / HOP


def decode_audio(path, sr=SR):
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required to read audio files")
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def _stft_mag(y):
    win = np.hanning(NFFT).astype(np.float32)
    n = 1 + max(0, (len(y) - NFFT) // HOP)
    idx = np.arange(NFFT)[None, :] + HOP * np.arange(n)[:, None]
    frames = y[np.minimum(idx, len(y) - 1)] * win
    return np.abs(np.fft.rfft(frames, axis=1))


def audio_features(y):
    mag = _stft_mag(y)
    freqs = np.fft.rfftfreq(NFFT, 1 / SR)
    logm = np.log1p(100 * mag)
    flux = np.maximum(0, np.diff(logm, axis=0, prepend=logm[:1])).sum(axis=1)
    flux = flux - _moving(flux, 25)
    flux = np.maximum(flux, 0)
    # a sharp onset registers as soon as it enters the analysis window, i.e.
    # ~NFFT/2 samples before the frame centre: delay flux so it peaks at the
    # centre like the other features
    lag = int(round(NFFT / 2 / HOP))
    flux = np.concatenate([np.zeros(lag), flux[:-lag]])
    # chroma: map bins 55 Hz..4 kHz to pitch classes
    valid = (freqs > 55) & (freqs < 4000)
    midi = 69 + 12 * np.log2(freqs[valid] / 440.0)
    pc = np.round(midi).astype(int) % 12
    chroma = np.zeros((mag.shape[0], 12), np.float32)
    for c in range(12):
        chroma[:, c] = logm[:, valid][:, pc == c].sum(axis=1)
    rms = np.sqrt(np.mean(_frames(y) ** 2, axis=1) + 1e-12)
    return {"flux": flux, "chroma": chroma, "rms": rms[:len(flux)]}


def _frames(y):
    n = 1 + max(0, (len(y) - NFFT) // HOP)
    idx = np.arange(NFFT)[None, :] + HOP * np.arange(n)[:, None]
    return y[np.minimum(idx, len(y) - 1)]


def _moving(x, w):
    k = np.ones(w) / w
    return np.convolve(x, k, mode="same")


def midi_features(notes, length, map_fn=lambda t: t):
    n = int(np.ceil(map_fn(length) * FPS)) + 2
    onset = np.zeros(n, np.float32)
    chroma = np.zeros((n, 12), np.float32)
    for note in notes:
        s = map_fn(note.start) * FPS
        e = map_fn(note.end) * FPS
        i0 = int(round(s))
        if 0 <= i0 < n:
            onset[i0] += note.velocity / 127
        i1 = min(n, max(i0 + 1, int(round(e))))
        t = np.arange(i1 - i0) / FPS
        env = np.exp(-t / 0.6) * 0.8 + 0.2
        # model an instrument's harmonics (octave, 12th, 2 octaves, 17th) so
        # MIDI chroma resembles recorded chroma
        for iv, w in ((0, 1.0), (12, 0.5), (19, 0.33), (24, 0.25), (28, 0.2)):
            chroma[i0:i1, (note.pitch + iv) % 12] += w * env
    return {"onset": onset, "chroma": chroma}


def _smooth_env(x, sigma_frames=2.0):
    r = int(3 * sigma_frames) + 1
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma_frames) ** 2)
    return np.convolve(x, k / k.sum(), mode="same")


def _norm(x):
    x = x - x.mean()
    return x / (np.linalg.norm(x) + 1e-9)


def estimate_tuning(y):
    """Recording tuning offset in semitones (+0.1 = 10 cents sharp of A440)."""
    N, H = 8192, 4096
    w = np.hanning(N)
    fr = np.fft.rfftfreq(N, 1 / SR)
    devs, wts = [], []
    for i in range(0, len(y) - N, H):
        m = np.abs(np.fft.rfft(y[i:i + N] * w))
        pk = np.where((m[1:-1] > m[:-2]) & (m[1:-1] > m[2:]) & (fr[1:-1] > 80) & (fr[1:-1] < 2000))[0] + 1
        if not len(pk):
            continue
        pk = pk[np.argsort(m[pk])[-6:]]
        a, b, c = (np.log(m[pk + d] + 1e-9) for d in (-1, 0, 1))
        den = a - 2 * b + c
        d = np.where(np.abs(den) > 1e-9, 0.5 * (a - c) / np.where(den == 0, 1, den), 0)
        midi = 69 + 12 * np.log2((pk + d) * SR / N / 440)
        devs.extend(midi - np.round(midi))
        wts.extend(m[pk])
    if not devs:
        return 0.0
    devs, wts = np.array(devs), np.array(wts)
    return float(np.angle(np.sum(wts * np.exp(2j * np.pi * devs))) / (2 * np.pi))


def tuned_chroma(y, tuning, n_frames=None):
    """Chroma from semitone-band energies (MIDI 36..107) of a 4096-point STFT.

    Each semitone band is averaged (not summed) so low notes, which cover few
    FFT bins, weigh as much as high ones.  Frames are centred like the
    2048-point analysis frames so all features share one timeline."""
    n2 = 4096
    pad = (n2 - NFFT) // 2
    yp = np.concatenate([np.zeros(pad, y.dtype), y, np.zeros(pad, y.dtype)])
    win = np.hanning(n2).astype(np.float32)
    n = 1 + max(0, (len(yp) - n2) // HOP)
    fr = np.fft.rfftfreq(n2, 1 / SR)
    out = np.zeros((n, 12), np.float32)
    bands = []
    for p in range(36, 108):
        f0 = 440 * 2 ** ((p - 69 + tuning) / 12)
        lo_, hi_ = f0 * 2 ** (-0.5 / 12), f0 * 2 ** (0.5 / 12)
        idx = np.where((fr >= lo_) & (fr < hi_))[0]
        if not len(idx):
            idx = np.array([int(np.argmin(np.abs(fr - f0)))])
        bands.append((p % 12, idx))
    for c0 in range(0, n, 512):
        c1 = min(n, c0 + 512)
        idx = np.arange(n2)[None, :] + HOP * np.arange(c0, c1)[:, None]
        mag = np.abs(np.fft.rfft(yp[np.minimum(idx, len(yp) - 1)] * win, axis=1))
        for pc, bi in bands:
            out[c0:c1, pc] += np.log1p(100 * mag[:, bi].mean(axis=1))
    if n_frames is not None:
        if len(out) < n_frames:
            out = np.vstack([out, np.zeros((n_frames - len(out), 12), np.float32)])
        out = out[:n_frames]
    return out


def estimate_transpose(notes, chroma):
    """Semitone shift (-6..+5) that best maps the MIDI key onto the recording."""
    h = np.zeros(12)
    for n in notes:
        if not n.is_drum:
            for iv, w in ((0, 1.0), (12, 0.5), (19, 0.33), (24, 0.25), (28, 0.2)):
                h[(n.pitch + iv) % 12] += w * (n.end - n.start)
    a = chroma.sum(axis=0)
    a = (a - a.mean()) / (a.std() + 1e-9)
    h = (h - h.mean()) / (h.std() + 1e-9)
    scores = {k: float(np.dot(np.roll(h, k), a)) / 12 for k in range(-6, 6)}
    return sorted(scores.items(), key=lambda kv: -kv[1])


def _pool(x, f):
    n = len(x) // f
    return x[:n * f].reshape(n, f, *x.shape[1:]).mean(axis=1)


def dtw_path(M, A, start_range, end_range):
    """DTW with free start/end inside the given audio column ranges."""
    C = 1.0 - M @ A.T
    n, m = C.shape
    INF = np.float32(1e18)
    D = np.full((n, m), INF, np.float32)
    P = np.zeros((n, m), np.int8)
    s0, s1 = max(0, start_range[0]), min(m, max(start_range[1], start_range[0] + 1))
    D[0, s0:s1] = C[0, s0:s1]
    for i in range(1, n):
        cand = np.full((3, m), INF, np.float32)
        # every step pays for each cell it passes through, so skipping
        # material in either sequence is never free
        cand[0, 1:] = D[i - 1, :-1]                  # (1,1)
        cand[1, 2:] = D[i - 1, :-2] + C[i, 1:-1]     # (1,2)
        if i >= 2:
            cand[2, 1:] = D[i - 2, :-1] + C[i - 1, 1:]   # (2,1)
        k = np.argmin(cand, axis=0)
        D[i] = cand[k, np.arange(m)] + C[i]
        P[i] = k
    e0, e1 = max(0, end_range[0]), min(m, max(end_range[1], end_range[0] + 1))
    j = int(np.argmin(D[-1, e0:e1])) + e0
    i = n - 1
    end_cost = float(D[-1, j] / n)
    path = [(i, j)]
    while i > 0:
        k = P[i, j]
        if k == 0:
            i, j = i - 1, j - 1
        elif k == 1:
            i, j = i - 1, j - 2
        else:
            i, j = i - 2, j - 1
        if j < 0:
            break
        path.append((i, j))
    return np.array(path[::-1], float), end_cost


def banded_dtw(M, A, centre, half, start_slack=None):
    """DTW restricted to |col - centre[row]| <= half. Returns path (row, col)."""
    n, m = len(M), len(A)
    W = 2 * half + 1
    starts = np.clip(centre - half, 0, max(0, m - W))
    INF = np.float32(1e18)
    D = np.full((n, W), INF, np.float32)
    P = np.zeros((n, W), np.int8)
    cols0 = starts[0] + np.arange(W)
    D[0] = 1.0 - A[np.minimum(cols0, m - 1)] @ M[0]
    if start_slack is not None:
        D[0, np.abs(cols0 - centre[0]) > start_slack] = INF
    ar = np.arange(W)
    Cprev = D[0].copy()
    for i in range(1, n):
        cols = starts[i] + ar
        c = 1.0 - A[np.minimum(cols, m - 1)] @ M[i]
        cand = np.full((3, W), INF, np.float32)
        # (1,1)
        idx = cols - 1 - starts[i - 1]
        ok = (idx >= 0) & (idx < W)
        cand[0, ok] = D[i - 1, idx[ok]]
        # (1,2): also pays for cell (i, j-1)
        idx = cols - 2 - starts[i - 1]
        ok = (idx >= 0) & (idx < W) & (ar >= 1)
        cand[1, ok] = D[i - 1, idx[ok]] + c[ar[ok] - 1]
        # (2,1): also pays for cell (i-1, j)
        if i >= 2:
            idx = cols - 1 - starts[i - 2]
            idp = cols - starts[i - 1]
            ok = (idx >= 0) & (idx < W) & (idp >= 0) & (idp < W)
            cand[2, ok] = D[i - 2, idx[ok]] + Cprev[idp[ok]]
        Cprev = c
        kk = np.argmin(cand, axis=0)
        D[i] = cand[kk, ar] + c
        P[i] = kk
    j = int(np.argmin(D[-1]))
    i = n - 1
    path = [(i, starts[i] + j)]
    while i > 0:
        di, dj = ((1, 1), (1, 2), (2, 1))[P[i, j]]
        col = starts[i] + j - dj
        i -= di
        if i < 0:
            break
        j = col - starts[i]
        if not 0 <= j < W:
            break
        path.append((i, col))
    return np.array(path[::-1], float)


class TimeMap:
    """midi seconds -> recording seconds (linear, or piecewise via anchors)."""

    def __init__(self, scale=1.0, offset=0.0, anchors=None):
        self.scale, self.offset, self.anchors = scale, offset, anchors

    def __call__(self, t):
        if self.anchors is not None:
            am, aa = self.anchors
            if t <= am[0]:
                return aa[0] + (t - am[0]) * self.scale
            if t >= am[-1]:
                return aa[-1] + (t - am[-1]) * self.scale
            return float(np.interp(t, am, aa))
        return self.scale * t + self.offset

    def describe(self):
        d = {"scale": round(self.scale, 5), "offset_s": round(self.offset, 4)}
        if self.anchors is not None:
            am, aa = self.anchors
            lin = self.scale * am + self.offset
            d["anchors"] = len(am)
            d["max_deviation_from_linear_s"] = round(float(np.max(np.abs(aa - lin))), 3)
        return d


def onset_score(notes, tm, flux):
    """Correlation between mapped MIDI onsets and recording onsets (0..1)."""
    f = _smooth_env(flux, 2.0)
    f = (f - f.mean()) / (f.std() + 1e-9)
    idx = [int(round(tm(n.start) * FPS)) for n in notes]
    idx = [i for i in idx if 0 <= i < len(f)]
    return float(np.mean(f[idx])) if idx else 0.0


def align(notes, length, audio_path, use_dtw=True, transpose=None, band_s=3.0, anchor_s=0.5):
    """Returns (TimeMap, features, info). transpose=None -> auto-detect."""
    y = decode_audio(audio_path)
    feat = audio_features(y)
    tuning = estimate_tuning(y)
    chroma = tuned_chroma(y, tuning, len(feat["flux"]))
    ranked = estimate_transpose(notes, chroma)
    notes_k = [n for n in notes if not n.is_drum]

    # --- coarse DTW at 10 fps ------------------------------------------
    POOL = 5
    fps_pool = FPS / POOL
    mf = midi_features(notes_k, length)
    onset_weight = 0.25

    def feats(ch, on, silent):
        ch = _pool(ch, POOL)
        on = _pool(_smooth_env(on, 2.0)[:, None], POOL)
        on = np.clip((on - on.mean()) / (on.std() + 1e-9), -1, 3)
        sil = _pool(silent.astype(np.float32)[:, None], POOL)
        ch = ch / (np.linalg.norm(ch, axis=1, keepdims=True) + 1e-6) * (1 - sil)
        X = np.hstack([ch, onset_weight * on * (1 - sil), 2.0 * sil])
        return X / (np.linalg.norm(X, axis=1, keepdims=True) + 1e-6)
    nf = len(feat["flux"])
    db = 20 * np.log10(feat["rms"][:nf] + 1e-9)
    a_sil = db < np.percentile(db, 95) - 45
    m_sil = mf["chroma"].sum(axis=1) < 1e-6
    A = feats(chroma[:nf], feat["flux"], a_sil)
    # choose the transposition by DTW cost among the best key candidates
    # music start/end in the recording (first/last non-silent frame)
    loud = np.where(~a_sil)[0]
    a_start, a_end = (loud[0], loud[-1]) if len(loud) else (0, nf - 1)
    m_start = min(n.start for n in notes_k)
    # DTW row 0 is MIDI t=0: the recording's music start minus the MIDI lead-in
    s_col = (a_start / FPS - m_start) * FPS / POOL
    e_col = a_end / POOL
    srange = (int(s_col - 1.5 * fps_pool), int(s_col + 1.5 * fps_pool))
    erange = (int(e_col - 5 * fps_pool), int(e_col + 1 * fps_pool))
    trials = {}
    cands = [transpose] if transpose is not None else [k for k, _ in ranked[:4]]
    for k in cands:
        M = feats(np.roll(mf["chroma"], k, axis=1), mf["onset"], m_sil)
        trials[k] = dtw_path(M, A, srange, erange)
    k = min(trials, key=lambda kk: trials[kk][1])
    path, cost = trials[k]
    fps_c = FPS / POOL
    mt, at = path[:, 0] / fps_c, path[:, 1] / fps_c

    # --- fine banded DTW at 50 fps around the coarse path ---------------
    def fine(ch, on, silent):
        on = np.clip(((on - on.mean()) / (on.std() + 1e-9)), -1, 4)[:, None]
        sil = silent.astype(np.float32)[:, None]
        ch = ch / (np.linalg.norm(ch, axis=1, keepdims=True) + 1e-6) * (1 - sil)
        X = np.hstack([ch, 0.5 * on * (1 - sil), 2.0 * sil])
        return X / (np.linalg.norm(X, axis=1, keepdims=True) + 1e-6)
    Mf = fine(np.roll(mf["chroma"], k, axis=1), _smooth_env(mf["onset"], 1.0), m_sil)
    Af = fine(chroma[:nf], _smooth_env(feat["flux"], 1.0), a_sil)
    centre = np.interp(np.arange(len(Mf)) / FPS, mt, at) * FPS
    fpath = banded_dtw(Mf, Af, centre.astype(int), int(band_s * FPS), start_slack=int(0.3 * FPS))
    # audio feature frame i is centred NFFT/2 samples after i*HOP
    mt, at = fpath[:, 0] / FPS, fpath[:, 1] / FPS + NFFT / 2 / SR

    am, aa = [], []
    for t in np.arange(0, mt.max() + 1e-9, anchor_s):
        sel = (mt >= t) & (mt < t + anchor_s)
        if sel.any():
            am.append(float(np.median(mt[sel])))
            aa.append(float(np.median(at[sel])))
    am, aa = np.array(am), np.array(aa)
    # enforce monotone, plausible slopes (0.5x..2x)
    for i in range(1, len(aa)):
        dm = am[i] - am[i - 1]
        aa[i] = min(max(aa[i], aa[i - 1] + 0.5 * dm), aa[i - 1] + 2.0 * dm)
    scale, offset = np.polyfit(am, aa, 1)
    lin = TimeMap(float(scale), float(offset))
    tm = TimeMap(float(scale), float(offset), (am, aa) if use_dtw else None)
    info = {
        "method": "dtw" if use_dtw else "linear",
        "audio_length_s": round(len(y) / SR, 3),
        "recording_tuning_cents": round(tuning * 100, 1),
        "transpose_candidates": {int(kk): round(v[1], 4) for kk, v in trials.items()},
        "transpose_used": k,
        "dtw_mean_cost": round(cost, 4),
        "recording_music_start_s": round(float(a_start) / FPS, 3),
        "onset_score_unaligned": round(onset_score(notes_k, TimeMap(), feat["flux"]), 3),
        "onset_score_linear": round(onset_score(notes_k, lin, feat["flux"]), 3),
        "onset_score_final": round(onset_score(notes_k, tm, feat["flux"]), 3),
        **tm.describe(),
    }
    return tm, feat, info, {"tuning": tuning, "transpose": k}


def dynamics_curve(feat, fps, n_frames, time_offset=0.0, floor=7, smooth_s=0.6):
    """Per-C64-frame master volume (floor..15) that follows the recording's loudness."""
    rms = feat["rms"]
    db = 20 * np.log10(rms + 1e-9)
    ref = np.percentile(db, 97)
    t_audio = np.arange(len(db)) / FPS
    t = np.arange(n_frames) / fps + time_offset
    d = np.interp(t, t_audio, db)
    w = max(1, int(smooth_s * fps))
    d = np.convolve(np.pad(d, (w, w), mode="edge"), np.ones(2 * w + 1) / (2 * w + 1), mode="valid")
    lin = np.clip(10 ** ((d - ref) / 20), 0, 1)          # amplitude relative to loud passages
    vol = np.clip(np.round(floor + (15 - floor) * np.sqrt(lin)), floor, 15).astype(int)
    # hysteresis: only move when the change persists (limits 6581 volume clicks)
    out = vol.copy()
    cur = vol[0]
    for i in range(len(vol)):
        if abs(vol[i] - cur) >= 2 or (vol[i] != cur and np.all(vol[i:i + 10] == vol[i])):
            cur = vol[i]
        out[i] = cur
    return out
