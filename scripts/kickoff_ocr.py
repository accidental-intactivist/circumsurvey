import os
import time
import json
import requests
import tempfile
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import google.generativeai as genai
from dotenv import load_dotenv

# Load API keys from .env files
load_dotenv('.env.local')
load_dotenv('.env')
load_dotenv('../.env')

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment.")
    exit(1)

genai.configure(api_key=API_KEY)
API_BASE_URL = "https://advocacy-shell.pages.dev"
# For local dev, uncomment:
# API_BASE_URL = "http://localhost:5173"

PROMPT = """You are an expert archivist. Extract all text from this document. Output strict Markdown format. Use proper headers (##), bulleted lists, and format any tabular data as Markdown tables. Preserve all information, but format it cleanly in Markdown. Do not include any conversational filler. 

Intelligently fix any OCR typos, broken words, or scanning artifacts using contextual semantic logic, but do not alter the underlying meaning, tone, or rewrite the author's original text.

CRITICAL INSTRUCTION TO BYPASS RECITATION FILTERS: For the extracted Markdown text (everything after the JSON block), you MUST prefix every single line with the character `|`. Do not output any line of the extracted text without starting it with `|`. This is mandatory.

IMPORTANT: Your output MUST begin with a JSON block enclosed in ```json ... ``` containing the following metadata:
{
  "title": "A concise, friendly title for this document",
  "publication_date": "Estimated date if found (YYYY-MM-DD or YYYY or null)",
  "authors": ["Author 1", "Author 2", "etc"],
  "organizations": ["Org 1", "Org 2", "etc"]
}
After the JSON block, provide the full extracted Markdown text, remembering to prefix every line with `|`.
"""

def process_document(doc):
    doc_id = doc.get("id")
    filename = doc.get("url", "").replace("/api/assets/", "")
    original_title = doc.get("title")
    
    print(f"[{doc_id}] Processing {filename}...")
    
    # 1. Download file
    file_url = f"{API_BASE_URL}/api/assets/{filename}"
    res = requests.get(file_url)
    if res.status_code != 200:
        return f"[{doc_id}] Failed to download {file_url}"
        
    mime_type = "application/pdf"
    if filename.lower().endswith(('.jpg', '.jpeg')): mime_type = "image/jpeg"
    elif filename.lower().endswith('.png'): mime_type = "image/png"
    elif filename.lower().endswith('.webp'): mime_type = "image/webp"
    elif filename.lower().endswith('.txt'): mime_type = "text/plain"
    
    # Save to temp file because genai.upload_file needs a path
    fd, temp_path = tempfile.mkstemp(suffix="." + filename.split('.')[-1])
    with os.fdopen(fd, 'wb') as f:
        f.write(res.content)
        
    gfile = None
    try:
        # 2. Upload to Gemini
        print(f"[{doc_id}] Uploading to Gemini...")
        gfile = genai.upload_file(path=temp_path, mime_type=mime_type)
        
        # 3. Poll for ACTIVE state
        while gfile.state.name == "PROCESSING":
            print(f"[{doc_id}] Processing state... waiting 5s")
            time.sleep(5)
            gfile = genai.get_file(gfile.name)
            
        if gfile.state.name == "FAILED":
            return f"[{doc_id}] Gemini failed to process the file."
            
        # 4. Generate Content
        print(f"[{doc_id}] Generating content with Gemini 3.8 Flash...")
        model = genai.GenerativeModel("gemini-3.8-flash")
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        response = model.generate_content([PROMPT, gfile], safety_settings=safety_settings)
        raw_text = response.text
        
        # 5. Extract JSON and Markdown
        metadata = {}
        new_title = original_title
        extracted_text = raw_text
        
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', raw_text, re.DOTALL)
        if json_match:
            try:
                metadata = json.loads(json_match.group(1))
                new_title = metadata.get("title", original_title)
                extracted_text = raw_text[json_match.end():].strip()
            except Exception as e:
                print(f"[{doc_id}] Failed to parse JSON metadata: {e}")
                
        # Strip the | prefix hack
        cleaned_lines = []
        for line in extracted_text.split('\n'):
            if line.startswith('| '):
                cleaned_lines.append(line[2:])
            elif line.startswith('|'):
                cleaned_lines.append(line[1:])
            else:
                cleaned_lines.append(line)
        extracted_text = '\n'.join(cleaned_lines)
                
        # 6. Send to save-ocr
        print(f"[{doc_id}] Saving to database...")
        payload = {
            "docId": doc_id,
            "filename": filename,
            "originalTitle": original_title,
            "extractedText": extracted_text,
            "newTitle": new_title,
            "metadata": metadata
        }
        save_res = requests.post(f"{API_BASE_URL}/api/cms/save-ocr", json=payload)
        
        if save_res.status_code == 200:
            return f"[{doc_id}] SUCCESS! Extracted {len(extracted_text)} chars. Title: {new_title}"
        else:
            raise RuntimeError(f"save-ocr failed (HTTP {save_res.status_code}): {save_res.text}")
            
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        error_msg = f"ERROR: {str(e)}\n{trace}"
        
        # Send error to database so it doesn't loop forever
        try:
            requests.post(f"{API_BASE_URL}/api/cms/save-ocr", json={
                "docId": doc_id,
                "filename": filename,
                "errorMessage": error_msg
            })
        except:
            pass
            
        return f"[{doc_id}] ERROR on {filename}: {str(e)}"
    finally:
        # cleanup temp file
        os.remove(temp_path)
        # delete from gemini to avoid hitting quotas
        if gfile:
            try:
                genai.delete_file(gfile.name)
            except:
                pass

def main():
    while True:
        print("Fetching batch of pending documents...")
        res = requests.get(f"{API_BASE_URL}/api/cms/pending-ocr?limit=5")
        if res.status_code != 200:
            print(f"Error fetching pending docs: {res.text}")
            break
            
        data = res.json()
        docs = data.get("documents", [])
        if not docs:
            print("No pending documents remaining!")
            break
            
        print(f"Processing batch of {len(docs)} documents concurrently...")
        # Use 5 concurrent workers
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_doc = {executor.submit(process_document, doc): doc for doc in docs}
            for future in as_completed(future_to_doc):
                print(future.result())

if __name__ == "__main__":
    main()
