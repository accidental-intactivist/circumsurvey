import json
import re
from pathlib import Path

def repair_json_string(match):
    # This matches: "key": "value containing "nested" quotes"
    # We want to escape the nested quotes.
    content = match.group(2)
    # Escape any double quotes that are not already escaped
    # But wait, it's simpler: replace double quotes inside with escaped double quotes
    # unless they are already escaped.
    escaped = []
    i = 0
    while i < len(content):
        if content[i] == '\\' and i + 1 < len(content) and content[i+1] == '"':
            escaped.append('\\"')
            i += 2
        elif content[i] == '"':
            escaped.append('\\"')
            i += 1
        else:
            escaped.append(content[i])
            i += 1
    return f'{match.group(1)}"{ "".join(escaped) }"'

def main():
    try:
        path = Path('questions.json')
        text = path.read_text(encoding='utf-16-le')
        if text.startswith('\ufeff'):
            text = text[1:]
        
        # A simple regex to find string values in JSON:
        # e.g., : "value" or : [ "value", "value" ]
        # Let's fix common unescaped quote patterns:
        # We can find all string literals: "...[^\\]..."
        # Actually, let's use a simpler approach. Since we know the errors:
        # Let's find: "medically "raped"" -> "medically \"raped\""
        # and "Not be "othered" from society." -> "Not be \"othered\" from society."
        # Let's replace them specifically first, or do a general regex.
        repaired = text
        repaired = repaired.replace('"medically "raped""', '"medically \\"raped\\""')
        repaired = repaired.replace('"Not be "othered" from society."', '"Not be \\"othered\\" from society."')
        repaired = repaired.replace('"The "Like Father" Factor"', '"The \\"Like Father\\" Factor"')
        repaired = repaired.replace('"The "Fitting In" Factor"', '"The \\"Fitting In\\" Factor"')
        repaired = repaired.replace('"experts"', '\\"experts\\"')
        
        # Let's try to parse
        try:
            data = json.loads(repaired)
            print("Successfully parsed repaired JSON!")
            q_list = [q for q in data['questions'] if 'mother_profession' in q['id'] or 'father_profession' in q['id']]
            for q in q_list:
                print(f"ID: {q['id']}")
                print(f"Type: {q['type']}")
                print(f"Opts: {q.get('opts')}")
                print("-" * 40)
        except json.JSONDecodeError as err:
            print(f"Parsing failed at position {err.pos}: {err.msg}")
            # Print context
            start = max(0, err.pos - 150)
            end = min(len(repaired), err.pos + 150)
            print("Context:")
            print(repaired[start:end])
            
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    main()
