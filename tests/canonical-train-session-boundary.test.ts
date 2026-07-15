import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_TRAIN_SESSION_PROJECTION_VERSION } from "@/application/training/canonical-train-session-boundary";

describe("canonical Train projection and command boundary", () => {
  it("defines a versioned projection without legacy session shapes", () => {
    expect(CANONICAL_TRAIN_SESSION_PROJECTION_VERSION).toBe("canonical_train_session_projection_v1");
    const source = readFileSync(resolve(process.cwd(), "src/application/training/canonical-train-session-boundary.ts"), "utf8");
    expect(source).toContain("canonicalRecordedSessionLedger");
    expect(source).toContain("canonicalTrainCommands");
    expect(source).not.toContain("activeTrainingPlanRepository");
    expect(source).not.toContain("workoutSessionRepository");
    expect(source).not.toContain("type WorkoutSession");
    expect(source).not.toContain("type WorkoutExerciseLog");
  });

  it("exposes only canonical lifecycle command delegation", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/training/canonical-train-session-boundary.ts"), "utf8");
    for (const operation of ["startCanonicalSession", "restoreCanonicalRecordedSessionFromLedger", "recordCanonicalPerformedWork", "pauseCanonicalSession", "resumeCanonicalSession", "completeCanonicalSession"]) {
      expect(source).toContain(operation);
    }
  });
});
