# Paywall and Trial Flow

## Access Model

Adaptive Strength Coach uses a value-before-paywall model.

Free users can:

- create an account or use offline/local mode
- complete onboarding
- generate a plan preview
- view limited plan summary and roadmap
- open the Training System Guide
- access Settings and Account
- open the paywall
- restore purchases
- access legal/support surfaces

Premium or trial users can:

- start planned workouts
- log workouts
- complete Workout Review
- receive adaptive progression recommendations
- use Strength Dashboard and e1RM tracking
- use PR tracking
- use Advanced Reports
- use Recovery & Capacity guidance
- use branded social share cards

## Paywall Placement

The paywall is placed after onboarding and plan generation, before the first real coached workout.

This means the user can see the plan value first, then start a 14-day trial when they try to train or open premium reporting.

Primary gated surfaces:

- Train
- active workout logging
- Workout Review through workout completion
- Progress premium reports and dashboards

Allowed without premium:

- onboarding
- Plan preview
- Settings
- Account
- subscription screen
- restore purchases
- legal/support

## Entitlement Gates

The app uses the central subscription context as the only access layer:

- `useSubscription()`
- `usePremiumAccess()`
- `PremiumRequiredScreen`

The gate reads `isPremium` from normalized subscription state. Trial, active, lifetime, and valid offline-cached premium states allow access.

RevenueCat remains the entitlement source of truth. Supabase is not the billing authority.

## Trial Messaging

Primary message:

```text
Start your adaptive strength plan
```

Supporting message:

```text
Get evidence-based workouts that adjust to your performance, recovery, and progress.
```

Trial CTA:

```text
Start 14-Day Free Trial
```

The app does not hardcode final prices. RevenueCat and the stores provide product pricing and trial eligibility.

## Paywall Content

The paywall highlights:

- Adaptive progression
- Evidence-based set and rep targets
- Strength Dashboard and e1RM tracking
- PR tracking
- Recovery & Capacity guidance
- Powerlifting Meet mode
- Advanced progress reports

It also includes:

- monthly plan
- annual plan
- annual savings badge when both prices are available
- Restore Purchases
- retry products
- Terms
- Privacy
- note that subscriptions are managed through App Store / Google Play

## Product Handling

Configured products:

```text
subscription_monthly_1
annual_subscription
```

Entitlement:

```text
premium
```

If RevenueCat products are unavailable, the paywall should show a calm products-unavailable state and allow retry/restore. It should not display fake final prices as real.

## Restore Flow

Restore is available from:

- Paywall
- Settings
- Account

Restore updates the central subscription state and local entitlement cache when successful.

Restore failure shows a user-readable error and does not affect training data.

## Trial and Subscription State

The UI can display:

- free
- trial active
- trial end date when RevenueCat provides one
- premium active
- expired/inactive
- offline cached entitlement

Temporary network/store outages do not immediately remove premium access if a valid non-expired premium entitlement was recently cached.

## Error States

Handled states:

- purchase cancelled
- purchase failed
- restore failed
- products unavailable
- no internet
- entitlement refresh failed
- RevenueCat unavailable
- store unavailable

Copy should stay calm and avoid implying the user has been charged unless RevenueCat confirms purchase success.

## Store Setup Dependencies

Before live release:

- Create App Store product `subscription_monthly_1`.
- Create App Store product `annual_subscription`.
- Create Google Play product `subscription_monthly_1`.
- Create Google Play product `annual_subscription`.
- Attach both products to RevenueCat entitlement `premium`.
- Configure default/current RevenueCat offering.
- Configure 14-day trial/introductory offer in the stores where available.
- Add public SDK keys to the build environment.

No fake final prices should be added to the app code.
