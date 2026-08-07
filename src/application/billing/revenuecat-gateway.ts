import Constants from "expo-constants";
import { Platform } from "react-native";
import type { PAYWALL_RESULT } from "react-native-purchases-ui";
import type {
  RevenueCatCustomerInfo,
  RevenueCatPackage,
  SubscriptionGateway,
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

  async identifyUser(userId: string | null): Promise<SubscriptionState | null> {
    return this.runSafely(async () => {
      const purchases = await this.getConfiguredPurchases();
      if (userId) {
        const result = await purchases.logIn(userId);
        const subscription = mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(result.customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
        return this.recoverAndroidEntitlement(subscription);
      }
      if (await purchases.isAnonymous()) return this.getSubscription();
      const customerInfo = await purchases.logOut();
      return mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(customerInfo, this.premiumEntitlementId), this.premiumEntitlementId);
    });
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

    const module = await import("react-native-purchases");
    const purchases = module.default;
    if (!purchases?.configure) {
      throw new Error("RevenueCat native module is unavailable in this build.");
    }

    purchases.configure({ apiKey: this.apiKey });
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
