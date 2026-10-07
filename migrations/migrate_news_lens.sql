-- News Lens: first-class columns for filtering & sorting the news feed.
-- Additive only; safe to run against production.
ALTER TABLE archive_documents ADD COLUMN category TEXT;
ALTER TABLE archive_documents ADD COLUMN published_at TEXT;
CREATE INDEX IF NOT EXISTS idx_archive_documents_type_published ON archive_documents (type, published_at);
CREATE INDEX IF NOT EXISTS idx_archive_documents_category ON archive_documents (category);
