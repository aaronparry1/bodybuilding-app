# D4E3C4D4 final compatibility decision boundary map

## Boundary

The existing generated-settings convergence point is `resolveGeneratedSettings` in `ad-hoc-workout-generator.ts`. D4E3C4D4 adds `resolveCompatibilityFinalRepLaneDecision` immediately before set prescription. It invokes the existing lane and rep helpers, validates/copies their final values into an immutable internal decision, and generated settings projects `decision.repRange` and the resolved lane.

## Preserved authority

No precedence or formula moved. Existing role mapping, block/family handling, duration handling, rep ranges, lane identities, set prescription, load, drop-off, and suitability remain selected by their existing helpers. The decision object records ownership as `helper_resolution`; it does not claim v2 authority identities or infer hidden precedence.

## Scope and rollback

The decision is internal, non-persisted, and v2-free. If output equivalence fails, revert only the decision assembly/projection and retain the existing helper sequence. Public façades remain unchanged; set/load/drop-off/suitability migration remains deferred.
