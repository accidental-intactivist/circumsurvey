import React, { createContext, useContext, useState } from 'react';

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [initialSuggestions, setInitialSuggestions] = useState(null);

  const openAssistant = (query = '', suggestions = null) => {
    if (query) {
      setInitialQuery(query);
    }
    if (suggestions) {
      setInitialSuggestions(suggestions);
    }
    setIsOpen(true);
  };

  const closeAssistant = () => {
    setIsOpen(false);
  };

  return (
    <AssistantContext.Provider value={{ 
      isOpen, openAssistant, closeAssistant, 
      initialQuery, setInitialQuery, 
      initialSuggestions, setInitialSuggestions 
    }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  return useContext(AssistantContext);
}
