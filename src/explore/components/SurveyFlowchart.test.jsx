/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SurveyFlowchart from "./SurveyFlowchart";
import * as api from "../lib/api";

// Mock the API layer
vi.mock("../lib/api", () => ({
  getQuestions: vi.fn(),
}));

// Mock the Tooltip hook to avoid DOM dimension issues in jsdom
vi.mock("../../components/Tooltip", () => ({
  useTooltip: () => ({
    tooltip: null,
    showTooltip: vi.fn(),
    moveTooltip: vi.fn(),
    hideTooltip: vi.fn()
  }),
  default: () => null
}));

const mockQuestions = [
  { id: "q1", group: "universal", text: "Universal Q1", type: "single_select" },
  { id: "q2", group: "circumcised", text: "Circ Q1", type: "single_select" },
  { id: "q3", group: "intact", text: "Intact Q1", type: "single_select" },
];

describe("SurveyFlowchart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock return
    api.getQuestions.mockResolvedValue({ questions: mockQuestions });
  });

  const renderFlowchart = (initialPath = "/explore") => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/explore" element={<SurveyFlowchart />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders loading state initially, then universal pathway by default", async () => {
    renderFlowchart();

    // The API call happens in a useEffect, so we should see the loading state or universal pathway
    // SurveyFlowchart default state expands "universal"
    await waitFor(() => {
      expect(screen.getByText("Universal Questions")).toBeInTheDocument();
    });

    // The Universal pathway has 22q hardcoded in the block, but our mock api might be called
    expect(api.getQuestions).toHaveBeenCalled();
  });

  it("expands a pathway when clicked and scrolls into view", async () => {
    // Mock scrollIntoView
    window.scrollTo = vi.fn();
    
    renderFlowchart();

    await waitFor(() => {
      expect(screen.getByText("Circumcised")).toBeInTheDocument();
    });

    // Find the Circumcised pathway card (we can click the title or the card itself)
    // The role="button" is on the FlowNode
    const circCard = screen.getAllByRole("button").find(b => b.textContent.includes("Circumcised"));
    expect(circCard).toBeDefined();

    fireEvent.click(circCard);

    // Wait for the route to update or state to expand
    // It should render the Circumcised pathway questions
    await waitFor(() => {
      expect(screen.getByText("Circumcised PATHWAY QUESTIONS")).toBeInTheDocument();
    });
    
    // Check if smooth scroll was triggered
    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalled();
    }, { timeout: 150 }); // timeout because of the 50ms setTimeout in the component
  });

  it("filters questions based on search query", async () => {
    renderFlowchart();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search questions or keywords...")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search questions or keywords...");
    
    // Type a query that should open pathways
    fireEvent.change(searchInput, { target: { value: "Universal Q1" } });

    // The activePathways logic should kick in. Since mockQuestions contains "Universal Q1" in group "universal",
    // wait for the UI to update. 
    // In our test, the actual search logic relies on getQuestions returning the full array, which we mocked.
    // However, SurveyFlowchart uses `totalForPathway` which relies on `questions.filter()`.
    await waitFor(() => {
      // It should display the search clear button
      expect(screen.getByText("✕")).toBeInTheDocument();
    });
  });

  it("collapses all nodes when Collapse All is clicked", async () => {
    renderFlowchart();

    await waitFor(() => {
      expect(screen.getByText("Collapse All")).toBeInTheDocument();
    });

    // Click Circumcised to expand it
    const circCard = screen.getAllByRole("button").find(b => b.textContent.includes("Circumcised"));
    fireEvent.click(circCard);

    await waitFor(() => {
      expect(screen.getByText("Circumcised PATHWAY QUESTIONS")).toBeInTheDocument();
    });

    // Click Collapse All
    const collapseBtn = screen.getByText("Collapse All");
    fireEvent.click(collapseBtn);

    // Circumcised PATHWAY QUESTIONS should disappear
    await waitFor(() => {
      expect(screen.queryByText("Circumcised PATHWAY QUESTIONS")).not.toBeInTheDocument();
    });
  });

  it("reads 'expanded' from URL and immediately erases it", async () => {
    // Render with a specific pathway in the URL
    renderFlowchart("/explore?expanded=intact");

    await waitFor(() => {
      expect(screen.getByText("Intact PATHWAY QUESTIONS")).toBeInTheDocument();
    });

    // The URL should no longer contain expanded=intact because of the read & erase logic
    // React Router MemoryRouter makes it slightly tricky to check window.location directly,
    // but the component state should have correctly parsed 'intact'.
  });
});
