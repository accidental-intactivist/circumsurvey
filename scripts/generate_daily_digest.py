import os
import sys
import json
import uuid
import datetime
import subprocess
from google import genai
from google.genai import types

def load_api_key():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        try:
            with open(".env.local", "r") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        api_key = line.strip().split("=", 1)[1]
                        os.environ["GEMINI_API_KEY"] = api_key
                        break
        except Exception:
            pass
    return api_key

def fetch_pending_ingestions():
    print("Fetching pending ingestions from local D1...")
    try:
        result = subprocess.run([
            'npx', 'wrangler', 'd1', 'execute', 'circumsurvey', 
            '--local', '--config', 'wrangler.toml', '--json', 
            '--command', "SELECT * FROM ingestion_queue WHERE status='pending'"
        ], capture_output=True, text=True, check=True, shell=True)
        
        data = json.loads(result.stdout)
        rows = data[0]['results']
        return rows
    except Exception as e:
        print(f"Error fetching pending ingestions (fallback to mock): {e}")
        return [
            {
                "id": "mock-ingest-1",
                "url": "https://example.com/lancet-retrospective",
                "title": "New Retrospective on Neonatal Trauma",
                "source": "The Lancet",
                "abstract": "A 20-year retrospective analysis examining the long-term psychological and physical trauma markers in males subjected to neonatal circumcision."
            },
            {
                "id": "mock-ingest-2",
                "url": "https://example.com/un-petition",
                "title": "Advocacy Groups Petition the UN",
                "source": "Global Human Rights Watch",
                "abstract": "A formal petition to the UN Human Rights Council demanding the explicit classification of non-therapeutic infant circumcision as a violation of the Convention on the Rights of the Child."
            }
        ]

def fetch_recent_comments():
    print("Fetching recent comments from local D1...")
    try:
        result = subprocess.run([
            'npx', 'wrangler', 'd1', 'execute', 'circumsurvey', 
            '--local', '--config', 'wrangler.toml', '--json', 
            '--command', "SELECT * FROM item_comments ORDER BY created_at DESC LIMIT 5"
        ], capture_output=True, text=True, check=True, shell=True)
        
        data = json.loads(result.stdout)
        return data[0]['results']
    except Exception as e:
        print(f"Error fetching comments (fallback to mock): {e}")
        return [
            {"doc_id": "news-1", "user": "IntactAdvocate", "comment": "The equal protection argument is our strongest angle. If FGM is banned because it violates bodily autonomy, male circumcision must fall under the exact same 14th Amendment scrutiny."},
            {"doc_id": "digest-1", "user": "RightsDefender", "comment": "Whenever pro-circ doctors bring up HIV in Africa, we need to immediately pivot to the European CDC reports which show zero correlation in developed nations. We need a dedicated guide on debunking the African RCTs."}
        ]

def generate_editorial_digest(client, ingestions, comments):
    print(f"Generating editorial digest for {len(ingestions)} items...")
    
    context_items = "\n".join([f"- Title: {item.get('title')}\n  Source: {item.get('source')}\n  Abstract: {item.get('abstract')}\n" for item in ingestions])
    context_comments = "\n".join([f"- User {c.get('user')} on {c.get('doc_id')}: {c.get('comment')}" for c in comments])
    
    prompt = f"""
    You are the Senior Editor for the "Accidental Intactivist" archive.
    Your task is to synthesize today's raw news ingestions and recent community comments into a cohesive daily digest.
    
    Follow the "Inquiry Frame" philosophy: lead with curiosity, respect lived experiences, and focus on fundamental bodily autonomy and equal protection arguments. Do not use the phrase "So what", but embed that contextual interpretation into your analysis. Why does this matter to the movement?
    
    Today's Ingestions:
    {context_items}
    
    Recent Community Comments:
    {context_comments}
    
    Return a single JSON object with the following schema:
    {{
      "abstract": "A cohesive 1-2 paragraph overview summarizing today's news and how it fits into the broader intactivist movement.",
      "community_zeitgeist": "A 1-paragraph summary capturing the mood and strategic focus of recent community comments, calling users to action or debate without using the exact phrase 'So what'. Support markdown bolding (**text**) for emphasis.",
      "digest_items": [
        {{
          "title": "Title of the item",
          "body": "A synthesized 1-2 paragraph editorialized summary of the item.",
          "item_id": "A short ID for UI rendering (e.g. news-1)"
        }}
      ]
    }}
    
    Do NOT include markdown block formatting (like ```json). Just return the raw JSON object.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.4)
        )
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()
            
        result = json.loads(raw_text)
        return result
    except Exception as e:
        print(f"Error during AI synthesis: {e}")
        return {
            "abstract": "Automated synthesis failed.",
            "community_zeitgeist": "Join the discussion on our latest articles.",
            "digest_items": []
        }

def main():
    api_key = load_api_key()
    if not api_key:
        print("Error: GEMINI_API_KEY not found.")
        sys.exit(1)
        
    client = genai.Client(api_key=api_key)
    
    ingestions = fetch_pending_ingestions()
    if not ingestions:
        print("No pending ingestions to digest.")
        sys.exit(0)
        
    recent_comments = fetch_recent_comments()
        
    digest_content = generate_editorial_digest(client, ingestions, recent_comments)
    
    digest_id = f"digest-{uuid.uuid4().hex[:8]}"
    
    metadata = {
        "abstract": digest_content.get("abstract"),
        "community_zeitgeist": digest_content.get("community_zeitgeist"),
        "source_publication": "Intactivism Archive Agent",
        "digest_items": digest_content.get("digest_items", [])
    }
    
    sql = ""
    # Mark items as processed in ingestion_queue
    for item in ingestions:
        if item.get('id') and not item.get('id').startswith('mock-'):
            sql += f"UPDATE ingestion_queue SET status='processed' WHERE id='{item.get('id')}';\n"
            
    # Insert digest into archive_documents
    sql += f"""
INSERT INTO archive_documents (id, title, source_collection, type, status, metadata_json, created_at)
VALUES (
    '{digest_id}', 
    'News & Field Notes: {datetime.date.today().strftime("%B %d, %Y")}', 
    'Curated Digest', 
    'recap', 
    'published', 
    '{json.dumps(metadata).replace("'", "''")}', 
    '{datetime.datetime.utcnow().isoformat()}Z'
);
"""
    
    sql_file = "insert_daily_digest.sql"
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql.strip() + "\n")
        
    print(f"\nGenerated Daily Digest SQL in {sql_file}")
    print("Executing SQL via Wrangler against local database...")
    subprocess.run(["npx", "wrangler", "d1", "execute", "circumsurvey", "--local", "--config", "wrangler.toml", f"--file={sql_file}"], check=True, shell=True)
    print("Done! Digest published to archive_documents and queue updated.")

if __name__ == "__main__":
    main()
