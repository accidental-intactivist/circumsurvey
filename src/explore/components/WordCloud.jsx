import React, { useMemo, useState } from 'react';
import { C, FONT } from '../styles/tokens';
import { useTooltip, Tooltip } from './Tooltip';
import { scaleLinear } from 'd3-scale';

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further",
  "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's",
  "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's",
  "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
  "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
  "you've", "your", "yours", "yourself", "yourselves",
  // Common survey noise words
  "just", "like", "get", "think", "really", "even", "much", "many", "way", "make", "also", "one", "two", "know", "feel"
]);

export default function WordCloud({ narratives = [], selectedWord = null, onWordClick = () => {} }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [isOpen, setIsOpen] = useState(false);

  const words = useMemo(() => {
    if (!narratives || narratives.length === 0) return [];

    const counts = {};
    const fillers = [
      "n/a", "na", "no", "none", "nothing", "nil", "not applicable", 
      "no comment", "unsure", "unknown", "n.a", "n.a.", "none at all", 
      "no.", "no response", "don't know", "dont know", "no one", "not sure",
      "n a", "n / a", "none.", "no comments", "no comment.", "no one."
    ];

    narratives.forEach(item => {
      const text = typeof item === 'string' ? item : (item.text || item.label || "");
      if (!text || typeof text !== 'string') return;
      
      const normalized = text.trim().toLowerCase();
      const clean = normalized.replace(/^[.\s\-_,]+|[.\s\-_,]+$/g, "").trim();
      if (!clean || fillers.includes(clean)) return;

      // Basic tokenization
      const tokens = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ') // Remove punctuation except hyphens
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
      
      tokens.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    const entries = Object.entries(counts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 60); // Top 60 words

    if (entries.length === 0) return [];

    // Calculate font size domain
    const minVal = Math.min(...entries.map(e => e.value));
    const maxVal = Math.max(...entries.map(e => e.value));
    
    const sizeScale = scaleLinear()
      .domain([minVal, maxVal])
      .range([0.8, 3.5]); // Rem font sizes

    // We can also scale opacity or color based on frequency
    const opacityScale = scaleLinear()
      .domain([minVal, maxVal])
      .range([0.5, 1]);

    // Shuffle the array so the biggest words aren't all clumped at the top
    // A simple deterministic shuffle based on length so it doesn't flicker
    const shuffled = [...entries].sort((a, b) => (a.text.length % 3) - (b.text.length % 3));

    return shuffled.map(entry => ({
      ...entry,
      fontSize: sizeScale(entry.value),
      opacity: opacityScale(entry.value)
    }));
  }, [narratives]);

  if (words.length === 0) return null;

  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.ghost}`,
      borderRadius: 8,
      padding: "1.5rem",
      marginTop: "1.5rem",
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <h3 style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: "1.15rem",
          color: C.textBright,
          margin: 0,
          letterSpacing: "-0.01em",
        }}>Common Keywords</h3>
        <span style={{
          fontFamily: FONT.condensed,
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.gold,
        }}>
          {isOpen ? "Hide Cloud ▲" : "Show Cloud ▼"}
        </span>
      </div>
      
      {isOpen && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1rem",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "1.5rem",
          marginTop: "1rem",
          borderTop: `1px dashed ${C.ghost}`
        }}>
          {words.map((w, i) => (
            <span
              key={i}
              onClick={() => onWordClick(w.text)}
              onMouseEnter={(e) => showTooltip(e, `Occurs ${w.value} times`)}
              onMouseMove={moveTooltip}
              onMouseLeave={hideTooltip}
              style={{
                fontFamily: FONT.condensed,
                fontSize: `${w.fontSize}rem`,
                fontWeight: w.value > (words[0].value * 0.5) || selectedWord === w.text ? 700 : 400,
                color: selectedWord === w.text ? C.bgCard : C.goldBright,
                background: selectedWord === w.text ? C.goldBright : "transparent",
                padding: selectedWord === w.text ? "0 0.4rem" : "0",
                borderRadius: 4,
                opacity: selectedWord && selectedWord !== w.text ? 0.3 : (selectedWord === w.text ? 1 : w.opacity),
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (selectedWord !== w.text) {
                  e.currentTarget.style.color = C.textBright;
                  e.currentTarget.style.opacity = 1;
                }
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                if (selectedWord !== w.text) {
                  e.currentTarget.style.color = C.goldBright;
                  e.currentTarget.style.opacity = selectedWord ? 0.3 : w.opacity;
                }
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {w.text}
            </span>
          ))}
        </div>
      )}
      <Tooltip {...tooltip} />
    </div>
  );
}
