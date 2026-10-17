import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  let fullText = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(it => it.str).join(' ') + '\n\n';
  }
  return fullText;
}

async function run() {
  console.log('Starting catalog updates...');

  // 1. Copy umass-ms1205-raw-4f594152.pdf
  fs.copyFileSync('public/documents/1994-awakenings-full-report.pdf', 'public/documents/umass-ms1205-raw-4f594152.pdf');
  console.log('Copied umass-ms1205-raw-4f594152.pdf');

  // 2. Extract texts
  const bjuText = await extractText('public/documents/1999-hammond-preliminary-poll-bju.pdf');
  const earpText = await extractText('public/documents/earp-sardi-false-beliefs-2018.pdf');
  const synText = await extractText('public/documents/1994-awakenings-synopsis-sheet.pdf');
  console.log(`Extracted text lengths: BJU=${bjuText.length}, Earp=${earpText.length}, Syn=${synText.length}`);

  // 3. Update public/api_mock.json
  const apiMock = JSON.parse(fs.readFileSync('public/api_mock.json', 'utf8'));

  // Update umass-ms1205-raw-4f594152 (Full 1994 Awakenings Report)
  const doc4f = apiMock.find(d => d.id === 'umass-ms1205-raw-4f594152');
  if (doc4f) {
    doc4f.title = 'AWAKENINGS: A Preliminary Poll of Circumcised Men (Full 1994 Report)';
    doc4f.url = '/documents/1994-awakenings-full-report.pdf';
    doc4f.status = 'ingested';
    doc4f.source_collection = 'The Tim Hammond Genital Autonomy Archive';
    const m = doc4f.metadata_json ? JSON.parse(doc4f.metadata_json) : {};
    m.academic_title = 'AWAKENINGS: A Preliminary Poll of Circumcised Men: Revealing the Long-Term Harm and Healing the Wounds of Infant Circumcision (Full 1994 Report)';
    m.author = 'Tim Hammond';
    m.date = '1994';
    m.category = "Men's Health Research";
    m.abstract = "The landmark 177-page full research report of the 1993–1994 national survey conducted by Tim Hammond and NOHARMM among adult circumcised men. As the first extensive empirical investigation into the long-term physical, sexual, and psychological harms reported by circumcised men, Awakenings documents high rates of reduced penile sensation, prominent scarring, sexual dysfunction, and profound psychological grievances including feelings of violation and anger. Digitized from the only extant print copy in existence, preserved in the collection of Tone Pettit and provided directly by author Tim Hammond.";
    m.description = doc4f.title + ' — ' + m.abstract;
    m.physical_provenance = {
      note: "Digitized from the only extant print copy preserved in the private collection of Tone Pettit, gifted directly by author Tim Hammond."
    };
    doc4f.metadata_json = JSON.stringify(m);
    console.log('Updated umass-ms1205-raw-4f594152');
  }

  // Update promotional flyer ce8288f8
  const docCe = apiMock.find(d => d.id === 'ce8288f8decc204b17ff10af3b4abe91560f571e8995f1b17aa7825193f8d40c');
  if (docCe) {
    docCe.title = 'AWAKENINGS: Order Form & Promotional Announcement (1991 Flyer)';
    const m = docCe.metadata_json ? JSON.parse(docCe.metadata_json) : {};
    m.academic_title = 'AWAKENINGS: Order Form & Promotional Announcement (1991 Flyer)';
    docCe.metadata_json = JSON.stringify(m);
    console.log('Updated ce8288f8 flyer title');
  }

  // Update synopsis sheet umass-ms1205-raw-18a383b9
  const doc18 = apiMock.find(d => d.id === 'umass-ms1205-raw-18a383b9');
  if (doc18) {
    doc18.title = 'AWAKENINGS: Harm Documentation Synopsis Sheet (1994)';
    doc18.url = '/documents/1994-awakenings-synopsis-sheet.pdf';
    doc18.status = 'ingested';
    doc18.content = synText;
    const m = doc18.metadata_json ? JSON.parse(doc18.metadata_json) : {};
    m.academic_title = 'AWAKENINGS: Harm Documentation Synopsis Sheet (1994)';
    m.author = 'Tim Hammond';
    m.date = '1994';
    doc18.metadata_json = JSON.stringify(m);
    console.log('Updated umass-ms1205-raw-18a383b9 synopsis');
  }

  // Add Hammond 1999 BJUI if not exists
  let docBju = apiMock.find(d => d.id === 'hammond-bjui-1999-preliminary-poll');
  const bjuMeta = {
    academic_title: 'A Preliminary Poll of Men Circumcised in Infancy or Childhood',
    author: 'Tim Hammond',
    authors: ['Tim Hammond'],
    date: '1999',
    source_publication: 'BJU International (British Journal of Urology), 83 (Suppl. 1), 85–92',
    doi: '10.1046/j.1464-410x.1999.0830s1085.x',
    abstract: 'The landmark peer-reviewed presentation of the Awakenings survey data published in BJU International. Tim Hammond analyzes self-reported physical, sexual, and psychological outcomes from 313 men circumcised as infants or children, demonstrating significant long-term dissatisfaction, sensory deficits, prominent scarring, and psychological grievances such as feelings of bodily violation, betrayal, and anger.',
    description: 'Peer-reviewed study published in the British Journal of Urology International (1999) presenting the survey findings from the NOHARMM Awakenings study on men circumcised in infancy or childhood.',
    keywords: ['Circumcision', 'Foreskin', 'Psychological trauma', 'Sexual sensation', 'BJU International', 'Empirical survey', 'Tim Hammond', 'Genital autonomy'],
    category: 'Medical & Urological Literature',
    collection: 'The Tim Hammond Genital Autonomy Archive',
    provenance: 'Supplied directly by author Tim Hammond from his personal research archive.'
  };

  if (!docBju) {
    docBju = {
      id: 'hammond-bjui-1999-preliminary-poll',
      title: 'A Preliminary Poll of Men Circumcised in Infancy or Childhood',
      source_collection: 'The Tim Hammond Genital Autonomy Archive',
      url: '/documents/1999-hammond-preliminary-poll-bju.pdf',
      type: 'medical_journal',
      status: 'ingested',
      media_urls: null,
      content: bjuText,
      metadata_json: JSON.stringify(bjuMeta),
      created_at: '2026-10-16 16:00:00',
      collection_id: 'tim-hammond-archive',
      series: 'Awakenings Research'
    };
    apiMock.unshift(docBju);
    console.log('Added hammond-bjui-1999-preliminary-poll');
  } else {
    docBju.title = 'A Preliminary Poll of Men Circumcised in Infancy or Childhood';
    docBju.url = '/documents/1999-hammond-preliminary-poll-bju.pdf';
    docBju.status = 'ingested';
    docBju.content = bjuText;
    docBju.metadata_json = JSON.stringify(bjuMeta);
    console.log('Updated hammond-bjui-1999-preliminary-poll');
  }

  // Add Earp 2018 if not exists
  let docEarp = apiMock.find(d => d.id === 'earp-sardi-jellison-2018-false-beliefs');
  const earpMeta = {
    academic_title: 'False beliefs predict increased circumcision satisfaction in a sample of US American men',
    author: 'Brian D. Earp, Lauren M. Sardi, William A. Jellison',
    authors: ['Brian D. Earp', 'Lauren M. Sardi', 'William A. Jellison'],
    date: '2018',
    source_publication: 'Culture, Health & Sexuality, Vol. 20, No. 8, pp. 945–959',
    doi: '10.1080/13691058.2017.1400104',
    abstract: 'In this survey of 999 US American men, greater endorsement of false beliefs concerning circumcision and penile anatomy predicted greater satisfaction with being circumcised, while among genitally intact men, the opposite trend occurred: greater endorsement of false beliefs predicted less satisfaction with being genitally intact. These findings provide tentative support for the hypothesis that the lack-of-harm reported by many circumcised men may be related to holding inaccurate beliefs concerning unaltered genitalia and the consequences of childhood genital modification. Cites Hammond (1999) and Goldman (1997).',
    description: "Empirical study published in Culture, Health & Sexuality demonstrating that circumcised men's reported satisfaction is strongly mediated by endorsing inaccurate beliefs regarding penile anatomy and infant circumcision.",
    keywords: ['Circumcision', 'Sexual experience', 'Bodily integrity', 'Cognitive dissonance', 'False beliefs', 'Anatomy', 'Empirical survey', 'Tim Hammond citation'],
    category: 'Academic & Ethical Studies',
    collection: 'Academic & Ethical Studies',
    provenance: "Contributed via Tim Hammond's research dossier."
  };

  if (!docEarp) {
    docEarp = {
      id: 'earp-sardi-jellison-2018-false-beliefs',
      title: 'False beliefs predict increased circumcision satisfaction in a sample of US American men',
      source_collection: 'Academic & Ethical Studies',
      url: '/documents/earp-sardi-false-beliefs-2018.pdf',
      type: 'medical_journal',
      status: 'ingested',
      media_urls: null,
      content: earpText,
      metadata_json: JSON.stringify(earpMeta),
      created_at: '2026-10-16 16:00:00',
      collection_id: 'academic-studies',
      series: 'Empirical Research'
    };
    apiMock.unshift(docEarp);
    console.log('Added earp-sardi-jellison-2018-false-beliefs');
  } else {
    docEarp.title = 'False beliefs predict increased circumcision satisfaction in a sample of US American men';
    docEarp.url = '/documents/earp-sardi-false-beliefs-2018.pdf';
    docEarp.status = 'ingested';
    docEarp.content = earpText;
    docEarp.metadata_json = JSON.stringify(earpMeta);
    console.log('Updated earp-sardi-jellison-2018-false-beliefs');
  }

  fs.writeFileSync('public/api_mock.json', JSON.stringify(apiMock, null, 2), 'utf8');
  console.log('Saved public/api_mock.json');

  // 4. Update public/api_collections_tim-hammond-archive_mock.json
  const thArchive = JSON.parse(fs.readFileSync('public/api_collections_tim-hammond-archive_mock.json', 'utf8'));
  const list = thArchive.documents || thArchive.items || [];
  
  const th4f = list.find(d => d.id === 'umass-ms1205-raw-4f594152');
  if (th4f) {
    th4f.title = 'AWAKENINGS: A Preliminary Poll of Circumcised Men (Full 1994 Report)';
    th4f.url = '/documents/1994-awakenings-full-report.pdf';
    th4f.status = 'ingested';
  }

  const th18 = list.find(d => d.id === 'umass-ms1205-raw-18a383b9');
  if (th18) {
    th18.title = 'AWAKENINGS: Harm Documentation Synopsis Sheet (1994)';
    th18.url = '/documents/1994-awakenings-synopsis-sheet.pdf';
    th18.status = 'ingested';
  }

  let thBju = list.find(d => d.id === 'hammond-bjui-1999-preliminary-poll');
  if (!thBju) {
    list.unshift({
      id: 'hammond-bjui-1999-preliminary-poll',
      title: 'A Preliminary Poll of Men Circumcised in Infancy or Childhood (BJU International 1999)',
      url: '/documents/1999-hammond-preliminary-poll-bju.pdf',
      status: 'ingested',
      source_collection: 'The Tim Hammond Genital Autonomy Archive',
      type: 'medical_journal'
    });
  }

  fs.writeFileSync('public/api_collections_tim-hammond-archive_mock.json', JSON.stringify(thArchive, null, 2), 'utf8');
  console.log('Saved public/api_collections_tim-hammond-archive_mock.json');
  console.log('Done!');
}

run().catch(console.error);
