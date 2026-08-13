import fs from 'fs';
import { VOICES_THEMES } from '../src/voices.js';

// This script generates a newline-delimited JSON (NDJSON) file that you can
// upload to your Cloudflare Vectorize index using the Wrangler CLI.
// It extracts all curated quotes from src/voices.js, which guarantees that
// ONLY hand-selected, anonymized quotes make it into the AI's search space.

async function main() {
  const BATCH_FILE = 'curated_quotes_batch.ndjson';
  const out = fs.createWriteStream(BATCH_FILE);

  let quoteCount = 0;
  
  // You would typically use an embedding API here to generate the vector values
  // before uploading. For demonstration, we just prepare the metadata.
  // In a real environment, you'd call a BGE-Small (384-d) endpoint for each text.
  
  for (const [themeKey, themeData] of Object.entries(VOICES_THEMES)) {
    for (const [pathway, quotes] of Object.entries(themeData.pathways || {})) {
      for (const quote of quotes) {
        // Prepare text in a similar way the docent might search for it
        const text = `Theme: ${themeData.title}\nPathway: ${pathway}\nAge: ${quote.age_bracket || quote.age}\nQuote: ${quote.text}`;
        
        // This is a placeholder for the actual embedding vector array
        const mockEmbedding = new Array(384).fill(0.0); 

        const record = {
          id: `curated_${themeKey}_${pathway}_${quote.row_idx}`,
          values: mockEmbedding,
          metadata: {
            type: "curated_quote",
            theme: themeKey,
            pathway: pathway,
            generation: quote.generation || "unknown",
            text: quote.text.substring(0, 5000)
          }
        };

        out.write(JSON.stringify(record) + '\n');
        quoteCount++;
      }
    }
  }

  out.end();

  console.log(`\n✅ Generated ${BATCH_FILE} with ${quoteCount} curated quotes.`);
  console.log(`\nTo upload to Cloudflare Vectorize (once you have actual embeddings), run:`);
  console.log(`npx wrangler vectorize insert <INDEX_NAME> --file ${BATCH_FILE}\n`);
}

main().catch(console.error);
