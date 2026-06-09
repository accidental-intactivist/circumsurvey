const fs = require('fs');

try {
  let fileContent;
  if (fs.existsSync('questions.json')) {
    fileContent = fs.readFileSync('questions.json', 'utf8');
  } else if (fs.existsSync('src/data/questions.json')) {
    fileContent = fs.readFileSync('src/data/questions.json', 'utf8');
  } else {
    console.log("Could not find questions.json");
    process.exit(1);
  }

  const data = JSON.parse(fileContent);
  const questions = Array.isArray(data) ? data : data.questions || [];

  const targetIds = [
    "circ_advantages_desc",
    "circ_drawbacks_desc",
    "circ_awareness_age",
    "circ_parents_reason",
    "circ_parents_driver",
    "circ_regret_feeling",
    "circ_regret_triggers",
    "circ_parents_convo",
    "circ_parents_convo_why_not",
    "circ_medical_intervention",
    "circ_notice_same_status",
    "circ_curiosity_about_intact",
    "circ_curiosity_about_intact_aspects",
    "circ_prior_thought_level",
    "circ_ppp_awareness",
    "circ_ppp_impact"
  ];

  targetIds.forEach(id => {
    const q = questions.find(item => item.id === id);
    if (q) {
      console.log(`\n=== ID: ${q.id} (${q.type}) ===`);
      console.log(`Opts:`, q.opts);
    } else {
      console.log(`\nID: ${id} NOT FOUND in questions.json`);
    }
  });
} catch (e) {
  console.error("Error:", e);
}
