import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { constructRepresentativeMethodSessions } from "./helpers/canonical-method-fixtures";
import { canonicalTrainingMethodDefinitions, CANONICAL_TRAINING_METHOD_POLICY_ID } from "@/domain/training/canonical-training-method-policy";

const reachability = JSON.parse(readFileSync("qa-reports/workout-correction/production-method-reachability-audit.json", "utf8"));
const representatives = JSON.parse(readFileSync("qa-reports/workout-correction/representative-corrected-sessions.json", "utf8"));
const nativeJourney = JSON.parse(readFileSync("qa-reports/workout-correction/native-journey-result.json", "utf8"));

describe("canonical workout correction certification", () => {
  it("audits five goals and three experience levels through real v3 Session Construction", () => {
    expect(reachability.policyId).toBe(CANONICAL_TRAINING_METHOD_POLICY_ID);
    expect(reachability.cases).toHaveLength(15);
    expect(new Set(reachability.cases.map((item: { goal: string }) => item.goal))).toEqual(new Set([
      "build_muscle",
      "build_strength",
      "build_muscle_and_strength",
      "athletic_performance",
      "get_leaner",
    ]));
    expect(reachability.cases.every((item: { status: string }) => item.status === "constructed")).toBe(true);
    expect(reachability.allConstructedProductionMethodsHaveExecutableStructure).toBe(true);
  });

  it("keeps every considered method either typed-supported or explicitly unsupported", () => {
    expect(new Set(canonicalTrainingMethodDefinitions.map((item) => item.method)).size).toBe(canonicalTrainingMethodDefinitions.length);
    expect(canonicalTrainingMethodDefinitions.every((item) => item.status === "supported"
      ? item.exactConstructionOwner && item.restOwner && item.progressionOwner && item.stopRuleOwner
      : item.exactConstructionOwner === null && item.maximumFrequency === "zero")).toBe(true);
  });

  it("publishes six complete athlete-facing examples and deterministic phase progression", () => {
    expect(representatives.sessions.map((item: { label: string }) => item.label)).toEqual([
      "intermediate hypertrophy Push",
      "intermediate hypertrophy Pull",
      "intermediate hypertrophy Legs",
      "intermediate powerbuilding upper",
      "intermediate strength primary-lift session",
      "intermediate athletic session",
    ]);
    for (const session of representatives.sessions) {
      expect(session.workingSets).toBeGreaterThan(0);
      expect(session.expectedDurationMinutes).toBeGreaterThan(0);
      expect(session.exercises.every((exercise: Record<string, unknown>) =>
        exercise.exercise && exercise.method && exercise.execution && exercise.sets && exercise.exactReps
        && exercise.loadState && exercise.restSeconds !== undefined && exercise.progression && exercise.stopRule && exercise.why)).toBe(true);
    }
    expect(representatives.mesocycleProgression).toHaveLength(5);
  });

  it("keeps representative construction deep-deterministic", () => {
    const input = { id: "deterministic-method-certification", goal: "build_muscle_and_strength" as const, mesocycleId: "powerbuilding_hypertrophy" as const, experience: "intermediate" as const, daysPerWeek: 5 as const, split: "let_app_choose" as const, established: true as const };
    expect(constructRepresentativeMethodSessions(input)).toEqual(constructRepresentativeMethodSessions(input));
  });

  it("binds the passed native straight, discard, superset, and rest-pause journeys to retained screenshots", () => {
    expect(nativeJourney.status).toBe("passed");
    expect(nativeJourney.standardDynamicType).toBe("passed");
    expect(nativeJourney.largeDynamicType).toBe("passed");
    expect(nativeJourney.straightSet.status).toBe("passed");
    expect(nativeJourney.discard.status).toBe("passed");
    expect(nativeJourney.antagonistSuperset.status).toBe("passed");
    expect(nativeJourney.restPause.status).toBe("passed");
    expect(nativeJourney.externalBuildOrUploadPerformed).toBe(false);
    expect(nativeJourney.screenshots).toHaveLength(12);
    for (const screenshot of nativeJourney.screenshots as readonly { path: string; sha256: string }[]) {
      expect(existsSync(screenshot.path), screenshot.path).toBe(true);
      expect(createHash("sha256").update(readFileSync(screenshot.path)).digest("hex")).toBe(screenshot.sha256);
    }
  });
});
