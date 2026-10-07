const fs = require('fs');
const src = fs.readFileSync('c:/work/circumsurvey/circumsurvey/src/explore/styles/tokens.js', 'utf8');
const lines = src.split('\n');
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const GLOBAL_CSS')) { start = i + 1; }
  // The GLOBAL_CSS ends with a line that is just `};` or ends with backtick-semicolon
  if (start > 0 && i > start && lines[i].trimEnd().endsWith('`;')) { end = i; break; }
}
if (start > 0 && end > 0) {
  let css = lines.slice(start, end).join('\n');
  // Replace template literal interpolations
  css = css.replace(/\$\{FONT\.body\}/g, "'Barlow', sans-serif");
  css = css.replace(/\$\{FONT\.display\}/g, "'Playfair Display', serif");
  css = css.replace(/\$\{FONT\.condensed\}/g, "'Barlow Condensed', sans-serif");
  fs.writeFileSync('c:/work/circumsurvey/advocacy-shell/src/styles/themes.css', css, 'utf8');
  console.log('OK ' + css.length + ' chars extracted from lines ' + start + ' to ' + end);
} else {
  console.log('FAIL: could not find GLOBAL_CSS boundaries. start=' + start + ' end=' + end);
}
