import React, { Fragment, useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import EntityLink from './EntityLink';
import SafeImage from './SafeImage';

const CURATED_DEFAULT_ENTITIES = [
  // Legal Cases & Actions
  'Huff v. Colorado', 'Huff v. State of Colorado', 'Hadachek v. Oregon', 'Hadachek v. Sebastian', 'Prince v. Massachusetts',
  'Tristan Huff', 'Adam Schwartz', 'David Hadachek', 'Eric Clopper',
  
  // Organizations & Coalitions
  'Intact Global', 'Intact America', 'NOCIRC', 'NOHARMM', 'GALDEF', 'Foregen', '15Square', 
  'Royal Dutch Medical Association', 'KNMG', 'American Academy of Pediatrics', 'AAP', 
  'British Medical Association', 'BMA', 'Children\'s Health & Human Rights Partnership',
  'Bloodstained Men', 'Attorneys for the Rights of the Child',
  
  // Medical & Historical Figures
  'Tim Hammond', 'Tim Sally', 'Marilyn Milos', 'Marilyn Fayre Milos', 'Lewis Sayre', 'Dr. Lewis Sayre', 'Lewis Albert Sayre', 
  'John Harvey Kellogg', 'Dr. John Harvey Kellogg', 'Andrew Freedman', 'Dr. Andrew Freedman',
  'Douglas Diekema', 'Dr. Douglas Diekema', 'Hugh Thompson', 'Dr. Hugh Thompson', 'Morten Frisch', 
  'Dr. Morten Frisch', 'Christopher Cold', 'John Taylor', 'Morris Sorrells', 'Angela Carmack', 
  'Brian Buckler', 'Tone Pettit', 'Ronald Goldman', 'Dr. Ronald Goldman', 'Paul Fleiss', 
  'Dr. Paul Fleiss', 'Leonard Glick', 'Mark Reiss', 'George Denniston', 'Soraya Miré'
];

const EXCLUDED_GENERIC_WORDS = new Set([
  'intact', '(in)tact', 'normal', 'care', 'male', 'female', 'action', 'rights', 'survey', 
  'report', 'study', 'hospital', 'clinic', 'center', 'group', 'board', 'health', 'doctor', 
  'child', 'infant', 'state', 'american', 'court', 'law', 'order', 'nature', 'movement', 
  'change', 'freedom', 'liberty', 'people', 'world', 'voice', 'truth', 'future', 'body', 
  'consent', 'medical', 'human', 'system', 'research', 'public', 'first', 'second', 'third',
  'and', 'the', 'for', 'with', 'from', 'this', 'that', 'were', 'been', 'about', 'there',
  'where', 'which', 'their', 'other', 'some', 'what', 'when', 'than', 'them', 'these',
  'the conversation', 'john', 'jeff', 'david', 'mark', 'michael', 'paul', 'brian', 'andrew',
  'douglas', 'charles', 'robert', 'william', 'james', 'peter', 'thomas', 'richard',
  // Publishing, media & generic digital distribution platforms
  'medium', 'substack', 'youtube', 'vimeo', 'twitter', 'x', 'facebook', 'instagram', 
  'reddit', 'wordpress', 'blogger', 'amazon', 'wikipedia', 'patreon', 'spotify', 
  'apple podcasts', 'tiktok', 'linkedin', 'github', 'google', 'zoom', 'discord', 'telegram'
]);

let globalEntitiesCache = null;

function processText(text, validEntities) {
  if (!text || typeof text !== 'string' || validEntities.length === 0) {
    return text;
  }

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match entities as whole words or phrases
  const pattern = new RegExp(`\\b(${validEntities.map(escapeRegExp).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  if (parts.length <= 1) {
    return text;
  }

  return parts.map((part, i) => {
    if (i % 2 === 0) {
      return part;
    } else {
      return (
        <span key={i} style={{ display: 'inline', margin: '0 0.05rem' }}>
          <EntityLink entityName={part} />
        </span>
      );
    }
  });
}

function isLinkElement(el) {
  if (!React.isValidElement(el)) return false;
  if (el.type === 'a' || (typeof el.type === 'string' && el.type.toLowerCase() === 'a')) return true;
  if (el.props?.href || el.props?.to) return true;
  if (el.type?.displayName === 'Link' || el.type?.name === 'Link' || el.type === EntityLink) return true;
  return false;
}

function linkEntitiesInTree(children, validEntities) {
  if (!children || validEntities.length === 0) return children;

  if (typeof children === 'string') {
    return processText(children, validEntities);
  }

  if (Array.isArray(children)) {
    return children.map((child, idx) => {
      if (typeof child === 'string') {
        return <Fragment key={idx}>{processText(child, validEntities)}</Fragment>;
      }
      if (React.isValidElement(child)) {
        // Never replace or wrap anything inside an author's explicit link or React Router Link
        if (isLinkElement(child)) {
          return child;
        }
        if (child.props && child.props.children) {
          return React.cloneElement(child, {
            key: child.key || idx,
            children: linkEntitiesInTree(child.props.children, validEntities)
          });
        }
      }
      return child;
    });
  }

  if (React.isValidElement(children)) {
    if (isLinkElement(children)) {
      return children;
    }
    if (children.props && children.props.children) {
      return React.cloneElement(children, {
        children: linkEntitiesInTree(children.props.children, validEntities)
      });
    }
  }

  return children;
}

const createMarkdownComponents = (validEntities) => ({
  p: ({ children }) => (
    <span className="auto-entity-p" style={{ display: 'block', margin: '0 0 1.25rem 0', lineHeight: 1.8, color: 'inherit' }}>
      {linkEntitiesInTree(children, validEntities)}
    </span>
  ),
  h1: ({ children }) => (
    <h1 style={{ fontFamily: 'var(--f-display, serif)', color: 'var(--c-goldBright, #facc15)', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
      {linkEntitiesInTree(children, validEntities)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: 'var(--f-display, serif)', color: 'var(--c-goldBright, #facc15)', fontSize: '1.5rem', marginTop: '1.8rem', marginBottom: '0.85rem', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
      {linkEntitiesInTree(children, validEntities)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ 
      fontFamily: 'var(--f-display, serif)', 
      color: 'var(--c-goldBright, #facc15)', 
      fontSize: '1.35rem', 
      marginTop: '1.8rem', 
      marginBottom: '0.75rem', 
      borderBottom: '1px solid rgba(212, 160, 48, 0.25)', 
      paddingBottom: '0.35rem', 
      letterSpacing: '0.02em', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      lineHeight: 1.3
    }}>
      {linkEntitiesInTree(children, validEntities)}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 style={{ fontFamily: 'var(--f-display, serif)', color: 'var(--c-textBright, #f1f5f9)', fontSize: '1.15rem', marginTop: '1.3rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
      {linkEntitiesInTree(children, validEntities)}
    </h4>
  ),
  a: ({ href, children }) => {
    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={{
          color: '#60a5fa',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          wordBreak: 'break-word'
        }}
        className="auto-markdown-link"
      >
        {children}
        {isExternal && <ExternalLink size={12} style={{ display: 'inline', opacity: 0.85, flexShrink: 0 }} />}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong style={{ color: 'var(--c-textBright, #fff)', fontWeight: '700' }}>
      {linkEntitiesInTree(children, validEntities)}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ color: 'var(--c-textBright, #f1f5f9)', fontStyle: 'italic' }}>
      {linkEntitiesInTree(children, validEntities)}
    </em>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.6rem', marginBottom: '1.25rem', lineHeight: 1.8 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.6rem', marginBottom: '1.25rem', lineHeight: 1.8 }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '0.35rem' }}>
      {linkEntitiesInTree(children, validEntities)}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid var(--c-gold, #d4a030)',
      paddingLeft: '1rem',
      margin: '1.25rem 0',
      color: 'var(--c-dim, #94a3b8)',
      fontStyle: 'italic',
      background: 'rgba(212, 160, 48, 0.05)',
      padding: '0.75rem 1rem',
      borderRadius: '0 6px 6px 0'
    }}>
      {linkEntitiesInTree(children, validEntities)}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '1.75rem 0' }} />
  ),
  img: SafeImage
});

/**
 * Parses a block of Markdown text and automatically detects known entities
 * in text nodes to insert interactive <EntityLink> components, while properly
 * rendering Markdown headings, links, bold, italics, blockquotes, and lists.
 */
export default function AutoEntityLinker({ 
  text, 
  entities = [], 
  className = '', 
  style = {}, 
  inline = false,
  exclude = []
}) {
  const [activeEntities, setActiveEntities] = useState(() => {
    if (entities && entities.length > 0) return entities;
    return globalEntitiesCache || CURATED_DEFAULT_ENTITIES;
  });

  useEffect(() => {
    if (entities && entities.length > 0) {
      setActiveEntities(entities);
      return;
    }

    if (!globalEntitiesCache) {
      fetch('/api/entities?limit=5000')
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : (data.data || []);
          const names = list.map(e => e.name).filter(Boolean);
          const merged = Array.from(new Set([...CURATED_DEFAULT_ENTITIES, ...names]));
          globalEntitiesCache = merged;
          setActiveEntities(merged);
        })
        .catch(() => {
          globalEntitiesCache = CURATED_DEFAULT_ENTITIES;
          setActiveEntities(CURATED_DEFAULT_ENTITIES);
        });
    } else {
      setActiveEntities(globalEntitiesCache);
    }
  }, [entities]);

  const validEntities = useMemo(() => {
    const excludeSet = new Set(
      (Array.isArray(exclude) ? exclude : [exclude])
        .filter(Boolean)
        .map(x => (typeof x === 'string' ? x : x.name || '').toLowerCase().trim())
    );

    return (activeEntities || [])
      .map(e => typeof e === 'string' ? e.trim() : (e.name ? e.name.trim() : ''))
      .filter(e => {
        if (!e || e.length < 3) return false;
        const lower = e.toLowerCase();
        if (excludeSet.has(lower)) return false;
        if (EXCLUDED_GENERIC_WORDS.has(lower)) return false;
        if (!e.includes(' ') && lower === e && e.length < 7) return false;
        return true;
      })
      .sort((a, b) => b.length - a.length);
  }, [activeEntities, exclude]);

  const components = useMemo(() => createMarkdownComponents(validEntities), [validEntities]);

  if (!text) return null;

  const normalizedText = typeof text === 'string'
    ? text.replace(/\\n/g, '\n').replace(/¶/g, '\n\n')
    : String(text || '');

  if (inline) {
    return (
      <span className={`auto-entity-inline ${className}`} style={style}>
        {processText(normalizedText, validEntities)}
      </span>
    );
  }

  return (
    <span className={`auto-entity-markdown ${className}`} style={{ display: 'block', ...style }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {normalizedText}
      </ReactMarkdown>
    </span>
  );
}
