/**
 * THE ACCIDENTAL INTACTIVIST'S MANIFESTO: ARCHIVAL EVIDENCE TABLES & INFOGRAPHICS DATASET
 * ----------------------------------------------------------------------------------------
 * Duplicating the 6 core analytical tables from Tone Pettit's original Medium / PDF edition,
 * cross-referenced with CircumSurvey empirical telemetry (1,200+ men) and the Tim Hammond Papers (UMass MS 1205).
 */

export const MANIFESTO_TABLES = {
  // ── Table IV.iii.i: Evolution of Circumcision Justifications Across History ──
  table_iv_iii_i: {
    id: 'table-iv-iii-i',
    number: 'Table IV.iii.i',
    chapterNumber: 4,
    chapterRoman: 'IV',
    title: 'Evolution of Circumcision Justifications Across History',
    subtitle: 'This table starkly illustrates the fluidity of rationales used to justify circumcision across millennia. The reasons change, but the cutting continues.',
    provenance: 'Medium Publication / Manifesto PDF p. 32 • UMass MS 1205 Historical Folders',
    columns: [
      { key: 'era', label: 'Era / Culture', width: '22%' },
      { key: 'justification', label: 'Primary Justification(s)', width: '43%' },
      { key: 'impliedGoal', label: 'Implied Cultural / Institutional Goal', width: '35%' }
    ],
    rows: [
      {
        era: 'Ancient Egypt',
        justification: 'Possibly status marking, tribal belonging, subjugation of captured slaves.',
        impliedGoal: 'Social hierarchy, control, ritual diminishment, physical differentiation.'
      },
      {
        era: 'Ancient Israel (Brit Milah)',
        justification: 'Religious covenant with God (Genesis); tribal cohesion, patriarchal lineage.',
        impliedGoal: 'Religious identity, tribal unity, patriarchal authority, sexual control.'
      },
      {
        era: 'Hellenistic Judaism (Post-Periah)',
        justification: 'Enforce distinct Jewish identity; prevent cultural assimilation (epispasm reversal); irreversible bodily marker.',
        impliedGoal: 'Prevent assimilation, solidify distinct religious/ethnic communal boundary.'
      },
      {
        era: 'Medieval Judaism (Maimonides)',
        justification: 'Lessen sexual desire, weaken the organ, curb carnal urges for spiritual devotion (Guide for the Perplexed).',
        impliedGoal: 'Sexual control and diminishment, spiritual focus, intentional suppression of carnal pleasure.'
      },
      {
        era: 'Victorian Era (Anglo-American)',
        justification: 'Prevent masturbation (pathologized as cause of insanity, epilepsy, paralysis); later hygiene, syphilis, bedwetting, cancer.',
        impliedGoal: 'Moral purity, sexual diminishment, medicalized control of male sexuality, creation of the "hygienic" body.'
      },
      {
        era: 'Mid-20th Century (America)',
        justification: 'Routine newborn hospital care; hygiene; social conformity ("like father, like son / locker room anxiety").',
        impliedGoal: 'Social conformity, parental reassurance, medicalized assembly-line "normality", hospital billable codes.'
      },
      {
        era: 'Late 20th / Early 21st Century (America & VMMC Campaigns)',
        justification: 'Prevent UTIs, STIs (HPV, penile cancer—weak evidence); HIV prevention (contested adult Sub-Saharan African trials).',
        impliedGoal: 'Public health, disease prevention (shifting & often exaggerated claims retrofitted to maintain surgical revenue).'
      }
    ]
  },

  // ── Table IV.ix.ii: Ingredients in Manufacturing the American "Normal" ──
  table_iv_ix_ii: {
    id: 'table-iv-ix-ii',
    number: 'Table IV.ix.ii',
    chapterNumber: 4,
    chapterRoman: 'IV',
    title: 'Ingredients in Manufacturing the American "Normal" of Routine Infant Circumcision',
    subtitle: 'This deeply embedded, largely unquestioned cultural practice, sustained by a complex interplay of historical, religious, medical, economic, and psychological forces.',
    provenance: 'Medium Publication / Manifesto PDF p. 39 • UMass MS 1205 Clamping & Hospital Records',
    columns: [
      { key: 'factor', label: 'Ingredient (Historical Factor)', width: '25%' },
      { key: 'process', label: 'Process (How it Contributed to Normalization)', width: '40%' },
      { key: 'result', label: 'Result: The Manufactured "Normal"', width: '35%' }
    ],
    rows: [
      {
        factor: 'Ancient Religious Roots & Radicalization (Brit Milah, Periah)',
        process: 'Provided historical precedent & religious authority; Periah created a radical, irreversible procedure setting an anatomical template.',
        result: 'Established deep-seated cultural association with genital alteration, even when original religious context was secularized.'
      },
      {
        factor: 'Victorian Anti-Masturbation Panic',
        process: 'Medicalized circumcision, linking it to moral purity and sexual control; doctors claimed it reduced sensory sensation, framing it as a cure for physical and moral ills.',
        result: 'Created the initial pseudo-scientific veneer, laundering a puritanical ritual into clinical practice and associating intactness with "dirt" and "disease."'
      },
      {
        factor: '"Disease of the Decade" Justifications',
        process: 'Fueled by shifting rationales (hygiene, syphilis, cancer, STIs, UTIs, HIV), creating a moving target of ever-changing "benefits" as each previous claim was debunked.',
        result: 'Perpetuated the illusion of medical necessity and scientific consensus; normalized the idea that the natural penis was inherently flawed.'
      },
      {
        factor: 'US Military Influence (WWI, WWII, Post-War)',
        process: 'Military policies normalized circumcision for generations of servicemen for "readiness"; returning veterans popularized neonatal circumcision for sons.',
        result: 'Institutionalized RIC as a de facto standard, associating it with patriotism, duty, and shared American identity.'
      },
      {
        factor: 'Hospital Routinization & Profit Motive',
        process: 'Shift to hospital births enabled mass neonatal surgery; the medical-industrial complex discovered immense profitability, creating strong financial incentives to maintain it.',
        result: 'Embedded RIC within the revenue fabric of American healthcare, making it a self-sustaining system driven by economic forces independent of medical need.'
      },
      {
        factor: 'AAP Endorsement & Institutional Cover',
        process: 'American Academy of Pediatrics endorsement provided crucial medical blessing; internal pediatric dissent and European consensus were systematically obscured.',
        result: 'Solidified the public perception of medical consensus, reassuring parents and perpetuating the practice under the guise of "evidence-based medicine."'
      }
    ]
  },

  // ── Table V.iii.i: Reported Complication Rates Across Studies and Contexts ──
  table_v_iii_i: {
    id: 'table-v-iii-i',
    number: 'Table V.iii.i',
    chapterNumber: 5,
    chapterRoman: 'V',
    title: 'Reported Complication Rates Across Studies and Contexts',
    subtitle: 'Complication definitions vary wildly; prospective studies (following patients over time) report vastly higher rates than retrospective discharge summaries.',
    provenance: 'Medium Publication / Manifesto PDF p. 50 • Peer-Reviewed Meta-Analyses',
    columns: [
      { key: 'source', label: 'Source / Study', width: '25%' },
      { key: 'setting', label: 'Population & Setting', width: '25%' },
      { key: 'rate', label: 'Reported Complication Rate', width: '20%' },
      { key: 'notes', label: 'Critical Archival Notes', width: '30%' }
    ],
    rows: [
      {
        source: 'AAP Task Force (1999)',
        setting: 'Newborns (USA, hospital-based)',
        rate: '0.2% – 0.6%',
        notes: 'Only immediate complications before hospital discharge; zero outpatient follow-up.'
      },
      {
        source: 'Large US Inpatient Review (2005)',
        setting: '136,086 Newborns (USA, in-hospital)',
        rate: '0.2% (0.002)',
        notes: 'Immediate bleeding/infection recorded before discharge; misses delayed readmissions.'
      },
      {
        source: 'Wiswell et al. (1989)',
        setting: '130,475 Newborns (USA, Washington State)',
        rate: '0.18% bleeding',
        notes: 'Example of single-complication reporting (hemorrhage) in military hospital records.'
      },
      {
        source: 'Canadian Paediatric Soc. (2015)',
        setting: 'Newborns (Canada, various)',
        rate: '~2.0%',
        notes: 'Higher-end estimate acknowledging a wider range of intermediate surgical problems.'
      },
      {
        source: 'England NHS Audit (1997–2003)',
        setting: 'Pediatric Circumcisions (UK, hospitals)',
        rate: '1.7% total (1.2% immediate, 0.5% reoperation)',
        notes: 'Mostly older infants/children; includes returns to operating room for corrections.'
      },
      {
        source: 'Weiss et al. (2010) — Prospective',
        setting: 'Infants (Global, 16 studies)',
        rate: '0% – 16% (most ~2%)',
        notes: 'Followed babies over weeks/months; captured delayed bleeding, infection, and meatal narrowing.'
      },
      {
        source: 'Weiss et al. (2010) — Retrospective',
        setting: 'Infants (Global, 10 studies)',
        rate: '<0.6% in 5 studies; 2–4% in 4 studies',
        notes: 'Chart reviews; demonstrably underreported because parents seek care outside birth hospitals.'
      },
      {
        source: 'El Bcheraoui et al. (2014) — JAMA Pediatr.',
        setting: '1.4 million males (USA, insurance claims data)',
        rate: '0.4% (≤1 yr) • ~8% (1–9 yrs) • ~4% (≥10 yrs)',
        notes: 'Cumulative complication rates within 30 days by age group; showed 10–20× higher risk beyond infancy.'
      },
      {
        source: 'Iacob et al. (2022) — Systematic Review',
        setting: 'Infants (Global, mixed data)',
        rate: 'Range: <0.1% to 23%',
        notes: 'Aggregated multiple sources: meatal stenosis (<0.1%–20%) to bleeding in vulnerable cohorts (23%).'
      }
    ]
  },

  // ── Table VI.i: Justifications Echoed Across FGM and MGM (RIC) ──
  table_vi_i: {
    id: 'table-vi-i',
    number: 'Table VI.i',
    chapterNumber: 6,
    chapterRoman: 'VI',
    title: 'Hauntingly Identical Parallels: Justifications Echoed Across FGM and MGM',
    subtitle: 'The justifications—tradition, hygiene, conformity, health—are hauntingly mirrored. Yet Western culture maintains an intellectual firewall.',
    provenance: 'Medium Publication / Manifesto PDF p. 67 • Soraya Miré & UNCRC Comparative Legal Dockets',
    columns: [
      { key: 'dimension', label: 'Justification Dimension', width: '22%' },
      { key: 'fgm', label: 'Female Genital Mutilation (FGM)', width: '39%' },
      { key: 'mgm', label: 'Routine Infant Circumcision (MGM / RIC)', width: '39%' }
    ],
    rows: [
      {
        dimension: 'Tradition / Culture',
        fgm: 'Tradition and ancestral cultural identity; preserving community heritage.',
        mgm: 'Tradition and cultural identity ("he should look like his father and peers").'
      },
      {
        dimension: 'Hygiene / Cleanliness',
        fgm: 'Claimed to improve cleanliness and eliminate foul odors from natural folds.',
        mgm: 'Claimed to improve cleanliness ("easier to keep clean; prevents smegma build-up").'
      },
      {
        dimension: 'Social Acceptance / Conformity',
        fgm: 'Required for social acceptance and marriageability within the community.',
        mgm: 'Required for social acceptance ("looking normal at the urinal and locker room").'
      },
      {
        dimension: 'Religious Requirement',
        fgm: 'Mandated or strongly encouraged by regional religious interpretations.',
        mgm: 'Mandated by Abrahamic covenant; culturally preserved in secular American practices.'
      },
      {
        dimension: 'Control of Sexuality / Purity',
        fgm: 'Reduces sexual desire and preserves virginity/purity before marriage.',
        mgm: 'Historically explicitly intended to curb masturbation (Kellogg/Sayre); implicit diminishment remains.'
      },
      {
        dimension: 'Enhancing Marriageability / Appearance',
        fgm: 'Enhances marriage prospects and aesthetic physical acceptability.',
        mgm: 'Makes the penis "look better," smoother, or more aesthetically acceptable to partners.'
      },
      {
        dimension: 'Supposed Health Benefits',
        fgm: 'Claimed protection from infant death, infection, or childbirth complications.',
        mgm: 'Claimed protection from UTIs, STIs, penile cancer, and HIV.'
      }
    ]
  },

  // ── Table VII.i: Documented Physical Complications & Alterations Following RIC ──
  table_vii_i: {
    id: 'table-vii-i',
    number: 'Table VII.i',
    chapterNumber: 7,
    chapterRoman: 'VII',
    title: 'Documented Physical Complications & Alterations Following RIC',
    subtitle: 'This catalog illustrates that physical consequences are far-reaching and often severe, challenging the narrative of RIC as a safe, minor procedure.',
    provenance: 'Medium Publication / Manifesto PDF p. 72–73 • Clinical Urological Literature & Survey Base',
    columns: [
      { key: 'alteration', label: 'Complication / Alteration', width: '25%' },
      { key: 'description', label: 'Anatomical Description', width: '40%' },
      { key: 'notes', label: 'Reported Frequency & Research Notes', width: '35%' }
    ],
    rows: [
      {
        alteration: 'Adhesions / Skin Bridges',
        description: 'Remaining foreskin edge fuses improperly to the glans or coronal sulcus during healing.',
        notes: 'Occurs in up to 25% of circumcised boys; often requires painful manual lysis or corrective surgery.'
      },
      {
        alteration: 'Meatal Stenosis',
        description: 'Narrowing and scarring of the urethral opening due to chronic ammonia diaper irritation post-RIC.',
        notes: 'Affects 5%–20% of circumcised boys over time (virtually non-existent in intact males); one study found 17.9% incidence.'
      },
      {
        alteration: 'Need for Revision Surgery',
        description: 'Repeat surgery needed to correct unsatisfactory results (asymmetry, excess/insufficient skin, adhesions).',
        notes: 'Estimated 0.1%–4.5% routine circumcisions need revision. One urologist reported 1,600 revisions in 3 years.'
      },
      {
        alteration: 'Unnatural Penile Curvature / Chordee',
        description: 'Bending or lateral twisting of the penile shaft, visible during erection, due to uneven skin excision.',
        notes: 'Known iatrogenic complication (Stanford). 25% of men in our survey reported noticeable bend/twist.'
      },
      {
        alteration: 'Tight Skin / Loss of Mobility',
        description: 'Remaining shaft skin is too tight, causing discomfort, pain, or "tenting" during erection.',
        notes: '56% of men in survey reported little/no mobile shaft skin when erect; common cause of tearing.'
      },
      {
        alteration: 'Buried / Concealed Penis',
        description: 'Penis shaft retracts into the surrounding pubic fat pad, trapped by scar tissue after aggressive RIC.',
        notes: 'Occurs post-RIC with excessive skin removal; requires complex surgical reconstruction.'
      },
      {
        alteration: 'Prominent / Problematic Scarring',
        description: 'Obvious, thick, uneven, or differently pigmented scar line; potential for painful keloids.',
        notes: '63% of circumcised survey respondents reported a prominent scar line; an "aesthetic lottery."'
      },
      {
        alteration: 'Skin Tags / Uneven Remnants',
        description: 'Small tags or irregular bunching of skin left at the scar line from clamp slippage.',
        notes: '20% of circumcised men in survey reported skin tags; can cause irritation or cosmetic distress.'
      },
      {
        alteration: 'Distal Shaft Hair Migration',
        description: 'Hair-bearing scrotal or pubic skin pulled onto the penile shaft during surgical healing.',
        notes: '45% of circumcised men reported this issue; causes friction irritation during intercourse.'
      },
      {
        alteration: 'Sensory Loss / Nerve Damage',
        description: 'Removal of highly innervated tissue (frenulum, ridged band, inner mucosa); neuroma risk.',
        notes: 'Documented reduced fine-touch sensitivity (Sorrells 2007); ablates 10,000–20,000 specialized nerve endings.'
      },
      {
        alteration: 'Catastrophic Injury (Rare)',
        description: 'Partial/total glans amputation, severe hemorrhage, tissue necrosis, MRSA sepsis, death.',
        notes: 'Documented in malpractice cases (e.g., Ryan Heydari 2013); frequently obscured by non-disclosure settlements.'
      }
    ]
  },

  // ── Table VII.ii: Mapping Common Post-RIC Complaints to Underlying Anatomical Changes ──
  table_vii_ii: {
    id: 'table-vii-ii',
    number: 'Table VII.ii',
    chapterNumber: 7,
    chapterRoman: 'VII',
    title: 'Mapping Common Post-RIC Complaints to Underlying Anatomical Changes',
    subtitle: 'This mapping underscores that myriad complaints are not random or purely psychological, but directly linked to specific anatomical structures removed or damaged.',
    provenance: 'Medium Publication / Manifesto PDF p. 80–81 • Histological & Biomechanical Correlation',
    columns: [
      { key: 'complaint', label: 'Common Complaint / Observation', width: '25%' },
      { key: 'cause', label: 'Underlying Anatomical Cause', width: '45%' },
      { key: 'impact', label: 'Clinical / Functional Impact', width: '30%' }
    ],
    rows: [
      {
        complaint: 'Reduced Sensitivity / "Numbness" / Need for Harder Grip',
        cause: 'Removal of highly innervated foreskin (frenular delta, ridged band, inner mucosa) and loss of Meissner\'s corpuscles.',
        impact: 'Glans undergoes keratinization (toughening/drying); higher stimulus threshold required to reach climax.'
      },
      {
        complaint: 'Need for Artificial Lubrication (Sex / Masturbation)',
        cause: 'Elimination of the natural mobile dual-layered gliding sleeve; removal of self-lubricating mucosal lining.',
        impact: 'Increased friction against dry skin; lifelong reliance on commercial bottled lubricants.'
      },
      {
        complaint: 'Altered / Less Intense Orgasms ("Orgasm Gap")',
        cause: 'Loss of specialized neurovascular trigger zones (frenulum, ridged band) capable of sustaining prolonged orgasmic crescendos.',
        impact: 'Abrupt, localized climax; altered neurological feedback loop reported by men cut later in life.'
      },
      {
        complaint: 'Painful Erections / Tightness During Erection',
        cause: 'Insufficient residual shaft skin after excision of foreskin length; restrictive scar tissue limiting expansion.',
        impact: 'Tethering from adhesions, skin pulling from scrotum, painful tension during full engorgement.'
      },
      {
        complaint: 'Penile Curvature / Bending ("Boner Arc")',
        cause: 'Uneven skin excision causing asymmetric scar contracture and uneven tension on the erect shaft.',
        impact: 'Shaft bows laterally or dorsally; can cause penetrative difficulty and discomfort.'
      },
      {
        complaint: 'Difficulty / Pain for Intimate Partner',
        cause: 'Loss of gliding function necessitating friction-based thrusting rather than mobile sheath movement.',
        impact: 'Partner vaginal/anal abrasions, dryness, and irritation due to scraping friction.'
      },
      {
        complaint: 'Urinary Spraying / Painful Urination',
        cause: 'Meatal stenosis (narrowed urethral opening) secondary to chronic post-RIC ammonia diaper inflammation.',
        impact: 'Deflected or split urine stream; secondary bladder neck strain; requires meatotomy dilation.'
      },
      {
        complaint: 'Unsatisfactory Appearance (Scars, Asymmetry)',
        cause: 'Inherent surgical scar line, two-tone color mismatch, skin tags, and uneven clamp pressure.',
        impact: 'Negative genital body image, "aesthetic lottery" distress, self-consciousness.'
      },
      {
        complaint: 'Psychological Distress (Anger, Grief, Betrayal)',
        cause: 'Realization that a permanent, non-consensual bodily subtraction was performed for spurious reasons.',
        impact: 'Disenfranchised grief, violation trauma, resentment toward parents and medical institutions.'
      }
    ]
  }
};

/**
 * ── DATASETS FOR INTERACTIVE INFOGRAPHICS ──
 */

// 1. Sensation Radar: Fine-Touch Tactile Thresholds (Sorrells 2007 + CircumSurvey)
export const SENSATION_POINTS = [
  {
    name: 'Frenular Delta',
    threshold: 0.15, // grams (lower = more sensitive)
    score: 9.8, // out of 10 erogenous rating
    receptors: 'Dense Meissner corpuscles, free nerve endings',
    state: 'intact',
    excisedInRic: true,
    description: 'The most fine-touch sensitive region of the primate male anatomy, ablated in ~85% of standard neonatal clamps.'
  },
  {
    name: 'Ridged Band',
    threshold: 0.24,
    score: 9.5,
    receptors: 'Mucocutaneous crest, Meissner corpuscles',
    state: 'intact',
    excisedInRic: true,
    description: 'Specialized corrugated band at the tip of the prepuce; provides sensory gating and initial sexual excitation.'
  },
  {
    name: 'Inner Preputial Mucosa',
    threshold: 0.55,
    score: 8.7,
    receptors: 'Non-keratinized mucosal epithelium',
    state: 'intact',
    excisedInRic: true,
    description: 'Moist internal lining that shields the glans and produces natural lubricants; excising it eliminates internal glide.'
  },
  {
    name: 'Corona of Glans',
    threshold: 1.85,
    score: 7.2,
    receptors: 'Sensory free nerve endings',
    state: 'both',
    excisedInRic: false,
    description: 'Coronal ridge of the glans; remains present but undergoes drying and protective keratinization post-RIC.'
  },
  {
    name: 'Mid-Shaft Skin',
    threshold: 2.10,
    score: 5.8,
    receptors: 'Standard dermal mechanoreceptors',
    state: 'both',
    excisedInRic: false,
    description: 'Shaft skin; in intact men it remains loose and mobile, in circumcised men it is pulled taut.'
  },
  {
    name: 'Circumcised Glans (Keratinized)',
    threshold: 3.45,
    score: 4.0,
    receptors: 'Covered by 10-15 layers of stratified dead cells',
    state: 'circumcised',
    excisedInRic: false,
    description: 'Exposed to constant friction from underwear, the glans builds a thick protective crust, quadrupling sensory threshold.'
  },
  {
    name: 'Surgical Scar Ring',
    threshold: 3.80,
    score: 3.2,
    receptors: 'Fibrotic scar tissue, severed nerve stumps',
    state: 'circumcised',
    excisedInRic: false,
    description: 'The circumferential scar where mucosal remnant is sutured or clamped to shaft dermis; frequent site of micro-neuromas.'
  }
];

// 2. The "Disease of the Decade" Shifting Historical Sands Timeline
export const SHIFTING_SANDS_TIMELINE = [
  {
    era: '1870s – 1880s',
    label: 'Masturbation & Reflex Neurosis',
    champion: 'Dr. Lewis Sayre (Orthopedic Surgeon)',
    status: 'DEBUNKED',
    color: '#ef4444',
    archiveDossier: 'UMass MS 1205 Box 1 • Sayre Clinical Case Records',
    quote: '"Circumcision cures paralysis, epilepsy, hip joint disease, and insanity caused by genital irritation."'
  },
  {
    era: '1890s – 1900s',
    label: 'Anti-Pleasure & Moral Purification',
    champion: 'Dr. John Harvey Kellogg',
    status: 'DEBUNKED',
    color: '#f97316',
    archiveDossier: 'UMass MS 1205 Box 2 • Plain Facts for Old and Young',
    quote: '"Circumcision without anesthesia is particularly recommended so that the pain will serve as a salutary moral punishment."'
  },
  {
    era: '1910s – 1930s',
    label: 'Syphilis & Venereal Infection',
    champion: 'Military Medical Corps (WWI)',
    status: 'SUPERSEDED BY PENICILLIN',
    color: '#eab308',
    archiveDossier: 'UMass MS 1205 Box 4 • US Military Hygiene Directives',
    quote: '"The foreskin harbors venereal disease in muddy trenches; all soldiers should be circumcised for troop readiness."'
  },
  {
    era: '1940s – 1950s',
    label: 'Hospital Routinization & The Gomco Clamp',
    champion: 'Dr. Hiram Yellen & Hospital Admin',
    status: 'PROFIT MOTIVE NORMALIZATION',
    color: '#3b82f6',
    archiveDossier: 'UMass MS 1205 Box 5 • Gomco Surgical Clamp Catalogs',
    quote: '"Mass hospital delivery enabled assembly-line neonatal surgery, generating the first recurring fee for newborn care."'
  },
  {
    era: '1975',
    label: 'The Historic AAP Reversal',
    champion: 'AAP Committee on Fetus and Newborn (Dr. Hugh Thompson)',
    status: 'HISTORIC MEDICAL REVERSAL',
    color: '#10b981',
    archiveDossier: 'UMass MS 1205 Box 7 • Thompson Confidential Dossier',
    quote: '"There are no valid medical indications for circumcision in the neonatal period."'
  },
  {
    era: '1980s – 1990s',
    label: 'Infant Urinary Tract Infections (UTI)',
    champion: 'Dr. Thomas Wiswell (Pediatrician)',
    status: 'REFUTED (NNT: 111)',
    color: '#8b5cf6',
    archiveDossier: 'UMass MS 1205 Box 11 • NOHARMM Rebuttals',
    quote: '"Over 111 healthy boys must undergo surgery to prevent one easily treatable antibiotic course of cystitis."'
  },
  {
    era: '2000s – 2010s',
    label: 'Heterosexual HIV Vector Extrapolation',
    champion: 'WHO / UNAIDS / AAP 2012 Task Force',
    status: 'SEVERELY CONTESTED',
    color: '#ec4899',
    archiveDossier: 'UMass MS 1205 Box 18 • African Adult RCT Critiques',
    quote: '"Extrapolating adult African heterosexual trials to American infant boys in low-prevalence environments."'
  },
  {
    era: '2020s – Present',
    label: 'Medicaid Billing Code Preservation',
    champion: 'Journal of Medical Ethics (Buckler 2025 Investigation)',
    status: 'ACTIVE CONTROVERSY',
    color: '#d4a030',
    archiveDossier: 'Buckler JME 2025 Dossier • Freedman & Diekema Admissions',
    quote: '"Task force architects admitted on record that circumcision is not really medical, and recommendations were shaped to maintain insurance billing."'
  }
];

// 3. Global Medical Consensus: The International Wall of Deterrence
export const GLOBAL_MEDICAL_CONSENSUS = [
  {
    country: 'Netherlands',
    organization: 'Royal Dutch Medical Association (KNMG)',
    year: '2010',
    policy: 'Strong Policy of Deterrence',
    color: '#10b981',
    verdict: 'Non-therapeutic circumcision violates bodily integrity and children\'s human rights. No convincing evidence of medical necessity.',
    stance: 'Deterrence / Bodily Autonomy'
  },
  {
    country: 'Denmark',
    organization: 'Danish Medical Association (DMA)',
    year: '2016',
    policy: 'Deferral to Age 18',
    color: '#10b981',
    verdict: 'Circumcision of boys must be an informed choice the individual makes for himself upon reaching adulthood.',
    stance: 'Deterrence / Bodily Autonomy'
  },
  {
    country: 'Canada',
    organization: 'Canadian Paediatric Society (CPS)',
    year: '2015',
    policy: 'Does Not Recommend',
    color: '#10b981',
    verdict: 'Routine circumcision of every newborn male is not recommended; overall evidence indicates benefits do not outweigh potential risks.',
    stance: 'Does Not Recommend'
  },
  {
    country: 'Australia / NZ',
    organization: 'Royal Australasian College of Physicians (RACP)',
    year: '2010',
    policy: 'Does Not Recommend',
    color: '#10b981',
    verdict: 'Frequency of modifiable diseases does not warrant routine infant surgery in Australia and New Zealand.',
    stance: 'Does Not Recommend'
  },
  {
    country: 'United Kingdom',
    organization: 'British Medical Association (BMA)',
    year: '2019',
    policy: 'Ethically Contested',
    color: '#10b981',
    verdict: 'Unnecessary non-therapeutic surgical alteration without personal consent poses serious ethical and legal dilemmas.',
    stance: 'Ethically Contested'
  },
  {
    country: 'Germany / Europe',
    organization: 'European Pediatric Consortium (Frisch et al., 38 Societies)',
    year: '2013',
    policy: 'Rebuttal of Cultural Bias',
    color: '#10b981',
    verdict: 'Formally denounced AAP 2012 policy in Pediatrics as culturally biased, unscientific, and dismissive of child sovereignty.',
    stance: 'Formal Rebuttal of US Practice'
  },
  {
    country: 'United States',
    organization: 'American Academy of Pediatrics (AAP)',
    year: '2012 (Expired)',
    policy: 'Anomalous Compromise',
    color: '#ef4444',
    verdict: 'Claimed benefits justify insurance coverage, but explicitly stated benefits are not great enough to recommend routine surgery for all boys.',
    stance: 'The Global Outlier'
  }
];

// 4. CircumSurvey Empirical Telemetry Metrics (1,200+ Men)
export const SURVEY_TELEMETRY_METRICS = [
  {
    id: 'scarring',
    label: 'Prominent / Problematic Scarring',
    percentage: 63,
    color: '#eab308',
    details: '63% of circumcised men report a prominent, uneven, or discolored scar ring; 49% note sharp two-tone pigmentation boundaries.'
  },
  {
    id: 'lube',
    label: 'Reliance on Artificial Lubrication',
    percentage: 78,
    color: '#f97316',
    details: '78% of circumcised men require bottled lubricants for comfort during masturbation and sex due to loss of the rolling preputial sleeve.'
  },
  {
    id: 'grief',
    label: 'Disenfranchised Violation & Grief',
    percentage: 73,
    color: '#ef4444',
    details: '73% of circumcised respondents express grief, anger, or feeling physically violated by non-consensual infant surgery.'
  },
  {
    id: 'mobility',
    label: 'Loss of Mobile Shaft Skin / Tightness',
    percentage: 56,
    color: '#8b5cf6',
    details: '56% report little-to-no mobile shaft skin when erect, causing painful tension, tenting, or shaft tearing.'
  },
  {
    id: 'hair',
    label: 'Distal Shaft Hair Migration',
    percentage: 45,
    color: '#06b6d4',
    details: '45% report hair-bearing scrotal or pubic skin pulled onto the erect shaft due to excessive skin excision.'
  },
  {
    id: 'sensation_gap',
    label: 'Fine-Touch Sensation Drop',
    percentage: 36,
    color: '#d4a030',
    details: '36% statistical decline in fine-touch erogenous satisfaction and loss of multi-stage orgasmic crescendo.'
  },
  {
    id: 'curvature',
    label: 'Unnatural Penile Curvature / Torque',
    percentage: 25,
    color: '#3b82f6',
    details: '25% report an asymmetric bend, twist, or lateral torque ("boner arc") caused by uneven surgical skin excision.'
  }
];
