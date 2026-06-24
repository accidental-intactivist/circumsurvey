const fs = require('fs');

const dirs = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components'];

let count = 0;
dirs.forEach(d => {
  const files = fs.readdirSync(d);
  files.forEach(f => {
    if (!f.endsWith('.jsx')) return;
    const filepath = d + '/' + f;
    let content = fs.readFileSync(filepath, 'utf8');
    
    const newContent = content.replace(/<div style=\{\{\s*height:\s*1,\s*background:\s*['"]rgba\(255,255,255,0\.1\)['"],\s*margin:\s*['"]0 0 5rem['"]\s*\}\}\s*\/>/g, '<div style={{ borderBottom: "3px dotted var(--c-ghost)", margin: "0 0 5rem", opacity: 0.5 }} />');
    
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated dividers in ' + filepath);
      count++;
    }
  });
});
console.log('Updated ' + count + ' files.');
