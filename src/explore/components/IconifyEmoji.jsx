import React from "react";
import { Icon } from "@iconify/react";

const EMOJI_MAPPING = {
  // Circles for pathways
  "🟢": "fluent-emoji-high-contrast:green-circle",
  "🔵": "fluent-emoji-high-contrast:blue-circle",
  "🟣": "fluent-emoji-high-contrast:purple-circle",
  "🟠": "fluent-emoji-high-contrast:orange-circle",
  "🔴": "fluent-emoji-high-contrast:red-circle",
  "⚪": "fluent-emoji-high-contrast:white-circle",
  
  // Survey Phases
  "📋": "fluent-emoji-high-contrast:clipboard",
  "🌿": "fluent-emoji-high-contrast:seedling",
  "🔀": "fluent-emoji-high-contrast:shuffle-tracks-button",
  
  // Observer Roles
  "👥": "fluent-emoji-high-contrast:busts-in-silhouette",
  "🤝": "fluent-emoji-high-contrast:handshake",
  "👶": "fluent-emoji-high-contrast:baby",
  "🤰": "fluent-emoji-high-contrast:pregnant-woman",
  "🏥": "fluent-emoji-high-contrast:hospital",
  "📣": "fluent-emoji-high-contrast:megaphone",
  "♀": "fluent-emoji-high-contrast:female-sign",
  "🎓": "fluent-emoji-high-contrast:graduation-cap",
  "🎭": "fluent-emoji-high-contrast:performing-arts",
  
  // Religions
  "⚛️": "fluent-emoji-high-contrast:atom-symbol",
  "✝️": "fluent-emoji-high-contrast:latin-cross",
  "✡️": "fluent-emoji-high-contrast:star-of-david",
  "☪️": "fluent-emoji-high-contrast:star-and-crescent",
  
  // Recommendations / editorial
  "💬": "fluent-emoji-high-contrast:speech-balloon",
  "⚖️": "fluent-emoji-high-contrast:balance-scale",
  "📊": "fluent-emoji-high-contrast:bar-chart",
  "📜": "fluent-emoji-high-contrast:scroll",
};

export function IconifyEmoji({ emoji, size = "1.2em", style, ...props }) {
  if (!emoji) return null;
  
  const trimmed = emoji.trim();
  
  // Support compound emojis (e.g. "🔵🟣") by rendering individual icons side-by-side
  const glyphs = Array.from(trimmed);
  if (glyphs.length > 1) {
    return (
      <span style={{ display: "inline-flex", gap: "0.1rem", alignItems: "center", verticalAlign: "middle" }}>
        {glyphs.map((g, idx) => (
          <IconifyEmoji key={idx} emoji={g} size={size} style={style} {...props} />
        ))}
      </span>
    );
  }
  
  const iconName = EMOJI_MAPPING[trimmed];
  if (!iconName) {
    // Fallback if the emoji isn't in our map or if it's not a recognized emoji character
    return <span style={{ fontSize: size, ...style }} {...props}>{trimmed}</span>;
  }
  
  return (
    <Icon 
      icon={iconName} 
      width={size} 
      height={size} 
      style={{ 
        display: "inline-block", 
        verticalAlign: "middle",
        color: "currentColor", // Automatically inherits color from text context
        ...style 
      }} 
      {...props} 
    />
  );
}

export default IconifyEmoji;
