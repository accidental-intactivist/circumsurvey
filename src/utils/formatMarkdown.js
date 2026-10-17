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

const UNICODE_SUPERSCRIPTS = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'i': 'ⁱ', 'n': 'ⁿ', 'r': 'ʳ', 't': 'ᵗ', 'x': 'ˣ',
  '*': '*', '†': '†', '‡': '‡', '§': '§'
};

const UNICODE_SUBSCRIPTS = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ'
};

export function toUnicodeSuperscript(str) {
  if (!str) return '';
  return str.split('').map(ch => UNICODE_SUPERSCRIPTS[ch] || ch).join('');
}

export function toUnicodeSubscript(str) {
  if (!str) return '';
  return str.split('').map(ch => UNICODE_SUBSCRIPTS[ch] || ch).join('');
}

export function cleanLatexAndMathArtifacts(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText;

  // 1. TeX formatting commands
  text = text.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
  text = text.replace(/\\(?:textit|emph)\{([^}]+)\}/g, '*$1*');
  text = text.replace(/\\textsc\{([^}]+)\}/g, '$1');

  // 2. TeX Superscripts and Subscripts -> Unicode superscripts/subscripts
  text = text.replace(/\$\^\{?([^$]+?)\}?\$/g, (_, inner) => {
    const cleanInner = inner
      .replace(/\\dagger/g, '†')
      .replace(/\\ddagger/g, '‡')
      .replace(/\\(?:ast|star)/g, '*')
      .replace(/\\S/g, '§')
      .replace(/\\#/g, '#');
    return toUnicodeSuperscript(cleanInner.trim());
  });

  // Handle \textsuperscript{...} and \textsubscript{...}
  text = text.replace(/\\textsuperscript\{([^}]+)\}/g, (_, inner) => {
    const cleanInner = inner.replace(/\\dagger/g, '†').replace(/\\ddagger/g, '‡');
    return toUnicodeSuperscript(cleanInner.trim());
  });
  text = text.replace(/\\textsubscript\{([^}]+)\}/g, (_, inner) => {
    return toUnicodeSubscript(inner.trim());
  });

  // Handle bare subscripts like $_2$ or $_{...}$
  text = text.replace(/\$_\{?([0-9a-zA-Z,\s]+)\}?\$/g, (_, inner) => {
    return toUnicodeSubscript(inner.trim());
  });

  // Handle existing <sup> and <sub> tags that leak into plain markdown
  text = text.replace(/<sup>([^<]+)<\/sup>/gi, (_, inner) => toUnicodeSuperscript(inner.trim()));
  text = text.replace(/<sub>([^<]+)<\/sub>/gi, (_, inner) => toUnicodeSubscript(inner.trim()));

  // 3. LaTeX symbols inside math mode $\dagger$, $\pm$, etc.
  const symbolMap = [
    [/\$\^?\\dagger\$/g, '†'],
    [/\\dagger\b|\$\\dagger\$/g, '†'],
    [/\$\^?\\ddagger\$/g, '‡'],
    [/\\ddagger\b|\$\\ddagger\$/g, '‡'],
    [/\\S\b|\$\\S\$/g, '§'],
    [/\\(?:ast|star)\b|\$\\(?:ast|star)\$/g, '*'],
    [/\\pm\b|\$\\pm\$/g, '±'],
    [/\\leq?\b|\$\\leq?\$/g, '≤'],
    [/\\geq?\b|\$\\geq?\$/g, '≥'],
    [/\\times\b|\$\\times\$/g, '×'],
    [/\\div\b|\$\\div\$/g, '÷'],
    [/\\approx\b|\$\\approx\$/g, '≈'],
    [/\\sim\b|\$\\sim\$/g, '~'],
    [/\\neq?\b|\$\\neq?\$/g, '≠'],
    [/\\mu\b|\$\\mu\$/g, 'μ'],
    [/\\alpha\b|\$\\alpha\$/g, 'α'],
    [/\\beta\b|\$\\beta\$/g, 'β'],
    [/\\gamma\b|\$\\gamma\$/g, 'γ'],
    [/\\delta\b|\$\\delta\$/g, 'δ'],
    [/\$\\chi\^\{?2\}?\$|\\chi\^\{?2\}?/g, 'χ²'],
    [/\\chi\b|\$\\chi\$/g, 'χ'],
    [/\\lambda\b|\$\\lambda\$/g, 'λ'],
    [/\\theta\b|\$\\theta\$/g, 'θ'],
    [/\\sigma\b|\$\\sigma\$/g, 'σ'],
    [/\\rho\b|\$\\rho\$/g, 'ρ'],
    [/\\pi\b|\$\\pi\$/g, 'π'],
    [/\\Delta\b|\$\\Delta\$/g, 'Δ'],
    [/\\Sigma\b|\$\\Sigma\$/g, 'Σ'],
    [/\\%\b|\$\\%/g, '%'],
    [/\\&|\$&\$/g, '&']
  ];

  for (const [rgx, rep] of symbolMap) {
    text = text.replace(rgx, rep);
  }

  // 4. Ensure lines starting with superscripts (author affiliations) are properly line-separated
  // e.g. "Perth, Australia ² Kintampo..." -> "Perth, Australia\n\n² Kintampo..."
  text = text.replace(/([^\n])\s+([¹²³⁴⁵⁶⁷⁸⁹⁰†‡§]+\s+[A-Za-z])/g, '$1\n\n$2');

  return text;
}

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
  
  // Clean LaTeX / Math OCR artifacts first
  let text = cleanLatexAndMathArtifacts(rawText)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // If it already has structured markdown headers or tables, return cleaned text
  if (hasMarkdownFormatting(text)) {
    return text;
  }

  // 1. Repair OCR hyphenation across line breaks (e.g. "compara-\ntor" -> "comparator")
  text = text.replace(/([a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,})/g, '$1$2');

  // 2. Identify and promote academic/legal section headers to '### Heading'
  // Support both standalone lines ("ABSTRACT") and inline starts ("objective Male circumcision...")
  const headingList = COMMON_SECTION_HEADINGS.join('|');
  const standaloneHeadingRegex = new RegExp(
    `^(?:(?:[0-9IVX]+\\.\\s*)?(${headingList})[:.]?)\\s*$`,
    'gim'
  );
  text = text.replace(standaloneHeadingRegex, (match, heading) => {
    const titleCased = heading.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return `\n\n### ${titleCased}\n\n`;
  });

  const inlineHeadingRegex = new RegExp(
    `(^|\\n|[.!?]\\s+)\\b(${headingList})(?:[:.]|(?=\\s+[A-Z]))\\s*`,
    'gi'
  );
  text = text.replace(inlineHeadingRegex, (match, prefix, heading) => {
    const titleCased = heading.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    const sep = prefix ? (prefix.endsWith('\n') ? prefix : `${prefix.trim()}\n\n`) : '';
    return `${sep}### ${titleCased}\n\n`;
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

  // Clean LaTeX and OCR math artifacts first
  let text = cleanLatexAndMathArtifacts(rawText)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Normalize Unicode bullets to markdown standard '- '
  text = text.replace(/^[ \t]*[•▪▫–—][ \t]+/gm, '- ');

  // Promote section headers at line starts or sentence boundaries to **Heading:** with paragraph breaks
  // Support both with colon/period (e.g. "Objective:") and inline words before a capitalized sentence ("objective Male...")
  const headerPattern = COMMON_SECTION_HEADINGS.join('|');
  const sectionRegex = new RegExp(
    `(^|\\n|[.!?]\\s+)\\b(${headerPattern})(?:[:.]|(?=\\s+[A-Z]))\\s*`,
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

/**
 * Converts Rich Text Format (.rtf) data into clean, readable Markdown.
 * Strips font/color/stylesheet tables and RTF metadata groups.
 * Translates \par, \line, \tab, bold \b, and italic \i.
 * Decodes ANSI/Windows-1252 hex character entities (\'xx) and Unicode (\uN?).
 */
export function parseRtfToText(rtf) {
  if (!rtf || typeof rtf !== 'string') return '';
  const trimmed = rtf.trim();
  if (!trimmed.startsWith('{\\rtf') && !trimmed.startsWith('{\\\\rtf')) {
    return rtf;
  }

  // 1. Remove non-content destination groups: fonttbl, colortbl, stylesheet, info, pict, header, footer, etc.
  let text = rtf.replace(/\{\\\*(?:fonttbl|colortbl|stylesheet|info|pict|header|footer|generator|nonshppict)[^}]*\}/gi, '');
  text = text.replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|pict|header|footer)[^}]*\}/gi, '');

  // 2. Decode hex chars like \'92, \'93, \'94, \'96, \'97, \'a0
  const win1252Map = {
    0x82: '‚', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
    0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ',
    0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•',
    0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™', 0x9a: 'š',
    0x9b: '›', 0x9c: 'œ', 0x9f: 'Ÿ', 0xa0: ' '
  };
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const code = parseInt(hex, 16);
    if (win1252Map[code]) return win1252Map[code];
    return String.fromCharCode(code);
  });

  // 3. Decode unicode escapes \uN?
  text = text.replace(/\\u(-?\d+)\??/g, (_, dec) => {
    let num = parseInt(dec, 10);
    if (num < 0) num += 65536;
    return String.fromCharCode(num);
  });

  // 4. Convert paragraph breaks, line breaks, and tabs
  text = text.replace(/\\par(?:\r?\n| )?/gi, '\n\n');
  text = text.replace(/\\line(?:\r?\n| )?/gi, '\n');
  text = text.replace(/\\tab(?:\r?\n| )?/gi, '\t');

  // 5. Bold & Italic to Markdown
  text = text.replace(/\\b\s+([^\\{}]+?)\\b0/gi, '**$1**');
  text = text.replace(/\\i\s+([^\\{}]+?)\\i0/gi, '*$1*');

  // 6. Strip all other control words \word
  text = text.replace(/\\[a-zA-Z]+-?\d*(?:\r?\n| )?/g, '');

  // 7. Strip curly braces remaining
  text = text.replace(/[{}]/g, '');

  // 8. Clean up extra whitespace and normalize paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);

  const cleanText = paragraphs.join('\n\n');
  return formatPlainTextToMarkdown(cleanText);
}

/**
 * Converts CSV or TSV string into a Github-Flavored Markdown table.
 * Supports auto delimiter detection (tab or comma), quotes with embedded commas, and escaped quotes.
 */
export function parseCsvToMarkdownTable(csvText, customDelimiter = null, maxRows = 200) {
  if (!csvText || typeof csvText !== 'string') return '';
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length === 0) return '';

  // Determine delimiter
  let delimiter = customDelimiter;
  if (!delimiter) {
    const firstLine = lines[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    if (tabCount > commaCount && tabCount > semicolonCount) {
      delimiter = '\t';
    } else if (semicolonCount > commaCount && semicolonCount > tabCount) {
      delimiter = ';';
    } else {
      delimiter = ',';
    }
  }

  // Helper to parse a single delimited line taking quotes into account
  const parseLine = (line) => {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells.map(c => c.replace(/\|/g, '\\|'));
  };

  const parsedRows = [];
  const limit = Math.min(lines.length, maxRows);
  for (let i = 0; i < limit; i++) {
    if (lines[i].trim().length > 0) {
      parsedRows.push(parseLine(lines[i]));
    }
  }

  if (parsedRows.length === 0) return '';

  const header = parsedRows[0];
  const colCount = header.length;
  const separator = header.map(() => '---');

  const rows = [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`
  ];

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const padded = [];
    for (let c = 0; c < colCount; c++) {
      padded.push(row[c] !== undefined ? row[c] : '');
    }
    rows.push(`| ${padded.join(' | ')} |`);
  }

  let result = rows.join('\n');
  if (lines.length > maxRows) {
    result += `\n\n*Note: Displaying first ${maxRows} rows of tabular dataset. Download the raw file for complete records.*`;
  }
  return result;
}

/**
 * High-level normalizer for any document text loaded into the viewer.
 * Automatically handles RTF parsing, CSV/TSV table formatting, JSON/XML, or Markdown cleanup.
 */
export function normalizeDocumentText(rawText, filenameOrUrl = '') {
  if (!rawText || typeof rawText !== 'string') return '';
  const cleanUrl = (filenameOrUrl || '').toLowerCase();

  // 1. RTF file or raw RTF content
  if (cleanUrl.endsWith('.rtf') || rawText.trim().startsWith('{\\rtf')) {
    return parseRtfToText(rawText);
  }

  // 2. CSV or TSV file
  if (cleanUrl.endsWith('.csv')) {
    return parseCsvToMarkdownTable(rawText, ',');
  }
  if (cleanUrl.endsWith('.tsv')) {
    return parseCsvToMarkdownTable(rawText, '\t');
  }

  // 3. JSON file
  if (cleanUrl.endsWith('.json')) {
    try {
      const parsed = JSON.parse(rawText);
      return '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
    } catch {
      return '```json\n' + rawText + '\n```';
    }
  }

  // 4. XML / HTML / Code file
  if (cleanUrl.endsWith('.xml') || cleanUrl.endsWith('.html') || cleanUrl.endsWith('.htm')) {
    const lang = cleanUrl.endsWith('.xml') ? 'xml' : 'html';
    return '```' + lang + '\n' + rawText + '\n```';
  }

  // 5. Already formatted markdown - still clean LaTeX and math OCR noise
  if (hasMarkdownFormatting(rawText)) {
    return cleanLatexAndMathArtifacts(rawText);
  }

  // 6. Plain text -> Markdown structure (which also cleans LaTeX)
  return formatPlainTextToMarkdown(rawText);
}
