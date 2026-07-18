import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const evidenceRoot = path.join(
  repositoryRoot,
  "qa-reports/design-qa/global-shell-home",
);
const artifactPath = path.join(
  evidenceRoot,
  "global-shell-home-visual-certification.json",
);

type VisualArtifact = {
  designQaOnly: boolean;
  productionMutationPerformed: boolean;
  viewports: Array<{ width: number; height: number }>;
  states: Array<{
    id: string;
    screenshot: string;
    sha256: string;
    result: string;
  }>;
  responsiveFindings: Record<string, boolean>;
  trainLifecycleFindings: Record<string, boolean>;
};

function readArtifact(): VisualArtifact {
  return JSON.parse(readFileSync(artifactPath, "utf8")) as VisualArtifact;
}

describe("global shell and Home visual certification", () => {
  it("covers every required state at the three target iPhone viewports", () => {
    const artifact = readArtifact();

    expect(artifact.viewports).toEqual([
      { width: 390, height: 844 },
      { width: 375, height: 812 },
      { width: 320, height: 568 },
    ]);
    expect(artifact.states.map((state) => state.id)).toEqual([
      "planned_zero_history",
      "active_workout",
      "active_paused_workout",
      "completed_today",
      "rest_day",
      "recoverable_storage_error",
      "no_plan",
    ]);
    expect(artifact.states.every((state) => state.result === "passed")).toBe(true);
  });

  it("keeps visual evidence deterministic and unchanged", () => {
    const artifact = readArtifact();

    for (const state of artifact.states) {
      const screenshotPath = path.join(evidenceRoot, state.screenshot);
      expect(existsSync(screenshotPath), state.id).toBe(true);
      const digest = createHash("sha256")
        .update(readFileSync(screenshotPath))
        .digest("hex");
      expect(digest, state.id).toBe(state.sha256);
    }
  });

  it("certifies the responsive and Train shell boundaries without production mutation", () => {
    const artifact = readArtifact();

    expect(artifact.designQaOnly).toBe(true);
    expect(artifact.productionMutationPerformed).toBe(false);
    expect(artifact.responsiveFindings).toEqual({
      primaryActionVisible: true,
      horizontalOverflowObserved: false,
      clippedTextObserved: false,
      bottomNavigationObscuresContent: false,
      compactSettingsActionAccessible: true,
      narrowWidthUsable: true,
    });
    expect(Object.values(artifact.trainLifecycleFindings).every(Boolean)).toBe(true);
  });
});
