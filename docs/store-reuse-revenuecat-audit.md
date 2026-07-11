# Store + RevenueCat Reuse Audit

## Executive Summary

Recommendation: **B) Reuse the existing store listings if they are the confirmed listings for `com.aaronparry.adaptivestrengthcoach`, but rebuild/verify RevenueCat configuration around the current app contract.**

The production app identifiers have now been confirmed and applied to app config:

- iOS production bundle ID: `com.aaronparry.adaptivestrengthcoach`
- Android production package name: `com.aaronparry.adaptivestrengthcoach`
- iOS staging bundle ID: `com.aaronparry.adaptivestrengthcoach.staging`
- Android staging package name: `com.aaronparry.adaptivestrengthcoach.staging`
- EAS project: `@arxapps/hypertrophy-app`

Do not submit a production build until App Store Connect, Google Play Console, and RevenueCat have been checked against these exact identifiers.

RevenueCat reuse is plausible, but the dashboard must be checked manually. The app expects:

- entitlement: `premium`
- monthly product: `subscription_monthly_1`
- annual product: `annual_subscription`
- current/default offering with monthly and annual packages
- 14-day trial configured through the stores/RevenueCat intro offer support

Confirmed store product metadata:

| Store | Monthly product | Monthly price | Monthly status | Annual product | Annual price | Annual status | Trial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Apple App Store | `subscription_monthly_1` | £9.99 | Waiting for Review | `annual_subscription` | £99 | Waiting for Review | Confirm in App Store Connect |
| Google Play | `subscription_monthly_1` | 11.99 | Active | `annual_subscription` | 109.99 | Active | 14 days |

Local config currently has a RevenueCat Test Store key in `.env.local`, while production/staging example files still contain placeholder iOS/Android public SDK keys.

## Store Identity Fix Status: Confirmed and Applied

Date checked: 2026-06-14.
Date updated: 2026-06-14.

Requested action:

- confirm existing App Store Connect identity
- confirm existing Google Play Console identity
- replace placeholder app identifiers with final Adaptive Strength Coach identifiers

Result:

The production identifiers were confirmed externally and supplied by the product owner:

- iOS bundle ID: `com.aaronparry.adaptivestrengthcoach`
- Android package name: `com.aaronparry.adaptivestrengthcoach`

The app config, EAS profile env defaults, and env example files now use those production identifiers. Development and staging remain separate with `.dev` and `.staging` suffixes.

Current status:

```text
Final iOS bundle ID: com.aaronparry.adaptivestrengthcoach
Final Android package name: com.aaronparry.adaptivestrengthcoach
Existing App Store listing reusable: yes, if the confirmed App Store record is attached to this bundle ID
Existing Google Play listing reusable: yes, if the confirmed Play Console record is attached to this package name
RevenueCat platform app alignment: not confirmed
```

Non-production identifiers:

```text
iOS staging: com.aaronparry.adaptivestrengthcoach.staging
Android staging: com.aaronparry.adaptivestrengthcoach.staging
iOS development: com.aaronparry.adaptivestrengthcoach.dev
Android development: com.aaronparry.adaptivestrengthcoach.dev
```

Sources checked:

- `app.config.ts`
- `eas.json`
- `.env*.example`
- local environment variables
- local filesystem for App Store Connect / Google Play / fastlane credentials
- `eas project:info`
- `eas build:list --limit 5 --json`
- public web search for Adaptive Strength Coach store pages

No EAS build was started during this identity update.

## What Was Verified Locally

### App config

Source: `app.config.ts`

Production defaults:

```text
APP_ENV=production
APP_NAME=Adaptive Strength Coach
APP_SCHEME=ironlogic
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach
```

Staging defaults:

```text
APP_NAME=Adaptive Strength Coach Staging
APP_SCHEME=ironlogic-staging
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
```

Development defaults:

```text
APP_NAME=Adaptive Strength Coach Dev
APP_SCHEME=ironlogic-dev
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.dev
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.dev
```

Universal/App Link config:

```text
iOS associated domain: applinks:adaptivestrengthcoach.com
Android App Link: https://adaptivestrengthcoach.com/download
```

Download URL:

```text
https://adaptivestrengthcoach.com/download
```

### EAS project

`eas project:info` reports:

```text
fullName: @arxapps/hypertrophy-app
ID: 74af0233-9986-445e-b138-8210fa059bfc
```

This EAS project can build the app, but its slug/project name still reflects the earlier `hypertrophy-app` identity. That is not necessarily a blocker, but it is a naming consistency issue for internal operations.

### EAS build profiles

Source: `eas.json`

Production profile currently sets:

```text
APP_ENV=production
APP_NAME=Adaptive Strength Coach
APP_SCHEME=ironlogic
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach
```

Preview profile sets:

```text
APP_ENV=staging
APP_NAME=Adaptive Strength Coach Staging
APP_SCHEME=ironlogic-staging
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
```

Action needed:

Replace these placeholder IDs with the existing store listing identifiers if reuse is intended.

### RevenueCat app contract

Sources:

- `app.config.ts`
- `src/application/billing/subscription.ts`
- `src/application/billing/revenuecat-gateway.ts`
- `src/application/billing/mock-revenuecat.ts`
- `docs/revenuecat-implementation.md`
- `docs/store-revenuecat-readiness-checklist.md`

Expected entitlement:

```text
premium
```

Expected products:

```text
subscription_monthly_1
annual_subscription
```

Expected packages:

```text
monthly
annual/yearly
```

Important implementation detail:

The app config exposes configurable values:

```text
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID
EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID
```

The billing domain falls back to the confirmed contract:

```text
premium
subscription_monthly_1
annual_subscription
```

RevenueCat purchase flow itself maps packages from `offerings.current.monthly` and `offerings.current.annual`, so real store product identifiers can be surfaced from RevenueCat. However, entitlement mapping and native paywall requirement currently assume `premium`.

Practical implication:

If the existing RevenueCat project uses a different entitlement name, it should be changed or mirrored to `premium`. RevenueCat products and packages should use the confirmed store product IDs `subscription_monthly_1` and `annual_subscription`.

## Public Store Visibility Check

Public web search did not reveal a clearly matching public App Store or Google Play listing for exact `Adaptive Strength Coach` store pages.

This does not prove the listings do not exist. They may be:

- unpublished
- in internal testing
- under a previous app name
- not indexed
- attached to a different developer account

Console access is required to verify App Store Connect and Google Play Console state.

## 1. App Identity

### Current Expo bundle identifier

Production fallback:

```text
com.aaronparry.adaptivestrengthcoach
```

Staging fallback:

```text
com.aaronparry.adaptivestrengthcoach.staging
```

Development fallback:

```text
com.aaronparry.adaptivestrengthcoach.dev
```

### Current Android package name

Production fallback:

```text
com.aaronparry.adaptivestrengthcoach
```

Staging fallback:

```text
com.aaronparry.adaptivestrengthcoach.staging
```

Development fallback:

```text
com.aaronparry.adaptivestrengthcoach.dev
```

### Existing App Store bundle ID

Not verifiable from this repo or public search.

Required check in App Store Connect / Apple Developer:

- exact Bundle ID
- app record attached to that Bundle ID
- whether the app is live, TestFlight-only, removed, or draft
- whether the bundle ID is owned by the current Apple Developer account

### Existing Google Play package name

Not verifiable from this repo or public search.

Required check in Google Play Console:

- exact package name
- app record status
- internal testing history
- whether any previous artifact has been uploaded under that package
- whether the package is owned by the current Play Console account

### Can we push this new app through existing listings?

Yes, **only if**:

- the existing App Store listing is attached to `com.aaronparry.adaptivestrengthcoach`
- the existing Google Play listing is attached to `com.aaronparry.adaptivestrengthcoach`
- signing credentials match those store records
- the metadata/screenshots/privacy/trial disclosures are updated for the current product

If either store listing uses a different immutable identifier, create a new listing or intentionally realign the build config before any production submission.

## 2. RevenueCat Audit

### What the app expects

Entitlement:

```text
premium
```

Product IDs:

```text
subscription_monthly_1
annual_subscription
```

Offering shape:

```text
current/default offering
monthly package
annual/yearly package
```

Trial:

```text
14-day free trial when eligible
```

### What is locally configured

`.env.local` contains a RevenueCat Test Store key. The actual key value is not repeated here.

Example/env templates contain placeholders:

```text
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
```

Staging/production example files still use placeholder public SDK keys.

### What must be checked in RevenueCat dashboard

Project:

- Is there already a project for Adaptive Strength Coach?
- Is it the same project intended for this release?
- Does it include iOS and Android apps?

Apps:

- iOS app bundle ID matches the final production bundle ID
- Android app package name matches the final production package name

Entitlements:

- `premium` exists
- monthly and annual products grant `premium`
- old entitlement names, if any, are either migrated or mirrored

Products:

- `subscription_monthly_1`
- `annual_subscription`
- imported for iOS
- imported for Android
- attached to entitlement

Offerings:

- current/default offering exists
- monthly package points to monthly product
- annual/yearly package points to annual product
- no stale offering is marked current

Trial:

- RevenueCat detects App Store intro offer
- RevenueCat detects Google Play base-plan/offer trial
- paywall copy remains true for returning users who are not trial eligible

API keys:

- iOS public SDK key copied into EAS env
- Android public SDK key copied into EAS env
- Test Store key only used intentionally for test-store/dev builds
- no secret keys in app env

### RevenueCat reuse recommendation

Reuse the existing RevenueCat project **only if** it can be made to match:

```text
entitlement: premium
products: subscription_monthly_1, annual_subscription
offering: current/default with monthly + annual packages
apps: exact production bundle/package IDs
```

If the existing RevenueCat project has stale products, stale entitlements, or old app IDs, it is still reusable but should be cleaned/rebuilt rather than worked around in app code.

## 3. Store Setup Audit

Console access was not available in this workspace, so the following cannot be confirmed directly:

### App Store Connect

Must confirm:

- app record exists
- app name and subtitle
- attached bundle ID
- subscription group
- monthly subscription product
- annual subscription product
- 14-day free trial intro offer
- pricing
- paid apps agreement
- tax forms
- banking
- sandbox testers
- current TestFlight status
- current metadata/screenshots/privacy nutrition

### Google Play Console

Must confirm:

- app record exists
- package name
- internal testing track
- monthly subscription
- annual subscription
- base plans and offers
- 14-day trial offer
- license testers
- payments profile
- app content declarations
- current metadata/screenshots/privacy/data safety

### Current app metadata

Public website and app copy now describe Adaptive Strength Coach, but store metadata cannot be verified from the repo.

If existing listings are from an older product version, update:

- app name
- subtitle/short description
- full description
- screenshots
- privacy policy URL
- terms URL
- support URL/email
- subscription disclosure
- trial disclosure
- recovery/cardio wording
- Powerlifting Meet wording
- Strength Dashboard/PR reporting screenshots

## 4. What Can Be Reused

Likely reusable:

- existing domain: `adaptivestrengthcoach.com`
- existing `/download` route
- existing universal/app link domain concept
- existing EAS project if internal naming is acceptable
- existing RevenueCat project if it can be cleaned to match the app contract
- existing App Store / Play Store listings if their immutable IDs match the build IDs
- existing Google Play testing history if package name is retained

Reusable with changes:

- store listings, if old metadata/screenshots are refreshed
- RevenueCat offerings, if stale products/entitlements are replaced or remapped
- App Store/Play products, if product IDs match or if the app is intentionally adjusted later

Not safely reusable without dashboard confirmation:

- App Store / Play Console records, until they are verified against `com.aaronparry.adaptivestrengthcoach`
- placeholder production RevenueCat keys
- old product IDs with unknown entitlement mapping
- old metadata that describes a previous product

## 5. What Must Be Changed

Before a paid preview/TestFlight/Internal Test build:

1. Confirm the real production/staging bundle IDs are also set in EAS environment variables.

```text
Production:
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach

Staging:
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
```

2. Set final scheme if desired.

Current scheme still uses:

```text
ironlogic
ironlogic-staging
ironlogic-dev
```

This can work technically, but it is brand-inconsistent. Changing scheme is lower risk before public release than after release.

3. Set real legal/support URLs.

Current examples still include:

```text
https://adaptivestrengthcoach.com/privacy
https://adaptivestrengthcoach.com/terms
support@adaptivestrengthcoach.com
```

4. Set RevenueCat public SDK keys in EAS env.

```text
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
```

5. Confirm RevenueCat current offering.

6. Confirm store products and trial.

7. Confirm App Store/Play metadata matches the current app.

## 6. Risk Assessment

### Wrong bundle/package ID

Severity: blocker.

App Store and Google Play identifiers are effectively immutable for listings. If the existing listing uses a different ID than the build, the build cannot be submitted to that listing.

### Placeholder app IDs

Severity: blocker for production.

The current fallback IDs are placeholders and should not be used for production unless they truly are the existing store IDs.

### Stale RevenueCat entitlement

Severity: high.

The app maps active access to `premium`. If the existing RevenueCat project uses another entitlement, paid users may not unlock premium even after purchase.

### Old product IDs

Severity: medium to high.

RevenueCat package purchase can work with whatever product is in the current offering, but the app docs/fallbacks/tests expect the confirmed store product IDs `subscription_monthly_1` and `annual_subscription`. Mismatched product IDs increase support/debugging risk.

### Old app metadata

Severity: high for conversion and review quality.

If listings describe an older or narrower app, users and reviewers may see mismatch with the current product.

### Existing live users

Severity: unknown.

If there are previous testers or live users, reuse has migration implications:

- entitlement continuity
- grandfathering
- old purchases/restores
- data expectations
- changed product promise

### Store review implications

Severity: medium.

Apple/Google review will expect:

- accurate subscription disclosure
- trial terms
- privacy/data safety accuracy
- account deletion/support
- functional restore purchases
- no misleading medical/fitness claims

### Test Store key accidentally shipping

Severity: blocker.

`.env.local` contains a RevenueCat Test Store key. Production EAS env must use platform public SDK keys, not the test key.

## 7. Recommendation

Recommended path:

**B) Reuse store listings but rebuild/verify RevenueCat config.**

This is the best path if the existing App Store/Play listings are already tied to the desired Adaptive Strength Coach bundle/package IDs.

If the existing store listing IDs differ from the intended final IDs, choose:

**D) Create new store listings.**

Do **not** choose A until dashboard checks prove:

- existing store IDs match the build
- RevenueCat entitlement is `premium`
- products match or are intentionally supported
- current offering is correct
- subscriptions/trials are configured
- metadata is current

Do **not** choose C unless:

- the existing RevenueCat project is cluttered beyond repair
- old test/live users make reuse risky
- old apps/products cannot be cleanly separated

## 8. Exact Next Steps

### Step 0: Provide console identity data or API access

This is now the required unblocker.

Provide one of:

- App Store Connect app record details and Play Console app record details copied from the consoles, or
- App Store Connect API key values and Google Play service account access suitable for read-only verification, or
- screenshots/exports showing app name, bundle ID/package name, SKU/status, and subscriptions.

Minimum data needed:

Apple:

```text
App name
Bundle ID
SKU
App status
Subscription group/products
```

Google:

```text
App name
Package name
App status
Subscription products/base plans/offers
```

After this is supplied, update `app.config.ts`, `eas.json`, env defaults, and this audit with the final IDs.

### Step 1: Confirm store identifiers

In App Store Connect / Apple Developer:

- Find existing Adaptive Strength Coach app record.
- Record exact Bundle ID.
- Confirm it is usable for this release.

In Google Play Console:

- Find existing Adaptive Strength Coach app record.
- Record exact package name.
- Confirm it is usable for this release.

### Step 2: Update EAS environment

Set the exact identifiers in EAS env for preview/production.

Do not rely on fallback values in `eas.json`.

### Step 3: Confirm RevenueCat project

In RevenueCat:

- confirm existing project
- confirm iOS app and Android app IDs
- confirm entitlement `premium`
- confirm monthly and annual products
- confirm current/default offering
- confirm public SDK keys

### Step 4: Decide whether product IDs can match

Preferred:

```text
subscription_monthly_1
annual_subscription
```

If existing products use old IDs, decide whether to:

- create new store products with current IDs, or
- patch the app later to fully honor configured product IDs.

### Step 5: Update store metadata

Refresh listing copy/screenshots around:

- Adaptive Strength Coach
- adaptive progression
- Strength Dashboard
- PR tracking
- Recovery Window
- Recovery & Capacity
- Powerlifting Meet
- Advanced Reports
- subscription/trial disclosure

### Step 6: Build only after configuration is verified

Once IDs and RevenueCat setup are confirmed, create a preview/TestFlight/internal test build and perform sandbox purchase testing.

## 9. Blockers

Current blockers to real purchase testing:

- existing App Store bundle ID not confirmed
- existing Play package name not confirmed
- production app identifiers still placeholder in local config/EAS profile
- production RevenueCat iOS/Android public SDK keys not present in checked templates
- RevenueCat dashboard setup not verified
- store subscription products not verified
- 14-day trial not verified
- agreements/tax/banking not verified
- sandbox/license testers not verified
- store metadata not verified

## 10. No-Build Recommendation

Do not start a new EAS build for store purchase testing yet.

First confirm:

1. exact App Store bundle ID
2. exact Google Play package name
3. RevenueCat project/apps/entitlement/offering
4. subscription products and trial
5. production/staging EAS env identifiers and SDK keys

After those are confirmed, build a fresh iOS preview/TestFlight build for sandbox RevenueCat purchase testing.

No code changes were made for this audit.

No EAS build was started.
