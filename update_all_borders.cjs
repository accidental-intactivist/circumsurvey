const fs = require('fs');

const dirs = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components'];

let count = 0;
dirs.forEach(d => {
  const files = fs.readdirSync(d);
  files.forEach(f => {
    if (!f.endsWith('.jsx')) return;
    const filepath = d + '/' + f;
    let content = fs.readFileSync(filepath, 'utf8');
    
    let newContent = content.replace(/1px solid \$\{C\.ghost\}/g, '3px dotted ${C.ghost}');
    newContent = newContent.replace(/1px solid rgba\(255,255,255,0\.08\)/g, '3px dotted rgba(255,255,255,0.15)');
    newContent = newContent.replace(/1px solid \$\{PATH_COLORS\.([a-zA-Z]+)\}40/g, '3px dotted ${PATH_COLORS.$1}60');
    newContent = newContent.replace(/1px solid \$\{C\.goldBright\}40/g, '3px dotted ${C.goldBright}60');
    
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated dividers in ' + filepath);
      count++;
    }
  });
});
console.log('Updated ' + count + ' files.');
