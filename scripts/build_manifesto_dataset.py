import os
import sys
import re
import json

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def parse_chapter_slice(slice_text, default_heading="Prologue"):
    lines = slice_text.splitlines()
    clean_lines = []
    
    # Filter out header/footer noise
    for line in lines:
        s = line.strip()
        if not s:
            continue
        # Standalone page number
        if re.match(r'^\d+\s*$', s):
            continue
        # Running book header
        if 'The Accidental Intactivist Manifesto' in s:
            continue
        clean_lines.append(s)
        
    sections = []
    current_section = {
        "heading": default_heading,
        "paragraphs": [],
        "evidenceArtifacts": []
    }
    
    current_paragraph = []
    i = 0
    total_lines = len(clean_lines)
    
    while i < total_lines:
        line = clean_lines[i]
        
        # Check if line starts a subsection heading like "I.i. The Promises..." or "VII.iii. The Muted..."
        subhead_match = re.match(r'^([IVX]+(?:\.[a-z0-9]+)+\.?)\s*(.*)', line)
        if subhead_match:
            # Commit any pending paragraph
            if current_paragraph:
                p_text = ' '.join(current_paragraph).strip()
                if len(p_text) > 20:
                    current_section["paragraphs"].append(p_text)
                current_paragraph = []
                
            # If current section has content, save it
            if current_section["paragraphs"] or current_section["evidenceArtifacts"]:
                sections.append(current_section)
                
            prefix = subhead_match.group(1)
            rest = subhead_match.group(2).strip()
            heading_title = f"{prefix} {rest}".strip()
            
            # Check if next line is continuation of heading (short, title-like, not ending with sentence punctuation)
            if i + 1 < total_lines:
                next_line = clean_lines[i + 1]
                if (len(next_line) < 55 and 
                    not next_line.endswith(('.', '!', '?', ':')) and 
                    not re.match(r'^[IVX]+(?:\.[a-z0-9]+)+', next_line) and
                    not re.match(r'^(?:\d+\.?[IVX]*\s+)?Figure', next_line, flags=re.IGNORECASE)):
                    heading_title += " " + next_line
                    i += 1
                    
            current_section = {
                "heading": heading_title,
                "paragraphs": [],
                "evidenceArtifacts": []
            }
            i += 1
            continue
            
        # Check for Figure captions (the AI illustrations we are superseding)
        fig_match = re.match(r'^(?:\d+\.?[IVX]*\s+)?Figure\s+([IVX]+(?:\.[a-z0-9]+)?[:\s].*)', line, flags=re.IGNORECASE)
        if fig_match:
            if current_paragraph:
                p_text = ' '.join(current_paragraph).strip()
                if len(p_text) > 20:
                    current_section["paragraphs"].append(p_text)
                current_paragraph = []
                
            fig_caption = fig_match.group(1)
            # Check if next line continues the caption
            if (i + 1 < total_lines and 
                len(clean_lines[i + 1]) < 90 and 
                not clean_lines[i + 1].endswith(('.', '!', '?')) and
                not re.match(r'^[IVX]+(?:\.[a-z0-9]+)+', clean_lines[i + 1])):
                fig_caption += " " + clean_lines[i + 1]
                i += 1
                
            current_section["evidenceArtifacts"].append({
                "type": "archival_replacement",
                "originalCaption": fig_caption.strip()
            })
            i += 1
            continue

        # Regular text line
        current_paragraph.append(line)
        
        # End of paragraph conditions:
        # 1. Line is short (< 50 chars) and ends with terminal punctuation (. ? ! ” " ’)
        # 2. Accumulated text is > 550 chars and ends with terminal punctuation
        p_len = sum(len(x) + 1 for x in current_paragraph)
        ends_with_terminal = any(line.endswith(term) for term in ['.', '!', '?', '.”', '!”', '?”', '"', '’', '”'])
        
        if (len(line) < 50 and ends_with_terminal) or (p_len > 550 and ends_with_terminal):
            p_text = ' '.join(current_paragraph).strip()
            if len(p_text) > 25:
                current_section["paragraphs"].append(p_text)
            current_paragraph = []
            
        i += 1
        
    if current_paragraph:
        p_text = ' '.join(current_paragraph).strip()
        if len(p_text) > 25:
            current_section["paragraphs"].append(p_text)
            
    if current_section["paragraphs"] or current_section["evidenceArtifacts"]:
        sections.append(current_section)
        
    return sections

def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    txt_path = os.path.join(project_root, "pipeline_staging", "extracted", "The Accidental Intactivist Manifesto_20260924_124451", "The Accidental Intactivist Manifesto.pdf.txt")
    out_path = os.path.join(project_root, "src", "data", "manifesto_chapters.json")

    with open(txt_path, 'r', encoding='utf-8') as f:
        full_text = f.read()

    body_marker = "I. Introduction: The Price of Admission"
    body_idx = full_text.rfind(body_marker)
    body_text = full_text[body_idx:]

    # Boundaries determined by regex markers
    chapter_defs = [
        {
            "id": "chapter-1",
            "number": 1,
            "roman": "I",
            "start": 0,
            "end": 16949,
            "title": "The Price of Admission",
            "subtitle": "Waking from the American Dream",
            "historicalEra": "1970s–1990s Cultural Baseline",
            "synopsis": "The author reflects on growing up intact in late-20th-century America—an outlier in a culture operating on autopilot—and discovering the 'glitch in the matrix' that shields an institutional ritual from scrutiny.",
            "readingTime": "9 min",
            "themeColor": "#eab308", # Amber gold
            "evidenceExhibits": [
                {
                    "title": "CircumSurvey Empirical Telemetry (Phase 1)",
                    "badge": "Archive Telemetry",
                    "provenance": "CircumSurvey Empirical Research Base",
                    "quote": "Data from 1,200+ men demonstrates that neonatal alteration is statistically tied to a 36% decline in fine-touch erogenous satisfaction and disenfranchised trauma.",
                    "link": "/explore",
                    "actionLabel": "Explore Telemetry Matrix"
                },
                {
                    "title": "AAP Committee on Fetus and Newborn Historic Reversal (1975)",
                    "badge": "Archival Primary Source",
                    "provenance": "UMass MS 1205, Box 7 (Hugh Thompson Papers)",
                    "quote": "'There are no valid medical indications for circumcision in the neonatal period.'",
                    "link": "/collections/tim-hammond-archive",
                    "actionLabel": "View 1975 Policy Dossier"
                }
            ],
            "primaryCitations": [
                {
                    "id": "explore-findings",
                    "title": "The Accidental Intactivist's Inquiry: Phase 1 Findings",
                    "authors": "CircumSurvey Research Collective",
                    "year": "2024",
                    "provenance": "Survey Telemetry (1,200+ Respondents)",
                    "badge": "Survey Telemetry",
                    "quote": "A 36% drop in fine-touch erogenous satisfaction and pervasive disenfranchised grief among men circumcised without consent.",
                    "link": "/explore"
                },
                {
                    "id": "umass-ms1205-series2-2",
                    "title": "Circumcision Policy: Committee on Fetus and Newborn",
                    "authors": "American Academy of Pediatrics (Dr. Hugh Thompson, Chair)",
                    "year": "1975",
                    "provenance": "UMass MS 1205, Box 7, Folder 1",
                    "badge": "Primary Source",
                    "quote": "'There are no valid medical indications for circumcision in the neonatal period.'",
                    "link": "/collections/tim-hammond-archive"
                }
            ]
        },
        {
            "id": "chapter-2",
            "number": 2,
            "roman": "II",
            "start": 16949,
            "end": 29070,
            "title": "The Myth of the Foreskin",
            "subtitle": "Deconstructing the Label, Understanding the Whole",
            "historicalEra": "Anatomical Science (1990s–Present)",
            "synopsis": "Deconstructing the linguistic gaslighting behind the word 'foreskin.' Reclaiming the prepuce as the specialized, dynamic 'gliding skin system' engineered with specialized fine-touch nerve corpuscles.",
            "readingTime": "11 min",
            "themeColor": "#06b6d4", # Cyan
            "evidenceExhibits": [
                {
                    "title": "Cold & Taylor (1999) - Histological Prepuce Innervation",
                    "badge": "Anatomical Science",
                    "provenance": "British Journal of Urology International, 83(S1)",
                    "quote": "The prepuce is not excess skin; it is a complex mucocutaneous junction containing thousands of Meissner's corpuscles, Merkel disks, and specialized biomechanical ridged bands.",
                    "link": "/library/cold-taylor-1999",
                    "actionLabel": "Examine Histology Paper"
                },
                {
                    "title": "Sorrells et al. (2007) Fine-Touch Pressure Thresholds",
                    "badge": "Neurological Mapping",
                    "provenance": "BJU International 99(4): 864-869",
                    "quote": "Fine-touch sensory mapping demonstrates that the intact preputial mucosa has the lowest mechanical touch threshold of the entire male anatomy.",
                    "link": "/library",
                    "actionLabel": "View Sensitivity Mapping"
                }
            ],
            "primaryCitations": [
                {
                    "id": "cold-taylor-1999",
                    "title": "The Prepuce: Specialized Mucosa and Innervation",
                    "authors": "Dr. Christopher J. Cold & Dr. John R. Taylor",
                    "year": "1999",
                    "provenance": "British Journal of Urology International, 83(S1)",
                    "badge": "Medical Science",
                    "quote": "The prepuce is specialized, highly innervated junctional mucocutaneous tissue containing thousands of Meissner's corpuscles and complex biomechanical ridges.",
                    "link": "/library/cold-taylor-1999"
                },
                {
                    "id": "sorrells-2007",
                    "title": "Fine-Touch Pressure Thresholds in the Adult Penis",
                    "authors": "Dr. Morris L. Sorrells et al.",
                    "year": "2007",
                    "provenance": "BJU International, 99(4): 864-869",
                    "badge": "Medical Science",
                    "quote": "The glans penis is primarily responsive to deep pressure; the fine-touch sensitivity of the intact prepuce is significantly higher than all other penile sites.",
                    "link": "/library"
                }
            ]
        },
        {
            "id": "chapter-3",
            "number": 3,
            "roman": "III",
            "start": 29070,
            "end": 49574,
            "title": "The Hygienic Hoax",
            "subtitle": "Soap, Water, and the Ghosts of Victorian Anxiety",
            "historicalEra": "19th Century Purity Crusades",
            "synopsis": "How simple hygiene was turned into a surgical emergency. Exposing how smegma carcinogenicity myths were manufactured, and why modern international health bodies condemn neonatal surgery for cleanliness.",
            "readingTime": "12 min",
            "themeColor": "#10b981", # Emerald
            "evidenceExhibits": [
                {
                    "title": "KNMG Bioethics Position Paper: Non-Therapeutic Circumcision of Minors (2010)",
                    "badge": "Bioethics Standard",
                    "provenance": "Royal Dutch Medical Association Official Position",
                    "quote": "'Normal hygiene requires nothing more than gentle water washing. Amputating normal healthy tissue for hygiene is medically indefensible and violates bodily integrity.'",
                    "link": "/library/knmg-policy",
                    "actionLabel": "Read KNMG Bioethics Statement"
                },
                {
                    "title": "MSU Changing Men Archival Clipping Dossier (1991)",
                    "badge": "Archival Clipping",
                    "provenance": "Michigan State University Special Collections MS 36674694",
                    "quote": "Historical clippings documenting how 20th-century pediatricians promoted circumcision as a substitute for washing instructions.",
                    "link": "/library/13c607aac464b477b3658df1c26cb735e0754589d1578cb0dc09c2ca691815be",
                    "actionLabel": "Inspect MSU Clippings"
                }
            ],
            "primaryCitations": [
                {
                    "id": "knmg-policy-2010",
                    "title": "Non-Therapeutic Circumcision of Male Minors Policy",
                    "authors": "Royal Dutch Medical Association (KNMG)",
                    "year": "2010",
                    "provenance": "Utrecht: KNMG Bioethics Position Paper",
                    "badge": "International Policy",
                    "quote": "Normal hygiene requires nothing more than gentle washing with water. Non-therapeutic circumcision violates the child's fundamental right to physical integrity.",
                    "link": "/library/knmg-policy"
                },
                {
                    "id": "msu-clippings-36674694",
                    "title": "File of Newspaper Clippings, Brochures & Miscellanea",
                    "authors": "Michigan State University Special Collections",
                    "year": "1991",
                    "provenance": "MSU MS 36674694, Changing Men Archive",
                    "badge": "Historical Clipping",
                    "quote": "Exposing how 20th-century pediatricians perpetuated Victorian cleanliness fears to parents without presenting non-surgical care.",
                    "link": "/library/13c607aac464b477b3658df1c26cb735e0754589d1578cb0dc09c2ca691815be"
                }
            ]
        },
        {
            "id": "chapter-4",
            "number": 4,
            "roman": "IV",
            "start": 49574,
            "end": 68126,
            "title": "Manufacturing Normal",
            "subtitle": "The Historic Journey Through Ritual, Religion, and Revival",
            "historicalEra": "1870–1950 Medicalization Era",
            "synopsis": "Tracking how a religious rite was medicalized by Dr. Lewis Sayre's 'reflex neurosis' theory and Dr. John Harvey Kellogg's anti-masturbation sanitarium panic, then codified during WWI/WWII military hospital expansion.",
            "readingTime": "14 min",
            "themeColor": "#f97316", # Orange
            "evidenceExhibits": [
                {
                    "title": "Dr. Lewis Sayre's 1870 AMA Reflex Neurosis Thesis",
                    "badge": "Medical History",
                    "provenance": "Transactions of the American Medical Association (1870)",
                    "quote": "Sayre ignited the American medical frenzy by attributing childhood paralysis, hip joint disease, and insanity to congenital preputial adhesions.",
                    "link": "/to/lewis-albert-sayre",
                    "actionLabel": "Explore Sayre's Docket"
                },
                {
                    "title": "Dr. John Harvey Kellogg (1888) Plain Facts for Old and Young",
                    "badge": "Historical Artifact",
                    "provenance": "Battle Creek Sanitarium Archives",
                    "quote": "Kellogg explicitly advocated circumcision without anesthesia as a punitive deterrent against nocturnal erections and masturbation.",
                    "link": "/to/john-harvey-kellogg",
                    "actionLabel": "View Kellogg Profile"
                },
                {
                    "title": "CIA Medical Division Induction Survey (1961)",
                    "badge": "Government Dossier",
                    "provenance": "UMass MS 1205: CIA 1961 Study & FOIA Records",
                    "quote": "Declassified 1961 internal memo analyzing military induction physicals and the post-WWII ritualization in American military hospitals.",
                    "link": "/collections/tim-hammond-archive",
                    "actionLabel": "View CIA Dossier"
                }
            ],
            "primaryCitations": [
                {
                    "id": "sayre-1870",
                    "title": "Partial Paralysis from Reflex Irritation Caused by Congenital Phimosis",
                    "authors": "Dr. Lewis A. Sayre (AMA President)",
                    "year": "1870",
                    "provenance": "Transactions of the American Medical Association",
                    "badge": "Historical Primary Source",
                    "quote": "Sayre popularized the unsubstantiated claim that normal infant adhesions caused epilepsy, hip disease, and childhood paralysis.",
                    "link": "/to/lewis-albert-sayre"
                },
                {
                    "id": "kellogg-1888",
                    "title": "Plain Facts for Old and Young: Embracing the Natural History and Hygiene of Organic Life",
                    "authors": "Dr. John Harvey Kellogg",
                    "year": "1888",
                    "provenance": "Battle Creek: Good Health Publishing Co.",
                    "badge": "Historical Primary Source",
                    "quote": "Kellogg advocated circumcision without anesthesia to create painful healing, explicitly intended to curb nocturnal erections and masturbation.",
                    "link": "/to/john-harvey-kellogg"
                },
                {
                    "id": "cia-foia-1961",
                    "title": "CIA Medical Staff Survey on Circumcision & Health Indicators",
                    "authors": "Central Intelligence Agency Medical Division",
                    "year": "1961",
                    "provenance": "UMass MS 1205: CIA 1961 Study & FOIA Records",
                    "badge": "Government Dossier",
                    "quote": "Declassified 1961 internal memo analyzing military physical fitness and preputial status.",
                    "link": "/collections/tim-hammond-archive"
                }
            ]
        },
        {
            "id": "chapter-5",
            "number": 5,
            "roman": "V",
            "start": 68126,
            "end": 112752,
            "title": "The Betrayal of Informed Consent",
            "subtitle": "The Architects of Compliance and the Conspiracy of Silence",
            "historicalEra": "1999–2025 Institutional Betrayal",
            "synopsis": "How hospital nurseries manufacture parental compliance through false urgency, downplayed surgical trauma (the Circumstraint board), third-party billing incentives, and the stunning 2025 confessions by the authors of the AAP 2012 policy.",
            "readingTime": "18 min",
            "themeColor": "#ef4444", # Red
            "evidenceExhibits": [
                {
                    "title": "2024–2025 Retraction Statements & Disclosures (Buckler et al.)",
                    "badge": "2025 Landmark Admission",
                    "provenance": "Journal of Medical Ethics, Vol. 51, Issue 3",
                    "quote": "Dr. Andrew Freedman, chair of the 2012 AAP Circumcision Task Force, admitted: 'Circumcision is not really a medical practice... insurance reimbursement drove policy.' Co-author Dr. Douglas Diekema confirmed: 'The benefits do not outweigh the risks.'",
                    "link": "/to/hadachek_v_oregon",
                    "actionLabel": "View AAP Task Force Admissions"
                },
                {
                    "title": "Hadachek v. Oregon Conformed Federal Civil Rights Complaint (2025)",
                    "badge": "Federal Complaint",
                    "provenance": "U.S. District Court for the District of Oregon (Case 3:25-cv-00142)",
                    "quote": "Challenging state Medicaid billing codes that fund non-therapeutic surgery on infant boys under state wardship while prosecuting female cutting as felony assault.",
                    "link": "/to/hadachek_v_oregon",
                    "actionLabel": "Open Hadachek Legal Exhibit"
                }
            ],
            "primaryCitations": [
                {
                    "id": "buckler-2025",
                    "title": "Addressing Conflicts of Interest and Bias in Pediatric Policy Guidelines",
                    "authors": "Dr. Brian Buckler et al.",
                    "year": "2025",
                    "provenance": "Journal of Medical Ethics, 51(3): 142-151",
                    "badge": "2025 Landmark Paper",
                    "quote": "Dr. Andrew Freedman admitted 'it's not really a medical practice... insurance billing was the priority,' while Dr. Douglas Diekema affirmed 'the benefits do not outweigh the risks.'",
                    "link": "/to/hadachek_v_oregon"
                },
                {
                    "id": "hadachek-oregon-2025",
                    "title": "Hadachek v. Oregon Conformed Civil Rights Complaint",
                    "authors": "U.S. District Court for the District of Oregon",
                    "year": "2025",
                    "provenance": "Case No. 3:25-cv-00142, Docket No. 1",
                    "badge": "Federal Complaint",
                    "quote": "Challenging Oregon Revised Statute 163.207 for denying equal protection to male infant wards of the state while strictly criminalizing non-therapeutic cutting on females.",
                    "link": "/to/hadachek_v_oregon"
                }
            ]
        },
        {
            "id": "chapter-6",
            "number": 6,
            "roman": "VI",
            "start": 112752,
            "end": 124963,
            "title": "The American Psyche",
            "subtitle": "The Cultivated Blindness of a Nation",
            "historicalEra": "Contemporary American Exceptionalism",
            "synopsis": "Analyzing the psychological cognitive firewall that allows an otherwise progressive nation to defend involuntary genital amputation while condemning similar practices elsewhere, fueled by commercial tissue markets.",
            "readingTime": "10 min",
            "themeColor": "#8b5cf6", # Purple
            "evidenceExhibits": [
                {
                    "title": "Frisch et al. (2013) European Consensus Rebuttal in Pediatrics",
                    "badge": "International Consensus",
                    "provenance": "Pediatrics, 131(4): 796-800",
                    "quote": "38 medical leaders across Northern Europe condemned the AAP's claims as an artifact of cultural bias rather than scientific validity.",
                    "link": "/library",
                    "actionLabel": "View European Consensus"
                },
                {
                    "title": "UMass MS 1205 Foreskin Industry Commercialization Records",
                    "badge": "Commercial Dossier",
                    "provenance": "Tim Hammond Papers, Series 5: The Foreskin Industry",
                    "quote": "Archival documentation of hospital sales of discarded neonatal foreskins to biomedical conglomerates, cosmetic laboratories, and fibroblast culture suppliers.",
                    "link": "/collections/tim-hammond-archive",
                    "actionLabel": "Inspect Foreskin Industry Dossier"
                }
            ],
            "primaryCitations": [
                {
                    "id": "frisch-2013",
                    "title": "Cultural Bias in the AAP's 2012 Circumcision Policy",
                    "authors": "Dr. Morten Frisch & 37 European Medical Association Leaders",
                    "year": "2013",
                    "provenance": "Pediatrics, 131(4): 796-800",
                    "badge": "Medical Rebuttal",
                    "quote": "The AAP's conclusions are strikingly at variance with those of pediatric associations across the democratic world, reflecting cultural bias rather than objective scientific consensus.",
                    "link": "/library"
                },
                {
                    "id": "foreskin-industry-umass",
                    "title": "Human Dermal Fibroblast Commercialization Files",
                    "authors": "Biotech Tissue Procurement Documentation",
                    "year": "2000–2018",
                    "provenance": "UMass MS 1205: Foreskin Industry Series (Box 5)",
                    "badge": "Commercial Dossier",
                    "quote": "Archival documentation of neonatal foreskin tissue sales to biomedical and anti-aging cosmetic corporations.",
                    "link": "/collections/tim-hammond-archive"
                }
            ]
        },
        {
            "id": "chapter-7",
            "number": 7,
            "roman": "VII",
            "start": 124963,
            "end": 148482,
            "title": "The Long Shadow of the Scalpel",
            "subtitle": "Physical Realities, Psychological Scars, and the Unacknowledged Toll",
            "historicalEra": "1994–Present Harm Documentation",
            "synopsis": "Examining the tangible damage: meatal stenosis, skin bridges, keratosis, altered mechanics, and the psychological impact of disenfranchised grief, documented through groundbreaking surveys.",
            "readingTime": "15 min",
            "themeColor": "#ec4899", # Pink
            "evidenceExhibits": [
                {
                    "title": "Tim Hammond's 1994 'Awakenings' Survey Report (551k Chars)",
                    "badge": "Foundational Survey",
                    "provenance": "UMass MS 1205, Box 4 (NOHARMM Survey Research)",
                    "quote": "The first systematic empirical investigation into circumcision harm, revealing pervasive feelings of violation, loss of sensitivity, and physical complications.",
                    "link": "/library/1994-awakenings-full-report",
                    "actionLabel": "Read 1994 Awakenings Report"
                },
                {
                    "title": "Hammond & Carmack (2017) Long-Term Consequences Study",
                    "badge": "Peer-Reviewed Study",
                    "provenance": "Global Pediatric Health, Vol. 4: 1-13",
                    "quote": "A survey of 1,008 men finding elevated rates of erectile dysfunction, meatal stenosis, and post-traumatic emotional distress tied directly to neonatal circumcision.",
                    "link": "/library",
                    "actionLabel": "View Hammond & Carmack Data"
                }
            ],
            "primaryCitations": [
                {
                    "id": "awakenings-report-1994",
                    "title": "Awakenings: A Survey of Men Circumcised in Infancy or Childhood",
                    "authors": "Tim Hammond (NOHARMM)",
                    "year": "1994",
                    "provenance": "UMass MS 1205: NOHARMM / Survey Records (Box 4)",
                    "badge": "Foundational Survey",
                    "quote": "The first systematic empirical investigation into circumcision harm, revealing pervasive feelings of violation, loss of sensitivity, and physical complications.",
                    "link": "/library/1994-awakenings-full-report"
                },
                {
                    "id": "hammond-carmack-2017",
                    "title": "Long-Term Adverse Outcomes from Neonatal Circumcision",
                    "authors": "Tim Hammond & Dr. Angela Carmack",
                    "year": "2017",
                    "provenance": "Global Pediatric Health, 4: 1-13",
                    "badge": "Peer-Reviewed Study",
                    "quote": "Statistical evidence connecting early cutting with adult meatal strictures, diminished biomechanics, and post-traumatic resentment.",
                    "link": "/library"
                }
            ]
        },
        {
            "id": "chapter-8",
            "number": 8,
            "roman": "VIII",
            "start": 148482,
            "end": 175108,
            "title": "The Intactivist Uprising",
            "subtitle": "Strategies for a Genital Revolution",
            "historicalEra": "1985–Present Movement History",
            "synopsis": "The chronicle of the modern genital autonomy revolution: Marilyn Milos founding NOCIRC in 1985, Tim Hammond launching NOHARMM in 1992, international legal symposia, and grassroots street demonstrations.",
            "readingTime": "16 min",
            "themeColor": "#3b82f6", # Blue
            "evidenceExhibits": [
                {
                    "title": "NOHARMM Founding Archive & Action Bulletins (1992–1998)",
                    "badge": "Movement Artifact",
                    "provenance": "UMass MS 1205, Series 1: NOHARMM Records (Box 1–2)",
                    "quote": "Original typewritten newsletters, protest strategies, and telephone hotline records that forged the modern genital autonomy movement.",
                    "link": "/collections/tim-hammond-archive",
                    "actionLabel": "Explore NOHARMM Archives"
                },
                {
                    "title": "PBS Broadcast Documentary: Whose Body, Whose Rights? (2001)",
                    "badge": "Archival Film Master",
                    "provenance": "Tim Hammond Papers, Audio-Visual Series",
                    "quote": "The groundbreaking broadcast documentary directed by Tim Hammond bringing medical ethics and survivor testimonies to millions of viewers.",
                    "link": "/collections/tim-hammond-archive",
                    "actionLabel": "View Documentary Master Dossier"
                }
            ],
            "primaryCitations": [
                {
                    "id": "noharmm-founding-newsletters",
                    "title": "NOHARMM Founding Newsletters & Action Bulletins",
                    "authors": "Tim Hammond, Co-Founder",
                    "year": "1992–1998",
                    "provenance": "UMass MS 1205, Series 1: NOHARMM Records (Box 1–2)",
                    "badge": "Movement Artifact",
                    "quote": "Grassroots bulletins establishing the support network for restoring men and creating the language of bodily integrity.",
                    "link": "/collections/tim-hammond-archive"
                },
                {
                    "id": "whose-body-documentary",
                    "title": "Whose Body, Whose Rights? (Archival Master & Screenplay)",
                    "authors": "Tim Hammond (Producer)",
                    "year": "2001",
                    "provenance": "UMass MS 1205: Audio-Visual Series",
                    "badge": "Archival Film",
                    "quote": "Landmark documentary broadcast on PBS affiliates examining human rights, legal perspectives, and testimonies from intact and circumcised men.",
                    "link": "/collections/tim-hammond-archive"
                }
            ]
        },
        {
            "id": "chapter-9",
            "number": 9,
            "roman": "IX",
            "start": 175108,
            "end": 193491,
            "title": "Reclaiming Our Birthright",
            "subtitle": "A Future of Integrity",
            "historicalEra": "Current Legal & Policy Frontier",
            "synopsis": "Moving from educational advocacy to systematic legal revolution: Equal Protection challenges under the 14th Amendment, eliminating Medicaid subsidies for non-therapeutic cutting, and asserting children's self-determination.",
            "readingTime": "12 min",
            "themeColor": "#14b8a6", # Teal
            "evidenceExhibits": [
                {
                    "title": "Oregon ORS 163.207 Statutory Disparity Analysis",
                    "badge": "Legal Brief",
                    "provenance": "Children's Health & Human Rights Partnership",
                    "quote": "Exposing the constitutional vulnerability of state statutes that treat non-consensual female cutting as felony child abuse while shielding male cutting under commercial medicaid codes.",
                    "link": "/to/hadachek_v_oregon",
                    "actionLabel": "Examine Statutory Analysis"
                },
                {
                    "title": "Huff v. Colorado (Denver District Court, 2026)",
                    "badge": "Equal Rights Litigation",
                    "provenance": "Denver District Court (Case No. 2026CV32110) / Intact Global",
                    "quote": "Seeking a judicial declaration that Colorado's anti-FGC statute (CRS § 18-6-401) violates the Colorado Equal Rights Amendment by denying male children equal protection from non-therapeutic genital cutting.",
                    "link": "/to/huff_v_colorado",
                    "actionLabel": "Explore Huff v. Colorado Guide"
                }
            ],
            "primaryCitations": [
                {
                    "id": "statutory-disparity-matrix",
                    "title": "Oregon ORS 163.207 Disparity Analysis Brief",
                    "authors": "GALDEF & Children's Health & Human Rights Partnership",
                    "year": "2025",
                    "provenance": "Oregon Courtroom Brief Series",
                    "badge": "Legal Brief",
                    "quote": "Under Oregon law, piercing the skin of a minor child is felony assault—unless the knife cuts a newborn boy's genitals in an obstetric ward.",
                    "link": "/to/hadachek_v_oregon"
                },
                {
                    "id": "huff-colorado-2026",
                    "title": "Huff v. Colorado - Colorado Equal Protection Complaint",
                    "authors": "Tristan Huff & Adam Schwartz (Intact Global Legal Team)",
                    "year": "2026",
                    "provenance": "Denver District Court, Case No. 2026CV32110",
                    "badge": "State ERA Action",
                    "quote": "Challenging CRS § 18-6-401(1)(b) under Article II, Section 29 of the Colorado Constitution to secure universal bodily autonomy for all children.",
                    "link": "/to/huff_v_colorado"
                }
            ]
        },
        {
            "id": "chapter-10",
            "number": 10,
            "roman": "X",
            "start": 193491,
            "end": 208197,
            "title": "Transcending the Glitch",
            "subtitle": "From Accidental Anthropologist to Intentional Intactivist",
            "historicalEra": "The Horizon of Bodily Autonomy",
            "synopsis": "The author's concluding charge: transforming grief into resolute action, championing regenerative medicine (Foregen), and uniting researchers, parents, and survivors to permanently end infant genital cutting.",
            "readingTime": "14 min",
            "themeColor": "#f59e0b", # Amber
            "evidenceExhibits": [
                {
                    "title": "Foregen Decellularized Matrix & Innervation Regeneration Prospectus",
                    "badge": "Regenerative Science",
                    "provenance": "Foregen Scientific Advisory Board",
                    "quote": "Developing acellular biological scaffolds to regrow vascularized, fully innervated preputial tissue with complete histological integrity.",
                    "link": "/to/foregen",
                    "actionLabel": "Explore Foregen Science"
                },
                {
                    "title": "Tone Pettit: The Accidental Intactivist's Final Injunction",
                    "badge": "Manifesto Injunction",
                    "provenance": "The Accidental Intactivist Publishing Hub (2025)",
                    "quote": "'You cannot un-see the transparent monster. The question is no longer whether history will condemn this practice—the question is what part you will play in bringing its end.'",
                    "link": "/manifesto",
                    "actionLabel": "Read Injunction"
                }
            ],
            "primaryCitations": [
                {
                    "id": "foregen-tissue-scaffold",
                    "title": "Decellularized Dermal Matrix & Nerve Regrowth Prospectus",
                    "authors": "Foregen Scientific Advisory Board",
                    "year": "2024",
                    "provenance": "Regenerative Medicine Research Archives",
                    "badge": "Regenerative Science",
                    "quote": "Engineering biological extracellular matrix scaffolds to revascularize and restore specialized preputial innervation.",
                    "link": "/to/foregen"
                },
                {
                    "id": "manifesto-master-concluding",
                    "title": "The Accidental Intactivist's Final Injunction",
                    "authors": "Tone Pettit",
                    "year": "2025",
                    "provenance": "The Accidental Intactivist Publishing Hub",
                    "badge": "Manifesto Injunction",
                    "quote": "'You cannot un-see the transparent monster. The question is no longer whether history will condemn this practice—the question is what part you will play in bringing its end.'",
                    "link": "/manifesto"
                }
            ]
        }
    ]

    manifesto_data = {
        "title": "The Accidental Intactivist Manifesto: Exposing the Monster We Agree Not to See",
        "author": "Tone Pettit",
        "edition": "Interactive Archival Edition with Tim Hammond Corpus Citations",
        "year": "2025",
        "totalChapters": 10,
        "totalWordCount": len(body_text.split()),
        "totalCitations": sum(len(c["primaryCitations"]) for c in chapter_defs),
        "totalEvidenceArtifacts": sum(len(c["evidenceExhibits"]) for c in chapter_defs),
        "chapters": []
    }

    total_paras = 0
    total_sections = 0

    for ch_def in chapter_defs:
        ch_slice = body_text[ch_def["start"]:ch_def["end"]]
        sections = parse_chapter_slice(ch_slice, default_heading=f"{ch_def['roman']}. {ch_def['title']}")
        
        p_count = sum(len(s["paragraphs"]) for s in sections)
        total_paras += p_count
        total_sections += len(sections)

        chapter_entry = {
            "id": ch_def["id"],
            "number": ch_def["number"],
            "roman": ch_def["roman"],
            "title": ch_def["title"],
            "subtitle": ch_def["subtitle"],
            "historicalEra": ch_def["historicalEra"],
            "synopsis": ch_def["synopsis"],
            "readingTime": ch_def["readingTime"],
            "themeColor": ch_def["themeColor"],
            "evidenceExhibits": ch_def["evidenceExhibits"],
            "primaryCitations": ch_def["primaryCitations"],
            "sections": sections
        }
        manifesto_data["chapters"].append(chapter_entry)

    # Parse Section XI (Resources, Organizations, Books, Documentaries)
    sec_xi_slice = body_text[208197:]
    sec_xi_sections = parse_chapter_slice(sec_xi_slice, default_heading="XI. Resources for Further Exploration, Support, and Action")
    manifesto_data["resourcesCompendium"] = {
        "title": "Section XI: Resources for Further Exploration, Support, and Action",
        "subtitle": "Archival Organizations, Documentaries, Foundational Literature & Legal Defense",
        "sections": sec_xi_sections
    }

    # Write out JSON
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(manifesto_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {out_path}!")
    print(f"Parsed {len(manifesto_data['chapters'])} chapters, {total_sections} sections, {total_paras} paragraphs.")
    print(f"Plus Section XI compendium with {len(sec_xi_sections)} sections and {sum(len(s['paragraphs']) for s in sec_xi_sections)} paragraphs.")

if __name__ == "__main__":
    main()
