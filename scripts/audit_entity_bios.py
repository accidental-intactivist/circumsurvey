import json

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

print(f"Total entities: {len(entities)}")

blank_desc = []
short_desc = []
long_desc = []

for e in entities:
    d = (e.get('description') or '').strip()
    if not d or len(d) < 50:
        blank_desc.append(e)
    elif len(d) < 200:
        short_desc.append(e)
    else:
        long_desc.append(e)

print(f"Blank (<50 chars): {len(blank_desc)}")
print(f"Short (50-200 chars): {len(short_desc)}")
print(f"Detailed (>200 chars): {len(long_desc)}")

print("\n--- First 10 Short/Blank Entities ---")
for e in (blank_desc + short_desc)[:10]:
    print(f"ID: {e.get('id')} | Name: {e.get('name')} | Role: {e.get('role')} | Tagline: {e.get('tagline')}")
    print(f"Desc ({len(e.get('description') or '')} chars): {e.get('description')}")
    print("-" * 40)
