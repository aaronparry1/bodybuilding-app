import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { projectCanonicalWorkoutPresentation, type WorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_HOME_PROJECTION_VERSION = "canonical_home_projection_v3" as const;

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
  methodPreview: readonly string[];
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
  greeting: Readonly<{ title: string; subtitle: string }>;
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
    reviewAvailable: boolean;
    headline: string;
  }>;
  recent?: Readonly<{ title: string; detail: string; completedAt?: string }>;
  conditioning?: Readonly<{ title: string; detail: string; placement: string }>;
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
  const plannedSession = model.nextSession ? model.plannedSessions.find((candidate) => candidate.id === model.nextSession?.id) : undefined;
  const plannedWorkout = plannedSession ? projectCanonicalWorkoutPresentation({ session: null, snapshot: plannedSession.snapshot, evidence: input.evidence, displayUnit: input.displayUnit }) : null;
  const activeWorkout = input.activeAggregate ? projectCanonicalWorkoutPresentation({ session: input.activeAggregate.session, snapshot: input.activeAggregate.session.prescriptionSnapshot, events: input.activeAggregate.events, evidence: input.evidence, displayUnit: input.displayUnit, now: input.now }) : null;
  const historical = [...(model.historicalRecordedSessions ?? [])].sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? "") || right.recordedSessionId.localeCompare(left.recordedSessionId));
  const latest = historical[0];
  const completedToday = latest?.completedAt ? sameLocalDay(Date.parse(latest.completedAt), input.now ?? Date.now()) : false;
  const completedThisMicrocycle = historical.filter((session) => session.microcycleId === model.microcycle.id).length;
  const evidenceStatus = (input.evidence?.length ?? 0) > 0 ? "current" as const : "not_yet_available" as const;
  const reviewAvailable = historical.length > 0;
  const progressAction: CanonicalHomeAction = { type: "open_progress", planId: model.planId, planRevision: model.revision };
  const actions: CanonicalHomeAction[] = [];
  let primary: CanonicalHomePrimary;

  if (input.activeAggregateStatus === "missing") {
    return {
      ...base("recorded_history_recovery_required", "Your workout needs attention", "The plan is safe, but the active workout record needs to be restored.", reviewAvailable ? [progressAction] : []),
      planId: model.planId,
      revision: model.revision,
      progress: progressSummary(historical.length, completedThisMicrocycle, evidenceStatus, reviewAvailable),
      attention: { tone: "warning", title: "Workout recovery required", detail: "Open Train to retry the canonical recorded-session restoration." },
    };
  }

  if (activeWorkout && model.activeRecordedSession) {
    const action: CanonicalHomeAction = { type: "resume_recorded_session", planId: model.planId, planRevision: model.revision, sessionId: model.activeRecordedSession.recordedSessionId };
    actions.push(action);
    primary = { kind: "active", eyebrow: activeWorkout.lifecycle === "paused" ? "Workout paused" : "Workout in progress", title: activeWorkout.title, detail: `${activeWorkout.completedSets} of ${activeWorkout.totalSets} working sets complete`, ctaLabel: activeWorkout.lifecycle === "paused" ? "Resume workout" : "Continue workout", action, workout: summarizeWorkout(activeWorkout, input.activeAggregate!.session.role) };
  } else if (completedToday && latest) {
    const action = plannedSession ? plannedAction(model, plannedSession.id) : undefined;
    if (action) actions.push(action);
    const duration = completedDurationMinutes(latest);
    primary = { kind: "completed_today", eyebrow: "Training complete", title: "Today’s workout is done", detail: `${sessionRoleDisplayName(latest.role)} · ${latest.performedSets} working sets${duration ? ` · ${duration} min` : ""}`, ...(action ? { ctaLabel: "Preview next workout", action } : {}), ...(plannedWorkout ? { workout: summarizeWorkout(plannedWorkout, plannedSession?.role) } : {}) };
  } else if (plannedSession && plannedWorkout) {
    const action = plannedAction(model, plannedSession.id);
    actions.push(action);
    primary = { kind: "planned", eyebrow: "Up next", title: plannedWorkout.title, detail: sessionPurposeCopy(plannedSession.role, plannedWorkout.title), ctaLabel: "Review workout", action, workout: summarizeWorkout(plannedWorkout, plannedSession.role) };
  } else {
    primary = { kind: "rest_day", eyebrow: "Recovery day", title: "No workout due", detail: "Recover well today and be ready for your next session." };
  }
  if (reviewAvailable) actions.push(progressAction);

  const activeSnapshot = input.activeAggregate?.session.prescriptionSnapshot;
  const activeIndex = activeSnapshot && typeof activeSnapshot.planSessionIndex === "number" ? activeSnapshot.planSessionIndex : null;
  const nextIndex = plannedSession?.planSessionIndex ?? null;
  const position = activeIndex ?? nextIndex;
  const sessionPosition = position === null
    ? completedThisMicrocycle >= model.microcycle.trainingDays ? "Week complete" : "No session due"
    : `Session ${position + 1} of ${model.microcycle.trainingDays}`;
  const completionLabel = `${Math.min(completedThisMicrocycle, model.microcycle.trainingDays)} of ${model.microcycle.trainingDays} sessions completed`;

  return {
    contractVersion: CANONICAL_HOME_PROJECTION_VERSION,
    status: "ready",
    greeting: { title: "Today", subtitle: activeWorkout ? "Your session is ready to continue." : completedToday ? "Your work is saved." : primary.kind === "rest_day" ? "Make today support the next session." : "Your next session is ready." },
    planId: model.planId,
    revision: model.revision,
    primary,
    programme: { goal: trainingGoalDisplayName(model.macrocycle.goal), phase: mesocyclePurposeDisplayName(model.mesocycle.purpose), microcycle: `Week ${model.microcycle.sequenceNumber}`, sessionPosition, completionLabel },
    progress: progressSummary(historical.length, completedThisMicrocycle, evidenceStatus, reviewAvailable),
    ...(model.progress.latestDecision?.boundaryState ? {
      attention: {
        tone: "warning" as const,
        title: "Your next training step needs review",
        detail: model.progress.latestDecision.explanation,
        ...(reviewAvailable ? { action: progressAction } : {}),
      },
    } : {}),
    ...(model.conditioning?.status === "active" && model.conditioning.sessions[0] ? { conditioning: { title: cardioTitle(model.conditioning.sessions[0].kind), detail: cardioDetail(model.conditioning.sessions[0]), placement: placementLabel(model.conditioning.sessions[0].placement) } } : {}),
    ...(latest ? { recent: { title: sessionRoleDisplayName(latest.role), detail: `${latest.performedSets} sets · ${latest.performedReps} reps`, ...(latest.completedAt ? { completedAt: latest.completedAt } : {}) } } : {}),
    actions,
  };
}

function cardioTitle(kind: string): string { return kind === "performance_conditioning" ? "Performance conditioning" : kind === "capacity_cardio" ? "Capacity cardio" : "Recovery cardio"; }
function cardioDetail(session: NonNullable<CanonicalActivePlanReadModel["conditioning"]>["sessions"][number]): string { return session.intensity === "intervals" && session.intervalStructure ? `${session.intervalStructure.repetitions} × ${session.intervalStructure.workSeconds / 60} min with ${session.intervalStructure.recoverySeconds / 60} min easy recovery` : `${session.durationMinutes} min · ${session.intensity === "easy_zone_2" ? "easy Zone 2" : "moderate Zone 2"} · ${session.modality.replaceAll("_", " ")}`; }
function placementLabel(value: string): string { return value === "recovery_day" ? "Recovery day" : value === "after_upper_lifting" ? "After upper-body lifting" : "Separate from lower-body lifting"; }

function plannedAction(model: CanonicalActivePlanReadModel, sessionId: string): CanonicalHomeAction {
  return { type: "open_planned_session", planId: model.planId, planRevision: model.revision, sessionId };
}

function summarizeWorkout(workout: WorkoutPresentation, role?: string): CanonicalHomeWorkoutSummary {
  const methods = [...new Set(workout.exercises.map((exercise) => exercise.method))];
  return { title: workout.title, purpose: sessionPurposeCopy(role, workout.title), lifecycle: workout.lifecycle, exerciseCount: workout.exercises.length, workingSetCount: workout.totalSets, completedSetCount: workout.completedSets, progressPercent: workout.progressPercent, estimatedDurationMinutes: workout.estimatedDurationMinutes, exercisePreview: workout.exercises.slice(0, 2).map((exercise) => exercise.name), methodPreview: methods };
}

function progressSummary(historicalCount: number, completedThisMicrocycle: number, evidenceStatus: "current" | "not_yet_available", reviewAvailable: boolean): CanonicalHomeProjection["progress"] {
  return { historicalCount, completedThisMicrocycle, evidenceStatus, reviewAvailable, headline: historicalCount ? `${historicalCount} completed workout${historicalCount === 1 ? "" : "s"} recorded` : "Complete your first session to begin your training record." };
}

function sessionPurposeCopy(role: string | undefined, title: string): string {
  const normalized = (role ?? "").toLowerCase();
  if (normalized.includes("bench")) return "Build your bench, then finish with focused upper-body work.";
  if (normalized.includes("squat")) return "Build your squat, then add focused leg work.";
  if (normalized.includes("deadlift")) return "Build your deadlift, then finish with focused back work.";
  if (normalized.includes("upper")) return "Build upper-body volume with focused support work.";
  if (normalized.includes("lower")) return "Build lower-body volume with focused support work.";
  return `Focus on ${title.toLowerCase()} and complete the prescribed work.`;
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
  return { contractVersion: CANONICAL_HOME_PROJECTION_VERSION, status, greeting: { title, subtitle }, progress: { historicalCount: 0, completedThisMicrocycle: 0, evidenceStatus: "not_yet_available", reviewAvailable: false, headline: "Complete your first session to begin your training record." }, actions };
}
