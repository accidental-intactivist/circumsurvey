import React, { useMemo, useState, useEffect } from 'react';
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
  "just", "like", "get", "think", "really", "even", "much", "many", "way", "make", "also", "one", "two", "know", "feel",
  // Contractions without apostrophes & fragments
  "dont", "cant", "im", "ive", "youre", "didnt", "doesnt", "wasnt", "wouldnt", "shouldnt", "couldnt", "can", "don", 
  "didn", "wasn", "wouldn", "shouldn", "couldn", "havent", "hasnt", "hadnt", "haven", "hasn", "hadn", "arent", "werent", 
  "aren", "weren", "re", "ve", "ll", "d", "t", "s", "m"
]);

export default function WordCloud({ narratives = [], selectedWord = null, onWordClick = () => {} }) {
  const { tooltip, showTooltip, moveTooltip, hideTooltip } = useTooltip();
  const [isOpen, setIsOpen] = useState(false);
  const [gramSize, setGramSize] = useState('unigram'); // 'unigram' | 'bigram' | 'trigram'
  const [showExclusions, setShowExclusions] = useState(false);
  const [newExclusion, setNewExclusion] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Load custom exclusions from localStorage
  const [customExclusions, setCustomExclusions] = useState(() => {
    try {
      const stored = localStorage.getItem('circumsurvey_wordcloud_exclusions');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persist custom exclusions
  useEffect(() => {
    try {
      localStorage.setItem('circumsurvey_wordcloud_exclusions', JSON.stringify([...customExclusions]));
    } catch (e) {
      console.error("Failed to save exclusions to localStorage", e);
    }
  }, [customExclusions]);

  const handleAddExclusion = (word) => {
    const term = word || newExclusion;
    if (!term) return;
    const clean = term.trim().toLowerCase();
    if (!clean) return;
    setCustomExclusions(prev => {
      const next = new Set(prev);
      next.add(clean);
      return next;
    });
    setNewExclusion('');
  };

  const handleRemoveExclusion = (word) => {
    setCustomExclusions(prev => {
      const next = new Set(prev);
      next.delete(word);
      return next;
    });
  };

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

      // Split into sentence-like segments to avoid forming n-grams across punctuation boundary
      const segments = text.toLowerCase().split(/[.!?;\n\r]+/);

      segments.forEach(segment => {
        // Basic tokenization keeping apostrophes and hyphens
        const tokens = segment
          .replace(/[^a-z0-9\s'-]/g, ' ')
          .split(/\s+/)
          .map(w => w.replace(/^['-]+|['-]+$/g, '')) // Remove leading/trailing apostrophes/hyphens
          .filter(w => w.length > 0);
        
        if (gramSize === 'unigram') {
          tokens.forEach(t => {
            if (t.length > 2 && !STOP_WORDS.has(t) && !customExclusions.has(t)) {
              counts[t] = (counts[t] || 0) + 1;
            }
          });
        } else if (gramSize === 'bigram') {
          for (let i = 0; i < tokens.length - 1; i++) {
            const w1 = tokens[i];
            const w2 = tokens[i + 1];
            if (w1.length >= 2 && w2.length >= 2) {
              const isW1Stop = STOP_WORDS.has(w1) || customExclusions.has(w1);
              const isW2Stop = STOP_WORDS.has(w2) || customExclusions.has(w2);
              // Include only if not both are stop words
              if (!isW1Stop || !isW2Stop) {
                const phrase = `${w1} ${w2}`;
                if (!customExclusions.has(phrase)) {
                  counts[phrase] = (counts[phrase] || 0) + 1;
                }
              }
            }
          }
        } else if (gramSize === 'trigram') {
          for (let i = 0; i < tokens.length - 2; i++) {
            const w1 = tokens[i];
            const w2 = tokens[i + 1];
            const w3 = tokens[i + 2];
            if (w1.length >= 2 && w2.length >= 2 && w3.length >= 2) {
              const isW1Stop = STOP_WORDS.has(w1) || customExclusions.has(w1);
              const isW2Stop = STOP_WORDS.has(w2) || customExclusions.has(w2);
              const isW3Stop = STOP_WORDS.has(w3) || customExclusions.has(w3);
              // Include only if not all three are stop words
              if (!isW1Stop || !isW2Stop || !isW3Stop) {
                const phrase = `${w1} ${w2} ${w3}`;
                if (!customExclusions.has(phrase)) {
                  counts[phrase] = (counts[phrase] || 0) + 1;
                }
              }
            }
          }
        }
      });
    });

    const entries = Object.entries(counts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 60); // Top 60 words/phrases

    if (entries.length === 0) return [];

    // Calculate font size domain
    const minVal = Math.min(...entries.map(e => e.value));
    const maxVal = Math.max(...entries.map(e => e.value));
    
    const sizeScale = scaleLinear()
      .domain([minVal, maxVal])
      .range([0.8, 3.2]); // Rem font sizes

    const opacityScale = scaleLinear()
      .domain([minVal, maxVal])
      .range([0.5, 1]);

    // Shuffle the array deterministically so big/small words are mixed
    const shuffled = [...entries].sort((a, b) => (a.text.length % 3) - (b.text.length % 3));

    return shuffled.map(entry => ({
      ...entry,
      fontSize: sizeScale(entry.value),
      opacity: opacityScale(entry.value)
    }));
  }, [narratives, gramSize, customExclusions]);

  if (words.length === 0 && customExclusions.size === 0) return null;

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
        }}>Common Keywords & Phrases</h3>
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
        <>
          {/* Controls Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1.2rem",
            marginTop: "1rem",
            borderTop: `1px dashed ${C.ghost}`
          }}>
            {/* Gram select buttons */}
            <div style={{ 
              display: "flex", 
              background: C.bgDeep, 
              padding: 3, 
              borderRadius: 6, 
              border: `1px solid ${C.ghost}` 
            }}>
              {[
                { id: 'unigram', label: 'Words' },
                { id: 'bigram', label: '2-Word Phrases' },
                { id: 'trigram', label: '3-Word Phrases' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setGramSize(mode.id)}
                  style={{
                    background: gramSize === mode.id ? C.gold : "transparent",
                    color: gramSize === mode.id ? C.bgCard : C.muted,
                    border: "none",
                    borderRadius: 4,
                    padding: "0.3rem 0.7rem",
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Exclusions toggle */}
            <button
              onClick={() => setShowExclusions(!showExclusions)}
              style={{
                background: showExclusions ? "rgba(217,79,79,0.08)" : "transparent",
                color: showExclusions ? C.red : C.muted,
                border: `1px solid ${showExclusions ? C.red : C.ghost}`,
                borderRadius: 6,
                padding: "0.3rem 0.8rem",
                fontFamily: FONT.condensed,
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                transition: "all 0.15s ease",
              }}
            >
              <span>🚫</span>
              <span>Exclusions ({customExclusions.size})</span>
            </button>
          </div>

          {/* Exclusions Panel */}
          {showExclusions && (
            <div style={{
              background: C.bgDeep,
              border: `1px solid ${C.ghost}`,
              borderRadius: 6,
              padding: "1rem",
              marginTop: "0.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{
                  fontFamily: FONT.condensed,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: C.textBright,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Excluded Keywords & Phrases</span>
                {customExclusions.size > 0 && (
                  <button
                    onClick={() => setCustomExclusions(new Set())}
                    style={{
                      background: "transparent",
                      color: C.red,
                      border: "none",
                      fontFamily: FONT.condensed,
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Add Exclusion */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddExclusion();
                    }
                  }}
                  placeholder="Type a word or phrase to exclude..."
                  style={{
                    flex: 1,
                    background: C.bgCard,
                    border: `1px solid ${C.ghost}`,
                    borderRadius: 4,
                    padding: "0.4rem 0.6rem",
                    color: C.textBright,
                    fontFamily: FONT.body,
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => handleAddExclusion()}
                  style={{
                    background: C.gold,
                    color: C.bgCard,
                    border: "none",
                    borderRadius: 4,
                    padding: "0.4rem 0.8rem",
                    fontFamily: FONT.condensed,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Add
                </button>
              </div>

              {/* List of active exclusions */}
              {customExclusions.size === 0 ? (
                <div style={{
                  fontSize: "0.8rem",
                  color: C.dim,
                  fontStyle: "italic",
                }}>No custom exclusions added. Hover over items in the cloud and click "×" to quickly exclude them.</div>
              ) : (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                }}>
                  {[...customExclusions].map((word) => (
                    <span
                      key={word}
                      style={{
                        background: "rgba(217,79,79,0.08)",
                        border: `1px solid rgba(217,79,79,0.25)`,
                        borderRadius: 4,
                        padding: "0.15rem 0.4rem",
                        fontSize: "0.75rem",
                        color: C.red,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontFamily: FONT.mono,
                      }}
                    >
                      <span>{word}</span>
                      <button
                        onClick={() => handleRemoveExclusion(word)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.red,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Word Cloud Rendering */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem 1.2rem",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "1.5rem",
            marginTop: "1rem",
            borderTop: `1px dashed ${C.ghost}`
          }}>
            {words.length === 0 ? (
              <div style={{ color: C.dim, fontStyle: "italic", fontSize: "0.9rem", padding: "1rem" }}>
                No keywords found with current settings.
              </div>
            ) : (
              words.map((w, i) => (
                <span
                  key={i}
                  onClick={() => onWordClick(w.text)}
                  onMouseEnter={(e) => {
                    showTooltip(e, `Occurs ${w.value} times`);
                    setHoveredIndex(i);
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    hideTooltip();
                    setHoveredIndex(null);
                  }}
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    position: "relative",
                  }}
                  onMouseOver={(e) => {
                    if (selectedWord !== w.text) {
                      e.currentTarget.style.color = C.textBright;
                      e.currentTarget.style.opacity = 1;
                    }
                    e.currentTarget.style.transform = "scale(1.03)";
                  }}
                  onMouseOut={(e) => {
                    if (selectedWord !== w.text) {
                      e.currentTarget.style.color = C.goldBright;
                      e.currentTarget.style.opacity = selectedWord ? 0.3 : w.opacity;
                    }
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <span>{w.text}</span>
                  {hoveredIndex === i && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        hideTooltip();
                        handleAddExclusion(w.text);
                      }}
                      title={`Exclude "${w.text}"`}
                      style={{
                        background: C.red,
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 14,
                        height: 14,
                        fontSize: "9px",
                        lineHeight: "14px",
                        textAlign: "center",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        margin: 0,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </>
      )}
      <Tooltip {...tooltip} />
    </div>
  );
}
