import { describe, it, expect } from 'vitest';
import { 
  hasMarkdownFormatting, 
  formatPlainTextToMarkdown, 
  formatExecutiveSummary,
  cleanLatexAndMathArtifacts,
  parseRtfToText,
  parseCsvToMarkdownTable,
  normalizeDocumentText
} from './formatMarkdown';

describe('formatMarkdown', () => {
  it('detects existing markdown formatting', () => {
    expect(hasMarkdownFormatting('# Title\n\nSome text')).toBe(true);
    expect(hasMarkdownFormatting('## Section\n\nSome text')).toBe(true);
    expect(hasMarkdownFormatting('| Col 1 | Col 2 |\n|---|---|')).toBe(true);
    expect(hasMarkdownFormatting('Just a plain text paragraph with no formatting.')).toBe(false);
  });

  it('promotes common all-caps section headings to ### Markdown headings', () => {
    const raw = `
ABSTRACT
The United States has poorer child health outcomes.

1. INTRODUCTION
Recent studies show persistent child poverty.

METHODS
We examined mortality trends across nineteen countries.

CONCLUSION
Policy interventions should focus on infants.
    `.trim();

    const formatted = formatPlainTextToMarkdown(raw);
    expect(formatted).toContain('### Abstract');
    expect(formatted).toContain('### Introduction');
    expect(formatted).toContain('### Methods');
    expect(formatted).toContain('### Conclusion');
  });

  it('repairs OCR line-wrap hyphenation', () => {
    const raw = 'We compared fifty-year trends across nineteen compara-\ntor nations in the study.';
    const formatted = formatPlainTextToMarkdown(raw);
    expect(formatted).toContain('comparator nations');
  });

  it('preserves text that already has markdown formatting', () => {
    const md = '# Real Markdown Document\n\n**Author:** Jane Doe\n\n* Item 1\n* Item 2';
    expect(formatPlainTextToMarkdown(md)).toBe(md);
  });
});

describe('formatExecutiveSummary', () => {
  it('breaks dense unbroken walls of text into 2-3 sentence paragraphs', () => {
    const raw = "The United States has poorer child health outcomes than other wealthy nations despite greater per capita spending on health care for children. To better understand this phenomenon, we examined mortality trends for the US and nineteen comparator nations in the Organization for Economic Cooperation and Development for children ages 0–19 from 1961 to 2010 using publicly available data. While child mortality progressively declined across all countries, mortality in the US has been higher than in peer nations since the 1980s. From 2001 to 2010 the risk of death in the US was 76 percent greater for infants and 57 percent greater for children ages 1–19. During this decade, children ages 15–19 were eighty-two times more likely to die from gun homicide in the US. Over the fifty-year study period, the lagging US performance amounted to over 600,000 excess deaths. Policy interventions should focus on infants and on children ages 15–19, the two age groups with the greatest disparities, by addressing perinatal causes of death, automobile accidents, and assaults by firearm.";

    const formatted = formatExecutiveSummary(raw);
    const paragraphs = formatted.split('\n\n');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]).toContain('The United States has poorer child health outcomes');
    expect(paragraphs[1]).toContain('While child mortality progressively declined');
    expect(paragraphs[2]).toContain('Over the fifty-year study period');
  });

  it('formats unordered lists with bullets into clean markdown list items', () => {
    const raw = "Key findings include:\n• 45% cited cultural traditions\n• 30% cited medical recommendations\n• 25% cited bodily autonomy concerns.";
    const formatted = formatExecutiveSummary(raw);
    expect(formatted).toContain('- 45% cited cultural traditions\n- 30% cited medical recommendations\n- 25% cited bodily autonomy concerns.');
  });

  it('formats ordered lists into clean markdown numbered lists', () => {
    const raw = "The committee evaluated three proposed procedural modifications: 1) mandatory informed consent, 2) required anesthesia protocol, and 3) post-operative monitoring standards.";
    const formatted = formatExecutiveSummary(raw);
    expect(formatted).toContain('1. mandatory informed consent');
    expect(formatted).toContain('2. required anesthesia protocol');
    expect(formatted).toContain('3. post-operative monitoring standards.');
  });

  it('formats academic section headers into bold lead-in titles', () => {
    const raw = "BACKGROUND: Circumcision rates have declined. OBJECTIVES: To evaluate trends. METHODS: We conducted surveys. RESULTS: Findings confirmed changes. CONCLUSIONS: Further study needed.";
    const formatted = formatExecutiveSummary(raw);
    expect(formatted).toContain('**Background:** Circumcision rates have declined.');
    expect(formatted).toContain('**Objectives:** To evaluate trends.');
    expect(formatted).toContain('**Methods:** We conducted surveys.');
    expect(formatted).toContain('**Results:** Findings confirmed changes.');
    expect(formatted).toContain('**Conclusions:** Further study needed.');
  });
});

describe('parseRtfToText', () => {
  it('parses basic RTF documents with control words and paragraphs', () => {
    const rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\viewkind4\\uc1\\pard\\b Historical Overview\\b0\\par A detailed analysis of neonatal policies.\\par}';
    const parsed = parseRtfToText(rtf);
    expect(parsed).toContain('**Historical Overview**');
    expect(parsed).toContain('A detailed analysis of neonatal policies.');
  });

  it('decodes hex character entities and Unicode escapes', () => {
    const rtf = '{\\rtf1\\ansi\\deff0 Complications occurred in 1990\\\'92s cohort \\u8212? an unexpected result.\\par}';
    const parsed = parseRtfToText(rtf);
    expect(parsed).toContain("1990’s cohort — an unexpected result.");
  });

  it('returns raw text unchanged if not RTF', () => {
    const plain = 'Normal non-RTF text document.';
    expect(parseRtfToText(plain)).toBe(plain);
  });
});

describe('parseCsvToMarkdownTable', () => {
  it('converts comma-separated values into a GitHub markdown table', () => {
    const csv = 'Year,Region,Rate\n2018,Midwest,68.5%\n2020,West,19.7%';
    const table = parseCsvToMarkdownTable(csv);
    expect(table).toContain('| Year | Region | Rate |');
    expect(table).toContain('| --- | --- | --- |');
    expect(table).toContain('| 2018 | Midwest | 68.5% |');
    expect(table).toContain('| 2020 | West | 19.7% |');
  });

  it('handles quotes with embedded commas properly', () => {
    const csv = 'ID,Title,Author\n1,"Study, Part 1","Smith, John"\n2,"Report 2","Doe, Jane"';
    const table = parseCsvToMarkdownTable(csv);
    expect(table).toContain('| Study, Part 1 | Smith, John |');
  });

  it('handles tab-delimited values (TSV)', () => {
    const tsv = 'Country\tPrevalence\tYear\nUSA\t80.5%\t2020\nGhana\t92.0%\t2017';
    const table = parseCsvToMarkdownTable(tsv);
    expect(table).toContain('| Country | Prevalence | Year |');
    expect(table).toContain('| USA | 80.5% | 2020 |');
  });
});

describe('normalizeDocumentText', () => {
  it('routes .rtf files to RTF parser', () => {
    const rtf = '{\\rtf1\\ansi\\pard\\b Test Header\\b0\\par Test body text.\\par}';
    const res = normalizeDocumentText(rtf, 'sample.rtf');
    expect(res).toContain('**Test Header**');
  });

  it('routes .csv files to CSV table formatter', () => {
    const csv = 'Metric,Value\nTotal,100';
    const res = normalizeDocumentText(csv, 'stats.csv');
    expect(res).toContain('| Metric | Value |');
  });

  it('routes .json files to formatted JSON code block', () => {
    const json = '{"status":"ok","count":42}';
    const res = normalizeDocumentText(json, 'data.json');
    expect(res).toContain('```json');
    expect(res).toContain('"status": "ok"');
  });

  it('routes standard unformatted text to formatPlainTextToMarkdown', () => {
    const text = 'ABSTRACT\nThis is a research document.';
    const res = normalizeDocumentText(text, 'article.txt');
    expect(res).toContain('### Abstract');
  });
});

describe('cleanLatexAndMathArtifacts', () => {
  it('converts LaTeX superscripts to clean Unicode superscripts', () => {
    const raw = 'Smith$^1$, Doe$^{2}$, and Lee$^{1,2,\\dagger}$';
    const cleaned = cleanLatexAndMathArtifacts(raw);
    expect(cleaned).toBe('Smith¹, Doe², and Lee¹,²,†');
  });

  it('converts mathematical symbols and Greek letters to Unicode', () => {
    const raw = 'Risk ratio was $1.25 \\pm 0.05$ with $p \\le 0.01$, $\\chi^2 = 14.2$, and $N = 500 \\times 2$.';
    const cleaned = cleanLatexAndMathArtifacts(raw);
    expect(cleaned).toContain('±');
    expect(cleaned).toContain('≤');
    expect(cleaned).toContain('χ²');
    expect(cleaned).toContain('×');
    expect(cleaned).not.toContain('\\pm');
    expect(cleaned).not.toContain('\\le');
  });

  it('cleans author affiliation blocks and dagger notes as reported by user', () => {
    const userSample = `$^1$ School of Paediatrics and Child Health, University of Western Australia, Perth, Australia
$^2$ Kintampo Health Research Centre, Ghana Health Service, Kintampo, Ghana
$^3$ Engender Health, New York, USA
$^4$ School of Public Health, Kwame Nkrumah University of Science and Technology, Kumasi, Ghana
$^5$ Faculty of Epidemiology and Population Health, London School of Hygiene and Tropical Medicine, London, UK
$^\\dagger$Contributed equally.
Abstract
objective Male circumcision services have expanded throughout Africa as part of a long-term HIV prevention strategy. We assessed the effect of type of service provider (formal and informal) and hygiene practices on circumcision-related morbidities in rural Ghana.
methods Population-based, cross-sectional study con`;

    const normalized = normalizeDocumentText(userSample, 'ghana-study.txt');
    expect(normalized).not.toContain('$^1$');
    expect(normalized).not.toContain('$^\\dagger$');
    expect(normalized).not.toContain('<sup>');
    expect(normalized).toContain('¹ School of Paediatrics');
    expect(normalized).toContain('†Contributed equally.');
    expect(normalized).toContain('### Objective');
    expect(normalized).toContain('### Methods');
  });
});

