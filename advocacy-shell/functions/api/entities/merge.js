export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { sourceId, sourceName, targetId, targetName } = data;

    if (!sourceId || !sourceName || !targetId || !targetName) {
      return new Response(JSON.stringify({ error: "Missing required fields for merge." }), { status: 400 });
    }

    if (sourceId === targetId) {
      return new Response(JSON.stringify({ error: "Cannot merge an entity into itself." }), { status: 400 });
    }

    // 1. Fetch all documents
    const { results: documents } = await env.SURVEY_DB.prepare('SELECT id, metadata_json FROM archive_documents WHERE metadata_json IS NOT NULL').all();

    const updatePromises = [];
    const lowerSource = sourceName.toLowerCase();

    for (const doc of documents) {
      let changed = false;
      let meta;
      try {
        meta = JSON.parse(doc.metadata_json);
      } catch (e) {
        continue;
      }

      // Helper to swap and deduplicate
      const swapName = (arr) => {
        if (!Array.isArray(arr)) return arr;
        let modified = false;
        const newArr = [];
        const seen = new Set();
        for (const item of arr) {
          if (!item) continue;
          let finalName = item;
          if (item.toLowerCase() === lowerSource) {
            finalName = targetName;
            modified = true;
          }
          if (!seen.has(finalName.toLowerCase())) {
            seen.add(finalName.toLowerCase());
            newArr.push(finalName);
          } else {
            // It was a duplicate, meaning we merged into an existing one
            modified = true; 
          }
        }
        return modified ? newArr : arr;
      };

      if (meta.organizations) {
        const updated = swapName(meta.organizations);
        if (updated !== meta.organizations) { meta.organizations = updated; changed = true; }
      }
      if (meta.key_people) {
        const updated = swapName(meta.key_people);
        if (updated !== meta.key_people) { meta.key_people = updated; changed = true; }
      }
      if (meta.gemini_extracted_metadata) {
        if (meta.gemini_extracted_metadata.organizations) {
          const updated = swapName(meta.gemini_extracted_metadata.organizations);
          if (updated !== meta.gemini_extracted_metadata.organizations) { meta.gemini_extracted_metadata.organizations = updated; changed = true; }
        }
        if (meta.gemini_extracted_metadata.authors) {
          const updated = swapName(meta.gemini_extracted_metadata.authors);
          if (updated !== meta.gemini_extracted_metadata.authors) { meta.gemini_extracted_metadata.authors = updated; changed = true; }
        }
      }

      if (changed) {
        updatePromises.push(
          env.SURVEY_DB.prepare('UPDATE archive_documents SET metadata_json = ? WHERE id = ?')
            .bind(JSON.stringify(meta), doc.id).run()
        );
      }
    }

    // Execute all document updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // 2. Delete the source entity
    await env.SURVEY_DB.prepare('DELETE FROM entities WHERE id = ?').bind(sourceId).run();

    return new Response(JSON.stringify({ success: true, updatedDocuments: updatePromises.length }), { headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
