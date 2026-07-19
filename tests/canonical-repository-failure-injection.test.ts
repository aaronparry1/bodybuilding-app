import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlan } from "@/application/training/canonical-active-plan-construction";
import { createCanonicalActivePlanV2Repository, type CanonicalOpaqueStorage } from "@/data/local/canonical-active-plan-v2-repository";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";

const roles = createMicrocycle({ parentMesocycleId: "powerbuilding_foundation", trainingDays: 5, split: "upper_lower" }).sessionRoles;
const sessions = roles.map((role, index) => ({ id: `fault-session-${index}`, microcycleId: "fault:microcycle:1", planSessionIndex: index, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } }));
function carrier() {
  const result = constructCanonicalActivePlan({ planId: "fault", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", plannedSessions: sessions });
  if (result.status !== "constructed") throw new Error(result.reason);
  return result.carrier;
}
function storage(state: string | null, mode: "ok" | "read" | "write" | "partial" = "ok"): CanonicalOpaqueStorage {
  let value = state;
  return { read() { if (mode === "read") throw new Error("read"); return value; }, write(next) { if (mode === "write") throw new Error("write"); value = mode === "partial" ? next.slice(0, 5) : next; }, remove() { value = null; } };
}

describe("canonical repository fault injection", () => {
  it("contains read and write failures without a committed candidate", () => {
    const candidate = carrier();
    expect(createCanonicalActivePlanV2Repository(storage(null, "read")).saveAtomically(candidate)).toEqual({ status: "invalid", reason: "storage_read_failed" });
    expect(createCanonicalActivePlanV2Repository(storage(null, "write")).saveAtomically(candidate)).toEqual({ status: "invalid", reason: "write" });
  });
  it("rejects truncated read-back and preserves the previous valid record", () => {
    const candidate = carrier();
    const backing = storage(null);
    const repository = createCanonicalActivePlanV2Repository(backing);
    expect(repository.saveAtomically(candidate).status).toBe("saved");
    const partial = storage(JSON.stringify(candidate), "partial");
    const failing = createCanonicalActivePlanV2Repository(partial);
    const next = { ...candidate, revision: 1, updatedAt: "2026-01-02T00:00:00.000Z", progress: { ...candidate.progress, revision: 1 } };
    expect(failing.saveAtomically(next, 0).status).toBe("invalid");
  });
});
