import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildRestorePurchasesFailureResult, buildRestorePurchasesResult, mapRevenueCatCustomerInfoToSubscription } from "@/application/billing/subscription";

const gatewaySource = () => readFileSync("src/application/billing/revenuecat-gateway.ts", "utf8");
const contextSource = () => readFileSync("src/application/billing/subscription-context.tsx", "utf8");
const paywallSource = () => readFileSync("app/(protected)/paywall.tsx", "utf8");

describe("subscription restore and startup recovery", () => {
  it("maps active trial entitlement as premium access", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "app-user-1",
      activeEntitlements: ["premium"],
      entitlementPeriodType: "TRIAL",
      latestExpirationDate: "2026-07-01T00:00:00.000Z",
      productId: "subscription_monthly_1",
    });

    expect(subscription.status).toBe("trial");
    expect(subscription.isTrialActive).toBe(true);
    expect(subscription.isPremium).toBe(true);
  });

  it("maps active paid subscription as premium access on app launch", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "app-user-1",
      activeEntitlements: ["premium"],
      entitlementPeriodType: "NORMAL",
      latestExpirationDate: "2026-07-18T00:00:00.000Z",
      productId: "annual_subscription",
    });

    expect(subscription.status).toBe("active");
    expect(subscription.isTrialActive).toBe(false);
    expect(subscription.isPremium).toBe(true);
  });

  it("restorePurchases with active entitlement unlocks premium immediately", () => {
    const subscription = mapRevenueCatCustomerInfoToSubscription({
      customerId: "app-user-1",
      activeEntitlements: ["premium"],
      productId: "annual_subscription",
    });

    const result = buildRestorePurchasesResult(subscription);

    expect(result.status).toBe("restored");
    expect(result.subscription?.isPremium).toBe(true);
  });

  it("restore failure copy stays customer-safe", () => {
    expect(buildRestorePurchasesFailureResult()).toEqual({
      status: "failed",
      message: "We couldn’t restore purchases right now. Please try again.",
    });
  });

  it("RevenueCat identifyUser returns mapped CustomerInfo instead of discarding it", () => {
    const source = gatewaySource();

    expect(source).toContain("async identifyUser(userId: string | null): Promise<SubscriptionState | null>");
    expect(source).toContain("const result = await purchases.logIn(userId);");
    expect(source).toContain("const subscription = mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(result.customerInfo");
    expect(source).toContain("return this.recoverAndroidEntitlement(subscription);");
    expect(source).not.toContain("async identifyUser(userId: string | null): Promise<void>");
  });

  it("RevenueCat can sync Android store purchases after identity or restore misses entitlement", () => {
    const source = gatewaySource();

    expect(source).toContain("async syncPurchases(): Promise<SubscriptionState>");
    expect(source).toContain("await purchases.syncPurchasesForResult()");
    expect(source).toContain("private async recoverAndroidEntitlement(subscription: SubscriptionState)");
    expect(source).toContain("if (Platform.OS !== \"android\" || subscription.isPremium) return subscription;");
    expect(source).toContain("return this.recoverAndroidEntitlement(subscription);");
  });

  it("Android already-owned or acknowledgement purchase errors attempt store sync before failing", () => {
    const source = gatewaySource();

    expect(source).toContain("isRecoverableAndroidPurchaseError(error)");
    expect(source).toContain("const synced = await this.syncPurchases();");
    expect(source).toContain("if (synced.isPremium) return synced;");
    expect(source).toContain("text.includes(\"acknowledge\")");
    expect(source).toContain("text.includes(\"already owned\")");
  });

  it("SubscriptionProvider applies and caches identify state without overwriting it with a second refresh", () => {
    const source = contextSource();

    expect(source).toContain("const { user, isLoading: authLoading } = useAuth();");
    expect(source).toContain("if (authLoading) return undefined;");
    expect(source).toContain("const identifiedSubscription = await gateway.current.identifyUser(user.id) ?? await gateway.current.getSubscription();");
    expect(source).toContain("setSubscription(cacheSubscription(identifiedSubscription));");
    expect(source).toContain("await loadPackages();");
    expect(source).toContain("setIsLoading(false);");
    expect(source.indexOf("setSubscription(cacheSubscription(identifiedSubscription));")).toBeLessThan(source.indexOf("await loadPackages();"));
    expect(source.indexOf("await loadPackages();")).toBeLessThan(source.indexOf("logBillingStage(\"identified user and loaded subscription packages\")"));
    const identifyBranch = source.slice(source.indexOf("const identifiedSubscription = await gateway.current.identifyUser(user.id) ?? await gateway.current.getSubscription();"), source.indexOf("logBillingStage(\"identified user and loaded subscription packages\")"));
    expect(identifyBranch).not.toContain("await refreshSubscription();");
  });

  it("authenticated startup falls back to a direct CustomerInfo refresh if identify returns no state", () => {
    const source = contextSource();

    expect(source).toContain("const identifiedSubscription = await gateway.current.identifyUser(user.id) ?? await gateway.current.getSubscription();");
  });

  it("anonymous startup still refreshes CustomerInfo so account creation is not required", () => {
    const source = contextSource();

    expect(source).toContain("await refreshSubscription();");
    expect(source.indexOf("await refreshSubscription();", source.indexOf("if (user?.id && gateway.current.identifyUser"))).toBeGreaterThan(-1);
  });

  it("restore failure path preserves cached premium fallback when available", () => {
    const source = contextSource();

    expect(source).toContain("const cachedSubscription = getOfflineEntitlementFallback();");
    expect(source).toContain("if (cachedSubscription) {");
    expect(source).toContain("setSubscription(cachedSubscription);");
    expect(source.indexOf("const cachedSubscription = getOfflineEntitlementFallback();", source.indexOf("const restorePurchases"))).toBeGreaterThan(-1);
  });

  it("startup refresh failure preserves cached premium fallback instead of forcing free", () => {
    const source = contextSource();
    const refreshBranch = source.slice(source.indexOf("const refreshSubscription = useCallback"), source.indexOf("useEffect(() => {", source.indexOf("const refreshSubscription = useCallback")));

    expect(refreshBranch).toContain("const cachedSubscription = getOfflineEntitlementFallback();");
    expect(refreshBranch).toContain("if (cachedSubscription) {");
    expect(refreshBranch).toContain("setSubscription(cachedSubscription);");
    expect(refreshBranch).not.toContain("setSubscription(defaultSubscription)");
  });

  it("stale free cache can be replaced by active entitlement after identify or restore", () => {
    const staleFree = mapRevenueCatCustomerInfoToSubscription({
      customerId: "anonymous-user",
      activeEntitlements: [],
    });
    const active = mapRevenueCatCustomerInfoToSubscription({
      customerId: "app-user-1",
      activeEntitlements: ["premium"],
      productId: "subscription_monthly_1",
      latestExpirationDate: "2026-07-01T00:00:00.000Z",
    });

    expect(staleFree.isPremium).toBe(false);
    expect(active.isPremium).toBe(true);
    expect(active.status).toBe("active");
  });

  it("paywall avoids scary customer-facing error panels for billing refresh issues", () => {
    const source = paywallSource();

    expect(source).toContain("{safeError ? <InlinePlanStatus message={safeError} /> : null}");
    expect(source).not.toContain("{safeError ? <ErrorState message={safeError} /> : null}");
    expect(source).not.toContain("RevenueCat");
    expect(source.toLowerCase()).not.toContain("entitlement");
  });
});
