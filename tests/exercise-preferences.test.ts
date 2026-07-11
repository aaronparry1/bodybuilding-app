import { describe, expect, it } from "vitest";
import { generateWorkoutByFocus } from "@/domain/training/ad-hoc-workout-generator";
import {
  reasonAffectsProgression,
  recordExerciseReason,
  scoreExercisePreference,
  type ExercisePreferenceRecord,
} from "@/domain/training/exercise-preferences";
import { getExerciseSwapSuggestions } from "@/domain/training/exercise-swaps";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";

const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
const machineChestPress = exerciseLibrary.find((exercise) => exercise.id === "ex-machine-chest-press")!;

function plan() {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
}

describe("exercise reason and preference learning", () => {
  it("records pain or limitation without turning it into a progression failure", () => {
    const updated = recordExerciseReason(
      plan(),
      {
        action: "remove",
        avoidedExerciseId: bench.id,
        avoidedFamily: bench.family,
        avoidedPrimaryMuscles: bench.primaryMuscles,
        reason: "pain_limitation",
      },
      "2026-06-09T10:00:00.000Z",
    );
    const record = updated.recommendationState?.exercisePreferences?.[bench.id];

    expect(record?.reason).toBe("pain_limitation");
    expect(record?.suppressSimilarUntil).toBe("2026-07-07T10:00:00.000Z");
    expect(reasonAffectsProgression("pain_limitation")).toBe(false);
    expect(scoreExercisePreference(bench, updated.recommendationState?.exercisePreferences, new Date("2026-06-10T10:00:00.000Z"))).toBeLessThan(-50);
  });

  it("records unavailable equipment without creating a training failure", () => {
    const updated = recordExerciseReason(
      plan(),
      {
        action: "swap",
        avoidedExerciseId: bench.id,
        preferredReplacementExerciseId: machineChestPress.id,
        reason: "equipment_unavailable",
      },
      "2026-06-09T10:00:00.000Z",
    );

    expect(updated.recommendationState?.exercisePreferences?.[bench.id]?.reason).toBe("equipment_unavailable");
    expect(reasonAffectsProgression("equipment_unavailable")).toBe(false);
  });

  it("boosts repeated preferred replacements in swap suggestions", () => {
    const preferences: Record<string, ExercisePreferenceRecord> = {
      [bench.id]: {
        avoidedExerciseId: bench.id,
        preferredReplacementExerciseId: machineChestPress.id,
        reason: "prefer_another",
        action: "swap",
        count: 3,
        firstAt: "2026-06-01T10:00:00.000Z",
        lastAt: "2026-06-09T10:00:00.000Z",
        recency: "2026-06-09T10:00:00.000Z",
        temporary: false,
      },
    };
    const baseline = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 12 }).map((exercise) => exercise.id);
    const adjusted = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 12, exercisePreferences: preferences }).map((exercise) => exercise.id);

    expect(adjusted.indexOf(machineChestPress.id)).toBeGreaterThanOrEqual(0);
    expect(adjusted.indexOf(machineChestPress.id)).toBeLessThanOrEqual(baseline.indexOf(machineChestPress.id));
  });

  it("temporary skip is tracked but does not create a lasting preference penalty", () => {
    const updated = recordExerciseReason(
      plan(),
      {
        action: "skip",
        avoidedExerciseId: bench.id,
        reason: "temporary_skip",
      },
      "2026-06-09T10:00:00.000Z",
    );

    expect(updated.recommendationState?.exercisePreferences?.[bench.id]?.temporary).toBe(true);
    expect(scoreExercisePreference(bench, updated.recommendationState?.exercisePreferences, new Date("2026-06-10T10:00:00.000Z"))).toBe(0);
    expect(reasonAffectsProgression("temporary_skip")).toBe(false);
  });

  it("repeated dislike lowers future generation ranking without removing completed history", () => {
    const preferences: Record<string, ExercisePreferenceRecord> = {
      [bench.id]: {
        avoidedExerciseId: bench.id,
        reason: "dislike_exercise",
        action: "swap",
        count: 5,
        firstAt: "2026-05-01T10:00:00.000Z",
        lastAt: "2026-06-09T10:00:00.000Z",
        recency: "2026-06-09T10:00:00.000Z",
        temporary: false,
      },
    };
    const generated = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      exercisePreferences: preferences,
      referenceDate: new Date("2026-06-10T10:00:00.000Z"),
    });

    expect(generated.days[0]?.exerciseSlots.map((slot) => slot.exerciseId)).not.toContain(bench.id);
  });
});
