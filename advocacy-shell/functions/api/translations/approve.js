export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { document_id, target_language } = await request.json();

    if (!document_id || !target_language) {
      return new Response(JSON.stringify({ error: "Missing document_id or target_language" }), { status: 400 });
    }

    // 1. Fetch document metadata
    const doc = await env.SURVEY_DB.prepare(
      `SELECT metadata_json FROM archive_documents WHERE id = ?`
    ).bind(document_id).first();

    if (!doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }

    const metadata = JSON.parse(doc.metadata_json || '{}');
    let markdownText = "";

    // Prefer directly embedded text if it exists (from some pipelines)
    if (metadata.text_content) {
      markdownText = metadata.text_content;
    } else if (metadata.extracted_text_url) {
      // Fetch from R2 or hosted URL
      try {
        const textRes = await fetch(metadata.extracted_text_url);
        if (textRes.ok) {
          markdownText = await textRes.text();
        }
      } catch (e) {
        console.error("Failed to fetch text from URL", e);
      }
    }

    if (!markdownText || markdownText.trim() === "") {
      return new Response(JSON.stringify({ error: "Could not retrieve source text for translation" }), { status: 400 });
    }

    // 2. Translate using Gemini 3.8 Flash
    const prompt = `You are a professional archivist and translator. Translate the following document into ${target_language}.
CRITICAL INSTRUCTIONS: 
1. You MUST perfectly preserve ALL Markdown formatting (headers, lists, bold, italics, tables, etc.).
2. The output MUST be valid Markdown. 
3. Do not include any conversational filler (e.g., "Here is the translation:"). Output ONLY the translated Markdown text.

Source Text:
${markdownText}`;

    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(JSON.stringify({ error: "Gemini API failed", details: errText }), { status: 500 });
    }

    const aiData = await aiRes.json();
    const translatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translatedText) {
      return new Response(JSON.stringify({ error: "Failed to parse translation from AI" }), { status: 500 });
    }

    // 3. Save translation
    const transId = crypto.randomUUID();
    await env.SURVEY_DB.batch([
      env.SURVEY_DB.prepare(
        `INSERT INTO document_translations (id, document_id, language, translated_text) VALUES (?, ?, ?, ?)`
      ).bind(transId, document_id, target_language, translatedText),
      
      env.SURVEY_DB.prepare(
        `UPDATE translation_requests SET status = 'completed' WHERE document_id = ? AND target_language = ?`
      ).bind(document_id, target_language)
    ]);

    // Note: Here is where we would trigger the Resend/SendGrid email API 
    // to notify users who requested this document + language.

    return new Response(JSON.stringify({ success: true, id: transId }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
