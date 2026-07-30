# Authority and hydration trace

## Repaired mounted route

```text
app-production/(protected)/_layout.tsx
  → ProductionProtectedLayout
  → useAuth()
  → useSubscription().dataHydrationStatus
  → inspectCanonicalRetainedTrainingPresence(authenticated user)
       → canonicalActivePlanV2Repository.get()
       → canonicalRecordedSessionLedger.inspectActive()
       → canonicalActivePlanOwnerRepository.get()
  → resolveCanonicalStartupHydration()
  → reconcileCanonicalReleaseState()
       → safe legacy-owner binding where authorised
       → canonical plan/ledger identity reconciliation
  → resolveCanonicalExistingUserRoute()
       → active workout: Train
       → valid plan: authenticated tabs
       → conclusive absence: onboarding
       → unreadable/mismatch: recovery
```

## Hydration ordering

| State | Result |
| --- | --- |
| Authentication pending | wait |
| Account restore pending | wait |
| Active ledger arrives before parent carrier | wait while restore is active; recovery if restore finishes unresolved |
| Carrier arrives before ledger that its active pointer requires | recovery until ledger can be restored |
| Onboarding metadata arrives first | it cannot decide first-run independently |
| Valid plan plus stale onboarding flag | authenticated tabs |
| Valid resumable workout plus stale onboarding flag | Train |
| Plan/ledger read failure | actionable recovery/retry |
| Account mismatch | fail closed |
| Conclusive absence after hydration | onboarding |

## Transaction and ownership boundary

`inspectCanonicalRetainedTrainingPresence` is read-only. Ownership binding remains in `reconcileCanonicalReleaseState`, where an unowned legacy carrier may be bound once to the authenticated account using the established migration rule. Plan, cycle, session, prescription, history, and performed-work data are not rewritten.

## Authority count

- mounted coaching authorities: **1**
- competing coaching authorities: **0**
- UI adaptation authorities: **0**

The routing repair introduces no coaching or prescription authority.
