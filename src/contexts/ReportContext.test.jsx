import { describe, it, expect } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { ReportProvider, useReport } from './ReportContext';

// Dummy component to test the context
function TestComponent() {
  const { reportText, addToReport, setReportText } = useReport();
  return (
    <div>
      <div data-testid="content">{reportText}</div>
      <button onClick={() => addToReport('Added sentence.')}>Add Text</button>
      <button onClick={() => addToReport('New reference', ['http://example.com'])}>Add Reference</button>
      <button onClick={() => setReportText('')}>Clear</button>
    </div>
  );
}

describe('ReportContext', () => {
  it('provides default report content', () => {
    render(
      <ReportProvider>
        <TestComponent />
      </ReportProvider>
    );
    expect(screen.getByTestId('content')).toHaveTextContent('Intactivism Evidence Report');
  });

  it('adds text to the report', () => {
    render(
      <ReportProvider>
        <TestComponent />
      </ReportProvider>
    );
    act(() => {
      screen.getByText('Add Text').click();
    });
    expect(screen.getByTestId('content')).toHaveTextContent('Added sentence.');
  });

  it('adds reference links appropriately formatted', () => {
    render(
      <ReportProvider>
        <TestComponent />
      </ReportProvider>
    );
    act(() => {
      screen.getByText('Add Reference').click();
    });
    
    const content = screen.getByTestId('content').textContent;
    expect(content).toContain('New reference');
    expect(content).toContain('http://example.com');
  });

  it('clears the report content', () => {
    render(
      <ReportProvider>
        <TestComponent />
      </ReportProvider>
    );
    act(() => {
      screen.getByText('Clear').click();
    });
    expect(screen.getByTestId('content')).toHaveTextContent('');
  });
});
