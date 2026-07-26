import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { validateCanonicalCoachingIdentity, type CanonicalCoachingIdentity } from "@/domain/training/canonical-coaching-identity";
import type { MesocycleSpec } from "@/domain/training/mesocycle-library";
import {
  resolveCanonicalCycleBoundary,
  type CanonicalCycleBoundaryResolution,
} from "@/domain/training/canonical-cycle-boundary-resolution";

export type CanonicalProgressEvaluation = Readonly<{
  schemaVersion: "canonical_progress_evaluation_v1";
  evaluationId: string;
  planId: string;
  planRevision: number;
  mesocycleId: string;
  microcycleId: string;
  evidenceIds: readonly string[];
  state: "ready" | "insufficient_evidence" | "review_required";
  reason: "complete_current_microcycle" | "no_evidence" | "partial_or_review_signal";
  explanation: string;
}>;
export type CanonicalProgressEvaluationV2 = Readonly<{
  schemaVersion: "canonical_progress_evaluation_v2";
  evaluationId: string; planId: string; planRevision: number; mesocycleId: string; microcycleId: string;
  evidenceIds: readonly string[]; evidenceVersions: Readonly<Record<string, string>>;
  outcome: "insufficient_evidence" | "continue" | "review_required" | "transition_recommended" | "deload_required";
  reason: string; explanation: string; policyVersion: string; transitionIntent: boolean; deloadIntent: boolean;
}>;

export const CANONICAL_POST_WORKOUT_EVALUATION_VERSION = "canonical_progress_evaluation_v3" as const;
export const CANONICAL_COACHING_LOOP_PHASE1_POLICY = "canonical_coaching_loop_phase1_policy_v1" as const;

export type CanonicalCalibrationCandidate = Readonly<{
  exerciseId: string;
  slotId: string;
  observedLoad: number;
  observedReps: number;
  sourceEvidenceIds: readonly string[];
}>;

export type CanonicalPostWorkoutEvaluation = Readonly<{
  schemaVersion: typeof CANONICAL_POST_WORKOUT_EVALUATION_VERSION;
  evaluationId: string;
  planId: string;
  planRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  recordedSessionId: string;
  prescriptionHash: string;
  evidenceIds: readonly string[];
  evidenceVersions: Readonly<Record<string, string>>;
  outcome: "establish_calibration" | "maintain" | "recalibrate" | "advance_microcycle" | "transition_recommended" | "blocked";
  reasonCodes: readonly string[];
  explanation: string;
  policyVersion: typeof CANONICAL_COACHING_LOOP_PHASE1_POLICY;
  targetCompletion: "successful" | "partial" | "failed";
  comparableExposureCount: number;
  repDropOff: boolean;
  recoveryEvidence: "not_collected" | "stable" | "constrained" | "conflicting";
  transitionEligible: boolean;
  deloadEligible: false;
  calibrationCandidates: readonly CanonicalCalibrationCandidate[];
  affectedExerciseIds: readonly string[];
  boundaryResolution?: CanonicalCycleBoundaryResolution;
}>;

export function evaluateCanonicalProgress(input: Readonly<{ plan: CanonicalActivePlanReadModel; evidence: readonly CanonicalProgressEvidence[] }>): CanonicalProgressEvaluation {
  const { plan, evidence } = input;
  const relevant = evidence.filter((item) => item.planId === plan.planId && item.planRevision <= plan.revision && item.microcycleId === plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const hasReview = relevant.some((item) => item.kind === "review_request" || item.kind === "pain");
  const state = hasReview ? "review_required" : relevant.length ? "ready" : "insufficient_evidence";
  const reason = hasReview ? "partial_or_review_signal" : relevant.length ? "complete_current_microcycle" : "no_evidence";
  return { schemaVersion: "canonical_progress_evaluation_v1", evaluationId: `${plan.planId}:progress:${plan.revision}:${relevant.map((item) => item.evidenceId).join(",")}`, planId: plan.planId, planRevision: plan.revision, mesocycleId: plan.mesocycle.id, microcycleId: plan.microcycle.id, evidenceIds: relevant.map((item) => item.evidenceId), state, reason, explanation: state === "review_required" ? "Progress evidence requests review before a transition." : state === "ready" ? "Current canonical Progress evidence is available for decision evaluation." : "More canonical Progress evidence is required before a decision can be produced." };
}

export function evaluateCanonicalProgressV2(input: Readonly<{ plan: CanonicalActivePlanReadModel; evidence: readonly CanonicalProgressEvidence[]; policy: MesocyclePrescriptionPolicy }>): CanonicalProgressEvaluationV2 {
  const base = evaluateCanonicalProgress(input);
  const relevant = input.evidence.filter((item) => base.evidenceIds.includes(item.evidenceId));
  const transitionIntent = relevant.some((item) => item.observations.transitionReady === true || item.observations.exitCriteriaSatisfied === true);
  const deloadIntent = relevant.some((item) => item.observations.deloadRequired === true || item.observations.recoveryState === "recovery_first");
  const outcome = !relevant.length ? "insufficient_evidence" : transitionIntent && deloadIntent ? "review_required" : deloadIntent ? "deload_required" : transitionIntent ? "transition_recommended" : base.state === "review_required" ? "review_required" : "continue";
  return { schemaVersion: "canonical_progress_evaluation_v2", evaluationId: `${base.evaluationId}:v2:${outcome}`, planId: base.planId, planRevision: base.planRevision, mesocycleId: base.mesocycleId, microcycleId: base.microcycleId, evidenceIds: base.evidenceIds, evidenceVersions: Object.fromEntries(relevant.map((item) => [item.evidenceId, item.evidenceVersion])), outcome, reason: outcome === "transition_recommended" ? "canonical_transition_exit_requirements_met" : outcome === "deload_required" ? `canonical_fatigue_policy:${input.policy.fatigue.boundary}` : base.reason, explanation: outcome === "transition_recommended" ? "Canonical Progress evidence satisfies transition intent." : outcome === "deload_required" ? "Canonical fatigue evidence requires a recovery successor." : base.explanation, policyVersion: input.policy.schemaVersion, transitionIntent, deloadIntent };
}

/**
 * Production post-workout evaluator. It derives intent only from immutable
 * prescription facts and persisted performed-work/readiness evidence.
 * Caller-authored transition/deload booleans are deliberately ignored.
 */
export function evaluateCanonicalPostWorkoutProgress(input: Readonly<{
  plan: CanonicalActivePlanReadModel;
  session: CanonicalRecordedSession;
  events: readonly CanonicalRecordedSessionEvent[];
  evidence: readonly CanonicalProgressEvidence[];
  identity: CanonicalCoachingIdentity;
  policy: MesocyclePrescriptionPolicy;
  mesocycle: MesocycleSpec;
  contextAvailable: boolean;
  completedPlannedSessionsInMicrocycle: number;
  completedMicrocyclesInMesocycle: number;
  microcycleComplete: boolean;
}>): CanonicalPostWorkoutEvaluation {
  const relevant = input.evidence
    .filter((item) => item.planId === input.plan.planId && item.planRevision <= input.plan.revision)
    .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const sessionEvidence = relevant.filter((item) => item.sessionId === input.session.recordedSessionId);
  const evidenceIds = sessionEvidence.map((item) => item.evidenceId);
  const base = {
    schemaVersion: CANONICAL_POST_WORKOUT_EVALUATION_VERSION,
    planId: input.plan.planId,
    planRevision: input.plan.revision,
    macrocycleId: input.identity.macrocycleId,
    mesocycleId: input.plan.mesocycle.id,
    microcycleId: input.plan.microcycle.id,
    recordedSessionId: input.session.recordedSessionId,
    prescriptionHash: input.session.prescriptionHash,
    evidenceIds,
    evidenceVersions: Object.fromEntries(sessionEvidence.map((item) => [item.evidenceId, item.evidenceVersion])),
    policyVersion: CANONICAL_COACHING_LOOP_PHASE1_POLICY,
  } as const;
  const finish = (
    outcome: CanonicalPostWorkoutEvaluation["outcome"],
    reasonCodes: readonly string[],
    explanation: string,
    facts: Pick<CanonicalPostWorkoutEvaluation, "targetCompletion" | "comparableExposureCount" | "repDropOff" | "recoveryEvidence" | "transitionEligible" | "calibrationCandidates" | "affectedExerciseIds">
      & Readonly<{ boundaryResolution?: CanonicalCycleBoundaryResolution }>,
  ): CanonicalPostWorkoutEvaluation => ({
    ...base,
    evaluationId: `${input.plan.planId}:post-workout:${input.session.recordedSessionId}:${input.session.version}:${outcome}:${evidenceIds.join(",")}`,
    outcome,
    reasonCodes,
    explanation,
    deloadEligible: false,
    ...facts,
  });
  const emptyFacts = {
    targetCompletion: "failed" as const,
    comparableExposureCount: 0,
    repDropOff: false,
    recoveryEvidence: recoveryEvidenceState(relevant),
    transitionEligible: false,
    calibrationCandidates: [] as readonly CanonicalCalibrationCandidate[],
    affectedExerciseIds: [] as readonly string[],
  };
  if (input.session.status !== "completed" || input.session.prescriptionHash !== JSON.stringify(input.session.prescriptionSnapshot)) {
    return finish("blocked", ["immutable_completion_identity_invalid"], "Your workout is saved, but the next prescription was not changed because its identity could not be verified.", emptyFacts);
  }
  if (!input.contextAvailable) {
    return finish("blocked", ["required_construction_context_missing"], "Your workout is saved. Your programme was not adjusted because required training information is missing.", emptyFacts);
  }
  if (!sessionEvidence.length || sessionEvidence.some((item) => validateCanonicalCoachingIdentity({ identity: { ...input.identity, evidenceId: item.evidenceId, ...(item.slotId ? { slotId: item.slotId } : {}), ...(typeof item.observations.exerciseId === "string" ? { exerciseId: item.observations.exerciseId } : {}) }, session: input.session, evidence: item }).status !== "valid")) {
    return finish("blocked", ["evidence_identity_mismatch"], "Your workout is saved, but the next prescription was not changed because its evidence could not be linked safely.", emptyFacts);
  }
  const completionEvidence = sessionEvidence.find((item) => item.kind === "completion");
  if (!completionEvidence) return finish("blocked", ["completion_evidence_missing"], "Your workout is saved. Coaching review will retry when its completion evidence is available.", emptyFacts);

  const slotAssessments = assessSessionSlots(input.session, input.events, sessionEvidence);
  const successful = slotAssessments.length > 0 && slotAssessments.every((item) => item.successful);
  const anyPerformed = slotAssessments.some((item) => item.performedSets > 0);
  const repDropOff = slotAssessments.some((item) => item.repDropOff);
  const targetCompletion = successful ? "successful" as const : anyPerformed ? "partial" as const : "failed" as const;
  const exerciseIds = new Set(slotAssessments.map((item) => item.exerciseId));
  const comparableExposureCount = new Set(relevant.filter((item) => item.kind === "performance" && exerciseIds.has(String(item.observations.exerciseId)) && item.observations.completion === "complete").flatMap((item) => item.sessionId ? [item.sessionId] : [])).size;
  const recoveryEvidence = recoveryEvidenceState(relevant);
  const calibrationCandidates = slotAssessments.flatMap((item) => item.calibrationCandidate ? [item.calibrationCandidate] : []);
  const completeCycle = input.microcycleComplete
    && input.completedPlannedSessionsInMicrocycle >= input.plan.microcycle.trainingDays;
  const boundary = resolveCanonicalCycleBoundary({
    microcycleComplete: completeCycle,
    completedMicrocyclesInMesocycle: input.completedMicrocyclesInMesocycle,
    mesocycle: input.mesocycle,
    policy: input.policy,
    targetCompletion,
  });
  const facts = {
    targetCompletion,
    comparableExposureCount,
    repDropOff,
    recoveryEvidence,
    transitionEligible: boundary.status === "transition_approved",
    calibrationCandidates,
    affectedExerciseIds: calibrationCandidates.map((item) => item.exerciseId).sort(),
    boundaryResolution: boundary,
  };
  const reconciliationBlock = sessionEvidence.find((item) =>
    item.kind === "review_request"
    && (item.observations.reasonCode === "performed_work_identity_unavailable" || item.observations.reasonCode === "performed_evidence_identity_conflict")
  );
  if (reconciliationBlock) {
    return finish(
      "blocked",
      [String(reconciliationBlock.observations.reasonCode)],
      "Your workout is saved, but its performed work needs an identity review before it can change a future prescription.",
      facts,
    );
  }
  if (sessionEvidence.some((item) => item.kind === "pain" || item.kind === "review_request")) {
    return finish("blocked", ["safety_review_required"], "Your workout is saved. We are keeping the next prescription unchanged until the safety review is resolved.", facts);
  }
  if (recoveryEvidence === "conflicting" || recoveryEvidence === "constrained") {
    return finish("blocked", [recoveryEvidence === "conflicting" ? "recovery_evidence_conflicting" : "recovery_review_required"], "Your workout is saved. We are keeping the next prescription unchanged while recovery is reviewed.", facts);
  }
  const repeatedFailureExerciseIds = slotAssessments
    .filter((assessment) => !assessment.successful && failedComparableExposureCount(relevant, assessment.exerciseId, input.session.recordedSessionId) >= 2)
    .map((assessment) => assessment.exerciseId)
    .sort();
  if (!successful && repeatedFailureExerciseIds.length) {
    return finish(
      "recalibrate",
      [
        "repeated_comparable_target_failure",
        "numeric_regression_not_automatically_authorised",
        ...(completeCycle ? ["current_microcycle_completed", "recalibration_continues_in_next_microcycle"] : []),
      ],
      completeCycle
        ? "Recent comparable targets were missed more than once. The next training week remains in this phase and the affected exercise returns to load calibration."
        : "Recent comparable targets were missed more than once, so the next matching exercise returns to load calibration.",
      { ...facts, affectedExerciseIds: repeatedFailureExerciseIds },
    );
  }
  if (!successful) {
    if (completeCycle) {
      return finish(
        "advance_microcycle",
        ["current_microcycle_completed", boundary.reasonCode, repDropOff ? "rep_drop_off_blocks_progression" : "partial_exposure_does_not_create_completed_evidence"],
        "This training week is complete. The next week remains in the same phase without treating incomplete work as successful progression.",
        facts,
      );
    }
    return finish("maintain", [repDropOff ? "rep_drop_off_blocks_progression" : "single_incomplete_exposure"], "We’re keeping the next target unchanged until there is another comparable session.", facts);
  }

  if (completeCycle) {
    if (boundary.status === "transition_approved") {
      return finish(
        "transition_recommended",
        [boundary.reasonCode, "approved_successor_available", `approved_successor:${boundary.successorMesocycleId}`],
        "This phase has reached its canonical training horizon, so the approved next phase has been prepared.",
        { ...facts, transitionEligible: true },
      );
    }
    if (boundary.status === "review_required") {
      return finish(
        "blocked",
        [boundary.reasonCode],
        "Your completed workout is saved, but there is no approved next phase at the current maximum horizon.",
        facts,
      );
    }
    return finish(
      "advance_microcycle",
      ["current_microcycle_completed", boundary.reasonCode],
      "This training week is complete, so the next week has been prepared from the same coaching phase.",
      facts,
    );
  }
  if (calibrationCandidates.length) {
    return finish("establish_calibration", ["stable_completed_calibration", "exercise_identity_verified"], calibrationCandidates.length === 1
      ? "Your completed working sets established a repeatable load for the next comparable exercise."
      : "Your completed working sets established repeatable loads for the next comparable exercises.", facts);
  }
  return finish("maintain", ["successful_exposure_retained", "automatic_numeric_adjustment_not_authorised"], "You completed the target. We’re keeping the next prescription within its current approved bounds.", facts);
}

type SlotAssessment = Readonly<{
  exerciseId: string;
  successful: boolean;
  performedSets: number;
  repDropOff: boolean;
  calibrationCandidate?: CanonicalCalibrationCandidate;
}>;

function assessSessionSlots(session: CanonicalRecordedSession, events: readonly CanonicalRecordedSessionEvent[], evidence: readonly CanonicalProgressEvidence[]): SlotAssessment[] {
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const performance = effectiveCanonicalPerformedWork(events);
  return slots.map((slot) => {
    const slotId = String(slot.id);
    const exerciseId = String(slot.exerciseId);
    const settings = slot.settings as Record<string, unknown> | undefined;
    const prescribedSets = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0);
    const targetReps = Array.isArray(slot.exactTargets) ? slot.exactTargets as number[] : [];
    const performed = performance.filter((event) => String(event.payload.slotId) === slotId).sort((a, b) => Number(a.payload.setOrder) - Number(b.payload.setOrder));
    const successful = prescribedSets > 0
      && performed.length === prescribedSets
      && performed.every((event, index) => event.payload.completion === "complete" && Number(event.payload.reps) >= Number(targetReps[index] ?? slot.targetReps ?? 0));
    const reps = performed.map((event) => Number(event.payload.reps));
    const repDropOff = reps.some((value, index) => index > 0 && value < Number(targetReps[index] ?? slot.targetReps ?? 0));
    const loads = [...new Set(performed.map((event) => Number(event.payload.load)).filter((load) => Number.isFinite(load) && load > 0))];
    const loadPrescription = slot.loadPrescription as Record<string, unknown> | undefined;
    const sourceEvidence = evidence.filter((item) => item.kind === "performance" && item.slotId === slotId && item.observations.exerciseId === exerciseId);
    const comparable = successful
      && loadPrescription?.state === "calibration_required"
      && loads.length === 1
      && performed.every((event) => event.payload.unit === "kg" && !event.payload.substitutionId)
      && sourceEvidence.length === prescribedSets;
    return {
      exerciseId,
      successful,
      performedSets: performed.length,
      repDropOff,
      ...(comparable ? {
        calibrationCandidate: {
          exerciseId,
          slotId,
          observedLoad: loads[0]!,
          observedReps: Math.min(...reps),
          sourceEvidenceIds: sourceEvidence.map((item) => item.evidenceId).sort(),
        },
      } : {}),
    };
  });
}

function failedComparableExposureCount(evidence: readonly CanonicalProgressEvidence[], exerciseId: string, currentSessionId: string): number {
  const bySession = new Map<string, CanonicalProgressEvidence[]>();
  for (const item of evidence) {
    if (item.kind !== "performance" || item.observations.exerciseId !== exerciseId || !item.sessionId) continue;
    bySession.set(item.sessionId, [...(bySession.get(item.sessionId) ?? []), item]);
  }
  let failed = 0;
  for (const [sessionId, records] of bySession) {
    if (sessionId === currentSessionId || records.some((item) => item.observations.completion !== "complete" || Number(item.observations.reps) < Number(item.observations.prescribedTargetReps ?? 0))) failed += 1;
  }
  return failed;
}

function recoveryEvidenceState(evidence: readonly CanonicalProgressEvidence[]): CanonicalPostWorkoutEvaluation["recoveryEvidence"] {
  const eligible = evidence.filter((item) => item.kind === "readiness" || item.kind === "capacity")
    .filter((item) => item.observations.freshness === "fresh" && item.observations.completeness === "complete")
    .sort((left, right) => left.observedAt.localeCompare(right.observedAt) || left.evidenceId.localeCompare(right.evidenceId));
  const latestObservedAt = eligible.at(-1)?.observedAt;
  const records = latestObservedAt ? eligible.filter((item) => item.observedAt === latestObservedAt) : [];
  if (!records.length) return "not_collected";
  const states = new Set(records.map((item) => item.observations.recovery === "constrained" || item.observations.fatigue === "systemic" ? "constrained" : item.observations.recovery === "ready" && item.observations.fatigue === "stable" ? "stable" : "unknown"));
  if (states.has("unknown") || states.size > 1) return "conflicting";
  return states.has("constrained") ? "constrained" : "stable";
}
