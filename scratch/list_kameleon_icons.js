import fs from 'fs';

// Use native global fetch

async function main() {
  const url = 'https://raw.githubusercontent.com/iconify/icon-sets/master/json/streamline-kameleon-color.json';
  console.log('Fetching Kameleon icons list...');
  try {
    const res = await fetch(url);
    const data = await res.json();
    const keys = Object.keys(data.icons);
    console.log(`Found ${keys.length} icons.`);
    
    // Group keys by keyword match
    const keywords = ['bubble', 'chat', 'speech', 'scale', 'balance', 'chart', 'bar', 'pie', 'scroll', 'paper', 'leaf', 'plant', 'atom', 'science', 'cross', 'star', 'crescent', 'religion', 'circle', 'shield', 'gear', 'help', 'info', 'book', 'check'];
    const matches = {};
    for (const kw of keywords) {
      matches[kw] = keys.filter(k => k.includes(kw));
    }
    
    console.log('Matches:', JSON.stringify(matches, null, 2));
    
    // Also save all keys to a scratch file
    fs.writeFileSync('scratch/kameleon_keys.json', JSON.stringify(keys, null, 2));
    console.log('Saved all keys to scratch/kameleon_keys.json');
  } catch (err) {
    console.error('Error fetching/processing:', err);
  }
}

main();
