-- Entity Audit Pipeline: Add See Also column for PMI-ranked co-occurring entities
ALTER TABLE entities ADD COLUMN see_also_json TEXT;
-- see_also_json stores: [{"name": "NOCIRC", "score": 3.2, "shared_docs": 7}, ...]
