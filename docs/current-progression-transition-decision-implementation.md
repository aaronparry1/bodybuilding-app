# Current progression transition decision implementation

Stage 1 adds the authoritative decision contract **and persistence bridge**. `decideMesocycleTransition` accepts current mesocycle policy, completed microcycle evidence state, evaluated performance-based fatigue trend, and approved successor/prerequisite state. It emits only `delay`, `continue`, `deload`, `advance`, `regress`, or `review_required`.

The contract and persisted `CurrentMesocycleDecisionRecord` have no block ID, block order, block week, or rep-range authority. The record uses schema version 1, stable plan/mesocycle/microcycle identity, structured evidence summary, lifecycle, and only outcome-relevant targets. The writer evaluates once, persists the current record first, and preserves an applied record from silent replacement. Hydration validates its schema and payload without re-evaluating, changing a plan, or creating a workout.

During the temporary bridge, `resolveCurrentDecisionFirst` returns a valid current record ahead of any legacy shadow. `current-progression-transition-legacy-shadow.ts` maps only `delay`, `continue`, `deload`, and `advance` after current persistence; `regress` and `review_required` return an explicit unsupported-shadow result. No current reader uses shadow state.

`regress` was rejected as a current outcome: rebuilding must be an explicitly approved successor or produce `review_required`. Phase 11A.2A now supplies only pure planned-role evaluability; it does not persist evidence or apply decisions. Stage 2 migrates consumers after the remaining readiness producer exists.

## Phase 11A.2C2 context boundary

Current mesocycle exposure now reads only retained readiness snapshots and explicit mesocycle policy. Current successor context retains graph-approved candidates without choosing one. Objective conclusion remains `insufficient_policy` unless a machine-evaluable current objective policy is supplied. The canonical producer and writer integration remain deferred to C3.
