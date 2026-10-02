"""Every note of the edited MIDI in a window, with its salience and which voice(s) got it (-- = dropped).
Needs OUT_BASE.assign.json from tools/assign.py.

usage: python3 tools/show.py OUT_BASE T0 T1"""
import json,sys
base=sys.argv[1]; a,b=float(sys.argv[2]),float(sys.argv[3])
r=json.load(open(base+'.report.json')); lead=r['sid_starts_at_recording_s']; adv=r.get('anticipate_s',0)
d=json.load(open(base+'.assign.json')); fps=d['fps']
names='C C# D Eb E F F# G Ab A Bb B'.split(); nm=lambda p:names[p%12]+str(p//12-1)
parts={p['index']:p['name'] for p in r['parts']}
t=lambda f:f/fps+lead+adv
pl={}
for v,evs in enumerate(d['voices']):
    for e in evs:
        for i in e['ids']: pl.setdefault(i,set()).add((v+1,e['kind'][0]))
for n in sorted(d['notes'],key=lambda n:(n['f0'],-n['pitch'])):
    if a<=t(n['f0'])<=b:
        where=''.join(f"v{v}{k}" for v,k in sorted(pl.get(n['id'],()))) or '  --'
        print(f"{t(n['f0']):7.2f}-{t(n['f1']):6.2f} {nm(n['pitch']):4} {parts.get(n['part'],n['part'])[:9]:9} sal {n['sal']:.2f} inst {n['inst']} dec {n['decay']:3} pred {str(n['pred'])[:1]:1} {where}")
