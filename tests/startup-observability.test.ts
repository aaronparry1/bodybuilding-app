import { describe, expect, it, vi } from "vitest";
import { sanitizeStartupTelemetry, StartupDeadlineError, withStartupDeadline } from "@/application/startup/startup-observability";

describe("production startup observability", () => {
  it("allows a completed operation before its deadline", async () => {
    await expect(withStartupDeadline(Promise.resolve("ready"), 20, "account_restore")).resolves.toBe("ready");
  });

  it("turns a stalled restore into a finite timeout", async () => {
    vi.useFakeTimers();
    const stalled = withStartupDeadline(new Promise<string>(() => undefined), 100, "account_restore");
    const assertion = expect(stalled).rejects.toBeInstanceOf(StartupDeadlineError);
    await vi.advanceTimersByTimeAsync(101);
    await assertion;
    vi.useRealTimers();
  });

  it("emits only the fixed non-sensitive schema", () => {
    const sanitized = sanitizeStartupTelemetry({ stage: "account_restore", outcome: "failed", durationMs: 41.6, reason: "partial_failure" });
    expect(sanitized).toEqual({ stage: "account_restore", outcome: "failed", durationMs: 42, reason: "partial_failure" });
    expect(JSON.stringify(sanitized)).not.toMatch(/user|email|plan|exercise|workout|sessionId/i);
  });
});
