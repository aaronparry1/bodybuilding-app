import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { currentMesocycleDecisionStorageKey } from "@/data/local/current-mesocycle-decision-repository";
import { evaluatePersistedCurrentReadinessSnapshot } from "@/domain/training/current-progression-transition-decision-writer";
import type { CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";

const snapshot = (id = "snapshot-1"): CurrentReadinessSnapshot => ({ schemaVersion: 1, id, planId: "plan-c3", mesocycleId: "hypertrophy_calibration", microcycleNumber: 1, createdAt: "2026-07-11T10:00:00.000Z", state: "ready", sourceFingerprint: `fp-${id}`, sourceWorkoutIds: [], sourceSessionIds: [], requiredRoles: [], completedRoles: [], unresolvedRoles: [], blockedRoles: [], approvedSuccessors: ["hypertrophy_base"], decisionContext: { evaluatorInput: { compatibility: "ready", microcycleState: "evaluable", completedMicrocycles: 2, mesocycle: { minimumWeeks: 1, maximumWeeks: 3, nextStates: ["hypertrophy_base"], successCriteria: [], failureRoute: "" }, purposeConcluded: false, currentStimulusProductive: true, fatigue: "normal", approvedSuccessors: ["hypertrophy_base"], approvedPrerequisites: [] }, evidence: { microcycleState: "evaluable", completedMicrocycles: 2, fatigue: "normal", minimumExposureMet: true, maximumExposureReached: false } } });

describe("current readiness production writer", () => {
  beforeEach(() => { jsonStore.remove("iron-logic.current-readiness-snapshot-store"); jsonStore.remove(currentMesocycleDecisionStorageKey); });
  it("requires a persisted current snapshot, records its identity, and is idempotent", () => {
    expect(evaluatePersistedCurrentReadinessSnapshot({ snapshotId: "missing", decisionId: "d", createdAt: "2026-07-11T10:00:00.000Z" })).toEqual({ status: "snapshot_missing" });
    expect(currentReadinessSnapshotRepository.save(snapshot()).status).toBe("saved");
    const first = evaluatePersistedCurrentReadinessSnapshot({ snapshotId: "snapshot-1", decisionId: "decision-1", createdAt: "2026-07-11T10:01:00.000Z" });
    expect(first).toMatchObject({ status: "saved", record: { readinessSnapshotId: "snapshot-1", outcome: "continue" } });
    expect(evaluatePersistedCurrentReadinessSnapshot({ snapshotId: "snapshot-1", decisionId: "decision-2", createdAt: "2026-07-11T10:02:00.000Z" })).toMatchObject({ status: "existing_decision", record: { id: "decision-1" } });
  });
});
