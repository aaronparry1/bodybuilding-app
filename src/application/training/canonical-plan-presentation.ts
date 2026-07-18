import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { projectCanonicalWorkoutPresentation, type WorkoutExercisePresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { mesocycleById, type MesocycleId } from "@/domain/training/mesocycle-library";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_PLAN_PRESENTATION_VERSION = "canonical_plan_presentation_v1" as const;

export type CanonicalPlanPresentationAction = Readonly<{
  type: "open_planned_session" | "resume_recorded_session" | "setup_plan" | "retry";
  label: string;
  sessionId?: string;
  planId?: string;
  planRevision?: number;
}>;

export type CanonicalPlanSessionStatus = "completed" | "active" | "paused" | "next" | "upcoming";

export type CanonicalPlanSessionPresentation = Readonly<{
  id: string;
  programmePosition: number;
  dayLabel: string;
  name: string;
  purpose: string;
  emphasis: string;
  exerciseCount: number;
  workingSetCount: number;
  estimatedDurationMinutes: number | null;
  status: CanonicalPlanSessionStatus;
  statusLabel: string;
  preview: Readonly<{
    title: string;
    purpose: string;
    exercises: readonly Readonly<{
      id: string;
      order: number;
      name: string;
      method: string;
      loadState: string;
      sets: readonly Readonly<{ number: number; target: string; loadLabel: string; restSeconds: number }>[];
    }>[];
  }>;
}>;

export type CanonicalPlanPresentation = Readonly<{
  contractVersion: typeof CANONICAL_PLAN_PRESENTATION_VERSION;
  status: "ready" | "generating" | "recoverable_error" | "storage_error" | "empty";
  title: string;
  subtitle: string;
  programme?: Readonly<{
    focus: string;
    phase: string;
    phasePurpose: string;
    week: string;
    progressLabel: string;
    progressPercent: number;
  }>;
  schedule: readonly CanonicalPlanSessionPresentation[];
  roadmap: readonly Readonly<{ state: "completed" | "current" | "reviewed_next"; label: string; title: string; detail: string }>[];
  phaseRationale?: string;
  primaryAction?: CanonicalPlanPresentationAction;
  attention?: Readonly<{ title: string; detail: string; action?: CanonicalPlanPresentationAction }>;
}>;

type RecordedAggregate = Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>;

export function readCanonicalPlanPresentation(input: Readonly<{
  state?: CanonicalActivePlanState;
  displayUnit?: "kg" | "lb";
  previewStatus?: "generating" | "recoverable_error" | "storage_error" | "empty";
}> = {}): CanonicalPlanPresentation {
  const state = input.state ?? canonicalActivePlanState.getState();
  if (input.previewStatus) return projectCanonicalPlanPresentation({ status: input.previewStatus, model: input.previewStatus === "recoverable_error" ? state.model : null });
  if (state.hydration === "empty") return projectCanonicalPlanPresentation({ status: "empty", model: null });
  if (state.hydration === "error") {
    const recoverable = /retry|missing|reconciliation|history/i.test(state.error ?? "");
    return projectCanonicalPlanPresentation({ status: recoverable ? "recoverable_error" : "storage_error", model: null });
  }
  if (!state.model) return projectCanonicalPlanPresentation({ status: "generating", model: null });
  const aggregates: RecordedAggregate[] = [];
  for (const reference of [state.model.activeRecordedSession, ...(state.model.historicalRecordedSessions ?? [])].filter(Boolean)) {
    const aggregate = canonicalRecordedSessionLedger.get(reference!.recordedSessionId);
    if (aggregate.status !== "found") return projectCanonicalPlanPresentation({ status: "recoverable_error", model: state.model });
    aggregates.push(aggregate);
  }
  return projectCanonicalPlanPresentation({
    status: "ready",
    model: state.model,
    recordedAggregates: aggregates,
    evidence: canonicalProgressEvidenceRepository.list(state.model.planId),
    displayUnit: input.displayUnit,
  });
}

export function projectCanonicalPlanPresentation(input: Readonly<{
  status: CanonicalPlanPresentation["status"];
  model: CanonicalActivePlanReadModel | null;
  recordedAggregates?: readonly RecordedAggregate[];
  evidence?: ReturnType<typeof canonicalProgressEvidenceRepository.list>;
  displayUnit?: "kg" | "lb";
}>): CanonicalPlanPresentation {
  if (input.status === "generating") return base("generating", "Building your programme", "Your first week is being prepared from your training choices.");
  if (input.status === "empty") {
    const action = { type: "setup_plan", label: "Set up training" } as const;
    return { ...base("empty", "Build your training plan", "Answer a few questions to create a programme around your goals."), primaryAction: action };
  }
  if (input.status === "recoverable_error") {
    const action = { type: "retry", label: "Retry" } as const;
    return { ...base("recoverable_error", "Your plan needs a refresh", "Your saved training is still protected. Retry the local read before continuing."), attention: { title: "Plan temporarily unavailable", detail: "No programme or workout data has been changed.", action }, primaryAction: action };
  }
  if (input.status === "storage_error" || !input.model) {
    const action = { type: "retry", label: "Try again" } as const;
    return { ...base("storage_error", "Plan unavailable", "Your saved plan could not be read safely."), attention: { title: "Training data needs attention", detail: "Nothing has been overwritten. Try again before changing your programme.", action }, primaryAction: action };
  }

  const model = input.model;
  const sessions = buildSchedule(model, input.recordedAggregates ?? [], input.evidence ?? [], input.displayUnit ?? "kg");
  const completed = sessions.filter((session) => session.status === "completed").length;
  const current = sessions.find((session) => session.status === "paused" || session.status === "active");
  const next = sessions.find((session) => session.status === "next");
  const primaryAction = current
    ? { type: "resume_recorded_session" as const, label: current.status === "paused" ? "Resume paused workout" : "Resume active workout", sessionId: current.id, planId: model.planId, planRevision: model.revision }
    : next
      ? { type: "open_planned_session" as const, label: "Start next workout", sessionId: next.id, planId: model.planId, planRevision: model.revision }
      : undefined;
  const definitionId = model.mesocycle.definitionId as MesocycleId | undefined;
  const spec = definitionId ? mesocycleById(definitionId) : undefined;
  const phase = phaseName(definitionId, model.mesocycle.purpose);
  const roadmap = [
    ...(model.mesocycle.position > 0 ? [{ state: "completed" as const, label: "Completed", title: "Previous focus", detail: "Your earlier phase remains recorded in programme history." }] : []),
    { state: "current" as const, label: "Current focus", title: phase, detail: phasePurpose(model.mesocycle.purpose) },
    ...(spec?.nextStates.length ? [{ state: "reviewed_next" as const, label: "Reviewed next", title: spec.nextStates.slice(0, 2).map((id) => phaseName(id, id)).join(" or "), detail: "A later progress review decides whether either direction is appropriate." }] : [{ state: "reviewed_next" as const, label: "Reviewed next", title: "Next direction after review", detail: "Your completed training and recovery will guide what follows." }]),
  ];
  return {
    contractVersion: CANONICAL_PLAN_PRESENTATION_VERSION,
    status: "ready",
    title: "Plan",
    subtitle: primaryAction ? "See where you are, what comes next, and the rest of your week." : "This week is complete. Your next direction will be reviewed from completed training.",
    programme: {
      focus: trainingGoalDisplayName(model.macrocycle.goal),
      phase,
      phasePurpose: phasePurpose(model.mesocycle.purpose),
      week: `Week ${model.microcycle.sequenceNumber}`,
      progressLabel: `${Math.min(completed, model.microcycle.trainingDays)} of ${model.microcycle.trainingDays} sessions completed`,
      progressPercent: model.microcycle.trainingDays ? Math.round((Math.min(completed, model.microcycle.trainingDays) / model.microcycle.trainingDays) * 100) : 0,
    },
    schedule: sessions,
    roadmap,
    phaseRationale: spec ? `${spec.primaryStimulus}. Progress and recovery are reviewed before moving to ${spec.nextStates.map((id) => phaseName(id, id)).join(" or ")}.` : `${phasePurpose(model.mesocycle.purpose)} Your completed work determines what is reviewed next.`,
    ...(primaryAction ? { primaryAction } : {}),
  };
}

function buildSchedule(model: CanonicalActivePlanReadModel, aggregates: readonly RecordedAggregate[], evidence: ReturnType<typeof canonicalProgressEvidenceRepository.list>, displayUnit: "kg" | "lb"): CanonicalPlanSessionPresentation[] {
  const planned = model.plannedSessions.map((session) => ({
    id: session.id,
    index: session.planSessionIndex,
    role: session.role,
    status: model.nextSession?.id === session.id ? "next" as const : "upcoming" as const,
    snapshot: session.snapshot,
    aggregate: null,
  }));
  const recorded = aggregates.map((aggregate) => ({
    id: aggregate.session.recordedSessionId,
    index: integer((aggregate.session.prescriptionSnapshot as Record<string, unknown>).planSessionIndex, 0),
    role: aggregate.session.role,
    status: aggregate.session.status === "started" ? "active" as const : aggregate.session.status === "paused" ? "paused" as const : "completed" as const,
    snapshot: aggregate.session.prescriptionSnapshot,
    aggregate,
  }));
  return [...planned, ...recorded].sort((left, right) => left.index - right.index || left.id.localeCompare(right.id)).map((entry) => {
    const workout = projectCanonicalWorkoutPresentation({ session: entry.aggregate?.session ?? null, snapshot: entry.snapshot, events: entry.aggregate?.events, evidence, displayUnit });
    return {
      id: entry.id,
      programmePosition: entry.index + 1,
      dayLabel: `Session ${entry.index + 1}`,
      name: sessionRoleDisplayName(entry.role),
      purpose: sessionPurpose(entry.role),
      emphasis: workout.exercises.slice(0, 2).map((exercise) => exercise.name).join(" · "),
      exerciseCount: workout.exercises.length,
      workingSetCount: workout.totalSets,
      estimatedDurationMinutes: workout.estimatedDurationMinutes,
      status: entry.status,
      statusLabel: statusLabel(entry.status),
      preview: { title: workout.title, purpose: sessionPurpose(entry.role), exercises: workout.exercises.map(previewExercise) },
    };
  });
}

function previewExercise(exercise: WorkoutExercisePresentation) {
  return { id: exercise.id, order: exercise.order, name: exercise.name, method: exercise.method, loadState: exercise.loadState, sets: exercise.sets.map((set) => ({ number: set.number, target: set.target, loadLabel: set.loadLabel, restSeconds: set.restSeconds })) };
}

function sessionPurpose(role: string): string {
  const value = role.toLowerCase();
  if (value.includes("bench")) return "Build bench strength, then add focused upper-body work.";
  if (value.includes("squat")) return "Build squat strength, then add focused leg work.";
  if (value.includes("deadlift")) return "Build deadlift strength, then add focused back work.";
  if (value.includes("upper")) return "Build balanced upper-body volume with lower-fatigue support work.";
  if (value.includes("lower")) return "Build balanced lower-body volume with lower-fatigue support work.";
  return `Complete the prescribed ${sessionRoleDisplayName(role).toLowerCase()} work with controlled technique.`;
}

function phaseName(definitionId: string | undefined, purpose: string): string {
  const labels: Record<string, string> = {
    powerbuilding_foundation: "Foundation phase",
    powerbuilding_hypertrophy: "Muscle-building phase",
    powerbuilding_strength: "Strength development phase",
    powerbuilding_intensification: "Heavy practice phase",
    powerbuilding_realisation: "Performance phase",
    powerbuilding_transition: "Recovery phase",
    hypertrophy_base: "Muscle-building phase",
    hypertrophy_volume: "Volume development phase",
    hypertrophy_specialisation: "Specialisation phase",
    hypertrophy_consolidation: "Consolidation phase",
    hypertrophy_transition: "Recovery phase",
  };
  return labels[definitionId ?? ""] ?? mesocyclePurposeDisplayName(purpose);
}

function phasePurpose(purpose: string): string {
  const trimmed = purpose.trim();
  return trimmed && !trimmed.includes("_") ? `${trimmed.replace(/[.]$/, "")}.` : "Build repeatable training quality before the next reviewed phase.";
}

function statusLabel(status: CanonicalPlanSessionStatus): string {
  return status === "completed" ? "Completed" : status === "active" ? "In progress" : status === "paused" ? "Paused" : status === "next" ? "Next" : "Upcoming";
}

function integer(value: unknown, fallback: number): number { return Number.isInteger(value) ? Number(value) : fallback; }

function base(status: CanonicalPlanPresentation["status"], title: string, subtitle: string): CanonicalPlanPresentation {
  return { contractVersion: CANONICAL_PLAN_PRESENTATION_VERSION, status, title, subtitle, schedule: [], roadmap: [] };
}
