import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const train = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const home = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");

describe("canonical Train navigation and lifecycle boundary", () => {
  it("accepts canonical planned and recorded identities only", () => {
    expect(train).toContain("plannedSessionId");
    expect(train).toContain("recordedSessionId");
    expect(train).toContain("planRevision");
    expect(train).toContain("startCanonicalSession");
    expect(train).toContain("restoreCanonicalRecordedSessionFromLedger");
  });

  it("uses the immutable snapshot and canonical ledger operations", () => {
    expect(train).toContain("prescriptionSnapshot");
    expect(train).toContain("canonicalRecordedSessionLedger");
    expect(train).toContain("pauseCanonicalSession");
    expect(train).toContain("resumeCanonicalSession");
    expect(train).toContain("completeCanonicalSession");
    expect(train).toContain("recordCanonicalPerformedWork");
  });

  it("keeps Home navigation canonical", () => {
    expect(home).toContain("canonicalActivePlanState");
    expect(home).toContain("plannedSessionId");
    expect(home).toContain("recordedSessionId");
    expect(home).toContain('pathname: "/(protected)/(tabs)/train"');
  });

  it("has no legacy Train authority or caller-authored prescription path", () => {
    expect(train).not.toMatch(/ActiveTrainingPlan|activeTrainingPlanRepository|TrainingBlock|TrainingYear|annual-planner|currentBlock|activeBlockId|blockType|planned-workout|buildWorkout|resolveSetPrescription|suitableBlocks|workoutSessionRepository/);
    expect(train).not.toMatch(/generatedWorkout|callerPrescription|legacyProgramme|TrainingYear/);
  });

  it("keeps production and v2 boundaries separate", () => {
    expect(train).not.toMatch(/v2|shadow|ordinaryV2|telemetry|analytics/);
    expect(train).toContain("canonical_train");
  });

  it("renders bounded recovery for unavailable canonical state", () => {
    expect(train).toContain("could not be restored safely");
    expect(train).toContain("Return to Home");
    expect(train).toContain("no longer current");
  });
});
