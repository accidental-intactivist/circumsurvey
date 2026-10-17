import json
from collections import Counter

with open('public/api_mock.json', 'r', encoding='utf-8') as f:
    docs = json.load(f)
if isinstance(docs, dict) and 'data' in docs:
    docs = docs['data']

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    mock_entities = json.load(f)

mock_names = {e.get('name', '').lower().strip() for e in mock_entities if e.get('name')}
for e in mock_entities:
    for a in e.get('aliases', []) or []:
        mock_names.add(a.lower().strip())

counter = Counter()
for d in docs:
    meta = d.get('metadata_json')
    if isinstance(meta, str):
        try: meta = json.loads(meta)
        except: meta = {}
    elif not isinstance(meta, dict):
        meta = {}
    for p in (meta.get('key_people', []) or []) + (meta.get('gemini_extracted_metadata', {}).get('authors', []) or []):
        if p and isinstance(p, str):
            counter[(p.strip(), 'person')] += 1
    for o in (meta.get('organizations', []) or []) + (meta.get('gemini_extracted_metadata', {}).get('organizations', []) or []):
        if o and isinstance(o, str):
            counter[(o.strip(), 'organization')] += 1

unprofiled = [(item, count) for item, count in counter.most_common() if item[0].lower() not in mock_names and count >= 3]
print(f"Total unprofiled entities with >= 3 mentions: {len(unprofiled)}")
for (name, etype), c in unprofiled[:30]:
    print(f"  [{c} docs] {name} ({etype})")
