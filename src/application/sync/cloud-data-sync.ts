import { appSettingsStore, defaultAppSettings, type AppSettings } from "@/application/settings/app-settings";
import type { SubscriptionState } from "@/application/billing/subscription";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { serializeCanonicalActivePlan, validateCanonicalActivePlan } from "@/domain/training/canonical-active-plan-carrier";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { recoveryCapacityIgnoreRepository, type RecoveryCapacityIgnoreRecord } from "@/data/local/recovery-capacity-ignore-repository";
import { legacyTrainingYearArchive } from "@/application/training/legacy-training-year-archive";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { ExerciseCloudRepository } from "@/data/cloud/exercise-cloud-repository";
import { ProgrammeCloudRepository } from "@/data/cloud/programme-cloud-repository";
import { UserSettingsCloudRepository } from "@/data/cloud/user-settings-cloud-repository";
import { WorkoutSessionCloudRepository } from "@/data/cloud/workout-session-cloud-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import { WorkoutSyncService } from "@/data/sync/workout-sync-service";
import type { AppSupabaseClient } from "@/lib/supabase/client";
import type { Exercise, Programme, WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

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
}

export interface CloudDataSyncResult {
  synced: number;
  skipped: number;
  failed: number;
}

export interface CloudDataSyncDependencies {
  client?: AppSupabaseClient | null;
  queue?: SyncQueue;
  workoutCloudRepository?: Pick<WorkoutSessionCloudRepository, "loadWorkoutHistory"> & Partial<Pick<WorkoutSessionCloudRepository, "saveWorkoutSession">>;
  programmeCloudRepository?: Pick<ProgrammeCloudRepository, "loadProgrammes"> & Partial<Pick<ProgrammeCloudRepository, "saveProgramme">>;
  exerciseCloudRepository?: Pick<ExerciseCloudRepository, "loadExercises"> & Partial<Pick<ExerciseCloudRepository, "saveCustomExercise">>;
  userSettingsCloudRepository?: Pick<UserSettingsCloudRepository, "loadUserSettingsBlob"> & Partial<Pick<UserSettingsCloudRepository, "saveUserSettingsBlob">>;
  workoutSyncService?: Pick<WorkoutSyncService, "flushQueue">;
  localWorkoutRepository?: typeof workoutSessionRepository;
  localProgrammeRepository?: typeof programmeRepository;
  localExerciseRepository?: typeof customExerciseRepository;
  localActivePlanRepository?: typeof activeTrainingPlanRepository;
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
    workoutCloudRepository: dependencies.workoutCloudRepository ?? new WorkoutSessionCloudRepository(client),
    programmeCloudRepository: dependencies.programmeCloudRepository ?? new ProgrammeCloudRepository(client),
    exerciseCloudRepository: dependencies.exerciseCloudRepository ?? new ExerciseCloudRepository(client),
    userSettingsCloudRepository: dependencies.userSettingsCloudRepository ?? new UserSettingsCloudRepository(client),
  };
}

export function buildCloudUserDataBackup(dependencies: CloudDataSyncDependencies = {}): CloudUserDataBackup {
  const settingsStore = dependencies.localSettingsStore ?? appSettingsStore;
  const canonical = canonicalActivePlanV2Repository.get();
  return {
    schema: cloudBackupSchema,
    version: cloudBackupVersion,
    updatedAt: now(),
    appSettings: settingsStore.get(),
    activeTrainingPlan: (dependencies.localActivePlanRepository ?? activeTrainingPlanRepository).getOptional(),
    canonicalActivePlan: canonical.status === "saved" ? serializeCanonicalActivePlan(canonical.carrier) : null,
    canonicalActivePlanRevision: canonical.status === "saved" ? canonical.carrier.revision : undefined,
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
  const localWorkoutRepository = dependencies.localWorkoutRepository ?? workoutSessionRepository;
  const localProgrammeRepository = dependencies.localProgrammeRepository ?? programmeRepository;
  const localExerciseRepository = dependencies.localExerciseRepository ?? customExerciseRepository;
  const localActivePlanRepository = dependencies.localActivePlanRepository ?? activeTrainingPlanRepository;
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
    };
  }

  const {
    workoutCloudRepository,
    programmeCloudRepository,
    exerciseCloudRepository,
    userSettingsCloudRepository,
  } = resolveRepositories(dependencies, client);

  const [cloudSessions, cloudProgrammes, cloudExercises, cloudSettings] = await Promise.all([
    workoutCloudRepository.loadWorkoutHistory(userId).catch((error) => {
      logSyncStage("workout restore skipped", error);
      return [] as WorkoutSession[];
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
      return null;
    }),
  ]);

  const localSessions = localWorkoutRepository.list();
  const mergedSessions = mergeWorkoutSessions(localSessions, cloudSessions);
  for (const session of mergedSessions) {
    if (!localSessions.some((localSession) => localSession.id === session.id && localSession === session)) {
      localWorkoutRepository.save(session);
    }
  }

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
  const shouldRestoreTrainingYear = shouldRestoreSettings(localSettingsStore.get()) || !localActivePlanRepository.getOptional();
  if (isCloudUserDataBackup(cloudSettings)) {
    if (shouldRestoreSettings(localSettingsStore.get())) {
      localSettingsStore.set(cloudSettings.appSettings);
      restoredSettings = true;
    }
    if (cloudSettings.canonicalActivePlan) {
      const parsed = validateCanonicalActivePlan(cloudSettings.canonicalActivePlan);
      if (parsed.status === "valid") {
        const local = canonicalActivePlanV2Repository.get();
        if (local.status !== "saved" || parsed.carrier.revision > local.carrier.revision) {
          const saved = canonicalActivePlanV2Repository.saveAtomically(parsed.carrier, local.status === "saved" ? local.carrier.revision : undefined);
          if (saved.status === "saved") {
            canonicalActivePlanState.hydrate();
            restoredActivePlan = true;
          }
        } else if (local.status === "saved" && parsed.carrier.revision === local.carrier.revision) {
          restoredActivePlan = true;
        }
      }
    } else if (!localActivePlanRepository.getOptional() && cloudSettings.activeTrainingPlan) {
      // Legacy active plans remain recovery input only; they are not installed as live state.
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
    restoredSessions: Math.max(0, mergedSessions.length - localSessions.length),
    restoredExercises: restorableExercises.filter((exercise) => !localExerciseIds.has(exercise.id)).length,
    restoredProgrammes: restorableProgrammes.filter((programme) => !localProgrammeIds.has(programme.id)).length,
    restoredSettings,
    restoredActivePlan,
    restoredTrainingYear,
  };
}

export function enqueueLocalDataForAutomaticSync(
  userId: string,
  dependencies: CloudDataSyncDependencies = {},
): number {
  const queue = dependencies.queue ?? defaultQueue;
  const localWorkoutRepository = dependencies.localWorkoutRepository ?? workoutSessionRepository;
  const localProgrammeRepository = dependencies.localProgrammeRepository ?? programmeRepository;
  const localExerciseRepository = dependencies.localExerciseRepository ?? customExerciseRepository;

  localWorkoutRepository
    .list()
    .filter((session) => !isDesignQaFixtureSessionLike(session))
    .forEach((session) => {
      const ownerUserId = session.userId && session.userId !== "guest-local" ? session.userId : userId;
      queue.enqueueWorkoutSession({ ...session, userId }, ownerUserId);
    });

  localExerciseRepository.listCustom().forEach((exercise) => {
    queue.enqueue("custom_exercise", exercise.id, { ...exercise, createdByUserId: exercise.createdByUserId ?? userId }, userId);
  });

  localProgrammeRepository.listCustom().forEach((programme) => {
    queue.enqueue("programme", programme.id, { ...programme, createdByUserId: programme.createdByUserId ?? userId }, userId);
  });

  queue.enqueue("user_settings", userId, buildCloudUserDataBackup(dependencies), userId);
  return queue.count();
}

function isDesignQaFixtureSessionLike(session: WorkoutSession): boolean {
  return session.userId === "design-qa-fixture" || Boolean(session.notes?.includes("Design QA fixture"));
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
