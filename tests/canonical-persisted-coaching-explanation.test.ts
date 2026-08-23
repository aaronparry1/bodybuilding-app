import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("persisted coaching explanation authority", () => {
  it("uses observation, decision and next action from the canonical audit on completion and Progress", () => {
    for (const path of [
      "src/application/training/canonical-completion-summary-presentation.ts",
      "src/application/training/canonical-progress-presentation.ts",
    ]) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("adaptationAudit?.explanation");
      expect(source).toContain("persistedExplanation.observation");
      expect(source).toContain("persistedExplanation.decision");
      expect(source).toContain("persistedExplanation.nextAction");
    }
  });
});
