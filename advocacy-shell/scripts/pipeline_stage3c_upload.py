import os
import sys
import json
import boto3
import subprocess
from botocore.client import Config
from google import genai
import time
from tqdm import tqdm

# Force UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env.local
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

def init_r2():
    # R2 requires the Account ID in the endpoint URL
    # To avoid the user needing CLOUDFLARE_ACCOUNT_ID, we can actually just extract it from the local wrangler config
    # But since they might already have it, let's try to get it from wrangler whoami if not in env
    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    if not account_id:
        print("Fetching Account ID from Wrangler...")
        try:
            output = subprocess.check_output("npx wrangler whoami", shell=True, text=True)
            for line in output.split('\n'):
                if 'Account ID' in line and not 'Account Name' in line:
                    parts = line.split('│')
                    if len(parts) >= 3:
                        account_id = parts[2].strip()
                        break
        except Exception as e:
            pass
            
    if not account_id:
        raise ValueError("Could not find CLOUDFLARE_ACCOUNT_ID in .env.local or via wrangler")

    print(f"Using R2 Endpoint for Account ID: {account_id}")
    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def generate_embedding(text, client):
    # Truncate text to fit in embedding model limits if necessary (approx 8000 tokens for Gemini)
    # 32000 chars is roughly 8000 tokens
    if len(text) > 30000:
        text = text[:30000]
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return response.embeddings[0].values

def escape_sql_string(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def process_inventory(inventory_path):
    print(f"Loading inventory from {inventory_path}")
    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)
    
    r2_client = init_r2()
    bucket_name = os.environ.get('R2_BUCKET_NAME', 'advocacy-archive')
    gemini_client = genai.Client()

    sql_statements = []
    vector_records = []
    
    # Track unique IDs for many-to-many relationships
    people_map = {} # name -> id
    orgs_map = {} # name -> id
    themes_map = {} # name -> id
    
    # Calculate extract directory
    inventory_dir = os.path.dirname(inventory_path)
    staging_extracted_dir = os.path.join(os.path.dirname(inventory_dir), "extracted")
    extract_folder_name = os.path.basename(inventory_path).replace("_inventory_stage3b.json", "").replace("_inventory_stage3a.json", "")
    extract_dir = os.path.join(staging_extracted_dir, extract_folder_name)
    
    count = 0
    # Process all documents that have ai_metadata
    docs_to_process = [d for d in inventory.get('files', []) if 'ai_metadata' in d]
    for doc in tqdm(docs_to_process):
        ai_metadata = doc.get('ai_metadata', {})
        doc_id = doc['sha256_hash']
        title = ai_metadata.get('academic_title') or doc['filename']
        source_zip = inventory.get('source_archive', 'unknown').replace('.zip', '')
        
        file_path = os.path.join(extract_dir, doc['relative_path'])
        
        # 1. Upload PDF to R2
        r2_key = f"documents/{doc_id}.pdf"
        try:
            r2_client.upload_file(file_path, bucket_name, r2_key)
        except Exception as e:
            print(f"Failed to upload {file_path}: {e}")
            continue

        # 2. Build D1 SQL for archive_documents
        summary = ai_metadata.get('summary', '')
        doc_type = ai_metadata.get('document_type', 'Unknown').replace(' ', '_').lower()
        pub_date = ai_metadata.get('publication_date', 'Unknown')
        
        # Date fallback: extract from filename if Unknown
        if pub_date == 'Unknown' or not pub_date:
            import re
            match = re.search(r'(?:19|20)\d{2}(?:-\d{2}-\d{2})?', doc['filename'])
            if match:
                pub_date = match.group(0)
        
        meta_dict = {
            "date": pub_date,
            "description": summary,
            "source": source_zip
        }
        # Include all other ai_metadata fields in the JSON blob
        for k, v in ai_metadata.items():
            if k not in ["publication_date", "summary"]:
                meta_dict[k] = v
                
        meta_json = json.dumps(meta_dict)
        url = f"/api/assets/documents/{doc_id}.pdf"
        
        sql_statements.append(f"INSERT OR REPLACE INTO archive_documents (id, title, source_collection, url, type, status, metadata_json) VALUES ({escape_sql_string(doc_id)}, {escape_sql_string(title)}, {escape_sql_string(source_zip)}, {escape_sql_string(url)}, {escape_sql_string(doc_type)}, 'ingested', {escape_sql_string(meta_json)});")
        
        # 3. Build Vectorize NDJSON (Skip embeddings for now to save time, since the UI doesn't use semantic search yet)
        count += 1
        
    # Write SQL batch
    sql_path = "batch_metadata.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements))
        
    print(f"Generated {count} records. Ready for upload.")
    print("Executing D1 batch insert (LOCAL via sqlite3)...")
    import glob, sqlite3
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        glob_pattern = os.path.join(base_dir, '.wrangler', 'state', 'v3', 'd1', '*', '*.sqlite')
        db_path = [f for f in glob.glob(glob_pattern) if 'metadata' not in f][0]
        conn = sqlite3.connect(db_path)
        with open(sql_path, 'r', encoding='utf-8') as sf:
            conn.executescript(sf.read())
        conn.commit()
        conn.close()
        print("Batch insert successful.")
    except Exception as e:
        print(f"Error executing sqlite3 insert: {e}")
        
    # We skip vectorize insert for now since it's failing on model mismatch and we don't need it for the table view
    # os.system(f"npx wrangler vectorize insert advocacy-archive-index --file={ndjson_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pipeline_stage3c_upload.py <path_to_inventory_json>")
        sys.exit(1)
    process_inventory(sys.argv[1])
