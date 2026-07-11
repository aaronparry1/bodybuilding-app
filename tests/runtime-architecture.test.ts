import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  applyActiveSessionPatch,
  createCoachingEventBus,
  createRuntimeArchitecture,
  createRuntimeWorkoutState,
  defaultRuntimeSubscriptions,
  enqueueRuntimeEvidence,
  evaluateOfflineGuarantee,
  runtimeArchitectureNotes,
  type RuntimeEngineRegistration,
  type RuntimeKnowledgeCacheStatus,
} from "../src/domain/training/runtime-architecture";

const fullCache: RuntimeKnowledgeCacheStatus = {
  support_functions_cached: true,
  exercise_knowledge_graph_cached: true,
  methods_cached: true,
  warmup_policies_cached: true,
  coaching_metadata_cached: true,
};

describe("Runtime Architecture", () => {
  it("guarantees workout execution can run fully offline when local knowledge is cached", () => {
    const guarantee = evaluateOfflineGuarantee(fullCache);

    expect(guarantee.can_start_workout).toBe(true);
    expect(guarantee.can_log_sets).toBe(true);
    expect(guarantee.can_complete_workout).toBe(true);
    expect(guarantee.cloud_required_for_execution).toBe(false);
    expect(guarantee.reason_codes).toContain("cloud_never_blocks_workout");
  });

  it("reports missing local knowledge without making cloud a workout dependency", () => {
    const guarantee = evaluateOfflineGuarantee({
      ...fullCache,
      exercise_knowledge_graph_cached: false,
    });

    expect(guarantee.can_start_workout).toBe(false);
    expect(guarantee.can_log_sets).toBe(true);
    expect(guarantee.can_complete_workout).toBe(true);
    expect(guarantee.cloud_required_for_execution).toBe(false);
    expect(guarantee.missing_cached_knowledge).toEqual(["exercise_knowledge_graph_cached"]);
  });

  it("uses event bus subscriptions for selective engine wake-up", () => {
    const setEngine = registration("live_workout_coaching_engine", ["set_completed"]);
    const painEngine = registration("live_safety_pain_policy", ["pain_reported"]);
    const bus = createCoachingEventBus([setEngine, painEngine]);

    const result = bus.publish({
      id: "event-1",
      type: "set_completed",
      occurred_at: "2026-07-04T12:00:00.000Z",
      payload: { exerciseId: "bench" },
    });

    expect(result.executed_engine_ids).toEqual(["live_workout_coaching_engine"]);
    expect(result.skipped_engine_ids).toContain("live_safety_pain_policy");
    expect(result.reason_codes).toContain("selective_engine_wake_up");
    expect(result.workout_execution_blocked_by_cloud).toBe(false);
  });

  it("moves over-budget real-time work to background rather than blocking the workout", () => {
    const timestamps = [0, 12];
    vi.spyOn(Date, "now").mockImplementation(() => timestamps.shift() ?? 12);
    const bus = createCoachingEventBus([
      {
        ...registration("live_constraint_resolution_engine", ["set_completed"]),
        latency_budget_ms: 6,
      },
    ]);

    const result = bus.publish({
      id: "event-latency",
      type: "set_completed",
      occurred_at: "2026-07-04T12:00:00.000Z",
      payload: {},
    });

    expect(result.latency_violations).toEqual([
      {
        engine_id: "live_constraint_resolution_engine",
        elapsed_ms: 12,
        budget_ms: 6,
        moved_to_background: true,
      },
    ]);
    expect(result.queued_background_tasks).toContain("live_constraint_resolution_engine");
    expect(result.reason_codes).toContain("operation_moved_to_background");
    vi.restoreAllMocks();
  });

  it("queues learning asynchronously so workout completion never waits for learning", () => {
    const bus = createCoachingEventBus([
      {
        ...registration("quality_of_execution_engine", ["workout_completed"]),
        handler: (event) => ({
          engine_id: "quality_of_execution_engine",
          reason_codes: ["learning_queued_asynchronously"],
          evidence_payload: { eventId: event.id, executionQuality: "good" },
        }),
      },
    ]);

    const result = bus.publish({
      id: "workout-1",
      type: "workout_completed",
      occurred_at: "2026-07-04T12:30:00.000Z",
      payload: {},
    });

    expect(result.evidence_queue_entries).toHaveLength(1);
    expect(result.evidence_queue_entries[0]).toMatchObject({
      event_id: "workout-1",
      learning_must_be_async: true,
    });
    expect(result.queued_background_tasks).toContain("coaching_evidence_engine");
    expect(result.workout_execution_blocked_by_cloud).toBe(false);
  });

  it("preserves generated workouts as immutable and patches only the active session", () => {
    const generated = {
      workoutId: "w1",
      exercises: [{ id: "bench", sets: 3 }],
    };
    const state = createRuntimeWorkoutState(generated);
    const next = applyActiveSessionPatch(state, {
      exercises: [{ id: "bench", sets: 2 }],
    });

    expect(Object.isFrozen(state.generated_workout)).toBe(true);
    expect((state.generated_workout.exercises as Array<{ sets: number }>)[0]!.sets).toBe(3);
    expect((next.generated_workout.exercises as Array<{ sets: number }>)[0]!.sets).toBe(3);
    expect((next.active_session.exercises as Array<{ sets: number }>)[0]!.sets).toBe(2);
    expect(next.future_session_rebuild_required).toBe(false);
    expect(next.reason_codes).toContain("active_session_patch_only");
  });

  it("background sync and evidence queue affect future coaching only", () => {
    const state = createRuntimeWorkoutState({ workoutId: "w2", exercises: [] });
    const next = enqueueRuntimeEvidence(state, {
      event_id: "review-1",
      event_type: "session_review_completed",
      source_engine_id: "post_workout_review_flow",
      payload: { difficulty: "hard" },
      learning_must_be_async: true,
    });

    expect(next.evidence_queue).toHaveLength(1);
    expect(next.future_session_rebuild_required).toBe(true);
    expect(next.active_session).toEqual(state.active_session);
    expect(next.reason_codes).toContain("background_sync_updates_future_coaching_only");
  });

  it("documents runtime layers, subscriptions, budgets, evidence queue, and sync strategy", () => {
    const architecture = createRuntimeArchitecture(fullCache);

    expect(architecture.layers.real_time.can_block_ui).toBe(true);
    expect(architecture.layers.background.can_block_ui).toBe(false);
    expect(architecture.layers.deep_analysis.may_use_cloud).toBe(true);
    expect(architecture.engine_subscriptions).toEqual(defaultRuntimeSubscriptions());
    expect(architecture.latency_budgets_ms.live_workout_coaching_engine).toBeLessThanOrEqual(8);
    expect(architecture.evidence_queue.workout_execution_waits_for_learning).toBe(false);
    expect(architecture.sync_strategy.cloud_blocks_workout_execution).toBe(false);
    expect(architecture.immutable_workout_model.generated_workout_immutable).toBe(true);
  });

  it("keeps architecture notes explicit", () => {
    expect(runtimeArchitectureNotes.decision_id).toBe("10G");
    expect(runtimeArchitectureNotes.local_first).toBe(true);
    expect(runtimeArchitectureNotes.event_driven).toBe(true);
    expect(runtimeArchitectureNotes.immutable_workout_principle).toBe(true);
    expect(runtimeArchitectureNotes.learning_never_blocks_workout).toBe(true);
  });

  it("does not contain network, storage, direct engine coupling, or programme mutation behavior", () => {
    const source = readFileSync("src/domain/training/runtime-architecture.ts", "utf8");

    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(coachLiveWorkout|resolveLiveWorkoutConstraint|evaluateLiveSafetyPain|processCoachingEvidence)\s*\(/);
  });
});

function registration(engine_id: RuntimeEngineRegistration["engine_id"], events: RuntimeEngineRegistration["events"]): RuntimeEngineRegistration {
  return {
    engine_id,
    layer: "real_time",
    events,
    latency_budget_ms: 8,
    handler: () => ({
      engine_id,
      reason_codes: ["event_bus_dispatch"],
    }),
  };
}
