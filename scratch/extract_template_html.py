import re
import json
import os

html_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\Circumsurvey Findings _standalone_.html"
output_file = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\mockup_template_unwrapped.html"

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

template_match = re.search(r'<script type="__bundler/template">(.*?)</script>', html_content, re.DOTALL)
if not template_match:
    print("No template found!")
    exit(1)

template = json.loads(template_match.group(1).strip())

manifest_match = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html_content, re.DOTALL)
manifest = json.loads(manifest_match.group(1).strip())

# Mappings of UUIDs to filenames/paths
# In our unpacked folder, they are named as the UUIDs themselves, so let's point them to unpacked_mockup/<uuid>
for uuid in manifest.keys():
    template = template.replace(uuid, f"unpacked_mockup/{uuid}")

with open(output_file, "w", encoding="utf-8") as out:
    out.write(template)

print(f"Wrote unwrapped template to {output_file}!")
