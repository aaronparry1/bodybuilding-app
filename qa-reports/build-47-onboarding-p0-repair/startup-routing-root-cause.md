# Startup routing root cause

## Before

The mounted sequence allowed navigation to evaluate while account restoration was still fire-and-forget:

`AuthProvider` → `SubscriptionProvider` starts restore without a consumable state → protected layout reads default/stale settings → layout checks `onboardingCompleted` → redirect to onboarding.

Two guards made the failure deterministic under the wrong timing:

- `app/(protected)/_layout.tsx` redirected when `onboardingCompleted` was false before plan reconciliation could establish plan authority.
- `reconcileCanonicalReleaseState` returned `onboarding_required` for that flag before reading and validating the canonical carrier.

A failed remote settings read was also indistinguishable from an empty account, so failure could look like first run.

## After

The mounted order is:

authenticated identity restoration → account-data hydration state → canonical local-plan lookup → owner-scope validation → canonical reconciliation → optional metadata backfill → route.

A validated canonical plan outranks missing compatible onboarding metadata. A temporary read/restore error yields a retry or recovery state, never a new-user decision. When an unbound pre-repair plan exists on an authenticated device, it is bound once to the current authenticated identity; later account mismatch fails closed.

The valid carrier is not regenerated merely to backfill settings. Automated snapshots prove its serialized bytes and ledger history remain unchanged.

## Build 47 lineage

No release-schema or release-metadata change at Build 47 alone explains the defect. Build 47 exposed a pre-existing precedence and hydration-order fault: a newly absent/stale compatibility flag could win before the actual programme authority was ready.

