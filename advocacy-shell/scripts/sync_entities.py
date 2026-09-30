"""
Entity Harvest Pipeline — Direct to D1 via Wrangler
====================================================
Fetches all archive_documents from the CMS API, extracts unique people
and organizations from metadata, deduplicates with robust cleanup rules,
and bulk-inserts directly into D1 via `wrangler d1 execute`.

Usage:
  cd advocacy-shell
  python scripts/sync_entities.py             # Full sync
  python scripts/sync_entities.py --dry-run   # Preview without writing
"""

import json
import requests
import subprocess
import time
import sys
import os
import re
import tempfile
from collections import Counter

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# ── Configuration ──────────────────────────────────────────────────────────
API_BASE_URL = "https://advocacy-shell.pages.dev"
D1_DATABASE_ID = "9018c642-05c8-4335-93cc-4282c5e7ff12"
PAGE_SIZE = 500
BATCH_SIZE = 50  # SQL statements per wrangler execution

DRY_RUN = "--dry-run" in sys.argv

# Well-known abbreviations to KEEP (not garbage)
KNOWN_ABBREVIATIONS = {
    'aap', 'cdc', 'who', 'ama', 'aclu', 'doc', 'fgm', 'hiv',
    'aids', 'nhs', 'nih', 'fda', 'unicef', 'galdef',
}

# Credential suffix pattern
CREDENTIAL_RE = re.compile(
    r',\s*(?:'
    r'R\.?N\.?|M\.?D\.?|Ph\.?D\.?|J\.?D\.?|D\.?O\.?|'
    r'M\.?P\.?H\.?|F\.?A\.?C\.?S\.?|F\.?A\.?A\.?P\.?|'
    r'M\.?S\.?|M\.?A\.?|B\.?A\.?|L\.?L\.?M\.?|'
    r'Dr\.?|Prof\.?|Jr\.?|Sr\.?'
    r')[\s.,]*'  # trailing dots, commas, spaces
    r'(?:,\s*(?:R\.?N\.?|M\.?D\.?|Ph\.?D\.?|J\.?D\.?|D\.?O\.?|M\.?P\.?H\.?|M\.?S\.?|L\.?L\.?M\.?)[\s.,]*)*$',
    re.IGNORECASE
)

# Company/publisher suffixes to filter orgs
COMPANY_RE = re.compile(
    r'\b(?:Inc\.?|Ltd\.?|LLC|Corp\.?|GmbH|Pty|Plc|S\.?A\.?|AG)\b',
    re.IGNORECASE
)

# Country-code pattern (e.g. USA-NY, UK-EN)
COUNTRY_CODE_RE = re.compile(r'^[A-Z]{2,4}-[A-Z]{2,3}$')


# ── Helpers ────────────────────────────────────────────────────────────────

def fetch_all_documents():
    """Paginate through ALL archive_documents."""
    all_docs = []
    resp = requests.get(f"{API_BASE_URL}/api/cms?limit=1")
    resp.raise_for_status()
    total = resp.json().get("total", 0)
    print(f"Total documents in archive: {total}")

    for offset in range(0, total, PAGE_SIZE):
        print(f"   Fetching docs {offset}-{min(offset + PAGE_SIZE, total)}...")
        resp = requests.get(f"{API_BASE_URL}/api/cms?limit={PAGE_SIZE}&offset={offset}")
        resp.raise_for_status()
        data = resp.json()
        docs = data.get("data", data if isinstance(data, list) else [])
        if not docs:
            break
        all_docs.extend(docs)
        time.sleep(0.15)

    print(f"   Fetched {len(all_docs)} documents.\n")
    return all_docs


def fetch_existing_entities():
    """Get currently registered entities from the API."""
    print(f"Fetching existing entities...")
    resp = requests.get(f"{API_BASE_URL}/api/entities")
    resp.raise_for_status()
    entities = resp.json()
    print(f"   {len(entities)} existing entities.\n")
    return entities


def strip_credentials(name):
    """Remove credential suffixes like ', M.D.', ', Ph.D., M.P.H.' from names."""
    cleaned = CREDENTIAL_RE.sub('', name).strip()
    # Also handle leading "Dr. " or "Prof. "
    cleaned = re.sub(r'^(Dr\.?\s+|Prof\.?\s+)', '', cleaned)
    return cleaned if len(cleaned) >= 3 else name


def normalize_key(name):
    """Create a dedup key: lowercase, collapse periods in initials, normalize spacing."""
    key = name.strip()
    # Remove periods from initials (A.B. → AB, J. Steven → J Steven)
    key = re.sub(r'\.(?=\s|$)', '', key)
    key = re.sub(r'\.(?=[A-Z])', ' ', key)
    # Collapse whitespace
    key = re.sub(r'\s+', ' ', key)
    return key.lower().strip()


def is_valid_person_name(name):
    """Filter out garbage that isn't a real person name."""
    if not name or not isinstance(name, str):
        return False
    name = name.strip()
    if len(name) < 3 or len(name) > 120:
        return False

    lower = name.lower()
    skip_patterns = [
        'http', 'www.', '.com', '.org', '.net', '.pdf', '.txt', '.html',
        'table', 'figure', 'page ', 'chapter', 'section',
        'ibid', 'et al', 'n/a', 'unknown', 'anonymous', 'various',
        'editor', 'editors', 'translator', 'publisher', 'staff',
        'doi:', '10.', 'isbn', 'issn', 'pmid',
        'accessed', 'retrieved', 'available at', 'cited',
        'january', 'february', 'march', 'april', 'june',
        'july', 'august', 'september', 'october', 'november', 'december',
        'department', 'university', 'school of', 'institute',
        'national organization', 'american academy',
    ]
    if any(pat in lower for pat in skip_patterns):
        return False

    # Must contain at least one letter
    if not any(c.isalpha() for c in name):
        return False

    # Skip if too few actual letters (just initials)
    letters_only = re.sub(r'[^a-zA-Z]', '', name)
    if len(letters_only) < 4:
        return False

    return True


def is_valid_org_name(name):
    """Filter out garbage that isn't a real organization."""
    if not name or not isinstance(name, str):
        return False
    name = name.strip()

    # Allow known abbreviations before length check
    if name.lower() in KNOWN_ABBREVIATIONS:
        return True

    if len(name) < 4 or len(name) > 80:
        return False

    lower = name.lower()

    # URL fragments
    if any(w in lower for w in ['.com', '.org', '.net', 'http', 'www.']):
        return False

    # Country-code patterns (USA-NY)
    if COUNTRY_CODE_RE.match(name):
        return False

    # Company/publisher suffixes
    if COMPANY_RE.search(name):
        return False

    # 3-or-fewer-letter all-caps (BMJ, NBC, PBS, CNN) UNLESS known advocacy org
    if len(name) <= 4 and name.upper() == name and name.lower() not in KNOWN_ABBREVIATIONS:
        return False

    # Skip things that start with "Department of" — these are address strings
    if lower.startswith('department of') or lower.startswith('division of'):
        return False

    # Skip numbered addresses
    if re.match(r'^\d+\s', name) and ',' in name:
        return False

    # Generic skip patterns
    skip_patterns = [
        'doi:', '10.', 'isbn', 'issn', 'pmid', 'http',
        'accessed', 'retrieved', 'available at', 'cited',
    ]
    if any(pat in lower for pat in skip_patterns):
        return False

    # Must contain at least one letter
    if not any(c.isalpha() for c in name):
        return False

    return True


def harvest_entities(docs):
    """Extract people and orgs from all document metadata."""
    raw_people = Counter()
    raw_orgs = Counter()

    for doc in docs:
        if not doc.get("metadata_json"):
            continue
        try:
            meta = json.loads(doc["metadata_json"])
        except Exception:
            continue

        gemini_meta = meta.get("gemini_extracted_metadata", {}) or {}

        # Authors / key_people -> person
        for source in [
            gemini_meta.get("authors", []),
            meta.get("key_people", []),
        ]:
            if isinstance(source, list):
                for name in source:
                    if not name or not isinstance(name, str):
                        continue
                    cleaned = strip_credentials(name.strip())
                    if is_valid_person_name(cleaned):
                        raw_people[cleaned] += 1

        # Top-level author field
        author = meta.get("author", "")
        if isinstance(author, str):
            cleaned = strip_credentials(author.strip())
            if is_valid_person_name(cleaned):
                raw_people[cleaned] += 1

        # Organizations
        for source in [
            gemini_meta.get("organizations", []),
            meta.get("organizations", []),
        ]:
            if isinstance(source, list):
                for name in source:
                    if not name or not isinstance(name, str):
                        continue
                    name = name.strip()
                    if is_valid_org_name(name):
                        raw_orgs[name] += 1

    return raw_people, raw_orgs


def deduplicate_names(name_counts):
    """
    Group names by normalized key, pick the most-mentioned variant as canonical.
    Returns dict of canonical_name -> total_count.
    """
    groups = {}
    for name, count in name_counts.items():
        key = normalize_key(name)
        if key not in groups:
            groups[key] = []
        groups[key].append((name, count))

    canonical = {}
    merge_count = 0
    for key, variants in groups.items():
        # Pick the variant with the highest count; tie-break by preferring dots in initials
        best = max(variants, key=lambda x: (x[1], '.' in x[0]))
        total = sum(c for _, c in variants)
        canonical[best[0]] = total
        if len(variants) > 1:
            merge_count += 1

    return canonical, merge_count


def execute_sql_via_wrangler(sql_statements):
    """Write SQL to a temp file and execute via wrangler d1."""
    if not sql_statements:
        return True

    fd, tmppath = tempfile.mkstemp(suffix=".sql", prefix="entity_sync_")
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write("\n".join(sql_statements))

        # On Windows, npx is npx.cmd and needs shell=True to resolve
        npx_cmd = "npx.cmd" if sys.platform == 'win32' else "npx"
        cmd = [
            npx_cmd, "wrangler", "d1", "execute", D1_DATABASE_ID,
            "--remote", f"--file={tmppath}"
        ]
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=120,
            cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."),
            shell=(sys.platform == 'win32'),
            encoding='utf-8', errors='replace',
        )

        if result.returncode != 0:
            stderr = result.stderr[:500] if result.stderr else "unknown error"
            print(f"   ERROR: {stderr}")
            return False

        return True
    finally:
        try:
            os.unlink(tmppath)
        except Exception:
            pass


def escape_sql(s):
    """Escape a string for SQLite."""
    return s.replace("'", "''")


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    if DRY_RUN:
        print("DRY RUN -- no changes will be written.\n")

    docs = fetch_all_documents()
    existing = fetch_existing_entities()
    existing_lower = {e["name"].lower().strip() for e in existing if e.get("name")}

    # ── Harvest raw names ──
    raw_people, raw_orgs = harvest_entities(docs)
    print(f"Raw harvest: {len(raw_people)} people, {len(raw_orgs)} orgs")

    # ── Deduplicate ──
    people, people_merges = deduplicate_names(raw_people)
    orgs, org_merges = deduplicate_names(raw_orgs)
    print(f"After dedup: {len(people)} people ({people_merges} merged), {len(orgs)} orgs ({org_merges} merged)")

    # ── Filter out existing ──
    new_people = {n: c for n, c in people.items() if n.lower().strip() not in existing_lower}
    new_orgs = {n: c for n, c in orgs.items() if n.lower().strip() not in existing_lower}

    # ── Remove overlaps (same name in both sets) ──
    overlap = set(new_people.keys()) & set(new_orgs.keys())
    for name in overlap:
        if new_people[name] >= new_orgs[name]:
            del new_orgs[name]
        else:
            del new_people[name]

    # ── Sort by mention count ──
    sorted_people = sorted(new_people.items(), key=lambda x: (-x[1], x[0]))
    sorted_orgs = sorted(new_orgs.items(), key=lambda x: (-x[1], x[0]))

    print()
    print("=" * 60)
    print("  HARVEST RESULTS (CLEANED)")
    print("=" * 60)
    print(f"  Already exist:     {len(existing_lower)}")
    print(f"  New people:        {len(sorted_people)}")
    print(f"  New organizations: {len(sorted_orgs)}")
    print(f"  Total to insert:   {len(sorted_people) + len(sorted_orgs)}")
    print("=" * 60)

    if DRY_RUN:
        print("\nTop 25 new people (by archive mentions):")
        for name, count in sorted_people[:25]:
            print(f"   [{count:3d} docs] {name}")
        print(f"\nTop 25 new organizations (by archive mentions):")
        for name, count in sorted_orgs[:25]:
            print(f"   [{count:3d} docs] {name}")
        print(f"\nDry run complete. Run without --dry-run to insert.")
        return

    # ── Build INSERT statements ──
    sql_statements = []

    for name, count in sorted_people:
        eid = f"entity-{abs(hash(name)) % 0xFFFFFFFF:08x}"
        sql_statements.append(
            f"INSERT OR IGNORE INTO entities (id, type, name, description, url, image_url, role, tagline, featured) "
            f"VALUES ('{escape_sql(eid)}', 'person', '{escape_sql(name)}', '', '', '', NULL, '', 0);"
        )

    for name, count in sorted_orgs:
        eid = f"entity-{abs(hash(name)) % 0xFFFFFFFF:08x}"
        sql_statements.append(
            f"INSERT OR IGNORE INTO entities (id, type, name, description, url, image_url, role, tagline, featured) "
            f"VALUES ('{escape_sql(eid)}', 'organization', '{escape_sql(name)}', '', '', '', NULL, '', 0);"
        )

    print(f"\nGenerated {len(sql_statements)} INSERT statements.")
    print(f"Executing in batches of {BATCH_SIZE}...\n")

    total_batches = (len(sql_statements) + BATCH_SIZE - 1) // BATCH_SIZE
    success_count = 0
    fail_count = 0

    for i in range(0, len(sql_statements), BATCH_SIZE):
        batch = sql_statements[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        print(f"   Batch {batch_num}/{total_batches} ({len(batch)} stmts)...", end=" ", flush=True)

        if execute_sql_via_wrangler(batch):
            success_count += len(batch)
            print("OK")
        else:
            fail_count += len(batch)
            print("FAIL")

        time.sleep(0.3)

    print()
    print("=" * 60)
    print(f"  SYNC COMPLETE")
    print(f"  Inserted: {success_count}")
    print(f"  Failed:   {fail_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
