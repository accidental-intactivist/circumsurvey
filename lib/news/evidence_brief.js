/**
 * EVIDENCE BRIEF: DRAFT FOR EDITORIAL REVIEW
 * ------------------------------------------
 * A short, curated reference the news pipeline uses to ground "context notes".
 * The model is told to cite ONLY these entries or archive excerpts, and to mark a
 * claim "needs_review" rather than improvise a rebuttal.
 *
 * Editors: add, remove, or reword entries freely. Keep each `summary` factual and
 * attributable; keep `applies_to` honest about scope. Last reviewed: (pending)
 */

export const EVIDENCE_BRIEF = [
  // ── Medical policy positions ───────────────────────────────────────────
  {
    id: 'aap-2012',
    label: 'AAP Task Force on Circumcision, Policy Statement & Technical Report (2012)',
    summary: 'Concluded preventive benefits outweigh risks and justify access/insurance coverage, but explicitly stated the benefits are not great enough to recommend routine circumcision for all newborn males.',
    applies_to: 'US newborns; frequently cited by both sides.',
    url: 'https://doi.org/10.1542/peds.2012-1989',
  },
  {
    id: 'frisch-2013',
    label: 'Frisch et al., "Cultural Bias in the AAP\'s 2012 Technical Report and Policy Statement on Male Circumcision," Pediatrics (2013)',
    summary: '38 physicians and leaders of pediatric/medical societies from Europe and Canada argued the AAP conclusions reflected cultural bias, that most claimed benefits are questionable or achievable by less invasive means, and that the AAP under-weighted the child\'s right to bodily integrity.',
    applies_to: 'Critique of the AAP 2012 statement.',
    url: 'https://doi.org/10.1542/peds.2012-2896',
  },
  {
    id: 'knmg-2010',
    label: 'Royal Dutch Medical Association (KNMG) Viewpoint on Non-therapeutic Circumcision of Male Minors (2010)',
    summary: 'Non-therapeutic circumcision of male minors conflicts with the child\'s right to autonomy and physical integrity; there is no convincing evidence it is useful or necessary for prevention or hygiene; recommends a strong policy of deterrence.',
    applies_to: 'Male minors; Netherlands, widely cited internationally.',
    url: 'https://www.knmg.nl/advies-richtlijnen/dossiers/jongensbesnijdenis',
  },
  {
    id: 'cps-2015',
    label: 'Canadian Paediatric Society Position Statement (2015)',
    summary: 'Does not recommend routine circumcision of every newborn male.',
    applies_to: 'Canadian newborns.',
    url: 'https://cps.ca/en/documents/position/circumcision',
  },
  {
    id: 'racp-2010',
    label: 'Royal Australasian College of Physicians Policy Statement (2010)',
    summary: 'After reviewing the evidence, concluded the frequency of diseases modifiable by circumcision, the level of protection offered, and complication rates do not warrant routine infant circumcision in Australia and New Zealand.',
    applies_to: 'Australian/NZ infants.',
    url: 'https://www.racp.edu.au/docs/default-source/advocacy-library/circumcision-of-infant-males.pdf',
  },
  {
    id: 'dma-2016',
    label: 'Danish Medical Association statement (2016)',
    summary: 'Recommended that circumcision of boys be an informed decision the individual makes for himself, i.e. deferred until age 18.',
    applies_to: 'Danish boys.',
    url: 'https://laeger.dk/foreningen/nyheder/nyhedsarkiv/2016/laegeforeningen-om-omskaering-af-drengeboern-det-skal-vaere-et-informeret-valg',
  },

  // ── HIV / VMMC research ───────────────────────────────────────────────
  {
    id: 'african-rcts',
    label: 'African HIV RCTs: Orange Farm, South Africa (Auvert 2005); Kisumu, Kenya (Bailey 2007); Rakai, Uganda (Gray 2007)',
    summary: 'Three trials in consenting adult heterosexual men in high-HIV-prevalence settings, each stopped early, reported roughly 50–60% relative reduction in female-to-male HIV acquisition over ~2 years of follow-up.',
    applies_to: 'Voluntary ADULT men, generalized heterosexual epidemics in Sub-Saharan Africa. Not newborns; the US epidemic is concentrated among men who have sex with men and people who inject drugs, and condoms remain far more protective.',
  },
  {
    id: 'wawer-2009',
    label: 'Wawer et al., Lancet (2009): circumcision of HIV-positive men, Rakai',
    summary: 'Circumcising HIV-infected men did not reduce HIV transmission to their female partners; the trial was stopped for futility.',
    applies_to: 'Male-to-female transmission; limits of the "community protection" argument.',
  },
  {
    id: 'who-unaids-2007',
    label: 'WHO/UNAIDS recommendations on male circumcision for HIV prevention (2007)',
    summary: 'Recommended voluntary medical male circumcision as an additional HIV-prevention strategy specifically in settings with high HIV prevalence, generalized heterosexual epidemics, and low circumcision rates.',
    applies_to: 'High-prevalence settings (mainly East/Southern Africa), voluntary adolescent and adult men.',
  },

  // ── Anatomy & sensation ────────────────────────────────────────────────
  {
    id: 'taylor-1996',
    label: 'Taylor, Lockwood & Taylor, "The prepuce: specialized mucosa of the penis and its loss to circumcision," BJU (1996)',
    summary: 'Described the foreskin\'s ridged band and its specialized mucosa containing dense Meissner\'s corpuscles, tissue removed by circumcision.',
    applies_to: 'Anatomy of the foreskin.',
  },
  {
    id: 'sorrells-2007',
    label: 'Sorrells et al., "Fine-touch pressure thresholds in the adult penis," BJU International (2007)',
    summary: 'Found the most fine-touch-sensitive regions of the intact penis are on the foreskin, the parts removed by circumcision, and that the circumcised glans was less sensitive to fine touch than the intact glans.',
    applies_to: 'Adult penile sensitivity. Note: some later studies (e.g. Bossio et al. 2016) report no difference on other measures; present as an area of ongoing debate, not settled.',
  },

  // ── Common benefit claims, in absolute terms ───────────────────────────
  {
    id: 'singh-grewal-2005',
    label: 'Singh-Grewal et al., Archives of Disease in Childhood (2005): circumcision and UTI meta-analysis',
    summary: 'Estimated about 111 boys with normal urinary tracts would need to be circumcised to prevent one UTI; concluded net clinical benefit is likely only for boys at high UTI risk.',
    applies_to: 'Infant UTI claims. UTIs are generally treatable with antibiotics.',
  },
  {
    id: 'penile-cancer-rarity',
    label: 'Penile cancer incidence (US cancer registries)',
    summary: 'Penile cancer is rare in the US, on the order of 1 case per 100,000 men per year; major risk factors include HPV, smoking, and phimosis. HPV vaccination addresses a leading cause.',
    applies_to: 'Penile-cancer prevention claims.',
  },

  // ── Rates / decline ───────────────────────────────────────────────────
  {
    id: 'cdc-nhds-rates',
    label: 'CDC/NCHS, Owings, Uddin & Williams, "Trends in Circumcision for Male Newborns in U.S. Hospitals: 1979–2010" (2013)',
    summary: 'In-hospital newborn circumcision fell from 64.5% (1979) to 58.3% (2010), with large regional differences; the West had the lowest rates and the steepest declines.',
    applies_to: 'US hospital newborns; excludes out-of-hospital procedures.',
  },
  {
    id: 'medicaid-coverage',
    label: 'State Medicaid coverage of routine neonatal circumcision',
    summary: 'A substantial number of US states have dropped Medicaid coverage of routine newborn circumcision since the 1980s; states without coverage show lower rates. (Editors: insert the current state count and a source.)',
    applies_to: 'US policy/financing trend.',
  },

  // ── Ethics / framing ────────────────────────────────────────────────────
  {
    id: 'non-therapeutic-framing',
    label: 'Editorial framing: non-therapeutic surgery on a non-consenting minor',
    summary: 'Routine infant circumcision is performed without medical indication, on a healthy child who cannot consent, and removes erogenous, specialized tissue. Prophylactic benefits cited are small in absolute terms, achievable by less invasive means, or relevant only after the age of consent.',
    applies_to: 'House editorial position. Use for framing, not as an empirical citation.',
  },
];

export function formatEvidenceBrief() {
  return EVIDENCE_BRIEF
    .map(e => `[${e.id}] ${e.label}\n  Summary: ${e.summary}\n  Scope: ${e.applies_to}`)
    .join('\n');
}
