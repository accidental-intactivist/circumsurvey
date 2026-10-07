import React, { createContext, useContext, useState, useEffect } from 'react';

const MediaListContext = createContext();

export function MediaListProvider({ children }) {
  const [mediaLists, setMediaLists] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('advocacy_media_lists');
    if (saved) {
      try {
        setMediaLists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse media lists", e);
      }
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('advocacy_media_lists', JSON.stringify(mediaLists));
  }, [mediaLists]);

  const createList = (name) => {
    const newList = {
      id: `list-${Date.now()}`,
      name,
      items: [],
      createdAt: new Date().toISOString()
    };
    setMediaLists(prev => [...prev, newList]);
    return newList;
  };

  const addToList = (listId, documentId) => {
    setMediaLists(prev => prev.map(list => {
      if (list.id === listId && !list.items.includes(documentId)) {
        return { ...list, items: [...list.items, documentId] };
      }
      return list;
    }));
  };

  const addMultipleToList = (listId, documentIds) => {
    setMediaLists(prev => prev.map(list => {
      if (list.id === listId) {
        const newItems = [...new Set([...list.items, ...documentIds])];
        return { ...list, items: newItems };
      }
      return list;
    }));
  };

  const removeFromList = (listId, documentId) => {
    setMediaLists(prev => prev.map(list => {
      if (list.id === listId) {
        return { ...list, items: list.items.filter(id => id !== documentId) };
      }
      return list;
    }));
  };

  const getDefaultList = () => {
    if (mediaLists.length > 0) return mediaLists[0];
    return null; // Let the caller decide to create one if it returns null
  };

  return (
    <MediaListContext.Provider value={{ mediaLists, createList, addToList, addMultipleToList, removeFromList, getDefaultList }}>
      {children}
    </MediaListContext.Provider>
  );
}

export function useMediaList() {
  return useContext(MediaListContext);
}
