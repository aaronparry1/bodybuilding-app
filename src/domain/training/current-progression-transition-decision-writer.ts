import {
  currentMesocycleDecisionRepository,
  type CurrentDecisionSaveResult,
} from "@/data/local/current-mesocycle-decision-repository";
import {
  decideMesocycleTransition,
  type MesocycleDecisionInput,
} from "@/domain/training/current-progression-transition-decision";
import {
  createCurrentMesocycleDecisionRecord,
  type CurrentMesocycleDecisionRecord,
} from "@/domain/training/current-progression-transition-decision-record";
import type { MesocycleId } from "@/domain/training/mesocycle-library";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";

export type PersistMesocycleDecisionInput = MesocycleDecisionInput & {
  planId: string;
  mesocycleId: MesocycleId;
  microcycleNumber: number;
  id: string;
  createdAt: string;
};

/** The only normal writer for current decisions. Stage 2 consumers read its record. */
export function evaluateAndPersistMesocycleDecision(
  input: PersistMesocycleDecisionInput,
): CurrentDecisionSaveResult {
  const decision = decideMesocycleTransition(input);
  const record = createCurrentMesocycleDecisionRecord({
    id: input.id,
    planId: input.planId,
    mesocycleId: input.mesocycleId,
    microcycleNumber: input.microcycleNumber,
    createdAt: input.createdAt,
    decision,
    evidence: {
      microcycleState: input.microcycleState,
      completedMicrocycles: input.completedMicrocycles,
      fatigue: input.fatigue,
      minimumExposureMet: input.completedMicrocycles >= input.mesocycle.minimumWeeks,
      maximumExposureReached: input.completedMicrocycles >= input.mesocycle.maximumWeeks,
    },
  });
  return currentMesocycleDecisionRepository.save(record);
}

/** Normal production boundary: a decision is evaluated only from a persisted, current readiness snapshot. */
export function evaluatePersistedCurrentReadinessSnapshot(input: Readonly<{ snapshotId: string; decisionId: string; createdAt: string }>): CurrentDecisionSaveResult | { status: "snapshot_missing" | "stale_snapshot" | "snapshot_not_evaluable" | "existing_decision"; record?: CurrentMesocycleDecisionRecord } {
  const loaded = currentReadinessSnapshotRepository.get(input.snapshotId);
  if (loaded.status !== "found") return { status: "snapshot_missing" };
  const snapshot = loaded.snapshot;
  const current = currentReadinessSnapshotRepository.current(snapshot.planId, snapshot.mesocycleId, snapshot.microcycleNumber);
  if (current.status !== "found" || current.snapshot.id !== snapshot.id) return { status: "stale_snapshot" };
  if (!snapshot.decisionContext) return { status: "snapshot_not_evaluable" };
  const existing = currentMesocycleDecisionRepository.get(snapshot.planId);
  if (existing.status === "ready" && existing.record.readinessSnapshotId === snapshot.id) return { status: "existing_decision", record: existing.record };
  const decision = decideMesocycleTransition(snapshot.decisionContext.evaluatorInput);
  return currentMesocycleDecisionRepository.save(createCurrentMesocycleDecisionRecord({
    id: input.decisionId,
    planId: snapshot.planId,
    mesocycleId: snapshot.mesocycleId,
    microcycleNumber: snapshot.microcycleNumber,
    createdAt: input.createdAt,
    readinessSnapshotId: snapshot.id,
    decision,
    evidence: snapshot.decisionContext.evidence,
  }));
}

export function markCurrentMesocycleDecisionApplied(
  record: CurrentMesocycleDecisionRecord,
  appliedAt: string,
): CurrentDecisionSaveResult {
  return currentMesocycleDecisionRepository.save({
    ...record,
    lifecycle: "applied",
    appliedAt,
  });
}
