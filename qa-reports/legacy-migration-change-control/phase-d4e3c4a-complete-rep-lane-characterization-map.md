# D4E3C4A complete production rep/lane characterization

## Caller inventory

Rep production surfaces are `rep-range-strategy.ts:resolveRepRange`, `ad-hoc-workout-generator.ts:getGeneratedRepRange`, `extra-session-generator.ts` direct resolution, `application/settings/workout-settings.ts` direct resolution, and `data/cloud/exercise-cloud-repository.ts`'s separate row-normalization helper. Tests also exercise the exported strategy directly. Lane production surfaces are `block-training-lanes.ts:resolveTrainingLane`, `ad-hoc-workout-generator.ts:resolveGeneratedSettings`, and `getLanePrescriptionConstraints`; lane tests call the exported APIs directly. No current D4D2 caller enters these paths.

## Rep precedence graph

Observed precedence is:

1. `programmeSlotOverride`;
2. block/family/role branch, including power families and small-muscle family overrides;
3. family override;
4. normalized exercise default;
5. enabled advanced override;
6. safe fallback (`8–12`).

Within the block branch, family-specific power and small-muscle checks precede inferred role. Role is inferred from movement (`isolation`/`core` → isolation; otherwise secondary compound) when absent. Block normalization maps `strength_hypertrophy` to `powerbuilding`. Explicit overrides and family branches therefore win over block role and defaults; this collision behavior is load-bearing.

Rep winner families are: explicit override; Olympic/jump/throw power family; small-muscle family; block×role (hypertrophy, powerbuilding, strength, power, peak, deload); family default; exercise default; advanced override; safe fallback. Every winner family has direct tests or a production fixture. Corrective/recovery/resilience/capacity roles are explicit block branches; they are not generic “other”.

## Lane precedence graph

Observed precedence is block-specific: deload recovery/maintenance; peak primary/order → peak, secondary/order → strength support, else maintenance; power power-role → power, primary/strength → strength support, else maintenance; strength primary → strength, secondary → support, else maintenance; powerbuilding primary → strength, secondary → hypertrophy-strength, else hypertrophy; hypertrophy primary → hypertrophy-strength, power-role → power, else hypertrophy. `slotRole` and `plannedOrder` participate in the peak/power branches. Current lane identities are `strength`, `strength_support`, `hypertrophy_strength`, `hypertrophy`, `power`, `peak`, `maintenance`, and `recovery`.

## Coupling and generated settings

`resolveGeneratedSettings` resolves lane, then set prescription, then rep range, and projects all three into settings. `createGeneratedSlot` subsequently resolves starting load and applies lane/set constraints. Block-derived drop-off and suitability remain downstream. This means rep/lane cannot migrate independently without either a complete expanded aggregate or a caller boundary that preserves all downstream branch facts.

## Aggregate gaps

The seven-branch D4E3C3 registry lacks explicit override identity, method/family precedence, inferred-role branches, corrective/recovery/resilience/capacity roles, power-family rep precedence, peak/powerbuilding lane branches, and planned-order lane selection. It also does not represent programme/default/advanced override precedence or generated-settings duplicate authority.

## Facade classification

`resolveRepRange` and `resolveTrainingLane` remain complete compatibility façades for their current public signatures but are not complete aggregate resolvers. Extra-session/settings/cloud callers have partial facts and must either migrate after an expanded contract exists or retain their façades. `getLanePrescriptionConstraints` is a downstream lane projection, not a branch resolver. No façade receives invented defaults in this phase.

## Readiness gates

Caller migration is blocked until every precedence collision has a fixture, every lane identity is represented, public façades are classified, generated-settings coupling is modeled, and an expanded exact registry resolves all production facts. Next phases: C4B contract/registry extension; C4C precedence resolver; C4D equivalence; C4E generated-settings migration; C4F façade migration; C4G zero-hidden-authority certification.
