import { useState } from "react";
import { Link } from "react-router-dom";

const TYPE = {
  condensed: "'Barlow Condensed', sans-serif",
  sans: "'Outfit', sans-serif",
  serif: "'Playfair Display', serif",
};

const C = {
  bg:        "#0a0a0c",
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

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: C.paper,
      borderRadius: 8,
      marginBottom: "1rem",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "1.5rem 2rem",
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          fontFamily: TYPE.serif,
          fontSize: "1.3rem",
          color: C.paperInk,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span style={{ paddingRight: "2rem" }}>{q}</span>
        <span style={{ color: C.gold, fontSize: "1.5rem" }}>{open ? "−" : "+"}</span>
      </button>
      
      {open && (
        <div style={{
          padding: "0 2rem 2rem 2rem",
          fontFamily: TYPE.sans,
          fontSize: "1.05rem",
          lineHeight: 1.6,
          color: C.paperDim,
          borderTop: `1px solid ${C.paperRule}`,
          paddingTop: "1.5rem"
        }}>
          {a}
        </div>
      )}
    </div>
  );
};

export default function FaqPage() {
  const faqs = [
    {
      q: "Who is the 'Accidental Intactivist'?",
      a: "That's me, Tone Pettit the survey author. I'm an independent Seattle-based researcher and data scientist who, by a conscious choice of my parents, grew up intact outlier in the US—a culture where that's an anomaly. This experience has given me a lifelong 'accidental anthropologist' perspective, leading me to question and study a practice that is often accepted without thought."
    },
    {
      q: "What is the purpose of this survey and how will the data be used?",
      a: "This is an independent research project. Its primary goal is to gather a broad spectrum of anonymous, firsthand experiences to create public educational content for the 'Accidental Intactivist's Guide' series. This will include articles, data visualizations, and in-depth analyses. The aggregated, anonymized data will be a resource to support advocacy for bodily autonomy and contribute to a more informed public dialogue."
    },
    {
      q: "Who is the intended audience for the final published results and articles?",
      a: "The primary audience is the general public, especially expectant parents, young men, and partners who are seeking honest, non-sensationalized information. A secondary audience includes healthcare professionals, educators, advocates, and researchers who can use this data to inform their own work."
    },
    {
      q: "Is this survey biased or propaganda?",
      a: "Is it biased? Yes, in a way. This survey is conducted from a specific perspective: one that starts with the ethical question of whether a non-consensual, irreversible, and often painful surgical procedure should be routinely performed on healthy children for reasons that are not medically immediate. Is it propaganda? No. We are actively seeking all experiences—positive, negative, and neutral. The survey's unique structure asks about lived sexual experiences before asking about anatomical status to gather less biased comparative data."
    },
    {
      q: "This survey seems very 'American-centric.' How can you get accurate global data?",
      a: "The survey author's perspective is indeed rooted in the US cultural anomaly. However, the survey has been updated to be more globally inclusive based on community input. Changes include removing US-centric language, adding options that acknowledge being intact is the global default, and broadening questions about parental decisions to include various cultural contexts."
    },
    {
      q: "Is there any oversight from an ethics board or formal authority?",
      a: "As an independent initiative, this project does not have formal Institutional Review Board (IRB) oversight. Recognizing this, we have designed the survey with core ethical principles at the forefront: fully informed consent, absolute anonymity (no IPs or personal data collected), and voluntary participation."
    },
    {
      q: "Why an anonymous survey? It's prone to self-selection bias.",
      a: "Anonymous online surveys do have inherent limitations. However, their great strength, especially for a topic as personal and often stigmatized as this, is their ability to reach a broad range of individuals who might only feel comfortable sharing candidly under the protection of anonymity. Both anonymous surveys and personal interviews contribute valuable pieces to the overall puzzle."
    },
    {
      q: "I was circumcised and I feel fine. What's the big deal?",
      a: "That's a valid and common perspective. Many people are perfectly content. This inquiry isn't meant to invalidate your personal experience. Rather, it aims to explore the full spectrum of outcomes—physical, sexual, and psychological—and to question the ethical basis of performing a non-consensual, irreversible surgery on a child who cannot consent, especially when outcomes and experiences vary so widely."
    },
    {
      q: "What about the health benefits? I was told it's more hygienic.",
      a: "The purported health benefits of routine infant circumcision are highly contested and, in many cases, have been debunked or found to be statistically insignificant when weighed against the risks. Major medical bodies around the world (outside the US) do not recommend it. The 'hygiene' argument is often seen as a relic from an era before modern plumbing; simple, normal washing is sufficient for an intact penis."
    },
    {
      q: "I'm a woman/partner. Why should I care about this?",
      a: "The physical and emotional state of a partner directly impacts intimacy. Understanding their anatomy, potential sensory differences, or any psychological baggage related to their circumcision can lead to better communication, empathy, and a more connected sexual experience. It's also a fundamental issue of children's rights and bodily autonomy, which affects everyone."
    }
  ];

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
        }}>Frequently Asked Questions</h1>
        
        <p style={{
          textAlign: "center",
          fontFamily: TYPE.condensed,
          fontSize: "1.2rem",
          color: C.pageMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4rem"
        }}>Your Questions, Our Answers</p>

        <div>
          {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </main>
    </div>
  );
}
