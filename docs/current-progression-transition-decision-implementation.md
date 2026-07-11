# Current progression transition decision implementation

Stage 1 adds the authoritative decision contract **and persistence bridge**. `decideMesocycleTransition` accepts current mesocycle policy, completed microcycle evidence state, evaluated performance-based fatigue trend, and approved successor/prerequisite state. It emits only `delay`, `continue`, `deload`, `advance`, `regress`, or `review_required`.

The contract and persisted `CurrentMesocycleDecisionRecord` have no block ID, block order, block week, or rep-range authority. The record uses schema version 1, stable plan/mesocycle/microcycle identity, structured evidence summary, lifecycle, and only outcome-relevant targets. The writer evaluates once, persists the current record first, and preserves an applied record from silent replacement. Hydration validates its schema and payload without re-evaluating, changing a plan, or creating a workout.

During the temporary bridge, `resolveCurrentDecisionFirst` returns a valid current record ahead of any legacy shadow. `current-progression-transition-legacy-shadow.ts` maps only `delay`, `continue`, `deload`, and `advance` after current persistence; `regress` and `review_required` return an explicit unsupported-shadow result. No current reader uses shadow state.

Stage 2 migrates consumers to the current resolver and applies ready decisions through their existing controlled actions. Stage 3 removes legacy decision persistence only after all legacy readers and shadow writes are gone.
