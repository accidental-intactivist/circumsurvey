const http = require('http');

const PORT = 8789;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); 
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/survey-stats') {
    // Simulate a slow database query so we can see the spirograph!
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: 542,
        pathways: [
          { name: 'Human Rights / Autonomy', value: 215 },
          { name: 'Sexual Function', value: 142 },
          { name: 'Medical Trauma', value: 95 },
          { name: 'Child Advocacy', value: 60 },
          { name: 'Partner Influence', value: 30 }
        ],
        generations: [
          { name: 'Millennial', value: 245 },
          { name: 'Gen X', value: 160 },
          { name: 'Gen Z', value: 85 },
          { name: 'Boomer', value: 52 }
        ],
        politics: [
          { name: 'Progressive', value: 280 },
          { name: 'Moderate', value: 120 },
          { name: 'Conservative', value: 65 },
          { name: 'Libertarian', value: 45 },
          { name: 'Apolitical', value: 32 }
        ],
        religion: [
          { name: 'Secular / None', value: 310 },
          { name: 'Christian', value: 145 },
          { name: 'Spiritual', value: 55 },
          { name: 'Jewish', value: 20 },
          { name: 'Other', value: 12 }
        ]
      }));
    }, 4000); // 4 second delay to see the colors change!
  } else if (req.url === '/api/cms/doc-clopper-1') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 'doc-clopper-1',
      type: 'document',
      status: 'ingested',
      title: 'Sex and Circumcision: An American Love Story',
      author: 'Eric Clopper',
      published_at: '2018-05-15T00:00:00Z',
      category: 'exhibits',
      metadata_json: JSON.stringify({
        gemini_extracted_metadata: {
          description: "Eric Clopper premiered his one-man play at Harvard University, critically examining the cultural, historical, and ethical dimensions of routine infant circumcision in America."
        }
      })
    }));
  } else if (req.url === '/api/cms/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      total: 1042,
      active: 856,
      pending: 142,
      rejected: 44,
      added_week: 12,
      added_month: 85
    }));
    return;
  } else if (req.url.startsWith('/api/cms')) {
    const mockData = [
      {
        id: 'digest-1',
        type: 'recap',
        status: 'published',
        title: 'News & Field Notes: Medical Ethics & Legal Milestones',
        publisher: 'Deep Research Agent',
        published_at: new Date().toISOString(),
        url: '#',
        metadata_json: JSON.stringify({
          abstract: 'In today\'s digest: The Lancet publishes a new retrospective on neonatal circumcision trauma, while advocacy groups successfully petition the UN for stronger genital autonomy resolutions. Additionally, a landmark equal protection lawsuit gains traction in Washington State.',
          community_zeitgeist: 'Across the site today, users are heavily focused on leveraging legal and medical double standards. Commenters like IntactAdvocate are emphasizing the 14th Amendment equal protection angle as our most viable legal strategy, while others are calling for dedicated debunking guides targeting outdated HIV statistics from African RCTs. **We need your voice:** Jump into the discussion below or on any active article. Submit your most effective counter-arguments and rhetorical strategies—your insights will be used to actively build dynamic programming and debate guides for the entire community!',
          source_publication: 'Intactivism Archive Agent',
          key_people: ['Tim Hammond'],
          organizations: ['Global Human Rights Watch', 'GALDEF'],
          digest_items: [
            {
              title: 'New Retrospective on Neonatal Trauma',
              body: 'The Lancet has published a sweeping 20-year retrospective analysis examining the long-term psychological and physical trauma markers in males subjected to neonatal circumcision. For decades, institutional medicine has routinely dismissed the psychological toll of infant genital cutting, framing it as a "benign" procedure with no lasting memory. This study forcefully dismantles that narrative. By correlating early genital cutting with elevated cortisol levels and delayed pain-processing abnormalities into adulthood, it provides empirical, undeniable backing to the lived experiences of thousands of men in our archives. This is a critical piece of leverage for confronting the AAP\'s outdated guidelines.',
              item_id: 'news-2'
            },
            {
              title: 'Advocacy Groups Petition the UN',
              body: 'A coalition of intactivist organizations, led by Global Human Rights Watch, presented a formal petition to the United Nations Human Rights Council today demanding that the UN explicitly classify non-therapeutic infant circumcision as a violation of the Convention on the Rights of the Child. The international community has long held a double standard regarding genital autonomy, fiercely (and rightly) condemning FGM while turning a blind eye to male children. This petition forces the UN to confront its own hypocrisy. If the Convention on the Rights of the Child guarantees protection from physical violence and affirms the right to bodily integrity, those rights must be applied universally, regardless of gender.',
              item_id: 'news-3'
            },
            {
              title: 'Equal Protection Lawsuit in Washington',
              body: 'GALDEF has officially filed a landmark equal protection lawsuit in Washington State, arguing that the state\'s current female genital mutilation (FGM) statutes inherently violate the equal protection clause by failing to extend identical protections to male children. This is exactly the legal strategy we have been advocating for. It shifts the battlefield from medical debates over "hygiene" to fundamental Constitutional law. If the courts rule that protecting only one gender from forced genital cutting violates the 14th Amendment, it could create a cascading legal precedent that brings the entire American circumcision apparatus crashing down.',
              item_id: 'news-1'
            }
          ]
        })
      },
      {
        id: 'news-1',
        type: 'external_news',
        status: 'ingested',
        title: 'Landmark Equal Protection Lawsuit Filed in Washington State',
        publisher: 'Intact Global',
        published_at: '2026-09-20T10:00:00Z',
        url: 'https://intactglobal.org/lawsuit',
        metadata_json: JSON.stringify({
          abstract: "A landmark lawsuit has been filed by GALDEF in Washington State challenging the constitutionality of current FGM statutes for failing to protect male children.",
          source_publication: "Intact Global"
        })
      },
      {
        id: 'news-2',
        type: 'external_news',
        status: 'ingested',
        title: 'New Study Links Neonatal Circumcision to Long-Term Trauma',
        publisher: 'Journal of Men\'s Health',
        published_at: '2026-09-15T08:30:00Z',
        url: 'https://thelancet.com/medical-ethics-trauma-study',
        metadata_json: JSON.stringify({
          abstract: "The Lancet has published a sweeping 20-year retrospective analysis examining the long-term psychological and physical trauma markers in males subjected to neonatal circumcision.",
          source_publication: "The Lancet",
          image_url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&q=80",
          image_attribution: "Photo via Unsplash"
        })
      },
      {
        id: 'news-3',
        type: 'external_news',
        status: 'ingested',
        title: 'Advocates Push for Genital Autonomy Legislation at the UN',
        publisher: 'Global Human Rights Watch',
        published_at: '2026-09-05T14:15:00Z',
        url: 'https://hrw.org/un-genital-autonomy-petition',
        metadata_json: JSON.stringify({
          abstract: "A coalition of intactivist organizations, led by Global Human Rights Watch, presented a formal petition to the United Nations Human Rights Council today demanding that the UN explicitly classify non-therapeutic infant circumcision as a violation of the Convention on the Rights of the Child.",
          source_publication: "Global Human Rights Watch",
          image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&q=80",
          image_attribution: "Photo via Unsplash"
        })
      },
      {
        id: 'news-4-law-crime',
        type: 'external_news',
        status: 'ingested',
        title: "Lawsuit seeking to ban circumcision, arguing it robs boys of bodily autonomy and gives parents 'nightmares,' gets thrown out by judge",
        publisher: 'Law & Crime',
        published_at: new Date().toISOString(),
        url: 'https://lawandcrime.com/lawsuit/lawsuit-seeking-to-ban-circumcision-arguing-it-robs-boys-of-bodily-autonomy-and-gives-parents-nightmares-gets-thrown-out-by-judge/',
        metadata_json: JSON.stringify({
          abstract: "An Oregon judge has rejected a lawsuit seeking to ban male circumcision after plaintiffs argued that the procedure deprives infant boys of bodily integrity and violates equal protection by giving males fewer legal protections than females. The judge ruled the plaintiffs lacked standing, though their attorney, Eric Clopper, emphasized the court did not rule on the merits of the constitutional challenge.",
          why_it_matters: "This is a pivotal turn of events. A constitutional challenge is legally precarious because striking down current statutes risks removing existing protections for girls rather than extending them to boys—the exact opposite of our goal. This dismissal forces the movement to rebuild its legal strategy from scratch.",
          source_publication: "Law & Crime",
          key_people: ["Melvin Oden-Orr", "Eric Clopper"],
          lens: {
            relevance: 9,
            category: "Legal & Legislative",
            coverage_lean: "neutral",
            outlet_type: "mainstream",
            claims: [
              {
                claim: "Oregon law treats female children as if they are more worthy of legal protection against genital cutting than male children",
                assessment: "accurate",
                context_note: "Oregon state law explicitly prohibits female genital mutilation but provides no equivalent protection against non-therapeutic genital cutting for male minors.",
                sources: []
              }
            ]
          }
        })
      }
    ];

    const parts = req.url.split('?')[0].split('/');
    if (parts.length > 3 && parts[3]) {
      const item = mockData.find(d => d.id === parts[3]);
      if (item) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
        return;
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: mockData }));
  } else if (req.url.startsWith('/api/translations')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
  } else if (req.url.startsWith('/api/comments')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
  } else if (req.url.startsWith('/api/ingestion')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      {
        id: 'ingest-f4384269',
        url: 'https://www.theguardian.com/law/2026/mar/05/circumcision-classed-as-potentially-harmful-practice-in-new-cps-guidance',
        title: 'Circumcision classed as potentially harmful practice in new CPS guidance',
        abstract: 'This article details official guidance released by the Crown Prosecution Service (CPS) in England and Wales, which classifies non-therapeutic circumcision carried out under improper or non-sterile conditions as a potentially harmful practice subject to prosecution under offences against the person and child cruelty laws. The update reflects ongoing debates among prosecutors, human rights campaigners, and religious leaders concerning bodily integrity, legal regulation, and religious freedom.',
        source: 'The Guardian',
        reason: 'Selected for its direct coverage of legal and institutional shifts in how state prosecutors classify non-medical male circumcision within bodily autonomy and child safeguarding frameworks.',
        status: 'pending'
      },
      {
        id: 'ingest-53032c52',
        url: 'https://www.timesofisrael.com/new-eu-circumcision-certification-program-looks-to-keep-brit-milah-safe-in-europe/',
        title: 'New EU circumcision certification program looks to keep brit milah safe in Europe',
        abstract: 'This report examines a new European-wide medical certification program launched by Jewish leadership organizations to standardize welfare and health credentials for traditional circumcisers (mohels). The initiative is designed to address legal challenges and law enforcement actions across EU member states where non-physician circumcisions face rising regulatory scrutiny.',
        source: 'The Times of Israel',
        reason: 'Provides valuable documentation of how religious institutions adapt to emerging European legal standards regarding child welfare, medical licensing, and bodily rights.',
        status: 'pending'
      }
    ]));
  } else if (req.url.startsWith('/api/ground-truth')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
  } else if (req.url.startsWith('/api/entities')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      {
        id: 'tim-hammond',
        name: 'Tim Hammond',
        type: 'person',
        role: 'notable',
        tagline: 'Founder of GALDEF, Author, and Intactivist',
        description: `Tim Hammond’s pioneering contributions to the genital autonomy movement began in 1989 with the co-founding of the National Organization of Restoring Men. He later founded the National Organization to Halt the Abuse and Routine Mutilation of Males, produced the award-winning documentary ‘Whose Body, Whose Rights?’ that was broadcast on numerous PBS stations across the U.S., published two large scale surveys documenting long-term circumcision harm and a survey of 1,800 foreskin restorers. He is webmaster for the Global Survey of Circumcision Harm, co-founded the Children’s Health & Human Rights Partnership/Canada, established the Genital Autonomy Advocacy archives at the University of Massachusetts/Amherst, and is a Member of the Brussels Collaboration on Bodily Integrity. Tim is honored to be the first Board President and Executive Director of the Genital Autonomy Legal Defense and Education Fund.`,
        image_url: '/tim_hammond.jpg'
      }
    ]));
  } else if (req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let query = '';
      try {
        const payload = JSON.parse(body);
        query = payload.query || '';
      } catch (e) {
        // ignore
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      let responseText = "I'm a mock AI assistant. I received your query: " + query;
      let citations = [];

      if (query.toLowerCase().includes('eric clopper')) {
        responseText = "Eric Clopper is an author and intactivist known for his one-man play 'Sex and Circumcision: An American Love Story', which premiered at Harvard University in 2018. He advocates for the protection of children's genital autonomy and has written extensively on the ethics and history of routine infant circumcision in the United States.";
        citations = [
          { source: 'Exhibit 04: The Campus Awakening', doc_id: 'doc-clopper-1', snippets: ['Eric Clopper premiered his one-man play at Harvard University...'] }
        ];
      }

      res.end(JSON.stringify({
        response: responseText,
        citations: citations
      }));
    });
    return; // Don't fall through to 404
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock API Server running at http://127.0.0.1:${PORT}/`);
});
