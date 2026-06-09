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
    const intactRes = await get(`https://findings.circumsurvey.online/api/response-distribution?q=intact_curiosity_about_circ`);
    const circRes = await get(`https://findings.circumsurvey.online/api/response-distribution?q=circ_curiosity_about_intact`);
    console.log("=== INTACT CURIOSITY DISTRIBUTION ===");
    console.log(JSON.stringify(intactRes, null, 2));
    console.log("\n=== CIRC CURIOSITY DISTRIBUTION ===");
    console.log(JSON.stringify(circRes, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
