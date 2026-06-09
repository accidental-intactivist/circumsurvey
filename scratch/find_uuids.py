import re
import json

html_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\Circumsurvey Findings _standalone_.html"

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

template_match = re.search(r'<script type="__bundler/template">(.*?)</script>', html_content, re.DOTALL)
if not template_match:
    print("No template found!")
    exit(1)

template = json.loads(template_match.group(1).strip())

manifest_match = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html_content, re.DOTALL)
manifest = json.loads(manifest_match.group(1).strip())

for uuid in manifest.keys():
    # Search for this uuid in template
    # Get 100 characters around the match
    for m in re.finditer(uuid, template):
        start = max(0, m.start() - 100)
        end = min(len(template), m.end() + 100)
        context = template[start:end]
        print(f"UUID: {uuid}")
        print(f"Context: ... {repr(context)} ...")
        print("-" * 50)
