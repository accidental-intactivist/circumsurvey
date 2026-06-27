import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { C, FONT } from "../styles/tokens";
import IconifyEmoji from "./IconifyEmoji";

export default function BreadcrumbDropdown({ label, currentId, items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!items || items.length === 0) {
    return <span>{label}</span>;
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          padding: "0.2rem 0.4rem",
          margin: "-0.2rem -0.4rem",
          color: "inherit",
          fontFamily: "inherit",
          fontSize: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.2rem",
          borderRadius: "4px",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.goldBright; e.currentTarget.style.background = "var(--c-bgSoft)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; e.currentTarget.style.background = "transparent"; }}
      >
        <span>{label}</span>
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "0.2rem",
            minWidth: "220px",
            background: C.bgCard,
            border: `1px solid ${C.ghost}`,
            borderRadius: "8px",
            padding: "0.4rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            backdropFilter: "blur(12px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(item);
                }
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                textDecoration: "none",
                color: item.id === currentId ? C.goldBright : C.text,
                background: item.id === currentId ? "var(--c-bgSoft)" : "transparent",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontFamily: FONT.body,
                textTransform: "none",
                letterSpacing: "normal",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (item.id !== currentId) {
                  e.currentTarget.style.background = "var(--c-bgSoft)";
                  e.currentTarget.style.color = C.textBright;
                }
              }}
              onMouseLeave={(e) => {
                if (item.id !== currentId) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = C.text;
                }
              }}
            >
              {item.emoji && <IconifyEmoji emoji={item.emoji} style={{ color: item.color }} />}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
