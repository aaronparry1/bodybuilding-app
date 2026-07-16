import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { exerciseLibrary } from "@/domain/training/presets";
import { constructCanonicalSession } from "@/domain/training/canonical-session-construction-pipeline";

function plan() {
  const result = constructCanonicalActivePlanFromCanonicalInputs({
    planId: "planned-workout-canonical",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "intermediate",
    daysPerWeek: 4,
    preferredSplit: "upper_lower",
    equipment: ["barbell", "dumbbell", "bodyweight"],
    units: "kg",
    exercises: exerciseLibrary,
  });
  expect(result.status).toBe("constructed");
  if (result.status !== "constructed") throw new Error(result.reason);
  return result.carrier;
}

describe("canonical planned-session construction boundary", () => {
  it("constructs deterministic planned session identities and immutable prescriptions", () => {
    const first = plan();
    const second = plan();
    expect(first.plannedSessions.map((session) => session.id)).toEqual(second.plannedSessions.map((session) => session.id));
    expect(first.plannedSessions[0]?.prescriptionSnapshot).toEqual(second.plannedSessions[0]?.prescriptionSnapshot);
    expect(first.plannedSessions[0]?.prescriptionSnapshot).toBeDefined();
  });

  it("preserves canonical ordering and role ownership", () => {
    const carrier = plan();
    expect(carrier.plannedSessions.map((session) => session.planSessionIndex)).toEqual([0, 1, 2, 3]);
    expect(carrier.plannedSessions.every((session) => session.kind === "planned")).toBe(true);
    expect(carrier.microcycle.output.sessionRoles).toContain(carrier.plannedSessions[0]!.role);
  });

  it("fails closed for malformed canonical construction input", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
      goal: "hypertrophy",
      macrocycleGoal: "build_muscle",
      experienceLevel: "intermediate",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      equipment: ["barbell"],
      units: "kg",
      exercises: exerciseLibrary,
    });
    expect(result.status).toBe("invalid_input");
  });

  it("constructs a session from canonical facts without legacy workout shapes", () => {
    const carrier = plan();
    const snapshot = carrier.plannedSessions[0]!.prescriptionSnapshot;
    expect(snapshot.schemaVersion).toBe("canonical_session_snapshot_v3");
    expect(snapshot).not.toHaveProperty("blocks");
    expect(snapshot).not.toHaveProperty("activeBlockId");
    expect(constructCanonicalSession).toBeTypeOf("function");
  });
});
