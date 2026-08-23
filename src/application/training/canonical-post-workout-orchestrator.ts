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
import { canonicalDeterministicFingerprint, canonicalDeterministicFingerprintId } from "@/domain/training/canonical-deterministic-fingerprint";
import type { CanonicalPostWorkoutEvaluation } from "@/domain/training/canonical-progress-evaluator";
import type { CanonicalNumericPrescriptionDecision } from "@/domain/training/canonical-comparable-exposure-policy";
import { adaptationAuditFromNumericDecisions } from "@/domain/training/canonical-adaptation-audit";
import { evaluateCanonicalAdaptationOutcome } from "@/domain/training/canonical-adaptation-outcome";
import { canonicalAdaptationOutcomeRepository } from "@/data/local/canonical-adaptation-outcome-repository";
import { stabilizeCanonicalNumericDecisions } from "@/domain/training/canonical-adaptation-stability";

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
  if (priorAttempt.status === "found"
    && (priorAttempt.attempt.status === "decision_persisted" || priorAttempt.attempt.status === "pending")
    && priorAttempt.attempt.reason !== "boundary_resolution_event_detected"
    && priorAttempt.attempt.decisionId) {
    const persisted = canonicalProgressDecisionRepository.get(priorAttempt.attempt.decisionId);
    if (persisted.status !== "found") return pending(operationId, input, "persisted_decision_unavailable", priorAttempt.attempt.evaluationId, priorAttempt.attempt.decisionId);
    const applied = canonicalActivePlanState.applyProgressDecision({
      planId: persisted.decision.planId,
      expectedPlanRevision: persisted.decision.expectedPlanRevision,
      macrocycleId: persisted.decision.macrocycleId,
      mesocycleId: persisted.decision.mesocycleId,
      microcycleId: persisted.decision.microcycleId,
      decisionId: persisted.decision.decisionId,
      evaluationId: persisted.decision.evaluationId,
      expectedEvidenceIds: persisted.decision.evidenceIds,
    });
    if (applied.status === "rejected") {
      if (isTerminalApplicationReconciliation(applied.reason)) return terminalApplicationBlock(operationId, input, persisted.decision, applied.reason);
      return pending(operationId, input, applied.reason, persisted.decision.evaluationId, persisted.decision.decisionId);
    }
    return finalizeAttempt(operationId, input, persisted.decision, applied);
  }
  if (priorAttempt.status === "found" && (priorAttempt.attempt.status === "applied" || priorAttempt.attempt.status === "unchanged" || priorAttempt.attempt.status === "blocked")) {
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

  // Close earlier adaptation loops before making the next decision. Outcomes
  // are immutable and idempotent, so replay/restart cannot double-apply them.
  const allEvidence = canonicalProgressEvidenceRepository.list(input.planId);
  for (const priorDecision of canonicalProgressDecisionRepository.list(input.planId)) {
    if (canonicalAdaptationOutcomeRepository.get(priorDecision.decisionId).status === "found") continue;
    const outcome = evaluateCanonicalAdaptationOutcome({ decision: priorDecision, evidence: allEvidence });
    if (outcome) canonicalAdaptationOutcomeRepository.save(outcome);
  }

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
  const evaluated = evaluateCanonicalPostWorkoutProgress({
    plan,
    session: aggregate.session,
    events: aggregate.events,
    evidence: allEvidence,
    identity,
    policy: policy.policy,
    mesocycle,
    contextAvailable: facts.status === "ready",
    completedPlannedSessionsInMicrocycle: completedReferences.length,
    completedMicrocyclesInMesocycle,
    microcycleComplete,
  });
  const stabilizedNumericDecisions = stabilizeCanonicalNumericDecisions(evaluated.numericDecisions, canonicalProgressDecisionRepository.list(input.planId));
  const stabilityHeld = stabilizedNumericDecisions.some((item, index) => item.reasonCode !== evaluated.numericDecisions[index]?.reasonCode);
  const currentEvaluation = stabilityHeld ? {
    ...evaluated,
    numericDecisions: stabilizedNumericDecisions,
    affectedExerciseIds: evaluated.affectedExerciseIds.filter((exerciseId) => stabilizedNumericDecisions.some((item) => item.exerciseId === exerciseId && item.after)),
    reasonCodes: [...evaluated.reasonCodes, "numeric_oscillation_hysteresis_applied"],
    explanation: "The latest evidence points in the opposite direction to the last adjustment. The prescription is held for one more comparable evidence window to avoid oscillation.",
  } : evaluated;
  const evaluation = includePendingMicrocycleNumericDecisions(currentEvaluation, aggregate.session.version);
  const decisionIdentity = priorAttempt.status === "found"
    && priorAttempt.attempt.reason === "boundary_resolution_event_detected"
    ? `${operationId}:review:${canonicalDeterministicFingerprintId({
      evidence: canonicalProgressEvidenceRepository.list(input.planId),
      revision: raw.carrier.revision,
      mesocycleId: raw.carrier.mesocycle.id,
      microcycleId: raw.carrier.microcycle.id,
    })}`
    : operationId;
  // The decision timestamp is part of its deterministic identity. Retries use
  // the durable completion evidence time, never the wall-clock retry time.
  const details = phaseOneDecisionDetails(evaluation, raw.carrier.plannedSessions.map((session) => session.id), completionEvidence.evidence.observedAt, decisionIdentity, aggregate.session.athleteId);
  const produced = produceCanonicalProgressDecision({
    planId: plan.planId,
    planRevision: plan.revision,
    macrocycleId: raw.carrier.macrocycle.id,
    mesocycleId: plan.mesocycle.id,
    microcycleId: plan.microcycle.id,
    evaluation,
    evidenceVersions: evaluation.evidenceVersions,
    operationId: decisionIdentity,
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
  if (applied.status === "rejected") {
    if (isTerminalApplicationReconciliation(applied.reason)) return terminalApplicationBlock(operationId, input, produced.decision, applied.reason);
    return pending(operationId, input, applied.reason, evaluation.evaluationId, produced.decision.decisionId);
  }
  const finalStatus = applied.receiptStatus === "blocked" || evaluation.outcome === "blocked" ? "blocked" as const : applied.receiptStatus === "applied" || applied.status === "applied" ? "applied" as const : "unchanged" as const;
  canonicalCoachingAttemptRepository.save({ schemaVersion: "canonical_coaching_attempt_v1", operationId, planId: input.planId, recordedSessionId: input.recordedSessionId, completionEvidenceId: input.completionEvidenceId, status: finalStatus, reason: applied.reason, evaluationId: evaluation.evaluationId, decisionId: produced.decision.decisionId, evidenceState: "complete", decisionState: "persisted", applicationState: finalStatus, retryIdentity: operationId, ...boundaryAttemptFields(produced.decision.decisionId, input.planId), updatedAt: input.occurredAt });
  canonicalActivePlanState.hydrate();
  const committed = canonicalProgressDecisionRepository.get(produced.decision.decisionId);
  const explanation = committed.status === "found" && committed.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
    ? committed.decision.phaseOneApplication.explanation
    : evaluation.explanation;
  return { status: finalStatus, reason: applied.reason, operationId, evaluationId: evaluation.evaluationId, decisionId: produced.decision.decisionId, explanation, priorRevision: applied.priorRevision, newRevision: applied.newRevision };
}

/**
 * Numeric intent from an earlier session in the same Microcycle is durable in
 * its persisted coaching decision. At the final session boundary, this
 * coordinator carries only those already-evaluated intents into the one
 * existing application authority. It does not reevaluate performance.
 */
function includePendingMicrocycleNumericDecisions(
  evaluation: CanonicalPostWorkoutEvaluation,
  recordedSessionVersion: number,
): CanonicalPostWorkoutEvaluation {
  if (evaluation.outcome !== "advance_microcycle") return evaluation;
  const prior = canonicalProgressDecisionRepository.list(evaluation.planId)
    .filter((decision) =>
      decision.mesocycleId === evaluation.mesocycleId
      && decision.microcycleId === evaluation.microcycleId)
    .flatMap((decision) => decision.phaseOne?.boundedAdjustment.numericDecisions ?? [])
    .filter(isActionableNumericDecision);
  const latestByKey = new Map<string, CanonicalNumericPrescriptionDecision>();
  for (const decision of [...prior, ...evaluation.numericDecisions]) {
    const existing = latestByKey.get(decision.comparableExposureKey);
    if (!existing
      || decision.exposureCount > existing.exposureCount
      || decision.exposureCount === existing.exposureCount
        && decision.evidenceIds.join(",").localeCompare(existing.evidenceIds.join(",")) >= 0) {
      latestByKey.set(decision.comparableExposureKey, decision);
    }
  }
  const numericDecisions = [...latestByKey.values()].sort((left, right) =>
    left.comparableExposureKey.localeCompare(right.comparableExposureKey));
  const evidenceIds = [...new Set([
    ...evaluation.evidenceIds,
    ...numericDecisions.flatMap((decision) => decision.evidenceIds),
  ])].sort();
  const evidenceVersions = Object.fromEntries(evidenceIds.flatMap((evidenceId) => {
    const found = canonicalProgressEvidenceRepository.get(evidenceId);
    return found.status === "found" ? [[evidenceId, found.evidence.evidenceVersion] as const] : [];
  }));
  const actionable = numericDecisions.filter(isActionableNumericDecision);
  return {
    ...evaluation,
    evaluationId: `${evaluation.planId}:post-workout:${evaluation.recordedSessionId}:${recordedSessionVersion}:${evaluation.outcome}:${evidenceIds.join(",")}`,
    evidenceIds,
    evidenceVersions,
    numericDecisions,
    affectedExerciseIds: [...new Set([
      ...evaluation.affectedExerciseIds,
      ...actionable.map((decision) => decision.exerciseId),
    ])].sort(),
    reasonCodes: [...new Set([
      ...evaluation.reasonCodes,
      ...actionable.map((decision) => decision.reasonCode),
    ])],
    explanation: actionable.length
      ? "This training week is complete. Comparable completed training supports bounded changes in the next matching prescriptions."
      : evaluation.explanation,
  };
}

function isActionableNumericDecision(
  decision: CanonicalNumericPrescriptionDecision,
): boolean {
  return Boolean(decision.after)
    && ["progress_load", "progress_repetitions", "regress_load", "regress_repetitions"].includes(decision.outcome);
}

function finalizeAttempt(
  operationId: string,
  input: Readonly<{ planId: string; recordedSessionId: string; completionEvidenceId: string; occurredAt: string }>,
  decision: import("@/domain/training/canonical-progress-decision").CanonicalProgressDecision,
  applied: ReturnType<typeof canonicalActivePlanState.applyProgressDecision>,
): CanonicalPostWorkoutOrchestrationResult {
  const finalStatus = applied.receiptStatus === "blocked" || decision.phaseOne?.decisionType === "blocked"
    ? "blocked" as const
    : applied.receiptStatus === "applied" || applied.status === "applied"
      ? "applied" as const
      : "unchanged" as const;
  canonicalCoachingAttemptRepository.save({
    schemaVersion: "canonical_coaching_attempt_v1",
    operationId,
    planId: input.planId,
    recordedSessionId: input.recordedSessionId,
    completionEvidenceId: input.completionEvidenceId,
    status: finalStatus,
    reason: applied.reason,
    evaluationId: decision.evaluationId,
    decisionId: decision.decisionId,
    evidenceState: "complete",
    decisionState: "persisted",
    applicationState: finalStatus,
    retryIdentity: operationId,
    ...boundaryAttemptFields(decision.decisionId, input.planId),
    updatedAt: input.occurredAt,
  });
  canonicalActivePlanState.hydrate();
  const committed = canonicalProgressDecisionRepository.get(decision.decisionId);
  const explanation = committed.status === "found" && committed.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
    ? committed.decision.phaseOneApplication.explanation
    : decision.explanation;
  return { status: finalStatus, reason: applied.reason, operationId, evaluationId: decision.evaluationId, decisionId: decision.decisionId, explanation, priorRevision: applied.priorRevision, newRevision: applied.newRevision };
}

function isTerminalApplicationReconciliation(reason: string): boolean {
  return [
    "application_intent_missing_for_committed_decision",
    "application_intent_corrupt",
    "application_intent_identity_conflict",
    "committed_state_material_delta_ambiguous",
    "application_state_conflict",
  ].includes(reason);
}

function terminalApplicationBlock(
  operationId: string,
  input: Readonly<{ planId: string; recordedSessionId: string; completionEvidenceId: string; occurredAt: string }>,
  decision: import("@/domain/training/canonical-progress-decision").CanonicalProgressDecision,
  reason: string,
): CanonicalPostWorkoutOrchestrationResult {
  canonicalCoachingAttemptRepository.save({
    schemaVersion: "canonical_coaching_attempt_v1",
    operationId,
    planId: input.planId,
    recordedSessionId: input.recordedSessionId,
    completionEvidenceId: input.completionEvidenceId,
    status: "blocked",
    reason,
    evaluationId: decision.evaluationId,
    decisionId: decision.decisionId,
    evidenceState: "complete",
    decisionState: "persisted",
    applicationState: "blocked",
    retryIdentity: operationId,
    updatedAt: input.occurredAt,
  });
  return { status: "blocked", reason, operationId, evaluationId: decision.evaluationId, decisionId: decision.decisionId, explanation: "Your completed workout is safe. The coaching application could not be reconciled unambiguously, so no further change was attempted." };
}

function boundaryAttemptFields(decisionId: string, planId: string): Readonly<{ boundaryResolutionFingerprint?: string; boundaryResolutionEvent?: string }> {
  const persisted = canonicalProgressDecisionRepository.get(decisionId);
  const carrier = canonicalActivePlanV2Repository.get();
  const receipt = persisted.status === "found" && persisted.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
    ? persisted.decision.phaseOneApplication
    : undefined;
  return receipt?.boundaryState
    ? {
      boundaryResolutionFingerprint: canonicalDeterministicFingerprint({
        evidence: canonicalProgressEvidenceRepository.list(planId),
        carrierRevision: carrier.status === "saved" ? carrier.carrier.revision : null,
      }),
      boundaryResolutionEvent: receipt.boundaryState.resolutionEvent,
    }
    : {};
}

function phaseOneDecisionDetails(
  evaluation: ReturnType<typeof evaluateCanonicalPostWorkoutProgress>,
  priorFutureSessionIds: readonly string[],
  decidedAt: string,
  idempotencyKey: string,
  athleteId: string,
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
    boundedAdjustment: {
      kind,
      exerciseIds: [...evaluation.affectedExerciseIds].sort(),
      numericLoadAdjustmentAuthorised: decisionType === "advance_microcycle" && evaluation.numericDecisions.some((item) => item.after),
      numericDecisions: evaluation.numericDecisions,
    },
    ...(evaluation.boundaryResolution ? { boundaryResolution: evaluation.boundaryResolution } : {}),
    contextIdentity: { macrocycleId: evaluation.macrocycleId, mesocycleId: evaluation.mesocycleId, microcycleId: evaluation.microcycleId },
    decidedAt,
    idempotencyKey,
    adaptationAudit: adaptationAuditFromNumericDecisions({
      athleteId,
      evidenceIds: evaluation.evidenceIds,
      comparableExposureCount: evaluation.comparableExposureCount,
      reasonCodes: evaluation.reasonCodes,
      explanation: evaluation.explanation,
      exerciseIds: evaluation.affectedExerciseIds,
      numericDecisions: evaluation.numericDecisions,
      decisionType,
      recoveryEvidence: evaluation.recoveryEvidence,
    }),
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
