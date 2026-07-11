export type CoachingRuntimeLayer = "real_time" | "background" | "deep_analysis";

export type CoachingEventType =
  | "workout_started"
  | "warmup_completed"
  | "set_completed"
  | "rest_completed"
  | "pain_reported"
  | "exercise_completed"
  | "workout_completed"
  | "workout_abandoned"
  | "session_review_completed";

export type RuntimeEngineId =
  | "live_workout_coaching_engine"
  | "live_constraint_resolution_engine"
  | "live_safety_pain_policy"
  | "quality_of_execution_engine"
  | "productive_training_exposure_policy"
  | "post_workout_review_flow"
  | "coaching_evidence_engine"
  | "background_sync"
  | "deep_analysis_worker";

export type RuntimeReasonCode =
  | "local_first_runtime"
  | "cloud_never_blocks_workout"
  | "event_bus_dispatch"
  | "selective_engine_wake_up"
  | "real_time_latency_budget_enforced"
  | "operation_moved_to_background"
  | "learning_queued_asynchronously"
  | "immutable_workout_preserved"
  | "active_session_patch_only"
  | "cached_knowledge_required"
  | "reason_codes_reused_from_cache"
  | "background_sync_updates_future_coaching_only";

export interface CoachingRuntimeEvent<TPayload = Record<string, unknown>> {
  id: string;
  type: CoachingEventType;
  occurred_at: string;
  payload: TPayload;
}

export interface RuntimeEngineSubscription {
  engine_id: RuntimeEngineId;
  layer: CoachingRuntimeLayer;
  events: CoachingEventType[];
  latency_budget_ms: number;
}

export interface RuntimeEngineResult {
  engine_id: RuntimeEngineId;
  reason_codes: RuntimeReasonCode[];
  evidence_payload?: Record<string, unknown>;
  active_session_patch?: Record<string, unknown>;
  future_coaching_update?: Record<string, unknown>;
}

export interface RuntimeEngineRegistration extends RuntimeEngineSubscription {
  handler: (event: CoachingRuntimeEvent) => RuntimeEngineResult;
}

export interface RuntimeLatencyViolation {
  engine_id: RuntimeEngineId;
  elapsed_ms: number;
  budget_ms: number;
  moved_to_background: boolean;
}

export interface RuntimeEvidenceQueueEntry {
  event_id: string;
  event_type: CoachingEventType;
  source_engine_id: RuntimeEngineId;
  payload: Record<string, unknown>;
  learning_must_be_async: true;
}

export interface RuntimeDispatchResult {
  event_type: CoachingEventType;
  executed_engine_ids: RuntimeEngineId[];
  skipped_engine_ids: RuntimeEngineId[];
  queued_background_tasks: RuntimeEngineId[];
  evidence_queue_entries: RuntimeEvidenceQueueEntry[];
  latency_violations: RuntimeLatencyViolation[];
  workout_execution_blocked_by_cloud: false;
  reason_codes: RuntimeReasonCode[];
}

export interface RuntimeKnowledgeCacheStatus {
  support_functions_cached: boolean;
  exercise_knowledge_graph_cached: boolean;
  methods_cached: boolean;
  warmup_policies_cached: boolean;
  coaching_metadata_cached: boolean;
}

export interface RuntimeOfflineGuarantee {
  can_start_workout: boolean;
  can_log_sets: boolean;
  can_complete_workout: boolean;
  cloud_required_for_execution: false;
  missing_cached_knowledge: string[];
  reason_codes: RuntimeReasonCode[];
}

export interface RuntimeWorkoutState<TWorkout extends Record<string, unknown>> {
  generated_workout: Readonly<TWorkout>;
  active_session: TWorkout;
  evidence_queue: RuntimeEvidenceQueueEntry[];
  future_session_rebuild_required: boolean;
  reason_codes: RuntimeReasonCode[];
}

export interface CoachingRuntimeArchitecture {
  layers: Record<CoachingRuntimeLayer, {
    purpose: string;
    can_block_ui: boolean;
    may_use_cloud: boolean;
  }>;
  latency_budgets_ms: Record<RuntimeEngineId, number>;
  engine_subscriptions: RuntimeEngineSubscription[];
  offline_guarantee: RuntimeOfflineGuarantee;
  immutable_workout_model: {
    generated_workout_immutable: true;
    only_live_coaching_modifies_active_session: true;
    future_sessions_rebuilt_later: true;
  };
  evidence_queue: {
    workout_execution_waits_for_learning: false;
    coaching_evidence_runs_async: true;
  };
  sync_strategy: {
    cloud_enhances_coaching: true;
    cloud_blocks_workout_execution: false;
    sync_updates_future_coaching_only: true;
  };
  reason_codes: RuntimeReasonCode[];
}

const DEFAULT_LATENCY_BUDGETS_MS: Record<RuntimeEngineId, number> = {
  live_workout_coaching_engine: 8,
  live_constraint_resolution_engine: 6,
  live_safety_pain_policy: 4,
  quality_of_execution_engine: 20,
  productive_training_exposure_policy: 6,
  post_workout_review_flow: 30,
  coaching_evidence_engine: 250,
  background_sync: 1000,
  deep_analysis_worker: 5000,
};

export function createCoachingEventBus(registrations: RuntimeEngineRegistration[] = []) {
  const engines = [...registrations];
  const evidenceQueue: RuntimeEvidenceQueueEntry[] = [];

  return {
    subscribe(registration: RuntimeEngineRegistration) {
      engines.push(registration);
    },
    publish(event: CoachingRuntimeEvent): RuntimeDispatchResult {
      const matching = engines.filter((engine) => engine.events.includes(event.type));
      const skipped = engines.filter((engine) => !engine.events.includes(event.type)).map((engine) => engine.engine_id);
      const reasonCodes: RuntimeReasonCode[] = [
        "local_first_runtime",
        "cloud_never_blocks_workout",
        "event_bus_dispatch",
        "selective_engine_wake_up",
      ];
      const latencyViolations: RuntimeLatencyViolation[] = [];
      const queuedBackgroundTasks: RuntimeEngineId[] = [];
      const executed: RuntimeEngineId[] = [];

      for (const engine of matching) {
        const started = nowMs();
        const result = engine.handler(event);
        const elapsed = nowMs() - started;
        executed.push(engine.engine_id);
        reasonCodes.push(...result.reason_codes);

        if (result.evidence_payload) {
          evidenceQueue.push({
            event_id: event.id,
            event_type: event.type,
            source_engine_id: engine.engine_id,
            payload: result.evidence_payload,
            learning_must_be_async: true,
          });
          reasonCodes.push("learning_queued_asynchronously");
        }

        if (elapsed > engine.latency_budget_ms) {
          latencyViolations.push({
            engine_id: engine.engine_id,
            elapsed_ms: elapsed,
            budget_ms: engine.latency_budget_ms,
            moved_to_background: true,
          });
          queuedBackgroundTasks.push(engine.engine_id);
          reasonCodes.push("real_time_latency_budget_enforced", "operation_moved_to_background");
        }
      }

      if (event.type === "workout_completed" || event.type === "workout_abandoned" || event.type === "session_review_completed") {
        queuedBackgroundTasks.push("coaching_evidence_engine");
        reasonCodes.push("learning_queued_asynchronously");
      }

      return {
        event_type: event.type,
        executed_engine_ids: unique(executed),
        skipped_engine_ids: unique(skipped),
        queued_background_tasks: unique(queuedBackgroundTasks),
        evidence_queue_entries: [...evidenceQueue],
        latency_violations: latencyViolations,
        workout_execution_blocked_by_cloud: false,
        reason_codes: unique(reasonCodes),
      };
    },
    evidenceQueue() {
      return [...evidenceQueue];
    },
  };
}

export function createRuntimeArchitecture(
  cacheStatus: RuntimeKnowledgeCacheStatus,
  subscriptions: RuntimeEngineSubscription[] = defaultRuntimeSubscriptions(),
): CoachingRuntimeArchitecture {
  return {
    layers: {
      real_time: {
        purpose: "Runs during workouts with strict latency budgets.",
        can_block_ui: true,
        may_use_cloud: false,
      },
      background: {
        purpose: "Runs after workouts or between sets without blocking the workout UI.",
        can_block_ui: false,
        may_use_cloud: false,
      },
      deep_analysis: {
        purpose: "Runs asynchronously and may use cloud services when available.",
        can_block_ui: false,
        may_use_cloud: true,
      },
    },
    latency_budgets_ms: DEFAULT_LATENCY_BUDGETS_MS,
    engine_subscriptions: subscriptions,
    offline_guarantee: evaluateOfflineGuarantee(cacheStatus),
    immutable_workout_model: {
      generated_workout_immutable: true,
      only_live_coaching_modifies_active_session: true,
      future_sessions_rebuilt_later: true,
    },
    evidence_queue: {
      workout_execution_waits_for_learning: false,
      coaching_evidence_runs_async: true,
    },
    sync_strategy: {
      cloud_enhances_coaching: true,
      cloud_blocks_workout_execution: false,
      sync_updates_future_coaching_only: true,
    },
    reason_codes: [
      "local_first_runtime",
      "cloud_never_blocks_workout",
      "cached_knowledge_required",
      "immutable_workout_preserved",
      "background_sync_updates_future_coaching_only",
    ],
  };
}

export function defaultRuntimeSubscriptions(): RuntimeEngineSubscription[] {
  return [
    subscription("live_workout_coaching_engine", "real_time", ["set_completed", "rest_completed", "exercise_completed"], 8),
    subscription("live_constraint_resolution_engine", "real_time", ["pain_reported", "set_completed", "workout_abandoned"], 6),
    subscription("live_safety_pain_policy", "real_time", ["pain_reported"], 4),
    subscription("productive_training_exposure_policy", "real_time", ["set_completed", "exercise_completed"], 6),
    subscription("quality_of_execution_engine", "background", ["workout_completed", "workout_abandoned", "session_review_completed"], 20),
    subscription("post_workout_review_flow", "background", ["workout_completed", "workout_abandoned"], 30),
    subscription("coaching_evidence_engine", "background", ["session_review_completed"], 250),
    subscription("background_sync", "background", ["workout_completed", "session_review_completed"], 1000),
    subscription("deep_analysis_worker", "deep_analysis", ["workout_completed"], 5000),
  ];
}

export function evaluateOfflineGuarantee(cacheStatus: RuntimeKnowledgeCacheStatus): RuntimeOfflineGuarantee {
  const missing = Object.entries(cacheStatus)
    .filter(([, cached]) => !cached)
    .map(([key]) => key);

  return {
    can_start_workout: missing.length === 0,
    can_log_sets: true,
    can_complete_workout: true,
    cloud_required_for_execution: false,
    missing_cached_knowledge: missing,
    reason_codes: missing.length === 0
      ? ["local_first_runtime", "cached_knowledge_required", "cloud_never_blocks_workout"]
      : ["local_first_runtime", "cached_knowledge_required"],
  };
}

export function createRuntimeWorkoutState<TWorkout extends Record<string, unknown>>(generatedWorkout: TWorkout): RuntimeWorkoutState<TWorkout> {
  return {
    generated_workout: deepFreeze(clone(generatedWorkout)),
    active_session: clone(generatedWorkout),
    evidence_queue: [],
    future_session_rebuild_required: false,
    reason_codes: ["immutable_workout_preserved"],
  };
}

export function applyActiveSessionPatch<TWorkout extends Record<string, unknown>>(
  state: RuntimeWorkoutState<TWorkout>,
  patch: Partial<TWorkout>,
): RuntimeWorkoutState<TWorkout> {
  return {
    ...state,
    generated_workout: state.generated_workout,
    active_session: {
      ...state.active_session,
      ...patch,
    },
    future_session_rebuild_required: false,
    reason_codes: unique([...state.reason_codes, "active_session_patch_only", "immutable_workout_preserved"]),
  };
}

export function enqueueRuntimeEvidence<TWorkout extends Record<string, unknown>>(
  state: RuntimeWorkoutState<TWorkout>,
  entry: RuntimeEvidenceQueueEntry,
): RuntimeWorkoutState<TWorkout> {
  return {
    ...state,
    evidence_queue: [...state.evidence_queue, entry],
    future_session_rebuild_required: true,
    reason_codes: unique([...state.reason_codes, "learning_queued_asynchronously", "background_sync_updates_future_coaching_only"]),
  };
}

function subscription(
  engine_id: RuntimeEngineId,
  layer: CoachingRuntimeLayer,
  events: CoachingEventType[],
  latency_budget_ms: number,
): RuntimeEngineSubscription {
  return {
    engine_id,
    layer,
    events,
    latency_budget_ms,
  };
}

function nowMs(): number {
  return Date.now();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const nested = (value as Record<string, unknown>)[key];
      if (nested && typeof nested === "object") {
        deepFreeze(nested);
      }
    }
    return Object.freeze(value);
  }
  return value;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export const runtimeArchitectureNotes = {
  decision_id: "10G",
  local_first: true,
  event_driven: true,
  immutable_workout_principle: true,
  learning_never_blocks_workout: true,
  cloud_never_blocks_execution: true,
  reason_codes: ["local_first_runtime", "event_bus_dispatch", "immutable_workout_preserved"] satisfies RuntimeReasonCode[],
} as const;
