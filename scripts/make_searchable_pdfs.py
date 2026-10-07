import os
import glob
import subprocess
import argparse

def process_pdfs(input_dir, output_dir, language='eng'):
    """
    Scans the input_dir for PDF files and runs ocrmypdf on them,
    saving the Searchable PDF to output_dir.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    pdf_files = glob.glob(os.path.join(input_dir, '*.pdf'))
    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return

    print(f"Found {len(pdf_files)} PDF files to process.")

    for idx, pdf_path in enumerate(pdf_files, 1):
        filename = os.path.basename(pdf_path)
        output_path = os.path.join(output_dir, filename)
        
        print(f"\n[{idx}/{len(pdf_files)}] Processing {filename}...")
        
        # We use --force-ocr to force OCR even if there is some hidden text
        # We use --optimize 1 to lightly compress it
        command = [
            "ocrmypdf",
            "--force-ocr",
            "-l", language,
            "--optimize", "1",
            "--output-type", "pdf",
            pdf_path,
            output_path
        ]
        
        try:
            # Run ocrmypdf
            subprocess.run(command, check=True)
            print(f"  -> Successfully created searchable PDF: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"  [ERROR] OCR failed for {filename}. Ensure ocrmypdf and tesseract are installed.")
            print(f"  {e}")
        except FileNotFoundError:
            print("  [ERROR] ocrmypdf is not installed or not in PATH.")
            print("  Please install it: https://ocrmypdf.readthedocs.io/en/latest/installation.html")
            break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch convert flat PDFs into Searchable PDFs using ocrmypdf.")
    parser.add_argument("--input", required=True, help="Directory containing raw PDFs")
    parser.add_argument("--output", required=True, help="Directory to save Searchable PDFs")
    parser.add_argument("--lang", default="eng", help="Tesseract language code (default: eng)")
    
    args = parser.parse_args()
    process_pdfs(args.input, args.output, args.lang)
