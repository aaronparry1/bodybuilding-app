export type RestTimerState = Readonly<{ startedAt: number; durationSeconds: number; pausedAt?: number; pausedRemainingSeconds?: number; skipped: boolean }>;

export function startRestTimer(now: number, durationSeconds: number): RestTimerState {
  return { startedAt: now, durationSeconds: Math.max(0, Math.floor(durationSeconds)), skipped: false };
}

export function remainingRestSeconds(timer: RestTimerState, now: number): number {
  if (timer.skipped) return 0;
  if (timer.pausedAt !== undefined) return timer.pausedRemainingSeconds ?? 0;
  const end = timer.startedAt + timer.durationSeconds * 1000;
  return Math.max(0, Math.ceil((end - now) / 1000));
}

export function pauseRestTimer(timer: RestTimerState, now: number): RestTimerState {
  return timer.pausedAt === undefined ? { ...timer, pausedAt: now, pausedRemainingSeconds: remainingRestSeconds(timer, now) } : timer;
}

export function resumeRestTimer(timer: RestTimerState, now: number): RestTimerState {
  if (timer.pausedAt === undefined) return timer;
  return { ...timer, startedAt: now, durationSeconds: timer.pausedRemainingSeconds ?? 0, pausedAt: undefined, pausedRemainingSeconds: undefined };
}

export function addRestTime(timer: RestTimerState, seconds: number): RestTimerState {
  return { ...timer, durationSeconds: timer.durationSeconds + Math.max(0, Math.floor(seconds)) };
}

export function skipRest(timer: RestTimerState): RestTimerState { return { ...timer, skipped: true }; }
