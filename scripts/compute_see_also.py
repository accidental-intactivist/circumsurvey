"""
Compute see_also_json for all entities based on document co-occurrence.

Uses the live API (much faster than wrangler subprocess) to fetch data,
then writes results back via wrangler d1 execute.

Usage: python scripts/compute_see_also.py
"""
import json
import os
import sys
import subprocess
import math
import requests
from collections import Counter, defaultdict

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Config ──
API_BASE = "https://advocacy-shell.pages.dev"
DB_ID = "9018c642-05c8-4335-93cc-4282c5e7ff12"
TOP_N = 15  # Max see_also entries per entity
MIN_SHARED_DOCS = 1
BATCH_SIZE = 50

WRANGLER_CMD = "npx.cmd" if sys.platform == "win32" else "npx"
CWD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def run_d1_execute(sql):
    """Execute a D1 write command via wrangler using a temp SQL file."""
    import tempfile
    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False, encoding="utf-8", dir=CWD)
    try:
        tmp.write(sql)
        tmp.close()
        cmd = [WRANGLER_CMD, "wrangler", "d1", "execute", DB_ID, "--remote", "--file", tmp.name]
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=120,
            cwd=CWD, shell=(sys.platform == "win32"),
            encoding="utf-8", errors="replace",
        )
        return result.returncode == 0
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


def fetch_all_entities():
    """Fetch all entities from the live API."""
    print("Fetching entities from API...")
    r = requests.get(f"{API_BASE}/api/entities", timeout=30)
    r.raise_for_status()
    entities = r.json()
    print(f"  Found {len(entities)} entities")
    return entities


def fetch_all_documents():
    """Fetch all documents from the CMS API, paginated."""
    print("Fetching documents from API...")
    all_docs = []
    limit = 500
    offset = 0
    while True:
        r = requests.get(f"{API_BASE}/api/cms?limit={limit}&offset={offset}", timeout=30)
        if not r.ok:
            print(f"  API error at offset {offset}: {r.status_code}")
            break
        data = r.json()
        docs = data.get("data", []) if isinstance(data, dict) else data
        if not docs:
            break
        all_docs.extend(docs)
        print(f"  Fetched {len(all_docs)} docs...")
        if len(docs) < limit:
            break
        offset += limit
    print(f"  Total: {len(all_docs)} documents")
    return all_docs


def extract_entity_names_from_doc(doc):
    """Extract all person/org names mentioned in a document's metadata."""
    names = set()
    try:
        meta = json.loads(doc.get("metadata_json", "{}") or "{}")
    except (json.JSONDecodeError, TypeError):
        return names

    # key_people
    kp = meta.get("key_people", [])
    if isinstance(kp, str):
        kp = [kp]
    for p in kp:
        if isinstance(p, str) and len(p) > 2:
            names.add(p.strip().lower())

    # organizations
    orgs = meta.get("organizations", [])
    if isinstance(orgs, str):
        orgs = [orgs]
    for o in orgs:
        if isinstance(o, str) and len(o) > 2:
            names.add(o.strip().lower())

    # gemini_extracted_metadata.authors + organizations
    gem = meta.get("gemini_extracted_metadata", {})
    if isinstance(gem, dict):
        for field in ["authors", "organizations"]:
            items = gem.get(field, [])
            if isinstance(items, str):
                items = [items]
            for item in items:
                if isinstance(item, str) and len(item) > 2:
                    names.add(item.strip().lower())

    # source_publication
    pub = meta.get("source_publication", "")
    if isinstance(pub, str) and len(pub) > 2:
        names.add(pub.strip().lower())

    return names


def build_co_occurrence(entities, documents):
    """Build the co-occurrence graph."""
    print("Building co-occurrence graph...")

    # Create name->entity mapping
    name_to_entity = {}
    for e in entities:
        name_to_entity[e["name"].lower()] = e

    # Build inverted index: entity_name -> set of doc_ids
    entity_docs = defaultdict(set)
    doc_entities = defaultdict(set)

    for doc in documents:
        doc_id = doc["id"]
        names_in_doc = extract_entity_names_from_doc(doc)
        for name in names_in_doc:
            if name in name_to_entity:
                entity_docs[name].add(doc_id)
                doc_entities[doc_id].add(name)

    entities_with_docs = sum(1 for v in entity_docs.values() if len(v) > 0)
    print(f"  {entities_with_docs} entities appear in at least 1 document")

    # Compute co-occurrences
    print("Computing co-occurrences...")
    total_docs = len(documents)
    co_occurrence = {}

    for entity_name, doc_set in entity_docs.items():
        if not doc_set:
            continue
        co = Counter()
        for doc_id in doc_set:
            for other_name in doc_entities[doc_id]:
                if other_name != entity_name:
                    co[other_name] += 1

        scored = []
        for other_name, shared in co.items():
            if shared < MIN_SHARED_DOCS:
                continue
            other_entity = name_to_entity.get(other_name)
            if not other_entity:
                continue
            other_doc_count = len(entity_docs.get(other_name, set()))
            # PMI score
            if other_doc_count > 0 and total_docs > 0:
                p_ab = shared / total_docs
                p_a = len(doc_set) / total_docs
                p_b = other_doc_count / total_docs
                denom = p_a * p_b
                pmi = math.log2(p_ab / denom) if denom > 0 else 0
            else:
                pmi = 0
            score = round(shared + pmi, 2)
            scored.append({
                "name": other_entity["name"],
                "type": other_entity["type"],
                "shared_docs": shared,
                "score": round(score, 1),
            })

        scored.sort(key=lambda x: (-x["shared_docs"], -x["score"]))
        co_occurrence[entity_name] = scored[:TOP_N]

    with_relationships = sum(1 for v in co_occurrence.values() if len(v) > 0)
    print(f"  {with_relationships} entities have at least 1 relationship")

    # Print top 10 most connected
    print("\n  Top 10 most connected:")
    by_connections = sorted(
        [(k, len(v)) for k, v in co_occurrence.items() if v],
        key=lambda x: -x[1]
    )
    for name, count in by_connections[:10]:
        e = name_to_entity[name]
        top_peer = co_occurrence[name][0]["name"] if co_occurrence[name] else "?"
        print(f"    {e['name']}: {count} connections (top: {top_peer})")

    return co_occurrence


def update_entities(entities, co_occurrence):
    """Batch update see_also_json for all entities via Wrangler."""
    print("\nUpdating entities with see_also_json...")

    updates = []
    for e in entities:
        name_key = e["name"].lower()
        see_also = co_occurrence.get(name_key, [])
        if not see_also:
            continue
        json_str = json.dumps(see_also).replace("'", "''")
        eid = e["id"].replace("'", "''")
        updates.append(f"UPDATE entities SET see_also_json = '{json_str}' WHERE id = '{eid}';")

    print(f"  {len(updates)} entities to update")

    if not updates:
        print("  Nothing to update!")
        return

    total_batches = math.ceil(len(updates) / BATCH_SIZE)
    success = 0
    fail = 0

    for i in range(0, len(updates), BATCH_SIZE):
        batch = updates[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        sql = " ".join(batch)
        sys.stdout.write(f"\r   Batch {batch_num}/{total_batches} ({len(batch)} stmts)... ")
        sys.stdout.flush()

        if run_d1_execute(sql):
            success += len(batch)
            sys.stdout.write("OK")
        else:
            fail += len(batch)
            sys.stdout.write("FAIL")
        sys.stdout.flush()

    print()
    print(f"\n{'=' * 60}")
    print(f"  SEE_ALSO UPDATE COMPLETE")
    print(f"  Updated:  {success}")
    print(f"  Failed:   {fail}")
    print(f"{'=' * 60}")


def main():
    entities = fetch_all_entities()
    if not entities:
        print("No entities found! Aborting.")
        return

    documents = fetch_all_documents()
    if not documents:
        print("No documents found! Aborting.")
        return

    co_occurrence = build_co_occurrence(entities, documents)
    update_entities(entities, co_occurrence)


if __name__ == "__main__":
    main()
