import { MockRevenueCatGateway } from "@/application/billing/mock-revenuecat";
import { RevenueCatGateway } from "@/application/billing/revenuecat-gateway";
import type { SubscriptionGateway } from "@/application/billing/subscription";

export function createSubscriptionGateway(): SubscriptionGateway {
  const revenueCat = new RevenueCatGateway();
  return revenueCat.isConfigured() ? revenueCat : new MockRevenueCatGateway();
}
