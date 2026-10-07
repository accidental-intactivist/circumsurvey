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

ALTER TABLE archive_documents ADD COLUMN collection_id TEXT;

INSERT OR IGNORE INTO archive_collections (id, slug, title, subtitle, description, institution, curator)
VALUES (
    'b79d20c5-1234-4567-890a-bcdef0123456', 
    'umass-ms-1205', 
    'The Tim Hammond Papers', 
    'MS 1205: Special Collections and University Archives', 
    'A comprehensive collection of historical documents, research, and organizational records chronicling the global movement for genital autonomy, compiled by activist and researcher Tim Hammond.', 
    'University of Massachusetts Amherst', 
    'Tim Hammond'
);

UPDATE archive_documents 
SET collection_id = 'b79d20c5-1234-4567-890a-bcdef0123456'
WHERE source_collection LIKE 'UMass MS 1205%';
