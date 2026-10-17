import zipfile
import re
import os
import shutil
import json
import pymupdf  # fitz

ZIP_PATH = 'raw_content/wetransfer_article-downloads-folder_2026-09-15_2250.zip'
OUT_DOCS_DIR = 'public/documents'
os.makedirs(OUT_DOCS_DIR, exist_ok=True)

# Curated priority seeds with clean metadata overrides
CORE_PAPERS = [
    {
        'pattern': 'taylor-lockwood prepuce specmucosa',
        'id': 'taylor-lockwood-1996-prepuce-specialized-mucosa',
        'clean_file': 'taylor-lockwood-1996-prepuce-specialized-mucosa.pdf',
        'title': 'The prepuce: specialized mucosa of the penis and its loss to circumcision',
        'author': 'J.R. Taylor, A.P. Lockwood, and A.J. Taylor',
        'year': '1996',
        'category': 'Clinical Anatomy',
        'type': 'medical_journal',
        'journal': 'British Journal of Urology',
        'abstract': 'Historic histological study describing the specialized ridged band mucosa of the prepuce, containing dense Meissner corpuscle innervation and mucocutaneous junction tissue lost to circumcision.',
        'priority': 200
    },
    {
        'pattern': 'sorrells fine touch bjui 2007',
        'id': 'sorrells-2007-fine-touch-tactile-thresholds',
        'clean_file': 'sorrells-2007-fine-touch-tactile-thresholds.pdf',
        'title': 'Fine-touch pressure thresholds in the adult penis',
        'author': 'Morris L. Sorrells, M.D. et al.',
        'year': '2007',
        'category': 'Sensory Histology',
        'type': 'medical_journal',
        'journal': 'BJU International',
        'abstract': 'Rigorous sensory threshold testing using Semmes-Weinstein monofilaments across 19 penile sites proving that the prepuce is the most sensitive portion of the intact adult penis.',
        'priority': 200
    },
    {
        'pattern': 'cold taylor prepuce bju 1999',
        'id': 'cold-taylor-1999-the-prepuce',
        'clean_file': 'cold-taylor-1999-the-prepuce.pdf',
        'title': 'The prepuce: anatomy, histology and immunology',
        'author': 'C.J. Cold and J.R. Taylor',
        'year': '1999',
        'category': 'Clinical Anatomy',
        'type': 'medical_journal',
        'journal': 'BJU International',
        'abstract': 'Comprehensive histological and immunological review of the human prepuce, detailing vascular architecture, Dartos musculature, and mucosal defense mechanisms.',
        'priority': 190
    },
    {
        'pattern': 'frisch cultural bias 2012 aap peds 2013',
        'id': 'frisch-2013-cultural-bias-aap-pediatrics',
        'clean_file': 'frisch-2013-cultural-bias-aap-pediatrics.pdf',
        'title': "Cultural bias in the AAP's 2012 Technical Report and Policy Statement on male circumcision",
        'author': 'Morten Frisch, M.D., Ph.D. et al. (38 European Co-Authors)',
        'year': '2013',
        'category': 'Pediatric Policy & Ethics',
        'type': 'medical_journal',
        'journal': 'Pediatrics',
        'abstract': 'International rebuttal authored by 38 pediatric society leaders and ethicists across 16 countries demonstrating cultural bias, selective literature citations, and ethical flaws in the AAP 2012 policy.',
        'priority': 200
    },
    {
        'pattern': 'fendereski compare penile problems',
        'id': 'fendereski-2024-penile-problems-circumcised-boys',
        'clean_file': 'fendereski-2024-penile-problems-circumcised-boys.pdf',
        'title': 'Comparing Penile Problems in Circumcised vs. Uncircumcised Boys: Insights From a Large Commercial Claims Database',
        'author': 'Kamyar Fendereski et al.',
        'year': '2024',
        'category': 'Pediatric Epidemiology',
        'type': 'medical_journal',
        'journal': 'Journal of Pediatric Surgery',
        'abstract': 'Cohort study of 1.7 million boys through age 5 demonstrating that circumcised boys experience a 2.9-fold higher incidence of penile complications (meatal stenosis, stricture, adhesions) than intact boys.',
        'priority': 200
    },
    {
        'pattern': 'hammond sardi foreskin-restorers-abridged',
        'id': 'hammond-sardi-2023-foreskin-restorers',
        'clean_file': 'hammond-sardi-2023-foreskin-restorers.pdf',
        'title': 'Foreskin Restorers Study: Empirical Investigation into Outcomes, Somatic Relief, and Sensitivity Gains',
        'author': 'Tim Hammond and Lauren M. Sardi, Ph.D.',
        'year': '2023',
        'category': "Men's Health Research",
        'type': 'medical_journal',
        'journal': 'International Journal of Impotence Research',
        'abstract': 'Landmark empirical investigation of men undergoing non-surgical foreskin restoration, documenting significant gains in subjective sensitivity, emotional healing, and sexual satisfaction.',
        'priority': 200
    },
    {
        'pattern': 'hammond-carmack long term adverse outcomes',
        'id': 'hammond-carmack-2017-global-survey-circumcision-harm',
        'clean_file': 'hammond-carmack-2017-global-survey-circumcision-harm.pdf',
        'title': 'Long-term adverse outcomes from neonatal circumcision reported in a survey of 1,008 men',
        'author': 'Tim Hammond and Adrienne Carmack, M.D.',
        'year': '2017',
        'category': 'Human Rights in Healthcare',
        'type': 'medical_journal',
        'journal': 'International Journal of Human Rights in Healthcare',
        'abstract': 'Findings from the Global Survey of Circumcision Harm (GSCH) surveying 1,008 men regarding physical, sexual, and psychological trauma attributed to neonatal circumcision.',
        'priority': 200
    },
    {
        'pattern': 'milos-denniston-demeo_sexualmutilations',
        'id': 'milos-denniston-demeo-1997-sexual-mutilations',
        'clean_file': 'milos-denniston-demeo-1997-sexual-mutilations.pdf',
        'title': 'Sexual Mutilations: A Human Tragedy (Proceedings of the 4th International Symposium)',
        'author': 'George C. Denniston, Marilyn Fayre Milos, and James DeMeo (Eds.)',
        'year': '1997',
        'category': 'Human Rights & Symposia',
        'type': 'book',
        'journal': 'Plenum Press / Springer',
        'abstract': 'Seminal 300+ page academic compilation of medical, legal, psychological, and anthropological treatises presented at the 4th International Symposium on Circumcision in Lausanne, Switzerland.',
        'priority': 190
    },
    {
        'pattern': 'anand pain in infants nejm1987',
        'id': 'anand-hickey-1987-pain-in-infants-nejm',
        'clean_file': 'anand-hickey-1987-pain-in-infants-nejm.pdf',
        'title': 'Pain and its effects in the human neonate and fetus',
        'author': 'K.J.S. Anand, M.B., D.Phil., and P.R. Hickey, M.D.',
        'year': '1987',
        'category': 'Neonatal Pain & Neurobiology',
        'type': 'medical_journal',
        'journal': 'New England Journal of Medicine',
        'abstract': 'The watershed paper that revolutionized neonatology by conclusively proving that human neonates feel intense pain and suffer lasting endocrine and neurological stress responses from infant surgery.',
        'priority': 200
    },
    {
        'pattern': 'goldman psych impact bjui 1999',
        'id': 'goldman-1999-psychological-impact-circumcision',
        'clean_file': 'goldman-1999-psychological-impact-circumcision.pdf',
        'title': 'The psychological impact of circumcision',
        'author': 'Ronald Goldman, Ph.D.',
        'year': '1999',
        'category': 'Trauma Psychology',
        'type': 'medical_journal',
        'journal': 'BJU International',
        'abstract': 'Clinical investigation detailing behavioral changes, post-traumatic stress symptoms, somatic anger, and psychological sequelae resulting from non-consensual infant circumcision.',
        'priority': 190
    },
    {
        'pattern': 'fletcher circ in america physician attitudes plenum 1999',
        'id': 'fletcher-milos-1999-circumcision-in-america',
        'clean_file': 'fletcher-milos-1999-circumcision-in-america.pdf',
        'title': 'Circumcision in America in 1998: Attitudes, Beliefs and Charges',
        'author': 'John E. Fletcher, Ph.D., Marilyn Fayre Milos, R.N., et al.',
        'year': '1999',
        'category': 'Physician Survey & Institutional Economics',
        'type': 'medical_journal',
        'journal': 'Plenum Press',
        'abstract': 'Comprehensive national survey of obstetricians and pediatricians documenting financial incentives, knowledge gaps regarding foreskin histology, and physician attitudes towards infant circumcision.',
        'priority': 190
    },
    {
        'pattern': 'boyle svoboda circ criminal assualt jlm 2000',
        'id': 'boyle-svoboda-2000-circumcision-criminal-assault',
        'clean_file': 'boyle-svoboda-2000-circumcision-criminal-assault.pdf',
        'title': 'Male Circumcision: A Criminal Assault?',
        'author': 'Gregory J. Boyle, J. Steven Svoboda, Christopher P. Price, and Jennifer Turner',
        'year': '2000',
        'category': 'Jurisprudence & Criminal Law',
        'type': 'legal_document',
        'journal': 'Journal of Law and Medicine',
        'abstract': 'Exhaustive common law analysis arguing that non-therapeutic neonatal circumcision satisfies the legal elements of criminal battery and assault because third-party parental proxy consent is legally invalid for healthy tissue excision.',
        'priority': 180
    },
    {
        'pattern': 'darby svoboda rose other name medanthrqtrly 2007',
        'id': 'darby-svoboda-2007-a-rose-by-any-other-name',
        'clean_file': 'darby-svoboda-2007-a-rose-by-any-other-name.pdf',
        'title': 'A Rose by Any Other Name? Rethinking the Similarities and Differences between Male and Female Genital Cutting',
        'author': 'Robert Darby, Ph.D., and J. Steven Svoboda, J.D.',
        'year': '2007',
        'category': 'Medical Anthropology & Bioethics',
        'type': 'medical_journal',
        'journal': 'Medical Anthropology Quarterly',
        'abstract': 'Critical comparison demonstrating that the cultural justifications, medical rationalizations, and ethical dimensions of male and female genital cutting share near-identical rhetoric.',
        'priority': 180
    },
    {
        'pattern': 'aap 2012 circ policy expired',
        'id': 'aap-2012-circumcision-policy-statement',
        'clean_file': 'aap-2012-circumcision-policy-statement.pdf',
        'title': 'AAP Circumcision Policy Statement (2012, Expired 2017)',
        'author': 'AAP Task Force on Circumcision (Susan Blank, M.D., Chair)',
        'year': '2012',
        'category': 'Medical Policy',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': 'Official 2012 AAP Policy Statement stating preventive benefits justify third-party insurance coverage, but explicitly noting benefits are not sufficient to recommend routine universal newborn surgery.',
        'priority': 180
    },
    {
        'pattern': 'aap 2012 circ tech report expired',
        'id': 'aap-2012-circumcision-technical-report',
        'clean_file': 'aap-2012-circumcision-technical-report.pdf',
        'title': 'AAP Circumcision Technical Report (2012, Expired 2017)',
        'author': 'AAP Task Force on Circumcision',
        'year': '2012',
        'category': 'Medical Policy',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': 'The comprehensive technical evidence review accompanying the 2012 AAP Policy Statement, heavily scrutinized for omitting foreskin anatomical innervation.',
        'priority': 180
    },
    {
        'pattern': 'aap 2010 fgm proposal.pdf',
        'id': 'aap-2010-fgm-ritual-nick-proposal',
        'clean_file': 'aap-2010-fgm-ritual-nick-proposal.pdf',
        'title': 'Policy Statement: Ritual Genital Cutting of Female Minors (Retracted 2010 Proposal)',
        'author': 'AAP Committee on Bioethics',
        'year': '2010',
        'category': 'Medical Policy & Ethics',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': 'Controversial 2010 AAP Bioethics proposal suggesting pediatricians be permitted to perform a ritual "nick" on female minors to accommodate cultural traditions, retracted following universal international outrage.',
        'priority': 180
    },
    {
        'pattern': 'aap 1999 circ_policy',
        'id': 'aap-1999-circumcision-policy-statement',
        'clean_file': 'aap-1999-circumcision-policy-statement.pdf',
        'title': 'AAP Circumcision Policy Statement (1999)',
        'author': 'AAP Task Force on Circumcision (Carole Lannon, M.D., Chair)',
        'year': '1999',
        'category': 'Medical Policy',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': '1999 AAP Policy concluding that available scientific evidence was not sufficient to recommend routine neonatal circumcision.',
        'priority': 170
    },
    {
        'pattern': 'aap 1989 circ policy.pdf',
        'id': 'aap-1989-circumcision-policy-statement',
        'clean_file': 'aap-1989-circumcision-policy-statement.pdf',
        'title': 'Report of the Task Force on Circumcision (1989)',
        'author': 'AAP Task Force on Circumcision (Edgar J. Schoen, M.D., Chair)',
        'year': '1989',
        'category': 'Medical Policy',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': 'The 1989 AAP policy that softened the previous 1975 opposition by stating that newborn circumcision has potential medical benefits, chaired by Edgar Schoen.',
        'priority': 170
    },
    {
        'pattern': 'aap 1975 circ policy',
        'id': 'aap-1975-ad-hoc-task-force-policy',
        'clean_file': 'aap-1975-ad-hoc-task-force-policy.pdf',
        'title': 'Report of the Ad Hoc Task Force on Circumcision (1975)',
        'author': 'AAP Ad Hoc Task Force on Circumcision',
        'year': '1975',
        'category': 'Medical Policy',
        'type': 'policy_guideline',
        'journal': 'Pediatrics',
        'abstract': 'Historic statement reiterating that there is no absolute medical indication for the routine circumcision of the newborn.',
        'priority': 170
    },
    {
        'pattern': 'wallerstein uniquely american urolclinna 1985',
        'id': 'wallerstein-1985-circumcision-uniquely-american-enigma',
        'clean_file': 'wallerstein-1985-circumcision-uniquely-american-enigma.pdf',
        'title': 'Circumcision: The Uniquely American Enigma',
        'author': 'Edward Wallerstein',
        'year': '1985',
        'category': 'History of Medicine',
        'type': 'medical_journal',
        'journal': 'Urologic Clinics of North America',
        'abstract': 'Pioneering analysis exploring why the United States became the only nation in the developed world to adopt mass non-religious infant circumcision.',
        'priority': 170
    },
    {
        'pattern': 'adler lawful-medicaid-circumcision jlm 2011',
        'id': 'adler-2011-is-circumcision-lawful-under-medicaid',
        'clean_file': 'adler-2011-is-circumcision-lawful-under-medicaid.pdf',
        'title': 'Is Circumcision Lawful Under Medicaid?',
        'author': 'Peter W. Adler, J.D.',
        'year': '2011',
        'category': 'Constitutional Law & Healthcare Finance',
        'type': 'legal_document',
        'journal': 'Journal of Law and Medicine',
        'abstract': 'Legal treatise examining state and federal Medicaid statutes, demonstrating that taxpayer reimbursement of elective non-therapeutic infant surgery violates statutory medical necessity requirements.',
        'priority': 170
    },
    {
        'pattern': 'adler circumcision fraud cornelllaw',
        'id': 'adler-2020-circumcision-fraud-consumer-protection',
        'clean_file': 'adler-2020-circumcision-fraud-consumer-protection.pdf',
        'title': 'Circumcision, Informed Consent, and Consumer Fraud',
        'author': 'Peter W. Adler, J.D.',
        'year': '2020',
        'category': 'Consumer Protection & Tort Law',
        'type': 'legal_document',
        'journal': 'Cornell Journal of Law and Public Policy',
        'abstract': 'Detailed analysis demonstrating how hospital disclosure practices and deceptive promotional materials fail common-law informed consent standards and trigger consumer fraud liability.',
        'priority': 170
    },
    {
        'pattern': 'abara prepuce health canada can urol assoc 2017',
        'id': 'abara-2017-prepuce-health-canadian-urology',
        'clean_file': 'abara-2017-prepuce-health-canadian-urology.pdf',
        'title': 'Prepuce health and conservative management: Canadian Urological Association perspectives',
        'author': 'E.O. Abara et al.',
        'year': '2017',
        'category': 'Clinical Guidelines',
        'type': 'medical_journal',
        'journal': 'Canadian Urological Association Journal',
        'abstract': 'Guidance establishing conservative, non-surgical approaches as the standard of care for preputial development and physiologic adhesion resolution.',
        'priority': 160
    },
    {
        'pattern': 'griffiths foreskin restoration 1980-2008 springer 2010',
        'id': 'griffiths-2010-foreskin-restoration-springer',
        'clean_file': 'griffiths-2010-foreskin-restoration-springer.pdf',
        'title': 'Foreskin Restoration 1980-2008: A Three-Decade Retrospective',
        'author': 'David J. Griffiths, Ph.D.',
        'year': '2010',
        'category': 'Restoration & Somatics',
        'type': 'book_chapter',
        'journal': 'Springer',
        'abstract': 'A 30-year retrospective examining the engineering mechanics, tissue expansion protocols, and clinical outcomes of non-surgical foreskin restoration.',
        'priority': 160
    }
]

def sanitize_slug(text):
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', text).lower()
    return re.sub(r'[\s_]+', '-', s).strip('-')

def extract_pdf_data(pdf_bytes, max_pages=25):
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)
    text = ""
    for i in range(min(page_count, max_pages)):
        text += doc[i].get_text() + "\n\n"
    
    # Try reading metadata
    meta = doc.metadata or {}
    return {
        'page_count': page_count,
        'extracted_text': text.strip(),
        'pdf_meta': meta
    }

def main():
    print("Reading master archive zip...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        all_zip_names = [n for n in z.namelist() if n.lower().endswith('.pdf')]
        
    print(f"Total PDFs in zip: {len(all_zip_names)}")
    
    ingested_records = []
    used_zip_paths = set()
    
    # 1. Process Core Seeds
    print("\n--- Processing Core Papers ---")
    for seed in CORE_PAPERS:
        pattern = seed['pattern'].lower()
        match = None
        for n in all_zip_names:
            if pattern in n.lower():
                match = n
                break
        
        if match:
            used_zip_paths.add(match)
            out_file = seed['clean_file']
            out_path = os.path.join(OUT_DOCS_DIR, out_file)
            
            with zipfile.ZipFile(ZIP_PATH, 'r') as z:
                pdf_bytes = z.read(match)
                with open(out_path, 'wb') as f:
                    f.write(pdf_bytes)
                    
            pdf_info = extract_pdf_data(pdf_bytes)
            
            rec = {
                'id': seed['id'],
                'title': seed['title'],
                'source_collection': 'The Tim Hammond Genital Autonomy Archive',
                'url': f'/documents/{out_file}',
                'type': seed['type'],
                'status': 'ingested',
                'content': pdf_info['extracted_text'],
                'metadata_json': json.dumps({
                    'title': seed['title'],
                    'author': seed['author'],
                    'date': seed['year'],
                    'category': seed['category'],
                    'journal': seed.get('journal', ''),
                    'page_count': pdf_info['page_count'],
                    'abstract': seed['abstract'],
                    'curated_seed': True
                }),
                'created_at': '2026-10-16T17:15:00Z',
                'series': seed['category']
            }
            ingested_records.append(rec)
            print(f"Ingested Core: {seed['id']} ({pdf_info['page_count']} pages)")
        else:
            print(f"WARNING: Seed pattern '{seed['pattern']}' not found in zip!")

    # 2. Add local workspace documents
    print("\n--- Processing Local Workspace Documents ---")
    local_docs = [
        {
            'path': 'Huff v. Colorado Complaint - Equal Protection Challenge (Conformed) - For Press.pdf',
            'id': 'huff-v-colorado-2024-civil-rights-complaint',
            'clean_file': '2024-huff-v-colorado-civil-rights-complaint.pdf',
            'title': 'Huff v. State of Colorado: Civil Rights Complaint (Equal Protection Clause Challenge to Routine Infant Circumcision)',
            'author': 'Tristan Huff, Adam Schwartz, and Counsel',
            'year': '2024',
            'category': 'Constitutional Law',
            'type': 'legal_document',
            'journal': 'United States District Court for the District of Colorado',
            'abstract': 'Historic federal civil rights complaint asserting that Colorado state Medicaid funding and statutory exemptions for routine infant male circumcision violate the Equal Protection Clause of the Fourteenth Amendment.'
        },
        {
            'path': 'raw_content/Cepeda‐Emiliani - The sensory penis Andrology 2025.pdf',
            'id': 'cepeda-emiliani-2025-sensory-penis-andrology',
            'clean_file': 'cepeda-emiliani-2025-sensory-penis-andrology.pdf',
            'title': 'The sensory penis: Neurohistological mapping of mechanoreceptors and free nerve endings in the human prepuce',
            'author': 'Dr. Cepeda-Emiliani et al.',
            'year': '2025',
            'category': 'Clinical Anatomy',
            'type': 'medical_journal',
            'journal': 'Andrology',
            'abstract': '2025 state-of-the-art immunohistochemical investigation documenting the density, morphology, and distribution of sensory corpuscles across the prepuce and frenular band.'
        },
        {
            'path': "The Accidental Intactivist's Inquiry - Phase 1 Findings.pdf",
            'id': 'accidental-intactivist-inquiry-phase-1-findings',
            'clean_file': 'accidental-intactivist-inquiry-phase-1-findings.pdf',
            'title': "The Accidental Intactivist's Inquiry: Phase 1 Empirical Findings & Pleasure Gap Analysis",
            'author': 'Tone Pettit',
            'year': '2025',
            'category': "Men's Health Research",
            'type': 'empirical_survey',
            'journal': 'CircumSurvey Research Platform',
            'abstract': 'Phase 1 empirical microdata from CircumSurvey mapping sexual outcomes, the cultural pleasure gap, erectile mechanics, and reasons for restoration.'
        }
    ]
    
    for ldoc in local_docs:
        if os.path.exists(ldoc['path']) and os.path.getsize(ldoc['path']) > 1000:
            out_file = ldoc['clean_file']
            out_path = os.path.join(OUT_DOCS_DIR, out_file)
            shutil.copy2(ldoc['path'], out_path)
            
            with open(out_path, 'rb') as f:
                pdf_bytes = f.read()
            pdf_info = extract_pdf_data(pdf_bytes)
            
            rec = {
                'id': ldoc['id'],
                'title': ldoc['title'],
                'source_collection': 'The Tim Hammond Genital Autonomy Archive',
                'url': f'/documents/{out_file}',
                'type': ldoc['type'],
                'status': 'ingested',
                'content': pdf_info['extracted_text'],
                'metadata_json': json.dumps({
                    'title': ldoc['title'],
                    'author': ldoc['author'],
                    'date': ldoc['year'],
                    'category': ldoc['category'],
                    'journal': ldoc.get('journal', ''),
                    'page_count': pdf_info['page_count'],
                    'abstract': ldoc['abstract'],
                    'curated_seed': True
                }),
                'created_at': '2026-10-16T17:15:00Z',
                'series': ldoc['category']
            }
            ingested_records.append(rec)
            print(f"Ingested Local: {ldoc['id']} ({pdf_info['page_count']} pages)")

    # 3. Score and ingest remaining high-value papers up to 105 total
    print("\n--- Selecting and Ingesting Additional High-Impact Papers ---")
    
    scored_candidates = []
    
    high_value_keywords = [
        ('frisch', 40), ('vanhowe', 40), ('van howe', 40), ('earp', 40), ('darby', 35),
        ('svoboda', 35), ('hammond', 45), ('milos', 35), ('goldman', 35), ('anand', 35),
        ('fendereski', 35), ('boyle', 30), ('adler', 30), ('taylor', 30), ('sorrells', 30),
        ('cepeda', 30), ('sardi', 30), ('carmack', 30), ('prepuce', 25), ('innervation', 25),
        ('pain', 25), ('trauma', 25), ('ethics', 20), ('policy', 20), ('bjui', 25), ('bju', 25),
        ('pediatrics', 25), ('peds', 25), ('medicaid', 25), ('human rights', 25),
        ('consent', 25), ('restoration', 25), ('foreskin', 20), ('complications', 20),
        ('singh-grewal', 25), ('el bcheraoui', 25), ('el-bcheraoui', 25), ('weiss', 25),
        ('wawer', 25), ('fleiss', 25), ('wallerstein', 25), ('aldeeb', 25), ('knmg', 25),
        ('racp', 25), ('canad', 25), ('bma', 25), ('goksan', 25), ('bellieni', 25),
        ('bollinger', 25), ('taddio', 25)
    ]
    
    for f in all_zip_names:
        if f in used_zip_paths:
            continue
        clean_lower = f.lower()
        score = 0
        for kw, pts in high_value_keywords:
            if kw in clean_lower:
                score += pts
                
        # Deduplication filter: avoid near duplicate filenames
        base = os.path.basename(f)
        scored_candidates.append((score, f, base))
        
    scored_candidates.sort(key=lambda x: -x[0])
    
    target_count = 105
    needed = target_count - len(ingested_records)
    print(f"Ingested so far: {len(ingested_records)}. Need {needed} more to reach {target_count}.")
    
    seen_bases = set()
    added_count = 0
    
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        for score, zip_path, base in scored_candidates:
            if added_count >= needed:
                break
                
            # Filter out near duplicates
            norm_key = re.sub(r'[^a-z0-9]', '', base.lower())[:25]
            if norm_key in seen_bases:
                continue
            seen_bases.add(norm_key)
            
            clean_name = base.replace('.pdf', '')
            slug = sanitize_slug(clean_name)[:65]
            clean_filename = f"{slug}.pdf"
            out_path = os.path.join(OUT_DOCS_DIR, clean_filename)
            
            try:
                pdf_bytes = z.read(zip_path)
                with open(out_path, 'wb') as out_f:
                    out_f.write(pdf_bytes)
                    
                pdf_info = extract_pdf_data(pdf_bytes, max_pages=15)
                
                # Deduce clean title and author
                title_guess = base.replace('.pdf', '').replace('_', ' ')
                author_guess = "Archival Contributor"
                m_year = re.search(r'\b(19\d\d|20\d\d)\b', base)
                year_guess = m_year.group(1) if m_year else "1998"
                
                parts = re.split(r'[-–_]', title_guess)
                if len(parts) >= 2 and len(parts[0].strip()) < 30:
                    author_guess = parts[0].strip()
                    title_guess = ' '.join(parts[1:]).strip()
                    
                doc_record = {
                    'id': slug,
                    'title': title_guess,
                    'source_collection': 'The Tim Hammond Genital Autonomy Archive',
                    'url': f'/documents/{clean_filename}',
                    'type': 'medical_journal' if 'bju' in clean_lower or 'ped' in clean_lower else 'archival_document',
                    'status': 'ingested',
                    'content': pdf_info['extracted_text'],
                    'metadata_json': json.dumps({
                        'title': title_guess,
                        'author': author_guess,
                        'date': year_guess,
                        'category': 'Genital Autonomy Canon',
                        'page_count': pdf_info['page_count'],
                        'abstract': pdf_info['extracted_text'][:450].replace('\n', ' ') + '...' if pdf_info['extracted_text'] else '',
                        'archive_source': base
                    }),
                    'created_at': '2026-10-16T17:15:00Z',
                    'series': 'Canon Research & Bioethics'
                }
                ingested_records.append(doc_record)
                added_count += 1
                if added_count % 10 == 0 or added_count <= 5:
                    print(f"  [{added_count}/{needed}] Ingested: {slug} ({pdf_info['page_count']}p)")
            except Exception as e:
                print(f"Error extracting {zip_path}: {e}")

    print(f"\nTotal papers successfully processed and ingested: {len(ingested_records)}")
    
    # 4. Update public/api_mock.json
    print("\nUpdating public/api_mock.json...")
    api_mock_path = 'public/api_mock.json'
    with open(api_mock_path, 'r', encoding='utf-8') as f:
        existing_mock = json.load(f)
        
    existing_ids = {d['id'] for d in existing_mock}
    
    new_entries = []
    updated_entries = 0
    for rec in ingested_records:
        if rec['id'] in existing_ids:
            # Update existing
            for i, em in enumerate(existing_mock):
                if em['id'] == rec['id']:
                    existing_mock[i] = rec
                    updated_entries += 1
                    break
        else:
            new_entries.append(rec)
            
    merged_mock = new_entries + existing_mock
    with open(api_mock_path, 'w', encoding='utf-8') as f:
        json.dump(merged_mock, f, indent=2)
    print(f"api_mock.json updated: {len(new_entries)} new entries prepended, {updated_entries} entries updated. Total count: {len(merged_mock)}")

    # 5. Update public/api_collections_tim-hammond-archive_mock.json
    col_mock_path = 'public/api_collections_tim-hammond-archive_mock.json'
    if os.path.exists(col_mock_path):
        print("Updating public/api_collections_tim-hammond-archive_mock.json...")
        with open(col_mock_path, 'r', encoding='utf-8') as f:
            col_data = json.load(f)
            
        is_dict = isinstance(col_data, dict) and 'documents' in col_data
        col_docs = col_data['documents'] if is_dict else col_data
        col_ids = {d['id'] for d in col_docs}
        
        col_new = []
        for rec in ingested_records:
            if rec['id'] not in col_ids:
                col_new.append(rec)
                
        if is_dict:
            col_data['documents'] = col_new + col_docs
            col_data['total'] = len(col_data['documents'])
        else:
            col_data = col_new + col_docs
            
        with open(col_mock_path, 'w', encoding='utf-8') as f:
            json.dump(col_data, f, indent=2)
        print(f"Collection mock updated with {len(col_new)} entries.")

if __name__ == '__main__':
    main()
