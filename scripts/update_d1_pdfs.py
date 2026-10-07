import json
import os
import sqlite3
import glob

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    advocacy_dir = os.path.dirname(script_dir)
    index_path = os.path.join(advocacy_dir, "src", "data", "archive_index.json")
    
    with open(index_path, 'r', encoding='utf-8') as f:
        records = json.load(f)

    sql_statements = []
    
    for record in records:
        raw_files = record.get("raw_files", [])
        if not raw_files:
            continue
            
        first_file = raw_files[0]
        first_name = first_file.get('path') if isinstance(first_file, dict) else first_file
        
        if first_name.lower().endswith('.pdf'):
            doc_id = record['id']
            url = f"/api/assets/documents/{first_name}"
            sql = f"UPDATE archive_documents SET url = '{url}', status = 'pending_ocr' WHERE id = '{doc_id}';"
            sql_statements.append(sql)

    if not sql_statements:
        print("No PDF records found to update.")
        return

    sql_file = os.path.join(advocacy_dir, "scripts", "update_pdfs_d1.sql")
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated {len(sql_statements)} UPDATE statements in {sql_file}")
    
    try:
        db_pattern = os.path.join(advocacy_dir, '.wrangler', 'state', 'v3', 'd1', '*', '*.sqlite')
        db_files = glob.glob(db_pattern)
        if db_files:
            db_path = db_files[0]
            print(f"Executing locally against {db_path}...")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            for stmt in sql_statements:
                cursor.execute(stmt)
            conn.commit()
            conn.close()
            print("Local DB updated successfully.")
        else:
            print("Could not find local D1 sqlite file.")
    except Exception as e:
        print(f"Error updating local DB: {e}")

if __name__ == "__main__":
    main()
