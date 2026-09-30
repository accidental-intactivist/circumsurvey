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

  it("highlights search term and its plural/possessive forms correctly", () => {
    const customDist = [
      { text: "My decision's consequences and other decisions were made.", pathway: "intact" }
    ];
    const { container } = render(
      <NarrativeList
        distribution={customDist}
        viewMode="single"
        highlightWord="decision"
        hideChart={true}
      />
    );
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe("decision's");
    expect(marks[1].textContent).toBe("decisions");
  });

  it("highlights hyphenated words and compounds correctly", () => {
    const customDist = [
      { text: "We focused on decision-making and self-esteem issues.", pathway: "intact" }
    ];
    
    // Test matching a full hyphenated word
    const { container: container1 } = render(
      <NarrativeList
        distribution={customDist}
        viewMode="single"
        highlightWord="self-esteem"
        hideChart={true}
      />
    );
    const marks1 = container1.querySelectorAll("mark");
    expect(marks1.length).toBe(1);
    expect(marks1[0].textContent).toBe("self-esteem");

    // Test matching part of a hyphenated word (e.g. "decision" in "decision-making")
    const { container: container2 } = render(
      <NarrativeList
        distribution={customDist}
        viewMode="single"
        highlightWord="decision"
        hideChart={true}
      />
    );
    const marks2 = container2.querySelectorAll("mark");
    expect(marks2.length).toBe(1);
    expect(marks2[0].textContent).toBe("decision");
  });

  it("respects word boundaries and does not highlight partial matches", () => {
    const customDist = [
      { text: "It was a painful and painless experience.", pathway: "intact" }
    ];
    const { container } = render(
      <NarrativeList
        distribution={customDist}
        viewMode="single"
        highlightWord="pain"
        hideChart={true}
      />
    );
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(0); // Should not highlight "pain" inside "painful" or "painless"
  });

  it("handles regex special characters safely in highlightWord", () => {
    const customDist = [
      { text: "This is a [special] test with (parentheses) and *stars*.", pathway: "intact" }
    ];
    const { container } = render(
      <NarrativeList
        distribution={customDist}
        viewMode="single"
        highlightWord="[special]"
        hideChart={true}
      />
    );
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe("[special]");
  });
});
