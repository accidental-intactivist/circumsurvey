// Audit script: find all question IDs referenced in exhibit pages
// Run: node scratch/audit_exhibit_questions.js

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pagesDir = 'src/explore/pages';
const files = readdirSync(pagesDir).filter(f => f.endsWith('.jsx') && !f.includes('.tmp.'));

const allRefs = new Set();
const refsByFile = {};

for (const file of files) {
  const content = readFileSync(join(pagesDir, file), 'utf-8');
  const refs = new Set();
  
  // Match question IDs in various patterns
  const patterns = [
    /qid:\s*["']([^"']+)["']/g,
    /questionId:\s*["']([^"']+)["']/g,
    /\bq=([a-z_]+[a-z0-9_]*)/g,
    /["']([a-z]+_[a-z_]+(?:_[a-z_]+)*)["']/g,  // snake_case strings that look like question IDs
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const id = match[1];
      // Filter to likely question IDs (contain underscore, not CSS/JS keywords)
      if (id.includes('_') && !id.startsWith('on_') && !id.startsWith('flex_') && 
          !id.startsWith('font_') && !id.startsWith('text_') && !id.startsWith('bg_') &&
          !id.startsWith('max_') && !id.startsWith('min_') && !id.startsWith('border_') &&
          !id.startsWith('padding_') && !id.startsWith('margin_') && !id.startsWith('display_') &&
          !id.startsWith('align_') && !id.startsWith('justify_') && !id.startsWith('grid_') &&
          !id.startsWith('gap_') && !id.startsWith('overflow_') && !id.startsWith('position_') &&
          !id.startsWith('z_') && !id.startsWith('cursor_') && !id.startsWith('transition_') &&
          !id.startsWith('box_') && !id.startsWith('line_') && !id.startsWith('letter_') &&
          !id.startsWith('white_') && !id.startsWith('word_') && !id.startsWith('object_') &&
          !id.startsWith('pointer_') && !id.startsWith('resize_') && 
          !id.startsWith('npm_') && !id.startsWith('node_') &&
          id.length > 4 && id.length < 80) {
        refs.add(id);
        allRefs.add(id);
      }
    }
  }
  
  if (refs.size > 0) {
    refsByFile[file] = [...refs].sort();
  }
}

console.log(`\n=== QUESTION IDS REFERENCED IN EXHIBIT PAGES ===\n`);
console.log(`Total unique IDs found: ${allRefs.size}\n`);

for (const [file, refs] of Object.entries(refsByFile).sort()) {
  console.log(`\n--- ${file} (${refs.length} refs) ---`);
  refs.forEach(r => console.log(`  ${r}`));
}

console.log(`\n\n=== ALL UNIQUE IDS (sorted) ===\n`);
[...allRefs].sort().forEach(id => console.log(id));
