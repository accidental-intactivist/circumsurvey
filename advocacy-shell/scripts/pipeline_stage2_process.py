import os
import sys
import json
import argparse
import pymupdf as fitz
import pytesseract
import cv2
import numpy as np

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import concurrent.futures

# Configure Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def calculate_sharpness(image_bytes):
    """Calculate the sharpness of an image using Laplacian variance."""
    try:
        # Decode image bytes to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0.0
        return cv2.Laplacian(img, cv2.CV_64F).var()
    except Exception as e:
        print(f"Error calculating sharpness: {e}")
        return 0.0

def process_file(filepath, base_dir):
    """Extract text and compute sharpness for a file."""
    text_content = ""
    sharpness = 0.0
    ext = os.path.splitext(filepath)[1].lower()

    try:
        if ext == '.pdf':
            with fitz.open(filepath) as doc:
                if len(doc) == 0:
                    return "", 0.0
                
                # Try native text extraction first
                for page in doc:
                    text_content += page.get_text()
                
                # Calculate sharpness on the first page
                first_page = doc[0]
                pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))
                image_bytes = pix.tobytes("png")
                sharpness = calculate_sharpness(image_bytes)

                # If very little native text was found, fallback to OCR on all pages
                if len(text_content.strip()) < 50:
                    print(f"  No native text found in {os.path.basename(filepath)}. Running OCR on all {len(doc)} pages...")
                    text_content = ""
                    for page_num in range(len(doc)):
                        page = doc[page_num]
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                        img_bytes = pix.tobytes("png")
                        nparr = np.frombuffer(img_bytes, np.uint8)
                        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        try:
                            page_text = pytesseract.image_to_string(img_cv)
                            text_content += page_text + "\n"
                        except pytesseract.TesseractNotFoundError:
                            if page_num == 0:
                                print(f"  [!] Tesseract OCR not found. Please install Tesseract to extract text from images. Skipping OCR.")
                            text_content = "[OCR SKIPPED - TESSERACT NOT INSTALLED]"
                            break

        elif ext in {'.jpg', '.jpeg', '.png', '.tiff'}:
            with open(filepath, "rb") as f:
                image_bytes = f.read()
            sharpness = calculate_sharpness(image_bytes)
            
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_cv is not None:
                try:
                    text_content = pytesseract.image_to_string(img_cv)
                except pytesseract.TesseractNotFoundError:
                    print(f"  [!] Tesseract OCR not found. Please install Tesseract to extract text from images. Skipping OCR.")
                    text_content = "[OCR SKIPPED - TESSERACT NOT INSTALLED]"
                
    except Exception as e:
        print(f"  Error processing {filepath}: {e}")

    return text_content.strip(), sharpness

def process_inventory(inventory_path, limit=None):
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory not found at {inventory_path}")
        return

    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)

    inventory_dir = os.path.dirname(inventory_path)
    staging_extracted_dir = os.path.join(os.path.dirname(inventory_dir), "extracted")
    extract_folder_name = inventory_path.split('_inventory.json')[0]
    extract_folder_name = os.path.basename(extract_folder_name)
    extract_dir = os.path.join(staging_extracted_dir, extract_folder_name)

    files_to_process = [f for f in inventory["files"] if f.get("requires_visual_grading")]
    
    if limit:
        files_to_process = files_to_process[:limit]
        print(f"Limiting processing to {limit} files for testing.")

    texts = [None] * len(files_to_process)
    processed_files = [None] * len(files_to_process)

    print(f"Processing {len(files_to_process)} files for OCR and grading concurrently...")

    def _process_single(idx, file_info):
        filepath = os.path.join(extract_dir, file_info["relative_path"])
        print(f"[{idx+1}/{len(files_to_process)}] Processing: {file_info['relative_path']}")
        
        text, sharpness = process_file(filepath, extract_dir)
        
        # Save extracted text
        txt_rel_path = file_info["relative_path"] + ".txt"
        txt_path = os.path.join(extract_dir, txt_rel_path)
        
        try:
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text)
        except Exception as e:
            print(f"  Warning: Could not save text file: {e}")

        file_info["sharpness_score"] = sharpness
        file_info["extracted_text_path"] = txt_rel_path.replace("\\", "/")
        file_info["is_semantic_duplicate"] = False
        file_info["semantic_duplicate_of"] = None
        
        texts[idx] = text
        processed_files[idx] = file_info

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for idx, file_info in enumerate(files_to_process):
            futures.append(executor.submit(_process_single, idx, file_info))
        concurrent.futures.wait(futures)

    # Filter out None values in case of errors
    texts = [t for t in texts if t is not None]
    processed_files = [f for f in processed_files if f is not None]

    # --- Semantic Deduplication ---
    print("\nRunning Semantic Deduplication...")
    if len(texts) > 1:
        # Use TF-IDF to vectorize text, filtering out empty texts
        valid_indices = [i for i, t in enumerate(texts) if len(t) > 20]
        valid_texts = [texts[i] for i in valid_indices]
        
        if len(valid_texts) > 1:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
            tfidf_matrix = vectorizer.fit_transform(valid_texts)
            cosine_sim = cosine_similarity(tfidf_matrix)

            # Find duplicates
            for i in range(len(valid_texts)):
                for j in range(i + 1, len(valid_texts)):
                    if cosine_sim[i, j] > 0.90:  # 90% similarity threshold
                        idx_i = valid_indices[i]
                        idx_j = valid_indices[j]
                        
                        f1 = processed_files[idx_i]
                        f2 = processed_files[idx_j]
                        
                        # Compare sharpness to decide which to keep
                        if f1["sharpness_score"] >= f2["sharpness_score"]:
                            better, worse = f1, f2
                        else:
                            better, worse = f2, f1
                            
                        print(f"Found semantic duplicate!")
                        print(f"  Better (Sharpness {better['sharpness_score']:.1f}): {better['relative_path']}")
                        print(f"  Worse  (Sharpness {worse['sharpness_score']:.1f}): {worse['relative_path']}")
                        
                        worse["is_semantic_duplicate"] = True
                        worse["semantic_duplicate_of"] = better["relative_path"]

    # Save enriched inventory
    out_path = inventory_path.replace("_inventory.json", "_inventory_stage2.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)

    print(f"\nStage 2 Complete! Saved enriched inventory to {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stage 2 OCR and Quality Grading")
    parser.add_argument("inventory_path", help="Path to Stage 1 inventory JSON")
    parser.add_argument("--limit", type=int, help="Limit number of files to process for testing")
    args = parser.parse_args()
    
    process_inventory(args.inventory_path, args.limit)
