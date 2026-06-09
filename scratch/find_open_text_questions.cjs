const fs = require('fs');

try {
  const content = fs.readFileSync('scratch/questions_repaired.json', 'utf8');
  const data = JSON.parse(content);
  
  console.log("=== Open Text Questions in questions.json ===");
  data.questions.forEach(q => {
    if (q.type === 'open_text') {
      console.log(`- ${q.id} (tier: ${q.tier}, responses: ${q.n_responses}) - ${q.prompt.slice(0, 60)}...`);
    }
  });
} catch (e) {
  console.error("Error:", e);
}
