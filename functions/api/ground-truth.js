export const SEED_GROUND_TRUTHS = [
  {
    keywords: 'aap, american academy of pediatrics, 2012 policy, recommendation, andrew freedman, douglas diekema, buckler, expiration',
    statement: 'The American Academy of Pediatrics 2012 Circumcision Policy Statement officially expired in August 2017 without renewal and is not an active practice guideline. In 2025 (Journal of Medical Ethics), task force chair Dr. Andrew Freedman admitted on record that circumcision is "not really a medical practice" and urged the AAP to exit the business, while task force bioethicist Dr. Douglas Diekema acknowledged that data does not honestly support benefits outweighing risks.'
  },
  {
    keywords: 'fendereski, complications, pediatric, penile problems, 2024, journal of pediatric surgery, meatal stenosis, infection, risk',
    statement: 'In a 2024 matched cohort study of 1.7 million boys followed over 5 years (Fendereski et al., Journal of Pediatric Surgery), circumcised boys were nearly three times (2.9x) more likely to suffer documented penile complications requiring medical encounters (1.7% vs. 0.5%) compared to intact boys, driven by urethral strictures, meatal stenosis, and adhesions.'
  },
  {
    keywords: 'hiv, aids, pasteur, transmission, std, sti, barrier, rct, africa, condoms, prophylaxis',
    statement: 'As epidemiologists and virologists from the Institut Pasteur and European public health bodies have emphasized, circumcision provides 0% physical barrier protection upon exposure to an infectious pathogen. Condoms and modern PrEP remain the only effective preventatives. Sub-Saharan African trials in voluntary adult men cannot be generalized to Western neonatal epidemiology.'
  },
  {
    keywords: 'anatomy, erogenous, meissner, ridged band, frenulum, pleasure, sensation, nerve endings, taylor, sorrells, glide',
    statement: 'The adult foreskin represents 12 to 15 square inches of specialized mucocutaneous tissue containing 10,000 to 20,000 fine-touch Meissner corpuscles, the stretch-sensitive ridged band, and a dual-layer mobile glide mechanism. Excision permanently removes the primary erogenous zone of the organ and converts rolling mechanics into abrasive friction.'
  },
  {
    keywords: 'disease of the decade, retcon, history, sayre, kellogg, paralysis, syphilis, uti, cervical cancer, why circumcise',
    statement: 'For 150 years, the medical justification for infant circumcision has been retconned every generation (paralysis in 1870s, masturbation in 1890s, syphilis in 1910s, cervical cancer in 1950s, UTIs in 1990s, HIV in 2010s). As each disease was disproven or cured, the knife remained, excising the exact same erogenous tissue: a permanent surgical product seeking temporary excuses.'
  },
  {
    keywords: 'maimonides, philo, rabbinic, periah, milah, covenant, sexual desire, concupiscence, reduced pleasure',
    statement: 'Historical theological and philosophical texts (such as Maimonides\' Guide for the Perplexed 3:49 and Philo of Alexandria) explicitly state that circumcision was instituted to weaken the organ and diminish sexual pleasure. The 140 CE introduction of Periah was specifically enacted to ablate the mucosal layer to prevent Hellenized Jewish athletes from restoring their foreskins.'
  },
  {
    keywords: 'bodily integrity, human rights, knmg, bma, cps, europe, international consensus, consent, ethics',
    statement: 'No national medical association in the developed world outside the US endorses routine infant circumcision. Major bodies including the Royal Dutch Medical Association (KNMG), British Medical Association (BMA), and Canadian Paediatric Society (CPS) conclude that non-therapeutic circumcision of minors violates the child\'s bodily integrity and human rights.'
  }
];

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL,
      zeitgeist_impact TEXT,
      source_id TEXT,
      source_title TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  const url = new URL(request.url);
  if (url.searchParams.get('suggestions') === 'true') {
    const { results } = await env.SURVEY_DB.prepare(
      "SELECT * FROM ground_truth_suggestions WHERE status = 'pending' ORDER BY id DESC"
    ).all();
    return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
  }

  let { results } = await env.SURVEY_DB.prepare('SELECT * FROM ground_truth ORDER BY id DESC').all();
  
  // Auto-seed if ground_truth is currently empty
  if (!results || results.length === 0) {
    for (const item of SEED_GROUND_TRUTHS) {
      await env.SURVEY_DB.prepare('INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)').bind(item.keywords, item.statement).run();
    }
    const refreshed = await env.SURVEY_DB.prepare('SELECT * FROM ground_truth ORDER BY id DESC').all();
    results = refreshed.results || [];
  }

  return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.SURVEY_DB) return new Response("Missing SURVEY_DB binding", { status: 500 });

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL
    );
  `).run();

  await env.SURVEY_DB.prepare(`
    CREATE TABLE IF NOT EXISTS ground_truth_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keywords TEXT NOT NULL,
      statement TEXT NOT NULL,
      zeitgeist_impact TEXT,
      source_id TEXT,
      source_title TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  const body = await request.json();

  // 1. Delete standard ground truth
  if (body.action === 'delete') {
    await env.SURVEY_DB.prepare('DELETE FROM ground_truth WHERE id = ?').bind(body.id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // 2. Batch Sync Morning Ground Truths JSON
  if (body.action === 'batch_sync') {
    const items = Array.isArray(body.items) ? body.items : (Array.isArray(body.ground_truths) ? body.ground_truths : []);
    let insertedCount = 0;
    for (const item of items) {
      if (item && item.statement && item.keywords) {
        // Prevent duplicate statements
        const existing = await env.SURVEY_DB.prepare('SELECT id FROM ground_truth WHERE statement = ?').bind(item.statement).first();
        if (!existing) {
          const kws = Array.isArray(item.keywords) ? item.keywords.join(', ') : String(item.keywords);
          await env.SURVEY_DB.prepare('INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)').bind(kws, item.statement).run();
          insertedCount++;
        }
      }
    }
    return new Response(JSON.stringify({ success: true, count: insertedCount, total: items.length }), { headers: { 'Content-Type': 'application/json' } });
  }

  // 3. Suggest a new ground truth candidate
  if (body.action === 'suggest') {
    const { keywords, statement, zeitgeist_impact, source_id, source_title } = body;
    const kws = Array.isArray(keywords) ? keywords.join(', ') : String(keywords || '');
    await env.SURVEY_DB.prepare(
      'INSERT INTO ground_truth_suggestions (keywords, statement, zeitgeist_impact, source_id, source_title) VALUES (?, ?, ?, ?, ?)'
    ).bind(kws, statement, zeitgeist_impact || '', source_id || '', source_title || '').run();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // 4. Approve AI suggestion and promote to ground_truth
  if (body.action === 'approve_suggestion') {
    const sug = await env.SURVEY_DB.prepare('SELECT * FROM ground_truth_suggestions WHERE id = ?').bind(body.id).first();
    if (sug) {
      await env.SURVEY_DB.prepare('INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)').bind(sug.keywords, sug.statement).run();
      await env.SURVEY_DB.prepare("UPDATE ground_truth_suggestions SET status = 'approved' WHERE id = ?").bind(body.id).run();
    }
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // 5. Reject suggestion
  if (body.action === 'reject_suggestion') {
    await env.SURVEY_DB.prepare("UPDATE ground_truth_suggestions SET status = 'rejected' WHERE id = ?").bind(body.id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // 6. Otherwise standard single insert
  const { keywords, statement } = body;
  const kws = Array.isArray(keywords) ? keywords.join(', ') : String(keywords || '');
  await env.SURVEY_DB.prepare('INSERT INTO ground_truth (keywords, statement) VALUES (?, ?)').bind(kws, statement).run();
  
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
