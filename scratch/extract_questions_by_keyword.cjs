const fs = require('fs');

try {
  const content = fs.readFileSync('questions.json', 'utf8');
  const questions = JSON.parse(content);

  const keywords = {
    society: ['society', 'social', 'cultural', 'peer', 'expectation', 'locker', 'locker room', 'media', 'porn', 'stigma', 'norm', 'public', ' locker'],
    noticing: ['notice', 'observe', 'look', 'partner', 'friend', 'discuss', 'other\'s state', 'other men', 'locker room'],
    contrast: ['different', 'difference', 'compare', 'comparison', 'attitude', 'opinion', 'view', 'cut vs', 'intact vs']
  };

  const results = [];

  questions.forEach(q => {
    const text = ((q.prompt || "") + " " + (q.subtitle || "") + " " + (q.section || "") + " " + (q.id || "")).toLowerCase();
    
    let matchedCat = null;
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        matchedCat = cat;
        break;
      }
    }

    if (matchedCat) {
      results.push(q);
    }
  });

  console.log(`Matched ${results.length} questions out of ${questions.length}.`);

  let outputText = `=== EXTRACTED QUESTIONS BY TOPIC ===\n\n`;
  results.forEach(q => {
    outputText += `ID: ${q.id}\n`;
    outputText += `Section: ${q.section}\n`;
    outputText += `Pathway: ${q.pathway}\n`;
    outputText += `Type: ${q.type}\n`;
    outputText += `Tier: ${q.tier}\n`;
    outputText += `N: ${q.n_responses}\n`;
    outputText += `Prompt: ${q.prompt}\n`;
    if (q.subtitle) outputText += `Subtitle: ${q.subtitle}\n`;
    if (q.opts) outputText += `Options: ${JSON.stringify(q.opts, null, 2)}\n`;
    outputText += `--------------------------------------------------\n\n`;
  });

  fs.writeFileSync('scratch/extracted_questions.txt', outputText, 'utf8');
  console.log("Written results to scratch/extracted_questions.txt");
} catch (e) {
  console.error("Error:", e);
}
