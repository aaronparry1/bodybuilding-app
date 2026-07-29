# Migration and data preservation

## Compatible backfill

For a validated pre-repair carrier, only compatible settings are derived:

- onboarding completion;
- units;
- goal;
- experience level;
- recovery/cardio preference;
- session duration;
- starting-volume context.

The plan carrier is not rewritten for this backfill. Deterministic before/after serialization is identical. Recorded-session ledger snapshots, active attempts, cycle lineage, session IDs, prescriptions, and history are preserved.

## Owner binding

Older local carriers have no durable account-owner field. On the first authenticated repaired launch, a validated unbound local plan is associated with the currently restored authenticated user and provenance `existing_authenticated_device_migration`. This is a one-time compatibility decision; it does not claim cryptographic knowledge absent from the old schema. After binding, account switches fail closed and cannot expose, adopt, back up, or overwrite the other account's plan.

Fresh authenticated onboarding and cloud restoration write explicit owner provenance. Offline local plans remain unbound until an authenticated identity is available.

## Failure behavior

Invalid storage, failed account restoration, mismatched owner identity, and interrupted writes produce retry/recovery states. They do not clear local data and do not become new-user onboarding.

Verdict: programme/history preservation **PROVEN**; historical pre-binding ownership beyond the restored current account is inherently **NOT PROVEN**, so the migration binds once and then enforces fail-closed isolation.

