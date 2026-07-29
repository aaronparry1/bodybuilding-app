# Onboarding transaction contract

## Success invariant

One submission fingerprint may commit at most once:

1. Construct in memory through canonical construction.
2. Atomically commit the canonical carrier.
3. Bind the committed plan identity to the authenticated owner when present.
4. Persist settings with `onboardingCompleted: true`.
5. Publish canonical state.
6. Replace the route with the authenticated tabs.

The owner record uses the actual committed plan ID, including when the canonical commit preserves an existing plan identity.

## Failure invariant

If carrier construction/save fails, settings remain incomplete. If owner or settings persistence fails after the carrier save, the exact prior carrier, owner record, and settings are restored. Failure leaves answers in component state and returns the submission gate to retryable idle.

Rollback failure has a distinct typed reason and never claims success. No workout is started by onboarding.

## Interruption and replay

- Rapid taps: one enters, later taps observe `in_flight`.
- Same fingerprint after durable commit: no new programme; navigate to tabs.
- Retry after rejection: same stable attempt timestamp/plan identity.
- Restart after commit: reconciliation sees the validated plan and opens authenticated app.
- Navigation failure: committed state remains valid; “Open Programme” retries navigation only.

Verdict: **PROVEN** by atomic rollback, idempotency, single-flight, carrier identity, restart, and source-boundary tests.

