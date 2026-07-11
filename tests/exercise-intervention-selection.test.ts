import { describe, expect, it } from "vitest";
import { resolveInterventionCandidates } from "@/domain/training/exercise-intervention-selection";
import type { Exercise } from "@/domain/training/models";
import type { ExerciseInterventionRecord } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";

const push = exerciseLibrary.filter((exercise) => exercise.movementPattern === "horizontal_push" && exercise.suitability.includes("intermediate")).slice(0, 3);
const intervention = (overrides: Partial<ExerciseInterventionRecord>): ExerciseInterventionRecord => ({ exerciseId: push[0]!.id, decision: "replace", reason: "pain", evidence: [], decidedAt: "2026-07-01T00:00:00.000Z", reviewAfterExposures: 1, ...overrides });

describe("exercise intervention candidate selection", () => {
  it("removes hard-excluded exercises before scoring and never restores them through preference", () => {
    const records = [intervention({ replacementExerciseId: push[0]!.id })];
    const result = resolveInterventionCandidates({ candidates: push, interventions: records, currentMesocycleId: "hypertrophy_accumulation" });
    expect(result.map((item) => item.exercise.id)).not.toContain(push[0]!.id);
  });

  it("prefers a valid declared substitute without bypassing the candidate pool", () => {
    const replacement = push[1]!;
    const result = resolveInterventionCandidates({ candidates: push, interventions: [intervention({ decision: "substitute", reason: "persistent_stall", replacementExerciseId: replacement.id })], currentMesocycleId: "hypertrophy_accumulation" });
    expect(result.sort((a, b) => b.score - a.score)[0]?.exercise.id).toBe(replacement.id);
  });

  it("ignores an invalid replacement and keeps normal candidates available", () => {
    const result = resolveInterventionCandidates({ candidates: push, interventions: [intervention({ decision: "substitute", reason: "persistent_stall", replacementExerciseId: "missing" })], currentMesocycleId: "hypertrophy_accumulation" });
    expect(result.map((item) => item.exercise.id)).toContain(push[0]!.id);
  });

  it("treats keep interventions as no-op and remains deterministic", () => {
    const records = [intervention({ decision: "keep", reason: "productive" })];
    const first = resolveInterventionCandidates({ candidates: push, interventions: records, currentMesocycleId: "hypertrophy_accumulation" });
    const second = resolveInterventionCandidates({ candidates: push, interventions: records, currentMesocycleId: "hypertrophy_accumulation" });
    expect(first).toEqual(second);
    expect(first.map((item) => item.score)).toEqual([0, 0, 0]);
  });

  it("returns no candidates when every eligible candidate is hard-excluded", () => {
    const result = resolveInterventionCandidates({
      candidates: push,
      interventions: push.map((exercise) => intervention({ exerciseId: exercise.id, decision: "replace", reason: "pain" })),
      currentMesocycleId: "hypertrophy_accumulation",
    });
    expect(result).toEqual([]);
  });
});
