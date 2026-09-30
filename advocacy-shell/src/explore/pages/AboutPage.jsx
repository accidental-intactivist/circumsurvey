import { useNavigate } from "react-router-dom";
import { C, FONT } from "../styles/tokens";
import ExhibitSidebarNav from "../components/ExhibitSidebarNav";
import ExhibitHero from "../components/ExhibitHero";
import { BookOpen } from "lucide-react";

// Inline SectionHeader to match Tomorrow's Bureau style
function SectionHeader({ id, title, subtitle }) {
  return (
    <div id={id} style={{ marginBottom: "3rem", marginTop: "3.5rem" }}>
      <h2 style={{
        fontFamily: FONT.display, fontSize: "2.4rem", fontWeight: 700,
        color: C.textBright, margin: 0, lineHeight: 1.2, letterSpacing: "-0.015em",
        borderBottom: `2px solid ${C.ghost}`, paddingBottom: "1rem"
      }}>
        {title}
        {subtitle && <span style={{ color: C.muted, fontWeight: 300 }}>: {subtitle}</span>}
      </h2>
    </div>
  );
}

const SECTIONS = [
  { id: "researcher", label: "The 'Why'" },
  { id: "hypothesis", label: "Central Hypothesis" },
  { id: "themes", label: "Key Themes" },
  { id: "methodology", label: "Methodology" },
  { id: "philosophy", label: "Research Philosophy" },
  { id: "privacy", label: "Data Security" },
  { id: "impact", label: "Potential Impact" },
  { id: "ethics", label: "Ethical Commitment" },
  { id: "partners", label: "Strategic Alliances" }
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textBright, fontFamily: FONT.body, paddingBottom: "6rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, textDecoration: "none", padding: 0 }}>← Master Index</button>
          <span style={{ color: C.dim }}>/</span>
          <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold }}>Project</span>
          <span style={{ color: C.dim }}>/</span>
          <span style={{ fontFamily: FONT.condensed, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.textBright }}>About the Project</span>
        </div>

        <ExhibitHero
          title="About the Project"
          color={C.goldBright}
          gradientColor={C.gold}
          BackgroundIcon={BookOpen}
          description="We are now the custodians of hundreds of vivid, often heartbreaking accounts of a procedure performed on millions, usually without their consent. This page details the methodology behind our mission to bring these essential stories into the light."
        />

        <div className="explore-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "3rem", alignItems: "start", marginTop: "3rem" }}>
          
          {/* LEFT: Nav sidebar */}
          <ExhibitSidebarNav sections={SECTIONS} />

          {/* RIGHT: Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0rem", maxWidth: 900 }}>
            
            <SectionHeader id="researcher" title="From the Lead Researcher" subtitle="The 'Why' Behind This Inquiry" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born from a lifetime of observation and a single, persistent question.</p>
              <p>By a conscious choice of my parents in the 1970s, I grew up intact (uncircumcised); an outlier in a US culture where routine infant circumcision (RIC) was the unquestioned norm. This meant I became an "accidental witness" to a profound alteration that nearly all my friends, my partners, and men in the media had undergone, something my parents had simply dismissed as unnecessary.</p>
              <p>In a culture so obsessed with sex, where we seemingly want every experience to be as good as possible, how did this one topic become so taboo? I realized that while everyone seems to have an opinion about whether infant circumcision should or shouldn't be done, I almost never hear adults talking honestly about their own lived experience with their own anatomy.</p>
              <p>I had so many questions. How did men actually feel about being cut? Was it something they ever thought about? What was their sexual experience truly like?</p>
              <p>This survey is my way of finally asking those questions.</p>
              <p>I created this inquiry to be a confidential, structured, and unbiased space to break that silence. It turns out it's a conversation a lot of people have been waiting to have.</p>
              
              <div style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: `1px dashed ${C.ghost}`,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: C.textBright,
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem"
              }}>
                <span>Tone Pettit</span>
                <span>The Accidental Intactivist</span>
                <a href="mailto:tone@circumsurvey.online" style={{ color: "inherit" }}>tone@circumsurvey.online</a>
                <a href="http://reddit.com/u/c4charkey" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>reddit.com/u/c4charkey</a>
              </div>
            </div>

            <SectionHeader id="hypothesis" title="Central Research Hypothesis" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>This project is built around a central guiding question born from the "Accidental Intactivist's" lifelong observations: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?"</p>
              <p>From this question, we derive our core working hypothesis:</p>
              <div style={{ 
                background: "rgba(212,160,48,0.05)", 
                borderLeft: `3px solid ${C.goldBright}`, 
                padding: "1.5rem 2rem", 
                margin: "1.5rem 0", 
                color: C.textBright,
                fontSize: "1.15rem",
                fontStyle: "italic",
                lineHeight: 1.6
              }}>
                "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it."
              </div>
              <p>This survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences.</p>
            </div>

            <SectionHeader id="themes" title="Key Themes Explored" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>The survey is designed to capture a rich tapestry of experiences and perceptions, focusing on several key areas:</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>Lived Experiences:</strong> Detailed accounts from intact, circumcised, and restoring individuals regarding physical sensation, sexual function, body image, and psychological well-being.</li>
                <li><strong style={{ color: C.goldBright }}>Parental Decision-Making:</strong> Factors influencing parents' choices regarding circumcision.</li>
                <li><strong style={{ color: C.goldBright }}>Cultural Narratives & Misconceptions:</strong> Common societal beliefs, stereotypes, and assumptions about intactness versus circumcision.</li>
                <li><strong style={{ color: C.goldBright }}>Anatomical Awareness:</strong> Understanding of specific genital structures and the physical outcomes of circumcision.</li>
                <li><strong style={{ color: C.goldBright }}>Bodily Autonomy & Ethics:</strong> Reflections on consent, children's rights, and the ethical implications of non-therapeutic infant surgery.</li>
                <li><strong style={{ color: C.goldBright }}>Impact on Allies & Observers:</strong> Perspectives from partners, parents, healthcare professionals, researchers, and advocates.</li>
              </ul>
            </div>

            <SectionHeader id="methodology" title="Our Methodology" subtitle="Survey Structure Highlights" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>To achieve our goal of gathering nuanced, high-quality data, the survey was designed with several unique structural features:</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>Global & Regional Focus:</strong> Comprehensive demographic data allowing for robust correlational analysis.</li>
                <li><strong style={{ color: C.goldBright }}>Cultural Context Gateway:</strong> A key branching question directs participants down pathways relevant to their upbringing.</li>
                <li><strong style={{ color: C.goldBright }}>Specific Religious/Cultural Context Sections:</strong> Optional sections for Christian, Jewish, and Islamic perspectives.</li>
                <li><strong style={{ color: C.goldBright }}>Pre-Status Experiential Baseline:</strong> A unique section where all participants reflect on sensation, orgasm, and body image before delving into their specific anatomical status pathway.</li>
                <li><strong style={{ color: C.goldBright }}>Qualitative & Quantitative Data:</strong> A mix of open-ended questions and multiple-choice/scale questions.</li>
                <li><strong style={{ color: C.goldBright }}>Anonymity Assured:</strong> No personally identifiable information is collected with responses.</li>
              </ul>
            </div>

            <SectionHeader id="philosophy" title="Research Philosophy" subtitle="Stance on Bias" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right.</p>
              <p>While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis.</p>
              <p>Key features to ensure a balanced dataset include:</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>Gathering All Experiences:</strong> We actively solicit and have dedicated pathways for individuals who are satisfied with their circumcision.</li>
                <li><strong style={{ color: C.goldBright }}>Experience Before Status:</strong> The survey asks about lived sexual experiences before asking about anatomical status.</li>
                <li><strong style={{ color: C.goldBright }}>Acknowledging Limitations:</strong> We recognize that our initial sample is self-selected. Phase 2 of our outreach is focused on broadening this sample.</li>
              </ul>
            </div>

            <SectionHeader id="privacy" title="Data Security & Participant Confidentiality" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>We understand that sharing your personal story requires a profound level of trust. We are committed to honoring that trust with the highest standards of data security and ethical conduct.</p>
              <p>Our system is designed with a "privacy-by-design" philosophy:</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>Absolute Anonymity:</strong> The survey is 100% anonymous by default.</li>
                <li><strong style={{ color: C.goldBright }}>Secure Separation for Follow-Up:</strong> For participants who voluntarily provide contact information, that information is immediately stripped from the survey data and stored in a separate, encrypted file.</li>
                <li><strong style={{ color: C.goldBright }}>State-of-the-Art Pseudonymization:</strong> We use a secure, salted hashing system to link these two separate files.</li>
              </ul>
              <p>Our promise is simple: your story is safe with us.</p>
            </div>

            <SectionHeader id="impact" title="Potential Impact" subtitle="Why This Survey Matters" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>This survey is more than a collection of data; it is an act of intervention in a profound and protected cultural silence.</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>IT FILLS A CRITICAL KNOWLEDGE GAP:</strong> We are creating one of the most comprehensive public datasets on the real-world physical, sexual, and psychological outcomes of circumcision.</li>
                <li><strong style={{ color: C.goldBright }}>IT CHALLENGES MISINFORMATION WITH LIVED TRUTH:</strong> By documenting firsthand testimonials, we provide a powerful, human-centered counter-narrative to outdated myths.</li>
                <li><strong style={{ color: C.goldBright }}>IT EMPOWERS INDIVIDUAL VOICES:</strong> We offer a structured, anonymous, and respectful space for individuals from all perspectives to contribute their story.</li>
                <li><strong style={{ color: C.goldBright }}>IT INFORMS THE FUTURE OF ADVOCACY & EDUCATION:</strong> The findings from this research will be a vital resource for legal and political advocacy.</li>
              </ul>
            </div>

            <SectionHeader id="ethics" title="Our Commitment to Ethical Research" />
            <div className="body-text" style={{ fontFamily: FONT.body, fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>While this project is an independent initiative, it has been designed with core ethical principles at the forefront:</p>
              <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", color: C.textBright, margin: 0 }}>
                <li><strong style={{ color: C.goldBright }}>Informed Consent:</strong> The survey's introduction clearly outlines its purpose, data use, risks, and voluntary nature.</li>
                <li><strong style={{ color: C.goldBright }}>Anonymity & Confidentiality:</strong> All responses are confidential. No IP addresses or emails will be collected with survey responses.</li>
                <li><strong style={{ color: C.goldBright }}>Voluntary Participation:</strong> All questions are optional, and participants may exit at any time without penalty.</li>
                <li><strong style={{ color: C.goldBright }}>Minimizing Harm:</strong> A content note is provided at the start of the survey, and questions are framed to be non-judgmental.</li>
                <li><strong style={{ color: C.goldBright }}>Beneficence:</strong> The aim is to contribute positively to public understanding and advocate for bodily autonomy.</li>
              </ul>
            </div>

            <SectionHeader id="partners" title="Strategic Alliances & Collaborators" />
            <div className="body-text" style={{ fontSize: "1.05rem", lineHeight: 1.7, color: C.textBright, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <p>While this project began as an independent inquiry, our commitment to rigorous, data-driven research has earned the recognition and support of key leaders and organizations in the fields of genital autonomy, legal advocacy, and men's health.</p>
              <p>We are honored to be in active collaboration and communication with:</p>
              
              <div style={{ 
                marginTop: "3rem", 
                display: "flex", 
                flexDirection: "column", 
                gap: "3.5rem",
              }}>
                
                {/* 1. GALDEF */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem" }}>
                  <a href="https://www.galdef.org/" target="_blank" rel="noreferrer" style={{ flex: "0 0 180px", height: "120px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <img src="/logos/galdef_logo.png" alt="GALDEF" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </a>
                  <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                    <a href="https://www.galdef.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.3rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Genital Autonomy Legal Defense & Education Fund
                      </h3>
                    </a>
                    <p style={{ margin: 0, fontSize: "1rem", color: C.muted, lineHeight: 1.6 }}>
                      Strategic advice and support from foundational researcher Tim Hammond (NOHARMM/GALDEF), opening paths toward potential academic review.
                    </p>
                  </div>
                </div>

                {/* 2. WIBM */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem" }}>
                  <a href="https://wibm.us/" target="_blank" rel="noreferrer" style={{ flex: "0 0 180px", height: "120px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <img src="/logos/wibm_logo.png" alt="WIBM" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </a>
                  <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                    <a href="https://wibm.us/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.3rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Washington Initiative for Boys and Men (WIBM)
                      </h3>
                    </a>
                    <p style={{ margin: 0, fontSize: "1rem", color: C.muted, lineHeight: 1.6 }}>
                      Leading political advocacy group for men's and boys' issues in Washington State, utilizing our WA-specific data.
                    </p>
                  </div>
                </div>

                {/* 3. Intact Global */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem" }}>
                  <a href="https://intactglobal.org/" target="_blank" rel="noreferrer" style={{ flex: "0 0 180px", height: "120px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <img src="/logos/intact_global_logo.png" alt="Intact Global" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </a>
                  <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                    <a href="https://intactglobal.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.3rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Intact Global
                      </h3>
                    </a>
                    <p style={{ margin: 0, fontSize: "1rem", color: C.muted, lineHeight: 1.6 }}>
                      Strategic partner aiming to secure the same legal right to bodily integrity for boys that is already afforded to girls in Washington State.
                    </p>
                  </div>
                </div>

                {/* 4. DOC */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem" }}>
                  <a href="https://www.doctorsopposingcircumcision.org/" target="_blank" rel="noreferrer" style={{ flex: "0 0 180px", height: "120px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <img src="/logos/doc_logo.png" alt="Doctors Opposing Circumcision" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </a>
                  <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                    <a href="https://www.doctorsopposingcircumcision.org/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: FONT.condensed, color: C.textBright, fontSize: "1.3rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Doctors Opposing Circumcision (DOC)
                      </h3>
                    </a>
                    <p style={{ margin: 0, fontSize: "1rem", color: C.muted, lineHeight: 1.6 }}>
                      We are proud to be in direct collaboration with DOC, a foundational, Seattle-based organization of medical professionals who have been advocating for genital autonomy since 1995.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
