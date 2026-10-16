import os
import sys
import time
import json
import glob
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import google.generativeai as genai
from dotenv import load_dotenv

# Force UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv('.env.local')
load_dotenv('.env')

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment.")
    sys.exit(1)

genai.configure(api_key=API_KEY)

PROMPT = """You are an expert archivist transcribing historical CIA FOIA documents.
Extract all legible text from this document. Output clean, structured Markdown format:
1. Use headers (## Page 1, ## Page 2, etc.) for each page.
2. Accurately transcribe document identifiers, dates, memorandum headers (MEMORANDUM FOR, SUBJECT, DATE, VIA), recipients, and signatures.
3. If accounting ledgers, invoices, vouchers, or financial obligations are present, format them cleanly in Markdown tables.
4. Intelligently correct optical scan noise and smudges using contextual logic, but strictly preserve historical substance and do not invent details.
5. If handwritten notes or margin annotations are present, transcribe them as `*(Margin Note: ...)*`.
Do not include conversational filler."""

def ocr_single_doc(pdf_path, doc_id, max_retries=2):
    """Uploads a PDF to Gemini 3.8 Flash, extracts OCR text, and returns the markdown."""
    for attempt in range(max_retries + 1):
        gfile = None
        try:
            # 1. Upload to Gemini
            gfile = genai.upload_file(path=pdf_path, mime_type="application/pdf")
            
            # 2. Wait for processing if needed
            while gfile.state.name == "PROCESSING":
                time.sleep(2)
                gfile = genai.get_file(gfile.name)
                
            if gfile.state.name == "FAILED":
                return None, f"Gemini file processing failed for {doc_id}"

            # 3. Generate OCR transcription
            model = genai.GenerativeModel("gemini-3.8-flash")
            safety = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = model.generate_content([PROMPT, gfile], safety_settings=safety)
            return response.text, None
        except Exception as e:
            if attempt < max_retries:
                time.sleep(3)
                continue
            return None, str(e)
        finally:
            if gfile:
                try:
                    genai.delete_file(gfile.name)
                except Exception:
                    pass

def main():
    parser = argparse.ArgumentParser(description="Run Gemini 3.8 Flash OCR pass on stitched dossiers.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of documents to OCR in this run")
    parser.add_argument("--workers", type=int, default=3, help="Concurrent workers (default: 3)")
    parser.add_argument("--only-missing", action="store_true", default=True, help="Prioritize documents with < 100 characters of text")
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifest_path = os.path.join(project_root, "scratch", "cia_foia_stitched_manifest.json")
    mock_coll_path = os.path.join(project_root, "public", "api_collections_tim-hammond-archive_mock.json")
    mock_api_path = os.path.join(project_root, "public", "api_mock.json")
    progress_path = os.path.join(project_root, "scratch", "ocr_progress.json")
    docs_dir = os.path.join(project_root, "public", "documents", "cia_foia")

    # Load progress
    progress = {}
    if os.path.exists(progress_path):
        try:
            with open(progress_path, 'r', encoding='utf-8') as f:
                progress = json.load(f)
        except Exception:
            progress = {}

    # Load manifest
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    # Filter targets
    targets = []
    for item in manifest:
        meta = {}
        try:
            meta = json.loads(item.get("metadata_json") or "{}")
        except Exception:
            pass
        foia_id = meta.get("foia_id") or item.get("id", "").replace("umass-ms1205-cia-", "")
        pdf_path = os.path.join(docs_dir, f"{foia_id}.pdf")
        
        if not os.path.exists(pdf_path):
            continue
            
        if foia_id in progress and progress[foia_id].get("status") == "success":
            continue

        text_len = len((item.get("content") or "").strip())
        if args.only_missing:
            # Prioritize documents that had missing/empty text (< 100 chars)
            if text_len < 100:
                targets.append((foia_id, pdf_path, item, text_len))
        else:
            targets.append((foia_id, pdf_path, item, text_len))

    # Sort shortest/emptiest first
    targets.sort(key=lambda x: x[3])

    if args.limit:
        targets = targets[:args.limit]

    print("=" * 70)
    print(f"🚀 OCR PASS: Processing {len(targets)} stitched dossiers with Gemini 3.8 Flash")
    print(f"   Workers: {args.workers} | Output Dir: {docs_dir}")
    print("=" * 70)

    if not targets:
        print("✅ No pending documents found for OCR pass!")
        return

    completed_docs = {}
    failed_docs = []

    def worker_task(foia_id, pdf_path, item):
        title = item.get("title", f"Document {foia_id}")
        print(f"  [START] {foia_id} ({title[:35]}...)", flush=True)
        start = time.time()
        text, err = ocr_single_doc(pdf_path, foia_id)
        duration = round(time.time() - start, 1)
        if text:
            print(f"  [DONE]  {foia_id} in {duration}s -> {len(text)} chars extracted", flush=True)
            return foia_id, text, duration, None
        else:
            print(f"  [FAIL]  {foia_id} in {duration}s -> {err}", flush=True)
            return foia_id, None, duration, err

    processed_counter = 0
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(worker_task, fid, p, itm): fid for fid, p, itm, _ in targets}
        for future in as_completed(futures):
            fid = futures[future]
            processed_counter += 1
            try:
                foia_id, text, dur, err = future.result()
                if text:
                    completed_docs[foia_id] = text
                    progress[foia_id] = {
                        "status": "success",
                        "chars": len(text),
                        "duration_s": dur,
                        "timestamp": time.time()
                    }
                    # Save individual text/md files
                    txt_path = os.path.join(docs_dir, f"{foia_id}.txt")
                    md_path = os.path.join(docs_dir, f"{foia_id}.md")
                    with open(txt_path, 'w', encoding='utf-8') as f:
                        f.write(text)
                    with open(md_path, 'w', encoding='utf-8') as f:
                        f.write(f"# CIA FOIA Dossier {foia_id}\n\n" + text)
                else:
                    failed_docs.append(foia_id)
                    progress[foia_id] = {
                        "status": "error",
                        "error": str(err),
                        "timestamp": time.time()
                    }
            except Exception as ex:
                failed_docs.append(fid)
                progress[fid] = {"status": "error", "error": str(ex)}

            if processed_counter % 5 == 0:
                with open(progress_path, 'w', encoding='utf-8') as f:
                    json.dump(progress, f, indent=2)

    # Final save of progress cache
    with open(progress_path, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)

    # Update manifest and mocks with newly extracted text
    if completed_docs:
        print(f"\nUpdating manifests with {len(completed_docs)} newly OCR'd documents...")
        # 1. Update manifest
        for item in manifest:
            meta = {}
            try:
                meta = json.loads(item.get("metadata_json") or "{}")
            except Exception:
                pass
            fid = meta.get("foia_id") or item.get("id", "").replace("umass-ms1205-cia-", "")
            if fid in completed_docs:
                item["content"] = completed_docs[fid]

        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)

        # 2. Update collection mock
        if os.path.exists(mock_coll_path):
            with open(mock_coll_path, 'r', encoding='utf-8') as f:
                coll_data = json.load(f)
            for d in coll_data.get("documents", []):
                fid = d.get("id", "").replace("umass-ms1205-cia-", "")
                if fid in completed_docs:
                    d["content"] = completed_docs[fid]
            with open(mock_coll_path, 'w', encoding='utf-8') as f:
                json.dump(coll_data, f, indent=2)

        # 3. Update api_mock.json
        if os.path.exists(mock_api_path):
            with open(mock_api_path, 'r', encoding='utf-8') as f:
                api_data = json.load(f)
            for d in api_data:
                fid = d.get("id", "").replace("umass-ms1205-cia-", "")
                if fid in completed_docs:
                    d["content"] = completed_docs[fid]
            with open(mock_api_path, 'w', encoding='utf-8') as f:
                json.dump(api_data, f, indent=2)

    print("\n" + "=" * 70)
    print(f"🎉 BATCH COMPLETE: {len(completed_docs)} successfully transcribed, {len(failed_docs)} errors.")
    print("=" * 70)

if __name__ == "__main__":
    main()
