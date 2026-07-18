import { describe, expect, it } from "vitest";
import { addRestTime, pauseRestTimer, remainingRestSeconds, resumeRestTimer, skipRest, startRestTimer } from "@/application/training/rest-timer";

describe("rest timer state contract", () => {
  it("counts down, pauses, resumes, adds time and skips without negative values", () => {
    const timer = startRestTimer(1000, 90);
    expect(remainingRestSeconds(timer, 1000)).toBe(90);
    expect(remainingRestSeconds(timer, 91001)).toBe(0);
    const paused = pauseRestTimer(timer, 30000);
    expect(remainingRestSeconds(paused, 80000)).toBe(61);
    const resumed = resumeRestTimer(paused, 50000);
    expect(remainingRestSeconds(resumed, 50000)).toBe(61);
    expect(remainingRestSeconds(addRestTime(resumed, 30), 50000)).toBe(91);
    expect(remainingRestSeconds(skipRest(resumed), 50000)).toBe(0);
  });
});
