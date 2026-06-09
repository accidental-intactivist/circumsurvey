import re

mockup_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\mockup_template_unwrapped.html"
scrolly_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\src\components\Scrollytelling\ScrollyEngine.jsx"
landing_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\src\pages\LandingPage.jsx"
out_path = r"d:\Dropbox\Accidental Intactivist\Repo\circumsurvey\scratch\report_comparison.txt"

def get_file_content(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

mockup_content = get_file_content(mockup_path)
scrolly_content = get_file_content(scrolly_path)
landing_content = get_file_content(landing_path)

# Extract mockup sections
# Looks for: <!-- ===================== ACT ... -->
mockup_acts = re.findall(r'<!--\s*=+\s*(ACT.*?)\s*=+\s*-->', mockup_content)
mockup_h2s = re.findall(r'<h2.*?>(.*?)</h2>', mockup_content, re.DOTALL)
mockup_h2s_clean = [re.sub(r'<[^>]+>', '', h).strip().replace('&nbsp;', ' ').replace(chr(160), ' ') for h in mockup_h2s]

# Extract React Scrolly sections
# Looks for: eyebrow="Act ..." title="..." or comments like // ACT ... or title="..." inside ScrollyNarrative
scrolly_acts = re.findall(r'eyebrow="Act\s+(\w+)"\s+title="([^"]+)"', scrolly_content)
scrolly_narrative_h3s = re.findall(r'<h3.*?>(.*?)</h3>', scrolly_content, re.DOTALL)
scrolly_narrative_titles = re.findall(r'title="([^"]+)"', scrolly_content)

# Extract Landing Page sections
# Looks for section names, curated cards, or headings
landing_h2s = re.findall(r'<h2.*?>(.*?)</h2>', landing_content, re.DOTALL)
landing_h2s_clean = [re.sub(r'<[^>]+>', '', h).strip().replace('&nbsp;', ' ').replace(chr(160), ' ') for h in landing_h2s]
landing_cards = re.findall(r'<BureauCard.*?title="([^"]+)"', landing_content)

with open(out_path, "w", encoding="utf-8") as out:
    out.write("========================================================================\n")
    out.write("CIRCUMSURVEY FINDINGS — NARRATIVE & CONTENT STRUCTURE COMPARISON\n")
    out.write("========================================================================\n\n")

    out.write("1. STANDALONE CLAUDE MOCKUP STRUCTURE (Acts 1-17)\n")
    out.write("------------------------------------------------------------------------\n")
    out.write("Mockup Sections (from comments):\n")
    for act in mockup_acts:
        out.write(f"  - {act}\n")
    out.write("\nMockup Key Headings (H2s):\n")
    for h in mockup_h2s_clean:
        if h:
            out.write(f"  - \"{h}\"\n")
    
    out.write("\n\n2. REACT SCROLLY ENGINE STRUCTURE (src/components/Scrollytelling/ScrollyEngine.jsx)\n")
    out.write("------------------------------------------------------------------------\n")
    out.write("Scrolly Acts (eyebrow + title props):\n")
    for act in scrolly_acts:
        out.write(f"  - Act {act[0]}: \"{act[1]}\"\n")
    out.write("\nScrolly Narrative Titles (all title props):\n")
    for title in scrolly_narrative_titles[:25]:
        out.write(f"  - \"{title}\"\n")

    out.write("\n\n3. REACT LANDING PAGE STRUCTURE (src/pages/LandingPage.jsx)\n")
    out.write("------------------------------------------------------------------------\n")
    out.write("Landing Page Key Headings (H2s):\n")
    for h in landing_h2s_clean[:25]:
        if h:
            out.write(f"  - \"{h}\"\n")
    out.write("\nLanding Page Bureau Cards (title props):\n")
    for card in landing_cards[:25]:
        out.write(f"  - \"{card}\"\n")

print("Done comparing!")
