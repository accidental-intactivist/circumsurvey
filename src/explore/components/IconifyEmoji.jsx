import React from "react";
import * as Lucide from "lucide-react";
import { PATH_COLORS, C } from "../styles/tokens";

// For solid circles, we create a small wrapper around Lucide's Circle
const SolidCircle = (props) => <Lucide.Circle fill="currentColor" strokeWidth={0} {...props} />;

const EMOJI_MAPPING = {
  // Circles for pathways
  "\u{1F7E2}": SolidCircle,
  "\u{1F535}": SolidCircle,
  "\u{1F7E3}": SolidCircle,
  "\u{1F7E0}": SolidCircle,
  "\u{1F534}": SolidCircle,
  "\u{26AA}": SolidCircle,
  
  // Survey Phases
  "\u{1F4CB}": Lucide.ClipboardList,
  "\u{1F33F}": Lucide.Leaf,
  "\u{1F500}": Lucide.Shuffle,
  
  // Observer Roles
  "\u{1F465}": Lucide.Users,
  "\u{1F91D}": Lucide.Handshake,
  "\u{1F476}": Lucide.Baby,
  "\u{1F930}": Lucide.Heart,
  "\u{1F3E5}": Lucide.Hospital,
  "\u{1F4E3}": Lucide.Megaphone,
  "\u{2640}": Lucide.User,
  "\u{2640}\u{FE0F}": Lucide.User,
  "\u{1F393}": Lucide.GraduationCap,
  "\u{1F3AD}": Lucide.VenetianMask,
  
  // Religions
  "\u{269B}\u{FE0F}": Lucide.Atom,
  "\u{271D}\u{FE0F}": Lucide.Cross,
  "\u{2721}\u{FE0F}": Lucide.Star,
  "\u{262A}\u{FE0F}": Lucide.Moon,
  
  // Recommendations / editorial
  "\u{1F4AC}": Lucide.MessageSquare,
  "\u{2696}\u{FE0F}": Lucide.Scale,
  "\u{1F4CA}": Lucide.BarChart2,
  "\u{1F4DC}": Lucide.ScrollText || Lucide.FileText,
  
  // Fallbacks for others that might pop up
  "\u{1F549}\u{FE0F}": Lucide.Activity,
  "\u{1F56F}\u{FE0F}": Lucide.Flame || Lucide.Zap,
  
  // New Header Emojis
  "\u{1F7E3}": SolidCircle, // purple circle
  "🟣": SolidCircle,
  "⏱️": Lucide.Timer,
  "⚡": Lucide.Zap,
  "🌟": Lucide.Star,
  "📙": Lucide.Book,
  "⚖️": Lucide.Scale,
  "💬": Lucide.MessageSquare,
  "〰": Lucide.Activity,
  "≡": Lucide.Menu,
  "◎": Lucide.CircleDot,
  "◈": Lucide.Target,
  "🔍": Lucide.Search,
  "🙋‍♂️": Lucide.User,
  "♂": Lucide.User,
  "♀": Lucide.User,
};

const EMOJI_COLORS = {
  // Circles for pathways
  "\u{1F7E2}": PATH_COLORS.intact,
  "\u{1F535}": PATH_COLORS.circumcised,
  "\u{1F7E3}": PATH_COLORS.restoring,
  "🟣": PATH_COLORS.restoring,
  "\u{1F7E0}": PATH_COLORS.observer,
  "\u{1F534}": PATH_COLORS.trans_vaginoplasty, // red
  "\u{26AA}": PATH_COLORS.intersex,
  
  // Survey Phases
  "\u{1F4CB}": C.gold,
  "\u{1F33F}": C.gold,
  "\u{1F500}": C.gold,
};

export function IconifyEmoji({ emoji, size = "1.2em", style, ...props }) {
  if (!emoji) return null;
  const trimmed = emoji.trim();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const glyphs = Array.from(segmenter.segment(trimmed)).map(s => s.segment);
  
  if (glyphs.length > 1) {
    return (
      <span style={{ display: "inline-flex", gap: "0.1rem", alignItems: "center", verticalAlign: "middle" }}>
        {glyphs.map((g, idx) => (
          <IconifyEmoji key={idx} emoji={g} size={size} style={style} {...props} />
        ))}
      </span>
    );
  }
  
  // Try exact match, then stripped of variation selector, then just fallback
  const g0 = glyphs[0];
  const g0Stripped = g0.replace("\u{FE0F}", "");
  const IconComponent = EMOJI_MAPPING[g0] || EMOJI_MAPPING[g0Stripped] || EMOJI_MAPPING[trimmed] || EMOJI_MAPPING[emoji];
  const inherentColor = EMOJI_COLORS[g0] || EMOJI_COLORS[g0Stripped] || EMOJI_COLORS[trimmed] || EMOJI_COLORS[emoji];
  
  if (!IconComponent) {
    const hex = Array.from(emoji).map(c => c.charCodeAt(0).toString(16)).join("-");
    console.warn(`IconifyEmoji unmapped emoji: '${emoji}' (${hex})`);
    return <span style={{ fontSize: size, ...style }} {...props}>{trimmed}</span>;
  }
  
  return (
    <IconComponent 
      size={size}
      style={{ 
        display: "inline-block", 
        verticalAlign: "middle",
        color: inherentColor || "currentColor",
        ...style 
      }} 
      {...props} 
    />
  );
}
export default IconifyEmoji;
