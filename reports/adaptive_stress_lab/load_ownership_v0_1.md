# Load Ownership Calibration v0.1

Generated: 2026-06-28T16:47:31.008Z

## Scope

Sprint 15 introduces a lab-only `LoadOwnership` concept for calibrating meaningful load increases over the long term.

This is not user-facing. It exists only for the coach. Production app code, V1 workout generation, V1 progression, subscription logic, and EAS builds were not touched.

## Philosophy

A successful load increase is not when a heavier weight is lifted once.

A successful load increase is when the athlete owns the new weight.

## Load Ownership States

| State | Meaning | Coaching Implication |
| --- | --- | --- |
| `not_attempted` | No load increase has been introduced. | Normal push eligibility can decide whether to introduce one. |
| `introduced` | The new load was attempted but has no follow-up evidence yet. | Do not stack another meaningful load push. |
| `unstable` | New load created repeated misses, shutdowns, safety issues, or poor recovery response. | Reduce, hold, or consolidate locally. |
| `stabilising` | New load is trending acceptably but ownership is not proven. | Consolidate the load. |
| `owned` | Repeated comparable exposures show target-range success without safety or recovery cost. | Another meaningful load push may be considered if the broader Coaching State allows it. |

## Ownership Criteria

Ownership is inferred from:

- successful comparable exposures
- target-range success
- shutdown frequency
- below-minimum events
- recovery response
- safety status
- trend stability
- confidence and derived evidence quality

One successful exposure is never enough.

## Validation Statistics

| Metric | Value |
| --- | ---: |
| Attempts | 10 |
| Ownership success rate | 20% |
| Failed ownership rate | 30% |
| Average ownership time | 4 weeks |
| Failed ownership attempts | 3 |
| Unnecessary load pushes | 0 |
| Delayed load pushes | 0 |
| Average recommendation quality | 98 |
| Confidence change proxy | -1 |
| Long-term goal progress proxy | 60 |

## State Counts

| State | Count |
| --- | ---: |
| `not_attempted` | 1 |
| `introduced` | 1 |
| `unstable` | 3 |
| `stabilising` | 3 |
| `owned` | 2 |

## Attempt Details

### `owned_after_three_exposures`

- Expected state: `owned`
- Actual state: `owned`
- Confidence: 84
- Observations: 4
- Successful comparable exposures: 4
- Target-range success: 100%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: The load is owned. Another meaningful load push may be considered if the broader Coaching State allows it.
- Unnecessary load push: no
- Delayed load push: no

### `introduced_no_follow_up`

- Expected state: `introduced`
- Actual state: `introduced`
- Confidence: 55
- Observations: 0
- Successful comparable exposures: 0
- Target-range success: 0%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: Wait for comparable exposures before considering another meaningful load push.
- Unnecessary load push: no
- Delayed load push: no

### `stabilising_two_good_exposures`

- Expected state: `stabilising`
- Actual state: `stabilising`
- Confidence: 73
- Observations: 2
- Successful comparable exposures: 2
- Target-range success: 100%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: Consolidate the new load before another meaningful load push.
- Unnecessary load push: no
- Delayed load push: no

### `unstable_below_range_repeated`

- Expected state: `unstable`
- Actual state: `unstable`
- Confidence: 87
- Observations: 3
- Successful comparable exposures: 0
- Target-range success: 0%
- Shutdowns: 0
- Below-minimum events: 3
- Safety issues: 0
- Transition: Do not push load again. Reduce, hold, or consolidate locally.
- Unnecessary load push: no
- Delayed load push: no

### `unstable_shutdowns`

- Expected state: `unstable`
- Actual state: `unstable`
- Confidence: 87
- Observations: 3
- Successful comparable exposures: 1
- Target-range success: 33%
- Shutdowns: 2
- Below-minimum events: 0
- Safety issues: 0
- Transition: Do not push load again. Reduce, hold, or consolidate locally.
- Unnecessary load push: no
- Delayed load push: no

### `stabilising_recovery_cost`

- Expected state: `stabilising`
- Actual state: `stabilising`
- Confidence: 80
- Observations: 3
- Successful comparable exposures: 3
- Target-range success: 100%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: Consolidate the new load before another meaningful load push.
- Unnecessary load push: no
- Delayed load push: no

### `owned_slow_four_weeks`

- Expected state: `owned`
- Actual state: `owned`
- Confidence: 84
- Observations: 4
- Successful comparable exposures: 4
- Target-range success: 100%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: The load is owned. Another meaningful load push may be considered if the broader Coaching State allows it.
- Unnecessary load push: no
- Delayed load push: no

### `not_attempted_baseline`

- Expected state: `not_attempted`
- Actual state: `not_attempted`
- Confidence: 80
- Observations: 0
- Successful comparable exposures: 0
- Target-range success: 0%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 0
- Transition: No ownership process started.
- Unnecessary load push: no
- Delayed load push: no

### `safety_blocks_ownership`

- Expected state: `unstable`
- Actual state: `unstable`
- Confidence: 81
- Observations: 2
- Successful comparable exposures: 2
- Target-range success: 100%
- Shutdowns: 0
- Below-minimum events: 0
- Safety issues: 1
- Transition: Do not push load again. Reduce, hold, or consolidate locally.
- Unnecessary load push: no
- Delayed load push: no

### `mixed_evidence_stabilising`

- Expected state: `stabilising`
- Actual state: `stabilising`
- Confidence: 88
- Observations: 3
- Successful comparable exposures: 2
- Target-range success: 67%
- Shutdowns: 0
- Below-minimum events: 1
- Safety issues: 0
- Transition: Consolidate the new load before another meaningful load push.
- Unnecessary load push: no
- Delayed load push: no

## Recommendation Quality

- Load pushes are allowed only when ownership is `not_attempted` or `owned`.
- `introduced`, `stabilising`, and `unstable` block another meaningful `load_push` or `performance_push`.
- This creates the first lab guardrail against stacking load increases before the previous increase has proved itself.

## Weaknesses

- The model uses synthetic follow-up exposures, not real athlete histories.
- Confidence change is a proxy, not validated psychology.
- Average ownership time is based on four-week validation windows only.
- The model does not yet differentiate exercise-specific ownership requirements. A deadlift load increase may need stricter ownership than a machine press.
- It does not yet model plate jump size, bodyweight changes, or peaking blocks in enough detail.

## Recommended Tuning

1. Add exercise-specific ownership thresholds.
2. Treat high-systemic-cost lifts as requiring stronger ownership before another load push.
3. Compare ownership success against long-horizon Simulation v0.2 and targeted Simulation v0.3.
4. Add “owned but costly” as a possible future state if a load is successful but recovery cost is too high.
5. Decide whether `performance_push` should require `owned` state for the exact exercise.

## Open Aaron Decisions

1. Should `owned` require three successful comparable exposures for every lift, or should compounds require four?
2. Should high-rep hypertrophy load jumps use the same ownership rules as strength lifts?
3. Should `stabilising` allow `volume_push`, or only `hold` / `consolidate`?
4. Should `unstable` always reduce load, or can it sometimes hold if confidence is low?
5. Should ownership be tracked per exercise, per movement pattern, or both?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
