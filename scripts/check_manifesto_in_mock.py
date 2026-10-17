import json

with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
    mock_entities = json.load(f)

mock_names = {e.get('name', '').lower().strip() for e in mock_entities if e.get('name')}
for e in mock_entities:
    for a in e.get('aliases', []) or []:
        mock_names.add(a.lower().strip())

test_names = [
    "Eric Clopper", "Brendon Marotta", "Max Obeidin", "Jutta Reisinger", 
    "Andy Richter", "Jeff Goldblum", "Penn & Teller", "Josh Trent",
    "S. H. Adler", "M. A. van der Veer", "K. Afshar", "L. H. Braga", "P. Anderson", "S. Dave",
    "J. Simonsen", "K. Fall", "D. Kim", "M. G. Pang", "H. A. Weiss", "N. Larke", 
    "D. Halperin", "I. Schenker", "D. J. Wilkinson", "M. M. Wirth", "Leonard B. Glick", 
    "Dan Savage", "Pollock Clinics", "Community Health Plan of Washington",
    "GAIN", "Intact Australia", "Bruvvers", "NACS", "Bruchim", "Christians for Intactivism",
    "David Reimer", "Ronald L. Poland", "William E. Brigman", "PACE", "Silja Dögg Gunnarsdóttir",
    "Gérard Zwang", "Brothers United for Future Foreskins (BUFF)"
]

missing = []
present = []
for name in test_names:
    if name.lower() in mock_names:
        present.append(name)
    else:
        # check partial
        found_partial = any(name.lower() in m or m in name.lower() for m in mock_names)
        if found_partial:
            present.append(f"{name} (partial match)")
        else:
            missing.append(name)

print("Present:", len(present))
for p in present:
    print(f"  + {p}")

print("\nMissing:", len(missing))
for m in missing:
    print(f"  - {m}")
