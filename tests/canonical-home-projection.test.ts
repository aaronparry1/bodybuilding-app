import { describe, expect, it } from "vitest";
import { projectCanonicalHome } from "@/application/training/canonical-home-projection";

describe("canonical Home projection", () => {
  it("is pure and emits canonical navigation actions", () => {
    const model = { schemaVersion: "canonical_active_plan_read_model_v1" as const, planId: "p", revision: 2, macrocycle: { goal: "hypertrophy", rolling: true }, mesocycle: { id: "m", position: 0, purpose: "accumulate" }, microcycle: { id: "mi", sequenceNumber: 1, trainingDays: 2, sessionRoles: ["a"] }, plannedSessions: [], nextSession: { id: "s", role: "a" }, progress: { evidenceVersion: "v1", revision: 2 } };
    const result = projectCanonicalHome({ status: "ready", model });
    expect(result.actions[0]).toEqual({ type: "open_planned_session", planId: "p", planRevision: 2, sessionId: "s" });
    expect(JSON.stringify(result)).not.toContain("blocks");
  });
});
