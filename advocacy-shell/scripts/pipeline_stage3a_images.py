import os
import sys
import json
import argparse
import pymupdf as fitz
import hashlib

# Force UTF-8 encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def get_image_hash(image_bytes):
    """Calculate SHA-256 hash of image bytes."""
    return hashlib.sha256(image_bytes).hexdigest()

def process_inventory_images(inventory_path, limit=None):
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory not found at {inventory_path}")
        return

    with open(inventory_path, 'r', encoding='utf-8') as f:
        inventory = json.load(f)

    inventory_dir = os.path.dirname(inventory_path)
    staging_extracted_dir = os.path.join(os.path.dirname(inventory_dir), "extracted")
    
    extract_folder_name = os.path.basename(inventory_path).split('_inventory')[0]
    extract_dir = os.path.join(staging_extracted_dir, extract_folder_name)
    images_dir = os.path.join(staging_extracted_dir, f"{extract_folder_name}_images")
    
    os.makedirs(images_dir, exist_ok=True)

    # Only process PDFs that aren't semantic duplicates of something else
    files_to_process = [f for f in inventory["files"] if f["extension"] == ".pdf" and not f.get("is_semantic_duplicate")]
    
    if limit:
        files_to_process = files_to_process[:limit]
        print(f"Limiting image extraction to {limit} files for testing.")

    print(f"Processing {len(files_to_process)} PDFs for image extraction...")

    # Global hash tracker to avoid saving the exact same image (like a publisher logo) multiple times
    global_seen_hashes = {}
    total_images_extracted = 0

    for idx, file_info in enumerate(files_to_process):
        filepath = os.path.join(extract_dir, file_info["relative_path"])
        print(f"[{idx+1}/{len(files_to_process)}] Extracting from: {file_info['relative_path']}")
        
        extracted_images = []
        
        try:
            with fitz.open(filepath) as doc:
                for page_index in range(len(doc)):
                    page = doc[page_index]
                    image_list = page.get_images(full=True)
                    
                    for img_index, img in enumerate(image_list):
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        
                        # Filter out very small images (likely icons/lines/noise)
                        if len(image_bytes) < 10240: # Less than 10KB
                            continue
                            
                        img_hash = get_image_hash(image_bytes)
                        
                        if img_hash in global_seen_hashes:
                            # We already saved this exact image. Just reference it.
                            extracted_images.append(global_seen_hashes[img_hash])
                        else:
                            # Save new image
                            img_filename = f"{img_hash[:16]}.{image_ext}"
                            img_path = os.path.join(images_dir, img_filename)
                            
                            with open(img_path, "wb") as f_img:
                                f_img.write(image_bytes)
                                
                            rel_img_path = f"{extract_folder_name}_images/{img_filename}"
                            global_seen_hashes[img_hash] = rel_img_path
                            extracted_images.append(rel_img_path)
                            total_images_extracted += 1
                            
        except Exception as e:
            print(f"  Error extracting images from {filepath}: {e}")
            
        # Ensure unique references per document
        file_info["extracted_images"] = list(set(extracted_images))
        if extracted_images:
            print(f"  -> Found {len(file_info['extracted_images'])} valid images.")

    # Save enriched inventory
    out_path = inventory_path.replace("_inventory_stage2.json", "_inventory_stage3a.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)

    print(f"\nStage 3A Complete!")
    print(f"Total unique images extracted: {total_images_extracted}")
    print(f"Saved enriched inventory to {out_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stage 3A Image Extraction")
    parser.add_argument("inventory_path", help="Path to Stage 2 inventory JSON")
    parser.add_argument("--limit", type=int, help="Limit number of files to process for testing")
    args = parser.parse_args()
    
    process_inventory_images(args.inventory_path, args.limit)
