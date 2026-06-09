const fs = require('fs');

try {
  const content = fs.readFileSync('scratch/questions_repaired.json', 'utf8');
  const data = JSON.parse(content);
  
  console.log("=== Questions in questions.json with options containing 'e.g.' or parenthetical lists ===");
  data.questions.forEach(q => {
    if (q.opts) {
      const brokenOpts = q.opts.filter(opt => opt.includes('e.g.') || opt.includes('(') || opt.includes(')'));
      if (brokenOpts.length > 0) {
        console.log(`\nQuestion: ${q.id} (type: ${q.type}, tier: ${q.tier})`);
        console.log(`Prompt: ${q.prompt}`);
        console.log("Options (first 10):", q.opts.slice(0, 10));
      }
    }
  });
} catch (e) {
  console.error("Error:", e);
}
