export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;
  try {
    const { action } = await request.json();
    
    if (action === 'reject') {
      await env.SURVEY_DB.prepare("UPDATE ingestion_queue SET status = 'rejected' WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true, status: 'rejected' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    if (action === 'approve') {
      // 1. Fetch item
      const item = await env.SURVEY_DB.prepare("SELECT * FROM ingestion_queue WHERE id = ?").bind(id).first();
      if (!item) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      
      const docId = `news-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      
      const metadata_json = JSON.stringify({
          academic_title: item.title,
          abstract: item.abstract,
          source_publication: item.source,
          date: new Date().toISOString().split('T')[0]
      });

      // 2. Insert into archive_documents
      await env.SURVEY_DB.prepare(`
        INSERT INTO archive_documents (
          id, title, source_collection, url, type, status, metadata_json
        ) VALUES (?, ?, ?, ?, ?, 'indexed', ?)
      `).bind(
        docId,
        item.title,
        "Deep Research Monitor",
        item.url,
        'external_news',
        metadata_json
      ).run();
      
      // 3. Vectorize for AI Assistant
      const aiBinding = env.AI || env.Workers_AI;
      if (aiBinding && env.ARCHIVE_INDEX) {
          try {
              const vectorData = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [item.abstract] });
              if (vectorData && vectorData.data && vectorData.data[0]) {
                  const vector = vectorData.data[0];
                  await env.ARCHIVE_INDEX.upsert([{
                      id: docId,
                      values: vector,
                      metadata: { source: item.url, text: item.abstract }
                  }]);
              }
          } catch(e) { console.error("Vectorization failed", e); }
      }

      // 4. Mark approved
      await env.SURVEY_DB.prepare("UPDATE ingestion_queue SET status = 'approved' WHERE id = ?").bind(id).run();
      
      return new Response(JSON.stringify({ success: true, status: 'approved' }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
