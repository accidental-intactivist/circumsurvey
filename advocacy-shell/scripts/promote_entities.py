import os
import sys
import json
import subprocess
import urllib.request
import urllib.parse
import uuid
import time
from google import genai
from google.genai import types

THRESHOLD = 3

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

def run_d1_query(query):
    print(f"Running query: {query}")
    try:
        result = subprocess.run(
            ["npx", "wrangler", "d1", "execute", "circumsurvey", "--local", "--json", "--config", "wrangler.toml", f"--command={query}"],
            capture_output=True, text=True, check=True, shell=True
        )
        output = result.stdout
        start_idx = output.find('[')
        if start_idx != -1:
            json_str = output[start_idx:]
            return json.loads(json_str)
        return []
    except Exception as e:
        print(f"Failed to run D1 query: {e}")
        return []

def evaluate_entity_rubric(name, entity_type):
    prompt = f"""
    Entity Name: "{name}"
    Entity Type: {entity_type}

    Is this entity a recognized public figure, Subject Matter Expert (SME), or established organization in the fields of sociology, ethics, medicine, or intactivism?
    If yes, they are suitable for inclusion in an academic archive's entity graph. If it's just a random social media user, a common first name without context, or an irrelevant entity, do not include them.

    Respond ONLY with a raw JSON object:
    {{
        "approved": true or false,
        "justification": "A 1-sentence justification for why they should or should not be included."
    }}
    """
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"  AI Rubric Error: {e}")
        return {"approved": False, "justification": f"Error during AI evaluation: {e}"}

def get_wikipedia_info(name):
    print(f"  Fetching Wikipedia data for: {name}...")
    try:
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(name)}&utf8=&format=json"
        with urllib.request.urlopen(search_url) as response:
            search_data = json.loads(response.read())
            if not search_data['query']['search']:
                return None, None
            title = search_data['query']['search'][0]['title']
            
        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
        with urllib.request.urlopen(summary_url) as response:
            summary_data = json.loads(response.read())
            extract = summary_data.get('extract')
            url = summary_data.get('content_urls', {}).get('desktop', {}).get('page')
            if extract and url:
                return extract, url
    except Exception as e:
        pass
    return None, None

def main():
    print(f"Fetching existing entities and nominations from D1...")
    
    # Get official entities
    existing_entities = run_d1_query("SELECT name FROM entities")
    existing_names = set()
    if existing_entities and isinstance(existing_entities, list) and len(existing_entities) > 0 and 'results' in existing_entities[0]:
        existing_names = {row['name'].lower() for row in existing_entities[0]['results']}

    # Get nominated entities
    existing_nominations = run_d1_query("SELECT name FROM entity_nominations")
    if existing_nominations and isinstance(existing_nominations, list) and len(existing_nominations) > 0 and 'results' in existing_nominations[0]:
        for row in existing_nominations[0]['results']:
            existing_names.add(row['name'].lower())
            
    print(f"Found {len(existing_names)} existing entities/nominations.")

    print("\nFinding frequent organizations...")
    org_query = f"SELECT value as name, count(*) as mentions FROM archive_documents, json_each(archive_documents.metadata_json, '$.organizations') GROUP BY value HAVING count(*) >= {THRESHOLD}"
    orgs_res = run_d1_query(org_query)
    orgs = orgs_res[0]['results'] if orgs_res and len(orgs_res) > 0 and 'results' in orgs_res[0] else []
    
    print("\nFinding frequent key people...")
    ppl_query = f"SELECT value as name, count(*) as mentions FROM archive_documents, json_each(archive_documents.metadata_json, '$.key_people') GROUP BY value HAVING count(*) >= {THRESHOLD}"
    ppl_res = run_d1_query(ppl_query)
    ppl = ppl_res[0]['results'] if ppl_res and len(ppl_res) > 0 and 'results' in ppl_res[0] else []

    all_candidates = []
    for row in orgs:
        if row['name'] and row['name'].lower() not in existing_names:
            all_candidates.append({"name": row['name'], "type": "organization"})
    for row in ppl:
        if row['name'] and row['name'].lower() not in existing_names:
            all_candidates.append({"name": row['name'], "type": "person"})

    print(f"\nFound {len(all_candidates)} candidates meeting the threshold ({THRESHOLD}+ mentions).")

    if not all_candidates:
        print("No candidates to evaluate. Exiting.")
        sys.exit(0)

    sql_statements = []

    for entity in all_candidates:
        name = entity['name']
        print(f"\nEvaluating: {name} ({entity['type']})")
        
        evaluation = evaluate_entity_rubric(name, entity['type'])
        
        if not evaluation.get("approved", False):
            print(f"  REJECTED by Rubric: {evaluation.get('justification')}")
            continue
            
        print(f"  APPROVED by Rubric: {evaluation.get('justification')}")
        
        description, url = get_wikipedia_info(name)
        if not description:
            description = ""
            url = ""
            
        nom_id = f"nom-{uuid.uuid4().hex[:8]}"
        
        # Escape single quotes for SQL
        safe_name = name.replace("'", "''")
        safe_desc = description.replace("'", "''")
        safe_url = url.replace("'", "''")
        safe_justification = evaluation.get("justification", "").replace("'", "''")
        
        sql = f"INSERT INTO entity_nominations (id, type, name, description, url, justification, status) VALUES ('{nom_id}', '{entity['type']}', '{safe_name}', '{safe_desc}', '{safe_url}', '{safe_justification}', 'pending');"
        sql_statements.append(sql)
        time.sleep(1) # Gentle rate limit

    if not sql_statements:
        print("\nNo entities passed the rubric. Exiting.")
        sys.exit(0)
        
    sql_file = "insert_nominations.sql"
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
        
    print(f"\nGenerated {len(sql_statements)} SQL statements in {sql_file}.")
    print("Executing SQL via Wrangler...")
    subprocess.run(["npx", "wrangler", "d1", "execute", "circumsurvey", "--local", "--config", "wrangler.toml", f"--file={sql_file}"], check=True, shell=True)
    
    print("Done! Nominations successfully created for Curator review.")

if __name__ == "__main__":
    main()
