const fs = require('fs');

const dirs = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components'];

let count = 0;
dirs.forEach(d => {
  const files = fs.readdirSync(d);
  files.forEach(f => {
    if (!f.endsWith('.jsx')) return;
    const filepath = d + '/' + f;
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Decrease the bottom margin
    let newContent = content.replace(/margin: "5rem 0 1\.5rem"/g, 'margin: "5rem 0 1rem"');
    
    // For DemographicsDashboardPage (if it still has 1.5rem 0)
    newContent = newContent.replace(/<div style=\{\{ borderBottom: "5px dotted var\(--c-ghost\)", margin: "1\.5rem 0", opacity: 0\.5 \}\} \/>/g, '<div style={{ borderBottom: "5px dotted var(--c-ghost)", margin: "1.5rem 0 1rem", opacity: 0.5 }} />');
    
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated ' + filepath);
      count++;
    }
  });
});
console.log('Updated ' + count + ' files.');
