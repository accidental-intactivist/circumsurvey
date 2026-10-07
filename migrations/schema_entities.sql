CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,
    role TEXT,
    tagline TEXT,
    featured INTEGER DEFAULT 0,
    see_also_json TEXT
);
