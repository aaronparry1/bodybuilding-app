import { jsonStore } from "@/data/local/json-store";
import type {
  RevenueCatCustomerInfo,
  RevenueCatPackage,
  SubscriptionGateway,
  SubscriptionState,
  SubscriptionStatus,
} from "@/application/billing/subscription";

const subscriptionKey = "iron-logic.mock-subscription";

const defaultSubscription: SubscriptionState = {
  status: "free",
  provider: "mock",
  willRenew: false,
  restoreAvailable: true,
};

export function seedMockSubscriptionStatus(status: SubscriptionStatus): SubscriptionState {
  const nextState: SubscriptionState = {
    status,
    provider: "mock",
    customerId: "mock-customer",
    startedAt: new Date().toISOString(),
    expiresAt: status === "expired" ? new Date().toISOString() : undefined,
    trialEndsAt: status === "trial" ? addDays(14) : undefined,
    willRenew: status === "active" || status === "trial",
    restoreAvailable: true,
  };
  jsonStore.set(subscriptionKey, nextState);
  return nextState;
}

export class MockRevenueCatGateway implements SubscriptionGateway {
  isConfigured(): boolean {
    return true;
  }

  getProvider(): "mock" {
    return "mock";
  }

  async getOfferings(): Promise<RevenueCatPackage[]> {
    return [
      { id: "monthly", title: "Monthly", priceLabel: "£9.99", productId: "subscription_monthly_1", trialLabel: "14-day free trial" },
      { id: "annual", title: "Annual", priceLabel: "£99", productId: "annual_subscription", trialLabel: "14-day free trial" },
    ];
  }

  async getCustomerInfo(): Promise<RevenueCatCustomerInfo> {
    const subscription = await this.getSubscription();
    return {
      customerId: subscription.customerId ?? "mock-customer",
      activeEntitlements:
        subscription.status === "active" || subscription.status === "trial" || subscription.status === "lifetime"
          ? ["premium"]
          : [],
      latestExpirationDate: subscription.expiresAt,
    };
  }

  async getSubscription(): Promise<SubscriptionState> {
    return jsonStore.get<SubscriptionState>(subscriptionKey, defaultSubscription);
  }

  async purchasePackage(packageId: RevenueCatPackage["id"]): Promise<SubscriptionState> {
    const now = new Date().toISOString();
    const isLifetime = packageId === "lifetime";
    const isAnnual = packageId === "yearly" || packageId === "annual";
    const nextState: SubscriptionState = {
      status: isLifetime ? "lifetime" : "trial",
      provider: "mock",
      productId: packageId,
      customerId: "mock-customer",
      startedAt: now,
      expiresAt: isLifetime ? undefined : addDays(14),
      renewsAt: isLifetime ? undefined : addDays(isAnnual ? 365 : 30),
      trialEndsAt: isLifetime ? undefined : addDays(14),
      willRenew: !isLifetime,
      restoreAvailable: true,
    };
    jsonStore.set(subscriptionKey, nextState);
    return nextState;
  }

  async restorePurchases(): Promise<SubscriptionState> {
    return this.getSubscription();
  }

  async syncPurchases(): Promise<SubscriptionState> {
    return this.getSubscription();
  }

  async identifyUser(): Promise<SubscriptionState> {
    return this.getSubscription();
  }

  async setMockStatus(status: SubscriptionStatus): Promise<SubscriptionState> {
    return seedMockSubscriptionStatus(status);
  }
}

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
