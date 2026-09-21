import Constants from "expo-constants";
import { Platform } from "react-native";
import type { PAYWALL_RESULT } from "react-native-purchases-ui";
import type {
  RevenueCatCustomerInfo,
  RevenueCatPackage,
  SubscriptionGateway,
  SubscriberIdentityAttributes,
  SubscriptionState,
} from "@/application/billing/subscription";
import { mapRevenueCatCustomerInfoToSubscription, resolveRevenueCatApiKey } from "@/application/billing/subscription";

type PurchasesModule = typeof import("react-native-purchases").default;
type NativeCustomerInfo = import("react-native-purchases").CustomerInfo;
type NativePackage = import("react-native-purchases").PurchasesPackage;

interface RevenueCatExtra {
  revenueCatTestApiKey?: string;
  revenueCatIosApiKey?: string;
  revenueCatAndroidApiKey?: string;
  revenueCatEntitlementId?: string;
}

export function getRevenueCatApiKey(platform: typeof Platform.OS = Platform.OS): string | null {
  const extra = Constants.expoConfig?.extra as RevenueCatExtra | undefined;
  const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? extra?.revenueCatTestApiKey;
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? extra?.revenueCatIosApiKey;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? extra?.revenueCatAndroidApiKey;

  return resolveRevenueCatApiKey({ platform, testKey, iosKey, androidKey });
}

export class RevenueCatGateway implements SubscriptionGateway {
  private purchases: PurchasesModule | null = null;
  private configured = false;
  private configuring: Promise<PurchasesModule> | null = null;
  private identityQueue: Promise<unknown> = Promise.resolve();
  private lastIdentifiedUserId: string | null = null;
  private packages = new Map<RevenueCatPackage["id"], NativePackage>();

  constructor(
    private readonly apiKey = getRevenueCatApiKey(),
    private readonly premiumEntitlementId = getRevenueCatPremiumEntitlementId(),
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey) && Platform.OS !== "web";
  }

  getProvider(): "revenuecat" {
    return "revenuecat";
  }

  async getOfferings(): Promise<RevenueCatPackage[]> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      const offerings = await purchases.getOfferings();
      const current = offerings.current;
      if (!current) return [];

      const mapped = [
        current.monthly ? this.mapPackage("monthly", current.monthly) : null,
        current.annual ? this.mapPackage("yearly", current.annual) : null,
        current.lifetime ? this.mapPackage("lifetime", current.lifetime) : null,
      ].filter((pack): pack is RevenueCatPackage => Boolean(pack));

      if (mapped.length === 0) {
        throw new Error("RevenueCat offering not found or contains no monthly/yearly/lifetime packages.");
      }

      return mapped;
    });
  }

  async getCustomerInfo(): Promise<RevenueCatCustomerInfo> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      return mapNativeCustomerInfo(await purchases.getCustomerInfo(), this.premiumEntitlementId);
    });
  }

  async getSubscription(): Promise<SubscriptionState> {
    return mapRevenueCatCustomerInfoToSubscription(await this.getCustomerInfo(), this.premiumEntitlementId);
  }

  async purchasePackage(packageId: RevenueCatPackage["id"]): Promise<SubscriptionState> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      const pack = this.packages.get(packageId) ?? (await this.findNativePackage(packageId));
      if (!pack) throw new Error(`RevenueCat package not available: ${packageId}. Check the current offering.`);

      try {
        const result = await purchases.purchasePackage(pack);
        const subscription = mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(result.customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
        return this.recoverAndroidEntitlement(subscription);
      } catch (error) {
        if (isRecoverableAndroidPurchaseError(error)) {
          const synced = await this.syncPurchases();
          if (synced.isPremium) return synced;
        }
        throw error;
      }
    });
  }

  async restorePurchases(): Promise<SubscriptionState> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      const subscription = mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(await purchases.restorePurchases(), this.premiumEntitlementId), this.premiumEntitlementId);
      return this.recoverAndroidEntitlement(subscription);
    });
  }

  async syncPurchases(): Promise<SubscriptionState> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      const result = await purchases.syncPurchasesForResult();
      return mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(result.customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
    });
  }

  async presentPaywall(): Promise<SubscriptionState | null> {
    return this.runSafely(async () => {
      await this.getConfiguredPurchases();
      const module = await import("react-native-purchases-ui");
      const result = await module.default.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: this.premiumEntitlementId,
        displayCloseButton: true,
      });

      if (isSuccessfulPaywallResult(result)) {
        return this.getSubscription();
      }

      return null;
    });
  }

  async presentCustomerCenter(): Promise<void> {
    return this.runSafely(async () => {
      await this.getConfiguredPurchases();
      const module = await import("react-native-purchases-ui");
      await module.default.presentCustomerCenter();
    });
  }

  async identifyUser(userId: string | null, attributes: SubscriberIdentityAttributes = {}): Promise<SubscriptionState | null> {
    // Serialize login + attributes + logout so rapid auth changes cannot cross accounts.
    const operation = this.identityQueue.then(async () => {
      try {
        const purchases = await this.getConfiguredPurchases();
        if (!await purchases.isConfigured()) throw new Error("RevenueCat is not configured yet.");
        if (userId) {
          let customerInfo: NativeCustomerInfo;
          if (this.lastIdentifiedUserId !== userId) {
            const result = await purchases.logIn(userId);
            this.lastIdentifiedUserId = userId;
            customerInfo = result.customerInfo;
          } else {
            customerInfo = await purchases.getCustomerInfo();
          }
          try {
            await purchases.setEmail(attributes.email ?? "");
            if (attributes.displayName !== undefined) {
              await purchases.setDisplayName(attributes.displayName ?? "");
            }
          } catch (error) {
            // Optional customer metadata must not discard valid subscription state.
            console.warn("RevenueCat subscriber attributes could not be updated.", error);
          }
          const subscription = mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
          return this.recoverAndroidEntitlement(subscription);
        }
        let customerInfo: NativeCustomerInfo;
        // A failed logout can leave native identity uncertain; force the next login.
        this.lastIdentifiedUserId = null;
        try {
          customerInfo = await purchases.logOut();
        } catch (error) {
          // RevenueCat LOG_OUT_ANONYMOUS_USER_ERROR (SDK error code 22).
          if (String((error as { code?: unknown })?.code) !== "22") throw error;
          customerInfo = await purchases.getCustomerInfo();
        }
        return mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
      } catch (error) {
        console.warn("RevenueCat auth identity could not be synchronized.", error);
        throw error; // Caught by the subscription effect, independent of Supabase auth.
      }
    });
    this.identityQueue = operation.catch(() => undefined);
    return operation;
  }

  private async findNativePackage(packageId: RevenueCatPackage["id"]): Promise<NativePackage | null> {
    await this.getOfferings();
    return this.packages.get(packageId) ?? null;
  }

  private mapPackage(id: RevenueCatPackage["id"], pack: NativePackage): RevenueCatPackage {
    this.packages.set(id, pack);

    return {
      id,
      title: getPackageTitle(id),
      priceLabel: pack.product.priceString,
      productId: pack.product.identifier,
      trialLabel: pack.product.introPrice ? `${pack.product.introPrice.periodNumberOfUnits} ${pack.product.introPrice.periodUnit.toLowerCase()} trial` : undefined,
    };
  }

  private async getConfiguredPurchases(): Promise<PurchasesModule> {
    if (!this.apiKey) throw new Error("RevenueCat API key is missing. Using mock billing instead.");
    if (Platform.OS === "web") throw new Error("RevenueCat native SDK is unavailable on web. Using mock billing instead.");
    if (this.purchases && this.configured) return this.purchases;

    if (!this.configuring) {
      this.configuring = this.configurePurchases().finally(() => { this.configuring = null; });
    }
    return this.configuring;
  }

  private async configurePurchases(): Promise<PurchasesModule> {
    const module = await import("react-native-purchases");
    const purchases = module.default;
    if (!purchases?.configure) {
      throw new Error("RevenueCat native module is unavailable in this build.");
    }

    if (!await purchases.isConfigured()) {
      purchases.configure({ apiKey: this.apiKey! });
      this.lastIdentifiedUserId = null;
    }
    if (!await purchases.isConfigured()) throw new Error("RevenueCat configuration did not complete.");
    this.purchases = purchases;
    this.configured = true;
    return purchases;
  }

  private async runSafely<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.purchases = null;
      this.configured = false;
      throw error;
    }
  }

  private async recoverAndroidEntitlement(subscription: SubscriptionState): Promise<SubscriptionState> {
    if (Platform.OS !== "android" || subscription.isPremium) return subscription;

    try {
      const synced = await this.syncPurchases();
      return synced.isPremium ? synced : subscription;
    } catch {
      return subscription;
    }
  }
}

export function getRevenueCatPremiumEntitlementId(): string {
  const extra = Constants.expoConfig?.extra as RevenueCatExtra | undefined;
  return (process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? extra?.revenueCatEntitlementId ?? "premium").trim() || "premium";
}

function getPackageTitle(id: RevenueCatPackage["id"]): string {
  if (id === "yearly" || id === "annual") return "Annual";
  if (id === "lifetime") return "Lifetime";
  if (id === "trial") return "Trial";
  return "Monthly";
}

function isSuccessfulPaywallResult(result: PAYWALL_RESULT): boolean {
  return result === "PURCHASED" || result === "RESTORED" || result === "NOT_PRESENTED";
}

function isRecoverableAndroidPurchaseError(error: unknown): boolean {
  if (Platform.OS !== "android") return false;
  const candidate = error as { code?: string; message?: string } | undefined;
  const text = `${candidate?.code ?? ""} ${candidate?.message ?? (error instanceof Error ? error.message : "")}`.toLowerCase();
  return text.includes("already_owned") || text.includes("already owned") || text.includes("acknowledge") || text.includes("pending");
}

export function mapNativeCustomerInfo(customerInfo: NativeCustomerInfo, premiumEntitlementId = getRevenueCatPremiumEntitlementId()): RevenueCatCustomerInfo {
  const activeEntitlements = Object.values(customerInfo.entitlements.active);
  const premium = customerInfo.entitlements.active[premiumEntitlementId];

  return {
    customerId: customerInfo.originalAppUserId,
    activeEntitlements: activeEntitlements.map((entitlement) => entitlement.identifier),
    latestExpirationDate: customerInfo.latestExpirationDate ?? premium?.expirationDate ?? undefined,
    entitlementPeriodType: premium?.periodType,
    willRenew: premium?.willRenew,
    productId: premium?.productIdentifier,
    isSandbox: premium?.isSandbox,
  };
}
