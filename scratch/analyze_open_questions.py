import json

try:
    with open('questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    with open('scratch/questions_repaired.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

questions = data.get('questions', [])

# Filter open text questions
open_qs = [q for q in questions if q.get('type') == 'open_text']

print(f"Total open text questions: {len(open_qs)}")

# Group by pathway or section to see similarities
pathways = {}
for q in open_qs:
    path = q.get('pathway', 'none')
    pathways.setdefault(path, []).append(q)

with open('scratch/open_questions_by_pathway.txt', 'w', encoding='utf-8') as out:
    for path, qs in sorted(pathways.items()):
        out.write(f"=== PATHWAY: {path} ({len(qs)} questions) ===\n")
        # Sort by responses or tier
        for q in sorted(qs, key=lambda x: x.get('n_responses', 0), reverse=True):
            out.write(f"- ID: {q['id']} | Tier: {q.get('tier')} | N: {q.get('n_responses', 0)}\n")
            out.write(f"  Prompt: {q['prompt']}\n\n")

print("Done! Summary written to scratch/open_questions_by_pathway.txt")
