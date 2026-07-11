# Push Type Audit + Calibration v0.2

Generated: 2026-06-28T15:00:41.594Z

## Scope

Sprint 13 audits push recommendations by internal push type and calibrates V2 so a wrong micro-push is not treated the same as a wrong load-push.

This is research-lab calibration only. Production app code, V1 workout generation, V1 progression, and subscription logic were not touched.

## Push Type Risk Ranking

1. `micro_push` — lowest risk; smallest possible increase only.
2. `volume_push` — moderate risk; requires high recovery and no fatigue pressure.
3. `load_push` — higher risk; requires very strong same-exercise evidence.
4. `performance_push` — highest risk; disabled for now unless explicitly justified in future scenarios.

## Changes Made

- Extended Coaching Opportunity Audit with push-type breakdown.
- Added per-push-type metrics:
  - total count
  - correct count
  - incorrect count
  - correctness rate
  - premature count
  - missed count
  - average confidence
  - average opportunity cost
  - four-week outcome rate
  - common failure patterns
- Blocked Get Lean pushes in Simulation v0.2 until body-composition confidence is modeled strongly enough.
- Blocked Athletic Performance pushes in Simulation v0.2 until explicit power/velocity/timing evidence exists.
- Kept `performance_push` unused.
- Preserved micro-push for high-confidence strength, hypertrophy, and strength-hypertrophy cases.

## Before / After

| Metric | Before v0.2 | After v0.2 |
|---|---:|---:|
| Total decisions audited | 1040 | 1040 |
| Overall correctness | 85% | 94% |
| Four-week positive outcome rate | 59% | 59% |
| Push count | 238 | 150 |
| Push correctness | 63% | 100% |
| Premature pushes | 88 | 0 |
| Missed pushes | 20 | 20 |
| High-confidence wrong decisions | 0 | 0 |
| Total opportunity cost | 1055 | 475 |
| Average opportunity cost | 1 | 0 |
| Unnecessary recovery | 0 | 0 |

## Push Type Breakdown

| Push Type | Total | Correct | Incorrect | Correctness Rate | Premature | Missed | Avg Confidence | Avg Cost | 4w Outcome Rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `micro_push` | 150 | 150 | 0 | 100% | 0 | 9 | 81 | 0 | 37% |
| `volume_push` | 0 | 0 | 0 | 0% | 0 | 11 | 0 | 0 | 0% |
| `load_push` | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0% |
| `performance_push` | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0% |

## Which Push Type Caused Most Errors?

Before Sprint 13, every actual push in Simulation v0.2 was a `micro_push`.

That means the push-type system existed, but the simulation did not yet exercise higher-risk push categories. The bad decisions were not load-pushes or performance-pushes; they were micro-pushes being allowed in goals where the evidence should not yet support extra training stress.

After calibration:

- `micro_push` has no premature pushes in Simulation v0.2.
- `volume_push` has no actual executions, but has `11` missed opportunities according to the retrospective audit.
- `load_push` and `performance_push` remain unused.

## Did The Coach Become Too Conservative?

Not in the current simulation.

- Push count dropped from `238` to `150`, but did not collapse.
- Missed pushes stayed flat at `20`.
- Overall correctness improved from `85%` to `94%`.
- V2 still outperforms the V1 baseline in Simulation v0.2.
- V2 over-aggressive pushes remain `0`.

The coach is more selective, but not a never-push engine.

## Simulation v0.2 Snapshot

- Athletes: `20`
- Weeks: `1040`
- Verdict: `promising`
- Final V1 progress: `64`
- Final V2 progress: `71`
- Average V1 progress: `73`
- Average V2 progress: `76`
- V1 over-aggressive pushes: `220`
- V2 over-aggressive pushes: `0`
- V2 unnecessary recovery weeks: `0`
- V2 missed unsafe pain responses: `0`
- V2 under-aggressive holds: `20`
- Average V2 decision confidence: `83`

## Interpretation

The biggest calibration win was stopping V2 from treating low-confidence goal progress as permission to push.

Get Lean and Athletic Performance were the problem cases:

- Get Lean had improving training/body-composition signals, but the model still lacks enough confidence to justify pushing training stress.
- Athletic Performance had improving programmed metrics, but no timing, velocity, jump, sprint, or sensor-quality evidence.

Those should remain hold/consolidate until the lab has better goal-specific evidence modeling.

## Remaining Weaknesses

- `volume_push` and `load_push` are not meaningfully tested by Simulation v0.2.
- `volume_push` has `11` missed opportunities; the engine needs a specific unlock path for it.
- `micro_push` four-week outcome rate is only `37%`, even though recommendation-type correctness is `100%`; push-type outcome scoring needs deeper analysis.
- `performance_push` is effectively disabled, which is appropriate for now but must eventually be validated.
- The retrospective ideal action is still heuristic.

## Recommended Next Tuning

1. Add Simulation v0.3 scenarios that deliberately create:
   - valid `volume_push`
   - valid `load_push`
   - invalid load-push temptation
   - performance-push temptation that should be blocked
2. Separate push correctness from push outcome quality.
3. Build a `volume_push` unlock rule:
   - high recovery
   - stable/improving goal progress
   - no density warning
   - high quality-volume confidence
4. Keep `load_push` rare:
   - same exercise
   - repeated success
   - high target-range completion
   - no recent deload/recovery compression
5. Keep `performance_push` disabled until a future peaking/performance validation sprint.

## Open Aaron Decisions

- Should `volume_push` be allowed before `load_push`, even for strength goals?
- Should Get Lean ever permit a push from training evidence alone, or require body-composition confidence?
- Should Athletic Performance require explicit jump/sprint/velocity data before push?
- Should `performance_push` remain disabled until a dedicated meet-prep/peaking simulation exists?

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
