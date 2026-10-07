-- D1 Schema for the Library Architecture

-- Core Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, -- We'll use the SHA256 hash
    title TEXT NOT NULL,
    source_archive TEXT,
    file_path TEXT NOT NULL, -- R2 object key
    document_type TEXT,
    publication_date TEXT,
    summary TEXT,
    size_bytes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- People (Authors, key figures)
CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Themes
CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Document Images (Figures, Photos)
CREATE TABLE IF NOT EXISTS document_images (
    id TEXT PRIMARY KEY, -- SHA256 of image
    document_id TEXT NOT NULL,
    image_path TEXT NOT NULL, -- R2 object key
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Join Tables for Many-to-Many Relationships
CREATE TABLE IF NOT EXISTS document_people (
    document_id TEXT NOT NULL,
    person_id INTEGER NOT NULL,
    PRIMARY KEY (document_id, person_id),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY(person_id) REFERENCES people(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_organizations (
    document_id TEXT NOT NULL,
    organization_id INTEGER NOT NULL,
    PRIMARY KEY (document_id, organization_id),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_themes (
    document_id TEXT NOT NULL,
    theme_id INTEGER NOT NULL,
    PRIMARY KEY (document_id, theme_id),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY(theme_id) REFERENCES themes(id) ON DELETE CASCADE
);
