import { describe, it, expect } from "vitest";
import { 
  observerSubrolesForQuestion, 
  circumcisedSubrolesForQuestion 
} from "./pathways";

describe("pathways helper tests", () => {
  describe("observerSubrolesForQuestion", () => {
    it("should classify observe_all_ questions as universal", () => {
      const q = { id: "observe_all_social_climate" };
      expect(observerSubrolesForQuestion(q)).toContain("universal");
    });

    it("should classify partner-prefixed questions as partner role", () => {
      const q = { id: "observe_partner_intimacy_changes" };
      expect(observerSubrolesForQuestion(q)).toContain("partner");
    });

    it("should classify parent-prefixed questions as parent role", () => {
      const q = { id: "observe_parent_decision_factors" };
      expect(observerSubrolesForQuestion(q)).toContain("parent");
    });

    it("should classify advocate-prefixed questions as advocate role", () => {
      const q = { id: "observe_advocate_tipping_point" };
      expect(observerSubrolesForQuestion(q)).toContain("advocate");
    });
  });

  describe("circumcisedSubrolesForQuestion", () => {
    it("should classify circ_parents_ questions as infant decision role", () => {
      const q = { id: "circ_parents_info_quality" };
      expect(circumcisedSubrolesForQuestion(q)).toContain("infant");
      expect(circumcisedSubrolesForQuestion(q)).not.toContain("adult");
    });

    it("should classify circ_adult_ questions as adult decision role", () => {
      const q = { id: "circ_adult_motivation_details" };
      expect(circumcisedSubrolesForQuestion(q)).toContain("adult");
      expect(circumcisedSubrolesForQuestion(q)).not.toContain("infant");
    });

    it("should classify general circ_ questions as universal", () => {
      const q = { id: "circ_age" };
      expect(circumcisedSubrolesForQuestion(q)).toContain("universal");
      expect(circumcisedSubrolesForQuestion(q)).not.toContain("adult");
      expect(circumcisedSubrolesForQuestion(q)).not.toContain("infant");
    });
  });
});
