import { describe, it, expect } from "vitest";
import { colorForLabel } from "./MiniSparkline";

describe("colorForLabel", () => {
  it("generates distinct colors for sequential indices (programmatic categorical colors)", () => {
    // Generate colors for a generic question with many options like family_ses
    const labels = [
      "Lower class",
      "Working class",
      "Lower middle class",
      "Middle class",
      "Upper middle class",
      "Upper class"
    ];
    
    const colors = labels.map((label, i) => colorForLabel(label, i));
    
    // Check that there are no duplicate colors
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(labels.length);
  });
  
  it("varies luminance for identical semantic buckets", () => {
    // Two positive labels mapping to the blue bucket
    const c1 = colorForLabel("Yes, strongly", 0);
    const c2 = colorForLabel("Yes, somewhat", 1);
    
    expect(c1).not.toBe(c2);
    // They should both start with #, indicating valid hex codes
    expect(c1.startsWith("#")).toBe(true);
    expect(c2.startsWith("#")).toBe(true);
  });

  it("assigns distinctive colors to generation cohorts", () => {
    const millennial = colorForLabel("Millennial/Gen Y (born 1981-1996)", 0);
    const boomer = colorForLabel("Baby Boomer (born 1946-1964)", 0);
    
    expect(millennial).toBe("#e8c868"); // Yellow
    expect(boomer).toBe("#5b93c7"); // Blue
  });
});
