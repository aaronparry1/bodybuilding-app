import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { defaultCanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { exerciseLibrary } from "@/domain/training/presets";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";

const limitedEquipment = ["dumbbell", "bodyweight", "bands"] as const;
const createdAt = "2026-08-23T08:00:00.000Z";

describe("canonical restricted-equipment construction", () => {
  it("uses the factual dumbbell hinge fallback without selecting a strength specialist", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "restricted-hypertrophy-upper-lower",
      createdAt,
      updatedAt: createdAt,
      goal: "hypertrophy",
      macrocycleGoal: "build_muscle",
      experienceLevel: "intermediate",
      daysPerWeek: 2,
      preferredSplit: "upper_lower",
      equipment: limitedEquipment,
      units: "kg",
      availableSessionMinutes: 45,
      startingVolumeContext: defaultCanonicalStartingVolumeContext(2),
      exercises: exerciseLibrary,
    });
    expect(result.status, result.status === "constructed" ? undefined : result.reason).toBe("constructed");
    if (result.status !== "constructed") return;
    const ids = result.carrier.plannedSessions.flatMap((session) => (session.prescriptionSnapshot as CanonicalSessionSnapshotV3).slots.map((slot) => slot.exerciseId));
    expect(ids.some((id) => exerciseLibrary.find((exercise) => exercise.id === id)?.movementPattern === "hinge")).toBe(true);
    expect(ids.some((id) => exerciseLibrary.find((exercise) => exercise.id === id)?.selectionProfile === "strength_specialist")).toBe(false);
  });

  it("keeps bands as a complement to the dumbbell athletic profile rather than requiring competition lifts", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "restricted-athletic-six-day",
      createdAt,
      updatedAt: createdAt,
      goal: "strength_hypertrophy",
      macrocycleGoal: "athletic_performance",
      experienceLevel: "advanced",
      daysPerWeek: 6,
      preferredSplit: "let_app_choose",
      equipment: limitedEquipment,
      units: "kg",
      availableSessionMinutes: 45,
      startingVolumeContext: { ...defaultCanonicalStartingVolumeContext(6), concurrentSport: "lower_body_loading" },
      exercises: exerciseLibrary,
    });
    expect(result.status, result.status === "constructed" ? undefined : result.reason).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(result.carrier.plannedSessions).toHaveLength(6);
    expect(result.carrier.plannedSessions.flatMap((session) => (session.prescriptionSnapshot as CanonicalSessionSnapshotV3).slots).every((slot) => {
      const exercise = exerciseLibrary.find((candidate) => candidate.id === slot.exerciseId);
      return Boolean(exercise?.equipment.some((item) => limitedEquipment.includes(item as (typeof limitedEquipment)[number])));
    })).toBe(true);
  });
});
