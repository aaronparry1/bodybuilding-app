import { mesocycleById, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy, type MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { MacrocycleEngineId } from "@/domain/training/macrocycle-engine";

export type CanonicalMesocycleSuccessorCommand = Readonly<{ macrocycleId: string; macrocycleEngine: MacrocycleEngineId; currentMesocycleId: MesocycleId; decisionId: string; evaluationId: string; evidenceIds: readonly string[]; outcome: "transition" | "deload"; successorMesocycleId?: MesocycleId; sequenceNumber: number; planRevision: number }>;
export type CanonicalMesocycleSuccessorResult = Readonly<{ status: "resolved"; predecessorMesocycleId: MesocycleId; successorMesocycleId: MesocycleId; predecessorPurpose: string; successorPurpose: string; successor: MesocycleSpec; policy: MesocyclePrescriptionPolicy; approvedFutureSuccessors: readonly MesocycleId[]; decisionId: string; evaluationId: string; evidenceIds: readonly string[]; sequenceNumber: number; planRevision: number }> | Readonly<{ status: "rejected"; reason: "unknown_predecessor" | "unknown_successor" | "successor_not_approved" | "macrocycle_mismatch" | "missing_deload_successor" | "invalid_successor_policy" | "invalid_sequence" }>;

export function resolveCanonicalMesocycleSuccessor(command: CanonicalMesocycleSuccessorCommand): CanonicalMesocycleSuccessorResult {
  if (!Number.isInteger(command.sequenceNumber) || command.sequenceNumber < 1 || command.planRevision < 0) return { status: "rejected", reason: "invalid_sequence" };
  const predecessor = mesocycleById(command.currentMesocycleId);
  if (!predecessor) return { status: "rejected", reason: "unknown_predecessor" };
  if (predecessor.engine !== command.macrocycleEngine) return { status: "rejected", reason: "macrocycle_mismatch" };
  const successorId = command.outcome === "transition" ? command.successorMesocycleId : canonicalDeloadSuccessor(predecessor);
  if (!successorId) return { status: "rejected", reason: "missing_deload_successor" };
  if (!predecessor.nextStates.includes(successorId)) return { status: "rejected", reason: "successor_not_approved" };
  const successor = mesocycleById(successorId);
  if (!successor) return { status: "rejected", reason: "unknown_successor" };
  if (successor.engine !== command.macrocycleEngine) return { status: "rejected", reason: "macrocycle_mismatch" };
  const policy = resolveMesocyclePrescriptionPolicy(successor.id, { goal: macrocycleGoalForEngine(command.macrocycleEngine) });
  if (policy.status !== "resolved") return { status: "rejected", reason: "invalid_successor_policy" };
  return { status: "resolved", predecessorMesocycleId: predecessor.id, successorMesocycleId: successor.id, predecessorPurpose: predecessor.adaptation, successorPurpose: successor.adaptation, successor, policy: policy.policy, approvedFutureSuccessors: [...successor.nextStates], decisionId: command.decisionId, evaluationId: command.evaluationId, evidenceIds: [...command.evidenceIds], sequenceNumber: command.sequenceNumber, planRevision: command.planRevision };
}

function canonicalDeloadSuccessor(predecessor: MesocycleSpec): MesocycleId | undefined {
  return predecessor.nextStates.find((id) => id.endsWith("_consolidation") || id.endsWith("_transition") || id.endsWith("_taper"));
}

function macrocycleGoalForEngine(engine: MacrocycleEngineId): "build_muscle" | "build_muscle_and_strength" | "build_strength" | "athletic_performance" {
  return engine === "hypertrophy" ? "build_muscle" : engine === "powerbuilding" ? "build_muscle_and_strength" : engine === "strength" ? "build_strength" : "athletic_performance";
}
