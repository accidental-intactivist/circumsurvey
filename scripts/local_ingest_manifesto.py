import os
import requests
import PyPDF2
import json

FILE_PATH = r"C:\work\circumsurvey\advocacy-shell\raw_content\The Accidental Intactivist Manifesto.pdf"
API_URL = "https://advocacy-shell.pages.dev/api/embed_text"

def extract_text_from_pdf(filepath):
    text = ""
    with open(filepath, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def ingest_manifesto():
    print(f"Extracting text from {FILE_PATH}...")
    try:
        text = extract_text_from_pdf(FILE_PATH)
    except Exception as e:
        print(f"Failed to read PDF: {e}")
        return

    print(f"Extracted {len(text)} characters. Sending to {API_URL}...")
    
    metadata = {
        "title": "The Accidental Intactivist Manifesto",
        "source": "The Accidental Intactivist Manifesto.pdf"
    }

    payload = {
        "text": text,
        "metadata": metadata
    }
    
    response = requests.post(API_URL, json=payload)
    if response.status_code == 200:
        print("Success:", response.json())
    else:
        print(f"Failed ({response.status_code}): {response.text}")

if __name__ == "__main__":
    ingest_manifesto()
