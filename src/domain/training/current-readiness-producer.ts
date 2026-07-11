import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { aggregateExactTargetExtraction } from "@/domain/training/current-exact-target-evidence-aggregation";
import { extractExactTargetFacts } from "@/domain/training/current-exact-target-evidence";
import { deriveMesocycleExposure, exposurePolicyFromMesocycle, resolveApprovedSuccessorContext } from "@/domain/training/current-mesocycle-readiness-context";
import { deriveRequiredPlannedRoles, evaluateMicrocycleRoles, matchPlannedRoles, type PlannedRoleFact } from "@/domain/training/current-microcycle-role-evaluability";
import { classifyPerformanceFatigue, type FatiguePolicy } from "@/domain/training/current-performance-fatigue";
import { derivePerformanceTrendSeries, type TrendSeriesPolicy } from "@/domain/training/current-performance-trend-series";
import { classifyPerformanceWindows, type PerformanceWindowPolicy } from "@/domain/training/current-performance-window";
import { readinessSourceFingerprint, type CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import type { WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type CurrentReadinessProducerInput = Readonly<{ plan: ActiveTrainingPlan; plannedRoleFacts: readonly PlannedRoleFact[]; workouts: readonly WorkoutSession[]; createdAt: string; snapshotId: string; windowPolicy?: PerformanceWindowPolicy; trendPolicy?: TrendSeriesPolicy; fatiguePolicy?: FatiguePolicy }>;
export type CurrentReadinessProducerResult =
  | Readonly<{ status: "snapshot_persisted" | "in_progress_snapshot_persisted" | "insufficient_evidence_snapshot_persisted" | "insufficient_policy_snapshot_persisted" | "blocked_snapshot_persisted" | "disrupted_snapshot_persisted"; snapshot: CurrentReadinessSnapshot; superseded: boolean; decisionEvaluationPermitted: boolean }>
  | Readonly<{ status: "snapshot_unchanged"; snapshot: CurrentReadinessSnapshot; decisionEvaluationPermitted: boolean }>
  | Readonly<{ status: "invalid_input" | "repository_conflict" | "persistence_failed"; reason: string }>;

export function produceCurrentReadinessSnapshot(input: CurrentReadinessProducerInput): CurrentReadinessProducerResult {
  const required = deriveRequiredPlannedRoles(input.plan);
  if (required.status !== "ready") return { status: "invalid_input", reason: required.reason };
  const mesocycle = mesocycleById(required.input.mesocycleId);
  if (!mesocycle || !input.snapshotId || Number.isNaN(Date.parse(input.createdAt))) return { status: "invalid_input", reason: "invalid_current_identity" };
  const roleMatch = matchPlannedRoles(required.input, [...input.plannedRoleFacts]);
  // Minimum exposure is resolved from persisted snapshots; a new attempt starts conservatively unresolved.
  const existing = currentReadinessSnapshotRepository.current(input.plan.id, required.input.mesocycleId, required.input.microcycleNumber);
  if (existing.status === "conflict") return { status: "repository_conflict", reason: "competing_current_snapshots" };
  const minimumExposure = existing.status === "found" && existing.snapshot.state === "ready";
  const evaluability = evaluateMicrocycleRoles(roleMatch, minimumExposure);
  const extraction = extractExactTargetFacts([...input.workouts], { mesocycleId: required.input.mesocycleId, microcycleNumber: required.input.microcycleNumber });
  const aggregate = aggregateExactTargetExtraction(extraction);
  const windows = classifyPerformanceWindows([{ id: `${input.plan.id}:${required.input.microcycleNumber}`, planId: input.plan.id, mesocycleId: required.input.mesocycleId, microcycleNumber: required.input.microcycleNumber, evaluatedAt: input.createdAt, evidence: aggregate }], input.windowPolicy);
  const trend = derivePerformanceTrendSeries(windows, input.trendPolicy);
  const successors = resolveApprovedSuccessorContext({ currentMesocycleId: required.input.mesocycleId, experienceLevel: input.plan.experienceLevel });
  const fatigue = classifyPerformanceFatigue({ trend: trend.trend, rebound: trend.rebound, negativeWindows: trend.trace.negative.length, policy: input.fatiguePolicy, lowStressSuccessor: { status: "unknown", candidateIds: [] } });
  const policy = exposurePolicyFromMesocycle(mesocycle);
  const exposure = deriveMesocycleExposure({ planId: input.plan.id, mesocycleId: required.input.mesocycleId, currentAttempt: required.input.microcycleNumber, snapshots: existing.status === "found" ? [existing.snapshot] : [], policy });
  const state = stateFor(evaluability.status, windows.status, trend.trend, fatigue.state, successors.status, exposure.status);
  const sourceWorkoutIds = [...new Set(extraction.facts.map((fact) => fact.workoutId))].sort();
  const sourceSessionIds = [...new Set(input.plannedRoleFacts.filter((fact) => fact.sessionKind === "planned").map((fact) => fact.workoutId))].sort();
  const sourceFingerprint = readinessSourceFingerprint({ planId: input.plan.id, mesocycleId: required.input.mesocycleId, microcycleNumber: required.input.microcycleNumber, sourceWorkoutIds, sourceSessionIds });
  if (existing.status === "found" && existing.snapshot.sourceFingerprint === sourceFingerprint) return { status: "snapshot_unchanged", snapshot: existing.snapshot, decisionEvaluationPermitted: Boolean(existing.snapshot.decisionContext) };
  const approvedSuccessors = successors.status === "ready" ? [...successors.eligibleCandidateIds] : [];
  const fatigueForDecision = fatigue.state === "deload_eligible" || fatigue.state === "deload_required" || fatigue.state === "watch" ? fatigue.state : "normal";
  const snapshot: CurrentReadinessSnapshot = { schemaVersion: 1, id: input.snapshotId, planId: input.plan.id, mesocycleId: required.input.mesocycleId, microcycleNumber: required.input.microcycleNumber, createdAt: input.createdAt, state, sourceFingerprint, sourceWorkoutIds, sourceSessionIds, requiredRoles: required.input.roles.map((role) => role.occurrenceId), completedRoles: roleMatch.completed.map((role) => role.occurrenceId), unresolvedRoles: roleMatch.unresolved.map((role) => role.occurrenceId), blockedRoles: roleMatch.blocked.map((role) => role.occurrenceId), approvedSuccessors, ...(existing.status === "found" ? { supersededSnapshotId: existing.snapshot.id } : {}), ...(state === "ready" ? { decisionContext: { evaluatorInput: { compatibility: "ready", microcycleState: "evaluable", completedMicrocycles: exposure.status === "ready" ? exposure.evaluableMicrocyclesCompleted : 0, mesocycle, purposeConcluded: false, currentStimulusProductive: trend.trend === "improving" || trend.trend === "stable", fatigue: fatigueForDecision, approvedSuccessors, approvedPrerequisites: [] }, evidence: { microcycleState: "evaluable", completedMicrocycles: exposure.status === "ready" ? exposure.evaluableMicrocyclesCompleted : 0, fatigue: fatigueForDecision, minimumExposureMet: exposure.status === "ready" && exposure.minimumExposureReached, maximumExposureReached: exposure.status === "ready" && exposure.maximumExposureReached } } } : {}) };
  const saved = currentReadinessSnapshotRepository.save(snapshot);
  if (saved.status !== "saved") return { status: "persistence_failed", reason: saved.status };
  const status = state === "ready" ? "snapshot_persisted" : state === "in_progress" ? "in_progress_snapshot_persisted" : state === "insufficient_evidence" ? "insufficient_evidence_snapshot_persisted" : state === "insufficient_policy" ? "insufficient_policy_snapshot_persisted" : state === "blocked" ? "blocked_snapshot_persisted" : "disrupted_snapshot_persisted";
  return { status, snapshot: saved.snapshot, superseded: existing.status === "found", decisionEvaluationPermitted: state === "ready" };
}

function stateFor(evaluability: string, windows: string, trend: string, fatigue: string, successors: string, exposure: string): CurrentReadinessSnapshot["state"] {
  if (evaluability === "invalid" || windows === "invalid_series" || trend === "invalid" || fatigue === "invalid" || successors === "invalid" || exposure === "invalid_history" || exposure === "invalid_policy") return "invalid";
  if (evaluability === "blocked") return "blocked";
  if (evaluability === "disrupted") return "disrupted";
  if (evaluability === "in_progress") return "in_progress";
  if (evaluability === "insufficient" || windows === "insufficient_evidence" || trend === "insufficient_evidence" || fatigue === "insufficient_evidence") return "insufficient_evidence";
  if (windows === "insufficient_policy" || trend === "insufficient_policy" || fatigue === "insufficient_policy" || exposure === "insufficient_policy") return "insufficient_policy";
  return "ready";
}
