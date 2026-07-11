import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { currentMesocycleDecisionStorageKey } from "@/data/local/current-mesocycle-decision-repository";
import { applyCurrentMesocycleDecision } from "@/domain/training/current-decision-application";
import { evaluatePersistedCurrentReadinessSnapshot } from "@/domain/training/current-progression-transition-decision-writer";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import type { CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";

describe("current decision application", () => {
  beforeEach(() => { jsonStore.remove("iron-logic.active-training-plan"); jsonStore.remove("iron-logic.current-readiness-snapshot-store"); jsonStore.remove(currentMesocycleDecisionStorageKey); });
  it("applies continue once from the persisted decision and leaves legacy block state untouched", () => {
    const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "single_block", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" }, "2026-07-11T00:00:00.000Z");
    activeTrainingPlanRepository.save(plan);
    const snapshot: CurrentReadinessSnapshot = { schemaVersion: 1, id: "snapshot-app", planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: 1, createdAt: "2026-07-11T00:00:00.000Z", state: "ready", sourceFingerprint: "app-fingerprint", sourceWorkoutIds: [], sourceSessionIds: [], requiredRoles: [], completedRoles: [], unresolvedRoles: [], blockedRoles: [], approvedSuccessors: [], decisionContext: { evaluatorInput: { compatibility: "ready", microcycleState: "evaluable", completedMicrocycles: 1, mesocycle: { minimumWeeks: 1, maximumWeeks: 3, nextStates: [], successCriteria: [], failureRoute: "" }, purposeConcluded: false, currentStimulusProductive: true, fatigue: "normal", approvedSuccessors: [], approvedPrerequisites: [] }, evidence: { microcycleState: "evaluable", completedMicrocycles: 1, fatigue: "normal", minimumExposureMet: true, maximumExposureReached: false } } };
    expect(currentReadinessSnapshotRepository.save(snapshot).status).toBe("saved");
    expect(evaluatePersistedCurrentReadinessSnapshot({ snapshotId: snapshot.id, decisionId: "decision-app", createdAt: "2026-07-11T00:01:00.000Z" })).toMatchObject({ status: "saved", record: { outcome: "continue" } });
    expect(applyCurrentMesocycleDecision({ decisionId: "decision-app", planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: 1, appliedAt: "2026-07-11T00:02:00.000Z" })).toMatchObject({ status: "applied", outcome: "continue", decisionId: "decision-app", lifecycle: "applied" });
    expect(activeTrainingPlanRepository.get().currentMicrocycle?.sequenceNumber).toBe(2);
    expect(activeTrainingPlanRepository.get().activeBlockId).toBe(plan.activeBlockId);
    expect(applyCurrentMesocycleDecision({ decisionId: "decision-app", planId: plan.id, mesocycleId: plan.currentMesocycleId!, microcycleNumber: 1, appliedAt: "2026-07-11T00:03:00.000Z" })).toEqual({ status: "already_applied" });
  });
});
