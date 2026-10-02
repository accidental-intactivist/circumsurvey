"""Fit bar-line times to the recording: dynamic programming over each bar's onset positions (eighths, from the edited MIDI) against the recording's attack curve, bar length free (0.7-1.6 s). Prints fitted vs current map per bar; feed the fits into the anchors file.

usage: python3 tools/barfit.py RECORDING EDITED_MIDI BAR0 BAR1 OUT_BASE.report.json
(Keep ranges inside one tempo region; a fermata bar breaks the fit.)"""
import sys,json,numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import finelib
from midi2sid import audio_align as aa
from midi2sid.sections import bar_ticks
M,MID,b0,b1,R=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]
r=json.load(open(R)); al=r['alignment']; am,ar=np.array(al['anchors_midi_s']),np.array(al['anchors_recording_s'])
bl,s=bar_ticks(MID); unit=bl/6
down={b:np.interp(t,am,ar) for t,b,bt in s.beat_times() if bt==1}
T0,T1=down[b0]-0.6,down[b1+1]+0.6
y=finelib._load(M); SR=aa.SR; seg=y[int(T0*SR):int(T1*SR)]
N,H=2048,55; win=np.hanning(N); F=np.array([np.abs(np.fft.rfft(seg[i:i+N]*win)) for i in range(0,len(seg)-N,H)])
ts=T0+(np.arange(len(F))*H+N/2)/SR
D=np.maximum(0,np.diff(np.log(F+1e-6),axis=0,prepend=np.log(F[:1]+1e-6))).sum(1)
D=np.convolve(D,np.ones(8)/8,'same'); D=(D-np.median(D))/(D.std()+1e-9)
def dv(t): 
    i=np.clip(np.round((t-ts[0])/(H/SR)).astype(int),0,len(D)-1); return D[i]
# onset eighth positions per bar (weighted by number of simultaneous notes, top-heavy)
pos={}
for b in range(b0,b1+1):
    ns=[n for n in s.notes if (b-1)*bl<=n.start_tick<b*bl]
    w={}
    for n in ns:
        e=round((n.start_tick-(b-1)*bl)/unit*2)/2; w[e]=w.get(e,0)+1
    pos[b]=[(e,min(3,c)**0.5) for e,c in w.items()]
grid=np.arange(-0.4,0.401,0.01)
starts={b:down[b]+grid for b in range(b0,b1+2)}
durs=None
def score(b,t,d):
    return sum(wt*dv(t+e*d/6) for e,wt in pos[b])/max(1,sum(wt for _,wt in pos[b]))
# DP over start-time indices
best={b:np.full(len(grid),-1e9) for b in range(b0,b1+2)}; back={}
best[b0][:]=0
for b in range(b0,b1+1):
    for i,t in enumerate(starts[b]):
        if best[b][i]<-1e8: continue
        for j,t2 in enumerate(starts[b+1]):
            d=t2-t
            if d<0.7 or d>1.6: continue
            sc=best[b][i]+score(b,t,d)-0.3*abs(d-(down[b+1]-down[b]))  # mild prior on the current map's bar length
            if sc>best[b+1][j]: best[b+1][j]=sc; back[(b+1,j)]=i
j=int(np.argmax(best[b1+1])); path=[]
for b in range(b1+1,b0,-1):
    path.append((b,starts[b][j])); j=back[(b,j)]
path.append((b0,starts[b0][j]))
for b,t in sorted(path): print(f"bar {b}: fit {t:7.2f}  map {down[b]:7.2f}  diff {t-down[b]:+.2f}")
