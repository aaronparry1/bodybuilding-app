# Remaining-P0 continuity remediation

Starting commit: `7a5a21d40240fab407dbb17a47324dbedda32ff2`

## RB-P0-01 — truthful application

Future carrier output is compared through
`canonical_material_prescription_delta_v1` before the carrier CAS. Current v2
receipts require exact material deltas for `applied`; semantic no-ops retain the
revision and persist `material_prescription_delta_absent`. Projections and
completion instructions use the committed result rather than evaluator intent.

## RB-P0-02 — safe continuity

`canonical_cycle_boundary_resolution_v1` composes existing Mesocycle horizons
and approved successors. It continues partial/ordinary boundaries, constructs
the existing approved successor atomically when eligible, and emits a
resolvable typed review at a maximum horizon without an approved successor.
An approved successor that cannot produce a compatible session is not falsely
reported as transitioned: the application continues the current phase within
its existing maximum horizon, or records a blocked no-change receipt at that
maximum.
Session Construction remains the exact future-prescription owner.

## RB-P0-03 — completion reconciliation

Ledger completion now durably records a pending coaching operation before
derived evidence. Missing performance/completion evidence is reconstructed only
from immutable ledger facts at duplicate completion or protected-layout
startup. Contextual evidence is never invented. Deterministic evidence,
decision, operation, carrier CAS, and receipt identities converge under retry.

## Scope

No new numeric progression/regression, volume, recovery, deload, substitution,
method, UI redesign, release metadata, build, upload, or deployment is included.
The remaining P1–P3 limitations are recorded separately.

## Production and proof map

| Finding | Mounted entrypoint | Persisted state | Primary proof |
| --- | --- | --- | --- |
| RB-P0-01 truthful application | `canonicalActivePlanState.applyProgressDecision` → `applyCanonicalProgressDecision` | canonical plan carrier CAS + `canonical_coaching_application_receipt_v2` | `tests/canonical-coaching-loop-p0.test.ts` material/no-op/replay cases |
| RB-P0-02 boundary continuity | `orchestrateCanonicalPostWorkoutAdaptation` → `evaluateCanonicalPostWorkoutProgress` → `applyPhaseOneDecision` | carrier cycle lineage, future snapshots, boundary resolution, receipt | boundary, successor, fallback, limited-equipment, limitation, and Home/Plan/Train cases |
| RB-P0-03 evidence reconciliation | `completeCanonicalSession` and protected-layout startup → `reconcileCanonicalCompletedSessionEvidence` | completed ledger, deterministic evidence, `canonical_coaching_attempt_v1`, decision and receipt | evidence/decision/CAS/receipt fault-injection and restart cases |
