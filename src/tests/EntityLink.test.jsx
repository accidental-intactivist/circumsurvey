import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EntityLink from '../components/EntityLink';

describe('EntityLink and Mouseover Profile Card', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders entity link text and destination href', () => {
    render(
      <MemoryRouter>
        <EntityLink entityName="Dr. Lewis Sayre" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /dr\. lewis sayre/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/to/lewis-albert-sayre');
  });

  it('displays the rich profile hover card on mouse enter', async () => {
    render(
      <MemoryRouter>
        <EntityLink entityName="Marilyn Milos" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /marilyn milos/i });
    
    // Simulate mouseenter
    act(() => {
      fireEvent.mouseEnter(link);
      vi.advanceTimersByTime(250);
    });

    // Profile card should be in the DOM
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Autonomy Champion/i)).toBeInTheDocument();
    expect(screen.getByText(/View Dossier & Archives/i)).toBeInTheDocument();
    expect(screen.getByText(/godmother of the modern genital autonomy movement/i)).toBeInTheDocument();
  });

  it('renders critic stance badge for pro-circumcision historical figures', async () => {
    render(
      <MemoryRouter>
        <EntityLink entityName="Dr. John Harvey Kellogg" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /dr\. john harvey kellogg/i });
    
    act(() => {
      fireEvent.mouseEnter(link);
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/Circumcision Proponent/i)).toBeInTheDocument();
  });

  it('renders legal case badge for landmark litigation', async () => {
    render(
      <MemoryRouter>
        <EntityLink entityName="Huff v. Colorado" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /huff v\. colorado/i });
    
    act(() => {
      fireEvent.mouseEnter(link);
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/Autonomy Champion/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal Case/i)).toBeInTheDocument();
    expect(screen.getByText(/2024 federal constitutional challenge/i)).toBeInTheDocument();
  });

  it('dismisses hover card after mouse leave timeout', async () => {
    render(
      <MemoryRouter>
        <EntityLink entityName="Foregen" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /foregen/i });
    
    // Mouse enter
    act(() => {
      fireEvent.mouseEnter(link);
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Mouse leave
    act(() => {
      fireEvent.mouseLeave(link);
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

