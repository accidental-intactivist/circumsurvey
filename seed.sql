INSERT INTO archive_documents (id, title, source_collection, type, status, url, metadata_json) 
VALUES (
  'awakenings-dataset', 
  'The Awakenings Survey Data', 
  'NOHARMM', 
  'dataset', 
  'ingested', 
  '/archive', 
  '{"author":"NOHARMM","abstract":"The foundational quantitative and qualitative dataset containing responses from men reporting harm from infant circumcision. This data was collected by the National Organization to Halt the Abuse and Routine Mutilation of Males."}'
);

INSERT INTO entities (id, type, name, slug, tagline, stance, featured, bio, image_url)
VALUES (
  'entity-tone-pettit',
  'person',
  'Tone Pettit',
  'tone-pettit',
  'Lead Researcher, The Accidental Intactivist',
  'champion',
  1,
  'Seattle-based independent researcher and author of the CircumSurvey Phase 1 Findings. Known for rigorous data journalism focusing on exposing the cognitive dissonance and "pleasure gap" of routine infant circumcision.',
  '/tone-headshot.jpg'
);

INSERT INTO entities (id, type, name, slug, tagline, stance, featured, bio)
VALUES (
  'entity-accidental-intactivist',
  'organization',
  'The Accidental Intactivist',
  'the-accidental-intactivist',
  'Investigative Archive & Advocacy Platform',
  'champion',
  1,
  'The Accidental Intactivist is a platform and pseudonym used to document, investigate, and daylight the realities of routine infant circumcision, leaning heavily on evidence-based research and the central question: "Why isn''t this weird to more of us?"'
);

INSERT INTO entities (id, type, name, slug, tagline, stance, featured, bio)
VALUES (
  'entity-friends-frenulum',
  'organization',
  'r/FriendsoftheFrenulum',
  'r-friendsofthefrenulum',
  'Subreddit Community',
  'champion',
  1,
  'A supportive and educational Reddit community dedicated to discussing genital autonomy, the functions of the prepuce and frenulum, and advocating for the bodily integrity of all children.'
);
