// Helper functions for formatting and normalizing survey data

/**
 * Flattens and re-aggregates multi-select distributions that were grouped as single comma-separated strings.
 */
export const flattenMultiSelect = (distArray, q) => {
  if (!distArray || !Array.isArray(distArray)) return [];
  const newMap = new Map();
  let totalN = 0;

  let prefixes = null;
  const qId = q?.id;
  if (qId === "circ_parents_influences") {
    prefixes = [
      "Direct Medical Authority:",
      "Institutional Medical Norm:",
      "Family Tradition/Pressure:",
      "Paternal Influence (The \"Like Father\" Factor):",
      "Peer & Social Pressure (The \"Fitting In\" Factor):",
      "Religious Mandate/Tradition:",
      "Prevailing Health & Hygiene Beliefs:",
      "Popular Media & Parenting \"Experts\":",
      "Lack of Counter-Information:",
      "Aesthetic Preference:",
      "I have absolutely no idea what influenced them.",
      "Prevailing Moral Beliefs about Sexuality (e.g., concern over masturbation)."
    ];
  } else if (qId === "demo_ethnicity" || qId === "demo_race_ethnicity") {
    prefixes = [
      "Asian / Asian American (e.g., East Asian, South Asian, Southeast Asian)",
      "Black / African American / African / Afro-Caribbean",
      "Native American / Alaska Native / Indigenous / First Nations",
      "White / Caucasian / European American",
      "Hispanic / Latino / Latina / Latinx",
      "Native Hawaiian / Other Pacific Islander",
      "Middle Eastern / North African (MENA)",
      "Multiracial / Biracial",
      "Prefer not to say"
    ];
  } else if (qId === "restore_techniques_used") {
    prefixes = [
      "Manual tugging (Andre's method, etc)",
      "T-Tape",
      "O-rings / retaining cones",
      "Dual-tension devices (DTR, Mantis, etc)",
      "Air inflation devices (Foreskinned Air, HyperRestore, etc)",
      "Weights (PUD, stealth retainers with weights, etc)",
      "Surgical restoration / Foregen clinical trials",
      "I haven't started yet"
    ];
  } else if (qId === "observe_advocate_future_focus") {
    prefixes = [
      "Legal challenges and lawsuits (like the Equal Protection cases)",
      "Legislative action (e.g., defunding Medicaid for RIC)",
      "Direct outreach and education for expectant parents",
      "Reforming medical school curricula and hospital protocols",
      "High-visibility public protests and awareness campaigns",
      "Creating high-quality media (documentaries, articles)",
      "Supporting foreskin restoration and regeneration research",
      "Building broader coalitions with other human rights groups"
    ];
  } else if (qId === "family_mother_profession") {
    prefixes = [
      "Stay-at-Home Parent / Homemaker",
      "Clerical / Administrative Support (e.g., Secretary, Office Clerk)",
      "Education (e.g., K-12 Teacher, Professor, School Administrator)",
      "Business/Finance/Management",
      "Healthcare/Medicine (e.g., Doctor, Nurse, Therapist, Technician)",
      "Law/Government/Public Service/Civil Servant",
      "Science/Research/Academia",
      "Factory / Manufacturing / General Labor",
      "Arts/Humanities/Entertainment (e.g., Artist, Writer, Musician)",
      "Skilled Trades (e.g., Electrician, Carpenter, Mechanic, Cosmetologist)",
      "Personal Care / Service",
      "Retail / Customer Service / Hospitality",
      "Military Service",
      "I'm not sure"
    ];
  } else if (qId === "family_father_profession") {
    prefixes = [
      "Skilled Trades (e.g., Electrician, Carpenter, Mechanic, Cosmetologist)",
      "Business/Finance/Management",
      "Factory / Manufacturing / General Labor",
      "Law/Government/Public Service",
      "Healthcare/Medicine (e.g., Doctor, Nurse, Therapist, Technician)",
      "Retail / Customer Service / Hospitality",
      "Science/Research/Academia",
      "Education (e.g., K-12 Teacher, Professor, School Administrator)",
      "Arts/Humanities/Entertainment",
      "Military Service",
      "Clerical / Administrative Support (e.g., Secretary, Office Clerk)",
      "Stay-at-Home Parent / Homemaker",
      "Personal Care / Service",
      "I'm not sure"
    ];
  } else if (qId === "intact_parents_info_sources") {
    prefixes = [
      "Advice from a specific group or community (e.g., La Leche League, a natural health co-op)",
      "A specific medical statement or article (e.g., the 1971 AAP statement disavowing medical need)",
      "Family history or cultural background from a non-circumcising country/culture",
      "Influence from a foreign-born, foreign-trained, or older doctor/nurse who was skeptical of the practice",
      "Don't Know / Unsure"
    ];
  } else if (qId === "intact_parents_traits_values") {
    prefixes = [
      "Highly valued scientific evidence and did their own research",
      "Fiscally conscious (questioned unnecessary medical costs)",
      "Strongly principled about consent and bodily autonomy in general",
      "Valued natural, holistic, or low-intervention approaches to health",
      "Identified as non-conformist or counter-cultural",
      "Generally skeptical of medical authority or \"doctor knows best\"",
      "None of the above feel particularly accurate",
      "Unsure"
    ];
  } else if (qId === "circ_adult_motivation_details") {
    prefixes = [
      "Aesthetic Preference: I (or my partner/parents) preferred the appearance of a circumcised penis.",
      "Perceived Hygiene Benefits: A belief that it would be cleaner or easier to care for.",
      "Social Conformity: A desire to \"look like\" peers or fit a cultural norm.",
      "Sensation: A belief or hope that it would change or improve sexual sensation (e.g., help with premature ejaculation).",
      "Medical Diagnosis: Phimosis (inability to retract the foreskin)",
      "Medical Diagnosis: Recurring Balanitis/Infections",
      "Medical Diagnosis: Other specific condition",
      "Religious Conversion or Affirmation"
    ];
  } else if (qId === "observe_curious_shaping_factors") {
    prefixes = [
      "Personal experiences with intimate partners",
      "Independent research I've done myself (intactivist sites, documentaries, etc.)",
      "Conversations with male friends or partners about their experiences",
      "Feminist principles of bodily autonomy and consent",
      "Information or advice from doctors or medical professionals",
      "Media portrayals (movies, TV, internet)",
      "Conversations with friends",
      "Religious or cultural teachings",
      "The norms in my family or the community I grew up in"
    ];
  } else if (qId === "observe_parent_intact_factors") {
    prefixes = [
      "Ethical beliefs about bodily autonomy and a child's right to consent",
      "Information about the functions and sensitivity of the foreskin",
      "Lack of a clear medical necessity for the procedure",
      "Concerns about surgical risks and potential complications",
      "Independent research (documentaries, articles, online communities)",
      "My partner's preference was to keep him intact",
      "The medical benefit claims did not make sense."
    ];
  } else if (qId === "intact_parents_neg_catalyst") {
    prefixes = [
      "Yes, I believe one of my parents (e.g., my father) had a negative personal experience with their own circumcision.",
      "No",
      "Unsure / Don't Know"
    ];
  } else if (qId === "religion_is_significant") {
    prefixes = [
      "Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)",
      "Not at all significant / I have no religious or spiritual background.",
      "Yes, somewhat significant",
      "Yes, very significant",
      "Culturally, but no",
      "Not at all significant",
      "Prefer not to say"
    ];
  } else if (qId === "religion_jewish_brit_milah_view") {
    prefixes = [
      "As an important tradition and cultural marker, though perhaps with some flexibility in interpretation or practice.",
      "As a practice open to discussion, with varying opinions on its necessity or form in modern times.",
      "As a practice that some in my community/family questioned or chose alternatives to.",
      "As a non-negotiable religious commandment (mitzvah) central to Jewish identity.",
      "Not a significant topic of discussion or emphasis in my specific context."
    ];
  } else if (qId === "religion_jewish_alternatives_awareness") {
    prefixes = [
      "Aware of them, but haven't deeply explored",
      "Yes, extensively",
      "Yes, somewhat",
      "No, not really"
    ];
  } else if (qId === "religion_islamic_alternatives_awareness") {
    prefixes = [
      "Aware of them, but haven't deeply explored",
      "Yes, extensively",
      "Yes, somewhat",
      "Not interested in such interpretations"
    ];
  } else if (qId === "religion_islamic_alternatives_thoughts") {
    prefixes = [
      "I was raised as a sunni muslim (my mom was christian though), but we weren't super religious. I left the religion when I realized I was gay around 14 and started to come back to it a decade later, but from a wildly different perspective. I don't remember circumcision ever being directly addressed as a kid, but I imagine my dad would have seen it as a religious necessity but without much else thought about it. My brothers were circumcised, but I ended up not being circumcised, but not for any particular reason. I remember my parents just saying they forgot to get it done/were too lazy to schedule it or something like that. With the perspective I have now, where I don't believe in hadith and take a very spiritual (and some might say progressive) view of the Quran, I don't view circumcision as required at all since it's not in the Quran and honestly I just don't really care about what people think and do in the mainstream zeitgeist because I think religion/faith/spirituality/etc is an individual experience so even if mainstream Islam can recognize it's not in the Quran but still thinks it's required because of such and such reason, I don't pay it any mind and am personally against it for a variety of reasons even outside of religion.",
      "I find them genuinely very good and convincing arguments. I have recently pretty much questioned the whole Sunnah/Hadith corpus in its entirety. And since it's not a Quranic commandment, even in regards to the Sunnah, I think at least it should be thought about letting this religious tradition of Khitan fall as it certainly is not necessary anymore.",
      "I'm not a muslim, my dad is.",
      "It is usually strongly recommended to do so.",
      "Utter bullshit like the rest of this seventh century cult"
    ];
  } else if (qId === "religion_islamic_intact_reconciliation") {
    prefixes = [
      "My family like I said was religious but not strict. I don't think they think about this topic very deeply at all. As I've grown older, only my brother has become more strict, traditionalistic and conservative and he sees it as absolutely necessary and you're degenerate if you don't etc etc. In general, it's not something I see really talked about directly and if it is, it seems like most muslims just kinda accept it and perceive it as just a religious thing that muslims do, but the only ones that really deeply believe it's super serious and whatnot are the types like my brother. I think it's only the more progressive/spiritual/etc types like myself that specifically think it shouldn't be done.",
      "Not circumcising is not something that is considered by Muslims.\n\nI have seen several Muslim and religious families in Iranian cyberspace who have not circumcised their sons and who cite the perfect and flawless creation of man as stated in the Quran. But this is very rare.\n\nThere is a strong contradiction between the verses of the Quran and the hadiths of the prophets regarding circumcision, which you are probably familiar with, but Muslims do not think about it. I have tried to discuss this issue with several very religious people several times, but they considered it an insult and of course had no response.",
      "No idea, My Dad is a Muslim in name only, that mans faith is fucking faker than Kim Kardashians tits, you can feel the demonic energy emmenating off that mans quran",
      "Well they don't...\nIt's not much thought done about it.\nIt's just what Muslim boys have to go through.\nNot much to think of from their side or to reconcile.",
      "Its never been talked about as its a somewhat taboo topic.",
      "They don't even considered"
    ];
  } else if (qId === "exp_pre_ejaculate_awareness") {
    prefixes = [
      "Varies Greatly: The amount changes significantly depending on arousal level, time, etc., making it hard to generalize.",
      "A Small Amount: I typically notice a drop or two, or a slight moistness at the tip of my penis.",
      "None or Barely Noticeable: I produce very little to no noticeable pre-ejaculate.",
      "A Significant Amount: I produce a significant amount",
      "A Moderate Amount: I produce a noticeable amount",
      "Unsure / I haven't paid attention to this."
    ];
  } else if (qId === "intact_parents_convo") {
    prefixes = [
      "No, I have never asked them about their decision.",
      "Yes, we've discussed it briefly, but not in great depth.",
      "Yes, I've had a detailed conversation and have a clear understanding of their reasons at the time.",
      "Not applicable (parents are deceased, adopted and no contact, etc.).",
      "I've tried to bring it up, but they didn't seem to recall much or the conversation was brief."
    ];
  } else if (qId === "circ_parents_convo") {
    prefixes = [
      "Yes, I've had a detailed conversation and have a clear understanding of their reasons at the time.",
      "I've tried to bring it up, but they were reluctant to discuss it or the conversation was difficult.",
      "No, I have never asked them about their decision.",
      "Yes, we've discussed it briefly, but not in great depth.",
      "Not applicable (parents are deceased, adopted and no contact, etc.)"
    ];
  } else if (qId === "intact_partner_comparison_observation") {
    prefixes = [
      "Not applicable - no same-sex partners or no partners with differing status",
      "No, not really or no opportunity for such discussion",
      "Yes, we've discussed/I've observed significant differences",
      "Yes, some differences noted",
      "Unsure or not enough experience to compare"
    ];
  } else if (qId === "circ_awareness_age") {
    prefixes = [
      "Early childhood",
      "I've always just known",
      "Pre-teen years",
      "Adulthood",
      "Teenage years (e.g., health class, peer discussions)",
      "I'm still not entirely sure what was done"
    ];
  } else if (qId === "circ_curiosity_about_intact" || qId === "intact_curiosity_about_circ") {
    prefixes = [
      "Yes, I've often wondered",
      "I experienced this before being circumcised",
      "Yes, I've occasionally wondered",
      "No, I believe being circumcised is preferable",
      "No, I believe being intact is preferable",
      "Not really, I'm happy with my experience",
      "I've never thought about it"
    ];
  } else if (qId === "circ_regret_feeling") {
    prefixes = [
      "Yes, these feelings are or have been strong and frequent",
      "Yes, I experience some of these feelings sometimes",
      "Rarely",
      "No, never"
    ];
  } else if (qId === "family_sibling_status_mixed_reason") {
    prefixes = [
      "Yes. I had minor issues with irritation so I was cut like my father",
      "Medical decision due to slight scar on the foreskin around teenage years and lie from doctor on the procedure",
      "He was born premature and with health problems. Later he got a frenulectomy or some kind of surgery but not a full circumcision",
      "My parents didn't mutilate my brother because he had Down's Syndrome so they didn't care about his future sexuality.",
      "My older brother is a lot older and was left intact.",
      "Only son, apparently my parents debated a lot and my mom thought I shouldn't be but didn't mind much either way and was ok with my dad deciding I should be just because he is and maybe wanting to cater to my mom's religious family not sure",
      "They did not have a doctor notice phimosis, so the surgery was not considered for them.",
      "He never had phimosis.",
      "Older half brother was a home birth, no doctor involved. The rest of us were born in a hospital with a doctor making decisions",
      "My bother was born with a different father, he was born in China. My father was a Jewish man, who believed in the medical superstitions attributed to circumcision",
      "Youngest brother born 10 years later",
      "Neither of us was circumcised at birth. I chose to get circumcised when I was 15.",
      "Mine was a \"medical\" recomendation",
      "It was a different doctor with him (we also lived in a different city)",
      "I don't know what exactly changed their minds, they only did it to their younger sons",
      "In my case there was a - supposedly - clear 'medical' reason to have me circumcised at the age of 7. It was not an RIC. So logically that set me apart from anyone else.",
      "because I voluntarily decided to do so at the age of 25",
      "We were all born intact. That's according to my culture. I chose to be circumcised.",
      "Haven't a clue. Brief conversation on the subject revealed it was a matter of routine when I was delivered by my GP, but I think my brother may have been delivered by a different doctor. It wasn't a religious thing on the part of my parents, I think it was literally the GP just acting on routine and my parents not knowing better or caring.",
      "No",
      "born to different fathers and birthed in a different hospital",
      "Different mother, both of us were premature, but his mother decided against it to save him pain after birth. Was also born in a different province. Where I was born in my city's jewish hospital if that matters...",
      "One brother was born in a country where circumcision is not common.",
      "My younger brother had a phimosis issue that created a need for circumcision. The doctor cut the minimal amount necessary to correct the issue.",
      "Later in life medical issue.",
      "My father was intact, as was his son.  My mother cut her son and me.",
      "My mother regretted having me done, so my younger brother was left intact. My step brother was born with a different mother, and I believe he is circumcised"
    ];
  } else if (qId === "restore_feelings_before") {
    prefixes = [
      "Significantly dissatisfied with sensation, function, or appearance",
      "Curious about what might be different if intact",
      "Experienced feelings of loss, grief, or anger",
      "Mildly dissatisfied with sensation or appearance",
      "Felt physically uncomfortable or experienced complications",
      "Generally satisfied or hadn't thought much about it",
      "Motivated by research or learning about intact anatomy/function",
      "Discomfort of glans rubbing on clothes, feeling like something was \"missing\"",
      "Disgusted with self over finding the action of circumcision to be arousing",
      "Violation of bodily autonomy",
      "I felt superior",
      "I was taught that circumcision was better.",
      "Hated it and how different it made me feel from every one else.",
      "Subjective feeling of sexual violation and emasculation.",
      "At times, suicidally dissatisfied with being circumcised. If I'm just locked out of knowing what sex is really supposed to feel like, as a sexual creature who can't turn off his sex drive, how am I supposed to just relax about that and feel satisfied?",
      "I fucking hate being circumcised.  As a gay man who has experienced what pleasure and being intact brings, I have nothing but hate for people who support circumcision.",
      "I discovered I was mutilated when I was 11-12, and from then on, my dissatisfaction with it gradually grew until I resolved to do something constructive about it, and started restoring.",
      "While I was young and before I understood what any of this meant, there was some deep part of me that just felt like something was wrong/missing.",
      "I felt majorly dysphoric from an extremely young age, and swear that I can actually remember being circumcised as an infant.",
      "I knew it was caused by circumcision, but I didn't think I could actually change anything about it, so I didn't waste time and energy thinking of something I thought I couldn't change anyway.",
      "I thought how I felt was a little lackluster, but normal, so I thought nothing of it until realizing the damage caused by circumcision.",
      "I have PTSD from being cut so… well I was a bit busy having panic attacks to remember how I fully felt.",
      "I was always annoyed how I needed lube, but never really thought about it much",
      "more of a deep and overwhelming greif over the loss of agency than the loss of any body part",
      "it makes it hard to want to have sex or date because i don't want to be the one to have a messed up penis that makes me worse at sex than other people"
    ];
  } else if (qId === "restore_motivations") {
    prefixes = [
      "Achieve glans coverage and dekeratinization",
      "Feel more 'natural' or 'whole'",
      "Improve sexual pleasure/orgasms",
      "Regain gliding motion",
      "Increased overall sensitivity",
      "Improve gliding mechanics/reduce need for lube",
      "Heal psychological trauma",
      "Reclaim what was taken",
      "Aesthetics",
      "To see what restoration was like (it's scientifically interesting), to see if it actually worked, and also just the littlest bit of spite :)",
      "Circumcision feels emasculating, I want to take that part of my masculinity back.",
      "It expands my dating pool beyond just midwestern white girls, now I'd look like most men do and I'll fit in anywhere else",
      "I think intact just LOOKS so much better. It's also about removing frustration from glans rubbing on clothes and bedsheets and such. It's a feeling I hate.",
      "I restored by accident through masturbation, but I believe my body was subconsciously attempting to repair what was missing",
      "to see what restoration was like (it's scientifically interesting), to see if it actually worked",
      "I don't think a person's feelings about his penile status (intact/circumcised) is inseparable from the culture and family emotional dynamics one experiences growing up",
      "Hoping to eliminate or reduce day-to-day discomfort from glans abrading against clothing, and to be able to comfortably wear any style of underwear",
      "Had been diagnosed with ED. When my doctor didn’t have a solution, I concluded that I would fix it or die trying.  This was in the late 1990’s.",
      "Increase the area the frenulum takes up; I hear the pleasure doesn't \"thin out\" like you might expect, but grows with the area"
    ];
  } else if (qId === "restore_rci_start") {
    prefixes = [
      "I'm not familiar with the RCI score / I can't estimate my starting score",
      "RCI-0 (Super tight cut, very little, if any, skin mobility hard or soft)",
      "RCI-1 (Tight cut, no slack when soft)",
      "RCI-2 (Medium cut, can pull skin to corona (head) when soft)",
      "RCI-3 (Loose cut, skin bunches at corona, may roll over a bit when cold)"
    ];
  } else if (qId === "restore_regen_tech_awareness") {
    prefixes = [
      "Yes, I'm familiar with specific organizations/research (e.g., Foregen)",
      "Yes, I've heard the concept exists, but no specifics",
      "No, I was unaware this was being researched"
    ];
  } else if (qId === "observe_motivation") {
    prefixes = [
      "I am the partner of an intact man",
      "I am a parent who has made/is considering a decision about infant circumcision for my son",
      "I am a PARENT / STEP-PARENT / GUARDIAN who has made (or is making) a decision about infant circumcision for a child in my care.",
      "I am an ADVOCATE ALLY, or INTACTIVIST",
      "Supporting the survey author's work",
      "I am the PARTNER of a man (intact, circumcised, or restoring).",
      "I am a HEALTHCARE PROVIDER / MEDICAL PROFESSIONAL.",
      "General curiosity about the topic"
    ];
  } else if (qId === "intact_regret_feeling") {
    prefixes = [
      "Yes, these feelings are or have been strong and frequent.",
      "Yes, I experience some of these feelings sometimes.",
      "Yes, but rarely.",
      "No, never; I have always been glad to be intact."
    ];
  } else if (qId === "intact_ppp_awareness" || qId === "circ_ppp_awareness") {
    prefixes = [
      "I do not have them.",
      "I'm not sure if I have them.",
      "I have them and have always known what they were.",
      "I have them and was worried about them until I learned they were normal.",
      "I have them but didn't know what they were.",
      "I have them and am still concerned about their appearance.",
      "I used to have them, but they seem to have faded over time."
    ];
  } else if (qId === "intact_pressure_to_circ") {
    prefixes = [
      "I have never felt any pressure and have never considered getting circumcised; I value being intact.",
      "I've never felt pressure, but never seriously considered it for myself.",
      "I've never felt pressure, but I have been curious enough to research what circumcision entails and why others choose it.",
      "I have felt some societal/cultural pressure or expectation to be circumcised, but never seriously considered it for myself.",
      "I have felt pressure AND have briefly considered or researched getting circumcised for myself.",
      "I have felt pressure AND have seriously considered getting circumcised for myself at some point.",
      "I am planning getting circumcised for myself at some point."
    ];
  }


  distArray.forEach(item => {
    if (!item || !item.label) return;
    const labelStr = String(item.label).replace(/\r\n/g, "\n");
    const n = item.n;
    totalN += n;

    if (prefixes) {
      let remaining = labelStr;
      const found = [];
      prefixes.forEach(prefix => {
        if (remaining.indexOf(prefix) !== -1) {
          found.push(prefix);
          remaining = remaining.replace(prefix, "");
        }
      });

      if (found.length > 0) {
        if ((qId === "demo_ethnicity" || qId === "demo_race_ethnicity") && found.length > 1) {
          if (!found.includes("Multiracial / Biracial")) {
            found.push("Multiracial / Biracial");
          }
        }
        found.forEach(f => {
          let key = f;
          if (qId === "religion_is_significant" && f === "Culturally, but no") {
            key = "Culturally, but no (Meaning culturally religious, but not religiously observant/practicing in terms of belief)";
          }
          newMap.set(key, (newMap.get(key) || 0) + n);
        });

        // Any leftover write-in text in remaining is consolidated to "Other"
        remaining = remaining.replace(/^[,\s]+|[,\s]+$/g, "").trim();
        if (remaining) {
          newMap.set("Other", (newMap.get("Other") || 0) + n);
        }
      } else {
        // No known prefix matched — pure write-in → "Other"
        newMap.set("Other", (newMap.get("Other") || 0) + n);
      }
    } else {
      let parts = [];
      if (/(?<=[.)]),\s/.test(labelStr)) {
        parts = labelStr.split(/(?<=[.)]),\s/);
      } else {
        parts = labelStr.split(/,\s/);
      }
      parts = parts.map(p => p.trim()).filter(Boolean);
      parts.forEach(p => {
        newMap.set(p, (newMap.get(p) || 0) + n);
      });
    }
  });

  return Array.from(newMap.entries())
    .map(([label, n]) => ({ label, n, pct: totalN > 0 ? (n / totalN) * 100 : 0 }))
    .sort((a, b) => b.n - a.n);
};

/**
 * Normalizes numeric values in a Likert scale distribution to human-readable strings.
 * E.g., '1.0' -> '1 - Extremely Important' (for importance questions)
 *       '3.0' -> '3'
 */
export const applyLikert = (distArray, q) => {
  if (!q || !distArray) return distArray || [];
  
  // Normalize labels first
  let normalized = distArray
    .filter(d => d.label && d.label.trim() !== "-" && d.label.trim() !== "—" && d.label.trim() !== "")
    .map(d => {
      let label = d.label;
      if (q.id.includes("importance") || q.type === "scale_1_5") {
        const num = parseFloat(label);
        if (num === 1) label = "1 - Extremely Important";
        else if (num === 5) label = "5 - Not Important At All";
        else if (!isNaN(num)) label = String(Math.round(num));
      }
      return { ...d, label };
    });

  // If it's a 1-5 scale, ensure all 5 options exist!
  const isScale = q.type === "scale_1_5" || q.id.includes("importance");
  if (isScale) {
    const scaleLabels = [
      "1 - Extremely Important",
      "2",
      "3",
      "4",
      "5 - Not Important At All"
    ];
    
    // We check if we have any representation in the normalized array
    const existing = new Map();
    normalized.forEach(item => {
      const match = String(item.label).match(/^\s*([1-5])/);
      if (match) {
        existing.set(parseInt(match[1]), item);
      }
    });

    const result = [];
    for (let i = 1; i <= 5; i++) {
      if (existing.has(i)) {
        result.push({
          ...existing.get(i),
          label: scaleLabels[i - 1]
        });
      } else {
        result.push({
          label: scaleLabels[i - 1],
          n: 0,
          pct: 0
        });
      }
    }
    return result;
  }

  return normalized;
};

/**
 * Normalizes user-input text strings for Geographic Heatmaps.
 */
export const normalizeName = (name) => {
  if (!name) return "Unknown";
  let n = String(name).trim().toLowerCase();
  
  if (n.match(/^[a-z]{2}\s-\s/)) {
    n = n.substring(5);
  }
  
  if (n === "united states of america (usa)" || n === "united states of america" || n === "usa" || n === "united states" || n === "us" || n === "u.s.") {
    return "United States";
  }
  if (n === "great britain" || n === "uk" || n === "england" || n === "scotland" || n === "wales" || n === "northern ireland" || n === "united kingdom") {
    return "United Kingdom";
  }
  if (n.includes("australia") || n === "perth/southern australia" || n === "nsw" || n === "victoria" || n === "queensland" || n === "tasmania") {
    return "Australia";
  }

  // Canada Provinces and Territories
  const caMap = {
    "ab": "Alberta",
    "bc": "British Columbia",
    "mb": "Manitoba",
    "nb": "New Brunswick",
    "nl": "Newfoundland and Labrador",
    "newfoundland": "Newfoundland and Labrador",
    "ns": "Nova Scotia",
    "nt": "Northwest Territories",
    "nwt": "Northwest Territories",
    "nu": "Nunavut",
    "on": "Ontario",
    "pe": "Prince Edward Island",
    "pei": "Prince Edward Island",
    "prince edward": "Prince Edward Island",
    "qc": "Quebec",
    "pq": "Quebec",
    "sk": "Saskatchewan",
    "yt": "Yukon",
    "yukon territory": "Yukon"
  };

  if (caMap[n]) return caMap[n];
  
  return n.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

/**
 * Aggregates a response distribution by normalizing its labels.
 */
export const rollUpDistribution = (distArray) => {
  if (!distArray || !Array.isArray(distArray)) return [];
  const map = {};
  for (const d of distArray) {
    if (!d.label) continue;
    const canon = normalizeName(d.label);
    if (!map[canon]) map[canon] = 0;
    map[canon] += d.n;
  }
  return Object.entries(map)
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);
};

/**
 * Sorts distribution data arrays if they correspond to specific structured
 * questions like political views or generations.
 */
export const sortDistribution = (distArray, question) => {
  if (!distArray || !Array.isArray(distArray)) return [];
  const qId = question?.id || "";

  if (qId.includes("restore_impact_rating_")) {
    const getOutcomeIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("significantly improved")) return 0;
      if (l.includes("somewhat improved")) return 1;
      if (l.includes("no noticeable change")) return 2;
      if (l.includes("somewhat diminished")) return 3;
      if (l.includes("significantly diminished")) return 4;
      if (l.includes("not a primary goal")) return 5;
      return 6;
    };
    return [...distArray].sort((a, b) => getOutcomeIndex(a.label) - getOutcomeIndex(b.label));
  }

  const isScale = question?.type === "scale_1_5" || qId.includes("importance") || qId.includes("rating_");
  if (isScale) {
    const getScaleValue = (label) => {
      const match = String(label || "").match(/^\s*([1-5])/);
      return match ? parseFloat(match[1]) : 999;
    };
    return [...distArray].sort((a, b) => getScaleValue(a.label) - getScaleValue(b.label));
  }

  if (qId === "family_politics" || qId.includes("politics")) {
    const getPoliticalIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("very conservative")) return 0;
      if (l.includes("conservative")) return 1;
      if (l.includes("moderate") || l.includes("centrist")) return 2;
      if (l.includes("very liberal")) return 4;
      if (l.includes("liberal") || l.includes("progressive")) return 3;
      if (l.includes("libertarian")) return 5;
      if (l.includes("apolitical")) return 6;
      if (l.includes("other") || l.includes("mixed")) return 7;
      if (l.includes("prefer not to say") || l.includes("unsure") || l.includes("unknown")) return 8;
      return 9;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getPoliticalIndex(a.label);
      const idxB = getPoliticalIndex(b.label);
      if (idxA === 9 && idxB === 9) {
        // Tie breaker for unclassified labels
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "religion_is_significant" || qId.includes("upbringing_significance")) {
    const getRelIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("very significant")) return 0;
      if (l.includes("somewhat significant")) return 1;
      if (l.includes("culturally") && l.includes("meaning culturally")) return 2;
      if (l.includes("culturally")) return 3;
      if (l.includes("not at all") && l.includes("no religious")) return 4;
      if (l.includes("not at all")) return 5;
      if (l.includes("prefer not")) return 6;
      return 7;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getRelIndex(a.label);
      const idxB = getRelIndex(b.label);
      if (idxA === 7 && idxB === 7) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "religion_jewish_brit_milah_view") {
    const getJewishMilahIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("non-negotiable religious commandment")) return 0;
      if (l.includes("important tradition and cultural marker")) return 1;
      if (l.includes("practice open to discussion")) return 2;
      if (l.includes("questioned or chose alternatives")) return 3;
      if (l.includes("not a significant topic")) return 4;
      return 5;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getJewishMilahIndex(a.label);
      const idxB = getJewishMilahIndex(b.label);
      if (idxA === 5 && idxB === 5) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "religion_jewish_alternatives_awareness") {
    const getJewishAlternativesIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("yes") && l.includes("extensively")) return 0;
      if (l.includes("yes") && l.includes("somewhat")) return 1;
      if (l.includes("aware of") || l.includes("haven't deeply explored")) return 2;
      if (l.includes("no") || l.includes("not really")) return 3;
      return 4;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getJewishAlternativesIndex(a.label);
      const idxB = getJewishAlternativesIndex(b.label);
      if (idxA === 4 && idxB === 4) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "religion_islamic_alternatives_awareness") {
    const getIslamicAlternativesIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("yes") && l.includes("extensively")) return 0;
      if (l.includes("yes") && l.includes("somewhat")) return 1;
      if (l.includes("aware of") || l.includes("haven't deeply explored")) return 2;
      if (l.includes("not interested")) return 3;
      return 4;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getIslamicAlternativesIndex(a.label);
      const idxB = getIslamicAlternativesIndex(b.label);
      if (idxA === 4 && idxB === 4) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "exp_orgasm_duration_desc") {
    const getDurationIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("0-5 seconds")) return 0;
      if (l.includes("6-15 seconds")) return 1;
      if (l.includes("16-30 seconds")) return 2;
      if (l.includes("up to 1 minute")) return 3;
      if (l.includes("longer than 1 minute")) return 4;
      if (l.includes("varies too much")) return 5;
      if (l.includes("unsure")) return 6;
      return 7;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getDurationIndex(a.label);
      const idxB = getDurationIndex(b.label);
      if (idxA === 7 && idxB === 7) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "exp_pre_ejaculate_awareness") {
    const getPreEjIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("significant amount")) return 0;
      if (l.includes("moderate amount")) return 1;
      if (l.includes("small amount")) return 2;
      if (l.includes("none or barely")) return 3;
      if (l.includes("varies greatly")) return 4;
      if (l.includes("unsure")) return 5;
      return 6;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getPreEjIndex(a.label);
      const idxB = getPreEjIndex(b.label);
      if (idxA === 6 && idxB === 6) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "intact_parents_convo" || qId === "circ_parents_convo") {
    const getConvoIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("detailed conversation")) return 0;
      if (l.includes("discussed it briefly") || l.includes("discussed briefly")) return 1;
      if (l.includes("tried to bring it up") || l.includes("tried to bring up")) return 2;
      if (l.includes("never asked")) return 3;
      if (l.includes("not applicable")) return 4;
      return 5;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getConvoIndex(a.label);
      const idxB = getConvoIndex(b.label);
      if (idxA === 5 && idxB === 5) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "intact_partner_comparison_observation") {
    const getPartnerIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("significant differences")) return 0;
      if (l.includes("some differences")) return 1;
      if (l.includes("no, not really") || l.includes("not really or no opportunity")) return 2;
      if (l.includes("unsure")) return 3;
      if (l.includes("not applicable")) return 4;
      return 5;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getPartnerIndex(a.label);
      const idxB = getPartnerIndex(b.label);
      if (idxA === 5 && idxB === 5) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "circ_awareness_age") {
    const getAwareAgeIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("always just known") || l.includes("always known")) return 0;
      if (l.includes("early childhood")) return 1;
      if (l.includes("pre-teen")) return 2;
      if (l.includes("teenage")) return 3;
      if (l.includes("adulthood")) return 4;
      if (l.includes("not entirely sure") || l.includes("still not sure")) return 5;
      return 6;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getAwareAgeIndex(a.label);
      const idxB = getAwareAgeIndex(b.label);
      if (idxA === 6 && idxB === 6) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "circ_age") {
    const getCircAgeIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("neonatal") || l.includes("infant")) return 0;
      if (l.includes("childhood")) return 1;
      if (l.includes("adolescence")) return 2;
      if (l.includes("adulthood")) return 3;
      if (l.includes("unsure")) return 4;
      return 5;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getCircAgeIndex(a.label);
      const idxB = getCircAgeIndex(b.label);
      if (idxA === 5 && idxB === 5) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "circ_curiosity_about_intact") {
    const getCuriosityIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("often wondered")) return 0;
      if (l.includes("occasionally wondered")) return 1;
      if (l.includes("experienced this before")) return 2;
      if (l.includes("circumcised is preferable")) return 3;
      if (l.includes("happy with my experience")) return 4;
      if (l.includes("never thought about it")) return 5;
      return 6;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getCuriosityIndex(a.label);
      const idxB = getCuriosityIndex(b.label);
      if (idxA === 6 && idxB === 6) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "circ_regret_feeling") {
    const getRegretIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("strong and frequent")) return 0;
      if (l.includes("sometimes")) return 1;
      if (l.includes("rarely")) return 2;
      if (l.includes("no, never") || l.includes("never")) return 3;
      return 4;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getRegretIndex(a.label);
      const idxB = getRegretIndex(b.label);
      if (idxA === 4 && idxB === 4) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "family_sibling_status") {
    const getSiblingIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("all of us are the same") && l.includes("circumcised")) return 0;
      if (l.includes("all of us are the same") && l.includes("intact")) return 1;
      if (l.includes("all my siblings are circumcised")) return 2;
      if (l.includes("all my siblings are intact")) return 3;
      if (l.includes("there is a mix") && l.includes("(i am circumcised)")) return 4;
      if (l.includes("there is a mix") && l.includes("i am circumcised")) return 5;
      if (l.includes("there is a mix") && l.includes("i am intact")) return 6;
      if (l.includes("don't know")) return 7;
      return 8;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getSiblingIndex(a.label);
      const idxB = getSiblingIndex(b.label);
      if (idxA === 8 && idxB === 8) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "restore_duration") {
    const getRestoreDurationIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("complete") || l.includes("achieved my goals")) return 0;
      if (l.includes("more than 10 years")) return 1;
      if (l.includes("7-10 years")) return 2;
      if (l.includes("5-7 years")) return 3;
      if (l.includes("3-5 years")) return 4;
      if (l.includes("2-3 years")) return 5;
      if (l.includes("1-2 years")) return 6;
      if (l.includes("6 months - 1 year")) return 7;
      if (l.includes("less than 6 months")) return 8;
      return 9;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getRestoreDurationIndex(a.label);
      const idxB = getRestoreDurationIndex(b.label);
      if (idxA === 9 && idxB === 9) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "restore_rci_current" || qId === "restore_rci_start") {
    const getRciIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("rci-0")) return 0;
      if (l.includes("rci-10")) return 10;
      if (l.includes("rci-1")) return 1;
      if (l.includes("rci-2")) return 2;
      if (l.includes("rci-3")) return 3;
      if (l.includes("rci-4")) return 4;
      if (l.includes("rci-5")) return 5;
      if (l.includes("rci-6")) return 6;
      if (l.includes("rci-7")) return 7;
      if (l.includes("rci-8")) return 8;
      if (l.includes("rci-9")) return 9;
      if (l.includes("not familiar")) return 11;
      return 12;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getRciIndex(a.label);
      const idxB = getRciIndex(b.label);
      if (idxA === 12 && idxB === 12) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "restore_regen_tech_awareness") {
    const getRegenIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("familiar with specific")) return 0;
      if (l.includes("heard the concept")) return 1;
      if (l.includes("unaware this was")) return 2;
      return 3;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getRegenIndex(a.label);
      const idxB = getRegenIndex(b.label);
      if (idxA === 3 && idxB === 3) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId.startsWith("culture_assoc_")) {
    const getCultureAssocIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("definitely circumcised")) return 0;
      if (l.includes("likely circumcised")) return 1;
      if (l.includes("no significant difference") || l.includes("equally likely")) return 2;
      if (l.includes("likely intact")) return 3;
      if (l.includes("definitely intact")) return 4;
      if (l.includes("unsure / don't know") || l.includes("unsure") || l.includes("don't know")) return 5;
      return 6;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getCultureAssocIndex(a.label);
      const idxB = getCultureAssocIndex(b.label);
      if (idxA === 6 && idxB === 6) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "circ_notice_same_status" || qId === "intact_notice_same_status" || qId === "intact_notice_diff_status") {
    const getNoticeIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("almost always")) return 0;
      if (l.includes("frequently")) return 1;
      if (l.includes("sometimes")) return 2;
      if (l.includes("rarely notice")) return 3;
      if (l.includes("never really")) return 4;
      if (l.includes("not applicable")) return 5;
      return 6;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getNoticeIndex(a.label);
      const idxB = getNoticeIndex(b.label);
      if (idxA === 6 && idxB === 6) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  if (qId === "demo_generation" || qId === "generation") {
    const getGenIndex = (label) => {
      const l = String(label || "").toLowerCase();
      if (l.includes("alpha")) return 0;
      if (l.includes("gen z") || l.includes("generation z")) return 1;
      if (l.includes("millennial") || l.includes("gen y")) return 2;
      if (l.includes("xennial")) return 3;
      if (l.includes("gen x") || l.includes("generation x")) return 4;
      if (l.includes("boomer")) return 5;
      if (l.includes("silent")) return 6;
      if (l.includes("not sure") || l.includes("prefer not") || l.includes("unknown")) return 7;
      return 8;
    };

    return [...distArray].sort((a, b) => {
      const idxA = getGenIndex(a.label);
      const idxB = getGenIndex(b.label);
      if (idxA === 8 && idxB === 8) {
        return (b.n || 0) - (a.n || 0);
      }
      return idxA - idxB;
    });
  }

  return distArray;
};

