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
      id: 'published-articles',
      slug: 'published-articles',
      canonicalSlug: 'published-articles',
      title: "Curated Published Articles & Legal Filings",
      subtitle: "Medical Journals, Clinical Cohorts & Constitutional Briefs (1975–2026)",
      institution: "Peer-Reviewed Literature & Legal Records",
      curator: "Tim Hammond, Tone Pettit & Research Contributors",
      featured: true,
      itemCount: "105+ peer-reviewed papers & filings",
      description: "The premier digital collection of seminal peer-reviewed medical papers, histological micro-anatomy discoveries (Taylor 1996, Sorrells 2007, Cepeda 2025), neonatal pain science (Anand 1987), large-scale epidemiological studies (Fendereski 2024), European pediatric whistleblower rebuttals (Frisch 2013), and landmark federal equal protection litigation (Huff v. Colorado)."
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
    }
  ];

  return new Response(JSON.stringify(collections), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
