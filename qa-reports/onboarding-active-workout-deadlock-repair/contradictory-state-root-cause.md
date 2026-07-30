# Contradictory-state root cause

## Exact root cause

Production uses the Router root selected by `app.config.ts`: `app-production` when `APP_ENV=production`.

Build 47 commit `dfaebe7` repaired `app/(protected)/_layout.tsx`, but the mounted production entrypoint remained:

`app-production/(protected)/_layout.tsx`
→ `src/application/shell/production-protected-layout.tsx`
→ direct `settings.onboardingCompleted` redirect.

The production onboarding route, however, re-exported the repaired onboarding implementation:

`app-production/(protected)/onboarding.tsx`
→ `app/(protected)/onboarding.tsx`
→ canonical plan/ledger guard.

Therefore two different definitions of “existing user” were mounted:

1. startup treated stale/missing compatibility metadata as first-run;
2. Create Programme treated retained canonical workout state as authoritative and refused replacement.

That split caused the circular deadlock.

## Why the workout was detected but did not prevent onboarding

The active workout was durable in `iron-logic.canonical-recorded-session-ledger-v1`. The final creation guard read it only after startup had already committed to onboarding. The production protected layout neither consumed subscription/account-data hydration nor reconciled the canonical carrier, owner record, and ledger before redirecting.

## Fault classification

- severity: **P0**
- category: mounted production entrypoint divergence / hydration-order defect
- affected configurations: retained update installs with stale or missing onboarding metadata, especially where an active workout remains
- data consequence: no demonstrated loss or mutation; access deadlock
- confidence: high
- production code change required: yes, completed in `3d52cd0`
