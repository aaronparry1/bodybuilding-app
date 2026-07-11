# Subscription and Paywall Architecture

## 1. Executive summary

Adaptive Strength Coach already has the right foundation for subscriptions:

- `react-native-purchases` and `react-native-purchases-ui` are installed.
- `app/_layout.tsx` wraps the app in `SubscriptionProvider`.
- `src/application/billing/revenuecat-gateway.ts` can configure RevenueCat, fetch offerings, purchase packages, restore purchases, present RevenueCatUI Paywall, present Customer Center, and identify a Supabase user.
- `src/application/billing/subscription.ts` defines subscription state, entitlement keys, RevenueCat mapping, package fallback data, and error normalization.
- `app/(protected)/paywall.tsx` and `app/(protected)/(tabs)/account.tsx` expose a working paywall/account shell.
- Existing tests cover entitlement access and RevenueCat customer-info mapping.

The current implementation is still beta/scaffold level:

- Product IDs are placeholder/legacy Iron Logic IDs.
- The paywall copy says sandbox-only.
- Entitlement gating is partial. History and cloud sync use it; most training flows remain effectively free.
- `workout_logging` is currently always allowed.
- There is no final launch funnel that lets a user finish onboarding, see plan value, then start a trial before full use.
- No final subscription analytics layer exists.
- Supabase mirrors app data, but subscription status is not yet treated as a support/debug mirror.

Recommendation:

Use RevenueCat as the billing and entitlement provider for iOS and Android. Keep Supabase as the account/cloud-sync layer and optional entitlement mirror, not the billing source of truth. Launch with free onboarding and plan preview, then a 14-day trial/subscription paywall before starting the first real coached workout. Gate the full adaptive training system behind one `premium` entitlement.

No EAS build should start from this audit. Implementation should happen in small phases, then be validated through local tests, web export, simulator, and only later fresh preview builds.

References used:

- RevenueCat React Native/Expo installation docs: https://www.revenuecat.com/docs/getting-started/installation/reactnative and https://www.revenuecat.com/docs/getting-started/installation/expo
- RevenueCat entitlements docs: https://www.revenuecat.com/docs/getting-started/entitlements
- RevenueCat offerings docs: https://www.revenuecat.com/docs/offerings/overview
- RevenueCat customer info docs: https://www.revenuecat.com/docs/customers/customer-info
- RevenueCat paywalls docs: https://www.revenuecat.com/docs/tools/paywalls
- RevenueCat sandbox testing docs: https://www.revenuecat.com/docs/test-and-launch/sandbox
- Expo SDK 56 app config docs: https://docs.expo.dev/versions/v56.0.0/config/app/

## 2. Recommended provider

### Recommendation: RevenueCat

RevenueCat is the best fit for this app.

Why:

- It supports React Native/Expo native builds and is already installed.
- It centralizes iOS App Store and Google Play subscription state behind RevenueCat entitlements.
- It handles trial eligibility, restore purchases, customer info, subscriptions, offerings, and paywall presentation.
- It reduces native billing complexity before beta.
- The app already has a gateway abstraction and mock fallback, so implementation risk is lower than starting fresh.
- RevenueCat entitlements let the app avoid hardcoding store product IDs throughout training logic.
- Future analytics, experiments, promotional entitlements, and customer support flows are easier.

### Direct Apple/Google implementation

Not recommended for launch.

Pros:

- Maximum control.
- No third-party billing dependency.

Cons:

- Higher implementation and QA burden.
- Separate StoreKit and Google Play Billing edge cases.
- More risk around restore, receipt validation, grace periods, subscription status, and cross-platform identity.
- Would require backend receipt validation to be trustworthy.

Use direct store implementation only if RevenueCat becomes a strategic constraint later.

### Stripe/web-only approach

Not recommended for mobile premium access.

Stripe can be useful for web billing or non-digital services, but the app sells digital in-app access on iOS/Android. Mobile subscription access should use Apple/Google billing. RevenueCat Web Billing can be considered later if a web app becomes a real sales channel, but it should still map into the same `premium` entitlement.

## 3. Entitlement model

### Source of truth

RevenueCat CustomerInfo should be the source of truth for paid access.

Supabase can mirror subscription state for support, analytics, and sync diagnostics, but the app should not trust Supabase as the primary billing authority unless a server-side RevenueCat webhook mirror is added.

Recommended layers:

- RevenueCat dashboard:
  - products
  - offerings
  - trial configuration
  - `premium` entitlement
- Client billing adapter:
  - `src/application/billing/revenuecat-gateway.ts`
- Client entitlement domain:
  - `src/application/billing/subscription.ts`
- App-wide entitlement provider:
  - `src/application/billing/subscription-context.tsx`
- Optional cloud mirror:
  - Supabase `subscription_statuses` table, updated by RevenueCat webhook/server task later.

### Current entitlement keys

Current code has:

- `workout_logging`
- `custom_programmes`
- `analytics`
- `advanced_analytics`
- `cloud_sync`
- `unlimited_history`
- `premium_programmes`
- `future_wearables`

Current behaviour:

- `workout_logging` is always allowed.
- `analytics` is free as preview.
- `custom_programmes` has a free limit of 3.
- `unlimited_history` has a free limit of 30 days.
- `advanced_analytics`, `cloud_sync`, `premium_programmes`, and `future_wearables` require premium.

Launch recommendation:

Keep one commercial entitlement:

```text
premium
```

Map `premium` to:

- active adaptive workout execution
- workout logging beyond demo/preview
- post-workout review
- progression recommendations
- full plan generation and future plan updates
- Strength Dashboard
- PR tracking
- advanced reports
- recovery/cardio coaching
- cloud sync
- unlimited history
- premium programme features

Avoid multiple paid tiers at launch. The training system is one coherent product; multiple tiers would add confusion before there is enough pricing data.

### Status model

Keep:

- `free`
- `trial`
- `active`
- `expired`
- `cancelled`
- `lifetime`

Add later if useful:

- `billing_issue`
- `grace_period`
- `offline_cached`

RevenueCat active entitlement should mean access is active. Cancellation should not remove access until the active entitlement expires.

### Identity

Current app state:

- Supabase auth exists.
- Offline mode exists.
- RevenueCat `identifyUser(user.id)` exists.

Recommendation:

- If user signs in, call RevenueCat `logIn(user.id)` as current gateway does.
- If user continues offline, allow anonymous RevenueCat identity for local purchase/trial only if the flow supports it.
- On later sign-in, merge anonymous purchase into Supabase user through RevenueCat `logIn`.
- Do not require account creation before paywall unless cloud sync is part of the pitch. Too early account friction will hurt conversion.

## 4. Product IDs

Do not hardcode final prices in app code.

Recommended RevenueCat products:

```text
subscription_monthly_1
annual_subscription
```

Current store metadata:

| Store | Monthly product | Monthly price | Monthly status | Annual product | Annual price | Annual status | Trial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Apple App Store | `subscription_monthly_1` | £9.99 | Waiting for Review | `annual_subscription` | £99 | Waiting for Review | Confirm in App Store Connect |
| Google Play | `subscription_monthly_1` | 11.99 | Active | `annual_subscription` | 109.99 | Active | 14 days |

Recommended RevenueCat entitlement:

```text
premium
```

Recommended offering:

```text
default
```

Recommended packages:

- monthly package -> `subscription_monthly_1`
- annual package -> `annual_subscription`

Current code uses the confirmed monthly and annual store product IDs.

Recommendation:

- Keep product IDs aligned with App Store Connect, Google Play, and RevenueCat.
- Keep lifetime package out of the launch paywall unless there is a deliberate pricing strategy.
- Keep trial as store introductory offer attached to monthly/annual products, not as a separate app package.

Why avoid lifetime at launch:

- It complicates pricing, revenue forecasts, refund expectations, and user support.
- A coaching app has ongoing value and ongoing backend/support cost.
- Monthly/annual with a trial is cleaner for beta.

## 5. Trial model

Recommended model:

```text
Free onboarding + free plan preview -> 14-day trial -> subscription
```

Why:

- The app's value is felt after 2-5 workouts.
- Users should see that the plan is personalised before being asked to pay.
- A 14-day trial gives enough time for at least a few sessions.
- The flow is simpler than counting free workouts.

Not recommended for launch:

- Workout-count gate: higher product complexity and edge cases around deleted/incomplete/demo workouts.
- Free tracking but paid progression: it fragments the core promise.
- Web-only checkout: wrong channel for mobile digital access.

Trial should be configured in App Store Connect / Google Play and surfaced through RevenueCat offerings. The app should display trial terms from package metadata, not from hardcoded copy.

## 6. Paywall placement

### Recommended launch flow

1. User signs in or continues offline.
2. User completes onboarding.
3. App generates and displays the plan preview:
   - goal
   - current block
   - weekly schedule
   - next block context
   - why the plan matches the goal
4. User taps Start Training / Start First Workout.
5. Paywall appears:
   - monthly
   - annual
   - 14-day trial if eligible
   - restore purchases
6. Successful trial/purchase unlocks active training.
7. User enters Home/Train normally.

### Secondary paywall triggers

Show paywall when inactive users try to:

- start or continue a real planned workout after trial expiry
- complete post-workout review with recommendations
- access full Strength Dashboard / advanced reports
- access unlimited history
- enable cloud sync
- generate a new full plan after preview

Do not block:

- onboarding
- plan preview
- settings
- restore purchases
- legal links
- support/contact
- account sign-in/out

### Current gap

The current paywall is reachable from Account/Settings and locked history cards, but the core onboarding-to-plan-to-trial funnel is not final. Most primary training screens are not yet protected by subscription gates.

## 7. Premium/free feature split

### Free

Recommended free access:

- sign-in/offline entry
- onboarding
- plan preview
- Training System Guide
- exercise library browsing
- settings
- subscription restore/manage
- legal/support
- limited demo history, if already present

Optional free demo:

- one sample/demo workout that does not create long-term coaching recommendations

Keep this optional. The simpler launch path is plan preview -> trial.

### Premium

Premium should include the full training system:

- adaptive workout plan
- real workout logging
- active workout persistence
- post-workout review
- next-session load recommendations
- progression throttle
- rep range occupancy
- fatigue separation
- power quality
- primary lift variations
- pain/unavailable/preference handling
- recovery/cardio recommendations and logging
- event/taper engine
- Strength Dashboard
- PR tracking
- advanced reporting
- cloud sync
- unlimited history
- share cards based on real achievements

### Sharing

Do not aggressively gate sharing once a user has earned a PR. Sharing is acquisition. If the achievement exists, let the user share it, even if subscription expires later, as long as no private data is exposed.

## 8. Restore/error handling

Required flows:

### Restore purchases

Must be available from:

- paywall
- Account
- Settings

Behaviour:

- active entitlement found -> unlock premium
- no active purchase -> clear message, no crash
- network failure -> retry message
- store unavailable -> retry later message

### Active subscription

Show:

- status: Premium
- renewal/expiry date if available
- manage subscription action

### Trial active

Show:

- status: Trial
- expiry date if available
- manage subscription action

### Expired trial

Show paywall at premium actions. Keep user data intact.

### Cancelled but still active

If RevenueCat entitlement is active, keep access. Copy should say access remains until the current period ends if the SDK supplies enough date information.

### Billing issue / grace period

Current code does not model this explicitly. Recommended next addition:

- if RevenueCat reports active entitlement, keep access
- if entitlement inactive but product/customer info indicates billing problem, show a billing issue state
- do not delete or mutate workout data

### No internet

RevenueCat caches CustomerInfo. The app should:

- use cached active entitlement where RevenueCat supplies it
- avoid locking out an active subscriber immediately because of transient network failure
- show stale/offline wording if entitlement cannot be refreshed

### RevenueCat unavailable

Current code falls back to mock billing on RevenueCat action failure. That is useful for development but risky in production because a billing outage could accidentally unlock or misrepresent access depending mock state.

Recommendation:

- Keep mock fallback for development/staging.
- In production, do not silently fall back to mock entitlement after RevenueCat action failure.
- Show billing unavailable and preserve last-known entitlement state.

### App Store / Google Play unavailable

Show:

- "Store unavailable. Try again later."
- Restore remains available.
- No charge/purchase state should be assumed.

## 9. Config/env requirements

Current config already has:

- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / anon fallback
- `APP_ENV`
- app download/store URL constants
- iOS associated domain for `adaptivestrengthcoach.com`
- Android intent filter for `adaptivestrengthcoach.com/download`

Required before implementation/release:

- Final iOS bundle identifier: `com.aaronparry.adaptivestrengthcoach`.
- Final Android package: `com.aaronparry.adaptivestrengthcoach`.
- Final app scheme decision. Current scheme is still `ironlogic`; decide whether to keep for continuity or migrate to an Adaptive Strength Coach scheme.
- RevenueCat production public SDK keys for iOS and Android.
- RevenueCat Test Store key for development/staging only.
- App Store Connect products:
  - `subscription_monthly_1`
  - `annual_subscription`
- Google Play products:
  - `subscription_monthly_1`
  - `annual_subscription`
- RevenueCat entitlement:
  - `premium`
- RevenueCat offering:
  - `default`
- Privacy policy and terms URLs now point to `adaptivestrengthcoach.com`. 
- Support email should move away from `support@adaptivestrengthcoach.com`.
- Website should serve Universal Links / Android App Links files:
  - `/.well-known/apple-app-site-association`
  - `/.well-known/assetlinks.json`

Expo note:

`scheme`, `ios.bundleIdentifier`, `ios.associatedDomains`, `android.package`, and Android intent filters are build-time native configuration. Changes require new native builds, not only OTA updates.

## 10. Implementation phases

### Phase 1: Clean billing domain

- Rename fallback product IDs to:
  - `subscription_monthly_1`
  - `annual_subscription`
- Remove launch lifetime package from default app packages unless intentionally retained.
- Treat trial as introductory offer metadata, not a standalone purchase package.
- Add subscription statuses for billing issue/grace/offline cached if needed.
- Keep tests around CustomerInfo mapping and entitlement access.

### Phase 2: Production-safe RevenueCat gateway

- Keep mock billing only for development/staging.
- Production RevenueCat failures should not switch to mock.
- Add CustomerInfo refresh on app foreground if low-risk.
- Add CustomerInfo listener if RevenueCat SDK supports it cleanly.
- Preserve cached active access safely during network outages.

### Phase 3: Entitlement gates

- Add central premium gate helper/component.
- Gate real training start after plan preview.
- Gate post-workout review recommendations when subscription is inactive.
- Gate full Progress reports and unlimited history.
- Keep onboarding, plan preview, settings, restore, support, and legal free.

### Phase 4: Paywall UX

- Replace sandbox copy with launch copy.
- Show monthly/annual packages from RevenueCat offerings.
- Surface trial eligibility and store-provided pricing.
- Keep Restore Purchases visible.
- Use RevenueCatUI for fastest reliable launch, or a custom app-styled paywall backed by RevenueCat packages if final design consistency is required.

Recommended launch compromise:

- Custom in-app pre-paywall value screen.
- RevenueCatUI native paywall for transaction UI.

### Phase 5: Settings/account hardening

Add/confirm:

- Subscription Status
- Manage Subscription
- Restore Purchases
- Terms
- Privacy
- Contact Support
- Billing provider/status diagnostic in staging only

### Phase 6: Analytics

Add events after billing is stable:

- `paywall_viewed`
- `paywall_cta_tapped`
- `trial_started`
- `purchase_completed`
- `restore_completed`
- `purchase_cancelled`
- `purchase_failed`
- `entitlement_active`
- `subscription_expired`
- `onboarding_completed`
- `plan_generated`
- `workout_started`
- `workout_completed`
- `post_workout_review_viewed`
- `subscription_manage_opened`

Do not log sensitive workout notes, pain/injury reasons, email, or private billing data into generic analytics payloads.

### Phase 7: Sandbox QA

Use existing `docs/revenuecat-sandbox-qa.md` as the checklist base, updated for final product IDs and trial behaviour.

Required QA:

- iOS sandbox monthly purchase
- iOS sandbox annual purchase
- iOS restore
- iOS cancellation/expired entitlement simulation
- Android internal testing monthly purchase
- Android internal testing annual purchase
- Android restore
- no-internet startup with previous active entitlement
- missing offering
- missing API key
- expired trial
- offline account mode
- signed-in Supabase account mode

## 11. Risks

### Product ID mismatch

Risk:

RevenueCat, App Store Connect, Google Play, and app fallback constants disagree.

Mitigation:

Use one documented product table and tests for package selection/mapping.

### Paywall too early

Risk:

User is asked to pay before understanding the adaptive coaching value.

Mitigation:

Let onboarding complete and show the plan preview before paywall.

### Paywall too late

Risk:

Users consume full value before subscribing.

Mitigation:

Start trial before the first real coached workout.

### Mock fallback in production

Risk:

Production billing failures silently switch provider/state.

Mitigation:

Restrict mock fallback to development/staging.

### Offline entitlement confusion

Risk:

Real subscribers are locked out during network issues, or expired subscribers keep access indefinitely.

Mitigation:

Use RevenueCat cached CustomerInfo and a clear last-known entitlement policy.

### Anonymous-to-auth migration

Risk:

User buys while offline/anonymous, then signs in and loses entitlement.

Mitigation:

Test RevenueCat anonymous purchase -> Supabase login -> RevenueCat `logIn(user.id)` flow.

### Store policy issues

Risk:

Stripe/web checkout for mobile digital features violates platform expectations.

Mitigation:

Use Apple/Google billing via RevenueCat for mobile premium access.

### Legal/support gaps

Risk:

Paywall launches with placeholder privacy/terms/support metadata.

Mitigation:

Legal URLs now point to adaptivestrengthcoach.com; confirm the production support mailbox before store review.

## 12. Build/no-build recommendation

Do not start an EAS build for this audit.

Before the next commercial build:

1. Finalize App Store / Google Play product IDs.
2. Verify App Store Connect, Google Play Console, and RevenueCat all use the final Adaptive Strength Coach identifiers.
3. Decide whether lifetime is removed from launch.
4. Replace placeholder legal/support URLs.
5. Harden production RevenueCat failure handling.
6. Add the final trial-start paywall placement after plan preview.
7. Add tests around premium gates and production/mock behaviour.
8. Run:
   - `npm test`
   - `npx tsc --noEmit`
   - `npx expo export --platform web`
   - `EXPO_PUBLIC_DESIGN_QA_MODE=1 npx expo run:ios --device "iPhone 17 Pro"`

Only after that should a fresh iOS/Android preview build be created for sandbox purchase QA.
