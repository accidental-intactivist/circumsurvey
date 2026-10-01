"""Align MIDI time to a reference recording and extract its dynamics.

Two stages:
  1. Global fit  - offset + tempo-scale grid search maximising the correlation
                   between the MIDI onset envelope and the audio onset envelope
                   (spectral flux).  Exact when the recording is a render of
                   the MIDI; a good start when it is a live performance.
  2. DTW (opt.)  - chroma+onset dynamic time warping (step sizes (1,1),(1,2),
                   (2,1),(1,3),(1,4): tempo can locally vary 0.5x..4x, so
                   fermatas and big ritardandos fit), smoothed into a
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


STEPS = ((1, 1), (1, 2), (2, 1), (1, 3), (1, 4))
HOLD_PEN = 0.15        # extra cost of a hold step: used only when the recording really holds


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
        cand = np.full((5, m), INF, np.float32)
        # every step pays for each cell it passes through, so skipping
        # material in either sequence is never free
        cand[0, 1:] = D[i - 1, :-1]                  # (1,1)
        cand[1, 2:] = D[i - 1, :-2] + C[i, 1:-1]     # (1,2)
        if i >= 2:
            cand[2, 1:] = D[i - 2, :-1] + C[i - 1, 1:]   # (2,1)
        # (1,3) and (1,4): the recording holds while the MIDI barely moves
        # (fermatas, caesuras, big ritardandos)
        cand[3, 3:] = D[i - 1, :-3] + C[i, 1:-2] + C[i, 2:-1] + HOLD_PEN
        cand[4, 4:] = D[i - 1, :-4] + C[i, 1:-3] + C[i, 2:-2] + C[i, 3:-1] + 2 * HOLD_PEN
        k = np.argmin(cand, axis=0)
        D[i] = cand[k, np.arange(m)] + C[i]
        P[i] = k
    e0, e1 = max(0, end_range[0]), min(m, max(end_range[1], end_range[0] + 1))
    j = int(np.argmin(D[-1, e0:e1])) + e0
    i = n - 1
    end_cost = float(D[-1, j] / n)
    path = [(i, j)]
    while i > 0:
        di, dj = STEPS[P[i, j]]
        i, j = i - di, j - dj
        if j < 0:
            break
        path.append((i, j))
    return np.array(path[::-1], float), end_cost


def banded_dtw(M, A, centre, half, start_slack=None, end_slack=None, pins=None):
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
        cand = np.full((5, W), INF, np.float32)
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
        # (1,3), (1,4): holds (fermatas); pay for every recording frame covered
        for step, dj in ((3, 3), (4, 4)):
            idx = cols - dj - starts[i - 1]
            ok = (idx >= 0) & (idx < W) & (ar >= dj - 1)
            extra = np.zeros(W, np.float32)
            for q in range(1, dj):
                extra[ar >= q] += c[ar[ar >= q] - q]
            cand[step, ok] = D[i - 1, idx[ok]] + extra[ok] + (dj - 2) * HOLD_PEN
        Cprev = c
        kk = np.argmin(cand, axis=0)
        D[i] = cand[kk, ar] + c
        if pins and i in pins:                       # score anchor: force the path
            D[i, np.abs(cols - pins[i]) > 2] = INF
        P[i] = kk
    last = D[-1].copy()
    if end_slack is not None:
        last[np.abs(starts[-1] + np.arange(W) - centre[-1]) > end_slack] = INF
    j = int(np.argmin(last))
    i = n - 1
    path = [(i, starts[i] + j)]
    while i > 0:
        di, dj = STEPS[P[i, j]]
        col = starts[i] + j - dj
        i -= di
        if i < 0:
            break
        j = col - starts[i]
        if not 0 <= j < W:
            break
        path.append((i, col))
    return np.array(path[::-1], float)


def clamp_tempo(am, aa, lo=0.45, hi=6.0, iters=4):
    """Keep every stretch of the map within [lo, hi] x the overall tempo (0.45x
    still allows a written accelerando; 6x a fermata), so
    no passage is crushed or smeared; forward and backward passes keep both
    ends in place."""
    am, aa = np.asarray(am, float), np.asarray(aa, float).copy()
    if len(am) < 3:
        return aa
    g = (aa[-1] - aa[0]) / max(1e-9, am[-1] - am[0])
    dm = np.diff(am)
    for _ in range(iters):
        for i in range(1, len(aa)):
            aa[i] = min(max(aa[i], aa[i - 1] + lo * g * dm[i - 1]), aa[i - 1] + hi * g * dm[i - 1])
        for i in range(len(aa) - 2, -1, -1):
            aa[i] = min(max(aa[i], aa[i + 1] - hi * g * dm[i]), aa[i + 1] - lo * g * dm[i])
    return aa


def onset_peaks(flux):
    """Onset times (s) and strengths from the (latency-aligned) flux curve."""
    f = _smooth_env(flux, 1.0)
    base = np.convolve(np.pad(f, 25, mode="edge"), np.ones(51) / 51, mode="valid")
    thr = base + 0.5 * f.std()
    idx = np.where((f[1:-1] > f[:-2]) & (f[1:-1] >= f[2:]) & (f[1:-1] > thr[1:-1]))[0] + 1
    a, b, c = f[idx - 1], f[idx], f[idx + 1]
    den = a - 2 * b + c
    frac = np.where(np.abs(den) > 1e-12, 0.5 * (a - c) / np.where(den == 0, 1, den), 0.0)
    times = (idx + frac) / FPS + NFFT / 2 / SR
    return times, (b - base[idx]) / (f.std() + 1e-9)


def snap_onsets(notes, am, aa, flux, reach=0.2, sigma=0.1):
    """Pull the time map onto the recording's actual onsets.

    Each MIDI onset cluster (notes starting together) is matched to the
    strongest nearby recording onset.  The per-cluster corrections are
    median-smoothed over neighbouring clusters and outliers rejected, so a
    single wrong match cannot create a glitch; the result also removes any
    constant latency left by the feature-based alignment."""
    ptimes, pstr = onset_peaks(flux)
    starts = sorted(n.start for n in notes)
    clusters = []
    for t in starts:
        if clusters and t - clusters[-1][-1] < 0.03:
            clusters[-1].append(t)
        else:
            clusters.append([t])
    ct = np.array([c[0] for c in clusters])
    cw = np.array([len(c) for c in clusters], float)
    m = np.interp(ct, am, aa)
    delta = np.full(len(ct), np.nan)
    claim = {}                      # recording onset -> (score, cluster): one-to-one
    for i, (t, mm) in enumerate(zip(ct, m)):
        sel = np.where(np.abs(ptimes - mm) <= reach)[0]
        if len(sel):
            sc = pstr[sel] * np.exp(-0.5 * ((ptimes[sel] - mm) / sigma) ** 2)
            j = sel[int(np.argmax(sc))]
            if sc.max() > 0.3 and (j not in claim or sc.max() > claim[j][0]):
                if j in claim:
                    delta[claim[j][1]] = np.nan
                claim[j] = (sc.max(), i)
                delta[i] = ptimes[j] - mm
    ok = ~np.isnan(delta)
    if ok.sum() < 8:
        return am, aa, {"onset_snap_matched_pct": round(100 * ok.mean(), 1)}
    # robust local consensus: median of the 9 nearest matched clusters
    idx = np.where(ok)[0]
    med = np.empty(len(ct))
    for i in range(len(ct)):
        near = idx[np.argsort(np.abs(idx - i))[:9]]
        med[i] = np.median(delta[near])
    use = ok & (np.abs(delta - med) < 0.08)
    corr = np.where(use, delta, med)
    new_a = m + corr
    # keep original anchors outside the clustered span, monotone overall
    before, after = am < ct[0] - 0.25, am > ct[-1] + 0.25
    am2 = np.concatenate([am[before], ct, am[after]])
    aa2 = np.concatenate([aa[before] + corr[0], new_a, aa[after] + corr[-1]])
    order = np.argsort(am2, kind="stable")
    am2, aa2 = am2[order], aa2[order]
    keep = np.concatenate([[True], np.diff(am2) > 1e-4])
    am2, aa2 = am2[keep], clamp_tempo(am2[keep], aa2[keep])
    return am2, aa2, {"onset_snap_matched_pct": round(100 * use.mean(), 1),
                      "onset_snap_median_correction_ms": round(1000 * float(np.median(corr)), 1)}


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
    # flux frame i reports an onset at about i/FPS + NFFT/2/SR
    idx = [int(round((tm(n.start) - NFFT / 2 / SR) * FPS)) for n in notes]
    idx = [i for i in idx if 0 <= i < len(f)]
    return float(np.mean(f[idx])) if idx else 0.0


def render_midi(notes, length, sr=SR):
    """Plain additive render of the MIDI (MIDI time) used as the alignment
    reference: comparing audio with audio through the same analysis is far
    less ambiguous than comparing audio with symbolic note features, and the
    analysis latencies of both sides cancel."""
    y = np.zeros(int((length + 1.0) * sr), np.float32)
    for n in notes:
        s0 = int(n.start * sr)
        dur = max(0.05, n.end - n.start)
        m = int(min(dur + 0.15, 4.0) * sr)
        t = np.arange(m) / sr
        f0 = 440.0 * 2 ** ((n.pitch - 69) / 12)
        env = np.exp(-t / 0.9) * np.minimum(1, t / 0.004)
        rel = t > dur
        env[rel] *= np.exp(-(t[rel] - dur) / 0.05)
        sig = np.zeros(m, np.float32)
        for h, a in ((1, 1.0), (2, 0.5), (3, 0.3), (4, 0.2)):
            if f0 * h < sr / 2:
                sig += a * np.sin(2 * np.pi * f0 * h * t)
        y[s0:s0 + m] += (n.velocity / 127) * env * sig[:len(y) - s0]
    return y / (np.abs(y).max() + 1e-9)


def _mapped(notes, am, aa):
    class N:
        __slots__ = ("start", "end", "pitch", "velocity")
    out = []
    for n in notes:
        m = N()
        m.start, m.end = float(np.interp(n.start, am, aa)), float(np.interp(n.end, am, aa))
        m.end = max(m.end, m.start + 0.03)
        m.pitch, m.velocity = n.pitch, n.velocity
        out.append(m)
    return out


def _centred(ch):
    ch = ch - ch.mean(axis=1, keepdims=True)
    return ch / (np.linalg.norm(ch, axis=1, keepdims=True) + 1e-9)


def lag_curve(A, Ao, B, Bo, win_s=3.0, hop_s=0.75, max_lag_s=1.2):
    """Local lag (s) of B relative to A: B[t + lag] matches A[t].
    Returns window centres (s), lags (s), confidence."""
    W, L = int(win_s * FPS), int(max_lag_s * FPS)
    n = min(len(A), len(B))
    cs, ls, cf = [], [], []
    for c in range(W, n - W, int(hop_s * FPS)):
        a, ao = A[c - W:c + W], Ao[c - W:c + W]
        best, bl, scores = -9.0, 0, []
        for lag in range(-L, L + 1):
            if c - W + lag < 0 or c + W + lag > n:
                scores.append(-9.0)
                continue
            v = float((a * B[c - W + lag:c + W + lag]).sum(1).mean())
            v += 0.15 * float(np.dot(ao, Bo[c - W + lag:c + W + lag]) / len(ao))
            scores.append(v)
            if v > best:
                best, bl = v, lag
        sc = np.array(scores)
        cs.append(c / FPS)
        ls.append(bl / FPS)
        cf.append(best - np.median(sc[sc > -9]))
    return np.array(cs), np.array(ls), np.array(cf)


def refine_by_lag(notes, am, aa, rec_chroma, rec_flux, transpose=0, iters=4):
    """Closed-loop correction: render the MIDI at the current map, measure
    where it runs early/late against the recording, shift, repeat."""
    A = _centred(rec_chroma)
    Ao = _smooth_env(rec_flux, 1.5)
    Ao = (Ao - Ao.mean()) / (Ao.std() + 1e-9)
    hist = []
    for it in range(iters):
        ry = render_midi(_mapped(notes, am, aa), float(aa[-1]) + 2.0)
        rf = audio_features(ry)
        B = _centred(np.roll(tuned_chroma(ry, 0.0, len(rf["flux"])), transpose, axis=1))
        Bo = _smooth_env(rf["flux"], 1.5)
        Bo = (Bo - Bo.mean()) / (Bo.std() + 1e-9)
        span = min(len(A), len(B)) / FPS
        cs, ls, cf = lag_curve(A, Ao, B, Bo, win_s=min(3.0, span / 4), hop_s=min(0.75, span / 8))
        if len(cf) < 3:                       # too short to measure (short sections)
            break
        good = cf > np.percentile(cf, 20)
        if good.sum() < 3:
            break
        # median over neighbouring windows: one ambiguous window cannot jump
        gc, gl = cs[good], ls[good]
        lg_good = np.array([np.median(gl[np.abs(gc - c) <= 1.6]) for c in gc])
        lg = np.interp(cs, gc, lg_good)
        hist.append(round(float(np.mean(np.abs(lg))) * 1000, 1))
        if np.mean(np.abs(lg)) < 0.02:
            break
        aa = clamp_tempo(am, aa - np.interp(aa, cs, lg))
    return am, aa, {"lag_refine_mean_abs_ms_per_pass": hist}


def steady_tempo(notes, am, aa, flux, beat_times, bars=4, lurch=1.4, slack=0.03, keep=()):
    """Where the map's tempo lurches within a few bars, try a constant tempo
    between the stretch's endpoints instead and keep it if it explains the
    recording's onsets at least as well (minus a small slack).  Points in
    `keep` (score anchors) are never moved."""
    f = _smooth_env(flux, 1.5)
    f = (f - f.mean()) / (f.std() + 1e-9)
    lat = NFFT / 2 / SR
    starts = np.array(sorted({round(n.start, 3) for n in notes}))
    downs = [t for t, b, bt in beat_times if bt == 1]
    if len(downs) < bars + 1:
        return am, aa, 0

    def score(mapped):
        idx = np.round((mapped - lat) * FPS).astype(int)
        idx = idx[(idx >= 0) & (idx < len(f))]
        return float(f[idx].mean()) if len(idx) else -9.0

    changed = 0
    for k in range(len(downs) - bars):
        m0, m1 = downs[k], downs[k + bars]
        sel = (starts > m0) & (starts < m1)
        if sel.sum() < 4:
            continue
        cur = np.interp(starts[sel], am, aa)
        bar_len = np.diff(np.interp(downs[k:k + bars + 1], am, aa))
        if bar_len.min() <= 0 or bar_len.max() / bar_len.min() < lurch:
            continue
        # steady tempo between the endpoints, passing through any anchors
        xs = [m0] + [kp for kp in keep if m0 < kp < m1] + [m1]
        ys = np.interp(xs, am, aa)
        lin = np.interp(starts[sel], xs, ys)
        if score(lin) >= score(cur) - slack:
            inside = (am > m0) & (am < m1)
            aa = aa.copy()
            aa[inside] = np.interp(am[inside], xs, ys)
            changed += 1
    return am, aa, changed


def pin_map(am, aa, pins, fade_s=1.5, link_s=None):
    """Make the map pass exactly through pins [(midi_t, rec_t)]: corrections
    are linear between pins and fade out over fade_s outside them.  With
    link_s, only pins at most link_s (MIDI s) apart are linked; across a wider
    gap each correction fades out over fade_s, so a pin stays local."""
    if not pins:
        return am, aa
    pins = sorted(pins)
    pm = np.array([p[0] for p in pins])
    pd = np.array([p[1] - float(np.interp(p[0], am, aa)) for p in pins])
    xs, ds = [pm[0] - fade_s], [0.0]
    for k in range(len(pm)):
        xs.append(pm[k]); ds.append(pd[k])
        if k + 1 < len(pm) and link_s is not None and pm[k + 1] - pm[k] > link_s:
            xs += [pm[k] + fade_s, pm[k + 1] - fade_s]; ds += [0.0, 0.0]
    xs.append(pm[-1] + fade_s); ds.append(0.0)
    xs, ds = np.array(xs), np.array(ds)
    # fade points outside the map would sit on its flat extrapolation and,
    # through the monotonicity clamp below, override a pin near either end
    grid = np.union1d(am, xs[(xs >= am[0]) & (xs <= am[-1])])
    grid = np.union1d(grid, pm)
    grid = grid[np.concatenate([[True], np.diff(grid) > 1e-3])]
    new = np.interp(grid, am, aa) + np.interp(grid, xs, ds, left=0.0, right=0.0)
    for m, r in pins:                                # exact at the pins
        new[int(np.argmin(np.abs(grid - m)))] = r
    return grid, np.maximum.accumulate(new)


def straighten_map(am, aa, grid):
    """Keep the map's values at the grid points (bar lines, anchors) and
    interpolate linearly between them; outside the grid the map is kept."""
    am, aa = np.asarray(am, float), np.asarray(aa, float)
    g = np.array(sorted(t for t in grid if am[0] <= t <= am[-1]))
    if len(g) < 2:
        return am, aa
    keep = (am < g[0]) | (am > g[-1])
    new_m = np.concatenate([am[keep], g])
    new_a = np.concatenate([aa[keep], np.interp(g, am, aa)])
    order = np.argsort(new_m)
    return new_m[order], np.maximum.accumulate(new_a[order])


def align(notes, length, audio_path, use_dtw=True, transpose=None, band_s=3.0, anchor_s=0.5, smooth_s=0.0,
          snap=True, pins=None, beat_times=None):
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
    # reference: the MIDI rendered to audio, analysed exactly like the recording
    ry = render_midi(notes_k, length)
    rfeat = audio_features(ry)
    mf = {"chroma": tuned_chroma(ry, 0.0, len(rfeat["flux"])), "onset": rfeat["flux"]}
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
    rdb = 20 * np.log10(rfeat["rms"][:len(rfeat["flux"])] + 1e-9)
    m_sil = rdb < np.percentile(rdb, 95) - 45
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
    if pins:                                         # move the band onto the score anchors
        mt, at = pin_map(mt, at, pins, fade_s=4.0)
    centre = np.interp(np.arange(len(Mf)) / FPS, mt, at) * FPS
    row_pins = {int(round(m * FPS)): int(round(r * FPS)) for m, r in (pins or [])
                if 0 <= int(round(m * FPS)) < len(Mf)}
    fpath = banded_dtw(Mf, Af, centre.astype(int), int(band_s * FPS), start_slack=int(0.3 * FPS),
                       pins=row_pins,
                       end_slack=int(0.5 * FPS))
    # both sides share the analysis latency, so it cancels
    mt, at = fpath[:, 0] / FPS, fpath[:, 1] / FPS

    am, aa = [], []
    for t in np.arange(0, mt.max() + 1e-9, anchor_s):
        sel = (mt >= t) & (mt < t + anchor_s)
        if sel.any():
            am.append(float(np.median(mt[sel])))
            aa.append(float(np.median(at[sel])))
    am, aa = np.array(am), np.array(aa)
    # smooth the map: keeps phrase-level rubato but removes the beat-to-beat
    # jitter that would make evenly spaced notes come out uneven
    if smooth_s > 0 and len(aa) > 3:
        w = max(1, int(round(smooth_s / anchor_s / 2)))
        kern = np.ones(2 * w + 1)
        pad_m = np.pad(am, w, mode="reflect", reflect_type="odd")
        pad_a = np.pad(aa, w, mode="reflect", reflect_type="odd")
        # smooth the offset from a straight line, not the raw times
        lin = np.polyfit(am, aa, 1)
        resid = pad_a - np.polyval(lin, pad_m)
        aa = np.polyval(lin, am) + np.convolve(resid, kern / kern.sum(), mode="valid")
    # enforce monotone, plausible slopes (0.5x..2x)
    for i in range(1, len(aa)):
        dm = am[i] - am[i - 1]
        aa[i] = min(max(aa[i], aa[i - 1] + 0.5 * dm), aa[i - 1] + 2.0 * dm)
    am, aa, lag_info = refine_by_lag(notes_k, am, aa, chroma[:nf], feat["flux"], transpose=k)
    if snap:
        am, aa, snap_info = snap_onsets(notes_k, am, aa, feat["flux"])
    else:
        snap_info = {}
    steadied = 0
    if beat_times:
        # with fine grid points the map is piecewise linear between onsets
        grid = np.union1d(am, np.array(sorted({round(n.start, 3) for n in notes_k})))
        aa = np.interp(grid, am, aa)
        am = grid
        for bars in (4, 6, 8):
            am, aa, c = steady_tempo(notes_k, am, aa, feat["flux"], beat_times, bars=bars,
                                     keep=[p[0] for p in (pins or [])])
            steadied += c
    if pins:                                         # corrections may not move the anchors
        am, aa = pin_map(am, aa, pins)
        aa = clamp_tempo(am, aa)
        am, aa = pin_map(am, aa, pins, fade_s=0.5)
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
        **lag_info,
        **snap_info,
        "steadied_windows": steadied,
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
