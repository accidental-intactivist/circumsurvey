import { Link } from "react-router-dom";

const TYPE = {
  condensed: "'Barlow Condensed', sans-serif",
  sans: "'Outfit', sans-serif",
  serif: "'Playfair Display', serif",
};

const C = {
  bg:        "#0a0a0c",
  bgSoft:    "#131316",
  pageText:  "#eee",
  pageMuted: "#999",
  pageGhost: "#2a2a30",
  gold:       "#d4a030",
  goldBright: "#e8b840",
  red:        "#d94f4f",
  paper:      "#faf6f0",
  paperInk:   "#2a2622",
  paperDim:   "#5a5450",
  paperRule:  "#e8e2d8",
};

const Header = () => (
  <header style={{
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,10,12,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${C.pageGhost}`,
    display: "flex", alignItems: "center",
    padding: "0.7rem 1.5rem",
    gap: "0.75rem", flexWrap: "wrap",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 180 }}>
      <Link to="/" style={{
        fontFamily: TYPE.serif,
        fontWeight: 700,
        fontSize: "1rem",
        color: C.gold,
        textDecoration: "none",
        lineHeight: 1.15,
      }}>
        The Accidental Intactivist's Inquiry
      </Link>
      <Link to="/explore" style={{
        marginLeft: "0.5rem",
        padding: "0.3rem 0.8rem",
        background: "rgba(212,160,48,0.1)",
        border: `1px solid rgba(212,160,48,0.4)`,
        color: C.goldBright,
        borderRadius: 4,
        textDecoration: "none",
        fontFamily: TYPE.condensed,
        fontWeight: 700,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        transition: "all 0.2s ease"
      }}>
        Interactive Explorer ➔
      </Link>
    </div>
  </header>
);

const SectionBlock = ({ title, children }) => (
  <section style={{
    background: C.paper,
    color: C.paperInk,
    borderRadius: 8,
    padding: "3rem 2.5rem",
    marginBottom: "2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
  }}>
    <h2 style={{ 
      fontFamily: TYPE.serif, 
      fontSize: "2rem", 
      color: C.paperInk, 
      borderBottom: `2px solid ${C.paperRule}`,
      paddingBottom: "1rem",
      marginBottom: "2rem",
      marginTop: 0
    }}>{title}</h2>
    <div style={{
      fontFamily: TYPE.sans,
      fontSize: "1.05rem",
      lineHeight: 1.6,
      color: C.paperDim
    }}>
      {children}
    </div>
  </section>
);

export default function AboutPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.pageText, fontFamily: TYPE.sans }}>
      <Header />
      
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 2rem" }}>
        <h1 style={{ 
          fontFamily: TYPE.serif, 
          fontSize: "3.5rem", 
          color: C.gold, 
          textAlign: "center", 
          marginBottom: "1rem" 
        }}>About the Project</h1>
        
        <p style={{
          textAlign: "center",
          fontFamily: TYPE.condensed,
          fontSize: "1.2rem",
          color: C.pageMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4rem"
        }}>Methodology & The Story</p>

        <SectionBlock title="From the Lead Researcher: The 'Why' Behind This Inquiry">
          <p>My name is Tone Pettit, and I am the "Accidental Intactivist." This project was born from a lifetime of observation and a single, persistent question.</p>
          <p>By a conscious choice of my parents in the 1970s, I grew up intact (uncircumcised); a complete outlier in a US culture where routine infant circumcision (RIC) was the unquestioned, 90% norm. I became an <em>accidental witness</em> to a profound alteration that nearly all my friends and peers had undergone — something my parents had simply waved off as unnecessary, refusing to subject their newborn son to a life-altering surgery.</p>
          <p>If someone asked you honestly how you felt about your circumcision status, what would you say? That is the question I set out to ask when I built this anonymous survey. I wanted to know: what makes parents like mine such outliers? What was the actual, lived experience of men in these bodies?</p>
          <p>Historically, infant circumcision was popularized specifically to curb masturbation and diminish sexual experience. Today, modern neuroscience and anatomical evidence unequivocally support the obvious claim that removing highly sensitive, functional tissue dictates sexual dysfunction. Indeed, the latest European clinical consensus states clearly that circumcision is non-therapeutic and should not be considered a medical procedure.</p>
          <p>Yet, nearly half of American parents still opt to circumcise their newborn boys. While that number is still high, it represents a significant historical decline. In fact, as highlighted in a Johns Hopkins press release, neonatal circumcision has officially dropped below 49% — making routine infant circumcision a <strong>minority procedure</strong> in the United States for the first time in a century.</p>
          <p>When given an anonymous platform to speak honestly, the data speaks clearly for itself. The findings show that circumcised men are overwhelmingly dissatisfied and frequently require external lubrication for their entire lives. Our goal is to bring agnostic readers, expectant parents, and medical professionals over to the side of bodily autonomy by letting the raw data and verbatim voices speak for themselves.</p>
        </SectionBlock>

        <SectionBlock title="Central Research Hypothesis">
          <p>This project is built around a central guiding question born from the "Accidental Intactivist's" lifelong observations: "Why isn’t the routine, non-consensual surgical alteration of healthy infant genitals a central controversy of our age?"</p>
          <p>From this question, we derive our core working hypothesis:</p>
          <blockquote style={{ borderLeft: `4px solid ${C.red}`, paddingLeft: "1.5rem", fontStyle: "italic", margin: "2rem 0", color: C.paperInk }}>
            "The routine practice of infant circumcision, perpetuated by cultural inertia and systemic failures in informed consent, results in a statistically significant and widespread negative impact on the lifelong physical, sexual, and psychological well-being of the individuals subjected to it."
          </blockquote>
          <p>This survey is designed to rigorously test this hypothesis by gathering firsthand, comparative data on lived experiences. The survey captures a rich tapestry of experiences and perceptions, focusing on several key areas:</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Lived Experiences:</strong> Detailed accounts from intact, circumcised, and restoring individuals regarding physical sensation, sexual function, body image, and psychological well-being.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Parental Decision-Making:</strong> Factors influencing parents' choices regarding circumcision.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Cultural Narratives & Misconceptions:</strong> Common societal beliefs, stereotypes, and assumptions about intactness versus circumcision.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Anatomical Awareness:</strong> Understanding of specific genital structures and the physical outcomes of circumcision.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Bodily Autonomy & Ethics:</strong> Reflections on consent, children's rights, and the ethical implications of non-therapeutic infant surgery.</li>
          </ul>
        </SectionBlock>

        <SectionBlock title="Research Philosophy & Stance on Bias">
          <p>We believe that all research is conducted from a perspective. This project is transparently grounded in a secular humanist and egalitarian framework that values bodily autonomy as a fundamental, universal human right. Our primary inquiry stems from the ethical question of whether non-consensual, medically unnecessary surgery should be performed on children.</p>
          <p>While this forms our ethical starting point, we are committed to methodological rigor to mitigate confirmation bias. Our survey is not designed to be propaganda; it is an instrument of inquiry designed to discover whether the data supports or refutes this hypothesis.</p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}><strong>Gathering All Experiences:</strong> We actively solicit and have dedicated pathways for individuals who are satisfied with their circumcision.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Experience Before Status:</strong> The survey is structured to ask about lived sexual experiences before asking about anatomical status, a design intended to capture more candid comparative data.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Acknowledging Limitations:</strong> We recognize that our initial sample is self-selected. Our goal in Phase 1 is to document the "ground truth" from the most affected communities. Phase 2 of our outreach is focused on broadening this sample to include more neutral and diverse populations.</li>
          </ul>
        </SectionBlock>
      </main>
    </div>
  );
}
