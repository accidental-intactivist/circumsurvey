"""PSID v2 file writer (the .sid format played by SIDPlay, VICE's VSID, HVSC tools)."""

import struct


def _str32(s):
    b = s.encode("latin-1", "replace")[:32]
    return b + b"\0" * (32 - len(b))


def write_psid(path, binary, load_addr, init_addr, play_addr, name="", author="", released="",
               video="pal", model="6581", songs=1, start_song=1):
    clock = {"pal": 1, "ntsc": 2, "any": 3}[video]
    sid = {"6581": 1, "8580": 2, "any": 3}[model]
    flags = (clock << 2) | (sid << 4)
    header = b"PSID" + struct.pack(">HHHHHHHI", 2, 0x7C, 0, init_addr, play_addr, songs, start_song, 0)
    header += _str32(name) + _str32(author) + _str32(released)
    header += struct.pack(">HBBBB", flags, 0, 0, 0, 0)
    assert len(header) == 0x7C
    with open(path, "wb") as f:
        f.write(header + struct.pack("<H", load_addr) + binary)


def write_prg(path, binary, load_addr):
    with open(path, "wb") as f:
        f.write(struct.pack("<H", load_addr) + binary)
