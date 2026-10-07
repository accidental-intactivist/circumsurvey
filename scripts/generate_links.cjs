const fs = require('fs');
const path = require('path');

const apiMockPath = path.resolve(__dirname, '../public/api_mock.json');
const seedPath = path.resolve(__dirname, '../migrations/ead_seed.sql');
const outputPath = path.resolve(__dirname, '../migrations/link_physical_inventory.sql');

let digitizedDocs = [];
try {
  digitizedDocs = JSON.parse(fs.readFileSync(apiMockPath, 'utf8'));
} catch (e) {
  console.error('Failed to load api_mock.json', e);
  process.exit(1);
}

// Map each document to its possible titles for fuzzy matching
const docsWithTitles = digitizedDocs.map(doc => {
  let meta = {};
  try { meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {}; } catch (e) {}
  const title = (meta.gemini_extracted_metadata?.title || doc.title || '').toLowerCase().trim();
  return { id: doc.id, title };
}).filter(d => d.title.length > 5);

const seedSql = fs.readFileSync(seedPath, 'utf8');
const lines = seedSql.split('\n');

let updates = [];

lines.forEach(line => {
  if (line.includes('INSERT INTO physical_inventory')) {
    // Match id and item_title
    const match = line.match(/VALUES \('([^']+)',\s*'[^']*',\s*(?:'[^']*'|NULL),\s*(?:'[^']*'|NULL),\s*'((?:[^']|'')*)'/);
    if (match && match[1] && match[2]) {
      const id = match[1];
      const itemTitle = match[2].replace(/''/g, "'");
      const cleanItemTitle = itemTitle.toLowerCase().trim();
      
      if (cleanItemTitle.length < 10) return;
      
      // Find matching digitized document
      const matchedDoc = docsWithTitles.find(d => 
        d.title.includes(cleanItemTitle) || cleanItemTitle.includes(d.title)
      );

      if (matchedDoc) {
        updates.push(`UPDATE physical_inventory SET digital_document_id = '${matchedDoc.id}' WHERE id = '${id}';`);
      }
    }
  }
});

fs.writeFileSync(outputPath, `-- Auto-generated script to link physical inventory to digitized documents\n\n` + updates.join('\n') + '\n');
console.log(`Generated ${updates.length} updates in link_physical_inventory.sql`);
