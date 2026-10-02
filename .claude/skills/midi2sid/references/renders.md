# Render recipes

All paths relative to `c64-sid/`. `REC` = the reference recording.

## Recording-left / SID-right, whole piece from the sections
```bash
cd out/   # where huck_sections.json and huck_NN_*.wav are
python3 - <<'PY' > cmd.sh
import json
d=json.load(open('huck_sections.json'))
ins=' '.join(f'-i huck_{s["section"]:02d}_{s["name"]}.wav' for s in d)
fl=';'.join(f'[{i}:a]aformat=channel_layouts=mono,adelay={int(round(s["recording_s"][0]*1000))}[a{i}]' for i,s in enumerate(d))
mix=''.join(f'[a{i}]' for i in range(len(d)))
print(f'ffmpeg -y -loglevel error {ins} -i "$REC" -filter_complex "{fl};{mix}amix=inputs={len(d)}:normalize=0[sid];[{len(d)}:a]aformat=channel_layouts=mono,aresample=44100,volume=0.6[rec];[sid]aresample=44100[s2];[rec][s2]join=inputs=2:channel_layout=stereo[o]" -map "[o]" -c:a libvorbis -q:a 5 compare_L_rec_R_sid.ogg')
PY
REC=/path/to/recording.mp3 bash cmd.sh
```
The `adelay` per section is its start time in the recording, so the SID
sits exactly where the orchestra is.

## SID only
```bash
ffmpeg -y -loglevel error -i huck_all.wav -c:a libvorbis -q:a 5 all_sections_SID_only.ogg
ffmpeg -y -loglevel error -i huck_03_section03.wav -c:a libvorbis -q:a 5 section03_SID_only.ogg
```

## Close-up of a passage
```bash
ffmpeg -y -loglevel error -ss 0:49 -to 0:59 -i compare_L_rec_R_sid.ogg -c:a libvorbis -q:a 5 closeup_0-49_to_0-59.ogg
```

## Single full-length tune
`python3 -m midi2sid ... -o out/name` writes `out/name.wav`; the same join
filter with one input and `adelay=<lead ms>` (the report's
`sid_starts_at_recording_s`) makes the comparison.
