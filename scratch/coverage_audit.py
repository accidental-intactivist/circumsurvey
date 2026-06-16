"""
Question Coverage Audit
Cross-references all 347 questions in the DB against every exhibit page
to find which questions are surfaced vs unsurfaced.
"""
import json, os, re, sys
from pathlib import Path

# Load all questions from raw API dump
with open("scratch/all_questions_raw.json", encoding="utf-8-sig") as f:
    raw = json.load(f)
questions = [{"id": q["id"], "pathway": q["pathway"], "type": q["type"], "prompt": q.get("prompt", "")[:120]} for q in raw["questions"]]

print(f"Total questions in database: {len(questions)}")

# Scan all exhibit pages for question ID references
pages_dir = Path("src/explore/pages")
exhibit_files = [f for f in pages_dir.glob("*.jsx") if ".tmp." not in f.name]

# Also scan components that may reference questions
component_files = list(Path("src/explore/components").glob("*.jsx"))
# And data files
data_files = list(Path("src/explore/lib").glob("*.js"))

all_files = exhibit_files + component_files + data_files

# Build a set of all question IDs for matching
all_qids = {q["id"] for q in questions}

# For each file, find which question IDs it references
file_refs = {}
qid_to_files = {qid: set() for qid in all_qids}

for fpath in all_files:
    content = fpath.read_text(encoding="utf-8", errors="ignore")
    refs = set()
    for qid in all_qids:
        # Match the question ID as a quoted string or in a template literal
        if qid in content:
            refs.add(qid)
            qid_to_files[qid].add(fpath.name)
    if refs:
        file_refs[fpath.name] = sorted(refs)

# Categorize
surfaced = {qid for qid, files in qid_to_files.items() if files}
unsurfaced = all_qids - surfaced

# Build pathway breakdown
pathway_counts = {}
for q in questions:
    pw = q["pathway"]
    if pw not in pathway_counts:
        pathway_counts[pw] = {"total": 0, "surfaced": 0, "unsurfaced": 0}
    pathway_counts[pw]["total"] += 1
    if q["id"] in surfaced:
        pathway_counts[pw]["surfaced"] += 1
    else:
        pathway_counts[pw]["unsurfaced"] += 1

# Print summary
print(f"\nSurfaced (referenced in >=1 exhibit/component): {len(surfaced)}")
print(f"Unsurfaced (referenced in 0 files): {len(unsurfaced)}")
print(f"\n{'Pathway':<15} {'Total':>6} {'Shown':>6} {'Missing':>8} {'Coverage':>9}")
print("-" * 50)
for pw in sorted(pathway_counts.keys()):
    c = pathway_counts[pw]
    pct = (c["surfaced"] / c["total"] * 100) if c["total"] > 0 else 0
    print(f"{pw:<15} {c['total']:>6} {c['surfaced']:>6} {c['unsurfaced']:>8} {pct:>8.1f}%")

# Print unsurfaced by pathway
print(f"\n{'='*80}")
print(f"UNSURFACED QUESTIONS BY PATHWAY")
print(f"{'='*80}")

unsurfaced_qs = [q for q in questions if q["id"] in unsurfaced]
unsurfaced_by_pw = {}
for q in unsurfaced_qs:
    pw = q["pathway"]
    if pw not in unsurfaced_by_pw:
        unsurfaced_by_pw[pw] = []
    unsurfaced_by_pw[pw].append(q)

for pw in sorted(unsurfaced_by_pw.keys()):
    qs = unsurfaced_by_pw[pw]
    print(f"\n--- {pw.upper()} ({len(qs)} unsurfaced) ---")
    for q in sorted(qs, key=lambda x: x["id"]):
        print(f"  {q['type']:<15} {q['id']:<55} {q['prompt'][:70]}")

# Print which files reference the most questions
print(f"\n{'='*80}")
print(f"EXHIBIT FILE COVERAGE")
print(f"{'='*80}")
for fname, refs in sorted(file_refs.items(), key=lambda x: -len(x[1])):
    if fname.endswith(".jsx") and "Page" in fname:
        print(f"  {fname:<45} {len(refs):>3} questions referenced")

# Output the full data as JSON for artifact creation
output = {
    "total": len(questions),
    "surfaced_count": len(surfaced),
    "unsurfaced_count": len(unsurfaced),
    "pathway_breakdown": pathway_counts,
    "unsurfaced_questions": [
        {"id": q["id"], "pathway": q["pathway"], "type": q["type"], "prompt": q["prompt"]}
        for q in unsurfaced_qs
    ],
    "surfaced_questions": [
        {"id": qid, "files": sorted(qid_to_files[qid])}
        for qid in sorted(surfaced)
    ],
}
with open("scratch/coverage_audit.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\nFull audit data written to scratch/coverage_audit.json")
