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
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', 'Retry-After': Math.ceil((RATE_LIMIT_MS - (now - lastRequest))/1000).toString() } 
        });
      }
      rateLimitMap.set(ip, now);
      
      if (rateLimitMap.size > 1000) {
        for (const [key, timestamp] of rateLimitMap.entries()) {
          if (now - timestamp > RATE_LIMIT_MS) rateLimitMap.delete(key);
        }
      }
    }

    const { text } = await request.json();
    if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });

    const aiBinding = env.AI || env.Workers_AI;
    if (!aiBinding) throw new Error("AI binding is missing");

    const prompt = `You are a research assistant. A user has highlighted the following text from an archive about circumcision and genital autonomy:
"${text}"

Generate exactly 3 short, thought-provoking questions the user might want to ask an AI about this text to deepen their understanding. 
Format your response as a raw JSON array of 3 strings. Do not include markdown formatting or backticks. Example:
["What is the historical context of this?", "Who is the author?", "Why was this policy changed?"]
`;

    const response = await aiBinding.run('@cf/meta/llama-3.1-8b-instruct-fp8', { 
      messages: [{ role: "system", content: "You output raw JSON arrays of strings." }, { role: "user", content: prompt }]
    });
    
    let rawText = response.response.trim();
    if (rawText.startsWith('```json')) rawText = rawText.replace(/```json/g, '').replace(/```/g, '');
    if (rawText.startsWith('```')) rawText = rawText.replace(/```/g, '');
    
    let questions = [];
    try {
      questions = JSON.parse(rawText.trim());
    } catch (e) {
      // Fallback parser if LLM failed
      questions = ["Analyze this text further.", "What is the context of this snippet?", "Summarize this highlighted text."];
    }

    return new Response(JSON.stringify({ questions }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error("Suggestion Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
