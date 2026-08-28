import { canonicalRecoveryTimingRepository, type CanonicalRecoveryTimingSnapshot } from "@/data/local/canonical-recovery-timing-repository";

export type CanonicalRecoveryTimingObservation = Readonly<{
  schemaVersion: "canonical_recovery_timing_observation_v1";
  phase: CanonicalRecoveryTimingSnapshot["phase"] | "unknown";
  pairIdentity: string | null;
  prescribedSeconds: number | null;
  observedWallClockSeconds: number | null;
  observedUsableSeconds: number | null;
  pausedSeconds: number;
  backgroundSeconds: number;
  manualAdjustmentSeconds: number;
  timingConfidence: "reliable" | "unreliable";
  timingReason: string;
}>;

export function startCanonicalRecoveryTiming(input: Omit<CanonicalRecoveryTimingSnapshot, "schemaVersion" | "accumulatedPausedMilliseconds" | "accumulatedBackgroundMilliseconds" | "manualAdjustmentSeconds" | "skipped">) {
  return canonicalRecoveryTimingRepository.save({ ...input, schemaVersion: "canonical_recovery_timing_v1", accumulatedPausedMilliseconds: 0, accumulatedBackgroundMilliseconds: 0, manualAdjustmentSeconds: 0, skipped: false });
}

export function pauseCanonicalRecoveryTiming(workoutId: string, now = Date.now()) { return update(workoutId, (item) => item.pausedAt ? item : { ...item, pausedAt: now }); }
export function resumeCanonicalRecoveryTiming(workoutId: string, now = Date.now()) { return update(workoutId, (item) => item.pausedAt ? { ...item, accumulatedPausedMilliseconds: item.accumulatedPausedMilliseconds + Math.max(0, now - item.pausedAt), pausedAt: undefined } : item); }
export function backgroundCanonicalRecoveryTiming(workoutId: string, now = Date.now()) { return update(workoutId, (item) => item.backgroundedAt ? item : { ...item, backgroundedAt: now }); }
export function foregroundCanonicalRecoveryTiming(workoutId: string, now = Date.now()) { return update(workoutId, (item) => item.backgroundedAt ? { ...item, accumulatedBackgroundMilliseconds: item.accumulatedBackgroundMilliseconds + Math.max(0, now - item.backgroundedAt), backgroundedAt: undefined } : item); }
export function adjustCanonicalRecoveryTiming(workoutId: string, seconds: number) { return update(workoutId, (item) => ({ ...item, manualAdjustmentSeconds: item.manualAdjustmentSeconds + seconds })); }
export function skipCanonicalRecoveryTiming(workoutId: string) { return update(workoutId, (item) => ({ ...item, skipped: true })); }

export function observeCanonicalRecoveryTiming(input: Readonly<{ workoutId: string; slotId: string; exerciseId: string; setOrder: number; occurredAt: string; substitutionId?: string }>): CanonicalRecoveryTimingObservation {
  const timing = canonicalRecoveryTimingRepository.get(input.workoutId);
  if (!timing) return unknown("recovery_timing_not_started");
  const endedAt = Date.parse(input.occurredAt);
  if (!Number.isFinite(endedAt) || endedAt < timing.startedAt) return unknown("invalid_or_reversed_event_timestamp", timing);
  const pausedMilliseconds = timing.accumulatedPausedMilliseconds + (timing.pausedAt ? endedAt - timing.pausedAt : 0);
  const backgroundMilliseconds = timing.accumulatedBackgroundMilliseconds + (timing.backgroundedAt ? endedAt - timing.backgroundedAt : 0);
  const wallMilliseconds = endedAt - timing.startedAt;
  const ordered = timing.expectedSlotId === input.slotId && timing.expectedExerciseId === input.exerciseId && timing.expectedSetOrder === input.setOrder;
  const reason = !ordered ? "out_of_order_execution"
    : input.substitutionId ? "substitution_delay_not_attributable_to_recovery"
      : backgroundMilliseconds > 0 ? "app_background_duration_excluded"
        : pausedMilliseconds > 0 ? "user_paused_timer_duration_separated"
          : timing.skipped ? "timer_manually_skipped"
            : wallMilliseconds > 20 * 60 * 1000 ? "elapsed_interval_exceeds_reliable_window"
              : "continuous_foreground_timing";
  const reliable = reason === "continuous_foreground_timing" || reason === "timer_manually_skipped";
  return {
    schemaVersion: "canonical_recovery_timing_observation_v1",
    phase: timing.phase,
    pairIdentity: timing.pairIdentity,
    prescribedSeconds: timing.prescribedSeconds,
    observedWallClockSeconds: Math.round(wallMilliseconds / 1000),
    observedUsableSeconds: reliable ? Math.max(0, Math.round((wallMilliseconds - backgroundMilliseconds - pausedMilliseconds) / 1000)) : null,
    pausedSeconds: Math.max(0, Math.round(pausedMilliseconds / 1000)),
    backgroundSeconds: Math.max(0, Math.round(backgroundMilliseconds / 1000)),
    manualAdjustmentSeconds: timing.manualAdjustmentSeconds,
    timingConfidence: reliable ? "reliable" : "unreliable",
    timingReason: reason,
  };
}

function update(workoutId: string, transform: (item: CanonicalRecoveryTimingSnapshot) => CanonicalRecoveryTimingSnapshot) {
  const current = canonicalRecoveryTimingRepository.get(workoutId);
  return current ? canonicalRecoveryTimingRepository.save(transform(current)) : null;
}

function unknown(reason: string, timing?: CanonicalRecoveryTimingSnapshot): CanonicalRecoveryTimingObservation {
  return { schemaVersion: "canonical_recovery_timing_observation_v1", phase: timing?.phase ?? "unknown", pairIdentity: timing?.pairIdentity ?? null, prescribedSeconds: timing?.prescribedSeconds ?? null, observedWallClockSeconds: null, observedUsableSeconds: null, pausedSeconds: 0, backgroundSeconds: 0, manualAdjustmentSeconds: timing?.manualAdjustmentSeconds ?? 0, timingConfidence: "unreliable", timingReason: reason };
}
