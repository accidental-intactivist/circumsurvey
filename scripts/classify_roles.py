import requests
import json
import os
import sys
import tempfile
import subprocess
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_BASE = "https://advocacy-shell.pages.dev"
DB_ID = "9018c642-05c8-4335-93cc-4282c5e7ff12"
BATCH_SIZE = 50
WRANGLER_CMD = "npx.cmd" if sys.platform == "win32" else "npx"
CWD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

def run_d1_execute(sql):
    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False, encoding="utf-8", dir=CWD)
    try:
        tmp.write(sql)
        tmp.close()
        cmd = [WRANGLER_CMD, "wrangler", "d1", "execute", DB_ID, "--remote", "--file", tmp.name]
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300,
            cwd=CWD, shell=(sys.platform == "win32"),
            encoding="utf-8", errors="replace",
        )
        if result.returncode != 0:
            print("Wrangler Error:", result.stderr)
        return result.returncode == 0
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass

def classify_entity(ent):
    etype = ent.get('type', '')
    name = ent.get('name', '').lower()
    tagline = ent.get('tagline', '').lower()
    text = f"{name} {tagline}"
    
    if etype == 'person':
        if any(w in text for w in ['md', 'doctor', 'physician', 'surgeon', 'pediatrician', 'urologist', 'medical', 'clinic']):
            return 'Medical Professional'
        if any(w in text for w in ['professor', 'researcher', 'historian', 'academic', 'scientist', 'phd', 'scholar']):
            return 'Researcher / Academic'
        if any(w in text for w in ['author', 'writer', 'journalist', 'reporter', 'editor']):
            return 'Author / Journalist'
        if any(w in text for w in ['attorney', 'lawyer', 'judge', 'legal']):
            return 'Legal Professional'
        if any(w in text for w in ['activist', 'advocate', 'founder', 'director', 'president', 'campaigner', 'intact', 'nocirc']):
            return 'Activist / Advocate'
        return 'Individual'
        
    elif etype == 'organization':
        if any(w in text for w in ['academy', 'college', 'society', 'medical', 'pediatrics', 'health', 'hospital', 'clinic', 'association']):
            return 'Medical Organization'
        if any(w in text for w in ['university', 'institute', 'research']):
            return 'Research Institution'
        if any(w in text for w in ['court', 'department', 'ministry', 'government', 'state', 'national']):
            return 'Government / Legal Body'
        if any(w in text for w in ['advocacy', 'coalition', 'intact', 'nocirc', 'noharmm', 'group', 'campaign', 'network', 'foundation']):
            return 'Advocacy Group'
        return 'Organization'
        
    elif etype == 'publication':
        if any(w in text for w in ['journal', 'pediatrics', 'bmj', 'lancet', 'jama', 'medical', 'review']):
            return 'Medical Journal'
        if any(w in text for w in ['times', 'news', 'post', 'tribune', 'herald', 'globe', 'magazine', 'press']):
            return 'News Outlet'
        if 'book' in text:
            return 'Book'
        return 'Publication'
        
    elif etype == 'location':
        return 'Geographic Region'
        
    elif etype == 'medical_term':
        if any(w in text for w in ['surgery', 'operation', 'procedure', 'excision', 'circumcision', 'amputation', 'cutting']):
            return 'Medical Procedure'
        return 'Anatomical / Medical Term'
        
    elif etype == 'legal_case':
        return 'Legal Case'
        
    return 'Entity'

def main():
    print("Fetching entities...")
    entities = requests.get(f"{API_BASE}/api/entities", timeout=30).json()
    print(f"Loaded {len(entities)} entities.")
    
    updates = []
    for ent in entities:
        role = classify_entity(ent)
        
        # Only update if changed or currently null
        if ent.get('role') != role:
            # Escape single quotes
            safe_role = role.replace("'", "''")
            updates.append(f"UPDATE entities SET role = '{safe_role}' WHERE id = '{ent['id']}';")
            
    print(f"Generated {len(updates)} role updates.")
    
    if not updates:
        print("All entities already classified.")
        return
        
    batches = [updates[i:i + BATCH_SIZE] for i in range(0, len(updates), BATCH_SIZE)]
    print(f"Executing updates in {len(batches)} batches of {BATCH_SIZE}...")
    
    success_count = 0
    fail_count = 0
    
    for idx, batch in enumerate(batches):
        sql = "\n".join(batch)
        
        for attempt in range(3):
            if run_d1_execute(sql):
                success_count += len(batch)
                print(f"[{idx+1}/{len(batches)}] Success ({success_count}/{len(updates)})")
                break
            else:
                print(f"[{idx+1}/{len(batches)}] Failed attempt {attempt+1}")
                time.sleep(2)
        else:
            fail_count += len(batch)
            print(f"[{idx+1}/{len(batches)}] Failed completely.")

    print(f"Finished. Successful: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
