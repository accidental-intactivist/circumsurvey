"""Recording attacks vs SID attacks, interleaved.

usage: python3 tools/cmp.py OUT_BASE RECORDING T0 T1 [THRESHOLD]
(OUT_BASE = converter output path without extension; times in seconds of the recording.)
REC lines: recording attacks with the pitches that rise; sid lines: gate-ons per voice.
A SID attack within ~30 ms of a REC attack is in sync."""
import sys,json,numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import finelib
from midi2sid import emulate, player
base,M,a,b=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4]); thr=float(sys.argv[5]) if len(sys.argv)>5 else 1.0
r=json.load(open(base+'.report.json')); lead=r['sid_starts_at_recording_s']; FPS=r['fps']
prg=open(base+'.prg','rb').read()[2:]
f1=min(r['frames'],int((b-lead)*FPS)+2); iw,fw,_=emulate.run(prg,0x1000,0x1000,0x1003,f1); tr=emulate.register_trace(fw)
ft=np.array(player.freq_table(player.PAL_CLOCK, r['tuning_cents']/100))
names='C C# D Eb E F F# G Ab A Bb B'.split(); nm=lambda p:names[p%12]+str(p//12-1)
sid=[]
for fi in range(max(0,int((a-lead)*FPS)),f1):
    for v in range(3):
        w=tr[fi,7*v+4]; pw=tr[fi-1,7*v+4] if fi else 0
        if w&1 and not w&0x80 and (not pw&1 or pw&0x80):
            sid.append((fi/FPS+lead, v+1, nm(int(np.abs(ft-(tr[fi,7*v]|tr[fi,7*v+1]<<8)).argmin())+12)))
rec=finelib.onsets(M,a,b,thr=thr)
ev=[(t,'REC',f"{s:3.1f} "+' '.join(f"{nm(p)}({l})" for p,l in ps[:6])) for t,s,ps in rec]+[(t,'sid',f"v{v} {n}") for t,v,n in sid]
for t,k,d in sorted(ev): print(f"{t:7.2f} {k} {d}")
