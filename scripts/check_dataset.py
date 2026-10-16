import json

d = json.load(open('src/data/manifesto_chapters.json', encoding='utf-8'))
print(f"Manifesto Title: {d['title']}")
print(f"Total Chapters: {len(d['chapters'])}")
print(f"Total Words: {d['totalWordCount']:,}")
print(f"Total Primary Citations: {d['totalCitations']}")
print(f"Total Evidence Exhibits: {d['totalEvidenceArtifacts']}")
print("-" * 60)
for c in d['chapters']:
    total_p = sum(len(s['paragraphs']) for s in c['sections'])
    print(f"Chapter {c['roman']:4s} | {c['title'][:32]:32s} | {len(c['sections']):2d} sections | {total_p:2d} paras | Era: {c['historicalEra']}")
