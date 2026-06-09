const fs = require('fs');
const path = require('path');

try {
  let fileContent;
  if (fs.existsSync('questions.json')) {
    fileContent = fs.readFileSync('questions.json', 'utf8');
  } else if (fs.existsSync('src/data/questions.json')) {
    fileContent = fs.readFileSync('src/data/questions.json', 'utf8');
  } else {
    console.log("Could not find questions.json");
    process.exit(1);
  }

  const data = JSON.parse(fileContent);
  const questions = Array.isArray(data) ? data : data.questions || [];

  console.log(`Found ${questions.length} questions.`);
  const circQs = questions.filter(q => q.id.startsWith('circ_'));
  console.log(`Found ${circQs.length} circumcised questions.`);

  circQs.forEach(q => {
    console.log(`\nID: ${q.id}`);
    console.log(`Prompt: ${q.prompt}`);
    console.log(`Opts:`, q.opts);
  });
} catch (e) {
  console.error("Error:", e);
}
