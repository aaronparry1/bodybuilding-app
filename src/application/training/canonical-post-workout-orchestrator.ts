import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { produceCanonicalProgressDecision } from "@/application/training/canonical-progress-decision-production";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalCoachingOperationId, type CanonicalCoachingIdentity } from "@/domain/training/canonical-coaching-identity";
import { evaluateCanonicalPostWorkoutProgress } from "@/domain/training/canonical-progress-evaluator";
import type { CanonicalPhaseOneDecisionDetails } from "@/domain/training/canonical-progress-decision";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

export const CANONICAL_POST_WORKOUT_ORCHESTRATOR_VERSION = "canonical_post_workout_orchestrator_v1" as const;

export type CanonicalPostWorkoutOrchestrationResult = Readonly<{
  status: "applied" | "unchanged" | "blocked" | "retryable" | "rejected";
  reason: string;
  operationId?: string;
  evaluationId?: string;
  decisionId?: string;
  explanation?: string;
  priorRevision?: number;
  newRevision?: number;
}>;

/**
 * The single mounted post-workout authority. Completion is already durable
 * when this function runs; failures therefore retain the recorded workout and
 * leave the last committed future prescription untouched.
 */
export function orchestrateCanonicalPostWorkoutAdaptation(input: Readonly<{
  planId: string;
  recordedSessionId: string;
  completionEvidenceId: string;
  occurredAt: string;
}>): CanonicalPostWorkoutOrchestrationResult {
  const operationId = canonicalCoachingOperationId(input.planId, input.recordedSessionId, input.completionEvidenceId);
  const aggregate = canonicalRecordedSessionLedger.get(input.recordedSessionId);
  const completionEvidence = canonicalProgressEvidenceRepository.get(input.completionEvidenceId);
  if (aggregate.status !== "found" || aggregate.session.status !== "completed") return { status: "rejected", reason: "durable_completed_session_required", operationId };
  if (completionEvidence.status !== "found" || completionEvidence.evidence.kind !== "completion") return pending(operationId, input, "completion_evidence_unavailable");
  canonicalActivePlanState.hydrate();
  const raw = canonicalActivePlanV2Repository.get();
  const plan = canonicalActivePlanState.getReadModel();
  if (raw.status !== "saved" || !plan || raw.carrier.planId !== input.planId || plan.planId !== input.planId) return pending(operationId, input, "canonical_plan_unavailable");

  const priorAttempt = canonicalCoachingAttemptRepository.get(operationId);
  if (raw.carrier.progress.decisionReference === operationId || priorAttempt.status === "found" && (priorAttempt.attempt.status === "applied" || priorAttempt.attempt.status === "unchanged" || priorAttempt.attempt.status === "blocked")) {
    const decision = priorAttempt.status === "found" && priorAttempt.attempt.decisionId ? priorAttempt.attempt.decisionId : operationId;
    const persisted = canonicalProgressDecisionRepository.get(decision);
    const explanation = persisted.status === "found" && persisted.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      ? persisted.decision.phaseOneApplication.explanation
      : undefined;
    return {
      status: priorAttempt.status === "found" && priorAttempt.attempt.status === "blocked" ? "blocked" : "unchanged",
      reason: "post_workout_adaptation_already_resolved",
      operationId,
      decisionId: decision,
      ...(explanation ? { explanation } : {}),
    };
  }
  canonicalCoachingAttemptRepository.save({ schemaVersion: "canonical_coaching_attempt_v1", operationId, planId: input.planId, recordedSessionId: input.recordedSessionId, completionEvidenceId: input.completionEvidenceId, status: "pending", reason: "evaluation_started", evidenceState: "complete", decisionState: "pending", applicationState: "pending", retryIdentity: operationId, updatedAt: input.occurredAt });

  const mesocycle = mesocycleById(raw.carrier.mesocycle.id);
  const policy = resolveMesocyclePrescriptionPolicy(raw.carrier.mesocycle.id, { goal: raw.carrier.macrocycle.output.goal });
  if (!mesocycle || policy.status !== "resolved") return pending(operationId, input, "canonical_mesocycle_policy_unavailable");
  const facts = resolveCanonicalConstructionFacts(raw.carrier);
  const identity: CanonicalCoachingIdentity = {
    schemaVersion: "canonical_coaching_identity_v1",
    planId: raw.carrier.planId,
    planRevision: raw.carrier.revision,
    macrocycleId: raw.carrier.macrocycle.id,
    mesocycleId: raw.carrier.mesocycle.id,
    microcycleId: raw.carrier.microcycle.id,
    plannedSessionId: aggregate.session.plannedSessionId,
    recordedSessionId: aggregate.session.recordedSessionId,
    prescriptionHash: aggregate.session.prescriptionHash,
    athleteId: aggregate.session.athleteId,
  };
  const completedReferences = (raw.carrier.recordedSessionReferences ?? []).filter((reference) => reference.microcycleId === raw.carrier.microcycle.id && reference.status === "completed");
  const activeReferences = (raw.carrier.recordedSessionReferences ?? []).filter((reference) => reference.microcycleId === raw.carrier.microcycle.id && (reference.status === "started" || reference.status === "paused"));
  const microcycleComplete = raw.carrier.plannedSessions.length === 0 && activeReferences.length === 0 && completedReferences.length >= raw.carrier.microcycle.output.trainingDays;
  const completedMicrocyclesInMesocycle = Math.max(1, new Set([
    ...(raw.carrier.cycleLineage ?? []).filter((entry) => entry.mesocycleId === raw.carrier.mesocycle.id).map((entry) => entry.microcycleId),
    raw.carrier.microcycle.id,
  ]).size);
  const evaluation = evaluateCanonicalPostWorkoutProgress({
    plan,
    session: aggregate.session,
    events: aggregate.events,
    evidence: canonicalProgressEvidenceRepository.list(input.planId),
    identity,
    policy: policy.policy,
    mesocycle,
    contextAvailable: facts.status === "ready",
    completedPlannedSessionsInMicrocycle: completedReferences.length,
    completedMicrocyclesInMesocycle,
    microcycleComplete,
  });
  // The decision timestamp is part of its deterministic identity. Retries use
  // the durable completion evidence time, never the wall-clock retry time.
  const details = phaseOneDecisionDetails(evaluation, raw.carrier.plannedSessions.map((session) => session.id), completionEvidence.evidence.observedAt, operationId);
  const produced = produceCanonicalProgressDecision({
    planId: plan.planId,
    planRevision: plan.revision,
    macrocycleId: raw.carrier.macrocycle.id,
    mesocycleId: plan.mesocycle.id,
    microcycleId: plan.microcycle.id,
    evaluation,
    evidenceVersions: evaluation.evidenceVersions,
    operationId,
    phaseOne: details,
    ...(evaluation.outcome === "transition_recommended" && policy.policy.transition.approvedSuccessors[0]
      ? { requestedSuccessorMesocycleId: policy.policy.transition.approvedSuccessors[0] }
      : {}),
  });
  if (produced.status !== "produced" || !produced.decision) return pending(operationId, input, produced.reason, evaluation.evaluationId);
  canonicalCoachingAttemptRepository.save({ schemaVersion: "canonical_coaching_attempt_v1", operationId, planId: input.planId, recordedSessionId: input.recordedSessionId, completionEvidenceId: input.completionEvidenceId, status: "decision_persisted", reason: produced.reason, evaluationId: evaluation.evaluationId, decisionId: produced.decision.decisionId, evidenceState: "complete", decisionState: "persisted", applicationState: "pending", retryIdentity: operationId, updatedAt: input.occurredAt });
  const applied = canonicalActivePlanState.applyProgressDecision({
    planId: plan.planId,
    expectedPlanRevision: plan.revision,
    macrocycleId: raw.carrier.macrocycle.id,
    mesocycleId: plan.mesocycle.id,
    microcycleId: plan.microcycle.id,
    decisionId: produced.decision.decisionId,
    evaluationId: evaluation.evaluationId,
    expectedEvidenceIds: evaluation.evidenceIds,
  });
  if (applied.status === "rejected") return pending(operationId, input, applied.reason, evaluation.evaluationId, produced.decision.decisionId);
  const finalStatus = evaluation.outcome === "blocked" ? "blocked" as const : applied.status === "applied" ? "applied" as const : "unchanged" as const;
  canonicalCoachingAttemptRepository.save({ schemaVersion: "canonical_coaching_attempt_v1", operationId, planId: input.planId, recordedSessionId: input.recordedSessionId, completionEvidenceId: input.completionEvidenceId, status: finalStatus, reason: applied.reason, evaluationId: evaluation.evaluationId, decisionId: produced.decision.decisionId, evidenceState: "complete", decisionState: "persisted", applicationState: finalStatus, retryIdentity: operationId, updatedAt: input.occurredAt });
  canonicalActivePlanState.hydrate();
  const committed = canonicalProgressDecisionRepository.get(produced.decision.decisionId);
  const explanation = committed.status === "found" && committed.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
    ? committed.decision.phaseOneApplication.explanation
    : evaluation.explanation;
  return { status: finalStatus, reason: applied.reason, operationId, evaluationId: evaluation.evaluationId, decisionId: produced.decision.decisionId, explanation, priorRevision: applied.priorRevision, newRevision: applied.newRevision };
}

function phaseOneDecisionDetails(
  evaluation: ReturnType<typeof evaluateCanonicalPostWorkoutProgress>,
  priorFutureSessionIds: readonly string[],
  decidedAt: string,
  idempotencyKey: string,
): CanonicalPhaseOneDecisionDetails {
  const decisionType = evaluation.outcome === "transition_recommended" ? "transition" : evaluation.outcome;
  const kind = decisionType === "establish_calibration" ? "establish_observed_calibration"
    : decisionType === "recalibrate" ? "require_recalibration"
      : decisionType === "advance_microcycle" ? "construct_next_microcycle"
        : decisionType === "transition" ? "construct_approved_successor"
          : decisionType === "maintain" ? "retain_prescription" : "none";
  return {
    schemaVersion: "canonical_coaching_decision_details_v1",
    decisionType,
    sourceRecordedSessionId: evaluation.recordedSessionId,
    sourcePrescriptionHash: evaluation.prescriptionHash,
    reasonCodes: evaluation.reasonCodes,
    evidenceSummary: {
      targetCompletion: evaluation.targetCompletion,
      comparableExposureCount: evaluation.comparableExposureCount,
      repDropOff: evaluation.repDropOff,
      recoveryEvidence: evaluation.recoveryEvidence,
      transitionEligible: evaluation.transitionEligible,
      deloadEligible: evaluation.deloadEligible,
    },
    priorFutureSessionIds: [...priorFutureSessionIds].sort(),
    result: decisionType === "blocked" ? "blocked_no_change" : decisionType === "maintain" ? "explicit_no_change" : "future_prescription_change",
    boundedAdjustment: { kind, exerciseIds: [...evaluation.affectedExerciseIds].sort(), numericLoadAdjustmentAuthorised: false },
    ...(evaluation.boundaryResolution ? { boundaryResolution: evaluation.boundaryResolution } : {}),
    contextIdentity: { macrocycleId: evaluation.macrocycleId, mesocycleId: evaluation.mesocycleId, microcycleId: evaluation.microcycleId },
    decidedAt,
    idempotencyKey,
  };
}

function pending(
  operationId: string,
  input: Readonly<{ planId: string; recordedSessionId: string; completionEvidenceId: string; occurredAt: string }>,
  reason: string,
  evaluationId?: string,
  decisionId?: string,
): CanonicalPostWorkoutOrchestrationResult {
  canonicalCoachingAttemptRepository.save({ schemaVersion: "canonical_coaching_attempt_v1", operationId, planId: input.planId, recordedSessionId: input.recordedSessionId, completionEvidenceId: input.completionEvidenceId, status: "pending", reason, ...(evaluationId ? { evaluationId } : {}), ...(decisionId ? { decisionId } : {}), updatedAt: input.occurredAt });
  return { status: "retryable", reason, operationId, ...(evaluationId ? { evaluationId } : {}), ...(decisionId ? { decisionId } : {}) };
}
