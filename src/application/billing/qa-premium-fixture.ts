import type { AppEnvironment } from "@/application/runtime/app-environment-core";
import { normalizeSubscriptionState, type SubscriptionState } from "@/application/billing/subscription";

export function isQaPremiumFixtureEnabled(environment: AppEnvironment, requested: unknown): boolean {
  return environment !== "production" && requested === true;
}

export function applyQaPremiumFixture(subscription: SubscriptionState, enabled: boolean): SubscriptionState {
  if (!enabled) return subscription;
  return normalizeSubscriptionState({
    ...subscription,
    status: "trial",
    provider: "mock",
    productId: "qa_premium_fixture_not_for_sale",
    entitlementIds: ["qa_premium_fixture"],
    willRenew: false,
    isSandbox: true,
  });
}
