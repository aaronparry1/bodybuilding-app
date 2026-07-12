import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";
import type { CurrentProgressContext } from "@/domain/training/current-progress-context";

export type CurrentProgressHistoricalObservation = Readonly<{ id: string; kind: "stored_target_attainment" | "exercise_progression" | "completion_consistency"; value: string }>;
export type CurrentProgressStrategicSummary =
  | Readonly<{ status: "available"; planId: string; mesocycleId: string; mesocyclePurpose?: string; microcycleNumber: number; readinessSnapshotId: string; readinessState: "ready"; decisionId: string; decisionOutcome: "delay" | "continue" | "deload" | "advance"; decisionLifecycle?: string; decisionReason?: string; advanceTargetMesocycleId?: string; historicalObservations: readonly CurrentProgressHistoricalObservation[] }>
  | Readonly<{ status: "in_progress" | "insufficient_evidence" | "insufficient_policy" | "blocked" | "disrupted"; planId: string; mesocycleId: string; microcycleNumber: number; readinessSnapshotId: string; reason?: string; historicalObservations: readonly CurrentProgressHistoricalObservation[] }>
  | Readonly<{ status: "review_required"; planId: string; mesocycleId: string; microcycleNumber: number; readinessSnapshotId: string; decisionId: string; decisionReason?: string; historicalObservations: readonly CurrentProgressHistoricalObservation[] }>
  | Readonly<{ status: "no_current_snapshot" | "no_current_decision" | "compatibility" | "invalid"; reason: string; historicalObservations: readonly CurrentProgressHistoricalObservation[] }>;

/** Pure, read-only summary: current persisted state is authoritative; history only supports it. */
export function buildCurrentProgressStrategicSummary(context: CurrentProgressContext, historicalObservations: readonly CurrentProgressHistoricalObservation[] = []): CurrentProgressStrategicSummary {
  const history = historicalObservations.map((observation) => ({ ...observation }));
  if (context.status === "ready") {
    const purpose = mesocycleById(context.mesocycleId as MesocycleId)?.adaptation;
    if (!context.decisionId || !context.decisionOutcome) return { status: "no_current_decision", reason: "decision_missing", historicalObservations: history };
    if (context.decisionOutcome === "review_required") return { status: "review_required", planId: context.planId, mesocycleId: context.mesocycleId, microcycleNumber: context.microcycleNumber, readinessSnapshotId: context.snapshotId, decisionId: context.decisionId, historicalObservations: history };
    return { status: "available", planId: context.planId, mesocycleId: context.mesocycleId, ...(purpose ? { mesocyclePurpose: purpose } : {}), microcycleNumber: context.microcycleNumber, readinessSnapshotId: context.snapshotId, readinessState: "ready", decisionId: context.decisionId, decisionOutcome: context.decisionOutcome, ...(context.decisionLifecycle ? { decisionLifecycle: context.decisionLifecycle } : {}), ...(context.advanceTargetMesocycleId ? { advanceTargetMesocycleId: context.advanceTargetMesocycleId } : {}), historicalObservations: history };
  }
  if (context.status === "review_required") return { status: "review_required", planId: context.planId, mesocycleId: context.mesocycleId, microcycleNumber: context.microcycleNumber, readinessSnapshotId: context.snapshotId, decisionId: context.decisionId!, historicalObservations: history };
  if (context.status === "in_progress" || context.status === "insufficient_evidence" || context.status === "insufficient_policy" || context.status === "blocked" || context.status === "disrupted") return { status: context.status, planId: context.planId, mesocycleId: context.mesocycleId, microcycleNumber: context.microcycleNumber, readinessSnapshotId: context.snapshotId, historicalObservations: history };
  return { status: context.status, reason: "reason" in context ? context.reason : "current_context_unavailable", historicalObservations: history };
}
