"""Run the converter CLI and also dump the arranger's decisions to OUT.assign.json (for tools/show.py).

usage: PYTHONPATH=. python3 tools/assign.py midi2sid SONG.mid -a REC.mp3 ... -o OUT"""
import json, sys, runpy
from midi2sid import convert as C
_arr = C.arrange
def wrapped(fnotes, n_frames, roles, fps, max_arp=4):
    arr = _arr(fnotes, n_frames, roles, fps, max_arp=max_arp)
    out = sys.argv[sys.argv.index('-o')+1] + '.assign.json'
    json.dump({'fps': fps, 'n_frames': n_frames,
               'notes': [dict(id=n.id, f0=n.f0, f1=n.f1, pitch=n.pitch, part=n.part, inst=n.inst, sal=round(n.sal,3),
                              decay=n.decay, pred=n.pred, vel=n.vel) for n in fnotes],
               'voices': [[dict(frame=e.frame, kind=e.kind, notes=list(e.notes), inst=e.inst, ids=list(e.ids)) for e in v] for v in arr.voices]},
              open(out, 'w'))
    return arr
C.arrange = wrapped
sys.argv = sys.argv[1:]
runpy.run_module('midi2sid', run_name='__main__')
