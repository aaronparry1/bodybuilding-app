import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { displayLoadFromBaseKg } from "@/application/training/canonical-workout-presentation";
import { exerciseDisplayName, mesocyclePurposeDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import { effectiveCanonicalPerformedWork, type CanonicalEffectivePerformedWork } from "@/domain/training/canonical-performed-work";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_PROGRESS_PRESENTATION_VERSION = "canonical_progress_presentation_v1" as const;
export const PROGRESS_STATUS_MINIMUM_COMPLETED_SESSIONS = 3;
export const PROGRESS_TREND_MINIMUM_COMPARABLE_OBSERVATIONS = 3;

export type CanonicalProgressPresentationAction = Readonly<{ type: "open_planned_session" | "open_history" | "retry" | "setup_plan"; label: string; sessionId?: string; planId?: string; planRevision?: number }>;
export type CanonicalProgressPresentation = Readonly<{
  contractVersion: typeof CANONICAL_PROGRESS_PRESENTATION_VERSION;
  status: "zero" | "early" | "established" | "recoverable_error" | "storage_error" | "empty";
  title: string;
  subtitle: string;
  nextWorkout?: Readonly<{ id: string; title: string; detail: string; action: CanonicalProgressPresentationAction }>;
  overview?: Readonly<{
    completedWorkouts: number;
    recentConsistency: string;
    phase: string;
    phaseProgress: string;
    statusLabel?: string;
    statusExplanation: string;
  }>;
  progressionHighlight?: Readonly<{
    exerciseId: string;
    exerciseName: string;
    category: "reps" | "load" | "e1rm" | "volume";
    label: string;
    previous: string;
    current: string;
    improvement: string;
    sessionId: string;
  }>;
  trend?: Readonly<{
    exerciseId: string;
    exerciseName: string;
    metric: "reps" | "load" | "e1rm" | "volume";
    unit: string;
    windowLabel: string;
    observations: readonly Readonly<{ sessionId: string; label: string; value: number }>[];
    summary: string;
  }>;
  recentTraining: readonly Readonly<{ id: string; title: string; detail: string; completedAt: string; action: CanonicalProgressPresentationAction }>[];
  review?: Readonly<{ title: string; detail: string; applicationStatus: "review_only" }>;
  attention?: Readonly<{ title: string; detail: string; action?: CanonicalProgressPresentationAction }>;
  primaryAction?: CanonicalProgressPresentationAction;
}>;

type Aggregate = Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>;
type ExerciseObservation = Readonly<{
  sessionId: string;
  completedAt: string;
  exerciseId: string;
  exerciseName: string;
  loadingMode: string;
  unit: "kg" | "lb";
  bestLoadKg: number;
  bestReps: number;
  bestE1rmKg: number | null;
  volumeKg: number;
  repsByLoad: ReadonlyMap<number, number>;
}>;

export function readCanonicalProgressPresentation(input: Readonly<{
  state?: CanonicalActivePlanState;
  displayUnit?: "kg" | "lb";
  now?: number;
  previewStatus?: "recoverable_error" | "storage_error" | "empty";
}> = {}): CanonicalProgressPresentation {
  const state = input.state ?? canonicalActivePlanState.getState();
  if (input.previewStatus) return projectCanonicalProgressPresentation({ status: input.previewStatus, plan: input.previewStatus === "recoverable_error" ? state.model : null, displayUnit: input.displayUnit, now: input.now });
  if (state.hydration === "empty") return projectCanonicalProgressPresentation({ status: "empty", plan: null, displayUnit: input.displayUnit, now: input.now });
  if (state.hydration === "error") {
    const recoverable = /retry|missing|reconciliation|history/i.test(state.error ?? "");
    return projectCanonicalProgressPresentation({ status: recoverable ? "recoverable_error" : "storage_error", plan: null, displayUnit: input.displayUnit, now: input.now });
  }
  if (!state.model) return projectCanonicalProgressPresentation({ status: "recoverable_error", plan: null, displayUnit: input.displayUnit, now: input.now });
  const aggregates: Aggregate[] = [];
  for (const reference of state.model.historicalRecordedSessions ?? []) {
    const aggregate = canonicalRecordedSessionLedger.get(reference.recordedSessionId);
    if (aggregate.status !== "found") return projectCanonicalProgressPresentation({ status: "recoverable_error", plan: state.model, displayUnit: input.displayUnit, now: input.now });
    aggregates.push(aggregate);
  }
  return projectCanonicalProgressPresentation({
    status: "ready",
    plan: state.model,
    completedAggregates: aggregates,
    evidence: canonicalProgressEvidenceRepository.list(state.model.planId),
    decision: canonicalProgressDecisionRepository.current(state.model.planId, state.model.mesocycle.id)[0] ?? null,
    displayUnit: input.displayUnit,
    now: input.now,
  });
}

export function projectCanonicalProgressPresentation(input: Readonly<{
  status: "ready" | "recoverable_error" | "storage_error" | "empty";
  plan: CanonicalActivePlanReadModel | null;
  completedAggregates?: readonly Aggregate[];
  evidence?: readonly CanonicalProgressEvidence[];
  decision?: CanonicalProgressDecision | null;
  displayUnit?: "kg" | "lb";
  now?: number;
}>): CanonicalProgressPresentation {
  if (input.status === "empty") {
    const action = { type: "setup_plan", label: "Set up training" } as const;
    return { ...base("empty", "Progress", "Set up your programme, then completed workouts will build your training record."), primaryAction: action };
  }
  if (input.status === "recoverable_error") {
    const action = { type: "retry", label: "Retry" } as const;
    return { ...base("recoverable_error", "Progress", "Your completed training could not be restored safely yet."), attention: { title: "Training history needs a refresh", detail: "Nothing has been changed. Retry before relying on progress summaries.", action }, primaryAction: action };
  }
  if (input.status === "storage_error" || !input.plan) {
    const action = { type: "retry", label: "Try again" } as const;
    return { ...base("storage_error", "Progress", "Your training record is temporarily unavailable."), attention: { title: "Progress unavailable", detail: "No history has been overwritten.", action }, primaryAction: action };
  }

  const plan = input.plan;
  const displayUnit = input.displayUnit ?? "kg";
  const completed = (input.completedAggregates ?? []).filter((aggregate) => ["completed", "historical"].includes(aggregate.session.status) && effectiveCanonicalPerformedWork(aggregate.events).some(validWork));
  const sorted = completed.slice().sort((left, right) => completionTime(right).localeCompare(completionTime(left)) || right.session.recordedSessionId.localeCompare(left.session.recordedSessionId));
  const next = plan.nextSession ? plan.plannedSessions.find((session) => session.id === plan.nextSession?.id) : undefined;
  const nextWorkout = next ? { id: next.id, title: sessionRoleDisplayName(next.role), detail: scheduleDetail(next.snapshot), action: { type: "open_planned_session" as const, label: "Start next workout", sessionId: next.id, planId: plan.planId, planRevision: plan.revision } } : undefined;
  if (!completed.length) {
    return {
      ...base("zero", "Progress", "Your completed workouts will show consistency, improvements, and useful trends here."),
      ...(nextWorkout ? { nextWorkout, primaryAction: nextWorkout.action } : {}),
    };
  }

  const observations = completed.flatMap(exerciseObservations);
  const highlight = strongestHighlight(observations, displayUnit);
  const trend = strongestTrend(observations, displayUnit);
  const pending = completed.some((aggregate) => !hasCompletionEvidence(input.evidence ?? [], aggregate.session.recordedSessionId));
  const freshness = evidenceFreshness(completed, input.now ?? Date.now());
  const comparableCount = comparableExposureCount(observations);
  const established = completed.length >= PROGRESS_STATUS_MINIMUM_COMPLETED_SESSIONS && comparableCount >= PROGRESS_TREND_MINIMUM_COMPARABLE_OBSERVATIONS && Boolean(trend);
  const status = established ? "established" as const : "early" as const;
  const currentCycleCompleted = completed.filter((aggregate) => aggregate.session.microcycleId === plan.microcycle.id).length;
  const recentTraining = sorted.slice(0, 5).map((aggregate) => {
    const work = effectiveCanonicalPerformedWork(aggregate.events).filter(validWork);
    const duration = durationMinutes(aggregate);
    return { id: aggregate.session.recordedSessionId, title: sessionRoleDisplayName(aggregate.session.role), detail: `${work.length} working sets${duration ? ` · ${duration} min` : ""}`, completedAt: completionTime(aggregate), action: { type: "open_history" as const, label: `Open ${sessionRoleDisplayName(aggregate.session.role)}`, sessionId: aggregate.session.recordedSessionId } };
  });
  const statusAllowed = established && !pending && freshness === "current";
  const improving = trend ? trend.observations.at(-1)!.value > trend.observations[0]!.value : false;
  const overview = {
    completedWorkouts: completed.length,
    recentConsistency: consistencyLabel(completed, input.now ?? Date.now()),
    phase: mesocyclePurposeDisplayName(plan.mesocycle.definitionId ?? plan.mesocycle.purpose),
    phaseProgress: `${Math.min(currentCycleCompleted, plan.microcycle.trainingDays)} of ${plan.microcycle.trainingDays} sessions completed this week`,
    ...(statusAllowed ? { statusLabel: improving ? "Building momentum" : "Training consistently" } : {}),
    statusExplanation: statusAllowed ? "Based on at least three completed workouts and three comparable exercise observations." : "More comparable completed training is needed before a reliable status or trend is shown.",
  };
  return {
    contractVersion: CANONICAL_PROGRESS_PRESENTATION_VERSION,
    status,
    title: "Progress",
    subtitle: established ? "See what your recent training supports." : "Your completed work is recorded. Reliable trends appear after more comparable training.",
    ...(nextWorkout ? { nextWorkout } : {}),
    overview,
    ...(highlight ? { progressionHighlight: highlight } : {}),
    ...(established && trend ? { trend } : {}),
    recentTraining,
    ...(input.decision ? { review: { title: "Training review available", detail: "Review the recommendation before making any programme change.", applicationStatus: "review_only" as const } } : {}),
  };
}

function exerciseObservations(aggregate: Aggregate): ExerciseObservation[] {
  const work = effectiveCanonicalPerformedWork(aggregate.events).filter(validWork);
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const groups = new Map<string, typeof work>();
  for (const event of work) {
    const exerciseId = String(event.payload.exerciseId ?? "");
    if (!exerciseId) continue;
    groups.set(exerciseId, [...(groups.get(exerciseId) ?? []), event]);
  }
  return [...groups.entries()].flatMap(([exerciseId, events]) => {
    const slot = slots.find((candidate) => String(candidate.exerciseId) === exerciseId);
    if (!slot) return [];
    const loadPrescription = object(slot.loadPrescription);
    const loadingMode = String(loadPrescription.loadingMode ?? slot.loadingMode ?? "unavailable");
    const loads = events.map((event) => number(event.payload.load)).filter((value): value is number => value !== null && value >= 0);
    const reps = events.map((event) => number(event.payload.reps)).filter((value): value is number => value !== null && value > 0);
    if (!reps.length || !loads.length) return [];
    const repsByLoad = new Map<number, number>();
    events.forEach((event) => { const load = number(event.payload.load); const rep = number(event.payload.reps); if (load !== null && rep !== null) repsByLoad.set(load, Math.max(repsByLoad.get(load) ?? 0, rep)); });
    const bestE1rmKg = events.map((event) => e1rm(number(event.payload.load), number(event.payload.reps))).filter((value): value is number => value !== null).sort((a, b) => b - a)[0] ?? null;
    return [{ sessionId: aggregate.session.recordedSessionId, completedAt: completionTime(aggregate), exerciseId, exerciseName: exerciseDisplayName(exerciseId), loadingMode, unit: "kg" as const, bestLoadKg: Math.max(...loads), bestReps: Math.max(...reps), bestE1rmKg, volumeKg: events.reduce((sum, event) => sum + (number(event.payload.load) ?? 0) * (number(event.payload.reps) ?? 0), 0), repsByLoad }];
  });
}

function strongestHighlight(observations: readonly ExerciseObservation[], displayUnit: "kg" | "lb"): CanonicalProgressPresentation["progressionHighlight"] | undefined {
  const groups = groupComparable(observations);
  const candidates: Array<NonNullable<CanonicalProgressPresentation["progressionHighlight"]> & { score: number }> = [];
  for (const group of groups.values()) {
    if (group.length < 2 || /assisted/i.test(group[0]!.loadingMode)) continue;
    const latest = group.at(-1)!;
    const prior = group.slice(0, -1);
    if (/bodyweight/i.test(latest.loadingMode)) {
      const previous = Math.max(...prior.map((item) => item.bestReps));
      if (latest.bestReps > previous) candidates.push({ ...highlightBase(latest, "reps", `${previous} reps`, `${latest.bestReps} reps`, `+${latest.bestReps - previous} reps`), score: latest.bestReps - previous });
      continue;
    }
    for (const [load, reps] of latest.repsByLoad) {
      const previous = Math.max(0, ...prior.map((item) => item.repsByLoad.get(load) ?? 0));
      if (reps > previous && previous > 0) candidates.push({ ...highlightBase(latest, "reps", `${previous} reps at ${formatLoad(load, displayUnit)}`, `${reps} reps at ${formatLoad(load, displayUnit)}`, `+${reps - previous} reps at the same load`), score: reps - previous });
    }
    const sameRepPrior = prior.filter((item) => item.bestReps === latest.bestReps).map((item) => item.bestLoadKg);
    if (sameRepPrior.length) {
      const previous = Math.max(...sameRepPrior);
      if (latest.bestLoadKg > previous) candidates.push({ ...highlightBase(latest, "load", formatLoad(previous, displayUnit), formatLoad(latest.bestLoadKg, displayUnit), `+${formatNumber(displayLoadFromBaseKg(latest.bestLoadKg - previous, displayUnit))} ${displayUnit}`), score: latest.bestLoadKg - previous });
    }
    const previousE1rm = Math.max(0, ...prior.map((item) => item.bestE1rmKg ?? 0));
    if (latest.bestE1rmKg && previousE1rm > 0 && latest.bestE1rmKg > previousE1rm * 1.005) candidates.push({ ...highlightBase(latest, "e1rm", formatLoad(previousE1rm, displayUnit), formatLoad(latest.bestE1rmKg, displayUnit), `+${formatNumber(displayLoadFromBaseKg(latest.bestE1rmKg - previousE1rm, displayUnit))} ${displayUnit} estimated 1RM`), score: latest.bestE1rmKg - previousE1rm });
    const previousVolume = Math.max(0, ...prior.map((item) => item.volumeKg));
    if (latest.volumeKg > previousVolume * 1.01 && previousVolume > 0) candidates.push({ ...highlightBase(latest, "volume", formatLoad(previousVolume, displayUnit), formatLoad(latest.volumeKg, displayUnit), `+${formatNumber(displayLoadFromBaseKg(latest.volumeKg - previousVolume, displayUnit))} ${displayUnit} volume`), score: (latest.volumeKg - previousVolume) / 10 });
  }
  const categoryPriority = { load: 4, reps: 3, e1rm: 2, volume: 1 } as const;
  const best = candidates.sort((left, right) => categoryPriority[right.category] - categoryPriority[left.category] || right.score - left.score || left.exerciseId.localeCompare(right.exerciseId))[0];
  if (!best) return undefined;
  const { score: _score, ...highlight } = best;
  return highlight;
}

function strongestTrend(observations: readonly ExerciseObservation[], displayUnit: "kg" | "lb"): CanonicalProgressPresentation["trend"] | undefined {
  const groups = [...groupComparable(observations).values()].filter((group) => group.length >= PROGRESS_TREND_MINIMUM_COMPARABLE_OBSERVATIONS && !/assisted/i.test(group[0]!.loadingMode)).sort((a, b) => b.length - a.length || a[0]!.exerciseId.localeCompare(b[0]!.exerciseId));
  const group = groups[0];
  if (!group) return undefined;
  const useE1rm = group.every((item) => item.bestE1rmKg !== null && item.bestE1rmKg! > 0) && !/bodyweight/i.test(group[0]!.loadingMode);
  const metric = useE1rm ? "e1rm" as const : /bodyweight/i.test(group[0]!.loadingMode) ? "reps" as const : "volume" as const;
  const unit = metric === "reps" ? "reps" : displayUnit;
  const points = group.map((item, index) => ({ sessionId: item.sessionId, label: `${index + 1}`, value: metric === "e1rm" ? displayLoadFromBaseKg(item.bestE1rmKg!, displayUnit) : metric === "reps" ? item.bestReps : displayLoadFromBaseKg(item.volumeKg, displayUnit) }));
  const metricLabel = metric === "e1rm" ? "estimated 1RM" : metric === "reps" ? "reps" : "training volume";
  const summary = points[0]!.value === points.at(-1)!.value
    ? `${group[0]!.exerciseName} ${metricLabel} held at ${formatNumber(points[0]!.value)} ${unit} across ${points.length} completed workouts.`
    : `${group[0]!.exerciseName} ${metricLabel} moved from ${formatNumber(points[0]!.value)} to ${formatNumber(points.at(-1)!.value)} ${unit} across ${points.length} completed workouts.`;
  return { exerciseId: group[0]!.exerciseId, exerciseName: group[0]!.exerciseName, metric, unit, windowLabel: `Last ${points.length} comparable workouts`, observations: points, summary };
}

function highlightBase(observation: ExerciseObservation, category: "reps" | "load" | "e1rm" | "volume", previous: string, current: string, improvement: string) {
  return { exerciseId: observation.exerciseId, exerciseName: observation.exerciseName, category, label: category === "reps" ? "More reps" : category === "load" ? "More load" : category === "e1rm" ? "Estimated strength" : "Exercise volume", previous, current, improvement, sessionId: observation.sessionId };
}

function groupComparable(observations: readonly ExerciseObservation[]): Map<string, ExerciseObservation[]> {
  const groups = new Map<string, ExerciseObservation[]>();
  observations.slice().sort((a, b) => a.completedAt.localeCompare(b.completedAt) || a.sessionId.localeCompare(b.sessionId)).forEach((item) => { const key = `${item.exerciseId}:${item.loadingMode}`; groups.set(key, [...(groups.get(key) ?? []), item]); });
  return groups;
}

function comparableExposureCount(observations: readonly ExerciseObservation[]): number { return Math.max(0, ...[...groupComparable(observations).values()].map((group) => group.length)); }
function validWork(event: CanonicalEffectivePerformedWork): boolean { return event.payload.completion === "complete" && (number(event.payload.reps) ?? 0) > 0; }
function hasCompletionEvidence(evidence: readonly CanonicalProgressEvidence[], sessionId: string): boolean { return evidence.some((item) => item.sessionId === sessionId && item.kind === "completion"); }
function evidenceFreshness(aggregates: readonly Aggregate[], now: number): "current" | "stale" { const latest = Math.max(...aggregates.map((aggregate) => Date.parse(completionTime(aggregate)))); return Number.isFinite(latest) && now - latest <= 42 * 86_400_000 ? "current" : "stale"; }
function consistencyLabel(aggregates: readonly Aggregate[], now: number): string { const recent = aggregates.filter((aggregate) => now - Date.parse(completionTime(aggregate)) <= 28 * 86_400_000).length; return `${recent} completed in the last 4 weeks`; }
function completionTime(aggregate: Aggregate): string { return aggregate.events.findLast((event) => event.type === "completed" || event.type === "historical")?.occurredAt ?? aggregate.session.startedAt ?? aggregate.session.createdAt; }
function durationMinutes(aggregate: Aggregate): number | null { if (!aggregate.session.startedAt) return null; const value = Date.parse(completionTime(aggregate)) - Date.parse(aggregate.session.startedAt); return Number.isFinite(value) && value > 0 ? Math.max(1, Math.round(value / 60_000)) : null; }
function scheduleDetail(snapshot: Readonly<Record<string, unknown>>): string { const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : []; const sets = slots.reduce((sum, slot) => sum + Number(object(slot.settings).requiredWorkSets ?? object(slot.settings).requiredSets ?? 0), 0); return `${slots.length} exercises · ${sets} working sets`; }
function e1rm(load: number | null, reps: number | null): number | null { if (load === null || reps === null || load <= 0 || reps <= 0 || reps > 12) return null; return Math.round(load * (1 + Math.min(reps, 10) / 36) * 10) / 10; }
function formatLoad(baseKg: number, unit: "kg" | "lb"): string { return `${formatNumber(displayLoadFromBaseKg(baseKg, unit))} ${unit}`; }
function formatNumber(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, ""); }
function number(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function base(status: CanonicalProgressPresentation["status"], title: string, subtitle: string): CanonicalProgressPresentation { return { contractVersion: CANONICAL_PROGRESS_PRESENTATION_VERSION, status, title, subtitle, recentTraining: [] }; }
