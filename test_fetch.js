import fs from 'fs';

async function testQuery() {
  const url = "https://findings.circumsurvey.online/api/ai/query";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "What can you tell me about Tone Pettit?" })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testQuery();
