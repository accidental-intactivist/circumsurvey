import sqlite3
import json
import glob
import os

db = [f for f in glob.glob('.wrangler/state/v3/d1/*/*.sqlite') if 'metadata' not in f][0]
conn = sqlite3.connect(db)

# Update database
conn.execute("UPDATE archive_documents SET url = '/api/assets/' || id || '.pdf' WHERE status = 'ingested' AND url IS NULL")
conn.commit()

# Dump to api_mock.json
conn.row_factory = sqlite3.Row
rows = conn.execute('SELECT * FROM archive_documents ORDER BY created_at DESC').fetchall()
docs = [dict(r) for r in rows]

with open('public/api_mock.json', 'w', encoding='utf-8') as f:
    json.dump(docs, f, indent=2)

print("Updated URLs and generated api_mock.json!")
