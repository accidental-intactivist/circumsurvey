/**
 * CMS Scheduled Ingestion Endpoint
 * Fetches recent posts from Reddit (/r/Intactivism/new.json) and inserts them into the D1 CMS as 'pending'.
 * Note: In a production Cloudflare Pages app, this can be triggered via a cron tool calling this endpoint.
 */
export async function onRequest(context) {
  const { env } = context;

  if (!env.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }

  try {
    console.log("Fetching latest posts from r/Intactivism...");
    const res = await fetch('https://www.reddit.com/r/Intactivism/new.json?limit=10', {
      headers: { 'User-Agent': 'windows:org.intactivism.archive:v1.0 (by /u/apettit)' }
    });
    
    if (!res.ok) {
      throw new Error(`Reddit API failed with status ${res.status}`);
    }

    const data = await res.json();
    const posts = data.data.children;
    let inserted = 0;

    for (const post of posts) {
      const p = post.data;
      
      // Skip very short or uninteresting posts (basic filtering)
      if (!p.selftext && !p.url) continue;

      // Extract basic media
      let mediaUrls = [];
      if (p.url && p.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
        mediaUrls.push(p.url);
      } else if (p.thumbnail && p.thumbnail.startsWith('http')) {
        mediaUrls.push(p.thumbnail);
      }

      // Check if it already exists (using the Reddit ID as our unique ID)
      const docId = `reddit-${p.id}`;
      const existing = await env.SURVEY_DB.prepare("SELECT id FROM archive_documents WHERE id = ?").bind(docId).first();
      
      if (!existing) {
        let metadata_json = JSON.stringify({
            author: p.author,
            date: new Date(p.created_utc * 1000).toISOString(),
            abstract: p.selftext.slice(0, 500),
            source_publication: "Reddit (r/Intactivism)"
        });

        if (env.GEMINI_API_KEY && p.selftext) {
            const prompt = `
              Analyze the following Reddit post and extract key metadata into a strict JSON format.
              Return ONLY a raw JSON object with:
              {
                "academic_title": "A short, clean title for the post",
                "summary": "A 1-2 paragraph summary.",
                "abstract": "A concise abstract of the post's contents.",
                "author": "The author's username",
                "tags": ["Tag 1", "Tag 2"],
                "key_people": ["Name 1", "Name 2"],
                "organizations": ["Org 1", "Org 2"],
                "source_publication": "Reddit (r/Intactivism)"
              }
              Post Title: ${p.title}
              Post Text: ${p.selftext}
            `;
            try {
                const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
                    })
                });
                const aiData = await aiRes.json();
                if (aiData.candidates && aiData.candidates[0].content.parts[0].text) {
                    const aiMeta = JSON.parse(aiData.candidates[0].content.parts[0].text);
                    aiMeta.date = new Date(p.created_utc * 1000).toISOString();
                    metadata_json = JSON.stringify(aiMeta);
                }
            } catch(e) { console.error("Gemini API failed for Reddit", e); }
        }

        await env.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (
            id, title, source_collection, url, type, status, media_urls, metadata_json
          ) VALUES (?, ?, ?, ?, ?, 'indexed', ?, ?)
        `).bind(
          docId,
          p.title,
          "Social Media Monitoring",
          `https://reddit.com${p.permalink}`,
          'social_post',
          mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null,
          metadata_json
        ).run();
        
        // Vectorize for AI Assistant (RAG)
        let abstractToVectorize = p.selftext.slice(0, 1000) || p.title;
        try {
            const parsedMeta = JSON.parse(metadata_json);
            if (parsedMeta.abstract) abstractToVectorize = parsedMeta.abstract;
        } catch(e) {}
        
        if (env.ARCHIVE_INDEX) {
            try {
                const aiBinding = env.AI || env.Workers_AI;
                const vectorData = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [abstractToVectorize] });
                if (vectorData && vectorData.data && vectorData.data[0]) {
                    const vector = vectorData.data[0];
                    await env.ARCHIVE_INDEX.upsert([{
                        id: docId,
                        values: vector,
                        metadata: { source: `https://reddit.com${p.permalink}`, text: abstractToVectorize, doc_id: docId }
                    }]);
                }
            } catch(e) {
                console.error("Vectorization failed for Reddit", e);
            }
        }
        
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${posts.length} posts, inserted ${inserted} new pending items into the CMS.`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
