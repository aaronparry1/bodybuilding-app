import { describe, expect, it } from "vitest";
import { readCanonicalRecommendationAction } from "@/application/training/canonical-recommendation-actions";

describe("canonical recommendation actions", () => {
  it("does not expose legacy actions for an absent plan", () => {
    expect(readCanonicalRecommendationAction("missing-plan")).toEqual({ status: "no_plan" });
  });
});
