export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const { results } = await env.SURVEY_DB.prepare("SELECT id, title, metadata_json FROM archive_documents").all();
    
    let updatedCount = 0;
    
    for (const doc of results) {
      if (doc.metadata_json) {
        try {
          const meta = JSON.parse(doc.metadata_json);
          let pub_date = meta.date || meta.publication_date || "Unknown";
          
          if (pub_date === "Unknown" || !pub_date || pub_date === "--") {
            // Try to extract date from title
            const match = doc.title.match(/(?:19|20)\d{2}(?:-\d{2}-\d{2})?/);
            if (match) {
              meta.date = match[0];
              meta.publication_date = match[0];
              
              const updatedMetaJson = JSON.stringify(meta);
              await env.SURVEY_DB.prepare(
                "UPDATE archive_documents SET metadata_json = ? WHERE id = ?"
              ).bind(updatedMetaJson, doc.id).run();
              
              updatedCount++;
            }
          }
        } catch (e) {
          // JSON parse error, skip
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true, updatedCount }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
