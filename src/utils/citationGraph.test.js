import { describe, it, expect } from 'vitest';
import {
  extractYear, citationAuthorKey, documentAuthorKey, citationTitle, parseCitation, citationLabel,
  buildCitationGraph, topCited, citationSpan, selectView,
} from './citationGraph';

const doc = (id, meta, extra = {}) => ({ id, type: 'document', metadata_json: JSON.stringify(meta), ...extra });

describe('extractYear', () => {
  it('finds plausible publication years only', () => {
    expect(extractYear('Pediatrics. 1999;103(3):686-693.')).toBe(1999);
    expect(extractYear('(1986). Neonatal Pain Cries')).toBe(1986);
    expect(extractYear('1.7 million boys')).toBeNull();
    expect(extractYear(undefined)).toBeNull();
  });
});

describe('citationAuthorKey', () => {
  it.each([
    ['Anand KJS, Hickey PR. Pain and its effects in the human neonate. N Engl J Med. 1987;317:1321.', 'anand'],
    ['Anand, K. J. S., & Hickey, P. R. (1987). Pain and Its Effects in the Human Neonate.', 'anand'],
    ['Bratu et al., 2005', 'bratu'],
    ['Crawford & Daum, 2005', 'crawford'],
    ['Hunter RH. Notes on the development of the prepuce. J Anat. 1935;70:68-75.', 'hunter'],
    ['R. H. Hunter, Notes on the prepuce', 'hunter'],
    ['Maimonides. Guide for the Perplexed. Part III, chapter XLIX.', 'maimonides'],
    ['Spock, B.', 'spock'],
  ])('reduces "%s" to the first author surname', (input, expected) => {
    expect(citationAuthorKey(input)).toBe(expected);
  });

  it('keeps organisation names distinctive', () => {
    expect(citationAuthorKey('American Academy of Pediatrics Task Force on Circumcision. Circumcision Policy Statement.'))
      .toBe('american academy pediatrics');
    expect(citationAuthorKey('American Academy of Pediatrics (1975 declaration on routine circumcision)'))
      .toBe('american academy pediatrics');
    expect(citationAuthorKey('Journal of Pediatric Surgery (November 2024 study)')).toBe('journal pediatric surgery');
    expect(citationAuthorKey('JAMA Pediatrics (2014 study on 1.4 million males)')).toBe('jama pediatrics');
  });
});

describe('documentAuthorKey', () => {
  it('reduces natural-order personal names to the surname', () => {
    expect(documentAuthorKey('George C. Denniston, MD, MPH')).toBe('denniston');
    expect(documentAuthorKey('Marilyn Faye Milos, R.N.')).toBe('milos');
    expect(documentAuthorKey('Dr. Tim Hammond')).toBe('hammond');
  });

  it('keeps organisations as key words', () => {
    expect(documentAuthorKey('NOHARMM (National Organization to Halt the Abuse)')).toBe('noharmm');
    expect(documentAuthorKey('American Academy of Pediatrics')).toBe('american academy pediatrics');
  });

  it('handles empty input', () => {
    expect(documentAuthorKey(null)).toBe('');
  });
});

describe('citationTitle', () => {
  it('extracts APA titles', () => {
    expect(citationTitle('Porter, F. L. (1986). Neonatal Pain Cries: Effect of Circumcision. Child Development, 57(3).'))
      .toBe('Neonatal Pain Cries: Effect of Circumcision');
  });

  it('extracts Vancouver titles', () => {
    expect(citationTitle('Anand KJS, Hickey PR. Pain and its effects in the human neonate and fetus. N Engl J Med. 1987;317:1321-1326.'))
      .toBe('Pain and its effects in the human neonate and fetus');
  });

  it('returns null when there is no recognisable title', () => {
    expect(citationTitle('Bratu et al., 2005')).toBeNull();
  });
});

describe('parseCitation / citationLabel', () => {
  it('gives APA and Vancouver variants of the same paper the same key', () => {
    const a = parseCitation('Anand KJS, Hickey PR. Pain and its effects in the human neonate and fetus. N Engl J Med. 1987;317:1321-1326.');
    const b = parseCitation('Anand, K. J. S., & Hickey, P. R. (1987). Pain and Its Effects in the Human Neonate and Fetus. NEJM, 317(21).');
    expect(a.key).toBe('anand|1987');
    expect(b.key).toBe(a.key);
  });

  it('builds readable labels', () => {
    expect(citationLabel(parseCitation('Bratu et al., 2005'))).toBe('Bratu (2005)');
    expect(citationLabel(parseCitation('American Academy of Pediatrics (1975 statement)'))).toBe('American Academy Pediatrics (1975)');
  });

  it('rejects junk', () => {
    expect(parseCitation('')).toBeNull();
    expect(parseCitation('  ')).toBeNull();
  });
});

describe('buildCitationGraph', () => {
  const ANAND_V = 'Anand KJS, Hickey PR. Pain and its effects in the human neonate and fetus. N Engl J Med. 1987;317:1321-1326.';
  const ANAND_A = 'Anand, K. J. S., & Hickey, P. R. (1987). Pain and Its Effects in the Human Neonate and Fetus. NEJM.';
  const docs = [
    doc('milos89', { academic_title: 'Circumcision, Developmental Impairment, and Life-Long Consequences', author: 'Marilyn Faye Milos, R.N.', date: '1989-08',
      citations: [ANAND_V, 'Spock, B.'] }, { category: 'Activism' }),
    doc('noharmm91', { academic_title: 'Neonatal Pain, Circumcision, and Long-Term Psychological Effects', author: 'NOHARMM', date: '1991',
      citations: [ANAND_A, 'Milos MF. Circumcision, Developmental Impairment, and Life-Long Consequences. Address. 1989.'] }, { category: 'Medical Research' }),
    doc('case92', { academic_title: 'The Case Against Circumcision', date: '1992',
      citations: [ANAND_V, ANAND_A, 'Spock B, Rothenberg MB. Dr. Spock\u2019s Baby and Child Care. 6th ed. 1992:227.'] }),
    doc('nocites', { academic_title: 'A document with no references at all', date: '2001' }),
    doc('rejected', { academic_title: 'Rejected', citations: [ANAND_V] }, { status: 'rejected' }),
  ];
  const graph = buildCitationGraph(docs);

  it('merges citation variants into one external work and counts each citing doc once', () => {
    const anand = graph.nodes.get('ext:anand|1987');
    expect(anand).toBeTruthy();
    expect(anand.kind).toBe('external');
    expect(anand.citedBy.size).toBe(3); // case92 lists it twice but counts once; rejected doc ignored
    expect(anand.title).toMatch(/Pain and its effects/i);
  });

  it('resolves citations to archive documents by title', () => {
    const milos = graph.nodes.get('doc:milos89');
    expect(milos.kind).toBe('archive');
    expect([...milos.citedBy]).toEqual(['doc:noharmm91']);
    expect(graph.links.find(l => l.source === 'doc:noharmm91' && l.target === 'doc:milos89').internal).toBe(true);
  });

  it('omits documents without citations and rejected documents', () => {
    expect(graph.nodes.has('doc:nocites')).toBe(false);
    expect(graph.nodes.has('doc:rejected')).toBe(false);
  });

  it('reports summary stats', () => {
    expect(graph.stats.citingDocs).toBe(3);
    expect(graph.stats.internalLinks).toBe(1);
  });

  it('collapses duplicate copies of the same document', () => {
    const twin = doc('milos89-txt', { academic_title: 'Circumcision, Developmental Impairment, and Life-Long Consequences', date: '1989-08', citations: [ANAND_V] });
    const g = buildCitationGraph([...docs, twin]);
    expect(g.nodes.get('ext:anand|1987').citedBy.size).toBe(3);
  });

  it('resolves by unique author + year when titles do not match', () => {
    const g = buildCitationGraph([
      doc('denniston92', { academic_title: 'Unnecessary Circumcision', author: 'George C. Denniston, MD, MPH', date: '1992-07' }),
      doc('citer', { academic_title: 'Some later review of the literature', date: '1995', citations: ['Denniston GC. Rethinking a routine newborn procedure. Female Patient. 1992;17:13-14.'] }),
    ]);
    expect(g.nodes.get('doc:denniston92').citedBy.has('doc:citer')).toBe(true);
  });

  it('ignores self-citations', () => {
    const g = buildCitationGraph([
      doc('self', { academic_title: 'A Paper That Lists Its Own Title As A Reference', date: '2000',
        citations: ['Smith J. A Paper That Lists Its Own Title As A Reference. Journal. 2000.'] }),
    ]);
    expect(g.links).toHaveLength(0);
  });

  it('survives empty input', () => {
    expect(buildCitationGraph().nodes.size).toBe(0);
    expect(buildCitationGraph(null).links).toEqual([]);
  });
});

describe('topCited / citationSpan / selectView', () => {
  const graph = buildCitationGraph([
    doc('a', { academic_title: 'First citing document title here', date: '1985', citations: ['Hunter RH. Notes on the prepuce. J Anat. 1935.', 'Bratu et al., 2005'] }),
    doc('b', { academic_title: 'Second citing document title here', date: '1999', citations: ['Hunter, R. H. (1935). Notes on the prepuce.'] }),
    doc('c', { academic_title: 'Third citing document title here', date: '2010', citations: ['Hunter RH. Notes on the prepuce. J Anat. 1935.'] }),
  ]);

  it('ranks the most-cited work first', () => {
    const [top] = topCited(graph, 5);
    expect(top.id).toBe('ext:hunter|1935');
    expect(top.citedBy.size).toBe(3);
    expect(topCited(graph, 5, { kind: 'archive' })).toEqual([]);
    expect(topCited(null)).toEqual([]);
  });

  it('measures how long a work stayed influential', () => {
    expect(citationSpan(graph, 'ext:hunter|1935')).toEqual({ from: 1985, to: 2010, count: 3 });
    expect(citationSpan(graph, 'nope')).toBeNull();
  });

  it('filters weakly-cited external works out of the view', () => {
    const view = selectView(graph, { viewMode: 'all', minCitations: 2 });
    const ids = view.nodes.map(n => n.id);
    expect(ids).toContain('ext:hunter|1935');
    expect(ids).not.toContain('ext:bratu|2005');
    expect(view.links).toHaveLength(3);
  });

  it('shows everything at minCitations 1 and nothing external in archive-only mode', () => {
    expect(selectView(graph, { viewMode: 'all', minCitations: 1 }).nodes.map(n => n.id)).toContain('ext:bratu|2005');
    expect(selectView(graph, { viewMode: 'all', archiveOnly: true }).nodes).toEqual([]);
  });

  it('returns fresh link objects so the force layout cannot mutate the graph', () => {
    const view = selectView(graph, { viewMode: 'all', minCitations: 1 });
    view.links[0].source = { id: 'mutated' };
    expect(typeof graph.links[0].source).toBe('string');
  });
});
