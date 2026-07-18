import { appSettingsStore } from "@/application/settings/app-settings";
import { cacheSubscription } from "@/application/billing/subscription-cache";
import { seedMockSubscriptionStatus } from "@/application/billing/mock-revenuecat";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import type { AppEnvironment } from "@/application/runtime/app-environment-core";
import { isDesignQaModeAvailable } from "@/application/runtime/app-environment-core";
import { calculateNextSessionStartingLoadFromProductiveSets, resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { exerciseLibrary } from "@/domain/training/presets";
import type { WorkoutSession } from "@/domain/training/models";
import { buildSessionPrepRecord, getSessionPrepRoutine, type SessionPrepRecord } from "@/domain/training/session-prep";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { completeCanonicalSession, recordCanonicalPerformedWork, startCanonicalSession, prescriptionHash } from "@/application/training/canonical-recorded-session-application";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
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
const workoutSessionsKey = "iron-logic.workout-sessions";
const sessionPrepRecordsKey = "iron-logic.session-prep-records";

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

  canonicalActivePlanState.clear();
  const created = canonicalActivePlanState.create({ planId: "design-qa-canonical-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell", "bodyweight"], units: "kg", exercises: exerciseLibrary });
  if (created.hydration !== "hydrated" || !created.model) throw new Error(`canonical_visual_setup_plan_failed:${created.error ?? created.hydration}`);

  const plan = canonicalActivePlanState.getReadModel();
  if (!plan) throw new Error("canonical_visual_setup_plan_unavailable");
  const planned = plan.plannedSessions[0];
  if (!planned) throw new Error("canonical_visual_setup_session_unavailable");
  if (!plan.activeRecordedSession) {
    const started = startCanonicalSession({ planId: plan.planId, expectedPlanRevision: plan.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.snapshot), operationId: "design-qa-visual-workout-start", startedAt: "2026-01-01T09:00:00.000Z", provenance: "design-qa-canonical-visual-workout" });
    if (!["started", "already_started"].includes(started.status)) throw new Error(`canonical_visual_setup_start_failed:${started.reason}`);
  }
  if (!canonicalActivePlanState.getReadModel()?.activeRecordedSession) throw new Error("canonical_visual_setup_hydration_failed");
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
  throw new Error(`unsupported_design_qa_fixture_family:${id}`);
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
    if (id === "home_completed_today") completeCanonicalHomeFixtureSessions(1, new Date().toISOString(), id);
  }
  const definition = getFixtureDefinition(id);
  const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
  jsonStore.set(activeFixtureKey, activeFixture);
  return activeFixture;
}

function completeCanonicalHomeFixtureSessions(count: number, completedAt: string, fixtureId: string): void {
  for (let index = 0; index < count; index += 1) {
    const model = canonicalActivePlanState.getReadModel();
    const planned = model?.nextSession;
    const snapshot = planned ? model.plannedSessions.find((candidate) => candidate.id === planned.id)?.snapshot : null;
    if (!model || !planned || !snapshot) {
      if (index > 0) return;
      throw new Error(`canonical_home_fixture_session_unavailable:${fixtureId}:${index}`);
    }
    const startedAt = new Date(Date.parse(completedAt) - 60_000).toISOString();
    const started = startCanonicalSession({ planId: model.planId, expectedPlanRevision: model.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(snapshot), operationId: `${fixtureId}:start:${index}`, startedAt, provenance: "design_qa_home" });
    if (!started.recordedSessionId || started.planRevision === undefined) throw new Error(`canonical_home_fixture_start_failed:${fixtureId}:${index}:${started.reason}`);
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    const slots = aggregate.status === "found" && Array.isArray(aggregate.session.prescriptionSnapshot.slots) ? aggregate.session.prescriptionSnapshot.slots as Array<Record<string, unknown>> : [];
    const slot = slots[0];
    if (aggregate.status !== "found" || !slot) throw new Error(`canonical_home_fixture_snapshot_failed:${fixtureId}:${index}`);
    const work = recordCanonicalPerformedWork({ planId: model.planId, expectedPlanRevision: started.planRevision, recordedSessionId: started.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: `${fixtureId}:work:${index}`, occurredAt: new Date(Date.parse(completedAt) - 30_000).toISOString(), provenance: "design_qa_home", slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${fixtureId}:set:${index}`, setOrder: 1, reps: 8, load: 60, unit: "kg", completion: "complete" });
    if (work.ledgerVersion === undefined) throw new Error(`canonical_home_fixture_work_failed:${fixtureId}:${index}:${work.reason}`);
    const completed = completeCanonicalSession({ planId: model.planId, expectedPlanRevision: started.planRevision, recordedSessionId: started.recordedSessionId, expectedLedgerVersion: work.ledgerVersion, operationId: `${fixtureId}:complete:${index}`, occurredAt: completedAt, provenance: "design_qa_home" });
    if (completed.status !== "applied" && completed.status !== "idempotent") throw new Error(`canonical_home_fixture_completion_failed:${fixtureId}:${index}:${completed.reason}`);
  }
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
    if (["train_overview_fresh", "train_first_set", "train_work_sets", "train_warmups", "train_swapped", "train_added_exercise", "train_near_threshold", "train_shutdown", "train_review_prs", "train_rotation_accepted", "train_end_workout_confirm", "train_prep_not_started", "train_prep_completed", "train_prep_skipped", "train_prep_active_workout", "train_load_no_history", "train_load_strength_unknown", "train_load_exact_progressed", "train_load_exact_held", "train_load_same_family_estimate", "train_load_same_family_low_confidence", "train_load_lb_known", "train_load_bodyweight", "train_increment_barbell_1", "train_increment_barbell_2_5", "train_increment_barbell_5", "train_increment_machine_1", "train_increment_cable_1", "train_increment_exercise_override"].includes(id)) {
      createCanonicalTrainProjection(id);
      if (id === "train_prep_completed" || id === "train_prep_skipped") saveSessionPrepRecords([prepRecord("Canonical", id.endsWith("completed") ? "completed" : "skipped")]);
      const definition = getFixtureDefinition(id);
      const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
      jsonStore.set(activeFixtureKey, activeFixture);
      return activeFixture;
    }
    const result = applyCanonicalActiveSessionFixture(id);
    if (result.status === "rejected") throw new Error(`canonical_session_fixture_unavailable:${result.reason}`);
    const definition = getFixtureDefinition(id);
    const activeFixture = { id, label: definition.label, appliedAt: new Date().toISOString() };
    jsonStore.set(activeFixtureKey, activeFixture);
    return activeFixture;
  }
  throw new Error(`unsupported_progress_fixture:${id}`);
}
function applyProgressDecisionFixture(id: DesignQaFixtureId, environment: AppEnvironment): ActiveDesignQaFixture {
  if (["train_load_regression_reduce", "train_load_escalation", "train_load_escalation_modal", "train_load_average_next", "train_productive_below_min", "train_productive_target_zone", "train_productive_soft_cap", "train_productive_over_soft_cap"].includes(id)) {
    if (!isDesignQaModeAvailable(environment)) throw new Error("Design QA fixtures are not available in production.");
    createCanonicalTrainProjection(id);
    const definition = getFixtureDefinition(id);
    const activeFixture = { id, label: definition.label, appliedAt: "2026-01-01T00:00:00.000Z" };
    jsonStore.set(activeFixtureKey, activeFixture);
    return activeFixture;
  }
  if (["progress_volume_large_low", "progress_volume_ladder_apply", "progress_volume_large_high_fatigue", "progress_volume_small_progressing", "progress_rotation_stalled_tier_a", "progress_rotation_action", "progress_rotation_progressing_tier_a", "progress_rotation_tier_c", "progress_low", "progress_healthy", "progress_strength_dashboard", "progress_fatigue", "progress_slowing", "progress_recent_clean", "phase1_load_one_bad_session", "phase1_low_history_no_deload", "phase1_deload_mild", "phase1_deload_clear", "phase1_deload_severe", "home_recovery_capacity", "phase1_goal_strength", "phase1_goal_muscle", "phase1_goal_muscle_strength", "phase1_goal_athletic", "phase1_goal_event", "phase1_goal_general", "progress_deload_action"].includes(id)) {
    if (!isDesignQaModeAvailable(environment)) throw new Error("Design QA fixtures are not available in production.");
    clearFixtureViewStateOnly();
    appSettingsStore.patch({ onboardingCompleted: true });
    canonicalActivePlanState.clear();
    const result = canonicalActivePlanState.create({ planId: `design-qa:${id}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell"], units: "kg", exercises: exerciseLibrary, history: [] });
    if (result.hydration !== "hydrated" || !result.model) throw new Error(`canonical_progress_fixture_failed:${result.error ?? result.hydration}`);
    const definition = getFixtureDefinition(id);
    const activeFixture = { id, label: definition.label, appliedAt: "2026-01-01T00:00:00.000Z" };
    jsonStore.set(activeFixtureKey, activeFixture);
    return activeFixture;
  }
  throw new Error(`unsupported_progress_fixture:${id}`);
}


export function clearDesignQaFixtures(environment: AppEnvironment = "development"): void {
  if (!isDesignQaModeAvailable(environment)) {
    throw new Error("Design QA fixtures are not available in production.");
  }
  clearFixtureViewStateOnly();
}

export function getActiveDesignQaFixture(): ActiveDesignQaFixture | null {
  return jsonStore.get<ActiveDesignQaFixture | null>(activeFixtureKey, null);
}

export function subscribeDesignQaFixture(listener: () => void): () => void {
  return jsonStore.subscribe(activeFixtureKey, listener);
}

export function isDesignQaFixtureSession(session: WorkoutSession): boolean {
  return session.notes?.includes(designQaFixtureMarker) === true || session.userId === "design-qa-local";
}

function clearFixtureViewStateOnly() {
  programmeRepository.clearSelectedProgrammeDay();
  canonicalActivePlanState.clear();
  jsonStore.remove(activeFixtureKey);
  jsonStore.set(workoutSessionsKey, []);
  jsonStore.set(sessionPrepRecordsKey, []);
}


function saveSessionPrepRecords(records: SessionPrepRecord[]) {
  jsonStore.set(sessionPrepRecordsKey, records);
}

function getFixtureDefinition(id: DesignQaFixtureId): DesignQaFixtureDefinition {
  return designQaFixtures.find((fixture) => fixture.id === id) ?? designQaFixtures[0]!;
}

function todayIso(hour: number, minutes = 0): string {
  const date = new Date("2026-01-01T00:00:00.000Z");
  date.setUTCHours(hour, minutes, 0, 0);
  return date.toISOString();
}

function prepRecord(workoutName: string, status: "completed" | "skipped"): SessionPrepRecord {
  return buildSessionPrepRecord({
    routine: getSessionPrepRoutine(workoutName),
    workoutName,
    status,
    now: new Date(status === "completed" ? todayIso(8, 45) : todayIso(8, 50)),
  });
}
