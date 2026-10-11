/**
 * GUIDE BUILDER: AUDIENCE MODULES
 * -------------------------------
 * Curated, editor-reviewed building blocks. compose.js merges the modules matching
 * the reader's parameters into one guide. Claims use the same ledger tiers as
 * cards.js ('documented' | 'editorial' | 'testimony').
 *
 * Keyed as `${dimension}:${optionId}`. Fields (all optional):
 *   title, subtitle      : relationship modules name the guide
 *   opener               : common-ground claim to open on
 *   values               : values to lead with
 *   believes             : what this reader likely believes or fears
 *   leadWith             : card ids to put first
 *   points               : claims specific to this audience
 *   voices               : { quote, who, ref } testimony
 *   questions            : questions to ask together
 *   language             : { use: [], avoid: [] }
 *   resourceTags         : tags matched against lib/resources/directory.js
 *   searchQueries        : archive queries for the Phase 2 AI weave
 *   status: 'draft'      : excluded unless includeDrafts
 *   mode: 'playbook'     : not a persuasion guide (see relationship:troll)
 */

const MOTHER_VOICE = {
  quote: 'Three sons. Three intact bodies. One quiet revolution. She never made it a crusade. She simply lived her values.',
  who: 'The Accidental Intactivist, on his mother',
  ref: 'Manifesto §X.iv',
};
const RICHTER_VOICE = { quote: 'He was born perfect, why change him?', who: 'Andy Richter, CONAN (2015)', ref: 'Manifesto §XI.iv' };
const YNET_VOICE = { quote: 'I had the snip and I had nothing to say about it. I\'m still a little pissed off about that.', who: 'Interviewee, Ynetnews (2011)', ref: 'Manifesto §XI.x' };
const FLORIAN_VOICE = { quote: 'That doesn\'t make sense in my case. I never had any pain or inflammation.', who: 'Florian, circumcised at five for "phimosis"', ref: 'DW Documentary, Cut, uncut (2025)' };

/** Core truths included in every persuasion guide. */
export const CORE = {
  anatomy: [
    { text: 'The foreskin is not "extra skin." It is a gliding, double-layered sleeve with a ridged band, frenulum and specialized mucosa: some of the most touch-sensitive tissue of the penis.', tier: 'documented', cites: ['taylor-1996', 'sorrells-2007'] },
  ],
  consent: [
    { text: 'A healthy newborn cannot consent, and nothing about his body requires a decision now. Every benefit claimed can be obtained later, by him, or by less invasive means.', tier: 'editorial', cites: ['non-therapeutic-framing'] },
  ],
  history: [
    { text: 'The surgery entered Western medicine in the Victorian era as a cure for masturbation. Its proponents said openly that they wanted to reduce sensation.', tier: 'documented', cites: ['kellogg-1888', 'spratling-1895', 'hutchinson-1855'] },
    { text: 'Since then the justification has changed with each generation (syphilis, paralysis, hygiene, cancer, UTI, HIV), but the tissue removed has never changed.', tier: 'documented', cites: ['sayre-1870', 'hutchinson-1855'] },
  ],
  editorial: [
    { text: 'Its proponents understood what was being taken. Each new "Disease of the Decade" still targets the same pleasure tissue: a suspicious convenience.', tier: 'editorial', ref: 'Manifesto §V.iv' },
    { text: 'Removing healthy erogenous tissue from someone who cannot consent is not okay, whatever the claimed benefit.', tier: 'editorial' },
  ],
};

export const MODULES = {
  // ── Relationship ─────────────────────────────────────────────────────────
  'relationship:expectant-parent': {
    title: 'For Expectant Parents',
    subtitle: 'The one decision about your son you don\'t have to make',
    opener: { text: 'You already want to protect him from every unnecessary hurt. That instinct is the whole argument.', tier: 'editorial' },
    values: ['Protecting your child', 'Making informed decisions', 'Trusting your instincts over hospital routine'],
    believes: ['It\'s routine, so it must be recommended', 'Dad is circumcised, so the baby should match', 'It\'s cleaner and prevents problems later'],
    leadWith: ['hygiene', 'look-like-dad', 'doctors-recommend', 'wont-remember'],
    points: [
      { text: 'In 1974 one mother had to decline consent several times; by her third son in 1981 it was barely a conversation. You can simply say "no, thank you."', tier: 'testimony', ref: 'Manifesto §X.iv' },
      { text: 'Intact care is simple: leave it alone and wash what is visible. Never retract a baby\'s foreskin.', tier: 'documented', cites: ['dave-cua-2018'] },
    ],
    voices: [MOTHER_VOICE, RICHTER_VOICE],
    questions: ['What would we need to see to feel sure it\'s necessary?', 'Is there anything about his body that needs fixing today?', 'How would we explain this choice to him at 18?'],
    language: { use: ['intact', 'keep him whole', 'his choice later'], avoid: ['mutilation', 'barbaric', 'butcher'] },
    resourceTags: ['parents', 'intact-care'],
    searchQueries: ['intact care newborn', 'parents decision circumcision'],
  },
  'relationship:partner': {
    title: 'For Partners of Expectant Parents',
    subtitle: 'How to raise it together, without a fight',
    opener: { text: 'You both want the best for this baby. Start there, and decide together from the evidence.', tier: 'editorial' },
    values: ['Partnership', 'Shared decisions', 'Protecting the baby'],
    believes: ['It\'s really the father\'s call', 'Bringing it up will cause conflict'],
    leadWith: ['look-like-dad', 'hygiene', 'doctors-recommend'],
    points: [{ text: 'A circumcised father may feel a decision against it questions him. Make it about the baby\'s future choice, not dad\'s past.', tier: 'editorial' }],
    voices: [RICHTER_VOICE],
    questions: ['What are we each afraid of?', 'If we wait, what do we lose?'],
    language: { use: ['our son', 'his choice'], avoid: ['mutilated', 'damaged'] },
    resourceTags: ['parents'],
    searchQueries: ['father circumcised son decision'],
  },
  'relationship:grandparent': {
    title: 'For Grandparents',
    subtitle: 'What changed since you had your children',
    opener: { text: 'Back then, doctors called it routine and nobody asked. Knowing more now isn\'t a judgment on you.', tier: 'editorial' },
    values: ['Family', 'Wisdom', 'Wanting the best for grandchildren'],
    believes: ['It was normal for our sons', 'Questioning it means we made a mistake'],
    leadWith: ['doctors-recommend', 'look-like-dad', 'hygiene'],
    points: [
      { text: 'Even in 1971, the AAP said there were "no valid medical indications" for newborn circumcision.', tier: 'documented', cites: ['aap-1971'] },
      { text: 'One mother in the 1970s quietly said no to it for all three of her sons. Grandparents can give the next generation that same permission.', tier: 'testimony', ref: 'Manifesto §X.iv' },
    ],
    voices: [MOTHER_VOICE],
    questions: ['What did doctors tell you then?', 'What would you want for your grandson if you knew what we know now?'],
    language: { use: ['what we know now'], avoid: ['you were wrong', 'mutilation'] },
    resourceTags: ['parents'],
    searchQueries: ['history routine circumcision 1970s hospital'],
  },
  'relationship:friend': {
    title: 'For a Friend or Peer',
    subtitle: 'A conversation, not a lecture',
    opener: { text: 'Most of us never questioned it. I didn\'t either, until I looked.', tier: 'editorial' },
    values: ['Curiosity', 'Honesty', 'Friendship'],
    believes: ['It\'s a private family matter', 'It\'s weird to talk about'],
    leadWith: ['hygiene', 'doctors-recommend', 'parental-rights'],
    voices: [RICHTER_VOICE, YNET_VOICE],
    questions: ['Did you ever learn what the foreskin actually does?', 'Would you want to have been asked?'],
    language: { use: ['intact', 'genital integrity'], avoid: ['mutilation'] },
    resourceTags: ['general'],
    searchQueries: ['foreskin function explained'],
  },
  'relationship:clinician': {
    title: 'For Pediatricians & Family Doctors',
    subtitle: 'Indication, consent, and first do no harm',
    opener: { text: 'Primum non nocere: what is the indication for surgery on a healthy newborn?', tier: 'editorial' },
    values: ['Evidence-based practice', 'Informed consent', 'Non-maleficence'],
    believes: ['The AAP endorses it', 'Benefits outweigh risks', 'Parents expect it'],
    leadWith: ['doctors-recommend', 'uti', 'hiv-sti', 'complications-rare', 'phimosis'],
    points: [
      { text: 'International bodies (CPS, RACP, KNMG, Danish MA, CUA) do not recommend routine neonatal circumcision.', tier: 'documented', cites: ['cps-2015', 'racp-2010', 'knmg-2010', 'dma-2016', 'dave-cua-2018'] },
      { text: 'Complication data are incomplete: there is no US tracking after discharge, and prospective studies find higher rates.', tier: 'documented', cites: ['weiss-2010'] },
      { text: 'Steroid cream is first-line for true phimosis; physiologic non-retraction is normal.', tier: 'documented', cites: ['cochrane-phimosis-2014', 'dave-cua-2018'] },
    ],
    voices: [FLORIAN_VOICE],
    questions: ['What would a complete informed-consent discussion include?', 'Would you perform this on a patient who could refuse?'],
    language: { use: ['non-therapeutic', 'indication', 'absolute risk'], avoid: ['mutilation', 'butcher'] },
    resourceTags: ['clinicians', 'research'],
    searchQueries: ['informed consent neonatal circumcision ethics', 'complications neonatal circumcision'],
  },
  'relationship:birth-worker': {
    title: 'For OB-GYNs, Midwives & L&D Nurses',
    subtitle: 'You are the last person parents hear before the checklist',
    opener: { text: 'You protect mothers and babies through birth. This decision often lands on your shift.', tier: 'editorial' },
    values: ['Advocacy for the baby', 'Informed consent', 'Gentle birth'],
    believes: ['It\'s the parents\' call, not mine', 'It\'s just part of the newborn routine'],
    leadWith: ['wont-remember', 'complications-rare', 'doctors-recommend'],
    points: [{ text: 'Hospitals often present it alongside hearing screens and vitamin K, which makes surgery feel routine. Separating it from the checklist is itself informed consent.', tier: 'documented', ref: 'Manifesto §XI.xi' }],
    questions: ['How is it presented to parents on your unit?', 'Who tells parents it is optional?'],
    language: { use: ['optional', 'non-therapeutic'], avoid: ['mutilation'] },
    resourceTags: ['clinicians', 'parents'],
    searchQueries: ['nurses conscientious objection circumcision'],
  },
  'relationship:lawmaker': {
    title: 'For Lawmakers & Policy Staff',
    subtitle: 'Equal protection, consent, and public money',
    opener: { text: 'The law already protects girls from any non-therapeutic genital cutting. The question is equal protection.', tier: 'editorial' },
    values: ['Equal protection', 'Fiscal responsibility', 'Children\'s rights'],
    believes: ['This would offend religious communities', 'It\'s a medical matter, not a legal one'],
    leadWith: ['cost-insurance', 'doctors-recommend', 'parental-rights', 'religious-obligation'],
    points: [
      { text: 'New Hampshire\'s HB 94 passed the House by one vote in 2025 and died in the Senate after opponents framed it as targeting low-income and religious-minority families. Lead with equal protection and medical necessity, and engage faith communities early.', tier: 'documented', cites: ['nh-hb94-2025'] },
      { text: 'Equal-protection litigation is under way (Hadachek v. Oregon).', tier: 'documented', cites: ['hadachek-2025'] },
    ],
    questions: ['Should public funds pay for surgery that no major medical body recommends routinely?', 'Why does the law protect only girls?'],
    language: { use: ['equal protection', 'medically unnecessary', 'informed consent'], avoid: ['mutilation', 'barbaric'] },
    resourceTags: ['legal', 'action'],
    searchQueries: ['Medicaid circumcision coverage states', 'equal protection genital cutting law'],
  },
  'relationship:journalist': {
    title: 'For Journalists',
    subtitle: 'The story most outlets miss',
    opener: { text: 'A surgery done to millions of American boys without medical indication deserves the same scrutiny as any other.', tier: 'editorial' },
    values: ['Accuracy', 'Accountability', 'Underreported stories'],
    believes: ['It\'s a settled debate', 'Critics are fringe'],
    leadWith: ['doctors-recommend', 'hiv-sti', 'complications-rare'],
    points: [{ text: 'The US is an outlier: national medical bodies across Europe, Canada and Australasia do not recommend routine infant circumcision.', tier: 'documented', cites: ['cps-2015', 'racp-2010', 'knmg-2010', 'frisch-2013'] }],
    questions: ['Who tracks complications after discharge?', 'Why are US rates so different from peer countries?'],
    language: { use: ['non-therapeutic infant circumcision'], avoid: ['mutilation'] },
    resourceTags: ['research', 'media'],
    searchQueries: ['circumcision rates United States decline', 'circumcision news'],
  },
  'relationship:clergy': {
    title: 'For Clergy & Faith Leaders',
    subtitle: 'Covenant, care, and the child in front of you',
    opener: { text: 'Every tradition asks us to protect the vulnerable. How does your tradition care for this child\'s body?', tier: 'editorial' },
    values: ['Faithfulness', 'Community', 'Care for the vulnerable'],
    believes: ['Questioning the practice attacks our faith', 'The community expects it'],
    leadWith: ['religious-obligation', 'wont-remember', 'parental-rights'],
    points: [{ text: 'Within several traditions, communities are already welcoming sons without cutting. This is renewal from within, not pressure from outside.', tier: 'documented', ref: 'Manifesto §XI.iii' }],
    questions: ['What does your tradition teach about harm and the body?', 'How could your community welcome a family that chooses not to cut?'],
    language: { use: ['covenant', 'welcome', 'integrity'], avoid: ['mutilation', 'barbaric', 'primitive'] },
    resourceTags: ['faith'],
    searchQueries: ['religious alternatives circumcision ceremony'],
  },
  'relationship:circumcised-man': {
    title: 'For Circumcised Men',
    subtitle: 'Whatever you feel about it is allowed',
    opener: { text: 'You didn\'t choose this, and your grief and anger are valid. Acknowledging that harm is the first step; using your voice to protect others is the next.', tier: 'editorial' },
    values: ['Honesty', 'Self-determination', 'Healing', 'Action'],
    believes: ['I\'m fine, so it\'s fine', 'Talking about it means I\'m damaged', 'Nothing can be done'],
    leadWith: ['grief-anger', 'restoration-guidance', 'genetic-engineering', 'restoration-no-big-deal', 'wont-remember', 'partner-preference'],
    points: [
      { text: 'It doesn\'t just remove tissue; it removes the awareness of removal. Many men only learn what the foreskin does as adults.', tier: 'editorial', ref: 'Manifesto §X.iv' },
      { text: 'Hundreds of Inquiry respondents are circumcised; more than a hundred describe themselves as restoring. You are not alone.', tier: 'testimony', ref: 'The Accidental Intactivist\'s Inquiry' },
      { text: 'You can make a difference as an accidental intactivist. By speaking out and daylighting the lasting impacts, you can protect the next generation.', tier: 'editorial' },
    ],
    voices: [YNET_VOICE],
    questions: ['What were you told about it growing up?', 'What would you want for a son?', 'How can we turn your experience into a voice for change?'],
    language: { use: ['your experience', 'resentment', 'restoring', 'speak out'], avoid: ['mutilated', 'damaged goods', 'broken'] },
    resourceTags: ['restoration', 'support', 'action'],
    searchQueries: ['foreskin restoration experience', 'circumcised men feelings resentment', 'foregen regenerative medicine'],
  },
  'relationship:troll': {
    title: 'Field Playbook: Trolls & Circumfetishists',
    subtitle: 'Respond for the audience, protect children, protect yourself',
    mode: 'playbook',
    playbook: {
      recognize: [
        'Bad faith: moving goalposts, endless "just asking questions," or ignoring every source you give.',
        'Sexualized interest: requests for graphic procedure details, images, or details about specific children. Treat these as a red flag and do not answer.',
        'Gish gallop: a flood of claims too fast to answer one by one.',
      ],
      principles: [
        'You are writing for the lurkers, not the troll. One clear, sourced reply, then disengage.',
        'Never share images, names, ages or locations of children, including your own.',
        'Don\'t debate procedure details with someone who seems to enjoy them.',
        'Link one counter-evidence card instead of arguing point by point.',
      ],
      scripts: [
        'For anyone reading along: here\'s what the evidence actually says → [counter-evidence card link]. I won\'t be continuing this thread.',
        'Every major medical body outside the US declines to recommend this routinely. The sources are linked; draw your own conclusions.',
        'I don\'t discuss details about children with strangers. Goodbye.',
      ],
      safety: [
        'Screenshot and keep records before blocking.',
        'Report to the platform. If anything suggests a child may be at risk, report it to the NCMEC CyberTipline (US) or local authorities.',
        'Take breaks. Your wellbeing matters more than winning a thread.',
      ],
    },
    resourceTags: ['support'],
  },

  // ── Stance ───────────────────────────────────────────────────────────────
  'stance:curious': {
    opener: { text: 'Curiosity is the start of every good decision. Here is what most people never get told.', tier: 'editorial' },
    leadWith: ['hygiene', 'doctors-recommend'],
  },
  'stance:on-the-fence': {
    opener: { text: 'If you\'re unsure, that\'s the answer: an unnecessary, irreversible decision can wait, and it can be his.', tier: 'editorial' },
    leadWith: ['doctors-recommend', 'safer-as-baby', 'phimosis'],
    questions: ['What would tip you either way?', 'If you wait, what is lost?'],
  },
  'stance:skeptical': {
    opener: { text: 'Good. Be skeptical of everyone, including us. Every claim here is labeled and sourced so you can check it.', tier: 'editorial' },
    leadWith: ['hiv-sti', 'uti', 'penile-cancer', 'doctors-recommend'],
  },
  'stance:planning': {
    opener: { text: 'Before the appointment, it\'s worth knowing what the AAP itself says, and what it doesn\'t.', tier: 'editorial' },
    leadWith: ['doctors-recommend', 'complications-rare', 'safer-as-baby', 'wont-remember'],
    questions: ['What specific benefit are you hoping for?', 'Could he get that benefit later, by his own choice?'],
  },
  'stance:already': {
    opener: { text: 'You made the decision you were guided toward, with the information you had. This guide is about supporting him going forward, not guilt.', tier: 'editorial' },
    leadWith: ['restoration-no-big-deal', 'parental-rights'],
    points: [
      { text: 'Be honest with him if he asks, and let him know his feelings are welcome, whatever they are.', tier: 'editorial' },
      { text: 'You can protect future sons and grandsons, and share what you\'ve learned.', tier: 'editorial' },
    ],
    language: { use: ['going forward'], avoid: ['you harmed', 'you mutilated'] },
  },

  // ── Faith ────────────────────────────────────────────────────────────────
  'faith:secular': {
    opener: { text: 'Challenge harmful defaults, demand evidence and ethics, champion autonomy: the humanist case writes itself.', tier: 'editorial', ref: 'Manifesto §X.vi' },
    resourceTags: ['general'],
  },
  'faith:catholic': {
    opener: { text: 'The Church teaches respect for bodily integrity, and the Council of Florence told Christians not to circumcise.', tier: 'documented', cites: ['council-florence-1442'] },
    leadWith: ['religious-obligation'],
    resourceTags: ['faith'],
    searchQueries: ['Catholic teaching circumcision bodily integrity'],
  },
  'faith:protestant': {
    opener: { text: 'Paul was clear that circumcision is not required of Christians (Galatians 5; Acts 15). The body is a temple to be cared for, not cut.', tier: 'documented', ref: 'Galatians 5:2–6; Acts 15; 1 Corinthians 6:19' },
    leadWith: ['religious-obligation'],
    resourceTags: ['faith'],
    searchQueries: ['Christian New Covenant circumcision'],
  },
  'faith:lds': {
    opener: { text: 'Latter-day Saint scripture teaches that circumcision was "done away" in Christ (Moroni 8:8). Your faith asks nothing of his body here.', tier: 'documented', ref: 'Book of Mormon, Moroni 8:8' },
    leadWith: ['religious-obligation'],
    resourceTags: ['faith'],
  },
  'faith:jewish': {
    status: 'draft',
    opener: { text: 'Jewish families are welcoming sons into the covenant with Brit Shalom, a ceremony without cutting, and remaining fully Jewish.', tier: 'documented', ref: 'Bruchim (bruchim.online); Manifesto §XI.iii' },
    leadWith: ['religious-obligation'],
    language: { use: ['covenant', 'welcome', 'Brit Shalom'], avoid: ['mutilation', 'barbaric', 'primitive'] },
    resourceTags: ['faith', 'jewish'],
  },
  'faith:muslim': {
    status: 'draft',
    opener: { text: 'Khitan is not mentioned in the Qur\'an, and Islamic ethics holds "lā ḍarar wa-lā ḍirār": no harm, and no reciprocating harm.', tier: 'documented', ref: 'Manifesto §XI.iii' },
    leadWith: ['religious-obligation'],
    language: { use: ['harm avoidance', 'scholarly debate'], avoid: ['mutilation', 'barbaric', 'primitive'] },
    resourceTags: ['faith', 'muslim'],
  },
  'faith:spiritual': {
    opener: { text: 'A baby arrives whole. Trusting that wholeness is a spiritual act.', tier: 'editorial' },
    voices: [RICHTER_VOICE],
  },

  // ── Politics ─────────────────────────────────────────────────────────────
  'politics:progressive': {
    opener: { text: 'My body, my choice: does it apply to him too?', tier: 'editorial' },
    values: ['Bodily autonomy', 'Consent', 'Equality'],
    leadWith: ['parental-rights', 'fgm-different', 'partner-preference'],
  },
  'politics:liberal': {
    opener: { text: 'Consent and evidence-based medicine should guide decisions about any child\'s body.', tier: 'editorial' },
    values: ['Consent', 'Science', 'Equal rights'],
    leadWith: ['doctors-recommend', 'parental-rights'],
  },
  'politics:moderate': {
    opener: { text: 'When the evidence is mixed and the surgery is permanent, the sensible default is to wait.', tier: 'editorial' },
    leadWith: ['doctors-recommend', 'safer-as-baby'],
  },
  'politics:conservative': {
    opener: { text: 'We don\'t let the government or a stranger make permanent decisions about a child\'s body. Why let a hospital routine?', tier: 'editorial' },
    values: ['Family', 'Natural design', 'Skepticism of institutions', 'Fiscal responsibility'],
    leadWith: ['cost-insurance', 'doctors-recommend', 'religious-obligation'],
    points: [{ text: 'Taxpayers still fund this surgery through Medicaid in many states.', tier: 'documented', cites: ['medicaid-coverage'] }],
  },
  'politics:libertarian': {
    opener: { text: 'Self-ownership starts at birth. "My right to swing my fist ends where the other man\'s nose begins."', tier: 'editorial', ref: 'Manifesto §VII.vii' },
    values: ['Self-ownership', 'Consent', 'Non-aggression'],
    leadWith: ['parental-rights', 'cost-insurance'],
  },
  'politics:apolitical': {
    opener: { text: 'This isn\'t left or right. It\'s about one baby and one permanent decision.', tier: 'editorial' },
  },
};

/** Return the module for a dimension/option, honoring draft status. */
export function getModule(dimension, optionId, { includeDrafts = false } = {}) {
  if (!optionId) return null;
  const mod = MODULES[`${dimension}:${optionId}`];
  if (!mod) return null;
  if (mod.status === 'draft' && !includeDrafts) return null;
  return mod;
}
