# D4E3C4D10C2 — training-lane characterization harness map

The canonical selector is `resolveTrainingLane` in `src/domain/training/block-training-lanes.ts`. It is a primitive exported façade used by generated-settings and other training helpers. The harness covers all current reachable block/role branches (17 fixtures, 13 distinct lane identities), planned-order boundary behavior, malformed/nullish tolerance and input immutability.

The final lane authority is not inferred: fixtures classify only value observability. Planned order is known to affect the peak first-order branch, but authority provenance is not asserted by this harness. No production code changed.

Candidate stop conditions: any new failure ID, fixture lane change, property-presence change, fallback change, invocation-count change or generated-settings drift. Preserve the candidate patch and deltas before rollback.
