import re, os
FILES = ['src/pages/LandingPage.jsx', 'src/pages/ExplorePage.jsx']
PATTERN = re.compile(r'[\u0080-\u00ff]{2,}')
DIAG = re.compile(r'[\u00c0-\u00f4][\u0080-\u00ff][\u0080-\u00ff]?')
def transform(m):
    s = m.group(0)
    try:
        return s.encode('cp1252').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s
for path in FILES:
    if not os.path.exists(path):
        print(f'{path}: NOT FOUND'); continue
    text = open(path, encoding='utf-8').read()
    before = len(DIAG.findall(text))
    healed = PATTERN.sub(transform, text)
    after = len(DIAG.findall(healed))
    if healed != text:
        open(path + '.bak', 'w', encoding='utf-8').write(text)
        open(path, 'w', encoding='utf-8').write(healed)
        print(f'{path}: healed {before} -> {after} markers')
    else:
        print(f'{path}: no change (before={before}, after={after})')
