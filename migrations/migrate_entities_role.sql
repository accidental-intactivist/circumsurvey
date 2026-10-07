-- Champions & Critics: Add alignment metadata to entities
ALTER TABLE entities ADD COLUMN role TEXT DEFAULT 'notable';
ALTER TABLE entities ADD COLUMN tagline TEXT;
ALTER TABLE entities ADD COLUMN featured INTEGER DEFAULT 0;
