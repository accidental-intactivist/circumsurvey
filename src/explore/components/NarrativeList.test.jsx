import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import NarrativeList from "./NarrativeList";

describe("NarrativeList Component", () => {
  const mockDistribution = [
    { text: "This is an intact response about sensitivity.", pathway: "intact", generation: "Millennial/Gen Y (born 1981-1996)", country_now: "USA" },
    { text: "This is a circumcised response about pain.", pathway: "circumcised", generation: "Generation X (born 1965-1980)", country_now: "Canada" },
    { text: "Another intact response.", pathway: "intact", generation: "Generation Z (born 1997-2012)", country_now: "UK" }
  ];

  it("renders single view correctly", () => {
    const { container } = render(
      <NarrativeList
        distribution={mockDistribution}
        viewMode="single"
        hideChart={true}
      />
    );
    expect(container).toBeTruthy();
    expect(container.textContent).toContain("This is an intact response about sensitivity.");
    expect(container.textContent).toContain("This is a circumcised response about pain.");
  });

  it("renders side-by-side view without ReferenceError", () => {
    const { container } = render(
      <NarrativeList
        distribution={mockDistribution}
        viewMode="side-by-side"
        hideChart={true}
      />
    );
    expect(container).toBeTruthy();
    expect(container.textContent).toContain("This is an intact response about sensitivity.");
    expect(container.textContent).toContain("This is a circumcised response about pain.");
  });

  it("filters responses by highlightWord", () => {
    const { container } = render(
      <NarrativeList
        distribution={mockDistribution}
        viewMode="single"
        highlightWord="sensitivity"
        hideChart={true}
      />
    );
    expect(container.textContent).toContain("This is an intact response about sensitivity.");
    expect(container.textContent).not.toContain("This is a circumcised response about pain.");
  });
});
