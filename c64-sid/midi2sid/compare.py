"""Side-by-side checks against the reference recording.

  python -m midi2sid.compare OUT.report.json [RECORDING]

writes
  OUT.sync-check.mp3  recording on the left channel, SID on the right, time-aligned
  OUT.compare.png     MIDI parts / what the SID actually plays / recording spectrogram
The SID piano roll is read back from the emulated chip registers, so it shows
exactly what the 6502 player does.
"""

import json
import subprocess
import sys

import numpy as np


def stereo_check(recording, sid_wav, start_s, out_mp3):
    delay_ms = int(round(start_s * 1000))
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", recording, "-i", sid_wav, "-filter_complex",
        f"[0:a]aformat=channel_layouts=mono[a];"
        f"[1:a]aformat=channel_layouts=mono,adelay={delay_ms},volume=0.8[b];"
        f"[a][b]join=inputs=2:channel_layout=stereo[o]",
        "-map", "[o]", "-b:a", "160k", out_mp3], check=True)


def sid_roll(report):
    from . import emulate
    from .player import freq_table, PAL_CLOCK, NTSC_CLOCK
    out = report["output"]
    with open(out + ".prg", "rb") as f:
        data = f.read()
    load = data[0] | data[1] << 8
    _, fw, _ = emulate.run(data[2:], load, load, load + 3, report["frames"], report["video"])
    tr = emulate.register_trace(fw)
    clock = PAL_CLOCK if report["video"] == "pal" else NTSC_CLOCK
    ft = np.array(freq_table(clock, report.get("tuning_cents", 0) / 100))
    notes = []                    # (voice, t0_frame, t1_frame, midi pitch)
    for v in range(3):
        f = tr[:, v * 7] | tr[:, v * 7 + 1] << 8
        gate = tr[:, v * 7 + 4] & 1
        idx = np.abs(ft[None, :] - f[:, None]).argmin(axis=1) + 12
        start = None
        for i in range(len(f) + 1):
            p = idx[i] if i < len(f) and gate[i] else None
            if start is not None and (p != cur):
                notes.append((v, start, i, cur))
                start = None
            if p is not None and start is None:
                start, cur = i, p
    return notes


def plot(report, recording, out_png, t0=None, seconds=30):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from .midi_in import load_midi
    from . import audio_align as aa

    song = load_midi(report["input"])
    fps = report["fps"]
    lead = report.get("sid_starts_at_recording_s", report.get("sid_starts_at_midi_s", 0))
    al = report.get("alignment", {})
    if "anchors_midi_s" in al:
        am, ar = np.array(al["anchors_midi_s"]), np.array(al["anchors_recording_s"])
        tmap = lambda t: float(np.interp(t, am, ar))          # noqa: E731
    elif al:
        tmap = lambda t: al["scale"] * t + al["offset_s"]      # noqa: E731
    else:
        tmap = lambda t: t                                     # noqa: E731
    t0 = lead if t0 is None else t0
    t1 = t0 + seconds
    tr = report.get("transpose", 0)
    rows = 3 if recording else 2
    fig, axes = plt.subplots(rows, 1, figsize=(18, 4 * rows), sharex=True, facecolor="#0e0e10")
    colors = ["#5b93c7", "#d94f4f", "#e8c868", "#8bb8d9", "#e8a44a", "#a0a0a0"]
    for ax in axes:
        ax.set_facecolor("#18181c")
        ax.tick_params(colors="#8a8a96")
        for sp in ax.spines.values():
            sp.set_color("#222228")
    ax = axes[0]
    names = {p.index: p.name for p in song.parts}
    for n in song.notes:
        s, e = tmap(n.start), tmap(n.end)
        if e > t0 and s < t1:
            ax.plot([s, e], [n.pitch + tr] * 2, color=colors[n.track % 6], lw=4, solid_capstyle="butt")
    for i, nm in names.items():
        ax.plot([], [], color=colors[i % 6], lw=4, label=nm)
    ax.legend(loc="upper right", fontsize=8, facecolor="#18181c", labelcolor="#eeeef0")
    ax.set_title("MIDI - all parts (mapped to recording time)", color="#eeeef0", loc="left")
    ax = axes[1]
    roll = sid_roll(report)
    vc = ["#e8a44a", "#5b93c7", "#e8c868"]
    for v, a, b, p in roll:
        s, e = lead + a / fps, lead + b / fps
        if e > t0 and s < t1:
            ax.plot([s, e], [p, p], color=vc[v], lw=4, solid_capstyle="butt")
    for v, lab in enumerate(["voice 1 (bass)", "voice 2 (lead)", "voice 3 (harmony / arpeggio)"]):
        ax.plot([], [], color=vc[v], lw=4, label=lab)
    ax.legend(loc="upper right", fontsize=8, facecolor="#18181c", labelcolor="#eeeef0")
    ax.set_title("SID - read back from the emulated chip (gate + frequency registers)",
                 color="#eeeef0", loc="left")
    if recording:
        ax = axes[2]
        y = aa.decode_audio(recording)
        seg = y[int(t0 * aa.SR):int(t1 * aa.SR)]
        N, H = 4096, 256
        win = np.hanning(N)
        fr = np.fft.rfftfreq(N, 1 / aa.SR)
        frames = np.array([np.abs(np.fft.rfft(seg[i:i + N] * win)) for i in range(0, len(seg) - N, H)])
        pitches = np.arange(36, 97)
        spec = np.zeros((len(frames), len(pitches)))
        for k, p in enumerate(pitches):
            f0 = 440 * 2 ** ((p - 69 + report.get("tuning_cents", 0) / 100) / 12)
            sel = (fr > f0 * 2 ** (-0.5 / 12)) & (fr < f0 * 2 ** (0.5 / 12))
            if sel.any():
                spec[:, k] = frames[:, sel].max(axis=1)
        spec = 20 * np.log10(spec + 1e-6)
        ax.imshow(spec.T, origin="lower", aspect="auto", cmap="magma",
                  extent=[t0, t0 + len(frames) * H / aa.SR, 35.5, 96.5],
                  vmin=spec.max() - 60, vmax=spec.max())
        for v, a, b, p in roll:
            s, e = lead + a / fps, lead + b / fps
            if e > t0 and s < t1:
                ax.plot([s, e], [p, p], color="#8bb8d9", lw=0.8)
        ax.set_title("Recording spectrogram (semitone bins) with SID notes overlaid",
                     color="#eeeef0", loc="left")
    for ax in axes:
        ax.set_ylabel("MIDI pitch", color="#8a8a96")
        ax.set_xlim(t0, t1)
    axes[-1].set_xlabel("seconds (recording timeline)" if recording else "seconds", color="#8a8a96")
    fig.tight_layout()
    fig.savefig(out_png, dpi=90, facecolor=fig.get_facecolor())


def main(argv=None):
    argv = argv or sys.argv[1:]
    rep = json.load(open(argv[0]))
    rec = argv[1] if len(argv) > 1 else None
    out = rep["output"]
    if rec:
        stereo_check(rec, out + ".wav", rep.get("sid_starts_at_recording_s", 0), out + ".sync-check.mp3")
    plot(rep, rec, out + ".compare.png")
    print("wrote", out + ".compare.png", "and", out + ".sync-check.mp3" if rec else "")


if __name__ == "__main__":
    main()
