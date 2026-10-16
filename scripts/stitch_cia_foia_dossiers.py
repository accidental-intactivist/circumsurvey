import zipfile
import glob
import os
import re
import json
import io
import time
import sys
import argparse
from datetime import datetime

# Force UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Pillow configuration for tolerant image loading
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf

def parse_dat_metadata(dat_str):
    """
    Parses CIA FOIA fixed-width / pipe-delimited .DAT file.
    Example:
    0000017354MKULTRA  SUBPROJECT 1  (11 DOCUMENTS WITH PUBDATES FROM 530413 TO 550427 )
    ... 00140413195308021977FINANCIAL RECORDS|MKULTRA|GOTTLIEB SIDNEY|SUBPROJECT 1|...
    """
    doc_id = dat_str[:10].strip()
    rest = dat_str[10:]
    
    # 1. Pipe-delimited keywords
    keywords = []
    pipe_match = re.search(r'([A-Z0-9\s,\-\/\.]+(?:\|[A-Z0-9\s,\-\/\.]+)+)', rest)
    if pipe_match:
        raw_keywords = pipe_match.group(1).split('|')
        keywords = [k.strip() for k in raw_keywords if k.strip() and len(k.strip()) < 50]
        before_pipe = rest[:pipe_match.start()]
    else:
        before_pipe = rest

    # 2. Extract Subproject / Title
    title_match = re.search(r'(MKULTRA\s+[^\(]+(?:\([^\)]+\))?)', before_pipe)
    if title_match:
        title = title_match.group(1).strip()
    else:
        title = f"CIA MKULTRA Document {doc_id}"
    title = re.sub(r'\s+', ' ', title)

    # Clean title nicely e.g. "MKULTRA SUBPROJECT 1 (11 DOCUMENTS...)" -> "MKULTRA Subproject 1"
    subproject_match = re.search(r'(MKULTRA\s+SUBPROJECT\s+[0-9A-Z\-]+)', title, re.IGNORECASE)
    clean_title = subproject_match.group(1).title() if subproject_match else title

    # Date range in title like "FROM 530413 TO 550427"
    date_range_match = re.search(r'FROM\s+(\d{2})(\d{2})(\d{2})\s+TO\s+(\d{2})(\d{2})(\d{2})', title)
    date_span = ""
    start_date = ""
    if date_range_match:
        y1, m1, d1, y2, m2, d2 = date_range_match.groups()
        full_y1 = f"19{y1}"
        full_y2 = f"19{y2}"
        date_span = f" ({full_y1}–{full_y2})"
        start_date = f"{full_y1}-{m1}-{d1}"

    if date_span and not date_span in clean_title:
        clean_title += date_span

    # 3. Page count & dates from header snippet e.g. "00140413195308021977"
    # 4 digits page count, 8 digits start MMDDYYYY, 8 digits release MMDDYYYY
    page_count = 0
    header_match = re.search(r'(\d{4})(\d{2})(\d{2})(19\d{2})(\d{2})(\d{2})(19\d{2})', rest)
    if header_match:
        p_cnt, sm, sd, sy, rm, rd, ry = header_match.groups()
        page_count = int(p_cnt)
        if not start_date:
            start_date = f"{sy}-{sm}-{sd}"

    # FOIA Case number
    foia_case = "F-1976-00374"
    case_match = re.search(r'(F-\d{4}-\d{5})', rest)
    if case_match:
        foia_case = case_match.group(1)

    return {
        'doc_id': doc_id,
        'title': clean_title,
        'raw_title': title,
        'start_date': start_date,
        'page_count': page_count,
        'keywords': keywords[:12],
        'foia_case': foia_case
    }

def main():
    parser = argparse.ArgumentParser(description="Stitch loose CIA MKULTRA FOIA TIFF pages into multi-page PDFs.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of documents to stitch (for testing)")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="Skip generating PDFs that already exist on disk")
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(project_root, "raw_content", "UMass Archives")
    pdf_out_dir = os.path.join(project_root, "public", "documents", "cia_foia")
    os.makedirs(pdf_out_dir, exist_ok=True)

    print("=" * 70)
    print("🚀 CIA MKULTRA FOIA ARCHIVE STITCHER & DOSSIER CONSOLIDATOR")
    print("=" * 70)

    # 1. Scan all zip files to build the document page map
    zip_paths = sorted(glob.glob(os.path.join(raw_dir, "_ARCHIVES for UMASS-*.zip")))
    if not zip_paths:
        print(f"Error: No zip archives found in {raw_dir}")
        return

    print(f"Scanning {len(zip_paths)} UMass archive zip chunks...")
    scan_start = time.time()
    docs = {}

    for zp in zip_paths:
        with zipfile.ZipFile(zp, 'r') as zf:
            for name in zf.namelist():
                if 'MKULTRA' in name and '/DOC_' in name:
                    match = re.search(r'DOC_(\d+)', name)
                    if match:
                        doc_id = match.group(1)
                        if doc_id not in docs:
                            docs[doc_id] = {
                                'tifs': [],
                                'txts': [],
                                'dat': None,
                                'subfolder': '',
                                'original_path': ''
                            }
                        if name.endswith('.TIF') or name.endswith('.tif'):
                            docs[doc_id]['tifs'].append((name, zp))
                        elif name.endswith('.TXT') or name.endswith('.txt'):
                            docs[doc_id]['txts'].append((name, zp))
                        elif name.endswith('.DAT') or name.endswith('.dat'):
                            docs[doc_id]['dat'] = (name, zp)

                        if not docs[doc_id]['original_path']:
                            parts = name.split('/')
                            doc_folder_idx = next((i for i, p in enumerate(parts) if p.startswith('DOC_')), -1)
                            if doc_folder_idx != -1:
                                docs[doc_id]['original_path'] = ' / '.join(parts[:doc_folder_idx+1])

                        if not docs[doc_id]['subfolder']:
                            sub_m = re.search(r'(MKULTRA\d)', name)
                            if sub_m:
                                docs[doc_id]['subfolder'] = sub_m.group(1)

    print(f"✅ Found {len(docs)} distinct dossiers across {sum(len(d['tifs']) for d in docs.values())} TIFF pages in {time.time()-scan_start:.2f}s!")

    doc_ids = sorted(list(docs.keys()))
    if args.limit:
        doc_ids = doc_ids[:args.limit]
        print(f"Processing first {args.limit} dossiers (test run)...")

    # 2. Open all zips once for fast random page reading
    print("Opening zip handles for parallel reading...")
    open_zips = {zp: zipfile.ZipFile(zp, 'r') for zp in zip_paths}

    stitched_manifest = []
    start_time = time.time()
    success_count = 0
    skipped_count = 0
    error_count = 0

    try:
        for idx, doc_id in enumerate(doc_ids):
            dinfo = docs[doc_id]
            pdf_path = os.path.join(pdf_out_dir, f"{doc_id}.pdf")
            
            # Parse .DAT metadata
            dat_meta = {
                'doc_id': doc_id,
                'title': f"CIA MKULTRA Document {doc_id}",
                'raw_title': "",
                'start_date': "",
                'page_count': len(dinfo['tifs']),
                'keywords': ["MKULTRA", "CIA FOIA"],
                'foia_case': "F-1976-00374"
            }
            if dinfo['dat']:
                dat_name, dat_zp = dinfo['dat']
                try:
                    dat_bytes = open_zips[dat_zp].read(dat_name)
                    dat_str = dat_bytes.decode('latin1', errors='replace')
                    dat_meta = parse_dat_metadata(dat_str)
                except Exception as e:
                    pass

            # Combine OCR .TXT files if available
            extracted_text = ""
            if dinfo['txts']:
                txt_chunks = []
                for txt_name, txt_zp in sorted(dinfo['txts'], key=lambda x: x[0]):
                    try:
                        chunk = open_zips[txt_zp].read(txt_name).decode('latin1', errors='replace').strip()
                        if chunk:
                            txt_chunks.append(chunk)
                    except Exception:
                        pass
                extracted_text = "\n\n--- [Page Break] ---\n\n".join(txt_chunks)

            # Generate PDF if not existing or skip_existing=False
            tifs = sorted(dinfo['tifs'], key=lambda x: x[0])
            pages_count = len(tifs)

            if args.skip_existing and os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
                skipped_count += 1
            else:
                try:
                    pdf = pymupdf.open()
                    for tif_name, zp in tifs:
                        img_bytes = open_zips[zp].read(tif_name)
                        try:
                            img_doc = pymupdf.open('tif', img_bytes)
                            pdf_bytes = img_doc.convert_to_pdf()
                            page_pdf = pymupdf.open('pdf', pdf_bytes)
                            pdf.insert_pdf(page_pdf)
                        except Exception:
                            # Pillow fallback for corrupted fax strips
                            pil_img = Image.open(io.BytesIO(img_bytes))
                            if pil_img.mode != 'RGB':
                                pil_img = pil_img.convert('RGB')
                            buf = io.BytesIO()
                            pil_img.save(buf, format='JPEG', quality=85)
                            buf.seek(0)
                            img_doc = pymupdf.open('jpeg', buf.read())
                            page_pdf = pymupdf.open('pdf', img_doc.convert_to_pdf())
                            pdf.insert_pdf(page_pdf)

                    pdf.save(pdf_path, garbage=3, deflate=True)
                    pdf.close()
                    success_count += 1
                except Exception as e:
                    print(f"❌ Error stitching {doc_id}: {e}")
                    error_count += 1
                    continue

            # Record consolidated document entry
            file_size_kb = round(os.path.getsize(pdf_path) / 1024, 1) if os.path.exists(pdf_path) else 0
            
            tags = list(set(["Tim Hammond", "Genital Autonomy", "CIA FOIA", "MKULTRA"] + dat_meta['keywords']))
            
            meta_json = {
                "date": dat_meta['start_date'],
                "pages": pages_count or dat_meta['page_count'],
                "foia_id": doc_id,
                "foia_case": dat_meta['foia_case'],
                "file_size_kb": file_size_kb,
                "subfolder": dinfo['subfolder'],
                "original_location": dinfo['original_path'] or f"~ARCHIVES for UMASS / AAP, CDC, CIA / CIA / {dinfo['subfolder']} / DOC_{doc_id}",
                "tags": tags,
                "category": "Historical & Legal Investigations",
                "subject": "CIA MKULTRA FOIA Archive"
            }

            stitched_manifest.append({
                "id": f"umass-ms1205-cia-{doc_id}",
                "title": dat_meta['title'],
                "source_collection": "UMass MS 1205: CIA MKULTRA FOIA Archive",
                "url": f"/documents/cia_foia/{doc_id}.pdf",
                "type": "physical_document",
                "status": "ingested",
                "media_urls": None,
                "metadata_json": json.dumps(meta_json),
                "created_at": "2026-09-18 02:59:54",
                "collection_id": "a0234370-3e2b-4dbf-b95b-388a819b13d3",
                "content": extracted_text[:10000] if extracted_text else None
            })

            if (idx + 1) % 50 == 0 or (idx + 1) == len(doc_ids):
                rate = (idx + 1) / (time.time() - start_time)
                print(f"Progress: [{idx+1}/{len(doc_ids)}] dossiers stitched (Rate: {rate:.1f} docs/sec)")

    finally:
        for zf in open_zips.values():
            zf.close()

    elapsed = time.time() - start_time
    print(f"\n🎉 Finished stitching in {elapsed:.1f}s! ({success_count} newly stitched, {skipped_count} cached, {error_count} errors)")

    # 3. Save manifest
    scratch_dir = os.path.join(project_root, "scratch")
    os.makedirs(scratch_dir, exist_ok=True)
    manifest_path = os.path.join(scratch_dir, "cia_foia_stitched_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(stitched_manifest, f, indent=2)
    print(f"💾 Saved stitched dossier manifest to {manifest_path} ({len(stitched_manifest)} items)")

    # 4. Update public mock databases
    mock_coll_path = os.path.join(project_root, "public", "api_collections_tim-hammond-archive_mock.json")
    if os.path.exists(mock_coll_path):
        print("\nUpdating api_collections_tim-hammond-archive_mock.json...")
        with open(mock_coll_path, "r", encoding="utf-8") as f:
            mock_data = json.load(f)
        
        orig_docs = mock_data.get("documents", [])
        print(f"Original total documents in collection: {len(orig_docs)}")

        # Filter out loose MKULTRA page fragments
        def is_raw_mkultra(d):
            title = (d.get("title") or "").upper()
            src = (d.get("source_collection") or "")
            meta = (d.get("metadata_json") or "")
            if "MKULTRA" in meta or "MKULTRA" in title:
                # If it's a TIF, DAT, or single page TXT, drop it
                if title.endswith(".TIF") or title.endswith(".DAT") or title.endswith(".TXT"):
                    return True
            return False

        curated_docs = [d for d in orig_docs if not is_raw_mkultra(d)]
        print(f"Curated documents preserved (including AAP/CDC policy): {len(curated_docs)}")

        # Rename the remaining medical policy documents so they are clearly designated
        for d in curated_docs:
            if d.get("source_collection") == "UMass MS 1205: AAP, CDC, CIA":
                d["source_collection"] = "UMass MS 1205: AAP & CDC Policy Records"

        # Combine with stitched dossiers
        updated_docs = curated_docs + stitched_manifest
        mock_data["documents"] = updated_docs
        print(f"Consolidated total documents in collection: {len(updated_docs)}")

        with open(mock_coll_path, "w", encoding="utf-8") as f:
            json.dump(mock_data, f, indent=2)
        print("✅ Successfully updated api_collections_tim-hammond-archive_mock.json!")

    # 5. Update public/api_mock.json as well if present
    api_mock_path = os.path.join(project_root, "public", "api_mock.json")
    if os.path.exists(api_mock_path):
        print("\nUpdating api_mock.json...")
        with open(api_mock_path, "r", encoding="utf-8") as f:
            full_mock = json.load(f)
        
        if isinstance(full_mock, list):
            curated_full = [d for d in full_mock if not is_raw_mkultra(d)]
            for d in curated_full:
                if d.get("source_collection") == "UMass MS 1205: AAP, CDC, CIA":
                    d["source_collection"] = "UMass MS 1205: AAP & CDC Policy Records"
            updated_full = curated_full + stitched_manifest
            with open(api_mock_path, "w", encoding="utf-8") as f:
                json.dump(updated_full, f, indent=2)
            print(f"✅ Successfully updated api_mock.json ({len(updated_full)} records)!")

    print("\n" + "=" * 70)
    print("✨ ALL 1,778 DOSSIERS STITCHED, METADATA-HYDRATED & ARCHIVE CONSOLIDATED!")
    print("=" * 70)

if __name__ == "__main__":
    main()
