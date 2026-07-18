import { describe, expect, it } from "vitest";
import { formatRestTime, getRestCompleteMessage, getRestTimerDefault, restCompleteMessageBank } from "@/domain/training/rest-timer";

describe("rest timer defaults", () => {
  it("uses 60-90 seconds for hypertrophy isolation work", () => {
    const rest = getRestTimerDefault({ blockType: "hypertrophy", roles: ["isolation"], movementPattern: "isolation" });
    expect(rest.seconds).toBeGreaterThanOrEqual(60); expect(rest.seconds).toBeLessThanOrEqual(90);
  });
  it("uses 90-150 seconds for hypertrophy compound work", () => {
    const rest = getRestTimerDefault({ blockType: "hypertrophy", roles: ["primary_compound"], movementPattern: "horizontal_push" });
    expect(rest.seconds).toBeGreaterThanOrEqual(90); expect(rest.seconds).toBeLessThanOrEqual(150);
  });
  it("uses 2-4 minutes for powerbuilding and strength compounds", () => {
    const powerbuilding = getRestTimerDefault({ blockType: "powerbuilding", roles: ["primary_compound"], movementPattern: "squat" });
    const strength = getRestTimerDefault({ blockType: "strength", roles: ["secondary_compound"], movementPattern: "hinge" });
    expect(powerbuilding.seconds).toBeGreaterThanOrEqual(120); expect(powerbuilding.seconds).toBeLessThanOrEqual(240);
    expect(strength.seconds).toBeGreaterThanOrEqual(120); expect(strength.seconds).toBeLessThanOrEqual(240);
  });
  it("uses 2-5 minutes for power work", () => {
    const rest = getRestTimerDefault({ blockType: "power", roles: ["power"], movementPattern: "horizontal_push" });
    expect(rest.seconds).toBeGreaterThanOrEqual(120); expect(rest.seconds).toBeLessThanOrEqual(300);
  });
  it("formats timer values for the workout UI", () => { expect(formatRestTime(75)).toBe("1:15"); expect(formatRestTime(180)).toBe("3:00"); });
  it("uses a short personality copy bank for rest completion", () => { expect(restCompleteMessageBank.length).toBeGreaterThanOrEqual(12); expect(restCompleteMessageBank).toContain("Rest's over. Go earn it."); expect(restCompleteMessageBank).toContain("Back to work."); expect(restCompleteMessageBank.every((message) => message.length <= 72)).toBe(true); });
  it("avoids immediate rest-complete message repeats when the previous message is known", () => { const first = getRestCompleteMessage({ seed: 0 }); expect(getRestCompleteMessage({ seed: 0, previousMessage: first })).not.toBe(first); });
  it("falls back to simple copy when needed and supports exercise context", () => { expect(getRestCompleteMessage({ seed: Number.NaN })).toBe("Rest complete."); expect(getRestCompleteMessage({ exerciseName: "Bench Press", seed: restCompleteMessageBank.length })).toBe("Bench Press is ready. Try not to overthink it."); });
  it("keeps rest-complete copy safe", () => { const allMessages = [...restCompleteMessageBank, getRestCompleteMessage({ category: "strength_power", seed: 0 }), getRestCompleteMessage({ category: "hypertrophy", seed: 0 })].join(" "); expect(allMessages).not.toMatch(/\b(injury|injured|pain|rehab|therapy|cure|guaranteed|kill|die|dead|fat|lazy)\b/i); });
});
