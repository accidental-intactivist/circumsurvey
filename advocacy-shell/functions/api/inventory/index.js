export async function onRequestGet(context) {
  const { env } = context;
  
  if (!env.SURVEY_DB) {
    return new Response(JSON.stringify({ error: "Database binding not found" }), { status: 500 });
  }

  try {
    // Fetch all physical inventory items, ordered by series, box, folder
    const result = await env.SURVEY_DB.prepare(`
      SELECT * FROM physical_inventory 
      ORDER BY series_title, CAST(box_number AS INTEGER), CAST(folder_number AS INTEGER)
    `).all();

    return new Response(JSON.stringify(result.results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
