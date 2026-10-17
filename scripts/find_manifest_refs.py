import os

matches = []
for root, dirs, files in os.walk('.'):
    # skip node_modules, .git, dist, build
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist', 'build', '.antigravity')]
    for file in files:
        if file.endswith(('.js', '.jsx', '.json', '.ts', '.tsx', '.md', '.sql', '.py')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'manifest' in content.lower():
                        # count occurrences or find lines
                        lines = [line.strip() for line in content.splitlines() if 'manifest' in line.lower()]
                        matches.append((path, len(lines), lines[:3]))
            except Exception as e:
                pass

for path, count, sample in matches:
    print(f"{path} ({count} lines):")
    for s in sample:
        print(f"  {s[:120]}")
