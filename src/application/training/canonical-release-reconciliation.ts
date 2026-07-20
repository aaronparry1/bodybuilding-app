import { constructCanonicalActivePlanFromCanonicalInputs, type CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import type { CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import { validateCanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";

export const CANONICAL_RELEASE_RECONCILIATION_VERSION = "canonical_release_reconciliation_v1" as const;

export type CanonicalReleaseReconciliationResult = Readonly<{
  status: "ready" | "reconstructed" | "onboarding_required" | "setup_required" | "recovery_required" | "retry_required" | "infeasible";
  reason: string;
  planVisible: boolean;
  historyPreserved: boolean;
  activeAttempt: "none" | "resumable" | "unsafe";
  priorRevision?: number;
  newRevision?: number;
  regeneratedFutureSessions: number;
  customerGuidance?: string;
}>;

export type CanonicalOnboardingPlanCommitResult = Readonly<{
  status: "saved" | "rejected";
  reason: string;
  priorRevision: number | null;
  newRevision: number | null;
  historyPreserved: boolean;
}>;

/** Commits setup over an interrupted/stale carrier without allowing that
 * carrier to bypass onboarding. Completed references are retained; an active
 * attempt must be resolved first because changing its parent prescription
 * would make the immutable attempt ambiguous. */
export function commitCanonicalOnboardingPlan(command: CanonicalGeneratedPlanInput): CanonicalOnboardingPlanCommitResult {
  const previous = canonicalActivePlanV2Repository.get();
  if (previous.status === "invalid") return { status: "rejected", reason: `unrestorable_existing_plan:${previous.reason}`, priorRevision: null, newRevision: null, historyPreserved: true };
  if (previous.status === "saved") {
    const active = inspectActiveAttempt(previous.carrier);
    if (active.status !== "none") return { status: "rejected", reason: active.status === "unsafe" ? active.reason : "active_attempt_must_be_completed_or_discarded", priorRevision: previous.carrier.revision, newRevision: previous.carrier.revision, historyPreserved: true };
  }
  const planId = previous.status === "saved" ? previous.carrier.planId : command.planId;
  const createdAt = previous.status === "saved" ? previous.carrier.createdAt : command.createdAt;
  const constructed = constructCanonicalActivePlanFromCanonicalInputs({ ...command, planId, createdAt });
  if (constructed.status !== "constructed") return { status: "rejected", reason: constructed.reason, priorRevision: previous.status === "saved" ? previous.carrier.revision : null, newRevision: previous.status === "saved" ? previous.carrier.revision : null, historyPreserved: true };
  const nextRevision = previous.status === "saved" ? previous.carrier.revision + 1 : constructed.carrier.revision;
  const next: CanonicalActivePlanCarrier = previous.status === "saved" ? {
    ...constructed.carrier,
    revision: nextRevision,
    progress: { ...constructed.carrier.progress, revision: nextRevision },
    recordedSessionReferences: previous.carrier.recordedSessionReferences ?? [],
    cycleLineage: mergeLineage(previous.carrier, constructed.carrier, nextRevision),
  } : constructed.carrier;
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, previous.status === "saved" ? previous.carrier.revision : undefined);
  if (saved.status !== "saved") return { status: "rejected", reason: saved.status === "conflict" ? "stale_plan_revision" : "atomic_onboarding_commit_failed", priorRevision: previous.status === "saved" ? previous.carrier.revision : null, newRevision: previous.status === "saved" ? previous.carrier.revision : null, historyPreserved: true };
  return { status: "saved", reason: previous.status === "saved" ? "onboarding_replaced_future_prescriptions" : "onboarding_created_canonical_plan", priorRevision: previous.status === "saved" ? previous.carrier.revision : null, newRevision: saved.carrier.revision, historyPreserved: previous.status !== "saved" || JSON.stringify(saved.carrier.recordedSessionReferences ?? []) === JSON.stringify(previous.carrier.recordedSessionReferences ?? []) };
}

/**
 * Release-start reconciliation never installs legacy plan authority. It accepts
 * only a validated canonical carrier, validates immutable active attempts from
 * the ledger, and reconstructs stale future prescriptions through the current
 * canonical owners. Completed ledger aggregates are never rewritten.
 */
export function reconcileCanonicalReleaseState(input: Readonly<{ onboardingCompleted: boolean; updatedAt: string }>): CanonicalReleaseReconciliationResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (!input.onboardingCompleted) {
    return result("onboarding_required", "onboarding_must_complete_before_plan_activation", false, true, "none", 0, {
      customerGuidance: "Complete setup before starting a programme.",
    });
  }
  if (loaded.status === "missing") return result("setup_required", "canonical_plan_missing_after_onboarding", false, true, "none", 0, { customerGuidance: "Set up your programme to continue." });
  if (loaded.status === "invalid") return result("recovery_required", `canonical_plan_unrestorable:${loaded.reason}`, false, true, "unsafe", 0, { customerGuidance: "Your programme needs recovery before training can continue. Your recorded workout history has not been changed." });

  const active = inspectActiveAttempt(loaded.carrier);
  if (active.status === "unsafe") return result("recovery_required", active.reason, false, true, "unsafe", 0, { priorRevision: loaded.carrier.revision, newRevision: loaded.carrier.revision, customerGuidance: "This workout cannot be resumed safely. Your recorded work remains stored for recovery." });
  const current = inspectFuturePrescriptions(loaded.carrier);
  if (current.status === "current") return result("ready", active.status === "resumable" ? "current_plan_with_compatible_active_attempt" : "current_plan", true, true, active.status, 0, { priorRevision: loaded.carrier.revision, newRevision: loaded.carrier.revision });

  const facts = resolveCanonicalConstructionFacts(loaded.carrier);
  if (facts.status !== "ready") return result("recovery_required", facts.reason, false, true, active.status, 0, { priorRevision: loaded.carrier.revision, newRevision: loaded.carrier.revision, customerGuidance: "The exercise catalogue needed to rebuild future workouts is unavailable. Recorded history remains unchanged." });
  const constructed = constructCanonicalActivePlanFromCanonicalInputs({
    planId: loaded.carrier.planId,
    createdAt: loaded.carrier.createdAt,
    updatedAt: input.updatedAt,
    goal: loaded.carrier.constraints.goal,
    macrocycleGoal: macrocycleGoalForCarrier(loaded.carrier),
    experienceLevel: loaded.carrier.constraints.experienceLevel,
    daysPerWeek: loaded.carrier.constraints.daysPerWeek as CanonicalGeneratedPlanInput["daysPerWeek"],
    preferredSplit: loaded.carrier.constraints.preferredSplit as CanonicalGeneratedPlanInput["preferredSplit"],
    equipment: facts.facts.equipment,
    units: loaded.carrier.constraints.units,
    targetDate: loaded.carrier.constraints.targetDate,
    recoveryCardioPreference: loaded.carrier.constraints.recoveryCardioPreference,
    availableSessionMinutes: loaded.carrier.constraints.availableSessionMinutes,
    startingVolumeContext: loaded.carrier.constraints.startingVolumeContext,
    microcycleSequenceNumber: loaded.carrier.microcycle.output.sequenceNumber,
    exercises: facts.facts.exercises,
    limitations: facts.facts.limitations,
    history: facts.facts.history,
    establishedLoads: facts.facts.establishedLoads,
  });
  if (constructed.status !== "constructed") {
    const infeasible = constructed.reason.includes("chronic_volume_floor_unmet");
    return result(infeasible ? "infeasible" : "recovery_required", `future_reconstruction_failed:${constructed.reason}`, false, true, active.status, 0, {
      priorRevision: loaded.carrier.revision,
      newRevision: loaded.carrier.revision,
      customerGuidance: infeasible
        ? "Your current workout length cannot preserve the programme’s required rolling coverage. Choose a longer workout or restart setup with fewer training days."
        : "Future workouts could not be rebuilt safely. Recorded history remains unchanged.",
    });
  }

  const nextRevision = loaded.carrier.revision + 1;
  const next: CanonicalActivePlanCarrier = {
    ...constructed.carrier,
    revision: nextRevision,
    progress: { ...constructed.carrier.progress, revision: nextRevision },
    recordedSessionReferences: loaded.carrier.recordedSessionReferences ?? [],
    cycleLineage: mergeLineage(loaded.carrier, constructed.carrier, nextRevision),
    constructionInputs: facts.facts.references,
    operational: active.status === "resumable" ? loaded.carrier.operational : constructed.carrier.operational,
  };
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, loaded.carrier.revision);
  if (saved.status !== "saved") return result("retry_required", saved.status === "conflict" ? "stale_plan_revision" : "atomic_reconstruction_failed", false, true, active.status, 0, { priorRevision: loaded.carrier.revision, newRevision: loaded.carrier.revision, customerGuidance: "Programme recovery was interrupted before anything changed. Try again." });
  return result("reconstructed", current.reason, true, true, active.status, saved.carrier.plannedSessions.length, { priorRevision: loaded.carrier.revision, newRevision: nextRevision });
}

export function inspectFuturePrescriptions(carrier: CanonicalActivePlanCarrier): Readonly<{ status: "current" | "stale"; reason: string }> {
  if (carrier.constraints.availableSessionMinutes === undefined) return { status: "stale", reason: "duration_not_persisted" };
  for (const session of carrier.plannedSessions) {
    if (session.constructionVersion !== "canonical_plan_v3") return { status: "stale", reason: "historical_session_construction" };
    const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
    if (snapshot.schemaVersion !== "canonical_session_snapshot_v3") return { status: "stale", reason: "historical_future_snapshot" };
    if (!Number.isInteger(snapshot.estimatedDurationMinutes) || Number(snapshot.estimatedDurationMinutes) < 1 || Number(snapshot.estimatedDurationMinutes) > carrier.constraints.availableSessionMinutes) return { status: "stale", reason: "duration_estimate_not_persisted" };
    if (!Array.isArray(snapshot.slots) || !snapshot.slots.length) return { status: "stale", reason: "empty_future_prescription" };
    for (const slot of snapshot.slots as Array<Record<string, unknown>>) {
      if (!Number.isInteger(slot.targetReps) || Number(slot.targetReps) < 1) return { status: "stale", reason: "target_reps_not_persisted" };
      if (validateCanonicalLoadPrescription(slot.loadPrescription).status !== "valid") return { status: "stale", reason: "historical_load_prescription" };
    }
  }
  return { status: "current", reason: "current_future_prescriptions" };
}

function inspectActiveAttempt(carrier: CanonicalActivePlanCarrier): Readonly<{ status: "none" | "resumable" | "unsafe"; reason: string }> {
  const active = (carrier.recordedSessionReferences ?? []).filter((reference) => reference.status === "started" || reference.status === "paused");
  if (!active.length) return { status: "none", reason: "no_active_attempt" };
  if (active.length !== 1) return { status: "unsafe", reason: "multiple_active_attempts" };
  const reference = active[0]!;
  const aggregate = canonicalRecordedSessionLedger.get(reference.sessionId);
  if (aggregate.status !== "found") return { status: "unsafe", reason: "active_attempt_missing_from_ledger" };
  const session = aggregate.session;
  if (session.planId !== carrier.planId || session.microcycleId !== reference.microcycleId || session.status !== reference.status || session.prescriptionHash !== JSON.stringify(session.prescriptionSnapshot)) return { status: "unsafe", reason: "active_attempt_immutable_linkage_mismatch" };
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  if (!["canonical_session_snapshot_v2", "canonical_session_snapshot_v3"].includes(String(snapshot.schemaVersion)) || !Array.isArray(snapshot.slots) || !snapshot.slots.length) return { status: "unsafe", reason: "active_attempt_prescription_unrestorable" };
  return { status: "resumable", reason: "immutable_active_attempt_compatible" };
}

function mergeLineage(previous: CanonicalActivePlanCarrier, current: CanonicalActivePlanCarrier, revision: number): CanonicalActivePlanCarrier["cycleLineage"] {
  const entries = new Map((previous.cycleLineage ?? []).map((entry) => [entry.microcycleId, entry]));
  for (const entry of current.cycleLineage ?? []) entries.set(entry.microcycleId, { ...entry, revision });
  return [...entries.values()].sort((a, b) => a.sequenceNumber - b.sequenceNumber || a.microcycleId.localeCompare(b.microcycleId));
}

function macrocycleGoalForCarrier(carrier: CanonicalActivePlanCarrier): CanonicalGeneratedPlanInput["macrocycleGoal"] {
  const goal = carrier.macrocycle.output.goal;
  return goal === "build_muscle_and_strength" ? "build_muscle_and_strength" : goal === "build_strength" || goal === "powerlifting_meet" ? "build_strength" : goal === "athletic_performance" ? "athletic_performance" : goal === "get_leaner" ? "get_leaner" : "build_muscle";
}

function result(status: CanonicalReleaseReconciliationResult["status"], reason: string, planVisible: boolean, historyPreserved: boolean, activeAttempt: CanonicalReleaseReconciliationResult["activeAttempt"], regeneratedFutureSessions: number, extra: Partial<CanonicalReleaseReconciliationResult> = {}): CanonicalReleaseReconciliationResult {
  return { status, reason, planVisible, historyPreserved, activeAttempt, regeneratedFutureSessions, ...extra };
}
