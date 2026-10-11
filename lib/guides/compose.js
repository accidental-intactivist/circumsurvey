/**
 * GUIDE BUILDER: COMPOSER
 * -----------------------
 * composeGuide(params) merges the curated modules, counter-evidence cards, core
 * truths, Inquiry facts and resources into one renderer-agnostic guide object.
 * Pure and synchronous: the same params always produce the same guide, so share
 * links are stable and everything is unit-testable.
 */

import { EVIDENCE_BRIEF } from '../news/evidence_brief.js';
import { DIMENSIONS, normalizeParams, optionLabel, isOptionAvailable } from './dimensions.js';
import { getModule, CORE } from './modules.js';
import { CARD_BY_ID, CARDS, cardAllowed } from './cards.js';
import { surveyFactsFor } from './surveyFacts.js';
import { resourcesForTags } from '../resources/directory.js';

export const TIERS = {
  documented: { label: 'Documented', icon: '📄', blurb: 'A cited source says it.' },
  editorial: { label: 'Editorial position', icon: '🧭', blurb: 'Our position from first principles, owned openly.' },
  testimony: { label: 'Testimony', icon: '🗣️', blurb: 'Lived experience.' },
};

const DEFAULT_MAX_CARDS = 6;
const MAX_QUESTIONS = 6;
const FALLBACK_CARDS = ['doctors-recommend', 'hygiene', 'wont-remember', 'complications-rare', 'parental-rights', 'safer-as-baby', 'uti'];

/** Resolve language tokens in a string. */
export function resolveLanguage(text, language = 'integrity') {
  if (typeof text !== 'string') return text;
  const proc = language === 'cutting' ? 'genital cutting' : 'circumcision';
  return text
    .replace(/\{\{procedure\}\}/g, proc)
    .replace(/\{\{Procedure\}\}/g, proc.charAt(0).toUpperCase() + proc.slice(1));
}

function resolveClaim(claim, language) {
  return claim ? { ...claim, text: resolveLanguage(claim.text, language) } : null;
}

function uniqueBy(list, keyFn) {
  const seen = new Set();
  return list.filter(item => {
    const k = keyFn(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Order card ids: chosen concerns first, then module leads, then fallbacks. */
export function orderCardIds(params, modules, { maxCards = DEFAULT_MAX_CARDS } = {}) {
  const chosen = params.concerns || [];
  const leads = modules.flatMap(m => m.leadWith || []);
  const ordered = uniqueBy([...chosen, ...leads, ...FALLBACK_CARDS], x => x)
    .filter(id => CARD_BY_ID[id] && cardAllowed(CARD_BY_ID[id], params.tone));
  // Explicit concerns are never trimmed; leads and fallbacks fill to maxCards.
  const keep = Math.max(maxCards, chosen.filter(id => ordered.includes(id)).length);
  return ordered.slice(0, keep);
}

function resolveCard(card, language) {
  return {
    ...card,
    claim: resolveLanguage(card.claim, language),
    askBack: resolveLanguage(card.askBack, language),
    whatsTrue: resolveClaim(card.whatsTrue, language),
    evidence: card.evidence.map(c => resolveClaim(c, language)),
  };
}

/** All claims in a card (whatsTrue + evidence). */
export function cardClaims(card) {
  return [card.whatsTrue, ...(card.evidence || [])].filter(Boolean);
}

/** Collect brief citations used by a list of claims; report unknown ids. */
export function collectCitations(claims, brief = EVIDENCE_BRIEF) {
  const byId = Object.fromEntries(brief.map(e => [e.id, e]));
  const ids = uniqueBy(claims.flatMap(c => c?.cites || []), x => x);
  return {
    citations: ids.filter(id => byId[id]).map(id => byId[id]),
    unknown: ids.filter(id => !byId[id]),
  };
}

function audienceLabel(params) {
  return ['relationship', 'stance', 'faith', 'politics']
    .map(d => optionLabel(d, params[d]))
    .filter(Boolean)
    .join(' · ');
}

/**
 * Compose a guide.
 * @param {object} rawParams  audience parameters (see dimensions.js)
 * @param {object} [opts]
 * @param {boolean} [opts.includeDrafts]  include draft modules (curators only)
 * @param {number}  [opts.maxCards]
 * @param {Array}   [opts.brief]          evidence entries (defaults to EVIDENCE_BRIEF)
 */
export function composeGuide(rawParams = {}, opts = {}) {
  const { includeDrafts = false, maxCards = DEFAULT_MAX_CARDS, brief = EVIDENCE_BRIEF } = opts;
  const params = normalizeParams(rawParams, { includeDrafts });
  const language = params.language;
  const warnings = [];

  for (const dim of DIMENSIONS) {
    const raw = rawParams[dim.id];
    if (!dim.multi && raw && !params[dim.id] && dim.options.some(o => o.id === raw) && !isOptionAvailable(dim.id, raw, { includeDrafts })) {
      warnings.push(`"${optionLabel(dim.id, raw)}" is still in review and was left out of this guide.`);
    }
  }

  const rel = getModule('relationship', params.relationship, { includeDrafts });
  const base = {
    params,
    title: rel?.title || 'The Accidental Intactivist\'s Guide',
    subtitle: rel?.subtitle || '',
    audience: audienceLabel(params),
    tone: params.tone,
    language,
    warnings,
  };

  // Playbook mode (e.g. trolls): not a persuasion guide.
  if (rel?.mode === 'playbook') {
    return {
      ...base,
      mode: 'playbook',
      playbook: rel.playbook,
      resources: resourcesForTags(rel.resourceTags || ['support'], { limit: 4 }),
      cards: orderCardIds({ ...params, concerns: [] }, [], { maxCards: 3 }).map(id => resolveCard(CARD_BY_ID[id], language)),
      citations: [],
    };
  }

  // Specific-to-general order: stance and faith openers are most targeted.
  const modules = [
    getModule('stance', params.stance, { includeDrafts }),
    rel,
    getModule('faith', params.faith, { includeDrafts }),
    getModule('politics', params.politics, { includeDrafts }),
  ].filter(Boolean);

  const openerOrder = [rel, ...modules.filter(m => m !== rel)];
  const commonGround = openerOrder.map(m => m.opener).filter(Boolean).map(c => resolveClaim(c, language));

  const coreTruths = [...CORE.anatomy, ...CORE.history].map(c => resolveClaim(c, language));
  const editorial = [...CORE.consent, ...CORE.editorial].map(c => resolveClaim(c, language));
  const points = uniqueBy(modules.flatMap(m => m.points || []), c => c.text).map(c => resolveClaim(c, language));
  const cards = orderCardIds(params, modules, { maxCards }).map(id => resolveCard(CARD_BY_ID[id], language));

  const avoid = new Set(modules.flatMap(m => m.language?.avoid || []));
  if (language === 'integrity') avoid.add('mutilation');
  const languageGuide = {
    use: uniqueBy(modules.flatMap(m => m.language?.use || []), x => x),
    avoid: [...avoid],
  };

  const allClaims = [...commonGround, ...coreTruths, ...editorial, ...points, ...cards.flatMap(cardClaims)];
  const { citations, unknown } = collectCitations(allClaims, brief);
  if (unknown.length) warnings.push(`Unknown evidence ids: ${unknown.join(', ')}`);

  return {
    ...base,
    mode: 'guide',
    editorialPlacement: params.tone === 'direct' ? 'main' : 'sidebar',
    commonGround,
    values: uniqueBy(modules.flatMap(m => m.values || []), x => x),
    believes: uniqueBy(modules.flatMap(m => m.believes || []), x => x),
    coreTruths,
    editorial,
    points,
    cards,
    voices: uniqueBy(modules.flatMap(m => m.voices || []), v => v.quote),
    questions: uniqueBy(modules.flatMap(m => m.questions || []), x => x).slice(0, MAX_QUESTIONS),
    language: languageGuide,
    survey: surveyFactsFor(params),
    resources: resourcesForTags(uniqueBy(modules.flatMap(m => m.resourceTags || []), x => x), { limit: 6 }),
    searchQueries: uniqueBy(modules.flatMap(m => m.searchQueries || []), x => x),
    citations,
  };
}

/** Every card available to the standalone counter-evidence builder for a tone. */
export function availableCards(tone = 'direct', language = 'integrity') {
  return CARDS.filter(c => cardAllowed(c, tone)).map(c => resolveCard(c, language));
}

function claimLine(c) {
  const tier = TIERS[c.tier];
  const src = [...(c.cites || []), ...(c.ref ? [c.ref] : [])].join('; ');
  return `- ${tier ? tier.icon + ' ' : ''}${c.text}${src ? ` *(${src})*` : ''}`;
}

/** Markdown rendering for the Report Builder / clipboard. */
export function guideToMarkdown(guide) {
  const out = [`## ${guide.title}`];
  if (guide.subtitle) out.push(`*${guide.subtitle}*`);
  if (guide.audience) out.push(`**Audience:** ${guide.audience}`);

  if (guide.mode === 'playbook') {
    const pb = guide.playbook;
    const sec = (title, items) => { out.push(`\n### ${title}`); items.forEach(i => out.push(`- ${i}`)); };
    sec('Recognize', pb.recognize);
    sec('Principles', pb.principles);
    sec('Scripts', pb.scripts);
    sec('Safety', pb.safety);
    return out.join('\n');
  }

  out.push('\n### Where we agree');
  guide.commonGround.forEach(c => out.push(claimLine(c)));
  out.push('\n### What\'s at stake');
  guide.coreTruths.forEach(c => out.push(claimLine(c)));
  guide.points.forEach(c => out.push(claimLine(c)));
  out.push('\n### Answering the common reasons');
  guide.cards.forEach(card => {
    out.push(`\n**${card.claim}**`);
    cardClaims(card).forEach(c => out.push(claimLine(c)));
    out.push(`- ❓ *${card.askBack}*`);
  });
  out.push('\n### Our position');
  guide.editorial.forEach(c => out.push(claimLine(c)));
  if (guide.questions.length) {
    out.push('\n### Questions to ask together');
    guide.questions.forEach(q => out.push(`- ${q}`));
  }
  if (guide.citations.length) {
    out.push('\n### Sources');
    guide.citations.forEach(e => out.push(`- [${e.id}] ${e.label}${e.url ? ` ${e.url}` : ''}`));
  }
  return out.join('\n');
}
