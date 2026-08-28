import { jsonStore } from "@/data/local/json-store";

export type CanonicalRecoveryTimingSnapshot = Readonly<{
  schemaVersion: "canonical_recovery_timing_v1";
  workoutId: string;
  sourceSetId: string;
  sourceSlotId: string;
  sourceExerciseId: string;
  pairIdentity: string;
  phase: "a_to_b_transition" | "between_round_recovery";
  expectedSlotId: string;
  expectedExerciseId: string;
  expectedSetOrder: number;
  prescribedSeconds: number;
  startedAt: number;
  pausedAt?: number;
  accumulatedPausedMilliseconds: number;
  backgroundedAt?: number;
  accumulatedBackgroundMilliseconds: number;
  manualAdjustmentSeconds: number;
  skipped: boolean;
}>;

const KEY = "iron-logic.canonical-recovery-timing-v1";

export const canonicalRecoveryTimingRepository = {
  get(workoutId: string) {
    const value = jsonStore.get<CanonicalRecoveryTimingSnapshot | null>(KEY, null);
    return value?.workoutId === workoutId ? value : null;
  },
  save(snapshot: CanonicalRecoveryTimingSnapshot) { jsonStore.set(KEY, snapshot); return snapshot; },
  clear(workoutId?: string) { if (!workoutId || this.get(workoutId)) jsonStore.remove(KEY); },
};
