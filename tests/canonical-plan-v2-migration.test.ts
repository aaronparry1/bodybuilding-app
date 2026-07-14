import { describe, expect, it } from "vitest";
import { migrateCanonicalPlanV1ToV2 } from "@/application/training/canonical-plan-v2-migration";

const sessions = ["Bench and hypertrophy", "Squat and hypertrophy", "Deadlift and back", "Upper support", "Lower support"].map((role, index) => ({ id: `migration-session-${index}`, microcycleId: "legacy-id:microcycle:1", planSessionIndex: index, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } }));
const canonicalInputs = { goal: "strength_hypertrophy" as const, macrocycleGoal: "build_muscle_and_strength" as const, experienceLevel: "intermediate" as const, daysPerWeek: 5 as const, preferredSplit: "upper_lower" as const, equipment: ["barbell" as const], units: "kg" as const };

describe("canonical v1 to v2 migration", () => {
  it("preserves identity while omitting legacy block authority", () => {
    const result = migrateCanonicalPlanV1ToV2({ source: { schemaVersion: "canonical_plan_v1", id: "legacy-id", createdAt: "2026-01-01T00:00:00.000Z", blocks: [{ id: "legacy-block" }], activeBlockId: "legacy-block" }, canonicalInputs, plannedSessions: sessions });
    expect(result.status).toBe("migrated");
    if (result.status === "migrated") {
      expect(result.carrier.planId).toBe("legacy-id");
      expect(result.carrier).not.toHaveProperty("blocks");
      expect(result.carrier).not.toHaveProperty("activeBlockId");
    }
  });
  it("fails closed without canonical inputs", () => {
    expect(migrateCanonicalPlanV1ToV2({ source: { schemaVersion: "canonical_plan_v1", id: "x", createdAt: "2026-01-01T00:00:00.000Z" }, canonicalInputs: undefined as never, plannedSessions: [] }).status).toBe("recoverable_failure");
  });
});
