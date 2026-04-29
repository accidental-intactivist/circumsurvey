

const passages = [
  {
    id: "about_1",
    title: "About the Project & Methodology",
    text: `"The Accidental Intactivist's Inquiry" is more than just a survey; it is an independent research project designed to explore a deeply personal yet widely misunderstood topic with nuance, rigor, and respect for all perspectives. This page outlines the project's goals, the unique structure of the survey, and our commitment to ethical principles.`
  },
  {
    id: "about_2",
    title: "Central Research Hypothesis",
    text: `This project is built around a central guiding question born from the "Accidental Intactivist's" lifelong observations: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?" From this question, we derive our core working hypothesis: "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it." This survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences.`
  },
  {
    id: "about_3",
    title: "Research Philosophy & Stance on Bias",
    text: `We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right. Our primary inquiry stems from the ethical question of whether non-consensual, medically unnecessary surgery should be performed on children. While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis.`
  },
  {
    id: "faq_1",
    title: "FAQ: This survey seems biased",
    text: `Q: This whole project just seems like biased intactivist propaganda designed to push an agenda. Why should anyone take this seriously?
A: Is it biased? Yes, in a way. This survey is conducted from a specific perspective: one that starts with the ethical question of whether a non-consensual, irreversible, and often painful surgical procedure should be routinely performed on healthy children for reasons that are not medically immediate. This perspective values bodily autonomy as a fundamental right. Is it propaganda? No. Propaganda typically relies on omitting facts, emotional manipulation, and discouraging critical thought. This project is designed to do the opposite. We are actively seeking all experiences—positive, negative, and neutral—from intact, circumcised, and restoring individuals.`
  },
  {
    id: "faq_2",
    title: "FAQ: Health benefits & hygiene",
    text: `Q: What about the health benefits? I was told it's more hygienic and prevents diseases.
A: The purported health benefits of routine infant circumcision are highly contested and, in many cases, have been debunked or found to be statistically insignificant when weighed against the risks. Major medical bodies around the world (outside the US) do not recommend it. The "hygiene" argument, for instance, is often seen as a relic from an era before modern plumbing; simple, normal washing is sufficient for an intact penis, just as it is for any other body part.`
  },
  {
    id: "faq_3",
    title: "FAQ: Adult circumcision vs Infant",
    text: `Q: I (or someone I know) chose to be circumcised as an adult and am happy with the decision.
A: Adult vs. Infant Circumcision: An adult making an informed, consensual decision about their own body is exercising their bodily autonomy. That is fundamentally different from a non-consensual, non-therapeutic procedure performed on a healthy infant who has no say in the matter. Our survey and advocacy focus primarily on the ethics of the latter.`
  }
];

async function main() {
  const url = "https://findings.circumsurvey.online/api/ai/embed_static";
  // To run this locally against dev: const url = "http://localhost:8787/api/ai/embed_static";
  
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
