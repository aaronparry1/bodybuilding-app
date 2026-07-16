import { describe, expect, it, beforeEach } from "vitest";
import { finishPerformanceSpan, getCompletedPerformanceSpans, resetPerformanceSpans, startPerformanceSpan } from "@/application/runtime/performance-instrumentation";

describe("development performance instrumentation", () => {
  beforeEach(() => resetPerformanceSpans());
  it("records bounded, safe named spans", () => {
    const id = startPerformanceSpan("exercise.swap", { iteration: 1 });
    const span = finishPerformanceSpan(id);
    expect(span?.name).toBe("exercise.swap");
    expect(span?.durationMs).toBeGreaterThanOrEqual(0);
    expect(getCompletedPerformanceSpans()).toHaveLength(1);
  });
  it("does not retain more than the bounded span window", () => {
    for (let i = 0; i < 250; i += 1) finishPerformanceSpan(startPerformanceSpan("interaction", { iteration: i }));
    expect(getCompletedPerformanceSpans()).toHaveLength(200);
  });
});
