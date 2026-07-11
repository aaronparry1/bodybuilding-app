import { jsonStore } from "@/data/local/json-store";
import { normalizeSubscriptionState, type SubscriptionState } from "@/application/billing/subscription";

export const subscriptionCacheKey = "adaptive-strength.subscription-cache";

const defaultCachedSubscription: SubscriptionState = {
  status: "free",
  provider: "mock",
  willRenew: false,
  restoreAvailable: true,
};

export function cacheSubscription(subscription: SubscriptionState): SubscriptionState {
  const normalized = normalizeSubscriptionState({
    ...subscription,
    isOfflineEntitlementCache: false,
    lastSyncedAt: subscription.lastSyncedAt ?? new Date().toISOString(),
  });
  jsonStore.set(subscriptionCacheKey, normalized);
  return normalized;
}

export function getCachedSubscription(): SubscriptionState {
  return normalizeSubscriptionState(jsonStore.get<SubscriptionState>(subscriptionCacheKey, defaultCachedSubscription));
}

export function getOfflineEntitlementFallback(now = new Date()): SubscriptionState | null {
  const cached = getCachedSubscription();
  if (!cached.isPremium) return null;

  if (cached.expiresAt && Number.isFinite(Date.parse(cached.expiresAt)) && new Date(cached.expiresAt) < now) {
    return null;
  }

  return normalizeSubscriptionState({
    ...cached,
    entitlementStatus: "offline_cached",
    isOfflineEntitlementCache: true,
    restoreAvailable: true,
  });
}
