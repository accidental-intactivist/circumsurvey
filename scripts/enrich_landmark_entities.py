import json
import os

NEW_ENTITIES = [
    {
        "id": "entity-morris-sorrells",
        "type": "person",
        "name": "Morris L. Sorrells, M.D.",
        "slug": "morris-l-sorrells",
        "aliases": ["Morris Sorrells", "Dr. Morris Sorrells", "M.L. Sorrells"],
        "description": "**Morris L. Sorrells, M.D.** is an American physician, clinical researcher, and landmark champion in penile somatosensory neurology. He is the lead author of the seminal 2007 quantitative sensory study *Fine-touch pressure thresholds in the adult penis*, published in *BJU International*.\n\n### The Semmes-Weinstein Fine-Touch Mapping\nPrior to Dr. Sorrells's 2007 study, claims that circumcision did not impair penile sensation relied almost exclusively on an unverified, non-peer-reviewed assertion in Masters & Johnson's 1966 book. Dr. Sorrells designed a rigorous, controlled clinical protocol utilizing individually calibrated Semmes-Weinstein monofilaments across 19 specific anatomical sites on the penis (controlled for age, underwear type, time since ejaculation, and ethnicity).\n\n### Core Empirical Findings\nSorrells and his team demonstrated that:\n1. The glans of circumcised men is significantly less sensitive to fine touch than that of intact men (p = 0.040).\n2. The transitional region from external to internal prepuce (the ridged band) is the most sensitive region of the intact penis, more sensitive than the most sensitive site on the circumcised penis.\n3. Five specific preputial locations routinely amputated during circumcision had significantly lower pressure thresholds (i.e. far greater fine-touch sensitivity) than the ventral scar of the circumcised penis.\n\nHis research remains the foundational evidentiary bedrock dismantling the medical myth that the foreskin is 'functionless' or that circumcision preserves full penile sensitivity.",
        "url": "https://doi.org/10.1111/j.1464-410X.2006.06685.x",
        "image_url": "",
        "role": "champion",
        "stance": "champion",
        "tagline": "Physician and lead author of the landmark 2007 BJU International sensory mapping study proving that circumcision ablates the most sensitive parts of the human penis.",
        "featured": 1,
        "years_active": "2000 – Present",
        "affiliations": "BJU International, NOCIRC, San Francisco Medical Community",
        "core_focus": "Penile Somatosensory Neurology, Semmes-Weinstein Monofilament Testing, Fine-Touch Pressure Thresholds, Foreskin Sensation",
        "key_milestones": "Publication of 'Fine-touch pressure thresholds in the adult penis' in BJU International (2007), Western Institutional Review Board Sensory Protocol, International Symposia Keynote",
        "location": "San Francisco, California, United States",
        "rating_score": 5,
        "rating_grade": "A+",
        "rating_quote": "Awarded an A+ grade for executing the definitive quantitative sensory investigation that conclusively proved circumcision ablates the most fine-touch sensitive tissues of the adult penis."
    },
    {
        "id": "entity-kamyar-fendereski",
        "type": "person",
        "name": "Kamyar Fendereski, M.D.",
        "slug": "kamyar-fendereski",
        "aliases": ["Kamyar Fendereski", "Dr. Fendereski", "K. Fendereski"],
        "description": "**Kamyar Fendereski, M.D.** is a physician and surgical epidemiologist affiliated with the Department of Surgery at the University of Utah School of Medicine. He is the lead investigator of the massive 2024 commercial claims cohort study *Comparing Penile Problems in Circumcised vs. Uncircumcised Boys: Insights From a Large Commercial Claims Database*, published in the *Journal of Pediatric Surgery*.\n\n### The 1.7-Million Boy Claims Cohort\nAddressing decades of conflicting, small-sample retrospective studies, Dr. Fendereski analyzed the MarketScan commercial claims database, tracking 850,000 circumcised boys matched 1-to-1 with 850,000 intact control subjects over a 10-year period through age 5. The primary endpoint was documented penile medical complications requiring clinical encounter (meatal stenosis, urethral stricture, post-operative adhesions, and penile inflammation).\n\n### Revolutionary Findings\nThe investigation established that circumcised boys suffered a 1.7% incidence of penile medical complications compared to just 0.5% in intact boys, representing an age- and multivariable-adjusted **2.9-fold higher risk (95% CI 2.8–3.1, p < 0.001)** for circumcised boys.\n\nThis landmark paper directly refuted the core historical claim of the American Academy of Pediatrics (AAP 2012) that neonatal circumcision reduces cumulative penile medical problems in early childhood.",
        "url": "https://doi.org/10.1016/j.jpedsurg.2024.07.017",
        "image_url": "",
        "role": "champion",
        "stance": "champion",
        "tagline": "University of Utah surgical researcher whose 1.7-million boy cohort study proved circumcised boys suffer 2.9 times more penile medical complications through age 5.",
        "featured": 1,
        "years_active": "2020 – Present",
        "affiliations": "University of Utah School of Medicine, Division of Urology, Journal of Pediatric Surgery",
        "core_focus": "Pediatric Surgical Epidemiology, Commercial Claims Databases, Penile Complications, Meatal Stenosis, Health Services Research",
        "key_milestones": "Lead author of 1.7M claims cohort study in Journal of Pediatric Surgery (2024), Disproved prophylactic hygiene claims of routine infant circumcision",
        "location": "Salt Lake City, Utah, United States",
        "rating_score": 5,
        "rating_grade": "A+",
        "rating_quote": "Awarded an A+ grade for spearheading the largest matched cohort study in pediatric surgical history, empirically demonstrating that neonatal circumcision triples complication rates in early childhood."
    },
    {
        "id": "entity-christopher-cold",
        "type": "person",
        "name": "Christopher J. Cold, M.D.",
        "slug": "christopher-j-cold",
        "aliases": ["Christopher Cold", "Dr. C.J. Cold", "C.J. Cold"],
        "description": "**Christopher J. Cold, M.D.** is an American clinical pathologist, anatomist, and scholarly pioneer in preputial functional morphology. Serving as a pathologist at the Marshfield Clinic and clinical professor at the University of Wisconsin Medical School, Dr. Cold has dedicated decades to illuminating the specialized micro-anatomy and neuro-vascular complexity of the foreskin.\n\n### The Landmark 1999 Monograph: 'The Prepuce'\nIn 1999, Dr. Cold co-authored the definitive anatomical review *The prepuce* with Dr. John R. Taylor, published in the *British Journal of Urology International*. The monograph synthesized decades of histological, immunological, and mechanical research, demonstrating that the prepuce is not inert 'skin' but an elaborate mucocutaneous specialized organ with five primary functions:\n1. Mechanical protection and lubrication of the glans penis\n2. Immunological defense via Langerhans cells and secretory immunoglobulins\n3. Specialized sensory innervation featuring Meissner's corpuscles, Vater-Pacini corpuscles, and genital end-bulbs\n4. Dynamic gliding action reducing shear forces and friction during intercourse\n5. Erogenous stimulation via the ridged band and ventral frenulum\n\nDr. Cold's meticulous microphotographs and histological preparations remain standard reference material across global bioethics and medical education.",
        "url": "https://doi.org/10.1046/j.1464-410x.1999.0830s1034.x",
        "image_url": "",
        "role": "champion",
        "stance": "champion",
        "tagline": "Pathologist and co-author of the landmark 1999 BJU International anatomical treatise detailing the prepuce's specialized immunological, mechanical, and erogenous architecture.",
        "featured": 1,
        "years_active": "1990 – Present",
        "affiliations": "Marshfield Clinic, University of Wisconsin Medical School, BJU International",
        "core_focus": "Surgical Pathology, Preputial Micro-Anatomy, Histology, Erogenous Receptors, Mechanical Gliding Action",
        "key_milestones": "Co-author of 'The Prepuce' (BJU International 1999), Marshfield Clinic Histological Series, Medical Expert in Genital Autonomy Symposia",
        "location": "Marshfield, Wisconsin, United States",
        "rating_score": 5,
        "rating_grade": "A+",
        "rating_quote": "Awarded an A+ grade for decades of anatomical research detailing the histological and physiological indispensability of the human prepuce."
    },
    {
        "id": "entity-adrienne-carmack",
        "type": "person",
        "name": "Adrienne Carmack, M.D.",
        "slug": "adrienne-carmack",
        "aliases": ["Adrienne Carmack", "Dr. Adrienne Carmack", "Dr. Carmack"],
        "description": "**Adrienne Carmack, M.D.** is a board-certified urological surgeon, author, and medical champion for bodily integrity. Following her residency and surgical practice, Dr. Carmack stepped forward as one of the few practicing American urologists to openly challenge the medicalized culture of routine infant circumcision.\n\n### The Global Survey of Circumcision Harm (GSCH)\nDr. Carmack collaborated with researcher Tim Hammond as co-author of the seminal 2017 paper *Long-term adverse outcomes from neonatal circumcision reported in a survey of 1,008 men*, published in the *International Journal of Human Rights in Healthcare*. The investigation provided the first comprehensive medical analysis of self-reported physical, sexual, and psychological harms across an international cohort of adult circumcised men.\n\n### Urological Whistleblowing & Advocacy\nDr. Carmack has consistently called upon the American Urological Association (AUA) and the pediatric establishment to abandon non-therapeutic surgical amputation of healthy tissue, advocating instead for compassionate, evidence-based conservative care and respect for human bodily rights.",
        "url": "https://doi.org/10.1108/IJHRH-08-2016-0016",
        "image_url": "",
        "role": "champion",
        "stance": "champion",
        "tagline": "Board-certified urologist and co-author of the landmark 2017 Global Survey of Circumcision Harm, whistleblowing within the American urological establishment.",
        "featured": 1,
        "years_active": "2010 – Present",
        "affiliations": "International Journal of Human Rights in Healthcare, Doctors Opposing Circumcision (DOC), GALDEF Advisory Board",
        "core_focus": "Urological Surgery, Long-term Circumcision Sequelae, Medical Ethics, Whistleblowing, Patient-Centered Restorative Care",
        "key_milestones": "Co-author of GSCH 1,008-men study (2017), Author of 'Reclaiming My Body' and clinical treatises, International speaker on urological bodily autonomy",
        "location": "Texas / Maine, United States",
        "rating_score": 5,
        "rating_grade": "A+",
        "rating_quote": "Awarded an A+ grade for courageously whistleblowing from within the surgical urology establishment and documenting the physical and emotional trauma of infant circumcision."
    }
]

EXISTING_UPDATES = {
    'J.R. Taylor': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Anatomical pathologist at the University of Manitoba who discovered the specialized ridged band and Meissner's corpuscles of the human prepuce.",
        'rating_quote': "Awarded an A+ grade for the groundbreaking 1996 British Journal of Urology discovery of the preputial ridged band, establishing modern anatomical knowledge of foreskin innervation."
    },
    'K. J. S. Anand': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Pioneering neonatologist whose 1987 NEJM study proved human neonates feel intense surgical pain and suffer lasting neuroendocrine distress.",
        'rating_quote': "Awarded an A+ grade for the watershed 1987 New England Journal of Medicine study that revolutionized neonatology and proved infants suffer profound surgical pain."
    },
    'Morten Frisch': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Danish epidemiologist, Statens Serum Institut consultant, and lead author of the 38-expert international rebuttal to the AAP 2012 policy in Pediatrics.",
        'rating_quote': "Awarded an A+ grade for organizing the 38-expert European pediatric coalition in Pediatrics (2013) that daylighted the cultural bias and statistical flaws of the AAP."
    },
    'Peter W. Adler': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Legal scholar and bioethicist whose Virginia and Richmond law review treatises established that infant circumcision constitutes common-law battery.",
        'rating_quote': "Awarded an A+ grade for pioneering legal scholarship demonstrating that non-therapeutic infant circumcision exceeds the bounds of parental proxy consent."
    },
    'Gregory J. Boyle': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Australian professor of psychology and co-author of 'Circumcision of Healthy Boys: Criminal Assault?' in the Journal of Law and Medicine.",
        'rating_quote': "Awarded an A+ grade for landmark multidisciplinary scholarship documenting the psychological trauma, pain memory, and legal illegality of infant circumcision."
    },
    'Edward Wallerstein': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Author of 'Circumcision: An American Health Fallacy' (1980), the intellectual foundation stone of modern intactivist literature.",
        'rating_quote': "Awarded an A+ grade for authoring the first comprehensive, scholarly investigation of the medical, cultural, and financial fallacies of American circumcision."
    },
    'Ronald Goldman': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Psychologist, executive director of the Circumcision Resource Center, and author of 'Circumcision: The Hidden Trauma'.",
        'rating_quote': "Awarded an A+ grade for pioneering clinical psychology research examining PTSD, psychological defense mechanisms, and intimacy trauma in circumcised men."
    },
    'J. Steven Svoboda': {
        'featured': 1,
        'rating_grade': 'A+',
        'rating_score': 5,
        'role': 'champion',
        'stance': 'champion',
        'tagline': "Executive Director of Attorneys for the Rights of the Child (ARC), co-author of 'A Rose by Any Other Name?' and decades of legal advocacy.",
        'rating_quote': "Awarded an A+ grade for founding Attorneys for the Rights of the Child and advancing constitutional and international human rights jurisprudence for children."
    }
}

def main():
    print("Enriching public/api_entities_mock.json...")
    with open('public/api_entities_mock.json', 'r', encoding='utf-8') as f:
        entities = json.load(f)
        
    existing_slugs = {e.get('slug') for e in entities}
    existing_ids = {e.get('id') for e in entities}
    
    # 1. Update existing entities
    updated_count = 0
    for e in entities:
        name = e.get('name')
        if name in EXISTING_UPDATES:
            updates = EXISTING_UPDATES[name]
            e.update(updates)
            updated_count += 1
            
    print(f"Updated {updated_count} existing landmark author dossiers.")
    
    # 2. Prepend new entities
    new_to_add = []
    for ne in NEW_ENTITIES:
        if ne['slug'] not in existing_slugs and ne['id'] not in existing_ids:
            new_to_add.append(ne)
            
    merged_entities = new_to_add + entities
    with open('public/api_entities_mock.json', 'w', encoding='utf-8') as f:
        json.dump(merged_entities, f, indent=2)
        
    print(f"Added {len(new_to_add)} new author entity dossiers. Total entities now: {len(merged_entities)}.")

if __name__ == '__main__':
    main()
