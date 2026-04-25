import re

seed_path = r"data\seed.sql"
out_path  = r"data\seed_deduped.sql"

# Match INSERT INTO responses VALUES (<int_respondent_id>, '<question_id>', ...)
pattern = re.compile(r"INSERT INTO responses.*VALUES\s*\(\s*(\d+)\s*,\s*'([^']+)'")

seen = set()
kept_responses = 0
dup_responses = 0
other_lines = 0

with open(seed_path, "r", encoding="utf-8") as f_in, open(out_path, "w", encoding="utf-8") as f_out:
    for line in f_in:
        m = pattern.match(line)
        if m:
            key = (int(m.group(1)), m.group(2))
            if key in seen:
                dup_responses += 1
                continue
            seen.add(key)
            kept_responses += 1
            f_out.write(line)
        else:
            other_lines += 1
            f_out.write(line)

print(f"Kept {kept_responses} unique response inserts")
print(f"Removed {dup_responses} duplicate response inserts")
print(f"Other lines (respondents/demographics/religion/header): {other_lines}")
