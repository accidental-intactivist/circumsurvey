const fs = require('fs');

try {
  let content = fs.readFileSync('questions.json', 'utf16le');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  // Fix the JSON syntax error so we can parse it
  content = content.replace(/"medically "raped""/g, '"medically \\"raped\\""');
  const data = JSON.parse(content);
  
  console.log("=== Demographic Questions in questions.json ===");
  data.questions.forEach(q => {
    if (q.id.startsWith('demo_') || q.id.startsWith('family_') || q.id.startsWith('religion_')) {
      console.log(`${q.id} (${q.type}): opts length = ${q.opts ? q.opts.length : 'none'}`);
    }
  });
} catch (e) {
  console.error("Error:", e);
}
