import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
import fitz  # PyMuPDF
import io

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
    
    print("Fetching list of all PDFs in the bucket...")
    paginator = r2.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket_name, Prefix='documents/')
    
    pdfs = []
    for page in pages:
        for obj in page.get('Contents', []):
            if obj['Key'].lower().endswith('.pdf'):
                pdfs.append(obj['Key'])
                
    print(f"Found {len(pdfs)} PDFs. Checking for missing thumbnails...")
    
    # Get list of existing thumbnails
    thumb_pages = paginator.paginate(Bucket=bucket_name, Prefix='thumbnails/')
    existing_thumbs = set()
    for page in thumb_pages:
        for obj in page.get('Contents', []):
            existing_thumbs.add(obj['Key'])
            
    processed = 0
    errors = 0
    
    for pdf_key in pdfs:
        base_name = os.path.basename(pdf_key)
        thumb_key = f"thumbnails/{os.path.splitext(base_name)[0]}.jpg"
        
        if thumb_key in existing_thumbs:
            continue
            
        print(f"Generating thumbnail for {base_name}...")
        try:
            # Download PDF into memory
            response = r2.get_object(Bucket=bucket_name, Key=pdf_key)
            pdf_bytes = response['Body'].read()
            
            # Open with PyMuPDF
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            if len(doc) == 0:
                print(f"  Warning: {base_name} is empty.")
                errors += 1
                continue
                
            page = doc[0] # first page
            # Render at low resolution (width ~300px). Default 72 DPI -> ~150 DPI gives ~1200px. We'll use matrix.
            zoom = 0.5 # scale down
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Convert to JPEG bytes
            img_bytes = pix.tobytes("jpeg")
            
            # Upload to R2
            r2.put_object(
                Bucket=bucket_name,
                Key=thumb_key,
                Body=img_bytes,
                ContentType='image/jpeg'
            )
            print(f"  -> Uploaded {thumb_key}")
            processed += 1
            
        except Exception as e:
            print(f"  Error processing {pdf_key}: {e}")
            errors += 1
            
    print(f"\nFinished! Generated {processed} thumbnails. Errors: {errors}")

if __name__ == "__main__":
    main()
