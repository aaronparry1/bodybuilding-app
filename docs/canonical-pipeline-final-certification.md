# Canonical pipeline final certification

The certification model now separates technical pipeline readiness from caller
migration:

- `pipelineReadyForSwitch` is based only on orchestration, persistence,
  malformed-state, restoration, and exact-prescription predicates.
- `productionSwitchCompleted` remains `false` until a later caller-migration
  phase.

Recorded-session restoration is implemented as a separate validation-only path.
It returns the original snapshot by identity, checks linkage/revision/status,
and rejects nested legacy authority fields. It does not import or invoke Session
Construction.

The pipeline remains not ready while the real orchestration matrix and full
repository/restoration certification are incomplete.
