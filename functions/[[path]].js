export async function onRequestGet(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // 1. Fetch the actual asset (index.html, css, js, etc.)
  const response = await env.ASSETS.fetch(request);
  
  // Only intercept HTML responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    return response;
  }

  // 2. Default SEO metadata
  let title = "Intactivism Archive";
  let description = "A digital repository preserving historical documents, medical journals, and personal accounts concerning genital autonomy and circumcision.";

  // 3. Match specific routes (e.g. /library/:id or /news/:id)
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  if ((pathParts[0] === 'library' || pathParts[0] === 'news') && pathParts[1]) {
    const docId = pathParts[1];
    try {
      if (env.SURVEY_DB) {
        const doc = await env.SURVEY_DB.prepare("SELECT title, metadata_json, type FROM archive_documents WHERE id = ?").bind(docId).first();
        if (doc) {
          try {
            const meta = JSON.parse(doc.metadata_json || '{}');
            title = meta.academic_title || meta.title || doc.title || title;
            description = meta.abstract || meta.summary || meta.description || description;
            
            // Clean up long descriptions for OG tags
            if (description.length > 200) {
              description = description.substring(0, 197) + "...";
            }
          } catch(e) {}
        }
      }
    } catch (e) {
      console.warn("Error fetching SEO metadata for doc:", e);
    }
  }

  // 4. Use HTMLRewriter to inject the tags into the static index.html
  return new HTMLRewriter()
    .on('title', {
      element(e) {
        e.setInnerContent(`${title} | Intactivism Archive`);
      }
    })
    .on('meta[property="og:title"]', {
      element(e) { e.setAttribute("content", title); }
    })
    .on('meta[name="twitter:title"]', {
      element(e) { e.setAttribute("content", title); }
    })
    .on('meta[property="og:description"]', {
      element(e) { e.setAttribute("content", description); }
    })
    .on('meta[name="twitter:description"]', {
      element(e) { e.setAttribute("content", description); }
    })
    .transform(response);
}
