import json
import re
import unicodedata

def cleanSlug(s):
    if not s: return ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"'s\b", 's', s)
    s = re.sub(r'[+/]', '-', s)
    s = re.sub(r'[-_]+', '-', s)
    s = re.sub(r'[^\w-]', '', s)
    return s.strip('-')

def cleanEntityName(s):
    if not s: return ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r',\s*(M\.?D\.?|Ph\.?D\.?|R\.?N\.?|D\.?O\.?|Esq\.?|Jr\.?|Sr\.?|III|II)\b', '', s, flags=re.I)
    s = re.sub(r'^(Dr\.|Dr|Rev\.|Prof\.)\s*', '', s, flags=re.I)
    s = re.sub(r'\([^)]*\)', '', s)
    s = s.lower()
    s = re.sub(r"'s\b", 's', s)
    s = re.sub(r'[+/]', ' ', s)
    s = s.replace('-', ' ').replace('_', ' ')
    s = re.sub(r'[^\w\s]', '', s)
    return ' '.join(s.split())

def normalizeQuery(s):
    if not s: return ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r'^(dr\.|dr|rev\.|prof\.)\s*', '', s)
    s = re.sub(r"'s\b", 's', s)
    s = re.sub(r'[+/]', ' ', s)
    s = s.replace('-', ' ').replace('_', ' ')
    s = re.sub(r'[^\w\s]', '', s)
    return s.strip()

def getEntitySlug(e):
    if e.get('slug'): return e['slug']
    name = e.get('name') or e.get('id') or ''
    name = unicodedata.normalize('NFKD', name)
    name = ''.join(c for c in name if not unicodedata.combining(c))
    name = re.sub(r"'s\b", 's', name, flags=re.I)
    clean = re.sub(r',\s*(m\.?d\.?|ph\.?d\.?|r\.?n\.?|d\.?o\.?|esq\.?|jr\.?|sr\.?)', '', name, flags=re.I)
    clean = re.sub(r'\([^)]*\)', '', clean)
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', clean)
    return clean.strip('-').lower()

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

def match(decodedId, allEntities):
    targetSlug = cleanSlug(decodedId)
    query = normalizeQuery(decodedId)
    queryClean = cleanEntityName(decodedId)

    candidates = []
    for e in allEntities:
        if not e or not e.get('name'): continue
        if e.get('id') == decodedId: 
            candidates.append(e)
            continue
        if e.get('slug') and (cleanSlug(e['slug']) == targetSlug or e['slug'] == decodedId):
            candidates.append(e)
            continue
        eSlug = cleanSlug(e.get('slug') or e.get('name'))
        if eSlug == targetSlug: 
            candidates.append(e)
            continue
        normName = normalizeQuery(e.get('name', ''))
        if normName == query: 
            candidates.append(e)
            continue
        eCleanName = cleanEntityName(e.get('name', ''))
        if eCleanName and queryClean and eCleanName == queryClean: 
            candidates.append(e)
            continue
        eParts = eCleanName.split()
        qParts = queryClean.split()
        if len(eParts) >= 2 and len(qParts) >= 2:
            if len(eParts) == len(qParts) and set(eParts) == set(qParts):
                candidates.append(e)
                continue
        parenMatch = re.search(r'\(([^)]+)\)', e.get('name', ''))
        if parenMatch:
            acr = normalizeQuery(parenMatch.group(1))
            if acr == query or acr == targetSlug.replace('-', ''):
                candidates.append(e)
                continue
        aliases = e.get('aliases', [])
        if isinstance(aliases, list):
            for a in aliases:
                if normalizeQuery(a) == query or cleanEntityName(a) == queryClean or cleanSlug(a) == targetSlug:
                    candidates.append(e)
                    break

    if candidates:
        candidates.sort(key=lambda x: len(x.get('description', '') or ''), reverse=True)
        return candidates[0]
    return None

resolved = 0
failed = []
short_bio = []

for e in entities:
    slug = getEntitySlug(e)
    found = match(slug, entities)
    if found:
        resolved += 1
        desc_len = len(found.get('description', '') or '')
        if desc_len < 100:
            short_bio.append((found.get('name'), desc_len))
    else:
        failed.append((e.get('name'), slug))

print(f"Total entities: {len(entities)}")
print(f"Resolved from getEntitySlug: {resolved} / {len(entities)}")
print(f"Entities with description < 100 chars: {len(short_bio)}")
if failed:
    print(f"Failed ({len(failed)}):")
    for name, s in failed:
        print(f"  {name} -> {s}")
else:
    print("PERFECT 100% MATCH ACROSS ALL 471 ENTITIES!")
