/**
 * Utility to ensure raw OCR or unformatted plain text is formatted cleanly as Markdown.
 * If text already contains Markdown structure (headers, lists, tables), it is preserved.
 * If text is plain unformatted OCR text, it normalizes line wraps, promotes section
 * headings (e.g. ABSTRACT, METHODS, CONCLUSION) to Markdown headings, and fixes broken word hyphenation.
 */

const COMMON_SECTION_HEADINGS = [
  'ABSTRACT',
  'BACKGROUND',
  'INTRODUCTION',
  'OBJECTIVE',
  'OBJECTIVES',
  'PURPOSE',
  'DESIGN',
  'SETTING',
  'PARTICIPANTS',
  'INTERVENTIONS',
  'INTERVENTION',
  'MEASUREMENTS',
  'MAIN OUTCOME MEASURES',
  'MAIN OUTCOME MEASURE',
  'MATERIALS AND METHODS',
  'METHODS',
  'METHODOLOGY',
  'RESULTS',
  'DISCUSSION',
  'CONCLUSION',
  'CONCLUSIONS',
  'SUMMARY',
  'KEY FINDINGS',
  'FINDINGS',
  'SIGNIFICANCE',
  'CASE REPORT',
  'CASE STUDY',
  'COMMENTARY',
  'EDITORIAL',
  'LIMITATIONS',
  'CLINICAL IMPLICATIONS',
  'POLICY IMPLICATIONS',
  'RECOMMENDATIONS',
  'EXECUTIVE SUMMARY',
  'ACKNOWLEDGEMENTS',
  'ACKNOWLEDGMENTS',
  'CONFLICT OF INTEREST',
  'DISCLOSURES',
  'FUNDING',
  'REFERENCES',
  'BIBLIOGRAPHY',
  'LITERATURE CITED',
  'NOTES',
  'APPENDIX'
];

export function hasMarkdownFormatting(text) {
  if (!text || typeof text !== 'string') return false;
  // Check for common markdown syntax markers
  const hasHeadings = /^#{1,6}\s+/m.test(text);
  const hasBold = /\*\*[^*]+\*\*/.test(text);
  const hasLists = /^(\s*[-*+]|\s*\d+\.)\s+/m.test(text);
  const hasBlockquotes = /^>\s+/m.test(text);
  const hasTables = /\|.*\|.*\|/m.test(text);
  return hasHeadings || (hasBold && hasLists) || hasTables || hasBlockquotes;
}

export function formatPlainTextToMarkdown(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If it already has structured markdown headers or tables, return as-is
  if (hasMarkdownFormatting(text)) {
    return text;
  }

  // 1. Repair OCR hyphenation across line breaks (e.g. "compara-\ntor" -> "comparator")
  text = text.replace(/([a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,})/g, '$1$2');

  // 2. Identify and promote academic/legal section headers to '### Heading'
  const headingRegex = new RegExp(
    `^(?:(?:[0-9IVX]+\\.\\s*)?(${COMMON_SECTION_HEADINGS.join('|')})[:.]?)\\s*$`,
    'gim'
  );
  text = text.replace(headingRegex, (match, heading) => {
    // Title Case the heading
    const titleCased = heading.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return `\n\n### ${titleCased}\n\n`;
  });

  // 3. Promote "Table N." or "Figure N." caption lines to bold subheadings
  text = text.replace(/^(TABLE\s+\d+[:.]?[^\n]*)/gim, '\n\n**$1**\n\n');
  text = text.replace(/^(FIGURE\s+\d+[:.]?[^\n]*)/gim, '\n\n**$1**\n\n');

  // 4. Clean up paragraph breaks:
  text = text.replace(/([.!?])\n([A-Z"'])/g, '$1\n\n$2');

  // 5. Clean up excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

function protectAbbreviations(str) {
  const abbrevs = [
    [/(\bU\.S\.)/g, 'U__DOT__S__DOT__'],
    [/(\bU\.K\.)/g, 'U__DOT__K__DOT__'],
    [/(\be\.g\.)/g, 'e__DOT__g__DOT__'],
    [/(\bi\.e\.)/g, 'i__DOT__e__DOT__'],
    [/(\bet al\.)/g, 'et al__DOT__'],
    [/(\bvs\.)/g, 'vs__DOT__'],
    [/(\bDr\.)/g, 'Dr__DOT__'],
    [/(\bMr\.)/g, 'Mr__DOT__'],
    [/(\bMrs\.)/g, 'Mrs__DOT__'],
    [/(\bMs\.)/g, 'Ms__DOT__'],
    [/(\bProf\.)/g, 'Prof__DOT__'],
    [/(\bFig\.)/g, 'Fig__DOT__'],
    [/(\bNo\.)/g, 'No__DOT__'],
    [/(\bVol\.)/g, 'Vol__DOT__'],
    [/(\bpp\.)/g, 'pp__DOT__'],
    [/(\bp\.)/g, 'p__DOT__'],
    [/(\b(\d+)\.(\d+)\b)/g, '$1__NUMDOT__$2']
  ];
  let res = str;
  for (const [rgx, repl] of abbrevs) {
    res = res.replace(rgx, repl);
  }
  return res;
}

function restoreAbbreviations(str) {
  return str.replace(/__NUMDOT__/g, '.').replace(/__DOT__/g, '.');
}

function splitIntoSentences(str) {
  if (!str) return [];
  const protectedText = protectAbbreviations(str);
  const pieces = [];
  let start = 0;
  // Match period, exclamation, or question mark followed by whitespace and an uppercase letter or quote, or end of string
  const regex = /[.!?]+(?=\s+[A-Z"']|$)/g;
  let match;
  while ((match = regex.exec(protectedText)) !== null) {
    const end = match.index + match[0].length;
    const sentence = protectedText.slice(start, end).trim();
    if (sentence) {
      pieces.push(restoreAbbreviations(sentence));
    }
    start = end;
  }
  if (start < protectedText.length) {
    const tail = protectedText.slice(start).trim();
    if (tail) {
      pieces.push(restoreAbbreviations(tail));
    }
  }
  return pieces.length > 0 ? pieces : [str.trim()];
}

function chunkSentences(sentences) {
  const n = sentences.length;
  if (n <= 3) return [sentences];
  
  if (n === 4) {
    return [sentences.slice(0, 2), sentences.slice(2)];
  }
  if (n === 5) {
    return [sentences.slice(0, 2), sentences.slice(2)];
  }
  if (n === 6) {
    return [sentences.slice(0, 3), sentences.slice(3)];
  }
  if (n === 7) {
    return [sentences.slice(0, 2), sentences.slice(2, 5), sentences.slice(5)];
  }

  const chunks = [];
  let current = [];
  for (let i = 0; i < n; i++) {
    current.push(sentences[i]);
    const remaining = n - (i + 1);
    if (current.length >= 2 && remaining !== 1) {
      chunks.push(current);
      current = [];
    } else if (current.length >= 3) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
}

/**
 * Formats an executive summary or document abstract cleanly:
 * 1. Normalizes and structures ordered and unordered lists (e.g. •, -, *, 1., 2., 1), 2)).
 * 2. Formats section headings (Background, Methods, Results, Conclusions, etc.) as bold headers on new paragraphs.
 * 3. Intelligently breaks unbroken walls of text into balanced, readable paragraphs of 2-3 sentences.
 * 4. Preserves abbreviations (U.S., Dr., et al., e.g., i.e.) and decimal numbers (76.5%, $1.2B).
 */
export function formatExecutiveSummary(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Normalize Unicode bullets to markdown standard '- '
  text = text.replace(/^[ \t]*[•▪▫–—][ \t]+/gm, '- ');

  // Promote section headers at line starts or sentence boundaries to **Heading:** with paragraph breaks
  // Avoid lookbehinds for universal engine compatibility
  const headerPattern = COMMON_SECTION_HEADINGS.join('|');
  const sectionRegex = new RegExp(
    `(^|\\n|[.!?]\\s+)\\b(${headerPattern})[:.]\\s*`,
    'gi'
  );
  text = text.replace(sectionRegex, (match, prefix, header) => {
    const titleCased = header.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    const sep = prefix ? (prefix.endsWith('\n') ? prefix : `${prefix.trim()}\n\n`) : '';
    return `${sep}**${titleCased}:** `;
  });

  // Handle inline ordered lists like "(1) ... (2) ... (3) ..." or "1) ... 2) ... 3) ..."
  if (/(?:(?:\(|\[)\s*1\s*(?:\)|\])|(?:^|\s)1\))\s+[A-Za-z]/.test(text) &&
      /(?:(?:\(|\[)\s*2\s*(?:\)|\])|(?:^|\s)2\))\s+[A-Za-z]/.test(text)) {
    text = text.replace(/(?:(?:\(|\[)\s*(\d+)\s*(?:\)|\])|(?:^|\s)(\d+)\))\s+/g, (m, d1, d2) => {
      const num = d1 || d2;
      return `\n\n${num}. `;
    });
  }

  // Handle inline bullet characters like "...: • point 1 • point 2 • point 3"
  if (/[•▪▫]/.test(text)) {
    text = text.replace(/\s*[•▪▫]\s+/g, '\n\n- ');
  }

  // Normalize existing lines that start with "1) ", "2) ", etc. to standard markdown "1. ", "2. "
  text = text.replace(/^[ \t]*(\d+)\)[ \t]+/gm, '$1. ');

  // Tighten lists without while loops
  text = text.replace(/((?:^|\n)[ \t]*[-*+]\s+[^\n]+)\n+(?=[ \t]*[-*+]\s+)/g, '$1\n');
  text = text.replace(/((?:^|\n)[ \t]*\d+\.\s+[^\n]+)\n+(?=[ \t]*\d+\.\s+)/g, '$1\n');

  // Inspect paragraphs separated by \n\n
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const formattedParagraphs = [];

  for (const para of paragraphs) {
    // If paragraph is already a list or header, preserve as-is
    const isListOrHeader = /^(?:[-*+]\s|\d+\.\s|#{1,6}\s|>\s)/m.test(para);
    if (isListOrHeader) {
      formattedParagraphs.push(para);
      continue;
    }

    // Check if paragraph is a wall of text that needs sentence chunking
    const sentences = splitIntoSentences(para);
    if (sentences.length >= 4) {
      const chunks = chunkSentences(sentences);
      for (const chunk of chunks) {
        formattedParagraphs.push(chunk.join(' '));
      }
    } else {
      formattedParagraphs.push(para);
    }
  }

  return formattedParagraphs.join('\n\n');
}
