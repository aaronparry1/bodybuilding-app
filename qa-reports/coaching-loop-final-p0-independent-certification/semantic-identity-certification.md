# Semantic-identity certification

Verdict: **CONTRADICTED**. Confidence: high.

Production path:

1. `compareCanonicalMaterialPrescriptions` projects a grouped method's stable
   member set by first reading the generated `methodStructure.groupId`.
2. A missing `groupId` omits `semanticGroupMembers` even when `method`,
   `kind`, `position`, `groupSize`, `rounds`, rest, exercise IDs and slot order
   remain unchanged.
3. `applyPhaseOneDecision` treats the resulting non-empty comparison as
   material, prepares an application intent, performs carrier CAS, and builds
   an `applied` receipt.

Independent probe:

- constructed `powerbuilding_hypertrophy`, Microcycle 4 through canonical
  Session Construction;
- copied the carrier and deleted only generated grouped-method `groupId`
  values;
- confirmed both the complete and partially populated carriers are accepted by
  `validateCanonicalActivePlan`;
- compared migrated → regenerated state;
- received four
  `slots[*].methodStructure.semanticGroupMembers` material deltas across two
  sessions.

This is not a changed pairing. The linked positions, exercises, policy,
rounds, group size and execution method remain the same. The generated
persistence identity is the only removed field.

Representative adversarial command:

`npx vitest run tests/independent-final-p0-group-probe.test.ts --reporter=verbose`

The temporary audit test failed as designed and was removed without retaining
a repository test change.

Affected configurations: accepted migrated/partially populated grouped-method
v3 snapshots followed by reconstructive application.
