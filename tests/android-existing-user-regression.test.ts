import { beforeEach, describe, expect, it } from "vitest";
import { appSettingsStore } from "@/application/settings/app-settings";
import { recoverLegacyExistingUserTraining } from "@/application/training/legacy-existing-user-recovery";
import { sameCanonicalReconciliation } from "@/application/training/stable-reconciliation";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { jsonStore } from "@/data/local/json-store";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";

describe("Android existing-user upgrade regression", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    appSettingsStore.resetCache();
  });

  it("migrates a populated legacy programme without deleting its rollback source or history", () => {
    const legacy = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 4, preferredSplit: "upper_lower", experienceLevel: "intermediate" }, "2026-06-01T10:00:00.000Z");
    activeTrainingPlanRepository.save(legacy);
    const exercise = exerciseLibrary.find((candidate) => candidate.movementPattern === "horizontal_push")!;
    workoutSessionRepository.save({ id: "retained-workout", userId: "user-1", name: "Retained workout", startedAt: "2026-07-01T10:00:00.000Z", completedAt: "2026-07-01T11:00:00.000Z", updatedAt: "2026-07-01T11:00:00.000Z", syncState: "synced", exercises: [{ id: "retained-exercise", exerciseId: exercise.id, exerciseName: exercise.name, settings: exercise.defaultSettings, load: 80, status: "complete", sets: [{ id: "retained-set", setNumber: 1, reps: 8, load: 80, loggedAt: "2026-07-01T10:15:00.000Z" }] }] });
    appSettingsStore.patch({ onboardingCompleted: true });

    const result = recoverLegacyExistingUserTraining("user-1");

    expect(result).toMatchObject({ status: "recovered", legacyPlanId: legacy.id, historyRecordsRetained: 1 });
    expect(activeTrainingPlanRepository.getOptional()?.id).toBe(legacy.id);
    expect(workoutSessionRepository.list().map((session) => session.id)).toContain("retained-workout");
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({ status: "saved", carrier: { planId: legacy.id } });
    expect(canonicalActivePlanOwnerRepository.get()).toMatchObject({ status: "owned", record: { ownerUserId: "user-1", planId: legacy.id } });
    expect(recoverLegacyExistingUserTraining("user-1")).toEqual({ status: "not_required", reason: "canonical_plan_present" });
  });

  it("blocks empty onboarding when history exists but its programme cannot be recovered", () => {
    const exercise = exerciseLibrary[0]!;
    workoutSessionRepository.save({ id: "orphaned-history", name: "History", startedAt: "2026-07-01T10:00:00.000Z", completedAt: "2026-07-01T11:00:00.000Z", updatedAt: "2026-07-01T11:00:00.000Z", syncState: "local", exercises: [{ id: "e", exerciseId: exercise.id, exerciseName: exercise.name, settings: exercise.defaultSettings, load: 50, status: "complete", sets: [{ id: "s", setNumber: 1, reps: 8, load: 50, loggedAt: "2026-07-01T10:10:00.000Z" }] }] });

    expect(recoverLegacyExistingUserTraining("user-1")).toMatchObject({ status: "blocked", reason: "legacy_history_present_without_recoverable_plan", historyRecordsRetained: 1 });
    expect(canonicalActivePlanV2Repository.get()).toEqual({ status: "missing" });
  });

  it("treats equivalent startup reconciliation snapshots as stable", () => {
    const result = { status: "ready", reason: "current_plan", planVisible: true, historyPreserved: true, activeAttempt: "none", regeneratedFutureSessions: 0 } as const;
    expect(sameCanonicalReconciliation(result, { ...result })).toBe(true);
    expect(sameCanonicalReconciliation(result, { ...result, reason: "changed" })).toBe(false);
  });
});
