import { loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import type { CanonicalPhaseOneApplicationReceipt } from "@/domain/training/canonical-progress-decision";
import { compareCanonicalMaterialPrescriptions, type CanonicalMaterialPrescriptionDelta } from "@/domain/training/canonical-material-prescription-delta";
import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";

export type CanonicalProgressDecisionApplicationCommand = Readonly<{ planId: string; expectedPlanRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; decisionId: string; evaluationId: string; expectedEvidenceIds: readonly string[] }>;
export type CanonicalProgressDecisionApplicationResult = Readonly<{ status: "unchanged" | "applied" | "rejected"; reason: string; planId: string; priorRevision: number; newRevision: number; decisionId: string; stateChanged: boolean; futureSessionsRegenerated: boolean; reviewRequired: boolean }>;

/** Coordinates canonical identity validation. Transition/regeneration remains owned by Mesocycle/Microcycle/Session Construction. */
export function applyCanonicalProgressDecision(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  const loaded = loadCanonicalActivePlan();
  if (loaded.status !== "ok") return rejected(command, 0, "canonical_plan_unavailable");
  const plan = loaded.model;
  if (plan.planId !== command.planId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  const currentCarrier = canonicalActivePlanV2Repository.get();
  if (currentCarrier.status === "saved" && currentCarrier.carrier.progress.decisionReference === command.decisionId) {
    canonicalProgressDecisionRepository.consume(command.decisionId);
    return { status: "unchanged", reason: "decision_already_applied", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
  }
  if (plan.revision !== command.expectedPlanRevision) return rejected(command, plan.revision, "stale_plan_revision");
  if (plan.macrocycle.goal === "" || plan.mesocycle.id !== command.mesocycleId || plan.microcycle.id !== command.microcycleId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  const decision = canonicalProgressDecisionRepository.get(command.decisionId);
  if (decision.status !== "found") return rejected(command, plan.revision, "decision_not_found");
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
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, raw.carrier.revision);
  if (saved.status !== "saved") return rejected(command, currentRevision, saved.status === "conflict" ? "stale_plan_revision" : "canonical_plan_save_failed");
  const recorded = canonicalProgressDecisionRepository.recordApplication(command.decisionId, phaseOneReceipt(
    details,
    "applied",
    "future_prescription_change",
    appliedReason,
    appliedExplanation,
    raw.carrier.revision,
    nextRevision,
    plannedSessions.map((session) => session.id),
    material.deltas,
  ));
  if (recorded.status !== "saved" && recorded.status !== "duplicate") {
    const rollback = canonicalActivePlanV2Repository.saveAtomically(raw.carrier, nextRevision);
    return rejected(command, rollback.status === "saved" ? raw.carrier.revision : nextRevision, rollback.status === "saved" ? "decision_application_receipt_failed" : "decision_receipt_rollback_failed");
  }
  return { status: "applied", reason: appliedReason, planId: command.planId, priorRevision: raw.carrier.revision, newRevision: nextRevision, decisionId: command.decisionId, stateChanged: true, futureSessionsRegenerated: true, reviewRequired: false };
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
): CanonicalPhaseOneApplicationReceipt {
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
    appliedAt: details.decidedAt,
  };
}
