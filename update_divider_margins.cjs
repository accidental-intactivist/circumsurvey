const fs = require('fs');

const dirs = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components'];

let count = 0;
dirs.forEach(d => {
  const files = fs.readdirSync(d);
  files.forEach(f => {
    if (!f.endsWith('.jsx')) return;
    const filepath = d + '/' + f;
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Original margin was: margin: "0 0 5rem"
    // We want to change it to: margin: "5rem 0 1.2rem"
    let newContent = content.replace(/<div style=\{\{ borderBottom: "5px dotted var\(--c-ghost\)", margin: "0 0 5rem", opacity: 0\.5 \}\} \/>/g, '<div style={{ borderBottom: "5px dotted var(--c-ghost)", margin: "5rem 0 1.5rem", opacity: 0.5 }} />');
    
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated ' + filepath);
      count++;
    }
  });
});
console.log('Updated ' + count + ' files.');
