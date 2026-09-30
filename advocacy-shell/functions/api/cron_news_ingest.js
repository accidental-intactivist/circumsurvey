/**
 * Autonomous "Living Archive" News Scraper
 * Fetches recent news via RSS, extracts metadata via Gemini, and inserts 'external_news' into D1.
 * We store ONLY the metadata and abstract, NOT the full text, keeping the DB lean.
 */
export async function onRequest(context) {
  const { env } = context;

  if (!env.SURVEY_DB) {
    return new Response("Database binding not found", { status: 500 });
  }
  const aiBinding = env.AI || env.Workers_AI;
  if (!aiBinding) {
    return new Response("AI binding not found", { status: 500 });
  }
  if (!env.ARCHIVE_INDEX) {
    return new Response("ARCHIVE_INDEX binding not found", { status: 500 });
  }

  try {
    console.log("Fetching latest news from Google News RSS...");
    const queries = [
      'intactivism OR "circumcision ethics"',
      '"circumcision rate" AND ("US" OR "United States")',
      '"genital autonomy"',
      'circumcision'
    ];
    
    let allArticles = [];
    for (const q of queries) {
      const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(`https://news.google.com/rss/search?q=${q}`);
      try {
        const res = await fetch(rssUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.items) allArticles = allArticles.concat(data.items);
        }
      } catch (e) { console.error("Failed to fetch RSS for query:", q); }
    }
    
    // Deduplicate by link
    const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());
    let inserted = 0;

    for (const article of uniqueArticles.slice(0, 10)) { // process top 10
      // Check if it already exists
      const existing = await env.SURVEY_DB.prepare("SELECT id FROM archive_documents WHERE url = ?").bind(article.link).first();
      
      if (!existing) {
        // Fetch article text (lightweight scrape)
        let pageText = article.description || '';
        let ogImage = null;
        try {
            const pageRes = await fetch(article.link);
            const html = await pageRes.text();
            
            const ogImageMatch = html.match(/<meta[^>]*property=['"]og:image['"][^>]*content=['"]([^'"]+)['"]/i) || 
                                 html.match(/<meta[^>]*content=['"]([^'"]+)['"][^>]*property=['"]og:image['"]/i);
            if (ogImageMatch && ogImageMatch[1]) {
                ogImage = ogImageMatch[1];
            }

            // strip HTML tags roughly
            pageText = html.replace(/<[^>]*>?/gm, '').slice(0, 15000); 
        } catch(e) {
            console.log("Could not fetch full article, using description.");
        }

        // Call Gemini (via REST API to avoid SDK dependency issues in Workers)
        const prompt = `
          Analyze the following news article text and extract key metadata into a strict JSON format.
          Return ONLY a raw JSON object with:
          {
            "academic_title": "The article headline",
            "summary": "A 1-2 paragraph summary.",
            "abstract": "A concise abstract of the article's contents.",
            "source_publication": "The name of the news outlet",
            "author": "Author name if any",
            "tags": ["Tag 1", "Tag 2"],
            "key_people": ["Name 1", "Name 2"],
            "organizations": ["Org 1", "Org 2"],
            "date": "YYYY-MM-DD"
          }
          Text: ${pageText}
        `;

        let metadata_json = JSON.stringify({
            academic_title: article.title,
            abstract: article.description,
            date: article.pubDate,
            source_publication: "News Source"
        });

        if (env.GEMINI_API_KEY) {
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
                    let parsedAI = JSON.parse(aiData.candidates[0].content.parts[0].text);
                    if (ogImage) {
                        parsedAI.image_url = ogImage;
                    }
                    metadata_json = JSON.stringify(parsedAI);
                }
            } catch(e) { console.error("Gemini API failed", e); }
        }

        const docId = crypto.randomUUID().split('-')[0];
        
        // 1. Insert into D1
        await env.SURVEY_DB.prepare(`
          INSERT INTO archive_documents (
            id, title, source_collection, url, type, status, metadata_json
          ) VALUES (?, ?, ?, ?, ?, 'indexed', ?)
        `).bind(
          docId,
          article.title,
          "Global News Monitoring",
          article.link,
          'external_news',
          metadata_json
        ).run();

        // 2. Vectorize for AI Assistant (RAG)
        let abstract = article.description;
        try {
            const parsedMeta = JSON.parse(metadata_json);
            if (parsedMeta.abstract) abstract = parsedMeta.abstract;
        } catch(e) {}
        
        try {
            const vectorData = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [abstract] });
            if (vectorData && vectorData.data && vectorData.data[0]) {
                const vector = vectorData.data[0];
                await env.ARCHIVE_INDEX.upsert([{
                    id: docId,
                    values: vector,
                    metadata: { source: article.link, text: abstract, doc_id: docId }
                }]);
            }
        } catch(e) {
            console.error("Vectorization failed", e);
        }
        
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${uniqueArticles.length} news items, extracted metadata, and inserted ${inserted} external_news records.`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
