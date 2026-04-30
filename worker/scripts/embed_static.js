
const passages = [
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
    text: `The single most impactful way to support this research right now is to help us gather as many diverse perspectives as possible. Our goal is to reach at least 500+ responses to ensure robust and meaningful findings. Share the Survey Link (http://circumsurvey.online) with friends, family, and online communities. Use our printable flyers, handout cards, QR codes, and 2-page overview PDF.`
  },
  {
    id: "get_involved_4",
    title: "Volunteer Your Skills & Expertise",
    text: `This project is a significant undertaking. We are currently particularly interested in help with: 1. Translation & Localization (Spanish, Hebrew, German, Arabic). 2. Data Analysis & Visualization. 3. Regional Outreach & Promotion. 4. Content Creation & Writing Support. Interested in volunteering? Please contact us at: volunteer@circumsurvey.online`
  },
  {
    id: "resources_1",
    title: "The Accidental Intactivist Manifesto",
    text: `The Accidental Intactivist Manifesto pulls back the curtain on a normalized harm, tracing how culture, medicine, and silence converge to cut away not just skin—but truth. It is the foundational document behind this entire research effort. It weaves together personal insight, scientific inquiry, and cultural critique into a bold, eye-opening call to action. You can download the full 117-page manifesto PDF.`
  },
  {
    id: "resources_2",
    title: "Key Project Supporters & Advocacy Partners",
    text: `We are proud to collaborate with: 
- DOCTORS OPPOSING CIRCUMCISION (DOC): A Seattle-based organization of medical professionals providing scientific/ethical arguments against infant circumcision.
- INTACT GLOBAL: Legal advocacy organization led by attorney Eric Clopper working to end forced genital cutting worldwide through strategic litigation.
- GENITAL AUTONOMY LEGAL DEFENSE & EDUCATION FUND (GALDEF): Providing strategic advice from researcher Tim Hammond.
- WASHINGTON INITIATIVE FOR BOYS AND MEN (WIBM): Political advocacy organization in Washington State focusing on policies for men and boys, including bodily integrity.`
  }
];

async function main() {
  const url = "https://findings.circumsurvey.online/api/ai/embed_static";
  
  console.log(`Sending ${passages.length} passages to ${url}...`);
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
