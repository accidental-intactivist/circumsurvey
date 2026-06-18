const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../src/explore/pages');
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('Page.jsx') && f !== 'IndexPage.jsx');

// Hacky parser to find all question IDs (string literals containing underscores or looking like IDs)
const idRegex = /["']([a-z]+_[a-z_]+|q\d{3}|open_text|single_select|multi_select|multiple_choice)["']/g;

const mapping = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
  let match;
  const exhibitId = file.replace('Page.jsx', '');
  
  while ((match = idRegex.exec(content)) !== null) {
    const qid = match[1];
    // ignore some common false positives
    if (qid === 'open_text' || qid === 'single_select' || qid === 'multi_select' || qid === 'multiple_choice') continue;
    if (qid.includes('var(') || qid.includes('rgba')) continue;
    
    if (!mapping[qid]) mapping[qid] = [];
    if (!mapping[qid].includes(exhibitId)) {
      mapping[qid].push(exhibitId);
    }
  }
}

const out = `export const QUESTION_EXHIBIT_MAP = ${JSON.stringify(mapping, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '../src/explore/lib/coverage.js'), out);
console.log('Coverage map generated at src/explore/lib/coverage.js');
