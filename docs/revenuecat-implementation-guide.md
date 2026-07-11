# Iron Logic RevenueCat Expo Implementation

This app uses RevenueCat through Expo native builds. It will not purchase inside Expo Go.

## 1. Install SDKs

```bash
npx expo install react-native-purchases react-native-purchases-ui
```

RevenueCat's Expo docs require a development or preview build after installing native SDKs. Hot reloading in Expo Go is not enough.

## 2. Configure API Keys

For RevenueCat Test Store development:

```bash
EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=test_GWbIKBIeOsnEmHXAnxgdylDOCdq
```

For real iOS/Android sandbox/store testing:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_ios_public_sdk_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your_android_public_sdk_key
```

Best practice:

- Use `test_...` only in development/staging.
- Use `appl_...` and `goog_...` for TestFlight/Internal Testing and production store builds.
- Never put a RevenueCat secret key in the app.

## 3. Entitlement

Create a RevenueCat entitlement:

```text
premium
```

Iron Logic maps `premium` to:

- Unlimited history
- Unlimited custom programmes
- Full analytics
- Advanced analytics
- Cloud sync
- Premium programmes
- Future wearables

## 4. Products

Configure these product identifiers in RevenueCat and the relevant store dashboard:

```text
lifetime
yearly
monthly
```

Attach all three to the `premium` entitlement.

The app supports monthly, yearly, and lifetime packages directly. RevenueCat's native Paywall can also present the same products from the remotely configured offering.

## 5. Offering

In RevenueCat, create a current offering containing:

- Monthly package -> product `monthly`
- Annual package -> product `yearly`
- Lifetime package -> product `lifetime`

RevenueCatUI Paywalls use the remotely configured paywall attached to this offering.

## 6. App Code

Core files:

- `src/application/billing/revenuecat-gateway.ts`
- `src/application/billing/subscription.ts`
- `src/application/billing/subscription-context.tsx`
- `app/(protected)/paywall.tsx`
- `app/(protected)/(tabs)/account.tsx`

The app:

- Configures RevenueCat once through `RevenueCatGateway`.
- Fetches customer info.
- Fetches offerings/packages.
- Purchases monthly/yearly/lifetime packages.
- Restores purchases.
- Presents RevenueCatUI Paywall.
- Presents RevenueCatUI Customer Center.
- Falls back to mock billing when keys/native SDK are unavailable.

## 7. Present Paywall

The paywall screen exposes:

```ts
presentPaywall()
```

Internally this calls:

```ts
RevenueCatUI.presentPaywallIfNeeded({
  requiredEntitlementIdentifier: "premium",
  displayCloseButton: true,
});
```

If the user buys or restores, the app refreshes `CustomerInfo` and unlocks premium.

## 8. Customer Center

The Account screen's Manage Subscription button calls:

```ts
presentCustomerCenter()
```

Use Customer Center once you have real store products configured and want RevenueCat to handle restore/manage/refund flows in one native UI.

## 9. Error Handling

The app normalizes:

- Cancelled purchase -> no charge made
- Missing offering/package -> check RevenueCat offering and product IDs
- Network failure -> retry message
- Missing API key -> mock/config message
- Restore with no purchase -> no active purchase found

## 10. Native QA

```bash
npm run eas:build:staging:ios
npm run eas:build:staging:android
```

Then test:

- Account shows RevenueCat sandbox
- Paywall opens RevenueCatUI
- Monthly package appears
- Yearly package appears
- Lifetime package appears
- Purchase unlocks premium
- Restore unlocks premium
- Restart keeps premium
- Missing keys fall back to mock mode
