const http = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const q = 'family_father_profession';
    const dist = await get(`https://findings.circumsurvey.online/api/response-distribution?q=${q}`);
    console.log(`=== Response Distribution for ${q} ===`);
    console.log(`n = ${dist.n}`);
    console.log(`distribution length: ${dist.distribution.length}`);
    console.log(JSON.stringify(dist.distribution.slice(0, 30), null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
