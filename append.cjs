const fs = require('fs');
let c = fs.readFileSync('src/explore/lib/formatters.js', 'utf8');
let r = fs.readFileSync('restored.txt', 'utf8');

if (!c.includes('export function consolidateLabel')) {
  c = c + '\n\n' + r;
}

fs.writeFileSync('src/explore/lib/formatters.js', c);
console.log('Successfully appended formatters.js');
