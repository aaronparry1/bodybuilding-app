import { WorkoutSessionCloudRepository } from "@/data/cloud/workout-session-cloud-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { WorkoutSession } from "@/domain/training/models";
import type { AppSupabaseClient } from "@/lib/supabase/client";

export type LegacyWorkoutCloudRecoveryDependencies = Readonly<{
  cloud?: { loadWorkoutHistory(userId: string): Promise<WorkoutSession[]> };
  local?: { list(): WorkoutSession[]; save(session: WorkoutSession): void };
}>;

export type LegacyWorkoutCloudRecoveryResult = Readonly<{
  restored: number;
  readable: boolean;
}>;

/**
 * Migration-only compatibility reader. Legacy workout rows are retained as a
 * recovery input; they never become the canonical live workout authority.
 * Local records win timestamp ties, so a cloud read cannot roll local work
 * backwards.
 */
export async function restoreLegacyWorkoutHistoryForMigration(
  userId: string,
  client: AppSupabaseClient,
  dependencies: LegacyWorkoutCloudRecoveryDependencies = {},
): Promise<LegacyWorkoutCloudRecoveryResult> {
  const cloud = dependencies.cloud ?? new WorkoutSessionCloudRepository(client);
  const local = dependencies.local ?? workoutSessionRepository;
  let cloudSessions: WorkoutSession[];
  try {
    cloudSessions = await cloud.loadWorkoutHistory(userId);
  } catch {
    return { restored: 0, readable: false };
  }

  const localById = new Map(local.list().map((session) => [session.id, session]));
  let restored = 0;
  for (const session of cloudSessions) {
    const existing = localById.get(session.id);
    if (existing && timestamp(session) <= timestamp(existing)) continue;
    local.save(session);
    if (!existing) restored += 1;
  }
  return { restored, readable: true };
}

function timestamp(session: WorkoutSession): number {
  return new Date(session.updatedAt ?? session.completedAt ?? session.startedAt).getTime();
}
