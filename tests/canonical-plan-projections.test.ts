import { describe, expect, it } from "vitest";
import { projectCanonicalPlan } from "@/application/training/canonical-plan-projections";

describe("canonical plan projections", () => {
  it("exposes canonical planning concepts without legacy fields", () => {
    const projection = projectCanonicalPlan({
      schemaVersion: "canonical_active_plan_read_model_v1", planId: "plan", revision: 1, equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
      macrocycle: { goal: "hypertrophy", rolling: true }, mesocycle: { id: "m", position: 0, purpose: "accumulate" },
      microcycle: { id: "micro", sequenceNumber: 1, trainingDays: 2, sessionRoles: ["Full body 1", "Full body 2"] },
      plannedSessions: [{ id: "s1", microcycleId: "micro", role: "Full body 1", planSessionIndex: 0, status: "planned", constructionVersion: "canonical_plan_v2", revision: 0, snapshot: { exactTargets: { min: 8, max: 12 } } }],
      nextSession: { id: "s1", role: "Full body 1" }, progress: { evidenceVersion: "progress_v1", revision: 0 },
    });
    expect(projection.microcycle.trainingDays).toBe(2);
    expect(projection.plannedSessions[0]?.status).toBe("planned");
    expect(JSON.stringify(projection)).not.toMatch(/blocks|activeBlockId|blockType|trainingYear/);
  });
});
