const fs = require('fs');
const path = require('path');

const analysisPath = path.join(__dirname, 'multi_select_analysis.json');
if (fs.existsSync(analysisPath)) {
  const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

  const feelings = data['restore_feelings_before'] || [];
  fs.writeFileSync(path.join(__dirname, 'restore_feelings_before_raw.txt'), feelings.join('\n'));
  console.log('Wrote restore_feelings_before_raw.txt');

  const motivations = data['restore_motivations'] || [];
  fs.writeFileSync(path.join(__dirname, 'restore_motivations_raw.txt'), motivations.join('\n'));
  console.log('Wrote restore_motivations_raw.txt');
} else {
  console.log('File not found:', analysisPath);
}
