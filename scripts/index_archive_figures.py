import os
import sys
import io
import json
import glob
import time
import hashlib
import sqlite3
import argparse
import pymupdf as fitz
from PIL import Image
import boto3
from botocore.client import Config
from google import genai
from google.genai import types

# Force UTF-8 encoding on Windows consoles
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env.local
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(PROJECT_ROOT, ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

CACHE_PATH = os.path.join(PROJECT_ROOT, "pipeline_staging", "figures_cache.json")

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def init_r2():
    account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    if not account_id:
        raise ValueError("CLOUDFLARE_ACCOUNT_ID is missing from .env.local")
    return boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def caption_image_with_gemini(client, img_bytes, context_title=""):
    """Send image to Gemini 3.8 Flash for structured captioning."""
    prompt = f"""You are an archival cataloger and vision specialist for an academic human rights and anatomical research archive.
Analyze this image extracted from the document: "{context_title}".

Extract the visual metadata into a strict JSON format with the following fields:
1. "caption": A concise, precise scholarly caption describing exactly what this figure, photo, chart, or diagram depicts. If there are visible axis labels, histological stains (e.g. CD34, neurofilament), histological sub-panels (A, B, C), or names, integrate them.
2. "category": Exactly one of: "diagram", "histology", "photo", "chart", "clipping", "artwork", "document".
3. "is_sensitive": Boolean. Set to true ONLY if the image displays clinical/anatomical genital photographs or surgical procedures. Anatomical diagrams, microscope slides/histology, charts, and public protest photos are NOT sensitive (false).
4. "keywords": A list of 4-8 relevant search terms.

Return ONLY raw JSON with these 4 keys."""

    retries = 3
    while retries > 0:
        try:
            pil_img = Image.open(io.BytesIO(img_bytes))
            resp = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=[prompt, pil_img],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            return json.loads(resp.text)
        except Exception as e:
            print(f"    [Gemini API] Retry due to: {e}")
            time.sleep(4)
            retries -= 1
    return {
        "caption": f"Archival figure from {context_title}",
        "category": "diagram",
        "is_sensitive": False,
        "keywords": ["archival figure", "document illustration"]
    }

def get_local_d1_db():
    pattern = os.path.join(PROJECT_ROOT, '.wrangler', 'state', 'v3', 'd1', '*', '*.sqlite')
    dbs = [f for f in glob.glob(pattern) if 'metadata' not in f]
    return dbs[0] if dbs else None

def process_pdf(pdf_path, doc_id, doc_title, output_dir, gemini_client=None, r2_client=None, bucket_name="advocacy-archive", cache=None):
    if not os.path.exists(pdf_path):
        print(f"PDF not found: {pdf_path}")
        return []

    print(f"\nProcessing PDF: {os.path.basename(pdf_path)}")
    os.makedirs(output_dir, exist_ok=True)
    figures = []

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"  Error opening PDF {pdf_path}: {e}")
        return []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        page_num = page_idx + 1
        
        try:
            image_infos = page.get_image_info(xrefs=True)
        except Exception:
            image_infos = []

        for info in image_infos:
            xref = info.get("xref")
            if not xref:
                continue

            try:
                base_image = doc.extract_image(xref)
                raw_bytes = base_image["image"]
            except Exception:
                continue

            # Filter out tiny logos, lines, and spacer icons
            width = info.get("width", 0)
            height = info.get("height", 0)
            if len(raw_bytes) < 18000 or (width < 140 and height < 140):
                continue

            # Perceptual / SHA-256 hash for deduplication
            full_hash = hashlib.sha256(raw_bytes).hexdigest()
            short_id = full_hash[:16]
            webp_filename = f"{short_id}.webp"
            webp_path = os.path.join(output_dir, webp_filename)

            # Convert to optimized WebP if not already converted
            if not os.path.exists(webp_path):
                try:
                    img = Image.open(io.BytesIO(raw_bytes))
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGBA")
                    else:
                        img = img.convert("RGB")
                    img.save(webp_path, "WEBP", quality=85, method=4)
                except Exception as e:
                    print(f"  Failed to convert image to WebP: {e}")
                    continue

            # Read webp bytes
            with open(webp_path, "rb") as wf:
                webp_bytes = wf.read()

            bbox = [round(c, 2) for c in info.get("bbox", [0, 0, 0, 0])]

            # Check cache for AI captioning
            if short_id in cache:
                ai_meta = cache[short_id]
            else:
                if gemini_client:
                    print(f"  -> Captioning figure {short_id} (Page {page_num}, {width}x{height}) with Gemini...")
                    ai_meta = caption_image_with_gemini(gemini_client, webp_bytes, doc_title)
                    cache[short_id] = ai_meta
                    save_cache(cache)
                else:
                    ai_meta = {
                        "caption": f"Figure on page {page_num} of {doc_title}",
                        "category": "diagram",
                        "is_sensitive": False,
                        "keywords": []
                    }

            # Upload to R2 if client provided
            r2_key = f"figures/{webp_filename}"
            if r2_client:
                try:
                    r2_client.put_object(
                        Bucket=bucket_name,
                        Key=r2_key,
                        Body=webp_bytes,
                        ContentType="image/webp"
                    )
                except Exception as e:
                    print(f"  R2 upload warning for {r2_key}: {e}")

            image_url = f"/api/assets/figures/{webp_filename}"
            figure_record = {
                "id": short_id,
                "doc_id": doc_id,
                "doc_title": doc_title,
                "page_number": page_num,
                "bounding_box": json.dumps(bbox),
                "image_url": image_url,
                "caption": ai_meta.get("caption", ""),
                "category": ai_meta.get("category", "diagram"),
                "keywords": json.dumps(ai_meta.get("keywords", [])),
                "is_sensitive": 1 if ai_meta.get("is_sensitive") else 0
            }
            figures.append(figure_record)

    doc.close()
    print(f"  Finished: Found and indexed {len(figures)} figures in {os.path.basename(pdf_path)}")
    return figures

def insert_figures_into_d1(figures):
    if not figures:
        return
    db_path = get_local_d1_db()
    if not db_path:
        print("Warning: No local SQLite D1 database found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for fig in figures:
        cursor.execute("""
            INSERT OR REPLACE INTO media_assets 
            (id, doc_id, doc_title, page_number, bounding_box, image_url, caption, category, keywords, is_sensitive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            fig["id"], fig["doc_id"], fig["doc_title"], fig["page_number"],
            fig["bounding_box"], fig["image_url"], fig["caption"],
            fig["category"], fig["keywords"], fig["is_sensitive"]
        ))

        # Also update parent archive_documents.media_urls
        cursor.execute("SELECT media_urls FROM archive_documents WHERE id = ?", (fig["doc_id"],))
        row = cursor.fetchone()
        if row:
            curr_urls = []
            if row[0]:
                try:
                    curr_urls = json.loads(row[0])
                except Exception:
                    curr_urls = []
            if fig["image_url"] not in curr_urls:
                curr_urls.append(fig["image_url"])
                cursor.execute(
                    "UPDATE archive_documents SET media_urls = ? WHERE id = ?",
                    (json.dumps(curr_urls), fig["doc_id"])
                )

    conn.commit()
    conn.close()
    print(f"Successfully inserted {len(figures)} figures into local D1 database.")

def main():
    parser = argparse.ArgumentParser(description="Extract, AI-caption, and ingest figures from archive PDFs")
    parser.add_argument("--inventory", help="Path to inventory JSON file")
    parser.add_argument("--pdf", help="Path to a single PDF file to index")
    parser.add_argument("--doc-id", help="Document ID for single PDF")
    parser.add_argument("--title", help="Title for single PDF")
    parser.add_argument("--limit", type=int, help="Limit number of PDFs or figures")
    parser.add_argument("--skip-ai", action="store_true", help="Skip Gemini vision captioning")
    parser.add_argument("--skip-upload", action="store_true", help="Skip R2 upload")
    args = parser.parse_args()

    cache = load_cache()

    gemini_client = None
    if not args.skip_ai:
        if "GEMINI_API_KEY" in os.environ:
            gemini_client = genai.Client()
        else:
            print("Warning: GEMINI_API_KEY not found. Running with basic captions.")

    r2_client = None
    bucket_name = os.environ.get('R2_BUCKET_NAME', 'advocacy-archive')
    if not args.skip_upload:
        try:
            r2_client = init_r2()
            print("Initialized R2 client successfully.")
        except Exception as e:
            print(f"Could not initialize R2: {e}. Continuing without R2 upload.")

    output_dir = os.path.join(PROJECT_ROOT, "pipeline_staging", "extracted", "global_figures_webp")
    all_figures = []

    if args.pdf:
        doc_id = args.doc_id or hashlib.sha256(open(args.pdf, "rb").read()).hexdigest()
        title = args.title or os.path.basename(args.pdf)
        figs = process_pdf(args.pdf, doc_id, title, output_dir, gemini_client, r2_client, bucket_name, cache)
        all_figures.extend(figs)
    elif args.inventory:
        with open(args.inventory, "r", encoding="utf-8") as f:
            inv = json.load(f)
        
        inv_dir = os.path.dirname(args.inventory)
        staging_extracted = os.path.join(os.path.dirname(inv_dir), "extracted")
        folder_name = os.path.basename(args.inventory).split("_inventory")[0]
        extract_dir = os.path.join(staging_extracted, folder_name)

        files = [f for f in inv.get("files", []) if f.get("extension") == ".pdf"]
        if args.limit:
            files = files[:args.limit]

        for file_info in files:
            pdf_path = os.path.join(extract_dir, file_info["relative_path"])
            doc_id = file_info.get("sha256_hash") or hashlib.sha256(open(pdf_path, "rb").read()).hexdigest()
            title = file_info.get("ai_metadata", {}).get("academic_title") or file_info.get("filename")
            figs = process_pdf(pdf_path, doc_id, title, output_dir, gemini_client, r2_client, bucket_name, cache)
            all_figures.extend(figs)

    insert_figures_into_d1(all_figures)
    print(f"\nPipeline Complete! Processed {len(all_figures)} total figures.")

if __name__ == "__main__":
    main()
