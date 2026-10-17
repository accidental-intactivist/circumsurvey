import json

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

print(f"Total entities in mock: {len(entities)}")

# Check fields
keys = set()
for e in entities:
    keys.update(e.keys())
print("Keys present across entities:", sorted(list(keys)))

lengths = [len(e.get('description', '') or '') for e in entities]
print(f"Min desc len: {min(lengths)}")
print(f"Max desc len: {max(lengths)}")
print(f"Avg desc len: {sum(lengths) / len(lengths):.1f}")

# Find any entities with < 300 chars description
short = [e for e in entities if len(e.get('description', '') or '') < 300]
print(f"Entities with < 300 chars: {len(short)}")
for s in short[:10]:
    print(f"  {s.get('name')}: {len(s.get('description',''))} chars: {s.get('description')}")
