const fs = require('fs');
const raw = fs.readFileSync('questions.json');
let content = raw.toString('utf16le');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
console.log("Sub-string around 123450:");
console.log(content.slice(123300, 123600));
