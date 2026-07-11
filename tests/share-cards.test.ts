import { describe, expect, it } from "vitest";
import {
  ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL,
  buildPowerliftingTotalSharePayload,
  buildPrSharePayload,
  buildStrengthProgressSharePayload,
  buildWorkoutSummarySharePayload,
  fallbackShareMessage,
} from "@/domain/training/share-cards";
import type { PersonalRecordItem } from "@/domain/training/personal-records";
import type { StrengthLiftDashboardItem, StrengthTotalDashboard } from "@/domain/training/strength-dashboard";

describe("branded share cards", () => {
  it("generates a branded PR share payload", () => {
    const payload = buildPrSharePayload(pr({ type: "e1rm", value: 120 }));

    expect(payload.type).toBe("pr");
    expect(payload.eyebrow).toBe("NEW PR");
    expect(payload.cardTitle).toBe("Bench Press");
    expect(payload.metric).toBe("120kg estimated 1RM");
    expect(payload.message).toContain("Adaptive Strength Coach");
    expect(payload.message).toContain("Auto-Regulated Strength Training");
    expect(payload.message).toContain("Download:");
    expect(payload.message).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
  });

  it("generates a strength progress share payload", () => {
    const payload = buildStrengthProgressSharePayload(lift());

    expect(payload?.type).toBe("strength_progress");
    expect(payload?.cardTitle).toBe("Bench Press");
    expect(payload?.metric).toBe("+15kg in 90 days");
    expect(payload?.detail).toBe("100kg → 115kg");
  });

  it("generates a powerlifting total share payload", () => {
    const total: StrengthTotalDashboard = { currentTotal: 525, bestTotal: 525, changeInTotal: 20, unit: "kg" };
    const payload = buildPowerliftingTotalSharePayload(total);

    expect(payload?.type).toBe("powerlifting_total");
    expect(payload?.metric).toBe("525kg total");
    expect(payload?.detail).toContain("Squat + Bench + Deadlift");
  });

  it("prioritizes multiple PRs over plain workout stats", () => {
    const payload = buildWorkoutSummarySharePayload({
      workoutName: "Push",
      exercisesCompleted: 5,
      workSetsCompleted: 18,
      prCount: 3,
      personalRecords: [
        pr({ id: "pr-1", exerciseName: "Bench Press", type: "e1rm", value: 120 }),
        pr({ id: "pr-2", exerciseName: "Row", type: "rep", value: 12, reps: 12, load: 80 }),
        pr({ id: "pr-3", exerciseName: "Leg Press", type: "load", value: 200 }),
      ],
    });

    expect(payload.type).toBe("pr");
    expect(payload.eyebrow).toBe("3 NEW PRs");
    expect(payload.cardTitle).toBe("3 New PRs");
    expect(payload.metric).toBe("Bench Press • Row • Leg Press");
    expect(payload.message).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
  });

  it("uses a single PR as the workout share headline when available", () => {
    const payload = buildWorkoutSummarySharePayload({
      workoutName: "Push",
      exercisesCompleted: 5,
      workSetsCompleted: 18,
      prCount: 1,
      personalRecords: [pr({ type: "rep", value: 12, reps: 12, load: 80 })],
    });

    expect(payload.eyebrow).toBe("NEW PR");
    expect(payload.cardTitle).toBe("Bench Press");
    expect(payload.metric).toBe("80kg × 12");
  });

  it("uses volume PR copy when the strongest result is volume", () => {
    const payload = buildWorkoutSummarySharePayload({
      workoutName: "Pull",
      exercisesCompleted: 4,
      workSetsCompleted: 14,
      prCount: 1,
      personalRecords: [pr({ type: "volume", value: 12540 })],
    });

    expect(payload.eyebrow).toBe("VOLUME PR");
    expect(payload.cardTitle).toBe("Bench Press");
    expect(payload.metric).toBe("12540kg lifted");
  });

  it("falls back to workout stats only when there are no wins", () => {
    const payload = buildWorkoutSummarySharePayload({
      workoutName: "Push",
      exercisesCompleted: 5,
      workSetsCompleted: 18,
      prCount: 0,
    });

    expect(payload.type).toBe("workout_summary");
    expect(payload.cardTitle).toBe("Workout Complete");
    expect(payload.metric).toBe("5 exercises · 18 work sets");
    expect(payload.detail).toBe("Completed with Adaptive Strength Coach");
    expect(payload.message).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
  });

  it("never advertises zero exercise and zero work-set stats", () => {
    const payload = buildWorkoutSummarySharePayload({
      workoutName: "Push",
      exercisesCompleted: 0,
      workSetsCompleted: 0,
      prCount: 0,
    });

    expect(payload.metric).toBe("Workout logged");
    expect(payload.message).not.toContain("0 exercises");
    expect(payload.message).not.toContain("0 work sets");
  });

  it("excludes private and sensitive fields from share payloads", () => {
    const payload = buildPrSharePayload(pr({ type: "load", value: 100 }));
    const text = payload.message.toLowerCase();

    expect(payload.privacy.includesPrivateData).toBe(false);
    expect(payload.privacy.excludedFields).toEqual(expect.arrayContaining(["bodyweight", "personal notes", "pain or injury info", "email", "name", "full workout log"]));
    expect(text).not.toContain("pain");
    expect(text).not.toContain("injury");
    expect(text).not.toContain("@");
    expect(text).not.toContain("bodyweight");
  });

  it("has a text fallback when richer image sharing is unavailable", () => {
    const payload = buildPrSharePayload(pr({ type: "rep", value: 12, reps: 12, load: 80 }));
    const fallback = fallbackShareMessage(payload);

    expect(fallback).toContain("Bench Press");
    expect(fallback).toContain("Adaptive Strength Coach");
    expect(fallback).toContain("Download:");
    expect(fallback).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
  });

  it("uses the stable smart download URL for all share types", () => {
    const total: StrengthTotalDashboard = { currentTotal: 525, bestTotal: 525, changeInTotal: 20, unit: "kg" };
    const payloads = [
      buildPrSharePayload(pr({ type: "load", value: 100 })),
      buildStrengthProgressSharePayload(lift()),
      buildPowerliftingTotalSharePayload(total),
      buildWorkoutSummarySharePayload({ workoutName: "Push", exercisesCompleted: 5, workSetsCompleted: 18, prCount: 0 }),
    ];

    expect(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL).toBe("https://adaptivestrengthcoach.com/download");
    for (const payload of payloads) {
      expect(payload?.message).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
      expect(fallbackShareMessage(payload!)).toContain(ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL);
    }
  });
});

function pr(overrides: Partial<PersonalRecordItem>): PersonalRecordItem {
  return {
    id: "pr-1",
    type: "e1rm",
    status: "pr",
    scope: "primary_lift",
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    value: 120,
    unit: "kg",
    date: "2026-06-13T12:00:00.000Z",
    sessionId: "session-1",
    ...overrides,
  };
}

function lift(): StrengthLiftDashboardItem {
  return {
    liftId: "bench_press",
    label: "Bench Press",
    exerciseIds: ["ex-bench-press"],
    currentE1rm: 115,
    bestE1rm: 115,
    change30Day: 7.5,
    change90Day: 15,
    trend: "up",
    evidence: "100kg x 5",
    unit: "kg",
  };
}
