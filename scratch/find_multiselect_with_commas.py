import re
from collections import Counter
from pathlib import Path
import json

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
                    
    # Let's inspect which questions have responses that look like they contain options with commas.
    # A great way is to look at the list of unique responses.
    # If a question has options that are split by commas, let's print the top 10 raw responses.
    # Especially for: family_mother_profession, family_father_profession, and others.
    
    for qid in ['family_mother_profession', 'family_father_profession']:
        if qid in question_responses:
            print(f"=== Raw unique responses for {qid} (top 20) ===")
            c = Counter(question_responses[qid])
            for val, count in c.most_common(20):
                print(f"  {count:3d} : {val}")
            print()

if __name__ == '__main__':
    main()
