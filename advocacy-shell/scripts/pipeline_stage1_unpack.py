import os
import argparse
import zipfile
import hashlib
import json
import shutil
from datetime import datetime
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

STAGING_DIR = r"C:\work\circumsurvey\advocacy-shell\pipeline_staging"
NOISE_EXTENSIONS = {'.exe', '.dll', '.msi', '.cab', '.ini', '.mst', '.msu', '.inf'}

def get_file_hash(filepath):
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def process_archive(input_path):
    if not os.path.exists(input_path):
        print(f"Error: Path not found at {input_path}")
        return

    base_name = os.path.basename(input_path)
    if os.path.isfile(input_path):
        name_no_ext = os.path.splitext(base_name)[0]
    else:
        name_no_ext = base_name

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Setup directories
    extract_dir = os.path.join(STAGING_DIR, "extracted", f"{name_no_ext}_{timestamp}")
    inventory_dir = os.path.join(STAGING_DIR, "inventory")
    os.makedirs(extract_dir, exist_ok=True)
    os.makedirs(inventory_dir, exist_ok=True)

    if os.path.isfile(input_path):
        if input_path.lower().endswith('.zip'):
            print(f"Extracting {base_name} to {extract_dir}...")
            try:
                with zipfile.ZipFile(input_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
            except zipfile.BadZipFile:
                print(f"Error: {base_name} is not a valid zip file.")
                return
        else:
            print(f"Copying standalone file {base_name} to {extract_dir}...")
            shutil.copy2(input_path, extract_dir)
    elif os.path.isdir(input_path):
        print(f"Copying directory {base_name} to {extract_dir}...")
        # Copy tree contents, ignoring existing subdirectories if any, but since extract_dir is new, it's fine
        for item in os.listdir(input_path):
            s = os.path.join(input_path, item)
            d = os.path.join(extract_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)

    print("Copy/Extraction complete. Indexing and filtering files...")
    
    inventory = {
        "source_archive": base_name,
        "extraction_timestamp": timestamp,
        "files": [],
        "summary": {
            "total_files": 0,
            "retained_files": 0,
            "deleted_noise_files": 0,
            "exact_duplicates_found": 0
        }
    }

    seen_hashes = {}
    
    for root, _, files in os.walk(extract_dir):
        for file in files:
            filepath = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            rel_path = os.path.relpath(filepath, extract_dir)
            inventory["summary"]["total_files"] += 1

            if ext in NOISE_EXTENSIONS:
                print(f"Removing noise file: {rel_path}")
                os.remove(filepath)
                inventory["summary"]["deleted_noise_files"] += 1
                continue

            if ext in {'.tif', '.tiff', '.jpg', '.jpeg', '.png'}:
                try:
                    from PIL import Image
                    img = Image.open(filepath)
                    if img.mode != "RGB":
                        img = img.convert("RGB")
                    
                    pdf_filepath = os.path.splitext(filepath)[0] + ".pdf"
                    img.save(pdf_filepath, "PDF", resolution=100.0)
                    os.remove(filepath)
                    
                    filepath = pdf_filepath
                    file = os.path.basename(filepath)
                    ext = ".pdf"
                    rel_path = os.path.relpath(filepath, extract_dir).replace("\\", "/")
                    print(f"  Converted image to PDF: {rel_path}")
                except Exception as e:
                    print(f"  Error converting {filepath} to PDF: {e}")

            # It's a retained file
            file_hash = get_file_hash(filepath)
            file_size = os.path.getsize(filepath)
            
            is_duplicate = False
            duplicate_of = None

            if file_hash in seen_hashes:
                is_duplicate = True
                duplicate_of = seen_hashes[file_hash]
                inventory["summary"]["exact_duplicates_found"] += 1
                # We could delete the exact duplicate here to save space,
                # but for this stage we'll keep it and just flag it.
                print(f"Found exact duplicate: {rel_path} (matches {duplicate_of})")
            else:
                seen_hashes[file_hash] = rel_path

            file_info = {
                "filename": file,
                "relative_path": rel_path.replace("\\", "/"),
                "extension": ext,
                "size_bytes": file_size,
                "sha256_hash": file_hash,
                "is_exact_duplicate": is_duplicate,
                "duplicate_of": duplicate_of.replace("\\", "/") if duplicate_of else None,
                "requires_visual_grading": ext in {'.pdf'} # All valid files are PDFs now
            }
            
            inventory["files"].append(file_info)
            inventory["summary"]["retained_files"] += 1

    # Save inventory
    inventory_path = os.path.join(inventory_dir, f"{name_no_ext}_{timestamp}_inventory.json")
    with open(inventory_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)

    print(f"\nProcessing complete!")
    print(f"Total files in archive: {inventory['summary']['total_files']}")
    print(f"Noise files removed: {inventory['summary']['deleted_noise_files']}")
    print(f"Files retained: {inventory['summary']['retained_files']}")
    print(f"Exact duplicates flagged: {inventory['summary']['exact_duplicates_found']}")
    print(f"\nInventory saved to: {inventory_path}")
    
    # Note regarding Document Grading
    print("\nNOTE: Exact byte-for-byte duplicates have been flagged based on SHA-256 hash.")
    print("Semantic duplicates (different scans of the same document) will be handled in Stage 2")
    print("by a Document Quality Grader using OCR and Visual extraction models.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unpack and inventory archival zip files.")
    parser.add_argument("zip_path", help="Path to the zip file to process.")
    args = parser.parse_args()
    
    process_archive(args.zip_path)
