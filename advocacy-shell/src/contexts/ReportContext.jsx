import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export function ReportProvider({ children }) {
  const [reportText, setReportText] = useState('# Intactivism Evidence Report\n\nStart querying the assistant to build this report. Click "Add to Report" on any insightful answer to append it here.');

  const addToReport = (content, citations = []) => {
    const citationText = citations.length > 0 ? `\n\n> Citations:\n> ${citations.join('\n> ')}` : '';
    setReportText((prev) => prev + `\n\n${content}${citationText}`);
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
