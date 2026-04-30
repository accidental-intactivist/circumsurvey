import React, { createContext, useContext, useEffect, useState } from 'react';

const ReportContext = createContext();

export function ReportProvider({ children }) {
  // Report state is an array of question IDs
  const [reportItems, setReportItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_report_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cs_report_items', JSON.stringify(reportItems));
  }, [reportItems]);

  const addToReport = (questionId) => {
    setReportItems((prev) => {
      if (!prev.includes(questionId)) {
        return [...prev, questionId];
      }
      return prev;
    });
  };

  const removeFromReport = (questionId) => {
    setReportItems((prev) => prev.filter((id) => id !== questionId));
  };

  const toggleInReport = (questionId) => {
    setReportItems((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }
      return [...prev, questionId];
    });
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

  return (
    <ReportContext.Provider value={{
      reportItems,
      addToReport,
      removeFromReport,
      toggleInReport,
      clearReport,
      reorderReport
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
