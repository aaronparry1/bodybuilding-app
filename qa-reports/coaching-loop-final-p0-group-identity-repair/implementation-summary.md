# Grouped-method identity P0 repair

Starting commit: `9025e483e38b868af0d89ef5ffac37fbfd63f90d`.

## Correction

`compareCanonicalMaterialPrescriptions` now derives ordered grouped membership
from canonical session structure: session-local slot order, exercise semantic
identity, method kind, method, group size and member position. A generated
`methodStructure.groupId` remains a storage/migration aid, but its presence,
absence or regeneration is not material training meaning.

If neither the canonical structural facts nor a surviving legacy group identity
can establish membership, comparison returns the typed
`grouped_method_semantics_ambiguous` result. The application coordinator
persists a blocked no-change receipt and does not prepare an intent, perform
CAS, increment the revision or claim changed demand.

Production entrypoints:

- Session Construction: `applyCanonicalTrainingMethodPolicy`
- comparison: `compareCanonicalMaterialPrescriptions`
- application: `applyCanonicalProgressDecision` → `applyPhaseOneDecision`

Focused evidence:

- exact independent probe:
  `tests/canonical-coaching-loop-p0.test.ts`
- 30 requested grouped field-isolation conditions:
  `tests/canonical-grouped-method-semantic-identity.test.ts`
- existing identity controls:
  `tests/canonical-material-prescription-identity.test.ts`

Focused protected regression result: 11 files, 116 tests passed. TypeScript
passed. No coaching policy, method semantics, numeric progression, release
metadata, build or deployment behaviour changed.
