"""Fine onset analysis of a recording (2.5 ms hop): onsets(path, t0, t1, thr) -> [(time, strength, [(midi_pitch, dB)])]. Shared by the other tools."""
import numpy as np
from midi2sid import audio_align as aa
from scipy.signal import find_peaks
_cache={}
def _load(M):
    if M not in _cache: _cache[M]=aa.decode_audio(M)
    return _cache[M]
names='C C# D Eb E F F# G Ab A Bb B'.split()
nm=lambda p:names[p%12]+str(p//12-1)
def onsets(M,t0,t1,thr=1.0,pad=0.0):
    """(time, strength, [(pitch, level_dB)]) for attacks in the recording, 2.5 ms hop; pad shifts a prepended silence."""
    y=_load(M); SR=aa.SR
    if pad: y=np.concatenate([np.zeros(int(pad*SR),np.float32),y])
    t0=max(t0,0.25); seg=y[int((t0-0.2)*SR):int((t1+0.2)*SR)]
    N,H=4096,110; win=np.hanning(N); fr=np.fft.rfftfreq(N,1/SR)
    F=np.array([np.abs(np.fft.rfft(seg[i:i+N]*win)) for i in range(0,len(seg)-N,H)])
    ts=t0-0.2+(np.arange(len(F))*H+N/2)/SR
    D=np.maximum(0,np.diff(np.log(F+1e-6),axis=0,prepend=np.log(F[:1]+1e-6))).sum(1)
    D=np.convolve(D,np.ones(4)/4,'same'); D=(D-np.median(D))/(D.std()+1e-9)
    pk,_=find_peaks(D,height=thr,distance=10)
    P=np.arange(34,100); E=np.zeros((len(F),len(P)))
    for k,p in enumerate(P):
        f0=440*2**((p-69+0.078)/12); sel=(fr>f0*2**(-.45/12))&(fr<f0*2**(.45/12)); sel[np.abs(fr-f0).argmin()]=True
        E[:,k]=F[:,sel].max(1)
    L=20*np.log10(E+1e-9); L-=L.max()
    out=[]
    for p in pk:
        t=ts[p]
        if not (t0<=t<=t1): continue
        i0=max(0,p-24); i1=min(len(L)-1,p+16)
        before=L[i0:p].max(0) if p>i0 else L[p]; after=L[p:i1].max(0); rise=after-before
        strong=sorted([k for k in np.argsort(-after)[:14] if rise[k]>6 and after[k]>-45],key=lambda k:P[k])
        out.append((round(float(t),2),round(float(D[p]),1),[(int(P[k]),round(float(after[k]))) for k in strong]))
    return out
