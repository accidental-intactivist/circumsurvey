import React, { Fragment } from 'react';
import EntityLink from './EntityLink';

function formatBold(text) {
  if (typeof text !== 'string') return text;
  if (!text.includes('**')) return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((p, j) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return <strong key={j} style={{ color: 'var(--c-textBright)' }}>{p.slice(2, -2)}</strong>;
        }
        return <Fragment key={j}>{p}</Fragment>;
      })}
    </>
  );
}

function processText(text, validEntities) {
  if (validEntities.length === 0) return <span>{formatBold(text)}</span>;

  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b(${validEntities.map(escapeRegExp).join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return <span key={i}>{formatBold(part)}</span>;
        } else {
          return (
            <span key={i} style={{ display: 'inline-block', margin: '0 0.15rem' }}>
              <EntityLink entityName={part} />
            </span>
          );
        }
      })}
    </span>
  );
}

/**
 * Parses a block of text and automatically replaces occurrences of known entities
 * with <EntityLink> components, and breaks text into paragraphs.
 */
export default function AutoEntityLinker({ text, entities = [] }) {
  if (!text) return null;

  // Split into paragraphs by actual newlines, escaped newlines, or pilcrows
  const paragraphs = text.split(/(?:\r?\n|\\n)+|¶/g).map(s => s.trim()).filter(Boolean);

  const validEntities = (entities || [])
    .map(e => e.trim())
    .filter(e => e.length > 2)
    .sort((a, b) => b.length - a.length);

  return (
    <>
      {paragraphs.map((paraText, idx) => (
        <Fragment key={idx}>
          {idx > 0 && <><br /><br /></>}
          {processText(paraText, validEntities)}
        </Fragment>
      ))}
    </>
  );
}
