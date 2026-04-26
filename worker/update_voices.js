import fs from "fs";
import path from "path";

async function main() {
  const voicesPath = path.resolve("../src/voices.js");
  let voicesJs = fs.readFileSync(voicesPath, "utf8");

  const match = voicesJs.match(/export const VOICES_THEMES = (\{[\s\S]*\});\n$/);
  if (!match) {
    console.error("Could not find VOICES_THEMES in voices.js");
    return;
  }
  
  const voicesThemes = eval("(" + match[1] + ")");

  console.log("Fetching questions from API...");
  const resQs = await fetch("https://findings.circumsurvey.online/api/questions");
  const dQs = await resQs.json();
  const openTextQs = dQs.questions.filter(q => q.type === "open_text").map(q => q.id);

  console.log(`Fetching narratives for ${openTextQs.length} open_text questions...`);
  const textToMeta = new Map();
  
  for (let i = 0; i < openTextQs.length; i += 10) {
    const chunk = openTextQs.slice(i, i + 10);
    await Promise.all(chunk.map(async (q) => {
      try {
        const res = await fetch(`https://findings.circumsurvey.online/api/narratives?q=${q}`);
        const data = await res.json();
        if (data && data.narratives) {
          for (const n of data.narratives) {
            textToMeta.set(n.text.trim(), n);
          }
        }
      } catch (e) {
        // ignore
      }
    }));
  }

  let matchCount = 0;
  for (const theme of Object.values(voicesThemes)) {
    for (const pathwayQuotes of Object.values(theme.pathways)) {
      for (const quote of pathwayQuotes) {
        const meta = textToMeta.get(quote.text.trim());
        if (meta) {
          matchCount++;
          if (meta.age_bracket) quote.age_bracket = meta.age_bracket;
          if (meta.country_born) quote.country_born = meta.country_born;
          if (meta.country_now) quote.country_now = meta.country_now;
          if (meta.us_state_born) quote.us_state_born = meta.us_state_born;
          if (meta.us_state_now) quote.us_state_now = meta.us_state_now;
          if (meta.canada_province_born) quote.canada_province_born = meta.canada_province_born;
          if (meta.canada_province_now) quote.canada_province_now = meta.canada_province_now;
        }
      }
    }
  }
  
  console.log(`Matched ${matchCount} quotes!`);
  
  const newJs = voicesJs.substring(0, match.index) + 
    "export const VOICES_THEMES = " + 
    JSON.stringify(voicesThemes, null, 2) + 
    ";\n";
    
  fs.writeFileSync(voicesPath, newJs);
  console.log("Updated voices.js");
}

main();
