import { orchestrateCanonicalPostWorkoutAdaptation } from "@/application/training/canonical-post-workout-orchestrator";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalCoachingOperationId } from "@/domain/training/canonical-coaching-identity";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import { canonicalDeterministicFingerprint } from "@/domain/training/canonical-deterministic-fingerprint";
import { comparableExposureObservationFacts } from "@/domain/training/canonical-comparable-exposure-policy";

export const CANONICAL_COMPLETION_EVIDENCE_RECONCILIATION_VERSION = "canonical_completion_evidence_reconciliation_v1" as const;

export type CanonicalCompletionEvidenceReconciliationResult = Readonly<{
  status: "reconciled" | "already_complete" | "retryable" | "rejected";
  reason: string;
  operationId?: string;
  completionEvidenceId?: string;
  derivedPerformanceEvidenceCount?: number;
}>;

/**
 * Rebuilds only factual evidence derivable from the immutable completed ledger.
 * Readiness, pain, capacity and review evidence can never be invented here.
 */
export function reconcileCanonicalCompletedSessionEvidence(input: Readonly<{
  planId: string;
  recordedSessionId: string;
  planRevision?: number;
}>): CanonicalCompletionEvidenceReconciliationResult {
  const aggregate = canonicalRecordedSessionLedger.get(input.recordedSessionId);
  if (aggregate.status !== "found" || aggregate.session.planId !== input.planId) return { status: "rejected", reason: "completed_ledger_not_found" };
  if (aggregate.session.status !== "completed") return { status: "rejected", reason: "completed_ledger_required" };
  if (aggregate.session.prescriptionHash !== JSON.stringify(aggregate.session.prescriptionSnapshot)) return { status: "rejected", reason: "completed_ledger_prescription_mismatch" };
  const completionEvent = aggregate.events.findLast((event) => event.type === "completed");
  if (!completionEvent) return { status: "rejected", reason: "completed_event_missing" };

  const completionEvidenceId = `${input.recordedSessionId}:completion-evidence:${aggregate.session.version}`;
  const operationId = canonicalCoachingOperationId(input.planId, input.recordedSessionId, completionEvidenceId);
  const existingAttempt = canonicalCoachingAttemptRepository.get(operationId);
  const carrier = canonicalActivePlanV2Repository.get();
  const referenceRevision = carrier.status === "saved"
    ? carrier.carrier.recordedSessionReferences?.find((reference) => reference.sessionId === input.recordedSessionId)?.revision
    : undefined;
  const planRevision = input.planRevision
    ?? (existingAttempt.status === "found" ? existingAttempt.attempt.planRevisionAtCompletion : undefined)
    ?? referenceRevision;
  if (!Number.isInteger(planRevision) || Number(planRevision) < 0) return { status: "retryable", reason: "completion_plan_revision_unavailable", operationId, completionEvidenceId };

  const performed = effectiveCanonicalPerformedWork(aggregate.events);
  const slots = Array.isArray((aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots)
    ? (aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots as Array<Record<string, unknown>>
    : [];
  let derived = 0;
  let blockedReason: "performed_work_identity_unavailable" | "performed_evidence_identity_conflict" | null = null;
  for (const event of performed) {
    const setId = String(event.payload.setId ?? "");
    const slotId = String(event.payload.slotId ?? "");
    const exerciseId = String(event.payload.exerciseId ?? "");
    const slot = slots.find((candidate) => String(candidate.id) === slotId && String(candidate.exerciseId) === exerciseId);
    if (!setId || !slot) {
      blockedReason = "performed_work_identity_unavailable";
      continue;
    }
    const evidenceId = `${input.recordedSessionId}:evidence:${setId}`;
    const prior = canonicalProgressEvidenceRepository.get(evidenceId);
    const expectedEvidence = performanceEvidence({
      planRevision: Number(planRevision),
      session: aggregate.session,
      slot,
      event,
      evidenceId,
    });
    if (prior.status === "found") {
      if (prior.evidence.kind !== "performance" || prior.evidence.sessionId !== input.recordedSessionId || prior.evidence.slotId !== slotId) {
        blockedReason = "performed_evidence_identity_conflict";
        continue;
      }
      if (JSON.stringify(prior.evidence.observations) !== JSON.stringify(expectedEvidence.observations)) {
        const replaced = canonicalProgressEvidenceRepository.replace(expectedEvidence);
        if (replaced.status !== "saved") return { status: "retryable", reason: "stale_performance_evidence_reconciliation_pending", operationId, completionEvidenceId };
        derived += 1;
      }
      continue;
    }
    const record = canonicalProgressEvidenceRepository.record(expectedEvidence);
    if (record.status !== "saved" && record.status !== "duplicate") return { status: "retryable", reason: "performance_evidence_reconciliation_pending", operationId, completionEvidenceId };
    derived += 1;
  }

  const summary = deriveCanonicalCompletionSummary(aggregate.session, aggregate.events);
  const priorCompletion = canonicalProgressEvidenceRepository.get(completionEvidenceId);
  if (priorCompletion.status !== "found") {
    const completion = canonicalProgressEvidenceRepository.record({
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: completionEvidenceId,
      planId: input.planId,
      planRevision: Number(planRevision),
      macrocycleId: aggregate.session.macrocycleId,
      mesocycleId: aggregate.session.mesocycleId as never,
      microcycleId: aggregate.session.microcycleId,
      sessionId: input.recordedSessionId,
      athleteId: aggregate.session.athleteId,
      observedAt: completionEvent.occurredAt,
      source: `ledger:${input.recordedSessionId}:v${aggregate.session.version}`,
      kind: "completion",
      observations: {
        plannedSessionId: aggregate.session.plannedSessionId,
        prescriptionHash: aggregate.session.prescriptionHash,
        completion: summary.completion,
        prescribedSets: prescribedWorkingSetCount(aggregate.session.prescriptionSnapshot),
        prescribedSlots: summary.prescribedSlots,
        completedSlots: summary.completedSlots.length,
        partialSlots: summary.partialSlots.length,
        skippedSlots: summary.skippedSlots.length,
        performedSets: summary.performedSets,
        performedReps: summary.performedReps,
        performedLoad: summary.performedLoad,
      },
      evidenceVersion: "progress_v1",
    });
    if (completion.status !== "saved" && completion.status !== "duplicate") return { status: "retryable", reason: "completion_evidence_reconciliation_pending", operationId, completionEvidenceId };
  } else if (priorCompletion.evidence.kind !== "completion" || priorCompletion.evidence.sessionId !== input.recordedSessionId) {
    return { status: "rejected", reason: "completion_evidence_identity_conflict", operationId, completionEvidenceId };
  }

  if (blockedReason) {
    const blockedEvidenceId = `${input.recordedSessionId}:reconciliation-review:${aggregate.session.version}`;
    const blockedEvidence = canonicalProgressEvidenceRepository.record({
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: blockedEvidenceId,
      planId: input.planId,
      planRevision: Number(planRevision),
      macrocycleId: aggregate.session.macrocycleId,
      mesocycleId: aggregate.session.mesocycleId as never,
      microcycleId: aggregate.session.microcycleId,
      sessionId: input.recordedSessionId,
      athleteId: aggregate.session.athleteId,
      observedAt: completionEvent.occurredAt,
      source: `ledger-reconciliation:${input.recordedSessionId}:v${aggregate.session.version}`,
      kind: "review_request",
      observations: {
        reasonCode: blockedReason,
        missingFact: "canonical_performed_work_identity",
        requiredBecause: "A completed set cannot be linked to an exercise and slot in the immutable prescription.",
        resolutionEvent: "recorded_session_identity_repaired_or_reviewed",
        currentProgrammeSafelyUsable: false,
      },
      evidenceVersion: "progress_v1",
    });
    if (blockedEvidence.status !== "saved" && blockedEvidence.status !== "duplicate") {
      return { status: "retryable", reason: "reconciliation_review_evidence_pending", operationId, completionEvidenceId };
    }
  }

  const terminal = existingAttempt.status === "found" && ["applied", "unchanged", "blocked"].includes(existingAttempt.attempt.status);
  if (!terminal) {
    canonicalCoachingAttemptRepository.save({
      schemaVersion: "canonical_coaching_attempt_v1",
      operationId,
      planId: input.planId,
      recordedSessionId: input.recordedSessionId,
      completionEvidenceId,
      status: existingAttempt.status === "found" ? existingAttempt.attempt.status : "pending",
      reason: existingAttempt.status === "found" && existingAttempt.attempt.reason === "boundary_resolution_event_detected"
        ? existingAttempt.attempt.reason
        : blockedReason ?? "completion_evidence_reconciled",
      planRevisionAtCompletion: Number(planRevision),
      completedLedgerVersion: aggregate.session.version,
      prescriptionHash: aggregate.session.prescriptionHash,
      evidenceState: "complete",
      decisionState: existingAttempt.status === "found" ? existingAttempt.attempt.decisionState : "pending",
      applicationState: existingAttempt.status === "found" ? existingAttempt.attempt.applicationState : "pending",
      retryIdentity: operationId,
      ...(existingAttempt.status === "found" && existingAttempt.attempt.evaluationId ? { evaluationId: existingAttempt.attempt.evaluationId } : {}),
      ...(existingAttempt.status === "found" && existingAttempt.attempt.decisionId ? { decisionId: existingAttempt.attempt.decisionId } : {}),
      updatedAt: completionEvent.occurredAt,
    });
  }
  return {
    status: priorCompletion.status === "found" && derived === 0 && (!blockedReason || terminal) ? "already_complete" : "reconciled",
    reason: blockedReason ?? (derived ? "completion_and_performance_evidence_reconciled" : "completion_evidence_reconciled"),
    operationId,
    completionEvidenceId,
    derivedPerformanceEvidenceCount: derived,
  };
}

/** Restart-safe coordinator. It only resumes durable completed ledger records. */
export function resumePendingCanonicalCoachingWork(planId: string): readonly CanonicalCompletionEvidenceReconciliationResult[] {
  const carrier = canonicalActivePlanV2Repository.get();
  const currentBoundaryFingerprint = canonicalDeterministicFingerprint({
    evidence: canonicalProgressEvidenceRepository.list(planId),
    carrierRevision: carrier.status === "saved" ? carrier.carrier.revision : null,
  });
  const pending = canonicalCoachingAttemptRepository.list(planId)
    .filter((attempt) => attempt.status === "pending"
      || attempt.status === "decision_persisted"
      || attempt.status === "blocked"
        && Boolean(attempt.boundaryResolutionEvent)
        && attempt.boundaryResolutionEvent !== "none_terminal"
        && attempt.boundaryResolutionFingerprint !== currentBoundaryFingerprint)
    .sort((left, right) => left.operationId.localeCompare(right.operationId));
  return pending.flatMap((attempt) => {
    if (attempt.status === "blocked") {
      canonicalCoachingAttemptRepository.save({
        ...attempt,
        status: "pending",
        reason: "boundary_resolution_event_detected",
        applicationState: "pending",
      });
    }
    const reconciliation = reconcileCanonicalCompletedSessionEvidence({ planId, recordedSessionId: attempt.recordedSessionId });
    if ((reconciliation.status === "reconciled" || reconciliation.status === "already_complete") && reconciliation.completionEvidenceId) {
      const completion = canonicalProgressEvidenceRepository.get(reconciliation.completionEvidenceId);
      if (completion.status === "found") {
        orchestrateCanonicalPostWorkoutAdaptation({
          planId,
          recordedSessionId: attempt.recordedSessionId,
          completionEvidenceId: reconciliation.completionEvidenceId,
          occurredAt: completion.evidence.observedAt,
        });
      }
    }
    return [reconciliation];
  });
}

function performanceEvidence(input: Readonly<{
  planRevision: number;
  session: import("@/domain/training/canonical-recorded-session-ledger").CanonicalRecordedSession;
  slot: Record<string, unknown>;
  event: import("@/domain/training/canonical-performed-work").CanonicalEffectivePerformedWork;
  evidenceId: string;
}>): CanonicalProgressEvidence {
  const settings = input.slot.settings as Record<string, unknown> | undefined;
  const loadPrescription = input.slot.loadPrescription as Record<string, unknown> | undefined;
  const progression = input.slot.progression as Record<string, unknown> | undefined;
  const selection = input.slot.selection as Record<string, unknown> | undefined;
  const stopRule = input.slot.stopRule as Record<string, unknown> | undefined;
  const exactTargets = Array.isArray(input.slot.exactTargets) ? input.slot.exactTargets as number[] : [];
  const setOrder = Number(input.event.payload.setOrder);
  const structure = input.slot.methodStructure as Record<string, unknown> | undefined;
  const contract = structure?.contract as Record<string, unknown> | undefined;
  const setRoles = Array.isArray(structure?.setRoles) ? structure.setRoles.map(String) : [];
  const loadMultipliers = Array.isArray(structure?.loadMultipliers) ? structure.loadMultipliers.map(Number) : [];
  const prescribedBaseLoad = Number(loadPrescription?.prescribedBaseLoad ?? 0);
  const setMultiplier = Number(loadMultipliers[setOrder - 1] ?? 1);
  const prescribedRestSeconds = structure?.kind === "rest_pause" && setOrder > 1
    ? Number(structure.intraMethodRestSeconds ?? 0)
    : Number(structure?.interRoundRestSeconds ?? (input.slot.rest as Record<string, unknown> | undefined)?.seconds ?? 0);
  const recoveryTiming = input.event.payload.recoveryTiming as Record<string, unknown> | undefined;
  return {
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: input.evidenceId,
    planId: input.session.planId,
    planRevision: input.planRevision,
    macrocycleId: input.session.macrocycleId,
    mesocycleId: input.session.mesocycleId as never,
    microcycleId: input.session.microcycleId,
    sessionId: input.session.recordedSessionId,
    slotId: String(input.slot.id),
    athleteId: input.session.athleteId,
    observedAt: input.event.occurredAt,
    source: `ledger-reconciliation:${input.event.eventId}`,
    kind: "performance",
    observations: {
      exerciseId: String(input.event.payload.exerciseId),
      slotId: String(input.event.payload.slotId),
      prescriptionHash: input.session.prescriptionHash,
      ...comparableExposureObservationFacts({
        ...(input.session.prescriptionSnapshot as Record<string, unknown>),
        mesocycleId: input.session.mesocycleId,
      }, input.slot),
      loadingMode: String(loadPrescription?.loadingMode ?? input.slot.loadingMode ?? "unavailable"),
      method: String(input.slot.method ?? "straight_sets"),
      methodExecutionKind: String(structure?.kind ?? "standalone"),
      methodPolicyId: String(structure?.policyId ?? "canonical_training_method_policy_v1"),
      methodContractVersion: String(contract?.contractVersion ?? "legacy_or_unversioned"),
      methodGroupIdentity: structure?.groupId ? String(structure.groupId) : null,
      methodGroupPosition: Number.isInteger(Number(structure?.position)) ? Number(structure?.position) : null,
      pairedExerciseId: structure?.pairedExerciseId ? String(structure.pairedExerciseId) : null,
      loadState: String(loadPrescription?.state ?? "unavailable"),
      progressionRule: String(progression?.rule ?? "unknown"),
      prescribedSets: Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0),
      prescribedTargetReps: Number(exactTargets[setOrder - 1] ?? input.slot.targetReps ?? 0),
      prescribedBaseLoad,
      prescribedSetLoad: prescribedBaseLoad > 0 ? prescribedBaseLoad * setMultiplier : 0,
      prescribedRestSeconds,
      actualRestSeconds: recoveryTiming?.timingConfidence === "reliable" && recoveryTiming?.phase === "between_round_recovery" ? Number(recoveryTiming.observedUsableSeconds) : null,
      observedTransitionSeconds: recoveryTiming?.timingConfidence === "reliable" && recoveryTiming?.phase === "a_to_b_transition" ? Number(recoveryTiming.observedUsableSeconds) : null,
      recoveryTimingConfidence: String(recoveryTiming?.timingConfidence ?? "unreliable"),
      recoveryTimingReason: String(recoveryTiming?.timingReason ?? "recovery_timing_not_started"),
      recoveryPausedSeconds: Number(recoveryTiming?.pausedSeconds ?? 0),
      recoveryBackgroundSeconds: Number(recoveryTiming?.backgroundSeconds ?? 0),
      recoveryManualAdjustmentSeconds: Number(recoveryTiming?.manualAdjustmentSeconds ?? 0),
      setRole: setRoles[setOrder - 1] ?? (setOrder === 1 ? "working_set" : `working_set_${setOrder}`),
      correctionProvenance: input.event.eventId === input.event.originalEventId ? "original" : "corrected",
      executionEventId: input.event.eventId,
      originalExecutionEventId: input.event.originalEventId,
      stopThreshold: typeof stopRule?.threshold === "number" ? Number(stopRule.threshold) : null,
      setOrder,
      reps: Number(input.event.payload.reps),
      load: Number(input.event.payload.load),
      unit: String(input.event.payload.unit),
      completion: String(input.event.payload.completion),
      substitutionId: input.event.payload.substitutionId ? String(input.event.payload.substitutionId) : null,
      substitutionComparability: input.event.payload.substitutionId ? (selection?.suitability === "equivalent" ? "comparable" : "non_comparable") : "not_substituted",
      ...(input.event.payload.effort === undefined ? {} : { effort: Number(input.event.payload.effort) }),
    },
    evidenceVersion: "progress_v1",
  };
}

function prescribedWorkingSetCount(snapshot: Readonly<Record<string, unknown>>): number {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  return slots.reduce((sum, slot) => {
    const settings = slot.settings as Record<string, unknown> | undefined;
    const count = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0);
    return sum + (Number.isInteger(count) && count > 0 ? count : 0);
  }, 0);
}
