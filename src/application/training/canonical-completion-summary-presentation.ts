import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { exerciseDisplayName, methodDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import { activeElapsedSeconds, displayLoadFromBaseKg } from "@/application/training/canonical-workout-presentation";
import { deriveCanonicalWorkoutAchievements, type CanonicalWorkoutAchievement, type CanonicalWorkoutAggregate } from "@/domain/training/canonical-workout-achievements";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import { projectCanonicalSupersetAdaptation, type CanonicalSupersetAdaptationPresentation } from "@/application/training/canonical-superset-adaptation-presentation";
import { isDesignQaModeRequested } from "@/application/design-qa/design-qa-runtime";

export type CanonicalCompletionSummaryPresentation = Readonly<{
  title: "Workout complete";
  workoutName: string;
  completion: "complete" | "partial" | "missed";
  completionLabel: string;
  elapsedSeconds: number;
  completedWorkingSets: number;
  exercisesCompleted: number;
  prescribedExercises: number;
  totalVolume: number | null;
  methodsPerformed: readonly string[];
  achievements: readonly CanonicalWorkoutAchievement[];
  coachingOutcome: string;
  coachingChange?: Readonly<{ status: "applied" | "unchanged" | "blocked" | "review_only"; label: string; changes: readonly Readonly<{ exerciseName: string; before: string; after: string; reason: string }>[] }>;
  programmePosition?: string;
  nextWorkoutId: string | null;
  nextWorkoutLabel?: string;
  nextPrescription?: string;
  supersetAdaptation?: CanonicalSupersetAdaptationPresentation;
}>;

export function projectCanonicalCompletionSummary(input: Readonly<{
  session: CanonicalRecordedSession;
  events: readonly CanonicalRecordedSessionEvent[];
  history?: readonly CanonicalWorkoutAggregate[];
  decision?: CanonicalProgressDecision | null;
  displayUnit?: "kg" | "lb";
  programmePosition?: string;
  nextWorkoutId?: string | null;
  nextWorkoutLabel?: string;
  nextPrescription?: string;
  coachingExplanation?: string;
  now?: number;
}>): CanonicalCompletionSummaryPresentation {
  const performance = effectiveCanonicalPerformedWork(input.events).filter((event) => event.payload.completion === "complete");
  const completionSummary = deriveCanonicalCompletionSummary(input.session, input.events);
  const exercises = new Set(performance.map((event) => String(event.payload.exerciseId)));
  const performedSlots = new Set(performance.map((event) => String(event.payload.slotId)));
  const snapshot = (input.session.prescriptionSnapshot ?? {}) as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const methodsPerformed = [...new Set(slots.filter((slot) => performedSlots.has(String(slot.id))).map((slot) => methodDisplayName(String(slot.method))))];
  const weighted = performance.filter((event) => typeof event.payload.load === "number" && event.payload.load > 0 && event.payload.completion === "complete");
  const totalVolume = weighted.length ? weighted.reduce((sum, event) => sum + Number(event.payload.load) * Number(event.payload.reps ?? 0), 0) : null;
  const completedAt = input.events.find((event) => event.type === "completed")?.occurredAt;
  const end = completedAt ? Date.parse(completedAt) : (input.now ?? Date.now());
  const completionLabel = completionSummary.completion === "complete"
    ? "Full session completed"
    : completionSummary.completion === "partial"
      ? "Partial session saved"
      : "Session closed without working sets";
  const displayUnit = input.displayUnit ?? "kg";
  const achievements = deriveCanonicalWorkoutAchievements({ current: { session: input.session, events: input.events }, history: input.history ?? [], exerciseName: exerciseDisplayName }).map((achievement) => presentAchievement(achievement, displayUnit));
  const coachingChange = input.decision ? completionCoachingChange(input.decision, input.displayUnit ?? "kg") : undefined;
  const persistedExplanation = input.decision?.phaseOne?.adaptationAudit?.explanation;
  const coachingOutcome = persistedExplanation
    ? `${persistedExplanation.observation} ${persistedExplanation.decision} ${persistedExplanation.nextAction}`
    : input.coachingExplanation ?? "Training recorded. Your next session is ready when you are.";
  const supersetAdaptation = projectCanonicalSupersetAdaptation({ planId: input.session.planId, surface: "completion", includeQaOnly: isDesignQaModeRequested() });
  return { title: "Workout complete", workoutName: sessionRoleDisplayName(input.session.role), completion: completionSummary.completion, completionLabel, elapsedSeconds: activeElapsedSeconds(input.session, input.events, end), completedWorkingSets: performance.length, exercisesCompleted: exercises.size, prescribedExercises: slots.length, totalVolume, methodsPerformed, achievements, coachingOutcome, ...(coachingChange ? { coachingChange } : {}), ...(input.programmePosition ? { programmePosition: input.programmePosition } : {}), nextWorkoutId: input.nextWorkoutId ?? null, ...(input.nextWorkoutLabel ? { nextWorkoutLabel: input.nextWorkoutLabel } : {}), ...(input.nextPrescription ? { nextPrescription: input.nextPrescription } : {}), ...(supersetAdaptation ? { supersetAdaptation } : {}) };
}

function presentAchievement(achievement: CanonicalWorkoutAchievement, displayUnit: "kg" | "lb"): CanonicalWorkoutAchievement {
  if (!achievement.unit || achievement.value == null) return achievement;
  const value = displayLoadFromBaseKg(achievement.value, displayUnit);
  const previousValue = achievement.previousValue == null ? undefined : displayLoadFromBaseKg(achievement.previousValue, displayUnit);
  const load = achievement.load == null ? undefined : displayLoadFromBaseKg(achievement.load, displayUnit);
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  const detail = achievement.kind === "load" ? `${formatted} ${displayUnit} is your heaviest completed work set for this exercise.`
    : achievement.kind === "comparable_reps" ? `${achievement.reps} reps at ${achievement.load === 0 ? "bodyweight" : `${Number.isInteger(load!) ? load : load!.toFixed(1)} ${displayUnit}`} beats your previous ${achievement.previousValue} at the same load.`
      : achievement.kind === "estimated_strength" ? `${formatted} ${displayUnit} estimated 1RM from completed comparable work.`
        : achievement.kind === "meaningful_volume" ? `${formatted} ${displayUnit} of completed load volume, at least 5% above your previous best.`
          : achievement.detail;
  return { ...achievement, value, ...(previousValue === undefined ? {} : { previousValue }), ...(load === undefined ? {} : { load }), unit: displayUnit, detail };
}

function completionCoachingChange(decision: CanonicalProgressDecision, displayUnit: "kg" | "lb"): NonNullable<CanonicalCompletionSummaryPresentation["coachingChange"]> {
  const receipt = decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2" ? decision.phaseOneApplication : undefined;
  const status = receipt?.status === "applied" ? "applied" as const : receipt?.status === "unchanged" ? "unchanged" as const : receipt?.status === "blocked" ? "blocked" as const : "review_only" as const;
  const label = status === "applied" ? "Applied to your programme" : status === "unchanged" ? "Programme held steady" : status === "blocked" ? "No change made" : "Review available";
  const changes = (decision.phaseOne?.boundedAdjustment.numericDecisions ?? []).filter((item) => item.after).slice(0, 3).map((item) => ({
    exerciseName: exerciseDisplayName(item.exerciseId),
    before: prescription(item.before.prescribedBaseLoad, item.before.exactTargets, displayUnit),
    after: prescription(item.after!.prescribedBaseLoad, item.after!.exactTargets, displayUnit),
    reason: item.outcome === "progress_load" ? `Load increased after ${item.exposureCount} comparable workouts.` : item.outcome === "progress_repetitions" ? `Rep targets increased after ${item.exposureCount} comparable workouts.` : item.outcome === "regress_load" ? `Load reduced after repeated comparable difficulty.` : `Rep targets reduced after repeated comparable difficulty.`,
  }));
  return { status, label, changes };
}

function prescription(loadKg: number, targets: readonly number[], displayUnit: "kg" | "lb"): string {
  const load = displayLoadFromBaseKg(loadKg, displayUnit);
  const formatted = Number.isInteger(load) ? String(load) : load.toFixed(1);
  const reps = targets.length && targets.every((value) => value === targets[0]) ? `${targets.length} × ${targets[0]}` : targets.join(" / ");
  return `${formatted} ${displayUnit} · ${reps} reps`;
}
