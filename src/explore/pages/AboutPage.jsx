import { FONT } from "../styles/tokens";

const SectionBlock = ({ title, children }) => (
  <section style={{
    background: "var(--c-bgCard)",
    color: "var(--c-text)",
    borderRadius: 8,
    padding: "3rem 2.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    border: "1px solid var(--c-ghost)"
  }}>
    <h2 style={{ 
      fontFamily: FONT.display, 
      fontSize: "2rem", 
      color: "var(--c-textBright)", 
      borderBottom: `2px solid var(--c-ghost)`,
      paddingBottom: "1rem",
      marginBottom: "2rem",
      marginTop: 0
    }}>{title}</h2>
    <div style={{
      fontFamily: FONT.body,
      fontSize: "1.05rem",
      lineHeight: 1.6,
      color: "var(--c-dim)"
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
          "The Accidental Intactivist's Inquiry" is more than just a survey; it is an independent research project designed to explore a deeply personal yet widely misunderstood topic with nuance, rigor, and respect for all perspectives. This page outlines the project's goals, the unique structure of the survey, and our commitment to ethical principles.
        </p>

        <SectionBlock title="From the Lead Researcher: The 'Why' Behind This Inquiry">
          <p>My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born from a lifetime of observation and a single, persistent question.</p>
          <p>By a conscious choice of my parents in the 1970s, I grew up intact (uncircumcised); an outlier in a US culture where routine infant circumcision (RIC) was the unquestioned norm. This meant I became an "accidental witness" to a profound alteration that nearly all my friends, my partners, and men in the media had undergone, something my parents had simply dismissed as unnecessary.</p>
          <p>In a culture so obsessed with sex, where we seemingly want every experience to be as good as possible, how did this one topic become so taboo? I realized that while everyone seems to have an opinion about whether infant circumcision should or shouldn't be done, I almost never hear adults talking honestly about their own lived experience with their own anatomy.</p>
          <p>I had so many questions. How did men actually feel about being cut? Was it something they ever thought about? What was their sexual experience truly like? This survey is my way of finally asking those questions.</p>
          <p>I created this inquiry to be a confidential, structured, and unbiased space to break that silence. It turns out it's a conversation a lot of people have been waiting to have. We are now the custodians of hundreds of vivid, often heartbreaking accounts of a procedure performed on millions, usually without their consent. This page details the methodology behind our mission to bring these essential stories into the light.</p>
          <div style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: `1px solid var(--c-ghost)`,
            fontFamily: FONT.condensed,
            fontSize: "1.1rem",
            color: "var(--c-textBright)"
          }}>
            <strong>Tone Pettit</strong><br />
            The Accidental Intactivist<br />
            Email: <a href="mailto:C4charkey@gmail.com" style={{ color: "var(--c-gold)" }}>C4charkey@gmail.com</a><br />
            Reddit: <a href="https://reddit.com/u/c4charkey" style={{ color: "var(--c-gold)" }} target="_blank" rel="noopener noreferrer">u/c4charkey</a>
          </div>
        </SectionBlock>

        <SectionBlock title="Central Research Hypothesis">
          <p>This project is built around a central guiding question born from the "Accidental Intactivist's" lifelong observations: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?"</p>
          <p>From this question, we derive our core working hypothesis:</p>
          <blockquote style={{ borderLeft: `4px solid var(--c-red)`, paddingLeft: "1.5rem", fontStyle: "italic", margin: "2rem 0", color: "var(--c-textBright)" }}>
            "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it."
          </blockquote>
          <p>This survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences.</p>
        </SectionBlock>

        <SectionBlock title="Key Themes Explored">
          <p>The survey is designed to capture a rich tapestry of experiences and perceptions, focusing on several key areas:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Lived Experiences:</strong> Detailed accounts from intact, circumcised, and restoring individuals regarding physical sensation, sexual function (including orgasm quality/duration, lubrication needs), body image, and psychological well-being.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Parental Decision-Making:</strong> Factors influencing parents' choices regarding circumcision (medical advice, cultural/religious norms, perceived benefits/risks, societal pressures).</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Cultural Narratives & Misconceptions:</strong> Common societal beliefs, stereotypes, and assumptions about intactness versus circumcision (hygiene, health, aesthetics, pleasure).</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Anatomical Awareness:</strong> Understanding of specific genital structures (e.g., foreskin, frenulum) and the physical outcomes of circumcision (scarring, skin mobility).</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Bodily Autonomy & Ethics:</strong> Reflections on consent, children's rights, and the ethical implications of non-therapeutic infant surgery.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Impact on Allies & Observers:</strong> Perspectives from partners, parents, healthcare professionals, researchers, and advocates.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Methodology: Survey Structure Highlights">
          <p>To achieve our goal of gathering nuanced, high-quality data, the survey was designed with several unique structural features:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Global & Regional Focus:</strong> Comprehensive demographic data including country of birth/residence, race/ethnicity, education, socioeconomic status, and religious background allow for robust correlational analysis across different cultures.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Cultural Context Gateway:</strong> A key branching question directs participants down pathways relevant to their upbringing (i.e., in a culture where circumcision is the norm vs. where intactness is the norm), ensuring questions are framed appropriately for their lived reality.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Specific Religious/Cultural Context Sections:</strong> Optional sections for Christian, Jewish, and Islamic perspectives allow for a deeper exploration of how faith traditions inform views on this topic.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Pre-Status Experiential Baseline:</strong> A unique section where all participants reflect on sensation, orgasm, and body image before delving into their specific anatomical status pathway, allowing for less biased comparative data.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Qualitative & Quantitative Data:</strong> A mix of open-ended questions for rich narrative insights and multiple-choice/scale questions for measurable data.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Anonymity Assured:</strong> No personally identifiable information is collected with responses.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Research Philosophy & Stance on Bias">
          <p>We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right. Our primary inquiry stems from the ethical question of whether non-consensual, medically unnecessary surgery should be performed on children.</p>
          <p>While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis.</p>
          <p>Key features to ensure a balanced dataset include:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Gathering All Experiences:</strong> We actively solicit and have dedicated pathways for individuals who are satisfied with their circumcision.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Experience Before Status:</strong> The survey is structured to ask about lived sexual experiences before asking about anatomical status, a design intended to capture more candid comparative data.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Acknowledging Limitations:</strong> We recognize that our initial sample is self-selected. Our goal in Phase 1 is to document the "ground truth" from the most affected communities. Phase 2 of our outreach is focused on broadening this sample to include more neutral and diverse populations.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Data Security & Participant Confidentiality">
          <p>We understand that sharing your personal story requires a profound level of trust. We are committed to honoring that trust with the highest standards of data security and ethical conduct. Your privacy and confidentiality are paramount.</p>
          <p>Our system is designed with a "privacy-by-design" philosophy:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Absolute Anonymity in the Dataset:</strong> The survey is configured to be 100% anonymous by default. Your answers are not linked to any personal identifiers.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Secure Separation for Follow-Up:</strong> For participants who voluntarily and explicitly provide contact information for potential follow-up, that information is immediately and automatically stripped from the survey data. It is stored in a separate, encrypted, and highly access-restricted file.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>State-of-the-Art Pseudonymization:</strong> We use a secure, salted hashing system to link these two separate files. This means that even on the backend, your data is represented by a non-identifiable code. It is not possible to reverse-engineer your identity from the survey responses.</li>
          </ul>
          <p>Our promise is simple: your story is safe with us. It will be used to build a collective voice for change, and your individual identity will be protected every step of the way.</p>
        </SectionBlock>

        <SectionBlock title="Why This Survey Matters & Potential Impact">
          <p>This survey is more than a collection of data; it is an act of intervention in a profound and protected cultural silence. For decades, the conversation around infant circumcision has been dominated by shifting medical justifications and quiet social pressure, while the voices of those with direct, lifelong experience have been largely ignored. This project is designed to change that.</p>
          <p>Our potential impact is multi-layered:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.75rem" }}><strong>IT FILLS A CRITICAL KNOWLEDGE GAP:</strong> We are creating one of the most comprehensive public datasets on the real-world physical, sexual, and psychological outcomes of circumcision, moving beyond simplistic binaries to capture the full spectrum of human experience.</li>
            <li style={{ marginBottom: "0.75rem" }}><strong>IT CHALLENGES MISINFORMATION WITH LIVED TRUTH:</strong> By documenting firsthand testimonials, we provide a powerful, human-centered counter-narrative to the outdated myths and flimsy rationales that have propped up this practice for generations.</li>
            <li style={{ marginBottom: "0.75rem" }}><strong>IT EMPOWERS INDIVIDUAL VOICES:</strong> This is a platform for truth-telling. We offer a structured, anonymous, and respectful space for individuals from all perspectives to contribute their story to a vital conversation, ensuring their experiences are no longer invisible.</li>
            <li style={{ marginBottom: "0.75rem" }}><strong>IT INFORMS THE FUTURE OF ADVOCACY & EDUCATION:</strong> The findings from this research will be a vital resource, providing compelling data and clear messaging to support parents in making truly informed choices, and to fuel the legal and political advocacy that will protect the bodily autonomy of the next generation.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Commitment to Ethical Research">
          <p>While this project is an independent initiative and not affiliated with an academic institution (and thus has not undergone formal Institutional Review Board/IRB review), it has been designed with core ethical principles at the forefront:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Informed Consent:</strong> The survey's introduction clearly outlines its purpose, data use, risks, and voluntary nature, ensuring participants can make an informed decision before beginning.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Anonymity & Confidentiality:</strong> All responses are confidential. No personally identifiable information like IP addresses or emails will be collected with survey responses. Should you voluntarily provide contact information for an optional follow-up interview, it will be stored separately from your survey data to protect your anonymity.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Voluntary Participation:</strong> All questions are optional, and participants may skip any question or exit the survey at any time without penalty.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Minimizing Harm:</strong> We acknowledge the sensitive nature of these topics. A content note is provided at the start of the survey, and questions are framed to be exploratory and non-judgmental.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Beneficence:</strong> The ultimate aim of this research is to contribute positively to public understanding, support individual well-being, and advocate for the fundamental right to bodily autonomy.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Strategic Alliances & Collaborators">
          <p>While this project began as an independent inquiry, our commitment to rigorous, data-driven research has earned the recognition and support of key leaders and organizations in the fields of genital autonomy, legal advocacy, and men's health. We are honored to be in active collaboration and communication with:</p>
          
          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, width: "120px", height: "120px", background: "#fff", borderRadius: "8px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logos/doc.jpg" alt="DOC Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.05em", color: "var(--c-textBright)", fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>DOCTORS OPPOSING CIRCUMCISION (DOC)</h3>
              <p style={{ marginTop: 0 }}>We are proud to be in direct collaboration with DOC, a foundational, Seattle-based organization of medical professionals who have been advocating for genital autonomy since 1995.</p>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, width: "120px", height: "120px", background: "#fff", borderRadius: "8px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logos/intact-global.png" alt="Intact Global Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.05em", color: "var(--c-textBright)", fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>INTACT GLOBAL</h3>
              <p style={{ marginTop: 0 }}>We are honored to be working as a strategic partner with Intact Global and its president, attorney Eric Clopper. Our survey project is now an active tool in their crucial effort to prepare a landmark Equal Protection lawsuit in Washington State, aiming to secure the same legal right to bodily integrity for boys that is already afforded to girls.</p>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, width: "120px", height: "120px", background: "#fff", borderRadius: "8px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logos/galdef.png" alt="GALDEF Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.05em", color: "var(--c-textBright)", fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>GENITAL AUTONOMY LEGAL DEFENSE & EDUCATION FUND (GALDEF)</h3>
              <p style={{ marginTop: 0 }}>We are also grateful for the strategic advice and support from foundational researcher Tim Hammond (NOHARMM/GALDEF) and attorney Eric Clopper (Intact Global), which has opened a path toward potential academic review of our findings with researchers at Quinnipiac University.</p>
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0, width: "120px", height: "120px", background: "#fff", borderRadius: "8px", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logos/wibm.jpg" alt="WIBM Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <h3 style={{ fontFamily: FONT.condensed, letterSpacing: "0.05em", color: "var(--c-textBright)", fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>WASHINGTON INITIATIVE FOR BOYS AND MEN (WIBM)</h3>
              <p style={{ marginTop: 0 }}>We are actively working with WIBM, the leading political advocacy group for men's and boys' issues in Washington State, to provide them with WA-specific data to support their legislative efforts.</p>
            </div>
          </div>
        </SectionBlock>

      </div>
    </div>
  );
}
