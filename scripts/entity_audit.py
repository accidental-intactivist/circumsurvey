"""
Entity Audit & Auto-Wiki Pipeline
===================================
Post-OCR pipeline that mines the entire corpus, builds co-occurrence matrices,
and auto-generates encyclopedia-quality wiki pages for entities above threshold.

Four stages:
  1. Entity Census — frequency table from metadata_json
  2. Co-occurrence Matrix — PMI computation for "See Also"
  3. AI Enrichment — Gemini generates bio, tagline, role
  4. Database Hydration — SQL generation + execution

Usage:
  python scripts/entity_audit.py                     # Full pipeline, local D1
  python scripts/entity_audit.py --stage census      # Census only
  python scripts/entity_audit.py --dry-run           # Census + PMI, no AI/DB writes
  python scripts/entity_audit.py --threshold 5       # Override minimum mentions
  python scripts/entity_audit.py --remote            # Target production D1
"""

import os
import sys
import json
import math
import re
import subprocess
import argparse
import time
import uuid
import urllib.request
import urllib.parse
import concurrent.futures
import threading

# Force UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

# ─── Config ───────────────────────────────────────────────────────────────────

TIER_STUB = 3       # minimum mentions to create a stub entity
TIER_BIO = 5        # minimum mentions to auto-generate AI bio
TIER_FEATURED = 8   # minimum mentions to mark as featured

# Load .env.local
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val

api_key = os.environ.get("GEMINI_API_KEY")

# ─── D1 Helpers ───────────────────────────────────────────────────────────────

def run_d1_query(query, local=True):
    """Execute a SQL query against D1 and return parsed results."""
    args = ["npx", "wrangler", "d1", "execute", "circumsurvey", "--json", "--config", "wrangler.toml", f"--command={query}"]
    if local:
        args.insert(4, "--local")
    else:
        args.insert(4, "--remote")
    try:
        result = subprocess.run(args, capture_output=True, text=True, check=True, shell=True)
        output = result.stdout
        start_idx = output.find('[')
        if start_idx != -1:
            parsed = json.loads(output[start_idx:])
            if parsed and isinstance(parsed, list) and len(parsed) > 0 and 'results' in parsed[0]:
                return parsed[0]['results']
        return []
    except Exception as e:
        print(f"  D1 query error: {e}")
        return []

def run_d1_file(sql_file, local=True):
    """Execute a SQL file against D1."""
    args = ["npx", "wrangler", "d1", "execute", "circumsurvey", "--config", "wrangler.toml", f"--file={sql_file}"]
    if local:
        args.insert(4, "--local")
    else:
        args.insert(4, "--remote")
    subprocess.run(args, check=True, shell=True)

# ─── Name Normalization ───────────────────────────────────────────────────────

CREDENTIAL_PATTERN = re.compile(r',?\s*(M\.?D\.?|Ph\.?D\.?|R\.?N\.?|D\.?O\.?|Jr\.?|Sr\.?|III|II|Esq\.?)$', re.IGNORECASE)
NOISE_NAMES = {
    'unknown', 'anonymous', 'editor', 'editors', 'staff', 'various', 'author',
    'the author', 'n/a', 'none', 'various authors', 'unknown author',
}

def normalize_name(name):
    """Normalize an entity name for deduplication."""
    if not name or not isinstance(name, str):
        return None
    name = name.strip()
    # Strip trailing credentials
    name = CREDENTIAL_PATTERN.sub('', name).strip()
    # Remove surrounding quotes
    name = name.strip('"').strip("'")
    if len(name) < 3 or name.lower() in NOISE_NAMES:
        return None
    # Skip numeric-only or all-caps single words under 4 chars (likely abbreviations/noise)
    if name.isdigit():
        return None
    return name

def name_key(name):
    """Case-folded key for deduplication."""
    return name.lower().strip() if name else None


# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 1: Entity Census
# ═══════════════════════════════════════════════════════════════════════════════

def stage_census(local=True):
    """Mine all archive_documents metadata for entity mentions. Returns frequency table."""
    print("\n" + "═" * 70)
    print("  STAGE 1: ENTITY CENSUS")
    print("═" * 70)

    rows = run_d1_query("SELECT id, metadata_json FROM archive_documents WHERE metadata_json IS NOT NULL", local)
    print(f"  Scanning {len(rows)} documents with metadata...")

    # {normalized_name: {type, count, doc_ids, raw_names}}
    entity_freq = {}

    for row in rows:
        doc_id = row['id']
        try:
            meta = json.loads(row['metadata_json'])
        except:
            continue

        # Extract from top-level and nested gemini metadata
        people_raw = set()
        orgs_raw = set()

        for field in [meta, meta.get('gemini_extracted_metadata', {})]:
            if not isinstance(field, dict):
                continue
            for p in (field.get('key_people') or []):
                if isinstance(p, str): people_raw.add(p)
            for p in (field.get('authors') or []):
                if isinstance(p, str): people_raw.add(p)
            for o in (field.get('organizations') or []):
                if isinstance(o, str): orgs_raw.add(o)

        # Also check top-level author field (from OCR metadata)
        if meta.get('author') and isinstance(meta['author'], str):
            people_raw.add(meta['author'])

        # Accumulate
        for raw_name in people_raw:
            norm = normalize_name(raw_name)
            if not norm:
                continue
            key = name_key(norm)
            if key not in entity_freq:
                entity_freq[key] = {'type': 'person', 'count': 0, 'doc_ids': set(), 'raw_names': set(), 'canonical': norm}
            entity_freq[key]['count'] += 1
            entity_freq[key]['doc_ids'].add(doc_id)
            entity_freq[key]['raw_names'].add(raw_name.strip())

        for raw_name in orgs_raw:
            norm = normalize_name(raw_name)
            if not norm:
                continue
            key = name_key(norm)
            if key not in entity_freq:
                entity_freq[key] = {'type': 'organization', 'count': 0, 'doc_ids': set(), 'raw_names': set(), 'canonical': norm}
            entity_freq[key]['count'] += 1
            entity_freq[key]['doc_ids'].add(doc_id)
            entity_freq[key]['raw_names'].add(raw_name.strip())

    # Convert sets to lists for JSON serialization
    for key in entity_freq:
        entity_freq[key]['doc_ids'] = list(entity_freq[key]['doc_ids'])
        entity_freq[key]['raw_names'] = list(entity_freq[key]['raw_names'])

    total_entities = len(entity_freq)
    above_stub = sum(1 for v in entity_freq.values() if v['count'] >= TIER_STUB)
    above_bio = sum(1 for v in entity_freq.values() if v['count'] >= TIER_BIO)
    above_featured = sum(1 for v in entity_freq.values() if v['count'] >= TIER_FEATURED)

    print(f"\n  Census Results:")
    print(f"    Total unique entities:      {total_entities}")
    print(f"    ≥{TIER_STUB} mentions (stub):       {above_stub}")
    print(f"    ≥{TIER_BIO} mentions (auto-bio):    {above_bio}")
    print(f"    ≥{TIER_FEATURED} mentions (featured):    {above_featured}")

    # Print top 20
    sorted_entities = sorted(entity_freq.values(), key=lambda x: x['count'], reverse=True)
    print(f"\n  Top 20 entities:")
    for i, e in enumerate(sorted_entities[:20]):
        print(f"    {i+1:3}. [{e['count']:3}x] {e['canonical']} ({e['type']})")

    return entity_freq, len(rows)


# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 2: Co-occurrence Matrix (PMI)
# ═══════════════════════════════════════════════════════════════════════════════

def stage_cooccurrence(entity_freq, total_docs):
    """Build PMI-based co-occurrence matrix for 'See Also' links."""
    print("\n" + "═" * 70)
    print("  STAGE 2: CO-OCCURRENCE MATRIX (PMI)")
    print("═" * 70)

    # Filter to entities above stub threshold
    qualifying = {k: v for k, v in entity_freq.items() if v['count'] >= TIER_STUB}
    print(f"  Computing PMI for {len(qualifying)} entities across {total_docs} documents...")

    # Build entity → doc_set mapping
    entity_docs = {k: set(v['doc_ids']) for k, v in qualifying.items()}
    entity_keys = list(entity_docs.keys())

    # Compute pairwise PMI
    # PMI(A,B) = log2(P(A,B) / (P(A) * P(B)))
    # P(A) = |docs mentioning A| / |total docs|
    # P(A,B) = |docs mentioning both A and B| / |total docs|

    see_also = {}  # {entity_key: [(other_key, pmi_score, shared_count)]}

    for i, key_a in enumerate(entity_keys):
        docs_a = entity_docs[key_a]
        p_a = len(docs_a) / total_docs

        pairs = []
        for j, key_b in enumerate(entity_keys):
            if i == j:
                continue
            docs_b = entity_docs[key_b]
            shared = docs_a & docs_b
            shared_count = len(shared)

            if shared_count < 2:  # Need at least 2 shared docs for meaningful signal
                continue

            p_b = len(docs_b) / total_docs
            p_ab = shared_count / total_docs

            if p_a * p_b == 0:
                continue

            pmi = math.log2(p_ab / (p_a * p_b))

            # Only keep positive PMI (entities that co-occur more than expected)
            if pmi > 0:
                pairs.append((key_b, round(pmi, 3), shared_count))

        # Sort by PMI descending, keep top 5
        pairs.sort(key=lambda x: x[1], reverse=True)
        see_also[key_a] = pairs[:5]

    entities_with_links = sum(1 for v in see_also.values() if len(v) > 0)
    total_links = sum(len(v) for v in see_also.values())
    print(f"  PMI Results:")
    print(f"    Entities with See Also links: {entities_with_links}")
    print(f"    Total See Also links:         {total_links}")

    # Print a few examples
    for key in list(see_also.keys())[:5]:
        if see_also[key]:
            ent = entity_freq[key]
            print(f"\n    {ent['canonical']}:")
            for other_key, pmi, shared in see_also[key]:
                other_name = entity_freq[other_key]['canonical']
                print(f"      → {other_name} (PMI: {pmi}, shared: {shared} docs)")

    return see_also


# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 3: AI Enrichment
# ═══════════════════════════════════════════════════════════════════════════════

def get_wikipedia_info(name):
    """Fetch summary and image from Wikipedia."""
    try:
        search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(name)}&utf8=&format=json"
        with urllib.request.urlopen(search_url, timeout=10) as response:
            search_data = json.loads(response.read())
            if not search_data['query']['search']:
                return None, None, None
            title = search_data['query']['search'][0]['title']

        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
        with urllib.request.urlopen(summary_url, timeout=10) as response:
            summary_data = json.loads(response.read())
            extract = summary_data.get('extract')
            url = summary_data.get('content_urls', {}).get('desktop', {}).get('page')
            image_url = summary_data.get('thumbnail', {}).get('source')
            return extract, url, image_url
    except:
        return None, None, None


def enrich_entity_with_ai(name, entity_type, doc_titles, wiki_summary=None):
    """Call Gemini to generate bio, tagline, and role classification."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    doc_list = "\n".join(f"  - {t}" for t in doc_titles[:30])  # Limit to 30 titles

    wiki_context = ""
    if wiki_summary:
        wiki_context = f"\n\nWikipedia context (use as background, but focus on their role in intactivism/bodily autonomy discourse):\n{wiki_summary[:2000]}"

    prompt = f"""You are an expert encyclopedist for a sociological archive focused on circumcision, bodily autonomy, and intactivism.

Entity Name: "{name}"
Entity Type: {entity_type}

This entity appears in {len(doc_titles)} archive documents, including:
{doc_list}
{wiki_context}

Generate an encyclopedic profile. Return ONLY a raw JSON object:
{{
    "bio": "A 2-3 paragraph professional, neutral-toned encyclopedic biography. Focus on their role in the discourse around circumcision, bodily autonomy, and/or intactivism. Include factual context about their professional background where known. Write in third person, past tense where appropriate.",
    "tagline": "A single sentence describing their primary significance (e.g., 'Founder of NOCIRC and pioneer of the American intactivist movement')",
    "role": "champion | critic | notable",
    "role_justification": "One sentence explaining the classification. Champions actively advocate for genital autonomy/against circumcision. Critics defend or promote circumcision. Notable figures are relevant but not clearly on either side."
}}"""

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"    AI Error for {name}: {e}")
        return None


def stage_enrichment(entity_freq, see_also, local=True):
    """AI-generate bios for entities above the bio threshold."""
    print("\n" + "═" * 70)
    print("  STAGE 3: AI ENRICHMENT")
    print("═" * 70)

    if not api_key:
        print("  ERROR: GEMINI_API_KEY not found. Skipping AI enrichment.")
        return {}

    # Get existing entities to avoid re-generating
    existing = run_d1_query("SELECT name, description FROM entities", local)
    existing_with_bio = set()
    for row in existing:
        if row.get('description') and len(row['description']) > 50:
            existing_with_bio.add(name_key(row['name']))

    # Get document titles for context
    doc_rows = run_d1_query("SELECT id, title FROM archive_documents", local)
    doc_titles_map = {row['id']: row['title'] for row in doc_rows}

    # Filter to bio-tier entities that don't already have bios
    candidates = {k: v for k, v in entity_freq.items()
                  if v['count'] >= TIER_BIO and k not in existing_with_bio}

    print(f"  {len(candidates)} entities qualify for AI enrichment (≥{TIER_BIO} mentions, no existing bio)")
    print(f"  ({len(existing_with_bio)} entities already have bios — skipping)")

    enriched = {}
    lock = threading.Lock()
    processed = [0]

    def _enrich(key, entity):
        name = entity['canonical']
        doc_titles = [doc_titles_map.get(did, 'Untitled') for did in entity['doc_ids']]

        # Fetch Wikipedia context
        wiki_summary, wiki_url, wiki_image = get_wikipedia_info(name)

        # Call Gemini
        result = enrich_entity_with_ai(name, entity['type'], doc_titles, wiki_summary)

        if result:
            result['wiki_url'] = wiki_url
            result['wiki_image'] = wiki_image
            with lock:
                enriched[key] = result
                processed[0] += 1
                print(f"  [{processed[0]}/{len(candidates)}] ✓ {name} → {result.get('role', '?')} | {result.get('tagline', '')[:60]}")
        else:
            with lock:
                processed[0] += 1
                print(f"  [{processed[0]}/{len(candidates)}] ✗ {name} — AI enrichment failed")

        time.sleep(0.5)  # Gentle rate limit

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for key, entity in candidates.items():
            futures.append(executor.submit(_enrich, key, entity))
        concurrent.futures.wait(futures)

    print(f"\n  Enrichment complete: {len(enriched)}/{len(candidates)} entities enriched")
    return enriched


# ═══════════════════════════════════════════════════════════════════════════════
# STAGE 4: Database Hydration
# ═══════════════════════════════════════════════════════════════════════════════

def stage_hydrate(entity_freq, see_also, enriched, local=True):
    """Generate and execute SQL to upsert entities into D1."""
    print("\n" + "═" * 70)
    print("  STAGE 4: DATABASE HYDRATION")
    print("═" * 70)

    # Get existing entities
    existing = run_d1_query("SELECT id, name FROM entities", local)
    existing_map = {}  # {name_key: id}
    for row in existing:
        existing_map[name_key(row['name'])] = row['id']

    # Get existing nominations
    nominations = run_d1_query("SELECT name FROM entity_nominations", local)
    existing_noms = set()
    for row in nominations:
        existing_noms.add(name_key(row['name']))

    sql_statements = []
    stats = {'updated': 0, 'created': 0, 'nominated': 0, 'skipped': 0}

    for key, entity in entity_freq.items():
        if entity['count'] < TIER_STUB:
            continue

        name = entity['canonical']
        safe_name = name.replace("'", "''")
        entity_type = entity['type']

        # Build see_also JSON
        sa_entries = []
        for other_key, pmi, shared_count in see_also.get(key, []):
            other = entity_freq[other_key]
            sa_entries.append({
                "name": other['canonical'],
                "score": pmi,
                "shared_docs": shared_count
            })
        see_also_json = json.dumps(sa_entries) if sa_entries else None

        # AI enrichment data
        ai = enriched.get(key, {})
        bio = ai.get('bio', '')
        tagline = ai.get('tagline', '')
        role = ai.get('role', 'notable')
        image_url = ai.get('wiki_image', '')
        wiki_url = ai.get('wiki_url', '')
        featured = 1 if entity['count'] >= TIER_FEATURED else 0

        if key in existing_map:
            # UPDATE existing entity — only update fields we have data for
            updates = []
            if see_also_json:
                updates.append(f"see_also_json = '{see_also_json.replace(chr(39), chr(39)+chr(39))}'")
            if bio:
                updates.append(f"description = '{bio.replace(chr(39), chr(39)+chr(39))}'")
            if tagline:
                updates.append(f"tagline = '{tagline.replace(chr(39), chr(39)+chr(39))}'")
            if role and role != 'notable':
                updates.append(f"role = '{role}'")
            if image_url:
                updates.append(f"image_url = '{image_url.replace(chr(39), chr(39)+chr(39))}'")
            if featured:
                updates.append(f"featured = {featured}")

            if updates:
                entity_id = existing_map[key]
                sql = f"UPDATE entities SET {', '.join(updates)} WHERE id = '{entity_id}';"
                sql_statements.append(sql)
                stats['updated'] += 1
            else:
                stats['skipped'] += 1

        elif entity['count'] >= TIER_BIO:
            # Auto-create full entity
            entity_id = f"entity-{uuid.uuid4().hex[:8]}"
            safe_bio = bio.replace("'", "''") if bio else ''
            safe_tagline = tagline.replace("'", "''") if tagline else ''
            safe_image = image_url.replace("'", "''") if image_url else ''
            safe_url = wiki_url.replace("'", "''") if wiki_url else ''
            safe_sa = see_also_json.replace("'", "''") if see_also_json else ''

            sql = (f"INSERT OR IGNORE INTO entities (id, type, name, description, url, image_url, role, tagline, featured, see_also_json) "
                   f"VALUES ('{entity_id}', '{entity_type}', '{safe_name}', '{safe_bio}', '{safe_url}', "
                   f"'{safe_image}', '{role}', '{safe_tagline}', {featured}, '{safe_sa}');")
            sql_statements.append(sql)
            stats['created'] += 1

        elif key not in existing_noms:
            # Route to nomination queue (3-4 mentions)
            nom_id = f"nom-{uuid.uuid4().hex[:8]}"
            justification = f"Auto-detected: mentioned in {entity['count']} archive documents."
            safe_just = justification.replace("'", "''")
            sql = (f"INSERT OR IGNORE INTO entity_nominations (id, type, name, description, justification, status) "
                   f"VALUES ('{nom_id}', '{entity_type}', '{safe_name}', '', '{safe_just}', 'pending');")
            sql_statements.append(sql)
            stats['nominated'] += 1
        else:
            stats['skipped'] += 1

    print(f"\n  Hydration Plan:")
    print(f"    Entities to update:    {stats['updated']}")
    print(f"    Entities to create:    {stats['created']}")
    print(f"    Sent to nominations:   {stats['nominated']}")
    print(f"    Skipped (existing):    {stats['skipped']}")
    print(f"    Total SQL statements:  {len(sql_statements)}")

    if not sql_statements:
        print("  No SQL to execute.")
        return

    # Write SQL file
    sql_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "entity_audit_hydrate.sql")
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))

    print(f"\n  SQL written to: {sql_file}")
    print("  Executing via Wrangler...")
    run_d1_file(sql_file, local)
    print("  ✓ Database hydration complete!")


# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Entity Audit & Auto-Wiki Pipeline")
    parser.add_argument("--stage", choices=["census", "pmi", "enrich", "all"], default="all",
                        help="Run a specific stage or all stages")
    parser.add_argument("--threshold", type=int, help="Override minimum mention threshold for stubs")
    parser.add_argument("--dry-run", action="store_true", help="Census + PMI only, no AI or DB writes")
    parser.add_argument("--remote", action="store_true", help="Target production D1 (omits --local)")
    args = parser.parse_args()

    local = not args.remote

    global TIER_STUB, TIER_BIO, TIER_FEATURED
    if args.threshold:
        TIER_STUB = args.threshold
        TIER_BIO = max(args.threshold, TIER_BIO)
        TIER_FEATURED = max(args.threshold, TIER_FEATURED)

    print("╔══════════════════════════════════════════════════════════════════════╗")
    print("║           ENTITY AUDIT & AUTO-WIKI PIPELINE                       ║")
    print("╚══════════════════════════════════════════════════════════════════════╝")
    print(f"  Mode:       {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"  Target:     {'PRODUCTION' if not local else 'LOCAL'} D1")
    print(f"  Thresholds: Stub≥{TIER_STUB}  Bio≥{TIER_BIO}  Featured≥{TIER_FEATURED}")

    # Stage 1: Census
    entity_freq, total_docs = stage_census(local)

    if args.stage == 'census':
        print("\n  Stage 'census' complete. Exiting.")
        return

    # Stage 2: Co-occurrence (PMI)
    see_also = stage_cooccurrence(entity_freq, total_docs)

    if args.stage == 'pmi' or args.dry_run:
        print("\n  Dry run / PMI stage complete. Exiting.")
        # Save census + PMI results for inspection
        output = {}
        for key, entity in entity_freq.items():
            if entity['count'] >= TIER_STUB:
                output[key] = {
                    'name': entity['canonical'],
                    'type': entity['type'],
                    'count': entity['count'],
                    'see_also': [
                        {'name': entity_freq[ok]['canonical'], 'pmi': pmi, 'shared': sc}
                        for ok, pmi, sc in see_also.get(key, [])
                    ]
                }
        out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "entity_audit_results.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"  Results saved to: {out_path}")
        return

    # Stage 3: AI Enrichment
    enriched = {}
    if args.stage in ('enrich', 'all'):
        enriched = stage_enrichment(entity_freq, see_also, local)

    # Stage 4: Database Hydration
    if args.stage == 'all':
        stage_hydrate(entity_freq, see_also, enriched, local)

    print("\n" + "═" * 70)
    print("  PIPELINE COMPLETE ✓")
    print("═" * 70)


if __name__ == "__main__":
    main()
