import os
import json
import boto3
from botocore.client import Config
import glob

# Load .env.local
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

def init_r2():
    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    if not account_id:
        import subprocess
        try:
            output = subprocess.check_output("npx wrangler whoami", shell=True, text=True)
            for line in output.split('\n'):
                if 'Account ID' in line and not 'Account Name' in line:
                    parts = line.split('"', 3)
                    if len(parts) >= 3:
                        account_id = parts[2].strip()
                        break
        except: pass

    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def upload():
    r2_client = init_r2()
    bucket_name = os.environ.get('R2_BUCKET_NAME', 'advocacy-archive')
    
    inventories = glob.glob('pipeline_staging/inventory/*_stage3b.json')
    count = 0
    for inv_path in inventories:
        with open(inv_path, 'r', encoding='utf-8') as f:
            inventory = json.load(f)
            
        extract_folder_name = os.path.basename(inv_path).replace("_inventory_stage3b.json", "").replace("_inventory_stage3a.json", "")
        text_dir = os.path.join('pipeline_staging', 'extracted', extract_folder_name)
        
        for doc in inventory.get('files', []):
            if 'ai_metadata' in doc and 'extracted_text_path' in doc:
                doc_id = doc['sha256_hash']
                txt_path = os.path.join(text_dir, doc['extracted_text_path'])
                
                if os.path.exists(txt_path):
                    r2_key = f"documents/{doc_id}.txt"
                    try:
                        r2_client.upload_file(txt_path, bucket_name, r2_key, ExtraArgs={'ContentType': 'text/plain'})
                        count += 1
                        if count % 10 == 0:
                            print(f"Uploaded {count} text files...")
                    except Exception as e:
                        print(f"Failed to upload {txt_path}: {e}")

    print(f"Successfully uploaded {count} text files to R2!")

if __name__ == '__main__':
    upload()
