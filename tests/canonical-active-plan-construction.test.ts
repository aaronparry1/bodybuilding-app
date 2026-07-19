import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlan } from "@/application/training/canonical-active-plan-construction";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";

const roles = createMicrocycle({ parentMesocycleId: "powerbuilding_foundation", trainingDays: 5, split: "push_pull_legs" }).sessionRoles;
const sessions = roles.map((role, index) => ({ id: `construction-session-${index}`, microcycleId: "construction:microcycle:1", planSessionIndex: index, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } }));

describe("canonical active-plan construction and repository", () => {
  it("constructs from Macrocycle, Mesocycle and Microcycle owners", () => {
    const result = constructCanonicalActivePlan({ planId: "construction", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: ["barbell", "dumbbell"], units: "kg", plannedSessions: sessions });
    expect(result.status).toBe("constructed");
    if (result.status === "constructed") {
      expect(result.carrier.schema).toBe("canonical_plan_v2");
    }
  });
  it("fails closed before persistence when required equipment is missing", () => {
    const result = constructCanonicalActivePlan({ planId: "invalid", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: [], units: "kg", plannedSessions: sessions });
    expect(result.status).toBe("invalid_input");
  });
});
