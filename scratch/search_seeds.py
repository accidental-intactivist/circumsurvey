import re

with open('data/seed_deduped.sql', 'r', encoding='utf-8') as f:
    for line in f:
        if 'INSERT INTO religion' in line:
            # Let's see if there is any mention of atheist, agnostic, or secular in the values
            if any(word in line.lower() for word in ['atheist', 'secular', 'agnostic']):
                print("Found match in seed_deduped.sql:")
                print(line.strip())

with open('data/seed.sql', 'r', encoding='utf-8') as f:
    for line in f:
        if 'INSERT INTO religion' in line:
            if any(word in line.lower() for word in ['atheist', 'secular', 'agnostic']):
                print("Found match in seed.sql:")
                print(line.strip())
