import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { projectCanonicalWorkoutPresentation, type WorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_HOME_PROJECTION_VERSION = "canonical_home_projection_v2" as const;

export type CanonicalHomeStatus = "hydrating" | "ready" | "empty" | "recorded_history_recovery_required" | "storage_error";
export type CanonicalHomeAction = Readonly<{
  type: "open_planned_session" | "resume_recorded_session" | "open_progress" | "setup_plan" | "retry_storage";
  planId?: string;
  planRevision?: number;
  sessionId?: string;
}>;

export type CanonicalHomeWorkoutSummary = Readonly<{
  title: string;
  purpose: string;
  lifecycle: WorkoutPresentation["lifecycle"];
  exerciseCount: number;
  workingSetCount: number;
  completedSetCount: number;
  progressPercent: number;
  estimatedDurationMinutes: number | null;
  exercisePreview: readonly string[];
}>;

export type CanonicalHomePrimary = Readonly<{
  kind: "active" | "planned" | "completed_today" | "rest_day";
  eyebrow: string;
  title: string;
  detail: string;
  ctaLabel?: string;
  action?: CanonicalHomeAction;
  workout?: CanonicalHomeWorkoutSummary;
}>;

export type CanonicalHomeProjection = Readonly<{
  contractVersion: typeof CANONICAL_HOME_PROJECTION_VERSION;
  status: CanonicalHomeStatus;
  greeting: Readonly<{ eyebrow: string; title: string; subtitle: string }>;
  planId?: string;
  revision?: number;
  primary?: CanonicalHomePrimary;
  programme?: Readonly<{
    goal: string;
    phase: string;
    microcycle: string;
    sessionPosition: string;
    completionLabel: string;
  }>;
  progress: Readonly<{
    historicalCount: number;
    completedThisMicrocycle: number;
    evidenceStatus: "current" | "not_yet_available";
    headline: string;
  }>;
  recent?: Readonly<{ title: string; detail: string; completedAt?: string }>;
  attention?: Readonly<{ tone: "info" | "warning"; title: string; detail: string; action?: CanonicalHomeAction }>;
  actions: readonly CanonicalHomeAction[];
}>;

type ActiveAggregate = Readonly<{
  session: CanonicalRecordedSession;
  events: readonly CanonicalRecordedSessionEvent[];
}>;

export function readCanonicalHomeProjection(input: Readonly<{
  state?: CanonicalActivePlanState;
  displayUnit?: "kg" | "lb";
  now?: number;
}> = {}): CanonicalHomeProjection {
  const state = input.state ?? canonicalActivePlanState.getState();
  if (state.hydration === "empty") return projectCanonicalHome({ status: "empty", model: null, now: input.now });
  if (state.hydration === "error") return projectCanonicalHome({ status: "error", model: null, now: input.now });
  if (!state.model) return projectCanonicalHome({ status: "hydrating", model: null, now: input.now });
  const activeReference = state.model.activeRecordedSession;
  const aggregate = activeReference ? canonicalRecordedSessionLedger.get(activeReference.recordedSessionId) : null;
  if (activeReference && (!aggregate || aggregate.status !== "found")) {
    return projectCanonicalHome({ status: "ready", model: state.model, activeAggregateStatus: "missing", now: input.now });
  }
  return projectCanonicalHome({
    status: "ready",
    model: state.model,
    activeAggregate: aggregate?.status === "found" ? aggregate : undefined,
    evidence: canonicalProgressEvidenceRepository.list(state.model.planId),
    displayUnit: input.displayUnit,
    now: input.now,
  });
}

export function projectCanonicalHome(input: Readonly<{
  status: "hydrating" | "empty" | "error" | "ready";
  model?: CanonicalActivePlanReadModel | null;
  activeAggregate?: ActiveAggregate;
  activeAggregateStatus?: "missing";
  evidence?: readonly CanonicalProgressEvidence[];
  displayUnit?: "kg" | "lb";
  now?: number;
}>): CanonicalHomeProjection {
  if (input.status === "hydrating") return base("hydrating", "Loading your training", "Your plan is being restored safely.", []);
  if (input.status === "empty") {
    const action: CanonicalHomeAction = { type: "setup_plan" };
    return { ...base("empty", "Build your training plan", "Answer a few questions to create your first week.", [action]), attention: { tone: "info", title: "No plan yet", detail: "Your plan will appear here once setup is complete.", action } };
  }
  if (!input.model) {
    const action: CanonicalHomeAction = { type: "retry_storage" };
    return { ...base("storage_error", "Home needs a refresh", "Your saved plan could not be read safely.", [action]), attention: { tone: "warning", title: "Training data unavailable", detail: "Nothing has been changed. Retry the local read before continuing.", action } };
  }

  const model = input.model;
  const progressAction: CanonicalHomeAction = { type: "open_progress", planId: model.planId, planRevision: model.revision };
  const plannedSession = model.nextSession ? model.plannedSessions.find((candidate) => candidate.id === model.nextSession?.id) : undefined;
  const plannedWorkout = plannedSession ? projectCanonicalWorkoutPresentation({ session: null, snapshot: plannedSession.snapshot, evidence: input.evidence, displayUnit: input.displayUnit }) : null;
  const activeWorkout = input.activeAggregate ? projectCanonicalWorkoutPresentation({ session: input.activeAggregate.session, snapshot: input.activeAggregate.session.prescriptionSnapshot, events: input.activeAggregate.events, evidence: input.evidence, displayUnit: input.displayUnit, now: input.now }) : null;
  const historical = [...(model.historicalRecordedSessions ?? [])].sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? "") || right.recordedSessionId.localeCompare(left.recordedSessionId));
  const latest = historical[0];
  const completedToday = latest?.completedAt ? sameLocalDay(Date.parse(latest.completedAt), input.now ?? Date.now()) : false;
  const completedThisMicrocycle = historical.filter((session) => session.microcycleId === model.microcycle.id).length;
  const evidenceStatus = (input.evidence?.length ?? 0) > 0 ? "current" as const : "not_yet_available" as const;
  const actions: CanonicalHomeAction[] = [];
  let primary: CanonicalHomePrimary;

  if (input.activeAggregateStatus === "missing") {
    return {
      ...base("recorded_history_recovery_required", "Your workout needs attention", "The plan is safe, but the active workout record needs to be restored.", [progressAction]),
      planId: model.planId,
      revision: model.revision,
      progress: progressSummary(historical.length, completedThisMicrocycle, evidenceStatus),
      attention: { tone: "warning", title: "Workout recovery required", detail: "Open Train to retry the canonical recorded-session restoration." },
    };
  }

  if (activeWorkout && model.activeRecordedSession) {
    const action: CanonicalHomeAction = { type: "resume_recorded_session", planId: model.planId, planRevision: model.revision, sessionId: model.activeRecordedSession.recordedSessionId };
    actions.push(action);
    primary = { kind: "active", eyebrow: activeWorkout.lifecycle === "paused" ? "Workout paused" : "Workout in progress", title: activeWorkout.title, detail: `${activeWorkout.completedSets} of ${activeWorkout.totalSets} working sets complete`, ctaLabel: activeWorkout.lifecycle === "paused" ? "Resume workout" : "Continue workout", action, workout: summarizeWorkout(activeWorkout) };
  } else if (completedToday && latest) {
    const action = plannedSession ? plannedAction(model, plannedSession.id) : undefined;
    if (action) actions.push(action);
    const duration = completedDurationMinutes(latest);
    primary = { kind: "completed_today", eyebrow: "Training complete", title: "Today’s workout is done", detail: `${sessionRoleDisplayName(latest.role)} · ${latest.performedSets} working sets${duration ? ` · ${duration} min` : ""}`, ...(action ? { ctaLabel: "Preview next workout", action } : {}), ...(plannedWorkout ? { workout: summarizeWorkout(plannedWorkout) } : {}) };
  } else if (plannedSession && plannedWorkout) {
    const action = plannedAction(model, plannedSession.id);
    actions.push(action);
    primary = { kind: "planned", eyebrow: "Up next", title: plannedWorkout.title, detail: plannedWorkout.purpose, ctaLabel: "Start workout", action, workout: summarizeWorkout(plannedWorkout) };
  } else {
    primary = { kind: "rest_day", eyebrow: "Recovery day", title: "No workout due", detail: "Your current microcycle has no remaining planned session. Recover and review Progress when you’re ready." };
  }
  actions.push(progressAction);

  const activeSnapshot = input.activeAggregate?.session.prescriptionSnapshot;
  const activeIndex = activeSnapshot && typeof activeSnapshot.planSessionIndex === "number" ? activeSnapshot.planSessionIndex : null;
  const nextIndex = plannedSession?.planSessionIndex ?? null;
  const position = activeIndex ?? nextIndex;
  const sessionPosition = position === null ? "Week complete" : `Session ${position + 1} of ${model.microcycle.trainingDays}`;
  const completionLabel = `${Math.min(completedThisMicrocycle, model.microcycle.trainingDays)} of ${model.microcycle.trainingDays} sessions completed`;

  return {
    contractVersion: CANONICAL_HOME_PROJECTION_VERSION,
    status: "ready",
    greeting: { eyebrow: "Adaptive Strength Coach", title: "Today", subtitle: activeWorkout ? "Pick up exactly where you left off." : completedToday ? "Your work is saved. Here’s what comes next." : "Your next action, programme position, and recent work." },
    planId: model.planId,
    revision: model.revision,
    primary,
    programme: { goal: trainingGoalDisplayName(model.macrocycle.goal), phase: mesocyclePurposeDisplayName(model.mesocycle.purpose), microcycle: `Week ${model.microcycle.sequenceNumber}`, sessionPosition, completionLabel },
    progress: progressSummary(historical.length, completedThisMicrocycle, evidenceStatus),
    ...(latest ? { recent: { title: sessionRoleDisplayName(latest.role), detail: `${latest.performedSets} sets · ${latest.performedReps} reps`, ...(latest.completedAt ? { completedAt: latest.completedAt } : {}) } } : {}),
    ...(evidenceStatus === "not_yet_available" ? { attention: { tone: "info" as const, title: "Progress starts with completed work", detail: "Complete a workout to unlock evidence-based progress and recovery guidance.", action: progressAction } } : {}),
    actions,
  };
}

function plannedAction(model: CanonicalActivePlanReadModel, sessionId: string): CanonicalHomeAction {
  return { type: "open_planned_session", planId: model.planId, planRevision: model.revision, sessionId };
}

function summarizeWorkout(workout: WorkoutPresentation): CanonicalHomeWorkoutSummary {
  return { title: workout.title, purpose: workout.purpose, lifecycle: workout.lifecycle, exerciseCount: workout.exercises.length, workingSetCount: workout.totalSets, completedSetCount: workout.completedSets, progressPercent: workout.progressPercent, estimatedDurationMinutes: workout.estimatedDurationMinutes, exercisePreview: workout.exercises.slice(0, 3).map((exercise) => exercise.name) };
}

function progressSummary(historicalCount: number, completedThisMicrocycle: number, evidenceStatus: "current" | "not_yet_available"): CanonicalHomeProjection["progress"] {
  return { historicalCount, completedThisMicrocycle, evidenceStatus, headline: historicalCount ? `${historicalCount} completed workout${historicalCount === 1 ? "" : "s"} recorded` : "Your first completed workout will appear here" };
}

function sameLocalDay(left: number, right: number): boolean {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  const a = new Date(left);
  const b = new Date(right);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function completedDurationMinutes(session: Readonly<{ startedAt?: string; completedAt?: string }>): number | null {
  if (!session.startedAt || !session.completedAt) return null;
  const durationMs = Date.parse(session.completedAt) - Date.parse(session.startedAt);
  return Number.isFinite(durationMs) && durationMs > 0 ? Math.max(1, Math.round(durationMs / 60_000)) : null;
}

function base(status: CanonicalHomeStatus, title: string, subtitle: string, actions: readonly CanonicalHomeAction[]): CanonicalHomeProjection {
  return { contractVersion: CANONICAL_HOME_PROJECTION_VERSION, status, greeting: { eyebrow: "Adaptive Strength Coach", title, subtitle }, progress: { historicalCount: 0, completedThisMicrocycle: 0, evidenceStatus: "not_yet_available", headline: "Your first completed workout will appear here" }, actions };
}
