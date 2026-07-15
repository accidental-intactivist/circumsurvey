import React, { useState } from "react";
import { C, FONT } from "../explore/styles/tokens";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/maqrnkyw", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ padding: "3rem", background: "rgba(212,160,48,0.06)", border: `1px solid rgba(212,160,48,0.2)`, borderRadius: 12, textAlign: "center" }}>
        <h3 style={{ fontFamily: FONT.display, fontSize: "1.5rem", color: C.goldBright, marginBottom: "1rem" }}>Message Received</h3>
        <p style={{ color: C.textBright, fontFamily: FONT.body, lineHeight: 1.6 }}>
          Thank you for reaching out. I'll get back to you as soon as possible.
        </p>
        <button 
          onClick={() => setStatus("idle")}
          style={{
            marginTop: "2rem", background: "transparent", border: `1px solid ${C.goldBright}`, color: C.goldBright,
            padding: "0.75rem 2rem", borderRadius: 8, fontFamily: FONT.condensed, letterSpacing: "0.05em", cursor: "pointer"
          }}
        >
          SEND ANOTHER MESSAGE
        </button>
      </div>
    );
  }

  const Label = ({ htmlFor, text, required, noMargin }) => (
    <label htmlFor={htmlFor} style={{ 
      fontFamily: FONT.condensed, 
      color: C.dim, 
      letterSpacing: "0.05em", 
      fontSize: "0.9rem", 
      display: "flex", 
      justifyContent: "space-between",
      marginTop: noMargin ? "0" : "1.5rem", 
      textTransform: "uppercase" 
    }}>
      <span>{text}</span>
      {required && (
        <span style={{ fontFamily: FONT.mono || "monospace", fontSize: "0.6rem", color: "var(--c-ghost)", letterSpacing: "0.2em", paddingTop: "0.2rem" }}>
          [REQUIRED]
        </span>
      )}
    </label>
  );

  return (
    <>
      <style>{`
        .tb-input {
          width: 100%;
          padding: 1.1rem 1.25rem;
          background: var(--c-bgDeep);
          border: 1px solid var(--c-ghost);
          border-bottom: 2px solid rgba(212,160,48,0.3);
          border-radius: 8px;
          color: var(--c-textBright);
          font-family: ${FONT.body};
          font-size: 1.05rem;
          margin-top: 0.5rem;
          box-sizing: border-box;
          transition: all 0.3s ease;
          outline: none;
        }
        .tb-input::placeholder {
          color: var(--c-dim);
          opacity: 0.5;
        }
        .tb-input:focus {
          border-color: var(--c-goldBright);
          background: var(--c-bgCard);
          box-shadow: 0 4px 20px rgba(212,160,48,0.1);
        }
        .tb-button {
          margin-top: 2.5rem;
          width: 100%;
          background: var(--c-goldBright);
          color: #000;
          border: none;
          padding: 1.1rem;
          border-radius: 8px;
          font-family: ${FONT.condensed};
          font-weight: bold;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .tb-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,160,48,0.25);
          background: #fff;
        }
        .tb-button:active:not(:disabled) {
          transform: translateY(0px);
        }
        .contact-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        @media (min-width: 860px) {
          .contact-container {
            flex-direction: row;
            gap: 4rem;
          }
          .contact-intro {
            flex: 0 0 340px;
          }
          .contact-fields {
            flex: 1 1 auto;
          }
        }
      `}</style>

      <div style={{ 
        background: "var(--c-bgCard)", 
        border: `1px solid ${C.ghost}`, 
        borderTop: `2px solid ${C.goldBright}`,
        borderRadius: 12, 
        padding: "3rem", 
        boxShadow: "0 12px 48px rgba(0,0,0,0.25)" 
      }}>
        <div className="contact-container">
          <div className="contact-intro">
            <h2 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: C.textBright, marginBottom: "0.5rem" }}>
              Contact
            </h2>
            <p style={{ color: C.dim, fontFamily: FONT.body, lineHeight: 1.6, marginBottom: "2rem", fontSize: "1.05rem" }}>
              Use this form to submit media inquiries, research proposals, collaboration requests, or general questions regarding the dataset.
            </p>

            <div style={{ background: "rgba(212,160,48,0.06)", border: `1px solid rgba(212,160,48,0.3)`, borderRadius: 8, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h4 style={{ fontFamily: FONT.display, color: C.goldBright, margin: 0, fontSize: "1.2rem", marginBottom: "0.25rem" }}>Have a question about the data?</h4>
                <p style={{ fontFamily: FONT.body, color: C.textBright, margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>
                  The AI Research Assistant is trained on the complete dataset and methodology. It can answer most questions instantly.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-docent', { 
                  detail: { 
                    context: "The user is on the Contact page. Be helpful and answer any general questions about the project, methodology, or dataset so they don't have to wait for an email reply.",
                    tourSuas: ["How was this survey conducted?", "Who funded this research?", "What is the margin of error?"]
                  } 
                }))}
                style={{
                  background: "transparent",
                  border: `1px solid ${C.goldBright}`,
                  color: C.goldBright,
                  padding: "0.75rem 1.5rem",
                  borderRadius: 6,
                  fontFamily: FONT.condensed,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = C.goldBright; e.currentTarget.style.color = "#000"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.goldBright; }}
              >
                ASK THE AI ASSISTANT
              </button>
            </div>
          </div>

          <div className="contact-fields">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <Label htmlFor="name" text="NAME" required noMargin />
                  <input type="text" id="name" name="name" required className="tb-input" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email" text="EMAIL ADDRESS" required noMargin />
                  <input type="email" id="email" name="email" required className="tb-input" placeholder="Your email address" />
                </div>
              </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <Label htmlFor="subject" text="SUBJECT" required />
              <input type="text" id="subject" name="subject" required className="tb-input" placeholder="What is this regarding?" />
            </div>
            <div>
              <Label htmlFor="source" text="WHERE DID YOU HEAR ABOUT US?" />
              <input type="text" id="source" name="source" className="tb-input" placeholder="(Optional) Podcast, Twitter, etc." />
            </div>
          </div>

          <Label htmlFor="message" text="MESSAGE" required />
          <textarea id="message" name="message" required rows={6} className="tb-input" style={{ resize: "vertical" }} placeholder="How can I help you?"></textarea>

          <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", alignItems: "flex-start", background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: 8, border: `1px solid ${C.ghost}` }}>
            <input type="checkbox" id="consent" name="consent" required style={{ marginTop: "0.25rem", cursor: "pointer", accentColor: C.goldBright }} />
            <label htmlFor="consent" style={{ fontFamily: FONT.body, fontSize: "0.85rem", color: C.dim, lineHeight: 1.5, cursor: "pointer" }}>
              <strong style={{ color: C.textBright }}>Privacy Disclaimer:</strong> By submitting this form, you consent to having your name, email address, and message securely transmitted for the sole purpose of responding to your inquiry. Your personally identifiable information (PII) will never be shared, sold, or publicly displayed without explicit consent.
            </label>
          </div>

          {status === "error" && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 8, color: "var(--c-redBright)", fontFamily: FONT.body, fontSize: "0.95rem" }}>
              There was an error sending your message. Please verify your Formspree endpoint URL is configured correctly.
            </div>
          )}

              <button 
                type="submit" 
                className="tb-button"
                disabled={status === "submitting"}
                style={{ opacity: status === "submitting" ? 0.7 : 1, cursor: status === "submitting" ? "not-allowed" : "pointer" }}
              >
                {status === "submitting" ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
