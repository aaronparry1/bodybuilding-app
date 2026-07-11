# Emergency Subscription Restore Verification

Date: June 23, 2026

Scope: emergency stabilization for live subscription restore/trial access failure.

## Code fix verified

The emergency restore/startup fix is implemented in the billing layer:

- `RevenueCatGateway.identifyUser` now returns mapped `SubscriptionState` from RevenueCat `CustomerInfo`.
- `SubscriptionProvider` waits for auth loading before identity-sensitive RevenueCat refresh.
- Identified subscription state is cached and applied immediately.
- Subscription state is refreshed after RevenueCat identify/login.
- Restore Purchases applies restored subscription state immediately.
- Configured entitlement id is used consistently in RevenueCat paywall/customer-info mapping, defaulting to `premium`.
- Paywall billing refresh issues use compact customer-safe copy rather than a scary error panel.

## Workout-history failure

Previous full-suite failure:

```text
tests/workout-history.test.ts
expected 90, received 85
```

Root cause: stale test fixture. The test intentionally verified that reduced exact-history load recommendations are fed into the starting-load resolver. It omitted `referenceDate`, so on June 23, 2026 the resolver also applied the separate training-gap adjustment to June 8, 2026 fixture history and trimmed 90kg down to 85kg.

Fix: pinned `referenceDate` to June 9, 2026 inside that test so it tests the intended exact-history reduction path without accidentally testing re-entry/training-gap logic.

Production impact: no production workout-history bug found.

## Passing checks

```text
npm test
Test Files: 82 passed / 82
Tests: 979 passed / 979
```

Focused subscription tests:

```text
tests/subscription-restore-failure-fix.test.ts: 8 passed
tests/revenuecat-billing.test.ts: 16 passed
tests/paywall-trial-flow.test.ts: 13 passed
tests/subscription-ui-source.test.ts: 4 passed
```

## Blocked checks

These checks did not complete in this local environment:

```text
npx tsc --noEmit
npx expo export --platform web
EXPO_PUBLIC_DESIGN_QA_MODE=1 npx expo run:ios --device "iPhone 17 Pro"
```

Observed behavior:

- System Node is `v23.9.0`.
- `node node_modules/expo/bin/cli export --platform web --clear` eventually reported:

```text
ERR_INVALID_PACKAGE_CONFIG
Invalid package config node_modules/expo/node_modules/@expo/cli/package.json
```

- Using Codex bundled Node allowed `expo --version` and `tsc --showConfig` to run.
- Full `tsc --noEmit`, `expo export`, and `expo run:ios` then slept at `0% CPU` before producing useful output.
- Stuck Expo/TypeScript processes were killed.
- No EAS build was started.

Assessment: the remaining failed verification is a local CLI/runtime execution blocker, not a failing app test. However, it still means the emergency patch should not be submitted without either:

1. running these checks successfully on a working local/CI machine; or
2. accepting an explicit emergency waiver because `npm test` is green and the patch is isolated to subscription access.

## Manual RevenueCat checklist

Before emergency build submission, manually confirm:

- iOS app bundle in RevenueCat: `com.aaronparry.adaptivestrengthcoach`
- Production iOS public SDK key in EAS env belongs to that RevenueCat iOS app.
- Entitlement id is exactly `premium`.
- Products grant `premium`:
  - `subscription_monthly_1`
  - `annual_subscription`
- Affected App Store customer has active trial/subscription entitlement in RevenueCat.
- RevenueCat restore behavior allows expected recovery/transfer for the affected customer.

## Emergency build recommendation

Current status: tests are green, but TypeScript/export/simulator verification are blocked by local toolchain hangs.

Recommendation: run the blocked checks on a clean machine or CI runner before EAS build. If user access is still broken in production and delay is unacceptable, document an emergency waiver and proceed with an iOS patch build only after RevenueCat dashboard checks are confirmed.
