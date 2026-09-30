import json
import os

def generate_sql(json_path, sql_path):
    print(f"Reading JSON from {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} records.")
    
    with open(sql_path, 'w', encoding='utf-8') as f:
        # SQLite PRAGMA for large inserts can speed things up, but D1 handles this server-side
        
        batch_size = 100
        for i in range(0, len(data), batch_size):
            batch = data[i:i+batch_size]
            values = []
            for item in batch:
                meta = json.dumps({
                    "date": item.get("date", ""),
                    "original_location": item.get("original_location", ""),
                    "raw_files": item.get("raw_files", []),
                    "tags": item.get("tags", [])
                })
                
                # Escape single quotes for raw SQL
                title = item.get("title", "Untitled").replace("'", "''")
                series = item.get("series", "Uncategorized")
                source = f"UMass MS 1205: {series}".replace("'", "''")
                meta = meta.replace("'", "''")
                id_val = item.get("id").replace("'", "''")
                
                values.append(f"('{id_val}', '{title}', '{source}', 'physical_document', 'pending_digitization', '{meta}')")
            
            f.write("INSERT OR REPLACE INTO archive_documents (id, title, source_collection, type, status, metadata_json) VALUES\n")
            f.write(",\n".join(values) + ";\n")
            
    print(f"Generated SQL at {sql_path}")

if __name__ == "__main__":
    json_path = r"c:\work\circumsurvey\advocacy-shell\src\data\archive_index.json"
    sql_path = r"c:\work\circumsurvey\advocacy-shell\seed_archive.sql"
    generate_sql(json_path, sql_path)
