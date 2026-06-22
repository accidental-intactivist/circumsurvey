/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ExhibitDataLoader, { NARRATIVE_MULTI_SELECT } from "./ExhibitDataLoader";
import * as api from "../lib/api";
import * as formatters from "../lib/formatters";

// Mock the API layer
vi.mock("../lib/api", () => ({
  getResponseDistribution: vi.fn(),
  getNarratives: vi.fn()
}));

// Mock the child components so we can isolate ExhibitDataLoader's logic
vi.mock("./DistributionChart", () => ({
  default: ({ distribution, question }) => (
    <div data-testid="distribution-chart">
      {JSON.stringify(distribution)}
    </div>
  )
}));

vi.mock("./NarrativeList", () => ({
  default: ({ distribution }) => (
    <div data-testid="narrative-list">
      {JSON.stringify(distribution)}
    </div>
  )
}));

vi.mock("./SmallSampleBadge", () => ({
  default: ({ n, children }) => (
    <div data-testid="small-sample-badge" data-n={n}>
      {children}
    </div>
  )
}));

describe("ExhibitDataLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a loading state initially", () => {
    api.getResponseDistribution.mockReturnValue(new Promise(() => {})); // Never resolves
    const q = { id: "test_q", type: "single_select" };
    render(<ExhibitDataLoader question={q} />);
    expect(screen.getByText("Loading data...")).toBeTruthy();
  });

  it("calls getResponseDistribution for standard quantitative questions", async () => {
    const mockData = { distribution: [{ label: "Yes", n: 10 }, { label: "No", n: 5 }] };
    api.getResponseDistribution.mockResolvedValue(mockData);

    const q = { id: "test_q", type: "single_select" };
    const cohort = { politics: "Liberal" };
    
    render(<ExhibitDataLoader question={q} cohort={cohort} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading data...")).toBeNull();
    });

    expect(api.getResponseDistribution).toHaveBeenCalledWith("test_q", { cohort });
    expect(api.getNarratives).not.toHaveBeenCalled();

    // Verify SmallSampleBadge receives correct n = 15
    const badge = screen.getByTestId("small-sample-badge");
    expect(badge.getAttribute("data-n")).toBe("15");

    // Verify it renders DistributionChart
    expect(screen.getByTestId("distribution-chart")).toBeTruthy();
  });

  it("calls getNarratives for open_text questions", async () => {
    const mockData = { narratives: [{ text: "Hello", pathway: "intact" }] };
    api.getNarratives.mockResolvedValue(mockData);

    const q = { id: "test_q", type: "open_text" };
    
    render(<ExhibitDataLoader question={q} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading data...")).toBeNull();
    });

    expect(api.getNarratives).toHaveBeenCalledWith("test_q", expect.any(Object));
    expect(api.getResponseDistribution).not.toHaveBeenCalled();

    // Verify it renders NarrativeList instead of SmallSampleBadge/DistributionChart
    expect(screen.queryByTestId("small-sample-badge")).toBeNull();
    expect(screen.getByTestId("narrative-list")).toBeTruthy();
  });

  it("treats NARRATIVE_MULTI_SELECT edge cases as open_text", async () => {
    const mockData = { narratives: [{ text: "Free text", pathway: "circumcised" }] };
    api.getNarratives.mockResolvedValue(mockData);

    // Grab the first ID from the set
    const edgeCaseId = Array.from(NARRATIVE_MULTI_SELECT)[0];
    const q = { id: edgeCaseId, type: "multi_select" }; // DB says multi_select!
    
    render(<ExhibitDataLoader question={q} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading data...")).toBeNull();
    });

    // Should STILL call getNarratives, not getResponseDistribution
    expect(api.getNarratives).toHaveBeenCalledWith(edgeCaseId, expect.any(Object));
    expect(api.getResponseDistribution).not.toHaveBeenCalled();
    expect(screen.getByTestId("narrative-list")).toBeTruthy();
  });

  it("calls flattenMultiSelect for standard multi_select questions", async () => {
    const mockData = { distribution: [{ label: "A, B", n: 10 }] };
    api.getResponseDistribution.mockResolvedValue(mockData);
    
    // Spy on flattenMultiSelect
    const flattenSpy = vi.spyOn(formatters, "flattenMultiSelect").mockReturnValue([{ label: "A", n: 10 }, { label: "B", n: 10 }]);

    const q = { id: "test_q", type: "multi_select" };
    
    render(<ExhibitDataLoader question={q} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading data...")).toBeNull();
    });

    expect(flattenSpy).toHaveBeenCalledWith(mockData.distribution, q);
    
    // Chart should receive the flattened data
    const chart = screen.getByTestId("distribution-chart");
    expect(chart.textContent).toContain('"label":"A"');
    
    flattenSpy.mockRestore();
  });
});
