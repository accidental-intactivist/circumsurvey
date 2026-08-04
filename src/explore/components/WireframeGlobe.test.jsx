import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WireframeGlobe from './WireframeGlobe';

// Mock d3 geo path because it uses canvas context which isn't fully supported in jsdom
vi.mock('d3-geo', async () => {
  const actual = await vi.importActual('d3-geo');
  return {
    ...actual,
    geoPath: vi.fn(() => vi.fn(() => true)), // Mock path generator
  };
});

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  save: vi.fn(), restore: vi.fn(), scale: vi.fn(),
  clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
  fill: vi.fn(), stroke: vi.fn(), clip: vi.fn(),
  moveTo: vi.fn(), lineTo: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() }))
}));

// Mock topojson-client
vi.mock('topojson-client', () => ({
  feature: vi.fn((data, objects) => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: 'Canada' },
      geometry: { type: 'Polygon', coordinates: [] }
    }]
  }))
}));

// Mock fetch for GeoJSON loading
global.fetch = vi.fn((url) => {
  return Promise.resolve({
    json: () => Promise.resolve({
      type: 'Topology',
      objects: {
        countries: {
          type: 'GeometryCollection',
          geometries: []
        }
      }
    })
  });
});

describe('WireframeGlobe', () => {
  it('renders a canvas element', async () => {
    const dist = { distribution: [{ label: 'Canada', n: 10 }] };
    const { container } = render(<WireframeGlobe distribution={dist} />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    // Await the fetch to resolve so state updates don't happen after test ends
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('fetches topojson data on mount', async () => {
    const dist = { distribution: [{ label: 'Canada', n: 10 }] };
    render(<WireframeGlobe distribution={dist} geoUrl="test-url.json" />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('test-url.json');
    });
  });

  it('accepts array of geoUrls', async () => {
    const dist = { distribution: [] };
    render(<WireframeGlobe distribution={dist} geoUrl={['url1.json', 'url2.json']} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('url1.json');
      expect(global.fetch).toHaveBeenCalledWith('url2.json');
    });
  });
});
