import { FONT } from "../styles/tokens";

const SectionBlock = ({ title, children }) => (
  <section style={{
    background: "var(--c-bgCard)",
    color: "var(--c-text)",
    borderRadius: 12,
    padding: "3rem 2.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid var(--c-ghost)",
  }}>
    <h2 style={{ 
      fontFamily: FONT.display, 
      fontSize: "2rem", 
      color: "var(--c-textBright)", 
      borderBottom: `2px solid var(--c-ghost)`,
      paddingBottom: "1rem",
      marginBottom: "2rem",
      marginTop: 0
    }}>
      {title}
    </h2>
    <div style={{
      fontFamily: FONT.body,
      fontSize: "1.05rem",
      lineHeight: 1.6,
      color: "var(--c-textBright)",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem"
    }}>
      {children}
    </div>
  </section>
);

export default function AboutPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "2rem 1.5rem 6rem",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{
          fontSize: "1.1rem",
          lineHeight: 1.6,
          color: "var(--c-textBright)",
          marginBottom: "4rem",
          textAlign: "center"
        }}>
          "The Accidental Intactivist's Inquiry" is an interactive Special Report representing the culmination of an independent, grassroots research project. Designed to explore a deeply personal yet widely misunderstood topic with nuance, rigor, and respect, this page outlines the architectural methodology, hypotheses, and ethical principles that power the data explorer you see today.
        </p>

        <SectionBlock title="The 'Why' Behind This Inquiry">
          <p>My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born from a lifetime of observation and a single, persistent question.</p>
          <p>By a conscious choice of my parents in the 1970s, I grew up intact (uncircumcised); an outlier in a US culture where routine infant circumcision (RIC) was the unquestioned norm. This meant I became an "accidental witness" to a profound alteration that nearly all my friends, my partners, and men in the media had undergone, something my parents had simply dismissed as unnecessary.</p>
          <p>In a culture so obsessed with sex, where we seemingly want every experience to be as good as possible, how did this one topic become so taboo? I realized that while everyone seems to have an opinion about whether infant circumcision should or shouldn't be done, I almost never hear adults talking honestly about their own lived experience with their own anatomy.</p>
          <p>I had so many questions. How did men actually feel about being cut? Was it something they ever thought about? What was their sexual experience truly like? This Special Report is the culmination of finally asking those questions.</p>
          <p>I created this inquiry to be a confidential, structured, and unbiased space to break that silence. It turns out it's a conversation a lot of people have been waiting to have. We are now the custodians of hundreds of vivid, often heartbreaking accounts of a procedure performed on millions, usually without their consent. The data modules presented in this application are designed to bring these essential stories into the light.</p>
          
          <div style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: `1px dashed var(--c-ghost)`,
            fontFamily: FONT.mono || "monospace",
            fontSize: "0.85rem",
            color: "var(--c-goldBright)",
            letterSpacing: "0.05em"
          }}>
            TONE PETTIT // LEAD RESEARCHER // THE ACCIDENTAL INTACTIVIST
          </div>
        </SectionBlock>

        <SectionBlock title="Central Hypothesis">
          <p>This project was built around a central guiding question born from decades of observation: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?"</p>
          <p>From this question, we derived our core working hypothesis which this dataset rigorously tests:</p>
          <div style={{ 
            background: "rgba(212,160,48,0.05)", 
            borderLeft: `2px solid var(--c-goldBright)`, 
            padding: "1.5rem", 
            fontFamily: FONT.mono || "monospace", 
            margin: "2rem 0", 
            color: "var(--c-textBright)",
            fontSize: "0.95rem",
            lineHeight: 1.6
          }}>
            "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it."
          </div>
        </SectionBlock>

        <SectionBlock title="Methodology & Architecture">
          <p>To achieve our goal of gathering nuanced, high-quality data, the survey and subsequent application were designed with specific structural parameters:</p>
          <ul style={{ paddingLeft: "1.5rem", fontFamily: FONT.body, color: "var(--c-textBright)" }}>
            <li style={{ marginBottom: "1rem" }}><strong style={{ color: "var(--c-goldBright)" }}>Global Cohort Filtering:</strong> Comprehensive demographic data including country of birth, generation, and relationship to the topic allow for real-time correlational analysis via our interactive Demographic Filter Bar.</li>
            <li style={{ marginBottom: "1rem" }}><strong style={{ color: "var(--c-goldBright)" }}>Cultural Context Pathways:</strong> A branching architecture directs participants down pathways relevant to their upbringing (i.e., in a culture where circumcision is the norm vs. intactness), ensuring data is framed appropriately for their lived reality.</li>
            <li style={{ marginBottom: "1rem" }}><strong style={{ color: "var(--c-goldBright)" }}>Pre-Status Experiential Baseline:</strong> A unique data module where all participants reflect on sensation, orgasm, and body image before delving into their specific anatomical status pathway, establishing a less biased comparative baseline.</li>
            <li style={{ marginBottom: "1rem" }}><strong style={{ color: "var(--c-goldBright)" }}>Qualitative Integration:</strong> We utilize advanced text processing and sentiment analysis to weave rich, open-ended narrative insights directly alongside multiple-choice quantitative data.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Acknowledgements & Disclaimer">
          <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.1em", color: "var(--c-textBright)", fontSize: "1.1rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>IN RECOGNITION OF TIM HAMMOND</h3>
          <p style={{ marginTop: 0, marginBottom: "2rem", fontSize: "0.95rem" }}>
            This project would not exist without the foundational research and lifelong advocacy of Tim Hammond (NOHARMM/GALDEF). His pioneering surveys on circumcision harm paved the way for modern inquiries like this one to surface. We acknowledge his mentorship, friendship, and unyielding dedication to genital autonomy.
          </p>

          <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.1em", color: "var(--c-textBright)", fontSize: "1.1rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>COMMUNITY SUPPORT</h3>
          <p style={{ marginTop: 0, marginBottom: "2rem", fontSize: "0.95rem" }}>
            Thank you to the followers and supporters of r/FriendsoftheFrenulum and the broader Reddit intactivist community. While this survey is an independent inquiry with a self-selected sample, it was these grassroots networks that provided the necessary distribution and volume to make this dataset possible. 
          </p>

          <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.1em", color: "var(--c-textBright)", fontSize: "1.1rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>SUBSTACK SUPPORTERS</h3>
          <p style={{ marginTop: 0, marginBottom: "2rem", fontSize: "0.95rem" }}>
            Special thanks to our founding Substack member, <strong style={{ color: "var(--c-goldBright)" }}>David Montane</strong>, for helping fund and sustain this independent research.
          </p>

          <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.1em", color: "var(--c-textBright)", fontSize: "1.1rem", margin: "0 0 0.5rem 0", borderTop: "1px dashed var(--c-ghost)", paddingTop: "2rem", textTransform: "uppercase" }}>DISCLAIMERS</h3>
          <ul style={{ paddingLeft: "1.5rem", margin: 0, display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.95rem" }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Not Medical Advice:</strong> This project is an independent research inquiry and should not be used as a substitute for professional medical advice, diagnosis, or treatment.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Sample Limitations:</strong> The data presented here is derived from a self-selected sample of respondents. While highly robust in its internal consistency, it does not claim to represent randomized population prevalence.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Data Privacy:</strong> All qualitative narratives and quantitative data points have been fully anonymized to protect respondent privacy.</li>
          </ul>
        </SectionBlock>

      </div>
    </div>
  );
}
