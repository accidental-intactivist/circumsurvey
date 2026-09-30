import sqlite3
import uuid

db_path = r'C:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite'

print("Connecting to DB:", db_path)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Creating archive_collections table...")
cursor.executescript("""
CREATE TABLE IF NOT EXISTS archive_collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  institution TEXT,
  curator TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
""")

print("Adding collection_id to archive_documents...")
try:
    cursor.execute("ALTER TABLE archive_documents ADD COLUMN collection_id TEXT;")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("collection_id column already exists.")
    else:
        raise

print("Seeding UMass MS 1205 Collection...")
umass_id = str(uuid.uuid4())
cursor.execute("""
INSERT OR IGNORE INTO archive_collections (id, slug, title, subtitle, description, institution, curator)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    umass_id, 
    'umass-ms-1205', 
    'The Tim Hammond Papers', 
    'MS 1205: Special Collections and University Archives', 
    'A comprehensive collection of historical documents, research, and organizational records chronicling the global movement for genital autonomy, compiled by activist and researcher Tim Hammond.', 
    'University of Massachusetts Amherst', 
    'Tim Hammond'
))

# Fetch the actual ID in case it already existed (IGNORE would skip insertion)
cursor.execute("SELECT id FROM archive_collections WHERE slug = 'umass-ms-1205'")
umass_id = cursor.fetchone()[0]

print("Updating existing MS 1205 documents with collection_id...")
cursor.execute("""
UPDATE archive_documents 
SET collection_id = ? 
WHERE source_collection LIKE 'UMass MS 1205%'
""", (umass_id,))

print(f"Updated {cursor.rowcount} documents.")

conn.commit()
conn.close()
print("Done.")
