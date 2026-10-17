import json
import re

def generateSlug(name):
    if not name:
        return ''
    cleanName = re.sub(r',\s*[a-zA-Z\.]+$', '', name)
    parts = cleanName.strip().split()
    if 2 <= len(parts) <= 4:
        last = parts.pop()
        return f"{last}_{'_'.join(parts)}"
    return '_'.join(cleanName.split())

def normalizeQuery(s):
    if not s:
        return ''
    s = s.lower()
    s = re.sub(r'^(dr\.|dr|rev\.|prof\.)\s*', '', s)
    s = re.sub(r'[-_]', ' ', s)
    s = re.sub(r'[^\w\s]', '', s)
    return s.strip()

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

mismatched = []
matched = []

for e in entities:
    name = e.get('name', '')
    slug = generateSlug(name)
    decodedId = slug
    query = normalizeQuery(decodedId)
    
    # Simulate ProfilePage.jsx lookup
    found = None
    for candidate in entities:
        if candidate.get('id') == decodedId:
            found = candidate
            break
        normName = normalizeQuery(candidate.get('name', ''))
        if normName == query:
            found = candidate
            break
        parts = normName.split()
        if len(parts) == 2:
            if f"{parts[1]} {parts[0]}" == query:
                found = candidate
                break
        if len(parts) == 3:
            if f"{parts[2]} {parts[0]} {parts[1]}" == query:
                found = candidate
                break
            if f"{parts[0]} {parts[2]}" == query:
                found = candidate
                break
        parenMatch = re.search(r'\(([^)]+)\)', candidate.get('name', ''))
        if parenMatch and normalizeQuery(parenMatch.group(1)) == query:
            found = candidate
            break
        aliases = candidate.get('aliases', [])
        if isinstance(aliases, list):
            if any(normalizeQuery(a) == query for a in aliases):
                found = candidate
                break

    if found and found.get('id') == e.get('id'):
        matched.append((e.get('name'), slug))
    else:
        mismatched.append((e.get('name'), slug, found.get('name') if found else None))

print(f"Total entities: {len(entities)}")
print(f"Matched: {len(matched)}")
print(f"Mismatched / Not found: {len(mismatched)}")
print("\n--- First 25 Mismatches ---")
for orig, sl, f_name in mismatched[:25]:
    print(f"Original: {orig!r} -> Slug: {sl!r} -> Found: {f_name!r}")
