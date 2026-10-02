"""List a MIDI's notes per part and bar as eighth positions: e3.5:Eb4(0.5,v80) = eighth 3.5, half an eighth long, velocity 80.

usage: python3 tools/midibars.py SONG.mid BAR0 BAR1 [PART_PREFIX]"""
import sys,os
from midi2sid.sections import bar_ticks
names='C C# D Eb E F F# G Ab A Bb B'.split(); nm=lambda p:names[p%12]+str(p//12-1)
bl,s=bar_ticks(sys.argv[1]); b0,b1=int(sys.argv[2]),int(sys.argv[3]); want=sys.argv[4] if len(sys.argv)>4 else None
unit=bl/6
for p in s.parts:
    if want and not p.name.startswith(want): continue
    for b in range(b0,b1+1):
        ns=[n for n in p.notes if (b-1)*bl<=n.start_tick<b*bl]
        if not ns: continue
        print(f"bar {b} {p.name:9}:", ' '.join(f"e{(n.start_tick-(b-1)*bl)/unit+1:g}:{nm(n.pitch)}({(n.end-n.start)/(s.tick_to_sec((b-1)*bl+unit)-s.tick_to_sec((b-1)*bl)):.1f},v{n.velocity})" for n in sorted(ns,key=lambda n:(n.start_tick,-n.pitch))))
