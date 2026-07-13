# D4E3C4 rep/lane caller migration map — blocked

## Classified callers

| Caller | Classification | Current dependency | Migration status |
|---|---|---|---|
| `ad-hoc-workout-generator.ts:getGeneratedRepRange` | production compatibility | `TrainingBlock`, role, family, movement, overrides/defaults | blocked: complete branch facts and precedence are not available at this helper boundary |
| `ad-hoc-workout-generator.ts:resolveGeneratedSettings` | production compatibility | resolves lane, then set policy, then rep policy | blocked: one aggregate would need to replace a coupled sequence without migrating set/load dependencies |
| `ad-hoc-workout-generator.ts:createGeneratedSlot` | production compatibility seam | owns generated settings and load handoff | deferred; D4E3C4 must not route the seam |
| `extra-session-generator.ts` | compatibility caller | direct `resolveRepRange` with partial facts | blocked: no complete aggregate key |
| `workout-settings.ts` | settings compatibility caller | direct `resolveRepRange` | blocked: public façade lacks block/session/history/loading dimensions |
| `rep-range-strategy.test.ts` | direct test API | block, role, family, movement, fallback precedence | remains façade characterization |
| `block-training-lanes.test.ts` | direct test API | block, role, slot order | remains façade characterization |

## Exact blockers

The D4E3C3 registry has seven semantic branch families, but production rep resolution has additional load-bearing dimensions and branches: explicit slot override, family overrides (`calf_raise`, corrective/core, forearm/adductor/abductor, power families), exercise defaults, advanced overrides, inferred roles, and roles including corrective, recovery, resilience, capacity, and power. A direct migration would either omit those facts or invent a registry branch.

Production lane semantics also do not equal the aggregate lane IDs: current outputs include `hypertrophy_strength`, `hypertrophy`, `strength`, `strength_support`, `power`, `peak`, `maintenance`, and `recovery`, selected by block, role, slot role, and planned order. The aggregate registry currently names compatibility lanes by exercise class and does not represent peak/powerbuilding or planned-order branches.

The generated-settings path resolves lane before set prescription and rep before set construction, while starting load and drop-off still consume block-derived inputs. Migrating only rep/lane would require a shared aggregate at a boundary that currently lacks all branch facts and would risk changing set/load behavior. Public direct helpers likewise cannot honestly resolve the complete aggregate from their existing signatures.

## Decision

No production caller is migrated in D4E3C4. Existing façades and outputs remain unchanged. The registry is not expanded with a wildcard or speculative branches. D4E3C5 must first characterize the missing role/family/override branches and define the exact coordinated aggregate boundary, or explicitly split façade-only compatibility APIs from the generated-slot migration.
