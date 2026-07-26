# Failure-path analysis

## Before

1. `canonical-training-method-policy.ts` created an antagonist pair ID from the
   two generated slot IDs: `method-group:${left.id}:${right.id}`.
2. Each linked member persisted the same `groupId`, plus position, group size,
   rounds, rest and policy.
3. `validateCanonicalActivePlan` accepted a migrated carrier with `groupId`
   omitted because the execution facts remained complete.
4. The old material projector built `semanticGroupMembers` only by indexing
   slots under `groupId`.
5. The complete carrier projected two member arrays; the migrated carrier
   projected none.
6. Four false `semanticGroupMembers` deltas were emitted across two sessions.
7. `applyPhaseOneDecision` treated every non-empty comparison as material,
   prepared an intent, selected the incremented revision, attempted CAS and
   constructed an `applied` receipt using the false deltas.

The defect was in semantic normalisation/group-membership derivation and was
application-capable. Validation correctly accepted the structurally complete
migrated state; removing grouped membership from material comparison would
have hidden genuine split/merge/reorder defects and was not used.

## After

The projector derives membership from ordered structural facts independently
of `groupId`. The exact migrated carrier therefore projects the same semantic
groups and yields no deltas. Ambiguous legacy shapes fail closed before intent
or CAS. Genuine membership or execution changes still reach the material,
revision, CAS and truthful receipt path.
