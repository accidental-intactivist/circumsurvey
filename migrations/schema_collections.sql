DROP TABLE IF EXISTS archive_collections;
CREATE TABLE archive_collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  institution TEXT,
  description TEXT,
  curator_credit TEXT,
  banner_image_url TEXT,
  theme_color TEXT
);

-- Note: We shouldn't drop archive_documents. We already altered it to add columns.
-- If the columns already exist, this might fail, so let's ignore errors on ALTER TABLE if possible.
-- SQLite doesn't have ADD COLUMN IF NOT EXISTS, so we can just comment them out if they already exist,
-- or leave them since D1 execute stops on error but maybe they succeeded in the first script.
