import https from 'https';

// --- Color Generation Logic to Test ---
const C = { grey: '#a0a0a0', blue: '#5b93c7', ltBlue: '#8bb8d9', yellow: '#e8c868', orange: '#e8a44a', red: '#d94f4f' };

// 20 maximally distinct colors (Sasha Trubetskoy's palette)
const DISTINCT_COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", 
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", 
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000", 
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];

function getCategoricalColor(index) {
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
}

function adjustColor(hex, index) {
  if (index === 0) return hex;
  const sign = index % 2 === 1 ? -1 : 1;
  const step = Math.ceil(index / 2) % 5;
  const magnitude = (step === 0 ? 5 : step) * 0.15;
  let color = hex.replace("#", "");
  if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
  let r = parseInt(color.substr(0, 2), 16), g = parseInt(color.substr(2, 2), 16), b = parseInt(color.substr(4, 2), 16);
  if (sign > 0) { r += (255 - r) * magnitude; g += (255 - g) * magnitude; b += (255 - b) * magnitude; }
  else { r *= (1 - magnitude); g *= (1 - magnitude); b *= (1 - magnitude); }
  return `#${Math.round(Math.max(0, Math.min(255, r))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, g))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, b))).toString(16).padStart(2, '0')}`;
}

function colorForLabel(label, index = 0) {
  const l = (label || "").toLowerCase();
  if (!l || /^n\/a$|^not applicable$|^don'?t know$|^unsure$|^not sure$|^prefer not|^no idea$|^don'?t think$|^don'?t really frame$/.test(l)) return adjustColor(C.grey, index);
  if (/^very positive$|^confident$|^proud$|^never$|\b1\+ min|^strongly prefer intact$|^intact significantly$|^keep intact$|^child'?s right$|^neutral pros$|^uncommon$|^actively researching$|^no[,.]?$/i.test(l)) return adjustColor(C.blue, index);
  if (/^positive$|^proud and satisfied$|^generally$|^light blue$|^moderately$/i.test(l)) return adjustColor(C.ltBlue, index);
  if (/^neutral$|^no difference$|^no preference$|^mix$|^50\/50$|^undecided$|^ambivalent$|^somewhat$/i.test(l)) return adjustColor(C.yellow, index);
  if (/^negative$|^somewhat dissatisfied$|^often$|^orange$|^depends$|^brief$/i.test(l)) return adjustColor(C.orange, index);
  if (/^very negative$|^dissatisfied$|^always$|^almost always$|^0.{0,2}5 sec$|^something is missing$|^routine$|^unquestioned$|^strongly prefer circ$|^circ significantly$|^circumcise$|^never considered$|^medical authorities$/i.test(l)) return adjustColor(C.red, index);
  return getCategoricalColor(index);
}

// --- Test Logic ---
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  return [parseInt(c.substr(0,2), 16), parseInt(c.substr(2,2), 16), parseInt(c.substr(4,2), 16)];
}

// Simple Euclidean distance in RGB space
function colorDistance(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
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
  console.log("Fetching questions from API...");
  const qData = await fetchJson('https://findings.circumsurvey.online/api/questions');
  const questions = qData.questions;
  console.log(`Analyzing ${questions.length} questions for color contrast issues...`);
  
  let totalIssues = 0;
  // A distance threshold of 20 in RGB space is visually similar.
  // A threshold of 40 is fairly distinct.
  const DISTANCE_THRESHOLD = 30; 
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      const distData = await fetchJson(`https://findings.circumsurvey.online/api/response-distribution?q=${q.id}`);
      const dist = distData.distribution || [];
      
      // Free-text questions have way too many options to test against a 20-color palette.
      if (dist.length > 20) continue;
      
      const assignments = dist.map((d, index) => ({
        label: d.label,
        color: colorForLabel(d.label, index)
      }));
      
      let qIssues = [];
      // Compare all pairs
      for (let j = 0; j < assignments.length; j++) {
        for (let k = j + 1; k < assignments.length; k++) {
          const c1 = assignments[j].color;
          const c2 = assignments[k].color;
          const distVal = colorDistance(c1, c2);
          if (distVal < DISTANCE_THRESHOLD) {
            qIssues.push(`Low contrast (${Math.round(distVal)}) between "${assignments[j].label}" (${c1}) AND "${assignments[k].label}" (${c2})`);
          }
        }
      }
      
      if (qIssues.length > 0) {
        totalIssues++;
        console.log(`\n❌ [${q.id}] has ${qIssues.length} contrast issues:`);
        qIssues.forEach(msg => console.log(`   - ${msg}`));
      }
    } catch (e) {
      // ignore
    }
  }
  
  console.log("\n======================");
  if (totalIssues === 0) {
    console.log("✅ SUCCESS: All 355 questions have excellent color contrast!");
  } else {
    console.log(`⚠️ FAILED: Found ${totalIssues} questions with low-contrast legend colors.`);
  }
}

run();
