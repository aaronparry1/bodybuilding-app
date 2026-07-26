# Semantic identity and material delta

Production entrypoint: `applyPhaseOneDecision` in
`src/application/training/canonical-progress-decision-application.ts`.

## Identity classes

- Stable targeting identity: plan session index, session role/kind, slot
  index, canonical exercise ID, and semantic linked-group membership.
- Generated persistence identity: session/prescription/slot/carrier/group IDs,
  operational identity, timestamps and revisions.
- Material demand: exercise identity, exact targets, prescribed set settings,
  load state/base load/loading mode, rest, method semantics, progression,
  stop rule and substitution constraints.

Generated fields are removed recursively before comparison. Linked-method
group IDs are replaced by the sorted semantic member set, so a regenerated ID
is ignored while a changed pairing remains material. The projection is sorted,
the recursive comparator is symmetric, and equivalent ordering is normalised.

Before: two longitudinal transactions were `applied` solely because
`methodStructure.groupId` changed. After: **0** generated-ID-only applications;
the mechanically applied count falls from 157 to the truthful 155, while the
same two cases become explicit no-change results.

Representative test:
`tests/canonical-material-prescription-identity.test.ts` (17 field-level,
symmetry and normalisation cases), plus replay/concurrency cases in
`tests/canonical-coaching-loop-p0.test.ts`.
