import json
import sqlite3

# Define the mapping from old series to new Category and Subject
taxonomy_map = {
    'Series 1. International NGO Council on Genital Autonomy': ('Human Rights & International Law', 'INGOCGA'),
    'GALDEF, CHHRP, INGOCGA': ('Human Rights & International Law', 'INGOCGA'),
    'Amnesty Intl': ('Human Rights & International Law', 'Amnesty International'),
    'Series 2. American Academy of Pediatrics': ('Medical Policy & Ethics', 'AAP Guidelines'),
    'AAP, CDC, CIA': ('Medical Policy & Ethics', 'AAP Guidelines'),
    'Foreskin Industry': ('Medical Policy & Ethics', 'Bioengineering & Foreskin Harvesting'),
    'Blood Stained Men': ('Activism & Organizations', 'Bloodstained Men'),
    'NOCIRC, Genital Autonomy America': ('Activism & Organizations', 'NOCIRC & GAA'),
    'NOHARMM, NORM': ('Activism & Organizations', 'NOHARMM & NORM'),
    'ARC': ('Activism & Organizations', 'ARC'),
    'DOC, NRC': ('Activism & Organizations', 'DOC & NRC'),
    'WWDOGA': ('Activism & Organizations', 'WWDOGA'),
    '~Personal Life & Activism 1978-2007': ('Activism & Organizations', 'Tim Hammond Personal Papers'),
    'Hammond Articles & Interviews': ('Publications & Media', 'Hammond Articles'),
    'Hammond Presentations': ('Publications & Media', 'Hammond Presentations'),
    'Books & Journals': ('Publications & Media', 'Books & Journals'),
    'Whose Body, Whose Rights': ('Publications & Media', 'Whose Body, Whose Rights'),
    'Uncategorized Videos': ('Publications & Media', 'Uncategorized Videos'),
    'Videos & Audios (Misc)': ('Publications & Media', 'Miscellaneous Media'),
    'Z1 Suppl Canada1990s': ('Legal & Legislation', 'Canadian Legislation 1990s'),
    'Z2 Other Suppl': ('Uncategorized', 'Other Supplements'),
    'Miscellaneous': ('Uncategorized', 'Miscellaneous'),
    '~ARCHIVES for UMASS': ('Uncategorized', 'UMASS Miscellaneous'),
    '~Agreement and Inventory Lists': ('Administrative', 'Inventory Lists')
}

index_path = r'c:\work\circumsurvey\advocacy-shell\src\data\archive_index.json'
with open(index_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    series = item.get('series', 'Uncategorized')
    if series in taxonomy_map:
        cat, subj = taxonomy_map[series]
        item['category'] = cat
        item['subject'] = subj
    else:
        item['category'] = 'Uncategorized'
        item['subject'] = series

with open(index_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Updated archive_index.json')

db_path = r'C:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite'
conn = sqlite3.connect(db_path)
rows = conn.execute("SELECT id, source_collection, metadata_json FROM archive_documents WHERE id LIKE 'umass-ms1205-%'").fetchall()

updated = 0
for row in rows:
    doc_id, source_coll, meta_str = row
    if not source_coll: continue
    
    # Extract series from source_collection
    parts = source_coll.split(': ')
    series = parts[1] if len(parts) > 1 else parts[0]
    
    cat, subj = ('Uncategorized', series)
    if series in taxonomy_map:
        cat, subj = taxonomy_map[series]
    
    new_source_coll = f'UMass MS 1205: {cat}'
    
    meta = json.loads(meta_str) if meta_str else {}
    meta['category'] = cat
    meta['subject'] = subj
    
    conn.execute('UPDATE archive_documents SET source_collection = ?, metadata_json = ? WHERE id = ?', 
                 (new_source_coll, json.dumps(meta), doc_id))
    updated += 1

conn.commit()
print(f'Updated {updated} records in SQLite DB')

# Re-export to api_mock.json
conn.row_factory = sqlite3.Row
rows = conn.execute('SELECT * FROM archive_documents').fetchall()
data = [dict(r) for r in rows]
with open(r'C:\work\circumsurvey\advocacy-shell\public\api_mock.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print(f'Exported {len(data)} rows to api_mock.json')
