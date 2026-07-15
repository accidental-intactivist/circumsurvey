import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { C, FONT } from "../explore/styles/tokens";
import { EXHIBIT_ROUTES, ROUTE_META } from "../explore/components/ExploreMasthead";
import * as Icons from "../explore/components/Icons";

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

  const navigate = useNavigate();

  // Pick 3 random exhibits on each mount for the success state
  const suggestions = useMemo(() => {
    const pool = EXHIBIT_ROUTES.map(ex => ({
      ...ex,
      ...ROUTE_META[ex.route],
      id: ex.route,
      route: `/explore#/${ex.route}`,
      icon: Icons[ex.icon] || Icons.Compass,
    }));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }, []);

  if (status === "success") {
    return (
      <div style={{ 
        background: "var(--c-bgCard)", 
        border: `1px solid ${C.ghost}`, 
        borderTop: `2px solid ${C.goldBright}`,
        borderRadius: 12, 
        padding: "3rem", 
        boxShadow: "0 12px 48px rgba(0,0,0,0.25)" 
      }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h3 style={{ fontFamily: FONT.display, fontSize: "2rem", color: C.goldBright, marginBottom: "1rem" }}>Message Received</h3>
          <p style={{ color: C.textBright, fontFamily: FONT.body, fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
            Thank you for reaching out. You will receive a response as soon as possible.
          </p>
        </div>

        <div style={{ 
          fontFamily: FONT.condensed,
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: C.dim,
          marginBottom: "1.25rem",
          textAlign: "center"
        }}>
          In the meantime, explore the data
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: "1.5rem", 
          marginBottom: "3rem",
          textAlign: "left"
        }}>
          {suggestions.map((ex) => (
            <SuggestionCard key={ex.id} exhibit={ex} navigate={navigate} />
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/explore")}
            style={{
              background: "transparent",
              color: C.textBright,
              border: `1px solid ${C.ghost}`,
              padding: "0.75rem 2rem",
              borderRadius: 999,
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.color = C.goldBright;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.ghost;
              e.currentTarget.style.color = C.textBright;
            }}
          >
            <Icons.ArrowLeft size={16} /> Return to Master Index
          </button>
        </div>
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

// ── Suggestion Card ──────────────────────────────────────────

function SuggestionCard({ exhibit, navigate }) {
  const [hovered, setHovered] = React.useState(false);
  const CardIcon = exhibit.icon || Icons.Compass;

  return (
    <div
      onClick={() => navigate(exhibit.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: C.bgCard,
        border: `1px solid ${hovered ? C.gold + "60" : C.ghost}`,
        borderRadius: 14,
        padding: "1.5rem 1.25rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 10px 25px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,200,50,0.04)`
          : `0 2px 8px rgba(0,0,0,0.3)`,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow on hover */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 50% 30%, ${C.gold}${hovered ? "18" : "08"} 0%, transparent 70%)`,
        transition: "background 0.3s ease",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        {/* Top group: kicker + title */}
        <div>
          {/* Icon + Kicker row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}>
            <CardIcon
              size={18}
              color={hovered ? C.goldBright : C.gold}
              style={{ transition: "color 0.2s ease", opacity: 0.9 }}
            />
            <span style={{
              fontFamily: FONT.condensed,
              fontWeight: 700,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: C.gold,
            }}>
              {exhibit.kicker}
            </span>
          </div>

          <h3 style={{
            fontFamily: FONT.display,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: C.textBright,
            margin: 0,
            lineHeight: 1.2,
          }}>
            {exhibit.title}
          </h3>
        </div>

        {/* Bottom: description */}
        <p style={{
          fontFamily: FONT.body,
          fontSize: "0.82rem",
          color: C.dim,
          lineHeight: 1.45,
          margin: "0.75rem 0 0",
        }}>
          {exhibit.desc}
        </p>
      </div>

      {/* Arrow indicator */}
      <div style={{
        position: "absolute",
        bottom: "1rem",
        right: "1rem",
        color: hovered ? C.goldBright : C.ghost,
        transition: "all 0.25s ease",
        transform: hovered ? "translateX(2px)" : "none",
      }}>
        <Icons.ArrowRight size={14} />
      </div>
    </div>
  );
}
