/**
 * Cloudflare Pages Function: /api/cms/bulk-match
 * Scans the R2 ARCHIVE_BUCKET, finds unlinked files, and fuzzy-matches them to D1 rows,
 * or creates new rows if no match is found. Sets status to 'pending_ocr'.
 */
export async function onRequestPost(context) {
  const { env } = context;

  if (!env.SURVEY_DB || !env.ARCHIVE_BUCKET) {
    return new Response(JSON.stringify({ error: "Missing database or bucket binding" }), { status: 500 });
  }

  try {
    // 1. List objects in R2
    let cursor = undefined;
    let allObjects = [];
    do {
      const options = { limit: 1000 };
      if (cursor) options.cursor = cursor;
      const objects = await env.ARCHIVE_BUCKET.list(options);
      allObjects.push(...objects.objects);
      cursor = objects.truncated ? objects.cursor : undefined;
    } while (cursor);
    
    // 2. Fetch all archive_documents
    const docs = await env.SURVEY_DB.prepare("SELECT id, title, url FROM archive_documents").all();
    
    let matched = 0;
    let created = 0;
    let skipped = 0;

    // Build a map of existing URLs to avoid processing files already linked
    const existingUrls = new Set();
    docs.results.forEach(d => {
      if (d.url) existingUrls.add(d.url);
    });

    for (const obj of allObjects) {
      const fileUrl = `/api/assets/${obj.key}`;
      
      // Skip if already in database
      if (existingUrls.has(fileUrl)) {
        skipped++;
        continue;
      }

      // Normalize filename for fuzzy matching
      const normalizedFilename = obj.key.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').toLowerCase().trim();
      
      // Try to find a match
      let match = docs.results.find(d => {
        if (!d.title) return false;
        // Don't match against rows that already have a URL
        if (d.url) return false;
        
        const normalizedTitle = d.title.replace(/[-_]/g, ' ').toLowerCase().trim();
        // Return true if filename is very similar to title
        return normalizedTitle.includes(normalizedFilename) || normalizedFilename.includes(normalizedTitle);
      });

      if (match) {
        // Link the matched row
        await env.SURVEY_DB.prepare(`
          UPDATE archive_documents 
          SET url = ?, status = 'pending_ocr' 
          WHERE id = ?
        `).bind(fileUrl, match.id).run();
        
        matched++;
        existingUrls.add(fileUrl);
        // Ensure we don't match this row again
        match.url = fileUrl;
      } else {
        // Create a new row
        const newId = crypto.randomUUID().split('-')[0];
        const niceTitle = normalizedFilename.replace(/\b\w/g, c => c.toUpperCase());
        
        await env.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (id, title, url, type, status, source_collection)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(newId, niceTitle, fileUrl, 'pdf', 'pending_ocr', 'Bulk Ingest').run();
        
        created++;
        existingUrls.add(fileUrl);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      stats: { matched, created, skipped, total: allObjects.length }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
