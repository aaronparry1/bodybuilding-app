export const STARTUP_AUTH_DEADLINE_MS = 8_000;
export const STARTUP_RESTORE_DEADLINE_MS = 12_000;
export const STARTUP_BRANCH_DEADLINE_MS = 8_000;

export type StartupStage = "auth" | "account_restore" | "reconciliation" | "local_today";
export type StartupOutcome = "started" | "ready" | "timeout" | "failed" | "conflict" | "local_ready";
export type StartupTelemetryEvent = Readonly<{
  stage: StartupStage;
  outcome: StartupOutcome;
  durationMs?: number;
  reason?: "deadline" | "unavailable" | "partial_failure" | "ownership_mismatch" | "unknown";
}>;

export class StartupDeadlineError extends Error {
  constructor(readonly operation: StartupStage | "restore_branch") {
    super(`${operation}_deadline_exceeded`);
    this.name = "StartupDeadlineError";
  }
}

export function withStartupDeadline<T>(promise: Promise<T>, timeoutMs: number, operation: StartupStage | "restore_branch"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new StartupDeadlineError(operation)), timeoutMs);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

/** Emits only a fixed, non-sensitive startup schema: never IDs, training data, routes or free-form errors. */
export function recordStartupTelemetry(event: StartupTelemetryEvent): void {
  const safe = sanitizeStartupTelemetry(event);
  console.info("[startup:metric]", JSON.stringify(safe));
}

export function sanitizeStartupTelemetry(event: StartupTelemetryEvent): StartupTelemetryEvent {
  return {
    stage: event.stage,
    outcome: event.outcome,
    ...(event.durationMs === undefined ? {} : { durationMs: Math.max(0, Math.round(event.durationMs)) }),
    ...(event.reason ? { reason: event.reason } : {}),
  };
}

export function elapsedSince(startedAt: number): number { return Date.now() - startedAt; }
