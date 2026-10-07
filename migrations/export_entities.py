import os, glob, sqlite3, json
base_dir = r"C:\work\circumsurvey\advocacy-shell"
glob_pattern = os.path.join(base_dir, '.wrangler', 'state', 'v3', 'd1', '*', '*.sqlite')
db_path = [f for f in glob.glob(glob_pattern) if 'metadata' not in f][0]
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT * FROM entities").fetchall()
data = [dict(r) for r in rows]
with open(os.path.join(base_dir, 'public', 'api_entities_mock.json'), 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print(f"Exported {len(data)} entities to api_entities_mock.json")
