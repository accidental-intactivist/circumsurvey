import fs from 'fs';

async function main() {
  const url = 'https://raw.githubusercontent.com/iconify/icon-sets/master/json/fluent-emoji-high-contrast.json';
  console.log('Fetching Fluent Emoji High Contrast list...');
  try {
    const res = await fetch(url);
    const data = await res.json();
    const keys = Object.keys(data.icons);
    console.log(`Found ${keys.length} icons.`);
    
    // Let's check specific matches for our emojis
    const targetEmojis = {
      circle: ['circle', 'green', 'blue', 'purple', 'orange', 'red', 'white'],
      phases: ['clipboard', 'seedling', 'sprout', 'shuffle', 'track'],
      roles: ['bust', 'people', 'handshake', 'baby', 'pregnant', 'hospital', 'megaphone', 'female', 'graduation', 'performing', 'theater', 'mask'],
      religion: ['atom', 'latin', 'cross', 'david', 'crescent', 'star'],
      recommendations: ['balloon', 'bubble', 'chat', 'speech', 'scale', 'balance', 'chart', 'bar', 'scroll', 'page']
    };
    
    const matches = {};
    for (const [cat, terms] of Object.entries(targetEmojis)) {
      matches[cat] = {};
      for (const term of terms) {
        matches[cat][term] = keys.filter(k => k.toLowerCase().includes(term.toLowerCase()));
      }
    }
    
    console.log('Matches:', JSON.stringify(matches, null, 2));
    
    // Save all keys
    fs.writeFileSync('scratch/fluent_keys.json', JSON.stringify(keys, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
