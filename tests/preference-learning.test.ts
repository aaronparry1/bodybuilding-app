import { describe, expect, it } from "vitest";
import { generateWorkoutByFocus } from "@/domain/training/ad-hoc-workout-generator";
import { canUserOverridePreference, resolveLearnedExercisePreference, scoreLearnedExerciseAvoidance, scoreLearnedReplacementPreference } from "@/domain/training/preference-learning";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import { getExerciseSwapSuggestions } from "@/domain/training/exercise-swaps";
import { recommendExerciseRotation } from "@/domain/training/exercise-rotation";
import { exerciseLibrary } from "@/domain/training/presets";

const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
const machineChestPress = exerciseLibrary.find((exercise) => exercise.id === "ex-machine-chest-press")!;
const cableFly = exerciseLibrary.find((exercise) => exercise.id === "ex-cable-fly")!;

describe("advanced preference learning", () => {
  it("repeated dislike lowers future ranking while preferred replacement rises", () => {
    const preferences = prefMap(record("dislike_exercise", 4, { preferredReplacementExerciseId: machineChestPress.id }));
    const generated = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      exercisePreferences: preferences,
      referenceDate: new Date("2026-06-10T10:00:00.000Z"),
    });
    const baseline = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 20 }).map((exercise) => exercise.id);
    const swaps = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 20, exercisePreferences: preferences }).map((exercise) => exercise.id);

    expect(generated.days[0]?.exerciseSlots.map((slot) => slot.exerciseId)).not.toContain(bench.id);
    expect(swaps.indexOf(machineChestPress.id)).toBeGreaterThanOrEqual(0);
    expect(swaps.indexOf(machineChestPress.id)).toBeLessThanOrEqual(baseline.indexOf(machineChestPress.id));
  });

  it("temporary skip does not persist as a penalty", () => {
    const preferences = prefMap(record("temporary_skip", 1, { temporary: true }));
    const learned = resolveLearnedExercisePreference(preferences[bench.id], { exercise: bench, referenceDate: new Date("2026-06-10T10:00:00.000Z") });

    expect(learned?.temporary).toBe(true);
    expect(learned?.persistent).toBe(false);
    expect(scoreLearnedExerciseAvoidance(bench, preferences, new Date("2026-06-10T10:00:00.000Z"))).toBe(0);
  });

  it("unavailable equipment uses a short cooldown and does not become permanent dislike", () => {
    const preferences = prefMap(record("equipment_unavailable", 2));
    const active = resolveLearnedExercisePreference(preferences[bench.id], { exercise: bench, referenceDate: new Date("2026-06-12T10:00:00.000Z") });
    const expired = resolveLearnedExercisePreference(preferences[bench.id], { exercise: bench, referenceDate: new Date("2026-07-10T10:00:00.000Z") });

    expect(active?.cooldownUntil).toBe("2026-06-16T10:00:00.000Z");
    expect(active?.persistent).toBe(false);
    expect(active?.avoidanceScore).toBeGreaterThan(expired?.avoidanceScore ?? 999);
  });

  it("pain suppression beats normal preference scoring and suppresses close relatives temporarily", () => {
    const preferences = prefMap(record("pain_limitation", 1, {
      avoidedFamily: bench.family,
      avoidedPrimaryMuscles: bench.primaryMuscles,
      preferredReplacementExerciseId: machineChestPress.id,
      suppressSimilarUntil: "2026-07-07T10:00:00.000Z",
    }));

    expect(scoreLearnedExerciseAvoidance(bench, preferences, new Date("2026-06-10T10:00:00.000Z"))).toBeLessThan(-100);
    expect(scoreLearnedExerciseAvoidance(cableFly, preferences, new Date("2026-06-10T10:00:00.000Z"))).toBeLessThan(0);
    expect(scoreLearnedReplacementPreference(bench.id, machineChestPress.id, preferences, new Date("2026-06-10T10:00:00.000Z"))).toBeGreaterThan(0);
  });

  it("primary lifts need stronger evidence before persistent suppression", () => {
    const preferences = prefMap(record("dislike_exercise", 2));
    const learned = resolveLearnedExercisePreference(preferences[bench.id], { exercise: bench, referenceDate: new Date("2026-06-10T10:00:00.000Z") });

    expect(learned?.confidence).toBe("low");
    expect(learned?.persistent).toBe(false);
    expect(Math.abs(scoreLearnedExerciseAvoidance(bench, preferences, new Date("2026-06-10T10:00:00.000Z")))).toBeLessThan(60);
  });

  it("preference decays over time", () => {
    const preferences = prefMap(record("prefer_another", 5, { preferredReplacementExerciseId: machineChestPress.id }));
    const current = Math.abs(scoreLearnedExerciseAvoidance(bench, preferences, new Date("2026-06-10T10:00:00.000Z")));
    const later = Math.abs(scoreLearnedExerciseAvoidance(bench, preferences, new Date("2027-01-10T10:00:00.000Z")));

    expect(later).toBeLessThan(current);
  });

  it("preference evidence can trigger rotation offers while still allowing user override", () => {
    const preferences = prefMap(record("prefer_another", 5, { preferredReplacementExerciseId: machineChestPress.id }));
    const recommendation = recommendExerciseRotation(bench, [], exerciseLibrary, {
      exercisePreferences: preferences,
      equipmentAvailable: ["barbell", "machine", "cable", "dumbbell"],
    });

    expect(recommendation.shouldRotate).toBe(true);
    expect(recommendation.reason).toContain("User preference evidence");
    expect(canUserOverridePreference(preferences[bench.id])).toBe(true);
    expect(recommendation.optionToKeep).toContain("Keep");
  });
});

function record(reason: ExercisePreferenceRecord["reason"], count: number, patch: Partial<ExercisePreferenceRecord> = {}): ExercisePreferenceRecord {
  return {
    avoidedExerciseId: bench.id,
    avoidedFamily: bench.family,
    avoidedPrimaryMuscles: bench.primaryMuscles,
    reason,
    action: "swap",
    count,
    firstAt: "2026-05-01T10:00:00.000Z",
    lastAt: "2026-06-09T10:00:00.000Z",
    recency: "2026-06-09T10:00:00.000Z",
    temporary: false,
    ...patch,
  };
}

function prefMap(record: ExercisePreferenceRecord): Record<string, ExercisePreferenceRecord> {
  return { [record.avoidedExerciseId]: record };
}
