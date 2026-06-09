import re
from pathlib import Path

def repair_line(line):
    # Match a JSON string value in an array or object property
    # E.g.: "key": "value" or "value",
    # Case 1: property "key": "value"
    prop_match = re.match(r'^(\s*"[^"]+"\s*:\s*)"(.*)"(\s*,?\s*)$', line)
    if prop_match:
        prefix, val, suffix = prop_match.groups()
        # Escape double quotes in val if not already escaped
        val_escaped = re.sub(r'(?<!\\)"', r'\"', val)
        return f'{prefix}"{val_escaped}"{suffix}'
        
    # Case 2: array item "value", or "value"
    item_match = re.match(r'^(\s*)"(.*)"(\s*,?\s*)$', line)
    if item_match:
        prefix, val, suffix = item_match.groups()
        # If it's a structural line like [ or ] or { or }, skip
        if val.strip() in ('[', ']', '{', '}', ''):
            return line
        # Escape double quotes in val if not already escaped
        val_escaped = re.sub(r'(?<!\\)"', r'\"', val)
        return f'{prefix}"{val_escaped}"{suffix}'
        
    return line

def main():
    path = Path('questions.json')
    text = path.read_text(encoding='utf-16-le')
    if text.startswith('\ufeff'):
        text = text[1:]
        
    lines = text.splitlines()
    repaired_lines = []
    for line in lines:
        repaired_lines.append(repair_line(line))
        
    repaired_text = '\n'.join(repaired_lines)
    
    # Save the repaired text as UTF-8
    Path('scratch/questions_repaired.json').write_text(repaired_text, encoding='utf-8')
    print("Wrote scratch/questions_repaired.json")
    
    # Try parsing it
    import json
    try:
        data = json.loads(repaired_text)
        print("Success! JSON parsed perfectly!")
        # Print info for family_mother_profession
        q = next((item for item in data['questions'] if item['id'] == 'family_mother_profession'), None)
        if q:
            print("family_mother_profession:")
            print(json.dumps(q, indent=2))
    except json.JSONDecodeError as e:
        print(f"Failed to parse repaired JSON at position {e.pos}: {e.msg}")
        start = max(0, e.pos - 100)
        end = min(len(repaired_text), e.pos + 100)
        print("Context:")
        print(repaired_text[start:end])

if __name__ == '__main__':
    main()
