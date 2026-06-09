const fs = require('fs');
const path = require('path');

const analysisPath = path.join(__dirname, 'multi_select_analysis.json');
if (fs.existsSync(analysisPath)) {
  const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  
  console.log('--- restore_feelings_before ---');
  const feelings = data['restore_feelings_before'] || [];
  // Since responses might be comma-separated combinations, let's print all of them to inspect
  feelings.slice(0, 15).forEach((f, idx) => console.log(`${idx}: ${f}`));

  console.log('\n--- restore_motivations ---');
  const motivations = data['restore_motivations'] || [];
  motivations.slice(0, 15).forEach((m, idx) => console.log(`${idx}: ${m}`));
} else {
  console.log('File not found:', analysisPath);
}
