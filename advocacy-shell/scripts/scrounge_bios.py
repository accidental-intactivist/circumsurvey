import os
import json
import sqlite3
import time
from google import genai
from google.genai import types

DB_PATH = r"C:\work\circumsurvey\advocacy-shell\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\b962ca6cee646f5a39c9d0527da20677cf1aa06607b728bfd461c3b018e6109d.sqlite"

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("Fetching entities...")
    cursor.execute("SELECT id, name, type, role, description FROM entities")
    entities = [dict(r) for r in cursor.fetchall()]
    
    print("Fetching documents...")
    cursor.execute("SELECT id, title, metadata_json FROM archive_documents WHERE metadata_json IS NOT NULL")
    documents = [dict(r) for r in cursor.fetchall()]

    print("Analyzing documents for mentions...")
    entity_docs = {}
    for ent in entities:
        entity_docs[ent['id']] = []
        
    for doc in documents:
        try:
            meta = json.loads(doc['metadata_json'])
            for ent in entities:
                name = ent['name'].lower() if ent['name'] else ''
                if not name: continue
                
                orgs = meta.get('organizations', []) + meta.get('gemini_extracted_metadata', {}).get('organizations', [])
                authors = meta.get('key_people', []) + meta.get('gemini_extracted_metadata', {}).get('authors', [])
                
                if any(name == str(o).lower() for o in orgs) or any(name == str(p).lower() for p in authors):
                    entity_docs[ent['id']].append(doc)
        except:
            pass

    # Find entities that need bios
    targets = []
    for ent in entities:        
        eid = str(ent['id'])
        count = len(entity_docs[eid])
        role = ent.get('role', '')
        
        if count >= 3 or role in ['champion', 'critic']:
            targets.append(ent)
            
    print(f"Found {len(targets)} entities meeting criteria for bio generation.")
    
    if not targets:
        print("No entities to process.")
        conn.close()
        return

    api_key = ""
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
                    break
    
    client = genai.Client(api_key=api_key)
    updated_count = 0
    
    for i, ent in enumerate(targets):
        print(f"[{i+1}/{len(targets)}] Generating bio for {ent['name']}...")
        
        # Build context from their documents
        docs_context = ""
        for d in entity_docs[ent['id']][:5]: # Top 5 to keep prompt size reasonable
            docs_context += f"- Mentioned in: {d['title']}\n"
            
        prompt = f"""You are the chief archivist and senior research assistant for a comprehensive archive of Intactivism (the movement for genital autonomy).
Write a short, professional, and encyclopedic biography about {ent['name']}. 
Focus ONLY on their background and their contributions/mentions within the archive context. Do not add outside information unless it's strictly biographical facts.

Archive Context:
{docs_context or "No specific document mentions provided, use general knowledge of this entity's role."}

CRITICAL RULES:
1. NEVER use the words "Snippet", "Extract", or refer to the "provided context" or "provided text". Weave the information organically into a cohesive, scholarly narrative as if you possess innate knowledge.
2. Frame your responses in the context of Intactivism as a broad human rights movement, rather than in relation to any specific project.
3. If applicable, mention their role ({ent['role']}).
4. Keep it to 1-3 paragraphs.
"""
        try:
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=4096,
                    temperature=0.4
                )
            )
            bio = response.text.strip()
            if bio:
                cursor.execute("UPDATE entities SET description = ? WHERE id = ?", (bio, ent['id']))
                conn.commit()
                updated_count += 1
                print(f"  -> Successfully updated.")
            time.sleep(2)
        except Exception as e:
            print(f"Failed to generate for {ent['name']}: {e}")

    print(f"Finished! Successfully generated and saved bios for {updated_count} entities.")
    conn.close()

if __name__ == "__main__":
    main()
