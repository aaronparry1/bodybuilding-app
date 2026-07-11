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
