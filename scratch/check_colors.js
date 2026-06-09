import fs from 'fs';
import https from 'https';

// Duplicate the color logic here to run it in node
const C = { grey: '#a0a0a0', blue: '#5b93c7', ltBlue: '#8bb8d9', yellow: '#e8c868', orange: '#e8a44a', red: '#d94f4f' };
const DISTINCT_COLORS = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"];

function getCategoricalColor(index) { return DISTINCT_COLORS[index % DISTINCT_COLORS.length]; }
function adjustColor(hex, index) {
  if (index === 0) return hex;
  const sign = index % 2 === 1 ? -1 : 1;
  const magnitude = Math.ceil(index / 2) * 0.15;
  let color = hex.replace("#", "");
  if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  let r = parseInt(color.substr(0, 2), 16), g = parseInt(color.substr(2, 2), 16), b = parseInt(color.substr(4, 2), 16);
  if (sign > 0) { r += (255 - r) * magnitude; g += (255 - g) * magnitude; b += (255 - b) * magnitude; }
  else { r *= (1 - magnitude); g *= (1 - magnitude); b *= (1 - magnitude); }
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function colorForLabel(label, index = 0) {
  const l = (label || "").toLowerCase();
  if (/gen alpha|2013-present/i.test(l)) return "#d94f4f";
  if (/gen z|1997-2012/i.test(l)) return "#e8a44a";
  if (/millennial|1981-1996/i.test(l)) return "#e8c868";
  if (/xennial|1977-1983/i.test(l)) return "#68b878";
  if (/gen x|generation x|1965-1980/i.test(l)) return "#8bb8d9";
  if (/boomer|1946-1964/i.test(l)) return "#5b93c7";
  if (/silent|1928-1945/i.test(l)) return "#7868b8";
  
  if (!l || /^n\/a$|not applicable|^don'?t know$|^unsure$|^not sure$|^prefer not|^no idea$|^don'?t think$|don'?t really frame/.test(l)) return adjustColor(C.grey, index);
  if (/very positive|confident|proud|^never$|\b1\+ min|strongly prefer intact|intact significantly|keep intact|child'?s right|neutral pros|uncommon|actively researching|^no[,.]?$/i.test(l)) return adjustColor(C.blue, index);
  if (/positive|proud and satisfied|^generally$|light blue|moderately/i.test(l)) return adjustColor(C.ltBlue, index);
  if (/neutral|no difference|no preference|^mix$|50\/50|undecided|ambivalent|^somewhat$/i.test(l)) return adjustColor(C.yellow, index);
  if (/negative|somewhat dissatisfied|^often$|orange|^depends$|brief/i.test(l)) return adjustColor(C.orange, index);
  if (/very negative|dissatisfied|^always$|^almost always$|0.{0,2}5 sec|something is missing|routine|unquestioned|strongly prefer circ|circ significantly|circumcise|never considered|medical authorities/i.test(l)) return adjustColor(C.red, index);
  
  return getCategoricalColor(index);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fetching questions...");
  const qData = await fetchJson('https://findings.circumsurvey.online/api/questions');
  const questions = qData.questions;
  console.log(`Checking ${questions.length} questions for color contrast issues...`);
  
  let issues = [];
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      const distData = await fetchJson(`https://findings.circumsurvey.online/api/response-distribution?q=${q.id}`);
      const dist = distData.distribution || [];
      
      const colors = new Map();
      let hasConflict = false;
      let conflictDetails = [];
      
      dist.forEach((d, index) => {
        const color = colorForLabel(d.label, index);
        if (colors.has(color)) {
          hasConflict = true;
          conflictDetails.push(`Color ${color} duplicated for: "${colors.get(color)}" AND "${d.label}"`);
        }
        colors.set(color, d.label);
      });
      
      if (hasConflict) {
        issues.push({ id: q.id, details: conflictDetails });
      }
    } catch (e) {
      console.error(`Failed to fetch ${q.id}`);
    }
    
    if (i % 50 === 0) console.log(`Processed ${i}/${questions.length}`);
  }
  
  console.log("\n--- TEST RESULTS ---");
  if (issues.length === 0) {
    console.log("SUCCESS: All legends have visually distinct colors!");
  } else {
    console.log(`FAILED: Found ${issues.length} questions with color collisions:`);
    issues.forEach(i => {
      console.log(`\nQuestion ID: ${i.id}`);
      i.details.forEach(d => console.log(`  - ${d}`));
    });
  }
}

run();
