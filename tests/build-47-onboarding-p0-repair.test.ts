import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import {
  backfillExistingUserOnboardingMetadata,
  completeCanonicalOnboardingSetup,
  createCanonicalOnboardingSubmissionGate,
  normalizeRecentTrainingInput,
} from "@/application/training/canonical-onboarding-setup";
import { reconcileCanonicalReleaseState } from "@/application/training/canonical-release-reconciliation";
import { appSettingsStore, defaultAppSettings } from "@/application/settings/app-settings";
import { buildCloudUserDataBackup, restoreCloudDataForUser } from "@/application/sync/cloud-data-sync";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import { exerciseLibrary } from "@/domain/training/presets";
import type { CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { prescriptionHash, startCanonicalSession } from "@/application/training/canonical-recorded-session-application";
import { resolveCanonicalStartupHydration } from "@/application/training/canonical-startup-hydration";

const now = "2026-07-29T08:00:00.000Z";
const equipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;

function command(planId = "build-47-existing", daysPerWeek: 2 | 3 | 4 | 5 | 6 = 5): CanonicalGeneratedPlanInput {
  return {
    planId,
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "intermediate",
    daysPerWeek,
    preferredSplit: daysPerWeek === 6 ? "push_pull_legs" : daysPerWeek >= 4 ? "upper_lower" : "full_body",
    equipment,
    units: "kg",
    recoveryCardioPreference: "recommended",
    availableSessionMinutes: 75,
    startingVolumeContext: {
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 3,
      recentSessionWorkload: "moderate",
      recentSessionDurationMinutes: 60,
      recovery: "ordinary",
      history: "none",
      workCapacity: "not_demonstrated",
      concurrentSport: "none",
      loadConfidence: "calibration_required",
      dosageConfidence: "declared_recent_training",
    },
    exercises: exerciseLibrary,
  };
}

function createPlan(planId = "build-47-existing") {
  const result = createCanonicalActivePlan(command(planId));
  expect(result.status).toBe("ok");
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("fixture plan missing");
  return loaded.carrier;
}

describe("Build 47 emergency onboarding P0 repair", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    appSettingsStore.resetCache();
    canonicalRecordedSessionLedger.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lets a validated pre-update programme outrank missing onboarding metadata without changing the carrier", () => {
    const carrier = createPlan();
    const before = JSON.stringify(carrier);
    const result = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(result).toMatchObject({
      status: "ready",
      planVisible: true,
      historyPreserved: true,
      onboardingMetadataBackfillRequired: true,
      ownerBinding: "bound_from_existing_authenticated_device",
    });
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status).toBe("saved");
    if (after.status === "saved") expect(JSON.stringify(after.carrier)).toBe(before);
  });

  it("backfills only compatible settings derived from the validated programme", () => {
    const carrier = createPlan();
    appSettingsStore.set({ ...defaultAppSettings, onboardingCompleted: false, unit: "lb", experienceLevel: "advanced" });
    expect(backfillExistingUserOnboardingMetadata()).toEqual({
      status: "backfilled",
      reason: "derived_from_validated_active_plan_constraints",
    });
    expect(appSettingsStore.get()).toMatchObject({
      onboardingCompleted: true,
      unit: carrier.constraints.units,
      trainingGoal: carrier.constraints.goal,
      experienceLevel: carrier.constraints.experienceLevel,
      recoveryCardioPreference: carrier.constraints.recoveryCardioPreference,
      availableSessionMinutes: carrier.constraints.availableSessionMinutes,
      startingVolumeContext: carrier.constraints.startingVolumeContext,
    });
  });

  it("does not classify a temporary programme read error as a new user", () => {
    vi.spyOn(canonicalActivePlanV2Repository, "get").mockReturnValueOnce({ status: "invalid", reason: "storage_read_failed" });
    expect(reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    })).toMatchObject({
      status: "recovery_required",
      reason: "canonical_plan_unrestorable:storage_read_failed",
      planVisible: false,
    });
  });

  it("keeps genuinely new, signed-out, and completed-without-plan states distinct", () => {
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: false, accessMode: "offline", updatedAt: now }).status).toBe("onboarding_required");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, accessMode: "offline", updatedAt: now }).status).toBe("setup_required");
    const layout = readFileSync("app/(protected)/_layout.tsx", "utf8");
    expect(layout).toContain('if (!user && !isOfflineMode) return <Redirect href="/(auth)" />');
  });

  it("keeps an explicit Settings restart available without making stale metadata authoritative", () => {
    const layout = readFileSync("app/(protected)/_layout.tsx", "utf8");
    const settings = readFileSync("app/(protected)/settings.tsx", "utf8");
    expect(settings).toContain('params: { restart: "1" }');
    expect(layout).toContain('const explicitSetupRestart = isOnboardingRoute && restart === "1"');
    expect(layout).toContain("reconciliation?.planVisible && isOnboardingRoute && !explicitSetupRestart");
  });

  it("waits through delayed authentication and account hydration without routing to onboarding", () => {
    expect(resolveCanonicalStartupHydration({
      authLoading: true,
      authenticatedUserId: null,
      localPlanStatus: "missing",
      accountDataStatus: "idle",
    })).toEqual({ status: "waiting", reason: "authentication_loading" });
    expect(resolveCanonicalStartupHydration({
      authLoading: false,
      authenticatedUserId: "user-1",
      localPlanStatus: "missing",
      accountDataStatus: "restoring",
    })).toEqual({ status: "waiting", reason: "account_data_restoring" });
    expect(resolveCanonicalStartupHydration({
      authLoading: false,
      authenticatedUserId: "user-1",
      localPlanStatus: "missing",
      accountDataStatus: "error",
    })).toEqual({ status: "retry_required", reason: "account_data_restore_failed" });
    expect(resolveCanonicalStartupHydration({
      authLoading: false,
      authenticatedUserId: "user-1",
      localPlanStatus: "saved",
      accountDataStatus: "restoring",
    })).toEqual({ status: "ready", reason: "local_plan_available" });
  });

  it("persists an account binding and blocks another account without exposing the plan", () => {
    createPlan();
    expect(reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    }).status).toBe("ready");
    expect(reconcileCanonicalReleaseState({
      onboardingCompleted: true,
      authenticatedUserId: "user-2",
      accessMode: "authenticated",
      updatedAt: "2026-07-29T09:00:00.000Z",
    })).toMatchObject({
      status: "recovery_required",
      reason: "active_plan_belongs_to_different_account",
      planVisible: false,
    });
    expect(buildCloudUserDataBackup({}, "user-2").canonicalActivePlan).toBeNull();
    expect(buildCloudUserDataBackup({}, "user-1").canonicalActivePlan).toBeTruthy();
  });

  it("survives cache reset, duplicate startup effects, and ownership migration retry", () => {
    const carrier = createPlan();
    const first = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    jsonStore.resetCache();
    appSettingsStore.resetCache();
    const second = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: "2026-07-29T08:01:00.000Z",
    });
    expect(first.ownerBinding).toBe("bound_from_existing_authenticated_device");
    expect(second.ownerBinding).toBe("unchanged");
    expect(canonicalActivePlanOwnerRepository.get()).toMatchObject({ status: "owned", record: { planId: carrier.planId, ownerUserId: "user-1" } });
  });

  it("preserves a resumable workout when compatible onboarding metadata is missing", () => {
    const carrier = createPlan("build-47-active-attempt");
    const planned = carrier.plannedSessions[0]!;
    expect(startCanonicalSession({
      planId: carrier.planId,
      expectedPlanRevision: carrier.revision,
      plannedSessionId: planned.id,
      expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
      operationId: "build-47:start",
      startedAt: now,
      provenance: "build_47_onboarding_p0_repair_test",
    }).status).toBe("started");
    const beforeLedger = JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId));
    const result = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: "2026-07-29T08:01:00.000Z",
    });
    expect(result).toMatchObject({
      status: "ready",
      planVisible: true,
      activeAttempt: "resumable",
      onboardingMetadataBackfillRequired: true,
    });
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId))).toBe(beforeLedger);
  });

  it("does not let cloud hydration overwrite an unbound existing local programme", async () => {
    const carrier = createPlan("build-47-local-wins");
    const backup = buildCloudUserDataBackup();
    const result = await restoreCloudDataForUser("user-1", {
      client: {} as never,
      programmeCloudRepository: { loadProgrammes: async () => [] },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => backup },
    });
    expect(result.restoredActivePlan).toBe(false);
    expect(canonicalActivePlanOwnerRepository.get().status).toBe("missing");
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({ status: "saved", carrier: { planId: carrier.planId } });
  });

  it("blocks all account-scoped cloud restoration when a local programme belongs to another account", async () => {
    const carrier = createPlan("build-47-account-switch");
    expect(canonicalActivePlanOwnerRepository.save({
      planId: carrier.planId,
      ownerUserId: "user-1",
      boundAt: now,
      provenance: "existing_authenticated_device_migration",
    }).status).toBe("owned");
    const cloudSettings = {
      ...buildCloudUserDataBackup({}, "user-1"),
      appSettings: { ...appSettingsStore.get(), onboardingCompleted: true, unit: "lb" as const },
    };
    const result = await restoreCloudDataForUser("user-2", {
      client: {} as never,
      programmeCloudRepository: { loadProgrammes: async () => [{
        id: "other-user-programme",
        name: "Other user",
        description: "Must not restore",
        sessions: [],
        durationWeeks: 1,
        daysPerWeek: 1,
        isPreset: false,
        isCustom: true,
        createdByUserId: "user-2",
      }] as never },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => cloudSettings },
    });
    expect(result).toMatchObject({
      restoredProgrammes: 0,
      restoredExercises: 0,
      restoredSettings: false,
      restoredActivePlan: false,
      accountScopeBlocked: true,
    });
    expect(appSettingsStore.get().unit).toBe("kg");
  });

  it("surfaces a failed settings restore rather than treating it as an empty new account", async () => {
    const result = await restoreCloudDataForUser("user-1", {
      client: {} as never,
      programmeCloudRepository: { loadProgrammes: async () => [] },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: {
        loadUserSettingsBlob: async () => {
          throw new Error("temporary network failure");
        },
      },
    });
    expect(result).toMatchObject({
      settingsReadStatus: "failed",
      restoredSettings: false,
      restoredActivePlan: false,
    });
  });

  it("retains recent-frequency only for current training and derives layoff frequency without a second choice", () => {
    expect(normalizeRecentTrainingInput({ continuity: "currently_training", recentTrainingDaysPerWeek: 0 })).toEqual({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 1,
    });
    expect(normalizeRecentTrainingInput({ continuity: "currently_training", recentTrainingDaysPerWeek: 5 })).toEqual({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 5,
    });
    expect(normalizeRecentTrainingInput({ continuity: "short_layoff", recentTrainingDaysPerWeek: 5 })).toEqual({
      continuity: "short_layoff",
      recentTrainingDaysPerWeek: 0,
    });
    expect(normalizeRecentTrainingInput({ continuity: "extended_layoff", recentTrainingDaysPerWeek: 7 })).toEqual({
      continuity: "extended_layoff",
      recentTrainingDaysPerWeek: 0,
    });
  });

  it("renders recent frequency conditionally as historical evidence rather than another schedule step", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    expect(source).toContain('continuity === "currently_training" ? (');
    expect(source).toContain("Your recent routine");
    expect(source).toContain("it does not change your new schedule");
    expect(source).not.toContain("Recent training days");
    expect(source).not.toContain("0 days per week");
  });

  it.each([2, 3, 4, 5, 6] as const)("still constructs one canonical programme for a supported %s-day schedule", (daysPerWeek) => {
    expect(createCanonicalActivePlan(command(`schedule-${daysPerWeek}`, daysPerWeek)).status).toBe("ok");
  });

  it("atomically persists one programme, owner and onboarding completion", () => {
    const input = command("atomic-onboarding");
    expect(completeCanonicalOnboardingSetup({
      command: input,
      ownerUserId: "user-1",
      settings: {
        unit: input.units,
        trainingGoal: input.goal,
        experienceLevel: input.experienceLevel,
        recoveryCardioPreference: input.recoveryCardioPreference!,
        availableSessionMinutes: input.availableSessionMinutes!,
        startingVolumeContext: input.startingVolumeContext!,
      },
    })).toMatchObject({ status: "saved", rollback: "not_required" });
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({ status: "saved", carrier: { planId: input.planId, revision: 0 } });
    expect(canonicalActivePlanOwnerRepository.get()).toMatchObject({ status: "owned", record: { planId: input.planId, ownerUserId: "user-1" } });
    expect(appSettingsStore.get().onboardingCompleted).toBe(true);
  });

  it("rolls programme, ownership and settings back when ownership persistence fails", () => {
    vi.spyOn(canonicalActivePlanOwnerRepository, "save").mockReturnValueOnce({ status: "invalid", reason: "owner_storage_write_failed" });
    const beforeSettings = appSettingsStore.get();
    const input = command("owner-failure");
    expect(completeCanonicalOnboardingSetup({
      command: input,
      ownerUserId: "user-1",
      settings: {
        unit: input.units,
        trainingGoal: input.goal,
        experienceLevel: input.experienceLevel,
        recoveryCardioPreference: input.recoveryCardioPreference!,
        availableSessionMinutes: input.availableSessionMinutes!,
        startingVolumeContext: input.startingVolumeContext!,
      },
    })).toMatchObject({
      status: "rejected",
      reason: "onboarding_owner_persistence_failed",
      rollback: "restored",
    });
    expect(canonicalActivePlanV2Repository.get().status).toBe("missing");
    expect(canonicalActivePlanOwnerRepository.get().status).toBe("missing");
    expect(appSettingsStore.get()).toEqual(beforeSettings);
  });

  it("makes repeated creation delivery idempotent and does not duplicate the first programme", () => {
    const input = command("idempotent-onboarding");
    const settings = {
      unit: input.units,
      trainingGoal: input.goal,
      experienceLevel: input.experienceLevel,
      recoveryCardioPreference: input.recoveryCardioPreference!,
      availableSessionMinutes: input.availableSessionMinutes!,
      startingVolumeContext: input.startingVolumeContext!,
    };
    const first = completeCanonicalOnboardingSetup({ command: input, ownerUserId: "user-1", settings });
    const saved = canonicalActivePlanV2Repository.get();
    const second = completeCanonicalOnboardingSetup({ command: input, ownerUserId: "user-1", settings });
    expect(first.status).toBe("saved");
    expect(second).toMatchObject({ status: "saved", priorRevision: 0, newRevision: 0 });
    expect(canonicalActivePlanV2Repository.get()).toEqual(saved);
  });

  it("admits only one rapid submission and permits a deterministic retry after failure", () => {
    const gate = createCanonicalOnboardingSubmissionGate();
    expect(gate.begin("same-answers")).toBe("started");
    expect(gate.begin("same-answers")).toBe("in_flight");
    expect(gate.begin("different-answers")).toBe("in_flight");
    gate.retry("same-answers");
    expect(gate.begin("same-answers")).toBe("started");
    gate.commit("same-answers");
    expect(gate.begin("same-answers")).toBe("already_committed");
    expect(gate.begin("changed-answers")).toBe("started");
  });

  it("uses a paint-yielding loading state, actionable error and the real tab destination", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    expect(source).toContain("submissionGateRef.current.begin");
    expect(source).toContain("await yieldForOnboardingFeedback()");
    expect(source).toContain('"Creating Programme…"');
    expect(source).toContain('router.replace("/(protected)/(tabs)")');
    expect(source).toContain("Your programme was not changed");
    expect(source).toContain("Open Programme");
    expect(source).not.toContain('router.replace("/(protected)")');
  });

  it("keeps the protected router on loading/error instead of interpreting incomplete hydration as onboarding", () => {
    const source = readFileSync("app/(protected)/_layout.tsx", "utf8");
    expect(source).toContain("waitingForAccountRestore");
    expect(source).toContain("accountRestoreFailedWithoutLocalPlan");
    expect(source).toContain("We couldn’t restore your training yet");
    expect(source).toContain("retryDataHydration");
    expect(source).toContain("reconciliation?.planVisible && isOnboardingRoute");
    expect(source).not.toContain("settings.onboardingCompleted && !activeFixture && reconciliation");
  });
});
