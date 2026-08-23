import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { exerciseLibrary } from "@/domain/training/presets";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";

const base = {
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  goal: "hypertrophy" as const,
  macrocycleGoal: "build_muscle" as const,
  experienceLevel: "intermediate" as const,
  daysPerWeek: 5 as const,
  preferredSplit: "push_pull_legs" as const,
  equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const,
  units: "kg" as const,
  exercises: exerciseLibrary,
};

function construct(priority: "balanced" | "chest") {
  const result = constructCanonicalActivePlanFromCanonicalInputs({ ...base, planId: `priority:${priority}`, trainingPriority: priority });
  expect(result.status).toBe("constructed");
  if (result.status !== "constructed") throw new Error(result.reason);
  return result.carrier;
}

function totalSets(carrier: ReturnType<typeof construct>): number {
  return carrier.plannedSessions.reduce((sum, session) => sum + (session.prescriptionSnapshot as CanonicalSessionSnapshotV3).slots
    .reduce((sessionSum, slot) => sessionSum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0), 0);
}

describe("canonical training priority", () => {
  it("creates a measurable bounded prescription difference for an otherwise identical athlete", () => {
    const balanced = construct("balanced");
    const prioritised = construct("chest");
    const prioritisedSession = prioritised.plannedSessions.find((session) => (session.prescriptionSnapshot as CanonicalSessionSnapshotV3).slots.some((slot) => slot.reason.includes("declared chest priority")));
    const prioritisedSlot = (prioritisedSession?.prescriptionSnapshot as CanonicalSessionSnapshotV3 | undefined)?.slots.find((slot) => slot.reason.includes("declared chest priority"));
    const balancedSlot = (balanced.plannedSessions.find((session) => session.planSessionIndex === prioritisedSession?.planSessionIndex)?.prescriptionSnapshot as CanonicalSessionSnapshotV3 | undefined)?.slots.find((slot) => slot.index === prioritisedSlot?.index);
    expect(prioritisedSlot).toBeDefined();
    expect((prioritisedSlot!.settings.requiredSets ?? prioritisedSlot!.settings.requiredWorkSets)).toBe((balancedSlot!.settings.requiredSets ?? balancedSlot!.settings.requiredWorkSets) + 1);
    expect(totalSets(prioritised)).toBe(totalSets(balanced));
  });

  it("persists the declared emphasis and explains it in canonical rationale", () => {
    const prioritised = construct("chest");
    expect(prioritised.constraints.trainingPriority).toBe("chest");
    expect(prioritised.planningRationale?.rotationReasons).toContain("training_priority:chest");
  });
});
