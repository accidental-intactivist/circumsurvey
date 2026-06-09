import json
import base64
import gzip
import os
import re

html_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\Circumsurvey Findings _standalone_.html"
output_dir = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\unpacked_mockup"

os.makedirs(output_dir, exist_ok=True)

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Find the manifest script
manifest_match = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html_content, re.DOTALL)
if not manifest_match:
    print("Could not find manifest script tag!")
    exit(1)

manifest_json = manifest_match.group(1).strip()
manifest = json.loads(manifest_json)

print(f"Found {len(manifest)} files in manifest.")

for uuid, entry in manifest.items():
    mime = entry.get("mime", "")
    compressed = entry.get("compressed", False)
    base64_data = entry.get("data", "")
    
    # We want to identify the filename/id from the template or metadata if possible.
    # The HTML has an ext_resources script too
    # Let's find it
    pass

ext_res_match = re.search(r'<script type="__bundler/ext_resources">(.*?)</script>', html_content, re.DOTALL)
resource_map = {}
if ext_res_match:
    ext_res = json.loads(ext_res_match.group(1).strip())
    for res in ext_res:
        resource_map[res["uuid"]] = res["id"]

# Decompress and write files
for uuid, entry in manifest.items():
    file_id = resource_map.get(uuid, uuid)
    # Clean up file_id for path creation
    file_path = os.path.join(output_dir, file_id.lstrip("/"))
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    data = base64.b64decode(entry["data"])
    if entry.get("compressed", False):
        try:
            data = gzip.decompress(data)
        except Exception as e:
            print(f"Failed to decompress {file_id}: {e}")
    
    with open(file_path, "wb") as out_f:
        out_f.write(data)
    print(f"Extracted: {file_id}")

print("Done unpacking!")
