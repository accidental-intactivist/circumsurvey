import zipfile
import re
import os
import json

ZIP_PATH = 'raw_content/wetransfer_article-downloads-folder_2026-09-15_2250.zip'

# Canonical high-priority papers and patterns
CORE_SEEDS = [
    # Anatomy & Sensation
    ('taylor-lockwood', 'Taylor, Lockwood & Taylor (1996) The prepuce: specialized mucosa of the penis', 150),
    ('sorrells fine touch', 'Sorrells et al. (2007) Fine-touch pressure thresholds in the adult penis', 150),
    ('cold taylor prepuce', 'Cold & Taylor (1999) The prepuce: anatomy, histology and immunology', 140),
    ('cepeda immunohistol prepuce', 'Cepeda-Emiliani et al. (2022) Immunohistological study of human prepuce', 130),
    ('cepeda-emiliani immunohistological', 'Cepeda-Emiliani (2023) WAS Abstract Prepuce Innervation', 120),
    ('alguacil terminal innervation', 'Alguacil et al. (2014) Terminal innervation of the human male prepuce', 120),
    ('garcia-mesa sensory', 'Garcia-Mesa et al. (2021) Sensory innervation of the human prepuce', 120),
    ('meislahn-taylor sexual reflexes', 'Meislahn & Taylor (2004) Sexual reflexes and the foreskin', 120),

    # Hammond Direct Canon
    ('hammond sardi foreskin-restorers', 'Hammond & Sardi (2023) Foreskin Restorers Study (IJIR)', 150),
    ('hammond-carmack long term', 'Hammond & Carmack (2017) Long-term adverse outcomes (GSCH)', 150),
    ('hammond long_term_consequences_springer', 'Hammond (1997) Long Term Consequences of Circumcision', 140),
    ('hammond circ scar review', 'Hammond (2021) Circumcision Scar Review', 130),
    ('hammond deficiencies-response', 'Hammond (2022) Deficiencies: Response to Tye & Sardi', 120),
    ('tye sardi (hammond response)', 'Tye, Sardi & Hammond (2022) Response on Restorers (IJIR)', 120),
    ('hammond evaluating bailis', 'Hammond (2020) Evaluating Bailis and Morris', 110),
    ('hammond letter re fihman', 'Hammond (2026) Letter re Fihman (JSM)', 110),

    # Infant Pain, Trauma & Psychology
    ('anand pain in infants nejm', 'Anand & Hickey (1987) Pain and Its Effects in the Human Neonate (NEJM)', 150),
    ('goldman psych impact bjui 1999', 'Goldman (1999) Psychological Impact of Circumcision (BJUI)', 150),
    ('goldman circpolicy paedchildhelath', 'Goldman (2004) Circumcision Policy (Paediatr Child Health)', 130),
    ('boyle male circ trauma', 'Boyle (2002) Male Circumcision Trauma (J Health Psychol)', 130),
    ('boyle bensley adverse sex psych', 'Boyle & Bensley (2001) Adverse Sexual & Psychological Effects', 130),
    ('bellieni infant pain ijir 2022', 'Bellieni et al. (2022) Infant Pain (IJIR)', 120),
    ('bollinger normal_vs_cut', 'Bollinger (2014) Normal vs Cut Psychological Consequences', 120),
    ('amsocpainmgmtnursing', 'American Society of Pain Management Nursing (2001) Neonatal Pain Policy', 110),

    # AAP Policy Stack & Whistleblower Critiques
    ('frisch cultural bias 2012 aap peds 2013', 'Frisch et al. (2013) Cultural Bias in AAP 2012 Policy (Pediatrics)', 150),
    ('fendereski compare penile problems', 'Fendereski et al. (2024) Penile Problems in Circumcised Boys (JPedSurg)', 150),
    ('aap 2012 circ policy expired', 'AAP (2012) Circumcision Policy Statement', 140),
    ('aap 2012 circ tech report expired', 'AAP (2012) Circumcision Technical Report', 140),
    ('aap 2010 fgm proposal', 'AAP Bioethics (2010) Ritual Nick Proposal (Retracted)', 140),
    ('aap 2010 fgm policy retired', 'AAP Bioethics (2010) FGM Policy Retired', 130),
    ('aap 1999 circ policy', 'AAP (1999) Circumcision Policy Statement', 140),
    ('aap 1989 circ policy', 'AAP (1989) Circumcision Policy Statement', 130),
    ('aap 1975 circ policy', 'AAP (1975) Ad Hoc Task Force Policy', 130),
    ('aap 1971-1999 circ policies shapiro', 'Shapiro (1999) AAP 1971-1999 Circumcision Policies Analysis', 120),
    ('aap 2012 analysis vanhowe', 'Van Howe (2013) AAP 2012 Policy Analysis', 130),
    ('svoboda vanhowe out of step aap', 'Svoboda & Van Howe (2013) Out of Step: AAP 2012 Policy', 130),
    ('earp aap 2012_report_bad_science', 'Earp (2012) The AAP 2012 Report and Bad Science', 120),
    ('aap 2012 freedman fleshing out', 'Freedman (2012) Fleshing Out Change on Circumcision', 110),
    ('aap 2016 freedman beyond benefits', 'Freedman (2016) Beyond Benefits and Risks (Pediatrics)', 110),

    # Major Symposia, Books & Movement History
    ('milos-denniston-demeo_sexualmutilations', 'Milos, Denniston & DeMeo (1997) Sexual Mutilations: A Human Tragedy (Springer)', 150),
    ('fletcher circ in america physician attitudes plenum 1999', 'Fletcher & Milos (1999) Circumcision in America: Physician Attitudes (Plenum)', 140),
    ('milos-macris circumcision_medical or human rights', 'Milos & Macris (1992) Circumcision: Medical or Human Rights Issue', 130),
    ('milos_dont_be_conned_by_pros', 'Milos (1992) Do Not Be Conned by Pros (Journeymen)', 120),
    ('carmack milos cath without retraction', 'Carmack & Milos (2017) Catheterization Without Retraction', 120),
    ('griffiths current practices foreskin restoration springer 1999', 'Griffiths (1999) Current Practices in Foreskin Restoration (Springer)', 130),
    ('griffiths foreskin restoration 1980-2008 springer 2010', 'Griffiths (2010) Foreskin Restoration 1980-2008 (Springer)', 130),
    ('wallerstein uniquely american urolclinna 1985', 'Wallerstein (1985) Circumcision: The Uniquely American Enigma', 130),

    # Legal, Constitutional & Human Rights
    ('boyle svoboda circ criminal assualt', 'Boyle & Svoboda (2000) Circumcision as Criminal Assault (JLM)', 140),
    ('darby svoboda rose other name', 'Darby & Svoboda (2007) A Rose by Any Other Name (Med Anthropol Q)', 140),
    ('svoboda examine hr constit issues plenum 1997', 'Svoboda (1997) Human Rights and Constitutional Issues (Plenum)', 130),
    ('svoboda educate un circ kluwer 2002', 'Svoboda (2002) Educating the UN on Circumcision (Kluwer)', 130),
    ('svoboda circ hr viol jme 2013', 'Svoboda (2013) Circumcision as Human Rights Violation (JME)', 130),
    ('svoboda adler circ unethical jlawmedeth 2016', 'Svoboda & Adler (2016) Circumcision is Unethical and Unlawful', 130),
    ('adler lawful-medicaid-circumcision', 'Adler (2011) Is Circumcision Lawful Under Medicaid? (JLM)', 130),
    ('adler circumcision fraud cornell', 'Adler (2020) Circumcision and Fraud (Cornell Law & Pub Pol)', 130),
    ('aaron new legal standard for medical malpractice jama 2025', 'Aaron (2025) New Legal Standard for Malpractice (JAMA)', 120),
    ('aldeeb to mutilate jehovah', 'Aldeeb (1994) To Mutilate in the Name of Jehovah (Med Law)', 120),
    ('aldeeb islamic_law_and_male_female', 'Aldeeb (1995) Islamic Law and Male and Female Circumcision', 120),
    ('johnsdotter svoboda sexual pleasure', 'Johnsdotter & Svoboda (2017) Circumcision and Sexual Pleasure', 120),

    # International Guidance & Pediatric Practice
    ('abara prepuce health canada can urol assoc 2017', 'Abara et al. (2017) Prepuce Health (Can Urol Assoc)', 130),
    ('aniaka best interest canada', 'Aniaka (2013) Best Interests of the Male Child (Canada)', 120),
    ('bouclin legeth canada ijmh 2005', 'Bouclin (2005) Legal and Ethical Issues in Circumcision (Canada)', 120),
    ('darby-beentheredonethat austral qrly 2002', 'Darby (2002) Been There, Done That: Australian Experience', 120),
    ('meddings wisdom genital_autonomy', 'Meddings (2017) The Wisdom of Genital Autonomy (Australia)', 120),
    ('agarwal preputial retraction in children', 'Agarwal (2005) Preputial Retraction in Normal Children (JIAPS)', 120),
    ('agarwal preputioplasty', 'Agarwal (2008) Preputioplasty vs Circumcision', 110),
]

def score_file(filename):
    clean = filename.lower()
    for pattern, title, score in CORE_SEEDS:
        if pattern in clean:
            return score, title
    
    # Heuristic scoring
    score = 0
    title = filename.replace('Article Downloads/', '').replace('.pdf', '')
    
    keywords = [
        ('frisch', 30), ('vanhowe', 30), ('van howe', 30), ('earp', 30), ('darby', 30),
        ('svoboda', 30), ('hammond', 40), ('milos', 30), ('goldman', 30), ('anand', 30),
        ('fendereski', 30), ('boyle', 25), ('adler', 25), ('taylor', 25), ('sorrells', 25),
        ('cepeda', 25), ('sardi', 25), ('carmack', 25), ('prepuce', 20), ('pain', 20),
        ('trauma', 20), ('ethics', 15), ('policy', 15), ('bjui', 20), ('bju', 20),
        ('pediatrics', 20), ('peds', 20), ('medicaid', 20), ('human rights', 20),
        ('consent', 20), ('restoration', 20), ('foreskin', 15), ('complications', 15)
    ]
    for kw, pts in keywords:
        if kw in clean:
            score += pts
            
    return score, title

def main():
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        files = [f for f in z.namelist() if f.lower().endswith('.pdf')]
        
    evaluated = []
    seen_seeds = set()
    
    for f in files:
        score, label = score_file(f)
        evaluated.append({
            'path': f,
            'filename': os.path.basename(f),
            'score': score,
            'label': label
        })
        
    evaluated.sort(key=lambda x: -x['score'])
    top_100 = evaluated[:110]
    
    print(f'Total candidates evaluated: {len(evaluated)}')
    print(f'Top candidate scores range from {top_100[0]["score"]} down to {top_100[-1]["score"]}')
    print('\nSample of Top 30 Selected:')
    for i, it in enumerate(top_100[:30], 1):
        print(f'{i:3d}. [{it["score"]:3d}] {it["filename"]} -> {it["label"][:65]}')

if __name__ == '__main__':
    main()
