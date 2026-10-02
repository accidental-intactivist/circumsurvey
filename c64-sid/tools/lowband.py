"""Low-band (55-200 Hz) stroke detector: timpani / bass attacks with their rise in dB.

usage: python3 tools/lowband.py RECORDING T0 T1 [LO_HZ HI_HZ]"""
import sys,numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import finelib
from midi2sid import audio_align as aa
from scipy.signal import butter, sosfiltfilt, find_peaks
M,t0,t1=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]); lo,hi=(float(sys.argv[4]),float(sys.argv[5])) if len(sys.argv)>5 else (55,200)
y=finelib._load(M); SR=aa.SR
sos=butter(4,[lo,hi],btype='band',fs=SR,output='sos'); z=sosfiltfilt(sos,y)
H=int(SR*0.0025); env=np.array([np.sqrt(np.mean(z[i:i+4*H]**2)) for i in range(int(t0*SR),int(t1*SR),H)])
L=20*np.log10(env+1e-9); L-=L.max()
D=np.diff(L,prepend=L[0]); D=np.convolve(D,np.ones(6)/6,'same')
pk,_=find_peaks(D,height=1.0,distance=int(0.08/0.0025))
out=[]
for p in pk:
    rise=L[min(len(L)-1,p+8)]-L[max(0,p-8)]
    if rise>4: out.append(f"{t0+p*0.0025:6.2f}(+{rise:.0f}dB,{L[min(len(L)-1,p+8)]:.0f})")
print(' '.join(out))
