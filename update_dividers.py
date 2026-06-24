import glob
import re

directories = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components']

count = 0
for d in directories:
    for filepath in glob.glob(d + '/*.jsx'):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace section dividers
        new_content = re.sub(
            r'<div style=\{\{ height: 1, background: [^,]+, margin: "0 0 [56]rem" \}\} />',
            r'<div style={{ borderBottom: "3px dotted var(--c-ghost)", margin: "0 0 5rem", opacity: 0.5 }} />',
            content
        )
        # Handle the one in DemographicsDashboardPage
        new_content = re.sub(
            r'<div style=\{\{ height: 1, background: C\.ghost, margin: "1\.5rem 0", opacity: 0\.3 \}\} />',
            r'<div style={{ borderBottom: "3px dotted var(--c-ghost)", margin: "1.5rem 0", opacity: 0.5 }} />',
            new_content
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print('Updated section dividers in ' + filepath)

print(f'Updated {count} files.')
