/**
 * GET /api/collections
 * Returns a list of curated collections for CollectionsIndex.jsx
 */
export async function onRequestGet(context) {
  const collections = [
    {
      id: 'umass-ms-1205',
      slug: 'tim-hammond-archive',
      canonicalSlug: 'umass-ms-1205',
      title: "The Tim Hammond Genital Autonomy Advocacy Archive",
      subtitle: "MS 1205 (1971–2023)",
      institution: "UMass Amherst Special Collections",
      curator: "Tim Hammond & SCUA",
      featured: true,
      itemCount: "195,000+ records",
      description: "The defining historical collection of the movement. Spanning 53 linear feet and over 195,000 cataloged records, including NOHARMM founding papers, Marilyn Milos / NOCIRC correspondence, and the landmark 1999 AWAKENINGS empirical survey."
    },
    {
      id: 'msu-clippings',
      slug: 'msu-clippings',
      title: "Changing Men Collection",
      subtitle: "Historic News Clippings & Periodicals",
      institution: "Michigan State University",
      curator: "Samer Daffarini (compiler)",
      featured: false,
      itemCount: "Thousands of press clippings",
      description: "An extensive archive of early movement documentation, mainstream news coverage, and talk show clippings capturing public and media sentiment during the formative years of anti-circumcision activism."
    },
    {
      id: 'published-articles',
      slug: 'published-articles',
      title: "Curated Published Articles",
      subtitle: "Medical, Legal, and Academic Journals",
      institution: "Intactivist Guide Archive",
      curator: "Tim Hammond",
      featured: false,
      itemCount: "Seminal Peer-Reviewed Papers",
      description: "A comprehensive collection of published articles spanning several decades, meticulously compiled by Tim Hammond. Contains critical medical literature, sensory histology studies, and constitutional policy analyses."
    }
  ];

  return new Response(JSON.stringify(collections), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
