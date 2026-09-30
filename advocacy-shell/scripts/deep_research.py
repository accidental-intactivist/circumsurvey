import os
import sys
import json
import subprocess
import uuid
import time
from google import genai
from google.genai import types

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Try to load from .env.local
    try:
        with open(".env.local", "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
                    os.environ["GEMINI_API_KEY"] = api_key
                    break
    except:
        pass

if not api_key:
    print("Error: GEMINI_API_KEY not found in environment or .env.local")
    sys.exit(1)

client = genai.Client(api_key=api_key)

def run_deep_research():
    print("Running Gemini Deep Research scan...")
    
    prompt = """
    You are a research agent for a sociological archive focused on circumcision, bodily autonomy, and intactivism.
    Your task is to search the live web for the most relevant and high-quality news articles, academic papers, and organizational press releases published in the last 2-3 weeks regarding these topics.
    
    Use Google Search to find at least 5 distinct, high-value external URLs. Do not include random blogs or low-quality social media posts. Focus on major news outlets, medical journals, or established organizations.
    
    Return ONLY a raw JSON array of objects with the following schema:
    [
      {
        "url": "The full HTTPS URL to the article",
        "title": "The headline of the article",
        "abstract": "A 1-paragraph summary of what this article covers and why it is relevant.",
        "source": "The name of the publisher (e.g., The New York Times, The Lancet)",
        "reason": "Why did you choose this article for the archive?"
      }
    ]
    """
    
    try:
        # Step 1: Use a chat session to allow automatic function calling for grounding
        chat = client.chats.create(model='gemini-3.6-flash', config=types.GenerateContentConfig(
            temperature=0.4,
            tools=[{"google_search": {}}]
        ))
        
        response = chat.send_message(prompt)
        raw_text = response.text
        
        if raw_text is None:
            print("Response text was None. Here is the full response object:")
            print(response)
            return []
            
        # Try to find JSON block in the markdown
        start_idx = raw_text.find("```json")
        if start_idx != -1:
            end_idx = raw_text.find("```", start_idx + 7)
            if end_idx != -1:
                raw_text = raw_text[start_idx+7:end_idx].strip()
        elif raw_text.startswith("["):
            pass
        else:
            print("Could not find JSON array in response. Raw response:")
            print(raw_text)
            return []
            
        results = json.loads(raw_text)
        return results
        
    except Exception as e:
        print(f"Error during Gemini scan: {e}")
        return []

def main():
    results = run_deep_research()
    
    if not results:
        print("No results found or an error occurred.")
        sys.exit(1)
        
    print(f"Deep Research found {len(results)} potential ingestion points.")
    
    sql_statements = []
    
    for item in results:
        print(f"\n- Proposed: {item.get('title')}")
        print(f"  URL: {item.get('url')}")
        
        nom_id = f"ingest-{uuid.uuid4().hex[:8]}"
        
        safe_url = item.get('url', '').replace("'", "''")
        safe_title = item.get('title', '').replace("'", "''")
        safe_abstract = item.get('abstract', '').replace("'", "''")
        safe_source = item.get('source', '').replace("'", "''")
        safe_reason = item.get('reason', '').replace("'", "''")
        
        if not safe_url:
            continue
            
        sql = f"INSERT INTO ingestion_queue (id, url, title, abstract, source, reason, status) VALUES ('{nom_id}', '{safe_url}', '{safe_title}', '{safe_abstract}', '{safe_source}', '{safe_reason}', 'pending');"
        sql_statements.append(sql)
        
    if not sql_statements:
        print("No valid URLs to insert.")
        sys.exit(0)
        
    sql_file = "insert_ingestion_queue.sql"
    with open(sql_file, 'w', encoding='utf-8') as f:
        # Using INSERT OR IGNORE in case the URL is already in the queue
        for sql in sql_statements:
            f.write(sql.replace("INSERT INTO", "INSERT OR IGNORE INTO") + "\n")
            
    print(f"\nGenerated SQL statements in {sql_file}.")
    print("Executing SQL via Wrangler...")
    subprocess.run(["npx", "wrangler", "d1", "execute", "circumsurvey", "--local", "--config", "wrangler.toml", f"--file={sql_file}"], check=True, shell=True)
    
    print("Done! Items added to the Curator Ingestion Queue.")

if __name__ == "__main__":
    main()
