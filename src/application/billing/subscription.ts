export type SubscriptionStatus =
  | "free"
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "lifetime";

export type EntitlementStatus = "free" | "trial" | "active" | "expired" | "cancelled" | "lifetime" | "offline_cached";
export type SubscriptionType = "none" | "monthly" | "annual" | "lifetime" | "unknown";

export type BillingProvider = "mock" | "revenuecat" | "app_store" | "play_store";

export interface SubscriptionState {
  status: SubscriptionStatus;
  provider: BillingProvider;
  isPremium?: boolean;
  isTrialActive?: boolean;
  trialEndsAt?: string;
  subscriptionType?: SubscriptionType;
  entitlementStatus?: EntitlementStatus;
  purchasePending?: boolean;
  restoreAvailable?: boolean;
  productId?: string;
  customerId?: string;
  startedAt?: string;
  expiresAt?: string;
  renewsAt?: string;
  willRenew?: boolean;
  entitlementIds?: string[];
  isSandbox?: boolean;
  lastSyncedAt?: string;
  isOfflineEntitlementCache?: boolean;
}

export type RestorePurchasesStatus = "idle" | "restoring" | "restored" | "no_active_purchase" | "failed";

export interface RestorePurchasesResult {
  status: Exclude<RestorePurchasesStatus, "idle" | "restoring">;
  message: string;
  subscription?: SubscriptionState;
}

export type EntitlementKey =
  | "workout_logging"
  | "custom_programmes"
  | "analytics"
  | "advanced_analytics"
  | "cloud_sync"
  | "unlimited_history"
  | "premium_programmes"
  | "future_wearables";

export interface EntitlementResult {
  allowed: boolean;
  limit?: number;
  reason?: string;
}

export interface EntitlementContext {
  customProgrammeCount?: number;
  historyDaysRequested?: number;
}

export const freeCustomProgrammeLimit = 3;
export const freeHistoryDaysLimit = 30;

export function isPremiumStatus(status: SubscriptionStatus): boolean {
  return status === "trial" || status === "active" || status === "lifetime";
}

export function isPremiumSubscription(subscription: SubscriptionState): boolean {
  return subscription.isPremium ?? isPremiumStatus(subscription.status);
}

export function inferSubscriptionType(productId?: string): SubscriptionType {
  const product = productId?.toLowerCase() ?? "";
  if (!product) return "none";
  if (product.includes("annual") || product.includes("yearly") || product.includes("year")) return "annual";
  if (product.includes("monthly") || product.includes("month")) return "monthly";
  if (product.includes("lifetime")) return "lifetime";
  return "unknown";
}

export function normalizeSubscriptionState(subscription: SubscriptionState): SubscriptionState {
  const isTrialActive = subscription.status === "trial";
  const isPremium = isPremiumStatus(subscription.status);
  const subscriptionType =
    subscription.subscriptionType ?? (subscription.status === "lifetime" ? "lifetime" : inferSubscriptionType(subscription.productId));
  const entitlementStatus =
    subscription.entitlementStatus ??
    (subscription.isOfflineEntitlementCache
      ? "offline_cached"
      : subscription.status);

  return {
    ...subscription,
    isPremium,
    isTrialActive,
    trialEndsAt: subscription.trialEndsAt ?? (isTrialActive ? subscription.expiresAt ?? subscription.renewsAt : undefined),
    subscriptionType,
    entitlementStatus,
    restoreAvailable: subscription.restoreAvailable ?? true,
  };
}

export function getPlanLabel(subscription: SubscriptionState): string {
  if (subscription.status === "lifetime") return "Lifetime";
  if (subscription.status === "trial") return "Trial";
  if (subscription.status === "active") return "Premium";
  if (subscription.status === "cancelled") return "Cancelled";
  if (subscription.status === "expired") return "Expired";
  return "Free";
}

export function getEntitlement(
  subscription: SubscriptionState,
  entitlement: EntitlementKey,
  context: EntitlementContext = {},
): EntitlementResult {
  const premium = isPremiumSubscription(subscription);

  if (entitlement === "workout_logging") return { allowed: true };

  if (premium) return { allowed: true };

  switch (entitlement) {
    case "custom_programmes": {
      const count = context.customProgrammeCount ?? 0;
      return {
        allowed: count < freeCustomProgrammeLimit,
        limit: freeCustomProgrammeLimit,
        reason: `Free plan includes ${freeCustomProgrammeLimit} custom programmes.`,
      };
    }
    case "analytics":
      return { allowed: true, reason: "Free plan includes an analytics preview." };
    case "unlimited_history": {
      const requestedDays = context.historyDaysRequested ?? freeHistoryDaysLimit;
      return {
        allowed: requestedDays <= freeHistoryDaysLimit,
        limit: freeHistoryDaysLimit,
        reason: `Free plan includes ${freeHistoryDaysLimit} days of workout history.`,
      };
    }
    case "advanced_analytics":
    case "cloud_sync":
    case "premium_programmes":
    case "future_wearables":
      return {
        allowed: false,
        reason: "Premium unlocks this feature.",
      };
    default:
      return { allowed: false, reason: "Unknown entitlement." };
  }
}

export function canAccess(subscription: SubscriptionState, entitlement: EntitlementKey, context?: EntitlementContext): boolean {
  return getEntitlement(subscription, entitlement, context).allowed;
}

export function buildRestorePurchasesResult(subscription: SubscriptionState): RestorePurchasesResult {
  if (isPremiumSubscription(subscription)) {
    return {
      status: "restored",
      message: "Purchases restored. Premium is active.",
      subscription,
    };
  }

  return {
    status: "no_active_purchase",
    message: "No active purchase was found for this Apple ID / Google account.",
    subscription,
  };
}

export function buildRestorePurchasesFailureResult(): RestorePurchasesResult {
  return {
    status: "failed",
    message: "We couldn’t restore purchases right now. Please try again.",
  };
}

export interface RevenueCatCustomerInfo {
  customerId: string;
  activeEntitlements: string[];
  latestExpirationDate?: string;
  entitlementPeriodType?: string;
  willRenew?: boolean;
  productId?: string;
  isSandbox?: boolean;
}

export interface RevenueCatPackage {
  id: "monthly" | "yearly" | "annual" | "lifetime" | "trial";
  title: string;
  priceLabel: string;
  productId: string;
  trialLabel?: string;
}

export interface RevenueCatApiKeyInput {
  platform: string;
  testKey?: string;
  iosKey?: string;
  androidKey?: string;
}

export interface SubscriptionGateway {
  isConfigured(): boolean;
  getProvider?(): BillingProvider;
  getOfferings(): Promise<RevenueCatPackage[]>;
  getCustomerInfo(): Promise<RevenueCatCustomerInfo>;
  getSubscription(): Promise<SubscriptionState>;
  purchasePackage(packageId: RevenueCatPackage["id"]): Promise<SubscriptionState>;
  restorePurchases(): Promise<SubscriptionState>;
  syncPurchases?(): Promise<SubscriptionState>;
  presentPaywall?(): Promise<SubscriptionState | null>;
  presentCustomerCenter?(): Promise<void>;
  identifyUser?(userId: string | null): Promise<SubscriptionState | null>;
  setMockStatus?(status: SubscriptionStatus): Promise<SubscriptionState>;
}

export const subscriptionPackages: RevenueCatPackage[] = [
  { id: "monthly", title: "Monthly", priceLabel: "£9.99", productId: "subscription_monthly_1", trialLabel: "14-day free trial" },
  { id: "annual", title: "Annual", priceLabel: "£99", productId: "annual_subscription", trialLabel: "14-day free trial" },
];

export const revenueCatPremiumEntitlementId = "premium";
export const revenueCatMonthlyProductId = "subscription_monthly_1";
export const revenueCatAnnualProductId = "annual_subscription";

export function isRevenueCatPublicKeyConfigured(apiKey?: string | null): boolean {
  const key = apiKey?.trim();
  return Boolean(
    key &&
      !key.endsWith("_placeholder") &&
      key !== "appl_placeholder" &&
      key !== "goog_placeholder" &&
      (key.startsWith("appl_") || key.startsWith("goog_") || key.startsWith("test_")),
  );
}

export function resolveRevenueCatApiKey({ platform, testKey, iosKey, androidKey }: RevenueCatApiKeyInput): string | null {
  const platformKey = platform === "ios" ? iosKey : platform === "android" ? androidKey : undefined;
  const key = (platformKey ?? testKey ?? "").trim();
  if (!isRevenueCatPublicKeyConfigured(key)) {
    return null;
  }

  return key;
}

export function chooseBillingPackages(
  packages: RevenueCatPackage[],
  fallback: RevenueCatPackage[] = [],
): RevenueCatPackage[] {
  const monthly = packages.find((pack) => pack.id === "monthly");
  const yearly = packages.find((pack) => pack.id === "yearly" || pack.id === "annual");

  if (!monthly && !yearly) return fallback;

  return [monthly, yearly].filter((pack): pack is RevenueCatPackage => Boolean(pack));
}

export function normalizeBillingError(error: unknown): string {
  const candidate = error as { code?: string; message?: string; userCancelled?: boolean } | undefined;
  const code = candidate?.code?.toLowerCase() ?? "";
  const message = candidate?.message ?? (error instanceof Error ? error.message : "");
  const lowerMessage = message.toLowerCase();

  if (candidate?.userCancelled || code.includes("cancel") || lowerMessage.includes("cancel")) {
    return "Purchase cancelled. No charge was made.";
  }

  if (lowerMessage.includes("no offering") || lowerMessage.includes("offering") || lowerMessage.includes("package not available")) {
    return "Subscription products are not available yet. Check the RevenueCat offering and product IDs.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("offline") || lowerMessage.includes("timed out")) {
    return "Billing network request failed. Check connection and try again.";
  }

  if (
    code.includes("already_owned") ||
    code.includes("already-owned") ||
    code.includes("alreadyowned") ||
    lowerMessage.includes("acknowledge") ||
    lowerMessage.includes("already owned") ||
    lowerMessage.includes("already_owned")
  ) {
    return "Google Play is still finishing this purchase. Tap Restore Purchases to refresh access.";
  }

  if (lowerMessage.includes("api key") || lowerMessage.includes("configuration") || lowerMessage.includes("configure")) {
    return "Billing is not configured for this build. Add the RevenueCat public SDK key.";
  }

  if (lowerMessage.includes("restore") || lowerMessage.includes("receipt")) {
    return "No active purchase was found to restore.";
  }

  return message || "Billing failed. Please try again.";
}

export function mapRevenueCatCustomerInfoToSubscription(
  customerInfo: RevenueCatCustomerInfo,
  premiumEntitlementId = revenueCatPremiumEntitlementId,
): SubscriptionState {
  const hasPremium = customerInfo.activeEntitlements.includes(premiumEntitlementId);
  const isTrial = hasPremium && customerInfo.entitlementPeriodType?.toLowerCase() === "trial";
  const isLifetime = hasPremium && !isTrial && !customerInfo.latestExpirationDate;

  return normalizeSubscriptionState({
    status: hasPremium ? (isLifetime ? "lifetime" : isTrial ? "trial" : "active") : "free",
    provider: "revenuecat",
    customerId: customerInfo.customerId,
    productId: customerInfo.productId,
    expiresAt: customerInfo.latestExpirationDate,
    renewsAt: customerInfo.latestExpirationDate,
    trialEndsAt: isTrial ? customerInfo.latestExpirationDate : undefined,
    willRenew: customerInfo.willRenew,
    entitlementIds: customerInfo.activeEntitlements,
    isSandbox: customerInfo.isSandbox,
    lastSyncedAt: new Date().toISOString(),
  });
}
