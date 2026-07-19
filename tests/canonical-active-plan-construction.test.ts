import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlan } from "@/application/training/canonical-active-plan-construction";

const sessions = ["Upper strength and hypertrophy", "Lower strength and hypertrophy", "Upper strength and hypertrophy", "Lower strength and hypertrophy", "Full body powerbuilding E"].map((role, index) => ({ id: `construction-session-${index}`, microcycleId: "construction:microcycle:1", planSessionIndex: index, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } }));

describe("canonical active-plan construction and repository", () => {
  it("constructs from Macrocycle, Mesocycle and Microcycle owners", () => {
    const result = constructCanonicalActivePlan({ planId: "construction", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell"], units: "kg", plannedSessions: sessions });
    expect(result.status).toBe("constructed");
    if (result.status === "constructed") {
      expect(result.carrier.schema).toBe("canonical_plan_v2");
    }
  });
  it("fails closed before persistence when required equipment is missing", () => {
    const result = constructCanonicalActivePlan({ planId: "invalid", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "upper_lower", equipment: [], units: "kg", plannedSessions: sessions });
    expect(result.status).toBe("invalid_input");
  });
});
