import os
import requests
import json
import time

RAW_DIR = r"C:\work\circumsurvey\advocacy-shell\raw_content"
API_URL = "https://advocacy-shell.pages.dev/api/ingest"  # Live production endpoint

def auto_ingest():
    if not os.path.exists(RAW_DIR):
        print(f"Error: Directory {RAW_DIR} not found.")
        return

    files = [f for f in os.listdir(RAW_DIR) if os.path.isfile(os.path.join(RAW_DIR, f))]
    
    if not files:
        print("No files found in raw_content directory.")
        return

    print(f"Found {len(files)} files to ingest. Starting auto-ingestion...\n")

    for filename in files:
        filepath = os.path.join(RAW_DIR, filename)
        
        # We can extract a basic title from the filename (removing extension)
        title = os.path.splitext(filename)[0]
        
        metadata = {
            "title": title,
            "source": "bulk_auto_ingest"
        }

        safe_filename = filename.encode('ascii', 'replace').decode('ascii')
        print(f"[{time.strftime('%H:%M:%S')}] Ingesting: {safe_filename}...")
        
        try:
            with open(filepath, 'rb') as f:
                # Determine mime type simply by extension
                mime_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'application/octet-stream'
                
                multipart_form_data = {
                    'file': (filename, f, mime_type)
                }
                data = {
                    'metadata': json.dumps(metadata)
                }
                
                response = requests.post(API_URL, files=multipart_form_data, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"  [SUCCESS] R2 URL: {result.get('r2_url')}")
                    print(f"  [SUCCESS] Chunks Vectorized: {result.get('chunks_vectorized')}\n")
                else:
                    print(f"  [FAILED] Failed ({response.status_code}): {response.text}\n")
                    
        except requests.exceptions.ConnectionError:
            print(f"  [FAILED] Connection Error: Is Wrangler running on {API_URL}?")
            print("  Please run 'npx wrangler pages dev dist' in a separate terminal.")
            break
        except Exception as e:
            print(f"  [FAILED] Unexpected Error: {str(e)}\n")

if __name__ == "__main__":
    auto_ingest()
