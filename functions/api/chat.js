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

    const { query } = await request.json();
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
      if (!env.ARCHIVE_INDEX) throw new Error("ARCHIVE_INDEX binding is missing");

      const queryEmbedding = await aiBinding.run('@cf/baai/bge-small-en-v1.5', { text: [query] });
      const vector = queryEmbedding.data[0];

      const matches = await env.ARCHIVE_INDEX.query(vector, { topK: 3, returnMetadata: true });
      let contextText = "";
      let citationMap = new Map();

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
              if (image) {
                contextText += `\n[System Note: Document ID ${row.id} has an associated image. URL: ${image}]\n`;
              }
            });
          }
        } catch(e) {
          console.warn("Failed to fetch media urls", e);
        }
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

      const systemPrompt = `You are Glenda, the chief archivist and senior research assistant for a comprehensive archive of Intactivism (the movement for genital autonomy). 
Your goal is to synthesize the provided archival documents into a deeply insightful, nuanced, and beautifully written encyclopedic response.
CRITICAL RULES:
1. NEVER use the words "Snippet", "Extract", or refer to the "provided context" or "provided text". Weave the information organically into a cohesive, scholarly narrative as if you possess innate knowledge.
2. If the documents contain powerful phrasing, integrate those exact quotes gracefully.
3. If the documents do not contain enough information, acknowledge the limits of the archive but synthesize whatever is available gracefully.
4. Do not hallucinate external facts; rely entirely on the spirit and text of the provided documents.
5. Whenever you mention a specific person, organization, or key entity, include an inline markdown hyperlink pointing to their entity page using the format: [Entity Name](/to/EntityName) (e.g. [Tim Hammond](/to/Tim%20Hammond)).
6. Whenever you mention a specific document, film, or source from the archives, include an inline markdown hyperlink pointing to its library page using the provided DocID from the documents: [Source Name](/library/DocID) (e.g. [Whose Body, Whose Rights?](/library/umass-ms1205-1234)).
7. Frame your responses in the context of Intactivism as a broad human rights movement, rather than in relation to any specific project.
8. If a Document ID has an associated image URL provided in a System Note, you MUST embed it inline when discussing that document using Markdown image syntax: ![Alt Text describing the image](URL).
9. If a document is sourced from "Field Note (Accidental Intactivist)", you must NOT quote it directly, summarize its specifics, or reveal its raw unfiltered contents, as it may contain sensitive or shocking observations. Instead, ONLY use its themes, subtext, and overarching arguments to inform your own perspective, while strictly maintaining your academic, scholarly, and professional voice.${groundTruthOverride}

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
