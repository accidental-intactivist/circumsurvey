import { describe, it, expect } from 'vitest';
import { EVIDENCE_BRIEF } from '../news/evidence_brief.js';
import { DIMENSIONS, normalizeParams, paramsToQuery, queryToParams, DEFAULT_PARAMS } from './dimensions.js';
import { MODULES, CORE, getModule } from './modules.js';
import { CARDS, CARD_BY_ID, cardAllowed } from './cards.js';
import { PRESETS } from './presets.js';
import { composeGuide, orderCardIds, guideToMarkdown, availableCards, resolveLanguage, collectCitations, cardClaims, TIERS } from './compose.js';
import { surveyFactsFor, describeGroup, SMALL_N } from './surveyFacts.js';
import { riskStats, formatPct, formatNNT, RISK_SCENARIOS } from './risk.js';
import { RESOURCES } from '../resources/directory.js';

const BRIEF_IDS = new Set(EVIDENCE_BRIEF.map(e => e.id));
const RESOURCE_TAGS = new Set(RESOURCES.flatMap(r => r.tags));

function assertClaim(claim, where) {
  expect(TIERS[claim.tier], `${where}: bad tier "${claim.tier}"`).toBeTruthy();
  expect(typeof claim.text === 'string' && claim.text.length > 10, `${where}: text`).toBe(true);
  if (claim.tier === 'documented') {
    expect((claim.cites?.length || 0) + (claim.ref ? 1 : 0), `${where}: documented claim needs cites or ref`).toBeGreaterThan(0);
  }
  for (const id of claim.cites || []) expect(BRIEF_IDS.has(id), `${where}: unknown cite "${id}"`).toBe(true);
}

describe('evidence brief', () => {
  it('has unique ids (the news ingest builds a Set from them)', () => {
    expect(BRIEF_IDS.size).toBe(EVIDENCE_BRIEF.length);
  });
  it('dated entries use YYYY-MM as_of', () => {
    for (const e of EVIDENCE_BRIEF.filter(e => e.as_of)) expect(e.as_of).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('dimensions', () => {
  it('fills defaults and drops unknown values', () => {
    const p = normalizeParams({ relationship: 'nope', tone: 'shouty', concerns: 'hygiene,bogus,hygiene' });
    expect(p.relationship).toBe(DEFAULT_PARAMS.relationship);
    expect(p.tone).toBe('gentle');
    expect(p.concerns).toEqual(['hygiene']);
  });
  it('hides draft options unless includeDrafts', () => {
    expect(normalizeParams({ faith: 'jewish' }).faith).toBeNull();
    expect(normalizeParams({ faith: 'jewish' }, { includeDrafts: true }).faith).toBe('jewish');
  });
  it('round-trips through the query string', () => {
    const p = normalizeParams({ relationship: 'clinician', politics: 'conservative', concerns: ['uti', 'hiv-sti'], tone: 'direct' });
    const qs = paramsToQuery(p, { format: 'card' });
    expect(qs).toContain('format=card');
    expect(qs).not.toContain('language=');
    expect(queryToParams(qs)).toEqual(p);
  });
});

describe('modules', () => {
  it('every module claim is well-formed and cites known evidence', () => {
    for (const [key, m] of Object.entries(MODULES)) {
      if (m.opener) assertClaim(m.opener, `${key}.opener`);
      (m.points || []).forEach((c, i) => assertClaim(c, `${key}.points[${i}]`));
      for (const id of m.leadWith || []) expect(CARD_BY_ID[id], `${key} leads with unknown card ${id}`).toBeTruthy();
      for (const t of m.resourceTags || []) expect(RESOURCE_TAGS.has(t), `${key} unknown resource tag ${t}`).toBe(true);
      for (const v of m.voices || []) expect(v.quote && v.who && v.ref, `${key} voice needs quote/who/ref`).toBeTruthy();
    }
    Object.values(CORE).flat().forEach((c, i) => assertClaim(c, `CORE[${i}]`));
  });
  it('every non-multi dimension option (except tone/language) has a module', () => {
    for (const dim of DIMENSIONS.filter(d => ['relationship', 'stance', 'faith', 'politics'].includes(d.id))) {
      for (const opt of dim.options) expect(MODULES[`${dim.id}:${opt.id}`], `${dim.id}:${opt.id}`).toBeTruthy();
    }
  });
  it('draft status matches between dimensions and modules', () => {
    const faith = DIMENSIONS.find(d => d.id === 'faith');
    for (const opt of faith.options) {
      expect(MODULES[`faith:${opt.id}`].status === 'draft').toBe(opt.status === 'draft');
    }
    expect(getModule('faith', 'muslim')).toBeNull();
    expect(getModule('faith', 'muslim', { includeDrafts: true })).toBeTruthy();
  });
});

describe('cards', () => {
  it('every card is complete and well-sourced', () => {
    for (const card of CARDS) {
      expect(card.claim && card.askBack, card.id).toBeTruthy();
      expect(card.evidence.length, card.id).toBeGreaterThan(0);
      cardClaims(card).forEach((c, i) => assertClaim(c, `${card.id}[${i}]`));
      if (card.risk) expect(RISK_SCENARIOS[card.risk], card.id).toBeTruthy();
    }
  });
  it('every concern option has a card', () => {
    const concerns = DIMENSIONS.find(d => d.id === 'concerns').options;
    for (const o of concerns) expect(CARD_BY_ID[o.id], o.id).toBeTruthy();
  });
  it('the FGM card is Direct-only', () => {
    expect(cardAllowed(CARD_BY_ID['fgm-different'], 'direct')).toBe(true);
    expect(cardAllowed(CARD_BY_ID['fgm-different'], 'gentle')).toBe(false);
    expect(availableCards('clinical').some(c => c.id === 'fgm-different')).toBe(false);
  });
});

describe('composeGuide', () => {
  it('puts chosen concerns first and never trims them', () => {
    const concerns = ['uti', 'hiv-sti', 'penile-cancer', 'phimosis', 'hygiene', 'cost-insurance', 'safer-as-baby', 'look-like-dad'];
    const p = normalizeParams({ relationship: 'clinician', concerns });
    const ids = orderCardIds(p, [getModule('relationship', 'clinician')], { maxCards: 4 });
    expect(ids.slice(0, concerns.length)).toEqual(concerns);
  });
  it('fills with module leads up to maxCards', () => {
    const g = composeGuide({ relationship: 'expectant-parent' });
    expect(g.cards.length).toBe(6);
    expect(g.cards[0].id).toBe('hygiene');
  });
  it('drops the FGM card unless tone is direct', () => {
    const gentle = composeGuide({ relationship: 'friend', concerns: ['fgm-different'] });
    expect(gentle.cards.some(c => c.id === 'fgm-different')).toBe(false);
    const direct = composeGuide({ relationship: 'friend', concerns: ['fgm-different'], tone: 'direct' });
    expect(direct.cards[0].id).toBe('fgm-different');
  });
  it('places editorial positions in a sidebar unless direct', () => {
    expect(composeGuide({ tone: 'gentle' }).editorialPlacement).toBe('sidebar');
    expect(composeGuide({ tone: 'clinical' }).editorialPlacement).toBe('sidebar');
    expect(composeGuide({ tone: 'direct' }).editorialPlacement).toBe('main');
  });
  it('warns when a draft module is requested publicly, and includes it for curators', () => {
    const pub = composeGuide({ relationship: 'clergy', faith: 'jewish' });
    expect(pub.params.faith).toBeNull();
    expect(pub.warnings.join(' ')).toMatch(/Jewish.*review/);
    const cur = composeGuide({ relationship: 'clergy', faith: 'jewish' }, { includeDrafts: true });
    expect(cur.params.faith).toBe('jewish');
    expect(cur.warnings).toEqual([]);
  });
  it('returns a playbook for trolls, with no persuasion sections', () => {
    const g = composeGuide({ relationship: 'troll' });
    expect(g.mode).toBe('playbook');
    expect(g.playbook.safety.join(' ')).toMatch(/CyberTipline/);
    expect(g.commonGround).toBeUndefined();
  });
  it('never uses "mutilation" in gentle or clinical guide text', () => {
    for (const preset of PRESETS) {
      for (const tone of ['gentle', 'clinical']) {
        const g = composeGuide({ ...preset.params, tone });
        const { language, ...rest } = g;
        expect(JSON.stringify(rest).toLowerCase(), `${preset.id}/${tone}`).not.toContain('mutilat');
        if (g.mode === 'guide') expect(language.avoid).toContain('mutilation');
      }
    }
  });
  it('builds every Series preset cleanly with resolvable citations', () => {
    for (const preset of PRESETS) {
      const g = composeGuide(preset.params);
      expect(g.warnings, preset.id).toEqual([]);
      expect(g.title, preset.id).toBeTruthy();
      if (g.mode === 'guide') {
        expect(g.commonGround.length, preset.id).toBeGreaterThan(0);
        expect(g.citations.length, preset.id).toBeGreaterThan(0);
        expect(g.resources.length, preset.id).toBeGreaterThan(0);
      }
    }
  });
  it('is deterministic', () => {
    const p = { relationship: 'grandparent', politics: 'conservative', faith: 'catholic', concerns: ['uti'] };
    expect(composeGuide(p)).toEqual(composeGuide(p));
  });
  it('renders Markdown with sources for the Report Builder', () => {
    const md = guideToMarkdown(composeGuide({ relationship: 'clinician', concerns: ['uti'] }));
    expect(md).toMatch(/^## For Pediatricians/);
    expect(md).toContain('### Sources');
    expect(md).toContain('[singh-grewal-2005]');
    expect(guideToMarkdown(composeGuide({ relationship: 'troll' }))).toContain('### Safety');
  });
  it('resolves language tokens', () => {
    expect(resolveLanguage('{{Procedure}} is {{procedure}}', 'cutting')).toBe('Genital cutting is genital cutting');
    expect(resolveLanguage('{{procedure}}')).toBe('circumcision');
  });
  it('collectCitations reports unknown ids', () => {
    const { citations, unknown } = collectCitations([{ cites: ['aap-2012', 'nope'] }]);
    expect(citations.map(c => c.id)).toEqual(['aap-2012']);
    expect(unknown).toEqual(['nope']);
  });
});

describe('survey facts (small-sample rule)', () => {
  it('never exposes counts for groups under 30', () => {
    const facts = surveyFactsFor(normalizeParams({ faith: 'jewish' }, { includeDrafts: true }));
    const g = facts.groups[0];
    expect(g.small).toBe(true);
    expect(g.text).not.toMatch(/\b12\b/);
    expect(g.text).toContain(`fewer than ${SMALL_N}`);
  });
  it('reports combined counts for larger groups', () => {
    const facts = surveyFactsFor(normalizeParams({ politics: 'conservative', faith: 'catholic' }));
    expect(facts.groups.map(g => g.n)).toEqual([176, 229]);
    expect(facts.groups[0].text).toContain('176 of the Inquiry\'s 516');
  });
  it('treats exactly 30 as not small', () => {
    expect(describeGroup('x', 29).small).toBe(true);
    expect(describeGroup('x', 30).small).toBe(false);
  });
  it('libertarians (n=8) are small', () => {
    expect(surveyFactsFor(normalizeParams({ politics: 'libertarian' })).groups[0].small).toBe(true);
  });
});

describe('risk reality', () => {
  it('reproduces the UTI meta-analysis NNT (~111)', () => {
    const s = riskStats(RISK_SCENARIOS.uti);
    expect(s.nnt).toBeGreaterThanOrEqual(110);
    expect(s.nnt).toBeLessThanOrEqual(113);
  });
  it('computes absolute vs relative reduction', () => {
    const s = riskStats({ baselineRisk: 0.002, relativeReduction: 0.6 });
    expect(s.arr).toBeCloseTo(0.0012, 6);
    expect(s.nnt).toBe(834);
  });
  it('handles zero and invalid inputs', () => {
    expect(riskStats({ baselineRisk: 0.01, relativeReduction: 0 }).nnt).toBe(Infinity);
    expect(riskStats({ baselineRisk: 'x', relativeReduction: 2 }).baselineRisk).toBe(0);
    expect(formatNNT(Infinity)).toMatch(/no measurable/);
  });
  it('formats percentages', () => {
    expect(formatPct(0.0042)).toBe('0.42%');
    expect(formatPct(0.5)).toBe('50%');
    expect(formatPct(0.00001)).toBe('<0.01%');
    expect(formatPct(0)).toBe('0%');
  });
  it('only documented scenarios lack the illustrative flag', () => {
    for (const s of Object.values(RISK_SCENARIOS)) {
      expect(['documented', 'illustrative']).toContain(s.status);
      for (const id of s.cites) expect(BRIEF_IDS.has(id), id).toBe(true);
    }
  });
});
