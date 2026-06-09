import json
with open('scratch/questions_repaired.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
q = next(item for item in data['questions'] if item['id'] == 'circ_parents_influences')
print("circ_parents_influences type:", q['type'])
print("opts:")
for opt in q['opts']:
    print("  -", opt)
