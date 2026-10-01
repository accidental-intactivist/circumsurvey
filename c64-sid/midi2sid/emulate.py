"""Run the generated 6502 player on an emulated CPU (py65) and feed the SID
register writes, with their cycle timing, into reSID (pyresidfp).

This renders what a real C64 would play: the audio preview is produced from
the very bytes that go into the .sid/.prg, not from a Python approximation.
"""

from __future__ import annotations

import wave

import numpy as np
from py65.devices.mpu6502 import MPU
from py65.memory import ObservableMemory

PAL = dict(clock=985248, cycles=19656)      # 312 lines x 63 cycles
NTSC = dict(clock=1022727, cycles=17095)    # 263 lines x 65 cycles


class C64Sound:
    def __init__(self, binary, load_addr, init_addr, play_addr, video="pal"):
        self.mem = ObservableMemory()
        self.writes = []
        self.mem.subscribe_to_write(range(0xD400, 0xD419), self._on_write)
        for i, b in enumerate(binary):
            self.mem[load_addr + i] = b
        self.mpu = MPU(memory=self.mem)
        self.init_addr, self.play_addr = init_addr, play_addr
        self.video = PAL if video == "pal" else NTSC
        # trampolines: JSR target ; then spin on a JMP to self
        self.mem[0x0340:0x0346] = [0x20, init_addr & 0xFF, init_addr >> 8, 0x4C, 0x43, 0x03]
        self.mem[0x0350:0x0356] = [0x20, play_addr & 0xFF, play_addr >> 8, 0x4C, 0x53, 0x03]
        self.max_cycles = 0

    def _on_write(self, addr, value):
        self.writes.append((self.mpu.processorCycles - self._t0, addr - 0xD400, value & 0xFF))
        return value

    def _call(self, entry, stop):
        self.mpu.pc = entry
        self.mpu.sp = 0xFF
        self._t0 = self.mpu.processorCycles
        steps = 0
        while self.mpu.pc != stop:
            self.mpu.step()
            steps += 1
            if steps > 200000:
                raise RuntimeError("6502 routine did not return (runaway)")
        return self.mpu.processorCycles - self._t0

    def init(self, song=0):
        self.writes = []
        self.mpu.a = song
        self._call(0x0340, 0x0343)
        return self.writes

    def play_frame(self):
        self.writes = []
        cyc = self._call(0x0350, 0x0353)
        self.max_cycles = max(self.max_cycles, cyc)
        return self.writes, cyc


def run(binary, load_addr, init_addr, play_addr, n_frames, video="pal", song=0):
    """Returns (init_writes, [frame_writes], cycles_per_call list)."""
    emu = C64Sound(binary, load_addr, init_addr, play_addr, video)
    iw = emu.init(song)
    frames, cycles = [], []
    for _ in range(n_frames):
        w, c = emu.play_frame()
        frames.append(w)
        cycles.append(c)
    return iw, frames, cycles


def render(init_writes, frame_writes, video="pal", model="6581", sr=44100):
    from pyresidfp import SoundInterfaceDevice
    from pyresidfp._pyresidfp import ChipModel
    v = PAL if video == "pal" else NTSC
    sid = SoundInterfaceDevice(model=ChipModel.MOS8580 if model == "8580" else ChipModel.MOS6581,
                               clock_frequency=float(v["clock"]), sampling_frequency=float(sr))
    core = sid._sid
    for _, reg, val in init_writes:
        core.write(reg, val)
    out = []
    for writes in frame_writes:
        t = 0
        for cyc, reg, val in writes:
            if cyc > t:
                out.extend(core.clock(cyc - t))
                t = cyc
            core.write(reg, val)
        out.extend(core.clock(v["cycles"] - t))
    return np.array(out, dtype=np.int16)


def write_wav(path, samples, sr=44100):
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(samples.astype("<i2").tobytes())


def register_trace(frame_writes):
    """End-of-frame register state per frame (25 regs), plus gate pulses seen."""
    regs = np.zeros(25, np.int32)
    states = []
    for writes in frame_writes:
        for _, reg, val in writes:
            regs[reg] = val
        states.append(regs.copy())
    return np.array(states)
