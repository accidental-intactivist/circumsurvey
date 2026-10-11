import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ReportProvider } from '../contexts/ReportContext';
import { MediaListProvider } from '../contexts/MediaListContext';
import { AssistantProvider } from '../contexts/AssistantContext';
import TopNav from '../components/TopNav';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mocks for JSDOM
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  class MockIntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver;

  class MockResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver;

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
  }));
});

// Mock some complex components to avoid jsdom rendering issues
vi.mock('@clerk/clerk-react', () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
  SignedIn: ({ children }) => <>{children}</>,
  SignedOut: ({ children }) => <>{children}</>,
  SignInButton: ({ children }) => <>{children}</>,
  UserButton: () => <div data-testid="clerk-user-button" />,
  useUser: () => ({ user: null, isLoaded: true }),
  useAuth: () => ({ isLoaded: true, isSignedIn: false })
}));

vi.mock('react-pdf', () => ({
  Document: ({ children }) => <div data-testid="pdf-document">{children}</div>,
  Page: () => <div data-testid="pdf-page" />,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } }
}));

vi.mock('react-joyride', () => ({
  default: () => <div data-testid="joyride" />,
  STATUS: { FINISHED: 'finished', SKIPPED: 'skipped' }
}));

vi.mock('pdfjs-dist/build/pdf.worker.entry', () => ({}));

vi.mock('react-force-graph-2d', () => ({
  default: () => <div data-testid="force-graph-2d" />
}));

vi.mock('../components/AIAssistantFlyout', () => ({
  default: () => <div data-testid="ai-flyout" />
}));

import { AppLayout } from '../App';

describe('User Flows', () => {
  const routes = [
    '/',
    '/library',
    '/graph',
    '/timeline',
    '/manifesto',
    '/atlas',
    '/share',
    '/news',
    '/survey-stats',
    '/guides',
    '/guides/rebuttals',
    '/to/shortcut-test',
    '/contact',
    '/policies',
    '/explore'
  ];

  routes.forEach(route => {
    it(`renders route ${route} without fatal errors`, async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider>
            <ReportProvider>
              <MediaListProvider>
                <AssistantProvider>
                  <AppLayout />
                </AssistantProvider>
              </MediaListProvider>
            </ReportProvider>
          </ThemeProvider>
        </MemoryRouter>
      );

      // Wait for suspense to finish loading
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 4000 });

      // If we reach here, it means the page mounted without throwing a fatal runtime error (like an unresolved import).
      expect(true).toBe(true);
    });
  });
});
