/**
 * RESOURCE DIRECTORY
 * ------------------
 * Curated from The Accidental Intactivist Manifesto §XI ("Resources for Further
 * Exploration, Support, and Action"). Powers the Guide Builder's "Where to go
 * next" section and the /resources page.
 *
 * `tags` are matched against module `resourceTags`. `kind` groups the directory.
 * Editors: keep blurbs short and factual; check links periodically.
 */

export const RESOURCE_KINDS = {
  org: 'Organizations',
  legal: 'Legal & legislative',
  faith: 'Faith-based',
  restoration: 'Restoration & regeneration',
  community: 'Communities & support',
  film: 'Films & presentations',
  podcast: 'Podcasts',
  book: 'Books',
};

export const RESOURCES = [
  // ── Organizations (North America) ──
  { id: 'intact-america', name: 'Intact America', url: 'https://intactamerica.org', kind: 'org', region: 'US', tags: ['parents', 'action', 'general'], blurb: 'US advocacy organization working to end routine infant circumcision through education and legislative action.' },
  { id: 'nocirc', name: 'NOCIRC', url: 'https://nocirc.org', kind: 'org', region: 'US', tags: ['parents', 'clinicians', 'intact-care'], blurb: 'Foundational US educational organization (since 1986) with materials for parents and medical professionals.' },
  { id: 'doc', name: 'Doctors Opposing Circumcision', url: 'https://doctorsopposingcircumcision.org', kind: 'org', region: 'International', tags: ['clinicians', 'research'], blurb: 'Physicians and health professionals challenging routine circumcision on medical and ethical grounds.' },
  { id: 'crc', name: 'Circumcision Resource Center', url: 'https://circumcision.org', kind: 'org', region: 'US', tags: ['support', 'research'], blurb: 'Founded by psychologist Ronald Goldman; focuses on psychological impacts.' },
  { id: 'notjustskin', name: 'NotJustSkin.org', url: 'https://notjustskin.org/', kind: 'org', region: 'International', tags: ['general', 'intact-care'], blurb: 'Education on foreskin anatomy and function.' },
  { id: 'your-whole-baby', name: 'Your Whole Baby', url: 'https://yourwholebaby.org', kind: 'org', region: 'US', tags: ['parents', 'intact-care'], blurb: 'Evidence-based information and community for parents keeping their sons intact.' },
  { id: 'saving-our-sons', name: 'Saving Our Sons', url: 'https://savingoursons.org', kind: 'org', region: 'US', tags: ['parents', 'action'], blurb: 'Grassroots education, awareness events and family resources.' },
  { id: 'can-fap', name: 'Canadian Foreskin Awareness Project', url: 'https://can-fap.net', kind: 'org', region: 'Canada', tags: ['intact-care', 'general'], blurb: 'Founded by Glen Callender; foreskin function and intact care.' },
  { id: 'intaction', name: 'Intaction', url: 'https://intaction.org', kind: 'org', region: 'US', tags: ['action'], blurb: 'Public education, mobile awareness campaigns and lobbying.' },
  { id: 'intact-global', name: 'Intact Global', url: 'https://intactglobal.org', kind: 'legal', region: 'International', tags: ['legal', 'action'], blurb: 'Led by attorney Eric Clopper; strategic litigation and the Intact Global Conference.' },
  { id: 'bloodstained-men', name: 'Bloodstained Men & Their Friends', url: 'https://bloodstainedmen.com', kind: 'org', region: 'US', tags: ['action'], blurb: 'Highly visible public protests across the US.' },
  // ── International ──
  { id: 'gain', name: 'Genital Autonomy Information Network (GAIN)', url: null, kind: 'org', region: 'Europe', tags: ['general', 'action'], blurb: 'European network; search for national members such as Intakt Danmark, Intakt Sverige or MOGiS e.V.' },
  { id: 'intact-australia', name: 'Intact Australia', url: 'https://www.intactaustralia.org/', kind: 'org', region: 'Australia', tags: ['parents', 'general'], blurb: 'Leading Australian organization with parent resources.' },
  { id: 'bruvvers', name: 'Bruvvers', url: 'https://bruvvers.org', kind: 'restoration', region: 'UK', tags: ['support', 'restoration'], blurb: 'UK charity supporting men affected by circumcision, including restoration.' },
  { id: 'nacs', name: 'Nordic Association of Clinical Sexologists', url: 'https://www.nacs.dk/', kind: 'org', region: 'Nordic', tags: ['clinicians', 'research'], blurb: 'Professional body whose statements reflect the Nordic ethical consensus.' },
  // ── Faith ──
  { id: 'bruchim', name: 'Bruchim', url: 'https://bruchim.online', kind: 'faith', region: 'International', tags: ['faith', 'jewish', 'parents'], blurb: 'Supports Jewish families who choose not to circumcise; promotes Brit Shalom ceremonies.' },
  { id: 'christians-intactivism', name: 'Christians for intactivism (online networks)', url: null, kind: 'faith', region: 'International', tags: ['faith'], blurb: 'Online communities discussing New Covenant theology and the body as a temple.' },
  { id: 'islamic-ethics', name: 'Islamic scholarship on khitan and harm avoidance', url: null, kind: 'faith', region: 'International', tags: ['faith', 'muslim'], blurb: 'Search scholarly sources on Qur\'anic non-mandate and "lā ḍarar wa-lā ḍirār".' },
  // ── Restoration ──
  { id: 'norm', name: 'NORM (National Organization of Restoring Men)', url: 'https://norm.org', kind: 'restoration', region: 'US', tags: ['restoration', 'support'], blurb: 'Information, community and guidance for non-surgical foreskin restoration.' },
  { id: 'foregen', name: 'Foregen', url: 'https://foregen.org', kind: 'restoration', region: 'International', tags: ['restoration'], blurb: 'Non-profit developing regenerative foreskin reconstruction; still preclinical as of 2026.', as_of: '2026-10' },
  // ── Legal ──
  { id: 'clopper', name: 'Clopper.com', url: 'https://clopper.com', kind: 'legal', region: 'US', tags: ['legal'], blurb: 'Attorney Eric Clopper\'s legal advocacy, including Hadachek v. Oregon.' },
  { id: 'galdef', name: 'GALDEF', url: 'https://galdef.org', kind: 'legal', region: 'US', tags: ['legal', 'action'], blurb: 'Genital Autonomy Legal Defense & Education Fund; strategic litigation and education.' },
  { id: 'state-legislatures', name: 'Your state legislature', url: null, kind: 'legal', region: 'US', tags: ['legal', 'action'], blurb: 'Track bills and contact your representatives (search "[your state] legislature").' },
  // ── Communities ──
  { id: 'r-circumcisiongrief', name: 'r/CircumcisionGrief', url: 'https://www.reddit.com/r/CircumcisionGrief/', kind: 'community', region: 'Online', tags: ['support'], blurb: 'Support for grief, anger and trauma about one\'s own or a loved one\'s circumcision.' },
  { id: 'r-intactivists', name: 'r/Intactivists', url: 'https://www.reddit.com/r/Intactivists/', kind: 'community', region: 'Online', tags: ['action', 'general'], blurb: 'News, discussion and activism.' },
  { id: 'r-foreskin-restoration', name: 'r/foreskin_restoration', url: 'https://www.reddit.com/r/foreskin_restoration/', kind: 'community', region: 'Online', tags: ['restoration', 'support'], blurb: 'Large community for non-surgical restoration.' },
  { id: 'r-foregen', name: 'r/Foregen', url: 'https://www.reddit.com/r/Foregen/', kind: 'community', region: 'Online', tags: ['restoration'], blurb: 'Following Foregen\'s research.' },
  { id: 'r-friendsofthefrenulum', name: 'r/FriendsOfTheFrenulum', url: 'https://www.reddit.com/r/FriendsOfTheFrenulum/', kind: 'community', region: 'Online', tags: ['general'], blurb: 'Created and moderated by The Accidental Intactivist.' },
  // ── Films & media ──
  { id: 'american-circumcision', name: 'American Circumcision (2017)', url: 'https://circumcisionmovie.com', kind: 'film', region: 'US', tags: ['media', 'general', 'parents'], blurb: 'Brendon Marotta\'s documentary on the history and controversy of US circumcision.' },
  { id: 'elephant-hospital', name: 'Child Circumcision: An Elephant in the Hospital (2021)', url: null, kind: 'film', region: 'International', tags: ['media', 'clinicians'], blurb: 'Doctors, ethicists and legal experts on the lack of medical necessity.' },
  { id: 'dw-cut-uncut', name: 'Cut, uncut: Male circumcision (DW, 2025)', url: 'https://rumble.com/v6r0ub4-cut-uncut-male-circumcision-dw-documentary.html', kind: 'film', region: 'International', tags: ['media', 'general'], blurb: 'Deutsche Welle\'s global look, including VMMC and personal stories.' },
  { id: 'clopper-talk', name: 'Sex and Circumcision: An American Love Story (2018)', url: null, kind: 'film', region: 'US', tags: ['media', 'legal'], blurb: 'Eric Clopper\'s presentation blending law, anatomy and humor.' },
  { id: 'penn-teller', name: 'Penn & Teller: Bullshit! "Circumcision" (2005)', url: null, kind: 'film', region: 'US', tags: ['media', 'general'], blurb: 'Skeptical debunking of the justifications.' },
  { id: 'intact-again', name: 'Intact Again Podcast', url: 'https://intactagainpodcast.alitu.com/episode/6f5592e0-25a1-422b-8b12-8822eccc233a', kind: 'podcast', region: 'Online', tags: ['restoration', 'support'], blurb: 'Personal stories of circumcision and restoration.' },
  // ── Books ──
  { id: 'goldman-hidden-trauma', name: 'Goldman, Circumcision: The Hidden Trauma (1997)', url: null, kind: 'book', region: null, tags: ['support', 'research'], blurb: 'Psychological consequences and cultural denial.' },
  { id: 'glick-marked', name: 'Glick, Marked in Your Flesh (2005)', url: null, kind: 'book', region: null, tags: ['research', 'faith'], blurb: 'History from ancient Judea to modern America.' },
  { id: 'darby-temptation', name: 'Darby, A Surgical Temptation (2005)', url: null, kind: 'book', region: null, tags: ['research'], blurb: 'How Victorian anxieties drove medical circumcision.' },
  { id: 'savage-kid', name: 'Savage, The Kid (1999)', url: null, kind: 'book', region: null, tags: ['parents'], blurb: 'A parent\'s journey to choosing intactness.' },
];

/**
 * Rank resources for a set of tags. Each matching tag scores 1; ties keep
 * directory order. Entries with no match are excluded.
 */
export function resourcesForTags(tags = [], { limit = 6, kinds = null } = {}) {
  const want = new Set(tags);
  if (!want.size) return [];
  return RESOURCES
    .map((r, i) => ({ r, i, score: r.tags.filter(t => want.has(t)).length }))
    .filter(x => x.score > 0 && (!kinds || kinds.includes(x.r.kind)))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map(x => x.r);
}

/** Group resources by kind, in RESOURCE_KINDS order. */
export function groupByKind(list = RESOURCES) {
  return Object.keys(RESOURCE_KINDS)
    .map(kind => ({ kind, label: RESOURCE_KINDS[kind], items: list.filter(r => r.kind === kind) }))
    .filter(g => g.items.length);
}
