# Aggregate-driven compatibility rep and lane migration

D4E3C4 is currently blocked by an honest API and branch-coverage mismatch. The existing production rep path accepts block type plus role/family/movement and applies explicit slot overrides, family overrides, defaults, advanced overrides, inferred roles, and several role-specific branches. The lane path also depends on block type, role, slot role, and planned order, producing identifiers not represented by the seven D4E3C3 aggregate branches.

Because `resolveGeneratedSettings` resolves lane before set prescription and the same path still feeds block-dependent set/load/drop-off/suitability behavior, migrating rep or lane in isolation would either invent missing branch facts, stitch incompatible sub-policies, or risk compatibility output drift. Public helpers in extra-session generation and workout settings have similarly incomplete inputs.

Therefore no production rep/lane caller was changed, no fallback was added, and the D4E3C3 registry remains unchanged. The next safe phase must characterize the missing family/role/override and lane-order branches and choose one complete aggregate boundary before caller migration. Set, load, drop-off, shutdown, and suitability remain deferred.
