export async function onRequestGet(context) {
  const { env } = context;
  try {
    const totalQuery = await env.SURVEY_DB.prepare("SELECT count(*) as count FROM respondents").first();
    const totalResponses = totalQuery ? totalQuery.count : 0;

    const pathwaysQuery = await env.SURVEY_DB.prepare(
      "SELECT IFNULL(pathway, 'unspecified') as name, count(*) as value FROM respondents GROUP BY pathway ORDER BY value DESC"
    ).all();

    const generationsQuery = await env.SURVEY_DB.prepare(
      "SELECT generation as name, count(*) as value FROM demographics WHERE generation IS NOT NULL AND generation != '' GROUP BY generation ORDER BY value DESC"
    ).all();

    const politicsQuery = await env.SURVEY_DB.prepare(
      "SELECT politics as name, count(*) as value FROM demographics WHERE politics IS NOT NULL AND politics != '' GROUP BY politics ORDER BY value DESC"
    ).all();

    const religionQuery = await env.SURVEY_DB.prepare(
      "SELECT primary_tradition as name, count(*) as value FROM religion WHERE primary_tradition IS NOT NULL AND primary_tradition != '' GROUP BY primary_tradition ORDER BY value DESC"
    ).all();

    return new Response(JSON.stringify({
      total: totalResponses,
      pathways: pathwaysQuery.results || [],
      generations: generationsQuery.results || [],
      politics: politicsQuery.results || [],
      religion: religionQuery.results || []
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
