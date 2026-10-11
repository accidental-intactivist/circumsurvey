/**
 * GUIDE BUILDER: SERIES PRESETS
 * -----------------------------
 * The public "Accidental Intactivist's Guide" Series. Each preset is just a
 * saved set of parameters; anyone can open one and customize it further.
 */

export const PRESETS = [
  { id: 'expectant-parents', title: 'Expectant Parents', blurb: 'The one decision about your son you don\'t have to make.', params: { relationship: 'expectant-parent', stance: 'curious', concerns: ['hygiene', 'look-like-dad', 'wont-remember'] } },
  { id: 'on-the-fence', title: 'On the Fence', blurb: 'If you\'re unsure, that\'s the answer: it can wait, and it can be his.', params: { relationship: 'expectant-parent', stance: 'on-the-fence', concerns: ['doctors-recommend', 'safer-as-baby', 'phimosis'] } },
  { id: 'skeptic', title: 'The Skeptic', blurb: 'Every claim labeled and sourced. Check our work.', params: { relationship: 'friend', stance: 'skeptical', tone: 'clinical', concerns: ['hiv-sti', 'uti', 'penile-cancer'] } },
  { id: 'medical-professionals', title: 'Medical Professionals', blurb: 'Indication, consent, and first do no harm.', params: { relationship: 'clinician', tone: 'clinical', concerns: ['doctors-recommend', 'complications-rare', 'phimosis'] } },
  { id: 'conservative-parents', title: 'Conservative Parents', blurb: 'Family, natural design, and skepticism of institutions.', params: { relationship: 'expectant-parent', politics: 'conservative', concerns: ['cost-insurance', 'doctors-recommend'] } },
  { id: 'progressive-parents', title: 'Progressive Parents', blurb: 'My body, my choice: does it apply to him too?', params: { relationship: 'expectant-parent', politics: 'progressive', tone: 'direct', concerns: ['parental-rights', 'fgm-different'] } },
  { id: 'grandparents', title: 'Grandparents', blurb: 'What changed since you had your children.', params: { relationship: 'grandparent', concerns: ['doctors-recommend', 'look-like-dad'] } },
  { id: 'circumcised-men', title: 'Circumcised Men', blurb: 'Whatever you feel about it is allowed.', params: { relationship: 'circumcised-man', concerns: ['restoration-no-big-deal', 'partner-preference'] } },
  { id: 'grieving-victims', title: 'From Grief to Action', blurb: 'Acknowledge the harm, process the anger, and use your voice to make a difference.', params: { relationship: 'circumcised-man', concerns: ['grief-anger', 'restoration-guidance'] } },
  { id: 'restoration-regeneration', title: 'Restoration & Regeneration', blurb: 'Taking back your body, and the science of what comes next.', params: { relationship: 'circumcised-man', concerns: ['restoration-guidance', 'genetic-engineering'] } },
  { id: 'clergy', title: 'Faith Leaders & Clergy', blurb: 'Covenant, care, and the child in front of you.', params: { relationship: 'clergy', concerns: ['religious-obligation', 'wont-remember'] } },
  { id: 'lawmakers', title: 'Lawmakers', blurb: 'Equal protection, consent, and public money.', params: { relationship: 'lawmaker', tone: 'clinical', concerns: ['cost-insurance', 'parental-rights', 'religious-obligation'] } },
  { id: 'troll-playbook', title: 'Trolls & Circumfetishists', blurb: 'A field playbook: respond for the audience, protect children, protect yourself.', params: { relationship: 'troll' } },
];

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map(p => [p.id, p]));
