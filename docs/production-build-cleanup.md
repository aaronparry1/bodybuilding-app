# Production Build Cleanup

Last updated: June 27, 2026

## Executive Summary

The checked-in native iOS project previously carried stale staging identity from `IronLogicStaging`, including a staging bundle identifier. Because the repository contains `ios/`, EAS uses native iOS project values for production builds, so this was a real build-risk even though `app.config.ts` resolved to the correct production bundle.

The native iOS project has been made production-only for this repository. The Android package was already production-correct, and EAS production environment variables are present for the required public production configuration.

## Native iOS Identity

Production requirements:

- iOS bundle ID: `com.aaronparry.adaptivestrengthcoach`
- App display name: `Adaptive Strength Coach`
- App version: `1.0.3`
- Latest successful iOS build number: `10`
- Next safe iOS build number: `11` or higher

Verified native iOS state:

- `ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj`
  - `PRODUCT_BUNDLE_IDENTIFIER = com.aaronparry.adaptivestrengthcoach`
  - `PRODUCT_NAME = AdaptiveStrengthCoach`
  - `INFOPLIST_FILE = AdaptiveStrengthCoach/Info.plist`
  - `CODE_SIGN_ENTITLEMENTS = AdaptiveStrengthCoach/AdaptiveStrengthCoach.entitlements`
- `ios/AdaptiveStrengthCoach/Info.plist`
  - `CFBundleDisplayName = Adaptive Strength Coach`
  - `CFBundleIdentifier = $(PRODUCT_BUNDLE_IDENTIFIER)`
  - `CFBundleShortVersionString = 1.0.3`
  - `CFBundleVersion = 10`
  - URL schemes include `ironlogic` and `com.aaronparry.adaptivestrengthcoach`

No remaining `IronLogicStaging`, `adaptivestrengthcoach.staging`, or `ironlogic-staging` references were found inside `ios/`.

## Files Requiring Change

Changed or renamed for production native identity:

- `.easignore`
- `app.config.ts`
- `ios/Podfile`
- `ios/AdaptiveStrengthCoach/Info.plist`
- `ios/AdaptiveStrengthCoach/AdaptiveStrengthCoach-Bridging-Header.h`
- `ios/AdaptiveStrengthCoach/AdaptiveStrengthCoach.entitlements`
- `ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj`
- `ios/AdaptiveStrengthCoach.xcodeproj/xcshareddata/xcschemes/AdaptiveStrengthCoach.xcscheme`
- `ios/AdaptiveStrengthCoach.xcworkspace/contents.xcworkspacedata`
- `tests/app-icon-config.test.ts`
- `tests/workout-navigation-ui.test.ts`

Removed generated local build folders:

- `ios/Pods`
- `ios/build`

## Staging References

Removed from production native iOS project:

- `IronLogicStaging`
- `com.aaronparry.adaptivestrengthcoach.staging`
- `ironlogic-staging`

Remaining staging references outside native production paths are expected only where they support non-production configuration, scripts, or tests. They should not affect App Store or Google Play production builds.

## Version Recommendations

EAS remote app version source is enabled.

Current remote counters:

- Android `versionCode`: `105`
- iOS `buildNumber`: `10`

Recommended next values:

- iOS next build number: `11`
- Android next versionCode: `106`

Do not decrease either counter. Android version codes `104` and `105` appear to have been consumed by earlier build-start attempts, so `106` is the safest next Play Console upload.

## Android Identity And Signing

Production requirements:

- Android package: `com.aaronparry.adaptivestrengthcoach`
- Latest successful Android versionCode: `103`
- Next safe Android versionCode: `106`
- Accepted Google Play upload SHA1: `7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B`

Verified:

- EAS production env contains `APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach`
- Resolved production Expo config contains `android.package=com.aaronparry.adaptivestrengthcoach`
- The current EAS Android upload key was previously verified as the accepted Play upload SHA1 above.

## Archive Compression Findings

The Android archive compression stall was most likely caused by unnecessary local generated/native artifacts being included in the build upload context.

Cleanup:

- Removed local `ios/Pods`
- Removed local `ios/build`
- Added generated/native build exclusions to `.easignore`

Current `.easignore` excludes:

- `node_modules`
- `dist`
- `docs`
- `screenshots`
- `qa-screenshots`
- `qa-reports`
- `output`
- `website`
- `credentials`
- `ios/Pods`
- `ios/build`
- `android/.gradle`
- `android/build`
- `android/app/build`
- `.expo`
- `DerivedData`
- logs and `.DS_Store`

Build inspect archive size after cleanup:

- Android inspect archive: `7.6M`
- iOS inspect archive: `7.6M`

The inspect archives no longer include `ios/Pods`, `ios/build`, `android/build`, `node_modules`, `docs`, `website`, or QA artifacts.

## Production Environment Readiness

EAS production environment contains:

- `APP_ENV=production`
- `APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach`
- `APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`: present
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`: present
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium`
- `EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=subscription_monthly_1`
- `EXPO_PUBLIC_REVENUECAT_ANNUAL_PRODUCT_ID=annual_subscription`
- Supabase public configuration: present

No secret values are recorded in this document.

## Verification

Completed checks:

- Native iOS staging reference search: passed
- EAS archive inspect for Android: passed
- EAS archive inspect for iOS: passed
- `npm test`: passed, `84 files / 1027 tests`
- `npx tsc --noEmit --pretty false`: passed
- `CI=1 npx expo export --platform web`: passed

## Build Readiness Checklist

- Production native iOS bundle ID verified.
- Production Android package verified.
- Stale native iOS staging identity removed.
- EAS production env present.
- RevenueCat iOS and Android public SDK keys present.
- RevenueCat entitlement remains `premium`.
- RevenueCat product IDs remain `subscription_monthly_1` and `annual_subscription`.
- Android upload key matches the accepted Google Play upload certificate.
- EAS upload archive is small and excludes generated local artifacts.
- Next iOS build number should be `11`.
- Next Android versionCode should be `106`.

Builds are safe to retry after this cleanup.
