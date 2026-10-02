"""What each SID voice plays, frame by frame, as note names with frame counts (~ = hard-restart frame).

usage: python3 tools/voices.py OUT_BASE T0 T1 [TUNE]"""
import json,sys,numpy as np
from midi2sid import emulate, player
base=sys.argv[1]; a,b=float(sys.argv[2]),float(sys.argv[3]); song=int(sys.argv[4]) if len(sys.argv)>4 else 0

r=json.load(open(base+'.report.json')); lead=r.get('sid_starts_at_recording_s',0)
FPSX=r['fps']
prg=open(base+'.prg','rb').read()[2:]
f1=min(r['frames'],int((b-lead)*FPSX)); f0=max(0,int((a-lead)*FPSX))
iw,fw,_=emulate.run(prg,0x1000,0x1000,0x1003,f1,song=song); tr=emulate.register_trace(fw)
ft=np.array(player.freq_table(player.PAL_CLOCK, r['tuning_cents']/100))
names='C C# D Eb E F F# G Ab A Bb B'.split()
nm=lambda f:(lambda i:names[i%12]+str(i//12-1))(int(np.abs(ft-f).argmin())+12)
for v in range(3):
    out=[];prev=None;cnt=0;start=f0
    for fi in range(f0,f1):
        w=tr[fi,7*v+4]; s=('~' if w&0x80 else nm(tr[fi,7*v]|tr[fi,7*v+1]<<8)) if w&1 else '-'
        if s!=prev:
            if prev is not None: out.append(f'{start/FPSX+lead:.2f}:{prev}x{cnt}')
            prev=s;cnt=1;start=fi
        else: cnt+=1
    out.append(f'{start/FPSX+lead:.2f}:{prev}x{cnt}')
    print('voice',v+1,' '.join(out)[:700])
