import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveCurrentProgressContext, resolveCurrentVolumeContext } from "@/domain/training/current-progress-context";
import type { CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";

describe("current Progress and volume context", () => {
  beforeEach(() => { jsonStore.remove("iron-logic.active-training-plan"); jsonStore.remove("iron-logic.current-readiness-snapshot-store"); jsonStore.remove("iron-logic.current-mesocycle-decisions"); });
  it("uses a current snapshot and does not reconstruct state from active block metadata", () => {
    const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "single_block", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" }, "2026-07-11T00:00:00.000Z");
    activeTrainingPlanRepository.save({ ...plan, activeBlockId: "conflicting-legacy-block" });
    const snapshot: CurrentReadinessSnapshot = { schemaVersion: 1, id: "snapshot-progress", planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: 1, createdAt: "2026-07-11T00:00:00.000Z", state: "in_progress", sourceFingerprint: "progress", sourceWorkoutIds: [], sourceSessionIds: [], requiredRoles: [], completedRoles: [], unresolvedRoles: [], blockedRoles: [], approvedSuccessors: [] };
    expect(currentReadinessSnapshotRepository.save(snapshot).status).toBe("saved");
    expect(resolveCurrentProgressContext()).toMatchObject({ status: "in_progress", snapshotId: "snapshot-progress" });
    expect(resolveCurrentVolumeContext()).toMatchObject({ status: "in_progress" });
  });

  it.each(["insufficient_evidence", "insufficient_policy", "blocked", "disrupted"] as const)("preserves the explicit %s snapshot state without writes", (state) => {
    const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "single_block", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" }, "2026-07-12T00:00:00.000Z");
    activeTrainingPlanRepository.save(plan);
    const snapshot: CurrentReadinessSnapshot = { schemaVersion: 1, id: `snapshot-${state}`, planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: 1, createdAt: "2026-07-12T00:00:00.000Z", state, sourceFingerprint: state, sourceWorkoutIds: [], sourceSessionIds: [], requiredRoles: [], completedRoles: [], unresolvedRoles: [], blockedRoles: [], approvedSuccessors: [] };
    expect(currentReadinessSnapshotRepository.save(snapshot).status).toBe("saved");
    expect(resolveCurrentProgressContext()).toMatchObject({ status: state, snapshotId: snapshot.id });
  });
});
