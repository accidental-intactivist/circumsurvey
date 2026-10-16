import os
import json
import glob

def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_path = os.path.join(project_root, "public", "api_mock.json")
    
    with open(mock_path, 'r', encoding='utf-8') as f:
        mock = json.load(f)

    # 1. Map MSU Clippings stage3b
    msu_inv_path = os.path.join(project_root, "pipeline_staging", "inventory", "completed", "MSU_Clippings_20260924_190627_inventory_stage3b.json")
    msu_staging_dir = os.path.join(project_root, "pipeline_staging", "extracted", "MSU_Clippings_20260924_190627")
    
    msu_text_map = {}
    if os.path.exists(msu_inv_path):
        with open(msu_inv_path, 'r', encoding='utf-8') as f:
            msu_inv = json.load(f)
        for item in msu_inv.get('files', []):
            h = item.get('sha256_hash')
            txt_rel = item.get('extracted_text_path')
            if h and txt_rel:
                txt_full = os.path.join(msu_staging_dir, txt_rel)
                if os.path.exists(txt_full):
                    msu_text_map[h] = txt_full

    # 2. Map WeTransfer stage3b
    wt_inv_path = os.path.join(project_root, "pipeline_staging", "inventory", "completed", "wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433_inventory_stage3b.json")
    wt_staging_dir = os.path.join(project_root, "pipeline_staging", "extracted", "wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433")
    
    wt_text_map = {}
    if os.path.exists(wt_inv_path):
        with open(wt_inv_path, 'r', encoding='utf-8') as f:
            wt_inv = json.load(f)
        for item in wt_inv.get('files', []):
            h = item.get('sha256_hash')
            txt_rel = item.get('extracted_text_path')
            if h and txt_rel:
                txt_full = os.path.join(wt_staging_dir, txt_rel)
                if os.path.exists(txt_full):
                    wt_text_map[h] = txt_full

    # 3. Map Awakenings Report
    awakenings_txt = os.path.join(project_root, "pipeline_staging", "extracted", "1994 Awakenings Full Report_20260924_124500", "1994 Awakenings Full Report.pdf.txt")
    
    print(f"Found {len(msu_text_map)} MSU text files in staging.")
    print(f"Found {len(wt_text_map)} WeTransfer text files in staging.")

    msu_hydrated = 0
    wt_hydrated = 0
    other_hydrated = 0

    for doc in mock:
        doc_id = doc.get('id')
        if doc_id in msu_text_map and not doc.get('content'):
            try:
                with open(msu_text_map[doc_id], 'r', encoding='utf-8', errors='replace') as tf:
                    doc['content'] = tf.read().strip()
                msu_hydrated += 1
            except Exception:
                pass
        elif doc_id in wt_text_map and not doc.get('content'):
            try:
                with open(wt_text_map[doc_id], 'r', encoding='utf-8', errors='replace') as tf:
                    doc['content'] = tf.read().strip()
                wt_hydrated += 1
            except Exception:
                pass
        elif '1994 Awakenings Full Report' in (doc.get('title') or '') and os.path.exists(awakenings_txt) and not doc.get('content'):
            try:
                with open(awakenings_txt, 'r', encoding='utf-8', errors='replace') as tf:
                    doc['content'] = tf.read().strip()
                other_hydrated += 1
            except Exception:
                pass

    print(f"Hydrated {msu_hydrated} MSU documents with full text.")
    print(f"Hydrated {wt_hydrated} WeTransfer articles with full text.")
    print(f"Hydrated {other_hydrated} milestone reports with full text.")

    with open(mock_path, 'w', encoding='utf-8') as f:
        json.dump(mock, f, indent=2)

    print("Successfully saved hydrated api_mock.json!")

if __name__ == "__main__":
    main()
