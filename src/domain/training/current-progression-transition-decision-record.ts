import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type {
  MesocycleDecision,
  MesocycleDecisionInput,
} from "@/domain/training/current-progression-transition-decision";

export const CURRENT_MESOCYCLE_DECISION_SCHEMA = 1 as const;
export type DecisionLifecycle = "proposed" | "ready" | "applied" | "superseded";
export type DecisionEvidenceSummary = Pick<
  MesocycleDecisionInput,
  "microcycleState" | "completedMicrocycles" | "fatigue"
> & {
  minimumExposureMet: boolean;
  maximumExposureReached: boolean;
};

export type CurrentMesocycleDecisionRecord = {
  schemaVersion: typeof CURRENT_MESOCYCLE_DECISION_SCHEMA;
  id: string;
  planId: string;
  mesocycleId: MesocycleId;
  microcycleNumber: number;
  lifecycle: DecisionLifecycle;
  createdAt: string;
  appliedAt?: string;
  evidence: DecisionEvidenceSummary;
} & MesocycleDecision;

export function createCurrentMesocycleDecisionRecord(input: {
  id: string;
  planId: string;
  mesocycleId: MesocycleId;
  microcycleNumber: number;
  createdAt: string;
  decision: MesocycleDecision;
  evidence: DecisionEvidenceSummary;
}): CurrentMesocycleDecisionRecord {
  return {
    schemaVersion: CURRENT_MESOCYCLE_DECISION_SCHEMA,
    id: input.id,
    planId: input.planId,
    mesocycleId: input.mesocycleId,
    microcycleNumber: input.microcycleNumber,
    createdAt: input.createdAt,
    lifecycle:
      input.decision.outcome === "delay" || input.decision.outcome === "review_required"
        ? "proposed"
        : "ready",
    evidence: input.evidence,
    ...input.decision,
  };
}
