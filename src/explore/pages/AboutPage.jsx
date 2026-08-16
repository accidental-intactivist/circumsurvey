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
        
        <SectionBlock title="From the Lead Researcher: The 'Why' Behind This Inquiry">
          <p>My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born from a lifetime of observation and a single, persistent question.</p>
          <p>By a conscious choice of my parents in the 1970s, I grew up intact (uncircumcised); an outlier in a US culture where routine infant circumcision (RIC) was the unquestioned norm. This meant I became an "accidental witness" to a profound alteration that nearly all my friends, my partners, and men in the media had undergone, something my parents had simply dismissed as unnecessary.</p>
          <p>In a culture so obsessed with sex, where we seemingly want every experience to be as good as possible, how did this one topic become so taboo? I realized that while everyone seems to have an opinion about whether infant circumcision should or shouldn't be done, I almost never hear adults talking honestly about their own lived experience with their own anatomy.</p>
          <p>I had so many questions. How did men actually feel about being cut? Was it something they ever thought about? What was their sexual experience truly like?</p>
          <p>This survey is my way of finally asking those questions.</p>
          <p>I created this inquiry to be a confidential, structured, and unbiased space to break that silence. It turns out it's a conversation a lot of people have been waiting to have. We are now the custodians of hundreds of vivid, often heartbreaking accounts of a procedure performed on millions, usually without their consent. This page details the methodology behind our mission to bring these essential stories into the light.</p>
          
          <div style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: `1px dashed var(--c-ghost)`,
            fontFamily: FONT.mono || "monospace",
            fontSize: "0.85rem",
            color: "var(--c-goldBright)",
            letterSpacing: "0.05em",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}>
            <span>Tone Pettit</span>
            <span>The Accidental Intactivist</span>
            <a href="mailto:tone@circumsurvey.online" style={{ color: "inherit" }}>tone@circumsurvey.online</a>
            <a href="http://reddit.com/u/c4charkey" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>reddit.com/u/c4charkey</a>
          </div>
        </SectionBlock>

        <SectionBlock title="Central Research Hypothesis">
          <p>This project is built around a central guiding question born from the "Accidental Intactivist's" lifelong observations: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?"</p>
          <p>From this question, we derive our core working hypothesis:</p>
          <div style={{ 
            background: "rgba(212,160,48,0.05)", 
            borderLeft: `2px solid var(--c-goldBright)`, 
            padding: "1.5rem", 
            fontFamily: FONT.mono || "monospace", 
            margin: "1rem 0", 
            color: "var(--c-textBright)",
            fontSize: "0.95rem",
            lineHeight: 1.6
          }}>
            "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it."
          </div>
          <p>This survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences.</p>
        </SectionBlock>

        <SectionBlock title="Key Themes Explored">
          <p>The survey is designed to capture a rich tapestry of experiences and perceptions, focusing on several key areas:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Lived Experiences:</strong> Detailed accounts from intact, circumcised, and restoring individuals regarding physical sensation, sexual function (including orgasm quality/duration, lubrication needs), body image, and psychological well-being.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Parental Decision-Making:</strong> Factors influencing parents' choices regarding circumcision (medical advice, cultural/religious norms, perceived benefits/risks, societal pressures).</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Cultural Narratives & Misconceptions:</strong> Common societal beliefs, stereotypes, and assumptions about intactness versus circumcision (hygiene, health, aesthetics, pleasure).</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Anatomical Awareness:</strong> Understanding of specific genital structures (e.g., foreskin, frenulum) and the physical outcomes of circumcision (scarring, skin mobility).</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Bodily Autonomy & Ethics:</strong> Reflections on consent, children's rights, and the ethical implications of non-therapeutic infant surgery.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Impact on Allies & Observers:</strong> Perspectives from partners, parents, healthcare professionals, researchers, and advocates.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Methodology: Survey Structure Highlights">
          <p>To achieve our goal of gathering nuanced, high-quality data, the survey was designed with several unique structural features:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Global & Regional Focus:</strong> Comprehensive demographic data including country of birth/residence, race/ethnicity, education, socioeconomic status, and religious background allow for robust correlational analysis across different cultures.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Cultural Context Gateway:</strong> A key branching question directs participants down pathways relevant to their upbringing (i.e., in a culture where circumcision is the norm vs. where intactness is the norm), ensuring questions are framed appropriately for their lived reality.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Specific Religious/Cultural Context Sections:</strong> Optional sections for Christian, Jewish, and Islamic perspectives allow for a deeper exploration of how faith traditions inform views on this topic.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Pre-Status Experiential Baseline:</strong> A unique section where all participants reflect on sensation, orgasm, and body image before delving into their specific anatomical status pathway, allowing for less biased comparative data.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Qualitative & Quantitative Data:</strong> A mix of open-ended questions for rich narrative insights and multiple-choice/scale questions for measurable data.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Anonymity Assured:</strong> No personally identifiable information is collected with responses.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Research Philosophy & Stance on Bias">
          <p>We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right. Our primary inquiry stems from the ethical question of whether non-consensual, medically unnecessary surgery should be performed on children.</p>
          <p>While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis.</p>
          <p>Key features to ensure a balanced dataset include:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Gathering All Experiences:</strong> We actively solicit and have dedicated pathways for individuals who are satisfied with their circumcision.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Experience Before Status:</strong> The survey is structured to ask about lived sexual experiences before asking about anatomical status, a design intended to capture more candid comparative data.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Acknowledging Limitations:</strong> We recognize that our initial sample is self-selected. Our goal in Phase 1 is to document the "ground truth" from the most affected communities. Phase 2 of our outreach is focused on broadening this sample to include more neutral and diverse populations.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Data Security & Participant Confidentiality">
          <p>We understand that sharing your personal story requires a profound level of trust. We are committed to honoring that trust with the highest standards of data security and ethical conduct. Your privacy and confidentiality are paramount.</p>
          <p>Our system is designed with a "privacy-by-design" philosophy:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Absolute Anonymity in the Dataset:</strong> The survey is configured to be 100% anonymous by default. Your answers are not linked to any personal identifiers.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Secure Separation for Follow-Up:</strong> For participants who voluntarily and explicitly provide contact information for potential follow-up, that information is immediately and automatically stripped from the survey data. It is stored in a separate, encrypted, and highly access-restricted file.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>State-of-the-Art Pseudonymization:</strong> We use a secure, salted hashing system to link these two separate files. This means that even on the backend, your data is represented by a non-identifiable code. It is not possible to reverse-engineer your identity from the survey responses.</li>
          </ul>
          <p>Our promise is simple: your story is safe with us. It will be used to build a collective voice for change, and your individual identity will be protected every step of the way.</p>
        </SectionBlock>

        <SectionBlock title="Why This Survey Matters & Potential Impact">
          <p>This survey is more than a collection of data; it is an act of intervention in a profound and protected cultural silence. For decades, the conversation around infant circumcision has been dominated by shifting medical justifications and quiet social pressure, while the voices of those with direct, lifelong experience have been largely ignored. This project is designed to change that.</p>
          <p>Our potential impact is multi-layered:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>IT FILLS A CRITICAL KNOWLEDGE GAP:</strong> We are creating one of the most comprehensive public datasets on the real-world physical, sexual, and psychological outcomes of circumcision, moving beyond simplistic binaries to capture the full spectrum of human experience.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>IT CHALLENGES MISINFORMATION WITH LIVED TRUTH:</strong> By documenting firsthand testimonials, we provide a powerful, human-centered counter-narrative to the outdated myths and flimsy rationales that have propped up this practice for generations.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>IT EMPOWERS INDIVIDUAL VOICES:</strong> This is a platform for truth-telling. We offer a structured, anonymous, and respectful space for individuals from all perspectives to contribute their story to a vital conversation, ensuring their experiences are no longer invisible.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>IT INFORMS THE FUTURE OF ADVOCACY & EDUCATION:</strong> The findings from this research will be a vital resource, providing compelling data and clear messaging to support parents in making truly informed choices, and to fuel the legal and political advocacy that will protect the bodily autonomy of the next generation.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Commitment to Ethical Research">
          <p>While this project is an independent initiative and not affiliated with an academic institution (and thus has not undergone formal Institutional Review Board/IRB review), it has been designed with core ethical principles at the forefront:</p>
          <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--c-textBright)", margin: 0 }}>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Informed Consent:</strong> The survey's introduction clearly outlines its purpose, data use, risks, and voluntary nature, ensuring participants can make an informed decision before beginning.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Anonymity & Confidentiality:</strong> All responses are confidential. No personally identifiable information like IP addresses or emails will be collected with survey responses. Should you voluntarily provide contact information for an optional follow-up interview, it will be stored separately from your survey data to protect your anonymity.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Voluntary Participation:</strong> All questions are optional, and participants may skip any question or exit the survey at any time without penalty.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Minimizing Harm:</strong> We acknowledge the sensitive nature of these topics. A content note is provided at the start of the survey, and questions are framed to be exploratory and non-judgmental.</li>
            <li><strong style={{ color: "var(--c-goldBright)" }}>Beneficence:</strong> The ultimate aim of this research is to contribute positively to public understanding, support individual well-being, and advocate for the fundamental right to bodily autonomy.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Our Strategic Alliances & Collaborators">
          <p>While this project began as an independent inquiry, our commitment to rigorous, data-driven research has earned the recognition and support of key leaders and organizations in the fields of genital autonomy, legal advocacy, and men's health.</p>
          <p>We are honored to be in active collaboration and communication with:</p>
          
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            
            <div>
              <a href="https://www.doctorsopposingcircumcision.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-blue)", fontSize: "1.2rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>
                  Doctors Opposing Circumcision (DOC)
                </h3>
              </a>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <img src="/logos/media__1784241129141.png" alt="Doctors Opposing Circumcision" style={{ maxWidth: "200px", mixBlendMode: "screen", filter: "brightness(1.5)" }} />
                <p style={{ margin: 0 }}>We are proud to be in direct collaboration with DOC, a foundational, Seattle-based organization of medical professionals who have been advocating for genital autonomy since 1995.</p>
              </div>
            </div>

            <div>
              <a href="https://intactglobal.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-blue)", fontSize: "1.2rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>
                  Intact Global
                </h3>
              </a>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <img src="/logos/media__1784241136975.png" alt="Intact Global" style={{ maxWidth: "150px" }} />
                <p style={{ margin: 0 }}>We are honored to be working as a strategic partner with Intact Global and its president, attorney Eric Clopper. Our survey project is now an active tool in their crucial effort to prepare a landmark Equal Protection lawsuit in Washington State, aiming to secure the same legal right to bodily integrity for boys that is already afforded to girls.</p>
              </div>
            </div>

            <div>
              <a href="https://www.galdef.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-blue)", fontSize: "1.2rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>
                  Genital Autonomy Legal Defense & Education Fund (GALDEF)
                </h3>
              </a>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <img src="/logos/media__1784241141247.png" alt="GALDEF" style={{ maxWidth: "150px", mixBlendMode: "screen", filter: "brightness(1.5)" }} />
                <p style={{ margin: 0 }}>We are also grateful for the strategic advice and support from foundational researcher Tim Hammond (NOHARMM/GALDEF) and attorney Eric Clopper (Intact Global), which has opened a path toward potential academic review of our findings with researchers at Quinnipiac University.</p>
              </div>
            </div>

            <div>
              <a href="https://wibm.us/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <h3 style={{ fontFamily: FONT.condensed, color: "var(--c-blue)", fontSize: "1.2rem", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>
                  Washington Initiative for Boys and Men (WIBM)
                </h3>
              </a>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <img src="/logos/media__1784241147470.png" alt="WIBM" style={{ maxWidth: "250px", mixBlendMode: "screen", filter: "brightness(1.5)" }} />
                <p style={{ margin: 0 }}>We are actively working with WIBM, the leading political advocacy group for men's and boys' issues in Washington State, to provide them with WA-specific data to support their legislative efforts.</p>
              </div>
            </div>

          </div>
        </SectionBlock>

      </div>
    </div>
  );
}
