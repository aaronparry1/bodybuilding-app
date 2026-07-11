import { beforeEach, describe, expect, it } from "vitest";
import {
  appReviewPromptStore,
  evaluateAppReviewPromptEligibility,
  requestAppReviewIfEligible,
} from "@/application/review/app-review-prompt";
import { jsonStore } from "@/data/local/json-store";

const earnedInput = {
  completedPlannedWorkouts: 5,
  completedTrainingWeeks: 0,
  hasPersonalRecord: false,
  now: "2026-06-20T12:00:00.000Z",
};

describe("app review prompt timing", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.app-review-prompt");
    jsonStore.resetCache();
  });

  it("does not allow a review prompt on first launch or before value is delivered", () => {
    const result = evaluateAppReviewPromptEligibility({
      completedPlannedWorkouts: 0,
      completedTrainingWeeks: 0,
      hasPersonalRecord: false,
      now: "2026-06-20T12:00:00.000Z",
    });

    expect(result).toEqual({
      allowed: false,
      milestone: null,
      reason: "no_value_milestone",
    });
  });

  it("does not prompt during onboarding", () => {
    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, isOnboardingFlow: true })).toMatchObject({
      allowed: false,
      reason: "onboarding",
    });
  });

  it("does not prompt after paywall, trial, restore, or subscription flows", () => {
    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, isPaywallOrSubscriptionFlow: true })).toMatchObject({
      allowed: false,
      reason: "paywall_or_subscription",
    });
  });

  it("does not prompt after a failed workout, missed range, recovery warning, crash, or offline/error session", () => {
    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, hasNegativeSessionEvent: true })).toMatchObject({
      allowed: false,
      reason: "negative_session",
    });
  });

  it("allows a prompt after five completed planned workouts", () => {
    expect(evaluateAppReviewPromptEligibility(earnedInput)).toEqual({
      allowed: true,
      milestone: "five_planned_workouts",
      reason: null,
    });
  });

  it("allows a prompt after the first PR", () => {
    expect(
      evaluateAppReviewPromptEligibility({
        completedPlannedWorkouts: 1,
        completedTrainingWeeks: 0,
        hasPersonalRecord: true,
        now: "2026-06-20T12:00:00.000Z",
      }),
    ).toEqual({
      allowed: true,
      milestone: "first_pr",
      reason: null,
    });
  });

  it("allows a prompt after the first completed training week", () => {
    expect(
      evaluateAppReviewPromptEligibility({
        completedPlannedWorkouts: 4,
        completedTrainingWeeks: 1,
        hasPersonalRecord: false,
        now: "2026-06-20T12:00:00.000Z",
      }),
    ).toEqual({
      allowed: true,
      milestone: "first_training_week",
      reason: null,
    });
  });

  it("suppresses prompts if the user was prompted within 30 days", () => {
    appReviewPromptStore.recordPromptShown("2026-06-01T12:00:00.000Z");

    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, now: "2026-06-20T12:00:00.000Z" })).toMatchObject({
      allowed: false,
      reason: "recently_prompted",
    });

    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, now: "2026-07-02T12:00:00.000Z" })).toMatchObject({
      allowed: true,
      milestone: "five_planned_workouts",
    });
  });

  it("persists prompt history across store reads and cache resets", () => {
    appReviewPromptStore.recordPromptShown("2026-06-01T12:00:00.000Z");
    jsonStore.resetCache();

    expect(appReviewPromptStore.get()).toEqual({
      lastPromptedAt: "2026-06-01T12:00:00.000Z",
      promptCount: 1,
    });
    expect(evaluateAppReviewPromptEligibility({ ...earnedInput, now: "2026-06-15T12:00:00.000Z" })).toMatchObject({
      allowed: false,
      reason: "recently_prompted",
    });
  });

  it("fails silently and does not record a prompt when native review is unavailable", async () => {
    const result = await requestAppReviewIfEligible(earnedInput, {
      isAvailable: () => false,
      requestReview: () => {
        throw new Error("should not be called");
      },
    });

    expect(result).toEqual({
      allowed: false,
      milestone: null,
      reason: "native_unavailable",
    });
    expect(appReviewPromptStore.get().promptCount).toBe(0);
  });

  it("records prompt history when the native review request is attempted", async () => {
    const result = await requestAppReviewIfEligible(earnedInput, {
      isAvailable: () => true,
      requestReview: () => true,
    });

    expect(result).toEqual({
      allowed: true,
      milestone: "five_planned_workouts",
      reason: null,
    });
    expect(appReviewPromptStore.get()).toEqual({
      lastPromptedAt: "2026-06-20T12:00:00.000Z",
      promptCount: 1,
    });
  });
});
