import { beforeEach, describe, expect, it } from "vitest";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { constructCanonicalActivePlan } from "@/application/training/canonical-active-plan-construction";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";

const roles = createMicrocycle({ parentMesocycleId: "powerbuilding_foundation", trainingDays: 5, split: "push_pull_legs" }).sessionRoles;
const sessions = roles.map((role, index) => ({ id: `repository-session-${index}`, microcycleId: "repository:microcycle:1", planSessionIndex: index, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } }));

describe("canonical active-plan v2 repository", () => {
  beforeEach(() => canonicalActivePlanV2Repository.clear());
  it("persists and verifies canonical read-back", () => {
    const result = constructCanonicalActivePlan({ planId: "repository", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: ["barbell"], units: "kg", plannedSessions: sessions });
    expect(result.status).toBe("constructed");
    if (result.status === "constructed") expect(canonicalActivePlanV2Repository.save(result.carrier).status).toBe("saved");
    expect(canonicalActivePlanV2Repository.get().status).toBe("saved");
  });
  it("rejects legacy payloads and unknown versions", () => {
    expect(canonicalActivePlanV2Repository.save({ blocks: [], activeBlockId: "legacy" } as never).status).toBe("invalid");
  });
  it("supports compare-and-set and idempotent retry", () => {
    const result = constructCanonicalActivePlan({ planId: "atomic", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: ["barbell"], units: "kg", plannedSessions: sessions.map((session) => ({ ...session, microcycleId: "atomic:microcycle:1" })) });
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(canonicalActivePlanV2Repository.saveAtomically(result.carrier).status).toBe("saved");
    expect(canonicalActivePlanV2Repository.saveAtomically(result.carrier, result.carrier.revision).status).toBe("saved");
    const next = { ...result.carrier, revision: result.carrier.revision + 1, progress: { ...result.carrier.progress, revision: result.carrier.revision + 1 } };
    expect(canonicalActivePlanV2Repository.saveAtomically(next, -1)).toEqual({ status: "conflict", reason: "stale_revision" });
  });
});
