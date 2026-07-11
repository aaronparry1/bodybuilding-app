# Current progression transition decision implementation

Stage 1 adds the authoritative **decision contract**, not yet the decision writer. `decideMesocycleTransition` accepts current mesocycle policy, completed microcycle evidence state, evaluated performance-based fatigue trend, and approved successor/prerequisite state. It emits only `delay`, `continue`, `deload`, `advance`, `regress`, or `review_required`.

The contract has no block ID, block order, block week, or rep-range authority. It deliberately consumes an already evaluated fatigue trend because the product-owner thresholds for extreme collapse and sustained decline remain a gate.

Stage 2: persist microcycle readiness/evidence, derive the fatigue trend from existing stored facts, and shadow-write the current decision before migrating readers. Stage 3: migrate readers and remove block decision persistence.
