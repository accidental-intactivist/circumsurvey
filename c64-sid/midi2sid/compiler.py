"""Compile per-voice events into the player's byte-code, with hard restart
and LZ-style repeat compression (CALL into earlier identical data).

Voice stream byte-code (all durations in frames, 1..255):
  $00-$5F dd           NOTE n       : new note n (0 = C-0 ... 95 = B-7), gate on, attack
  $60 dd               OFF          : gate off, normal release
  $61 dd               HARDRESTART  : gate off + ADSR $00/$00 (so the next attack is clean)
  $62 dd               WAIT         : keep going
  $63 ii               INSTR        : select instrument (takes no time)
  $64 nn dd            LEGATO       : change pitch without re-attack, clears arpeggio
  $65 kk n1..nk dd     ARP-NOTE     : attack an arpeggio chord of k notes (2..4)
  $66 kk n1..nk dd     ARP-LEGATO   : change arpeggio chord without re-attack
  $67 lo hi cc         CALL         : play cc commands at lo/hi, then continue here
  $68 lo hi            JUMP         : continue at lo/hi (used for looping)
  $69                  END          : stop (gate off, stays silent)

Global stream:
  $00-$0F dd           VOLUME v (writes $D418)
  $62 dd               WAIT
  $68 lo hi            JUMP
  $69                  END
"""

from __future__ import annotations

from dataclasses import dataclass

NOTE_MAX = 0x5F
OFF, HR, WAIT, INSTR, LEG, ARPN, ARPL, CALL, JUMP, END = range(0x60, 0x6A)
MIN_AUDIBLE = 3          # frames a note sounds before a hard restart may cut it


@dataclass
class Tok:
    op: int
    args: tuple = ()
    dur: int | None = None

    def bytes(self):
        b = [self.op, *self.args]
        if self.dur is not None:
            b.append(self.dur)
        return b

    def size(self):
        return len(self.bytes())

    def key(self):
        return (self.op, self.args, self.dur)


def midi_to_idx(p):
    i = p - 12
    while i < 0:
        i += 12
    while i > 95:
        i -= 12
    return i


def _emit_timed(out, tok_factory, frames):
    """Emit a timed command, splitting durations > 255 with WAITs."""
    first = min(frames, 255)
    out.append(tok_factory(first))
    frames -= first
    while frames > 0:
        d = min(frames, 255)
        out.append(Tok(WAIT, (), d))
        frames -= d


def compile_voice(events, n_frames, hr_frames=2, loop=True):
    """events: VoiceEvent list (sorted by frame). Returns token list."""
    # 1. clean: collapse same-frame events (last wins), drop no-ops
    evs = []
    for e in events:
        if e.frame >= n_frames:
            continue
        if evs and evs[-1].frame == e.frame:
            prev = evs[-1]
            if prev.kind == "attack" and e.kind == "legato":
                e = type(e)(e.frame, "attack", e.notes, e.inst, e.ids)
            evs[-1] = e
        else:
            evs.append(e)
    # 2. insert hard-restart gaps (gate off + fast release) before attacks,
    #    so the SID's ADSR always restarts cleanly (avoids the "ADSR bug")
    timeline = []                     # (frame, kind, event)
    for e in evs:
        if e.kind == "attack" and e.frame > 0 and hr_frames > 0:
            hr_at = e.frame - hr_frames
            last_on = next((t[0] for t in reversed(timeline) if t[1] in ("attack", "legato")), None)
            if last_on is not None:
                # a short note keeps at least MIN_AUDIBLE frames: in fast
                # passages the restart shrinks instead (or the next attack
                # simply retriggers), rather than leaving a 1-frame chirp
                hr_at = max(hr_at, min(last_on + MIN_AUDIBLE, e.frame))
            while timeline and timeline[-1][1] in ("off", "hr") and timeline[-1][0] >= hr_at:
                timeline.pop()
            if hr_at < e.frame:
                timeline.append((hr_at, "hr", None))
        if timeline and timeline[-1][0] == e.frame:
            timeline.pop()
        timeline.append((e.frame, e.kind, e))
    # 3. tokens
    toks = []
    cur_inst = None
    t0 = 0
    if not timeline or timeline[0][0] > 0:
        timeline.insert(0, (0, "off", None))
    for idx, (f, kind, e) in enumerate(timeline):
        nxt = timeline[idx + 1][0] if idx + 1 < len(timeline) else n_frames
        dur = nxt - f
        if dur <= 0:
            continue
        if kind in ("attack", "legato") and e.inst != cur_inst:
            toks.append(Tok(INSTR, (e.inst,)))
            cur_inst = e.inst
        if kind == "off":
            _emit_timed(toks, lambda d: Tok(OFF, (), d), dur)
        elif kind == "hr":
            _emit_timed(toks, lambda d: Tok(HR, (), d), dur)
        else:
            notes = tuple(midi_to_idx(p) for p in e.notes)
            if len(notes) == 1:
                if kind == "attack":
                    _emit_timed(toks, lambda d, n=notes[0]: Tok(n, (), d), dur)
                else:
                    _emit_timed(toks, lambda d, n=notes[0]: Tok(LEG, (n,), d), dur)
            else:
                op = ARPN if kind == "attack" else ARPL
                _emit_timed(toks, lambda d, ns=notes: Tok(op, (len(ns), *ns), d), dur)
    total = sum(t.dur or 0 for t in toks)
    assert total == n_frames, (total, n_frames)
    return toks


def compile_global(volumes, n_frames):
    toks = []
    i = 0
    while i < n_frames:
        j = i
        while j < n_frames and volumes[j] == volumes[i]:
            j += 1
        _emit_timed(toks, lambda d, v=int(volumes[i]): Tok(v, (), d), j - i)
        i = j
    return toks


# ---------------------------------------------------------------------------
# Repeat compression
# ---------------------------------------------------------------------------
@dataclass
class Ref:
    """A CALL into an earlier literal range (stream index, token index, count)."""
    stream: int
    start: int
    count: int


def compress(streams, min_gain=4, max_count=255, enabled=True):
    """Greedy LZ over command tokens. streams: list of token lists.

    Returns list of item lists: each item is a Tok (literal) or a Ref.
    References only point at literal runs so the CALL target is contiguous.
    """
    out = []
    # index of literal positions: key(tok) -> list of (stream, pos-in-literal-list)
    literal_lists = []                   # per stream: list of Tok actually stored literally
    index = {}
    for si, toks in enumerate(streams):
        items, lits = [], []
        i = 0
        while i < len(toks):
            best_len, best_ref = 0, None
            if enabled and si < len(streams):
                for (sj, pj) in index.get(toks[i].key(), ()):
                    src = literal_lists[sj] if sj < si else lits
                    L, gain_bytes = 0, 0
                    while (i + L < len(toks) and pj + L < len(src) and L < max_count
                           and src[pj + L] is not None and src[pj + L].key() == toks[i + L].key()
                           and (sj < si or pj + L < len(lits))):
                        gain_bytes += toks[i + L].size()
                        L += 1
                    if gain_bytes - 4 >= min_gain and gain_bytes > best_len:
                        best_len, best_ref, best_L = gain_bytes, (sj, pj), L
            if best_ref is not None:
                items.append(Ref(best_ref[0], best_ref[1], best_L))
                # a CALL breaks the literal run: mark a gap so later matches
                # never span across it
                lits.append(None)
                i += best_L
            else:
                index.setdefault(toks[i].key(), []).append((si, len(lits)))
                lits.append(toks[i])
                items.append(toks[i])
                i += 1
        literal_lists.append(lits)
        out.append(items)
    return out


def layout(items_per_stream, base_addr, loop=True):
    """Assign addresses; return (bytes, stream start addresses)."""
    # address of each literal token (stream, literal index)
    addr = {}
    starts = []
    pc = base_addr
    for si, items in enumerate(items_per_stream):
        starts.append(pc)
        li = 0
        for it in items:
            if isinstance(it, Tok):
                addr[(si, li)] = pc
                pc += it.size()
                li += 1
            else:
                li += 1                       # the None gap marker
                pc += 4
        pc += 3 if loop else 1                 # JUMP / END
    out = bytearray()
    for si, items in enumerate(items_per_stream):
        for it in items:
            if isinstance(it, Tok):
                out += bytes(it.bytes())
            else:
                a = addr[(it.stream, it.start)]
                out += bytes([CALL, a & 0xFF, a >> 8, it.count])
        if loop:
            s = starts[si]
            out += bytes([JUMP, s & 0xFF, s >> 8])
        else:
            out += bytes([END])
    return bytes(out), starts


def expand(items_per_stream):
    """Undo compression (used by tests to prove it is lossless)."""
    lit = []
    for items in items_per_stream:
        lits = []
        for it in items:
            lits.append(it if isinstance(it, Tok) else None)
        lit.append(lits)
    res = []
    for si, items in enumerate(items_per_stream):
        toks = []
        for it in items:
            if isinstance(it, Tok):
                toks.append(it)
            else:
                seg = lit[it.stream][it.start:it.start + it.count]
                assert all(t is not None for t in seg)
                toks.extend(seg)
        res.append(toks)
    return res
