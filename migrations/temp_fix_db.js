import Database from 'better-sqlite3';

const dbPath = 'C:\\work\\circumsurvey\\advocacy-shell\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject\\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite';
const db = new Database(dbPath);

console.log("Creating translation tables...");
db.exec(`
CREATE TABLE IF NOT EXISTS translation_requests (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  target_language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_translations (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, language)
);
`);

console.log("Setting ingested PDF documents to pending_ocr...");
const result = db.prepare(`
  UPDATE archive_documents 
  SET status = 'pending_ocr' 
  WHERE type != 'external_news' 
  AND status = 'ingested'
`).run();

console.log(`Updated ${result.changes} documents.`);
db.close();
