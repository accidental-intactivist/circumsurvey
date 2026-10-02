"""Pitch-salience trace (harmonic sum, 20 ms hops): the 3 strongest pitches per hop. For transcribing a line the onset analysis cannot resolve (brass in octaves, a hummed reference).

usage: python3 tools/hornpitch.py RECORDING T0 T1"""
import sys,numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import finelib
from midi2sid import audio_align as aa
M,t0,t1=sys.argv[1],float(sys.argv[2]),float(sys.argv[3])
y=finelib._load(M); SR=aa.SR
N,H=4096,int(0.02*SR); win=np.hanning(N); fr=np.fft.rfftfreq(N,1/SR)
names='C C# D Eb E F F# G Ab A Bb B'.split(); nm=lambda p:names[p%12]+str(p//12-1)
P=np.arange(40,92)
for i in range(int(t0*SR),int(t1*SR)-N,H):
    F=np.abs(np.fft.rfft(y[i:i+N]*win)); L=np.log(F+1e-6)
    sal=[]
    for p in P:
        f0=440*2**((p-69+0.078)/12); s=0
        for h,w in zip((1,2,3,4,5),(1,.8,.6,.45,.3)):
            sel=(fr>f0*h*2**(-.3/12))&(fr<f0*h*2**(.3/12))
            if sel.any(): s+=w*F[sel].max()
        sal.append(s)
    sal=np.array(sal); top=np.argsort(-sal)[:3]; mx=sal.max()
    print(f"{i/SR:6.2f} "+' '.join(f"{nm(P[k])}({20*np.log10(sal[k]/mx+1e-9):.0f})" for k in top))
