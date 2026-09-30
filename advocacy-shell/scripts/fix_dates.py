import sqlite3
import json
import re

db_path = r"C:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, title, metadata_json FROM archive_documents")
rows = cursor.fetchall()

updated = 0
for row in rows:
    doc_id, title, metadata_json = row
    if not metadata_json: continue
    try:
        meta = json.loads(metadata_json)
        pub_date = meta.get("date") or meta.get("publication_date") or "Unknown"
        
        needs_update = False
        
        # If we have publication_date but no date, copy it over (since the UI expects 'date')
        if meta.get("publication_date") and not meta.get("date"):
            meta["date"] = meta["publication_date"]
            pub_date = meta["date"]
            needs_update = True
            
        if pub_date == "Unknown" or not pub_date or pub_date == "--" or pub_date == "null":
            # Extract date from title
            match = re.search(r'(?:19|20)\d{2}(?:-\d{2}-\d{2})?', title)
            if match:
                meta["date"] = match.group(0)
                meta["publication_date"] = match.group(0)
                needs_update = True
                
        if needs_update:
            cursor.execute("UPDATE archive_documents SET metadata_json = ? WHERE id = ?", (json.dumps(meta), doc_id))
            updated += 1
    except Exception as e:
        pass

conn.commit()
print(f"Updated {updated} documents")
