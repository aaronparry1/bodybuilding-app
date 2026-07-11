# RevenueCat Restore Configuration Audit

Date: June 23, 2026

Scope: urgent restore-access audit for live App Store subscription/trial users. No EAS build was started. No coaching, workout-generation, feature, product-id, or entitlement-name changes were made.

## Executive Summary

Verdict: **C) both app code and RevenueCat/App Store configuration issue**.

The app-side emergency restore/startup patch is still required and appears directionally correct: RevenueCat `logIn`/identify now returns mapped `CustomerInfo`, restore applies mapped state immediately, and the app uses the configured entitlement id with a default of `premium`.

RevenueCat dashboard access was later available and revealed a dashboard-side blocker:

- the production iOS app exists and has the correct bundle id;
- the RevenueCat iOS public SDK key shown in the dashboard matches the local configured iOS key by hash comparison;
- the expected `premium` entitlement exists and has the live App Store products attached;
- the default offering contains the expected monthly and yearly packages;
- but the iOS app configuration says **Credentials need attention** under the required in-app purchase key configuration;
- App Store Connect API key configuration is missing;
- RevenueCat cannot check App Store product status for the live iOS products;
- RevenueCat shows **0 active trials** and **0 active subscribers** for this project;
- the active subscription customer list is empty.

Most likely causes, in priority order:

1. RevenueCat iOS App Store credentials are incomplete/invalid, so RevenueCat is not recording or validating App Store subscription transactions correctly.
2. The emergency app code fix is still required because the shipped app can leave users in stale/free state after RevenueCat identify/login.
3. EAS production build could still use a wrong/missing SDK key, but this was not confirmed because EAS CLI env listing hangs locally.
4. A customer-specific anonymous/app-user alias issue may exist, but restore transfer behavior is permissive, so this is less likely than the iOS credential problem.

## RevenueCat Dashboard Findings

Dashboard status: **accessible after login**.

RevenueCat project:

```text
Adaptive Strength Coach
Project ID: 025ec985 / proj025ec985
```

Project/app findings:

| Area | Required value | Status |
| --- | --- | --- |
| RevenueCat project | Adaptive Strength Coach production project | Confirmed |
| iOS app exists | Yes | Confirmed |
| iOS bundle id | `com.aaronparry.adaptivestrengthcoach` | Confirmed |
| Android app exists | Yes | Confirmed |
| Android package id | `com.aaronparry.adaptivestrengthcoach` | Confirmed |
| iOS public SDK key | Must match configured iOS key | Matches local `.env.local` by hash comparison |
| Old/staging app not used | Production app identity should be used | No wrong bundle/package seen in the RevenueCat project |

iOS App Store credential findings:

| Item | Dashboard state |
| --- | --- |
| In-app purchase key configuration | **Credentials need attention** |
| App Store Connect API key | Required, but no `.p8` file uploaded |
| Apple server notifications | No notifications received |
| Track new purchases from server-to-server notifications | Not enabled |
| iOS product store status | `Could not check` on both live iOS products |

This is a likely root cause for the live restore/subscription-access failure.

Operational follow-up on June 23, 2026:

- Existing in-app purchase key validation was retried from RevenueCat and still showed **Credentials need attention**.
- A local App Store Connect private key file exists at:

```text
/Users/aaronparry/Downloads/AuthKey_ZZP36M6F5R.p8
```

- Likely Key ID from filename:

```text
ZZP36M6F5R
```

- RevenueCat currently shows Issuer ID:

```text
f657faac-5437-4b78-8c0a-8f2369947cfe
```

- The in-app browser automation surface can see the RevenueCat hidden file inputs but does not expose a safe file-upload API for attaching the `.p8` file. Manual upload is still required.
- RevenueCat status also reports an App Store Connect outage/degraded performance on June 23, 2026. Their incident text says dashboard/App Store Connect API operations may be affected, but purchases are not impacted. This can explain temporary `Store Status: Could not check`, but it does not remove the need to fix the missing/invalid credentials.

Manual RevenueCat credential steps:

1. On the RevenueCat iOS app page, upload `/Users/aaronparry/Downloads/AuthKey_ZZP36M6F5R.p8` to **In-app purchase key configuration** if replacing the invalid key.
2. Set Key ID to `ZZP36M6F5R`.
3. Keep Issuer ID as `f657faac-5437-4b78-8c0a-8f2369947cfe` if it matches App Store Connect.
4. Upload the same `.p8` file to **App Store Connect API** if that key has the required App Store Connect API access.
5. Save changes.
6. Re-validate once RevenueCat/App Store Connect status has recovered if validation still fails during the incident.

## Entitlement Audit

App code expects:

```text
premium
```

Code/config findings:

- `src/application/billing/subscription.ts` defines `revenueCatPremiumEntitlementId = "premium"`.
- `app.config.ts` exposes `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`, defaulting to `premium`.
- `src/application/billing/revenuecat-gateway.ts` now reads `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` / Expo extra and defaults to `premium`.
- `presentPaywallIfNeeded` uses the configured entitlement id.
- `mapNativeCustomerInfo` indexes `customerInfo.entitlements.active[premiumEntitlementId]`.
- `mapRevenueCatCustomerInfoToSubscription` checks active entitlement ids against the configured entitlement id.

Dashboard status:

- Entitlement existence: **confirmed**
- Exact spelling/casing: **confirmed: `premium`**
- Product attachment to entitlement: **confirmed**

Risk: there is also an older active entitlement named `Adaptive Strength Coach Pro`. The same live App Store products are attached to both `premium` and `Adaptive Strength Coach Pro`. Since the products are also attached to `premium`, this should still allow the app to unlock if RevenueCat receives/validates the App Store transaction. However, the duplicate entitlement is confusing and should be cleaned up later after the emergency is resolved.

## Product Audit

App code expects these product IDs:

```text
subscription_monthly_1
annual_subscription
```

Code/config findings:

- `src/application/billing/subscription.ts` defines:
  - `revenueCatMonthlyProductId = "subscription_monthly_1"`
  - `revenueCatAnnualProductId = "annual_subscription"`
- Mock/default package metadata uses those IDs.
- Tests assert those IDs.
- No stale `adaptive_strength_monthly` or `adaptive_strength_annual` product IDs were found in active billing code.

Dashboard/App Store status:

| Product | RevenueCat exists | Attached to `premium` | In active offering | App Store ID exact match |
| --- | --- | --- | --- | --- |
| `subscription_monthly_1` | Confirmed | Confirmed | Confirmed | Confirmed |
| `annual_subscription` | Confirmed | Confirmed | Confirmed | Confirmed |

Product detail pages show `Store Status: Could not check` for both iOS products. This lines up with the iOS app credential warning and means RevenueCat cannot currently verify the App Store product state from the dashboard.

## Offering Audit

App offering behavior:

- The app calls `purchases.getOfferings()`.
- It reads `offerings.current`.
- It maps RevenueCat package types:
  - `current.monthly` -> app package id `monthly`
  - `current.annual` -> app package id `yearly`
  - `current.lifetime` -> app package id `lifetime`, if present
- Purchase buttons call app package ids (`monthly` / `yearly`) and the gateway resolves those back to native RevenueCat packages from the current offering.

Required dashboard state:

| Offering item | Required mapping | Status |
| --- | --- | --- |
| Current/default offering | `default` | Confirmed |
| Monthly package | `subscription_monthly_1` | Confirmed |
| Annual package | `annual_subscription` | Confirmed |

The default offering has two packages:

- Monthly package `$rc_monthly` maps to App Store product `subscription_monthly_1`.
- Yearly package `$rc_annual` maps to App Store product `annual_subscription`.

The app reads `offerings.current.monthly` and `offerings.current.annual`, so this offering shape matches app expectations.

## Customer Audit

Affected customer status: **not inspected directly because no affected customer id was provided**.

Global customer/subscription findings:

- Project overview shows `Active Trials 0`.
- Project overview shows `Active Subscriptions 0`.
- `Active subscription` customer list shows:
  - Customers: `0`
  - Active Trials: `0`
  - Active Subscribers: `0`
- Product detail pages show no recent transactions for the iOS monthly/annual products.

If the affected user has a real active App Store trial/subscription, RevenueCat is not currently showing it as an active production subscription in this project.

Required RevenueCat customer checks:

- Find the affected App Store subscriber in RevenueCat by App User ID, alias, or transaction/customer search.
- Confirm whether there are separate anonymous and authenticated customer records.
- Confirm whether the active trial/subscription is attached to:
  - the old anonymous RevenueCat ID,
  - the current authenticated app user id,
  - a different app user id,
  - or no RevenueCat customer record.
- Confirm active entitlement id is exactly `premium`.
- Confirm product id is one of:
  - `subscription_monthly_1`
  - `annual_subscription`
- Confirm aliases include the current app user id after identify/login where expected.

Do not expose private customer details in issue reports. Record only whether active entitlement exists, which entitlement id is active, and whether anonymous/app-user mismatch exists.

## Restore Behavior Audit

Dashboard restore/transfer setting: **confirmed**.

Setting:

```text
Transferring purchases seen on multiple App User IDs:
Transfer to new App User ID
```

This is the permissive behavior needed for restore/login recovery. It makes a RevenueCat transfer-policy block less likely.

This setting can explain the live issue if:

- the original purchase is attached to an anonymous RevenueCat user created before login/update,
- the updated app identifies as a Supabase/app user id,
- Restore Purchases tries to recover the transaction for the current user,
- but RevenueCat transfer behavior blocks moving purchases between App User IDs.

Before build, confirm RevenueCat restore behavior allows the intended recovery path for App Store purchases. The desired outcome for this app is:

- an active App Store trial/subscription can be restored by the same Apple ID;
- the current app user receives the `premium` entitlement immediately;
- trial entitlements count as premium access;
- users do not need an app restart after restore.

## Code and Environment Cross-Check

### App identity

Production config in `app.config.ts` resolves to:

```text
iOS bundle id: com.aaronparry.adaptivestrengthcoach
Android package: com.aaronparry.adaptivestrengthcoach
```

`eas.json` production env also sets:

```text
APP_ENV=production
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach
```

### SDK key source

Runtime key selection in `src/application/billing/revenuecat-gateway.ts`:

- iOS uses `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` first.
- Android uses `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` first.
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` is only a fallback.
- Web does not use native RevenueCat.

Local `.env.local` check:

- iOS RevenueCat public key: present, RevenueCat-shaped, value not printed.
- Android RevenueCat public key: present, RevenueCat-shaped, value not printed.
- Explicit entitlement/product overrides: absent locally, so app defaults apply.

EAS production env check:

- Attempted `npx eas env:list --environment production`.
- The command hung silently in this local environment and was stopped.
- Production EAS env values are therefore **not confirmed by CLI**.

Required EAS confirmation before build:

| Variable | Required | Status |
| --- | --- | --- |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Present, production iOS `appl_...`, matches RevenueCat iOS app | Unconfirmed |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Present for Android builds | Unconfirmed |
| `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` | `premium` or omitted to use default | Unconfirmed |
| `APP_IOS_BUNDLE_IDENTIFIER` | `com.aaronparry.adaptivestrengthcoach` | Present in `eas.json`; EAS dashboard value unconfirmed |
| `APP_ENV` | `production` | Present in `eas.json`; EAS dashboard value unconfirmed |

### Startup identify flow

Emergency patch behavior:

- `SubscriptionProvider` waits until auth loading finishes.
- If an authenticated user exists and RevenueCat is configured, it calls `gateway.identifyUser(user.id)`.
- `RevenueCatGateway.identifyUser` calls `purchases.logIn(userId)`.
- The returned `CustomerInfo` is mapped to `SubscriptionState`.
- Identified subscription state is cached/applied immediately.
- The provider then refreshes subscription state.

This fixes the previously audited stale/free-state risk where RevenueCat identify returned active customer info but the app discarded it.

### Restore flow

Emergency patch behavior:

- `restorePurchases()` calls RevenueCat restore.
- Returned `CustomerInfo` is mapped to subscription state.
- If active `premium` entitlement exists, premium unlocks immediately.
- If restore throws, the app returns calm restore failure copy and preserves any recent cached premium fallback.

### Customer-facing warnings

The paywall no longer uses the large red error panel for non-actionable billing refresh issues. Remaining risk: other surfaces may still show customer-safe online-services copy for Supabase/cloud sync. That copy is not a RevenueCat dashboard proof.

## Exact Mismatch Found

Confirmed RevenueCat dashboard/config issues:

1. The iOS app's required in-app purchase key configuration says **Credentials need attention**.
2. App Store Connect API key configuration is missing.
3. iOS product store status cannot be checked by RevenueCat.
4. RevenueCat shows zero active trials/subscribers despite a report of an active App Store trial/subscription.
5. The active subscription customer list is empty.
6. Duplicate active entitlement exists: `Adaptive Strength Coach Pro` alongside the intended `premium`.

Confirmed code-side status:

- Product IDs in billing code match the required IDs.
- Entitlement id in billing code/config defaults to `premium`.
- iOS/Android SDK key selection is platform-specific.
- No active billing code path was found using the old placeholder product ids.

Still unconfirmed:

- production EAS iOS SDK key belongs to the correct RevenueCat app, because EAS env CLI hangs locally
- affected customer's exact RevenueCat record, aliases, and entitlement state
- whether the affected purchase is production or sandbox/TestFlight

## Is the Emergency Code Patch Still Required?

Yes.

Even if RevenueCat dashboard config is correct, the previous app build can still leave users in stale/free state after update/login because identify returned `CustomerInfo` was discarded and state was not refreshed after login. The emergency patch should be shipped after configuration is confirmed and build verification passes or an explicit emergency waiver is accepted.

## Must RevenueCat Config Be Fixed Before Build?

Yes.

Fix RevenueCat/App Store configuration before building:

1. Upload/fix the required in-app purchase key configuration for the iOS app.
2. Upload/configure the App Store Connect API key in RevenueCat.
3. Validate credentials until the dashboard no longer says **Credentials need attention**.
4. Confirm both iOS products no longer say `Store Status: Could not check`.
5. Confirm an affected customer's App Store transaction appears in RevenueCat with active `premium`.
6. Confirm EAS production `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` matches the RevenueCat iOS app public key.
7. Leave the duplicate entitlement alone during the emergency unless RevenueCat support says it is causing entitlement ambiguity; clean it up later only after confirming no customers depend on it.

## Is an EAS Build Safe?

Not yet.

Build safety requires either:

1. RevenueCat iOS credentials are fixed and validated;
2. at least one affected/real transaction appears in RevenueCat as active `premium`;
3. EAS production iOS SDK key is confirmed;
4. blocked local verification is run on a clean machine/CI, or Aaron explicitly accepts an emergency waiver because live subscribers are locked out and `npm test` is green.

## Final Verdict

**C) both app code and RevenueCat/App Store configuration issue.**

Reason: the emergency app code patch fixes a real stale/free-state bug, but the RevenueCat dashboard also has a live iOS configuration problem. The immediate next step is to fix and validate RevenueCat iOS App Store credentials, then confirm the affected customer shows an active `premium` entitlement before starting an EAS build.
