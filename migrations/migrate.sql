-- Migrate the physical inventory into the main archive_documents CMS table
-- This allows every physical item to have its own Digital Library /library/:id page immediately, even if the PDF is missing.

INSERT INTO archive_documents (
  id, 
  title, 
  source_collection, 
  type, 
  status, 
  metadata_json, 
  created_at
)
SELECT 
  id, 
  item_title, 
  'UMass MS 1205: ' || ifnull(series_title, 'Uncategorized'), 
  'physical_document', 
  'pending_digitization', 
  json_object(
    'box', box_number, 
    'folder', folder_number, 
    'date', item_date, 
    'description', description
  ), 
  created_at 
FROM physical_inventory;

-- We can now drop the redundant physical_inventory table if we want, but let's keep it for now as a backup.
