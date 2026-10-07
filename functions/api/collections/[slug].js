/**
 * GET /api/collections/[slug]
 * Returns metadata for a specific collection, and its documents.
 */
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const slug = params.slug;
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 10000;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  
  // Define our curated collections metadata
  const collectionsData = {
    'published-articles': {
      title: "Curated Published Articles",
      subtitle: "Medical, Legal, and Academic Journals",
      institution: "Intactivist Guide Archive",
      curator: "Tim Hammond",
      description: "A comprehensive collection of published articles spanning several decades, meticulously compiled by Tim Hammond. This collection contains critical medical literature, legal policy analyses, and academic journals regarding genital autonomy.",
      queryFilter: "type = 'academic_journal'",
      bindArgs: []
    },
    'umass-ms-1205': {
      title: "The Tim Hammond Genital Autonomy Advocacy Archive",
      subtitle: "MS 1205",
      institution: "UMass Amherst Special Collections",
      curator: "Tim Hammond",
      description: "The defining archive of the genital autonomy movement. This collection includes extensive hard copy and electronic records representing decades of advocacy, establishing the foundation of NOCIRC, NOHARMM, and modern human rights advocacy.",
      queryFilter: "source_collection = 'UMass MS 1205'",
      bindArgs: []
    },
    'msu-clippings': {
      title: "Changing Men Collection",
      subtitle: "Historic News Clippings",
      institution: "Michigan State University",
      curator: "Samer Daffarini (compiler)",
      description: "An extensive archive of early movement documentation and news clipping files. This material was heavily accessed and compiled by activists over the years, capturing the public and media sentiment during the formative years of the movement.",
      queryFilter: "source_collection = 'MSU Clippings'",
      bindArgs: []
    }
  };

  try {
    const collection = collectionsData[slug];
    if (!collection) {
      return new Response(JSON.stringify({ error: "Collection not found" }), { status: 404 });
    }

    let results = [];
    let total = 0;

    if (env.SURVEY_DB) {
      const docsQuery = await env.SURVEY_DB.prepare(
        `SELECT * FROM archive_documents WHERE ${collection.queryFilter} ORDER BY title ASC LIMIT ? OFFSET ?`
      ).bind(...collection.bindArgs, limit, offset).all();
      results = docsQuery.results || [];

      const countResult = await env.SURVEY_DB.prepare(
        `SELECT count(*) as total FROM archive_documents WHERE ${collection.queryFilter}`
      ).bind(...collection.bindArgs).first();
      total = countResult ? countResult.total : 0;
    }

    return new Response(JSON.stringify({
      collection,
      documents: results,
      total: total
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
