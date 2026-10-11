import React, { useState, useMemo } from "react";
import { FONT, C } from "../styles/tokens";
import { useLegibleColor } from "../lib/colorUtils";
import { Search, ExternalLink, Building, Heart, Scale, Film, Headphones, BookOpen, Globe2, Activity, Shield, Share2, FilePlus, Sparkles } from "lucide-react";
import { RESOURCES, RESOURCE_KINDS } from "../../../lib/resources/directory";
import { useReport } from "../contexts/ReportContext";
import { useAssistant } from "../../contexts/AssistantContext";

const ICONS = {
  org: Building,
  legal: Scale,
  faith: Heart,
  restoration: Activity,
  community: Globe2,
  film: Film,
  podcast: Headphones,
  book: BookOpen,
};

const LinkButton = ({ href, children, primary }) => {
  const safeColor = useLegibleColor(
    primary ? "var(--c-bgDeep)" : "var(--c-textBright)",
    primary ? "var(--c-gold)" : "transparent"
  );
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: "inline-block",
      background: primary ? "var(--c-gold)" : "transparent",
      color: safeColor,
      border: `1px solid ${primary ? "var(--c-gold)" : "var(--c-ghost)"}`,
      padding: "0.75rem 1.5rem",
      borderRadius: "100px",
      fontFamily: FONT.condensed,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      textDecoration: "none",
      marginTop: "1rem",
      marginRight: "1rem",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={e => {
      if (primary) {
        e.target.style.background = "var(--c-goldBright)";
      } else {
        e.target.style.background = "var(--c-bgGlass)";
        e.target.style.borderColor = "var(--c-gold)";
        e.target.style.color = "var(--c-gold)";
      }
    }}
    onMouseLeave={e => {
      if (primary) {
        e.target.style.background = "var(--c-gold)";
      } else {
        e.target.style.background = "transparent";
        e.target.style.borderColor = "var(--c-ghost)";
        e.target.style.color = safeColor;
      }
    }}>
      {children}
    </a>
  );
};

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { addExhibitToReport } = useReport();
  const { openAssistant } = useAssistant();

  const filteredResources = useMemo(() => {
    return RESOURCES.filter(res => {
      const matchesSearch = (res.name + " " + res.blurb + " " + (res.tags || []).join(" "))
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || res.kind === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "4rem 1.5rem 6rem",
      background: "var(--c-bgDeep)",
      color: "var(--c-text)"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <Shield size={48} style={{ color: "var(--c-gold)", marginBottom: "1.5rem" }} />
          <h1 style={{ 
            fontFamily: FONT.display, 
            fontSize: "3.5rem", 
            color: "var(--c-textBright)",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em"
          }}>Resource Directory</h1>
          <p style={{
            fontFamily: FONT.body,
            fontSize: "1.15rem",
            lineHeight: 1.6,
            color: "var(--c-dim)",
            maxWidth: 700,
            margin: "0 auto"
          }}>
            A curated database of organizations, communities, legal advocates, and media dedicated to genital autonomy and the movement to end routine infant circumcision.
          </p>
          <div style={{ marginTop: "2rem" }}>
             <LinkButton primary href="https://drive.google.com/file/d/1C3T_nDzIPHSWDUcrvvvcrH_Iallk06pT/view?usp=sharing">Read the Manifesto</LinkButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          marginBottom: "4rem"
        }}>
          {/* Search Bar */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 600
          }}>
            <Search style={{ 
              position: "absolute", 
              left: "1.2rem", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--c-muted)" 
            }} size={20} />
            <input 
              type="text"
              placeholder="Search by name, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "1.2rem 1.2rem 1.2rem 3.5rem",
                fontSize: "1.1rem",
                fontFamily: FONT.body,
                background: "var(--c-bgCard)",
                border: "1px solid var(--c-ghost)",
                borderRadius: "100px",
                color: "var(--c-textBright)",
                outline: "none",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                transition: "border-color 0.3s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--c-gold)"}
              onBlur={(e) => e.target.style.borderColor = "var(--c-ghost)"}
            />
          </div>

          {/* Category Pills */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
            maxWidth: 900
          }}>
            <button
              onClick={() => setActiveCategory("all")}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "100px",
                background: activeCategory === "all" ? "var(--c-gold)" : "var(--c-bgGlass)",
                color: activeCategory === "all" ? "var(--c-bgDeep)" : "var(--c-textBright)",
                border: `1px solid ${activeCategory === "all" ? "var(--c-gold)" : "var(--c-ghost)"}`,
                cursor: "pointer",
                fontFamily: FONT.condensed,
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              All Resources
            </button>
            {Object.entries(RESOURCE_KINDS).map(([key, label]) => {
              const Icon = ICONS[key] || Globe2;
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "100px",
                    background: isActive ? "var(--c-gold)" : "var(--c-bgCard)",
                    color: isActive ? "var(--c-bgDeep)" : "var(--c-textBright)",
                    border: `1px solid ${isActive ? "var(--c-gold)" : "var(--c-ghost)"}`,
                    cursor: "pointer",
                    fontFamily: FONT.condensed,
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--c-gold)";
                      e.currentTarget.style.background = "var(--c-bgGlass)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--c-ghost)";
                      e.currentTarget.style.background = "var(--c-bgCard)";
                    }
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid */}
        {filteredResources.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--c-dim)" }}>
            <h3 style={{ fontFamily: FONT.display, fontSize: "1.5rem" }}>No resources found.</h3>
            <p>Try adjusting your search terms or category filters.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem"
          }}>
            {filteredResources.map((res) => {
              const Icon = ICONS[res.kind] || Globe2;
              return (
                <a 
                  key={res.id} 
                  href={res.url || "#"} 
                  target={res.url ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="lux-hover-lift"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--c-bgCard)",
                    border: "1px solid var(--c-ghost)",
                    borderRadius: 16,
                    padding: "2rem",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--c-gold)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,160,48,0.15)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--c-ghost)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      background: "rgba(212,160,48,0.1)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      border: "1px solid var(--c-goldBright)"
                    }}>
                      <Icon size={24} style={{ color: "var(--c-goldBright)" }} />
                    </div>
                    {res.url && <ExternalLink size={18} style={{ color: "var(--c-muted)" }} />}
                  </div>
                  
                  <h3 style={{ 
                    fontFamily: FONT.display, 
                    fontSize: "1.4rem", 
                    color: "var(--c-textBright)", 
                    marginBottom: "0.5rem",
                    lineHeight: 1.3
                  }}>{res.name}</h3>
                  
                  <div style={{ 
                    fontFamily: FONT.condensed, 
                    fontSize: "0.85rem", 
                    color: "var(--c-gold)", 
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "1rem",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center"
                  }}>
                    <span>{RESOURCE_KINDS[res.kind]}</span>
                    {res.region && (
                      <>
                        <span style={{ color: "var(--c-dim)" }}>•</span>
                        <span style={{ color: "var(--c-dim)" }}>{res.region}</span>
                      </>
                    )}
                  </div>

                  <p style={{ 
                    fontFamily: FONT.body, 
                    fontSize: "1rem", 
                    lineHeight: 1.6, 
                    color: "var(--c-dim)",
                    flexGrow: 1,
                    marginBottom: "1.5rem"
                  }}>
                    {res.blurb}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "auto", marginBottom: "1rem" }}>
                    {res.tags?.map(tag => (
                      <span key={tag} style={{
                        padding: "0.25rem 0.75rem",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontFamily: FONT.condensed,
                        color: "var(--c-muted)"
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    borderTop: "1px solid var(--c-ghost)",
                    paddingTop: "1rem",
                    marginTop: "1rem" 
                  }}>
                    <button 
                      title="Share"
                      onClick={(e) => {
                        e.preventDefault();
                        if (navigator.share) {
                          navigator.share({ title: res.name, text: res.blurb, url: res.url || window.location.href });
                        } else {
                          navigator.clipboard.writeText(res.url || window.location.href);
                          alert("Copied to clipboard!");
                        }
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--c-muted)", cursor: "pointer", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--c-gold)"; e.currentTarget.style.background = "var(--c-bgGlass)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--c-muted)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <Share2 size={18} />
                    </button>
                    <button 
                      title="Add to Report"
                      onClick={(e) => {
                        e.preventDefault();
                        addExhibitToReport('resource', { id: res.id });
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--c-muted)", cursor: "pointer", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--c-gold)"; e.currentTarget.style.background = "var(--c-bgGlass)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--c-muted)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <FilePlus size={18} />
                    </button>
                    <button 
                      title="Ask Research Assistant"
                      onClick={(e) => {
                        e.preventDefault();
                        openAssistant(`What can you tell me about the organization ${res.name}?`);
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--c-muted)", cursor: "pointer", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--c-gold)"; e.currentTarget.style.background = "var(--c-bgGlass)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--c-muted)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <Sparkles size={18} />
                    </button>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Outreach & Updates CTA */}
        <div style={{
          marginTop: "6rem",
          padding: "4rem",
          background: "var(--c-bgCard)",
          borderRadius: 24,
          border: "1px solid var(--c-ghost)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: FONT.display, fontSize: "2.5rem", color: "var(--c-textBright)", marginBottom: "1rem" }}>
              Partner With Us
            </h2>
            <p style={{ fontFamily: FONT.body, fontSize: "1.1rem", color: "var(--c-dim)", maxWidth: 650, margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Are you an organization, support group, or creator dedicated to genital autonomy? 
              We are constantly expanding this directory to build a stronger network. 
              Let us know if you'd like to be included, or if you need to update or remove an existing listing.
            </p>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              <LinkButton primary href="/contact?subject=Resource%20Addition">Request Inclusion</LinkButton>
              <LinkButton href="/contact?subject=Resource%20Update">Update / Remove</LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

