import { jsonStore } from "@/data/local/json-store";

export type CanonicalRestTimerSnapshot = Readonly<{ schemaVersion: "canonical_rest_timer_v1"; workoutId: string; setId: string; prescribedDurationSeconds: number; startedAt: number; expiresAt: number; state: "running" | "paused" | "expired" | "skipped"; remainingSeconds?: number; expiryAcknowledged: boolean }>;
const key = "iron-logic.canonical-rest-timer-v1";
export const canonicalRestTimerRepository = {
  get(workoutId: string) { const value = jsonStore.get<CanonicalRestTimerSnapshot | null>(key, null); return value?.workoutId === workoutId ? value : null; },
  save(snapshot: CanonicalRestTimerSnapshot) { jsonStore.set(key, snapshot); return snapshot; },
  clear(workoutId?: string) { if (!workoutId || this.get(workoutId)) jsonStore.remove(key); },
  reconcile(workoutId: string, now: number) { const current = this.get(workoutId); if (!current) return null; if (current.state === "running" && now >= current.expiresAt) return this.save({ ...current, state: "expired", expiryAcknowledged: false }); return current; },
};
