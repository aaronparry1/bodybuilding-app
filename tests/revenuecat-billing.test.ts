import { describe, expect, it } from "vitest";
import {
  canAccess,
  buildRestorePurchasesFailureResult,
  buildRestorePurchasesResult,
  chooseBillingPackages,
  isRevenueCatPublicKeyConfigured,
  mapRevenueCatCustomerInfoToSubscription,
  normalizeBillingError,
  revenueCatPremiumEntitlementId,
  resolveRevenueCatApiKey,
  subscriptionPackages,
} from "@/application/billing/subscription";

describe("RevenueCat billing mapping", () => {
  it("maps active premium entitlement to app premium access", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "customer-1",
      activeEntitlements: [revenueCatPremiumEntitlementId],
      entitlementPeriodType: "NORMAL",
      latestExpirationDate: "2026-07-01T00:00:00.000Z",
      productId: "subscription_monthly_1",
      willRenew: true,
      isSandbox: true,
    });

    expect(subscription).toMatchObject({
      status: "active",
      provider: "revenuecat",
      productId: "subscription_monthly_1",
      subscriptionType: "monthly",
      isSandbox: true,
    });
    expect(canAccess(subscription, "cloud_sync")).toBe(true);
    expect(canAccess(subscription, "advanced_analytics")).toBe(true);
  });

  it("maps trial entitlement to trial status", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "customer-1",
      activeEntitlements: [revenueCatPremiumEntitlementId],
      entitlementPeriodType: "TRIAL",
    });

    expect(subscription.status).toBe("trial");
    expect(subscription.isTrialActive).toBe(true);
    expect(subscription.isPremium).toBe(true);
  });

  it("maps configured entitlement ids when RevenueCat dashboard names differ", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription(
      {
        customerId: "customer-1",
        activeEntitlements: ["premium"],
        entitlementPeriodType: "TRIAL",
        productId: "subscription_monthly_1",
      },
      "premium",
    );

    expect(subscription.status).toBe("trial");
    expect(subscription.isPremium).toBe(true);
  });

  it("maps missing premium entitlement to free", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "customer-1",
      activeEntitlements: [],
    });

    expect(subscription.status).toBe("free");
    expect(canAccess(subscription, "premium_programmes")).toBe(false);
  });

  it("treats missing or placeholder RevenueCat keys as mock-mode fallback", () => {
    expect(isRevenueCatPublicKeyConfigured(undefined)).toBe(false);
    expect(isRevenueCatPublicKeyConfigured("appl_placeholder")).toBe(false);
    expect(isRevenueCatPublicKeyConfigured("goog_placeholder")).toBe(false);
    expect(isRevenueCatPublicKeyConfigured("appl_real_public_sdk_key")).toBe(true);
    expect(isRevenueCatPublicKeyConfigured("goog_real_public_sdk_key")).toBe(true);
    expect(isRevenueCatPublicKeyConfigured("test_real_test_store_key")).toBe(true);
  });

  it("uses platform RevenueCat SDK keys before test-store fallback on native platforms", () => {
    expect(
      resolveRevenueCatApiKey({
        platform: "ios",
        testKey: "test_real_test_store_key",
        iosKey: "appl_real_ios_public_sdk_key",
        androidKey: "goog_real_android_public_sdk_key",
      }),
    ).toBe("appl_real_ios_public_sdk_key");

    expect(
      resolveRevenueCatApiKey({
        platform: "android",
        testKey: "test_real_test_store_key",
        iosKey: "appl_real_ios_public_sdk_key",
        androidKey: "goog_real_android_public_sdk_key",
      }),
    ).toBe("goog_real_android_public_sdk_key");
  });

  it("falls back to RevenueCat test-store key when the platform key is missing", () => {
    expect(resolveRevenueCatApiKey({ platform: "ios", testKey: "test_real_test_store_key" })).toBe("test_real_test_store_key");
    expect(resolveRevenueCatApiKey({ platform: "android", testKey: "test_real_test_store_key" })).toBe("test_real_test_store_key");
  });

  it("returns null when platform and fallback RevenueCat keys are missing or placeholders", () => {
    expect(resolveRevenueCatApiKey({ platform: "ios", iosKey: "appl_placeholder", testKey: "test_placeholder" })).toBeNull();
    expect(resolveRevenueCatApiKey({ platform: "android", androidKey: "goog_placeholder" })).toBeNull();
  });

  it("surfaces restore failures from gateways", async () => {
    const failingGateway = {
      restorePurchases: async () => {
        throw new Error("Restore failed in sandbox");
      },
    };

    await expect(failingGateway.restorePurchases()).rejects.toThrow("Restore failed in sandbox");
  });

  it("classifies restore success only when premium entitlement is active", () => {
    const restored = buildRestorePurchasesResult(
      mapRevenueCatCustomerInfoToSubscription({
        customerId: "customer-1",
        activeEntitlements: [revenueCatPremiumEntitlementId],
        productId: "annual_subscription",
      }),
    );

    expect(restored.status).toBe("restored");
    expect(restored.message).toBe("Purchases restored. Premium is active.");
    expect(restored.subscription?.isPremium).toBe(true);
  });

  it("classifies completed restore without entitlement as no active purchase", () => {
    const restored = buildRestorePurchasesResult(
      mapRevenueCatCustomerInfoToSubscription({
        customerId: "customer-1",
        activeEntitlements: [],
      }),
    );

    expect(restored.status).toBe("no_active_purchase");
    expect(restored.message).toBe("No active purchase was found for this Apple ID / Google account.");
    expect(restored.subscription?.isPremium).toBe(false);
    expect(canAccess(restored.subscription!, "premium_programmes")).toBe(false);
  });

  it("uses calm copy for restore failures", () => {
    expect(buildRestorePurchasesFailureResult()).toEqual({
      status: "failed",
      message: "We couldn’t restore purchases right now. Please try again.",
    });
  });

  it("selects monthly and annual packages from available offerings", () => {
    const selected = chooseBillingPackages([
      { id: "lifetime", title: "Lifetime", priceLabel: "$199.99", productId: "lifetime" },
      { id: "annual", title: "Annual", priceLabel: "$79.99/yr", productId: "annual_subscription" },
      { id: "monthly", title: "Monthly", priceLabel: "$9.99/mo", productId: "subscription_monthly_1" },
    ]);

    expect(selected.map((pack) => pack.id)).toEqual(["monthly", "annual"]);
  });

  it("does not invent customer-facing packages when live offerings are unavailable", () => {
    expect(chooseBillingPackages([])).toEqual([]);
  });

  it("can use explicit mock packages outside production RevenueCat pricing", () => {
    expect(chooseBillingPackages([], subscriptionPackages)).toEqual(subscriptionPackages);
  });

  it("normalizes purchase cancellation and configuration errors", () => {
    expect(normalizeBillingError({ code: "PURCHASE_CANCELLED_ERROR" })).toBe("Purchase cancelled. No charge was made.");
    expect(normalizeBillingError(new Error("RevenueCat API key is missing"))).toContain("Billing is not configured");
    expect(normalizeBillingError(new Error("RevenueCat package not available"))).toContain("Subscription products");
  });

  it("normalizes Android acknowledgement and already-owned purchase errors to restore guidance", () => {
    expect(normalizeBillingError(new Error("The developer needs to acknowledge your purchase."))).toBe(
      "Google Play is still finishing this purchase. Tap Restore Purchases to refresh access.",
    );
    expect(normalizeBillingError({ code: "ITEM_ALREADY_OWNED" })).toBe(
      "Google Play is still finishing this purchase. Tap Restore Purchases to refresh access.",
    );
  });
});
