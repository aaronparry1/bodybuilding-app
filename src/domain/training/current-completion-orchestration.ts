import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { evaluatePersistedCurrentReadinessSnapshot } from "@/domain/training/current-progression-transition-decision-writer";
import { produceCurrentReadinessSnapshot, type CurrentReadinessProducerInput } from "@/domain/training/current-readiness-producer";
import type { PlannedRoleFact } from "@/domain/training/current-microcycle-role-evaluability";
import type { WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type CompletionOrchestrationResult =
  | { status: "completion_saved_no_evaluation" | "completion_saved_snapshot_persisted" | "completion_saved_snapshot_unchanged" | "completion_saved_decision_created" | "completion_saved_existing_decision" | "completion_saved_delay" | "completion_saved_review_required" | "completion_saved_actionable_decision_ready"; snapshotId?: string; decisionId?: string }
  | { status: "non_planned_completion_ignored" | "identity_mismatch" | "readiness_failed" | "decision_failed" | "persistence_failed"; reason: string };

/** Sole post-completion current authority. It produces a decision but never applies it. */
export function orchestrateCompletedPlannedWorkout(input: Readonly<{ plan: ActiveTrainingPlan; completedSession: WorkoutSession; snapshotId: string; decisionId: string; createdAt: string; producerPolicies?: Pick<CurrentReadinessProducerInput, "windowPolicy" | "trendPolicy" | "fatiguePolicy"> }>): CompletionOrchestrationResult {
  const session = input.completedSession;
  if (session.sessionKind !== "planned") return { status: "non_planned_completion_ignored", reason: "non_planned_origin" };
  if (!session.completedAt) return { status: "completion_saved_no_evaluation" };
  if (!input.plan.currentMesocycleId || !input.plan.currentMicrocycle || session.planMesocycleId !== input.plan.currentMesocycleId || session.planMicrocycleNumber !== input.plan.currentMicrocycle.sequenceNumber) return { status: "identity_mismatch", reason: "completed_session_current_identity_mismatch" };
  const sessions = workoutSessionRepository.list();
  const plannedRoleFacts: PlannedRoleFact[] = sessions.map((candidate) => ({ workoutId: candidate.id, planId: input.plan.id, mesocycleId: candidate.planMesocycleId as PlannedRoleFact["mesocycleId"], microcycleNumber: candidate.planMicrocycleNumber ?? -1, planSessionIndex: candidate.planSessionIndex ?? -1, sessionKind: candidate.sessionKind === "planned" ? "planned" : candidate.sessionKind?.startsWith("extra_") ? "extra" : "custom", completion: candidate.completedAt ? "completed" : "open", validPerformance: candidate.exercises.some((exercise) => exercise.sets.some((set) => set.type !== "warmup" && Number.isFinite(set.reps))) }));
  const produced = produceCurrentReadinessSnapshot({ plan: input.plan, plannedRoleFacts, workouts: sessions, snapshotId: input.snapshotId, createdAt: input.createdAt, ...input.producerPolicies });
  if (!("snapshot" in produced)) return { status: "readiness_failed", reason: produced.reason };
  const snapshotId = produced.snapshot.id;
  if (!produced.decisionEvaluationPermitted) return { status: produced.status === "snapshot_unchanged" ? "completion_saved_snapshot_unchanged" : "completion_saved_snapshot_persisted", snapshotId };
  const decision = evaluatePersistedCurrentReadinessSnapshot({ snapshotId, decisionId: input.decisionId, createdAt: input.createdAt });
  if (decision.status === "snapshot_missing" || decision.status === "stale_snapshot" || decision.status === "snapshot_not_evaluable") return { status: "decision_failed", reason: decision.status };
  if (decision.status === "existing_decision") return { status: "completion_saved_existing_decision", snapshotId, decisionId: decision.record?.id };
  if (decision.status !== "saved") return { status: "decision_failed", reason: decision.status };
  if (decision.record.outcome === "delay") return { status: "completion_saved_delay", snapshotId, decisionId: decision.record.id };
  if (decision.record.outcome === "review_required") return { status: "completion_saved_review_required", snapshotId, decisionId: decision.record.id };
  return { status: "completion_saved_actionable_decision_ready", snapshotId, decisionId: decision.record.id };
}
