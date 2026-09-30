"""
Generate taglines for all entities based on archive metadata context.

Strategy: For each entity, analyze the documents they appear in to extract:
- Their role (author, org, mentioned)
- Key topics/tags associated with them
- Publication sources they're connected to
- Co-occurring entities (from see_also_json)

Generates a one-line tagline like:
  "Australian historian of circumcision; author of 'A Surgical Temptation'"
  "Seattle-based advocacy organization for genital autonomy since 1995"

Usage: python scripts/generate_taglines.py
"""
import json
import os
import sys
import subprocess
import math
import requests
import tempfile
from collections import Counter

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_BASE = "https://advocacy-shell.pages.dev"
DB_ID = "9018c642-05c8-4335-93cc-4282c5e7ff12"
BATCH_SIZE = 25
WRANGLER_CMD = "npx.cmd" if sys.platform == "win32" else "npx"
CWD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


def run_d1_execute(sql):
    """Execute D1 write via temp SQL file."""
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
        return result.returncode == 0
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


def fetch_data():
    """Fetch entities and documents from the live API."""
    print("Fetching entities...")
    entities = requests.get(f"{API_BASE}/api/entities", timeout=30).json()
    print(f"  {len(entities)} entities")

    print("Fetching documents...")
    all_docs = []
    offset = 0
    while True:
        r = requests.get(f"{API_BASE}/api/cms?limit=500&offset={offset}", timeout=30)
        data = r.json()
        docs = data.get("data", []) if isinstance(data, dict) else data
        if not docs:
            break
        all_docs.extend(docs)
        if len(docs) < 500:
            break
        offset += 500
    print(f"  {len(all_docs)} documents")
    return entities, all_docs


def extract_meta(doc):
    """Safely parse metadata_json."""
    try:
        return json.loads(doc.get("metadata_json", "{}") or "{}")
    except:
        return {}


def build_entity_profiles(entities, documents):
    """Build rich profiles for each entity from archive context."""
    print("Building entity profiles...")

    name_to_entity = {e["name"].lower(): e for e in entities}

    # For each entity, collect: authored docs, mentioned docs, topics, publications
    profiles = {}
    for e in entities:
        profiles[e["name"].lower()] = {
            "entity": e,
            "authored": [],
            "mentioned_in": [],
            "topics": Counter(),
            "publications": Counter(),
            "doc_types": Counter(),
            "years": [],
        }

    for doc in documents:
        meta = extract_meta(doc)
        doc_names = set()

        # Gather all entity references
        for field in ["key_people", "organizations"]:
            items = meta.get(field, [])
            if isinstance(items, str):
                items = [items]
            for item in items:
                if isinstance(item, str) and item.strip().lower() in name_to_entity:
                    doc_names.add(item.strip().lower())

        gem = meta.get("gemini_extracted_metadata", {}) or {}
        for field in ["authors", "organizations"]:
            items = gem.get(field, [])
            if isinstance(items, str):
                items = [items]
            for item in items:
                if isinstance(item, str) and item.strip().lower() in name_to_entity:
                    doc_names.add(item.strip().lower())

        pub = meta.get("source_publication", "")
        if isinstance(pub, str) and pub.strip().lower() in name_to_entity:
            doc_names.add(pub.strip().lower())

        # Determine authors
        authors_lower = set()
        author_list = gem.get("authors", [])
        if isinstance(author_list, str):
            author_list = [author_list]
        for a in author_list:
            if isinstance(a, str):
                authors_lower.add(a.strip().lower())

        meta_author = meta.get("author", "")
        if isinstance(meta_author, str) and meta_author:
            authors_lower.add(meta_author.strip().lower())

        # Extract topics
        tags = meta.get("tags", [])
        if isinstance(tags, str):
            tags = [tags]
        doc_type = doc.get("type", "document")
        year = meta.get("date", "")[:4] if meta.get("date") else ""

        for name_key in doc_names:
            if name_key not in profiles:
                continue
            p = profiles[name_key]

            if name_key in authors_lower:
                p["authored"].append(doc)
            else:
                p["mentioned_in"].append(doc)

            for tag in tags:
                if isinstance(tag, str) and len(tag) > 2:
                    p["topics"][tag.lower().strip()] += 1

            if pub and isinstance(pub, str) and len(pub) > 2:
                p["publications"][pub.strip()] += 1

            p["doc_types"][doc_type] += 1
            if year and year.isdigit():
                p["years"].append(int(year))

    return profiles


def generate_tagline(profile):
    """Generate a tagline from an entity's profile."""
    e = profile["entity"]
    name = e["name"]
    etype = e["type"]
    authored = profile["authored"]
    mentioned = profile["mentioned_in"]
    topics = profile["topics"]
    publications = profile["publications"]
    doc_types = profile["doc_types"]
    years = profile["years"]
    total_mentions = len(authored) + len(mentioned)

    if total_mentions == 0:
        return ""

    # Get see_also for additional context
    see_also = []
    if e.get("see_also_json"):
        try:
            see_also = json.loads(e["see_also_json"])
        except:
            pass

    parts = []

    if etype == "person":
        # Check if they're an author
        if len(authored) >= 2:
            # Find most common publication
            top_pub = publications.most_common(1)
            if top_pub and top_pub[0][1] >= 2:
                parts.append(f"Author published in {top_pub[0][0]}")
            else:
                parts.append(f"Author of {len(authored)} archived works")

        # Top topics
        top_topics = [t for t, c in topics.most_common(5)
                      if t not in ("circumcision", "intactivism", "genital autonomy",
                                   "bodily integrity", "human rights") and c >= 2]
        if top_topics:
            parts.append(f"topics include {', '.join(top_topics[:3])}")

        # Connected orgs from see_also
        connected_orgs = [sa["name"] for sa in see_also if sa.get("type") == "organization"][:2]
        if connected_orgs:
            parts.append(f"connected to {', '.join(connected_orgs)}")

        # Year range
        if years:
            min_y, max_y = min(years), max(years)
            if min_y != max_y:
                parts.append(f"active {min_y}–{max_y}")
            elif min_y > 1900:
                parts.append(f"referenced in {min_y}")

        if not parts:
            parts.append(f"Referenced in {total_mentions} archive document{'s' if total_mentions > 1 else ''}")

    elif etype == "organization":
        # Determine org type from topics/names
        name_lower = name.lower()
        if any(w in name_lower for w in ["university", "college", "school", "institute"]):
            parts.append("Academic institution")
        elif any(w in name_lower for w in ["hospital", "medical", "health", "clinic"]):
            parts.append("Medical institution")
        elif any(w in name_lower for w in ["journal", "review", "press", "media", "news", "magazine"]):
            parts.append("Publication")
        elif any(w in name_lower for w in ["law", "legal", "rights", "defense", "advocacy"]):
            parts.append("Legal/advocacy organization")
        else:
            parts.append("Organization")

        # Top connected people
        connected_people = [sa["name"] for sa in see_also if sa.get("type") == "person"][:3]
        if connected_people:
            parts.append(f"linked to {', '.join(connected_people)}")

        # Mention count
        parts.append(f"appears in {total_mentions} archived document{'s' if total_mentions > 1 else ''}")

        # Year range
        if years:
            min_y, max_y = min(years), max(years)
            if min_y != max_y:
                parts.append(f"coverage spans {min_y}–{max_y}")

    tagline = "; ".join(parts)
    # Cap length
    if len(tagline) > 200:
        tagline = tagline[:197] + "..."
    return tagline


def update_taglines(entities, profiles):
    """Batch update taglines via Wrangler."""
    updates = []
    generated = 0

    for e in entities:
        # Skip entities that already have a tagline
        if e.get("tagline"):
            continue

        name_key = e["name"].lower()
        profile = profiles.get(name_key)
        if not profile:
            continue

        tagline = generate_tagline(profile)
        if not tagline:
            continue

        generated += 1
        tagline_escaped = tagline.replace("'", "''")
        eid = e["id"].replace("'", "''")
        updates.append(f"UPDATE entities SET tagline = '{tagline_escaped}' WHERE id = '{eid}';")

    print(f"\n  Generated {generated} taglines")
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
        sql = "\n".join(batch)
        sys.stdout.write(f"\r   Batch {batch_num}/{total_batches} ({len(batch)} stmts)... ")
        sys.stdout.flush()

        try:
            if run_d1_execute(sql):
                success += len(batch)
                sys.stdout.write("OK")
            else:
                # Retry one-at-a-time on batch failure
                sys.stdout.write("RETRY...")
                for stmt in batch:
                    try:
                        if run_d1_execute(stmt):
                            success += 1
                        else:
                            fail += 1
                    except Exception:
                        fail += 1
                sys.stdout.write(f" {success}ok")
        except Exception as e:
            sys.stdout.write(f"TIMEOUT-RETRY...")
            for stmt in batch:
                try:
                    if run_d1_execute(stmt):
                        success += 1
                    else:
                        fail += 1
                except Exception:
                    fail += 1
            sys.stdout.write(f" {success}ok")
        sys.stdout.flush()

    print()
    print(f"\n{'=' * 60}")
    print(f"  TAGLINE UPDATE COMPLETE")
    print(f"  Updated:  {success}")
    print(f"  Failed:   {fail}")
    print(f"{'=' * 60}")


def main():
    entities, documents = fetch_data()
    profiles = build_entity_profiles(entities, documents)

    # Print some examples
    print("\n  Sample taglines:")
    sample_names = [
        "brian d. earp", "robert darby", "marilyn fayre milos",
        "university of oxford", "american medical association",
        "doctors opposing circumcision"
    ]
    for name in sample_names:
        if name in profiles:
            tl = generate_tagline(profiles[name])
            print(f"    {profiles[name]['entity']['name']}: {tl}")

    update_taglines(entities, profiles)


if __name__ == "__main__":
    main()
