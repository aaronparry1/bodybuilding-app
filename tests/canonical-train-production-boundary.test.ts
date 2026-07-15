import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");

describe("canonical Train production boundary", () => {
  it("has one canonical route/lifecycle implementation", () => {
    expect(source).toContain("startCanonicalSession");
    expect(source).toContain("recordCanonicalPerformedWork");
    expect(source).toContain("completeCanonicalSession");
    expect(source).toContain("canonicalRecordedSessionLedger");
  });

  it("rejects legacy authority reachability", () => {
    expect(source).not.toMatch(/activeTrainingPlanRepository|workoutSessionRepository|TrainingBlock|TrainingYear|annual-planner|currentBlock|activeBlockId|blockType|generatedWorkout|resolveSetPrescription|suitableBlocks/);
  });

  it("does not route v2, observation, or local policy into Train", () => {
    expect(source).not.toMatch(/v2|shadow|ordinaryV2|telemetry|analytics|setPrescription|dropOffThreshold/);
  });
});
