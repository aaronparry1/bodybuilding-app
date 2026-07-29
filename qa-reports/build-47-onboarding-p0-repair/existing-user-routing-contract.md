# Existing-user routing contract

Routing precedence is deterministic:

1. Wait while authentication is loading.
2. If an authenticated user has no local plan and account restore is running, wait.
3. If account restore fails without a local plan, show retry; do not infer onboarding.
4. If a valid local canonical plan exists, validate account ownership and expose it even when compatible onboarding metadata is absent.
5. Backfill only fields truthfully derivable from that validated carrier.
6. If no plan exists and onboarding is incomplete, show onboarding.
7. If onboarding is marked complete but no plan exists, show setup.
8. If plan or ownership data is invalid or mismatched, fail closed with recovery guidance.
9. A Settings-originated `restart=1` is the only explicit full-setup bypass for an existing valid plan.

## Account isolation

An owner record stores plan ID, authenticated user ID, binding time, and provenance. A plan bound to another account is neither displayed nor included in that account's cloud backup. Cloud restore cannot overwrite an unbound existing local programme or restore account-scoped data over a mismatch.

## Verdict

Production contract: **PROVEN** by `reconcileCanonicalReleaseState`, `resolveCanonicalStartupHydration`, owner-repository tests, restore tests, restart tests, duplicate-effect tests, and preserved carrier/ledger snapshots.

