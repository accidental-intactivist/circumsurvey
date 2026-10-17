import json
import re

with open('src/data/manifesto_chapters.json', 'r', encoding='utf-8') as f:
    manifesto = json.load(f)

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    mock_entities = json.load(f)

mock_names = {e.get('name', '').lower().strip() for e in mock_entities if e.get('name')}
for e in mock_entities:
    for a in e.get('aliases', []) or []:
        mock_names.add(a.lower().strip())

# Extract citations and resources
citations = []
for ch in manifesto.get('chapters', []):
    for c in ch.get('primaryCitations', []):
        citations.append((c.get('authors'), c.get('title')))
    for ee in ch.get('evidenceExhibits', []):
        citations.append((ee.get('provenance'), ee.get('title')))

print(f"Citations extracted from manifesto: {len(citations)}")
for author, title in citations[:20]:
    print(f"  Author/Prov: {author!r} | Title: {title!r}")
