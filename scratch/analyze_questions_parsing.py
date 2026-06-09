import re
from collections import Counter
from pathlib import Path

def main():
    seed_path = Path('data/seed.sql')
    if not seed_path.exists():
        # Try seed_deduped.sql
        seed_path = Path('data/seed_deduped.sql')
    
    if not seed_path.exists():
        print("Seed file not found.")
        return
        
    print(f"Reading {seed_path}...")
    
    # Regex to find: INSERT INTO responses (respondent_id, question_id, value_text...)
    # We want to parse the question_id and value_text.
    # An insert looks like: INSERT OR REPLACE INTO responses (respondent_id, question_id, value_text) VALUES (1, 'demo_country_born', 'USA');
    # Or: VALUES (1, '...', '...', ...);
    insert_re = re.compile(
        r"INSERT OR REPLACE INTO responses\s*\([^)]*\)\s*VALUES\s*\(\s*\d+\s*,\s*'([^']+)'\s*,\s*'(.*)'\s*(?:,|\))",
        re.IGNORECASE
    )
    
    question_responses = {}
    
    # Read line-by-line to avoid memory issues with huge SQL file
    with open(seed_path, 'r', encoding='utf-8') as f:
        for line in f:
            if 'INSERT OR REPLACE INTO responses' in line:
                # We need to handle SQL escaping (e.g. '' for ')
                # Simple extraction:
                match = insert_re.search(line)
                if match:
                    qid, val = match.groups()
                    # Unescape SQL single quote
                    val = val.replace("''", "'")
                    if qid not in question_responses:
                        question_responses[qid] = []
                    question_responses[qid].append(val)
                    
    print(f"Loaded responses for {len(question_responses)} questions.")
    
    # Now let's analyze questions where the options contain commas inside parentheses or similar,
    # which might indicate a multi-select parsing issue.
    # Let's check for each question:
    # 1. Is it a multi-select?
    # 2. What are the most common values?
    # 3. Do some values contain comma-separated values that look like option lists, but actually contain parentheses with commas inside?
    
    # Let's find questions that have values with '(' and ')' and ',' inside.
    suspicious = []
    for qid, values in question_responses.items():
        c = Counter(values)
        # Check if any of the top values contain both parentheses and commas
        has_paren_comma = False
        sample_vals = []
        for val, count in c.most_common(20):
            if '(' in val and ')' in val and ',' in val:
                has_paren_comma = True
                sample_vals.append(val)
        if has_paren_comma:
            suspicious.append((qid, len(values), len(c), sample_vals))
            
    print("\n=== Questions with Options containing Parentheses and Commas ===")
    for qid, total, unique, samples in suspicious:
        print(f"ID: {qid} (responses: {total}, unique raw: {unique})")
        print("  Sample values with paren & comma:")
        for s in samples[:5]:
            print(f"    - {s}")
        print("-" * 50)

if __name__ == '__main__':
    main()
