import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Read .env if it exists
try {
  const envPath = path.resolve('.env');
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
} catch (e) {
  // Ignore if .env doesn't exist
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DB_NAME = process.argv[2] || 'circumsurvey-db';

async function runQuery(query) {
  const cmd = `npx wrangler d1 execute ${DB_NAME} --local --json --command="${query.replace(/"/g, '\\"')}"`;
  const { stdout } = await execAsync(cmd);
  try {
    const jsonStart = stdout.indexOf('[');
    if (jsonStart === -1) throw new Error("No JSON array found in output");
    const jsonStr = stdout.substring(jsonStart);
    const result = JSON.parse(jsonStr);
    return result[0]?.results || [];
  } catch (e) {
    console.error("Failed to parse output:", stdout);
    throw e;
  }
}

async function enrichEntity(entity) {
  console.log(`\n🔍 Searching details for: ${entity.name}...`);
  
  const prompt = `You are a researcher. Find contact information and a brief, factual description (details) for the organization or person named "${entity.name}".
  
1. Use Google Search to find their official public website or their Wikipedia page.
2. Extract any public contact information available (address, phone number, email, or contact page URL).
3. Provide a brief factual description (1-2 sentences) of what they do or who they are.

Respond with ONLY a JSON object in this format (no markdown code blocks, no other text):
{
  "contact_info": "extracted contact info or null if not found",
  "description": "brief factual description or null if not found",
  "url": "their official website URL or null if not found"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error(`❌ Failed to enrich ${entity.name}:`, err.message);
    return null;
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set. Add it to .env or your environment.");
    process.exit(1);
  }

  console.log(`Using database binding: ${DB_NAME}`);
  console.log("Fetching entities that need enrichment...");
  
  // Find entities missing contact info or description
  const query = `SELECT id, name, type FROM entities WHERE contact_info IS NULL OR contact_info = '' OR description IS NULL OR description = '';`;
  
  let entities = [];
  try {
    entities = await runQuery(query);
  } catch (e) {
    console.error("Error querying database. Make sure the database name is correct and wrangler is running.");
    console.error("You can pass the correct DB binding name as an argument: node scripts/enrich_entities.js <DB_NAME>");
    process.exit(1);
  }

  if (entities.length === 0) {
    console.log("✅ All entities are fully enriched!");
    return;
  }

  console.log(`Found ${entities.length} entities to enrich.`);

  for (const entity of entities) {
    const enrichedData = await enrichEntity(entity);
    if (!enrichedData) continue;

    console.log(`   Found: ${enrichedData.url ? enrichedData.url : 'No URL'} | Contact: ${enrichedData.contact_info ? 'Yes' : 'No'}`);
    
    // Update database
    let updates = [];
    if (enrichedData.contact_info) updates.push(`contact_info = '${enrichedData.contact_info.replace(/'/g, "''")}'`);
    if (enrichedData.description) updates.push(`description = '${enrichedData.description.replace(/'/g, "''")}'`);
    if (enrichedData.url) updates.push(`url = '${enrichedData.url.replace(/'/g, "''")}'`);
    
    if (updates.length > 0) {
      const updateQuery = `UPDATE entities SET ${updates.join(', ')} WHERE id = '${entity.id.replace(/'/g, "''")}';`;
      try {
        await runQuery(updateQuery);
        console.log(`   ✅ Saved to database.`);
      } catch (e) {
        console.error(`   ❌ Failed to update database for ${entity.name}`);
      }
    } else {
      console.log(`   ⚠️ No new fields to update for ${entity.name}`);
    }
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("\n🎉 Enrichment complete!");
}

main().catch(console.error);
