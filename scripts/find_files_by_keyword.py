import os

keywords = ['manifest', 'entities', 'entity', 'guide']
matches = {k: [] for k in keywords}

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist', 'build', '.antigravity')]
    for file in files:
        f_lower = file.lower()
        for k in keywords:
            if k in f_lower:
                matches[k].append(os.path.join(root, file))

for k, flist in matches.items():
    print(f"=== Keyword: {k} ({len(flist)} files) ===")
    for f in flist[:20]:
        print(" ", f)
    if len(flist) > 20:
        print(f"  ... and {len(flist)-20} more")
