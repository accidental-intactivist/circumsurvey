import React, { createContext, useContext, useEffect, useState } from 'react';

const ReportContext = createContext();

export function ReportProvider({ children }) {
  // Report state is an array of blocks: { id, type: 'question' | 'text', refId?, cohort?, content? }
  const [reportItems, setReportItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_report_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration check from simple string array
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map(id => ({
            id: `migrated_${id}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'question',
            refId: id,
            cohort: null
          }));
        }
        return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [reportMeta, setReportMeta] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_report_meta');
      return saved ? JSON.parse(saved) : { title: "Custom Research Report", subtitle: "", author: "" };
    } catch (e) {
      return { title: "Custom Research Report", subtitle: "", author: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem('cs_report_items', JSON.stringify(reportItems));
  }, [reportItems]);

  useEffect(() => {
    localStorage.setItem('cs_report_meta', JSON.stringify(reportMeta));
  }, [reportMeta]);

  const addToReport = (questionId, cohort = null) => {
    setReportItems((prev) => {
      const exists = prev.some(item => item.type === 'question' && item.refId === questionId && JSON.stringify(item.cohort) === JSON.stringify(cohort));
      if (!exists) {
        return [...prev, {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'question',
          refId: questionId,
          cohort
        }];
      }
      return prev;
    });
  };

  const removeFromReport = (itemId) => {
    setReportItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const addExhibitToReport = (exhibitType, config, cohort = null) => {
    setReportItems((prev) => {
      // Check for exact match
      const exists = prev.some(item => 
        item.type === 'exhibit' && 
        item.exhibitType === exhibitType && 
        JSON.stringify(item.config) === JSON.stringify(config) &&
        JSON.stringify(item.cohort) === JSON.stringify(cohort)
      );
      
      if (!exists) {
        return [...prev, {
          id: `exhibit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'exhibit',
          exhibitType,
          config,
          cohort
        }];
      }
      return prev;
    });
  };

  const toggleInReport = (questionId, cohort = null) => {
    setReportItems((prev) => {
      const exists = prev.some(item => item.type === 'question' && item.refId === questionId && JSON.stringify(item.cohort) === JSON.stringify(cohort));
      if (exists) {
        return prev.filter(item => !(item.type === 'question' && item.refId === questionId && JSON.stringify(item.cohort) === JSON.stringify(cohort)));
      }
      return [...prev, {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'question',
        refId: questionId,
        cohort
      }];
    });
  };

  const addTextBlock = (index) => {
    setReportItems((prev) => {
      const newBlock = {
        id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        content: ''
      };
      const result = Array.from(prev);
      if (index !== undefined && index >= 0) {
        result.splice(index, 0, newBlock);
      } else {
        result.push(newBlock);
      }
      return result;
    });
  };

  const addAIChatBlock = (query, answer) => {
    setReportItems((prev) => {
      const newBlock = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai_chat',
        query,
        answer
      };
      return [...prev, newBlock];
    });
  };

  const updateTextBlock = (itemId, content) => {
    setReportItems((prev) => prev.map(item => 
      item.id === itemId ? { ...item, content } : item
    ));
  };

  const updateReportMeta = (updates) => {
    setReportMeta(prev => ({ ...prev, ...updates }));
  };

  const clearReport = () => {
    setReportItems([]);
  };

  const reorderReport = (startIndex, endIndex) => {
    setReportItems((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const isQuestionInReport = (questionId, cohort = null) => {
    return reportItems.some(item => item.type === 'question' && item.refId === questionId && JSON.stringify(item.cohort) === JSON.stringify(cohort));
  };

  const isExhibitInReport = (exhibitType, config, cohort = null) => {
    return reportItems.some(item => 
      item.type === 'exhibit' && 
      item.exhibitType === exhibitType && 
      JSON.stringify(item.config) === JSON.stringify(config) &&
      JSON.stringify(item.cohort) === JSON.stringify(cohort)
    );
  };

  return (
    <ReportContext.Provider value={{
      reportItems,
      reportMeta,
      addToReport,
      addExhibitToReport,
      removeFromReport,
      toggleInReport,
      addTextBlock,
      addAIChatBlock,
      updateTextBlock,
      updateReportMeta,
      clearReport,
      reorderReport,
      isQuestionInReport,
      isExhibitInReport
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
