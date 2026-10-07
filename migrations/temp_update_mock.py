import json
data = json.load(open('public/api_mock.json', 'r', encoding='utf-8'))
for d in data:
    d['url'] = f"/documents/{d['id']}.pdf"
with open('public/api_mock.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print('Updated api_mock.json')
