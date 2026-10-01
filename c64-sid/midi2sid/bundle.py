"""Build several converted tunes into ONE player binary / multi-tune .sid.

The tunes share the player code, the frequency table and the instrument
table, and are compressed together (a phrase repeated in two sections is
stored once).  The game picks a tune by calling init with A = tune number:

    lda #3          ; tune 3 (0-based)
    jsr $1000       ; init
    ...             ; then jsr $1003 once per frame, as for a single tune

In a .sid player the tunes show up as subtunes 1..n.
"""

from __future__ import annotations

import json
import os

import numpy as np

from . import compiler, emulate, psid
from .compiler import INSTR, Tok
from .player import build_player


def merge_instruments(builds):
    """One instrument table for all tunes; returns (insts, per-tune index maps)."""
    insts, keys, maps = [], {}, []
    for b in builds:
        m = {}
        for i, inst in enumerate(b["insts"]):
            k = json.dumps(inst.to_json(), sort_keys=True)
            if k not in keys:
                keys[k] = len(insts)
                insts.append(inst)
            m[i] = keys[k]
        maps.append(m)
    if len(insts) > 255:
        raise ValueError("more than 255 distinct instruments")
    return insts, maps


def bundle(builds, out_base, load_addr=0x1000, zp=0xFB, video="pal", model="6581", loop=True,
           title="", author="", released="", verify=True, render_wav=True, compress=True):
    """builds: the report["_build"] dicts returned by convert(), in tune order."""
    if not builds:
        raise ValueError("nothing to bundle")
    clocks = {b["clock"] for b in builds}
    tunings = {round(float(b["tuning"]), 4) for b in builds}
    if len(clocks) > 1:
        raise ValueError("tunes were converted for different video standards")
    if len(tunings) > 1:
        # the frequency table is shared; tunes would need the same tuning
        raise ValueError(f"tunes use different tunings {sorted(tunings)}; convert them with "
                         "the same --tuning-cents to bundle them")
    insts, maps = merge_instruments(builds)
    streams = []
    for b, m in zip(builds, maps):
        for s in b["streams"]:
            streams.append([Tok(t.op, (m[t.args[0]],), t.dur) if t.op == INSTR else t for t in s])
    items = compiler.compress(streams, enabled=compress)
    assert compiler.expand(items) == streams
    n = len(builds)
    code, asm = build_player(load_addr, insts, items, clock=builds[0]["clock"],
                             tuning=builds[0]["tuning"], zp=zp, loop=loop, n_songs=n,
                             layout_fn=lambda addr: compiler.layout(items, addr, loop=loop))
    if load_addr + len(code) > 0xD000:
        raise ValueError("bundle does not fit below $D000; lower the load address")
    labels = asm.labels
    report = {
        "tunes": [{"tune": i, "title": b["title"], "frames": b["n_frames"],
                   "seconds": round(b["n_frames"] / (50.0 if video == "pal" else 60.0), 2)}
                  for i, b in enumerate(builds)],
        "memory": {"load": f"${load_addr:04X}", "end": f"${load_addr + len(code) - 1:04X}",
                   "total_bytes": len(code), "player_bytes": labels["sidoff"] - load_addr,
                   "instruments": len(insts),
                   "song_bytes": load_addr + len(code) - labels["song"],
                   "init": f"${load_addr:04X} (A = tune 0..{n - 1})",
                   "play": f"${load_addr + 3:04X}",
                   "frame_counter": f"${labels['frame_lo']:04X}",
                   "zero_page": f"${zp:02X}-${zp + 1:02X}"},
    }
    os.makedirs(os.path.dirname(os.path.abspath(out_base)), exist_ok=True)
    psid.write_psid(out_base + ".sid", code, load_addr, load_addr, load_addr + 3, title, author,
                    released, video, model, songs=n, start_song=1)
    psid.write_prg(out_base + ".prg", code, load_addr)
    with open(out_base + ".asm", "w") as f:
        f.write(asm.listing)

    if verify or render_wav:
        from .convert import verify as verify_tune
        report["verification"], report["cpu_max_cycles_per_frame"] = [], 0
        pcm_all = []
        for i, b in enumerate(builds):
            iw, fw, cycles = emulate.run(code, load_addr, load_addr, load_addr + 3, b["n_frames"],
                                         video, song=i)
            report["cpu_max_cycles_per_frame"] = max(report["cpu_max_cycles_per_frame"], int(max(cycles)))
            if verify:
                v = verify_tune(fw, streams[4 * i:4 * i + 4], b["n_frames"])
                report["verification"].append({"tune": i, **v})
            if render_wav:
                pcm = emulate.render(iw, fw, video, model)
                emulate.write_wav(f"{out_base}_tune{i + 1:02d}.wav", pcm)
                pcm_all.append(pcm)
        if verify:
            report["verified"] = all(v["ok"] for v in report["verification"])
        if render_wav:
            # every tune back to back, as a game would chain them
            emulate.write_wav(out_base + ".wav", np.concatenate(pcm_all))
    with open(out_base + ".report.json", "w") as f:
        json.dump(report, f, indent=2)
    return report
