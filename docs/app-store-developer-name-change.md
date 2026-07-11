# App Store Developer Name Change

Current visible seller/developer name:
David Parry

Desired visible name:
ARX Algorithms

## Finding

This cannot be changed from app code, Expo config, EAS, RevenueCat, or app metadata.

Apple ties the visible seller/developer name to the Apple Developer Program membership legal entity. If the account is enrolled as an individual, Apple uses the individual's legal name as the seller name on the App Store.

Apple's own developer enrollment documentation says an individual or sole proprietor account displays the personal legal name as the seller name. Apple's App Store Connect documentation also says organization accounts can set a developer name when adding the first app, while individual accounts do not have that option.

## What Is Required

To show `ARX Algorithms`, Aaron will likely need one of these paths:

1. Convert the existing Apple Developer Program membership from Individual to Organization.
2. Enroll a new Organization developer account for the legal entity and transfer the app if Apple advises that path.

The usual preferred path is to request an Individual-to-Organization membership update with Apple Developer Support, provided `ARX Algorithms` is a recognized legal entity or acceptable registered trade name for the organization.

## Manual Steps For Aaron

1. Confirm whether `ARX Algorithms` is a legal entity, registered company, or registered trading name.
2. Obtain/confirm the organization's D-U-N-S Number if Apple requires organization enrollment.
3. Sign in as the Apple Developer Account Holder.
4. Open Apple Developer account membership details.
5. Submit a request to update from Individual to Organization membership.
6. Provide requested company/legal documentation.
7. Wait for Apple approval.
8. Confirm the seller/developer name updates on App Store Connect and the public App Store listing.
9. If Apple cannot convert the existing membership cleanly, ask Apple Support whether an app transfer to an Organization account is required.

## Risks And Notes

- Do not create a second app listing casually. The current app has the live bundle ID, approved version, and subscriptions tied to it.
- App transfer can affect some capabilities, agreements, subscriptions, or metadata workflows. Apple Support should confirm the safest route before action.
- App code and bundle ID should not be changed for this.
- This is an account/legal setup task, not an EAS build task.

## Sources

- Apple Developer account updates: https://developer.apple.com/help/account/membership/updating-your-account-information/
- Apple Developer Program enrollment: https://developer.apple.com/programs/enroll/
- App Store Connect developer name: https://developer.apple.com/help/app-store-connect/create-an-app-record/set-your-developer-name/

