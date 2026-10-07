import json, shutil, os

os.makedirs('public/documents', exist_ok=True)
data = json.load(open('pipeline_staging/inventory/MSU_Clippings_20260917_113614_inventory_stage3b.json', 'r', encoding='utf-8'))
docs = [d for d in data['files'] if 'ai_metadata' in d]
for d in docs:
    src = os.path.join('pipeline_staging/extracted/MSU_Clippings_20260917_113614', d['relative_path'])
    dst = f"public/documents/{d['sha256_hash']}.pdf"
    if os.path.exists(src):
        shutil.copy(src, dst)

print('Copied PDFs to public/documents')
