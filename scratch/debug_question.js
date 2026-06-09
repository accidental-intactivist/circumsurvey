const fs = require('fs');

try {
  const content = fs.readFileSync('questions.json', 'utf16le');
  const data = JSON.parse(content);
  const q = data.questions.find(item => item.id === 'family_mother_profession');
  console.log("=== Question details ===");
  console.log(JSON.stringify(q, null, 2));
} catch (e) {
  console.error("Error reading questions.json:", e);
}
