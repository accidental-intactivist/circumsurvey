// Run this script via: node scripts/embed.js
// Make sure your worker is running locally via: npm run dev
// This script will repeatedly call the local worker to batch embed all qualitative responses.

async function embedAll() {
  let offset = 0;
  const limit = 100; // Batch size (max 5000 for vectorize, but keeping it small to avoid worker timeouts)
  let done = false;
  let totalProcessed = 0;
  
  console.log("🚀 Starting batch embedding process...");
  
  while (!done) {
    console.log(`\nFetching batch (Offset: ${offset}, Limit: ${limit})...`);
    try {
      // Calls the local wrangler dev server
      const res = await fetch(`http://127.0.0.1:8787/api/ai/embed_batch?limit=${limit}&offset=${offset}`);
      
      if (!res.ok) {
         console.error(`❌ Error ${res.status}:`, await res.text());
         break;
      }
      
      const data = await res.json();
      
      if (data.done) {
        console.log(`\n✅ Finished! Successfully embedded ${totalProcessed} total narrative responses into Vectorize.`);
        done = true;
      } else if (data.success) {
        totalProcessed += data.processed;
        console.log(`✅ Success: Embedded ${data.processed} vectors (Total: ${totalProcessed}).`);
        offset = data.next_offset;
      } else {
        console.error("❌ Unexpected response:", data);
        break;
      }
    } catch (err) {
      console.error("❌ Fetch failed. Make sure 'npm run dev' is running in the worker directory!", err.message);
      break;
    }
    
    // Tiny delay to be nice to the local runtime
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

embedAll();
