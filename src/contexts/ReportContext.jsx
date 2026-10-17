import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext();
const REPORT_STORAGE_KEY = 'intactivism_evidence_report';
const INITIAL_REPORT = '# Intactivism Evidence Report\n\nStart querying the assistant to build this report. Click "Add to Report" on any insightful answer to append it here.';

export function ReportProvider({ children }) {
  const [reportText, setReportTextState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(REPORT_STORAGE_KEY);
        if (saved) return saved;
      }
    } catch {}
    return INITIAL_REPORT;
  });

  const setReportText = (val) => {
    setReportTextState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(REPORT_STORAGE_KEY, next);
        }
      } catch {}
      return next;
    });
  };

  const addToReport = (content, citations = []) => {
    const citationText = citations.length > 0 ? `\n\n> Citations:\n> ${citations.join('\n> ')}` : '';
    const addition = `\n\n${content}${citationText}`;
    setReportTextState((prev) => {
      const next = prev + addition;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(REPORT_STORAGE_KEY, next);
        }
      } catch {}
      return next;
    });
    return true;
  };

  return (
    <ReportContext.Provider value={{ reportText, setReportText, addToReport }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
