import re

file_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\mockup_template_unwrapped.html"
out_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\mockup_structure.txt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all HTML comments like <!-- ===================== ACT ... -->
comments = re.findall(r'<!--\s*=+\s*(ACT.*?)\s*=+\s*-->', content)
# Find all divs with class "kicker"
kickers = re.findall(r'class="[^"]*kicker[^"]*".*?>(.*?)</div>', content, re.DOTALL)
# Find all h2s
h2s = re.findall(r'<h2.*?>(.*?)</h2>', content, re.DOTALL)

with open(out_path, "w", encoding="utf-8") as out:
    out.write("=== COMMENTS ===\n")
    for c in comments:
        out.write(f"{c}\n")

    out.write("\n=== KICKERS ===\n")
    for k in kickers:
        out.write(f"{k.strip()}\n")

    out.write("\n=== H2S ===\n")
    for h in h2s:
        cleaned_h = re.sub(r'<[^>]+>', '', h)
        out.write(f"{cleaned_h.strip().replace('&nbsp;', ' ').replace(chr(160), ' ')}\n")

print("Done writing to mockup_structure.txt!")
