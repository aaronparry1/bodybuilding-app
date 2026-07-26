import { loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalCoachingApplicationIntentRepository } from "@/data/local/canonical-coaching-application-intent-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import type { CanonicalPhaseOneApplicationReceipt, CanonicalPhaseOneApplicationReceiptV2 } from "@/domain/training/canonical-progress-decision";
import { compareCanonicalMaterialPrescriptions, type CanonicalMaterialPrescriptionDelta } from "@/domain/training/canonical-material-prescription-delta";
import { canonicalDeterministicFingerprint } from "@/domain/training/canonical-deterministic-fingerprint";
import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";

export type CanonicalProgressDecisionApplicationCommand = Readonly<{ planId: string; expectedPlanRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; decisionId: string; evaluationId: string; expectedEvidenceIds: readonly string[] }>;
export type CanonicalProgressDecisionApplicationResult = Readonly<{ status: "unchanged" | "applied" | "rejected"; receiptStatus?: "applied" | "unchanged" | "blocked"; reason: string; planId: string; priorRevision: number; newRevision: number; decisionId: string; stateChanged: boolean; futureSessionsRegenerated: boolean; reviewRequired: boolean }>;

/** Coordinates canonical identity validation. Transition/regeneration remains owned by Mesocycle/Microcycle/Session Construction. */
export function applyCanonicalProgressDecision(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  const loaded = loadCanonicalActivePlan();
  if (loaded.status !== "ok") return rejected(command, 0, "canonical_plan_unavailable");
  const plan = loaded.model;
  if (plan.planId !== command.planId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  const currentCarrier = canonicalActivePlanV2Repository.get();
  const decision = canonicalProgressDecisionRepository.get(command.decisionId);
  if (decision.status !== "found") return rejected(command, plan.revision, "decision_not_found");
  if (decision.decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2") {
    const receipt = decision.decision.phaseOneApplication;
    return { status: "unchanged", receiptStatus: receipt.status, reason: "decision_application_receipt_already_persisted", planId: plan.planId, priorRevision: receipt.priorRevision, newRevision: receipt.newRevision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: receipt.status === "applied", reviewRequired: receipt.status === "blocked" };
  }
  if (decision.decision.phaseOne && currentCarrier.status === "saved") {
    const reconciled = reconcilePreparedApplication(command, currentCarrier.carrier);
    if (reconciled) return reconciled;
  }
  if (plan.revision !== command.expectedPlanRevision) return rejected(command, plan.revision, "stale_plan_revision");
  if (plan.macrocycle.goal === "" || plan.mesocycle.id !== command.mesocycleId || plan.microcycle.id !== command.microcycleId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  if (decision.decision.planId !== command.planId || decision.decision.expectedPlanRevision !== command.expectedPlanRevision || decision.decision.evaluationId !== command.evaluationId || decision.decision.mesocycleId !== command.mesocycleId || decision.decision.microcycleId !== command.microcycleId) return rejected(command, plan.revision, "decision_chain_mismatch");
  const expected = [...command.expectedEvidenceIds].sort();
  const actual = [...decision.decision.evidenceIds].sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual) || actual.some((id) => canonicalProgressEvidenceRepository.get(id).status !== "found")) return rejected(command, plan.revision, "evidence_chain_mismatch");
  if (decision.decision.status === "consumed") return { status: "unchanged", reason: "decision_already_consumed", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
  if (decision.decision.phaseOne) return applyPhaseOneDecision(command, decision.decision, plan.revision);
  if (decision.decision.outcome === "review_required" || decision.decision.outcome === "insufficient_evidence") {
    canonicalProgressDecisionRepository.consume(command.decisionId);
    return { status: "unchanged", reason: "decision_requires_no_plan_change", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: decision.decision.outcome === "review_required" };
  }
  if (decision.decision.outcome === "transition" || decision.decision.outcome === "deload") {
    const successor = resolveCanonicalMesocycleSuccessor({ macrocycleId: `${plan.planId}:macrocycle`, macrocycleEngine: engineForGoal(plan.macrocycle.goal), currentMesocycleId: command.mesocycleId as never, decisionId: decision.decision.decisionId, evaluationId: command.evaluationId, evidenceIds: actual, outcome: decision.decision.outcome === "transition" ? "transition" : "deload", successorMesocycleId: decision.decision.successorMesocycleId as never, sequenceNumber: plan.microcycle.sequenceNumber + 1, planRevision: plan.revision });
    if (successor.status !== "resolved") return rejected(command, plan.revision, successor.reason);
    const raw = canonicalActivePlanV2Repository.get();
    if (raw.status !== "saved") return rejected(command, plan.revision, "canonical_plan_unavailable");
    const facts = resolveCanonicalConstructionFacts(raw.carrier);
    if (facts.status !== "ready") return rejected(command, plan.revision, facts.reason);
    const constructed = constructCanonicalActivePlanFromCanonicalInputs({ planId: raw.carrier.planId, createdAt: raw.carrier.createdAt, updatedAt: new Date().toISOString(), goal: raw.carrier.constraints.goal, macrocycleGoal: successor.successor.engine === "hypertrophy" ? "build_muscle" : successor.successor.engine === "powerbuilding" ? "build_muscle_and_strength" : successor.successor.engine === "strength" ? "build_strength" : "athletic_performance", experienceLevel: raw.carrier.constraints.experienceLevel, daysPerWeek: raw.carrier.constraints.daysPerWeek as 2 | 3 | 4 | 5 | 6, preferredSplit: raw.carrier.constraints.preferredSplit as never, equipment: facts.facts.equipment, units: raw.carrier.constraints.units, availableSessionMinutes: raw.carrier.constraints.availableSessionMinutes, startingVolumeContext: raw.carrier.constraints.startingVolumeContext, selectedMesocycleId: successor.successorMesocycleId, microcycleSequenceNumber: successor.sequenceNumber, exercises: facts.facts.exercises, limitations: facts.facts.limitations, exercisePreferences: facts.facts.exercisePreferences, history: facts.facts.history, establishedLoads: facts.facts.establishedLoads, loadEvidence: facts.facts.loadEvidence });
    if (constructed.status !== "constructed") return rejected(command, plan.revision, "canonical_future_session_construction_failed");
    const nextRevision = raw.carrier.revision + 1;
    const generated = { ...constructed.carrier, mesocycle: { ...constructed.carrier.mesocycle, position: raw.carrier.mesocycle.position + 1, transitionReference: decision.decision.decisionId }, revision: nextRevision, progress: { ...constructed.carrier.progress, revision: nextRevision, decisionReference: decision.decision.decisionId }, constructionInputs: facts.facts.references, constructionContext: raw.carrier.constructionContext ?? constructed.carrier.constructionContext, recordedSessionReferences: raw.carrier.recordedSessionReferences ?? [], cycleLineage: [...(raw.carrier.cycleLineage ?? []).map((entry) => entry.microcycleId === raw.carrier.microcycle.id ? { ...entry, status: "predecessor" as const, transitionDecisionId: decision.decision.decisionId } : entry), ...(constructed.carrier.cycleLineage ?? [])] };
    const saved = canonicalActivePlanV2Repository.saveAtomically(generated, raw.carrier.revision);
    if (saved.status !== "saved") return rejected(command, plan.revision, saved.status === "conflict" ? "stale_plan_revision" : "canonical_plan_save_failed");
    canonicalProgressDecisionRepository.consume(command.decisionId);
    return { status: "applied", reason: "canonical_successor_applied", planId: command.planId, priorRevision: raw.carrier.revision, newRevision: nextRevision, decisionId: command.decisionId, stateChanged: true, futureSessionsRegenerated: true, reviewRequired: false };
  }
  canonicalProgressDecisionRepository.consume(command.decisionId);
  return { status: "unchanged", reason: "continue_requires_no_plan_change", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
}

function applyPhaseOneDecision(
  command: CanonicalProgressDecisionApplicationCommand,
  decision: import("@/domain/training/canonical-progress-decision").CanonicalProgressDecision,
  currentRevision: number,
): CanonicalProgressDecisionApplicationResult {
  const details = decision.phaseOne!;
  if (details.decisionType === "maintain" || details.decisionType === "blocked") {
    const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, phaseOneReceipt(
      details,
      details.decisionType === "blocked" ? "blocked" : "unchanged",
      details.decisionType === "blocked" ? "blocked_no_change" : "explicit_no_change",
      details.decisionType === "blocked" ? "phase_one_adaptation_blocked" : "phase_one_prescription_maintained",
      decision.explanation,
      currentRevision,
      currentRevision,
      details.priorFutureSessionIds,
      [],
    ));
    if (recorded.status !== "saved" && recorded.status !== "duplicate") return rejected(command, currentRevision, "decision_application_receipt_failed");
    return { status: "unchanged", reason: details.decisionType === "blocked" ? "phase_one_adaptation_blocked" : "phase_one_prescription_maintained", planId: command.planId, priorRevision: currentRevision, newRevision: currentRevision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: details.decisionType === "blocked" };
  }
  const raw = canonicalActivePlanV2Repository.get();
  if (raw.status !== "saved" || raw.carrier.revision !== command.expectedPlanRevision) return rejected(command, currentRevision, "stale_plan_revision");
  const facts = resolveCanonicalConstructionFacts(raw.carrier);
  if (facts.status !== "ready") return rejected(command, currentRevision, facts.reason);
  const recalibrated = new Set(details.decisionType === "recalibrate" ? details.boundedAdjustment.exerciseIds : []);
  const establishedNow = new Set(details.decisionType === "establish_calibration" ? details.boundedAdjustment.exerciseIds : []);
  const establishedLoads = Object.fromEntries(Object.entries(facts.facts.establishedLoads).filter(([exerciseId]) => !recalibrated.has(exerciseId)));
  const loadEvidence = Object.fromEntries(Object.entries(facts.facts.loadEvidence).filter(([exerciseId]) => !recalibrated.has(exerciseId)));
  const transition = details.decisionType === "transition";
  let appliedTransition = transition;
  let appliedReason = `phase_one_${details.decisionType}_applied`;
  let appliedExplanation = decision.explanation;
  const boundaryContinuation = raw.carrier.plannedSessions.length === 0 && details.reasonCodes.includes("current_microcycle_completed");
  const advance = details.decisionType === "advance_microcycle" || transition || boundaryContinuation;
  const selectedMesocycleId = transition ? decision.successorMesocycleId : raw.carrier.mesocycle.id;
  if (!selectedMesocycleId) return rejected(command, currentRevision, "successor_not_approved");
  const constructionInput = {
    planId: raw.carrier.planId,
    createdAt: raw.carrier.createdAt,
    updatedAt: details.decidedAt,
    goal: raw.carrier.constraints.goal,
    macrocycleGoal: macrocycleGoalForCarrier(raw.carrier.macrocycle.output.goal),
    experienceLevel: raw.carrier.constraints.experienceLevel,
    daysPerWeek: raw.carrier.constraints.daysPerWeek as 2 | 3 | 4 | 5 | 6,
    preferredSplit: raw.carrier.constraints.preferredSplit as never,
    equipment: facts.facts.equipment,
    units: raw.carrier.constraints.units,
    targetDate: raw.carrier.constraints.targetDate,
    recoveryCardioPreference: raw.carrier.constraints.recoveryCardioPreference,
    availableSessionMinutes: raw.carrier.constraints.availableSessionMinutes,
    startingVolumeContext: raw.carrier.constraints.startingVolumeContext,
    selectedMesocycleId: selectedMesocycleId as never,
    microcycleSequenceNumber: advance ? raw.carrier.microcycle.output.sequenceNumber + 1 : raw.carrier.microcycle.output.sequenceNumber,
    exercises: facts.facts.exercises,
    limitations: facts.facts.limitations,
    exercisePreferences: facts.facts.exercisePreferences,
    history: facts.facts.history,
    establishedLoads,
    loadEvidence,
  } satisfies Parameters<typeof constructCanonicalActivePlanFromCanonicalInputs>[0];
  let constructed = constructCanonicalActivePlanFromCanonicalInputs(constructionInput);
  if (constructed.status !== "constructed" && transition) {
    const currentMesocycle = mesocycleById(raw.carrier.mesocycle.id as MesocycleId);
    const completedMicrocycles = new Set([
      raw.carrier.microcycle.id,
      ...(raw.carrier.cycleLineage ?? [])
        .filter((entry) => entry.mesocycleId === raw.carrier.mesocycle.id)
        .map((entry) => entry.microcycleId),
    ]).size;
    if (currentMesocycle && completedMicrocycles < currentMesocycle.maximumWeeks) {
      constructed = constructCanonicalActivePlanFromCanonicalInputs({
        ...constructionInput,
        selectedMesocycleId: raw.carrier.mesocycle.id as MesocycleId,
      });
      if (constructed.status === "constructed") {
        appliedTransition = false;
        appliedReason = "approved_successor_construction_unavailable_continued_within_horizon";
        appliedExplanation = "The approved next phase could not produce a compatible prescription from the athlete's current facts, so training safely continues in the current phase within its certified maximum horizon.";
      }
    } else if (currentMesocycle && completedMicrocycles >= currentMesocycle.maximumWeeks) {
      const reason = "approved_successor_construction_unavailable_at_maximum_horizon";
      const explanation = "The current phase has reached its certified maximum horizon, but the approved next phase cannot produce a compatible prescription from the athlete's current facts. A compatible successor or updated athlete facts are required before training can continue.";
      const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, phaseOneReceipt(
        details,
        "blocked",
        "blocked_no_change",
        reason,
        explanation,
        raw.carrier.revision,
        raw.carrier.revision,
        raw.carrier.plannedSessions.map((session) => session.id),
        [],
      ));
      if (recorded.status !== "saved" && recorded.status !== "duplicate") return rejected(command, currentRevision, "decision_application_receipt_failed");
      return { status: "unchanged", reason, planId: command.planId, priorRevision: raw.carrier.revision, newRevision: raw.carrier.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: true };
    }
  }
  if (constructed.status !== "constructed") return rejected(command, currentRevision, `canonical_future_session_construction_failed:${constructed.reason}`);
  const retainedIndexes = new Set(raw.carrier.plannedSessions.map((session) => session.planSessionIndex));
  const plannedSessions = advance ? constructed.carrier.plannedSessions : constructed.carrier.plannedSessions.filter((session) => retainedIndexes.has(session.planSessionIndex));
  if (!advance && plannedSessions.length !== raw.carrier.plannedSessions.length) return rejected(command, currentRevision, "future_session_identity_mismatch");
  const nextRevision = raw.carrier.revision + 1;
  const priorLineage = (raw.carrier.cycleLineage ?? []).map((entry) => advance && entry.microcycleId === raw.carrier.microcycle.id ? { ...entry, status: "predecessor" as const, transitionDecisionId: decision.decisionId } : entry);
  const newLineage = advance ? (constructed.carrier.cycleLineage ?? []).map((entry) => ({ ...entry, revision: nextRevision, status: "current" as const })) : [];
  const next = {
    ...constructed.carrier,
    mesocycle: appliedTransition ? { ...constructed.carrier.mesocycle, position: raw.carrier.mesocycle.position + 1, transitionReference: decision.decisionId } : { ...constructed.carrier.mesocycle, position: raw.carrier.mesocycle.position },
    plannedSessions,
    revision: nextRevision,
    progress: { ...constructed.carrier.progress, revision: nextRevision, decisionReference: decision.decisionId },
    constructionInputs: facts.facts.references,
    constructionContext: {
      ...(raw.carrier.constructionContext ?? constructed.carrier.constructionContext!),
      initialEstablishedLoads: establishedLoads,
      initialLoadEvidence: loadEvidence,
      recalibrationRequiredExerciseIds: [
        ...new Set([
          ...((raw.carrier.constructionContext?.recalibrationRequiredExerciseIds ?? []).filter((exerciseId) => !establishedNow.has(exerciseId))),
          ...recalibrated,
        ]),
      ].sort(),
    },
    recordedSessionReferences: raw.carrier.recordedSessionReferences ?? [],
    cycleLineage: advance ? [...priorLineage, ...newLineage] : raw.carrier.cycleLineage ?? [],
    planningRationale: {
      ...(constructed.carrier.planningRationale!),
      changeReasons: [...details.reasonCodes, `decision:${decision.decisionId}`],
    },
  };
  const material = compareCanonicalMaterialPrescriptions(raw.carrier.plannedSessions, plannedSessions);
  if (material.status === "ambiguous") {
    const reason = "grouped_method_semantic_identity_ambiguous";
    const explanation = "The reviewed future prescription was not changed because its grouped-method identity could not be reconstructed unambiguously.";
    const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, phaseOneReceipt(
      details,
      "blocked",
      "blocked_no_change",
      reason,
      explanation,
      raw.carrier.revision,
      raw.carrier.revision,
      raw.carrier.plannedSessions.map((session) => session.id),
      [],
    ));
    if (recorded.status !== "saved" && recorded.status !== "duplicate") return rejected(command, currentRevision, "decision_application_receipt_failed");
    return { status: "unchanged", receiptStatus: "blocked", reason, planId: command.planId, priorRevision: raw.carrier.revision, newRevision: raw.carrier.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: true };
  }
  if (material.status === "unchanged") {
    const reason = "material_prescription_delta_absent";
    const explanation = "The reviewed future prescription was already materially equivalent, so no plan revision was written.";
    const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, phaseOneReceipt(
      details,
      "unchanged",
      "explicit_no_change",
      reason,
      explanation,
      raw.carrier.revision,
      raw.carrier.revision,
      raw.carrier.plannedSessions.map((session) => session.id),
      [],
    ));
    if (recorded.status !== "saved" && recorded.status !== "duplicate") return rejected(command, currentRevision, "decision_application_receipt_failed");
    return { status: "unchanged", reason, planId: command.planId, priorRevision: raw.carrier.revision, newRevision: raw.carrier.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
  }
  const receipt = phaseOneReceipt(
    details,
    "applied",
    "future_prescription_change",
    appliedReason,
    appliedExplanation,
    raw.carrier.revision,
    nextRevision,
    plannedSessions.map((session) => session.id),
    material.deltas,
  );
  const prepared = canonicalCoachingApplicationIntentRepository.save({
    schemaVersion: "canonical_coaching_application_intent_v1",
    applicationAttemptId: command.decisionId,
    coachingWorkItemId: command.decisionId,
    decisionId: command.decisionId,
    planId: command.planId,
    expectedPreRevision: raw.carrier.revision,
    expectedPreStateFingerprint: canonicalDeterministicFingerprint(raw.carrier),
    resultingRevision: nextRevision,
    resultingStateFingerprint: canonicalDeterministicFingerprint(next),
    affectedFuturePrescriptionIdentities: material.deltas.map((item) => `${item.sessionKey}|${item.slotKey ?? ""}|${item.field}`).sort(),
    exactIntendedMaterialDelta: material.deltas,
    materialDeltaFingerprint: canonicalDeterministicFingerprint(material.deltas),
    expectedPreCarrier: raw.carrier,
    intendedResultCarrier: next,
    truthfulReceipt: receipt,
    status: "prepared",
    preparedAt: details.decidedAt,
  });
  if (prepared.status !== "saved" && prepared.status !== "duplicate") return rejected(command, currentRevision, "decision_application_intent_failed");
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, raw.carrier.revision);
  if (saved.status !== "saved") return rejected(command, currentRevision, saved.status === "conflict" ? "stale_plan_revision" : "canonical_plan_save_failed");
  const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, receipt);
  if (recorded.status !== "saved" && recorded.status !== "duplicate") {
    return rejected(command, nextRevision, "decision_application_receipt_reconciliation_required");
  }
  canonicalCoachingApplicationIntentRepository.remove(command.decisionId);
  return { status: "applied", reason: appliedReason, planId: command.planId, priorRevision: raw.carrier.revision, newRevision: nextRevision, decisionId: command.decisionId, stateChanged: true, futureSessionsRegenerated: true, reviewRequired: false };
}

function reconcilePreparedApplication(
  command: CanonicalProgressDecisionApplicationCommand,
  current: import("@/domain/training/canonical-active-plan-carrier").CanonicalActivePlanCarrier,
): CanonicalProgressDecisionApplicationResult | null {
  const prepared = canonicalCoachingApplicationIntentRepository.get(command.decisionId);
  if (prepared.status === "not_found") {
    if (current.progress.decisionReference === command.decisionId) {
      return rejected(command, current.revision, "application_intent_missing_for_committed_decision");
    }
    return null;
  }
  if (prepared.status !== "found") return rejected(command, current.revision, "application_intent_corrupt");
  const intent = prepared.intent;
  if (intent.planId !== command.planId || intent.expectedPreRevision !== command.expectedPlanRevision) return rejected(command, current.revision, "application_intent_identity_conflict");
  const currentFingerprint = canonicalDeterministicFingerprint(current);
  if (currentFingerprint === intent.resultingStateFingerprint) {
    const actual = compareCanonicalMaterialPrescriptions(intent.expectedPreCarrier.plannedSessions, current.plannedSessions);
    if (actual.status !== "changed" || canonicalDeterministicFingerprint(actual.deltas) !== intent.materialDeltaFingerprint) {
      canonicalCoachingApplicationIntentRepository.save({ ...intent, status: "terminal_blocked", terminalReason: "committed_state_material_delta_ambiguous", resolvedAt: intent.truthfulReceipt.appliedAt });
      return rejected(command, current.revision, "committed_state_material_delta_ambiguous");
    }
    const receipt = { ...intent.truthfulReceipt, materialDeltas: actual.deltas, resultingFutureSessionIds: current.plannedSessions.map((session) => session.id).sort() };
    const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, receipt);
    if (recorded.status !== "saved" && recorded.status !== "duplicate") return rejected(command, current.revision, "decision_application_receipt_failed");
    canonicalCoachingApplicationIntentRepository.remove(command.decisionId);
    return { status: "unchanged", receiptStatus: "applied", reason: "decision_application_receipt_reconstructed", planId: command.planId, priorRevision: intent.expectedPreRevision, newRevision: intent.resultingRevision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: true, reviewRequired: false };
  }
  if (currentFingerprint === intent.expectedPreStateFingerprint) return null;
  canonicalCoachingApplicationIntentRepository.save({ ...intent, status: "terminal_blocked", terminalReason: "application_state_conflict", resolvedAt: intent.truthfulReceipt.appliedAt });
  return rejected(command, current.revision, "application_state_conflict");
}

function rejected(command: CanonicalProgressDecisionApplicationCommand, revision: number, reason: string): CanonicalProgressDecisionApplicationResult { return { status: "rejected", reason, planId: command.planId, priorRevision: revision, newRevision: revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false }; }

function engineForGoal(goal: string): "hypertrophy" | "powerbuilding" | "strength" | "athletic_performance" { return goal === "build_muscle_and_strength" ? "powerbuilding" : goal === "build_strength" || goal === "powerlifting_meet" ? "strength" : goal === "athletic_performance" ? "athletic_performance" : "hypertrophy"; }
function macrocycleGoalForCarrier(goal: string): Parameters<typeof constructCanonicalActivePlanFromCanonicalInputs>[0]["macrocycleGoal"] { return goal === "build_muscle_and_strength" ? "build_muscle_and_strength" : goal === "build_strength" || goal === "powerlifting_meet" ? "build_strength" : goal === "athletic_performance" ? "athletic_performance" : goal === "get_leaner" ? "get_leaner" : "build_muscle"; }

function phaseOneReceipt(
  details: import("@/domain/training/canonical-progress-decision").CanonicalPhaseOneDecisionDetails,
  status: CanonicalPhaseOneApplicationReceipt["status"],
  actualResult: "future_prescription_change" | "explicit_no_change" | "blocked_no_change",
  reasonCode: string,
  explanation: string,
  priorRevision: number,
  newRevision: number,
  resultingFutureSessionIds: readonly string[],
  materialDeltas: readonly CanonicalMaterialPrescriptionDelta[],
): CanonicalPhaseOneApplicationReceiptV2 {
  return {
    schemaVersion: "canonical_coaching_application_receipt_v2",
    status,
    actualResult,
    reasonCode,
    explanation,
    priorRevision,
    newRevision,
    resultingFutureSessionIds: [...resultingFutureSessionIds].sort(),
    materialDeltas,
    ...(status === "blocked" ? {
      boundaryState: {
        schemaVersion: "canonical_coaching_boundary_state_v1" as const,
        status: "review_required" as const,
        reasonCode,
        missingFactOrPolicy: missingBoundaryFact(reasonCode, details.reasonCodes),
        currentTrainingSafelyUsable: details.priorFutureSessionIds.length > 0 && !details.reasonCodes.some((reason) => reason.includes("safety") || reason.includes("pain") || reason.includes("identity")),
        resolutionEvent: boundaryResolutionEvent(reasonCode, details.reasonCodes),
        completedSessionId: details.sourceRecordedSessionId,
        macrocycleId: details.contextIdentity.macrocycleId,
        mesocycleId: details.contextIdentity.mesocycleId,
        microcycleId: details.contextIdentity.microcycleId,
        unresolvedBoundary: reasonCode.includes("maximum_horizon")
          ? "maximum_horizon" as const
          : details.priorFutureSessionIds.length === 0
            ? "final_session" as const
            : "ordinary_session" as const,
        resolutionFingerprint: canonicalDeterministicFingerprint({
          reasonCode,
          reasonCodes: [...details.reasonCodes].sort(),
          evidenceSummary: details.evidenceSummary,
          contextIdentity: details.contextIdentity,
        }),
      },
    } : {}),
    appliedAt: details.decidedAt,
  };
}

function missingBoundaryFact(reasonCode: string, reasonCodes: readonly string[]): string {
  const reasons = [reasonCode, ...reasonCodes];
  if (reasons.some((reason) => reason.includes("grouped_method_semantic"))) return "unambiguous_grouped_method_prescription_semantics";
  if (reasons.some((reason) => reason.includes("successor"))) return "approved_constructible_successor";
  if (reasons.some((reason) => reason.includes("recovery"))) return "resolved_recovery_evidence";
  if (reasons.some((reason) => reason.includes("pain") || reason.includes("safety"))) return "resolved_safety_or_limitation_evidence";
  if (reasons.some((reason) => reason.includes("identity"))) return "unambiguous_canonical_performed_work_identity";
  if (reasons.some((reason) => reason.includes("construction_context"))) return "canonical_construction_facts";
  if (reasons.some((reason) => reason.includes("completion"))) return "durable_completion_evidence";
  return "policy_qualified_progress_evidence";
}

function boundaryResolutionEvent(
  reasonCode: string,
  reasonCodes: readonly string[],
): "canonical_progress_evidence_persisted" | "canonical_construction_facts_persisted" | "canonical_successor_policy_approved" {
  const reasons = [reasonCode, ...reasonCodes];
  if (reasons.some((reason) => reason.includes("successor") || reason.includes("maximum_horizon"))) return "canonical_successor_policy_approved";
  if (reasons.some((reason) => reason.includes("construction_context") || reason.includes("grouped_method_semantic"))) return "canonical_construction_facts_persisted";
  return "canonical_progress_evidence_persisted";
}
