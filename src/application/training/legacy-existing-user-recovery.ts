import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { appSettingsStore } from "@/application/settings/app-settings";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import type { ActiveTrainingPlan, TrainingSetupGoal } from "@/domain/training/plan-setup";

export const LEGACY_EXISTING_USER_RECOVERY_VERSION = "legacy_existing_user_recovery_v1" as const;

export type LegacyExistingUserRecoveryResult = Readonly<
  | { status: "not_required"; reason: "canonical_plan_present" | "no_legacy_plan" }
  | { status: "recovered"; planId: string; legacyPlanId: string; historyRecordsRetained: number }
  | { status: "blocked"; reason: string; legacyPlanId?: string; historyRecordsRetained: number }
>;

/**
 * One-way, non-destructive bridge for devices upgraded from the legacy plan
 * authority. The legacy plan and workout stores are deliberately retained as
 * the rollback/recovery source. Nothing is written until a complete canonical
 * carrier has been constructed in memory and validated by the repository.
 */
export function recoverLegacyExistingUserTraining(ownerUserId: string | null): LegacyExistingUserRecoveryResult {
  const current = canonicalActivePlanV2Repository.get();
  if (current.status === "saved" || current.status === "invalid") {
    return current.status === "saved"
      ? { status: "not_required", reason: "canonical_plan_present" }
      : { status: "blocked", reason: `canonical_plan_unreadable:${current.reason}`, historyRecordsRetained: workoutHistoryRepository.listCompletedSessions().length };
  }

  let legacyPlan: ActiveTrainingPlan | null;
  try {
    legacyPlan = activeTrainingPlanRepository.getOptional();
  } catch (error) {
    return { status: "blocked", reason: error instanceof Error ? `legacy_plan_unreadable:${error.message}` : "legacy_plan_unreadable", historyRecordsRetained: workoutHistoryRepository.listCompletedSessions().length };
  }
  if (!legacyPlan) {
    const retainedHistory = workoutHistoryRepository.listCompletedSessions().length;
    return retainedHistory > 0
      ? { status: "blocked", reason: "legacy_history_present_without_recoverable_plan", historyRecordsRetained: retainedHistory }
      : { status: "not_required", reason: "no_legacy_plan" };
  }

  const settings = appSettingsStore.get();
  const history = workoutHistoryRepository.listSummaries();
  const constructed = constructCanonicalActivePlanFromCanonicalInputs({
    planId: legacyPlan.id,
    createdAt: legacyPlan.createdAt,
    updatedAt: new Date().toISOString(),
    goal: legacyPlan.programmeGoal,
    macrocycleGoal: macrocycleGoal(legacyPlan.goal),
    experienceLevel: legacyPlan.experienceLevel,
    daysPerWeek: clampTrainingDays(legacyPlan.daysPerWeek),
    preferredSplit: legacyPlan.preferredSplit,
    equipment: legacyPlan.equipment,
    units: settings.unit,
    targetDate: legacyPlan.targetDate,
    recoveryCardioPreference: legacyPlan.recoveryCardioPreference,
    availableSessionMinutes: settings.availableSessionMinutes,
    startingVolumeContext: settings.startingVolumeContext,
    microcycleSequenceNumber: legacyPlan.currentMicrocycle?.sequenceNumber,
    selectedMesocycleId: legacyPlan.currentMesocycleId,
    exercises: customExerciseRepository.listAll(),
    exercisePreferences: legacyPlan.recommendationState?.exercisePreferences,
    history,
  });
  if (constructed.status !== "constructed") {
    return { status: "blocked", reason: `legacy_plan_reconstruction_failed:${constructed.reason}`, legacyPlanId: legacyPlan.id, historyRecordsRetained: history.length };
  }

  const recoveryCarrier = {
    ...constructed.carrier,
    operational: {
      ...constructed.carrier.operational,
      migrationId: `${LEGACY_EXISTING_USER_RECOVERY_VERSION}:${legacyPlan.id}`,
      recoverySourceReference: `local:iron-logic.active-training-plan:${legacyPlan.id}`,
    },
  };
  const saved = canonicalActivePlanV2Repository.saveAtomically(recoveryCarrier);
  if (saved.status !== "saved") {
    return { status: "blocked", reason: `canonical_recovery_write_failed:${saved.status === "missing" ? "missing_after_write" : saved.reason}`, legacyPlanId: legacyPlan.id, historyRecordsRetained: history.length };
  }

  if (ownerUserId) {
    const owner = canonicalActivePlanOwnerRepository.save({
      planId: saved.carrier.planId,
      ownerUserId,
      boundAt: recoveryCarrier.updatedAt,
      provenance: "existing_authenticated_device_migration",
    });
    if (owner.status !== "owned") {
      // The canonical carrier did not exist before this operation, so removing
      // only that new carrier restores the exact pre-migration state. Legacy
      // data remains untouched throughout.
      canonicalActivePlanV2Repository.clear();
      return { status: "blocked", reason: `canonical_recovery_owner_failed:${owner.status === "invalid" ? owner.reason : "write_failed"}`, legacyPlanId: legacyPlan.id, historyRecordsRetained: history.length };
    }
  }

  return { status: "recovered", planId: saved.carrier.planId, legacyPlanId: legacyPlan.id, historyRecordsRetained: history.length };
}

function clampTrainingDays(value: number): 3 | 4 | 5 | 6 {
  return Math.min(6, Math.max(3, Math.round(value))) as 3 | 4 | 5 | 6;
}

function macrocycleGoal(goal: TrainingSetupGoal): "build_muscle" | "build_strength" | "build_muscle_and_strength" | "athletic_performance" | "get_leaner" | "powerlifting_meet" {
  return goal;
}
