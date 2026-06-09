const fs = require('fs');

try {
  const content = fs.readFileSync('scratch/questions_repaired.json', 'utf8');
  const data = JSON.parse(content);
  
  const qIds = [
    'intact_parents_info_sources',
    'intact_parents_traits_values',
    'circ_adult_motivation_details',
    'observe_curious_shaping_factors',
    'observe_parent_intact_factors',
    'intact_parents_neg_catalyst'
  ];
  
  qIds.forEach(id => {
    const q = data.questions.find(item => item.id === id);
    if (q) {
      console.log(`\n=== Option list for ${id} (${q.type}) ===`);
      console.log(q.opts);
    } else {
      console.log(`\nQuestion ${id} not found.`);
    }
  });
} catch (e) {
  console.error("Error:", e);
}
