const db = require('better-sqlite3')('local_db.sqlite');
const rows = db.prepare("SELECT data FROM responses WHERE pathway = 'adult_circumcised'").all();
const res = rows.map(r => JSON.parse(r.data));
const context = {};
const age = {};
res.forEach(r => {
  const c = r.circ_adult_context;
  context[c] = (context[c] || 0) + 1;
  const a = r.circ_age;
  age[a] = (age[a] || 0) + 1;
});
console.log('CONTEXT', context);
console.log('AGE', age);
