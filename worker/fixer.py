import re

seed_path = '..\\data\\seed.sql'
out_path = '..\\data\\seed_deduped.sql'

seen = set()
kept = 0
dup = 0
non_insert = 0

with open(seed_path, 'r', encoding='utf-8') as f_in, open(out_path, 'w', encoding='utf-8') as f_out:
    for line in f_in:
        # Extract respondent_id and question_id from INSERT INTO responses statements
        m = re.match(r"INSERT INTO responses.*VALUES\s*\('([^']+)',\s*'([^']+)'", line)
        if m:
            key = (m.group(1), m.group(2))
            if key in seen:
                dup += 1
                continue
            seen.add(key)
            kept += 1
        else:
            non_insert += 1
        f_out.write(line)

print(f'Kept {kept} unique response inserts')
print(f'Removed {dup} duplicate inserts')
print(f'Non-insert lines: {non_insert}')