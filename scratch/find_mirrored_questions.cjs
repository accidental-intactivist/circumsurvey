const fs = require('fs');

try {
  const content = fs.readFileSync('questions.json', 'utf8');
  const questions = JSON.parse(content);

  const groups = {};

  questions.forEach(q => {
    // Determine base suffix by removing common prefix
    let base = q.id;
    let prefix = null;
    if (q.id.startsWith('intact_')) {
      base = q.id.slice(7);
      prefix = 'intact';
    } else if (q.id.startsWith('circ_')) {
      base = q.id.slice(5);
      prefix = 'circ';
    } else if (q.id.startsWith('restore_')) {
      base = q.id.slice(8);
      prefix = 'restore';
    } else if (q.id.startsWith('observe_')) {
      base = q.id.slice(8);
      prefix = 'observe';
    }

    if (!groups[base]) {
      groups[base] = [];
    }
    groups[base].push({ prefix, q });
  });

  console.log("=== MIRRORED/COGNATE GROUPS ===");
  let count = 0;
  for (const [base, items] of Object.entries(groups)) {
    if (items.length > 1) {
      count++;
      console.log(`\nConcept: "${base}" (${items.length} pathways)`);
      items.forEach(item => {
        console.log(`  - [${item.prefix}] ${item.q.id} (${item.q.type}) - "${item.q.prompt.slice(0, 80)}..."`);
      });
    }
  }
  console.log(`\nFound ${count} conceptual group matches.`);
} catch (e) {
  console.error("Error:", e);
}
