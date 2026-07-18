import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const evidenceRoot = path.join(repositoryRoot, "qa-reports/design-qa/plan-progress");
const artifactPath = path.join(evidenceRoot, "plan-progress-visual-certification.json");

type VisualArtifact = {
  designQaOnly: boolean;
  productionMutationPerformed: boolean;
  viewports: Array<{ width: number; height: number }>;
  states: Array<{ id: string; screenshot: string; sha256: string; width: number; height: number; result: string }>;
  responsiveFindings: Record<string, boolean>;
  accessibilityFindings: Record<string, boolean>;
  progressEvidenceRules: { performedWorkOnly: boolean; minimumCompletedSessionsForStatus: number; minimumComparableObservationsForTrend: number };
  canonicalFixture: { orderedSessions: string[]; weeklyWorkingSets: number[]; weeklyWorkingSetTotal: number; visualFixtureAlignment: string };
};

function readArtifact(): VisualArtifact {
  return JSON.parse(readFileSync(artifactPath, "utf8")) as VisualArtifact;
}

function pngDimensions(bytes: Buffer): { width: number; height: number } {
  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("canonical Plan and Progress visual certification", () => {
  it("covers every required state at all three target viewports", () => {
    const artifact = readArtifact();
    expect(artifact.viewports).toEqual([{ width: 390, height: 844 }, { width: 375, height: 812 }, { width: 320, height: 568 }]);
    expect(artifact.states.map((state) => state.id)).toEqual([
      "plan_session_next", "plan_session_active", "plan_partial_week", "plan_phase_completed", "plan_recoverable_error", "plan_no_plan",
      "progress_zero_history", "progress_one_completed", "progress_established", "progress_genuine_pr", "progress_insufficient_trend", "progress_recoverable_error",
    ]);
    expect(artifact.states.every((state) => state.result === "passed")).toBe(true);
  });

  it("keeps each viewport capture deterministic and dimensionally exact", () => {
    for (const state of readArtifact().states) {
      const screenshotPath = path.join(evidenceRoot, state.screenshot);
      expect(existsSync(screenshotPath), state.id).toBe(true);
      const bytes = readFileSync(screenshotPath);
      expect(createHash("sha256").update(bytes).digest("hex"), state.id).toBe(state.sha256);
      expect(pngDimensions(bytes), state.id).toEqual({ width: state.width, height: state.height });
    }
  });

  it("certifies canonical fixture, evidence, responsive, and accessibility boundaries", () => {
    const artifact = readArtifact();
    expect(artifact.designQaOnly).toBe(true);
    expect(artifact.productionMutationPerformed).toBe(false);
    expect(artifact.canonicalFixture).toMatchObject({
      orderedSessions: ["Bench and hypertrophy", "Squat and hypertrophy", "Deadlift and back", "Upper support", "Lower support"],
      weeklyWorkingSets: [11, 11, 11, 14, 12],
      weeklyWorkingSetTotal: 59,
      visualFixtureAlignment: "passed",
    });
    expect(artifact.progressEvidenceRules).toMatchObject({ performedWorkOnly: true, minimumCompletedSessionsForStatus: 3, minimumComparableObservationsForTrend: 3 });
    expect(artifact.responsiveFindings).toEqual({
      primaryActionsVisibleWhereRequired: true,
      horizontalOverflowObserved: false,
      clippedPrimaryTextObserved: false,
      bottomNavigationObscuresPrimaryAction: false,
      narrowWidthUsable: true,
      qaChromeObserved: false,
      rawArchitectureIdentifiersObserved: false,
    });
    expect(Object.values(artifact.accessibilityFindings).every(Boolean)).toBe(true);
  });

  it("keeps tab screens on presentation boundaries without raw repositories or mutation owners", () => {
    const planScreen = readFileSync(path.join(repositoryRoot, "app/(protected)/(tabs)/programmes.tsx"), "utf8");
    const progressScreen = readFileSync(path.join(repositoryRoot, "app/(protected)/(tabs)/analytics.tsx"), "utf8");
    expect(planScreen).toContain("useCanonicalPlanPresentation");
    expect(planScreen).toContain("PlanDashboard");
    expect(progressScreen).toContain("useCanonicalProgressPresentation");
    expect(progressScreen).toContain("ProgressDashboard");
    for (const forbidden of ["activeTrainingPlanRepository", "workoutHistoryRepository", "canonicalRecordedSessionLedger", "evaluateCanonicalProgress", "applyProgressDecision", "Session Construction during projection"]) {
      expect(planScreen, forbidden).not.toContain(forbidden);
      expect(progressScreen, forbidden).not.toContain(forbidden);
    }
  });
});
