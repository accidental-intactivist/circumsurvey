import { useState } from "react";
import { FONT } from "../styles/tokens";

const FaqCategory = ({ title, children }) => (
  <div style={{ marginBottom: "3rem" }}>
    <h2 style={{
      fontFamily: FONT.condensed,
      fontSize: "1.4rem",
      color: "var(--c-goldBright)",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      borderBottom: `1px solid var(--c-ghost)`,
      paddingBottom: "0.5rem",
      marginBottom: "1.5rem"
    }}>
      {title}
    </h2>
    <div>{children}</div>
  </div>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "var(--c-bgCard)",
      border: "1px solid var(--c-ghost)",
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
          fontFamily: FONT.display,
          fontSize: "1.2rem",
          color: "var(--c-textBright)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span style={{ paddingRight: "2rem", lineHeight: 1.3 }}>{q}</span>
        <span style={{ color: "var(--c-gold)", fontSize: "1.5rem" }}>{open ? "−" : "+"}</span>
      </button>
      
      {open && (
        <div style={{
          padding: "0 2rem 2rem 2rem",
          fontFamily: FONT.body,
          fontSize: "1.05rem",
          lineHeight: 1.6,
          color: "var(--c-dim)",
          borderTop: `1px solid var(--c-ghost)`,
          paddingTop: "1.5rem"
        }}>
          {a}
        </div>
      )}
    </div>
  );
};

export default function FaqPage() {
  const faqs = {
    aboutProject: [
      {
        q: "Who is the 'Accidental Intactivist'?",
        a: "That's me, Tone Pettit, the survey author. I'm an independent Seattle-based researcher and data scientist who, by a conscious choice of my parents in the 1970s, grew up intact — a complete outlier in a US culture where routine infant circumcision (RIC) was the unquestioned, 90% norm. My parents simply waved off this life-altering procedure that almost all my peers went through, dismissing it as unnecessary. This experience has given me a lifelong 'accidental anthropologist' perspective, leading me to question and study a practice that is often accepted without thought."
      },
      {
        q: "What is the purpose of this survey and how will the data be used?",
        a: "This is an independent research project. Its primary goal is to gather a broad spectrum of anonymous, firsthand experiences to create public educational content for the 'Accidental Intactivist's Guide' series. This will include articles, data visualizations, and in-depth analyses. The aggregated, anonymized data will be a resource to support advocacy for bodily autonomy and contribute to a more informed public dialogue."
      },
      {
        q: "Who is the intended audience for the final published results and articles?",
        a: "The primary audience is the general public, especially expectant parents, young men, and partners who are seeking honest, non-sensationalized information. A secondary audience includes healthcare professionals, educators, advocates, and researchers who can use this data to inform their own work. The goal is to create material that is accessible to everyone, from the deeply engaged to the newly curious."
      },
      {
        q: "Will you engage with pro-circumcision arguments?",
        a: "Yes, absolutely. A core part of this project has been to understand the full landscape of belief surrounding this topic. The Manifesto spends significant time analyzing and debunking the most common pro-circumcision arguments (hygiene, disease prevention, aesthetics), tracing their historical roots. This survey captures the perspectives of those who are satisfied with being circumcised and believe it was beneficial, right alongside those who feel harmed. A true understanding is impossible without engaging with all viewpoints."
      },
      {
        q: "Is this survey biased or propaganda?",
        a: "Is it biased? Yes, in a way. This survey is conducted from a specific perspective: one that starts with the ethical question of whether a non-consensual, irreversible, and often painful surgical procedure should be routinely performed on healthy children for reasons that are not medically immediate. Is it propaganda? No. Propaganda relies on omitting facts and discouraging critical thought. This project does the opposite—we actively seek all experiences. We are not telling people how to feel—we are creating a platform for them to anonymously share how they actually feel. The final data, whatever it reveals, will speak for itself."
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
        q: "Will the survey be translated into other languages?",
        a: "Currently, the survey is only available in English. However, a major goal is to translate it into other languages, especially Spanish, French, and German, to gather a more representative global dataset. This is a volunteer-driven effort. If you are a fluent speaker and are interested in assisting with translation, please contact volunteer@circumsurvey.online."
      },
      {
        q: "I see you posting this in foreskin restoration groups. Is this survey specifically about that?",
        a: "While brief promotional posts aim for broad reach, the survey itself is highly detailed and specific. It includes a dedicated Restoration Pathway with questions about awareness of regeneration research (like Foregen's work on actual foreskin regeneration). The broad data gathered supports all avenues of healing, reclamation, and informed choice."
      },
      {
        q: "How long will the survey be open?",
        a: "The survey will remain open for an extended period to gather as many responses as possible. Our initial goal of 500 participants has been reached. We will announce any plans to close the survey well in advance on the Accidental Intactivist's Guide Substack."
      },
      {
        q: "Will you release the raw data for other researchers to analyze?",
        a: "We are committed to contributing to the broader research community. While we will not release raw open-ended text responses to protect individual anonymity, we are exploring ways to responsibly share the fully anonymized quantitative dataset (multiple-choice and scale answers) with other allied researchers and data scientists upon request, once our initial analysis is complete."
      },
      {
        q: "Are you working with established intactivist organizations?",
        a: "This is currently an independent research project led by The Accidental Intactivist. However, we welcome collaboration and signal-boosting from all organizations that support bodily autonomy and informed choice. We are actively working with DOC (Doctors Opposing Circumcision), Intact Global, GALDEF (Genital Autonomy Legal Defense & Education Fund), and WIBM (Washington Initiative for Boys and Men)."
      },
      {
        q: "Why an anonymous survey? It's prone to self-selection bias.",
        a: "Anonymous online surveys do have inherent limitations. However, their great strength, especially for a topic as personal and often stigmatized as this, is their ability to reach a broad range of individuals who might only feel comfortable sharing candidly under the protection of anonymity. Both anonymous surveys and personal interviews contribute valuable pieces to the overall puzzle."
      },
      {
        q: "Where can I download the Manifesto?",
        a: "A full, clean PDF version of 'The Accidental Intactivist Manifesto' is available for download, sharing, and archiving. It is also available in full on Substack (The Accidental Intactivist's Guide) and Medium."
      }
    ],
    takingSurvey: [
      {
        q: "How long does the survey take? Why is it so long?",
        a: "The survey looks extensive but uses branching logic, meaning you only see sections relevant to your experience (e.g., if you're intact, you won't see questions about restoration). This significantly reduces the actual number of questions. Every question is optional, so you can skip any that feel too time-consuming. Even partial responses are helpful. The survey takes approximately 15-60 minutes depending on your pathway."
      },
      {
        q: "What if my feelings are complicated or contradictory? Will my answers be discarded?",
        a: "Absolutely not—your response will not be discarded for being contradictory. Human experience is often complex and contradictory, and we welcome that nuance. This survey is not a test with right or wrong answers. We are interested in your genuine, self-reported experiences and perceptions, even if they feel inconsistent. Your entire response is valuable data."
      },
      {
        q: "I am circumcised AND actively restoring. Which pathway do I choose?",
        a: "If you are circumcised and also restoring, we recommend choosing the Restoration Pathway. It's designed to capture that entire process, including questions about your feelings and experiences before you started. The Restoration Pathway now includes an option to also complete the Circumcised Pathway to provide that full context."
      },
      {
        q: "Are the charts and data visualizations colorblind-friendly?",
        a: "Yes, we are aware of accessibility concerns with our charts. All new data visualizations are designed with a high-contrast, colorblind-friendly palette (typically a blue-to-red/orange diverging scale). We are actively working to resolve software-based limitations that sometimes cause legend order mismatches. Our commitment is to present data with the utmost clarity."
      },
      {
        q: "I encountered a technical issue or loop while taking the survey.",
        a: "Early conditional logic errors that caused issues for some users have been fully corrected. The survey now provides a smooth and accurate user experience. If you encounter any other technical problems, please report them directly to C4charkey@gmail.com."
      },
      {
        q: "I'm restoring. How should I answer the general sensation questions?",
        a: "For general sensation questions that appear before you enter your specific pathway, please answer based on your current overall sensory experience as someone who is restoring or has restored. The dedicated Restoration Pathway contains specific questions about the changes you've experienced over time due to your restoration efforts, including before and during the process."
      },
      {
        q: "I come from a mixed-religion family. How do I answer the religion section?",
        a: "The religion section has been updated to be more inclusive. You can now select all religious or cultural traditions that apply to your background or upbringing, providing a more accurate picture for those from mixed-heritage families."
      },
      {
        q: "Can I save my progress and finish later?",
        a: "Unfortunately, to ensure robust anonymity, Google Forms does not allow us to enable the 'save and continue later' feature (which requires user sign-in). We recommend setting aside 15-60 minutes to complete it in one sitting."
      },
      {
        q: "How will I know when the results are published?",
        a: "Stay up to date with the Accidental Intactivist's Guide on Substack (https://substack.com/@theaccidentalintactivist). We publish preliminary findings, deep-dive analyses, and will eventually publish a comprehensive report. The Findings site at findings.circumsurvey.online also provides interactive data exploration."
      }
    ],
    bigQuestions: [
      {
        q: "I was circumcised and I feel fine. What's the big deal?",
        a: "That's a valid and common perspective. Many people are perfectly content. This inquiry isn't meant to invalidate your personal experience. Rather, it aims to explore the full spectrum of outcomes—physical, sexual, and psychological—and to question the ethical basis of performing a non-consensual, irreversible surgery on a child who cannot consent, especially when outcomes and experiences vary so widely."
      },
      {
        q: "What about the health benefits? I was told it's more hygienic.",
        a: "The purported health benefits of routine infant circumcision are highly contested and, in many cases, have been debunked or found to be statistically insignificant when weighed against the risks. Major medical bodies around the world (outside the US) do not recommend it. The 'hygiene' argument is often seen as a relic from an era before modern plumbing; simple, normal washing is sufficient for an intact penis."
      },
      {
        q: "What if someone chooses to be circumcised as an adult?",
        a: "An adult making an informed, consensual decision about their own body is exercising their bodily autonomy. That is fundamentally different from a non-consensual, non-therapeutic procedure performed on a healthy infant who has no say in the matter. Our survey and advocacy focus primarily on the ethics of the latter. We welcome perspectives of those circumcised as adults, as their motivations and outcomes are an important part of the overall picture."
      },
      {
        q: "Is this survey anti-religious or anti-Semitic?",
        a: "Absolutely not. This inquiry is a critique of a procedure, not a faith. This survey was developed with direct input from and contains specific pathways for members of Jewish, Christian, and Islamic communities to ensure their perspectives are represented accurately and respectfully. Many people within these faiths are also questioning the practice and exploring alternatives that honor both tradition and bodily integrity. This is a universal children's rights issue."
      },
      {
        q: "Doesn't VMMC (Voluntary Medical Male Circumcision) in Africa prove it prevents HIV?",
        a: "While some studies in specific, high-HIV-prevalence regions of Africa showed a relative risk reduction, these findings are intensely criticized for methodological flaws, the vast difference between relative and absolute risk (which is often very small), and significant ethical concerns about consent quality in trial settings. Crucially, extrapolating data from consenting adults in high-risk environments to justify non-consensual circumcision of infants in low-risk countries is a major scientific and ethical leap that many medical bodies worldwide reject."
      },
      {
        q: "Why do some circumcised men report great experiences, and others report terrible ones?",
        a: "There is no single, universally agreed-upon standard for what a 'correct' circumcision looks like. Different practitioners use different clamping devices (Gomco, Mogen, or Plastibell) or freehand techniques, and they make individual judgments about how much skin to remove. This leads to huge variation in outcomes—what the author calls the 'aesthetic lottery'—regarding scar placement, tightness, and the amount of mobile skin left. This lack of standardization is one of the often-overlooked risks."
      },
      {
        q: "What is foreskin restoration?",
        a: "Foreskin restoration is a process where individuals use non-surgical methods (like manual stretching or specialized devices) to gradually expand their existing skin to create a new foreskin-like covering for the glans. Many restorers report significant improvements in sensitivity, sexual function, and psychological well-being. While it cannot regenerate the specific nerve endings that were removed, it can restore gliding motion and glans coverage. The survey has a dedicated Restoration Pathway to capture these experiences."
      },
      {
        q: "I'm a woman/partner. Why should I care about this?",
        a: "The physical and emotional state of a partner directly impacts intimacy. Understanding their anatomy, potential sensory differences, or any psychological baggage related to their circumcision can lead to better communication, empathy, and a more connected sexual experience. It's also a fundamental issue of children's rights and bodily autonomy, which affects everyone."
      }
    ],
    feelings: [
      {
        q: "I have a lot of anger and trauma about my circumcision. Is this survey a safe space for that?",
        a: "Yes. Absolutely. This survey was created with the understanding that for many, this is not a neutral topic but a source of deep pain, anger, and trauma. The anonymous open-ended questions are designed to be a space where you can articulate those feelings without judgment. Your raw, honest experience is a vital part of the truth we are seeking to document. Your story matters and is treated with respect."
      },
      {
        q: "Why do you use the word 'resentment' instead of 'regret' in some places?",
        a: "This is a crucial distinction that community members helped us understand: 'Regret' often implies agency in a decision, while 'resentment' more accurately describes the feeling of having been harmed by a choice someone else made for you. While some early questions use 'regret' as a catch-all, this feedback is directly influencing our analysis. In published findings, we make a conscious effort to use more precise language like resentment, grief, and anger to more accurately reflect the nature of the experiences being shared."
      },
      {
        q: "I'm a parent who regrets circumcising my son. Is this survey for me?",
        a: "Yes, absolutely. Your perspective is incredibly important and welcome. The Observer, Partner & Ally Pathway has questions specifically for parents to reflect on their decision-making process. The survey is a judgment-free zone designed to understand all experiences, including the difficult emotions of parental regret. Sharing your story can help other parents navigate this complex choice with more information and awareness."
      },
      {
        q: "Are you trying to shame parents who chose circumcision?",
        a: "Our goal is to critique a cultural and medical system, not to shame individual parents who often made decisions based on limited, biased, or incomplete information provided by trusted authorities. Our preliminary data shows that systemic pressures—like institutional medical norms and a lack of counter-information—are seen as the primary drivers of this choice. Our analysis focuses on these systemic failures to empower future parents with better information, not to condemn past ones."
      },
      {
        q: "I feel like society silences men who want to talk about this.",
        a: "This sentiment is at the very core of why The Accidental Intactivist's Inquiry exists. Too many personal stories about male genital anatomy, pleasure, and the impact of circumcision are dismissed, silenced, or ignored. This survey is designed to provide a structured, respectful, and anonymous platform for people to share those candid experiences. Your voice is invaluable, and we are committed to amplifying these often-unheard truths."
      }
    ]
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1.5rem 6rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <p style={{
          textAlign: "center",
          fontFamily: FONT.condensed,
          fontSize: "1.2rem",
          color: "var(--c-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4rem"
        }}>Your Questions, Our Answers</p>

        <FaqCategory title="About the Survey & This Project">
          {faqs.aboutProject.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </FaqCategory>
        
        <FaqCategory title="Taking the Survey">
          {faqs.takingSurvey.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </FaqCategory>

        <FaqCategory title="The Big Questions: Health, Hygiene & Why It Matters">
          {faqs.bigQuestions.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </FaqCategory>

        <FaqCategory title="General Thoughts & Feelings">
          {faqs.feelings.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </FaqCategory>

      </div>
    </div>
  );
}
