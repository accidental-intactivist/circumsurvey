/**
 * GUIDE BUILDER: JUSTIFICATION COUNTER-EVIDENCE CARDS
 * ---------------------------------------------------
 * One card per common justification. Every claim carries a ledger tier:
 *   'documented' : backed by an Evidence Brief entry (`cites`) or a named source (`ref`)
 *   'editorial'  : the house position from first principles, owned openly
 *   'testimony'  : lived experience (Inquiry respondents, the Manifesto, archive voices)
 *
 * Text may contain language tokens resolved by compose.js:
 *   {{procedure}} / {{Procedure}} → "circumcision" or "genital cutting"
 *
 * `toneGate` limits a card to certain tones (the FGM card is Direct-only).
 * `risk` links a card to a Risk Reality scenario in risk.js.
 */

export const CARDS = [
  {
    id: 'hygiene',
    claim: '"It\'s cleaner."',
    whatsTrue: { text: 'Hygiene matters, and an intact boy\'s care is simple: wash what is visible. A young boy\'s foreskin should never be forcibly retracted.', tier: 'documented', cites: ['dave-cua-2018'] },
    evidence: [
      { text: 'A large 2024 US claims study found circumcised boys had *more* penile problems needing medical attention in their first five years, not fewer.', tier: 'documented', cites: ['fendereski-2024'] },
      { text: 'Most of the world\'s men are intact and keep clean with ordinary washing; we don\'t remove other body parts that need washing.', tier: 'editorial' },
    ],
    askBack: 'If soap and water handle it for most men worldwide, what is surgery adding?',
  },
  {
    id: 'look-like-dad',
    claim: '"He should look like his dad."',
    whatsTrue: { text: 'Wanting your son to feel he belongs is a loving instinct.', tier: 'editorial' },
    evidence: [
      { text: 'Children rarely compare themselves with their fathers this way, and boys differ from their dads in many visible ways already. A simple, honest conversation covers it.', tier: 'editorial' },
      { text: 'US newborn circumcision rates have been falling for decades, so his peers increasingly won\'t match dad either.', tier: 'documented', cites: ['cdc-nhds-rates'] },
    ],
    askBack: 'Would we choose any other permanent surgery so that a child matches a parent?',
  },
  {
    id: 'hiv-sti',
    claim: '"It prevents HIV and STIs."',
    whatsTrue: { text: 'Three African trials in consenting adult men reported a relative reduction in female-to-male HIV infection over about two years.', tier: 'documented', cites: ['african-rcts'] },
    evidence: [
      { text: 'The African trials involved adults in high-prevalence heterosexual epidemics, not US newborns. Circumcising HIV-positive men did not protect their female partners.', tier: 'documented', cites: ['african-rcts', 'wawer-2009', 'who-unaids-2007'] },
      { text: 'A national Danish cohort found no lower HIV or STI risk among men circumcised as children.', tier: 'documented', cites: ['frisch-2022'] },
      { text: 'Sexual risk begins years after infancy, when a young man can weigh the choice himself and condoms remain far more protective.', tier: 'editorial' },
    ],
    askBack: 'Since sexual risk starts years later, why not leave the choice to him when it\'s relevant?',
    risk: 'hiv-us',
  },
  {
    id: 'uti',
    claim: '"It prevents urinary tract infections."',
    whatsTrue: { text: 'Infant UTIs are somewhat more common in intact boys.', tier: 'documented', cites: ['singh-grewal-2005'] },
    evidence: [
      { text: 'About 111 boys would need to be circumcised to prevent one UTI, and UTIs are usually treated with antibiotics.', tier: 'documented', cites: ['singh-grewal-2005'] },
      { text: 'Girls have far higher UTI rates, and no one proposes surgery for them.', tier: 'editorial' },
    ],
    askBack: 'Would we remove healthy tissue from 111 babies to spare one a course of antibiotics?',
    risk: 'uti',
  },
  {
    id: 'penile-cancer',
    claim: '"It prevents penile cancer."',
    whatsTrue: { text: 'Penile cancer is somewhat associated with phimosis and HPV.', tier: 'documented', cites: ['penile-cancer-rarity'] },
    evidence: [
      { text: 'Penile cancer is rare, on the order of 1 case per 100,000 US men a year. HPV vaccination and not smoking address leading causes.', tier: 'documented', cites: ['penile-cancer-rarity'] },
      { text: 'Breast cancer is far more common, and we don\'t perform preventive mastectomies on infants.', tier: 'editorial' },
    ],
    askBack: 'For a cancer this rare, is removing healthy tissue at birth proportionate?',
    risk: 'penile-cancer',
  },
  {
    id: 'religious-obligation',
    claim: '"Our faith requires it."',
    whatsTrue: { text: 'For many families this is about covenant, identity and belonging. That deserves respect, not ridicule.', tier: 'editorial' },
    evidence: [
      { text: 'Within Judaism, families are welcoming sons with non-cutting ceremonies such as Brit Shalom (see Bruchim). Within Islam, khitan is not mentioned in the Qur\'an, and scholars weigh it against the principle of avoiding harm.', tier: 'documented', ref: 'Manifesto §XI.iii' },
      { text: 'Christian tradition set it aside early: the Council of Florence told Christians not to practice it.', tier: 'documented', cites: ['council-florence-1442'] },
      { text: 'Maimonides wrote that one purpose was to lessen sexual pleasure, which shows the tissue\'s role was understood within the tradition.', tier: 'documented', cites: ['maimonides-guide'] },
    ],
    askBack: 'What does your tradition say about protecting a child from harm, and who in your community is already living that out?',
  },
  {
    id: 'wont-remember',
    claim: '"He won\'t remember it" / "Babies don\'t feel pain."',
    whatsTrue: { text: 'He won\'t form a narrative memory of it.', tier: 'editorial' },
    evidence: [
      { text: 'Brain imaging shows newborns process pain using most of the same regions adults do.', tier: 'documented', cites: ['goksan-2015'] },
      { text: 'In 1888 Kellogg recommended it *without* anesthetic precisely because the pain would have a "salutary effect upon the mind." Pain was the point then, and it is real now.', tier: 'documented', cites: ['kellogg-1888'] },
      { text: 'Not remembering an injury does not make it acceptable. He will live with the result every day.', tier: 'editorial' },
    ],
    askBack: 'If he won\'t remember, is it okay to do anything to him? What makes this different?',
  },
  {
    id: 'partner-preference',
    claim: '"Women prefer it."',
    whatsTrue: { text: 'Preferences exist, and they follow whatever is familiar in a culture.', tier: 'editorial' },
    evidence: [
      { text: 'Partners of intact men in the Inquiry describe the difference in their own words; see the Inquiry\'s partner perspectives.', tier: 'testimony', ref: 'The Accidental Intactivist\'s Inquiry' },
      { text: 'A future partner\'s hypothetical taste is not a reason to operate on a baby. He can decide for himself as an adult.', tier: 'editorial' },
    ],
    askBack: 'Should a stranger\'s imagined preference, decades from now, decide surgery on him today?',
  },
  {
    id: 'phimosis',
    claim: '"He\'ll just need it later anyway."',
    whatsTrue: { text: 'Some males develop true phimosis.', tier: 'documented', cites: ['cochrane-phimosis-2014'] },
    evidence: [
      { text: 'A non-retractable foreskin is normal in young boys; it separates gradually, often not until puberty.', tier: 'documented', cites: ['dave-cua-2018'] },
      { text: 'When treatment is needed, topical steroid cream resolves most cases without surgery.', tier: 'documented', cites: ['cochrane-phimosis-2014'] },
      { text: 'Florian was circumcised at five for "phimosis" with no symptoms; nobody told his parents about the cream.', tier: 'testimony', ref: 'DW Documentary, Cut, uncut (2025); Manifesto §V.iii' },
    ],
    askBack: 'If most cases resolve on their own or with a cream, why choose surgery for every boy in advance?',
  },
  {
    id: 'parental-rights',
    claim: '"It\'s the parents\' choice."',
    whatsTrue: { text: 'Parents make countless decisions for their children, and should.', tier: 'editorial' },
    evidence: [
      { text: 'Parental authority exists to protect the child\'s interests, not to make permanent, non-medical choices he could make himself later.', tier: 'editorial' },
      { text: 'Medical bodies in Denmark and the Netherlands say non-therapeutic circumcision should be the individual\'s own informed decision.', tier: 'documented', cites: ['dma-2016', 'knmg-2010'] },
    ],
    askBack: 'Which choices about his body should be his to make, and why isn\'t this one of them?',
  },
  {
    id: 'cost-insurance',
    claim: '"Insurance covers it, so it must be medical."',
    whatsTrue: { text: 'Many US insurers and some state Medicaid programs do pay for it.', tier: 'documented', cites: ['medicaid-coverage'] },
    evidence: [
      { text: 'Coverage reflects custom and billing history, not medical need. Many states have dropped Medicaid coverage, and their rates are lower.', tier: 'documented', cites: ['medicaid-coverage'] },
      { text: 'Even the AAP said the benefits are not great enough to recommend it routinely.', tier: 'documented', cites: ['aap-2012'] },
    ],
    askBack: 'If the AAP won\'t recommend it routinely, why is it on the newborn checklist?',
  },
  {
    id: 'doctors-recommend',
    claim: '"Doctors recommend it."',
    whatsTrue: { text: 'The AAP (2012) said benefits outweigh risks enough to justify access and insurance coverage.', tier: 'documented', cites: ['aap-2012'] },
    evidence: [
      { text: 'The AAP\'s own 2012 statement said the benefits are *not* great enough to recommend routine circumcision. In 1971 the AAP said there were "no valid medical indications."', tier: 'documented', cites: ['aap-2012', 'aap-1971'] },
      { text: '38 physicians and leaders of European and Canadian medical societies criticized the 2012 report for cultural bias. None of the Canadian, Australasian or Dutch bodies recommends routine newborn circumcision, and neither does the AAP.', tier: 'documented', cites: ['frisch-2013', 'cps-2015', 'racp-2010', 'knmg-2010'] },
    ],
    askBack: 'If no major medical body recommends it routinely, who exactly is recommending it?',
  },
  {
    id: 'safer-as-baby',
    claim: '"It\'s safer as a baby than later."',
    whatsTrue: { text: 'Adverse-event rates in claims data are lower for newborns than for older boys.', tier: 'documented', cites: ['el-bcheraoui-2014'] },
    evidence: [
      { text: 'The real comparison for most boys is surgery versus no surgery: most intact men never need it at all.', tier: 'editorial' },
      { text: 'An adult who chooses it does so with anesthesia, aftercare and consent: his body, his risk, his decision.', tier: 'editorial' },
    ],
    askBack: 'Is it safer to do surgery now that he will most likely never need, than to let him decide?',
  },
  {
    id: 'complications-rare',
    claim: '"Complications are rare."',
    whatsTrue: { text: 'Serious complications are uncommon in any single case.', tier: 'documented', cites: ['weiss-2010'] },
    evidence: [
      { text: 'Reported rates vary widely; studies that follow babies after discharge find more problems than hospital chart reviews, consistent with under-reporting.', tier: 'documented', cites: ['weiss-2010'] },
      { text: 'The US has no national tracking of complications after discharge. Meatal stenosis, adhesions, skin bridges and, rarely, catastrophic injury or death go uncounted.', tier: 'documented', ref: 'Manifesto §V.iii' },
      { text: 'Any risk is too much for surgery with no medical indication.', tier: 'editorial' },
    ],
    askBack: 'What complication rate is acceptable for surgery with no medical need?',
  },
  {
    id: 'restoration-no-big-deal',
    claim: '"Men can just restore, so it\'s no big deal."',
    whatsTrue: { text: 'Non-surgical restoration can recover coverage and some comfort for many men.', tier: 'testimony', ref: 'Manifesto §VII.v; NORM' },
    evidence: [
      { text: 'Restoration takes years and cannot replace the ridged band, frenulum or specialized nerve endings that were removed.', tier: 'documented', cites: ['taylor-1996'] },
      { text: 'Over a hundred Inquiry respondents describe themselves as restoring. That effort is evidence of loss, not proof that nothing was lost.', tier: 'testimony', ref: 'The Accidental Intactivist\'s Inquiry' },
    ],
    askBack: 'If thousands of men spend years trying to undo it, what does that tell us?',
  },
  {
    id: 'grief-anger',
    claim: '"I feel profound grief and anger about what was done to me."',
    whatsTrue: { text: 'Your grief is valid. Acknowledging the harm done by this supposed benign, hygienic procedure is an essential step.', tier: 'editorial' },
    evidence: [
      { text: 'Countless men report feeling deep resentment and loss once they learn exactly what tissue and function was taken from them without consent.', tier: 'testimony', ref: 'The Accidental Intactivist\'s Inquiry' },
      { text: 'You can channel this anger into action. Deputizing yourself to speak out and daylight the real lasting impacts helps protect the next generation.', tier: 'editorial' },
    ],
    askBack: 'How can we turn this rightful anger into a voice that makes a difference?',
  },
  {
    id: 'restoration-guidance',
    claim: '"I want to physically restore what was taken."',
    whatsTrue: { text: 'Foreskin restoration is a committed journey many men undertake to regain coverage, protect the glans, and increase sensitivity.', tier: 'editorial' },
    evidence: [
      { text: 'Non-surgical methods using tension and tissue expansion can recover significant skin, offering mechanical and psychological relief.', tier: 'testimony', ref: 'Manifesto §VII.v; NORM' },
      { text: 'While it takes years and cannot replace the ridged band or frenulum, many men find it deeply healing to reclaim ownership of their bodies.', tier: 'editorial' },
    ],
    askBack: 'What does taking active control of your physical healing look like for you?',
  },
  {
    id: 'genetic-engineering',
    claim: '"Can we biologically regrow what was lost?"',
    whatsTrue: { text: 'Regenerative medicine and genetic engineering hold the promise of true biological restoration in the future.', tier: 'editorial' },
    evidence: [
      { text: 'Organizations like Foregen are actively researching how to regenerate the specialized tissue, including the ridged band and frenulum, using stem cells and extracellular matrices.', tier: 'documented', ref: 'Foregen Research' },
      { text: 'Supporting and advocating for this research is one way to enroll in a future where complete healing is possible.', tier: 'editorial' },
    ],
    askBack: 'How could a breakthrough in tissue regeneration change the conversation for the next generation?',
  },
  {
    id: 'fgm-different',
    claim: '"It\'s nothing like FGM."',
    toneGate: ['direct'],
    whatsTrue: { text: 'The forms differ, and the most severe forms of FGM are devastating. Severity matters.', tier: 'editorial' },
    evidence: [
      { text: 'The *justifications* match almost word for word: hygiene, tradition, appearance, marriageability, health.', tier: 'documented', cites: ['darby-svoboda-2007'] },
      { text: 'US federal law bans cutting *any part* of a girl\'s genitals, even the ritual "nick" the AAP briefly floated in 2010 and then retracted, yet allows removal of a boy\'s entire foreskin.', tier: 'documented', ref: '18 U.S.C. § 116; AAP Committee on Bioethics (2010, retracted)' },
      { text: 'The principle is the same for every child: no non-therapeutic genital cutting without consent.', tier: 'editorial' },
    ],
    askBack: 'If a pinprick on a girl is illegal, what principle allows much more on a boy?',
  },
  {
    id: 'intimacy-relationships',
    claim: '"How does this affect my intimate relationships?"',
    whatsTrue: { text: 'Genital cutting removes specialized nerve endings and mechanical gliding function, which can alter sexual mechanics for both partners.', tier: 'editorial' },
    evidence: [
      { text: 'Many men report needing artificial lubrication or experiencing altered sensation, while their partners also notice differences in friction and glide.', tier: 'testimony', ref: 'The Accidental Intactivist\'s Inquiry' },
      { text: 'Open communication and, if desired, physical restoration can help navigate and improve these intimate connections.', tier: 'editorial' },
    ],
    askBack: 'How can open communication about physical mechanics improve your intimate relationships?',
  },
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));

/** Cards allowed for a given tone (respects toneGate). */
export function cardAllowed(card, tone) {
  return !card.toneGate || card.toneGate.includes(tone);
}
