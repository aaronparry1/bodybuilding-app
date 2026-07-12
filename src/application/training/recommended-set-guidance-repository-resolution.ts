import type { WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan, VolumeAdjustmentRecord } from "@/domain/training/plan-setup";
import { resolveRecommendedSetGuidanceTarget, type ApplyRecommendedSetGuidanceAdjustmentCommand, type PlannedWorkoutReference, type RecommendedSetGuidanceResolverReads, type RecommendedSetGuidanceTargetIdentity, type ResolvedGuidanceTarget } from "@/application/training/recommended-set-guidance-target-resolver";

export type RecommendedSetGuidanceRepositoryReads = Readonly<{
  getActivePlan: () => ActiveTrainingPlan | null;
  listWorkoutSessions: () => readonly WorkoutSession[];
  findGuidanceTargets: (identity: RecommendedSetGuidanceTargetIdentity, plan: ActiveTrainingPlan) => readonly ResolvedGuidanceTarget[];
}>;

/** Binds E2E1 to persisted plan/workout reads. It deliberately has no write dependency. */
export function resolveRecommendedSetGuidanceTargetFromRepositories(command: ApplyRecommendedSetGuidanceAdjustmentCommand, repositories: RecommendedSetGuidanceRepositoryReads) {
  const plan = repositories.getActivePlan();
  const reads: RecommendedSetGuidanceResolverReads = {
    findAdjustment: (id) => findAdjustment(plan, id),
    findActivePlan: (id) => plan?.id === id ? { id: plan.id } : null,
    findGuidanceTarget: (identity) => plan ? repositories.findGuidanceTargets(identity, plan) : [],
    findPlannedWorkoutReferences: (identity) => plannedReferences(repositories.listWorkoutSessions(), identity),
  };
  return resolveRecommendedSetGuidanceTarget(command, reads);
}

function findAdjustment(plan: ActiveTrainingPlan | null, id: string): Pick<VolumeAdjustmentRecord, "id" | "action" | "status"> | null {
  const matches = (plan?.recommendationState?.volumeAdjustments ?? []).filter((record) => record.id === id);
  return matches.length === 1 ? matches[0]! : null;
}

function plannedReferences(sessions: readonly WorkoutSession[], identity: RecommendedSetGuidanceTargetIdentity): readonly PlannedWorkoutReference[] {
  return sessions
    .filter((session) => session.sessionKind === "planned")
    .filter((session) => session.planMesocycleId === identity.mesocycleId && session.planMicrocycleNumber === identity.microcycleNumber)
    .filter((session) => identity.sessionIdentity === undefined || String(session.planSessionIndex) === identity.sessionIdentity)
    .map((session): PlannedWorkoutReference => ({ workoutId: session.id, planId: identity.planId, mesocycleId: session.planMesocycleId, microcycleNumber: session.planMicrocycleNumber, sessionIdentity: session.planSessionIndex == null ? undefined : String(session.planSessionIndex), lifecycle: session.completedAt ? "completed" : "open", hasExactTargetCoverage: session.exercises.length > 0 && session.exercises.every((exercise) => Array.isArray(exercise.prescribedSetTargets) && exercise.prescribedSetTargets.length > 0) }))
    .sort((a, b) => a.planId.localeCompare(b.planId) || (a.mesocycleId ?? "").localeCompare(b.mesocycleId ?? "") || (a.microcycleNumber ?? -1) - (b.microcycleNumber ?? -1) || (a.sessionIdentity ?? "").localeCompare(b.sessionIdentity ?? "") || a.workoutId.localeCompare(b.workoutId));
}
