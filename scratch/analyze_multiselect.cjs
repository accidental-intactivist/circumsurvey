const { execSync } = require('child_process');
const fs = require('fs');

console.log("Fetching multi-select data from D1...");
const output = execSync('npx wrangler d1 execute circumsurvey --remote --command "SELECT q.id, r.value_text FROM questions q JOIN responses r ON q.id = r.question_id WHERE q.type = \'multi_select\'" --json', { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 });

const data = JSON.parse(output);
const rows = data[0].results;

const qMap = {};

rows.forEach(r => {
  if (!r.value_text) return;
  if (!qMap[r.id]) qMap[r.id] = {};
  qMap[r.id][r.value_text] = (qMap[r.id][r.value_text] || 0) + 1;
});

const results = {};
for (const [qid, counts] of Object.entries(qMap)) {
  const strings = Object.keys(counts);
  results[qid] = strings;
}

if (!fs.existsSync('scratch')) fs.mkdirSync('scratch');
fs.writeFileSync('scratch/multi_select_analysis.json', JSON.stringify(results, null, 2));
console.log("Wrote analysis to scratch/multi_select_analysis.json");
