import { beforeEach, describe, expect, it } from "vitest";
import { cacheSubscription, getCachedSubscription, getOfflineEntitlementFallback, subscriptionCacheKey } from "@/application/billing/subscription-cache";
import { jsonStore } from "@/data/local/json-store";
import { canAccess, normalizeSubscriptionState, subscriptionPackages, type SubscriptionState } from "@/application/billing/subscription";

describe("subscription service cache", () => {
  beforeEach(() => {
    jsonStore.remove(subscriptionCacheKey);
    jsonStore.resetCache();
  });

  it("normalizes premium active entitlement state", () => {
    const subscription = normalizeSubscriptionState({
      status: "active",
      provider: "revenuecat",
      productId: "annual_subscription",
      expiresAt: "2026-07-01T00:00:00.000Z",
      willRenew: true,
    });

    expect(subscription.isPremium).toBe(true);
    expect(subscription.subscriptionType).toBe("annual");
    expect(subscription.entitlementStatus).toBe("active");
    expect(canAccess(subscription, "advanced_analytics")).toBe(true);
  });

  it("tracks trial status and trial end date", () => {
    const subscription = normalizeSubscriptionState({
      status: "trial",
      provider: "revenuecat",
      productId: "subscription_monthly_1",
      expiresAt: "2026-06-21T00:00:00.000Z",
    });

    expect(subscription.isTrialActive).toBe(true);
    expect(subscription.trialEndsAt).toBe("2026-06-21T00:00:00.000Z");
  });

  it("keeps a recent premium cache available during temporary outages", () => {
    const cached = cacheSubscription({
      status: "active",
      provider: "revenuecat",
      productId: "subscription_monthly_1",
      expiresAt: "2026-07-01T00:00:00.000Z",
    });

    expect(getCachedSubscription()).toMatchObject(cached);
    expect(getOfflineEntitlementFallback(new Date("2026-06-15T00:00:00.000Z"))).toMatchObject({
      status: "active",
      entitlementStatus: "offline_cached",
      isOfflineEntitlementCache: true,
      isPremium: true,
    });
  });

  it("does not use expired cached entitlement as premium access", () => {
    cacheSubscription({
      status: "active",
      provider: "revenuecat",
      productId: "subscription_monthly_1",
      expiresAt: "2026-06-01T00:00:00.000Z",
    });

    expect(getOfflineEntitlementFallback(new Date("2026-06-15T00:00:00.000Z"))).toBeNull();
  });

  it("models subscription expiry as locked premium access", () => {
    const expired: SubscriptionState = normalizeSubscriptionState({
      status: "expired",
      provider: "revenuecat",
      productId: "subscription_monthly_1",
      expiresAt: "2026-06-01T00:00:00.000Z",
    });

    expect(expired.isPremium).toBe(false);
    expect(canAccess(expired, "premium_programmes")).toBe(false);
  });

  it("uses configurable monthly and annual product identifiers", () => {
    expect(subscriptionPackages.map((pack) => pack.productId)).toEqual([
      "subscription_monthly_1",
      "annual_subscription",
    ]);
    expect(subscriptionPackages.every((pack) => pack.trialLabel?.includes("14-day"))).toBe(true);
  });
});
