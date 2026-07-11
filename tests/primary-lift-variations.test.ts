import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { recommendExerciseRotation } from "@/domain/training/exercise-rotation";
import { exerciseLibrary } from "@/domain/training/presets";
import {
  getPrimaryLiftFamilyForExercise,
  isCanonicalPrimaryLift,
  primaryLiftFamilies,
  recommendReturnToCanonicalPrimaryLift,
  selectStructuredPrimaryLiftVariation,
  type PrimaryLiftVariationDecisionRecord,
} from "@/domain/training/primary-lift-variations";
import { createRecommendedAnnualPlan } from "@/domain/training/plan-setup";
import { keepExerciseDespiteRotationRecommendation, replaceExerciseForFutureSessions } from "@/domain/training/recommendation-actions";
import type { ExerciseHistorySummary } from "@/domain/training/models";

const bench = exercise("ex-bench-press");
const squat = exercise("ex-barbell-back-squat");
const militaryPress = exercise("ex-military-press");
const deadlift = exercise("ex-deadlift");
const romanianDeadlift = exercise("ex-romanian-deadlift");

describe("primary lift variation system", () => {
  it("defines canonical bench, overhead press, squat, and deadlift families", () => {
    expect(primaryLiftFamilies.map((family) => family.id)).toEqual(["bench_press", "standing_overhead_press", "squat", "deadlift"]);
    expect(getPrimaryLiftFamilyForExercise(bench)?.id).toBe("bench_press");
    expect(getPrimaryLiftFamilyForExercise(militaryPress)?.id).toBe("standing_overhead_press");
    expect(getPrimaryLiftFamilyForExercise(squat)?.id).toBe("squat");
    expect(getPrimaryLiftFamilyForExercise(deadlift)?.id).toBe("deadlift");
    expect(isCanonicalPrimaryLift(bench)).toBe(true);
    expect(isCanonicalPrimaryLift(deadlift)).toBe(true);
    expect(isCanonicalPrimaryLift(romanianDeadlift)).toBe(false);
  });

  it("includes expansion variants in the structured primary-lift trees", () => {
    const families = new Map(primaryLiftFamilies.map((family) => [family.id, family.variations.map((variation) => variation.exerciseId)]));

    expect(families.get("bench_press")).toEqual(expect.arrayContaining([
      "ex-paused-bench-press",
      "ex-larsen-press",
      "ex-feet-up-bench-press",
      "ex-slingshot-bench-press",
      "ex-bench-press-chains",
      "ex-bench-press-bands",
      "ex-speed-bench-press",
    ]));
    expect(families.get("squat")).toEqual(expect.arrayContaining([
      "ex-pin-squat",
      "ex-anderson-squat",
      "ex-hatfield-squat",
      "ex-tempo-squat",
      "ex-squat-chains",
      "ex-squat-bands",
      "ex-speed-squat",
    ]));
    expect(families.get("deadlift")).toEqual(expect.arrayContaining([
      "ex-snatch-grip-deadlift",
      "ex-stiff-leg-deadlift",
      "ex-tempo-deadlift",
      "ex-deadlift-chains",
      "ex-deadlift-bands",
      "ex-speed-deadlift",
    ]));
  });

  it("stalled Bench Press selects a structured bench variation before generic machine rotation", () => {
    const recommendation = recommendExerciseRotation(bench, stalledEntries(bench.id, bench.name), exerciseLibrary, {
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "intermediate",
      equipmentAvailable: ["barbell", "dumbbell", "machine", "cable", "other"],
    });

    expect(recommendation.shouldRotate).toBe(true);
    expect(recommendation.structuredPrimaryLiftVariation?.family.id).toBe("bench_press");
    expect(["ex-floor-press", "ex-paused-bench-press", "ex-close-grip-bench-press", "ex-spoto-press"]).toContain(recommendation.suggestedReplacement?.id);
    expect(recommendation.suggestedReplacement?.id).not.toBe("ex-machine-chest-press");
  });

  it("does not rotate a primary lift when separated fatigue is systemic and not lift-specific", () => {
    const recommendation = recommendExerciseRotation(bench, stalledEntries(bench.id, bench.name), exerciseLibrary, {
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "intermediate",
      equipmentAvailable: ["barbell", "dumbbell", "machine", "cable", "other"],
      fatigueClassification: {
        classification: "systemic",
        severity: "high",
        confidence: "high",
        evidence: ["Multiple unrelated lifts are declining."],
        recommendedResponse: "Hold broad progression and consider deload, re-entry, or a calmer week.",
        affectedExerciseIds: ["ex-deadlift", "ex-barbell-back-squat"],
        affectedMuscles: ["hamstrings", "quads"],
      },
    });

    expect(recommendation.shouldRotate).toBe(false);
    expect(recommendation.reason).toContain("broader than this one lift");
  });

  it("stalled Squat selects a structured squat variation", () => {
    const recommendation = recommendExerciseRotation(squat, stalledEntries(squat.id, squat.name), exerciseLibrary, {
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "intermediate",
      equipmentAvailable: ["barbell", "other"],
    });

    expect(recommendation.shouldRotate).toBe(true);
    expect(recommendation.structuredPrimaryLiftVariation?.family.id).toBe("squat");
    expect(["ex-box-squat", "ex-safety-squat-bar-squat", "ex-safety-bar-squat", "ex-front-squat", "ex-pause-squat", "ex-tempo-squat"]).toContain(recommendation.suggestedReplacement?.id);
  });

  it("stalled Deadlift selects a structured deadlift variation before generic hinge swaps", () => {
    const recommendation = recommendExerciseRotation(deadlift, stalledEntries(deadlift.id, deadlift.name), exerciseLibrary, {
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "advanced",
      equipmentAvailable: ["barbell", "other"],
    });

    expect(recommendation.shouldRotate).toBe(true);
    expect(recommendation.structuredPrimaryLiftVariation?.family.id).toBe("deadlift");
    expect([
      "ex-rack-pull",
      "ex-deficit-deadlift",
      "ex-pause-deadlift",
      "ex-tempo-deadlift",
      "ex-speed-deadlift",
    ]).toContain(recommendation.suggestedReplacement?.id);
  });

  it("Romanian Deadlift remains a deadlift-family support variation, not the canonical anchor", () => {
    expect(getPrimaryLiftFamilyForExercise(romanianDeadlift)?.id).toBe("deadlift");
    expect(isCanonicalPrimaryLift(romanianDeadlift)).toBe(false);
  });

  it("progressing primary lifts and one bad exposure do not rotate", () => {
    const progressing = recommendExerciseRotation(bench, [historyEntry(bench.id, bench.name, 1, { progressionEarned: true, bestSetReps: 10 })], exerciseLibrary);
    const oneBadSession = recommendExerciseRotation(bench, [historyEntry(bench.id, bench.name, 1, { progressionEarned: false, bestSetReps: 7 })], exerciseLibrary);

    expect(progressing.shouldRotate).toBe(false);
    expect(oneBadSession.shouldRotate).toBe(false);
  });

  it("beginner context excludes advanced high-skill primary variations", () => {
    const selection = selectStructuredPrimaryLiftVariation({
      currentExercise: squat,
      exercises: exerciseLibrary,
      blockType: "strength",
      experienceLevel: "beginner",
      equipmentAvailable: ["barbell", "other"],
    });

    expect(selection?.selectedExercise.id).not.toBe("ex-cambered-bar-squat");
    expect(selection?.selectedExercise.id).not.toBe("ex-zercher-squat");
    expect(selection).toBeUndefined();
  });

  it("equipment filtering excludes unavailable specialty-bar variations", () => {
    const selection = selectStructuredPrimaryLiftVariation({
      currentExercise: squat,
      exercises: exerciseLibrary,
      blockType: "strength",
      experienceLevel: "advanced",
      equipmentAvailable: ["barbell"],
    });

    expect(selection?.metadata.equipmentRequirements).not.toContain("other");
  });

  it("variation memory avoids repeating the same variation too soon", () => {
    const freshFloorPress: PrimaryLiftVariationDecisionRecord = {
      canonicalFamily: "bench_press",
      originalExerciseId: bench.id,
      chosenVariationId: "ex-floor-press",
      reason: "Recent variation.",
      blockType: "strength",
      week: 4,
      decidedAt: "2026-06-01T10:00:00.000Z",
      exposureCount: 0,
      status: "accepted",
      outcome: "unknown",
      cooldownWeeks: 4,
    };
    const selection = selectStructuredPrimaryLiftVariation({
      currentExercise: bench,
      exercises: exerciseLibrary,
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "advanced",
      equipmentAvailable: ["barbell", "other"],
      variationHistory: [freshFloorPress],
      currentWeek: 5,
    });

    expect(selection?.selectedExercise.id).not.toBe("ex-floor-press");
  });

  it("strength and peak blocks can return a temporary variation to the canonical lift", () => {
    const floorPress = exercise("ex-floor-press");
    const returnRecommendation = recommendReturnToCanonicalPrimaryLift({
      currentExercise: floorPress,
      exercises: exerciseLibrary,
      blockType: "strength",
      variationHistory: [{
        canonicalFamily: "bench_press",
        originalExerciseId: bench.id,
        chosenVariationId: floorPress.id,
        reason: "Variation run.",
        blockType: "strength",
        week: 1,
        decidedAt: "2026-06-01T10:00:00.000Z",
        exposureCount: 4,
        status: "accepted",
        outcome: "neutral",
        cooldownWeeks: 4,
      }],
    });

    expect(returnRecommendation?.selectedExercise.id).toBe("ex-bench-press");
  });

  it("deadlift variation return policy returns to Deadlift, not Romanian Deadlift", () => {
    const rackPull = exercise("ex-rack-pull");
    const returnRecommendation = recommendReturnToCanonicalPrimaryLift({
      currentExercise: rackPull,
      exercises: exerciseLibrary,
      blockType: "peak",
      variationHistory: [{
        canonicalFamily: "deadlift",
        originalExerciseId: deadlift.id,
        chosenVariationId: rackPull.id,
        reason: "Variation run.",
        blockType: "strength",
        week: 1,
        decidedAt: "2026-06-01T10:00:00.000Z",
        exposureCount: 2,
        status: "accepted",
        outcome: "unknown",
        cooldownWeeks: 4,
      }],
    });

    expect(returnRecommendation?.selectedExercise.id).toBe("ex-deadlift");
  });

  it("acceptance applies a structured variation to future sessions only and records variation memory", () => {
    const selection = selectStructuredPrimaryLiftVariation({
      currentExercise: bench,
      exercises: exerciseLibrary,
      blockType: "strength",
      goal: "build_strength",
      experienceLevel: "intermediate",
      equipmentAvailable: ["barbell"],
    })!;
    const plan = replaceExerciseForFutureSessions(createRecommendedAnnualPlan("2026-06-01T10:00:00.000Z"), bench.id, selection.selectedExercise.id, selection.reason, "2026-06-06T10:00:00.000Z", selection);

    expect(plan.recommendationState?.exerciseReplacements?.[bench.id]?.replacementExerciseId).toBe(selection.selectedExercise.id);
    expect(plan.recommendationState?.primaryLiftVariations?.[0]).toMatchObject({
      canonicalFamily: "bench_press",
      originalExerciseId: bench.id,
      chosenVariationId: selection.selectedExercise.id,
      status: "accepted",
      outcome: "unknown",
    });
  });

  it("user rejection keeps the canonical lift and records a rejected variation decision", () => {
    const selection = selectStructuredPrimaryLiftVariation({
      currentExercise: bench,
      exercises: exerciseLibrary,
      blockType: createTrainingBlock("strength").type,
      goal: "build_strength",
      experienceLevel: "intermediate",
      equipmentAvailable: ["barbell"],
    })!;
    const plan = keepExerciseDespiteRotationRecommendation(createRecommendedAnnualPlan("2026-06-01T10:00:00.000Z"), bench.id, selection.reason, "2026-06-06T10:00:00.000Z", selection);

    expect(plan.recommendationState?.exerciseReplacements?.[bench.id]).toBeUndefined();
    expect(plan.recommendationState?.rotationSuppressions?.[bench.id]).toBeDefined();
    expect(plan.recommendationState?.primaryLiftVariations?.[0]?.status).toBe("rejected");
  });
});

function exercise(id: string) {
  const found = exerciseLibrary.find((item) => item.id === id);
  if (!found) throw new Error(`Missing fixture exercise: ${id}`);
  return found;
}

function stalledEntries(exerciseId: string, exerciseName: string): ExerciseHistorySummary[] {
  return [1, 2, 3, 4].map((index) => historyEntry(exerciseId, exerciseName, index, { progressionEarned: false, bestSetReps: 8 }));
}

function historyEntry(exerciseId: string, exerciseName: string, index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Strength",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId,
    exerciseName,
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 24,
    qualitySets: 3,
    bestSetReps: 8,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 100,
    volumeLoad: 2400,
    ...patch,
  };
}
