const fs = require('fs');
const path = require('path');

const analysisPath = path.join(__dirname, 'multi_select_analysis.json');
if (fs.existsSync(analysisPath)) {
  const data = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  
  // A helper to extract all unique base options that are not combined
  function getUniqueBaseOptions(key) {
    const list = data[key] || [];
    // Many strings are comma-separated combinations. We want to find the ones that are single options.
    // However, since some options have internal commas, we have to look at the raw database options or do frequency analysis.
    // Let's print the raw list first.
    return list;
  }

  console.log('=== restore_feelings_before ===');
  getUniqueBaseOptions('restore_feelings_before').forEach(o => console.log(o));

  console.log('\n=== restore_motivations ===');
  getUniqueBaseOptions('restore_motivations').forEach(o => console.log(o));
} else {
  console.log('File not found:', analysisPath);
}
