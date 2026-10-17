import json
import os
import re
import zipfile
import pymupdf

def clean_sql_str(val):
    if val is None:
        return 'NULL'
    # Escape single quotes by doubling them
    s = str(val).replace("'", "''")
    return f"'{s}'"

def chunk_text(doc_id, title, url, text, max_chars=1100):
    paragraphs = text.split('\n\n')
    chunks = []
    current = ""
    
    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if len(p_clean) > max_chars:
            if current.strip():
                chunks.append(current.strip())
                current = ""
            sentences = re.split(r'(?<=[.!?])\s+', p_clean)
            sub = ""
            for sent in sentences:
                if len(sub) + len(sent) > max_chars and sub:
                    chunks.append(sub.strip())
                    sub = sent
                else:
                    sub = f"{sub} {sent}".strip()
            if sub.strip():
                chunks.append(sub.strip())
        else:
            if len(current) + len(p_clean) > max_chars and current:
                chunks.append(current.strip())
                current = p_clean
            else:
                current = f"{current}\n\n{p_clean}".strip()
                
    if current.strip():
        chunks.append(current.strip())
        
    payloads = []
    for i, c in enumerate(chunks):
        payloads.append({
            "id": f"{doc_id}-chunk-{i}",
            "doc_id": doc_id,
            "title": title[:200] if title else "Untitled",
            "chunk_index": i,
            "source": url or f"/documents/{doc_id}",
            "text": c[:2500]
        })
    return payloads

def main():
    print("=== Starting Comprehensive Archive & Vectorization Sweeper ===")
    
    mock_path = 'public/api_mock.json'
    with open(mock_path, 'r', encoding='utf-8') as f:
        docs = json.load(f)
        
    print(f"Loaded {len(docs)} documents from {mock_path}.")
    
    # 1. Index staging extracted text files
    staging_txts = {}
    for root, _, files in os.walk('pipeline_staging/extracted'):
        for f in files:
            if f.endswith('.txt'):
                full_p = os.path.join(root, f)
                staging_txts[f.lower()] = full_p
                # base without .pdf.txt or .txt
                base = f[:-4]
                if base.lower().endswith('.pdf'):
                    base = base[:-4]
                clean_k = re.sub(r'[^a-z0-9]', '', base.lower())
                if clean_k:
                    staging_txts[clean_k] = full_p
                    
    print(f"Indexed {len(staging_txts)} staging text mappings.")

    # 2. Index inventory hash mappings
    inv_hash_map = {}
    for root, _, files in os.walk('pipeline_staging/inventory'):
        for f in files:
            if f.endswith('_stage3b.json') or f.endswith('_stage2.json'):
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8') as jf:
                        data = json.load(jf)
                    for item in data.get('files', []):
                        h = item.get('sha256_hash')
                        txt_rel = item.get('extracted_text_path')
                        if h and txt_rel:
                            # Search in pipeline_staging/extracted
                            for s_root, _, _ in os.walk('pipeline_staging/extracted'):
                                cand = os.path.join(s_root, txt_rel)
                                if os.path.exists(cand):
                                    inv_hash_map[h] = cand
                                    break
                except Exception:
                    pass
    print(f"Indexed {len(inv_hash_map)} inventory hash text mappings.")

    # 3. Known explicit canon mappings
    canon_file_map = {
        'goldman-1999-psychological-impact-circumcision': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Goldman Psych Impact BJUI 1999.pdf.txt',
        'griffiths-2010-foreskin-restoration-springer': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Griffiths Foreskin Restoration 1980-2008 Springer 2010.pdf.txt',
        'hammond-deficiencies-response-to-tye-sardi-2022': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Hammond Deficiencies-response to Tye & Sardi 2022.pdf.txt',
        'tye-sardi-hammond-response-ijir-2022': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Tye Sardi (Hammond response) IJIR 2022.pdf.txt',
        'svoboda-adler-circ-unethical-jlawmedeth-2016': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Svoboda Adler Circ Unethical JLawMedEth 2016.pdf.txt',
        'informed-consent-sunshine-valley-pediatrics': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\CONSENT\Informed Consent Sunshine Valley  Pediatrics.pdf.txt',
        'griffiths-current-practices-foreskin-restoration-springer-1999': r'pipeline_staging\extracted\wetransfer_article-downloads-folder_2026-09-15_2250_20260924_124433\Article Downloads\Griffiths Current Practices Foreskin Restoration Springer 1999.pdf.txt'
    }

    # 4. Known milestone reports mappings
    milestone_map = {
        '1994 awakenings full report.pdf': r'pipeline_staging\extracted\1994 Awakenings Full Report_20260924_124500\1994 Awakenings Full Report.pdf.txt',
        'the accidental intactivist manifesto.pdf': r'pipeline_staging\extracted\The Accidental Intactivist Manifesto_20260924_124451\The Accidental Intactivist Manifesto.pdf.txt',
        '1994 awakenings synopsis sheet.pdf': r'pipeline_staging\extracted\1994 Awakenings synopsis sheet_20260924_124501\1994 Awakenings synopsis sheet.pdf.txt',
        'msu_clippings_1991.pdf': r'pipeline_staging\extracted\MSU_Clippings_1991_20260924_190656\MSU_Clippings_1991.pdf.txt'
    }

    swept_count = 0
    already_good = 0
    pending_count = 0
    all_chunks = []
    canon_docs = []
    swept_docs = []

    for idx, d in enumerate(docs):
        doc_id = d.get('id', '')
        title = d.get('title', '')
        content = d.get('content', '')
        url = d.get('url', '')
        
        meta = json.loads(d.get('metadata_json', '{}')) if isinstance(d.get('metadata_json'), str) else d.get('metadata_json', {})
        
        is_canon = (
            meta.get('curated_seed') or 
            meta.get('archive_source') or 
            'taylor-lockwood' in doc_id or 
            'sorrells' in doc_id or
            d.get('series') in [
                'Clinical Anatomy & Histology',
                'Neonatal Pain & Neurobiology',
                'Pediatric Complications & Epidemiology',
                'Psychological Trauma & Awakenings',
                'Medical Policy & Bioethics',
                'Constitutional Law & Impact Litigation',
                'Movement Symposia & Restoration'
            ]
        )

        has_text = content and len(content.strip()) > 50
        
        if not has_text:
            found_text = None
            
            # A. Check explicit canon map
            if doc_id in canon_file_map and os.path.exists(canon_file_map[doc_id]):
                with open(canon_file_map[doc_id], 'r', encoding='utf-8', errors='replace') as tf:
                    found_text = tf.read().strip()
                    
            # B. Check milestone reports map
            if not found_text:
                clean_title = (title or '').strip().lower()
                clean_url_base = os.path.basename(url or '').strip().lower()
                if clean_title in milestone_map and os.path.exists(milestone_map[clean_title]):
                    with open(milestone_map[clean_title], 'r', encoding='utf-8', errors='replace') as tf:
                        found_text = tf.read().strip()
                elif clean_url_base in milestone_map and os.path.exists(milestone_map[clean_url_base]):
                    with open(milestone_map[clean_url_base], 'r', encoding='utf-8', errors='replace') as tf:
                        found_text = tf.read().strip()

            # C. Check inventory hash map (e.g. MSU clippings)
            if not found_text and doc_id in inv_hash_map and os.path.exists(inv_hash_map[doc_id]):
                with open(inv_hash_map[doc_id], 'r', encoding='utf-8', errors='replace') as tf:
                    found_text = tf.read().strip()

            # D. Check staging extracted text by alphanumeric or exact match
            if not found_text:
                for k in [doc_id.lower(), os.path.basename(url or '').lower(), title.lower()]:
                    if k in staging_txts and os.path.exists(staging_txts[k]):
                        with open(staging_txts[k], 'r', encoding='utf-8', errors='replace') as tf:
                            found_text = tf.read().strip()
                        break
                    alphanumeric = re.sub(r'[^a-z0-9]', '', k)
                    if alphanumeric and alphanumeric in staging_txts and os.path.exists(staging_txts[alphanumeric]):
                        with open(staging_txts[alphanumeric], 'r', encoding='utf-8', errors='replace') as tf:
                            found_text = tf.read().strip()
                        break

            # E. Check local PDF extraction
            if not found_text and url and url.lower().endswith('.pdf'):
                clean_url = url.lstrip('/')
                pdf_cand = os.path.normpath(os.path.join('public', clean_url))
                if not os.path.exists(pdf_cand):
                    pdf_cand = os.path.normpath(os.path.join('public', 'documents', os.path.basename(clean_url)))
                if os.path.exists(pdf_cand) and os.path.getsize(pdf_cand) > 1000:
                    try:
                        pdf_doc = pymupdf.open(pdf_cand)
                        pages_text = [p.get_text() for p in pdf_doc]
                        pdf_text = "\n\n".join(pages_text).strip()
                        pdf_doc.close()
                        if len(pdf_text) > 50:
                            found_text = pdf_text
                    except Exception:
                        pass

            if found_text and len(found_text) > 50:
                d['content'] = found_text
                d['status'] = 'ingested'
                meta['word_count'] = len(found_text.split())
                meta['char_count'] = len(found_text)
                if not meta.get('abstract'):
                    meta['abstract'] = found_text[:400].replace('\n', ' ') + '...'
                d['metadata_json'] = json.dumps(meta)
                swept_count += 1
                has_text = True
                swept_docs.append(d)
            else:
                # Accurately classify physical finding aid or un-digitized documents
                if d.get('type') == 'physical_document' or not d.get('url') or 'MS 1205' in (d.get('source_collection') or ''):
                    d['status'] = 'pending_digitization'
                elif d.get('status') == 'ingested':
                    d['status'] = 'pending_digitization'
                pending_count += 1
        else:
            already_good += 1

        if is_canon:
            canon_docs.append(d)

        # Generate vector chunks for all documents with searchable text
        if has_text and d.get('content'):
            chunks = chunk_text(doc_id, title, url, d['content'])
            all_chunks.extend(chunks)

    print(f"\n--- Sweeper Statistics ---")
    print(f"Already had substantive text: {already_good}")
    print(f"Successfully swept & ingested new text: {swept_count}")
    print(f"Catalog finding aid records set to 'pending_digitization': {pending_count}")
    print(f"Total documents with searchable text now: {already_good + swept_count}")
    print(f"Total canonical papers in archive: {len(canon_docs)}")
    canon_with_text = sum(1 for c in canon_docs if c.get('content') and len(c.get('content').strip()) > 50)
    print(f"Canonical papers with 100% full text: {canon_with_text} of {len(canon_docs)}")
    print(f"Total vector chunks generated: {len(all_chunks)}")

    # Save updated public/api_mock.json
    print("\nSaving updated public/api_mock.json...")
    with open(mock_path, 'w', encoding='utf-8') as f:
        json.dump(docs, f, indent=2)
    print("Saved public/api_mock.json.")

    # Save vector chunks to public/vectorize_chunks.ndjson
    ndjson_path = 'public/vectorize_chunks.ndjson'
    print(f"Writing vectorization chunks to {ndjson_path}...")
    with open(ndjson_path, 'w', encoding='utf-8') as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk) + '\n')
    print(f"Wrote {len(all_chunks)} chunks to {ndjson_path}.")

    # Generate scripts/insert_top_100_papers_d1.sql
    print("\nGenerating scripts/insert_top_100_papers_d1.sql...")
    sql_lines = [
        "-- Cloudflare D1 Production Migration: Top 100 Canonical Published Articles & Legal Filings",
        "-- Run with: npx wrangler d1 execute circumsurvey-db --remote --file=scripts/insert_top_100_papers_d1.sql",
        ""
    ]
    for cd in canon_docs:
        c_id = clean_sql_str(cd.get('id'))
        c_title = clean_sql_str(cd.get('title'))
        c_source = clean_sql_str(cd.get('source_collection'))
        c_url = clean_sql_str(cd.get('url'))
        c_type = clean_sql_str(cd.get('type', 'medical_journal'))
        c_status = clean_sql_str('ingested')
        c_content = clean_sql_str(cd.get('content', ''))
        meta_obj = json.loads(cd.get('metadata_json', '{}')) if isinstance(cd.get('metadata_json'), str) else cd.get('metadata_json', {})
        c_meta = clean_sql_str(json.dumps(meta_obj))
        c_created = clean_sql_str(cd.get('created_at', '2026-10-16 17:15:00'))
        
        stmt = f"INSERT OR REPLACE INTO archive_documents (id, title, source_collection, url, type, status, content, metadata_json, created_at) VALUES ({c_id}, {c_title}, {c_source}, {c_url}, {c_type}, {c_status}, {c_content}, {c_meta}, {c_created});"
        sql_lines.append(stmt)
        
    with open('scripts/insert_top_100_papers_d1.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines) + '\n')
    print(f"Generated scripts/insert_top_100_papers_d1.sql with {len(canon_docs)} canonical paper inserts.")

    # Generate scripts/migrate_all_swept_documents_d1.sql for all newly swept docs
    print(f"\nGenerating scripts/migrate_all_swept_documents_d1.sql for {len(swept_docs)} swept docs...")
    swept_sql_lines = [
        "-- Cloudflare D1 Migration for Newly Swept and Hydrated Documents",
        "-- Run with: npx wrangler d1 execute circumsurvey-db --remote --file=scripts/migrate_all_swept_documents_d1.sql",
        ""
    ]
    for sd in swept_docs:
        s_id = clean_sql_str(sd.get('id'))
        s_title = clean_sql_str(sd.get('title'))
        s_source = clean_sql_str(sd.get('source_collection'))
        s_url = clean_sql_str(sd.get('url'))
        s_type = clean_sql_str(sd.get('type', 'document'))
        s_status = clean_sql_str('ingested')
        s_content = clean_sql_str(sd.get('content', ''))
        meta_obj = json.loads(sd.get('metadata_json', '{}')) if isinstance(sd.get('metadata_json'), str) else sd.get('metadata_json', {})
        s_meta = clean_sql_str(json.dumps(meta_obj))
        s_created = clean_sql_str(sd.get('created_at', '2026-10-16 17:15:00'))
        
        stmt = f"INSERT OR REPLACE INTO archive_documents (id, title, source_collection, url, type, status, content, metadata_json, created_at) VALUES ({s_id}, {s_title}, {s_source}, {s_url}, {s_type}, {s_status}, {s_content}, {s_meta}, {s_created});"
        swept_sql_lines.append(stmt)

    with open('scripts/migrate_all_swept_documents_d1.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(swept_sql_lines) + '\n')
    print(f"Generated scripts/migrate_all_swept_documents_d1.sql with {len(swept_docs)} statements.")

    # Also sync updated canon docs into public/api_collections_published-articles_mock.json
    coll_path = 'public/api_collections_published-articles_mock.json'
    if os.path.exists(coll_path):
        with open(coll_path, 'r', encoding='utf-8') as f:
            coll_data = json.load(f)
        canon_by_id = {cd['id']: cd for cd in canon_docs}
        updated_items = 0
        for it in coll_data.get('items', []):
            if it.get('id') in canon_by_id:
                matched_cd = canon_by_id[it['id']]
                it['content'] = matched_cd.get('content', '')
                it['metadata_json'] = matched_cd.get('metadata_json', '')
                it['status'] = 'ingested'
                updated_items += 1
        with open(coll_path, 'w', encoding='utf-8') as f:
            json.dump(coll_data, f, indent=2)
        print(f"Updated {updated_items} items in {coll_path} with refreshed full text.")

    print("\n=== Archive & Vectorization Sweep Complete! ===")

if __name__ == '__main__':
    main()
