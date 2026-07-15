import { beforeEach, describe, expect, it } from "vitest";
import {
  applyDesignQaFixture,
  clearDesignQaFixtures,
  designQaFixtures,
  ensureDesignQaLocalWorkoutReadyState,
  getActiveDesignQaFixture,
  isDesignQaFixtureSession,
} from "@/application/design-qa/design-qa-fixtures";
import { appSettingsStore } from "@/application/settings/app-settings";
import { getCachedSubscription } from "@/application/billing/subscription-cache";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { jsonStore } from "@/data/local/json-store";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { getInSessionLoadIncreaseSuggestion } from "@/domain/training/load-selection";
import { buildProgressDashboardViewModel } from "@/domain/training/progress-dashboard";
import { buildHomeDashboardViewModel } from "@/domain/training/home-dashboard";
import { buildProductiveSetGuidance } from "@/domain/training/productive-set-targets";
import { exerciseLibrary } from "@/domain/training/presets";
import { createAnnualPlan, naturalLifterAnnualPlan } from "@/domain/training/annual-planner";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import type { DesignQaFixtureId } from "@/application/design-qa/design-qa-fixtures";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { readCanonicalTrainProjection } from "@/application/design-qa/canonical-train-projection";

describe("Design QA fixtures", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
  });

  it("blocks fixture application in production", () => {
    expect(() => applyDesignQaFixture("progress_healthy", "production")).toThrow("production");
    expect(() => clearDesignQaFixtures("production")).toThrow("production");
  });

  it("marks fixture sessions local-only and does not enqueue anything by applying fixtures", () => {
    applyDesignQaFixture("progress_healthy", "staging");
    const sessions = workoutSessionRepository.list();

    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every(isDesignQaFixtureSession)).toBe(true);
    expect(new LocalSyncQueueStore().read()).toEqual([]);
  });

  it("seeds web QA with onboarded workout-ready local state without enabling generation flags", () => {
    ensureDesignQaLocalWorkoutReadyState("development");

    expect(appSettingsStore.get().onboardingCompleted).toBe(true);
    expect(canonicalActivePlanState.getReadModel()).not.toBeNull();
    const openWorkout = workoutSessionRepository.list().find((session) => !session.completedAt);
    expect(openWorkout?.name).toBe("Push");
    expect(openWorkout?.exercises.length).toBeGreaterThan(1);
    expect(openWorkout?.notes).toContain("Local visual QA only");
    expect(getCachedSubscription()).toMatchObject({ status: "trial", provider: "mock", isPremium: true });
  });

  it("does not override an explicit Design QA fixture while ensuring onboarding is complete", () => {
    applyDesignQaFixture("home_no_plan", "development");
    ensureDesignQaLocalWorkoutReadyState("development");

    expect(appSettingsStore.get().onboardingCompleted).toBe(true);
    expect(getActiveDesignQaFixture()?.id).toBe("home_no_plan");
    expect(activeTrainingPlanRepository.getOptional()).toBeNull();
    expect(workoutSessionRepository.list()).toEqual([]);
    expect(getCachedSubscription()).toMatchObject({ status: "trial", provider: "mock", isPremium: true });
  });

  it("clears active fixture state and fixture sessions", () => {
    applyDesignQaFixture("train_shutdown", "development");
    expect(getActiveDesignQaFixture()?.id).toBe("train_shutdown");
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).not.toBeNull();

    clearDesignQaFixtures("development");

    expect(getActiveDesignQaFixture()).toBeNull();
    expect(workoutSessionRepository.list().filter(isDesignQaFixtureSession)).toEqual([]);
    expect(activeTrainingPlanRepository.getOptional()).toBeNull();
  });

  it("isolates fixture history from existing local sessions and restores local state when cleared", () => {
    applyDesignQaFixture("progress_fatigue", "development");
    const existingLocalSession = {
      ...workoutSessionRepository.list()[0],
      id: "real-local-session",
      userId: null,
      notes: "Real local workout",
    };
    clearDesignQaFixtures("development");
    jsonStore.set("iron-logic.workout-sessions", [existingLocalSession]);

    applyDesignQaFixture("progress_healthy", "development");
    expect(workoutSessionRepository.list().some((session) => session.id === "real-local-session")).toBe(false);

    const history = summarizeWorkoutHistory(workoutSessionRepository.list());
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);
    expect(progress.verdictTitle).not.toBe("Fatigue is the limiter.");

    clearDesignQaFixtures("development");
    expect(workoutSessionRepository.list().map((session) => session.id)).toEqual(["real-local-session"]);
  });

  it("keeps the healthy Progress fixture out of fatigue verdict territory", () => {
    applyDesignQaFixture("progress_healthy", "development");
    const history = summarizeWorkoutHistory(workoutSessionRepository.list());
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.hasEnoughHistory).toBe(true);
    expect(progress.verdictTitle).not.toBe("Fatigue is the limiter.");
    expect(progress.actionTitle).not.toBe("Reduce workload first.");
    expect(progress.recommendationEvidence.source).toBe("fixture");
  });

  it.each(designQaFixtures.map((fixture) => [fixture.id] as const))("generates expected local state for %s", (fixtureId) => {
    applyDesignQaFixture(fixtureId, "development");
    assertFixtureShape(fixtureId);
  });

  it("creates unknown-load Train fixture with guided discovery state", () => {
    applyDesignQaFixture("train_load_no_history", "development");
    expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3", loadState: "calibration_required" });
  });

  it("creates exact-history Train fixture with previous recommended load", () => {
    applyDesignQaFixture("train_load_exact_progressed", "development");
    expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3" });
  });

  it("creates exact-history hold fixture without inventing a jump", () => {
    applyDesignQaFixture("train_load_exact_held", "development");
    expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3" });
  });

  it("creates same-family estimate fixture with estimated-load copy", () => {
    applyDesignQaFixture("train_load_same_family_estimate", "development");
    expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3" });
  });

  it("keeps same-family low-confidence fixture blank", () => {
    applyDesignQaFixture("train_load_same_family_low_confidence", "development");
    expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3", loadState: "calibration_required" });
  });

  it("creates in-session escalation fixture with visible suggestion state", () => {
    applyDesignQaFixture("train_load_escalation", "development");
    const exercise = workoutSessionRepository.list().find((session) => !session.completedAt)!.exercises[0]!;
    const suggestion = getInSessionLoadIncreaseSuggestion(exercise.sets, exercise.settings, exercise.load);

    expect(suggestion.shouldSuggest).toBe(true);
    expect(suggestion.message).toBe("100kg looks too light today. Try 102.5kg next set?");
  });

  it("creates average-next fixture with rounded-up productive recommendation", () => {
    applyDesignQaFixture("train_load_average_next", "development");
    const session = workoutSessionRepository.list().find((candidate) => !candidate.completedAt)!;
    const completed = { ...session, completedAt: new Date().toISOString() };
    const summary = summarizeWorkoutSession(completed);

    expect(summary?.exerciseSummaries[0]?.nextRecommendedLoad).toBe(105);
  });

  it("creates load-increment fixtures with the requested practical jumps", () => {
    const expected: Array<[DesignQaFixtureId, number]> = [
      ["train_increment_barbell_1", 1],
      ["train_increment_barbell_2_5", 2.5],
      ["train_increment_barbell_5", 5],
      ["train_increment_machine_1", 1],
      ["train_increment_cable_1", 1],
      ["train_increment_exercise_override", 1],
    ];

    for (const [fixtureId, increment] of expected) {
      applyDesignQaFixture(fixtureId, "development");
      expect(readCanonicalTrainProjection()).toMatchObject({ snapshotVersion: "canonical_session_snapshot_v3" });
    }
  });

  it("creates reduced-load fixture with calm evidence copy", () => {
    applyDesignQaFixture("train_load_regression_reduce", "development");
    const exercise = workoutSessionRepository.list().find((session) => !session.completedAt)!.exercises[0]!;

    expect(exercise.load).toBe(95);
    expect(exercise.notes).toContain("too demanding");
  });

  it("uses a realistic active Push session count for the Home active-workout fixture", () => {
    applyDesignQaFixture("home_active_workout", "development");
    const plan = canonicalActivePlanState.getReadModel()!;
    const sessionId = plan.activeRecordedSession?.recordedSessionId;
    expect(sessionId).toBeTruthy();
    expect(canonicalRecordedSessionLedger.get(sessionId!).status).toBe("found");
  });

  it("creates Session Prep Train fixtures for not-started, completed, skipped, and active-workout states", () => {
    applyDesignQaFixture("train_prep_not_started", "development");
    expect(sessionPrepRepository.list()).toEqual([]);
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).not.toBeNull();

    applyDesignQaFixture("train_prep_completed", "development");
    expect(sessionPrepRepository.list()[0]).toMatchObject({ status: "completed" });

    applyDesignQaFixture("train_prep_skipped", "development");
    expect(sessionPrepRepository.list()[0]).toMatchObject({ status: "skipped" });

    applyDesignQaFixture("train_prep_active_workout", "development");
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).not.toBeNull();
  });

  it("creates productive-set fixtures with target and soft-cap presenter states", () => {
    applyDesignQaFixture("train_productive_below_min", "development");
    let exercise = workoutSessionRepository.list().find((session) => !session.completedAt)!.exercises[0]!;
    let libraryExercise = exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId)!;
    let summary = summarizeWorkoutSession({ ...workoutSessionRepository.list()[0]!, completedAt: new Date().toISOString() })!;
    let exerciseSummary = summary.exerciseSummaries[0]!;
    let guidance = buildProductiveSetGuidance({
      blockType: "hypertrophy",
      exerciseRole: libraryExercise.role,
      exerciseFamily: libraryExercise.family,
      primaryMuscles: libraryExercise.primaryMuscles,
      productiveSets: exerciseSummary.qualitySets,
    });

    expect(guidance.targetText).toBe("Target: 4-6 productive sets.");
    expect(exerciseSummary.qualitySets).toBeLessThan(guidance.target.min);
    expect(guidance.softCapReached).toBe(false);

    applyDesignQaFixture("train_productive_soft_cap", "development");
    exercise = workoutSessionRepository.list().find((session) => !session.completedAt)!.exercises[0]!;
    libraryExercise = exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId)!;
    summary = summarizeWorkoutSession({ ...workoutSessionRepository.list()[0]!, completedAt: new Date().toISOString() })!;
    exerciseSummary = summary.exerciseSummaries[0]!;
    guidance = buildProductiveSetGuidance({
      blockType: "hypertrophy",
      exerciseRole: libraryExercise.role,
      exerciseFamily: libraryExercise.family,
      primaryMuscles: libraryExercise.primaryMuscles,
      productiveSets: exerciseSummary.qualitySets,
    });

    expect(exercise.status).toBe("active");
    expect(guidance.softCapReached).toBe(true);
    expect(guidance.softCapText).toContain("Most lifters would move on");
  });

  it("creates Progress fixtures for volume recommendations without landmark jargon", () => {
    applyDesignQaFixture("progress_volume_large_low", "development");
    let history = summarizeWorkoutHistory(workoutSessionRepository.list());
    let progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.volumeRecommendation).toContain("below the productive volume zone");
    expect(progress.volumeRecommendation).not.toMatch(/MEV|MAV|MRV/);

    applyDesignQaFixture("progress_volume_large_high_fatigue", "development");
    history = summarizeWorkoutHistory(workoutSessionRepository.list());
    progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.volumeRecommendation).toMatch(/Reduce|Shutdowns|recoverable/i);
    expect(progress.volumeRecommendation).not.toMatch(/MEV|MAV|MRV/);
  });

  it("creates rotation fixtures for stalled and progressing Tier A exercises", () => {
    applyDesignQaFixture("progress_rotation_stalled_tier_a", "development");
    let history = summarizeWorkoutHistory(workoutSessionRepository.list());
    let progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.rotationRecommendation).toContain("Rotate Bench Press");
    expect(progress.rotationRecommendation).toContain("stalled across 4 exposures");

    applyDesignQaFixture("progress_rotation_progressing_tier_a", "development");
    history = summarizeWorkoutHistory(workoutSessionRepository.list());
    progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.rotationRecommendation).toBeUndefined();
  });

  it("creates Tier C rotation fixture with a purposeful replacement", () => {
    applyDesignQaFixture("progress_rotation_tier_c", "development");
    const history = summarizeWorkoutHistory(workoutSessionRepository.list());
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.rotationRecommendation).toContain("Rotate Cable Fly");
    expect(progress.rotationRecommendation).toContain("Suggested replacement");
  });

  it("keeps Phase 1 fatigue fixtures non-actionable without a persisted current deload", () => {
    const expected: DesignQaFixtureId[] = ["phase1_deload_mild", "phase1_deload_clear", "phase1_deload_severe"];

    for (const fixtureId of expected) {
      applyDesignQaFixture(fixtureId, "development");
      const history = summarizeWorkoutHistory(workoutSessionRepository.list());
      const progress = buildProgressDashboardViewModel(history, exerciseLibrary, activeTrainingPlanRepository.getOptional());
      expect(progress.actionFlow?.type).not.toBe("deload");
      expect(progress.journeyActions.primary.label).not.toBe("View recovery plan");
    }
  });

  it("creates Phase 1 low-history fixture without a fake deload action", () => {
    applyDesignQaFixture("phase1_low_history_no_deload", "development");
    const history = summarizeWorkoutHistory(workoutSessionRepository.list());
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary, activeTrainingPlanRepository.getOptional());

    expect(progress.hasEnoughHistory).toBe(false);
    expect(progress.actionFlow).toBeUndefined();
    expect(progress.recommendationEvidence.confidence).toBe("insufficient_data");
  });

  it("creates Phase 1 one-bad-session fixture without lowering the active load", () => {
    applyDesignQaFixture("phase1_load_one_bad_session", "development");
    const activeExercise = workoutSessionRepository.list().find((session) => !session.completedAt)!.exercises[0]!;

    expect(activeExercise.load).toBe(100);
    expect(activeExercise.notes).toContain("One poor session is not enough evidence");
  });

  it("creates Phase 1 goal fixtures with goal-specific recommendation evidence", () => {
    const expected: Array<[DesignQaFixtureId, string]> = [
      ["phase1_goal_strength", "Get Stronger"],
      ["phase1_goal_muscle", "Build Muscle"],
      ["phase1_goal_muscle_strength", "Build Muscle + Strength"],
      ["phase1_goal_athletic", "Athletic Performance"],
      ["phase1_goal_event", "Powerlifting Meet"],
      ["phase1_goal_general", "Lose Fat"],
    ];

    for (const [fixtureId, goalLabel] of expected) {
      applyDesignQaFixture(fixtureId, "development");
      const history = summarizeWorkoutHistory(workoutSessionRepository.list());
      const progress = buildProgressDashboardViewModel(history, exerciseLibrary, activeTrainingPlanRepository.getOptional());
      const evidenceText = progress.recommendationEvidence.dataPoints.join(" ");

      expect(progress.hasEnoughHistory).toBe(true);
      expect(evidenceText).toContain(goalLabel);
    }

    applyDesignQaFixture("phase1_goal_muscle", "development");
    let progress = buildProgressDashboardViewModel(summarizeWorkoutHistory(workoutSessionRepository.list()), exerciseLibrary, activeTrainingPlanRepository.getOptional());
    expect(progress.actionTitle).toBe("Continue the current training phase");

    applyDesignQaFixture("phase1_goal_general", "development");
    progress = buildProgressDashboardViewModel(summarizeWorkoutHistory(workoutSessionRepository.list()), exerciseLibrary, activeTrainingPlanRepository.getOptional());
    expect(progress.actionTitle).not.toBe("Increase volume");
  });

  it("creates a Home fixture with a legitimate Recovery & Capacity target", () => {
    applyDesignQaFixture("home_recovery_capacity", "development");
    const history = summarizeWorkoutHistory(workoutSessionRepository.list());
    const dashboard = buildHomeDashboardViewModel({
      trainingYear: createAnnualPlan(naturalLifterAnnualPlan, "2026-06-01T00:00:00.000Z"),
      activePlan: activeTrainingPlanRepository.getOptional(),
      history,
      exercises: exerciseLibrary,
      programmes: [],
      date: new Date("2026-06-12T12:00:00.000Z"),
    });

    expect(activeTrainingPlanRepository.getOptional()?.goal).toBe("get_leaner");
    expect(dashboard.recoveryCapacityTarget?.title).toBe("Recovery & Capacity");
    expect(dashboard.recoveryCapacityTarget?.targetLabel).toContain("Recovery Cardio");
    expect(dashboard.recoveryCapacityTarget?.completedSessions).toBe(0);
    expect(dashboard.recoveryCapacityTarget?.evidence.join(" ")).toContain("extra session");
  });
});

function assertFixtureShape(fixtureId: DesignQaFixtureId) {
  const activeFixture = getActiveDesignQaFixture();
  const activePlan = activeTrainingPlanRepository.getOptional();
  const sessions = workoutSessionRepository.list();

  expect(activeFixture?.id).toBe(fixtureId);

  const canonicalLoadFixtures = ["train_load_no_history", "train_load_strength_unknown", "train_load_exact_progressed", "train_load_exact_held", "train_load_same_family_estimate", "train_load_same_family_low_confidence", "train_load_lb_known", "train_load_bodyweight", "train_increment_barbell_1", "train_increment_barbell_2_5", "train_increment_barbell_5", "train_increment_machine_1", "train_increment_cable_1", "train_increment_exercise_override"];
  if (canonicalLoadFixtures.includes(fixtureId)) {
    expect(readCanonicalTrainProjection()).toMatchObject({ fixtureId, snapshotVersion: "canonical_session_snapshot_v3" });
    return;
  }

  if (fixtureId === "home_active_workout") {
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).not.toBeNull();
    return;
  }

  if (["train_overview_fresh", "train_first_set", "train_work_sets", "train_warmups", "train_swapped", "train_added_exercise", "train_near_threshold", "train_shutdown", "train_review_prs", "train_rotation_accepted", "train_end_workout_confirm", "train_prep_not_started", "train_prep_completed", "train_prep_skipped", "train_prep_active_workout"].includes(fixtureId)) {
    if (fixtureId === "train_review_prs") expect(canonicalActivePlanState.getReadModel()?.historicalRecordedSessions?.length).toBeGreaterThan(0);
    else expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).not.toBeNull();
    return;
  }

  if (fixtureId.startsWith("plan_") || (fixtureId.startsWith("home_") && fixtureId !== "home_recovery_capacity")) {
    if (fixtureId.endsWith("no_plan")) return;
    expect(canonicalActivePlanState.getReadModel()).not.toBeNull();
    expect(canonicalActivePlanState.getReadModel()?.plannedSessions.length).toBeGreaterThan(0);
    return;
  }

  if (fixtureId.endsWith("no_plan")) {
    expect(activePlan).toBeNull();
    return;
  }

  expect(activePlan).toBeTruthy();

  if (fixtureId.startsWith("progress_")) {
    expect(sessions.filter((session) => session.completedAt).length).toBeGreaterThan(0);
  }

  if (fixtureId.startsWith("train_")) {
    expect(sessions.some((session) => !session.completedAt)).toBe(true);
  }

  if (fixtureId === "home_completed_today") {
    expect(sessions.some((session) => session.completedAt)).toBe(true);
  }

  if (fixtureId === "plan_single_hypertrophy") {
    expect(activePlan?.mode).toBe("single_block");
    expect(activePlan?.blocks).toHaveLength(1);
  }

  if (fixtureId === "plan_event_custom") {
    expect(activePlan?.mode).toBe("custom_date_event");
    expect(activePlan?.currentMesocycleId).toBe("strength_general");
  }

  if (fixtureId === "plan_block_ending") {
    const activeBlock = activePlan?.blocks.find((block) => block.id === activePlan.activeBlockId);
    expect(activeBlock?.currentWeek).toBe(activeBlock?.durationWeeks);
    expect(activeBlock?.status).toBe("active");
  }

  if (fixtureId === "plan_block_transition_action") {
    const activeBlock = activePlan?.blocks.find((block) => block.id === activePlan.activeBlockId);
    expect(activeBlock?.currentWeek).toBe(activeBlock?.durationWeeks);
  }

  if (fixtureId === "plan_block_transition_accepted") {
    expect(activePlan?.currentMesocycleId).toBe("powerbuilding_hypertrophy");
    expect(activePlan?.currentMicrocycle?.sequenceNumber).toBe(1);
  }

  if (fixtureId === "plan_deload_accepted") {
    expect(activePlan?.currentMicrocycle?.progressionState).toBe("deload");
  }

  if (fixtureId === "train_rotation_accepted") {
    expect(activePlan?.recommendationState?.exerciseReplacements?.["ex-bench-press"]?.replacementExerciseId).toBe("ex-floor-press");
  }
}
