CREATE TABLE IF NOT EXISTS translation_requests (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  target_language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
  requested_by TEXT NOT NULL, -- user_id (Clerk ID or email)
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
