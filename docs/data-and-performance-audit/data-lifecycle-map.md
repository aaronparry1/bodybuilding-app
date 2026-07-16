# Data lifecycle map

1. Onboarding constructs a canonical plan and persists a versioned carrier.
2. Train creates a recorded-session aggregate and appends lifecycle/performed-work events.
3. Projections derive Home/Train/History/Progress views from canonical snapshots, ledger, and evidence.
4. Sync can export canonical plan, ledger, evidence, settings, and retained archive payloads.
5. Restore validates payload shape and writes local canonical state; conflict and stale paths fail closed.
6. Sign-out delegates auth cleanup; a complete local sensitive-data purge/account-deletion proof is not present in the inspected repository and is a release evidence gap.
7. Retention is effectively account-lifetime for history/evidence unless an explicit deletion operation is added and verified.

No runtime repeated migration guarantee was established from static inspection; migration markers exist in saved-plan migration and should be measured once per installed dataset.
