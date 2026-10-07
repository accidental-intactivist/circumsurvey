import os
import json
import zipfile
import io
import boto3
from botocore.client import Config
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Force UTF-8 encoding
import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def get_r2_client():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, val = line.strip().split('=', 1)
                    os.environ[key] = val

    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    if not account_id:
        raise ValueError("Could not find CLOUDFLARE_ACCOUNT_ID in .env.local")

    print(f"Using R2 Endpoint for Account ID: {account_id}")
    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def main():
    r2 = get_r2_client()
    bucket_name = os.environ.get('R2_BUCKET_NAME', 'advocacy-archive')
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    advocacy_dir = os.path.dirname(script_dir)
    raw_dir = os.path.join(advocacy_dir, "raw_content", "UMass Archives")
    index_path = os.path.join(advocacy_dir, "src", "data", "archive_index.json")
    
    with open(index_path, 'r', encoding='utf-8') as f:
        records = json.load(f)

    zip_files = [f for f in os.listdir(raw_dir) if f.endswith('.zip')]
    zip_paths = [os.path.join(raw_dir, z) for z in zip_files]

    total_converted = 0
    
    for record in records:
        raw_files = record.get("raw_files", [])
        if not raw_files:
            continue
            
        is_tif_group = any((f.get('path', '') if isinstance(f, dict) else f).lower().endswith('.tif') for f in raw_files)
        if not is_tif_group:
            continue
            
        print(f"\nProcessing {record['id']} ({len(raw_files)} pages)", flush=True)
        
        images = []
        for tif_item in raw_files:
            tif_file = tif_item.get('path') if isinstance(tif_item, dict) else tif_item
            found = False
            for zpath in zip_paths:
                try:
                    with zipfile.ZipFile(zpath, 'r') as zf:
                        for member in zf.namelist():
                            if member.endswith(tif_file):
                                with zf.open(member) as img_file:
                                    img_data = img_file.read()
                                    found = True
                                    try:
                                        img = Image.open(io.BytesIO(img_data))
                                        if img.mode != 'RGB':
                                            img = img.convert('RGB')
                                        img.load()
                                        images.append(img)
                                    except Exception as e:
                                        print(f"  Error parsing {tif_file}: {e}")
                                    break
                except zipfile.BadZipFile:
                    continue
                if found:
                    break
            
            if not found:
                print(f"  Warning: Could not find {tif_file} in zips.")
                
        if not images:
            print("  Skipping, no images extracted.")
            continue
            
        # Clean the base name using regex (remove _001)
        import re
        first_item = raw_files[0]
        first_name = first_item.get('path') if isinstance(first_item, dict) else first_item
        base_filename = re.sub(r'_\d{4}\.TIF$', '', first_name, flags=re.IGNORECASE)
        pdf_filename = f"{base_filename}.pdf"
        
        pdf_bytes = io.BytesIO()
        images[0].save(
            pdf_bytes, 
            format='PDF', 
            save_all=True, 
            append_images=images[1:],
            resolution=100.0
        )
        pdf_bytes.seek(0)
        
        r2_key = f"documents/{pdf_filename}"
        print(f"  Uploading {pdf_filename} ({len(pdf_bytes.getvalue()) / 1024 / 1024:.2f} MB) to R2...", flush=True)
        
        r2.put_object(
            Bucket=bucket_name,
            Key=r2_key,
            Body=pdf_bytes,
            ContentType='application/pdf'
        )
        record['raw_files'] = [pdf_filename]
        total_converted += 1

    if total_converted > 0:
        print(f"\nSaving updated index ({total_converted} records modified)...")
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2)
    else:
        print("\nNo TIF records needed conversion.")

if __name__ == "__main__":
    main()
