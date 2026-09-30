import os
import argparse
import pymupdf
import zipfile
import shutil

def burst_pdf(pdf_path, output_dir=None, create_zip=True):
    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return

    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(pdf_path), f"{base_name}_burst")
        
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Opening PDF: {pdf_path}")
    try:
        doc = pymupdf.open(pdf_path)
    except Exception as e:
        print(f"Failed to open PDF: {e}")
        return

    total_pages = len(doc)
    print(f"Total pages to burst: {total_pages}")
    
    # Pad numbers with zeros to keep them sorted (e.g., 001, 002, ... 753)
    pad_len = max(3, len(str(total_pages)))
    
    burst_files = []
    
    for page_num in range(total_pages):
        page_str = str(page_num + 1).zfill(pad_len)
        output_path = os.path.join(output_dir, f"{base_name}_page_{page_str}.pdf")
        
        # Create a new PDF for this single page
        new_doc = pymupdf.open()
        new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
        new_doc.save(output_path)
        new_doc.close()
        
        burst_files.append(output_path)
        if (page_num + 1) % 50 == 0:
            print(f"Processed {page_num + 1}/{total_pages} pages...")

    print(f"Successfully burst {total_pages} pages into {output_dir}")
    doc.close()
    
    if create_zip:
        zip_path = f"{output_dir}.zip"
        print(f"Zipping burst files into {zip_path}...")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in burst_files:
                arcname = os.path.basename(file_path)
                zipf.write(file_path, arcname)
        print("Zip creation complete.")
        
        # Clean up the burst directory since we have the zip
        print("Cleaning up temporary burst directory...")
        shutil.rmtree(output_dir)
        
        print(f"Done! Your zip file is ready at: {zip_path}")
        return zip_path
    else:
        print(f"Done! Your burst files are ready at: {output_dir}")
        return output_dir

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Burst a large PDF into individual single-page PDFs and zip them.")
    parser.add_argument("pdf_path", help="Path to the PDF file to burst.")
    parser.add_argument("--out-dir", help="Output directory for burst pages. Defaults to a folder next to the PDF.", default=None)
    parser.add_argument("--no-zip", action="store_true", help="Do not create a zip file and leave the burst directory intact.")
    
    args = parser.parse_args()
    
    burst_pdf(args.pdf_path, args.out_dir, create_zip=not args.no_zip)
