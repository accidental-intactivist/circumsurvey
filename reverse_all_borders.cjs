const fs = require('fs');

const dirs = ['C:/work/circumsurvey/circumsurvey/src/explore/pages', 'C:/work/circumsurvey/circumsurvey/src/explore/components'];

let count = 0;
dirs.forEach(d => {
  const files = fs.readdirSync(d);
  files.forEach(f => {
    if (!f.endsWith('.jsx')) return;
    const filepath = d + '/' + f;
    let content = fs.readFileSync(filepath, 'utf8');
    
    let newContent = content.replace(/3px dotted \$\{C\.ghost\}/g, '1px solid ${C.ghost}');
    newContent = newContent.replace(/3px dotted rgba\(255,255,255,0\.15\)/g, '1px solid rgba(255,255,255,0.08)');
    newContent = newContent.replace(/3px dotted \$\{PATH_COLORS\.([a-zA-Z]+)\}60/g, '1px solid ${PATH_COLORS.$1}40');
    newContent = newContent.replace(/3px dotted \$\{C\.goldBright\}60/g, '1px solid ${C.goldBright}40');
    
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Reverted borders in ' + filepath);
      count++;
    }
  });
});
console.log('Reverted ' + count + ' files.');
