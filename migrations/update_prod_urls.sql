-- Update URLs for ingested documents in production
UPDATE archive_documents 
SET url = '/api/assets/' || id || '.pdf' 
WHERE status = 'ingested' AND url IS NULL;
