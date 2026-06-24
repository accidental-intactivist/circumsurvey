import glob
import re

directories = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components']

count = 0
for d in directories:
    for filepath in glob.glob(d + '/*.jsx'):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = re.sub(
            r'fontSize: "1\.25rem"',
            r'fontSize: "1.4rem"',
            content
        )
        new_content = re.sub(
            r'fontSize: "0\.85rem", color: C\.dim, fontStyle: "italic"',
            r'fontSize: "1rem", color: C.dim, fontStyle: "italic"',
            new_content
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print('Updated font sizes in ' + filepath)

print(f'Updated {count} files.')
