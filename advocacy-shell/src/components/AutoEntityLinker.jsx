import React from 'react';
import EntityLink from './EntityLink';

/**
 * Parses a block of text and automatically replaces occurrences of known entities
 * with <EntityLink> components.
 */
export default function AutoEntityLinker({ text, entities = [] }) {
  if (!text) return null;
  if (!entities || entities.length === 0) return <span>{text}</span>;

  // Filter out empty or very short entities to prevent over-matching
  const validEntities = entities
    .map(e => e.trim())
    .filter(e => e.length > 2)
    // Sort by length descending so we match "American Academy of Pediatrics" before "Pediatrics"
    .sort((a, b) => b.length - a.length);

  if (validEntities.length === 0) return <span>{text}</span>;

  // Create a regex to match any of the entities (case-insensitive)
  // Use word boundaries \b to avoid partial matches, though \b can be tricky with punctuation.
  // We'll escape regex special characters in the entity names.
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b(${validEntities.map(escapeRegExp).join('|')})\\b`, 'gi');

  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) => {
        // Even indices are regular text, odd indices are matched entities
        if (i % 2 === 0) {
          return <span key={i}>{part}</span>;
        } else {
          // It's an entity! Use the original case from the text, but the name for linking
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
