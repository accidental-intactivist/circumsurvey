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
    id: 'buckler-2025',
    label: 'Buckler, "As controversies mount, circumcision policies need a rethink," Journal of Medical Ethics (2025)',
    summary: 'Investigative study featuring retrospective interviews with architects of the AAP 2012 Circumcision Task Force. Pediatric urologist Dr. Andrew Freedman admitted circumcision is "not really a medical practice" and suggested AAP exit the circumcision business, while task force bioethicist Dr. Douglas Diekema acknowledged that "when you look at all the data, I don\'t think you can honestly say in a recommendation that the benefits outweigh the risks," demonstrating that the 2012 statement was drafted primarily to preserve third-party insurance billing rather than reflect medical consensus.',
    applies_to: 'AAP 2012 policy, insurance billing/reimbursement justifications, and bioethical review of non-therapeutic infant circumcision.',
    url: 'https://doi.org/10.1136/jme-2024-110287',
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
    id: 'fendereski-2024',
    label: 'Fendereski et al., "Comparing Penile Problems in Circumcised vs. Uncircumcised Boys: Insights From a Large Commercial Claims Database," Journal of Pediatric Surgery (2024)',
    summary: 'Analyzed 850,000 circumcised boys matched 1-to-1 with 850,000 intact control subjects (1.7 million boys total) over a 10-year follow-up through age 5. Found that circumcised boys had a 1.7% incidence of documented penile medical complications (urethral stricture, meatal stenosis, penile inflammation, adhesions) compared to only 0.5% in intact boys, representing a 2.9-fold higher risk in the circumcised cohort.',
    applies_to: 'Pediatric complication claims, long-term medical encounters, and comparative infant health.',
    url: 'https://doi.org/10.1016/j.jpedsurg.2024.07.017',
  },
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

  // ── History: stated intent of proponents ───────────────────────────────
  // Optional fields used by the Guide Builder: `kind` ('history' | 'research' |
  // 'legal'), `as_of` (YYYY-MM for claims whose status can change).
  {
    id: 'maimonides-guide',
    kind: 'history',
    label: 'Maimonides, Guide for the Perplexed, Part III, ch. 49 (c. 1190)',
    summary: 'The medieval rabbi and physician wrote that one purpose of circumcision is to weaken the organ and lessen sexual desire and pleasure, and that this bodily injury is the intended effect, not a side-effect.',
    applies_to: 'Historical statement of intent from within the tradition. Quote accurately; do not generalize to all Jewish practice today.',
  },
  {
    id: 'hutchinson-1855',
    kind: 'history',
    label: 'Jonathan Hutchinson, "On the influence of circumcision in preventing syphilis," Medical Times and Gazette (1855); "A plea for circumcision," Archives of Surgery (1890)',
    summary: 'An influential English surgeon who first promoted circumcision against syphilis and later advocated it to reduce masturbation, an early example of shifting medical rationales for the same surgery.',
    applies_to: 'Victorian medicalization of circumcision (Britain/US).',
  },
  {
    id: 'sayre-1870',
    kind: 'history',
    label: 'Lewis A. Sayre, reports on circumcision for "reflex paralysis," Transactions of the AMA (1870s)',
    summary: 'A prominent American orthopedic surgeon (later AMA president) promoted circumcision as a cure for paralysis and other "reflex neuroses" he attributed to foreskin irritation.',
    applies_to: 'Origins of US medical circumcision.',
  },
  {
    id: 'kellogg-1888',
    kind: 'history',
    label: 'John Harvey Kellogg, Plain Facts for Old and Young (1888 ed.)',
    summary: 'Recommended circumcision as a remedy for masturbation in boys, performed without an anesthetic because "the brief pain attending the operation will have a salutary effect upon the mind."',
    applies_to: 'Victorian anti-masturbation rationale; infant/child pain attitudes.',
  },
  {
    id: 'spratling-1895',
    kind: 'history',
    label: 'Edgar J. Spratling, "Masturbation in the Adult," Medical Record (1895)',
    summary: 'An asylum physician advised removing enough skin that it fits "tightly over the penis" with "no play" in erection, so that the act would require more effort; he then advised aiming for the "hygienic" rather than the moral benefit.',
    applies_to: 'Documented intent to reduce sexual function; transition to hygiene rationale.',
  },
  {
    id: 'council-florence-1442',
    kind: 'history',
    label: 'Council of Florence, Bull Cantate Domino (1442)',
    summary: 'The Catholic ecumenical council commanded all who glory in the name of Christian not to practice circumcision, either before or after baptism. (Modern Catholic teaching on bodily integrity: Catechism of the Catholic Church 2297.)',
    applies_to: 'Catholic audiences. Present respectfully as Church history and teaching.',
  },
  {
    id: 'aap-1971',
    kind: 'history',
    label: 'AAP Committee on Fetus and Newborn, Standards and Recommendations for Hospital Care of Newborn Infants (5th ed., 1971)',
    summary: 'Stated: "There are no valid medical indications for circumcision in the neonatal period."',
    applies_to: 'US newborns; the AAP position at the time many US parents were deciding.',
  },

  // ── Research cited in the Manifesto ────────────────────────────────────
  {
    id: 'fendereski-2024',
    kind: 'research',
    label: 'Fendereski et al., "Incidence of Penile Problems in the First 5 Years of Life in Uncircumcised and Circumcised Boys," Journal of Pediatric Surgery 59(11) (2024)',
    summary: 'Large US insurance-claims analysis found circumcised boys had a higher incidence of penile problems requiring medical attention in their first five years than intact boys.',
    applies_to: 'US boys under 5; hygiene / "fewer problems" claims. (Editors: confirm the exact ratio from the abstract before quoting a multiple.)',
    url: 'https://doi.org/10.1016/j.jpedsurg.2024.06.007',
  },
  {
    id: 'frisch-2022',
    kind: 'research',
    label: 'Frisch, Simonsen & Fall, "Non-therapeutic male circumcision in infancy or childhood and risk of HIV and other STIs: national cohort study in Denmark," European Journal of Epidemiology 37 (2022)',
    summary: 'In a national cohort study of Danish men, circumcision in infancy or childhood was not associated with lower risk of HIV or other STIs; some STIs were more common among circumcised men.',
    applies_to: 'Low-prevalence Western populations; observational design.',
    url: 'https://doi.org/10.1007/s10654-021-00809-6',
  },
  {
    id: 'goksan-2015',
    kind: 'research',
    label: 'Goksan et al., "fMRI reveals neural activity overlap between adult and infant pain," eLife 4:e06356 (2015)',
    summary: 'Newborn brains activated most of the same pain-related regions as adult brains in response to a noxious stimulus, evidence that infants experience pain much as adults do. (The Manifesto lists this as "Wilkinson et al."; the correct lead author is Goksan.)',
    applies_to: '"Babies don\'t feel pain / won\'t remember" claims.',
    url: 'https://doi.org/10.7554/eLife.06356',
  },
  {
    id: 'weiss-2010',
    kind: 'research',
    label: 'Weiss et al., "Complications of circumcision in male neonates, infants and children: a systematic review," BMC Urology 10:2 (2010)',
    summary: 'Reported complication rates vary widely by study design and setting; prospective studies tend to find higher rates than retrospective reviews, consistent with under-reporting.',
    applies_to: 'Complication-rate claims.',
    url: 'https://doi.org/10.1186/1471-2490-10-2',
  },
  {
    id: 'el-bcheraoui-2014',
    kind: 'research',
    label: 'El Bcheraoui et al., "Rates of adverse events associated with male circumcision in US medical settings, 2001 to 2010," JAMA Pediatrics 168(7) (2014)',
    summary: 'Insurance-claims analysis (~1.4 million males) found adverse-event rates under 0.5% for newborns but roughly 10–20 times higher when performed after infancy.',
    applies_to: 'Often cited to argue for infant circumcision. The relevant comparison for most boys is surgery vs. no surgery, since most intact men never need it. (Editors: verify the age-band figures before quoting.)',
  },
  {
    id: 'cochrane-phimosis-2014',
    kind: 'research',
    label: 'Moreno et al., "Topical corticosteroids for treating phimosis in boys," Cochrane Database of Systematic Reviews (2014)',
    summary: 'Topical steroid creams significantly increased complete or partial resolution of phimosis compared with placebo; a non-surgical first-line option.',
    applies_to: '"He\'ll need it later for phimosis" claims. Note: a non-retractable foreskin is normal in young boys.',
    url: 'https://doi.org/10.1002/14651858.CD008973.pub2',
  },
  {
    id: 'dave-cua-2018',
    kind: 'research',
    label: 'Dave et al., Canadian Urological Association guideline on the care of the normal foreskin and neonatal circumcision (2018)',
    summary: 'Does not recommend routine neonatal circumcision; treats the foreskin as normal anatomy and recommends conservative management (including topical steroids) for most foreskin concerns.',
    applies_to: 'Canadian guidance; clinicians.',
    url: 'https://cuaj.ca/index.php/journal/article/download/5034/3470/',
  },
  {
    id: 'darby-svoboda-2007',
    kind: 'research',
    label: 'Darby & Svoboda, "A Rose by Any Other Name? Rethinking the Similarities and Differences between Male and Female Genital Cutting," Medical Anthropology Quarterly 21(3) (2007)',
    summary: 'Argues that justifications and cultural dynamics of male and female genital cutting overlap substantially and that the sharp moral distinction drawn between them is inconsistent.',
    applies_to: 'FGM-comparison discussions. Compare justifications and consent, not the severity of every form.',
    url: 'https://doi.org/10.1525/maq.2007.21.3.301',
  },
  {
    id: 'hammond-carmack-2017',
    kind: 'research',
    label: 'Hammond & Carmack, "Long-term adverse outcomes from neonatal circumcision reported in a survey of 1,008 men," International Journal of Human Rights in Healthcare 10(2) (2017)',
    summary: 'Self-selected survey of men reporting physical, sexual and emotional harms they attribute to neonatal circumcision.',
    applies_to: 'Testimony of harm; self-selected sample, not prevalence.',
    url: 'https://doi.org/10.1108/IJHRH-08-2016-0016',
  },

  // ── Legal & legislative (status changes: check `as_of`) ────────────────
  {
    id: 'nh-hb94-2025',
    kind: 'legal',
    as_of: '2026-10',
    label: 'New Hampshire HB 94 (2025): end Medicaid coverage of non-medically-necessary circumcision',
    summary: 'Passed the NH House 184–183 in March 2025; the Senate voted it "Inexpedient to Legislate" on 17 April 2025, ending the bill. Opponents argued it targeted low-income and religious-minority families.',
    applies_to: 'US state Medicaid policy; a lesson in how such bills are opposed.',
    url: 'https://newhampshirebulletin.com/2025/03/12/by-a-single-vote-new-hampshire-house-passes-legislation-to-remove-circumcision-from-medicaid/',
  },
  {
    id: 'hadachek-2025',
    kind: 'legal',
    as_of: '2026-10',
    label: 'Hadachek v. State of Oregon (Multnomah County Circuit Court, filed March 2025)',
    summary: 'Equal-protection challenge arguing Oregon\'s FGM statute unlawfully protects girls but not boys or intersex children. Survived a motion to dismiss (Oct 2025); reported dismissed on standing at summary judgment (Oct 2026) without a ruling on the merits; plaintiffs\' counsel (Eric Clopper) announced an appeal. (Editors: verify against the docket.)',
    applies_to: 'US equal-protection litigation strategy.',
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
