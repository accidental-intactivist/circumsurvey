-- Add series column if it doesn't exist
ALTER TABLE archive_documents ADD COLUMN series TEXT;
