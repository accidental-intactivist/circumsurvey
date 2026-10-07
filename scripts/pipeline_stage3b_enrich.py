import os
import sys
import json
import argparse
import time
import concurrent.futures
import threading
from google import genai
from google.genai import types

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env.local if present
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

# We expect GEMINI_API_KEY to be set in the environment
if "GEMINI_API_KEY" not in os.environ:
    print("Error: GEMINI_API_KEY environment variable is not set. Please add it to .env.local")
    sys.exit(1)

client = genai.Client()

def enrich_document(text_content):
    """Call Gemini to extract structured JSON metadata from the text."""
    if not text_content or len(text_content.strip()) < 50:
        return None
        
    prompt = """
    Analyze the following document text and extract the key metadata into a strict JSON format.
    The document may be an academic journal, a newspaper clipping, a legal document, a letter, or medical guidelines.
    
    Return ONLY a raw JSON object with the following schema:
    {
      "academic_title": "The specific headline, article title, or formal academic title of the document. Do not use the file name.",
      "summary": "A 1-2 paragraph concise summary of the document's main arguments or findings.",
      "abstract": "If an abstract is explicitly present, extract it verbatim here. Otherwise, generate a formal academic abstract.",
      "source_publication": "The name of the newspaper, journal, book, or collection this originated from.",
      "author": "The author(s), organization, or creator of the document.",
      "citations": ["Citation 1", "Citation 2"],
      "keywords": ["Keyword 1", "Keyword 2"],
      "category": "A broad subject grouping (e.g., Medical Research, Legal Rights, Activism, History)",
      "media_types": ["Text", "Image", "Video", "Audio"],
      "document_type": "Medical Journal | Newspaper Clipping | Legal Document | Letter | Policy Guideline | Multimedia | Document",
      "publication_date": "YYYY-MM-DD" (or YYYY if month/day is unknown. null if completely unknown),
      "key_people": ["Name 1", "Name 2"],
      "organizations": ["Org 1", "Org 2"],
      "themes": ["Theme 1", "Theme 2"],
      "physical_provenance": {
        "original_collection": "If present, e.g., The Changing Men Collections: Vertical Files",
        "holding_institution": "If present, e.g., Michigan State University Libraries",
        "folder_number": "If present, e.g., 52",
        "archive_subject": "If present, e.g., Circumcision--Miscellanea"
      }
    }
    
    Document Text:
    """ + text_content[:150000] # Limit to ~150k characters to stay within safety limits/cost

    try:
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"  API Error during enrichment: {e}")
        return None

def process_inventory_enrichment(inventory_path, limit=None):
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory not found at {inventory_path}")
        return

    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)

    inventory_dir = os.path.dirname(inventory_path)
    staging_extracted_dir = os.path.join(os.path.dirname(inventory_dir), "extracted")
    extract_folder_name = os.path.basename(inventory_path).split('_inventory')[0]
    extract_dir = os.path.join(staging_extracted_dir, extract_folder_name)

    # Output path for incremental saving
    out_path = inventory_path.replace("_inventory_stage3a.json", "_inventory_stage3b.json")
    
    # If a partial run exists, load it to resume
    if os.path.exists(out_path):
        print("Found existing Stage 3B inventory, resuming...")
        with open(out_path, 'r', encoding='utf-8') as f:
            inventory = json.load(f)

    files_to_process = [f for f in inventory["files"] if not f.get("is_semantic_duplicate") and "extracted_text_path" in f and "ai_metadata" not in f]
    
    if limit:
        files_to_process = files_to_process[:limit]
        print(f"Limiting enrichment to {limit} files for testing.")

    print(f"Processing {len(files_to_process)} documents for AI enrichment concurrently...")

    file_lock = threading.Lock()

    def _enrich_single(idx, file_info):
        print(f"[{idx+1}/{len(files_to_process)}] Enriching: {file_info['relative_path']}")
        
        txt_path = os.path.join(extract_dir, file_info["extracted_text_path"])
        if not os.path.exists(txt_path):
            print(f"  Missing text file: {txt_path}")
            return
            
        with open(txt_path, 'r', encoding='utf-8') as f:
            text_content = f.read()
            
        metadata = None
        retries = 3
        while retries > 0:
            metadata = enrich_document(text_content)
            if metadata:
                break
            print(f"  Rate limited or failed. Retrying in 15 seconds... ({retries} left)")
            time.sleep(15)
            retries -= 1
            
        if metadata:
            file_info["ai_metadata"] = metadata
            print(f"  -> Successfully generated metadata (Type: {metadata.get('document_type')})", flush=True)
        else:
            print("  -> Failed to generate metadata permanently.", flush=True)
            file_info["ai_metadata"] = {"error": "Failed to generate"}
            
        # Save enriched inventory incrementally after every file using a lock
        with file_lock:
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(inventory, f, indent=2)

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        futures = []
        for idx, file_info in enumerate(files_to_process):
            futures.append(executor.submit(_enrich_single, idx, file_info))
        concurrent.futures.wait(futures)

    print(f"\nStage 3B Complete!", flush=True)
    print(f"Saved enriched inventory to {out_path}", flush=True)

if __name__ == "__main__":
    if "GEMINI_API_KEY" not in os.environ:
        print("Error: GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)
        
    parser = argparse.ArgumentParser(description="Stage 3B AI Enrichment")
    parser.add_argument("inventory_path", help="Path to Stage 3A inventory JSON")
    parser.add_argument("--limit", type=int, help="Limit number of files to process for testing")
    args = parser.parse_args()
    
    process_inventory_enrichment(args.inventory_path, args.limit)
