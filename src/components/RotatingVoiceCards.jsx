import React, { useState, useEffect } from "react";
import { C, FONT } from "../explore/styles/tokens";
import { PATHS } from "./GuidedTour/tourData";

const FINAL_QUOTES = [
  { path: "intact", label: "— Intact Respondent", text: "“Making a decision about changing somebody else's body in a non-medically necessary way is wrong.”" },
  { path: "circumcised", label: "— Circumcised Respondent", text: "“Violating the body autonomy at such a young age for cosmetic reasons is wrong.”" },
  { path: "circumcised", label: "— Circumcised Respondent", text: "“His body his choice. Circumcision is a permanent lifetime decision. Some restore but it is not the same as feelings.”" },
  { path: "intact", label: "— Intact Respondent", text: "“A natural penis is just as healthy and clean as a circumcised one.”" },
  { path: "circumcised", label: "— Circumcised Respondent", text: "“I wish my parents had given me the choice. I have to live with the physical and emotional consequences.”" },
  { path: "restoring", label: "— Restoring Respondent", text: "“Restoring has given me back some sensitivity, but I can never get back the specialized nerve endings that were taken.”" },
  { path: "observer", label: "— Partner & Observer", text: "“Having been with both, there is a clear mechanical difference. The gliding action of an intact penis is completely lost.”" },
  { path: "circumcised", label: "— Circumcised Respondent", text: "“We are the only country in the developed world that still does this routinely to infants. It needs to stop.”" },
  { path: "intact", label: "— Intact Respondent", text: "“I am so grateful my parents left me whole. I have never had a single issue with cleanliness or function.”" },
  { path: "circumcised", label: "— Circumcised Respondent", text: "“The foreskin is not a birth defect. It serves a very specific and highly sensitive function.”" },
  { path: "restoring", label: "— Restoring Respondent", text: "“It's frustrating that I have to spend years of my adult life undoing a 5-minute cosmetic procedure I didn't ask for.”" },
  { path: "observer", label: "— Medical Professional", text: "“In my practice, I now actively counsel parents against the procedure unless there is a strict medical necessity.”" },
];

export default function RotatingVoiceCards() {
  const [startIndex, setStartIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false); // Trigger fade out
      setTimeout(() => {
        setStartIndex((prev) => (prev + 6) % FINAL_QUOTES.length);
        setFade(true); // Trigger fade in
      }, 500);
    }, 12000); // Rotate every 12 seconds
    return () => clearInterval(timer);
  }, []);

  const currentQuotes = FINAL_QUOTES.slice(startIndex, startIndex + 6);
  // Handle wrap-around if needed (though length is exactly 12 here)
  if (currentQuotes.length < 6) {
    currentQuotes.push(...FINAL_QUOTES.slice(0, 6 - currentQuotes.length));
  }

  return (
    <div style={{
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
      gap: "1rem",
      opacity: fade ? 1 : 0,
      transition: "opacity 0.5s ease-in-out",
    }}>
      {currentQuotes.map((q, i) => (
        <div key={`${startIndex}-${i}`} style={{
          background: "rgba(255,255,255,0.03)", 
          border: `1px solid ${C.ghost}`,
          borderRadius: 8, 
          padding: "1.2rem",
          display: "flex", 
          flexDirection: "column",
          gap: "0.5rem"
        }}>
          <div style={{ fontFamily: FONT.condensed, fontSize: "0.75rem", color: PATHS[q.path]?.color || C.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {q.label}
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: "0.95rem", color: C.textBright, lineHeight: 1.5 }}>
            {q.text}
          </div>
        </div>
      ))}
    </div>
  );
}
