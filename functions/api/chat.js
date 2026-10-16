const DB_SCHEMA = `
CREATE TABLE respondents (id INTEGER PRIMARY KEY, submitted_at TEXT, pathway TEXT, consent INTEGER);
CREATE TABLE demographics (respondent_id INTEGER PRIMARY KEY, country_born TEXT, country_now TEXT, us_state_born TEXT, us_state_now TEXT, race_ethnicity TEXT, age_bracket TEXT, generation TEXT, education TEXT, politics TEXT, sexuality TEXT, gender TEXT, sex_assigned TEXT);
CREATE TABLE religion (respondent_id INTEGER PRIMARY KEY, primary_tradition TEXT);
CREATE TABLE responses (respondent_id INTEGER, question_id TEXT, value_text TEXT, value_num REAL);
CREATE TABLE questions (id TEXT PRIMARY KEY, section TEXT, prompt TEXT, type TEXT);
`;

// In-memory rate limiting (per isolate)
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 5000; // 5 seconds per IP

const CURATED_MEDIA_ASSETS = [
  {
    doc_id: 'umass-ms1205-raw-efbf6dd4',
    doc_title: 'Goldstein & Yellen Gomco Clamp (U.S. Patent 1,935,188)',
    page_number: 1,
    image_url: '/figures/gomco-clamp-schematic.svg',
    caption: 'Gomco Circumcision Clamp Engineering Schematic (1935): Illustrating metal bell, aperture plate, and 20,000 psi circumferential crush mechanism',
    category: 'diagram',
    keywords: ['gomco', 'clamp', 'patent', 'yellen', 'goldstein', 'surgical', 'tool', 'crush', 'hemostasis', 'aperture', 'tools'],
    is_sensitive: 0
  },
  {
    doc_id: 'fda-mhn-2000-mogen',
    doc_title: 'Mogen Clamp Guillotine Slit & Blind Entrapment Cross-Section',
    page_number: 1,
    image_url: '/figures/mogen-clamp-schematic.svg',
    caption: 'Mogen Clamp Cross-Section: 2.5 mm blind slotted guillotine shield and glans entrapment hazard zone (FDA Public Health Notice 2000)',
    category: 'diagram',
    keywords: ['mogen', 'clamp', 'bronstein', 'guillotine', 'blind slit', 'glans amputation', 'iatrogenic', 'fda', 'tool', 'tools'],
    is_sensitive: 0
  },
  {
    doc_id: 'plastibell-device-dossier',
    doc_title: 'Hollister Plastibell Circumcision Device Schematic',
    page_number: 1,
    image_url: '/figures/plastibell-device-schematic.svg',
    caption: 'Plastibell Circumcision Device: Ischemic necrosis ligature ring, snap-off handle, and proximal migration / impaction risk profile',
    category: 'diagram',
    keywords: ['plastibell', 'hollister', 'ligature', 'ischemic necrosis', 'strangulation', 'ring migration', 'device', 'tool', 'tools'],
    is_sensitive: 0
  },
  {
    doc_id: '8d5a920fe2bd9c7d',
    doc_title: 'Cepeda-Emiliani et al. (2025), Andrology',
    page_number: 4,
    image_url: '/figures/8d5a920fe2bd9c7d.webp',
    caption: 'Immunohistochemistry: S100, CD56, PGP9.5 & PAN-TRK demonstrating dense peripheral nerve bundles and Schwann cell sheaths in prepuce',
    category: 'histology',
    keywords: ['microscopy', 'histology', 'nerve', 's100', 'cd56', 'schwann', 'innervation', 'anatomy', 'andrology'],
    is_sensitive: 0
  },
  {
    doc_id: '0bce81d4b2f610e3',
    doc_title: 'Cepeda-Emiliani et al. (2025), Andrology',
    page_number: 5,
    image_url: '/figures/0bce81d4b2f610e3.webp',
    caption: 'Fetal & Perinatal Nerve Architecture (NF / SOX10 / CD56): Dual-stain confocal showing complete and active peripheral innervation at birth',
    category: 'histology',
    keywords: ['fetal', 'perinatal', 'neurofilament', 'sox10', 'cd56', 'confocal', 'nerve', 'anatomy', 'histology'],
    is_sensitive: 0
  },
  {
    doc_id: '48ab95770483e073',
    doc_title: 'Cepeda-Emiliani et al. (2025), Andrology',
    page_number: 6,
    image_url: '/figures/48ab95770483e073.webp',
    caption: 'Subepithelial & Dermal Sensory Nerve Networks: High-power immunoreactivity showing delicate sensory web transducing mechanosensory touch',
    category: 'histology',
    keywords: ['subepithelial', 'dermal', 'sensory', 'pgp9.5', 'ngfr', 'fine touch', 'mechanoreceptor', 'histology'],
    is_sensitive: 0
  },
  {
    doc_id: '0e26b020c7876475',
    doc_title: 'Cepeda-Emiliani et al. (2025), Andrology',
    page_number: 7,
    image_url: '/figures/0e26b020c7876475.webp',
    caption: 'Frenular & Coronal Innervation Cross-Sections: Detailed micrographs of frenular nerve bundles and microvascular architecture',
    category: 'histology',
    keywords: ['frenulum', 'coronal', 'lymphatics', 'microscopy', 'erogenous', 'histology'],
    is_sensitive: 0
  },
  {
    doc_id: 'edd5e6e267a419cb',
    doc_title: 'Cepeda-Emiliani et al. (2025), Andrology',
    page_number: 8,
    image_url: '/figures/edd5e6e267a419cb.webp',
    caption: 'Ontogenetic Progression of Penile Innervation: Progressive elongation of sensory fibers leading to mature encapsulated corpuscles',
    category: 'diagram',
    keywords: ['ontogenetic', 'development', 'corpuscle', 'timeline', 'innervation', 'sensory', 'biology'],
    is_sensitive: 0
  }
];

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    
    if (ip !== 'unknown') {
      const lastRequest = rateLimitMap.get(ip);
      if (lastRequest && (now - lastRequest < RATE_LIMIT_MS)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a few seconds before asking another question." }), { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', 'Retry-After': Math.ceil((RATE_LIMIT_MS - (now - lastRequest))/1000).toString() } 
        });
      }
      rateLimitMap.set(ip, now);
      
      // Clean up map periodically
      if (rateLimitMap.size > 1000) {
        for (const [key, timestamp] of rateLimitMap.entries()) {
          if (now - timestamp > RATE_LIMIT_MS) rateLimitMap.delete(key);
        }
      }
    }

    const { query, attachedDocs, system_prompt_override } = await request.json();
    if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    const aiBinding = env.AI || env.Workers_AI;
    if (!aiBinding) throw new Error("AI binding is missing");

    // --- STEP 1: INTENT ROUTING ---
    const intentPrompt = `Classify the user's query into one of two categories:
ANALYTICAL: Strictly asks for statistics, numbers, counts, averages, or structured demographic data from a database. (e.g. "How many respondents are from CA?", "What percentage are intact?")
QUALITATIVE: Asks for themes, beliefs, historical documents, feelings, narratives, or is a conversational follow-up. (e.g. "Who is the author?", "Is there a specific person?", "How do men feel?")
Reply ONLY with the exact word "ANALYTICAL" or "QUALITATIVE".`;

    const intentResponse = await aiBinding.run('@cf/meta/llama-3.1-8b-instruct-fp8', { 
      messages: [{ role: "system", content: intentPrompt }, { role: "user", content: query }]
    });
    
    let intent = intentResponse.response.trim().toUpperCase();
    let finalAnswer = "";
    let citations = [];
    let fallbackToRag = false;

    if (intent.includes("ANALYTICAL")) {
      try {
        if (!env.SURVEY_DB) throw new Error("SURVEY_DB binding is missing");

        const questionsResult = await env.SURVEY_DB.prepare("SELECT id, prompt FROM questions").all();
        const questionsList = questionsResult.results.map(q => `ID: ${q.id} | Prompt: ${q.prompt}`).join('\n');

        const sqlPrompt = `You are a SQLite expert. Write a SQL query to answer the user's question based on this schema:
${DB_SCHEMA}

Available Survey Questions:
${questionsList}

Return ONLY the raw SQL query. Do not wrap in markdown or explain. Use standard SQLite syntax.`;

        const sqlResponse = await aiBinding.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { 
          messages: [{ role: "system", content: sqlPrompt }, { role: "user", content: query }]
        });
        
        let rawSql = sqlResponse.response.trim();
        if (rawSql.startsWith("\`\`\`sql")) rawSql = rawSql.substring(6);
        if (rawSql.startsWith("\`\`\`")) rawSql = rawSql.substring(3);
        if (rawSql.endsWith("\`\`\`")) rawSql = rawSql.substring(0, rawSql.length - 3);
        rawSql = rawSql.trim();

        if (!/^\s*SELECT\b/i.test(rawSql)) {
          throw new Error("Only SELECT queries are permitted.");
        }

        const dbResult = await env.SURVEY_DB.prepare(rawSql).all();
        const resultString = JSON.stringify(dbResult.results);
        
        const synthesisPrompt = `You are a data analyst. Answer the user's question using the provided database results.
Data Results: ${resultString}
Keep it factual and concise.`;
        const synthResponse = await aiBinding.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { 
          messages: [{ role: "system", content: synthesisPrompt }, { role: "user", content: query }],
          max_tokens: 1024
        });
        
        finalAnswer = synthResponse.response;
        citations.push(`Query Execution: ${rawSql}`);
      } catch (dbError) {
        console.warn("Analytical query failed, falling back to Qualitative RAG:", dbError.message);
        fallbackToRag = true;
      }
    }

    if (!intent.includes("ANALYTICAL") || fallbackToRag) {
      // --- STEP 2B: SEMANTIC RAG (QUALITATIVE) ---
      let contextText = "";
      let citationMap = new Map();

      // IF ATTACHED DOCS PROVIDED, INJECT THEM FIRST
      if (attachedDocs && Array.isArray(attachedDocs) && attachedDocs.length > 0) {
        for (const doc of attachedDocs) {
          const docId = doc.id;
          const meta = doc.metadata_json ? JSON.parse(doc.metadata_json) : {};
          const title = meta.academic_title || meta.title || doc.title || "Untitled Document";
          let docText = "";
          
          // Try to get text from vector index if possible, otherwise rely on metadata summary
          if (meta.description) docText += meta.description + "\n";
          if (meta.abstract) docText += meta.abstract + "\n";
          if (meta.gemini_extracted_metadata?.summary) docText += meta.gemini_extracted_metadata.summary + "\n";
          
          contextText += `\n--- Document ID: ${docId} (Source: ${title}) [USER ATTACHED THIS DOCUMENT EXPLICITLY] ---\n${docText}\n`;
          
          citationMap.set(title + docId, {
            source: title,
            doc_id: docId,
            snippets: ["User attached this document to the context."]
          });
        }
      }

      if (!env.ARCHIVE_INDEX) throw new Error("ARCHIVE_INDEX binding is missing");

      // INJECT EXACT ENTITY MATCHES INTO CONTEXT
      if (env.SURVEY_DB) {
        try {
          const entityResults = await env.SURVEY_DB.prepare("SELECT * FROM entities WHERE ? LIKE '%' || name || '%'").bind(query).all();
          if (entityResults.results && entityResults.results.length > 0) {
            for (const entity of entityResults.results) {
              const bioText = entity.bio || entity.description || entity.tagline || '';
              contextText += `\n--- Entity Profile: ${entity.name} ---\nRole: ${entity.tagline || ''}\nBio: ${bioText}\n`;
              citationMap.set("Entity:" + entity.id, { 
                source: "Entity Directory", 
                doc_id: entity.slug || entity.id, 
                snippets: [bioText] 
              });
            }
          }
        } catch (e) {
          console.warn("Could not query entities table:", e.message);
        }
      }

      const queryEmbedding = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [query] });
      const vector = queryEmbedding.data[0];

      const matches = await env.ARCHIVE_INDEX.query(vector, { topK: 3, returnMetadata: true });

      if (matches.matches && matches.matches.length > 0) {
        matches.matches.forEach((match, index) => {
          if (match.metadata && match.metadata.text) {
            const docId = match.metadata.doc_id || match.id.split('-')[0];
            // Truncate each document snippet to max 1000 chars to save context space
            const snippet = match.metadata.text.length > 1000 ? match.metadata.text.substring(0, 1000) + '...' : match.metadata.text;
            contextText += `\n--- Document ID: ${docId} (Source: ${match.metadata.source}) ---\n${snippet}\n`;
            
            // Extract a doc_id if available, fallback to the vector id prefix or just use source
            const key = match.metadata.source + docId;
            
            if (!citationMap.has(key)) {
                citationMap.set(key, { 
                   source: match.metadata.source, 
                   doc_id: docId === 'doc' ? null : docId, // ignore 'doc' fallback from generic ingestion
                   snippets: [] 
                });
            }
            citationMap.get(key).snippets.push(match.metadata.text);
          }
        });
      }
      citations = Array.from(citationMap.values());

      let docIds = citations.map(c => c.doc_id).filter(Boolean);
      if (docIds.length > 0 && env.SURVEY_DB) {
        try {
          const placeholders = docIds.map(() => '?').join(',');
          const dbDocs = await env.SURVEY_DB.prepare(`SELECT id, media_urls, url, type FROM archive_documents WHERE id IN (${placeholders})`).bind(...docIds).all();
          if (dbDocs && dbDocs.results) {
            dbDocs.results.forEach(row => {
              let image = null;
              if (row.media_urls) {
                try {
                  const arr = JSON.parse(row.media_urls);
                  if (arr.length > 0) image = arr[0];
                } catch(e) {}
              }
              if (!image && row.type === 'image' && row.url) {
                image = row.url;
              }
              let systemNotes = [];
              if (image) systemNotes.push(`has an associated image. URL: ${image}`);
              if (row.type) systemNotes.push(`Type: ${row.type}`);
              if (systemNotes.length > 0) {
                contextText += `\n[System Note: Document ID ${row.id} ${systemNotes.join(' | ')}]\n`;
              }
            });
          }
        } catch(e) {
          console.warn("Failed to fetch media urls", e);
        }
      }

      // Query media_assets for attached documents and visual search queries
      // Query media_assets for attached documents, visual search queries, and curated figures
      const matchedFigures = [];
      const seenUrls = new Set();
      const lowerQuery = query.toLowerCase();

      // 1. Check curated figures against query keywords or docIds
      CURATED_MEDIA_ASSETS.forEach(item => {
        const matchesDoc = docIds.includes(item.doc_id);
        const matchesKeyword = item.keywords.some(k => lowerQuery.includes(k));
        if (matchesDoc || matchesKeyword) {
          if (!seenUrls.has(item.image_url)) {
            seenUrls.add(item.image_url);
            matchedFigures.push(item);
          }
        }
      });

      // 2. Query SURVEY_DB for additional database media_assets
      if (env.SURVEY_DB) {
        try {
          const visualKeywords = ['diagram', 'image', 'picture', 'photo', 'figure', 'slide', 'histology', 'chart', 'microscopy', 'corpuscle', 'nerve', 'anatomy', 'clamp', 'tool', 'gomco', 'mogen', 'plastibell', 'device', 'schematic', 'patent', 'illustration', 'micrograph', 'instrument'];
          const isVisualQuery = visualKeywords.some(k => lowerQuery.includes(k));
          
          let mediaQuery = "";
          let mediaParams = [];

          if (docIds.length > 0) {
            const placeholders = docIds.map(() => '?').join(',');
            mediaQuery = `SELECT * FROM media_assets WHERE doc_id IN (${placeholders})`;
            mediaParams = [...docIds];
          }

          if (isVisualQuery) {
            const words = lowerQuery.split(/[\s,?.!]+/).filter(w => w.length > 3 && !visualKeywords.includes(w));
            if (words.length > 0) {
              const likeClauses = words.map(() => `(caption LIKE ? OR keywords LIKE ?)`).join(' OR ');
              const likeParams = words.flatMap(w => [`%${w}%`, `%${w}%`]);
              if (mediaQuery) {
                mediaQuery += ` UNION SELECT * FROM media_assets WHERE ${likeClauses}`;
                mediaParams.push(...likeParams);
              } else {
                mediaQuery = `SELECT * FROM media_assets WHERE ${likeClauses}`;
                mediaParams = likeParams;
              }
            }
          }

          if (mediaQuery) {
            const mediaResults = await env.SURVEY_DB.prepare(mediaQuery + " LIMIT 8").bind(...mediaParams).all();
            if (mediaResults && mediaResults.results && mediaResults.results.length > 0) {
              mediaResults.results.forEach(m => {
                if (!seenUrls.has(m.image_url)) {
                  seenUrls.add(m.image_url);
                  matchedFigures.push(m);
                }
              });
            }
          }
        } catch (e) {
          console.warn("Failed to fetch media_assets:", e);
        }
      }

      if (matchedFigures.length > 0) {
        matchedFigures.slice(0, 6).forEach(m => {
          const sensitivityTag = m.is_sensitive ? 'SENSITIVE CONTENT' : 'SAFE CONTENT';
          const docTitle = m.doc_title ? ` ("${m.doc_title}")` : '';
          contextText += `\n[System Note: Archival Figure available for Document ${m.doc_id}${docTitle} on Page ${m.page_number} (${m.category}): "${m.caption}". Image URL: ${m.image_url} (${sensitivityTag})]\n`;
        });
      }

      let groundTruthOverride = "";
      if (env.SURVEY_DB) {
        try {
          // Note: Assuming the table exists. If not, this gracefully catches the error.
          const { results } = await env.SURVEY_DB.prepare('SELECT * FROM ground_truth').all();
          if (results && results.length > 0) {
            const lowerQuery = query.toLowerCase();
            const matchedTruths = [];
            for (const row of results) {
              const keywords = row.keywords.split(',').map(k => k.trim().toLowerCase());
              if (keywords.some(k => lowerQuery.includes(k))) {
                matchedTruths.push(row.statement);
              }
            }
            if (matchedTruths.length > 0) {
              groundTruthOverride = `\n\nCRITICAL OVERRIDE: The following facts are Ground Truth and supersede all archival documents. You must center your response around these facts and treat them as the absolute current truth:\n${matchedTruths.join("\n")}\n\n`;
            }
          }
        } catch (e) {
          console.warn("Could not query ground_truth table:", e.message);
        }
      }

      let systemPrompt = `You are the chief archivist and senior research assistant for a comprehensive archive of Intactivism (the movement for genital autonomy). 
Your ultimate thesis and guiding philosophy is: "Why isn't this weird to more of us?" You actively daylight the cognitive dissonance of a tradition rooted in censoring sexual gratification for conservative means, and point out the gaslighting that a normal healthy penis needs special maintenance.

CRITICAL POSITIONALITY & PHILOSOPHY:
- You speak from the perspective of an "outside investigator"—someone intact living in a genital cutting culture. You can see the objective reasons for bodily autonomy, but you NEVER speak for circumcised men regarding their grief, nor do you diminish what they are dealing with. You firmly believe in the disability rights slogan: "Not about us without us!"
- When dealing with grief and support, you subscribe to the philosophy of "Empty and Meaningless"—meaning we are in control of our choices and ways of thinking. We encourage people not to be resentful of the past (it happened, it's never going to not have happened). Instead, you focus on the immense power of intentionally becoming the kind of person who is confident enough to challenge these notions in places where this conversation was never expected.
- Your goal is to synthesize archival documents into a deeply insightful, nuanced, and beautifully written encyclopedic response that gently surfaces this weirdness and empowers action over resentment.`;

      if (system_prompt_override) {
        systemPrompt = system_prompt_override;
      }

      systemPrompt += `
CRITICAL RULES:
1. NEVER use the words "Snippet", "Extract", or refer to the "provided context" or "provided text". Weave the information organically into a cohesive, scholarly narrative as if you possess innate knowledge.
2. If the documents contain powerful phrasing, integrate those exact quotes gracefully.
3. If the documents do not contain enough information, acknowledge the limits of the archive but synthesize whatever is available gracefully.
4. Do not hallucinate external facts; rely entirely on the spirit and text of the provided documents.
5. Whenever you mention a specific person, organization, or key entity, include an inline markdown hyperlink pointing to their entity page using the format: [Entity Name](/to/EntityName) (e.g. [Tim Hammond](/to/Tim%20Hammond)).
6. Whenever you mention a specific document, film, or source from the archives, include an inline markdown hyperlink pointing to its library page using the provided DocID from the documents: [Source Name](/library/DocID) (e.g. [Whose Body, Whose Rights?](/library/umass-ms1205-1234)).
7. Frame your responses in the context of Intactivism as a broad human rights movement, rather than in relation to any specific project.
8. If an Archival Figure or image is provided in a System Note, embed it inline when discussing that document or when the user asks for visual evidence using Markdown image syntax with embedded attribution metadata: ![safe:<Caption> | Source: <Document Title or Archive> | Doc: <DocID> | Page: <PageNumber> | License: Archival Record](<ImageURL>). If the note specifies SAFE CONTENT, prefix the alt text with "safe:" so it renders directly inline. If the note specifies SENSITIVE CONTENT, omit the "safe:" prefix so clinical or anatomical depictions remain protected behind the 18+ click-to-reveal barrier. Immediately below any embedded figure, also provide the professional attribution link: [View Source in Library (Page X)](/library/DocID?page=X).
9. If a document is sourced from "Field Note (Accidental Intactivist)", you must NOT quote it directly, summarize its specifics, or reveal its raw unfiltered contents, as it may contain sensitive or shocking observations. Instead, ONLY use its themes, subtext, and overarching arguments to inform your own perspective, while strictly maintaining your academic, scholarly, and professional voice.
10. If a document has the type \`cultural_reference\`, it represents a colloquial, casual, or metaphorical use of the procedure in mainstream media. When synthesizing these, treat them as sociological evidence of how deeply normalized and trivialized the harm is in modern culture, highlighting the cognitive dissonance.${groundTruthOverride}

ARCHIVAL DOCUMENTS:
${contextText || "No relevant documents found in the archive for this query."}`;

      const response = await aiBinding.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { 
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: query }],
        max_tokens: 1024
      });
      finalAnswer = response.response;
    }

    return new Response(JSON.stringify({
      response: finalAnswer,
      citations: citations,
      intent_parsed: intent.includes("ANALYTICAL") ? "ANALYTICAL" : "QUALITATIVE"
    }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
