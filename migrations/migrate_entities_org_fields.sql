ALTER TABLE entities ADD COLUMN location TEXT;
ALTER TABLE entities ADD COLUMN contact_info TEXT;
ALTER TABLE entities ADD COLUMN status TEXT DEFAULT 'active';
