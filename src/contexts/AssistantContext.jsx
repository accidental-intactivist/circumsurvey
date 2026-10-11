import React, { createContext, useContext, useState } from 'react';

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [initialSuggestions, setInitialSuggestions] = useState(null);
  const [attachedDocs, setAttachedDocs] = useState([]);

  const openAssistant = (query = '', suggestions = null, docsToAttach = null) => {
    if (query) {
      setInitialQuery(query);
    }
    if (suggestions) {
      setInitialSuggestions(suggestions);
    }
    if (docsToAttach) {
      setAttachedDocs(prev => {
        let newDocs = [...prev];
        const docsToAdd = Array.isArray(docsToAttach) ? docsToAttach : [docsToAttach];
        for (const doc of docsToAdd) {
          if (!newDocs.find(d => d.id === doc.id)) {
            newDocs.push(doc);
          }
        }
        return newDocs.slice(-5); // Keep up to 5 documents max
      });
    }
    setIsOpen(true);
  };

  const removeAttachedDoc = (id) => {
    setAttachedDocs(prev => prev.filter(d => d.id !== id));
  };

  const closeAssistant = () => {
    setIsOpen(false);
  };

  return (
    <AssistantContext.Provider value={{ 
      isOpen, openAssistant, closeAssistant, 
      initialQuery, setInitialQuery, 
      initialSuggestions, setInitialSuggestions,
      attachedDocs, setAttachedDocs, removeAttachedDoc
    }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  return useContext(AssistantContext);
}
