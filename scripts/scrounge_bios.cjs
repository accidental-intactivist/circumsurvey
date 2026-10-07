const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  console.log("Fetching entities...");
  const entRes = await fetch("http://127.0.0.1:8788/api/entities");
  const entities = await entRes.json();
  console.log(`Total entities: ${entities.length}`);

  console.log("Fetching documents...");
  const docRes = await fetch("http://127.0.0.1:8788/api/cms");
  const docsPayload = await docRes.json();
  const documents = docsPayload.data || docsPayload || [];
  console.log(`Total documents: ${documents.length}`);

  console.log("Calculating mention counts...");
  const counts = {};
  entities.forEach(e => { counts[e.id] = 0; });
  documents.forEach(doc => {
    if (!doc.metadata_json) return;
    try {
      const meta = JSON.parse(doc.metadata_json);
      entities.forEach(e => {
        const name = e.name?.toLowerCase();
        if (!name) return;
        const inOrgs = (meta.organizations || []).some(o => o.toLowerCase() === name) ||
                       (meta.gemini_extracted_metadata?.organizations || []).some(o => o.toLowerCase() === name);
        const inPeople = (meta.key_people || []).some(p => p.toLowerCase() === name) ||
                         (meta.gemini_extracted_metadata?.authors || []).some(p => p.toLowerCase() === name);
        if (inOrgs || inPeople) {
          counts[e.id] = (counts[e.id] || 0) + 1;
        }
      });
    } catch (err) { }
  });

  const targets = entities.filter(ent => {
    if (ent.description) return false;
    const count = counts[ent.id] || 0;
    const role = ent.role || '';
    return count >= 3 || role === 'champion' || role === 'critic';
  });

  console.log(`Found ${targets.length} entities meeting criteria for bio generation.`);
  if (targets.length === 0) return;

  const updates = [];
  
  for (let i = 0; i < targets.length; i++) {
    const ent = targets[i];
    console.log(`[${i+1}/${targets.length}] Generating bio for ${ent.name}...`);
    
    try {
      const query = `Write a short, professional, and encyclopedic biography about ${ent.name}. Focus ONLY on their background and their contributions/mentions within the archive context. Do not add outside information unless it's strictly biographical facts.`;
      const chatRes = await fetch("http://127.0.0.1:8788/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const chatData = await chatRes.json();
      const bio = chatData.response || '';
      
      if (bio) {
        const escapedBio = bio.replace(/'/g, "''");
        updates.push(`UPDATE entities SET description = '${escapedBio}' WHERE id = '${ent.id}';`);
      } else {
        console.log(`  -> Empty response`);
      }
    } catch (e) {
      console.error(`  -> Failed: ${e.message}`);
    }
    
    // Pause for 3s
    await new Promise(r => setTimeout(r, 3000));
  }

  if (updates.length > 0) {
    const sqlFile = "scratch/bulk_bios.sql";
    if (!fs.existsSync("scratch")) fs.mkdirSync("scratch");
    fs.writeFileSync(sqlFile, updates.join("\n"), "utf-8");
    
    console.log(`Wrote ${updates.length} updates to ${sqlFile}. Executing...`);
    try {
      execSync(`npx.cmd wrangler d1 execute circumsurvey --local --file="${sqlFile}"`);
      console.log("Successfully updated bios in database!");
    } catch(e) {
      console.error("Failed to execute SQL:");
    }
  }
}

main().catch(console.error);
