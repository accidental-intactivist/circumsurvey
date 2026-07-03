
const passages = [
  // ── ABOUT THE AUTHOR ─────────────────────────────────────────────────────
  {
    id: "about_author",
    title: "About the Author: Tone Pettit",
    text: `Who is the 'Accidental Intactivist'? That's me, Tone Pettit, the survey author. I am a male, independent Seattle-based researcher and data scientist who, by a conscious choice of my parents in the 1970s, grew up as an intact outlier in the US—a culture where routine infant circumcision was the unquestioned norm. This meant I became an "accidental witness" to a profound alteration that nearly all my friends, partners, and men in the media had undergone—something my parents had simply dismissed as unnecessary. I created this inquiry to be a confidential, structured, and unbiased space to break the silence around this topic. Contact: [email protected], reddit.com/u/c4charkey. The full manifesto is available on Substack (The Accidental Intactivist's Guide) and Medium, with community discussion on Reddit at r/FriendsoftheFrenulum.`
  },

  // ── ABOUT THE PROJECT ────────────────────────────────────────────────────
  {
    id: "about_methodology_1",
    title: "Methodology & Central Research Hypothesis",
    text: `The central hypothesis of this project is: "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it." The survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences. Key themes explored include: lived experiences (physical sensation, sexual function, orgasm quality/duration, lubrication needs, body image, psychological well-being), parental decision-making factors, cultural narratives and misconceptions, anatomical awareness, bodily autonomy and ethics, and the impact on allies and observers.`
  },
  {
    id: "about_methodology_2",
    title: "Survey Structure & Methodology Highlights",
    text: `The survey was designed with several unique structural features: Global & Regional Focus with comprehensive demographic data for cross-cultural correlational analysis. A Cultural Context Gateway that directs participants down pathways relevant to their upbringing (norm vs. non-norm cultures). Specific optional sections for Christian, Jewish, and Islamic perspectives. A Pre-Status Experiential Baseline where all participants reflect on sensation, orgasm, and body image BEFORE delving into their specific anatomical status pathway, allowing for less biased comparative data. A mix of qualitative (open-ended) and quantitative (multiple-choice/scale) questions. Absolute anonymity—no personally identifiable information is collected with responses.`
  },
  {
    id: "about_bias",
    title: "Research Philosophy & Stance on Bias",
    text: `We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right. Our primary inquiry stems from the ethical question of whether non-consensual, medically unnecessary surgery should be performed on children. While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis. Key features: We actively solicit experiences from individuals who are satisfied with their circumcision. The survey asks about lived sexual experiences before asking about anatomical status. We acknowledge our initial sample is self-selected; Phase 2 focuses on broadening to more neutral and diverse populations.`
  },
  {
    id: "about_data_security",
    title: "Data Security & Participant Confidentiality",
    text: `Our system is designed with a "privacy-by-design" philosophy. Absolute Anonymity in the Dataset: The survey is configured to be 100% anonymous by default. Your answers are not linked to any personal identifiers. Secure Separation for Follow-Up: For participants who voluntarily provide contact information for potential follow-up, that information is immediately and automatically stripped from the survey data and stored in a separate, encrypted, and highly access-restricted file. State-of-the-Art Pseudonymization: We use a secure, salted hashing system to link these two separate files. It is not possible to reverse-engineer your identity from the survey responses. Your story is safe with us.`
  },
  {
    id: "about_ethical_commitment",
    title: "Commitment to Ethical Research",
    text: `While this project is an independent initiative and not affiliated with an academic institution (and thus has not undergone formal Institutional Review Board/IRB review), it has been designed with core ethical principles at the forefront: Informed Consent (survey introduction clearly outlines purpose, data use, risks, and voluntary nature), Anonymity & Confidentiality (no IPs or emails collected with responses), Voluntary Participation (all questions optional, participants may skip or exit at any time), Minimizing Harm (content note provided, questions framed to be exploratory and non-judgmental), and Beneficence (the ultimate aim is to contribute positively to public understanding and advocate for bodily autonomy).`
  },
  {
    id: "about_impact",
    title: "Why This Survey Matters & Potential Impact",
    text: `This survey is more than a collection of data; it is an act of intervention in a profound and protected cultural silence. Our potential impact: It fills a critical knowledge gap—creating one of the most comprehensive public datasets on real-world circumcision outcomes. It challenges misinformation with lived truth—documenting firsthand testimonials as a counter-narrative to outdated myths. It empowers individual voices—offering a structured, anonymous space for people from all perspectives. It informs the future of advocacy and education—providing data and messaging to support parents in making truly informed choices and to fuel legal/political advocacy protecting bodily autonomy.`
  },

  // ── STRATEGIC ALLIANCES ──────────────────────────────────────────────────
  {
    id: "about_alliances",
    title: "Strategic Alliances & Collaborators",
    text: `We are in active collaboration with: DOCTORS OPPOSING CIRCUMCISION (DOC)—a foundational, Seattle-based organization of medical professionals advocating for genital autonomy since 1995. INTACT GLOBAL—led by attorney Eric Clopper; our survey is an active tool in their effort to prepare a landmark Equal Protection lawsuit in Washington State. GENITAL AUTONOMY LEGAL DEFENSE & EDUCATION FUND (GALDEF)—strategic advice from foundational researcher Tim Hammond and attorney Eric Clopper, opening a path toward potential academic review at Quinnipiac University. WASHINGTON INITIATIVE FOR BOYS AND MEN (WIBM)—the leading political advocacy group for men's and boys' issues in Washington State; we provide WA-specific data for their legislative efforts.`
  },

  // ── GET INVOLVED ─────────────────────────────────────────────────────────
  {
    id: "get_involved_1",
    title: "Support the Inquiry & Get Involved",
    text: `Thank you for your interest in "The Accidental Intactivist's Inquiry" and the broader mission to foster informed dialogue about male genital anatomy, autonomy, and cultural assumptions. This independent research project thrives on community engagement and support. Below are several ways you can contribute to this vital work: Become a Survey Ambassador, Volunteer Your Skills & Expertise, Support Independent Research, and Support Our Strategic Alliances & Collaborators.`
  },
  {
    id: "get_involved_2",
    title: "URGENT CALL TO ACTION! Intact Global Lawsuit",
    text: `Beyond our broader research, this project is now actively supporting a critical, time-sensitive legal effort with the potential to create historic change for children's rights in Washington State. Leaders from Intact Global, Doctors Opposing Circumcision, and the Washington Initiative for Boys and Men (WIBM) are preparing a potential Equal Protection lawsuit. This legal challenge argues that the state's failure to protect boys from non-consensual genital cutting, while protecting girls, is a violation of its own constitution. To move forward, this lawsuit needs a courageous plaintiff: A parent who regrets the decision, whose son was born AND circumcised in WASHINGTON STATE ON or AFTER March 1, 2023. Contact plantiff@circumsurvey.online or take the survey to get involved.`
  },
  {
    id: "get_involved_3",
    title: "Become a Survey Ambassador",
    text: `The single most impactful way to support this research right now is to help us gather as many diverse perspectives as possible. Share the Survey Link (http://circumsurvey.online) with friends, family, and online communities. Use our printable flyers, handout cards, QR codes, and 2-page overview PDF.`
  },
  {
    id: "get_involved_4",
    title: "Volunteer Your Skills & Expertise",
    text: `This project is a significant undertaking. We are currently particularly interested in help with: 1. Translation & Localization (Spanish, Hebrew, German, Arabic). 2. Data Analysis & Visualization. 3. Regional Outreach & Promotion. 4. Content Creation & Writing Support. Interested in volunteering? Please contact us at: volunteer@circumsurvey.online`
  },

  // ── RESOURCES ─────────────────────────────────────────────────────────────
  {
    id: "resources_1",
    title: "The Accidental Intactivist Manifesto",
    text: `The Accidental Intactivist Manifesto pulls back the curtain on a normalized harm, tracing how culture, medicine, and silence converge to cut away not just skin—but truth. It is the foundational document behind this entire research effort. It weaves together personal insight, scientific inquiry, and cultural critique into a bold, eye-opening call to action. A full, clean PDF version is available for download, sharing, and archiving on the Resources & Downloads page. Also available on Substack (The Accidental Intactivist's Guide) and Medium.`
  },

  // ── GLOSSARY OF TERMS & ACRONYMS ─────────────────────────────────────────
  {
    id: "glossary",
    title: "Project Glossary: Acronyms and Specialized Terms",
    text: `The survey and findings use specific terminology:
- RIC: Routine Infant Circumcision.
- Intact: Uncircumcised.
- RCI (Real Coverage Index) / CI (Coverage Index): Standardized 0-10 scales used by the foreskin restoration community to measure skin coverage and progress. 
  * RCI/CI 0-3: Tightly cut to loose skin, but the flaccid glans is completely exposed.
  * RCI/CI 4: The 'hump' stage, where loose skin begins to bunch up directly behind the corona but doesn't consistently roll over it.
  * RCI/CI 5-6: Partial to full flaccid glans coverage.
  * RCI/CI 7-9: Erect coverage begins; partial to full coverage while fully erect.
  * RCI/CI 10: Full erect coverage with skin overhang (acroposthion/pucker).
- Restoration / Tugging: The non-surgical process of applying tension to penile skin to stimulate tissue expansion (mitosis), eventually growing enough skin to cover the glans.
- VMMC: Voluntary Medical Male Circumcision (typically in African HIV prevention programs).
- MGM/FGM: Male/Female Genital Mutilation.`
  },

  // ── FAQ: ABOUT THE SURVEY ────────────────────────────────────────────────
  {
    id: "faq_who_is_ai",
    title: "FAQ: Who is the Accidental Intactivist?",
    text: `That's me, Tone Pettit the survey author. I'm an independent Seattle-based researcher and data scientist who, by a conscious choice of my parents, grew up intact—an outlier in the US. This experience has given me a lifelong "accidental anthropologist" perspective. You can find my research on Substack (The Accidental Intactivist's Guide), Medium (the full Manifesto), and Reddit (r/FriendsoftheFrenulum). Email: [email protected]`
  },
  {
    id: "faq_purpose",
    title: "FAQ: Purpose of the Survey",
    text: `What is the purpose of this survey and how will the data be used? This is an independent research project. Its primary goal is to gather a broad spectrum of anonymous, firsthand experiences to create public educational content for the 'Accidental Intactivist's Guide' series. This will include articles, data visualizations, and in-depth analyses. The aggregated, anonymized data will be a resource to support advocacy for bodily autonomy and contribute to a more informed public dialogue.`
  },
  {
    id: "faq_audience",
    title: "FAQ: Intended Audience for Results",
    text: `The primary audience is the general public, especially expectant parents, young men, and partners who are seeking honest, non-sensationalized information. A secondary audience includes healthcare professionals, educators, advocates, and researchers who can use this data to inform their own work. The goal is to create material that is accessible to everyone, from the deeply engaged to the newly curious.`
  },
  {
    id: "faq_pro_circ_engagement",
    title: "FAQ: Engaging with Pro-Circumcision Arguments",
    text: `Yes, absolutely. A core part of this project has been to understand the full landscape of belief surrounding this topic. The Manifesto spends significant time analyzing and debunking the most common pro-circumcision arguments (hygiene, disease prevention, aesthetics), tracing their historical roots. This survey captures the perspectives of those who are satisfied with being circumcised and believe it was beneficial, right alongside those who feel harmed. A true understanding is impossible without engaging with all viewpoints.`
  },
  {
    id: "faq_propaganda_response",
    title: "FAQ: Is This Biased Propaganda?",
    text: `Is it biased? Yes, in a way. This survey is conducted from a perspective that starts with the ethical question of whether non-consensual, irreversible surgery should be routinely performed on healthy children. Is it propaganda? No. Propaganda relies on omitting facts and discouraging critical thought. This project does the opposite—we actively seek all experiences. Why take it seriously? Because it's a genuine inquiry into a "transparent monster"—a practice so normalized it's rarely examined seriously. We are not telling people how to feel—we are creating a platform for them to anonymously share how they actually feel. The final data, whatever it reveals, will speak for itself.`
  },
  {
    id: "faq_american_centric",
    title: "FAQ: American-Centric Bias Concern",
    text: `The survey author's perspective is rooted in the US cultural anomaly. However, the survey has been updated to be more globally inclusive based on community input. Changes include: Removing US-centric language (e.g., replacing "born abroad" with neutral options). Adding options that acknowledge that for most of the world, being intact is the default. Broadening questions about parental decisions to include various cultural and community contexts.`
  },
  {
    id: "faq_ethics_oversight",
    title: "FAQ: Ethics Board / IRB Oversight",
    text: `As an independent initiative, this project does not have formal Institutional Review Board (IRB) oversight. Recognizing this, we have designed the survey with core ethical principles at the forefront: fully informed consent, absolute anonymity (no IPs or personal data collected with responses), and voluntary participation. We are committed to handling this sensitive data responsibly and respectfully, with the goal of empowering voices, not causing further harm.`
  },
  {
    id: "faq_language_translation",
    title: "FAQ: Survey Language & Translation",
    text: `Currently, the survey is only available in English. However, a major goal is to translate it into other languages, especially Spanish, French, and German, to gather a more representative global dataset. This is a volunteer-driven effort. If you are a fluent speaker and are interested in assisting with translation, please visit the Get Involved & Support page or contact volunteer@circumsurvey.online.`
  },
  {
    id: "faq_survey_specifics",
    title: "FAQ: Survey Specifics & Foreskin Regeneration",
    text: `While brief promotional posts aim for broad reach, the survey itself is highly detailed and specific. It includes a dedicated Restoration Pathway with questions about awareness of regeneration research (like Foregen's work on actual foreskin regeneration). The broad data gathered supports all avenues of healing, reclamation, and informed choice.`
  },
  {
    id: "faq_survey_duration",
    title: "FAQ: How Long Will the Survey Be Open?",
    text: `The survey will remain open for an extended period to gather as many responses as possible. Our initial goal of 500 participants has been reached. We will announce any plans to close the survey well in advance on the Accidental Intactivist's Guide Substack.`
  },
  {
    id: "faq_raw_data_release",
    title: "FAQ: Raw Data Release for Researchers",
    text: `We are committed to contributing to the broader research community. While we will not release raw open-ended text responses to protect individual anonymity, we are exploring ways to responsibly share the fully anonymized quantitative dataset (multiple-choice and scale answers) with other allied researchers and data scientists upon request, once our initial analysis is complete.`
  },
  {
    id: "faq_org_collaboration",
    title: "FAQ: Working with Intactivist Organizations",
    text: `This is currently an independent research project led by The Accidental Intactivist. However, we welcome collaboration and signal-boosting from all organizations that support bodily autonomy and informed choice. We are actively working with DOC (Doctors Opposing Circumcision), Intact Global, GALDEF (Genital Autonomy Legal Defense & Education Fund), and WIBM (Washington Initiative for Boys and Men). Contact us via the Get Involved & Support page.`
  },
  {
    id: "faq_anonymous_methodology",
    title: "FAQ: Why Anonymous Survey? Self-Selection Bias",
    text: `Anonymous online surveys do have inherent limitations, such as self-selection bias. However, their great strength for a topic as personal and stigmatized as this is their ability to reach individuals who might only feel comfortable sharing candidly under the protection of anonymity. Both anonymous surveys and personal interviews contribute valuable, though different, pieces to the overall puzzle. The goal is to map the spectrum of self-reported experience, which is a valuable dataset in its own right.`
  },
  {
    id: "faq_manifesto_download",
    title: "FAQ: Downloading the Manifesto",
    text: `A full, clean PDF version of "The Accidental Intactivist Manifesto" is available for download, sharing, and archiving. You can find it on the Resources & Downloads page. It is also available in full on Substack (The Accidental Intactivist's Guide) and Medium.`
  },

  // ── FAQ: TAKING THE SURVEY ───────────────────────────────────────────────
  {
    id: "faq_survey_length",
    title: "FAQ: Survey Length & Branching",
    text: `The survey looks extensive but uses branching logic, meaning you only see sections relevant to your experience (e.g., if you're intact, you won't see questions about restoration). This significantly reduces the actual number of questions. Every question is optional, so you can skip any that feel too time-consuming. Even partial responses are helpful. The survey takes approximately 15-60 minutes depending on your pathway.`
  },
  {
    id: "faq_contradictory_answers",
    title: "FAQ: Contradictory or Messy Answers",
    text: `Absolutely not—your response will not be discarded for being contradictory. Human experience is often complex and contradictory, and we welcome that nuance. This survey is not a test with right or wrong answers. We are interested in your genuine, self-reported experiences and perceptions, even if they feel inconsistent. Your entire response is valuable data.`
  },
  {
    id: "faq_circ_and_restoring",
    title: "FAQ: Circumcised AND Restoring—Which Pathway?",
    text: `If you are circumcised and also restoring, we recommend choosing the Restoration Pathway. It's designed to capture that entire process, including questions about your feelings and experiences before you started. The Restoration Pathway now includes an option to also complete the Circumcised Pathway to provide that full context.`
  },
  {
    id: "faq_colorblind_charts",
    title: "FAQ: Colorblind-Friendly Charts",
    text: `Yes, we are aware of accessibility concerns with our charts. All new data visualizations are designed with a high-contrast, colorblind-friendly palette (typically a blue-to-red/orange diverging scale). We are actively working to resolve software-based limitations that sometimes cause legend order mismatches. Our commitment is to present data with the utmost clarity, and we are grateful for the community's help in holding us to that standard.`
  },
  {
    id: "faq_technical_issues",
    title: "FAQ: Technical Issues & Survey Loops",
    text: `Early conditional logic errors that caused issues for some users have been fully corrected. The survey now provides a smooth and accurate user experience. If you encounter any other technical problems, please report them directly to [email protected].`
  },
  {
    id: "faq_restorer_sensitivity",
    title: "FAQ: Restorers—Answering Sensation Questions",
    text: `For general sensation questions that appear before you enter your specific pathway, please answer based on your current overall sensory experience as someone who is restoring or has restored. The dedicated Restoration Pathway contains specific questions about the changes you've experienced over time due to your restoration efforts, including before and during the process.`
  },
  {
    id: "faq_mixed_religion",
    title: "FAQ: Mixed-Religion Family",
    text: `The religion section has been updated to be more inclusive. You can now select all religious or cultural traditions that apply to your background or upbringing, providing a more accurate picture for those from mixed-heritage families.`
  },
  {
    id: "faq_save_progress",
    title: "FAQ: Saving Survey Progress",
    text: `Unfortunately, to ensure robust anonymity, Google Forms does not allow us to enable the 'save and continue later' feature (which requires user sign-in). We recommend setting aside 15-60 minutes to complete it in one sitting.`
  },
  {
    id: "faq_see_results",
    title: "FAQ: How to See Results",
    text: `Stay up to date with the Accidental Intactivist's Guide on Substack (https://substack.com/@theaccidentalintactivist). We publish preliminary findings, deep-dive analyses, and will eventually publish a comprehensive report. The Findings site at findings.circumsurvey.online also provides interactive data exploration.`
  },

  // ── FAQ: BIG QUESTIONS ───────────────────────────────────────────────────
  {
    id: "faq_feel_fine",
    title: "FAQ: 'I Was Circumcised and I Feel Fine'",
    text: `That's a valid and common perspective. Many people are perfectly content. This inquiry isn't meant to invalidate your personal experience. Rather, it aims to explore the full spectrum of outcomes—physical, sexual, and psychological—and to question the ethical basis of performing a non-consensual, irreversible surgery on a child who cannot consent, especially when outcomes and experiences vary so widely.`
  },
  {
    id: "faq_health_benefits",
    title: "FAQ: Health Benefits & Hygiene",
    text: `The purported health benefits of routine infant circumcision are highly contested and, in many cases, have been debunked or found to be statistically insignificant when weighed against the risks. Major medical bodies around the world (outside the US) do not recommend it. The 'hygiene' argument is often seen as a relic from an era before modern plumbing; simple, normal washing is sufficient for an intact penis, just as it is for any other body part.`
  },
  {
    id: "faq_adult_circumcision",
    title: "FAQ: Adult Circumcision vs. Infant Circumcision",
    text: `An adult making an informed, consensual decision about their own body is exercising their bodily autonomy. That is fundamentally different from a non-consensual, non-therapeutic procedure performed on a healthy infant who has no say in the matter. Our survey and advocacy focus primarily on the ethics of the latter. We welcome perspectives of those circumcised as adults, as their motivations and outcomes are an important part of the overall picture.`
  },
  {
    id: "faq_anti_religious",
    title: "FAQ: Anti-Religious or Anti-Semitic Concerns",
    text: `Absolutely not. This inquiry is a critique of a procedure, not a faith. This survey was developed with direct input from and contains specific pathways for members of Jewish, Christian, and Islamic communities to ensure their perspectives are represented accurately and respectfully. Many people within these faiths are also questioning the practice and exploring alternatives that honor both tradition and bodily integrity. This is a universal children's rights issue.`
  },
  {
    id: "faq_vmmc_africa",
    title: "FAQ: VMMC (Voluntary Medical Male Circumcision) in Africa & HIV",
    text: `While some studies in specific, high-HIV-prevalence regions of Africa showed a relative risk reduction, these findings are intensely criticized for methodological flaws, the vast difference between relative and absolute risk (which is often very small), and significant ethical concerns about consent quality in trial settings. Crucially, extrapolating data from consenting adults in high-risk environments to justify non-consensual circumcision of infants in low-risk countries is a major scientific and ethical leap that many medical bodies worldwide reject.`
  },
  {
    id: "faq_variation_results",
    title: "FAQ: Why Circumcision Results Vary So Much",
    text: `There is no single, universally agreed-upon standard for what a "correct" circumcision looks like. Different practitioners use different clamping devices (Gomco, Mogen, or Plastibell) or freehand techniques, and they make individual judgments about how much skin to remove. This leads to huge variation in outcomes—what the author calls the "aesthetic lottery"—regarding scar placement, tightness, and the amount of mobile skin left. This lack of standardization is one of the often-overlooked risks.`
  },
  {
    id: "faq_restoration_explained",
    title: "FAQ: What Is Foreskin Restoration?",
    text: `Foreskin restoration is a process where individuals use non-surgical methods (like manual stretching or specialized devices) to gradually expand their existing skin to create a new foreskin-like covering for the glans. Many restorers report significant improvements in sensitivity, sexual function, and psychological well-being. While it cannot regenerate the specific nerve endings that were removed, it can restore gliding motion and glans coverage. The survey has a dedicated Restoration Pathway to capture these experiences.`
  },
  {
    id: "faq_women_partners",
    title: "FAQ: Why Women & Partners Should Care",
    text: `The physical and emotional state of a partner directly impacts intimacy. Understanding their anatomy, potential sensory differences, or any psychological baggage related to their circumcision can lead to better communication, empathy, and a more connected sexual experience. It's also a fundamental issue of children's rights and bodily autonomy, which affects everyone.`
  },

  // ── FAQ: GENERAL THOUGHTS & FEELINGS ─────────────────────────────────────
  {
    id: "faq_anger_trauma",
    title: "FAQ: Anger & Trauma—Is This a Safe Space?",
    text: `Yes. Absolutely. This survey was created with the understanding that for many, this is not a neutral topic but a source of deep pain, anger, and trauma. The anonymous open-ended questions are designed to be a space where you can articulate those feelings without judgment. Your raw, honest experience is a vital part of the truth we are seeking to document. Your story matters and is treated with respect.`
  },
  {
    id: "faq_regret_vs_resentment",
    title: "FAQ: Regret vs. Resentment Distinction",
    text: `This is a crucial distinction that community members helped us understand: "Regret" often implies agency in a decision, while "resentment" more accurately describes the feeling of having been harmed by a choice someone else made for you. While some early questions use "regret" as a catch-all, this feedback is directly influencing our analysis. In published findings, we make a conscious effort to use more precise language like resentment, grief, and anger to more accurately reflect the nature of the experiences being shared.`
  },
  {
    id: "faq_parental_regret",
    title: "FAQ: Parental Regret—Is This a Space for Parents?",
    text: `Yes, absolutely. Your perspective is incredibly important and welcome. The Observer, Partner & Ally Pathway has questions specifically for parents to reflect on their decision-making process. The survey is a judgment-free zone designed to understand all experiences, including the difficult emotions of parental regret. Sharing your story can help other parents navigate this complex choice with more information and awareness.`
  },
  {
    id: "faq_shaming_parents",
    title: "FAQ: Concern About Shaming Parents",
    text: `Our goal is to critique a cultural and medical system, not to shame individual parents who often made decisions based on limited, biased, or incomplete information provided by trusted authorities. Our preliminary data shows that systemic pressures—like institutional medical norms and a lack of counter-information—are seen as the primary drivers of this choice. Our analysis focuses on these systemic failures to empower future parents with better information, not to condemn past ones.`
  },
  {
    id: "faq_silenced_voices",
    title: "FAQ: Feeling Silenced by Society",
    text: `This sentiment is at the very core of why The Accidental Intactivist's Inquiry exists. Too many personal stories about male genital anatomy, pleasure, and the impact of circumcision are dismissed, silenced, or ignored. This survey is designed to provide a structured, respectful, and anonymous platform for people to share those candid experiences. Your voice is invaluable, and we are committed to amplifying these often-unheard truths.`
  }
];

async function main() {
  const url = "https://findings.circumsurvey.online/api/ai/embed_static";
  
  console.log(`Sending ${passages.length} passages to ${url}...`);
  console.log(`IDs: ${passages.map(p => p.id).join(", ")}`);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passages })
    });
    
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
