const fs = require('fs');

try {
  const content = fs.readFileSync('questions.json', 'utf8');
  const questions = JSON.parse(content);

  console.log("=== Universal questions in Culture & Attitudes or Pride & Regret ===");
  questions.forEach(q => {
    if (q.pathway === 'all' && (q.section === 'Culture & Attitudes' || q.section === 'Pride & Regret' || q.section === 'Sexual Experience')) {
      console.log(`- ID: ${q.id} (Type: ${q.type}, N: ${q.n_responses})`);
      console.log(`  Prompt: "${q.prompt}"`);
      if (q.opts) console.log(`  Options: [${q.opts.slice(0, 3).map(o => `"${o.slice(0, 40)}..."`).join(', ')}${q.opts.length > 3 ? `, +${q.opts.length - 3} more` : ''}]`);
      console.log();
    }
  });
} catch (e) {
  console.error("Error:", e);
}
