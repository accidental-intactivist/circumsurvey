/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GlobalFooter from "./GlobalFooter";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Mock window.scrollTo to prevent errors in jsdom
window.scrollTo = vi.fn();

describe("GlobalFooter", () => {
  it("renders all footer links with valid href attributes", () => {
    render(
      <MemoryRouter>
        <GlobalFooter route="index" navigate={vi.fn()} />
      </MemoryRouter>
    );

    const requiredLinks = [
      { text: "About the Project", href: "/explore/about" },
      { text: "Survey Methodology", href: "/explore/methodology" },
      { text: "Contact Us", href: "/explore/contact" },
      { text: "Get Involved", href: "/explore/get-involved" },
      { text: "FAQ", href: "/explore/faq" },
      { text: "For New Parents", href: "/explore/for-parents" },
      { text: "Demographic Profile", href: "/explore/demographics" },
      { text: "Report Builder", href: "/explore/report" },
      { text: "Downloads & External", href: "/explore/resources" },
    ];

    requiredLinks.forEach(({ text, href }) => {
      const link = screen.getByText(text);
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("renders DirectoryItem links with valid href attributes", () => {
    render(
      <MemoryRouter>
        <GlobalFooter route="index" navigate={vi.fn()} />
      </MemoryRouter>
    );

    // Look for the "Master Index" directory item link (which has num=null)
    const masterIndexLink = screen.getByText("Master Index");
    expect(masterIndexLink).toBeInTheDocument();
    expect(masterIndexLink.tagName).toBe("A");
    expect(masterIndexLink).toHaveAttribute("href", "/explore");
  });
});
