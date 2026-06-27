import { C, FONT } from "../styles/tokens";
import { IconifyEmoji } from "./IconifyEmoji";

export default function ExhibitSectionHeading({
  title,
  icon,        // legacy: emoji string mapped to a Lucide icon via IconifyEmoji
  Icon,        // preferred: a React icon component from ../components/Icons
  color = C.goldBright,
  description,
  children,
  hideDivider = false,
  id
}) {
  return (
    <div id={id} style={{ marginBottom: "1rem" }}>
      {!hideDivider && (
        <div style={{ borderBottom: "5px dotted var(--c-ghost)", margin: "5rem 0 1rem", opacity: 0.5 }} />
      )}
      <h2 style={{ 
        fontFamily: FONT.condensed, 
        fontSize: "1.5rem", 
        color: color, 
        textTransform: "uppercase", 
        letterSpacing: "0.15em", 
        marginBottom: description ? "1rem" : "2rem", 
        textAlign: "left", 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem" 
      }}>
        {Icon
          ? <Icon size={24} color={color} style={{ verticalAlign: "middle", flexShrink: 0 }} />
          : icon && <IconifyEmoji emoji={icon} />} {title}
      </h2>
      {description && (
        <p style={{ color: C.muted, fontSize: "1rem", maxWidth: 800, marginBottom: "2rem", lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
