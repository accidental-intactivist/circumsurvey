import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertCircle, 
  Scale, 
  BookOpen, 
  Network, 
  ExternalLink, 
  User, 
  Building2, 
  ArrowRight 
} from 'lucide-react';
import './EntityLink.css';

let cachedEntitiesPromise = null;

const fetchEntities = async () => {
  if (cachedEntitiesPromise) return cachedEntitiesPromise;
  
  cachedEntitiesPromise = (async () => {
    try {
      const res = await fetch('/api/entities?limit=5000');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length > 0) return list;
      }
    } catch {
      // ignore, fall back
    }
    try {
      const mockRes = await fetch('/api_entities_mock.json');
      if (mockRes.ok) {
        const mockData = await mockRes.json();
        return Array.isArray(mockData) ? mockData : (mockData.data || []);
      }
    } catch {
      // ignore
    }
    return [];
  })();
  
  return cachedEntitiesPromise;
};

// Special entity shortcut destinations
const SPECIAL_DESTINATIONS = {
  'huff v. colorado': '/to/huff_v_colorado',
  'huff v colorado': '/to/huff_v_colorado',
  'huff v. state of colorado': '/to/huff_v_colorado',
  'tristan huff': '/to/huff_v_colorado',
  'adam schwartz': '/to/huff_v_colorado',
  'eric clopper': '/to/eric-clopper',
  'hadachek v. oregon': '/to/hadachek_v_oregon',
  'hadachek v oregon': '/to/hadachek_v_oregon',
  'hadachek': '/to/hadachek_v_oregon',
  'david hadachek': '/to/hadachek_v_oregon',
  'tim hammond': '/to/tim-hammond',
  'tim sally': '/to/tim-hammond',
  'foregen': '/to/foregen',
  'lewis sayre': '/to/lewis-albert-sayre',
  'dr. lewis sayre': '/to/lewis-albert-sayre',
  'john harvey kellogg': '/to/john-harvey-kellogg',
  'dr. john harvey kellogg': '/to/john-harvey-kellogg',
  'marilyn milos': '/to/milos_marilyn',
  'andrew freedman': '/to/freedman_andrew',
  'dr. andrew freedman': '/to/freedman_andrew',
  'douglas diekema': '/to/diekema_douglas',
  'dr. douglas diekema': '/to/diekema_douglas',
  'hugh thompson': '/to/thompson_hugh',
  'dr. hugh thompson': '/to/thompson_hugh',
  'intact global': '/to/intact_global',
  'intact america': '/to/intact_america',
  'noharmm': '/to/noharmm',
  'nocirc': '/to/nocirc',
  'galdef': '/to/galdef',
  'knmg': '/to/knmg',
  'royal dutch medical association': '/to/knmg',
  'american academy of pediatrics': '/to/american_academy_of_pediatrics',
  'aap': '/to/american_academy_of_pediatrics',
  '15square': '/to/15square',
  'prince v. massachusetts': '/to/prince_v_massachusetts',
  'bloodstained men': '/to/bloodstained_men',
  'attorneys for the rights of the child': '/to/arc',
  'ronald goldman': '/to/goldman_ronald',
  'morten frisch': '/to/morten-frisch'
};

// Rich fallback metadata for foundational movement figures & cases
const CURATED_FALLBACK_METADATA = {
  'huff v. colorado': {
    name: 'Huff v. State of Colorado',
    role: 'champion',
    type: 'legal',
    tagline: 'Landmark 2024 federal constitutional challenge asserting that routine infant male circumcision violates equal protection and substantive due process.',
    url: '/to/huff_v_colorado'
  },
  'huff v colorado': {
    name: 'Huff v. State of Colorado',
    role: 'champion',
    type: 'legal',
    tagline: 'Landmark 2024 federal constitutional challenge asserting that routine infant male circumcision violates equal protection and substantive due process.',
    url: '/to/huff_v_colorado'
  },
  'tristan huff': {
    name: 'Tristan Huff',
    role: 'champion',
    type: 'person',
    tagline: 'Plaintiff in landmark federal civil rights action Huff v. Colorado, challenging state Medicaid funding and statutory carveouts for infant circumcision.',
    url: '/to/huff_v_colorado'
  },
  'adam schwartz': {
    name: 'Adam Schwartz',
    role: 'champion',
    type: 'person',
    tagline: 'Civil rights attorney and legal counsel representing plaintiffs in constitutional litigation against state-sponsored infant circumcision.',
    url: '/to/huff_v_colorado'
  },
  'hadachek v. oregon': {
    name: 'Hadachek v. State of Oregon',
    role: 'champion',
    type: 'legal',
    tagline: 'Historic state constitutional challenge contesting Medicaid subsidies for non-therapeutic infant circumcision under equal protection doctrines.',
    url: '/to/hadachek_v_oregon'
  },
  'hadachek': {
    name: 'Hadachek v. State of Oregon',
    role: 'champion',
    type: 'legal',
    tagline: 'Historic state constitutional challenge contesting Medicaid subsidies for non-therapeutic infant circumcision under equal protection doctrines.',
    url: '/to/hadachek_v_oregon'
  },
  'david hadachek': {
    name: 'David Hadachek',
    role: 'champion',
    type: 'person',
    tagline: 'Lead plaintiff in Hadachek v. Oregon, seeking to establish equal protection against non-consensual infant genital cutting.',
    url: '/to/hadachek_v_oregon'
  },
  'eric clopper': {
    name: 'Eric Clopper',
    role: 'champion',
    type: 'person',
    tagline: 'Author, speaker, and performer whose theatrical monologue \'Sex & Circumcision: An American Love Story\' exposed cultural circumcision dogmas.',
    url: '/to/huff_v_colorado'
  },
  'prince v. massachusetts': {
    name: 'Prince v. Massachusetts',
    role: 'notable',
    type: 'legal',
    tagline: '1944 Supreme Court milestone holding that parents are not free to make martyrs of their children or expose them to bodily harm.',
    url: '/to/prince_v_massachusetts'
  },
  'lewis sayre': {
    name: 'Dr. Lewis Albert Sayre',
    role: 'critic',
    type: 'person',
    tagline: '19th-century surgeon who popularized routine infant circumcision in America through his \'reflex neurosis\' theory attributing childhood illnesses to the prepuce.',
    url: '/to/lewis-albert-sayre'
  },
  'dr. lewis sayre': {
    name: 'Dr. Lewis Albert Sayre',
    role: 'critic',
    type: 'person',
    tagline: '19th-century surgeon who popularized routine infant circumcision in America through his \'reflex neurosis\' theory attributing childhood illnesses to the prepuce.',
    url: '/to/lewis-albert-sayre'
  },
  'john harvey kellogg': {
    name: 'Dr. John Harvey Kellogg',
    role: 'critic',
    type: 'person',
    tagline: 'Physician and Battle Creek Sanitarium founder who advocated circumcision without anesthesia as an anti-masturbatory punishment in \'Plain Facts for Old and Young\'.',
    url: '/to/john-harvey-kellogg'
  },
  'dr. john harvey kellogg': {
    name: 'Dr. John Harvey Kellogg',
    role: 'critic',
    type: 'person',
    tagline: 'Physician and Battle Creek Sanitarium founder who advocated circumcision without anesthesia as an anti-masturbatory punishment in \'Plain Facts for Old and Young\'.',
    url: '/to/john-harvey-kellogg'
  },
  'marilyn milos': {
    name: 'Marilyn Fayre Milos, RN',
    role: 'champion',
    type: 'person',
    tagline: 'Registered nurse and founder of NOCIRC (1985), widely regarded as the godmother of the modern genital autonomy movement.',
    url: '/to/milos_marilyn'
  },
  'tim hammond': {
    name: 'Tim Hammond',
    role: 'champion',
    type: 'person',
    tagline: 'Author, researcher, and founder of NOHARMM who conducted the landmark 1999 AWAKENINGS survey documenting the lifelong trauma of circumcised men.',
    url: '/to/tim-hammond'
  },
  'tim sally': {
    name: 'Tim Sally (Tim Hammond)',
    role: 'champion',
    type: 'person',
    tagline: 'Grassroots human rights activist, pioneer, and researcher who founded NOHARMM and conducted landmark surveys under his birth name Tim Sally and later Tim Hammond.',
    url: '/to/tim-hammond'
  },
  'foregen': {
    name: 'Foregen',
    role: 'champion',
    type: 'organization',
    tagline: 'Non-profit biomedical organization conducting regenerative medicine research to bioengineer intact foreskin tissue for circumcised men.',
    url: '/to/foregen'
  },
  'knmg': {
    name: 'Royal Dutch Medical Association (KNMG)',
    role: 'champion',
    type: 'organization',
    tagline: 'Netherlands medical association whose 2010 policy statement concluded non-therapeutic male circumcision is medically unjustifiable and violates child rights.',
    url: '/to/knmg'
  },
  'royal dutch medical association': {
    name: 'Royal Dutch Medical Association (KNMG)',
    role: 'champion',
    type: 'organization',
    tagline: 'Netherlands medical association whose 2010 policy statement concluded non-therapeutic male circumcision is medically unjustifiable and violates child rights.',
    url: '/to/knmg'
  },
  'american academy of pediatrics': {
    name: 'American Academy of Pediatrics (AAP)',
    role: 'critic',
    type: 'organization',
    tagline: 'U.S. medical society whose 2012 policy statement endorsed routine infant circumcision, which expired in 2017 and was rejected by 38 European medical bodies.',
    url: '/to/american_academy_of_pediatrics'
  },
  'aap': {
    name: 'American Academy of Pediatrics (AAP)',
    role: 'critic',
    type: 'organization',
    tagline: 'U.S. medical society whose 2012 policy statement endorsed routine infant circumcision, which expired in 2017 and was rejected by 38 European medical bodies.',
    url: '/to/american_academy_of_pediatrics'
  },
  'hugh thompson': {
    name: 'Dr. Hugh C. Thompson',
    role: 'champion',
    type: 'person',
    tagline: 'Physician and author of \'The Value of the Foreskin\' (1965), one of the first modern pediatric whistleblowers questioning routine infant cutting.',
    url: '/to/thompson_hugh'
  },
  'dr. hugh thompson': {
    name: 'Dr. Hugh C. Thompson',
    role: 'champion',
    type: 'person',
    tagline: 'Physician and author of \'The Value of the Foreskin\' (1965), one of the first modern pediatric whistleblowers questioning routine infant cutting.',
    url: '/to/thompson_hugh'
  },
  'intact global': {
    name: 'Intact Global',
    role: 'champion',
    type: 'organization',
    tagline: 'International human rights non-profit organization advocating for legal protection against non-consensual infant genital modifications.',
    url: '/to/intact_global'
  },
  'intact america': {
    name: 'Intact America',
    role: 'champion',
    type: 'organization',
    tagline: 'National advocacy organization dedicated to protecting all babies and children from infant male circumcision in the United States.',
    url: '/to/intact_america'
  },
  'noharmm': {
    name: 'NOHARMM',
    role: 'champion',
    type: 'organization',
    tagline: 'National Organization to Halt the Abuse and Routine Mutilation of Males, founded in 1992 by Tim Hammond to assist circumcised men.',
    url: '/to/noharmm'
  },
  'nocirc': {
    name: 'NOCIRC',
    role: 'champion',
    type: 'organization',
    tagline: 'National Organization of Circumcision Information Resource Centers, founded in 1985 by Marilyn Milos to promote genital autonomy.',
    url: '/to/nocirc'
  },
  'galdef': {
    name: 'GALDEF',
    role: 'champion',
    type: 'organization',
    tagline: 'Genital Autonomy Legal Defense and Education Fund, supporting constitutional litigation and legal advocacy for bodily integrity.',
    url: '/to/galdef'
  },
  '15square': {
    name: '15Square',
    role: 'champion',
    type: 'organization',
    tagline: 'Registered UK charity dedicated to foreskin health, intact anatomy education, and supporting men suffering from circumcision harm.',
    url: '/to/15square'
  },
  'bloodstained men': {
    name: 'Bloodstained Men',
    role: 'champion',
    type: 'organization',
    tagline: 'Direct-action advocacy group touring across the United States in white clothing with red crotch stains to protest routine infant circumcision.',
    url: '/to/bloodstained_men'
  },
  'andrew freedman': {
    name: 'Dr. Andrew Freedman',
    role: 'critic',
    type: 'person',
    tagline: 'Pediatric urologist and chair of the AAP 2012 Circumcision Task Force that endorsed infant circumcision benefits over risks.',
    url: '/to/freedman_andrew'
  },
  'douglas diekema': {
    name: 'Dr. Douglas Diekema',
    role: 'critic',
    type: 'person',
    tagline: 'Bioethicist and co-author of the 2012 AAP Circumcision Policy, arguing that parental choice should override child bodily autonomy.',
    url: '/to/diekema_douglas'
  },
  'morten frisch': {
    name: 'Dr. Morten Frisch',
    role: 'champion',
    type: 'person',
    tagline: 'Danish epidemiologist and researcher who led 38 European medical associations in condemning the 2012 AAP policy recommendation.',
    url: '/to/morten-frisch'
  },
  'ronald goldman': {
    name: 'Dr. Ronald Goldman',
    role: 'champion',
    type: 'person',
    tagline: 'Psychologist and author of \'Circumcision: The Hidden Trauma\' and \'Questioning Circumcision: A Jewish Perspective\'.',
    url: '/to/goldman_ronald'
  },
  'substack': {
    name: 'Substack',
    role: 'notable',
    type: 'platform',
    tagline: 'Independent publishing network and newsletter platform widely utilized by genital autonomy researchers and investigative writers, including The Accidental Intactivist.',
    url: 'https://theaccidentalintactivist.substack.com'
  },
  'medium': {
    name: 'Medium',
    role: 'notable',
    type: 'platform',
    tagline: 'Open digital publishing platform where independent researchers, cultural critics, and advocates publish long-form essays and investigative commentary.',
    url: 'https://medium.com'
  }
};

const generateSlug = (name) => {
  if (!name) return '';
  const cleanName = name.replace(/,\s*[a-zA-Z\.]+$/, '');
  const parts = cleanName.trim().split(/\s+/);
  if (parts.length >= 2 && parts.length <= 4) {
    const last = parts.pop();
    return `${last}_${parts.join('_')}`;
  }
  return cleanName.replace(/\s+/g, '_');
};

const cleanBioText = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .trim();
};

export default function EntityLink({ entityName, children, className = '', style = {} }) {
  const [matchedEntity, setMatchedEntity] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 360, isAbove: true, arrowLeft: 180 });
  const [imgFailed, setImgFailed] = useState(false);

  const anchorRef = useRef(null);
  const cardRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const navigate = useNavigate();

  const cleanName = (entityName || '').trim();
  const lowerName = cleanName.toLowerCase();

  // 1. Fetch & Match Entity Data
  useEffect(() => {
    if (!cleanName) return;

    fetchEntities()
      .then(entities => {
        if (!Array.isArray(entities)) return;

        // Exact match
        let found = entities.find(e => e.name && e.name.toLowerCase() === lowerName);
        if (!found) {
          // Normalized match (strip Dr., M.D., etc.)
          const stripHonorifics = (s) => s.replace(/^(dr\.|dr|rev\.|prof\.)\s+/i, '').trim();
          const cleanQuery = stripHonorifics(lowerName);
          found = entities.find(e => {
            if (!e.name) return false;
            const normTarget = stripHonorifics(e.name.toLowerCase());
            return normTarget === cleanQuery;
          });
        }
        if (!found) {
          // Substring match for longer names
          found = entities.find(e => {
            if (!e.name) return false;
            const low = e.name.toLowerCase();
            return low.length > 4 && (lowerName.includes(low) || low.includes(lowerName));
          });
        }

        if (found) {
          setMatchedEntity(found);
        }
      })
      .catch(e => {
        console.error("Failed to load entity for EntityLink", e);
      });
  }, [cleanName, lowerName]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!cleanName) return null;

  // Resolve metadata: merge API data with curated fallback
  const curated = CURATED_FALLBACK_METADATA[lowerName];
  const specialUrl = SPECIAL_DESTINATIONS[lowerName];

  const destinationUrl = specialUrl || (
    matchedEntity 
      ? `/to/${encodeURIComponent(generateSlug(matchedEntity.name))}` 
      : (curated?.url || `/to/${encodeURIComponent(generateSlug(cleanName))}`)
  );

  const displayName = matchedEntity?.name || curated?.name || cleanName;
  const rawRole = (matchedEntity?.role || matchedEntity?.stance || curated?.role || 'notable').toLowerCase();
  const role = (rawRole === 'champion' || rawRole === 'critic') ? rawRole : 'notable';
  const type = (curated?.type || matchedEntity?.type || (cleanName.includes(' v. ') ? 'legal' : 'person')).toLowerCase();

  // If matchedEntity has an automated stub tagline like "Organization; linked to...", prefer curated metadata
  const isStubTagline = matchedEntity?.tagline && /appears in \d+ archived document/i.test(matchedEntity.tagline);
  const bioTagline = cleanBioText(
    (!isStubTagline && matchedEntity?.tagline) || 
    curated?.tagline || 
    (matchedEntity?.description ? matchedEntity.description.slice(0, 160) + '...' : null) ||
    matchedEntity?.tagline ||
    `Prominent entity referenced in genital autonomy archives, legal briefs, and historical treatises.`
  );

  const imageUrl = matchedEntity?.image_url;

  // Related entities from see_also_json
  let relatedChips = [];
  if (matchedEntity?.see_also_json) {
    try {
      const parsed = typeof matchedEntity.see_also_json === 'string' 
        ? JSON.parse(matchedEntity.see_also_json) 
        : matchedEntity.see_also_json;
      if (Array.isArray(parsed)) {
        relatedChips = parsed.slice(0, 3);
      }
    } catch {
      // ignore json parse error
    }
  }

  // Update Popover Coordinates
  const updateCoords = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const cardWidth = Math.min(360, window.innerWidth - 32);
    const anchorCenter = rect.left + rect.width / 2;
    const idealLeft = anchorCenter - cardWidth / 2;
    const left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, idealLeft));
    const arrowLeft = Math.max(20, Math.min(cardWidth - 20, anchorCenter - left));

    // Flip above or below based on viewport clearance (card approx 240px tall)
    const isAbove = rect.top > 250;
    const top = isAbove 
      ? rect.top - 10 + window.scrollY 
      : rect.bottom + 10 + window.scrollY;

    setCoords({ top, left, width: cardWidth, isAbove, arrowLeft });
  };

  // Re-calculate coords on scroll or resize when open
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      updateCoords();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Mouse Hover Handlers with intentional debounce
  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateCoords();
    openTimerRef.current = setTimeout(() => {
      updateCoords();
      setIsOpen(true);
    }, 160);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 240);
  };

  const handleCardMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleLinkClick = (e) => {
    setIsOpen(false);
  };

  // Stance Label & Icon
  const renderStanceBadge = () => {
    if (role === 'champion') {
      return (
        <span className="entity-badge champion">
          <ShieldCheck size={12} />
          Autonomy Champion
        </span>
      );
    }
    if (role === 'critic') {
      return (
        <span className="entity-badge critic">
          <AlertCircle size={12} />
          Circumcision Proponent
        </span>
      );
    }
    return (
      <span className="entity-badge notable">
        <Scale size={12} />
        {type === 'legal' ? 'Legal Precedent' : 
         type === 'platform' || type === 'publisher' ? 'Media Platform' : 
         type === 'organization' ? 'Notable Organization' : 
         'Notable Figure'}
      </span>
    );
  };

  // Monogram / Avatar Initials
  const getInitials = (name) => {
    const parts = name.replace(/^(dr\.|m\.d\.|rn)\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
    return '??';
  };

  return (
    <>
      <Link
        ref={anchorRef}
        to={destinationUrl}
        className={`entity-link-anchor ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onClick={handleLinkClick}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {children || cleanName}
      </Link>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={cardRef}
          className="entity-hover-card"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            transform: coords.isAbove ? 'translateY(-100%)' : 'translateY(0)'
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
          role="dialog"
          aria-label={`Profile preview for ${displayName}`}
        >
          {/* Top Stance Accent Line */}
          <div className={`entity-card-accent ${role}`} />

          <div className="entity-card-inner">
            {/* Header: Avatar, Name, Stance Badges */}
            <div className="entity-card-header">
              <div className={`entity-card-avatar ${role}`}>
                {imageUrl && !imgFailed ? (
                  <img 
                    src={imageUrl} 
                    alt={displayName} 
                    onError={() => setImgFailed(true)} 
                  />
                ) : type === 'organization' ? (
                  <Building2 size={20} />
                ) : type === 'platform' || type === 'publisher' ? (
                  <BookOpen size={20} />
                ) : type === 'legal' ? (
                  <Scale size={20} />
                ) : (
                  <span>{getInitials(displayName)}</span>
                )}
              </div>

              <div className="entity-card-title-col">
                <h4 className="entity-card-name">{displayName}</h4>
                <div className="entity-card-badges">
                  {renderStanceBadge()}
                  <span className="entity-badge type-badge">
                    {type === 'legal' ? 'Legal Case' : type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tagline / Bio summary */}
            <p className="entity-card-tagline">{bioTagline}</p>

            {/* Related Network Connections (if available) */}
            {relatedChips.length > 0 && (
              <div className="entity-card-connections">
                <span className="entity-card-conn-label">Connected Archive Figures</span>
                <div className="entity-card-conn-list">
                  {relatedChips.map((chip, idx) => (
                    <span key={idx} className="entity-conn-chip">
                      {chip.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="entity-card-footer">
              <Link 
                to={destinationUrl} 
                className="entity-btn-primary"
                onClick={() => setIsOpen(false)}
              >
                <BookOpen size={13} />
                <span>View Dossier & Archives</span>
                <ArrowRight size={12} />
              </Link>

              <Link
                to={`/graph?focus=${encodeURIComponent(displayName)}`}
                className="entity-btn-secondary"
                onClick={() => setIsOpen(false)}
                title="Explore connections in Network Graph"
              >
                <Network size={13} />
                <span>Graph</span>
              </Link>

              {matchedEntity?.url && (
                <a
                  href={matchedEntity.url}
                  target="_blank"
                  rel="noreferrer"
                  className="entity-btn-secondary"
                  title="External reference"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Arrow pointing at the entity link */}
          <div 
            className={`entity-card-arrow ${coords.isAbove ? 'arrow-top' : 'arrow-bottom'}`}
            style={{ left: `${coords.arrowLeft}px` }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
