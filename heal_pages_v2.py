import re, os
FILES = ["src/pages/LandingPage.jsx", "src/pages/ExplorePage.jsx"]
# Full cp1252-encodable non-ASCII range, including smart-punctuation block
PATTERN = re.compile(r"[\u0080-\u00ff\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u017d\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u017e\u0178]+")
def transform(m):
    s = m.group(0)
    try:
        decoded = s.encode("cp1252").decode("utf-8")
        return decoded
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s
def count_residue(text):
    return len(re.findall(r"[\u00c0-\u00f4]\u20ac", text)) + len(re.findall(r"[\u00c0-\u00f4][\u0080-\u00ff]", text))
for path in FILES:
    if not os.path.exists(path):
        print(f"{path}: NOT FOUND"); continue
    text = open(path, encoding="utf-8").read()
    before = count_residue(text)
    healed = PATTERN.sub(transform, text)
    after = count_residue(healed)
    if healed != text:
        open(path + ".bak2", "w", encoding="utf-8").write(text)
        open(path, "w", encoding="utf-8").write(healed)
        print(f"{path}: healed {before} -> {after} residue markers")
    else:
        print(f"{path}: no change (before={before}, after={after})")
