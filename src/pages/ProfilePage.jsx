import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, FileText, Globe, ArrowLeft, Network, Sparkles, Edit3, Save, Image as ImageIcon, Search, Archive, Check, X, RotateCcw, AlertCircle, Scale, Award, Share2, Sliders, AlertTriangle, ShieldCheck, ShieldAlert, Info, ChevronDown, ChevronUp, Tag, Plus, ExternalLink, Calendar, MapPin, Building2, UserCheck, Play, Film, Radio, Layers, Landmark, Clock, FileCheck, Compass, CheckCircle2, ChevronRight } from 'lucide-react';
import AutoEntityLinker from '../components/AutoEntityLinker';
import EntityNetworkGraph from '../components/EntityNetworkGraph';
import ThinkingSpirograph from '../components/ThinkingSpirograph';
import { generateFriendlySlug } from '../utils/slugs';
import { safeParseJson } from '../utils/json';
import MediaEmbed from '../components/MediaEmbed';
import './AdminArchivePage.css';

let globalCachedDocs = null;

const ENTITY_OVERRIDES_KEY = 'circumsurvey_entity_overrides';

export const TIM_HAMMOND_MILESTONES = [
  {
    year: '1976 – 1983',
    era: 'early',
    title: 'Dignity-Integrity & Early LGBTQ Advocacy (Rochester, NY)',
    description: 'Member of Dignity-Integrity/Rochester, a ministry to local Catholic and Episcopal gays, lesbians, their families and friends. Served as administrative assistant, newsletter editor, fundraiser, hotline volunteer, and special events coordinator.',
    links: []
  },
  {
    year: '1979',
    era: 'early',
    title: 'First National March on Washington for Lesbian & Gay Rights',
    description: 'Joined an estimated 200,000 participants in Washington, DC advocating for equal protection and federal civil rights.',
    links: []
  },
  {
    year: '1980',
    era: 'early',
    title: 'Media Advocacy: AM Rochester & Radio Broadcasts',
    description: 'Interviewed on "AM Rochester" with Sue Cowell by television host Matt Rinaldi to discuss challenges facing Rochester\'s lesbian and gay community. Radio interviews on WPXY and WEZO addressing the church and gay rights.',
    links: [
      { label: 'AM Rochester TV Interview', url: 'https://www.youtube.com/watch?v=J-IufBJTSXQ', type: 'video' },
      { label: 'WPXY Radio (8-18-80)', url: 'http://circumcisionharm.org/1980-08-18%20WPXY%20Gays&Church%20Tim%20Sally.mp3', type: 'audio' },
      { label: 'WEZO Radio (09-21-80)', url: 'http://circumcisionharm.org/1980-09-21%20WEZO%20Gays&Church%20Tim%20Sally.mp3', type: 'audio' }
    ]
  },
  {
    year: '1981',
    era: 'early',
    title: 'Co-Founder of Families & Friends of Gays / Rochester (PFLAG)',
    description: 'Co-founded Families & Friends of Gays/Rochester, the local chapter of Parents and Friends of Lesbians and Gays (PFLAG).',
    links: []
  },
  {
    year: '1982',
    era: 'early',
    title: 'First Annual Day of Remembrance for Gay/Lesbian Holocaust Victims',
    description: 'Organizer of the first annual Day of Remembrance of gay and lesbian victims of the Holocaust in Rochester, NY.',
    links: []
  },
  {
    year: '1983',
    era: 'early',
    title: 'Co-Founder of AIDS/Rochester, CREATE:Justice & Vinnie Cup',
    description: 'Co-founder of AIDS/Rochester, a service agency providing AIDS education and support services. Founding task force member of CREATE:Justice (Presbytery of the Genesee Valley). Recipient of the Vinnie Cup awarded by the Gay Alliance of the Genesee Valley for outstanding service.',
    links: [
      { label: 'CREATE:Justice PDF', url: 'http://circumcisionharm.org/images-circharm.org/1983%20CREATE%20Justice.pdf', type: 'pdf' }
    ]
  },
  {
    year: '1984 – 1987',
    era: 'early',
    title: 'AIDS Health Project (University of California / San Francisco)',
    description: 'Administrative Assistant of the AIDS Health Project, an agency of UCSF providing psychosocial support to those with AIDS and at-risk of infection.',
    links: [
      { label: 'AIDS Health Project Staff', url: 'http://circumcisionharm.org/images-circharm.org/1985%20AIDS%20Health%20Project%20staff.jpg', type: 'image' },
      { label: 'Office Manager Record', url: 'http://circumcisionharm.org/images-circharm.org/1985%20AIDS%20H.P.%20Tim%20Ofc.%20Mgr..jpg', type: 'image' }
    ]
  },
  {
    year: '1987',
    era: 'early',
    title: 'U.S. Supreme Court Civil Disobedience Arrest & AIDS Memorial Quilt',
    description: 'Joined an estimated 500,000 participants at the National March on Washington for Lesbian and Gay Rights; volunteered as a quilt handler at the Inaugural Display of the NAMES Project AIDS Quilt on the Washington Mall; arrested with over 600 others in civil disobedience on the steps of the U.S. Supreme Court protesting Bowers v. Hardwick.',
    links: [
      { label: 'Supreme Court Protest Report', url: 'http://circumcisionharm.org/images-circharm.org/1987%20Supreme%20Ct%20protest%20Argus.pdf', type: 'pdf' }
    ]
  },
  {
    year: '1989',
    era: 'noharmm',
    title: 'Co-Founder of NORM (National Organization of Restoring Men)',
    description: 'Co-founder of the National Organization of Restoring Men (NORM), an international network of groups offering moral and technical support to men seeking foreskin restoration.',
    links: [
      { label: 'NORM Official Website', url: 'http://norm.org/', type: 'external' }
    ]
  },
  {
    year: '1992',
    era: 'noharmm',
    title: 'Founder of NOHARMM & Collaboration with Hanny Lightfoot-Klein',
    description: 'Founder of the National Organization to Halt the Abuse and Routine Mutilation of Males (NOHARMM), a non-violent educational and direct-action network. Worked closely with author Hanny Lightfoot-Klein and philanthropist Laurance S. Rockefeller to secure funding for educational projects protecting girls and boys from genital cutting.',
    links: [
      { label: 'NOHARMM Website', url: 'http://noharmm.org/', type: 'external' },
      { label: 'Lightfoot-Klein Prisoners of Ritual PDF', url: 'http://circumcisionharm.org/images-circharm.org/1989%20Prisoners%20of%20Ritual%20Lightfoot-Klein.pdf', type: 'pdf' }
    ]
  },
  {
    year: '1993',
    era: 'noharmm',
    title: 'AWAKENINGS Survey & Genital Autonomy Visibility March',
    description: 'Survey Coordinator of "Awakenings: A Preliminary Poll of Circumcised Men", an ongoing grassroots investigation of long-term adverse physical, sexual, and psychological outcomes. Attended March on Washington wearing NOHARMM apparel to heighten visibility of children\'s genital autonomy.',
    links: [
      { label: 'Awakenings Synopsis', url: 'http://noharmm.org/synopsis.htm', type: 'external' },
      { label: 'Full Report (1994 PDF)', url: 'http://circumcisionharm.org/images-circharm.org/1994%20Awakenings.pdf', type: 'pdf' }
    ]
  },
  {
    year: '1994',
    era: 'noharmm',
    title: 'Wisconsin Public Radio & Human Rights Award',
    description: 'Interviewed by Jean Feraca on Wisconsin Public Radio. Presented survey findings at the Third International Symposium on Circumcision (Washington, DC) and received the Human Rights Award for creating invaluable educational tools and a national support network.',
    links: [
      { label: 'Wisconsin Public Radio Broadcast', url: 'http://circumcisionharm.org/images-circharm.org/1994%20WI%20PubRadio%20Hammond%20(May%209).mp3', type: 'audio' },
      { label: 'Human Rights Award', url: 'http://circumcisionharm.org/images-circharm.org/1994%20symposium%20HR%20Award.jpg', type: 'image' }
    ]
  },
  {
    year: '1995',
    era: 'noharmm',
    title: 'Whose Body, Whose Rights? Documentary (Library of Congress)',
    description: 'Executive Producer of "Whose Body, Whose Rights?", a 56-minute social issue documentary examining the effects of childhood sexual mutilation on men\'s lives and restorative healing. Accepted into the U.S. Library of Congress and the American Archives of Public Broadcasting. Co-presenter at 6th Interdisciplinary Conference on Male Sexual Victimization (Columbus, OH).',
    links: [
      { label: 'Whose Body, Whose Rights? Synopsis', url: 'http://www.circumcisionharm.org/wbwr.htm', type: 'external' },
      { label: 'American Archive of Public Broadcasting', url: 'https://americanarchive.org/catalog/cpb-aacip-8b50eabe2b0', type: 'external' }
    ]
  },
  {
    year: '1996',
    era: 'noharmm',
    title: 'UCSF / Stanford Teaching Associate & Harvard Human Rights Conference',
    description: 'Member of a team of Male Urological Teaching Associates instructing medical students at UCSF School of Medicine and Stanford University School of Medicine in proper Male Pelvic Examination techniques. Presenter at 4th International Symposium in Lausanne, Switzerland, and 2nd International Conference on Health & Human Rights at Harvard University.',
    links: [
      { label: 'Harvard Presentation Paper', url: 'http://noharmm.org/harvard.htm', type: 'external' }
    ]
  },
  {
    year: '1997 – 1998',
    era: 'noharmm',
    title: 'Sex Educator Training & Amnesty International Initiatives',
    description: 'Graduate of Sex Educator Training at San Francisco Sex Information (SFSI). Worked with Amnesty International Bermuda Section to author "Bodily Integrity for Both" reports (including endorsement letter from London Black Women\'s Health Action Project). Organizer of AI poster presentation in San Francisco.',
    links: [
      { label: '1997 AI Bodily Integrity Report', url: 'http://circumcisionharm.org/images-circharm.org/1997%20AI%20Report-Bodily%20Integrity.pdf', type: 'pdf' },
      { label: '1998 AI Report PDF', url: 'http://circumcisionharm.org/images-circharm.org/1998%20AI%20Report-Bodily%20Integrity.pdf', type: 'pdf' },
      { label: 'History of AI MGC Initiatives', url: 'http://circumcisionharm.org/images-circharm.org/1981-2007%20AI%20MGC%20History_rev_.pdf', type: 'pdf' }
    ]
  },
  {
    year: '1999',
    era: 'noharmm',
    title: 'British Journal of Urology International (BJUI) Publication',
    description: 'Author of "A Preliminary Poll of Men Circumcised in Infancy or Childhood" in British Journal of Urology International (Vol. 83, Suppl. 1, pp. 85-92). Landmark peer-reviewed microdata publication.',
    links: [
      { label: 'BJU Article PDF', url: 'http://circumcisionharm.org/images-circharm.org/1999%20Preliminary%20Poll%20Hammond%20BJU.pdf', type: 'pdf' },
      { label: 'BJU Online Text', url: 'http://noharmm.org/bju.htm', type: 'external' }
    ]
  },
  {
    year: '2000',
    era: 'noharmm',
    title: 'Textbook Chapter with Dr. Ronald Goldman',
    description: 'Co-authored "Male Genital Mutilation" in "Psychological Perspectives on Human Sexuality" (Barry University). Acknowledged and cited in David L. Gollaher\'s seminal history "Circumcision: A History of the World\'s Most Controversial Surgery" (p. 180).',
    links: [
      { label: 'Textbook Chapter PDF', url: 'http://circumcisionharm.org/images-circharm.org/psych%20persp%20hum%20sex%20circ%20combined.pdf', type: 'pdf' }
    ]
  },
  {
    year: '2012',
    era: 'global_survey',
    title: 'Co-Founding of CHHRP & Global Survey of Circumcision Harm (GSCH)',
    description: 'Co-founded the Children\'s Health & Human Rights Partnership (CHHRP) in Canada with Kira Antinuk, Dr. Christopher Guest, and David Saving. Open letter to Chancellor Angela Merkel and the Bundestag on pending German legislation. Presented findings from 1,000+ men in the 2011 Global Survey of Circumcision Harm at 12th International Symposium in Helsinki, Finland.',
    links: [
      { label: 'CHHRP Official Site', url: 'http://www.chhrp.org/', type: 'external' },
      { label: 'Merkel Open Letter Video', url: 'https://www.youtube.com/watch?v=wy7YrBFjYsw', type: 'video' },
      { label: 'GSCH Research Portal', url: 'http://www.circumcisionharm.org/', type: 'external' }
    ]
  },
  {
    year: '2013',
    era: 'global_survey',
    title: 'Canadian Paediatric Society Open Letter & Rochester LGBT Documentary',
    description: 'Open letter to the Canadian Paediatric Society regarding GSCH findings. Interviewed in "Shoulders to Stand On: The LGBT History of Rochester (NY)", appearing in Chapter 12: Rochester Responds to AIDS.',
    links: [
      { label: 'CPS Open Letter Video', url: 'https://www.youtube.com/watch?v=IVUWXjYlbT8', type: 'video' },
      { label: 'Shoulders to Stand On Project', url: 'http://shoulderstostandonblog.org/Home/?page_id=266', type: 'external' }
    ]
  },
  {
    year: '2014 – 2015',
    era: 'global_survey',
    title: '"Lost Causes" Book Chapter & Frankfurt Symposium',
    description: 'Interview featured in chapter "His Body, His Choice" in "Lost Causes: Agenda Vetting in Global Issue Networks". Presented GSCH findings at the Symposium on Genital Autonomy: Myths and Multiple Standards in Frankfurt, Germany.',
    links: [
      { label: 'His Body, His Choice PDF', url: 'http://circumcisionharm.org/images-circharm.org/Lost%20Causes%20-%20Circ%20chapter.pdf', type: 'pdf' },
      { label: 'Frankfurt Symposium YouTube', url: 'https://www.youtube.com/watch?v=v_ht2CRTdbo', type: 'video' },
      { label: 'Frankfurt Symposium Vimeo', url: 'https://vimeo.com/132639344', type: 'video' }
    ]
  },
  {
    year: '2016',
    era: 'global_survey',
    title: 'ICMI London & INGOCGA United Nations Core Report',
    description: 'Presented GSCH findings at 2016 International Conference on Men\'s Issues in London. Convenor of the International NGO Coalition on Genital Autonomy (INGOCGA), producing core and country-specific supplementary reports to the UN Committee on the Rights of the Child on boy bodily integrity.',
    links: [
      { label: 'London ICMI Presentation', url: 'https://www.youtube.com/watch?v=8izzCSRhKXs', type: 'video' },
      { label: 'Post-Conference Interview #1', url: 'https://www.youtube.com/watch?v=ms1xIP6WIVk', type: 'video' },
      { label: 'Post-Conference Interview #2', url: 'https://www.youtube.com/watch?v=Mdh5IYg7A9E', type: 'video' },
      { label: 'UN CRC Core Report PDF', url: 'http://circumcisionharm.org/images-circharm.org/2022%20Protecting%20All%20Children%20Core%20Report.pdf', type: 'pdf' },
      { label: 'INGOCGA Website', url: 'http://ingocga.org/', type: 'external' }
    ]
  },
  {
    year: '2017',
    era: 'global_survey',
    title: 'Publication in International Journal of Human Rights (IJHR)',
    description: 'Lead author of landmark peer-reviewed empirical paper "Long-term adverse outcomes from neonatal circumcision reported in a survey of 1,008 men: an overview of health and human rights implications" in International Journal of Human Rights (Vol. 21, Issue 2, pp. 189-218). Guest on LA Talk Radio\'s Sheena Metal Experience and video interviews with sex therapist Dan Rosen.',
    links: [
      { label: 'Taylor & Francis IJHR Paper', url: 'http://www.tandfonline.com/doi/full/10.1080/13642987.2016.1260007', type: 'external' },
      { label: 'LA Talk Radio Sheena Metal', url: 'http://www.latalkradio.com/content/sheena-042417%20#audio_play', type: 'audio' },
      { label: 'Dan Rosen Interview Pt 1', url: 'http://circumcisionharm.org/images-circharm.org/2017%20Dan%20Rosen%20interviews%20Hammond%20Pt1.mp4', type: 'video' },
      { label: 'Dan Rosen Interview Pt 2', url: 'http://circumcisionharm.org/images-circharm.org/2017%20Dan%20Rosen%20interviews%20Hammond%20Pt2.mp4', type: 'video' }
    ]
  },
  {
    year: '2018',
    era: 'global_survey',
    title: 'Anthony Mascioli Rainbow Dialogues Archival Recognition',
    description: 'Recipient of the Anthony Mascioli Rainbow Dialogues Humanities Archival Recognition for his historical documentation of Rochester, NY LGBTQ history.',
    links: []
  },
  {
    year: '2020',
    era: 'surveys_galdef',
    title: 'Brian D. Earp Interviews & Establishment of Dual Archives',
    description: 'Published two-part interview with Oxford ethicist Brian D. Earp on intersectionality of genital autonomy. Established the Tim Sally LGBTQ+ Archives at Rochester Public Library and the Tim Hammond Genital Autonomy Advocacy Archives at University of Massachusetts Amherst.',
    links: [
      { label: 'Earp Interview Part 1', url: 'http://circumcisionharm.org/images-circharm.org/EC%20Earp%20Pt%201%20published%20May%202020.pdf', type: 'pdf' },
      { label: 'Earp Interview Part 2', url: 'http://circumcisionharm.org/images-circharm.org/EC%20Earp%20Pt%202%20published%20June%202020.pdf', type: 'pdf' },
      { label: 'Rochester Public Library Archive Guide', url: 'https://roccitylibrary.org/wp-content/uploads/2017.028-Gay-Alliance-of-the-Genesee-Valley-collection.pdf', type: 'pdf' }
    ]
  },
  {
    year: '2021',
    era: 'surveys_galdef',
    title: 'World Association for Sexual Health (WAS) & Brussels Collaboration',
    description: 'Named Honorary Member of Brussels Collaboration on Bodily Integrity. Book review in JOPPPAH. Presented preliminary findings from 1,800 foreskin restorers across 60 nations as a video poster presentation at 25th Congress of the World Association for Sexual Health.',
    links: [
      { label: 'Brussels Collaboration', url: 'https://en.intactiwiki.org/wiki/Brussels_Collaboration_on_Bodily_Integrity', type: 'external' },
      { label: 'JOPPPAH Book Review PDF', url: 'http://circumcisionharm.org/images-circharm.org/2021%20Hammond%20Circ%20Scar%20Review%20JPPPH.pdf', type: 'pdf' },
      { label: 'WAS 2021 Video Poster', url: 'http://circumcisionharm.org/images-circharm.org/2021%20WAS%20Poster-Foreskin%20Restorers.mp4', type: 'video' },
      { label: 'WAS Post-Congress Video Interview', url: 'http://circumcisionharm.org/images-circharm.org/2021%20WAS%20Post-Congress%20Interview.mp4', type: 'video' }
    ]
  },
  {
    year: '2022',
    era: 'surveys_galdef',
    title: 'Founder & President of GALDEF (Genital Autonomy Legal Defense and Education Fund)',
    description: 'Founded and serves as President of the Genital Autonomy Legal Defense and Education Fund (GALDEF) to organize, educate, and train legal professionals for impact litigation securing the rights of children, particularly boys in the U.S., to bodily integrity and genital autonomy. Presented introduction to GALDEF at 16th International Conference on Child Genital Cutting in Atlanta, GA.',
    links: [
      { label: 'GALDEF Official Website', url: 'https://www.galdef.org/', type: 'external' },
      { label: 'GALDEF Introduction Video', url: 'https://www.youtube.com/watch?v=ytKTXpAsIm0', type: 'video' },
      { label: 'GALDEF Slide Deck', url: 'http://circumcisionharm.org/images-circharm.org/GALDEF%20Intro%202022.ppsx', type: 'pdf' }
    ]
  },
  {
    year: '2023',
    era: 'surveys_galdef',
    title: 'Foreskin Restorers Landmark Study in IJIR & WAS Antalya Turkey',
    description: 'Published results from landmark study of nearly 1,800 foreskin restorers from 60 nations in the International Journal of Impotence Research (IJIR). Presented findings at the 26th Congress of the World Association for Sexual Health in Antalya, Turkey.',
    links: [
      { label: 'IJIR Results Summary', url: 'http://circumcisionharm.org/results.htm', type: 'external' },
      { label: 'WAS Antalya Presentation Video', url: 'https://www.youtube.com/watch?v=klFhPE6EbkM', type: 'video' }
    ]
  },
  {
    year: '2024',
    era: 'surveys_galdef',
    title: 'UMass Amherst MS 1205 Finding Aid Online & "On Boys" Podcast',
    description: 'Established the Tim Hammond Genital Autonomy Advocacy Archives at University of Massachusetts Amherst (MS 1205) with finding aid made available online. Appeared on the "On Boys" podcast discussing prepuce anatomy, function, and research into long-term circumcision trauma.',
    links: [
      { label: 'UMass MS 1205 Finding Aid', url: 'http://findingaids.library.umass.edu/ead/mums1205', type: 'external' },
      { label: '"On Boys" Podcast Episode', url: 'https://www.on-boys-podcast.com/circumcision-facts-myths/', type: 'audio' }
    ]
  },
  {
    year: '2025',
    era: 'surveys_galdef',
    title: 'GALDEF 3-Part Clinical Video Series at WAS',
    description: 'Tim Hammond and GALDEF create a 3-video educational series about penile anatomy, circumcision harm, and therapeutic approaches for clinicians at the World Association for Sexual Health.',
    links: [
      { label: 'WAS / GALDEF Clinical Video Series', url: 'https://www.youtube.com/watch?v=rg0PXcM3WdQ&t=1344s', type: 'video' }
    ]
  }
];

export const TIM_HAMMOND_VIDEOS = [
  {
    year: '1980',
    title: 'AM Rochester: LGBTQ Challenges Facing Western New York',
    host: 'Television Host Matt Rinaldi with Sue Cowell',
    url: 'https://www.youtube.com/watch?v=J-IufBJTSXQ',
    platform: 'YouTube'
  },
  {
    year: '1995',
    title: 'Whose Body, Whose Rights? (56-Minute Social Issue Documentary)',
    host: 'U.S. Library of Congress / American Archives of Public Broadcasting',
    url: 'https://americanarchive.org/catalog/cpb-aacip-8b50eabe2b0',
    platform: 'Archival Video'
  },
  {
    year: '2012',
    title: 'Open Letter to Chancellor Angela Merkel and the German Bundestag',
    host: 'German Federal Circumcision Legislation Debate',
    url: 'https://www.youtube.com/watch?v=wy7YrBFjYsw',
    platform: 'YouTube'
  },
  {
    year: '2013',
    title: 'Open Letter to Canadian Paediatric Society on Circumcision Harm',
    host: 'Global Survey of Circumcision Harm (GSCH)',
    url: 'https://www.youtube.com/watch?v=IVUWXjYlbT8',
    platform: 'YouTube'
  },
  {
    year: '2015',
    title: 'Global Survey of Circumcision Harm: Frankfurt Symposium',
    host: 'Symposium on Genital Autonomy: Myths and Multiple Standards',
    url: 'https://www.youtube.com/watch?v=v_ht2CRTdbo',
    platform: 'YouTube'
  },
  {
    year: '2016',
    title: 'International Conference on Men\'s Issues (London Presentation)',
    host: '2016 ICMI London (includes Post-Conference Interviews #1 & #2)',
    url: 'https://www.youtube.com/watch?v=8izzCSRhKXs',
    platform: 'YouTube'
  },
  {
    year: '2022',
    title: 'Introduction to GALDEF: Impact Litigation for Bodily Integrity',
    host: '16th International Conference on Child Genital Cutting (Atlanta, GA)',
    url: 'https://www.youtube.com/watch?v=ytKTXpAsIm0',
    platform: 'YouTube'
  },
  {
    year: '2023',
    title: 'WAS Antalya: Survey of 1,800 Foreskin Restorers Across 60 Nations',
    host: '26th Congress of the World Association for Sexual Health (Antalya, Turkey)',
    url: 'https://www.youtube.com/watch?v=klFhPE6EbkM',
    platform: 'YouTube'
  },
  {
    year: '2025',
    title: 'GALDEF 3-Part Clinical Masterclass on Penile Anatomy & Circumcision Harm',
    host: 'World Association for Sexual Health (Clinical Series)',
    url: 'https://www.youtube.com/watch?v=rg0PXcM3WdQ&t=1344s',
    platform: 'YouTube'
  }
];

export const TIM_HAMMOND_ORGS = [
  {
    name: 'Genital Autonomy Legal Defense and Education Fund (GALDEF)',
    role: 'Founder & President',
    years: '2022 – Present',
    status: 'Active Impact Litigation',
    description: 'Organizes, educates, and trains legal professionals to achieve successful constitutional, tort, and civil impact litigation securing child bodily integrity in the United States. Spearheads clinician prepuce education with WAS.',
    url: 'https://www.galdef.org/',
    internalLink: '/to/galdef',
    color: '#facc15'
  },
  {
    name: 'National Organization to Halt the Abuse and Routine Mutilation of Males (NOHARMM)',
    role: 'Founder',
    years: '1992 – Present',
    status: 'Active Movement Network',
    description: 'First non-violent, educational, and direct-action network of men working together to end routine infant circumcision through male empowerment, symposiums, and peer support.',
    url: 'http://noharmm.org/',
    internalLink: '/to/noharmm',
    color: '#06b6d4'
  },
  {
    name: 'National Organization of Restoring Men (NORM)',
    role: 'Co-Founder',
    years: '1989 – Present',
    status: 'Active Peer Network',
    description: 'International network offering emotional and technical support for men pursuing foreskin restoration, with local chapters across North America and Europe.',
    url: 'http://norm.org/',
    internalLink: null,
    color: '#10b981'
  },
  {
    name: 'Children\'s Health & Human Rights Partnership (CHHRP)',
    role: 'Co-Founder (with Kira Antinuk, Dr. Christopher Guest, David Saving)',
    years: '2012 – Present',
    status: 'Active Canadian Non-Profit',
    description: 'Canada\'s first non-profit organization dealing exclusively with the non-therapeutic genital cutting of male, female, and intersex children from a health and human rights perspective.',
    url: 'http://www.chhrp.org/',
    internalLink: null,
    color: '#a855f7'
  },
  {
    name: 'International NGO Coalition on Genital Autonomy (INGOCGA)',
    role: 'Convenor',
    years: '2016 – 2022',
    status: 'Historic NGO Coalition',
    description: 'Authored landmark Core and Country-Specific Supplementary Reports submitted to the United Nations Committee on the Rights of the Child on boy bodily integrity under the CRC.',
    url: 'http://ingocga.org/',
    internalLink: null,
    color: '#f97316'
  },
  {
    name: 'The Tim Hammond Genital Autonomy Advocacy Archives (UMass MS 1205)',
    role: 'Archival Donator & Collection Subject',
    years: '1971 – Present (Cataloged 2022–2024)',
    status: 'Institutional Archive',
    description: 'Special Collections and University Archives at UMass Amherst. Houses decades of correspondence, microdata surveys, protest materials, audio/visual masters, and movement ephemera.',
    url: 'http://findingaids.library.umass.edu/ead/mums1205',
    internalLink: '/collections/tim-hammond-archive',
    color: '#eab308'
  },
  {
    name: 'Tim Sally LGBTQ+ Archives: Gay Rights & Intactivism Collection',
    role: 'Collection Subject (Rochester Public Library)',
    years: '1978 – 1985 / Established 2020',
    status: 'Institutional Archive',
    description: 'Established with archivist Evelyn Bailey at Rochester Public Library. Preserves historical documents from Dignity-Integrity, PFLAG Rochester, AIDS/Rochester, and early activism.',
    url: 'https://roccitylibrary.org/wp-content/uploads/2017.028-Gay-Alliance-of-the-Genesee-Valley-collection.pdf',
    internalLink: null,
    color: '#ec4899'
  }
];

export function renderMetadataChips(text, type = 'general', onJump = null) {
  if (!text) return <span style={{ color: 'var(--c-dim)' }}>—</span>;
  
  const rawParts = text.split(/[,;•]\s*/).map(p => p.trim()).filter(Boolean);
  if (rawParts.length === 0) return <span style={{ color: 'var(--c-dim)' }}>—</span>;

  return (
    <div className="dossier-chips-wrap">
      {rawParts.map((item, idx) => {
        const lower = item.toLowerCase();
        let linkTo = null;
        let isExternal = false;
        let icon = null;

        if (lower.includes('galdef')) {
          linkTo = '/to/galdef';
          icon = <ShieldCheck size={11} style={{ color: 'var(--c-goldBright)' }} />;
        } else if (lower.includes('noharmm')) {
          linkTo = '/to/noharmm';
          icon = <Building2 size={11} style={{ color: '#38bdf8' }} />;
        } else if (lower.includes('norm') && !lower.includes('noharmm')) {
          linkTo = 'http://norm.org/';
          isExternal = true;
          icon = <ExternalLink size={11} />;
        } else if (lower.includes('chhrp')) {
          linkTo = 'http://www.chhrp.org/';
          isExternal = true;
          icon = <ExternalLink size={11} />;
        } else if (lower.includes('ingocga')) {
          linkTo = 'http://ingocga.org/';
          isExternal = true;
          icon = <ExternalLink size={11} />;
        } else if (lower.includes('umass')) {
          linkTo = '/collections/tim-hammond-archive';
          icon = <Archive size={11} style={{ color: 'var(--c-goldBright)' }} />;
        } else if (lower.includes('nocirc')) {
          linkTo = '/to/nocirc';
          icon = <Building2 size={11} />;
        } else if (lower.includes('intact america')) {
          linkTo = '/to/intact_america';
          icon = <Building2 size={11} />;
        } else if (lower.includes('aap') || lower.includes('american academy of pediatrics')) {
          linkTo = '/to/american_academy_of_pediatrics';
          icon = <Building2 size={11} />;
        } else if (lower.includes('knmg') || lower.includes('royal dutch')) {
          linkTo = '/to/knmg';
          icon = <Building2 size={11} />;
        } else if (lower.includes('awakenings')) {
          linkTo = '/library?q=Awakenings';
          icon = <BookOpen size={11} />;
        } else if (lower.includes('whose body')) {
          linkTo = 'https://americanarchive.org/catalog/cpb-aacip-8b50eabe2b0';
          isExternal = true;
          icon = <Film size={11} />;
        } else if (lower.includes('global survey') || lower.includes('gsch')) {
          linkTo = '/library?q=Global+Survey+of+Circumcision+Harm';
          icon = <FileText size={11} />;
        } else if (type === 'milestones') {
          linkTo = '#milestones';
          icon = <Clock size={11} style={{ color: 'var(--c-goldBright)' }} />;
        } else {
          linkTo = `/library?q=${encodeURIComponent(item)}`;
          icon = <Tag size={11} />;
        }

        if (isExternal) {
          return (
            <a
              key={idx}
              href={linkTo}
              target="_blank"
              rel="noopener noreferrer"
              className="dossier-chip lux-hover-lift"
              title={`Visit official site for ${item}`}
            >
              {icon}
              <span>{item}</span>
            </a>
          );
        }

        if (linkTo.startsWith('#')) {
          return (
            <a
              key={idx}
              href={linkTo}
              onClick={(e) => {
                e.preventDefault();
                if (onJump) {
                  onJump(linkTo.slice(1));
                } else {
                  const target = document.getElementById(linkTo.slice(1));
                  if (target) {
                    const y = target.getBoundingClientRect().top + window.pageYOffset - 130;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }
              }}
              className="dossier-chip dossier-chip-gold lux-hover-lift"
              title={`Jump to ${item}`}
            >
              {icon}
              <span>{item}</span>
            </a>
          );
        }

        return (
          <Link
            key={idx}
            to={linkTo}
            className="dossier-chip lux-hover-lift"
            title={`Explore archive records for ${item}`}
          >
            {icon}
            <span>{item}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function renderYearsActive(years) {
  if (!years) return <span style={{ color: 'var(--c-dim)' }}>—</span>;
  const matchYear = years.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
  const targetYear = matchYear ? matchYear[1] : null;
  const linkTo = targetYear ? `/library?year=${targetYear}` : '/timeline';

  return (
    <Link
      to={linkTo}
      className="dossier-chip dossier-chip-gold lux-hover-lift"
      title={`Browse library archives from ${years}`}
    >
      <Calendar size={12} style={{ color: 'var(--c-goldBright)' }} />
      <span>{years}</span>
    </Link>
  );
}

export function renderJurisdiction(loc) {
  if (!loc) return <span style={{ color: 'var(--c-dim)' }}>—</span>;
  const norm = loc.trim();
  const geoParam = norm.toLowerCase().includes('united states') || norm.toLowerCase() === 'us' || norm.toLowerCase() === 'usa'
    ? 'USA'
    : norm;
  return (
    <Link
      to={`/atlas?geo=${encodeURIComponent(geoParam)}`}
      className="dossier-chip lux-hover-lift"
      title={`Explore ${loc} in Global Atlas`}
    >
      <MapPin size={12} style={{ color: '#38bdf8' }} />
      <span>{loc}</span>
    </Link>
  );
}

function getStoredOverrides() {
  try {
    const raw = localStorage.getItem(ENTITY_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredOverride(entityId, data, altKeys = []) {
  try {
    const all = getStoredOverrides();
    const updated = {
      ...(all[entityId] || {}),
      ...data,
      isLocalOverride: true,
      lastModified: new Date().toISOString()
    };
    all[entityId] = updated;
    altKeys.forEach(k => {
      if (k) all[k] = updated;
    });
    localStorage.setItem(ENTITY_OVERRIDES_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Failed to persist entity override to localStorage", e);
  }
}

function clearStoredOverride(entityId, altKeys = []) {
  try {
    const all = getStoredOverrides();
    delete all[entityId];
    altKeys.forEach(k => {
      if (k) delete all[k];
    });
    localStorage.setItem(ENTITY_OVERRIDES_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Failed to clear entity override from localStorage", e);
  }
}

export function normalizeEntityRole(role, stance, name = '') {
  const norm = (str) => (str || '').toLowerCase().trim();
  const r = norm(role);
  const s = norm(stance);
  const n = norm(name);

  if (r === 'champion' || s === 'champion') return 'champion';
  if (r === 'critic' || s === 'critic') return 'critic';
  if (r === 'notable' || s === 'notable') return 'notable';

  // Prominent movement figures
  if (n.includes('tim hammond') || n.includes('hammond tim') || n.includes('milos') || n.includes('tristan huff') || n.includes('foregen') || n.includes('noharmm') || n.includes('nocirc') || n.includes('galdef') || n.includes('arc') || n.includes('bloodstained men') || n.includes('intact') || n.includes('15square') || n.includes('frisch')) {
    return 'champion';
  }
  if (n.includes('sayre') || n.includes('kellogg') || n.includes('diekema') || n.includes('freedman') || n.includes('aap') || n.includes('american academy of pediatrics')) {
    return 'critic';
  }

  if (r.includes('champion') || r.includes('intactivist') || r.includes('autonomy') || s.includes('champion') || s.includes('intactivist') || s.includes('autonomy')) {
    return 'champion';
  }
  if (r.includes('critic') || r.includes('pro-circ') || s.includes('critic') || s.includes('pro-circ')) {
    return 'critic';
  }

  return 'notable';
}

export const LIKERT_RATINGS = {
  1: {
    score: 1,
    label: 'Very Pro-Genital Cutting',
    shortLabel: 'Pro-Cutting',
    defaultGrade: 'F',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    glow: 'rgba(239, 68, 68, 0.25)',
    summary: 'Defends routine infant circumcision / non-consensual genital cutting.',
    defaultQuote: 'Given an F grade by The Accidental Intactivist\'s Guide for actively defending or promoting non-consensual infant genital cutting.'
  },
  2: {
    score: 2,
    label: 'Leans Pro-Genital Cutting',
    shortLabel: 'Leans Cutting',
    defaultGrade: 'D',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    glow: 'rgba(249, 115, 22, 0.25)',
    summary: 'Minimizes circumcision harm or defers to parental/cultural discretion.',
    defaultQuote: 'Given a D grade by The Accidental Intactivist\'s Guide for minimizing procedural harm and deferring to circumcision culture.'
  },
  3: {
    score: 3,
    label: 'Neutral / Ambivalent',
    shortLabel: 'Neutral',
    defaultGrade: 'C',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.35)',
    glow: 'rgba(148, 163, 184, 0.25)',
    summary: 'Objective documentary footprint, neutral jurisprudence, or mixed archival record.',
    defaultQuote: 'Given a C grade by The Accidental Intactivist\'s Guide for an ambivalent, mixed, or purely archival institutional record.'
  },
  4: {
    score: 4,
    label: 'Leans Pro-Genital Autonomy',
    shortLabel: 'Leans Autonomy',
    defaultGrade: 'B+',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
    glow: 'rgba(6, 182, 212, 0.25)',
    summary: 'Questions routine cutting, emphasizes child consent and foreskin functions.',
    defaultQuote: 'Awarded a B+ grade by The Accidental Intactivist\'s Guide for critical reform stance and advancing informed consent.'
  },
  5: {
    score: 5,
    label: 'Very Pro-Genital Autonomy',
    shortLabel: 'Very Pro-Autonomy',
    defaultGrade: 'A+',
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.45)',
    glow: 'rgba(250, 204, 21, 0.3)',
    summary: 'Foundational pioneer of bodily autonomy, landmark surveys, or litigation.',
    defaultQuote: 'Awarded an A+ grade by The Accidental Intactivist\'s Guide for pioneering empirical research and unwavering bodily autonomy advocacy.'
  }
};

export const GRADING_RUBRIC = [
  {
    grade: 'A+',
    level: 'Champion of Genital Autonomy',
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.2)',
    border: '#facc15',
    criteria: 'Uncompromising defense of child bodily integrity. Groundbreaking empirical research, landmark constitutional litigation, movement founding, or policy transformation.'
  },
  {
    grade: 'B+',
    level: 'Autonomy Advocate / Reformer',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.2)',
    border: '#06b6d4',
    criteria: 'Active defense of infant rights and foreskin anatomy. Vocal opposition to routine neonatal circumcision, public health reform, or ethical medical guidelines.'
  },
  {
    grade: 'C',
    level: 'Neutral / Mixed Institutional Record',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.2)',
    border: '#94a3b8',
    criteria: 'Objective archival, legal, or journalistic footprint without active advocacy. Includes medical associations with ambivalent or compromised policy statements.'
  },
  {
    grade: 'D',
    level: 'Leans Pro-Genital Cutting',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.2)',
    border: '#f97316',
    criteria: 'Minimizes surgical harm, characterizes non-consensual cutting as parental prerogative or cultural tradition, or defends circumcision on speculative grounds.'
  },
  {
    grade: 'F',
    level: 'Promoter / Apologist of Cutting',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '#ef4444',
    criteria: 'Actively lobbies for, mandates, performs, or profits from routine neonatal genital cutting without medical necessity or informed consent.'
  }
];

export function getInitialDossier(entity, docs = [], overrides = {}) {
  const normName = (entity?.name || '').toLowerCase();
  
  if (overrides.years_active || overrides.affiliations || overrides.core_focus || overrides.key_milestones) {
    return {
      yearsActive: overrides.years_active || entity?.years_active || '',
      affiliations: overrides.affiliations || entity?.affiliations || '',
      coreFocus: overrides.core_focus || entity?.core_focus || '',
      keyMilestones: overrides.key_milestones || entity?.key_milestones || '',
      jurisdiction: overrides.location || entity?.location || 'United States / International'
    };
  }  if (normName.includes('tim hammond') || normName.includes('hammond tim')) {
    return {
      yearsActive: entity?.years_active || '1976 – Present (50 Years)',
      affiliations: entity?.affiliations || 'GALDEF (Founder & President), NOHARMM (Founder), NORM (Co-founder), CHHRP, UMass MS 1205 Archives',
      coreFocus: entity?.core_focus || 'Genital Autonomy Legal Defense, Empirical Circumcision Harm Surveys, Foreskin Restoration Microdata',
      keyMilestones: entity?.key_milestones || 'GALDEF (2022), Awakenings Survey (1993/1999), Global Survey of Circumcision Harm (2011/2017), UMass MS 1205 (2024)',
      jurisdiction: entity?.location || 'United States / International'
    };
  }
  if (normName.includes('galdef') || normName.includes('genital autonomy legal defense')) {
    return {
      yearsActive: entity?.years_active || '2022 – Present',
      affiliations: entity?.affiliations || 'Tim Hammond (Founder & President), Intact America, Children\'s Health & Human Rights Partnership',
      coreFocus: entity?.core_focus || 'Impact Litigation, Legal Defense Training, Children\'s Bodily Autonomy Rights',
      keyMilestones: entity?.key_milestones || 'Founded (2022), 16th Int. Conference on Child Genital Cutting, WAS 2025 Clinical Video Series',
      jurisdiction: entity?.location || 'United States / Federal & State Courts'
    };
  }
  if (normName.includes('milos')) {
    return {
      yearsActive: entity?.years_active || '1985 – Present',
      affiliations: entity?.affiliations || 'NOCIRC (Founder), International Symposia on Circumcision',
      coreFocus: entity?.core_focus || 'Child Protection, Clinical Ethics, Global Movement Building',
      keyMilestones: entity?.key_milestones || 'First International Symposium (1989), UN Human Rights Petitions',
      jurisdiction: entity?.location || 'United States / Global'
    };
  }
  if (normName.includes('sayre')) {
    return {
      yearsActive: entity?.years_active || '1870 – 1900',
      affiliations: entity?.affiliations || 'Bellevue Hospital Medical College, AMA (President)',
      coreFocus: entity?.core_focus || 'Reflex Neurosis Theory, Orthopedic Surgery, Pro-Circumcision Advocacy',
      keyMilestones: entity?.key_milestones || '1870 Reflex Irritation Treatise, 19th-Century Surgical Reforms',
      jurisdiction: entity?.location || 'United States (New York)'
    };
  }

  let years = 'Contemporary';
  if (docs && docs.length > 0) {
    const dates = docs.map(d => {
      try {
        const m = safeParseJson(d.metadata_json);
        const yr = parseInt(m.source_date || m.date || d.created_at);
        return !isNaN(yr) && yr > 1850 && yr < 2030 ? yr : null;
      } catch { return null; }
    }).filter(Boolean);
    if (dates.length > 0) {
      const minYear = Math.min(...dates);
      const maxYear = Math.max(...dates);
      years = minYear === maxYear ? `${minYear}` : `${minYear} – ${maxYear}`;
    }
  }

  return {
    yearsActive: entity?.years_active || years,
    affiliations: entity?.affiliations || (entity?.type === 'organization' ? 'Archival Organization / Network' : 'Independent Research / Advocacy'),
    coreFocus: entity?.core_focus || (entity?.type === 'organization' ? 'Institutional Advocacy & Education' : 'Genital Autonomy & Medical Ethics'),
    keyMilestones: entity?.key_milestones || `${docs.length} Cataloged Archive Manuscripts`,
    jurisdiction: entity?.location || 'United States / International'
  };
}

export function scanBioForEntities(bioText, allEntities = [], currentEntityName = '') {
  if (!bioText) return [];
  const normCurrent = (currentEntityName || '').toLowerCase().trim();

  const candidateNames = Array.from(new Set([
    'NOHARMM', 'NOCIRC', 'NORM', 'National Organization of Restoring Men', 'Foregen', 'GALDEF',
    'Intact America', 'Intact Global', '15Square', 'American Academy of Pediatrics', 'AAP',
    'Royal Dutch Medical Association', 'KNMG', 'Marilyn Milos', 'Tim Hammond', 'Tristan Huff',
    'Adam Schwartz', 'David Hadachek', 'Eric Clopper', 'Morten Frisch', 'Ronald Goldman',
    'Lewis Sayre', 'John Harvey Kellogg', 'Douglas Diekema', 'Andrew Freedman', 'Hugh Thompson',
    'Bloodstained Men', 'Attorneys for the Rights of the Child', 'AWAKENINGS', 'UMass',
    ...(allEntities || []).map(e => e?.name).filter(Boolean)
  ]));

  const detected = [];
  const seen = new Set();

  candidateNames.forEach(name => {
    if (!name || name.length < 3) return;
    const lowerName = name.toLowerCase();

    if (normCurrent && (lowerName === normCurrent || (normCurrent.length > 4 && lowerName.includes(normCurrent)))) {
      return;
    }

    if (['intact', 'survey', 'report', 'study', 'hospital', 'court', 'state'].includes(lowerName)) {
      return;
    }

    const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = bioText.match(regex);
    if (matches && matches.length > 0) {
      if (!seen.has(lowerName)) {
        seen.add(lowerName);
        detected.push({
          name,
          count: matches.length
        });
      }
    }
  });

  return detected.sort((a, b) => b.count - a.count);
}

export function getInitialRating(entity, overrides = {}) {
  const normName = (entity?.name || '').toLowerCase();
  const role = normalizeEntityRole(entity?.role, entity?.stance, entity?.name);

  const savedScore = overrides.rating_score || entity?.rating_score;
  const savedGrade = overrides.rating_grade || entity?.rating_grade;
  const savedQuote = overrides.rating_quote || entity?.rating_quote;

  if (savedScore && LIKERT_RATINGS[Number(savedScore)]) {
    const s = Number(savedScore);
    return {
      score: s,
      grade: savedGrade || LIKERT_RATINGS[s].defaultGrade,
      quote: savedQuote || LIKERT_RATINGS[s].defaultQuote
    };
  }

  if (normName.includes('tim hammond') || normName.includes('hammond tim')) {
    return {
      score: 5,
      grade: 'A+',
      quote: 'Awarded an A+ grade by The Accidental Intactivist\'s Guide for founding GALDEF, pioneering the landmark AWAKENINGS survey, and half a century of frontline advocacy for bodily integrity.'
    };
  }
  if (normName.includes('galdef') || normName.includes('genital autonomy legal defense')) {
    return {
      score: 5,
      grade: 'A+',
      quote: 'Awarded an A+ grade by The Accidental Intactivist\'s Guide for organizing impact litigation and training legal professionals to defend children\'s bodily integrity.'
    };
  }
  if (normName.includes('milos')) {
    return {
      score: 5,
      grade: 'A+',
      quote: 'Awarded an A+ grade by The Accidental Intactivist\'s Guide as the founder of NOCIRC and godmother of the modern genital autonomy movement.'
    };
  }
  if (normName.includes('sayre') || normName.includes('kellogg')) {
    return {
      score: 1,
      grade: 'F',
      quote: 'Given an F grade by The Accidental Intactivist\'s Guide for medicalizing and dogmatizing non-consensual infant genital cutting in America.'
    };
  }

  if (role === 'champion') {
    return {
      score: 5,
      grade: 'A+',
      quote: 'Awarded an A+ grade by The Accidental Intactivist\'s Guide for unwavering advocacy and defense of infant genital integrity.'
    };
  }
  if (role === 'critic') {
    return {
      score: 1,
      grade: 'F',
      quote: 'Given an F grade by The Accidental Intactivist\'s Guide for defending or promoting non-consensual genital cutting.'
    };
  }
  return {
    score: 3,
    grade: 'C',
    quote: 'Given a C grade by The Accidental Intactivist\'s Guide for a neutral, ambivalent, or mixed institutional record.'
  };
}

export default function ProfilePage() {
  const params = useParams();
  const id = params['*'] || params.id;
  const [entity, setEntity] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editRole, setEditRole] = useState('notable');
  const [editTagline, setEditTagline] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalModified, setIsLocalModified] = useState(false);
  const [toast, setToast] = useState(null);

  // Autonomy Scorecard & Meme Letter Grade State
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingGrade, setRatingGrade] = useState('A+');
  const [ratingQuote, setRatingQuote] = useState('');
  const [editRatingScore, setEditRatingScore] = useState(5);
  const [editRatingGrade, setEditRatingGrade] = useState('A+');
  const [editRatingQuote, setEditRatingQuote] = useState('');
  const [copiedMeme, setCopiedMeme] = useState(false);
  const [showRubric, setShowRubric] = useState(false);

  // Archive Dossier / Nutrition Facts States
  const [yearsActive, setYearsActive] = useState('');
  const [affiliations, setAffiliations] = useState('');
  const [coreFocus, setCoreFocus] = useState('');
  const [keyMilestones, setKeyMilestones] = useState('');
  const [editYearsActive, setEditYearsActive] = useState('');
  const [editAffiliations, setEditAffiliations] = useState('');
  const [editCoreFocus, setEditCoreFocus] = useState('');
  const [editKeyMilestones, setEditKeyMilestones] = useState('');

  // Entity Checker State
  const [allEntitiesList, setAllEntitiesList] = useState([]);
  const [detectedEntities, setDetectedEntities] = useState([]);

  const handleCopyMeme = () => {
    if (!entity) return;
    const currentLvl = LIKERT_RATINGS[ratingScore] || LIKERT_RATINGS[3];
    const isHighGrade = ratingGrade.startsWith('A') || ratingGrade.startsWith('B');
    const headlineVerdict = isHighGrade ? `was awarded an ${ratingGrade} grade` : `was given a ${ratingGrade} grade`;
    const snippet = `${entity.name} ${headlineVerdict} by The Accidental Intactivist's Guide:\n\n"${ratingQuote || currentLvl.defaultQuote}"\n\nGenital Autonomy Scale: ${currentLvl.label} (${ratingScore}/5)\nArchive Profile: ${window.location.href}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet);
      setCopiedMeme(true);
      setTimeout(() => setCopiedMeme(false), 3500);
    }
  };

  // Profile Section Navigation State
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedEra, setSelectedEra] = useState('all');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 130;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const [mentionSearch, setMentionSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [mentionSearch, typeFilter, sortOption]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [wikiImageResult, setWikiImageResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageError, setImageError] = useState(false);
  const graphRef = useRef(null);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);

      const sectionIds = [
        'overview',
        'dossier',
        'scorecard',
        'biography',
        'milestones',
        'organizations',
        'media',
        'authored-works',
        'expertise',
        'network-entities',
        'archive-citations',
        'relational-graph'
      ];

      const scrollPosition = window.scrollY + 160;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsGraphVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(graphRef.current);
    return () => observer.disconnect();
  }, []);

  // Admin authentication via Clerk
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Allow if they are explicitly marked as curator/admin in Clerk OR if their email is apettit or tim
      const isCurator = user.publicMetadata?.role === 'admin' || 
                        user.publicMetadata?.role === 'curator' || 
                        user.emailAddresses?.some(e => {
                          const addr = (e.emailAddress || '').toLowerCase();
                          return addr.includes('apettit') || addr.includes('tim');
                        });
      setIsAdmin(Boolean(isCurator));
    } else {
      setIsAdmin(false);
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isAdmin && isEditing) {
      setIsEditing(false);
    }
  }, [isAdmin, isEditing]);

  const handleSearchWikipediaImage = async (queryToSearch) => {
    setIsSearchingImage(true);
    setWikiImageResult(null);
    try {
      const q = encodeURIComponent(queryToSearch);
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=500&origin=*`);
      const data = await res.json();
      const pages = data.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page && page.thumbnail) {
          setWikiImageResult({
            url: page.thumbnail.source,
            title: page.title
          });
        } else {
          setWikiImageResult({ error: 'No image found on Wikipedia.' });
        }
      } else {
        setWikiImageResult({ error: 'No Wikipedia page found.' });
      }
    } catch (e) {
      console.error(e);
      setWikiImageResult({ error: 'Search failed.' });
    }
    setIsSearchingImage(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Entity Details with Mock Fallback
      let allEntities = [];
      try {
        const entRes = await fetch('/api/entities');
        if (entRes.ok) {
          const resData = await entRes.json();
          allEntities = Array.isArray(resData) ? resData : (resData.data || []);
        }
      } catch (err) {
        console.warn("Failed to fetch /api/entities, falling back to mock", err);
      }

      if (!allEntities || allEntities.length === 0) {
        try {
          const mockRes = await fetch('/api_entities_mock.json');
          if (mockRes.ok) {
            const mockData = await mockRes.json();
            allEntities = Array.isArray(mockData) ? mockData : (mockData.data || []);
          }
        } catch (e) {
          console.error("Failed to load mock entities", e);
        }
      }

      const decodedId = decodeURIComponent(id || '');

      const normalizeQuery = (str) => {
        if (!str) return '';
        return decodeURIComponent(str)
          .toLowerCase()
          .replace(/^(dr\.|dr|rev\.|prof\.)\s*/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim();
      };

      const query = normalizeQuery(decodedId);

      let found = allEntities.find(e => {
        if (!e || !e.name) return false;
        if (e.id === decodedId) return true;

        const normName = normalizeQuery(e.name);
        if (normName === query) return true;

        // Inverted names (e.g. "hammond tim" vs "tim hammond")
        const parts = normName.split(/\s+/);
        if (parts.length === 2) {
          if (`${parts[1]} ${parts[0]}` === query) return true;
        }
        if (parts.length === 3) {
          if (`${parts[2]} ${parts[0]} ${parts[1]}` === query) return true;
          if (`${parts[0]} ${parts[2]}` === query) return true;
        }

        // Acronym in parenthesis: e.g. "Royal Dutch Medical Association (KNMG)"
        const parenMatch = e.name.match(/\(([^)]+)\)/);
        if (parenMatch && normalizeQuery(parenMatch[1]) === query) return true;

        // Explicit aliases
        if (Array.isArray(e.aliases)) {
          if (e.aliases.some(a => normalizeQuery(a) === query)) return true;
        }

        return false;
      });

      if (!found) {
        // Auto-generate a stub entity so the page still loads archive mentions
        found = {
          id: decodedId,
          name: decodedId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type: decodedId.includes(' v ') || decodedId.includes(' v. ') ? 'legal' : 'person',
          description: 'This profile has not yet been written. You can use the AI Assistant to generate a biography based on their archive footprint.',
          image_url: ''
        };
      }

      // Special fallback image for Tim Hammond if missing
      if (found.name.toLowerCase().includes('hammond') && !found.image_url) {
        found.image_url = '/tim_hammond.jpg';
      }

      // Check static local_edited_entities.json as well
      let staticEdited = {};
      try {
        const staticRes = await fetch('/local_edited_entities.json');
        if (staticRes.ok) {
          staticEdited = await staticRes.json();
        }
      } catch (err) {
        // ignore
      }

      // Merge stored local overrides and static edited entities
      const stored = getStoredOverrides();
      const hasUserBrowserOverride = !!((found && stored[found.id]) || stored[decodedId] || stored[query] || (found && stored[normalizeQuery(found.name)]));
      const overrides = { ...stored, ...staticEdited };
      const localOverride = (found && overrides[found.id]) || overrides[decodedId] || overrides[query] || (found && overrides[normalizeQuery(found.name)]);
      if (localOverride) {
        found = { ...found, ...localOverride, isLocalOverride: hasUserBrowserOverride };
      }

      // Normalize role so it is strictly 'champion' | 'critic' | 'notable'
      const cleanRole = normalizeEntityRole(found.role, found.stance, found.name);
      found.role = cleanRole;
      found.stance = cleanRole;

      const initialRating = getInitialRating(found, localOverride || {});
      setRatingScore(initialRating.score);
      setRatingGrade(initialRating.grade);
      setRatingQuote(initialRating.quote);
      setEditRatingScore(initialRating.score);
      setEditRatingGrade(initialRating.grade);
      setEditRatingQuote(initialRating.quote);

      setAllEntitiesList(allEntities);

      const dossier = getInitialDossier(found, globalCachedDocs || [], localOverride || {});
      setYearsActive(dossier.yearsActive);
      setAffiliations(dossier.affiliations);
      setCoreFocus(dossier.coreFocus);
      setKeyMilestones(dossier.keyMilestones);
      setEditYearsActive(dossier.yearsActive);
      setEditAffiliations(dossier.affiliations);
      setEditCoreFocus(dossier.coreFocus);
      setEditKeyMilestones(dossier.keyMilestones);

      if (found.description) {
        setDetectedEntities(scanBioForEntities(found.description, allEntities, found.name));
      }

      setEntity(found);
      setEditDesc(found.description || '');
      setEditImageUrl(found.image_url || '');
      setEditRole(cleanRole);
      setEditTagline(found.tagline || '');
      setEditUrl(found.url || '');
      setEditLocation(found.location || dossier.jurisdiction || '');
      setEditContact(found.contact_info || '');
      setEditStatus(found.status || 'active');
      setIsLocalModified(!!found.isLocalOverride);
      setImageError(false);

      // 2. Fetch Documents mentioning this entity
      if (globalCachedDocs) {
        setDocuments(globalCachedDocs);
      } else {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal ? '/api_mock.json' : '/api/cms';
        const docRes = await fetch(apiUrl);
        
        if (docRes.ok) {
          const allDocs = await docRes.json();
          if (allDocs.data) {
            globalCachedDocs = allDocs.data;
            setDocuments(allDocs.data);
          } else if (Array.isArray(allDocs)) {
            globalCachedDocs = allDocs;
            setDocuments(allDocs);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken();
      const fallbackToken = localStorage.getItem('adminToken');
      const authHeader = token ? `Bearer ${token}` : fallbackToken ? `Bearer ${fallbackToken}` : '';
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ 
          query: `Write a short, professional, and encyclopedic biography about ${entity.name}. Focus ONLY on their background and their contributions/mentions within the archive context. Do not add outside information unless it's strictly biographical facts.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          setEditDesc(data.response);
          const foundTags = scanBioForEntities(data.response, allEntitiesList, entity.name);
          setDetectedEntities(foundTags);
          if (!isEditing) setIsEditing(true);
          setToast({
            type: 'success',
            message: `✨ Biography generated & ${foundTags.length} archive entities detected and tagged!`
          });
          setTimeout(() => setToast(null), 6000);
        }
      }
    } catch (e) {
      console.error("Failed to generate bio", e);
    }
    setIsGenerating(false);
  };


  const handleSaveBio = async () => {
    if (!entity) return;
    setIsSaving(true);
    try {
      const decodedId = decodeURIComponent(id || '');
      const normalizeQuery = (str) => {
        if (!str) return '';
        return decodeURIComponent(str).toLowerCase().replace(/^(dr\.|dr|rev\.|prof\.)\s*/i, '').replace(/[-_]/g, ' ').replace(/[^\w\s]/g, '').trim();
      };
      const query = normalizeQuery(decodedId);

      const cleanRole = normalizeEntityRole(editRole, editRole, entity.name);
      const updatedFields = {
        description: editDesc,
        universal_summary: editDesc,
        project_context: editDesc,
        image_url: editImageUrl,
        role: cleanRole,
        stance: cleanRole,
        rating_score: editRatingScore,
        rating_grade: (editRatingGrade || 'C').trim(),
        rating_quote: (editRatingQuote || '').trim(),
        years_active: editYearsActive.trim(),
        affiliations: editAffiliations.trim(),
        core_focus: editCoreFocus.trim(),
        key_milestones: editKeyMilestones.trim(),
        tagline: editTagline,
        url: editUrl,
        location: editLocation,
        contact_info: editContact,
        status: editStatus
      };

      // 1. Immediately persist to localStorage for zero-loss offline & local preview
      saveStoredOverride(entity.id, updatedFields, [decodedId, query, normalizeQuery(entity.name)]);
      
      const mergedEntity = { ...entity, ...updatedFields, isLocalOverride: true };
      setEntity(mergedEntity);
      setRatingScore(editRatingScore);
      setRatingGrade((editRatingGrade || 'C').trim());
      setRatingQuote((editRatingQuote || '').trim());
      setYearsActive(editYearsActive.trim());
      setAffiliations(editAffiliations.trim());
      setCoreFocus(editCoreFocus.trim());
      setKeyMilestones(editKeyMilestones.trim());
      setIsEditing(false);
      setIsLocalModified(true);

      // 2. Attempt remote sync to Cloudflare D1
      const token = await getToken();
      const fallbackToken = localStorage.getItem('adminToken');
      const authHeader = token ? `Bearer ${token}` : fallbackToken ? `Bearer ${fallbackToken}` : '';
      
      const res = await fetch('/api/entities', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify({ 
          id: entity.id, 
          ...updatedFields
        })
      });

      if (res.ok) {
        setToast({ 
          type: 'success', 
          message: 'Changes saved and published to archive database!' 
        });
      } else {
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        setToast({ 
          type: 'info', 
          message: isLocalHost
            ? 'Changes saved locally in your browser! (Preview active across all tabs & refreshes).'
            : 'Changes saved locally in your browser. (Live sync requires curator login).'
        });
      }
    } catch(e) {
      console.warn("Remote sync failed, saved locally:", e);
      setToast({ 
        type: 'info', 
        message: 'Changes saved locally in browser.' 
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 6000);
    }
  };

  const handleCancelEdit = () => {
    if (entity) {
      setEditDesc(entity.description || '');
      setEditImageUrl(entity.image_url || '');
      setEditRole(normalizeEntityRole(entity.role, entity.stance, entity.name));
      setEditRatingScore(ratingScore);
      setEditRatingGrade(ratingGrade);
      setEditRatingQuote(ratingQuote);
      setEditYearsActive(yearsActive);
      setEditAffiliations(affiliations);
      setEditCoreFocus(coreFocus);
      setEditKeyMilestones(keyMilestones);
      setEditTagline(entity.tagline || '');
      setEditUrl(entity.url || '');
      setEditLocation(entity.location || '');
      setEditContact(entity.contact_info || '');
      setEditStatus(entity.status || 'active');
    }
    setIsEditing(false);
  };

  const handleRevertLocal = () => {
    if (!entity) return;
    if (window.confirm(`Revert "${entity.name}" to archive default? Any local browser edits will be cleared.`)) {
      const decodedId = decodeURIComponent(id || '');
      const normalizeQuery = (str) => {
        if (!str) return '';
        return decodeURIComponent(str).toLowerCase().replace(/^(dr\.|dr|rev\.|prof\.)\s*/i, '').replace(/[-_]/g, ' ').replace(/[^\w\s]/g, '').trim();
      };
      const query = normalizeQuery(decodedId);
      clearStoredOverride(entity.id, [decodedId, query, normalizeQuery(entity.name)]);
      setIsLocalModified(false);
      fetchData();
      setToast({ type: 'info', message: 'Reverted to archive original.' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Filter documents based on the entity name
  const filteredDocs = documents.filter(doc => {
    if (!entity) return false;
    if (!doc.metadata_json) return false;
    try {
      const meta = safeParseJson(doc.metadata_json);
      const name = entity.name.toLowerCase();
      
      const orgs = Array.isArray(meta.organizations) ? meta.organizations : (typeof meta.organizations === 'string' ? [meta.organizations] : []);
      const people = Array.isArray(meta.key_people) ? meta.key_people : (typeof meta.key_people === 'string' ? [meta.key_people] : []);
      const authors = Array.isArray(meta.gemini_extracted_metadata?.authors) ? meta.gemini_extracted_metadata.authors : [];
      const geminiOrgs = Array.isArray(meta.gemini_extracted_metadata?.organizations) ? meta.gemini_extracted_metadata.organizations : [];
      const tags = Array.isArray(meta.tags) ? meta.tags : (typeof meta.tags === 'string' ? [meta.tags] : []);
      
      const allPeople = [...people, ...authors];
      const allOrgs = [...orgs, ...geminiOrgs];

      const inOrgs = allOrgs.some(o => typeof o === 'string' && o.toLowerCase() === name);
      const inPeople = allPeople.some(p => typeof p === 'string' && p.toLowerCase() === name);
      const inPub = typeof meta.source_publication === 'string' && meta.source_publication.toLowerCase() === name;
      const inTags = tags.some(t => typeof t === 'string' && t.toLowerCase() === name);
      
      return inOrgs || inPeople || inPub || inTags;
    } catch(e) { return false; }
  });

  const availableTypes = ['All', ...new Set(filteredDocs.map(d => (d.type || 'document').replace('_', ' ')))].sort();

  const getCleanTitle = (d, m) => {
    if (m && m.academic_title) return m.academic_title;
    if (m && m.gemini_extracted_metadata && m.gemini_extracted_metadata.title) return m.gemini_extracted_metadata.title;
    if (m && m.title) return m.title;
    let t = d.title || '';
    if (t.toLowerCase().endsWith('.pdf')) {
      t = t.replace(/\.pdf$/i, '').replace(/\[.*?\]/g, '').replace(/_/g, ' ').replace(/page (\d+)/i, '- Page $1').trim();
    }
    return t || 'Untitled Document';
  };

  const getTopics = () => {
    const topicsMap = {};
    filteredDocs.forEach(doc => {
      const meta = safeParseJson(doc.metadata_json);
      
      const words = [];
      if (meta.tags) words.push(...meta.tags);
      if (doc.subject) words.push(doc.subject);
      
      words.forEach(w => {
        if (!w) return;
        let clean = w.toLowerCase().trim();
        // Fuzzy dedup: map "circumcision harm" and "circumcision" to a single tag
        if (clean === 'circumcision harm' || clean === 'routine infant circumcision') clean = 'circumcision';
        if (clean === 'genital autonomy' || clean === 'genital integrity') clean = 'genital autonomy';
        if (clean.length > 3) {
          topicsMap[clean] = (topicsMap[clean] || 0) + 1;
        }
      });
    });
    
    return Object.entries(topicsMap)
      .filter(([topic, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);
  };
  const topTopics = getTopics();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ThinkingSpirograph text="Consulting the archive..." />
      </div>
    );
  }

  if (!entity) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)' }}>
        <h2 style={{ color: 'var(--c-textBright)' }}>Entity Not Found</h2>
        <p>This entity does not exist in the graph yet.</p>
        <Link to="/library" style={{ color: 'var(--c-goldBright)' }}>&larr; Return to Library</Link>
      </div>
    );
  }

  const getDocDate = (doc) => {
    try {
      const meta = safeParseJson(doc.metadata_json);
      return new Date(meta.date || '1900-01-01').getTime();
    } catch { return new Date('1900-01-01').getTime(); }
  };

  const authoredDocsList = [];
  const generalDocsList = [];

  filteredDocs.forEach(doc => {
    try {
      const meta = safeParseJson(doc.metadata_json);
      const name = entity?.name?.toLowerCase();
      let isAuthor = false;
      const authors = Array.isArray(meta.gemini_extracted_metadata?.authors) ? meta.gemini_extracted_metadata.authors : [];
      if (authors.some(a => typeof a === 'string' && a.toLowerCase() === name)) isAuthor = true;
      if (meta.author && typeof meta.author === 'string' && meta.author.toLowerCase().includes(name)) isAuthor = true;
      if (Array.isArray(meta.author) && meta.author.some(a => typeof a === 'string' && a.toLowerCase().includes(name))) isAuthor = true;
      
      if (isAuthor) authoredDocsList.push(doc);
      else generalDocsList.push(doc);
    } catch {
      generalDocsList.push(doc);
    }
  });

  // Calculate type tallies for general references
  const typeCounts = { All: generalDocsList.length };
  generalDocsList.forEach(doc => {
    const t = (doc.type || 'document').replace('_', ' ');
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Apply filters
  const searchedMentions = generalDocsList.filter(doc => {
    if (typeFilter !== 'All' && (doc.type || 'document').replace('_', ' ') !== typeFilter) return false;
    if (!mentionSearch) return true;
    return doc.title.toLowerCase().includes(mentionSearch.toLowerCase());
  });

  // Sort
  const sortedMentions = [...searchedMentions].sort((a, b) => {
    if (sortOption === 'newest') {
      return getDocDate(b) - getDocDate(a);
    } else if (sortOption === 'oldest') {
      return getDocDate(a) - getDocDate(b);
    } else if (sortOption === 'alpha') {
      const titleA = getCleanTitle(a, safeParseJson(a.metadata_json));
      const titleB = getCleanTitle(b, safeParseJson(b.metadata_json));
      return titleA.localeCompare(titleB);
    } else if (sortOption === 'type') {
      const tA = (a.type || 'document').replace('_', ' ');
      const tB = (b.type || 'document').replace('_', ' ');
      if (tA === tB) return getDocDate(b) - getDocDate(a);
      return tA.localeCompare(tB);
    }
    return 0;
  });

  // Apply search/sort for Authored works too
  const sortedAuthored = [...authoredDocsList]
    .filter(doc => !mentionSearch || doc.title.toLowerCase().includes(mentionSearch.toLowerCase()))
    .sort((a, b) => getDocDate(b) - getDocDate(a));

  const totalPages = Math.ceil(sortedMentions.length / itemsPerPage);
  const paginatedMentions = sortedMentions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate font sizes for word cloud
  const maxTopicCount = Math.max(...topTopics.map(t => t[1]), 1);
  const isTimHammond = (entity?.name || '').toLowerCase().includes('hammond');

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', color: 'var(--c-textBright)', display: 'flex', flexDirection: 'column' }} className="lux-glide-in">
      
      <div style={{ padding: '2rem 3rem 1rem 3rem' }}>
        <Link to="/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-dim)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }} className="lux-hover-lift">
          <ArrowLeft size={16} /> Back to Library
        </Link>
      </div>

      {/* Sticky Quick-Jump Profile Navigation */}
      <div className="profile-section-nav">
        <div className="profile-section-nav-inner">
          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('overview')}
          >
            <Compass size={13} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'dossier' ? 'active' : ''}`}
            onClick={() => scrollToSection('dossier')}
          >
            <Layers size={13} />
            <span>Dossier</span>
          </button>

          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'scorecard' ? 'active' : ''}`}
            onClick={() => scrollToSection('scorecard')}
          >
            <Scale size={13} />
            <span>Scorecard</span>
            <span className="profile-nav-badge">{ratingGrade}</span>
          </button>

          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'biography' ? 'active' : ''}`}
            onClick={() => scrollToSection('biography')}
          >
            <FileText size={13} />
            <span>Biography</span>
          </button>

          {isTimHammond && (
            <>
              <button
                type="button"
                className={`profile-nav-btn ${activeSection === 'milestones' ? 'active' : ''}`}
                onClick={() => scrollToSection('milestones')}
              >
                <Clock size={13} />
                <span>50-Yr Timeline</span>
                <span className="profile-nav-badge">{TIM_HAMMOND_MILESTONES.length}</span>
              </button>

              <button
                type="button"
                className={`profile-nav-btn ${activeSection === 'organizations' ? 'active' : ''}`}
                onClick={() => scrollToSection('organizations')}
              >
                <Landmark size={13} />
                <span>Initiatives</span>
                <span className="profile-nav-badge">{TIM_HAMMOND_ORGS.length}</span>
              </button>

              <button
                type="button"
                className={`profile-nav-btn ${activeSection === 'media' ? 'active' : ''}`}
                onClick={() => scrollToSection('media')}
              >
                <Film size={13} />
                <span>Documentary & Media</span>
                <span className="profile-nav-badge">{TIM_HAMMOND_VIDEOS.length}</span>
              </button>
            </>
          )}

          {authoredDocsList.length > 0 && (
            <button
              type="button"
              className={`profile-nav-btn ${activeSection === 'authored-works' ? 'active' : ''}`}
              onClick={() => scrollToSection('authored-works')}
            >
              <Award size={13} />
              <span>Authored Works</span>
              <span className="profile-nav-badge">{authoredDocsList.length}</span>
            </button>
          )}

          {topTopics.length > 0 && (
            <button
              type="button"
              className={`profile-nav-btn ${activeSection === 'expertise' ? 'active' : ''}`}
              onClick={() => scrollToSection('expertise')}
            >
              <Sparkles size={13} />
              <span>Research Topics</span>
            </button>
          )}

          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'archive-citations' ? 'active' : ''}`}
            onClick={() => scrollToSection('archive-citations')}
          >
            <BookOpen size={13} />
            <span>Archive Citations</span>
            <span className="profile-nav-badge">{filteredDocs.length}</span>
          </button>

          <button
            type="button"
            className={`profile-nav-btn ${activeSection === 'relational-graph' ? 'active' : ''}`}
            onClick={() => scrollToSection('relational-graph')}
          >
            <Network size={13} />
            <span>Relational Graph</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Area */}
      <div id="overview" style={{ position: 'relative', overflow: 'hidden', padding: '3rem 0 5rem 0', background: 'var(--c-bgSoft)', borderBottom: '1px solid var(--c-ghost)' }}>
        {/* Decorative Background Blur */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', filter: 'blur(120px)', opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1, display: 'flex', gap: '4rem', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Left Column: Photo */}
          <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              width: '100%', 
              aspectRatio: '1', 
              borderRadius: entity.type === 'person' ? '4px' : '4px',
              background: 'var(--c-bgSoft)',
              border: '1px solid var(--c-ghost)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {(entity.image_url && !imageError) ? (
                <img src={entity.image_url} alt={entity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageError(true)} />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: entity.role === 'champion' ? 'linear-gradient(135deg, var(--c-bgDeep), rgba(212, 160, 48, 0.2))' : 
                              entity.role === 'critic' ? 'linear-gradient(135deg, var(--c-bgDeep), rgba(180, 50, 50, 0.2))' : 
                              'linear-gradient(135deg, var(--c-bgDeep), rgba(60, 120, 200, 0.2))',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '4rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', opacity: 0.8, fontWeight: 'bold' }}>
                    {entity.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.2 }}>
                    {entity.type === 'organization' ? <Network size={48} /> : <Sparkles size={48} />}
                  </div>
                </div>
              )}
            </div>

            {/* Genital Autonomy Scorecard & Meme Rating Card */}
            <div id="scorecard" className="ground-truth-card" style={{ '--gt-accent': (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color }}>
              {/* Header */}
              <div className="ground-truth-header">
                <div className="ground-truth-label">
                  <Scale size={13} /> Genital Autonomy Scorecard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowRubric(!showRubric)}
                    className="rubric-toggle-btn"
                    title="View evaluation rubric & grade definitions"
                  >
                    <Info size={11} /> {showRubric ? 'Hide Rubric' : 'Rubric'}
                  </button>
                  <span 
                    className="ground-truth-badge-pill" 
                    style={{ 
                      color: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color,
                      borderColor: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color
                    }}
                  >
                    {(LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).shortLabel}
                  </span>
                </div>
              </div>

              {/* Collapsible Grading Rubric Panel */}
              {showRubric && (
                <div className="rubric-panel">
                  <div style={{ fontSize: '0.68rem', color: 'var(--c-goldBright)', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Evaluation Rubric (The Accidental Intactivist)
                  </div>
                  {GRADING_RUBRIC.map(item => (
                    <div key={item.grade} className="rubric-row">
                      <div className="rubric-grade-badge" style={{ background: item.bg, color: item.color, border: `1px solid ${item.border}` }}>
                        {item.grade}
                      </div>
                      <div className="rubric-text">
                        <strong>{item.level}</strong>
                        {item.criteria}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Meme Grade Stamp & Headline */}
              <div className="ground-truth-stamp-container">
                <div 
                  className="ground-truth-grade-stamp"
                  style={{
                    borderColor: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color,
                    color: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color,
                    boxShadow: `0 0 16px ${(LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).glow}`
                  }}
                >
                  <div className="stamp-grade">{isEditing ? editRatingGrade : ratingGrade}</div>
                  <div className="stamp-sub">VERDICT</div>
                </div>

                <div className="ground-truth-headline">
                  <div className="headline-lead">
                    {(isEditing ? editRatingGrade : ratingGrade).startsWith('A') || (isEditing ? editRatingGrade : ratingGrade).startsWith('B') ? 'Awarded an' : 'Given a'}{' '}
                    <strong style={{ color: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color }}>
                      {isEditing ? editRatingGrade : ratingGrade}
                    </strong>{' '}
                    grade
                  </div>
                  <div className="headline-source">by The Accidental Intactivist's Guide</div>
                </div>
              </div>

              {/* 5-Step Likert Meter */}
              <div className="likert-meter-container">
                <div className="likert-labels-top">
                  <span style={{ color: '#ef4444' }}>Pro-Cutting</span>
                  <span style={{ color: '#94a3b8' }}>Neutral</span>
                  <span style={{ color: '#facc15' }}>Pro-Autonomy</span>
                </div>

                <div className="likert-track">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const currentScore = isEditing ? editRatingScore : ratingScore;
                    const isActive = lvl === currentScore;
                    const isPast = lvl <= currentScore;
                    const config = LIKERT_RATINGS[lvl];
                    return (
                      <div
                        key={lvl}
                        className={`likert-step ${isActive ? 'active' : ''}`}
                        title={`${config.label} (${lvl}/5)`}
                        style={{
                          background: isActive
                            ? config.color
                            : isPast
                              ? `${config.color}66`
                              : 'rgba(255, 255, 255, 0.06)',
                          color: config.color,
                          cursor: isEditing ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (isEditing) {
                            setEditRatingScore(lvl);
                            setEditRatingGrade(config.defaultGrade);
                            setEditRatingQuote(config.defaultQuote);
                          }
                        }}
                      />
                    );
                  })}
                </div>

                <div 
                  className="likert-pointer-caption"
                  style={{ color: (LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).color }}
                >
                  <span>●</span>
                  <span>
                    {(LIKERT_RATINGS[isEditing ? editRatingScore : ratingScore] || LIKERT_RATINGS[3]).label}{' '}
                    ({isEditing ? editRatingScore : ratingScore}/5 on Autonomy Scale)
                  </span>
                </div>
              </div>

              {/* Quote / Commentary Box */}
              {!isEditing ? (
                <>
                  <div className="ground-truth-quote-box">
                    <p className="quote-text">
                      "{ratingQuote || (LIKERT_RATINGS[ratingScore] || LIKERT_RATINGS[3]).defaultQuote}"
                    </p>
                  </div>

                  <button
                    onClick={handleCopyMeme}
                    className="copy-meme-btn lux-hover-lift"
                    title="Copy viral quote & rating to clipboard"
                  >
                    {copiedMeme ? <Check size={14} style={{ color: '#10b981' }} /> : <Share2 size={14} />}
                    <span>{copiedMeme ? 'Meme Snippet Copied!' : 'Copy Meme Verdict'}</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  {/* Curate Likert Steps */}
                  <div>
                    <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-dim)', fontWeight: 'bold' }}>
                      Autonomy Scale Position:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginTop: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = editRatingScore === lvl;
                        const c = LIKERT_RATINGS[lvl];
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              setEditRatingScore(lvl);
                              setEditRatingGrade(c.defaultGrade);
                              setEditRatingQuote(c.defaultQuote);
                            }}
                            style={{
                              padding: '0.4rem 0.2rem',
                              borderRadius: '4px',
                              border: isSel ? `2px solid ${c.color}` : '1px solid rgba(255,255,255,0.1)',
                              background: isSel ? c.bg : 'rgba(0,0,0,0.3)',
                              color: isSel ? c.color : 'var(--c-dim)',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curate Grade */}
                  <div>
                    <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-dim)', fontWeight: 'bold' }}>
                      Letter Grade:
                    </label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {['A+', 'A', 'B+', 'C', 'C-', 'D', 'F'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditRatingGrade(g)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: editRatingGrade === g ? '1.5px solid var(--c-gold)' : '1px solid rgba(255,255,255,0.1)',
                            background: editRatingGrade === g ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0,0,0,0.25)',
                            color: editRatingGrade === g ? '#fbbf24' : 'var(--c-textBright)',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={editRatingGrade}
                        onChange={e => setEditRatingGrade(e.target.value.toUpperCase())}
                        placeholder="Custom"
                        style={{
                          width: '55px',
                          padding: '0.25rem 0.4rem',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--c-ghost)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}
                      />
                    </div>
                  </div>

                  {/* Curate Quote */}
                  <div>
                    <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-dim)', fontWeight: 'bold' }}>
                      Editorial Rationale / Meme Quote:
                    </label>
                    <textarea
                      value={editRatingQuote}
                      onChange={e => setEditRatingQuote(e.target.value)}
                      placeholder="e.g. He was given a C- grade by the Accidental Intactivist's Guide..."
                      rows={3}
                      style={{
                        width: '100%',
                        marginTop: '0.35rem',
                        padding: '0.5rem',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid var(--c-ghost)',
                        borderRadius: '6px',
                        color: 'var(--c-textBright)',
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Archive Dossier Card */}
            <div id="dossier" className="dossier-card" style={{ marginTop: '0.5rem' }}>
              <div className="dossier-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="dossier-title">Archival Dossier</div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--c-goldBright)', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(234, 179, 8, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                    {entity.type === 'person' ? 'Key Figure' : 'Organization'}
                  </span>
                </div>
                <div className="dossier-subtitle">Entity Specifications & Archival Provenance</div>
              </div>

              <div className="dossier-bar-thick" />

              {!isEditing ? (
                <>
                  <div className="dossier-row">
                    <span className="dossier-row-key">Years Active</span>
                    <span className="dossier-row-val">
                      {renderYearsActive(yearsActive || '1990s – Present')}
                    </span>
                  </div>

                  <div className="dossier-row">
                    <span className="dossier-row-key">Affiliations</span>
                    <span className="dossier-row-val">
                      {renderMetadataChips(affiliations || 'Independent Research', 'affiliation')}
                    </span>
                  </div>

                  <div className="dossier-row">
                    <span className="dossier-row-key">Research Domain</span>
                    <span className="dossier-row-val">
                      {renderMetadataChips(coreFocus || 'Genital Autonomy & Harm Research', 'search')}
                    </span>
                  </div>

                  <div className="dossier-row">
                    <span className="dossier-row-key">Key Milestones</span>
                    <span className="dossier-row-val">
                      {renderMetadataChips(keyMilestones || 'Cataloged Manuscripts & Surveys', 'milestones', scrollToSection)}
                    </span>
                  </div>

                  <div className="dossier-row">
                    <span className="dossier-row-key">Jurisdiction</span>
                    <span className="dossier-row-val">
                      {renderJurisdiction(entity.location || 'United States / International')}
                    </span>
                  </div>

                  <div className="dossier-bar-thin" />

                  <div className="dossier-row">
                    <span className="dossier-row-key">Archive Footprint</span>
                    <span className="dossier-row-val">
                      <button
                        type="button"
                        onClick={() => scrollToSection('archive-citations')}
                        className="dossier-chip dossier-chip-gold lux-hover-lift"
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Jump to cataloged document citations in archive"
                      >
                        <BookOpen size={12} style={{ color: 'var(--c-goldBright)' }} />
                        <span>{filteredDocs.length} Document Citations</span>
                      </button>
                    </span>
                  </div>

                  <div className="dossier-row">
                    <span className="dossier-row-key">Network Ties</span>
                    <span className="dossier-row-val">
                      <button
                        type="button"
                        onClick={() => scrollToSection('relational-graph')}
                        className="dossier-chip lux-hover-lift"
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Jump to relational network graph"
                      >
                        <Network size={12} style={{ color: '#38bdf8' }} />
                        <span>{entity.see_also_json ? (() => { try { return JSON.parse(entity.see_also_json).length; } catch { return 0; }})() : 0} Co-Mentioned Nodes</span>
                      </button>
                    </span>
                  </div>

                  {entity.name?.toLowerCase().includes('tim hammond') && (
                    <div className="dossier-row" style={{ borderBottom: 'none' }}>
                      <span className="dossier-row-key">Archival Repository</span>
                      <span className="dossier-row-val">
                        <Link
                          to="/collections/tim-hammond-archive"
                          className="dossier-chip dossier-chip-gold lux-hover-lift"
                          style={{ textDecoration: 'none', background: 'rgba(212, 160, 48, 0.18)', borderColor: 'var(--c-goldBright)', fontWeight: 'bold' }}
                          title="View Tim Hammond's 195,000+ item repository at UMass Amherst"
                        >
                          <Archive size={12} style={{ color: 'var(--c-goldBright)' }} />
                          <span>UMass MS 1205 Archive Exhibit &rarr;</span>
                        </Link>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-dim)', fontWeight: 'bold' }}>Years Active:</label>
                    <input
                      type="text"
                      value={editYearsActive}
                      onChange={e => setEditYearsActive(e.target.value)}
                      placeholder="e.g. 1976 – Present"
                      style={{ width: '100%', marginTop: '0.2rem', padding: '0.45rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--c-ghost)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-dim)', fontWeight: 'bold' }}>Key Organizations / Affiliations:</label>
                    <input
                      type="text"
                      value={editAffiliations}
                      onChange={e => setEditAffiliations(e.target.value)}
                      placeholder="e.g. GALDEF (Founder & President), NOHARMM..."
                      style={{ width: '100%', marginTop: '0.2rem', padding: '0.45rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--c-ghost)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-dim)', fontWeight: 'bold' }}>Research Domain / Focus:</label>
                    <input
                      type="text"
                      value={editCoreFocus}
                      onChange={e => setEditCoreFocus(e.target.value)}
                      placeholder="e.g. Circumcision Trauma, Survey Research..."
                      style={{ width: '100%', marginTop: '0.2rem', padding: '0.45rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--c-ghost)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-dim)', fontWeight: 'bold' }}>Landmark Milestones / Works:</label>
                    <input
                      type="text"
                      value={editKeyMilestones}
                      onChange={e => setEditKeyMilestones(e.target.value)}
                      placeholder="e.g. GALDEF (2022), Awakenings Survey (1993/1999)..."
                      style={{ width: '100%', marginTop: '0.2rem', padding: '0.45rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--c-ghost)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-dim)', fontWeight: 'bold' }}>Jurisdiction / Base:</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      placeholder="e.g. United States / International"
                      style={{ width: '100%', marginTop: '0.2rem', padding: '0.45rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--c-ghost)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              )}
            </div>


            {!isEditing && entity.type === 'organization' && (
              <div style={{ marginTop: '1.5rem', background: 'var(--c-bgDeep)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: entity.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : entity.status === 'defunct' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                    color: entity.status === 'active' ? '#10b981' : entity.status === 'defunct' ? '#ef4444' : '#9ca3af',
                    border: `1px solid ${entity.status === 'active' ? '#10b981' : entity.status === 'defunct' ? '#ef4444' : '#9ca3af'}`
                  }}>
                    {entity.status || 'unknown'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {entity.location && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Location</div>
                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.9rem' }}>{entity.location}</div>
                    </div>
                  )}
                  {entity.url && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Website</div>
                      <a href={entity.url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-blue)', fontSize: '0.9rem', textDecoration: 'none' }}>{entity.url}</a>
                    </div>
                  )}
                  {entity.contact_info && (
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-dim)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>Contact</div>
                      <div style={{ color: 'var(--c-textBright)', fontSize: '0.9rem' }}>{entity.contact_info}</div>
                    </div>
                  )}
                  {!entity.location && !entity.url && !entity.contact_info && (
                    <div style={{ color: 'var(--c-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>No directory information available.</div>
                  )}
                </div>
              </div>
            )}
            
            {isEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text"
                  placeholder="Image URL..."
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-gold)', borderRadius: '6px' }}
                />
                
                <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginTop: '0.5rem' }}>Or search Wikipedia:</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={searchQuery || (entity ? `${entity.name} ${topTopics.slice(0,2).map(t=>t[0]).join(' ')}`.trim() : '')}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search keywords..."
                    style={{ flex: 1, padding: '0.5rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => handleSearchWikipediaImage(searchQuery || (entity ? `${entity.name} ${topTopics.slice(0,2).map(t=>t[0]).join(' ')}`.trim() : ''))}
                    disabled={isSearchingImage}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-bgSoft)', border: '1px solid var(--c-ghost)', color: 'var(--c-textBright)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Search size={14} /> {isSearchingImage ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {wikiImageResult && !wikiImageResult.error && (
                  <div className="lux-glide-in" style={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-blue)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-dim)', marginBottom: '0.5rem' }}>Found image for "{wikiImageResult.title}"</div>
                    <img src={wikiImageResult.url} alt="Preview" style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem', maxHeight: '150px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-textBright)', marginBottom: '0.5rem' }}>Is this the correct person/org?</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditImageUrl(wikiImageResult.url); setWikiImageResult(null); }} className="lux-hover-lift" style={{ flex: 1, background: 'var(--c-blue)', color: 'var(--c-bg)', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Yes</button>
                      <button onClick={() => setWikiImageResult(null)} className="lux-hover-lift" style={{ flex: 1, background: 'var(--c-bgSoft)', color: 'var(--c-text)', border: '1px solid var(--c-ghost)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>No</button>
                    </div>
                  </div>
                )}
                {wikiImageResult && wikiImageResult.error && (
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                    {wikiImageResult.error}
                  </div>
                )}

                {entity?.type === 'organization' && (
                  <>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--c-ghost)', paddingTop: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Organization Status:</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                      >
                        <option value="active">Active</option>
                        <option value="defunct">Defunct / Inactive</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>

                    <input 
                      type="text"
                      placeholder="Location (e.g. San Francisco, CA)..."
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />

                    <input 
                      type="text"
                      placeholder="Website URL..."
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />

                    <input 
                      type="text"
                      placeholder="Contact Info (Email/Phone)..."
                      value={editContact}
                      onChange={e => setEditContact(e.target.value)}
                      style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', borderRadius: '6px' }}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div style={{ flex: '1 1 500px' }}>
            <div className="analog-band-cool" style={{ height: '4px', width: '60px', marginBottom: '1.5rem', borderRadius: '2px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--c-goldBright)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {entity.type === 'person' ? 'Key Figure' : 'Organization'}
              </div>
              <span className={`alignment-banner alignment-banner-${entity.role || 'notable'}`}>
                {entity.role === 'champion' ? '✦ Champion' : entity.role === 'critic' ? '⚡ Critic' : '◆ Notable'}
              </span>
              <span 
                style={{
                  background: (LIKERT_RATINGS[ratingScore] || LIKERT_RATINGS[3]).bg,
                  color: (LIKERT_RATINGS[ratingScore] || LIKERT_RATINGS[3]).color,
                  border: `1px solid ${(LIKERT_RATINGS[ratingScore] || LIKERT_RATINGS[3]).border}`,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Scale size={13} /> Autonomy: {ratingGrade}
              </span>

              {isAdmin && isLocalModified && (
                <span style={{
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Sparkles size={12} /> Local Edits Active
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ margin: 0, fontSize: '3.5rem', fontFamily: 'var(--f-display)', letterSpacing: '-0.02em', color: 'var(--c-textBright)', lineHeight: 1.1 }}>
                {entity.name}
              </h1>
              
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {isLocalModified && !isEditing && (
                    <button
                      onClick={handleRevertLocal}
                      className="lux-hover-lift"
                      title="Revert local browser edits to archive original"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '600'
                      }}
                    >
                      <RotateCcw size={14} /> Revert to Default
                    </button>
                  )}
                  {isEditing && (
                    <button 
                      onClick={handleGenerateBio} 
                      disabled={isGenerating || isSaving}
                      className="lux-hover-lift"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-blue)', color: 'var(--c-bg)', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', cursor: isGenerating ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem', opacity: isGenerating ? 0.7 : 1 }}
                    >
                      <Sparkles size={16} className={isGenerating ? "spin-slow" : ""} /> {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
                    </button>
                  )}
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="lux-hover-lift"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-bgSoft)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleSaveBio} 
                        disabled={isSaving}
                        className="lux-hover-lift"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-gold)', color: 'var(--c-bgDeep)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: isSaving ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem', opacity: isSaving ? 0.75 : 1 }}
                      >
                        {isSaving ? <Sparkles size={16} className="spin-slow" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={handleCancelEdit} 
                        disabled={isSaving}
                        className="lux-hover-lift"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Tagline */}
            {!isEditing && entity.tagline && (
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--c-muted)', fontStyle: 'italic', margin: '0 0 1.5rem 0' }}>
                {entity.tagline}
              </p>
            )}

            {/* Featured Archive Banner if Tim Hammond */}
            {entity.name && entity.name.toLowerCase().includes('hammond') && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 160, 48, 0.15) 0%, rgba(14, 18, 32, 0.95) 100%)',
                border: '1.5px solid rgba(250, 204, 21, 0.4)',
                borderRadius: '12px',
                padding: '1.1rem 1.4rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: '#facc15', color: '#000', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                    <Archive size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#facc15', fontWeight: '800' }}>
                      Primary Provenance Collection
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                      The Tim Hammond Genital Autonomy Archive (UMass MS 1205)
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      157 cataloged manuscripts, AWAKENINGS survey microdata, and international legal briefs.
                    </div>
                  </div>
                </div>
                <Link 
                  to="/collections/tim-hammond-archive"
                  className="lux-hover-lift"
                  style={{
                    background: '#facc15',
                    color: '#000',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Explore Collection &rarr;
                </Link>
              </div>
            )}

            {/* Quick Stats Ribbon */}
            <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem 0', borderTop: '1px solid var(--c-ghost)', borderBottom: '1px solid var(--c-ghost)', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Archive Mentions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>{filteredDocs.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Network Nodes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)' }}>
                  {entity.see_also_json ? (() => { try { return JSON.parse(entity.see_also_json).length; } catch { return 0; }})() : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-dim)', marginBottom: '0.25rem' }}>Entity Class</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-textBright)', fontFamily: 'var(--f-display)', textTransform: 'capitalize' }}>
                  {entity.type}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {/* Role selector */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--c-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                    Alignment / Role:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'champion', label: '✦ Champion', color: 'var(--c-goldBright)', bg: 'rgba(232, 184, 64, 0.2)' },
                      { id: 'notable', label: '◆ Notable', color: 'var(--c-muted)', bg: 'rgba(160, 160, 160, 0.15)' },
                      { id: 'critic', label: '⚡ Critic', color: 'var(--c-ltBlue)', bg: 'rgba(120, 144, 180, 0.2)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setEditRole(tab.id);
                          if (tab.id === 'champion' && editRatingScore < 4) {
                            setEditRatingScore(5);
                            setEditRatingGrade('A+');
                            setEditRatingQuote(LIKERT_RATINGS[5].defaultQuote);
                          } else if (tab.id === 'critic' && editRatingScore > 2) {
                            setEditRatingScore(1);
                            setEditRatingGrade('F');
                            setEditRatingQuote(LIKERT_RATINGS[1].defaultQuote);
                          } else if (tab.id === 'notable' && (editRatingScore === 1 || editRatingScore === 5)) {
                            setEditRatingScore(3);
                            setEditRatingGrade('C');
                            setEditRatingQuote(LIKERT_RATINGS[3].defaultQuote);
                          }
                        }}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          border: editRole === tab.id ? `2px solid ${tab.color}` : '1px solid var(--c-ghost)',
                          background: editRole === tab.id ? tab.bg : 'var(--c-bgDeep)',
                          color: editRole === tab.id ? tab.color : 'var(--c-dim)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="lux-hover-lift"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entity Checker Bar */}
                <div className="entity-checker-bar">
                  <div className="entity-checker-header">
                    <div className="entity-checker-title">
                      <Sparkles size={14} /> Entity Scanner ({detectedEntities.length} Detected in Text)
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const tags = scanBioForEntities(editDesc, allEntitiesList, entity.name);
                          setDetectedEntities(tags);
                          setToast({ type: 'info', message: `Found ${tags.length} archive entities in biography text.` });
                          setTimeout(() => setToast(null), 3000);
                        }}
                        className="lux-hover-lift"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Rescan Text
                      </button>
                      {detectedEntities.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const existingNodes = entity.see_also_json ? JSON.parse(entity.see_also_json) : [];
                              const existingNames = new Set(existingNodes.map(n => n.name?.toLowerCase()));
                              const newNodes = [...existingNodes];
                              detectedEntities.forEach(tag => {
                                if (!existingNames.has(tag.name.toLowerCase())) {
                                  newNodes.push({ name: tag.name, type: 'entity', shared_docs: tag.count, score: 10 });
                                  existingNames.add(tag.name.toLowerCase());
                                }
                              });
                              setEntity({ ...entity, see_also_json: JSON.stringify(newNodes) });
                              setToast({ type: 'success', message: `Synced ${detectedEntities.length} entities to Network Relationships!` });
                              setTimeout(() => setToast(null), 4000);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="lux-hover-lift"
                          style={{
                            background: 'var(--c-blue)',
                            border: 'none',
                            color: '#000',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          + Sync to Network Graph
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {detectedEntities.length > 0 ? (
                      detectedEntities.map(tag => (
                        <span key={tag.name} className="entity-tag-pill" title={`${tag.count} mention(s) in bio`}>
                          <Sparkles size={11} style={{ color: 'var(--c-goldBright)' }} />
                          {tag.name}
                          <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>&times;{tag.count}</span>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--c-dim)', fontStyle: 'italic' }}>
                        Type or generate a biography to automatically detect and tag referenced entities.
                      </span>
                    )}
                  </div>
                </div>

                {/* Tagline input */}
                <input
                  type="text"
                  placeholder="Short tagline (e.g., 'Founder of NOCIRC')..."
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--c-gold)', borderRadius: '6px', color: 'var(--c-textBright)', fontSize: '1rem', fontStyle: 'italic' }}
                />
                {/* Bio textarea */}
                <textarea 
                  value={editDesc}
                  onChange={(e) => {
                    setEditDesc(e.target.value);
                  }}
                  style={{ width: '100%', height: '220px', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--c-goldBright)', borderRadius: '8px', color: 'var(--c-textBright)', fontSize: '1.1rem', lineHeight: '1.8', fontFamily: 'var(--f-body)', resize: 'vertical' }}
                />
              </div>
            ) : (
              <div id="biography">
                {entity.description ? (
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--c-textBright)', marginBottom: '2rem', textWrap: 'pretty', columns: '1', columnGap: '2rem' }} className="profile-markdown">
                    <AutoEntityLinker text={entity.description} exclude={[entity.name, ...(entity.aliases || [])]} />
                  </div>
                ) : (
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--c-dim)', marginBottom: '2rem', fontStyle: 'italic' }}>
                    No biography provided yet.
                  </p>
                )}

                {isTimHammond && !entity.description?.toLowerCase().includes('why the name change') && (
                  <div className="name-change-callout">
                    <div className="name-change-title">
                      <ShieldAlert size={16} /> Historical Context: Why the Name Change? (Born Tim Sally)
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--c-textBright)' }}>
                      In the late 1980s, when Tim (under his birth name Tim Sally) began publicly denouncing infant male circumcision as a human rights violation, opponents would search for his phone number and address in the San Francisco telephone book. They constantly phoned and wrote to harass him with unfounded charges that he was "antisemitic" or a "pervert" for being "interested in little boys' penises." Tim adopted the surname of his first partner to shield his personal life from such reactionaries.
                    </p>
                  </div>
                )}
              </div>
            )}


            {entity.url && (
              <a href={entity.url} target="_blank" rel="noreferrer" className="lux-hover-lift" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--c-blue)', padding: '0 0', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Globe size={16} /> Reference &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Constrained) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
      
        {/* Tim Hammond 50-Year Movement Arc & Milestones */}
        {isTimHammond && (
          <div id="milestones" className="timeline-section-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', fontSize: '1.6rem', fontFamily: 'var(--f-display)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={22} style={{ color: 'var(--c-goldBright)' }} />
                  50-Year Movement Arc & Archival Milestones (1976 – 2025)
                </h3>
                <p style={{ margin: 0, color: 'var(--c-dim)', fontSize: '0.92rem' }}>
                  A comprehensive chronology of grassroots civil rights, landmark empirical surveys, legal defense fund leadership, and institutional archive donations.
                </p>
              </div>

              {/* Era Filter Buttons */}
              <div className="timeline-era-filters">
                {[
                  { id: 'all', label: 'All Decades (28)' },
                  { id: 'early', label: '1970s–80s Early Activism' },
                  { id: 'noharmm', label: '1990s NOHARMM & Awakenings' },
                  { id: 'global_survey', label: '2000s–10s Global Harm Survey' },
                  { id: 'surveys_galdef', label: '2020s GALDEF & UMass Archives' }
                ].map(era => (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => setSelectedEra(era.id)}
                    className={`timeline-era-btn ${selectedEra === era.id ? 'active' : ''}`}
                  >
                    {era.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Track */}
            <div className="timeline-track">
              {TIM_HAMMOND_MILESTONES
                .filter(m => selectedEra === 'all' || m.era === selectedEra)
                .map((m, idx) => (
                  <div key={idx} className="timeline-node">
                    <span className="timeline-year-pill">
                      <Calendar size={11} style={{ marginRight: '0.3rem' }} />
                      {m.year}
                    </span>
                    <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1.15rem', color: 'var(--c-textBright)', fontWeight: '700', lineHeight: 1.4 }}>
                      {m.title}
                    </h4>
                    <p style={{ margin: '0 0 0.85rem', color: 'var(--c-dim)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {m.description}
                    </p>
                    {m.links && m.links.length > 0 && (
                      <div className="timeline-links-wrap">
                        {m.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="timeline-link-btn lux-hover-lift"
                            title={`Open ${link.label}`}
                          >
                            {link.type === 'video' ? <Play size={11} style={{ color: '#ef4444' }} /> :
                             link.type === 'audio' ? <Radio size={11} style={{ color: '#38bdf8' }} /> :
                             link.type === 'pdf' ? <FileText size={11} style={{ color: '#facc15' }} /> :
                             <ExternalLink size={11} />}
                            <span>{link.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tim Hammond Key Organizations & Initiatives */}
        {isTimHammond && (
          <div id="organizations" style={{ marginBottom: '4rem' }}>
            <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', fontSize: '1.5rem', fontFamily: 'var(--f-display)', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.75rem' }}>
              <Landmark size={20} style={{ color: 'var(--c-goldBright)' }} />
              Key Organizations, Coalitions & Archives
            </h3>
            <p style={{ color: 'var(--c-dim)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              Institutional vehicles founded, co-founded, or preserved to defend child bodily autonomy and advance empirical microdata.
            </p>
            <div className="org-grid">
              {TIM_HAMMOND_ORGS.map((org, idx) => (
                <div key={idx} className="org-card lux-hover-lift" style={{ borderLeft: `3px solid ${org.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div className="org-years">{org.years}</div>
                    <span className="org-status-badge">{org.status}</span>
                  </div>
                  <h4 className="org-title">{org.name}</h4>
                  <div className="org-role">{org.role}</div>
                  <p className="org-desc">{org.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    {org.internalLink && (
                      <Link
                        to={org.internalLink}
                        className="timeline-link-btn lux-hover-lift"
                        style={{ background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#facc15' }}
                      >
                        <Compass size={11} /> Profile &rarr;
                      </Link>
                    )}
                    {org.url && (
                      <a
                        href={org.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="timeline-link-btn lux-hover-lift"
                      >
                        <ExternalLink size={11} /> Website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tim Hammond Documentary & Media Record */}
        {isTimHammond && (
          <div id="media" style={{ marginBottom: '4rem' }}>
            <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', fontSize: '1.5rem', fontFamily: 'var(--f-display)', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.75rem' }}>
              <Film size={20} style={{ color: 'var(--c-goldBright)' }} />
              Documentary, Conference Presentations & Broadcast Media
            </h3>
            <p style={{ color: 'var(--c-dim)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              Historical television interviews, full-length documentaries in the Library of Congress, and international symposium addresses.
            </p>
            <div className="media-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {TIM_HAMMOND_VIDEOS.map((vid, idx) => (
                <MediaEmbed
                  key={idx}
                  url={vid.url}
                  title={vid.title}
                  host={vid.host}
                  year={vid.year}
                  aspectRatio="16/9"
                />
              ))}
            </div>
          </div>
        )}

        {/* Key Expertise / Topics */}
        {topTopics.length > 0 && (
          <div id="expertise" style={{ marginBottom: '4rem' }}>
            <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', fontSize: '1.4rem', fontFamily: 'var(--f-display)', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.75rem' }}>
            Domain Expertise
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topTopics.map(([topic, count]) => {
              const weight = count / maxTopicCount;
              return (
                <button 
                  key={topic} 
                  onClick={() => {
                    setMentionSearch(topic);
                    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
                  }}
                  className="lux-hover-lift"
                  style={{ 
                    background: weight > 0.5 ? 'var(--c-blue)' : 'var(--c-bgSoft)',
                    color: weight > 0.5 ? 'var(--c-bg)' : 'var(--c-textBright)',
                    border: `1px solid ${weight > 0.5 ? 'var(--c-blue)' : 'var(--c-ghost)'}`,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: weight > 0.5 ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {topic}
                  <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* See Also — PMI-ranked co-occurring entities */}
      {entity.see_also_json && (() => {
        try {
          const seeAlso = safeParseJson(entity.see_also_json, []);
          if (!seeAlso || seeAlso.length === 0) return null;

          const generateSlugLocal = (name) => {
            if (!name) return '';
            const cleanName = name.replace(/,\s*[a-zA-Z\.]+$/, '');
            const parts = cleanName.trim().split(/\s+/);
            if (parts.length >= 2 && parts.length <= 4) {
              const last = parts.pop();
              return `${last}_${parts.join('_')}`;
            }
            return cleanName.replace(/\s+/g, '_');
          };

          return (
            <div id="network-entities" style={{ marginBottom: '4rem' }}>
              <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontFamily: 'var(--f-display)' }}>
                <Network size={20} /> See Also
              </h3>
              <p style={{ color: 'var(--c-dim)', margin: '-0.5rem 0 1.5rem', fontSize: '0.9rem' }}>
                Entities that frequently appear alongside {entity.name} in the archive
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {seeAlso.map((sa, idx) => (
                  <Link
                    key={sa.name}
                    to={`/to/${generateSlugLocal(sa.name)}`}
                    className="lux-hover-lift lux-lens"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--c-textBright)', fontFamily: 'var(--f-body)', fontWeight: 'bold' }}>
                      {sa.name}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--c-dim)', marginTop: 'auto', borderTop: '1px solid var(--c-ghost)', paddingTop: '0.75rem' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared Docs: {sa.shared_docs}</span>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>PMI: {sa.score}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      {/* Authored Works Section */}
      {authoredDocsList.length > 0 && (
        <div id="authored-works" style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', fontSize: '1.5rem', fontFamily: 'var(--f-display)', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '0.5rem' }}>
            Authored Works
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[...authoredDocsList].sort((a, b) => getDocDate(b) - getDocDate(a)).map(doc => {
              const meta = safeParseJson(doc.metadata_json);
              const title = getCleanTitle(doc, meta);
              const date = meta.date || 'n.d.';
              const pub = meta.source_publication ? `${meta.source_publication} — ` : '';
              
              return (
                <Link
                  to={`/library/${generateFriendlySlug(doc, meta)}`}
                  key={`authored-${doc.id}`}
                  className="lux-hover-lift"
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '1rem',
                    background: 'var(--c-bgSoft)',
                    borderLeft: '3px solid var(--c-gold)',
                    padding: '1rem 1.5rem',
                    borderRadius: '0 8px 8px 0',
                    textDecoration: 'none',
                    color: 'var(--c-textBright)'
                  }}
                >
                  <span style={{ color: 'var(--c-dim)', fontFamily: 'var(--f-mono)', fontSize: '0.85rem', width: '80px', flexShrink: 0 }}>{date}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontStyle: pub ? 'italic' : 'normal', opacity: pub ? 0.8 : 1 }}>{pub}</span>
                    <strong style={{ fontFamily: 'var(--f-body)', fontSize: '1.05rem' }}>{title}</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--c-blue)', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                    {doc.type ? doc.type.replace('_', ' ') : 'Document'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* General Archive References */}
      <div id="archive-citations">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em', fontSize: '1.8rem', fontFamily: 'var(--f-display)' }}>
              Archive References
            </h3>
            <p style={{ margin: 0, color: 'var(--c-dim)' }}>{generalDocsList.length} documents connected to {entity.name}</p>
          </div>
        </div>
        
        {/* Document Type Summary Bar */}
        {generalDocsList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {Object.entries(typeCounts).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="lux-hover-lift"
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: `1px solid ${typeFilter === type ? 'var(--c-blue)' : 'var(--c-ghost)'}`,
                  background: typeFilter === type ? 'var(--c-blue)' : 'var(--c-bgDeep)',
                  color: typeFilter === type ? 'var(--c-bg)' : 'var(--c-textBright)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span style={{ textTransform: 'capitalize', fontWeight: typeFilter === type ? 'bold' : 'normal' }}>{type}</span>
                <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Sticky Full-Width Search & Sort Bar */}
        <div style={{ 
          position: 'sticky', 
          top: '80px', 
          zIndex: 10, 
          background: 'rgba(10, 10, 10, 0.85)', 
          backdropFilter: 'blur(10px)', 
          padding: '1rem 0', 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--c-ghost)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text"
              placeholder="Search within documents..."
              value={mentionSearch}
              onChange={(e) => setMentionSearch(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontSize: '1rem' }}
            />
            {mentionSearch && <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)', fontSize: '0.8rem' }}>Showing {searchedMentions.length} matches</div>}
          </div>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', background: 'var(--c-bgDeep)', color: 'var(--c-textBright)', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alpha">Alphabetical</option>
            <option value="type">By Type</option>
          </select>
        </div>

        <div style={{ marginBottom: '4rem' }}>
          {searchedMentions.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-dim)', background: 'var(--c-bgSoft)', borderRadius: '12px', border: '1px dashed var(--c-ghost)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ transform: 'scale(0.6)', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ThinkingSpirograph /></div>
              <p style={{ maxWidth: '400px', lineHeight: '1.6', fontSize: '1.1rem', margin: 0 }}>
                We're still indexing the archive. Check back soon — or help by tagging documents that mention this person.
              </p>
              <Link to="/library" className="lux-hover-lift" style={{ marginTop: '1rem', display: 'inline-block', background: 'var(--c-gold)', color: 'var(--c-bgDeep)', padding: '0.8rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                Explore the Digital Library
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {paginatedMentions.map(doc => {
                  const meta = safeParseJson(doc.metadata_json);
                  const title = getCleanTitle(doc, meta);
                  const date = meta.date || 'n.d.';
                  
                  return (
                    <Link 
                      to={`/library/${generateFriendlySlug(doc, meta)}`} 
                      key={doc.id}
                      className="lux-hover-lift"
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        background: 'var(--c-bgCard)', 
                        border: '1px solid var(--c-ghost)', 
                        borderRadius: '12px', 
                        padding: '1.5rem', 
                        textDecoration: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ color: 'var(--c-blue)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold', marginBottom: '1rem' }}>
                        {doc.type ? doc.type.replace('_', ' ') : 'Document'}
                      </div>
                      
                      <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--c-textBright)', lineHeight: 1.4, fontFamily: 'var(--f-body)', fontWeight: 'bold' }}>
                        {title}
                      </h4>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-ghost)', paddingTop: '1rem' }}>
                        <span style={{ color: 'var(--c-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{date}</span>
                        <span style={{ color: 'var(--c-dim)' }}>
                          <ArrowLeft size={14} style={{ transform: 'rotate(135deg)' }} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-bgDeep)', color: currentPage === 1 ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: currentPage === 1 ? 'default' : 'pointer' }}
                  >
                    &larr; Prev
                  </button>
                  <div style={{ color: 'var(--c-dim)', fontSize: '0.9rem', fontFamily: 'var(--f-condensed)' }}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="lux-hover-lift"
                    style={{ background: 'var(--c-bgDeep)', color: currentPage === totalPages ? 'var(--c-dim)' : 'var(--c-textBright)', border: '1px solid var(--c-ghost)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Influence Network at bottom */}
      <div id="relational-graph" ref={graphRef} style={{ marginBottom: '4rem', background: 'var(--c-bgDeep)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
        <h3 style={{ color: 'var(--c-textBright)', margin: '0 0 1.5rem 0', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--f-display)' }}>
          <Network size={20} color="var(--c-goldBright)" /> Relational Graph
        </h3>
        <div style={{ height: '500px', width: '100%', background: 'var(--c-bgDeep)', borderRadius: '8px', border: '1px solid var(--c-ghost)', overflow: 'hidden' }}>
          {isGraphVisible ? (
            <EntityNetworkGraph focusEntityId={entity.id} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--c-dim)' }}>
              Loading graph...
            </div>
          )}
        </div>
      </div>
      
      </div>
      
      {/* Floating Save / Info Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '5rem',
          zIndex: 9999,
          background: toast.type === 'success' ? '#064e3b' : toast.type === 'error' ? '#7f1d1d' : '#0f172a',
          border: `1.5px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#38bdf8'}`,
          color: '#f8fafc',
          padding: '0.9rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          fontSize: '0.88rem',
          maxWidth: '460px',
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {toast.type === 'success' ? <Check size={18} color="#34d399" /> : toast.type === 'error' ? <AlertCircle size={18} color="#f87171" /> : <Sparkles size={18} color="#7dd3fc" />}
          <span style={{ flex: 1, lineHeight: 1.45, fontWeight: 500 }}>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="lux-hover-lift"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--c-bgDeep)',
          color: 'var(--c-textBright)',
          border: '1px solid var(--c-ghost)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          opacity: showTopBtn ? 1 : 0,
          pointerEvents: showTopBtn ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, transform 0.2s ease'
        }}
        aria-label="Scroll to top"
      >
        <ArrowLeft size={24} style={{ transform: 'rotate(90deg)' }} />
      </button>
    </div>
  );
}
