import { describe, it, expect } from 'vitest';
import { hasMarkdownFormatting, formatPlainTextToMarkdown, formatExecutiveSummary } from './formatMarkdown';

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

