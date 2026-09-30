"""Tiny two-pass 6502 assembler used to build the relocatable music player.

The player lives in Python (see player.py) so that the converter has no
external toolchain dependency and can relocate the player + song data to any
load address the game needs.  The assembler also emits an ACME-compatible
source listing so the result can be read, audited or pasted into a game build.

Usage:
    a = Asm(origin=0x1000)
    a.label("init")
    a.op("lda", "#", 0)
    a.op("sta", "abs", "voice_delay", x=True)   # sta voice_delay,x
    a.byte(1, 2, 3)
    code = a.assemble()
"""

from __future__ import annotations

# (mnemonic, mode) -> opcode
# modes: imp, acc, imm, zp, zpx, zpy, abs, absx, absy, ind, indx, indy, rel
OPCODES = {}


def _reg(mn, **modes):
    for mode, code in modes.items():
        OPCODES[(mn, mode)] = code


_reg("adc", imm=0x69, zp=0x65, zpx=0x75, abs=0x6D, absx=0x7D, absy=0x79, indx=0x61, indy=0x71)
_reg("and", imm=0x29, zp=0x25, zpx=0x35, abs=0x2D, absx=0x3D, absy=0x39, indx=0x21, indy=0x31)
_reg("asl", acc=0x0A, zp=0x06, zpx=0x16, abs=0x0E, absx=0x1E)
_reg("bit", zp=0x24, abs=0x2C)
_reg("bpl", rel=0x10); _reg("bmi", rel=0x30); _reg("bvc", rel=0x50); _reg("bvs", rel=0x70)
_reg("bcc", rel=0x90); _reg("bcs", rel=0xB0); _reg("bne", rel=0xD0); _reg("beq", rel=0xF0)
_reg("brk", imp=0x00)
_reg("cmp", imm=0xC9, zp=0xC5, zpx=0xD5, abs=0xCD, absx=0xDD, absy=0xD9, indx=0xC1, indy=0xD1)
_reg("cpx", imm=0xE0, zp=0xE4, abs=0xEC)
_reg("cpy", imm=0xC0, zp=0xC4, abs=0xCC)
_reg("dec", zp=0xC6, zpx=0xD6, abs=0xCE, absx=0xDE)
_reg("eor", imm=0x49, zp=0x45, zpx=0x55, abs=0x4D, absx=0x5D, absy=0x59, indx=0x41, indy=0x51)
_reg("clc", imp=0x18); _reg("sec", imp=0x38); _reg("cli", imp=0x58); _reg("sei", imp=0x78)
_reg("clv", imp=0xB8); _reg("cld", imp=0xD8); _reg("sed", imp=0xF8)
_reg("inc", zp=0xE6, zpx=0xF6, abs=0xEE, absx=0xFE)
_reg("jmp", abs=0x4C, ind=0x6C)
_reg("jsr", abs=0x20)
_reg("lda", imm=0xA9, zp=0xA5, zpx=0xB5, abs=0xAD, absx=0xBD, absy=0xB9, indx=0xA1, indy=0xB1)
_reg("ldx", imm=0xA2, zp=0xA6, zpy=0xB6, abs=0xAE, absy=0xBE)
_reg("ldy", imm=0xA0, zp=0xA4, zpx=0xB4, abs=0xAC, absx=0xBC)
_reg("lsr", acc=0x4A, zp=0x46, zpx=0x56, abs=0x4E, absx=0x5E)
_reg("nop", imp=0xEA)
_reg("ora", imm=0x09, zp=0x05, zpx=0x15, abs=0x0D, absx=0x1D, absy=0x19, indx=0x01, indy=0x11)
_reg("tax", imp=0xAA); _reg("txa", imp=0x8A); _reg("dex", imp=0xCA); _reg("inx", imp=0xE8)
_reg("tay", imp=0xA8); _reg("tya", imp=0x98); _reg("dey", imp=0x88); _reg("iny", imp=0xC8)
_reg("rol", acc=0x2A, zp=0x26, zpx=0x36, abs=0x2E, absx=0x3E)
_reg("ror", acc=0x6A, zp=0x66, zpx=0x76, abs=0x6E, absx=0x7E)
_reg("rti", imp=0x40); _reg("rts", imp=0x60)
_reg("sbc", imm=0xE9, zp=0xE5, zpx=0xF5, abs=0xED, absx=0xFD, absy=0xF9, indx=0xE1, indy=0xF1)
_reg("sta", zp=0x85, zpx=0x95, abs=0x8D, absx=0x9D, absy=0x99, indx=0x81, indy=0x91)
_reg("stx", zp=0x86, zpy=0x96, abs=0x8E)
_reg("sty", zp=0x84, zpx=0x94, abs=0x8C)
_reg("txs", imp=0x9A); _reg("tsx", imp=0xBA); _reg("pha", imp=0x48); _reg("pla", imp=0x68)
_reg("php", imp=0x08); _reg("plp", imp=0x28)

SIZES = {"imp": 1, "acc": 1, "imm": 2, "zp": 2, "zpx": 2, "zpy": 2, "abs": 3,
         "absx": 3, "absy": 3, "ind": 3, "indx": 2, "indy": 2, "rel": 2}


class AsmError(Exception):
    pass


class Expr:
    """A deferred expression: label name, optional offset and byte selector."""

    def __init__(self, name, offset=0, part=None):
        self.name, self.offset, self.part = name, offset, part

    def __add__(self, n):
        return Expr(self.name, self.offset + n, self.part)

    def resolve(self, labels):
        if self.name not in labels:
            raise AsmError(f"undefined label {self.name!r}")
        v = labels[self.name] + self.offset
        if self.part == "lo":
            return v & 0xFF
        if self.part == "hi":
            return (v >> 8) & 0xFF
        return v

    def text(self):
        s = self.name + (f"+{self.offset}" if self.offset > 0 else f"{self.offset}" if self.offset else "")
        if self.part == "lo":
            return f"<({s})" if self.offset else f"<{s}"
        if self.part == "hi":
            return f">({s})" if self.offset else f">{s}"
        return s


def lo(name, off=0):
    return Expr(name, off, "lo")


def hi(name, off=0):
    return Expr(name, off, "hi")


def L(name, off=0):
    return Expr(name, off)


def _val(v, labels):
    if isinstance(v, Expr):
        return v.resolve(labels)
    if isinstance(v, str):
        return Expr(v).resolve(labels)
    return int(v)


def _txt(v):
    if isinstance(v, Expr):
        return v.text()
    if isinstance(v, str):
        return v
    return f"${v:02x}" if v < 256 else f"${v:04x}"


INVERSE = {"bpl": "bmi", "bmi": "bpl", "bvc": "bvs", "bvs": "bvc", "bcc": "bcs", "bcs": "bcc",
           "bne": "beq", "beq": "bne"}


class Asm:
    def __init__(self, origin: int):
        self.origin = origin
        self.items = []          # (kind, payload)
        self.labels = {}
        self.equates = {}
        self.long_branches = set()   # item indices relaxed to "inverse branch + JMP"

    # --- directives -----------------------------------------------------
    def equ(self, name, value):
        self.equates[name] = value

    def label(self, name):
        self.items.append(("label", name))

    def comment(self, text):
        self.items.append(("comment", text))

    def byte(self, *vals):
        self.items.append(("byte", list(vals)))

    def word(self, *vals):
        self.items.append(("word", list(vals)))

    def op(self, mn, mode="imp", arg=None, x=False, y=False):
        """Emit an instruction.

        mode: 'imp', 'acc', '#' (immediate), 'zp', 'abs', 'ind', '(zp),y', '(zp,x)'
        For branches pass mode='rel' (or just the label as mode for convenience).
        x/y select the indexed variant of zp/abs.
        """
        mn = mn.lower()
        if mode == "#":
            mode = "imm"
        elif mode == "(zp),y":
            mode = "indy"
        elif mode == "(zp,x)":
            mode = "indx"
        elif mode in ("zp", "abs"):
            if x:
                mode += "x"
            elif y:
                mode += "y"
        if (mn, "rel") in OPCODES:
            if mode not in ("rel",):
                arg, mode = mode, "rel"
        if (mn, mode) not in OPCODES:
            raise AsmError(f"bad addressing mode {mn} {mode}")
        self.items.append(("op", (mn, mode, arg)))

    # --- assembly -------------------------------------------------------
    def _size(self, idx, p):
        if p[1] == "rel" and idx in self.long_branches:
            return 5
        return SIZES[p[1]]

    def _layout(self):
        pc = self.origin
        labels = dict(self.equates)
        for idx, (kind, p) in enumerate(self.items):
            if kind == "label":
                if p in labels:
                    raise AsmError(f"duplicate label {p}")
                labels[p] = pc
            elif kind == "byte":
                pc += len(p)
            elif kind == "word":
                pc += 2 * len(p)
            elif kind == "op":
                pc += self._size(idx, p)
        return labels, pc

    def assemble(self):
        self.relax()
        return self._emit()

    def relax(self):
        """Branch relaxation: out-of-range branches become "inverse branch +3; JMP target".
        Returns the final label map (call before reading addresses of later items)."""
        while True:
            labels, end = self._layout()
            pc, grew = self.origin, False
            for idx, (kind, p) in enumerate(self.items):
                if kind == "op":
                    if p[1] == "rel" and idx not in self.long_branches:
                        off = _val(p[2], labels) - (pc + 2)
                        if not -128 <= off <= 127:
                            self.long_branches.add(idx)
                            grew = True
                            break
                    pc += self._size(idx, p)
                elif kind == "byte":
                    pc += len(p)
                elif kind == "word":
                    pc += 2 * len(p)
            if not grew:
                return labels

    def _emit(self):
        labels, end = self._layout()
        self.labels = labels
        out = bytearray()
        pc = self.origin
        listing = [f"; generated by midi2sid asm6502", f"* = ${self.origin:04x}", ""]
        for name, v in sorted(self.equates.items(), key=lambda kv: kv[1]):
            listing.append(f"{name} = ${v:04x}" if v > 255 else f"{name} = ${v:02x}")
        listing.append("")
        for idx, (kind, p) in enumerate(self.items):
            if kind == "label":
                listing.append(f"{p}")
            elif kind == "comment":
                listing.append(f"        ; {p}")
            elif kind == "byte":
                vals = [_val(v, labels) & 0xFF for v in p]
                out += bytes(vals)
                for i in range(0, len(p), 16):
                    listing.append("        !byte " + ",".join(_txt(v) for v in p[i:i + 16]))
                pc += len(p)
            elif kind == "word":
                for v in p:
                    w = _val(v, labels)
                    out += bytes([w & 0xFF, (w >> 8) & 0xFF])
                listing.append("        !word " + ",".join(_txt(v) for v in p))
                pc += 2 * len(p)
            elif kind == "op":
                mn, mode, arg = p
                if mode == "rel" and idx in self.long_branches:
                    target = _val(arg, labels)
                    out += bytes([OPCODES[(INVERSE[mn], "rel")], 3, 0x4C, target & 0xFF, target >> 8])
                    listing.append(f"        {INVERSE[mn]} *+5")
                    listing.append(f"        jmp {_txt(arg)}")
                    pc += 5
                    continue
                code = OPCODES[(mn, mode)]
                size = SIZES[mode]
                out.append(code)
                if mode == "rel":
                    target = _val(arg, labels)
                    off = target - (pc + 2)
                    if not -128 <= off <= 127:
                        raise AsmError(f"branch out of range at ${pc:04x} -> {arg}")
                    out.append(off & 0xFF)
                elif size == 2:
                    v = _val(arg, labels)
                    if mode != "imm" and v > 0xFF:
                        raise AsmError(f"zero-page operand too large: {mn} {arg}")
                    out.append(v & 0xFF)
                elif size == 3:
                    v = _val(arg, labels)
                    out += bytes([v & 0xFF, (v >> 8) & 0xFF])
                listing.append("        " + _fmt(mn, mode, arg))
                pc += size
        assert pc == end
        self.listing = "\n".join(listing) + "\n"
        return bytes(out)


def _fmt(mn, mode, arg):
    a = _txt(arg) if arg is not None else ""
    return {
        "imp": mn, "acc": mn, "imm": f"{mn} #{a}", "zp": f"{mn} {a}", "zpx": f"{mn} {a},x",
        "zpy": f"{mn} {a},y", "abs": f"{mn} {a}", "absx": f"{mn} {a},x", "absy": f"{mn} {a},y",
        "ind": f"{mn} ({a})", "indx": f"{mn} ({a},x)", "indy": f"{mn} ({a}),y", "rel": f"{mn} {a}",
    }[mode]
