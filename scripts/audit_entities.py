"""Data quality audit for entity harvest - identifies dupes, garbage, and edge cases."""
import json, requests, time, re, sys
from collections import Counter

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except: pass

API = 'https://advocacy-shell.pages.dev'

print("Fetching all documents...")
all_docs = []
resp = requests.get(f'{API}/api/cms?limit=1')
total = resp.json().get('total', 0)
for offset in range(0, total, 500):
    r = requests.get(f'{API}/api/cms?limit=500&offset={offset}')
    all_docs.extend(r.json().get('data', []))
    time.sleep(0.15)
print(f"Fetched {len(all_docs)} docs.\n")

people = Counter()
orgs = Counter()
for doc in all_docs:
    if not doc.get('metadata_json'): continue
    try: meta = json.loads(doc['metadata_json'])
    except: continue
    gm = meta.get('gemini_extracted_metadata', {}) or {}
    for a in (gm.get('authors', []) or []):
        if a and isinstance(a, str) and len(a) >= 3: people[a.strip()] += 1
    for p in (meta.get('key_people', []) or []):
        if p and isinstance(p, str) and len(p) >= 3: people[p.strip()] += 1
    au = meta.get('author', '')
    if isinstance(au, str) and len(au) >= 3: people[au.strip()] += 1
    for src in [gm.get('organizations', []), meta.get('organizations', [])]:
        if isinstance(src, list):
            for o in src:
                if o and isinstance(o, str) and len(o) >= 3: orgs[o.strip()] += 1

# ── Near-dupes in people ──
print('=' * 60)
print('  PEOPLE: NEAR DUPLICATES (period/spacing variants)')
print('=' * 60)
normalized = {}
for name in people:
    key = re.sub(r'[.\s]+', ' ', name).strip().lower()
    if key not in normalized: normalized[key] = []
    normalized[key].append((name, people[name]))

dupes_found = 0
for key, variants in sorted(normalized.items(), key=lambda x: -sum(c for _, c in x[1])):
    if len(variants) > 1:
        total_c = sum(c for _, c in variants)
        parts = []
        for n, c in variants:
            parts.append(f"{n} ({c})")
        print(f'  [{total_c:3d} total] ' + ' | '.join(parts))
        dupes_found += 1
        if dupes_found >= 40:
            remaining = sum(1 for v in normalized.values() if len(v) > 1) - 40
            print(f'  ... and {remaining} more clusters')
            break

# ── Garbage orgs ──
print()
print('=' * 60)
print('  ORGS: POTENTIAL GARBAGE')
print('=' * 60)
garbage_patterns = []
for name, count in orgs.most_common():
    lower = name.lower()
    reason = None
    if re.match(r'^[A-Z]{2,3}-[A-Z]{2}$', name):
        reason = 'country-code'
    elif any(w in lower for w in ['filemaker', ' inc', ' ltd', ' llc', ' corp', ' gmbh', ' pty']):
        reason = 'company'
    elif len(name) <= 3 and name.upper() == name:
        reason = 'too-short-abbrev'
    elif re.match(r'^\d', name):
        reason = 'starts-with-number'
    elif any(w in lower for w in ['.com', '.org', '.net', 'http', 'www.']):
        reason = 'url-fragment'
    if reason:
        garbage_patterns.append((name, count, reason))

for n, c, reason in garbage_patterns[:30]:
    print(f'  [{c:3d} docs] {n:55s} ({reason})')
print(f'  Total garbage candidates: {len(garbage_patterns)}')

# ── Credential suffixes ──
print()
print('=' * 60)
print('  PEOPLE: CREDENTIAL SUFFIXES (R.N, M.D, Ph.D, etc)')
print('=' * 60)
cred_count = 0
for name in sorted(people.keys(), key=lambda x: -people[x]):
    if re.search(r',\s*(R\.?N|M\.?D|Ph\.?D|J\.?D|D\.?O|M\.?P\.?H|F\.?A\.?C\.?S|Dr\.?|Prof\.?)', name, re.I):
        print(f'  [{people[name]:3d} docs] {name}')
        cred_count += 1
        if cred_count >= 20: break
print(f'  Total with credentials: {sum(1 for n in people if re.search(r",\\s*(R\\.?N|M\\.?D|Ph\\.?D|J\\.?D|D\\.?O)", n, re.I))}')

# ── Too-long names ──
print()
print('=' * 60)
print('  NAMES > 80 CHARS (likely not names)')
print('=' * 60)
long_people = [(n, people[n]) for n in people if len(n) > 80]
long_orgs = [(n, orgs[n]) for n in orgs if len(n) > 80]
for n, c in sorted(long_people, key=lambda x: -x[1])[:10]:
    print(f'  [Person {c:3d}] {n[:90]}...')
for n, c in sorted(long_orgs, key=lambda x: -x[1])[:10]:
    print(f'  [Org    {c:3d}] {n[:90]}...')
print(f'  Total long people: {len(long_people)}, orgs: {len(long_orgs)}')

# ── Summary ──
total_dupe_clusters = sum(1 for v in normalized.values() if len(v) > 1)
print()
print('=' * 60)
print('  SUMMARY')
print('=' * 60)
print(f'  Raw people:           {len(people)}')
print(f'  Raw orgs:             {len(orgs)}')
print(f'  People dupe clusters: {total_dupe_clusters}')
print(f'  Garbage org candidates: {len(garbage_patterns)}')
print(f'  Long names (>80ch):   {len(long_people) + len(long_orgs)}')
print(f'  People w/ credentials: {cred_count}')
