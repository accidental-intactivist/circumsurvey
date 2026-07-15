import sqlite3

conn = sqlite3.connect('local_db.sqlite')
c = conn.cursor()

c.execute("SELECT respondent_id FROM responses WHERE question_id = 'circ_age' AND value_text IN ('Adolescence', 'Adulthood')")
ids = [r[0] for r in c.fetchall()]

ids_str = ','.join(map(str, ids))

c.execute(f"SELECT question_id, value_text FROM responses WHERE respondent_id IN ({ids_str}) AND question_id IN ('circ_adult_context', 'circ_age')")
res = c.fetchall()

context_counts = {}
age_counts = {}

for row in res:
    qid, val = row
    if qid == 'circ_adult_context':
        context_counts[val] = context_counts.get(val, 0) + 1
    elif qid == 'circ_age':
        age_counts[val] = age_counts.get(val, 0) + 1

print('Total Adult/Adolescent N:', len(ids))
print('CONTEXT:', context_counts)
print('AGE:', age_counts)
