import { appSettingsStore, defaultAppSettings, type AppSettings } from "@/application/settings/app-settings";
import type { SubscriptionState } from "@/application/billing/subscription";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { serializeCanonicalActivePlan, validateCanonicalActivePlan } from "@/domain/training/canonical-active-plan-carrier";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { recoveryCapacityIgnoreRepository, type RecoveryCapacityIgnoreRecord } from "@/data/local/recovery-capacity-ignore-repository";
import { legacyTrainingYearArchive } from "@/application/training/legacy-training-year-archive";
import { ExerciseCloudRepository } from "@/data/cloud/exercise-cloud-repository";
import { ProgrammeCloudRepository } from "@/data/cloud/programme-cloud-repository";
import { UserSettingsCloudRepository } from "@/data/cloud/user-settings-cloud-repository";
import { restoreLegacyWorkoutHistoryForMigration } from "@/application/sync/legacy-workout-cloud-recovery";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import { WorkoutSyncService } from "@/data/sync/workout-sync-service";
import type { AppSupabaseClient } from "@/lib/supabase/client";
import type { Exercise, Programme, WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";

const cloudBackupSchema = "adaptive-strength-coach-cloud-backup";
const cloudBackupVersion = 1;
export interface CloudDataSyncStatus {
  lastRestoreAt?: string;
  lastSyncAttemptAt?: string;
  lastSyncSuccessAt?: string;
  lastError?: string;
  lastSyncedCount?: number;
  lastSkippedCount?: number;
  lastFailedCount?: number;
}

export interface CloudUserDataBackup {
  schema: typeof cloudBackupSchema;
  version: typeof cloudBackupVersion;
  updatedAt: string;
  appSettings: AppSettings;
  activeTrainingPlan?: ActiveTrainingPlan | null;
  canonicalActivePlan?: string | null;
  canonicalActivePlanRevision?: number;
  canonicalRecordedSessions?: readonly { session: import("@/domain/training/canonical-recorded-session-ledger").CanonicalRecordedSession; events: readonly import("@/domain/training/canonical-recorded-session-ledger").CanonicalRecordedSessionEvent[] }[];
  canonicalProgressEvidence?: readonly import("@/domain/training/canonical-progress-evidence").CanonicalProgressEvidence[];
  trainingYear?: unknown;
  recoveryCapacityIgnore?: RecoveryCapacityIgnoreRecord | null;
}

export interface CloudDataRestoreResult {
  restoredSessions: number;
  restoredExercises: number;
  restoredProgrammes: number;
  restoredSettings: boolean;
  restoredActivePlan: boolean;
  restoredTrainingYear: boolean;
  settingsReadStatus: "complete" | "failed" | "unavailable";
  accountScopeBlocked: boolean;
}

export interface CloudDataSyncResult {
  synced: number;
  skipped: number;
  failed: number;
}

export interface CloudDataSyncDependencies {
  client?: AppSupabaseClient | null;
  queue?: SyncQueue;
  workoutCloudRepository?: { loadWorkoutHistory?: (userId: string) => Promise<WorkoutSession[]> };
  programmeCloudRepository?: Pick<ProgrammeCloudRepository, "loadProgrammes"> & Partial<Pick<ProgrammeCloudRepository, "saveProgramme">>;
  exerciseCloudRepository?: Pick<ExerciseCloudRepository, "loadExercises"> & Partial<Pick<ExerciseCloudRepository, "saveCustomExercise">>;
  userSettingsCloudRepository?: Pick<UserSettingsCloudRepository, "loadUserSettingsBlob"> & Partial<Pick<UserSettingsCloudRepository, "saveUserSettingsBlob">>;
  workoutSyncService?: Pick<WorkoutSyncService, "flushQueue">;
  localWorkoutRepository?: { list(): WorkoutSession[]; save(session: WorkoutSession): void };
  localProgrammeRepository?: typeof programmeRepository;
  localExerciseRepository?: typeof customExerciseRepository;
  localActivePlanRepository?: unknown;
  localTrainingYearRepository?: typeof legacyTrainingYearArchive;
  localRecoveryIgnoreRepository?: typeof recoveryCapacityIgnoreRepository;
  localSettingsStore?: typeof appSettingsStore;
}

const defaultQueue = new SyncQueue(new LocalSyncQueueStore());

function logSyncStage(stage: string, error?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    if (error) {
      console.info(`[sync] ${stage}`, error);
    } else {
      console.info(`[sync] ${stage}`);
    }
  }
}

function now(): string {
  return new Date().toISOString();
}

async function resolveClient(dependencies: CloudDataSyncDependencies): Promise<AppSupabaseClient | null> {
  if (dependencies.client !== undefined) return dependencies.client;
  const { getOptionalSupabaseClient } = await import("@/lib/supabase/client");
  return getOptionalSupabaseClient().client;
}

function resolveRepositories(dependencies: CloudDataSyncDependencies, client: AppSupabaseClient) {
  return {
    programmeCloudRepository: dependencies.programmeCloudRepository ?? new ProgrammeCloudRepository(client),
    exerciseCloudRepository: dependencies.exerciseCloudRepository ?? new ExerciseCloudRepository(client),
    userSettingsCloudRepository: dependencies.userSettingsCloudRepository ?? new UserSettingsCloudRepository(client),
  };
}

export function buildCloudUserDataBackup(dependencies: CloudDataSyncDependencies = {}, ownerUserId?: string): CloudUserDataBackup {
  const settingsStore = dependencies.localSettingsStore ?? appSettingsStore;
  const canonical = canonicalActivePlanV2Repository.get();
  const ownership = canonicalActivePlanOwnerRepository.get();
  const canonicalMaySync = canonical.status === "saved"
    && (!ownerUserId
      || (ownership.status === "owned"
        && ownership.record.ownerUserId === ownerUserId
        && ownership.record.planId === canonical.carrier.planId));
  return {
    schema: cloudBackupSchema,
    version: cloudBackupVersion,
    updatedAt: now(),
    appSettings: settingsStore.get(),
    activeTrainingPlan: null,
    canonicalActivePlan: canonicalMaySync && canonical.status === "saved" ? serializeCanonicalActivePlan(canonical.carrier) : null,
    canonicalActivePlanRevision: canonicalMaySync && canonical.status === "saved" ? canonical.carrier.revision : undefined,
    canonicalRecordedSessions: canonicalMaySync && canonical.status === "saved" ? canonicalRecordedSessionLedger.exportPlan(canonical.carrier.planId) : [],
    canonicalProgressEvidence: canonicalMaySync && canonical.status === "saved" ? canonicalProgressEvidenceRepository.list(canonical.carrier.planId) : [],
    trainingYear: (dependencies.localTrainingYearRepository ?? legacyTrainingYearArchive).read(),
    recoveryCapacityIgnore: (dependencies.localRecoveryIgnoreRepository ?? recoveryCapacityIgnoreRepository).get(),
  };
}

export function isCloudUserDataBackup(value: unknown): value is CloudUserDataBackup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CloudUserDataBackup>;
  return candidate.schema === cloudBackupSchema && candidate.version === cloudBackupVersion && Boolean(candidate.appSettings);
}

export function mergeWorkoutSessions(localSessions: WorkoutSession[], cloudSessions: WorkoutSession[]): WorkoutSession[] {
  const byId = new Map<string, WorkoutSession>();
  for (const session of [...cloudSessions, ...localSessions]) {
    const existing = byId.get(session.id);
    if (!existing || isNewerSession(session, existing)) {
      byId.set(session.id, session);
    }
  }

  return [...byId.values()].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

function isNewerSession(candidate: WorkoutSession, existing: WorkoutSession): boolean {
  const candidateUpdated = new Date(candidate.updatedAt ?? candidate.completedAt ?? candidate.startedAt).getTime();
  const existingUpdated = new Date(existing.updatedAt ?? existing.completedAt ?? existing.startedAt).getTime();
  return candidateUpdated >= existingUpdated;
}

function shouldRestoreSettings(current: AppSettings): boolean {
  return !current.onboardingCompleted || JSON.stringify(current) === JSON.stringify(defaultAppSettings);
}

export async function restoreCloudDataForUser(
  userId: string,
  dependencies: CloudDataSyncDependencies = {},
): Promise<CloudDataRestoreResult> {
  const client = await resolveClient(dependencies);
  const localProgrammeRepository = dependencies.localProgrammeRepository ?? programmeRepository;
  const localExerciseRepository = dependencies.localExerciseRepository ?? customExerciseRepository;
  const localTrainingYearRepository = dependencies.localTrainingYearRepository ?? legacyTrainingYearArchive;
  const localRecoveryIgnoreRepository = dependencies.localRecoveryIgnoreRepository ?? recoveryCapacityIgnoreRepository;
  const localSettingsStore = dependencies.localSettingsStore ?? appSettingsStore;

  if (!client) {
    return {
      restoredSessions: 0,
      restoredExercises: 0,
      restoredProgrammes: 0,
      restoredSettings: false,
      restoredActivePlan: false,
      restoredTrainingYear: false,
      settingsReadStatus: "unavailable",
      accountScopeBlocked: false,
    };
  }

  const {
    programmeCloudRepository,
    exerciseCloudRepository,
    userSettingsCloudRepository,
  } = resolveRepositories(dependencies, client);

  let settingsReadStatus: CloudDataRestoreResult["settingsReadStatus"] = "complete";
  const [legacyWorkoutRecovery, cloudProgrammes, cloudExercises, cloudSettings] = await Promise.all([
    restoreLegacyWorkoutHistoryForMigration(userId, client, {
      ...(dependencies.workoutCloudRepository?.loadWorkoutHistory ? { cloud: { loadWorkoutHistory: dependencies.workoutCloudRepository.loadWorkoutHistory } } : {}),
      ...(dependencies.localWorkoutRepository ? { local: dependencies.localWorkoutRepository } : {}),
    }),
    programmeCloudRepository.loadProgrammes(userId).catch((error) => {
      logSyncStage("programme restore skipped", error);
      return [] as Programme[];
    }),
    exerciseCloudRepository.loadExercises(userId).catch((error) => {
      logSyncStage("exercise restore skipped", error);
      return [] as Exercise[];
    }),
    userSettingsCloudRepository.loadUserSettingsBlob(userId).catch((error) => {
      logSyncStage("settings restore skipped", error);
      settingsReadStatus = "failed";
      return null;
    }),
  ]);
  if (!legacyWorkoutRecovery.readable) settingsReadStatus = "failed";

  const localCanonicalPlan = canonicalActivePlanV2Repository.get();
  const localCanonicalOwner = canonicalActivePlanOwnerRepository.get();
  const accountScopeMismatch = localCanonicalOwner.status === "owned"
    && localCanonicalOwner.record.ownerUserId !== userId;
  if (accountScopeMismatch) {
    logSyncStage("account-scoped restore blocked by existing canonical plan ownership");
    return {
      restoredSessions: 0,
      restoredExercises: 0,
      restoredProgrammes: 0,
      restoredSettings: false,
      restoredActivePlan: false,
      restoredTrainingYear: false,
      settingsReadStatus,
      accountScopeBlocked: true,
    };
  }

  // Canonical recorded sessions are restored atomically from the versioned
  // backup envelope below. Legacy workout history is migration input only and
  // is retained in its legacy repository until an idempotent canonical
  // migration can prove ownership. Local records win ties and are never
  // replaced by an older cloud copy.
  const localProgrammeIds = new Set(localProgrammeRepository.listCustom().map((programme) => programme.id));
  const restorableProgrammes = cloudProgrammes.filter((programme) => programme.isCustom || programme.createdByUserId);
  for (const programme of restorableProgrammes) {
    if (!localProgrammeIds.has(programme.id)) {
      localProgrammeRepository.save(programme);
    }
  }

  const localExerciseIds = new Set(localExerciseRepository.listCustom().map((exercise) => exercise.id));
  const restorableExercises = cloudExercises.filter((exercise) => exercise.isCustom || exercise.createdByUserId);
  for (const exercise of restorableExercises) {
    if (!localExerciseIds.has(exercise.id)) {
      localExerciseRepository.save(exercise);
    }
  }

  let restoredSettings = false;
  let restoredActivePlan = false;
  let restoredTrainingYear = false;
  const shouldRestoreTrainingYear = shouldRestoreSettings(localSettingsStore.get());
  if (isCloudUserDataBackup(cloudSettings)) {
    if (shouldRestoreSettings(localSettingsStore.get())) {
      localSettingsStore.set(cloudSettings.appSettings);
      restoredSettings = true;
    }
    if (cloudSettings.canonicalActivePlan) {
      const parsed = validateCanonicalActivePlan(cloudSettings.canonicalActivePlan);
      if (parsed.status === "valid") {
        const ownershipAllowsRestore = localCanonicalOwner.status === "owned"
          ? localCanonicalOwner.record.ownerUserId === userId
          : localCanonicalPlan.status === "missing";
        if (!ownershipAllowsRestore) {
          logSyncStage("canonical plan restore deferred to local ownership migration");
        } else {
          const ledgerRestore = canonicalRecordedSessionLedger.restorePlan(cloudSettings.canonicalRecordedSessions ?? []);
          if (ledgerRestore.status !== "restored") {
            logSyncStage("canonical ledger restore rejected", ledgerRestore);
          } else {
            for (const evidence of cloudSettings.canonicalProgressEvidence ?? []) canonicalProgressEvidenceRepository.record(evidence);
          }
          const local = canonicalActivePlanV2Repository.get();
          const referencesResolve = (parsed.carrier.recordedSessionReferences ?? []).every((reference) => canonicalRecordedSessionLedger.get(reference.sessionId).status === "found");
          if (ledgerRestore.status === "restored" && referencesResolve && (local.status !== "saved" || parsed.carrier.revision > local.carrier.revision)) {
            const saved = canonicalActivePlanV2Repository.saveAtomically(parsed.carrier, local.status === "saved" ? local.carrier.revision : undefined);
            if (saved.status === "saved") {
              canonicalActivePlanOwnerRepository.save({ planId: saved.carrier.planId, ownerUserId: userId, boundAt: now(), provenance: "cloud_restore" });
              canonicalActivePlanState.hydrate();
              restoredActivePlan = true;
            }
          } else if (ledgerRestore.status === "restored" && referencesResolve && local.status === "saved" && parsed.carrier.revision === local.carrier.revision) {
            canonicalActivePlanOwnerRepository.save({ planId: local.carrier.planId, ownerUserId: userId, boundAt: now(), provenance: "cloud_restore" });
            restoredActivePlan = true;
          }
        }
      }
    } else if (cloudSettings.activeTrainingPlan) {
      // Legacy active plans remain migration input only; they are never installed as live state.
      logSyncStage("legacy active plan retained for canonical migration");
    }
    if (cloudSettings.trainingYear && shouldRestoreTrainingYear) {
      localTrainingYearRepository.write(cloudSettings.trainingYear);
      restoredTrainingYear = true;
    }
    if (!localRecoveryIgnoreRepository.get() && cloudSettings.recoveryCapacityIgnore) {
      localRecoveryIgnoreRepository.save(cloudSettings.recoveryCapacityIgnore);
    }
  } else if (cloudSettings && shouldRestoreSettings(localSettingsStore.get())) {
    localSettingsStore.set(cloudSettings as AppSettings);
    restoredSettings = true;
  }

  return {
    restoredSessions: legacyWorkoutRecovery.restored,
    restoredExercises: restorableExercises.filter((exercise) => !localExerciseIds.has(exercise.id)).length,
    restoredProgrammes: restorableProgrammes.filter((programme) => !localProgrammeIds.has(programme.id)).length,
    restoredSettings,
    restoredActivePlan,
    restoredTrainingYear,
    settingsReadStatus,
    accountScopeBlocked: false,
  };
}

export function enqueueLocalDataForAutomaticSync(
  userId: string,
  dependencies: CloudDataSyncDependencies = {},
): number {
  const queue = dependencies.queue ?? defaultQueue;
  const localProgrammeRepository = dependencies.localProgrammeRepository ?? programmeRepository;
  const localExerciseRepository = dependencies.localExerciseRepository ?? customExerciseRepository;

  // Canonical recorded sessions and progress evidence live inside the
  // versioned user-settings backup envelope below. Queueing them as a second,
  // unsupported entity type previously left permanent skipped work while the
  // UI could still report a successful account backup.

  localExerciseRepository.listCustom().forEach((exercise) => {
    queue.enqueue("custom_exercise", exercise.id, { ...exercise, createdByUserId: exercise.createdByUserId ?? userId }, userId);
  });

  localProgrammeRepository.listCustom().forEach((programme) => {
    queue.enqueue("programme", programme.id, { ...programme, createdByUserId: programme.createdByUserId ?? userId }, userId);
  });

  queue.enqueue("user_settings", userId, buildCloudUserDataBackup(dependencies, userId), userId);
  return queue.count();
}

export async function syncLocalDataForUser(
  userId: string,
  subscription: SubscriptionState = { status: "active", provider: "mock" },
  dependencies: CloudDataSyncDependencies = {},
): Promise<CloudDataSyncResult> {
  const queue = dependencies.queue ?? defaultQueue;
  enqueueLocalDataForAutomaticSync(userId, { ...dependencies, queue });
  const client = await resolveClient(dependencies);
  if (!client) {
    return { synced: 0, skipped: 0, failed: queue.count() };
  }

  try {
    const syncService = dependencies.workoutSyncService ?? new WorkoutSyncService(userId, client, queue, undefined, undefined, undefined, undefined, subscription, true);
    const result = await syncService.flushQueue();
    logSyncStage(`automatic sync complete: ${result.synced} synced`);
    return result;
  } catch (error) {
    logSyncStage("automatic sync failed", error);
    return { synced: 0, skipped: 0, failed: queue.count() };
  }
}

export async function restoreAndSyncUserData(
  userId: string,
  subscription: SubscriptionState = { status: "active", provider: "mock" },
  dependencies: CloudDataSyncDependencies = {},
): Promise<{ restore: CloudDataRestoreResult; sync: CloudDataSyncResult }> {
  const restore = await restoreCloudDataForUser(userId, dependencies);
  const sync = await syncLocalDataForUser(userId, subscription, dependencies);
  return { restore, sync };
}
