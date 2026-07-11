# RevenueCat Sandbox Native QA

RevenueCat purchases require native iOS/Android builds. Expo Go and web export should stay in mock mode.

## 1. Environment

Local `.env.local` and EAS preview should include either a RevenueCat test SDK key or platform-specific public SDK keys:

```bash
EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=test_your_public_test_key
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_public_sdk_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your_public_sdk_key
```

Add to EAS preview:

```bash
npx eas-cli@latest env:create preview --name EXPO_PUBLIC_REVENUECAT_TEST_API_KEY --value test_your_public_test_key --visibility sensitive --force --non-interactive
npx eas-cli@latest env:create preview --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_your_public_sdk_key --visibility sensitive --force --non-interactive
npx eas-cli@latest env:create preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_your_public_sdk_key --visibility sensitive --force --non-interactive
```

The app prefers `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` when present. If all keys are missing or placeholders, the app uses mock billing.

## 2. RevenueCat Dashboard

RevenueCat must have:

- iOS app configured.
- Android app configured.
- Entitlement named `premium`.
- Monthly product attached to `premium`.
- Annual product attached to `premium`.
- Current offering containing monthly, yearly, and lifetime packages.
- Product IDs exactly matching App Store Connect and Google Play.

Recommended package identifiers:

- Monthly package: RevenueCat monthly package type.
- Yearly package: RevenueCat annual package type.
- Lifetime package: RevenueCat lifetime package type.

## 3. App Store Connect

iOS sandbox requires:

- Paid Apps agreement completed if required.
- Bundle ID matching the EAS preview/prod iOS bundle.
- Subscription group.
- Monthly auto-renewable subscription product.
- Annual auto-renewable subscription product.
- Product IDs matching RevenueCat.
- Sandbox tester account.
- Build installed through TestFlight or a signed native build.

## 4. Google Play Console

Android sandbox/internal testing requires:

- App created with package name matching the EAS Android package.
- Internal testing track configured.
- License tester account added.
- Monthly subscription product.
- Annual subscription product.
- Product IDs matching RevenueCat.
- RevenueCat linked to Google Play service credentials.

## 5. Native Build Commands

iOS preview:

```bash
npm run eas:build:staging:ios
```

Android preview:

```bash
npm run eas:build:staging:android
```

For fastest local iteration after native builds exist:

```bash
npm run start:dev-client
```

## 6. Manual QA Checklist

- [ ] App launches cold without the startup error boundary.
- [ ] Create app account with Supabase staging test email.
- [ ] Login/logout works after restart.
- [ ] Continue offline works without an account.
- [ ] Account screen shows `RevenueCat sandbox`, not mock billing.
- [ ] Paywall loads real monthly package price.
- [ ] Paywall loads real yearly package price.
- [ ] Paywall loads real lifetime package price.
- [ ] Monthly sandbox purchase completes.
- [ ] Annual sandbox purchase completes.
- [ ] Purchase success shows Premium active.
- [ ] Premium entitlement unlocks cloud sync and advanced analytics.
- [ ] App restart keeps subscription state.
- [ ] Restore purchases restores active subscription.
- [ ] Restore with no active purchase shows clean no-purchase message.
- [ ] Cancelled purchase shows cancellation message and does not unlock premium.
- [ ] Network failure shows billing network error.
- [ ] Missing keys fall back to mock mode.
- [ ] Workout logging, history, analytics, and sync diagnostics still work after opening the paywall.
- [ ] Web export still builds and uses mock mode.

## 6.1 Required Tester Accounts

- Supabase/app test account: used for sign-up, login, profile creation, workout sync, and RLS checks.
- Apple sandbox tester: used on iOS for App Store sandbox subscription purchases and restores.
- Google Play test user: used on Android for Play Billing internal testing purchases and restores.

## 7. Expected App Mapping

RevenueCat entitlement `premium` unlocks:

- Unlimited workout history.
- Unlimited custom programmes.
- Full analytics.
- Advanced analytics.
- Cloud sync.
- Premium programmes.
- Future wearable support.

Customer info mapping:

- Active `premium` entitlement -> `active` or `trial`.
- `periodType=TRIAL` -> trial.
- No active `premium` entitlement -> free.
- Expired/cancelled subscriptions should appear as free unless RevenueCat reports an active entitlement.

## 8. Troubleshooting

Paywall shows mock prices:

- Missing RevenueCat public SDK key.
- Running on web or Expo Go.
- Rebuild native app after setting EAS env vars.

Offering not found:

- RevenueCat current offering is missing.
- Monthly/yearly/lifetime packages are not attached to the offering.
- Product IDs do not match App Store Connect or Google Play.

Purchase fails immediately:

- Native build was not installed.
- Product is not approved/available for sandbox.
- Store account is not a sandbox/internal tester.

Restore shows no purchase:

- Tester has no active sandbox subscription.
- Store account differs from purchase account.
- RevenueCat dashboard has not received the transaction yet.
