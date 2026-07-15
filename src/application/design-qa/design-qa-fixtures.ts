import { appSettingsStore } from "@/application/settings/app-settings";
import { cacheSubscription } from "@/application/billing/subscription-cache";
import { seedMockSubscriptionStatus } from "@/application/billing/mock-revenuecat";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import { legacyTrainingYearArchive } from "@/application/training/legacy-training-year-archive";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { AppEnvironment } from "@/application/runtime/app-environment-core";
import { isDesignQaModeAvailable } from "@/application/runtime/app-environment-core";
import { calculateNextSessionStartingLoadFromProductiveSets, resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { createActiveTrainingPlan, transitionToApprovedMesocycle, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { replaceExerciseForFutureSessions } from "@/domain/training/recommendation-actions";
import type { Exercise, SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import type { TrainingYear } from "@/domain/training/annual-models";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildSessionPrepRecord, getSessionPrepRoutine, type SessionPrepRecord } from "@/domain/training/session-prep";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { applyCanonicalActiveSessionFixture } from "@/application/design-qa/canonical-session-fixtures";
import { createCanonicalTrainProjection } from "@/application/design-qa/canonical-train-projection";

export type DesignQaFixtureId =
  | "progress_low"
  | "progress_healthy"
  | "progress_strength_dashboard"
  | "progress_fatigue"
  | "progress_slowing"
  | "progress_recent_clean"
  | "home_no_plan"
  | "home_active_plan"
  | "home_active_workout"
  | "home_completed_today"
  | "home_rest_day"
  | "home_recovery_capacity"
  | "home_recent_prs"
  | "train_overview_fresh"
  | "train_first_set"
  | "train_warmups"
  | "train_work_sets"
  | "train_near_threshold"
  | "train_shutdown"
  | "train_swapped"
  | "train_added_exercise"
  | "train_load_no_history"
  | "train_load_strength_unknown"
  | "train_load_exact_progressed"
  | "train_load_exact_held"
  | "train_load_same_family_estimate"
  | "train_load_same_family_low_confidence"
  | "train_load_lb_known"
  | "train_load_bodyweight"
  | "train_end_workout_confirm"
  | "train_review_prs"
  | "train_load_regression_reduce"
  | "train_load_escalation"
  | "train_load_escalation_modal"
  | "train_load_average_next"
  | "train_increment_barbell_1"
  | "train_increment_barbell_2_5"
  | "train_increment_barbell_5"
  | "train_increment_machine_1"
  | "train_increment_cable_1"
  | "train_increment_exercise_override"
  | "train_productive_below_min"
  | "train_productive_target_zone"
  | "train_productive_soft_cap"
  | "train_productive_over_soft_cap"
  | "train_prep_not_started"
  | "train_prep_completed"
  | "train_prep_skipped"
  | "train_prep_active_workout"
  | "progress_volume_large_low"
  | "progress_volume_ladder_apply"
  | "progress_volume_large_high_fatigue"
  | "progress_volume_small_progressing"
  | "progress_rotation_stalled_tier_a"
  | "plan_block_transition_action"
  | "progress_deload_action"
  | "progress_rotation_action"
  | "plan_block_transition_accepted"
  | "plan_deload_accepted"
  | "train_rotation_accepted"
  | "progress_rotation_progressing_tier_a"
  | "progress_rotation_tier_c"
  | "phase1_deload_mild"
  | "phase1_deload_clear"
  | "phase1_deload_severe"
  | "phase1_load_one_bad_session"
  | "phase1_goal_strength"
  | "phase1_goal_muscle"
  | "phase1_goal_muscle_strength"
  | "phase1_goal_athletic"
  | "phase1_goal_event"
  | "phase1_goal_general"
  | "phase1_low_history_no_deload"
  | "plan_recommended"
  | "plan_single_hypertrophy"
  | "plan_event_custom"
  | "plan_block_ending"
  | "plan_no_plan";

export interface DesignQaFixtureDefinition {
  id: DesignQaFixtureId;
  area: "Progress" | "Home" | "Train" | "Plan";
  label: string;
  description: string;
  targetHref: string;
}

export interface ActiveDesignQaFixture {
  id: DesignQaFixtureId;
  label: string;
  appliedAt: string;
}

export const designQaFixtureMarker = "[Design QA Fixture]";

const activeFixtureKey = "iron-logic.design-qa-fixture";
const fixtureBackupKey = "iron-logic.design-qa-backup";
const workoutSessionsKey = "iron-logic.workout-sessions";
const activeTrainingPlanKey = "iron-logic.active-training-plan";
const trainingYearKey = "iron-logic.training-year";
const sessionPrepRecordsKey = "iron-logic.session-prep-records";

interface DesignQaFixtureBackup {
  activePlan: ActiveTrainingPlan | null;
  trainingYear: TrainingYear;
  workoutSessions: WorkoutSession[];
  sessionPrepRecords: SessionPrepRecord[];
}

export const designQaFixtures: DesignQaFixtureDefinition[] = [
  { id: "progress_low", area: "Progress", label: "Low history", description: "One completed workout, no strategic verdict yet.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_healthy", area: "Progress", label: "Healthy/adapting", description: "Progression moving, fatigue low, clean recent cards.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_strength_dashboard", area: "Progress", label: "Strength dashboard", description: "Powerlifting Meet history with SBD total and recent PRs.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_fatigue", area: "Progress", label: "Fatigue high", description: "Deload/reduce workload should lead over load jumps.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_slowing", area: "Progress", label: "Progress slowing", description: "Enough history with stalls and monitor-style coaching.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_recent_clean", area: "Progress", label: "Clean recent list", description: "Recent workout cards with no AI names or zero-set junk.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_volume_large_low", area: "Progress", label: "Volume: large low", description: "Large muscle below starting productive zone with low fatigue.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_volume_ladder_apply", area: "Progress", label: "Volume: apply ladder", description: "Personalised volume ladder recommendation with Apply / Ignore actions.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_volume_large_high_fatigue", area: "Progress", label: "Volume: high fatigue", description: "Large muscle high volume with shutdowns and falling output.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_volume_small_progressing", area: "Progress", label: "Volume: small progressing", description: "Small muscle progressing without unnecessary volume warning.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_rotation_stalled_tier_a", area: "Progress", label: "Rotation: stalled Tier A", description: "Stable main lift has stalled and should suggest a purposeful swap.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "plan_block_transition_action", area: "Plan", label: "Action: block transition", description: "Block is ready to advance with action buttons.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "progress_deload_action", area: "Progress", label: "Action: recovery window", description: "Fatigue recommendation with Start recovery / Ignore actions.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_rotation_action", area: "Progress", label: "Action: rotation", description: "Stalled exercise recommendation with Replace / Keep actions.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "plan_block_transition_accepted", area: "Plan", label: "Accepted: next block", description: "After moving to the next block.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "plan_deload_accepted", area: "Plan", label: "Accepted: recovery window", description: "After accepting a recovery recommendation.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "train_rotation_accepted", area: "Train", label: "Accepted: rotation", description: "Future planned session reflects the accepted exercise replacement.", targetHref: "/(protected)/(tabs)/train" },
  { id: "progress_rotation_progressing_tier_a", area: "Progress", label: "Rotation: progressing Tier A", description: "Main lift is progressing and should stay stable.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "progress_rotation_tier_c", area: "Progress", label: "Rotation: Tier C accessory", description: "Accessory has stalled and can rotate with less friction.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_deload_mild", area: "Progress", label: "Phase 1: mild deload", description: "Moderate fatigue with objective evidence resolves to the mild deload profile.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_deload_clear", area: "Progress", label: "Phase 1: clear deload", description: "Clear fatigue evidence resolves to the clear deload profile.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_deload_severe", area: "Progress", label: "Phase 1: severe deload", description: "Repeated regression resolves to the severe deload profile.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_load_one_bad_session", area: "Train", label: "Phase 1: one bad session", description: "One poor exposure holds load instead of reducing.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "phase1_goal_strength", area: "Progress", label: "Goal: Get Stronger", description: "Strength goal protects main-lift output.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_goal_muscle", area: "Progress", label: "Goal: Build Muscle", description: "Muscle goal prioritises recoverable productive volume.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_goal_muscle_strength", area: "Progress", label: "Goal: Build Muscle + Strength", description: "Balanced goal weighs load and volume together.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_goal_athletic", area: "Progress", label: "Goal: Athletic", description: "Athletic goal protects output quality and recovery.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_goal_event", area: "Progress", label: "Goal: Powerlifting Meet", description: "Meet goal prioritises squat, bench, deadlift readiness and specificity.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_goal_general", area: "Progress", label: "Goal: Lose Fat", description: "Lose Fat preserves strength and muscle while keeping fatigue manageable.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "phase1_low_history_no_deload", area: "Progress", label: "Phase 1: low history", description: "Low history suppresses deload actions.", targetHref: "/(protected)/(tabs)/analytics" },
  { id: "home_no_plan", area: "Home", label: "No active plan", description: "Home should ask for setup, not invent a workout.", targetHref: "/(protected)/(tabs)" },
  { id: "home_active_plan", area: "Home", label: "Active plan today", description: "Real active plan with today’s workout.", targetHref: "/(protected)/(tabs)" },
  { id: "home_active_workout", area: "Home", label: "Workout in progress", description: "Continue workout should override generated plan.", targetHref: "/(protected)/(tabs)" },
  { id: "home_completed_today", area: "Home", label: "Today completed", description: "Completed state with next planned session.", targetHref: "/(protected)/(tabs)" },
  { id: "home_rest_day", area: "Home", label: "4-day Upper/Lower", description: "Compact week should show four workouts without Rest consuming a slot.", targetHref: "/(protected)/(tabs)" },
  { id: "home_recovery_capacity", area: "Home", label: "Recovery target", description: "Home shows a legitimate Recovery & Capacity weekly target.", targetHref: "/(protected)/(tabs)" },
  { id: "home_recent_prs", area: "Home", label: "Recent PRs", description: "Home shows meaningful recent PRs without baseline spam.", targetHref: "/(protected)/(tabs)" },
  { id: "train_overview_fresh", area: "Train", label: "Session overview fresh", description: "Unstarted workout overview.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_first_set", area: "Train", label: "Active first set", description: "Exercise detail ready for first work set.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_warmups", area: "Train", label: "Warm-ups logged", description: "Warm-up sets separated from work sets.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_work_sets", area: "Train", label: "Work sets logged", description: "Work sets, load, and status visible.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_near_threshold", area: "Train", label: "Near threshold", description: "Exercise approaching drop-off stop point.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_shutdown", area: "Train", label: "Shutdown complete", description: "Confident stop state after drop-off.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_swapped", area: "Train", label: "Swapped exercise", description: "Clean active list with swap metadata.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_added_exercise", area: "Train", label: "Added exercise", description: "Exercise added during workout only.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_load_no_history", area: "Train", label: "Load: no history", description: "Blank load with guided discovery copy.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_strength_unknown", area: "Train", label: "Load: strength unknown", description: "Strength block unknown-load rows show percentage prescriptions only.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_exact_progressed", area: "Train", label: "Load: exact progressed", description: "Exact history uses previous next recommended load.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_exact_held", area: "Train", label: "Load: exact held", description: "Exact history without progression holds last recommended load.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_load_same_family_estimate", area: "Train", label: "Load: family estimate", description: "Conservative same-family estimate and warm-up copy.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_same_family_low_confidence", area: "Train", label: "Load: low confidence", description: "Same-family data missing or weak, so load stays blank.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_load_lb_known", area: "Train", label: "Load: lb known", description: "Pound display with warm-up percentages.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_bodyweight", area: "Train", label: "Load: bodyweight", description: "Unloaded bodyweight exercise should not show 0lb/0kg.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_end_workout_confirm", area: "Train", label: "Complete workout confirm", description: "Shows the Complete Workout confirmation.", targetHref: "/(protected)/(tabs)/train?qaEndConfirm=1" },
  { id: "train_review_prs", area: "Train", label: "Workout Review PRs", description: "Completed work can open a review with new PRs and no baseline spam.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_regression_reduce", area: "Train", label: "Load: reduce recommendation", description: "Repeated decline creates calm reduced-load evidence.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_load_escalation", area: "Train", label: "Load: in-session escalation", description: "Three top-range sets suggest a next-set load increase.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_load_escalation_modal", area: "Train", label: "Load: escalation modal", description: "Two top-range sets with a future work row ready for the modal flow.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_load_average_next", area: "Train", label: "Load: average next", description: "Ramped productive work recommends rounded-up average starting load.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_barbell_1", area: "Train", label: "Increment: barbell 1kg", description: "Barbell recommendations use a 1kg practical jump.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_barbell_2_5", area: "Train", label: "Increment: barbell 2.5kg", description: "Barbell recommendations use a 2.5kg practical jump.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_barbell_5", area: "Train", label: "Increment: barbell 5kg", description: "Barbell recommendations use a 5kg practical jump.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_machine_1", area: "Train", label: "Increment: machine 1kg", description: "Machine recommendations use a 1kg GymPin/microload jump.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_cable_1", area: "Train", label: "Increment: cable 1kg", description: "Cable recommendations use a 1kg add-on jump.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_increment_exercise_override", area: "Train", label: "Increment: exercise override", description: "Small isolation override beats a larger equipment setting.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_productive_below_min", area: "Train", label: "Productive: below min", description: "Below minimum productive work, no soft-cap prompt.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_productive_target_zone", area: "Train", label: "Productive: target zone", description: "Inside the target productive-set range.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_productive_soft_cap", area: "Train", label: "Productive: soft cap", description: "Soft-cap coaching prompt appears without forcing shutdown.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_productive_over_soft_cap", area: "Train", label: "Productive: over cap", description: "Beyond soft cap, still user-controlled unless drop-off occurs.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "train_prep_not_started", area: "Train", label: "Prep: not started", description: "Fresh workout with visible optional prep entry.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_prep_completed", area: "Train", label: "Prep: completed", description: "Session overview shows prep completed and View Prep.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_prep_skipped", area: "Train", label: "Prep: skipped", description: "Session overview shows prep skipped without blocking training.", targetHref: "/(protected)/(tabs)/train" },
  { id: "train_prep_active_workout", area: "Train", label: "Prep: workout in progress", description: "Logged work resumes directly and keeps prep secondary.", targetHref: "/(protected)/(tabs)/train?qaView=exercise" },
  { id: "plan_recommended", area: "Plan", label: "Recommended annual", description: "Guided annual plan roadmap.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "plan_single_hypertrophy", area: "Plan", label: "Single hypertrophy", description: "Single-block plan does not invent future blocks.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "plan_event_custom", area: "Plan", label: "Powerlifting Meet", description: "Meet plan with countdown-specific block sequence.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "plan_block_ending", area: "Plan", label: "Block nearing end", description: "Current block is on its final week so roadmap and next phase are easy to inspect.", targetHref: "/(protected)/(tabs)/programmes" },
  { id: "plan_no_plan", area: "Plan", label: "No active plan", description: "Plan empty state.", targetHref: "/(protected)/(tabs)/programmes" },
];

export function ensureDesignQaLocalWorkoutReadyState(environment: AppEnvironment = "development"): void {
  if (!isDesignQaModeAvailable(environment)) {
    throw new Error("Design QA local workout state is not available in production.");
  }

  appSettingsStore.patch({ onboardingCompleted: true });
  cacheSubscription(seedMockSubscriptionStatus("trial"));

  if (getActiveDesignQaFixture()) return;

  if (!canonicalActivePlanState.getReadModel()) {
    canonicalActivePlanState.create({ planId: "design-qa-canonical-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell", "bodyweight"], units: "kg", exercises: exerciseLibrary });
  }

  const sessions = workoutSessionRepository.list();
  const hasOpenWorkout = sessions.some((session) => !session.completedAt);
  if (!hasOpenWorkout) {
    workoutSessionRepository.save(openSession({ id: "qa-web-default-active-workout", name: "Push", exercises: pushExerciseList() }));
  }
}

/** Family boundary retained while each fixture family is migrated to canonical operations. */
export type DesignQaFixtureFamily = "plan_state" | "session_lifecycle" | "progress_decision" | "failure_recovery";

export function designQaFixtureFamily(id: DesignQaFixtureId): DesignQaFixtureFamily {
  if (id === "home_active_workout") return "session_lifecycle";
  if (id === "home_recovery_capacity") return "progress_decision";
  if (["train_load_regression_reduce", "train_load_escalation", "train_load_escalation_modal", "train_load_average_next", "train_productive_below_min", "train_productive_target_zone", "train_productive_soft_cap", "train_productive_over_soft_cap"].includes(id)) return "progress_decision";
  if (id.startsWith("plan_") || id.startsWith("home_")) return "plan_state";
  if (id.startsWith("train_")) return "session_lifecycle";
  if (id.startsWith("phase1_") || id.startsWith("progress_")) return "progress_decision";
  return "failure_recovery";
}

export function applyDesignQaFixture(id: DesignQaFixtureId, environment: AppEnvironment = "development"): ActiveDesignQaFixture {
  const family = designQaFixtureFamily(id);
  // Dispatch is explicit even while non-plan families retain their legacy-compatible fixtures.
  // This prevents future branches from silently crossing family boundaries.
  if (family === "plan_state") return applyPlanStateFixture(id, environment);
  if (family === "session_lifecycle") return applySessionLifecycleFixture(id, environment);
  if (family === "progress_decision") return applyProgressDecisionFixture(id, environment);
  return applyFailureRecoveryFixture(id, environment);
}

function applyPlanStateFixture(id: DesignQaFixtureId, environment: AppEnvironment): ActiveDesignQaFixture {
  if (!isDesignQaModeAvailable(environment)) throw new Error("Design QA fixtures are not available in production.");
  clearFixtureViewStateOnly();
  appSettingsStore.patch({ onboardingCompleted: true });
  canonicalActivePlanState.clear();
  if (id !== "home_no_plan" && id !== "plan_no_plan") {
    const daysPerWeek = id === "home_rest_day" ? 4 : id === "plan_single_hypertrophy" ? 2 : 4;
    const result = canonicalActivePlanState.create({ planId: `design-qa:${id}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: id === "plan_event_custom" ? "strength_hypertrophy" : "hypertrophy", macrocycleGoal: id === "plan_event_custom" ? "build_strength" : "build_muscle", experienceLevel: "intermediate", daysPerWeek, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell", "bodyweight"], units: "kg", exercises: exerciseLibrary });
    if (result.hydration !== "hydrated" || !result.model) throw new Error(`canonical_design_qa_plan_failed:${result.error ?? result.hydration}`);
  }
  const definition = getFixtureDefinition(id);
  const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
  jsonStore.set(activeFixtureKey, activeFixture);
  return activeFixture;
}
function applySessionLifecycleFixture(id: DesignQaFixtureId, environment: AppEnvironment): ActiveDesignQaFixture {
  if (id === "home_active_workout") {
    if (!isDesignQaModeAvailable(environment)) throw new Error("Design QA fixtures are not available in production.");
    clearFixtureViewStateOnly();
    appSettingsStore.patch({ onboardingCompleted: true });
    const result = applyCanonicalActiveSessionFixture(id);
    if (result.status === "rejected") throw new Error(result.reason);
    const definition = getFixtureDefinition(id);
    const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
    jsonStore.set(activeFixtureKey, activeFixture);
    return activeFixture;
  }
  if (id.startsWith("train_")) {
    if (!isDesignQaModeAvailable(environment)) throw new Error("Design QA fixtures are not available in production.");
    clearFixtureViewStateOnly();
    appSettingsStore.patch({ onboardingCompleted: true });
    if (["train_overview_fresh", "train_first_set", "train_work_sets", "train_warmups", "train_swapped", "train_added_exercise", "train_near_threshold", "train_shutdown", "train_review_prs", "train_rotation_accepted", "train_end_workout_confirm", "train_prep_not_started", "train_prep_completed", "train_prep_skipped", "train_prep_active_workout"].includes(id)) {
      createCanonicalTrainProjection(id);
      if (id === "train_prep_completed" || id === "train_prep_skipped") saveSessionPrepRecords([prepRecord("Canonical", id.endsWith("completed") ? "completed" : "skipped")]);
      const definition = getFixtureDefinition(id);
      const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
      jsonStore.set(activeFixtureKey, activeFixture);
      return activeFixture;
    }
    applyCanonicalActiveSessionFixture(id);
  }
  return applyDesignQaFixtureMatrix(id, environment);
}
function applyProgressDecisionFixture(id: DesignQaFixtureId, environment: AppEnvironment): ActiveDesignQaFixture {
  return applyDesignQaFixtureMatrix(id, environment);
}
function applyFailureRecoveryFixture(id: DesignQaFixtureId, environment: AppEnvironment): ActiveDesignQaFixture {
  return applyDesignQaFixtureMatrix(id, environment);
}

function applyDesignQaFixtureMatrix(id: DesignQaFixtureId, environment: AppEnvironment = "development"): ActiveDesignQaFixture {
  if (!isDesignQaModeAvailable(environment)) {
    throw new Error("Design QA fixtures are not available in production.");
  }

  if (!getActiveDesignQaFixture() && !jsonStore.get<DesignQaFixtureBackup | null>(fixtureBackupKey, null)) {
    jsonStore.set<DesignQaFixtureBackup>(fixtureBackupKey, {
      activePlan: activeTrainingPlanRepository.getOptional(),
      trainingYear: legacyTrainingYearArchive.read() as TrainingYear,
      workoutSessions: workoutSessionRepository.list(),
      sessionPrepRecords: sessionPrepRepository.list(),
    });
  }

  clearFixtureViewStateOnly();
  appSettingsStore.patch({ onboardingCompleted: true });

  switch (id) {
    case "home_no_plan":
    case "plan_no_plan":
      break;
    case "plan_single_hypertrophy":
      activeTrainingPlanRepository.save(singleHypertrophyPlan());
      break;
    case "plan_event_custom":
      activeTrainingPlanRepository.save(eventPlan());
      break;
    case "plan_block_ending":
      activeTrainingPlanRepository.save(blockEndingPlan());
      break;
    case "plan_block_transition_action":
      activeTrainingPlanRepository.save(blockEndingPlan());
      break;
    case "plan_block_transition_accepted":
      activeTrainingPlanRepository.save(transitionToApprovedMesocycle(blockEndingPlan(), "powerbuilding_hypertrophy"));
      break;
    case "plan_deload_accepted":
      activeTrainingPlanRepository.save({ ...basePlan(), currentMicrocycle: basePlan().currentMicrocycle ? { ...basePlan().currentMicrocycle!, progressionState: "deload" } : undefined });
      break;
    case "train_rotation_accepted":
      activeTrainingPlanRepository.save(
        replaceExerciseForFutureSessions(
          basePlan(),
          "ex-bench-press",
          "ex-floor-press",
          "Bench Press stalled across repeated exposures.",
          "2026-06-06T10:00:00.000Z",
        ),
      );
      saveSessions([
        openSession({
          id: "qa-train-rotation-accepted",
          name: "Push",
          exercises: [exerciseLog(findExercise("ex-floor-press"), { reps: [], status: "active", load: 90 }), inclineExercise([], "active")],
        }),
      ]);
      break;
    case "home_rest_day":
      activeTrainingPlanRepository.save(basePlan({ daysPerWeek: 4, preferredSplit: "upper_lower" }));
      break;
    case "home_completed_today":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([completedSession({ id: "qa-home-completed", name: "Upper", completedAt: todayIso(11), exercises: [benchExercise([12, 11, 10])] })]);
      break;
    case "home_active_workout":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        openSession({
          id: "qa-home-active",
          name: "Push",
          exercises: [
            benchExercise([12, 11], "active"),
            inclineExercise([], "active"),
            lateralRaiseExercise([], "active"),
            cableFlyExercise([], "active"),
            tricepsPushdownExercise([], "active"),
          ],
        }),
      ]);
      break;
    case "home_recovery_capacity":
      activeTrainingPlanRepository.save(basePlan({ goal: "get_leaner", recoveryCardioPreference: "recommended" }));
      saveSessions(homeRecoveryCapacitySessions());
      break;
    case "home_recent_prs":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(recentPrFixtureSessions());
      break;
    case "progress_low":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([completedSession({ id: "qa-progress-low", name: "Push", completedAt: daysAgoIso(1), exercises: [benchExercise([12, 11, 8], "shutdown")] })]);
      break;
    case "progress_healthy":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressHealthySessions());
      break;
    case "progress_strength_dashboard":
      activeTrainingPlanRepository.save(basePlan({ goal: "powerlifting_meet", planningChoice: "custom_date_event", eventType: "powerlifting_meet", targetDate: "2026-10-01" }));
      saveSessions(progressStrengthDashboardSessions());
      break;
    case "progress_fatigue":
    case "progress_deload_action":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressFatigueSessions());
      break;
    case "progress_slowing":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressSlowingSessions());
      break;
    case "progress_recent_clean":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([...progressHealthySessions(), zeroSetFixtureSession()]);
      break;
    case "progress_volume_large_low":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressLargeLowVolumeSessions());
      break;
    case "progress_volume_ladder_apply":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_muscle" }));
      saveSessions(progressVolumeLadderApplySessions());
      break;
    case "progress_volume_large_high_fatigue":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressLargeHighFatigueSessions());
      break;
    case "progress_volume_small_progressing":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressSmallProgressingSessions());
      break;
    case "progress_rotation_stalled_tier_a":
    case "progress_rotation_action":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressRotationStalledTierASessions());
      break;
    case "progress_rotation_progressing_tier_a":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressRotationProgressingTierASessions());
      break;
    case "progress_rotation_tier_c":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(progressRotationTierCSessions());
      break;
    case "phase1_deload_mild":
    case "phase1_goal_athletic":
      activeTrainingPlanRepository.save(basePlan({ goal: "athletic_performance" }));
      saveSessions(phase1MildDeloadSessions());
      break;
    case "phase1_deload_clear":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_muscle_and_strength" }));
      saveSessions(phase1ClearDeloadSessions());
      break;
    case "phase1_deload_severe":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_muscle_and_strength" }));
      saveSessions(phase1SevereDeloadSessions());
      break;
    case "phase1_load_one_bad_session":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        openSession({ id: "qa-phase1-one-bad-active", name: "Push", exercises: [benchExercise([], "active", { load: 100, notes: "Hold load. One poor session is not enough evidence to reduce." })] }),
        completedSession({ id: "qa-phase1-one-bad-history", name: "Push", completedAt: daysAgoIso(7), exercises: [benchExercise([8, 7], "shutdown", { load: 100 })] }),
      ]);
      break;
    case "phase1_goal_strength":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_strength" }));
      saveSessions(phase1StrengthGoalSessions());
      break;
    case "phase1_goal_muscle":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_muscle" }));
      saveSessions(phase1LowFatigueFlatProgressSessions());
      break;
    case "phase1_goal_muscle_strength":
      activeTrainingPlanRepository.save(basePlan({ goal: "build_muscle_and_strength" }));
      saveSessions(phase1BalancedGoalSessions());
      break;
    case "phase1_goal_event":
      activeTrainingPlanRepository.save(basePlan({ goal: "powerlifting_meet", planningChoice: "custom_date_event", eventType: "powerlifting_meet", targetDate: "2026-10-01" }));
      saveSessions(phase1MildDeloadSessions());
      break;
    case "phase1_goal_general":
      activeTrainingPlanRepository.save(basePlan({ goal: "get_leaner" }));
      saveSessions(phase1LowFatigueFlatProgressSessions());
      break;
    case "phase1_low_history_no_deload":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([completedSession({ id: "qa-phase1-low-history", name: "Push", completedAt: daysAgoIso(1), exercises: [benchExercise([8, 7], "shutdown", { load: 100 })] })]);
      break;
    case "train_overview_fresh":
    case "train_first_set":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: `qa-${id}`, name: "Push", exercises: [benchExercise([], "active"), inclineExercise([], "active"), lateralRaiseExercise([], "active")] })]);
      break;
    case "train_warmups":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-warmups", name: "Push", exercises: [benchExercise([], "active", { warmups: [{ load: 40, reps: 8 }, { load: 60, reps: 5 }] }), inclineExercise([], "active")] })]);
      break;
    case "train_work_sets":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-work", name: "Push", exercises: [benchExercise([12, 11], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_near_threshold":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-near", name: "Push", exercises: [benchExercise([12, 11, 10], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_shutdown":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-shutdown", name: "Push", exercises: [benchExercise([12, 11, 10, 8], "shutdown")] })]);
      break;
    case "train_swapped":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-swapped", name: "Push", exercises: [machineChestPressSwappedFromBench(), inclineExercise([], "active")] })]);
      break;
    case "train_added_exercise":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-added", name: "Push", exercises: [benchExercise([12, 11], "active"), inclineExercise([], "active"), tricepsPushdownExercise([], "active", "added_during_workout")] })]);
      break;
    case "train_load_no_history":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-no-history", name: "Push", exercises: [benchExercise([], "active", { load: 0, loadKnown: false })] })]);
      break;
    case "train_load_strength_unknown":
      activeTrainingPlanRepository.save(strengthPlan());
      saveSessions([openSession({ id: "qa-train-load-strength-unknown", name: "Push", exercises: [benchExercise([], "active", { load: 0, loadKnown: false })] })]);
      break;
    case "train_load_exact_progressed":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        openSession({ id: "qa-train-load-exact-progressed", name: "Push", exercises: [benchExercise([], "active", { load: 105, notes: "Previous performance sets today's starting load." })] }),
        completedSession({ id: "qa-load-exact-history", name: "Push", completedAt: daysAgoIso(7), exercises: [benchExercise([12, 11, 10], "complete", { load: 102.5 })] }),
      ]);
      break;
    case "train_load_exact_held":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        openSession({ id: "qa-train-load-exact-held", name: "Push", exercises: [benchExercise([], "active", { load: 100, notes: "Previous performance says hold this load and earn more reps." })] }),
        completedSession({ id: "qa-load-exact-held-history", name: "Push", completedAt: daysAgoIso(7), exercises: [benchExercise([10, 10, 9], "complete", { load: 100 })] }),
      ]);
      break;
    case "train_load_same_family_estimate":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions(sameFamilyEstimateFixtureSessions());
      break;
    case "train_load_same_family_low_confidence":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-low-confidence", name: "Push", exercises: [benchExercise([], "active", { load: 0, loadKnown: false, notes: "Choose a starting load. Similar exercise history is not reliable enough yet." })] })]);
      break;
    case "train_load_lb_known":
      appSettingsStore.patch({ unit: "lb" });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-lb-known", name: "Push", exercises: [benchExercise([], "active", { load: 225, loadIncrease: 5, unit: "lb", notes: "Previous performance sets today's starting load." })] })]);
      break;
    case "train_load_bodyweight":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-bodyweight", name: "Pull", exercises: [bodyweightPullUpExercise()] })]);
      break;
    case "train_end_workout_confirm":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-end-workout-confirm", name: "Push", exercises: [benchExercise([12, 11], "active")] })]);
      break;
    case "train_review_prs":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        ...recentPrFixtureSessions(),
        openSession({
          id: "qa-train-review-prs-current",
          name: "Push",
          exercises: [
            benchExercise([12, 12, 12], "complete", { load: 110 }),
            rowExercise([12, 11, 10], "complete", { load: 90 }),
          ],
        }),
      ]);
      break;
    case "train_load_regression_reduce":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([
        openSession({ id: "qa-train-load-regression", name: "Push", exercises: [benchExercise([], "active", { load: 95, notes: "Recent performance suggests the current load is too demanding. Use 95kg next time." })] }),
        ...regressionHistorySessions(),
      ]);
      break;
    case "train_load_escalation":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-escalation", name: "Push", exercises: [benchExercise([12, 12, 12], "active", { load: 100, loadIncrease: 2.5 })] })]);
      break;
    case "train_load_escalation_modal":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-escalation-modal", name: "Push", exercises: [benchExercise([12, 12], "active", { load: 100, loadIncrease: 2.5 })] })]);
      break;
    case "train_load_average_next":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-load-average-next", name: "Push", exercises: [benchExercise([12, 12, 12, 12, 12, 12, 12], "active", { load: 100, perSetLoads: [100, 100, 100, 102.5, 105, 107.5, 110], notes: "Next session load comes from average productive load rounded up." })] })]);
      break;
    case "train_increment_barbell_1":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, barbellPlateLoadedKg: 1 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-barbell-1", name: "Push", exercises: [benchExercise([12, 12, 12], "active", { load: 103, loadIncrease: 1, notes: "Barbell increment set to 1kg. Next jump uses 1kg." })] })]);
      break;
    case "train_increment_barbell_2_5":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, barbellPlateLoadedKg: 2.5 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-barbell-2-5", name: "Push", exercises: [benchExercise([12, 12, 12], "active", { load: 102.5, loadIncrease: 2.5, notes: "Barbell increment set to 2.5kg. Next jump uses 2.5kg." })] })]);
      break;
    case "train_increment_barbell_5":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, barbellPlateLoadedKg: 5 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-barbell-5", name: "Push", exercises: [benchExercise([12, 12, 12], "active", { load: 100, loadIncrease: 5, notes: "Barbell increment set to 5kg. Next jump uses 5kg." })] })]);
      break;
    case "train_increment_machine_1":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, machineKg: 1 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-machine-1", name: "Push", exercises: [exerciseLog(findExercise("ex-machine-chest-press"), { reps: [12, 12, 12], status: "active", load: 101, loadIncrease: 1, notes: "Machine increment set to 1kg." })] })]);
      break;
    case "train_increment_cable_1":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, cableKg: 1 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-cable-1", name: "Arms", exercises: [tricepsPushdownExercise([12, 12, 12], "active", { load: 31, loadIncrease: 1 })] })]);
      break;
    case "train_increment_exercise_override":
      appSettingsStore.patch({ loadIncrementProfile: { ...appSettingsStore.get().loadIncrementProfile, dumbbellKg: 5 } });
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-increment-override", name: "Push", exercises: [lateralRaiseExercise([15, 15, 15], "active", { load: 12, loadIncrease: 1, notes: "Exercise override set to 1kg despite dumbbells set to 5kg." })] })]);
      break;
    case "train_productive_below_min":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-productive-below-min", name: "Push", exercises: [benchExercise([12, 11], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_productive_target_zone":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-productive-target-zone", name: "Push", exercises: [benchExercise([12, 11, 10, 10], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_productive_soft_cap":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-productive-soft-cap", name: "Push", exercises: [benchExercise([12, 11, 10, 10, 10, 10, 10, 10], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_productive_over_soft_cap":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-productive-over-soft-cap", name: "Push", exercises: [benchExercise([12, 11, 10, 10, 10, 10, 10, 10, 10], "active"), inclineExercise([], "active")] })]);
      break;
    case "train_prep_not_started":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-prep-not-started", name: "Push", exercises: pushExerciseList() })]);
      break;
    case "train_prep_completed":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-prep-completed", name: "Push", exercises: pushExerciseList() })]);
      saveSessionPrepRecords([prepRecord("Push", "completed")]);
      break;
    case "train_prep_skipped":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-prep-skipped", name: "Push", exercises: pushExerciseList() })]);
      saveSessionPrepRecords([prepRecord("Push", "skipped")]);
      break;
    case "train_prep_active_workout":
      activeTrainingPlanRepository.save(basePlan());
      saveSessions([openSession({ id: "qa-train-prep-active-workout", name: "Push", exercises: [benchExercise([12, 11], "active"), inclineExercise([], "active"), lateralRaiseExercise([], "active")] })]);
      saveSessionPrepRecords([prepRecord("Push", "completed")]);
      break;
    case "home_active_plan":
    case "plan_recommended":
    default:
      activeTrainingPlanRepository.save(basePlan());
      break;
  }

  const definition = getFixtureDefinition(id);
  const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
  jsonStore.set(activeFixtureKey, activeFixture);
  return activeFixture;
}

export function clearDesignQaFixtures(environment: AppEnvironment = "development"): void {
  if (!isDesignQaModeAvailable(environment)) {
    throw new Error("Design QA fixtures are not available in production.");
  }
  clearFixtureViewStateOnly();
  restoreBackedUpState();
}

export function getActiveDesignQaFixture(): ActiveDesignQaFixture | null {
  return jsonStore.get<ActiveDesignQaFixture | null>(activeFixtureKey, null);
}

export function subscribeDesignQaFixture(listener: () => void): () => void {
  return jsonStore.subscribe(activeFixtureKey, listener);
}

export function isDesignQaFixtureSession(session: Pick<WorkoutSession, "notes" | "syncState" | "userId">): boolean {
  return session.notes?.includes(designQaFixtureMarker) === true || session.userId === "design-qa-local";
}

function clearFixtureViewStateOnly() {
  programmeRepository.clearSelectedProgrammeDay();
  canonicalActivePlanState.clear();
  jsonStore.remove(activeFixtureKey);
  jsonStore.remove(activeTrainingPlanKey);
  jsonStore.remove(trainingYearKey);
  jsonStore.set(workoutSessionsKey, []);
  jsonStore.set(sessionPrepRecordsKey, []);
}

function restoreBackedUpState() {
  const backup = jsonStore.get<DesignQaFixtureBackup | null>(fixtureBackupKey, null);
  if (!backup) return;

  if (backup.activePlan) {
    jsonStore.set(activeTrainingPlanKey, backup.activePlan);
  } else {
    jsonStore.remove(activeTrainingPlanKey);
  }
  jsonStore.set(trainingYearKey, backup.trainingYear);
  jsonStore.set(workoutSessionsKey, backup.workoutSessions);
  jsonStore.set(sessionPrepRecordsKey, backup.sessionPrepRecords ?? []);
  jsonStore.remove(fixtureBackupKey);
}

function saveSessions(sessions: WorkoutSession[]) {
  jsonStore.set(workoutSessionsKey, sessions);
}

function saveSessionPrepRecords(records: SessionPrepRecord[]) {
  jsonStore.set(sessionPrepRecordsKey, records);
}

function basePlan(overrides: Partial<Parameters<typeof createActiveTrainingPlan>[0]> = {}): ActiveTrainingPlan {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle_and_strength",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
      ...overrides,
    },
    "2026-06-01T08:00:00.000Z",
  );
}

function singleHypertrophyPlan(): ActiveTrainingPlan {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle",
      planningChoice: "single_block",
      singleBlockType: "hypertrophy",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
}

function strengthPlan(): ActiveTrainingPlan {
  return createActiveTrainingPlan(
    {
      goal: "build_strength",
      planningChoice: "single_block",
      singleBlockType: "strength",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
}

function eventPlan(): ActiveTrainingPlan {
  return createActiveTrainingPlan(
    {
      goal: "powerlifting_meet",
      planningChoice: "custom_date_event",
      eventType: "powerlifting_meet",
      targetDate: "2026-10-01",
      eventPriority: "strength",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "advanced",
    },
    "2026-06-01T08:00:00.000Z",
  );
}

function blockEndingPlan(): ActiveTrainingPlan {
  const plan = basePlan();
  const activeBlockId = plan.blocks[0]?.id ?? plan.activeBlockId;
  return {
    ...plan,
    activeBlockId,
    blocks: plan.blocks.map((block, index) =>
      index === 0
        ? {
            ...block,
            currentWeek: block.durationWeeks,
            status: "active" as const,
          }
        : block,
    ),
  };
}

function progressHealthySessions(): WorkoutSession[] {
  return [0, 7, 14, 21].map((dayOffset, index) =>
    completedSession({
      id: `qa-progress-healthy-${index}`,
      name: index % 2 === 0 ? "Push" : "Pull",
      completedAt: daysAgoIso(21 - dayOffset),
      exercises: [
        benchExercise([12, 12, 11], "complete", { load: 90 + index * 2.5 }),
        rowExercise([12, 12, 11], "complete", { load: 75 + index * 2.5 }),
      ],
    }),
  );
}

function progressStrengthDashboardSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-strength-dashboard-baseline",
      name: "Strength Baseline",
      completedAt: daysAgoIso(70),
      exercises: [
        exerciseLog(findExercise("ex-bench-press"), { reps: [5, 5, 4], status: "complete", load: 100 }),
        exerciseLog(findExercise("ex-barbell-back-squat"), { reps: [5, 4, 4], status: "complete", load: 145 }),
        exerciseLog(findExercise("ex-deadlift"), { reps: [4, 3, 3], status: "complete", load: 175 }),
        exerciseLog(findExercise("ex-military-press"), { reps: [5, 4, 4], status: "complete", load: 62.5 }),
      ],
    }),
    completedSession({
      id: "qa-strength-dashboard-recent-a",
      name: "Strength Practice",
      completedAt: daysAgoIso(21),
      exercises: [
        exerciseLog(findExercise("ex-bench-press"), { reps: [5, 5, 5], status: "complete", load: 105 }),
        exerciseLog(findExercise("ex-barbell-back-squat"), { reps: [5, 5, 4], status: "complete", load: 155 }),
        exerciseLog(findExercise("ex-military-press"), { reps: [5, 5, 4], status: "complete", load: 65 }),
      ],
    }),
    completedSession({
      id: "qa-strength-dashboard-recent-b",
      name: "Meet Lifts",
      completedAt: daysAgoIso(7),
      exercises: [
        exerciseLog(findExercise("ex-bench-press"), { reps: [6, 5, 5], status: "complete", load: 107.5 }),
        exerciseLog(findExercise("ex-barbell-back-squat"), { reps: [5, 5, 4], status: "complete", load: 160 }),
        exerciseLog(findExercise("ex-deadlift"), { reps: [5, 4, 3], status: "complete", load: 185 }),
        exerciseLog(findExercise("ex-military-press"), { reps: [5, 4, 4], status: "complete", load: 67.5 }),
      ],
    }),
  ];
}

function recentPrFixtureSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-recent-pr-baseline",
      name: "Push",
      completedAt: daysAgoIso(21),
      exercises: [
        benchExercise([10, 10, 9], "complete", { load: 100 }),
        rowExercise([10, 10, 9], "complete", { load: 80 }),
      ],
    }),
    completedSession({
      id: "qa-recent-pr-current",
      name: "Push",
      completedAt: daysAgoIso(3),
      exercises: [
        benchExercise([12, 11, 10], "complete", { load: 105 }),
        rowExercise([12, 11, 10], "complete", { load: 85 }),
      ],
    }),
  ];
}

function homeRecoveryCapacitySessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-home-recovery-upper",
      name: "Upper",
      completedAt: daysAgoIso(5),
      exercises: [benchExercise([12, 11, 10], "complete", { load: 90 }), rowExercise([12, 11, 10], "complete", { load: 75 })],
    }),
    completedSession({
      id: "qa-home-recovery-lower",
      name: "Lower",
      completedAt: daysAgoIso(4),
      exercises: [
        exerciseLog(findExercise("ex-hack-squat"), { reps: [12, 11, 10], status: "complete", load: 120 }),
        exerciseLog(findExercise("ex-lying-leg-curl"), { reps: [15, 14, 13], status: "complete", load: 45 }),
      ],
    }),
    {
      ...completedSession({
        id: "qa-home-recovery-extra-push",
        name: "Extra Push",
        completedAt: daysAgoIso(2),
        exercises: [benchExercise([12, 11, 10], "complete", { load: 87.5 }), cableFlyExercise([15, 14, 13], "complete", { load: 20 })],
      }),
      sessionKind: "extra_full" as const,
      planSessionIndex: undefined,
    },
    {
      ...completedSession({
        id: "qa-home-recovery-extra-pull",
        name: "Extra Pull",
        completedAt: daysAgoIso(1),
        exercises: [rowExercise([12, 11, 10], "complete", { load: 75 }), exerciseLog(findExercise("ex-rope-hammer-curl"), { reps: [15, 14, 13], status: "complete", load: 22.5 })],
      }),
      sessionKind: "extra_volume" as const,
      planSessionIndex: undefined,
    },
  ];
}

function progressFatigueSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-progress-fatigue-${index}`,
      name: index % 2 === 0 ? "Push" : "Upper",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [
        benchExercise([12 - index, 10 - index, 8 - index], "shutdown", { load: 100 }),
        cableFlyExercise(index === 3 ? [15, 14, 13] : [13, 12], "complete", { load: 20 + (index === 3 ? 2.5 : 0) }),
      ],
    }),
  );
}

function progressSlowingSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-progress-slowing-${index}`,
      name: index % 2 === 0 ? "Lower" : "Upper",
      completedAt: daysAgoIso(10 - index * 2),
      exercises: [
        benchExercise([10, 9, 8], "complete", { load: 100 }),
        rowExercise([10, 10, 9], "complete", { load: 80 }),
      ],
    }),
  );
}

function progressLargeLowVolumeSessions(): WorkoutSession[] {
  return [0, 1, 2].map((index) =>
    completedSession({
      id: `qa-progress-volume-large-low-${index}`,
      name: "Push",
      completedAt: daysAgoIso(5 - index * 2),
      exercises: [
        benchExercise([8], "complete", {
          load: 100,
          notes: "Chest has low direct productive volume and low fatigue.",
        }),
        rowExercise([12, 11, 10], "complete", { load: 75 + index * 2.5 }),
      ],
    }),
  );
}

function progressVolumeLadderApplySessions(): WorkoutSession[] {
  return [28, 21, 14].map((daysAgo, index) =>
    completedSession({
      id: `qa-progress-volume-ladder-${index}`,
      name: "Push",
      completedAt: daysAgoIso(daysAgo),
      exercises: [
        benchExercise([10, 9, 8, 8, 8, 8, 8], "complete", {
          load: 100,
          notes: "Chest has repeated low productive volume with low fatigue.",
        }),
      ],
    }),
  );
}

function progressLargeHighFatigueSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-progress-volume-large-high-0",
      name: "Push",
      completedAt: daysAgoIso(6),
      exercises: [benchExercise([12, 12, 11, 10, 10, 9], "complete", { load: 100 })],
    }),
    completedSession({
      id: "qa-progress-volume-large-high-1",
      name: "Upper",
      completedAt: daysAgoIso(4),
      exercises: [benchExercise([11, 10, 10, 9, 8, 7], "shutdown", { load: 100 })],
    }),
    completedSession({
      id: "qa-progress-volume-large-high-2",
      name: "Push",
      completedAt: daysAgoIso(2),
      exercises: [benchExercise([10, 9, 8, 7, 6], "shutdown", { load: 100 })],
    }),
  ];
}

function progressSmallProgressingSessions(): WorkoutSession[] {
  return [0, 1, 2].map((index) =>
    completedSession({
      id: `qa-progress-volume-small-progressing-${index}`,
      name: "Arms",
      completedAt: daysAgoIso(5 - index * 2),
      exercises: [
        tricepsPushdownExercise([15, 14, 13], "complete", { load: 25 + index * 2.5 }),
        exerciseLog(findExercise("ex-machine-preacher-curl"), {
          reps: [15, 14, 13],
          status: "complete",
          load: 25 + index * 2.5,
        }),
      ],
    }),
  );
}

function progressRotationStalledTierASessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-progress-rotation-stalled-tier-a-${index}`,
      name: "Push",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [benchExercise([9, 9, 8], "complete", { load: 100 })],
    }),
  );
}

function progressRotationProgressingTierASessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-progress-rotation-progressing-tier-a-${index}`,
      name: "Push",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [benchExercise([12, 12, 11], "complete", { load: 90 + index * 2.5 })],
    }),
  );
}

function progressRotationTierCSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-progress-rotation-tier-c-${index}`,
      name: "Push",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [cableFlyExercise([12, 11, 10], "complete", { load: 20 })],
    }),
  );
}

function phase1MildDeloadSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-phase1-mild-0",
      name: "Power",
      completedAt: daysAgoIso(8),
      exercises: [benchExercise([12, 12, 11, 10, 10], "complete", { load: 90 }), rowExercise([12, 11, 10, 10], "complete", { load: 75 })],
    }),
    completedSession({
      id: "qa-phase1-mild-1",
      name: "Power",
      completedAt: daysAgoIso(6),
      exercises: [benchExercise([12, 11, 10, 10], "complete", { load: 92.5 }), rowExercise([12, 11, 10], "complete", { load: 77.5 })],
    }),
    completedSession({
      id: "qa-phase1-mild-2",
      name: "Power",
      completedAt: daysAgoIso(4),
      exercises: [benchExercise([12, 10, 10], "complete", { load: 95 }), rowExercise([12, 10], "shutdown", { load: 80 })],
    }),
    completedSession({
      id: "qa-phase1-mild-3",
      name: "Power",
      completedAt: daysAgoIso(2),
      exercises: [benchExercise([12, 10], "shutdown", { load: 95 }), rowExercise([12, 10], "complete", { load: 80 })],
    }),
  ];
}

function phase1ClearDeloadSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-phase1-clear-0",
      name: "Upper",
      completedAt: daysAgoIso(8),
      exercises: [benchExercise([12, 12, 11, 10, 10], "complete", { load: 100 }), rowExercise([12, 11, 10, 10], "complete", { load: 80 })],
    }),
    completedSession({
      id: "qa-phase1-clear-1",
      name: "Upper",
      completedAt: daysAgoIso(6),
      exercises: [benchExercise([12, 11, 10], "shutdown", { load: 100 }), rowExercise([12, 11, 10], "complete", { load: 80 })],
    }),
    completedSession({
      id: "qa-phase1-clear-2",
      name: "Upper",
      completedAt: daysAgoIso(4),
      exercises: [benchExercise([12, 10, 10], "shutdown", { load: 100 }), rowExercise([12, 10, 10], "shutdown", { load: 80 })],
    }),
    completedSession({
      id: "qa-phase1-clear-3",
      name: "Upper",
      completedAt: daysAgoIso(2),
      exercises: [benchExercise([12, 10, 10], "shutdown", { load: 100 }), rowExercise([12, 10], "shutdown", { load: 80 })],
    }),
  ];
}

function phase1SevereDeloadSessions(): WorkoutSession[] {
  return [
    completedSession({
      id: "qa-phase1-severe-0",
      name: "Upper",
      completedAt: daysAgoIso(8),
      exercises: [benchExercise([12, 11, 10, 10], "complete", { load: 105 }), rowExercise([12, 11, 10], "complete", { load: 85 })],
    }),
    completedSession({
      id: "qa-phase1-severe-1",
      name: "Upper",
      completedAt: daysAgoIso(6),
      exercises: [benchExercise([10, 9, 8], "shutdown", { load: 105 }), rowExercise([10, 9], "shutdown", { load: 85 })],
    }),
    completedSession({
      id: "qa-phase1-severe-2",
      name: "Upper",
      completedAt: daysAgoIso(4),
      exercises: [benchExercise([8, 7], "shutdown", { load: 105 }), rowExercise([8, 7], "shutdown", { load: 85 })],
    }),
    completedSession({
      id: "qa-phase1-severe-3",
      name: "Upper",
      completedAt: daysAgoIso(2),
      exercises: [benchExercise([7, 6], "shutdown", { load: 105 }), rowExercise([7, 6], "shutdown", { load: 85 })],
    }),
  ];
}

function phase1LowFatigueFlatProgressSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-phase1-low-fatigue-flat-${index}`,
      name: "Push",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [benchExercise([10, 9, 9], "complete", { load: 90 }), rowExercise([10, 9, 9], "complete", { load: 75 })],
    }),
  );
}

function phase1StrengthGoalSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-phase1-strength-${index}`,
      name: "Strength Upper",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [
        benchExercise([5 + Math.min(index, 2), 5, 4], "complete", { load: 110 + index * 2.5 }),
        rowExercise([8, 8, 7], "complete", { load: 85 }),
      ],
    }),
  );
}

function phase1BalancedGoalSessions(): WorkoutSession[] {
  return [0, 1, 2, 3].map((index) =>
    completedSession({
      id: `qa-phase1-balanced-${index}`,
      name: "Upper",
      completedAt: daysAgoIso(8 - index * 2),
      exercises: [
        benchExercise([10 + Math.min(index, 2), 9, 9], "complete", { load: 95 + index * 2.5 }),
        rowExercise([10, 10, 9], "complete", { load: 80 + index * 2.5 }),
        lateralRaiseExercise([15, 14, 13], "complete", { load: 12 + index }),
      ],
    }),
  );
}

function openSession({ id, name, exercises }: { id: string; name: string; exercises: WorkoutExerciseLog[] }): WorkoutSession {
  return {
    id,
    userId: "design-qa-local",
    name,
    startedAt: todayIso(9),
    updatedAt: todayIso(9),
    syncState: "local",
    notes: `${designQaFixtureMarker} Local visual QA only. Do not sync.`,
    exercises,
  };
}

function completedSession({ id, name, completedAt, exercises }: { id: string; name: string; completedAt: string; exercises: WorkoutExerciseLog[] }): WorkoutSession {
  return {
    ...openSession({ id, name, exercises: exercises.map((exercise) => ({ ...exercise, status: exercise.status === "active" ? "complete" : exercise.status })) }),
    startedAt: addMinutes(completedAt, -58),
    completedAt,
    updatedAt: completedAt,
  };
}

function zeroSetFixtureSession(): WorkoutSession {
  return completedSession({
    id: "qa-zero-set-hidden",
    name: "AI Pull • Pull",
    completedAt: daysAgoIso(2),
    exercises: [benchExercise([], "complete")],
  });
}

function sameFamilyEstimateFixtureSessions(): WorkoutSession[] {
  const bench = findExercise("ex-bench-press");
  const historySessions = [
    completedSession({ id: "qa-family-db-bench", name: "Push", completedAt: daysAgoIso(21), exercises: [exerciseLog(findExercise("ex-dumbbell-bench-press"), { reps: [10, 9, 8], status: "complete", load: 45 })] }),
    completedSession({ id: "qa-family-machine-press", name: "Push", completedAt: daysAgoIso(14), exercises: [exerciseLog(findExercise("ex-machine-chest-press"), { reps: [12, 11, 10], status: "complete", load: 95 })] }),
    completedSession({ id: "qa-family-smith-bench", name: "Push", completedAt: daysAgoIso(7), exercises: [exerciseLog(findExercise("ex-smith-bench-press"), { reps: [10, 10, 9], status: "complete", load: 90 })] }),
  ];
  const recommendation = resolveStartingLoadRecommendation({
    targetExercise: bench,
    exercises: exerciseLibrary,
    history: historySessions.map((session) => summarizeWorkoutSession(session)!),
    repRange: bench.defaultSettings.repRange,
    loadJump: bench.defaultSettings.loadIncrease,
  });

  return [
    openSession({
      id: "qa-train-load-family-estimate",
      name: "Push",
      exercises: [benchExercise([], "active", { load: recommendation.load ?? 0, loadKnown: recommendation.source !== "blank", notes: recommendation.message })],
    }),
    ...historySessions,
  ];
}

function regressionHistorySessions(): WorkoutSession[] {
  return [
    completedSession({ id: "qa-regression-1", name: "Push", completedAt: daysAgoIso(21), exercises: [benchExercise([12, 11, 10], "complete", { load: 100 })] }),
    completedSession({ id: "qa-regression-2", name: "Push", completedAt: daysAgoIso(14), exercises: [benchExercise([10, 9, 8], "shutdown", { load: 100 })] }),
    completedSession({ id: "qa-regression-3", name: "Push", completedAt: daysAgoIso(7), exercises: [benchExercise([8, 7, 6], "shutdown", { load: 100 })] }),
  ];
}

function benchExercise(
  reps: number[],
  status: WorkoutExerciseLog["status"] = "active",
  options: { load?: number; loadKnown?: boolean; warmups?: Array<{ load: number; reps: number }>; perSetLoads?: number[]; loadIncrease?: number; notes?: string; unit?: "kg" | "lb" } = {},
): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-bench-press"), { reps, status, load: options.load ?? 100, loadKnown: options.loadKnown, warmups: options.warmups, perSetLoads: options.perSetLoads, loadIncrease: options.loadIncrease, notes: options.notes, unit: options.unit });
}

function bodyweightPullUpExercise(): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-pull-up"), { reps: [], status: "active", load: 0, loadKnown: true });
}

function inclineExercise(reps: number[], status: WorkoutExerciseLog["status"] = "active"): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-incline-dumbbell-press"), { reps, status, load: 35 });
}

function lateralRaiseExercise(
  reps: number[],
  status: WorkoutExerciseLog["status"] = "active",
  options: { load?: number; loadIncrease?: number; notes?: string } = {},
): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-dumbbell-lateral-raise"), { reps, status, load: options.load ?? 12, loadIncrease: options.loadIncrease, notes: options.notes });
}

function rowExercise(reps: number[], status: WorkoutExerciseLog["status"] = "active", options: { load?: number } = {}): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-t-bar-row-chest-supported"), { reps, status, load: options.load ?? 80 });
}

function cableFlyExercise(reps: number[], status: WorkoutExerciseLog["status"] = "active", options: { load?: number } = {}): WorkoutExerciseLog {
  return exerciseLog(findExercise("ex-cable-fly"), { reps, status, load: options.load ?? 20 });
}

function tricepsPushdownExercise(
  reps: number[],
  status: WorkoutExerciseLog["status"] = "active",
  originOrOptions?: WorkoutExerciseLog["origin"] | { load?: number; loadIncrease?: number; origin?: WorkoutExerciseLog["origin"] },
): WorkoutExerciseLog {
  const options = typeof originOrOptions === "object" ? originOrOptions : { origin: originOrOptions };
  return exerciseLog(findExercise("ex-rope-pushdown"), { reps, status, load: options.load ?? 25, loadIncrease: options.loadIncrease, origin: options.origin });
}

function pushExerciseList(): WorkoutExerciseLog[] {
  return [
    benchExercise([], "active"),
    inclineExercise([], "active"),
    lateralRaiseExercise([], "active"),
    cableFlyExercise([], "active"),
    tricepsPushdownExercise([], "active"),
  ];
}

function prepRecord(workoutName: string, status: "completed" | "skipped"): SessionPrepRecord {
  return buildSessionPrepRecord({
    routine: getSessionPrepRoutine(workoutName),
    workoutName,
    status,
    now: new Date(status === "completed" ? todayIso(8, 45) : todayIso(8, 50)),
  });
}

function machineChestPressSwappedFromBench(): WorkoutExerciseLog {
  const replacement = exerciseLog(findExercise("ex-machine-chest-press"), { reps: [], status: "active", load: 90 });
  return {
    ...replacement,
    swappedFromExerciseId: "ex-bench-press",
    swappedFromExerciseName: "Bench Press",
    swapHistory: [
      {
        exerciseId: "ex-bench-press",
        exerciseName: "Bench Press",
        settings: findExercise("ex-bench-press").defaultSettings,
        load: 100,
        loadKnown: true,
        sets: workSets([12, 11], 100),
        status: "swapped",
        swappedToExerciseId: replacement.exerciseId,
        swappedToExerciseName: replacement.exerciseName,
        notes: "Swapped during Design QA fixture.",
      },
    ],
  };
}

function exerciseLog(
  exercise: Exercise,
  options: {
    reps: number[];
    status: WorkoutExerciseLog["status"];
    load: number;
    loadKnown?: boolean;
    warmups?: Array<{ load: number; reps: number }>;
    perSetLoads?: number[];
    loadIncrease?: number;
    unit?: "kg" | "lb";
    origin?: WorkoutExerciseLog["origin"];
    notes?: string;
  },
): WorkoutExerciseLog {
  const sets = [...warmupSets(options.warmups ?? []), ...workSets(options.reps, options.load, options.perSetLoads)];
  const settings = {
    ...exercise.defaultSettings,
    loadIncrease: options.loadIncrease ?? exercise.defaultSettings.loadIncrease,
    unit: options.unit ?? exercise.defaultSettings.unit,
  };
  const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(sets, settings, options.load);
  return {
    id: `qa-log-${exercise.id}-${Math.random().toString(16).slice(2)}`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    settings,
    load: options.load,
    loadKnown: options.loadKnown ?? true,
    sets,
    status: options.status,
    origin: options.origin ?? "planned",
    shutdownReason: options.status === "shutdown" ? "Performance dropped below threshold." : undefined,
    notes: options.notes ?? (sets.length > 0 && nextLoad !== options.load ? `Next session recommendation: ${nextLoad}${exercise.defaultSettings.unit}.` : undefined),
  };
}

function warmupSets(sets: Array<{ load: number; reps: number }>): SetLog[] {
  return sets.map((set, index) => ({
    id: `qa-warmup-${index + 1}`,
    setNumber: index + 1,
    reps: set.reps,
    load: set.load,
    loggedAt: todayIso(9, index * 4),
    type: "warmup",
  }));
}

function workSets(reps: number[], load: number, perSetLoads?: number[]): SetLog[] {
  return reps.map((repCount, index) => ({
    id: `qa-work-${index + 1}-${load}`,
    setNumber: index + 1,
    reps: repCount,
    load: perSetLoads?.[index] ?? load,
    loggedAt: todayIso(9, 12 + index * 5),
    type: "work",
  }));
}

function findExercise(id: string): Exercise {
  return exerciseLibrary.find((exercise) => exercise.id === id) ?? exerciseLibrary[0]!;
}

function getFixtureDefinition(id: DesignQaFixtureId): DesignQaFixtureDefinition {
  return designQaFixtures.find((fixture) => fixture.id === id) ?? designQaFixtures[0]!;
}

function todayIso(hour: number, minutes = 0): string {
  const date = new Date();
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
}

function daysAgoIso(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(11, 0, 0, 0);
  return date.toISOString();
}

function addMinutes(iso: string, minutes: number): string {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}
