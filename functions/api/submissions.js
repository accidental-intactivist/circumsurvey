export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { type, name, email, subject, message } = data;
    
    if (!type || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    if (!env.SURVEY_DB) {
      throw new Error("Database binding SURVEY_DB is missing");
    }

    // Generate a unique ID
    const id = crypto.randomUUID();

    // Insert into D1
    const stmt = env.SURVEY_DB.prepare(
      "INSERT INTO user_submissions (id, type, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    ).bind(
      id,
      type,
      name || 'Anonymous',
      email,
      subject || 'No Subject',
      message
    );
    
    await stmt.run();

    // In a real production scenario with Resend/Sendgrid, you would send an email here:
    // e.g. await fetch('https://api.resend.com/emails', { ... })
    // For now, we simulate the email routing as requested by the user:
    console.log(`[EMAIL ROUTING MOCK] Email sent to info@circumsurvey.online from ${email}`);
    console.log(`[EMAIL ROUTING MOCK] Subject: ${type} - ${subject}`);

    return new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error("Submission Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
