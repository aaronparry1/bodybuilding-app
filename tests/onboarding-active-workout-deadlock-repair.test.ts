import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appSettingsStore, defaultAppSettings } from "@/application/settings/app-settings";
import { createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  inspectCanonicalRetainedTrainingPresence,
  resolveCanonicalExistingUserRoute,
} from "@/application/training/canonical-existing-user-routing";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { readCanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import { reconcileCanonicalReleaseState } from "@/application/training/canonical-release-reconciliation";
import { resolveCanonicalStartupHydration } from "@/application/training/canonical-startup-hydration";
import { prescriptionHash, startCanonicalSession } from "@/application/training/canonical-recorded-session-application";
import type { CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import { exerciseLibrary } from "@/domain/training/presets";

const now = "2026-07-30T08:00:00.000Z";

function command(planId = "retained-update-plan"): CanonicalGeneratedPlanInput {
  return {
    planId,
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "advanced",
    daysPerWeek: 5,
    preferredSplit: "push_pull_legs",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    recoveryCardioPreference: "recommended",
    availableSessionMinutes: 90,
    startingVolumeContext: {
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 3,
      recentSessionWorkload: "high",
      recentSessionDurationMinutes: 90,
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

function createRetainedPlan(planId = "retained-update-plan") {
  expect(createCanonicalActivePlan(command(planId)).status).toBe("ok");
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("retained fixture plan missing");
  return loaded.carrier;
}

function startRetainedWorkout(planId = "retained-update-plan") {
  const carrier = createRetainedPlan(planId);
  const planned = carrier.plannedSessions[0]!;
  const started = startCanonicalSession({
    planId: carrier.planId,
    expectedPlanRevision: carrier.revision,
    plannedSessionId: planned.id,
    expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
    operationId: `${planId}:start`,
    startedAt: now,
    provenance: "retained_testflight_update_fixture",
  });
  expect(started.status).toBe("started");
  const current = canonicalActivePlanV2Repository.get();
  if (current.status !== "saved") throw new Error("started carrier missing");
  return { carrier: current.carrier, recordedSessionId: started.recordedSessionId! };
}

function hydration(accountDataStatus: "idle" | "restoring" | "ready" | "error" = "ready") {
  const presence = inspectCanonicalRetainedTrainingPresence("user-1");
  return resolveCanonicalStartupHydration({
    authLoading: false,
    authenticatedUserId: "user-1",
    localPlanStatus: presence.localPlanStatus,
    retainedTrainingStatus: presence.status,
    accountDataStatus,
  });
}

function route(reconciliation: ReturnType<typeof reconcileCanonicalReleaseState> | null, options: { hydration?: ReturnType<typeof hydration>; onboarding?: boolean; restart?: boolean } = {}) {
  return resolveCanonicalExistingUserRoute({
    hydration: options.hydration ?? hydration(),
    reconciliation,
    isOnboardingRoute: options.onboarding ?? true,
    explicitSetupRestart: options.restart ?? false,
  });
}

describe("genuine retained-update onboarding active-workout P0 repair", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    appSettingsStore.resetCache();
    canonicalRecordedSessionLedger.clear();
    canonicalActivePlanState.hydrate();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes an existing programme with stale onboarding metadata to authenticated tabs", () => {
    createRetainedPlan();
    appSettingsStore.set({ ...defaultAppSettings, onboardingCompleted: false });
    const reconciliation = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(route(reconciliation)).toEqual({
      status: "authenticated",
      destination: "tabs",
      reason: "validated_existing_plan_outranks_onboarding",
    });
  });

  it("routes an active workout with stale onboarding metadata directly to Train", () => {
    const active = startRetainedWorkout();
    appSettingsStore.set({ ...defaultAppSettings, onboardingCompleted: false });
    const beforeCarrier = JSON.stringify(canonicalActivePlanV2Repository.get());
    const beforeLedger = JSON.stringify(canonicalRecordedSessionLedger.exportPlan(active.carrier.planId));
    const reconciliation = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(reconciliation).toMatchObject({ status: "ready", planVisible: true, activeAttempt: "resumable" });
    expect(route(reconciliation)).toEqual({
      status: "authenticated",
      destination: "active_workout",
      reason: "resumable_active_workout_outranks_onboarding",
    });
    expect(JSON.stringify(canonicalActivePlanV2Repository.get())).toBe(beforeCarrier);
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(active.carrier.planId))).toBe(beforeLedger);
  });

  it("waits when the active workout hydrates before its programme", () => {
    const active = startRetainedWorkout("active-first");
    expect(canonicalActivePlanOwnerRepository.save({
      planId: active.carrier.planId,
      ownerUserId: "user-1",
      boundAt: now,
      provenance: "existing_authenticated_device_migration",
    }).status).toBe("owned");
    const carrier = active.carrier;
    canonicalActivePlanV2Repository.clear();
    expect(inspectCanonicalRetainedTrainingPresence("user-1")).toMatchObject({
      status: "active_workout_without_plan",
      activeRecordedSessionId: active.recordedSessionId,
    });
    expect(hydration("restoring")).toEqual({ status: "waiting", reason: "account_data_restoring" });
    expect(canonicalActivePlanV2Repository.save(carrier).status).toBe("saved");
    expect(hydration("ready")).toEqual({ status: "ready", reason: "local_plan_available" });
  });

  it("fails safely until the ledger arrives when the programme hydrates first", () => {
    const active = startRetainedWorkout("programme-first");
    const ledger = canonicalRecordedSessionLedger.exportPlan(active.carrier.planId);
    canonicalRecordedSessionLedger.clear();
    expect(reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    })).toMatchObject({ status: "recovery_required", reason: "active_attempt_missing_from_ledger" });
    expect(canonicalRecordedSessionLedger.restorePlan(ledger).status).toBe("restored");
    expect(reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    })).toMatchObject({ status: "ready", planVisible: true, activeAttempt: "resumable" });
  });

  it("does not let onboarding metadata hydration finish before training authorities", () => {
    appSettingsStore.set({ ...defaultAppSettings, onboardingCompleted: true });
    const waiting = resolveCanonicalStartupHydration({
      authLoading: false,
      authenticatedUserId: "user-1",
      localPlanStatus: "missing",
      retainedTrainingStatus: "none",
      accountDataStatus: "restoring",
    });
    expect(waiting).toEqual({ status: "waiting", reason: "account_data_restoring" });
    expect(resolveCanonicalExistingUserRoute({
      hydration: waiting,
      reconciliation: null,
      isOnboardingRoute: false,
      explicitSetupRestart: false,
    }).status).toBe("waiting");
  });

  it("waits for delayed authentication restoration", () => {
    expect(resolveCanonicalStartupHydration({
      authLoading: true,
      authenticatedUserId: null,
      localPlanStatus: "missing",
      retainedTrainingStatus: "none",
      accountDataStatus: "idle",
    })).toEqual({ status: "waiting", reason: "authentication_loading" });
  });

  it("binds a legacy unowned programme once without changing training state", () => {
    const carrier = createRetainedPlan("legacy-owner-binding");
    const before = JSON.stringify(carrier);
    expect(canonicalActivePlanOwnerRepository.get().status).toBe("missing");
    const reconciliation = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(reconciliation.ownerBinding).toBe("bound_from_existing_authenticated_device");
    expect(canonicalActivePlanOwnerRepository.get()).toMatchObject({
      status: "owned",
      record: { planId: carrier.planId, ownerUserId: "user-1" },
    });
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status).toBe("saved");
    if (after.status === "saved") expect(JSON.stringify(after.carrier)).toBe(before);
  });

  it("keeps a recoverable active workout out of onboarding while its programme is unavailable", () => {
    const active = startRetainedWorkout("recoverable-parent");
    expect(canonicalActivePlanOwnerRepository.save({
      planId: active.carrier.planId,
      ownerUserId: "user-1",
      boundAt: now,
      provenance: "existing_authenticated_device_migration",
    }).status).toBe("owned");
    canonicalActivePlanV2Repository.clear();
    const decision = resolveCanonicalExistingUserRoute({
      hydration: hydration("ready"),
      reconciliation: null,
      isOnboardingRoute: true,
      explicitSetupRestart: false,
    });
    expect(decision).toEqual({ status: "recovery", reason: "retained_training_relationship_unresolved" });
  });

  it("fails closed when an active workout belongs to another account", () => {
    const active = startRetainedWorkout("other-account");
    expect(canonicalActivePlanOwnerRepository.save({
      planId: active.carrier.planId,
      ownerUserId: "user-1",
      boundAt: now,
      provenance: "authenticated_onboarding",
    }).status).toBe("owned");
    expect(inspectCanonicalRetainedTrainingPresence("user-2")).toMatchObject({
      status: "account_mismatch",
      reason: "retained_training_belongs_to_different_account",
    });
  });

  it("recovers from a temporary plan read failure without inferring first run", () => {
    createRetainedPlan("temporary-read");
    const get = vi.spyOn(canonicalActivePlanV2Repository, "get");
    get.mockReturnValueOnce({ status: "invalid", reason: "storage_read_failed" });
    const failedPresence = inspectCanonicalRetainedTrainingPresence("user-1");
    expect(failedPresence).toMatchObject({ status: "unreadable", reason: "canonical_plan_unrestorable:storage_read_failed" });
    expect(resolveCanonicalStartupHydration({
      authLoading: false,
      authenticatedUserId: "user-1",
      localPlanStatus: failedPresence.localPlanStatus,
      retainedTrainingStatus: failedPresence.status,
      accountDataStatus: "ready",
    }).status).toBe("retry_required");
    get.mockRestore();
    expect(inspectCanonicalRetainedTrainingPresence("user-1").status).toBe("plan");
  });

  it("converges duplicate startup effects without duplicate ownership or revision changes", () => {
    const carrier = createRetainedPlan("duplicate-startup");
    const first = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    const second = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: "2026-07-30T08:01:00.000Z",
    });
    expect(first.ownerBinding).toBe("bound_from_existing_authenticated_device");
    expect(second.ownerBinding).toBe("unchanged");
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({ status: "saved", carrier: { planId: carrier.planId, revision: carrier.revision } });
  });

  it("survives app termination during retained-state restoration", () => {
    const active = startRetainedWorkout("termination");
    reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    jsonStore.resetCache();
    appSettingsStore.resetCache();
    expect(inspectCanonicalRetainedTrainingPresence("user-1")).toMatchObject({
      status: "plan_with_active_workout",
      activeRecordedSessionId: active.recordedSessionId,
    });
  });

  it("models a direct retained-data update from the failed candidate", () => {
    const active = startRetainedWorkout("failed-candidate-update");
    appSettingsStore.set({ ...defaultAppSettings, onboardingCompleted: false });
    jsonStore.resetCache();
    appSettingsStore.resetCache();
    const reconciliation = reconcileCanonicalReleaseState({
      onboardingCompleted: appSettingsStore.get().onboardingCompleted,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(route(reconciliation)).toMatchObject({ status: "authenticated", destination: "active_workout" });
    expect(canonicalRecordedSessionLedger.get(active.recordedSessionId)).toMatchObject({ status: "found", session: { status: "started" } });
  });

  it("remains restored across two subsequent restarts", () => {
    const active = startRetainedWorkout("double-restart");
    for (let index = 0; index < 2; index += 1) {
      reconcileCanonicalReleaseState({
        onboardingCompleted: false,
        authenticatedUserId: "user-1",
        accessMode: "authenticated",
        updatedAt: `2026-07-30T08:0${index}:00.000Z`,
      });
      jsonStore.resetCache();
      appSettingsStore.resetCache();
      expect(inspectCanonicalRetainedTrainingPresence("user-1")).toMatchObject({
        status: "plan_with_active_workout",
        activeRecordedSessionId: active.recordedSessionId,
      });
    }
  });

  it("retains onboarding for a genuinely new authenticated user after hydration completes", () => {
    const reconciliation = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "new-user",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(route(reconciliation, { hydration: hydration("ready") })).toMatchObject({ status: "onboarding" });
  });

  it("keeps signed-out access behind the auth boundary", () => {
    const production = readFileSync("src/application/shell/production-protected-layout.tsx", "utf8");
    expect(production).toContain('if (!user && !isOfflineMode) return <Redirect href="/(auth)" />');
  });

  it("uses the same canonical route contract at startup and Create Programme", () => {
    const production = readFileSync("src/application/shell/production-protected-layout.tsx", "utf8");
    const onboarding = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    for (const source of [production, onboarding]) {
      expect(source).toContain("resolveCanonicalExistingUserRoute");
      expect(source).toContain("inspectCanonicalRetainedTrainingPresence");
      expect(source).toContain("resolveCanonicalStartupHydration");
    }
  });

  it("makes the prior unactionable finish-or-discard warning unreachable", () => {
    const onboarding = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    expect(onboarding).not.toContain("Finish or discard your current workout, then return here");
    expect(onboarding).toContain("Try restoring training");
    expect(onboarding).toContain('/(protected)/(tabs)/train');
  });

  it("production mounts hydration, ownership backfill and retained-state routing", () => {
    const production = readFileSync("src/application/shell/production-protected-layout.tsx", "utf8");
    expect(production).toContain("useSubscription");
    expect(production).toContain("dataHydrationStatus");
    expect(production).toContain("backfillExistingUserOnboardingMetadata");
    expect(production).toContain("authenticatedUserId: user?.id ?? null");
    expect(production).not.toContain("if (!settings.onboardingCompleted");
  });

  it("keeps Home, Plan and Train on the same active-workout identity after restoration", () => {
    const active = startRetainedWorkout("screen-consistency");
    reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    const state = canonicalActivePlanState.hydrate();
    expect(state.hydration).toBe("hydrated");
    expect(state.model?.activeRecordedSession?.recordedSessionId).toBe(active.recordedSessionId);
    expect(readCanonicalHomeProjection().primary?.action).toMatchObject({
      type: "resume_recorded_session",
      sessionId: active.recordedSessionId,
    });
    expect(readCanonicalPlanPresentation().primaryAction).toMatchObject({
      type: "resume_recorded_session",
      sessionId: active.recordedSessionId,
    });
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession?.recordedSessionId).toBe(active.recordedSessionId);
  });

  it("preserves prescription, cycle, history and performed-work state byte-for-byte", () => {
    const active = startRetainedWorkout("preservation");
    const before = {
      carrier: JSON.stringify(canonicalActivePlanV2Repository.get()),
      ledger: JSON.stringify(canonicalRecordedSessionLedger.exportPlan(active.carrier.planId)),
      owner: JSON.stringify(canonicalActivePlanOwnerRepository.get()),
    };
    const first = reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: now,
    });
    expect(first.planVisible).toBe(true);
    const afterFirst = {
      carrier: JSON.stringify(canonicalActivePlanV2Repository.get()),
      ledger: JSON.stringify(canonicalRecordedSessionLedger.exportPlan(active.carrier.planId)),
    };
    expect(afterFirst.carrier).toBe(before.carrier);
    expect(afterFirst.ledger).toBe(before.ledger);
    const ownerAfterBinding = JSON.stringify(canonicalActivePlanOwnerRepository.get());
    reconcileCanonicalReleaseState({
      onboardingCompleted: false,
      authenticatedUserId: "user-1",
      accessMode: "authenticated",
      updatedAt: "2026-07-30T08:02:00.000Z",
    });
    expect(JSON.stringify(canonicalActivePlanV2Repository.get())).toBe(before.carrier);
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(active.carrier.planId))).toBe(before.ledger);
    expect(JSON.stringify(canonicalActivePlanOwnerRepository.get())).toBe(ownerAfterBinding);
  });
});
