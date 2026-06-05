import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import GeographicHeatmap from "./GeographicHeatmap";

describe("GeographicHeatmap Component", () => {
  it("renders without throwing an error", () => {
    const mockDistribution = {
      distribution: [
        { label: "California", n: 10 },
        { label: "New York", n: 5 }
      ]
    };
    
    const mockByCohort = {
      results: {
        intact: {
          distribution: [
            { label: "California", n: 4 },
            { label: "New York", n: 2 }
          ]
        },
        circumcised: {
          distribution: [
            { label: "California", n: 6 },
            { label: "New York", n: 3 }
          ]
        }
      }
    };

    const { container } = render(
      <GeographicHeatmap
        questionId="us_state_born"
        title="United States Respondents"
        distribution={mockDistribution}
        byCohort={mockByCohort}
      />
    );

    expect(container).toBeTruthy();
  });
});
