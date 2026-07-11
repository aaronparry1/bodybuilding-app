# RevenueCat + Store Setup Execution Checklist

Date: 2026-06-14

This checklist prepares Adaptive Strength Coach for real sandbox subscription testing. It does not require an EAS build until the store and RevenueCat dashboard work below is complete.

## Final Identifiers

Production identifiers:

```text
iOS bundle ID: com.aaronparry.adaptivestrengthcoach
Android package name: com.aaronparry.adaptivestrengthcoach
```

Non-production identifiers:

```text
iOS staging: com.aaronparry.adaptivestrengthcoach.staging
Android staging: com.aaronparry.adaptivestrengthcoach.staging
iOS development: com.aaronparry.adaptivestrengthcoach.dev
Android development: com.aaronparry.adaptivestrengthcoach.dev
```

RevenueCat contract:

```text
Entitlement: premium
Monthly product: subscription_monthly_1
Annual product: annual_subscription
Download URL: https://adaptivestrengthcoach.com/download
```

Confirmed store product setup:

| Store | Monthly product | Monthly price | Monthly status | Annual product | Annual price | Annual status | Trial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Apple App Store | `subscription_monthly_1` | £9.99 | Waiting for Review | `annual_subscription` | £99 | Waiting for Review | Confirm in App Store Connect |
| Google Play | `subscription_monthly_1` | 11.99 | Active | `annual_subscription` | 109.99 | Active | 14 days |

Resolved Expo config has been checked locally:

- Production app name resolves to `Adaptive Strength Coach`.
- Production iOS bundle ID resolves to `com.aaronparry.adaptivestrengthcoach`.
- Production Android package resolves to `com.aaronparry.adaptivestrengthcoach`.
- iOS Associated Domains remain `applinks:adaptivestrengthcoach.com`.
- Android App Link remains `https://adaptivestrengthcoach.com/download`.
- RevenueCat entitlement remains `premium`.
- RevenueCat product IDs remain `subscription_monthly_1` and `annual_subscription`.

## App Store Connect Steps

Complete these manually in App Store Connect / Apple Developer.

### App Identity

1. Open App Store Connect.
2. Confirm the app record is `Adaptive Strength Coach`.
3. Confirm the app record uses bundle ID:

```text
com.aaronparry.adaptivestrengthcoach
```

4. Confirm the bundle ID exists in Apple Developer > Certificates, Identifiers & Profiles.
5. Confirm the app status allows a new build upload or TestFlight build upload.
6. Confirm the SKU/internal identifier is acceptable for this product.
7. Confirm app metadata does not still describe an old product.

### Agreements, Tax, and Banking

1. Open App Store Connect > Business.
2. Confirm the Paid Apps agreement is active.
3. Confirm tax forms are complete.
4. Confirm banking details are complete.
5. Confirm there are no subscription/product blockers due to missing contracts.

### Subscription Group

1. Open the app record.
2. Go to Features or Monetization > Subscriptions.
3. Create one subscription group:

```text
Adaptive Strength Coach Premium
```

4. Add localised subscription group display name and description.
5. Keep monthly and annual products in the same subscription group.

### Monthly Subscription Product

Create an auto-renewable subscription:

```text
Product ID: subscription_monthly_1
Reference name: Adaptive Strength Coach Monthly
Duration: 1 month
Price: £9.99
Status: Waiting for Review
```

Then:

1. Attach it to the Adaptive Strength Coach subscription group.
2. Add display name.
3. Add description.
4. Add localisation.
5. Confirm price is `£9.99`.
6. Confirm product status is `Waiting for Review`.
7. Confirm product metadata is complete.
8. Do not submit until RevenueCat has imported the product successfully.

### Annual Subscription Product

Create an auto-renewable subscription:

```text
Product ID: annual_subscription
Reference name: Adaptive Strength Coach Annual
Duration: 1 year
Price: £99
Status: Waiting for Review
```

Then:

1. Attach it to the same subscription group.
2. Add display name.
3. Add description.
4. Add localisation.
5. Confirm price is `£99`.
6. Confirm product status is `Waiting for Review`.
7. Confirm product metadata is complete.
8. Confirm annual pricing supports any savings copy shown in the app.

### 14-Day Free Trial

If using a trial at launch:

1. Add an introductory offer to monthly, annual, or both products.
2. Offer type: free trial.
3. Duration: 14 days.
4. Confirm trial eligibility copy in the app remains true for returning/non-eligible users.
5. Confirm RevenueCat detects the intro offer after product import.

### Sandbox Tester

1. Create at least one clean sandbox Apple ID.
2. Prefer two:
   - one first-time trial-eligible tester
   - one returning/non-trial-eligible tester
3. Store sandbox tester credentials securely outside the repo.

### Subscription Metadata

Confirm each subscription has:

- display name
- description
- price
- localisation
- subscription group
- review information if required
- status not blocked by agreements/tax/banking

## Google Play Console Steps

Complete these manually in Google Play Console.

### App Identity

1. Open Google Play Console.
2. Confirm the app record is `Adaptive Strength Coach`.
3. Confirm the package name is:

```text
com.aaronparry.adaptivestrengthcoach
```

4. Confirm app signing is configured.
5. Confirm the app record is suitable for internal testing builds.
6. Confirm app metadata does not still describe an old product.

### Payments Profile

1. Open Play Console payment settings.
2. Confirm the payments profile is active.
3. Confirm tax and merchant details are complete.
4. Confirm subscriptions are not blocked by account setup.

### Monthly Subscription

Create subscription:

```text
Product ID: subscription_monthly_1
Name: Adaptive Strength Coach Monthly
Price: 11.99
Status: Active
Trial: 14 days
```

Then:

1. Add monthly base plan.
2. Confirm price is `11.99`.
3. Add localisations.
4. Confirm status is `Active`.
5. Confirm the 14-day trial offer is active.
6. Activate the base plan/offer when ready for testing.

### Annual Subscription

Create subscription:

```text
Product ID: annual_subscription
Name: Adaptive Strength Coach Annual
Price: 109.99
Status: Active
Trial: 14 days
```

Then:

1. Add annual base plan.
2. Confirm price is `109.99`.
3. Add localisations.
4. Confirm status is `Active`.
5. Confirm the 14-day trial offer is active.
6. Activate the base plan/offer when ready for testing.

### Testers and Internal Track

1. Add license testers in Play Console settings.
2. Create or confirm an internal testing track.
3. Add internal testers.
4. Confirm testers can access the app through the Play testing link.
5. Confirm the app is published enough for Play Billing product queries to work in internal testing.

## RevenueCat Dashboard Steps

Complete these manually in RevenueCat.

### Project and Apps

1. Open RevenueCat.
2. Confirm or create the Adaptive Strength Coach project.
3. Confirm the iOS app exists.
4. Confirm iOS bundle ID is:

```text
com.aaronparry.adaptivestrengthcoach
```

5. Confirm the Android app exists.
6. Confirm Android package name is:

```text
com.aaronparry.adaptivestrengthcoach
```

7. Do not mix an old app identity with the new production bundle/package IDs.

### Products

Import or create products:

```text
subscription_monthly_1
annual_subscription
```

Confirm products are detected from:

- App Store Connect
- Google Play Console

If RevenueCat cannot import the products, check:

- store products are fully created
- product IDs match exactly
- subscription metadata is complete
- store agreements/payments are active
- app bundle/package IDs match

### Entitlement

Create entitlement:

```text
premium
```

Attach both products to `premium`:

```text
subscription_monthly_1 -> premium
annual_subscription -> premium
```

### Offering

Create or update the default/current offering:

```text
Offering: default or current
```

Add packages:

```text
Monthly package -> subscription_monthly_1
Annual package -> annual_subscription
```

Confirm:

- offering is current/default
- paywall can query monthly and annual packages
- package identifiers are clear
- trial/intro eligibility is visible where supported

### Public SDK Keys

Copy public SDK keys:

```text
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
```

Do not put RevenueCat secret keys in the app, docs, EAS public env, or screenshots.

## Env Requirements

Required for native subscription testing:

```text
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=subscription_monthly_1
EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID=annual_subscription
APP_DOWNLOAD_URL=https://adaptivestrengthcoach.com/download
APP_STORE_URL=<final App Store URL when available>
GOOGLE_PLAY_URL=<final Google Play URL when available>
```

Current state:

- RevenueCat iOS public SDK key is documented in env examples but still placeholder until copied from RevenueCat.
- RevenueCat Android public SDK key is documented in env examples but still placeholder until copied from RevenueCat.
- Native key selection prefers the platform public SDK key first: iOS uses `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, Android uses `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` is only a fallback for development/Test Store scenarios when the platform key is missing.
- `APP_DOWNLOAD_URL` has a safe app-config fallback: `https://adaptivestrengthcoach.com/download`.
- `APP_STORE_URL` is optional/configurable and currently not resolved in production config unless supplied.
- `GOOGLE_PLAY_URL` is optional/configurable and currently not resolved in production config unless supplied.

Recommended EAS environment setup:

```text
Production:
APP_ENV=production
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
APP_DOWNLOAD_URL=https://adaptivestrengthcoach.com/download
APP_STORE_URL=<final App Store URL>
GOOGLE_PLAY_URL=<final Google Play URL>

Preview/Staging:
APP_ENV=staging
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
```

Use RevenueCat Test Store keys only for local/development scenarios where real store billing is not being tested.

## Sandbox Test Script

Run these after store products, RevenueCat offering, and native builds are ready.

### iOS Sandbox / TestFlight

1. Install the TestFlight or sandbox build.
2. Open the app.
3. Complete onboarding if needed.
4. Generate or open the plan preview.
5. Open the paywall before Train access.
6. Confirm monthly and annual products load with store prices.
7. Confirm 14-day trial messaging appears only when eligible.
8. Select monthly or annual.
9. Tap Start 14-Day Free Trial.
10. Complete sandbox purchase flow.
11. Confirm RevenueCat entitlement `premium` becomes active.
12. Confirm Train opens.
13. Start a workout and confirm premium gates are gone.
14. Return to Settings.
15. Confirm Subscription status shows trial or active.
16. Tap Restore Purchases and confirm success.
17. Tap Manage Subscription and confirm the platform subscription management path opens.
18. Cancel subscription in sandbox settings.
19. Confirm app handles cancelled-but-active-until-expiry correctly.
20. Let sandbox subscription expire if practical and confirm access changes correctly.

### Android Internal Test

1. Install the internal test build from Google Play.
2. Open the app with a license/internal tester account.
3. Complete onboarding if needed.
4. Generate or open the plan preview.
5. Open the paywall before Train access.
6. Confirm monthly and annual products load with Play prices.
7. Confirm 14-day trial messaging appears only when eligible.
8. Select monthly or annual.
9. Tap Start 14-Day Free Trial.
10. Complete Play Billing test purchase.
11. Confirm RevenueCat entitlement `premium` becomes active.
12. Confirm Train opens.
13. Start a workout and confirm premium gates are gone.
14. Return to Settings.
15. Confirm Subscription status shows trial or active.
16. Tap Restore Purchases and confirm success.
17. Cancel subscription in Play subscription management if practical.
18. Confirm app handles entitlement refresh and expiry correctly.

## Remaining Blockers

Before real sandbox subscription testing:

1. App Store Connect app record must be confirmed against `com.aaronparry.adaptivestrengthcoach`.
2. Google Play Console app record must be confirmed against `com.aaronparry.adaptivestrengthcoach`.
3. App Store agreements, tax, and banking must be complete.
4. Google Play payments profile must be active.
5. App Store subscription products must exist:
   - `subscription_monthly_1`
   - `annual_subscription`
   - monthly price: `£9.99`
   - annual price: `£99`
   - status: `Waiting for Review`
6. Google Play subscription products/base plans/offers must exist:
   - `subscription_monthly_1`
   - `annual_subscription`
   - monthly price: `11.99`
   - annual price: `109.99`
   - status: `Active`
   - trial: `14 days`
7. 14-day trial offers must be configured on any store product that should launch with a trial.
8. RevenueCat apps must match the final bundle/package IDs.
9. RevenueCat products must be imported successfully.
10. RevenueCat entitlement `premium` must exist.
11. RevenueCat default/current offering must include monthly and annual packages.
12. RevenueCat public SDK keys must be set for the build environment.
13. Sandbox/license/internal testers must be configured.
14. A native preview/TestFlight/internal test build must be produced after the above is ready.

## Exact Next Action For Aaron

1. In App Store Connect, confirm the app record uses bundle ID `com.aaronparry.adaptivestrengthcoach`.
2. In Google Play Console, confirm the app record uses package `com.aaronparry.adaptivestrengthcoach`.
3. Create the two subscription products in both stores:
   - `subscription_monthly_1`
   - `annual_subscription`
4. Add 14-day trial offers if using the launch trial.
5. In RevenueCat, create/confirm the project apps, import both products, create entitlement `premium`, and set the default offering.
6. Copy the iOS and Android RevenueCat public SDK keys into the appropriate EAS environment variables.
7. Only then request the next native preview/TestFlight/internal test build.
