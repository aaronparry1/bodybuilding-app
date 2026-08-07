import { appSettingsStore } from "@/application/settings/app-settings";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { getLocalStorageKeys } from "@/data/local/local-storage";
import { jsonStore } from "@/data/local/json-store";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";

export type AndroidRecoveryEvidence = Readonly<{
  schema: "android_recovery_evidence_v1";
  collectedAt: string;
  persistentStorageReadable: boolean;
  database: Readonly<{ authority: "expo_sqlite_kv_store"; schemaVersion: "expo_managed"; initialization: "ready" }>;
  stores: Readonly<{ legacyPlan: string; legacyWorkoutCount: number; canonicalPlan: string; canonicalRecordedSessionCount: number; canonicalOwner: string }>;
  identity: Readonly<{ authenticated: boolean; ownerPresent: boolean; ownerMatchesAuthenticatedAccount: boolean | null; planMatchesOwner: boolean | null }>;
  migration: Readonly<{ migrationMarkerPresent: boolean; recoverySourcePresent: boolean; customisationCount: number }>;
  reconciliation: Readonly<{ status: "consistent" | "not_applicable" | "attention_required"; activeWorkoutCount: number }>;
  onboardingCompleted: boolean;
  sync: Readonly<{ state: "never_completed" | "completed" | "failed" | "pending"; queuedItems: number; lastErrorCodePresent: boolean }>;
  backup: Readonly<{ local: "verified_readable"; account: "never_verified" | "verified" | "failed" | "pending" }>;
  knownStorageKeysPresent: readonly string[];
}>;

/** Read-only, count-only evidence for a controlled diagnostic build. */
export function collectAndroidRecoveryEvidence(authenticatedUserId: string | null, collectedAt = new Date().toISOString()): AndroidRecoveryEvidence {
  const keys = getLocalStorageKeys();
  const legacyPlan = safe(() => activeTrainingPlanRepository.getOptional(), null);
  const legacyWorkouts = safe(() => workoutSessionRepository.list(), []);
  const canonical = canonicalActivePlanV2Repository.get();
  const owner = canonicalActivePlanOwnerRepository.get();
  const settings = appSettingsStore.get();
  const sync = safe(() => jsonStore.get<{ lastSuccessAt?: string; lastError?: string }>("iron-logic.sync-diagnostics-status", {}), {});
  const queueCount = safe(() => new LocalSyncQueueStore().read().length, 0);
  const carrier = canonical.status === "saved" ? canonical.carrier : null;
  const recordedCount = carrier ? safe(() => canonicalRecordedSessionLedger.list(carrier.planId).length, 0) : 0;
  const active = safe(() => canonicalRecordedSessionLedger.inspectActive(), { status: "invalid" as const, reason: "active_workout_storage_read_failed", sessions: [] });
  const ownerConsistent = !carrier || (owner.status === "owned" && owner.record.planId === carrier.planId && (!authenticatedUserId || owner.record.ownerUserId === authenticatedUserId));
  const syncState = sync.lastError ? "failed" : queueCount > 0 ? "pending" : sync.lastSuccessAt ? "completed" : "never_completed";
  return {
    schema: "android_recovery_evidence_v1",
    collectedAt,
    persistentStorageReadable: true,
    database: { authority: "expo_sqlite_kv_store", schemaVersion: "expo_managed", initialization: "ready" },
    stores: { legacyPlan: legacyPlan ? "present" : "missing", legacyWorkoutCount: legacyWorkouts.length, canonicalPlan: canonical.status, canonicalRecordedSessionCount: recordedCount, canonicalOwner: owner.status },
    identity: { authenticated: Boolean(authenticatedUserId), ownerPresent: owner.status === "owned", ownerMatchesAuthenticatedAccount: owner.status === "owned" && authenticatedUserId ? owner.record.ownerUserId === authenticatedUserId : null, planMatchesOwner: owner.status === "owned" && carrier ? owner.record.planId === carrier.planId : null },
    migration: { migrationMarkerPresent: Boolean(carrier?.operational.migrationId), recoverySourcePresent: Boolean(carrier?.operational.recoverySourceReference), customisationCount: carrier?.operational.exerciseCustomisations?.length ?? 0 },
    reconciliation: { status: !carrier ? "not_applicable" : ownerConsistent && active.status !== "invalid" ? "consistent" : "attention_required", activeWorkoutCount: active.sessions.length },
    onboardingCompleted: settings.onboardingCompleted,
    sync: { state: syncState, queuedItems: queueCount, lastErrorCodePresent: Boolean(sync.lastError) },
    backup: { local: "verified_readable", account: syncState === "completed" ? "verified" : syncState === "never_completed" ? "never_verified" : syncState },
    knownStorageKeysPresent: keys.filter((key) => key.startsWith("iron-logic.")).sort(),
  };
}

function safe<T>(read: () => T, fallback: T): T { try { return read(); } catch { return fallback; } }
