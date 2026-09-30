import json
import time

def upload_to_r2(file_path, r2_key):
    """Simulates uploading a complex PDF to Cloudflare R2."""
    print(f"[R2] Uploading {file_path} to R2 bucket as '{r2_key}'...")
    time.sleep(1)
    return f"https://archive.advocacy.org/assets/{r2_key}"

def extract_text_vision(r2_url):
    """
    Simulates sending the PDF/images to Anthropic's Claude 3.5 Sonnet (Vision)
    to extract text from photocopies, preserving complex formatting and data tables.
    """
    print(f"[OCR] Sending pages from {r2_url} to Claude 3.5 Sonnet Vision for extraction...")
    time.sleep(1.5)
    
    # Mock extracted text specifically for the Awakenings document
    extracted_text = """
    AWAKENINGS: A PRELIMINARY POLL OF CIRCUMCISED MEN
    By Tim Hammond
    
    Abstract:
    This preliminary poll explores the long-term physical, sexual, and psychological outcomes of infant circumcision on adult men. 
    Data analysis shows significant correlations between the procedure and adult resentment, diminished sensitivity, and trauma.
    
    Methodology:
    A grassroots investigation collecting surveys from men circumcised in infancy or childhood.
    """
    return extracted_text

def chunk_text(text, chunk_size=100):
    """Splits text into semantically meaningful chunks for vectorization."""
    print(f"[Chunking] Splitting text into chunks of ~{chunk_size} words...")
    words = text.split()
    chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    return chunks

def generate_embeddings_and_store(chunks, metadata):
    """
    Simulates generating embeddings via Anthropic or Cloudflare Workers AI
    and storing them in Cloudflare Vectorize.
    """
    print(f"[Vectorize] Generating embeddings for {len(chunks)} chunks...")
    time.sleep(1)
    
    for idx, chunk in enumerate(chunks):
        # Mocking embedding vector
        mock_vector = [0.015, -0.022, 0.081, 0.000] # Truncated for demonstration
        print(f"  -> Storing chunk {idx+1} in Vectorize with metadata: {metadata['id']}")
        
    print("[Vectorize] Successfully stored all embeddings.")

def run_smoke_test():
    print("=== STARTING SMOKE TEST: AWAKENINGS PIPELINE ===")
    
    # 1. Load the item from the archive index
    index_path = r"c:\work\circumsurvey\advocacy-shell\src\data\archive_index.json"
    with open(index_path, 'r', encoding='utf-8') as f:
        archive_index = json.load(f)
        
    # Find a valid record to test
    awakenings_record = next((item for item in archive_index if "AAP" in item['title']), archive_index[0])
    
    if not awakenings_record:
        print("Error: Document not found in archive index.")
        return
        
    print(f"Found record: {awakenings_record['title']}")
    
    # 2. Simulate Upload to R2
    local_file = "scans/test_original.pdf"
    r2_url = upload_to_r2(local_file, "test_upload.pdf")
    awakenings_record['digital_assets'][0]['r2_url'] = r2_url
    
    # 3. Multimodal Extraction (Vision OCR)
    extracted_text = extract_text_vision(r2_url)
    
    # 4. Chunking
    chunks = chunk_text(extracted_text, chunk_size=50)
    
    # 5. Vectorization
    generate_embeddings_and_store(chunks, metadata={"id": awakenings_record['id'], "title": awakenings_record['title']})
    
    # 6. Update Status
    awakenings_record['digital_assets'][0]['processing_status'] = "vectorized"
    
    # Save updated index back
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(archive_index, f, indent=2)
        
    print(f"=== SMOKE TEST COMPLETE ===")
    print(f"Record {awakenings_record['id']} status updated to 'vectorized'.")

if __name__ == "__main__":
    run_smoke_test()
