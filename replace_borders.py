import os
import glob
import re

directories = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components']

count = 0
for d in directories:
    for filepath in glob.glob(d + '/*.jsx'):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = re.sub(r'1px solid (\$\{C\.ghost\}|\$\{resolveCssColor\(C\.ghost\)\})', r'3px dotted \1', content)
        new_content = re.sub(r'1px solid (\$\{pathwayObj \? pathwayObj\.color \+ \"35\" : C\.ghost\})', r'3px dotted \1', new_content)
        new_content = re.sub(r'1px solid var\(--c-ghost\)', r'3px dotted var(--c-ghost)', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print('Updated ' + filepath)

print(f'Updated {count} files.')
