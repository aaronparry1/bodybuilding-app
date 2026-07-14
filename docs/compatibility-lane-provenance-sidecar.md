# Compatibility lane provenance sidecar

D4E3C4D10C3 determined that an external sidecar is not viable under the no-inference/no-duplicate-evaluation rules. `resolveTrainingLane` exposes only a primitive result, so provenance cannot be captured test-side without reconstructing precedence. No production change was applied and the 17-fixture baseline remains authoritative.

The candidate capture directory records the required pre-rollback artifacts. A future experiment must add one branch-local observation hook while leaving primitive projection untouched.
