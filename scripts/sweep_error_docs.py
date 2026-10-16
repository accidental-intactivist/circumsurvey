import json
import requests
import re
import time
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

API_BASE = "https://advocacy-shell.pages.dev"

def extract_hash(url):
    if not url: return None
    m = re.search(r'([a-f0-9]{32,64})', url)
    return m.group(1) if m else None

def process_single_doc(doc, mock_by_id, mock_by_url, mock_by_hash):
    doc_id = doc.get('id')
    doc_url = doc.get('url') or ''
    doc_hash = extract_hash(doc_url) or extract_hash(doc_id)
    doc_title = doc.get('title') or "Untitled Document"

    text = None
    source_title = None

    # Try mock data
    match = mock_by_id.get(doc_id) or mock_by_url.get(doc_url) or (mock_by_hash.get(doc_hash) if doc_hash else None)
    if match and match.get('content') and len(match.get('content').strip()) > 50:
        text = match.get('content').strip()
        source_title = match.get('title')

    # Try companion .txt in R2
    if not text and doc_url.lower().endswith('.pdf'):
        txt_url = doc_url[:-4] + '.txt'
        try:
            r2_url = f"{API_BASE}{txt_url}"
            r2_res = requests.get(r2_url, timeout=10)
            if r2_res.status_code == 200 and len(r2_res.text.strip()) > 50:
                text = r2_res.text.strip()
        except Exception:
            pass

    if not text and doc_url.lower().endswith('.txt'):
        try:
            r2_url = f"{API_BASE}{doc_url}"
            r2_res = requests.get(r2_url, timeout=10)
            if r2_res.status_code == 200 and len(r2_res.text.strip()) > 50:
                text = r2_res.text.strip()
        except Exception:
            pass

    if not text:
        return {"id": doc_id, "status": "skipped_no_text", "title": doc_title, "chunks": 0}

    clean_filename = doc_url.replace('/api/assets/', '')
    if not clean_filename:
        clean_filename = f"documents/{doc_id}.pdf"

    final_title = source_title if source_title and not source_title.startswith("Documents/") else doc_title

    payload = {
        "docId": doc_id,
        "filename": clean_filename,
        "originalTitle": final_title,
        "extractedText": text,
        "newTitle": final_title,
        "metadata": {
            "source": "error_sweep_reprocessing",
            "char_length": len(text)
        }
    }

    try:
        save_res = requests.post(f"{API_BASE}/api/cms/save-ocr", json=payload, timeout=60)
        if save_res.status_code == 200:
            data = save_res.json()
            chunks = data.get("chunks", 0)
            return {"id": doc_id, "status": "success", "title": final_title, "chunks": chunks}
        else:
            return {"id": doc_id, "status": "failed", "title": final_title, "error": f"HTTP {save_res.status_code}: {save_res.text[:150]}"}
    except Exception as e:
        return {"id": doc_id, "status": "exception", "title": final_title, "error": str(e)}

def run_sweep():
    print("=== Starting Fast OCR Vectorization Sweep ===", flush=True)

    mock_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "api_mock.json")
    with open(mock_path, 'r', encoding='utf-8') as f:
        mock_data = json.load(f)

    mock_by_hash = {}
    mock_by_id = {}
    mock_by_url = {}

    for d in mock_data:
        if d.get('id'): mock_by_id[d.get('id')] = d
        if d.get('url'): mock_by_url[d.get('url')] = d
        h = extract_hash(d.get('url')) or extract_hash(d.get('id'))
        if h: mock_by_hash[h] = d

    print("Fetching error documents from production CMS...", flush=True)
    res = requests.get(f"{API_BASE}/api/cms?status=error&limit=500")
    if res.status_code != 200:
        print(f"Failed to fetch error documents: HTTP {res.status_code}", flush=True)
        return

    error_docs = res.json().get('data', [])
    total_docs = len(error_docs)
    print(f"Found {total_docs} documents with status='error'. Starting concurrent worker pool (5 workers)...", flush=True)

    stats = {
        "total": total_docs,
        "vectorized": 0,
        "total_chunks": 0,
        "skipped_no_text": 0,
        "failed": 0,
        "details": []
    }

    processed_count = 0
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_doc = {
            executor.submit(process_single_doc, doc, mock_by_id, mock_by_url, mock_by_hash): doc 
            for doc in error_docs
        }
        for future in as_completed(future_to_doc):
            processed_count += 1
            result = future.result()
            stats["details"].append(result)
            
            st = result.get("status")
            if st == "success":
                stats["vectorized"] += 1
                c = result.get("chunks", 0)
                stats["total_chunks"] += c
                print(f"[{processed_count}/{total_docs}] SUCCESS {result['id']} -> {c} chunks ('{result['title'][:40]}...')", flush=True)
            elif st == "skipped_no_text":
                stats["skipped_no_text"] += 1
                print(f"[{processed_count}/{total_docs}] SKIP {result['id']}: No raw text found", flush=True)
            else:
                stats["failed"] += 1
                print(f"[{processed_count}/{total_docs}] FAILED {result['id']}: {result.get('error', 'Unknown')[:100]}", flush=True)

    print("\n=== Sweep Completed ===", flush=True)
    print(f"Total documents evaluated: {stats['total']}", flush=True)
    print(f"Successfully vectorized & ingested: {stats['vectorized']}", flush=True)
    print(f"Total new chunks added to Vectorize: {stats['total_chunks']}", flush=True)
    print(f"Skipped (missing raw text): {stats['skipped_no_text']}", flush=True)
    print(f"Failed during save-ocr: {stats['failed']}", flush=True)

    report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pipeline_staging", "sweep_results.json")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"Saved audit log to {report_path}", flush=True)

if __name__ == "__main__":
    run_sweep()
