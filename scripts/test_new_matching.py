import json
import re

def cleanEntityName(s):
    if not s: return ''
    s = re.sub(r',\s*(M\.?D\.?|Ph\.?D\.?|R\.?N\.?|D\.?O\.?|Esq\.?|Jr\.?|Sr\.?|III|II)\b', '', s, flags=re.I)
    s = re.sub(r'^(Dr\.|Dr|Rev\.|Prof\.)\s*', '', s, flags=re.I)
    s = re.sub(r'\([^)]*\)', '', s)
    s = s.lower().replace('-', ' ').replace('_', ' ')
    s = re.sub(r'[^\w\s]', '', s)
    return ' '.join(s.split())

def cleanSlug(s):
    if not s: return ''
    s = s.lower().replace('_', '-')
    s = re.sub(r'[^\w-]', '', s)
    return s.strip('-')

def normalizeQuery(s):
    if not s: return ''
    s = s.lower()
    s = re.sub(r'^(dr\.|dr|rev\.|prof\.)\s*', '', s)
    s = s.replace('-', ' ').replace('_', ' ')
    s = re.sub(r'[^\w\s]', '', s)
    return s.strip()

# Old broken generator to test resilience to legacy URLs
def oldGenerateSlug(name):
    if not name: return ''
    cleanName = re.sub(r',\s*[a-zA-Z\.]+$', '', name)
    parts = cleanName.strip().split()
    if 2 <= len(parts) <= 4:
        last = parts.pop()
        return f"{last}_{'_'.join(parts)}"
    return '_'.join(cleanName.split())

# New clean slug generator
def newEntitySlug(e):
    if e.get('slug'): return e['slug']
    name = e.get('name') or e.get('id') or ''
    clean = re.sub(r',\s*(m\.?d\.?|ph\.?d\.?|r\.?n\.?|d\.?o\.?|esq\.?|jr\.?|sr\.?)', '', name, flags=re.I)
    clean = re.sub(r'\([^)]*\)', '', clean)
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', clean)
    return clean.strip('-').lower()

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    entities = json.load(f)

def findEntity(slug_input, all_entities):
    decodedId = slug_input
    targetSlug = cleanSlug(decodedId)
    query = normalizeQuery(decodedId)
    queryClean = cleanEntityName(decodedId)
    
    for candidate in all_entities:
        if not candidate or not candidate.get('name'): continue
        if candidate.get('id') == decodedId: return candidate
        if candidate.get('slug') and (cleanSlug(candidate['slug']) == targetSlug or candidate['slug'] == decodedId):
            return candidate
        
        cSlug = cleanSlug(candidate.get('slug') or candidate.get('name'))
        if cSlug == targetSlug: return candidate
        
        normName = normalizeQuery(candidate.get('name', ''))
        if normName == query: return candidate
        
        cCleanName = cleanEntityName(candidate.get('name', ''))
        if cCleanName and queryClean and cCleanName == queryClean: return candidate
        
        cParts = cCleanName.split()
        qParts = queryClean.split()
        if len(cParts) >= 2 and len(qParts) >= 2:
            if len(cParts) == len(qParts) and set(cParts) == set(qParts):
                return candidate
                
        parenMatch = re.search(r'\(([^)]+)\)', candidate.get('name', ''))
        if parenMatch:
            acr = normalizeQuery(parenMatch.group(1))
            if acr == query or acr == targetSlug.replace('-', ''):
                return candidate
                
        aliases = candidate.get('aliases', [])
        if isinstance(aliases, list):
            for a in aliases:
                if normalizeQuery(a) == query or cleanEntityName(a) == queryClean or cleanSlug(a) == targetSlug:
                    return candidate
    return None

# Test with BOTH new slugs and old legacy slugs!
print("Testing New Slugs across all 423 entities:")
unmatched_new = 0
for e in entities:
    s = newEntitySlug(e)
    found = findEntity(s, entities)
    if not found or found.get('id') != e.get('id'):
        unmatched_new += 1
        print(f"Failed for {e.get('name')} with slug {s}")
print(f"New slug matches: {len(entities) - unmatched_new} / {len(entities)}")

print("\nTesting Legacy Inverted Slugs across all 423 entities:")
unmatched_old = 0
for e in entities:
    s = oldGenerateSlug(e.get('name'))
    found = findEntity(s, entities)
    if not found or found.get('id') != e.get('id'):
        unmatched_old += 1
        # only print first 5
        if unmatched_old <= 5:
            print(f"Failed legacy for {e.get('name')} with slug {s} -> found: {found.get('name') if found else None}")
print(f"Legacy slug matches: {len(entities) - unmatched_old} / {len(entities)}")
