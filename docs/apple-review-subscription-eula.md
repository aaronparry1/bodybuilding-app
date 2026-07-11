# Apple Review Subscription EULA

Date: 2026-06-18  
Status: App Review support document. No EAS build started by this document.

## Required legal links

Terms of Use / EULA:

https://adaptivestrengthcoach.com/terms

Privacy Policy:

https://adaptivestrengthcoach.com/privacy

## In-app legal link verification

The paywall legal footer opens:

- Terms: `https://adaptivestrengthcoach.com/terms`
- Privacy: `https://adaptivestrengthcoach.com/privacy`

The Expo app config also exposes these URLs through:

- `extra.termsUrl`
- `extra.privacyPolicyUrl`

Production fallbacks in `app.config.ts` point to the correct Adaptive Strength Coach website URLs.

## Subscription products

Adaptive Strength Coach uses RevenueCat as the subscription SDK and entitlement provider.

RevenueCat entitlement:

- `premium`

Store product IDs:

- Monthly: `subscription_monthly_1`
- Annual: `annual_subscription`

Trial:

- 14-day free trial, configured through App Store Connect / store subscription offer setup and surfaced through RevenueCat product/offering data.

Restore purchases:

- Paywall: `Restore Purchases`
- Settings: `Settings -> Subscription -> Restore Purchases`

Terms and Privacy are available from the paywall footer.

## Paste-ready App Review notes

Adaptive Strength Coach uses RevenueCat to manage auto-renewable subscriptions and the `premium` entitlement. RevenueCat is used as the billing/entitlement SDK layer; purchases still use Apple In-App Purchase / App Store billing.

Subscription products included in this submission:

- Monthly subscription: `subscription_monthly_1`
- Annual subscription: `annual_subscription`

The app offers a 14-day free trial where eligible. Trial eligibility, renewals, cancellation, and billing are managed through the user’s App Store account.

Restore Purchases is available in two places:

- On the paywall using the `Restore Purchases` button.
- In Settings under `Subscription` using the `Restore Purchases` button.

Terms of Use / EULA:

https://adaptivestrengthcoach.com/terms

Privacy Policy:

https://adaptivestrengthcoach.com/privacy

The Terms and Privacy links are also available in the app paywall footer.

## App Store Connect metadata checklist

Before resubmitting:

- Add `https://adaptivestrengthcoach.com/terms` as the Terms of Use / EULA URL wherever Apple requests it.
- Ensure the Privacy Policy URL is `https://adaptivestrengthcoach.com/privacy`.
- Select the auto-renewable subscription products for the app version:
  - `subscription_monthly_1`
  - `annual_subscription`
- Include the paste-ready App Review notes above.
- Confirm screenshots and paywall copy show the current 14-day free trial.

