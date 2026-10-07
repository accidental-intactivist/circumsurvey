async function run() { 
  const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://news.google.com/rss/search?q=intactivism OR "circumcision ethics"'); 
  const res = await fetch(rssUrl); 
  const data = await res.json(); 
  console.log(JSON.stringify(data.items.slice(0,5), null, 2)); 
} 
run();
