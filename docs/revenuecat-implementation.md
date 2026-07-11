# RevenueCat Implementation

## Architecture

RevenueCat is the subscription and entitlement source of truth for Adaptive Strength Coach.

Supabase may mirror entitlement state later for support, diagnostics, or analytics, but Supabase must not become the billing authority. The app reads paid access from RevenueCat CustomerInfo and maps the active entitlement into the local subscription model.

Current billing layers:

- `src/application/billing/subscription.ts`: subscription types, entitlement mapping, product defaults, status normalization, and error normalization.
- `src/application/billing/revenuecat-gateway.ts`: native RevenueCat SDK adapter.
- `src/application/billing/mock-revenuecat.ts`: local/mock gateway for development, tests, and builds without public SDK keys.
- `src/application/billing/subscription-cache.ts`: cached entitlement fallback for temporary network/store outages.
- `src/application/billing/subscription-context.tsx`: app-wide subscription provider consumed by UI and services.
- `app/(protected)/paywall.tsx`: paywall and purchase/restore entry point.
- `app/(protected)/settings.tsx`: subscription status, restore, manage, and refresh controls.
- `app/(protected)/(tabs)/account.tsx`: account-level subscription controls and diagnostics.

## Entitlement Flow

RevenueCat entitlement:

```text
premium
```

The app treats `trial`, `active`, and `lifetime` subscription states as premium access.

CustomerInfo flow:

1. App starts inside `SubscriptionProvider`.
2. `createSubscriptionGateway()` chooses RevenueCat when a valid public SDK key is configured on native platforms.
3. The provider fetches RevenueCat offerings and CustomerInfo.
4. CustomerInfo active entitlements are mapped to `SubscriptionState`.
5. The normalized state is cached locally.
6. UI and services consume the central subscription context rather than calling RevenueCat directly.

If RevenueCat is unavailable but a non-expired premium entitlement is cached, the app uses `offline_cached` entitlement status temporarily.

## Product IDs

Launch products:

```text
subscription_monthly_1
annual_subscription
```

Store product metadata:

| Store | Monthly product | Monthly price | Monthly status | Annual product | Annual price | Annual status | Trial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Apple App Store | `subscription_monthly_1` | £9.99 | Waiting for Review | `annual_subscription` | £99 | Waiting for Review | Confirm in App Store Connect |
| Google Play | `subscription_monthly_1` | 11.99 | Active | `annual_subscription` | 109.99 | Active | 14 days |

The app does not hardcode final prices. RevenueCat and the stores control price display and trial eligibility.

Config values:

```text
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=subscription_monthly_1
EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID=annual_subscription
```

Public SDK keys:

```text
EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=test_...
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
```

Never ship a RevenueCat secret key in the app.

Key selection:

- iOS native builds use `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`.
- Android native builds use `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` is a fallback for development/Test Store scenarios when the platform key is not configured.
- Web does not use the native RevenueCat SDK and falls back to mock billing.
- Missing or placeholder keys keep the app in mock billing instead of crashing.

## Platform App Identity

RevenueCat platform apps and store products must align with the production app identifiers:

```text
iOS bundle ID: com.aaronparry.adaptivestrengthcoach
Android package name: com.aaronparry.adaptivestrengthcoach
```

Development and staging builds use separate identifiers:

```text
iOS staging: com.aaronparry.adaptivestrengthcoach.staging
Android staging: com.aaronparry.adaptivestrengthcoach.staging
iOS development: com.aaronparry.adaptivestrengthcoach.dev
Android development: com.aaronparry.adaptivestrengthcoach.dev
```

The RevenueCat entitlement remains `premium`, and the expected product IDs are `subscription_monthly_1` and `annual_subscription`.

## Trial Flow

The launch architecture supports:

```text
Onboarding -> plan generation/value preview -> Start Free Trial -> RevenueCat purchase flow
```

Trial length:

```text
14 days
```

The 14-day trial should be configured as a store/RevenueCat introductory offer on the monthly and/or annual product. The app does not model a separate fake trial product.

Trial state is mapped from RevenueCat entitlement period type:

- `TRIAL` -> `status: "trial"`
- active premium entitlement with normal period -> `status: "active"`
- missing premium entitlement -> `status: "free"`

## Purchase Flow

Purchase entry points:

- Paywall screen package buttons.
- Native RevenueCat paywall when configured.

The app sets `purchasePending` through the central provider loading state.

Successful purchases update:

- `isPremium`
- `isTrialActive`
- `trialEndsAt`
- `subscriptionType`
- `entitlementStatus`
- `expiresAt`
- `renewsAt`
- local entitlement cache

Cancelled purchases are normalized to:

```text
Purchase cancelled. No charge was made.
```

## Restore Flow

Restore entry points:

- Paywall screen.
- Settings subscription section.
- Account screen.

Restore calls `restorePurchases()` through the central subscription context. Successful restores update the same cached subscription state as purchases.

Restore failure is surfaced as a user-readable error and does not mutate training data.

## Manage Subscription

Settings and Account expose Manage Subscription through RevenueCat Customer Center when RevenueCat is configured.

If RevenueCat is not configured, the button is disabled and mock billing remains active for local/dev use.

## Offline Behaviour

Premium users should not immediately lose access because of a temporary outage.

Rules:

- A successful RevenueCat fetch, purchase, or restore caches normalized subscription state.
- If a later RevenueCat/store/network request fails, a non-expired cached premium entitlement can be used.
- Cached access is marked with `entitlementStatus: "offline_cached"`.
- Expired cached entitlements do not unlock premium access.
- Free/expired users do not gain premium from cache.

The app shows copy explaining that cached entitlement is temporary until RevenueCat refreshes.

## Store Configuration Notes

RevenueCat dashboard:

- Entitlement: `premium`
- Offering: current/default offering
- Monthly package -> `subscription_monthly_1`
- Annual package -> `annual_subscription`
- 14-day trial configured as store introductory offer where available

iOS:

- Configure product IDs in App Store Connect.
- Configure the RevenueCat iOS public SDK key as `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`.

Android:

- Configure product IDs in Google Play Console.
- Configure the RevenueCat Android public SDK key as `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.

Development/staging:

- Use `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` for RevenueCat Test Store builds when appropriate.
- Mock billing is used when no valid public SDK key is present or when running on web.

## Limitations

- Final App Store and Play Store products still need to be created and connected in RevenueCat.
- Prices are intentionally not hardcoded.
- Supabase entitlement mirroring is not implemented yet.
- Analytics events for paywall/purchase lifecycle are not implemented in this phase.
- Full feature gating remains a product decision; this phase establishes safe subscription infrastructure.
