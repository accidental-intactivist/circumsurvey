import os
import json
import sqlite3
import zipfile
import tempfile
import boto3
from botocore.client import Config
import time
from tqdm import tqdm
import subprocess
import shutil

STAGING_DIR = r"C:\work\circumsurvey\advocacy-shell\pipeline_staging\umass_temp"
os.makedirs(STAGING_DIR, exist_ok=True)
RAW_DIR = r"C:\work\circumsurvey\advocacy-shell\raw_content\UMass Archives"

# Load .env.local
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

def init_r2():
    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    if not account_id:
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
        raise ValueError("Could not find CLOUDFLARE_ACCOUNT_ID")

    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def main():
    r2_client = init_r2()
    bucket_name = os.environ.get('R2_BUCKET_NAME', 'advocacy-archive')
    
    db_path = r"C:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite"
    conn = sqlite3.connect(db_path)
    
    # Get all pending UMass items
    rows = conn.execute("SELECT id, title, metadata_json FROM archive_documents WHERE id LIKE 'umass-ms1205-%' AND status = 'pending_digitization'").fetchall()
    
    print(f"Found {len(rows)} UMass items pending digitization.")
    
    # We will process in batches to save memory
    success_count = 0
    error_count = 0
    
    # Open zip files as needed, cache the references
    open_zips = {}
    
    for row in tqdm(rows):
        doc_id, title, meta_str = row
        meta = json.loads(meta_str) if meta_str else {}
        
        raw_files = meta.get('raw_files', [])
        if not raw_files:
            continue
            
        raw_file = raw_files[0]
        source_zip = raw_file.get('source')
        inner_path = raw_file.get('path')
        
        if not source_zip or not inner_path:
            continue
            
        zip_path = os.path.join(RAW_DIR, source_zip)
        if not os.path.exists(zip_path):
            continue
            
        try:
            if zip_path not in open_zips:
                open_zips[zip_path] = zipfile.ZipFile(zip_path, 'r')
                
            z = open_zips[zip_path]
            
            # Extract to temp
            ext = os.path.splitext(inner_path)[1].lower()
            temp_filename = f"{doc_id}{ext}"
            temp_path = os.path.join(STAGING_DIR, temp_filename)
            
            with z.open(inner_path) as source, open(temp_path, "wb") as target:
                shutil.copyfileobj(source, target)
                
            # If it's an image, convert to PDF
            final_upload_path = temp_path
            if ext in ['.jpg', '.jpeg', '.png', '.tif', '.tiff']:
                from PIL import Image
                img = Image.open(temp_path)
                if img.mode != "RGB":
                    img = img.convert("RGB")
                pdf_path = os.path.join(STAGING_DIR, f"{doc_id}.pdf")
                img.save(pdf_path, "PDF", resolution=100.0)
                final_upload_path = pdf_path
                ext = ".pdf"
                os.remove(temp_path)
            
            # Upload to R2
            r2_key = f"documents/{doc_id}{ext}"
            r2_client.upload_file(final_upload_path, bucket_name, r2_key)
            
            # We are skipping OCR/AI enrichment for now to get the files online quickly.
            # We can run a dedicated OCR job on the R2 bucket later.
            
            url = f"/api/assets/documents/{doc_id}{ext}"
            doc_type = "image" if ext != ".pdf" else "physical_document"
            
            # Update DB
            conn.execute("UPDATE archive_documents SET status = 'ingested', url = ?, type = ? WHERE id = ?", (url, doc_type, doc_id))
            conn.commit()
            
            # Cleanup
            os.remove(final_upload_path)
            success_count += 1
            
        except Exception as e:
            print(f"Error processing {doc_id}: {e}")
            error_count += 1
            
    # Close zips
    for z in open_zips.values():
        z.close()
        
    print(f"\nCompleted! Successfully ingested {success_count} files. Errors: {error_count}")
    
    # Export mock
    conn.row_factory = sqlite3.Row
    export_rows = conn.execute("SELECT * FROM archive_documents").fetchall()
    data = [dict(r) for r in export_rows]
    with open(r'C:\work\circumsurvey\advocacy-shell\public\api_mock.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f'Exported {len(data)} rows to api_mock.json')

if __name__ == '__main__':
    main()
