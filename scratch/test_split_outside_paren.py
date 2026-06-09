import re
from collections import Counter
from pathlib import Path
import json

def split_outside_paren(s):
    parts = []
    current = []
    paren_depth = 0
    i = 0
    while i < len(s):
        c = s[i]
        if c == '(':
            paren_depth += 1
            current.append(c)
        elif c == ')':
            paren_depth -= 1
            current.append(c)
        elif c == ',' and paren_depth == 0:
            parts.append("".join(current).strip())
            current = []
            if i + 1 < len(s) and s[i+1] == ' ':
                i += 1
        else:
            current.append(c)
        i += 1
    if current:
        parts.append("".join(current).strip())
    return [p for p in parts if p]

def main():
    seed_path = Path('data/seed.sql')
    if not seed_path.exists():
        seed_path = Path('data/seed_deduped.sql')
    if not seed_path.exists():
        print("No seed file.")
        return

    insert_re = re.compile(
        r"INSERT OR REPLACE INTO responses\s*\([^)]*\)\s*VALUES\s*\(\s*\d+\s*,\s*'([^']+)'\s*,\s*'(.*)'\s*(?:,|\))",
        re.IGNORECASE
    )
    
    question_responses = {}
    with open(seed_path, 'r', encoding='utf-8') as f:
        for line in f:
            if 'INSERT OR REPLACE INTO responses' in line:
                match = insert_re.search(line)
                if match:
                    qid, val = match.groups()
                    val = val.replace("''", "'")
                    if qid not in question_responses:
                        question_responses[qid] = []
                    question_responses[qid].append(val)
                    
    # Let's see what options are inferred for family_mother_profession and family_father_profession
    for qid in ['family_mother_profession', 'family_father_profession']:
        if qid in question_responses:
            values = question_responses[qid]
            opts = set()
            for v in values:
                parts = split_outside_paren(v)
                opts.update(parts)
            print(f"=== Inferred options for {qid} using split_outside_paren ({len(opts)} total) ===")
            for opt in sorted(opts):
                print(f"  - {opt}")
            print()

if __name__ == '__main__':
    main()
