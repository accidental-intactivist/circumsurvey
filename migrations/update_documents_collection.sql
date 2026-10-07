-- Map UMass MS 1205 documents to the new collection
UPDATE archive_documents
SET collection_id = 'ms-1205'
WHERE source_collection LIKE 'UMass MS 1205%';

-- Extract series name from source_collection
-- e.g., 'UMass MS 1205: Series 1. International NGO Council on Genital Autonomy' -> 'Series 1. International NGO Council on Genital Autonomy'
UPDATE archive_documents
SET series = REPLACE(source_collection, 'UMass MS 1205: ', '')
WHERE source_collection LIKE 'UMass MS 1205: %';
