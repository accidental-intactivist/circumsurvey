import json

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

print(f"Total: {len(entities)}")
for i, e in enumerate(entities[:25]):
    desc = e.get('description', '')
    print(f"[{i}] {e.get('name')} ({e.get('type')}, {e.get('role')}):")
    print(f"    Desc len: {len(desc)}")
    print(f"    Desc preview: {desc[:120]}...")
