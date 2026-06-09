import re

mockup_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\mockup_template_unwrapped.html"
scrolly_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\src\components\Scrollytelling\ScrollyEngine.jsx"
out_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\text_comparison.txt"

def get_file_content(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

mockup_content = get_file_content(mockup_path)
scrolly_content = get_file_content(scrolly_path)

# Extract paragraphs from mockup
mockup_paras = re.findall(r'<p class="body[^"]*".*?>(.*?)</p>', mockup_content, re.DOTALL)
mockup_paras_clean = [re.sub(r'<[^>]+>', '', p).strip().replace('&nbsp;', ' ').replace('\n', ' ') for p in mockup_paras]

# Extract paragraphs from React ScrollyEngine
# Looks for <p style={{...}}>...</p> or <p>...</p> inside ScrollyNarrative blocks
scrolly_paras = re.findall(r'<p.*?>(.*?)</p>', scrolly_content, re.DOTALL)
scrolly_paras_clean = [re.sub(r'<[^>]+>', '', p).strip().replace('&nbsp;', ' ').replace('\n', ' ') for p in scrolly_paras]

with open(out_path, "w", encoding="utf-8") as out:
    out.write("========================================================================\n")
    out.write("MOCKUP VS REACT SCROLLY — TEXT SAMPLES & TONE ANALYSIS\n")
    out.write("========================================================================\n\n")

    out.write("1. STANDALONE CLAUDE MOCKUP NARRATIVE SAMPLES\n")
    out.write("------------------------------------------------------------------------\n")
    for i, p in enumerate(mockup_paras_clean[:15]):
        if len(p) > 20:
            out.write(f"Sample {i+1}: \"{p}\"\n\n")

    out.write("\n\n2. REACT SCROLLY ENGINE NARRATIVE SAMPLES\n")
    out.write("------------------------------------------------------------------------\n")
    for i, p in enumerate(scrolly_paras_clean[:15]):
        if len(p) > 20:
            out.write(f"Sample {i+1}: \"{p}\"\n\n")

print("Done extracting texts!")
