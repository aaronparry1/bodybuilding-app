import { describe, expect, it } from "vitest";
import { canAccess, getEntitlement, getPlanLabel, type SubscriptionState } from "@/application/billing/subscription";

const free: SubscriptionState = { status: "free", provider: "mock" };
const active: SubscriptionState = { status: "active", provider: "mock" };
const trial: SubscriptionState = { status: "trial", provider: "mock" };
const lifetime: SubscriptionState = { status: "lifetime", provider: "mock" };
const expired: SubscriptionState = { status: "expired", provider: "mock" };

describe("subscription entitlements", () => {
  it("allows basic workout logging for every plan", () => {
    expect(canAccess(free, "workout_logging")).toBe(true);
    expect(canAccess(expired, "workout_logging")).toBe(true);
  });

  it("limits free custom programmes to three", () => {
    expect(getEntitlement(free, "custom_programmes", { customProgrammeCount: 2 }).allowed).toBe(true);
    expect(getEntitlement(free, "custom_programmes", { customProgrammeCount: 3 }).allowed).toBe(false);
  });

  it("locks premium features on free and expired plans", () => {
    expect(canAccess(free, "advanced_analytics")).toBe(false);
    expect(canAccess(free, "cloud_sync")).toBe(false);
    expect(canAccess(expired, "premium_programmes")).toBe(false);
  });

  it("unlocks premium features for trial, active, and lifetime", () => {
    for (const subscription of [trial, active, lifetime]) {
      expect(canAccess(subscription, "advanced_analytics")).toBe(true);
      expect(canAccess(subscription, "cloud_sync")).toBe(true);
      expect(canAccess(subscription, "unlimited_history", { historyDaysRequested: 365 })).toBe(true);
    }
  });

  it("labels plans clearly", () => {
    expect(getPlanLabel(free)).toBe("Free");
    expect(getPlanLabel(active)).toBe("Premium");
    expect(getPlanLabel(lifetime)).toBe("Lifetime");
  });
});
