"""Top notes of the MIDI (per onset group) that no SID voice plays, per bar. Uses OUT_BASE.edited.mid (or MIDI=path).

usage: python3 tools/dropped.py OUT_BASE"""
import json,sys,numpy as np
from midi2sid import emulate, player
from midi2sid.midi_in import load_midi
from midi2sid.sections import bar_ticks
base=sys.argv[1]

r=json.load(open(base+'.report.json')); lead=r['sid_starts_at_recording_s']; adv=r.get('anticipate_s',0)
FPSX=r['fps']
al=r['alignment']; am,ar=np.array(al['anchors_midi_s']),np.array(al['anchors_recording_s'])
prg=open(base+'.prg','rb').read()[2:]
n=r['frames']; iw,fw,_=emulate.run(prg,0x1000,0x1000,0x1003,n); tr=emulate.register_trace(fw)
ft=np.array(player.freq_table(player.PAL_CLOCK, r['tuning_cents']/100))
# per frame set of sounding pitches (midi numbers) per voice
snd=[set() for _ in range(n)]
for v in range(3):
    for fi in range(n):
        w=tr[fi,7*v+4]
        if w&1 and not w&0x80:
            snd[fi].add(int(np.abs(ft-(tr[fi,7*v]|tr[fi,7*v+1]<<8)).argmin())+12)
import os; bl,s=bar_ticks(os.environ.get('MIDI', base+'.edited.mid') if os.path.exists(os.environ.get('MIDI', base+'.edited.mid')) else r['input'])
names='C C# D Eb E F F# G Ab A Bb B'.split()
nm=lambda p:names[p%12]+str(p//12-1)
# top note of each onset group = "melody candidate"
from collections import defaultdict
groups=defaultdict(list)
for x in s.notes: groups[x.start_tick].append(x)
miss=defaultdict(list); tot=defaultdict(int)
for tick,g in groups.items():
    top=max(g,key=lambda x:x.pitch)
    b=tick//bl+1
    f0=int(round((np.interp(top.start,am,ar)-lead-adv)*FPSX)); f1=max(f0+3,int(round((np.interp(top.end,am,ar)-lead-adv)*FPSX)))
    if f0<0 or f0>=n: continue
    tot[b]+=1
    heard=any(top.pitch in snd[f] for f in range(max(0,f0),min(n,f0+4)))
    if not heard: miss[b].append(nm(top.pitch))
bad=[(b,len(miss[b]),tot[b],miss[b]) for b in sorted(tot) if len(miss[b])>=2]
print('top notes not heard:',sum(len(v) for v in miss.values()),'of',sum(tot.values()))
for b in bad: print('bar',b[0],f'{b[1]}/{b[2]}',' '.join(b[3]))
