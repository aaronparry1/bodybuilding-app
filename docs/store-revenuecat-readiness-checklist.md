# Store and RevenueCat Readiness Checklist

## Current App Contract

Adaptive Strength Coach currently expects:

- RevenueCat entitlement: `premium`
- Monthly product ID: `subscription_monthly_1`
- Annual product ID: `annual_subscription`
- Trial: 14-day free trial configured through App Store Connect / Google Play / RevenueCat introductory offer support
- Billing authority: RevenueCat
- Optional future mirror: Supabase, for support/analytics only

Confirmed store metadata:

| Store | Monthly product | Monthly price | Monthly status | Annual product | Annual price | Annual status | Trial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Apple App Store | `subscription_monthly_1` | £9.99 | Waiting for Review | `annual_subscription` | £99 | Waiting for Review | Confirm in App Store Connect |
| Google Play | `subscription_monthly_1` | 11.99 | Active | `annual_subscription` | 109.99 | Active | 14 days |

No real purchase testing can complete until the store products, RevenueCat offering, and a native build with valid RevenueCat public SDK keys all exist.

## 1. App Store Connect Setup

### App Record

- [ ] Create or confirm the App Store Connect app record.
- [ ] Confirm the app name is `Adaptive Strength Coach`.
- [ ] Confirm the correct SKU/internal identifier.
- [ ] Confirm primary language and category.
- [ ] Confirm the app record is connected to the correct bundle ID.

### Bundle ID

- [ ] Confirm the production bundle ID in Apple Developer is `com.aaronparry.adaptivestrengthcoach`.
- [ ] Confirm the EAS production env var `APP_IOS_BUNDLE_IDENTIFIER` is set to `com.aaronparry.adaptivestrengthcoach`.
- [ ] Confirm App Store Connect is attached to the same bundle ID before submitting a build.
- [ ] Confirm preview/staging bundle ID is separate if using TestFlight/staging builds.

### Subscription Group

- [ ] Create one subscription group for Adaptive Strength Coach.
- [ ] Name it clearly, for example `Adaptive Strength Coach Premium`.
- [ ] Confirm both monthly and annual subscriptions are in the same group.
- [ ] Confirm subscription group display name and localization.

### Monthly Product

- [ ] Create auto-renewable subscription product:

```text
subscription_monthly_1
```

- [ ] Attach it to the Adaptive Strength Coach subscription group.
- [ ] Add display name.
- [ ] Add description.
- [ ] Add localization.
- [ ] Confirm price is `£9.99`.
- [ ] Confirm status is `Waiting for Review`.
- [ ] Confirm product is cleared for sale when ready.

### Annual Product

- [ ] Create auto-renewable subscription product:

```text
annual_subscription
```

- [ ] Attach it to the same subscription group.
- [ ] Add display name.
- [ ] Add description.
- [ ] Add localization.
- [ ] Confirm annual price is `£99`.
- [ ] Confirm status is `Waiting for Review`.
- [ ] Confirm product is cleared for sale when ready.

### 14-Day Intro Offer / Free Trial

- [ ] Add a 14-day free trial introductory offer where allowed.
- [ ] Decide whether the trial applies to monthly, annual, or both.
- [ ] Confirm RevenueCat detects the intro offer.
- [ ] Confirm paywall copy remains true if trial eligibility is unavailable for a returning user.

### Pricing

- [ ] Choose launch monthly price.
- [ ] Choose launch annual price.
- [ ] Confirm annual price supports a meaningful savings message.
- [ ] Confirm local currency pricing.
- [ ] Confirm no final prices are hardcoded in the app.

### Review Notes

- [ ] Add App Review notes explaining RevenueCat subscription setup.
- [ ] Include how to access the paywall.
- [ ] Include demo account details if using account-based testing.
- [ ] Explain that free users can complete onboarding and view plan preview before paywall.
- [ ] Explain premium/trial unlocks Train and Progress.

### Sandbox Testers

- [ ] Create at least two sandbox testers.
- [ ] Test one clean first-time trial user.
- [ ] Test one returning/non-trial-eligible user.
- [ ] Document tester Apple IDs in secure internal notes, not in the repo.

### Agreements, Tax, and Banking

- [ ] Paid Apps agreement active.
- [ ] Tax forms complete.
- [ ] Banking details complete.
- [ ] Subscription products no longer blocked by contract status.

## 2. Google Play Console Setup

### App Record

- [ ] Create or confirm the Google Play Console app record.
- [ ] Confirm app name is `Adaptive Strength Coach`.
- [ ] Confirm default language and category.
- [ ] Complete required app content declarations.

### Package Name

- [ ] Confirm the production Android package name in Google Play Console is `com.aaronparry.adaptivestrengthcoach`.
- [ ] Set production `APP_ANDROID_PACKAGE` in EAS env to `com.aaronparry.adaptivestrengthcoach`.
- [ ] Confirm Google Play Console is attached to the same package name before submitting a build.
- [ ] Confirm preview/internal testing package strategy.

### Subscriptions, Base Plans, and Offers

- [ ] Create subscription product:

```text
subscription_monthly_1
```

- [ ] Add monthly base plan.
- [ ] Confirm monthly price is `11.99`.
- [ ] Confirm status is `Active`.
- [ ] Add/confirm 14-day free trial offer.
- [ ] Create subscription product:

```text
annual_subscription
```

- [ ] Add annual base plan.
- [ ] Confirm annual price is `109.99`.
- [ ] Confirm status is `Active`.
- [ ] Add/confirm 14-day free trial offer.
- [ ] Activate base plans/offers when ready.

### Pricing

- [ ] Set monthly price.
- [ ] Set annual price.
- [ ] Confirm annual savings logic is truthful.
- [ ] Confirm regional pricing.

### Internal Testing Track

- [ ] Create or confirm internal testing track.
- [ ] Upload an Android internal test build after RevenueCat is configured.
- [ ] Add testers.
- [ ] Confirm testers opt in through the Play testing link.

### Payments Profile

- [ ] Google payments profile is complete.
- [ ] Merchant/payment setup is not blocking subscription activation.

## 3. RevenueCat Dashboard Setup

### Project

- [ ] Create or confirm RevenueCat project for Adaptive Strength Coach.
- [ ] Keep development/staging/production project strategy clear.
- [ ] Confirm team access and owner account.

### App Platforms

- [ ] Add iOS app.
- [ ] Add Android app.
- [ ] Confirm iOS bundle ID matches the build.
- [ ] Confirm Android package name matches the build.

### Products Imported

- [ ] Import App Store product `subscription_monthly_1`.
- [ ] Import App Store product `annual_subscription`.
- [ ] Import Google Play product `subscription_monthly_1`.
- [ ] Import Google Play product `annual_subscription`.
- [ ] Confirm all products are available in RevenueCat product list.

### Entitlement

- [ ] Create entitlement:

```text
premium
```

- [ ] Attach monthly product to `premium`.
- [ ] Attach annual product to `premium`.
- [ ] Confirm entitlement ID is exactly lowercase `premium`.

### Offering and Package Mapping

- [ ] Create default/current offering.
- [ ] Add monthly package mapped to `subscription_monthly_1`.
- [ ] Add annual package mapped to `annual_subscription`.
- [ ] Confirm RevenueCat offering is marked current/default.
- [ ] Confirm the app paywall can fetch both packages.

### Trial / Intro Offer Validation

- [ ] Confirm RevenueCat sees the 14-day intro offer from App Store Connect.
- [ ] Confirm RevenueCat sees the 14-day offer from Google Play.
- [ ] Test first-time trial eligibility.
- [ ] Test returning/non-eligible user behavior.

### API Keys and Environment Variables

- [ ] Copy iOS public SDK key.
- [ ] Copy Android public SDK key.
- [ ] Set staging/preview EAS env vars:

```text
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=subscription_monthly_1
EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID=annual_subscription
```

- [ ] Set production EAS env vars separately.
- [ ] Do not use RevenueCat secret keys in the app.
- [ ] Use `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=test_...` only for RevenueCat Test Store development/staging when appropriate.
- [ ] Confirm iOS builds use `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`.
- [ ] Confirm Android builds use `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.

## 4. App Configuration Requirements

### Required Environment Variables

```text
APP_ENV=staging|production
APP_NAME=Adaptive Strength Coach
APP_SLUG=hypertrophy-app or final slug
APP_SCHEME=...
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach
APP_IOS_BUILD_NUMBER=...
APP_ANDROID_VERSION_CODE=...
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=subscription_monthly_1
EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID=annual_subscription
APP_PRIVACY_POLICY_URL=https://adaptivestrengthcoach.com/privacy
APP_TERMS_URL=https://adaptivestrengthcoach.com/terms
APP_SUPPORT_EMAIL=...
APP_DOWNLOAD_URL=https://adaptivestrengthcoach.com/download
APP_STORE_URL=...
GOOGLE_PLAY_URL=...
```

### Product IDs

- [ ] App product IDs match store products exactly.
- [ ] RevenueCat package mapping uses the same product IDs.
- [ ] Product IDs are not renamed after builds go out unless migration is planned.

### Entitlement Name

- [ ] RevenueCat entitlement is exactly:

```text
premium
```

- [ ] App config `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` is `premium`.

### Build Profile Requirements

- [ ] Preview/TestFlight build uses staging/preview RevenueCat keys or valid sandbox store keys.
- [ ] Production build uses production RevenueCat keys.
- [ ] EAS profile sets the intended `APP_ENV`.
- [ ] Build number/version code increments before distribution.
- [ ] Native build is required; Expo Go cannot test RevenueCat purchases.

### iOS Capabilities

- [ ] In-app purchases capability is available for the app in Apple Developer/App Store Connect.
- [ ] Associated Domains remain configured for `applinks:adaptivestrengthcoach.com`.
- [ ] No additional app entitlement is required solely for RevenueCat beyond standard StoreKit/in-app purchase setup.

### Android Billing Permission

- [ ] Confirm RevenueCat/Google Play Billing dependency adds billing support through the native build.
- [ ] Confirm Play Console app uses the same package name as the build.
- [ ] Confirm internal test build is uploaded before purchase testing.

## 5. Test Plan

### iOS Sandbox / TestFlight

- [ ] Install fresh preview/TestFlight build.
- [ ] Complete onboarding.
- [ ] Confirm plan preview is visible before paywall.
- [ ] Tap Train as free user and confirm paywall gate.
- [ ] Start monthly trial/purchase.
- [ ] Confirm `premium` entitlement unlocks Train.
- [ ] Complete a workout and confirm Workout Review remains accessible.
- [ ] Confirm Progress unlocks Strength Dashboard and reports.
- [ ] Restore purchases on same device.
- [ ] Restore purchases after reinstall.
- [ ] Cancel subscription in sandbox settings.
- [ ] Confirm cancelled-but-active access remains until expiry.
- [ ] Confirm expired subscription locks premium surfaces.
- [ ] Test annual purchase/trial path.
- [ ] Test purchase cancellation copy.
- [ ] Test products unavailable state if offering is disabled in a controlled test.
- [ ] Test offline cached premium after successful entitlement.

### Android Internal Test

- [ ] Install internal testing build.
- [ ] Complete onboarding.
- [ ] Confirm plan preview is visible before paywall.
- [ ] Tap Train as free user and confirm paywall gate.
- [ ] Start monthly trial/purchase.
- [ ] Confirm `premium` entitlement unlocks Train.
- [ ] Restore purchases.
- [ ] Cancel subscription.
- [ ] Confirm active-until-expiry behavior.
- [ ] Confirm expired behavior.
- [ ] Test annual path.
- [ ] Test offline cached premium.

### Billing Issue, If Possible

- [ ] Simulate billing retry/grace period if store tooling allows.
- [ ] Confirm RevenueCat CustomerInfo keeps entitlement active if store says active/grace.
- [ ] Confirm app copy stays calm and does not erase access prematurely.

## 6. What Blocks Real Purchase Testing

- Missing App Store Connect app record.
- Missing Apple bundle ID or wrong bundle ID in build.
- Missing App Store products.
- App Store products not attached to a subscription group.
- Missing 14-day intro offer/free trial.
- Paid Apps agreement/tax/banking incomplete.
- Missing sandbox testers.
- Missing Google Play app record.
- Wrong Android package name.
- Missing Google Play subscriptions/base plans/offers.
- Google payments profile incomplete.
- Missing internal testing track/testers.
- RevenueCat project not created.
- RevenueCat iOS/Android apps not configured.
- Products not imported into RevenueCat.
- `premium` entitlement missing or misspelled.
- Current/default RevenueCat offering missing.
- Monthly/annual packages not mapped.
- RevenueCat public SDK keys missing from EAS env.
- App build still using placeholder bundle/package IDs.
- No native EAS preview/TestFlight/internal build.
- Attempting to test in Expo Go.

## 7. Recommended Next Implementation Order

1. Create/confirm final Apple bundle ID and Android package name.
2. Create App Store Connect app record.
3. Create Google Play Console app record.
4. Complete Apple agreements/tax/banking and Google payments profile.
5. Create App Store monthly and annual subscription products.
6. Create Google Play monthly and annual subscriptions/base plans/offers.
7. Configure 14-day intro/free-trial offers.
8. Create/confirm RevenueCat project.
9. Add iOS and Android apps to RevenueCat.
10. Import store products into RevenueCat.
11. Create `premium` entitlement and attach products.
12. Create current/default offering and map monthly/annual packages.
13. Add RevenueCat public SDK keys and final app IDs to EAS environment.
14. Produce an iOS preview/TestFlight build.
15. Run iOS sandbox purchase/restore/trial/expiry tests.
16. Fix any store/RevenueCat/app integration issues.
17. Produce Android internal test build.
18. Run Android internal purchase/restore/trial/expiry tests.
19. Re-run final subscription regression.
20. Only then proceed to production release preparation.

## Build / No-Build Recommendation

Do not start a new EAS build until:

- store products exist,
- RevenueCat offering is configured,
- public SDK keys are in the intended EAS environment,
- final bundle/package identifiers are confirmed,
- sandbox/internal testers are ready.

Once those are ready, create an iOS preview/TestFlight build first. Android internal testing should follow after iOS purchase flow is proven.
