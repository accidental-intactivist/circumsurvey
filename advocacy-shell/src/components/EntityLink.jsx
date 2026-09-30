import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function EntityLink({ entityName }) {
  const [matchedEntity, setMatchedEntity] = useState(null);

  useEffect(() => {
    if (!entityName) return;
    
    fetch('/api/entities')
      .then(res => res.json())
      .then(entities => {
        if (!Array.isArray(entities)) return;
        
        const lowerNameQuery = entityName.toLowerCase();
        
        const exactMatch = entities.find(e => e.name.toLowerCase() === lowerNameQuery);
        if (exactMatch) {
            setMatchedEntity(exactMatch);
            return;
        }
        
        const match = entities.find(e => {
            const lowerName = e.name.toLowerCase();
            return lowerName.length > 4 && lowerNameQuery.includes(lowerName);
        });
        
        if (match) {
          setMatchedEntity(match);
        }
      })
      .catch(e => console.error("Failed to fetch entities for EntityLink", e));
  }, [entityName]);

  if (!entityName) return null;

  const generateSlug = (name) => {
    if (!name) return '';
    const cleanName = name.replace(/,\s*[a-zA-Z\.]+$/, ''); // Remove trailing credentials
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length >= 2 && parts.length <= 4) {
      const last = parts.pop();
      return `${last}_${parts.join('_')}`;
    }
    return cleanName.replace(/\s+/g, '_');
  };

  if (matchedEntity) {
    const slug = generateSlug(matchedEntity.name);
    return (
      <Link 
        to={`/to/${encodeURIComponent(slug)}`}
        style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationThickness: '1px', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--c-goldBright)'}
        onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
      >
        {entityName}
      </Link>
    );
  }

  return <span>{entityName}</span>;
}
