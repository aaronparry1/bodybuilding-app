import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { createSubscriptionGateway } from "@/application/billing/billing-gateway";
import { MockRevenueCatGateway } from "@/application/billing/mock-revenuecat";
import { restoreCloudDataForUser, syncLocalDataForUser } from "@/application/sync/cloud-data-sync";
import { cacheSubscription, getCachedSubscription, getOfflineEntitlementFallback } from "@/application/billing/subscription-cache";
import {
  canAccess,
  buildRestorePurchasesFailureResult,
  buildRestorePurchasesResult,
  chooseBillingPackages,
  getEntitlement,
  getPlanLabel,
  normalizeSubscriptionState,
  normalizeBillingError,
  subscriptionPackages,
  type EntitlementContext,
  type EntitlementKey,
  type EntitlementResult,
  type RevenueCatPackage,
  type RestorePurchasesResult,
  type RestorePurchasesStatus,
  type SubscriptionGateway,
  type SubscriptionState,
  type SubscriptionStatus,
} from "@/application/billing/subscription";

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  packages: RevenueCatPackage[];
  planLabel: string;
  provider: SubscriptionState["provider"];
  isRevenueCatConfigured: boolean;
  isPremium: boolean;
  isTrialActive: boolean;
  trialEndsAt?: string;
  entitlementStatus: NonNullable<SubscriptionState["entitlementStatus"]>;
  purchasePending: boolean;
  restoreAvailable: boolean;
  refreshSubscription(): Promise<void>;
  entitlement(entitlement: EntitlementKey, context?: EntitlementContext): EntitlementResult;
  canAccess(entitlement: EntitlementKey, context?: EntitlementContext): boolean;
  purchasePackage(packageId: RevenueCatPackage["id"]): Promise<void>;
  restorePurchases(): Promise<RestorePurchasesResult>;
  restoreStatus: RestorePurchasesStatus;
  restoreMessage: string | null;
  dataHydrationStatus: "idle" | "restoring" | "ready" | "error";
  dataHydrationError: string | null;
  retryDataHydration(): void;
  presentPaywall(): Promise<void>;
  presentCustomerCenter(): Promise<void>;
  setMockStatus(status: SubscriptionStatus): Promise<void>;
}

const defaultSubscription: SubscriptionState = normalizeSubscriptionState({ status: "free", provider: "mock", willRenew: false });
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function logBillingStage(stage: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[startup:billing] ${stage}`);
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const fallbackGateway = useRef<SubscriptionGateway>(new MockRevenueCatGateway());
  const gateway = useRef<SubscriptionGateway>(fallbackGateway.current);
  const [subscription, setSubscription] = useState<SubscriptionState>(() => getCachedSubscription() ?? defaultSubscription);
  const [packages, setPackages] = useState<RevenueCatPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevenueCatConfigured, setIsRevenueCatConfigured] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<RestorePurchasesStatus>("idle");
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [dataHydrationStatus, setDataHydrationStatus] = useState<SubscriptionContextValue["dataHydrationStatus"]>("idle");
  const [dataHydrationError, setDataHydrationError] = useState<string | null>(null);
  const [dataHydrationAttempt, setDataHydrationAttempt] = useState(0);
  const lastRestoredUserId = useRef<string | null>(null);
  const subscriptionRef = useRef(subscription);

  useEffect(() => {
    subscriptionRef.current = subscription;
  }, [subscription]);

  useEffect(() => {
    try {
      const nextGateway = createSubscriptionGateway();
      gateway.current = nextGateway;
      const revenueCatReady = nextGateway.getProvider?.() === "revenuecat" && nextGateway.isConfigured();
      setIsRevenueCatConfigured(revenueCatReady);
      if (revenueCatReady) {
        setSubscription((currentSubscription) => normalizeSubscriptionState({
          ...currentSubscription,
          provider: "revenuecat",
        }));
      }
      logBillingStage(`gateway ready: ${nextGateway.getProvider?.() ?? "unknown"}`);
    } catch (nextError) {
      gateway.current = fallbackGateway.current;
      setIsRevenueCatConfigured(false);
      setError(normalizeBillingError(nextError));
      logBillingStage("gateway fallback: mock");
    }
  }, []);

  const loadPackages = useCallback(async () => {
    const fallbackPackages = gateway.current.getProvider?.() === "mock" ? subscriptionPackages : [];
    const nextPackages = await gateway.current.getOfferings().catch(() => fallbackPackages);
    setPackages(chooseBillingPackages(nextPackages, fallbackPackages));
  }, []);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fallbackPackages = gateway.current.getProvider?.() === "mock" ? subscriptionPackages : [];
      const [nextPackages, nextSubscription] = await Promise.all([
        gateway.current.getOfferings().catch(() => fallbackPackages),
        gateway.current.getSubscription(),
      ]);
      setPackages(chooseBillingPackages(nextPackages, fallbackPackages));
      setSubscription(cacheSubscription(nextSubscription));
    } catch (nextError) {
      const cachedSubscription = getOfflineEntitlementFallback();
      if (cachedSubscription) {
        setSubscription(cachedSubscription);
        setError("Subscription status is using a recent cached entitlement. Check connection to refresh billing.");
      } else {
        setError(normalizeBillingError(nextError));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;

    let cancelled = false;

    async function syncSubscriptionIdentity() {
      if (user?.id && gateway.current.identifyUser && gateway.current.getProvider?.() === "revenuecat") {
        setIsLoading(true);
        setError(null);
        try {
          const identifiedSubscription = await gateway.current.identifyUser(user.id) ?? await gateway.current.getSubscription();
          if (cancelled) return;
          if (identifiedSubscription) {
            setSubscription(cacheSubscription(identifiedSubscription));
          }
          await loadPackages();
          if (cancelled) return;
          setIsLoading(false);
          logBillingStage("identified user and loaded subscription packages");
        } catch (nextError) {
          if (cancelled) return;
          const cachedSubscription = getOfflineEntitlementFallback();
          if (cachedSubscription) {
            setSubscription(cachedSubscription);
          }
          setError(normalizeBillingError(nextError));
          setIsLoading(false);
          logBillingStage("identify failed; revenuecat remains active");
        }
        return;
      }

      await refreshSubscription();
    }

    syncSubscriptionIdentity();

    return () => {
      cancelled = true;
    };
  }, [authLoading, loadPackages, refreshSubscription, user?.id]);

  useEffect(() => {
    if (authLoading) {
      setDataHydrationStatus("idle");
      setDataHydrationError(null);
      return;
    }
    if (!user?.id) {
      lastRestoredUserId.current = null;
      setDataHydrationStatus("ready");
      setDataHydrationError(null);
      return;
    }
    const restorationIdentity = `${user.id}:${dataHydrationAttempt}`;
    if (lastRestoredUserId.current === restorationIdentity) return;

    let cancelled = false;
    lastRestoredUserId.current = restorationIdentity;
    setDataHydrationStatus("restoring");
    setDataHydrationError(null);
    restoreCloudDataForUser(user.id)
      .then((restore) => {
        if (cancelled) return;
        if (restore.settingsReadStatus === "failed") {
          setDataHydrationStatus("error");
          setDataHydrationError("account_data_restore_failed");
          return;
        }
        setDataHydrationStatus("ready");
        if (restore.accountScopeBlocked) return;
        syncLocalDataForUser(user.id, subscriptionRef.current).catch((nextError) => {
          if (process.env.NODE_ENV !== "production") console.info("[sync] startup sync failed", nextError);
        });
      })
      .catch((nextError) => {
        if (cancelled) return;
        setDataHydrationStatus("error");
        setDataHydrationError(nextError instanceof Error ? nextError.message : "account_data_restore_failed");
        if (process.env.NODE_ENV !== "production") console.info("[sync] startup restore failed", nextError);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, dataHydrationAttempt, user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const subscriptionListener = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      syncLocalDataForUser(user.id, subscription).catch((nextError) => {
        if (process.env.NODE_ENV !== "production") {
          console.info("[sync] foreground sync failed", nextError);
        }
      });
    });

    return () => subscriptionListener.remove();
  }, [subscription, user?.id]);

  const runBillingAction = useCallback(
    async <T,>(
      action: (currentGateway: SubscriptionGateway) => Promise<T>,
      onSuccess: (result: T) => void,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await action(gateway.current);
        onSuccess(result);
      } catch (nextError) {
        const cachedSubscription = getOfflineEntitlementFallback();
        if (cachedSubscription) {
          setSubscription(cachedSubscription);
        }
        setError(normalizeBillingError(nextError));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const entitlement = useCallback(
    (nextEntitlement: EntitlementKey, context?: EntitlementContext) => getEntitlement(subscription, nextEntitlement, context),
    [subscription],
  );

  const canAccessEntitlement = useCallback(
    (nextEntitlement: EntitlementKey, context?: EntitlementContext) => canAccess(subscription, nextEntitlement, context),
    [subscription],
  );

  const purchasePackage = useCallback(
    async (packageId: RevenueCatPackage["id"]) => {
      await runBillingAction(
        async (currentGateway) => {
          const fallbackPackages = currentGateway.getProvider?.() === "mock" ? subscriptionPackages : [];
          const [nextPackages, nextSubscription] = await Promise.all([
            currentGateway.getOfferings().catch(() => fallbackPackages),
            currentGateway.purchasePackage(packageId),
          ]);
          return { fallbackPackages, nextPackages, nextSubscription };
        },
        ({ fallbackPackages, nextPackages, nextSubscription }) => {
          setPackages(chooseBillingPackages(nextPackages, fallbackPackages));
          setSubscription(cacheSubscription(nextSubscription));
        },
      );
    },
    [packages, runBillingAction],
  );

  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRestoreStatus("restoring");
    setRestoreMessage(null);
    try {
      const nextSubscription = cacheSubscription(await gateway.current.restorePurchases());
      setSubscription(nextSubscription);
      const result = buildRestorePurchasesResult(nextSubscription);
      setRestoreStatus(result.status);
      setRestoreMessage(result.message);
      return result;
    } catch (nextError) {
      const cachedSubscription = getOfflineEntitlementFallback();
      if (cachedSubscription) {
        setSubscription(cachedSubscription);
      }
      const result = buildRestorePurchasesFailureResult();
      setRestoreStatus(result.status);
      setRestoreMessage(result.message);
      setError(normalizeBillingError(nextError));
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const presentPaywall = useCallback(async () => {
    if (!gateway.current.presentPaywall) return;
    await runBillingAction(
      async (currentGateway) => currentGateway.presentPaywall?.() ?? null,
      (nextSubscription) => {
        if (nextSubscription) setSubscription(cacheSubscription(nextSubscription));
      },
    );
  }, [runBillingAction]);

  const presentCustomerCenter = useCallback(async () => {
    if (!gateway.current.presentCustomerCenter) return;
    await runBillingAction(
      async (currentGateway) => {
        await currentGateway.presentCustomerCenter?.();
        return currentGateway.getSubscription();
      },
      (nextSubscription) => setSubscription(cacheSubscription(nextSubscription)),
    );
  }, [runBillingAction]);

  const setMockStatus = useCallback(async (status: SubscriptionStatus) => {
    if (!gateway.current.setMockStatus) return;
    setSubscription(cacheSubscription(await gateway.current.setMockStatus(status)));
  }, []);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      isLoading,
      error,
      packages,
      planLabel: getPlanLabel(subscription),
      provider: subscription.provider,
      isRevenueCatConfigured,
      isPremium: Boolean(subscription.isPremium),
      isTrialActive: Boolean(subscription.isTrialActive),
      trialEndsAt: subscription.trialEndsAt,
      entitlementStatus: subscription.entitlementStatus ?? subscription.status,
      purchasePending: isLoading,
      restoreAvailable: subscription.restoreAvailable ?? true,
      restoreStatus,
      restoreMessage,
      dataHydrationStatus,
      dataHydrationError,
      retryDataHydration: () => setDataHydrationAttempt((attempt) => attempt + 1),
      refreshSubscription,
      entitlement,
      canAccess: canAccessEntitlement,
      purchasePackage,
      restorePurchases,
      presentPaywall,
      presentCustomerCenter,
      setMockStatus,
    }),
    [
      canAccessEntitlement,
      dataHydrationError,
      dataHydrationStatus,
      entitlement,
      error,
      isLoading,
      isRevenueCatConfigured,
      packages,
      refreshSubscription,
      restoreMessage,
      presentCustomerCenter,
      presentPaywall,
      purchasePackage,
      restorePurchases,
      restoreStatus,
      setMockStatus,
      subscription,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used inside SubscriptionProvider.");
  return context;
}
