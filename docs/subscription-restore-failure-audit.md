# Subscription Restore Failure Audit

Date: June 23, 2026

Scope: live-release blocker audit only. No app code was changed and no EAS build was started.

## Executive summary

Severity: **Critical / release blocker**.

A subscribed or trial user can be treated as free after updating the app because subscription identity and entitlement refresh are not sequenced safely.

The strongest code-level root cause is in `SubscriptionProvider`:

1. RevenueCat is configured and refreshed immediately.
2. The first refresh can run against the RevenueCat anonymous App User ID.
3. The app later calls `RevenueCatGateway.identifyUser(user.id)` when Supabase/auth user state becomes available.
4. That identify/login result is ignored.
5. The app does not refresh subscription state after RevenueCat login.
6. The UI continues reading the stale free subscription state.

This matches the observed symptom: a real subscriber/trial user updates the app, then premium access does not restore automatically.

Restore Purchases should still be able to recover the user if RevenueCat restore behavior and entitlement configuration are correct. If Restore Purchases also fails, the most likely additional causes are:

- RevenueCat dashboard entitlement is not exactly `premium` or products are not attached to it.
- RevenueCat restore behavior is blocking transfer from the old App User ID to the current App User ID.
- The purchase belongs to a different App Store account than the one currently signed in.
- The app is configured without the correct production RevenueCat iOS SDK key.
- The app maps only `premium` and ignores the configurable entitlement value from `app.config.ts`.

Because the current code has no production-safe RevenueCat trace logging, the app cannot currently answer from device logs whether RevenueCat returned an active entitlement, returned no entitlement, or threw during restore.

## Components audited

- `src/application/billing/revenuecat-gateway.ts`
- `src/application/billing/subscription-context.tsx`
- `src/application/billing/subscription.ts`
- `src/application/billing/subscription-cache.ts`
- `src/application/billing/billing-gateway.ts`
- `src/application/billing/premium-access.tsx`
- `app/(protected)/paywall.tsx`
- `app/(protected)/settings.tsx`
- `app/(protected)/(tabs)/account.tsx`
- `app/_layout.tsx`
- `app.config.ts`
- Existing billing tests
- RevenueCat restore/customer-info/customer-identification documentation

## What RevenueCat expects

RevenueCat states that `CustomerInfo` is the source of subscription status and can be retrieved with `getCustomerInfo()`. It is updated whenever a purchase or restore occurs and periodically during app lifecycle.

RevenueCat also states that if the SDK is configured without an App User ID, it creates an anonymous App User ID that is cached on device, and deleting/reinstalling clears that cache and creates a new anonymous ID. Custom App User IDs are what allow subscription status to be restored across reinstalls/devices without requiring the same anonymous cache.

RevenueCat's restore docs say `restorePurchases()` should be user-initiated and that if an already-attached purchase is restored to another user, transfer depends on the project's restore behavior.

Implication for this app: subscription initialization must either configure RevenueCat with the known app user ID, or it must call `logIn(user.id)` and immediately apply/refresh the returned `CustomerInfo` before premium gates rely on state.

## Current flow trace

### Startup

File: `src/application/billing/subscription-context.tsx`

1. Initial state is `getCachedSubscription() ?? defaultSubscription`.
2. `createSubscriptionGateway()` creates a `RevenueCatGateway` when a valid SDK key exists.
3. `refreshSubscription()` runs in a `useEffect` immediately after mount.
4. `refreshSubscription()` calls:
   - `gateway.current.getOfferings()`
   - `gateway.current.getSubscription()`
5. `getSubscription()` maps RevenueCat `CustomerInfo` to app `SubscriptionState`.
6. A separate effect later calls `gateway.current.identifyUser(user.id)` when `user?.id` is present.
7. That identify call does not update local subscription state and does not call `refreshSubscription()` afterward.

Failing component: **`SubscriptionProvider` startup/login entitlement sync**.

### RevenueCat SDK configuration

File: `src/application/billing/revenuecat-gateway.ts`

`getConfiguredPurchases()` calls:

```ts
purchases.configure({ apiKey: this.apiKey });
```

It does not pass `appUserID` at configuration time.

This means the first RevenueCat identity can be anonymous. If the user has an authenticated account, RevenueCat is only identified later through `identifyUser()`.

### Identify/login path

File: `src/application/billing/revenuecat-gateway.ts`

```ts
async identifyUser(userId: string | null): Promise<void> {
  ...
  if (userId) {
    await purchases.logIn(userId);
  }
}
```

RevenueCat `logIn()` returns updated customer information. The app discards it because the gateway method returns `void`.

File: `src/application/billing/subscription-context.tsx`

```ts
gateway.current.identifyUser(user.id).catch(...)
```

There is no `setSubscription(...)` and no `refreshSubscription()` after this call.

Failing component: **`RevenueCatGateway.identifyUser` + `SubscriptionProvider` identify effect**.

### Restore Purchases path

File: `src/application/billing/subscription-context.tsx`

`restorePurchases()` calls:

```ts
const nextSubscription = cacheSubscription(await gateway.current.restorePurchases());
setSubscription(nextSubscription);
```

File: `src/application/billing/revenuecat-gateway.ts`

```ts
return mapRevenueCatCustomerInfoToSubscription(mapNativeCustomerInfo(await purchases.restorePurchases()));
```

The code does fire `restorePurchases()` when the UI button is pressed. If RevenueCat returns active entitlement `premium`, state should update.

If Restore Purchases returns `CustomerInfo` with no active `premium`, the app correctly shows no active purchase and remains locked. If Restore throws, the app shows a restore failure.

The reported “Restore Purchases also fails” therefore points to one of these:

1. RevenueCat restore throws.
2. RevenueCat returns `CustomerInfo` but without the expected `premium` entitlement.
3. RevenueCat returns active entitlement under a different identifier, so the app maps it to free.
4. Restore is being attempted while the SDK is attached to a different/current App User ID and the dashboard restore behavior blocks transfer.
5. The app is using the wrong RevenueCat app/key for the live iOS build.

Without RevenueCat dashboard/device logs, the audit cannot prove which of those is happening in production.

## Entitlement mapping audit

File: `src/application/billing/subscription.ts`

The app maps premium like this:

```ts
const hasPremium = customerInfo.activeEntitlements.includes(revenueCatPremiumEntitlementId);
```

`revenueCatPremiumEntitlementId` is hardcoded:

```ts
export const revenueCatPremiumEntitlementId = "premium";
```

File: `app.config.ts`

The app exposes:

```ts
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID
```

But runtime mapping does not read that value. So the configuration suggests entitlement is configurable, but the runtime requires exactly `premium`.

File: `src/application/billing/revenuecat-gateway.ts`

`presentPaywallIfNeeded` is also hardcoded:

```ts
requiredEntitlementIdentifier: "premium"
```

`mapNativeCustomerInfo` also reads metadata from:

```ts
customerInfo.entitlements.active.premium
```

However, the active entitlement list is generic, so status can still be correct if the identifier is `premium`. Product metadata/trial period details can be blank if the entitlement identifier differs.

Risk: If RevenueCat dashboard entitlement is `pro`, `Premium`, `asc_premium`, or anything other than exact lowercase `premium`, paid users will be treated as free even if RevenueCat sees an active subscription.

## Cached subscription audit

File: `src/application/billing/subscription-cache.ts`

The app caches premium state and allows offline fallback only when:

- cached state is premium; and
- `expiresAt` is absent or in the future.

This helps users who previously had premium in the same local install.

But it does not help if:

- the app update cleared or changed local storage;
- the user installed fresh;
- the first post-update RevenueCat refresh cached `free`; or
- the prior cache was never written because the app failed to map entitlement as premium.

Affected users may lose premium access until RevenueCat restore or login synchronization succeeds.

## Paywall restore flow

File: `app/(protected)/paywall.tsx`

The paywall button calls `restorePurchases` from the subscription context. It displays restore feedback from `restoreStatus` and `restoreMessage`.

Potential issue: the restore button is disabled while `isLoading` is true. If startup refresh hangs or is slow, users may be blocked from pressing restore temporarily. This is secondary; it does not explain restore failure if the button can be pressed.

## Settings restore flow

File: `app/(protected)/settings.tsx`

Settings also calls the same central `restorePurchases` method and displays feedback.

There is no separate settings-specific restore implementation bug.

## Account restore flow

File: `app/(protected)/(tabs)/account.tsx`

Account also calls the same central `restorePurchases` method.

There is no separate account-specific restore implementation bug.

## PremiumAccess gating audit

File: `src/application/billing/premium-access.tsx`

`usePremiumAccess()` returns `isPremium` from `useSubscription()`.

So premium gating is only as correct as the central subscription state. If `SubscriptionProvider` remains stale/free, every premium gate will lock the user out.

Failing component: **central subscription state, not individual gates**.

## App update/install path

RevenueCat anonymous ID cache can change across reinstall, and custom App User IDs are required for reliable cross-device/reinstall restore. This app does eventually call `logIn(user.id)`, but not early enough and not in a way that updates local state.

Most likely app-update failure path:

1. User has active Apple subscription/trial.
2. App launches after update.
3. RevenueCat configures without `appUserID`.
4. `refreshSubscription()` reads anonymous/new/free CustomerInfo.
5. The app caches and displays free state.
6. Supabase session restoration completes.
7. App calls `Purchases.logIn(user.id)`.
8. Returned CustomerInfo is ignored.
9. UI continues reading stale/free state.
10. Premium user is treated as free.

## Direct answers

### Is RevenueCat returning an active entitlement?

Unknown from local code alone. The app currently lacks production-safe logs that record the active entitlement identifiers returned by RevenueCat.

If RevenueCat returns active `premium`, the current mapper would unlock access. If RevenueCat returns a different active entitlement id, the app will treat the user as free.

### Is `restorePurchases` firing?

Yes, code paths on Paywall, Settings, Account, and PremiumRequiredScreen all call the central `restorePurchases()` method. The gateway calls `purchases.restorePurchases()`.

### Is entitlement state updating afterwards?

For manual restore: yes, if `restorePurchases()` returns a mapped premium state.

For automatic app startup after RevenueCat login: **no**. The `identifyUser` result is ignored and no refresh is triggered afterwards.

### Is UI reading stale state?

Yes, this is likely. Premium gates read `subscription.isPremium` from central state. That state can remain stale/free after `logIn(user.id)`.

### Is premium user being treated as free?

Yes, that can happen when startup refresh runs against anonymous/free CustomerInfo and the later RevenueCat login does not update state.

### Is trial entitlement handled differently from paid entitlement?

The mapper treats both as premium if active entitlement `premium` is present. Trial is detected via `entitlementPeriodType === "trial"`. Trial and paid should both unlock access.

If trial users are locked out, the issue is likely missing/mismatched active entitlement or stale state, not trial-specific gating.

### Is app startup failing to sync purchases automatically?

Yes. Startup currently fetches subscription status, but it does not reliably sync after the app user identity is known. It also does not use `syncPurchases`, which RevenueCat documents as the programmatic alternative to user-initiated restore.

## Required code fix

Minimum urgent fix:

1. Change `SubscriptionGateway.identifyUser` to return `SubscriptionState | null` instead of `void`.
2. In `RevenueCatGateway.identifyUser`, map the `Purchases.logIn(...)` returned `CustomerInfo` into `SubscriptionState`.
3. In `SubscriptionProvider`, after identifying the user, immediately cache and set that returned subscription state.
4. If `logIn` returns no usable state, call `refreshSubscription()` after identify.
5. Ensure restore logs active entitlement identifiers in development/staging, and production-safe support logging can record only status and entitlement count without leaking secrets.
6. Read entitlement id from app config or remove the misleading config variable. If keeping config, use it consistently in:
   - `mapRevenueCatCustomerInfoToSubscription`
   - `presentPaywallIfNeeded`
   - `mapNativeCustomerInfo` metadata lookup
   - tests
7. Add tests for:
   - startup refresh returns free before auth user is restored, then RevenueCat login returns premium and unlocks.
   - `identifyUser` returned CustomerInfo updates `SubscriptionProvider` state.
   - restore with active configured entitlement unlocks premium.
   - restore with active non-configured entitlement remains locked but logs/configures clearly.
   - trial entitlement after app update remains premium.
   - cached free state is replaced by returned premium state after identify/restore.

Recommended production-safe fix:

- Prefer configuring RevenueCat with the known Supabase user ID once auth has restored, or delay the first RevenueCat subscription refresh until either auth loading is complete or the app has explicitly chosen anonymous mode.
- Do not let an early anonymous/free refresh become the final visible state for an authenticated user.
- If auth is unavailable/offline, use cached premium fallback when valid.

## Dashboard/manual checks required now

In RevenueCat dashboard:

1. Confirm iOS app is the production bundle `com.aaronparry.adaptivestrengthcoach`.
2. Confirm production iOS public SDK key in EAS is for that RevenueCat iOS app.
3. Confirm entitlement is exactly `premium`.
4. Confirm products `subscription_monthly_1` and `annual_subscription` are attached to `premium`.
5. Confirm current/default offering includes monthly/annual packages.
6. Confirm the affected customer has an active entitlement and inspect the App User ID it is attached to.
7. Confirm RevenueCat restore behavior. If purchases are attached to an old anonymous App User ID, current restore behavior may block transfer.
8. Confirm whether affected user purchased/trialed on the same Apple ID currently signed into the App Store.

On affected device/TestFlight/App Store build:

1. Launch app.
2. Capture RevenueCat customer id/current App User ID.
3. Call refresh subscription.
4. Capture active entitlement identifiers returned by `getCustomerInfo()`.
5. Tap Restore Purchases.
6. Capture whether restore throws or returns CustomerInfo.
7. Capture active entitlement identifiers after restore.

## Severity assessment

Severity: **Critical**.

Impact:

- Paying/trial users can be locked out of premium functionality.
- Restore may not recover access if entitlement/dashboard identity is mismatched.
- This directly affects revenue, support, App Review confidence, and user trust.

Blast radius:

- All premium gates that use `useSubscription().isPremium`.
- Train, Progress, reports, extra sessions, recovery/capacity, sharing, and any premium flow.

Likelihood:

- High for users with app/account identity transitions, app updates, reinstalls, or existing anonymous RevenueCat purchase records.
- Higher if RevenueCat dashboard entitlement is not exactly `premium`.

## Final root cause

Primary root cause: **RevenueCat identity synchronization is incomplete. The app logs into RevenueCat after auth user restoration but discards the returned CustomerInfo and does not refresh subscription state afterward.**

Secondary high-risk cause: **Runtime entitlement mapping is hardcoded to `premium` despite app config exposing a configurable entitlement id. Any dashboard mismatch causes active subscribers to map as free.**

## Release recommendation

Do not build until fixed.

Classification: **Release blocker**.

Required next step: implement the targeted subscription restore/startup fix and add focused tests before starting the next EAS build.
