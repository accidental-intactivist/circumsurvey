import json
from collections import Counter

with open('public/api_mock.json', 'r', encoding='utf-8') as f:
    docs = json.load(f)

if isinstance(docs, dict) and 'data' in docs:
    docs = docs['data']

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    mock_entities = json.load(f)

mock_names = {e.get('name', '').lower().strip() for e in mock_entities if e.get('name')}
mock_slugs = {e.get('slug', '').lower().strip() for e in mock_entities if e.get('slug')}
mock_ids = {e.get('id', '').lower().strip() for e in mock_entities if e.get('id')}

people_counter = Counter()
org_counter = Counter()

for d in docs:
    meta = d.get('metadata_json')
    if isinstance(meta, str):
        try:
            meta = json.loads(meta)
        except:
            meta = {}
    elif not isinstance(meta, dict):
        meta = {}
    
    # Check people
    for p in meta.get('key_people', []) or []:
        if p and isinstance(p, str):
            people_counter[p.strip()] += 1
    gem = meta.get('gemini_extracted_metadata', {}) or {}
    for a in gem.get('authors', []) or []:
        if a and isinstance(a, str):
            people_counter[a.strip()] += 1
            
    # Check orgs
    for o in meta.get('organizations', []) or []:
        if o and isinstance(o, str):
            org_counter[o.strip()] += 1
    for o in gem.get('organizations', []) or []:
        if o and isinstance(o, str):
            org_counter[o.strip()] += 1

print(f"Total documents: {len(docs)}")
print(f"Total unique people mentioned: {len(people_counter)}")
print(f"Total unique orgs mentioned: {len(org_counter)}")

# Top 30 people mentioned
print("\nTop 30 People Mentioned in Archive:")
for p, c in people_counter.most_common(30):
    in_mock = p.lower() in mock_names
    print(f"  [{c} docs] {p} (in mock: {in_mock})")

# Top 30 Orgs mentioned
print("\nTop 30 Organizations Mentioned in Archive:")
for o, c in org_counter.most_common(30):
    in_mock = o.lower() in mock_names
    print(f"  [{c} docs] {o} (in mock: {in_mock})")
