# Push Decision Policy v0.3

Generated: 2026-06-28T16:47:31.301Z

## Scope

Sprint 18 turns Push Outcome Learning v0.2 into an explicit lab-only Push Decision Policy.

This is research-only. It does not touch production app code, V1 workout generation, V1 progression, subscription logic, RevenueCat, or EAS build configuration.

## Core Principle

No push type is automatically safe.

Every push must be goal-specific, context-specific, and evidence-earned.

Synthetic outcome learning remains advisory only. It can inform policy design, but it does not automatically mutate the Decision Engine.

## Policy Inputs

- goal
- derived evidence quality
- recovery capacity
- momentum
- adaptation
- confidence
- Safety Gate status
- goal-progress evidence
- same-exercise successful exposures
- load ownership state
- quality-volume trend
- workload density
- recent shutdowns
- pain flags
- missed ranges
- swap/new-exercise uncertainty
- advisory outcome-learning context

## Base Push Blockers

A push is blocked if any of these are present:

- Safety Gate is not clear
- evidence quality below 90
- fewer than 3 same-exercise successful exposures
- recovery capacity below 80
- momentum below 75
- adaptation below 75
- confidence below 70
- no repeated positive push signal
- recent shutdown or pain
- recent missed range
- swap/new-exercise uncertainty
- recent recovery compression
- high workload-density warning

## Goal-Specific Behaviour

### Strength

- Prefer `load_push` only when previous load is owned or not yet blocked by ownership state and same-exercise evidence is strong.
- `micro_push` is allowed only when it supports the strength lift without creating fatigue debt.
- `volume_push` remains rare and targeted.

### Build Muscle

- Prefer `volume_push` when quality-volume trend is positive, target-range completion is high, and recovery is strong.
- `micro_push` is not automatic.
- `load_push` still requires ownership, top-end target-range success, and a sensible jump.

### Build Muscle + Strength

- Choose `volume_push` or `load_push` based on whether the limiting factor is quality stimulus or load ownership.
- Do not push both at once.

### Get Lean

- Push is conservative and performance-preservation led.
- Volume push is blocked unless future evidence explicitly supports it.
- Weak body-composition confidence cannot justify push.

### Athletic Performance

- No push without explicit power, dynamic, or milestone evidence.
- No bar-speed claims without sensors.
- `performance_push` requires a deliberate milestone context.

### Maintenance

- Push only when user goal and evidence justify it.
- Otherwise hold or consolidate.

## Push Type Policy

| Push Type | Role | Main Requirements |
| --- | --- | --- |
| `micro_push` | Smallest possible increase | Strong evidence, clear safety, good recovery; blocked for Get Lean unless performance preservation is excellent. |
| `volume_push` | Add productive work | Muscle-building goal, quality-volume tolerance, 4+ same-exercise exposures, high target-range completion, no high recovery cost. |
| `load_push` | Increase actual load | Strength-relevant goal, 3+ same-exercise exposures, 3+ top-end successes, sensible jump, strength progress support. |
| `performance_push` | Planned milestone | Rare; 5+ same-exercise exposures, stable block, exceptional evidence, explicit milestone opportunity. |

## Policy Scenario Results

- Total policy scenarios: 44
- Passed against expected category: 44
- Failed against expected category: 0
- Pushes allowed by policy: 27
- Pushes blocked or non-push cases: 17

- No Sprint 18 policy scenario failures.

## Push Type Distribution In Policy Scenarios

| Output | Count |
| --- | ---: |
| `volume_push` | 9 |
| `hold` | 8 |
| `load_push` | 8 |
| `consolidate` | 5 |
| `micro_push` | 4 |
| `performance_push` | 4 |
| `reduce` | 3 |
| `stop_movement` | 2 |
| `recover` | 1 |

## Allowed Push Examples

- `v14_volume_hypertrophy_high_tolerance` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_quality_volume_rising` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_stimulus_stalled_recovery_high` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_after_recovery_week_return` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_powerbuilding_volume_bias` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_more_quality_work_not_load` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_high_volume_tolerance_accessory` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_volume_good_recovery_no_density_warning` — allowed `volume_push`; actual recommendation `volume_push`; confidence 76.
- `v14_load_strength_owns_top_range` — allowed `load_push`; actual recommendation `load_push`; confidence 78.
- `v14_load_powerbuilding_ready` — allowed `load_push`; actual recommendation `load_push`; confidence 78.
- `v14_load_small_sensible_jump` — allowed `load_push`; actual recommendation `load_push`; confidence 78.
- `v14_load_repeated_bench_top_end` — allowed `load_push`; actual recommendation `load_push`; confidence 78.

## Blocked Push / Downgrade Examples

- `v14_volume_inappropriate_poor_recovery` — policy `none`, recommendation `hold`; blocked because Recovery capacity 65 is below 80. Momentum 68 is below 75. Recent recovery compression exists.
- `v14_volume_inappropriate_cut_low_confidence` — policy `none`, recommendation `hold`; blocked because Performance push is only available for strength, powerlifting, or athletic-performance contexts. No explicit milestone opportunity. Stable block is shorter than 8 weeks.
- `v14_volume_inappropriate_workload_density` — policy `none`, recommendation `reduce`; blocked because High workload-density warning exists.
- `v14_volume_inappropriate_recent_missed_range` — policy `none`, recommendation `reduce`; blocked because Safety Gate is not clear. Confidence 66 is below 70. Recent missed-range evidence exists.
- `v14_load_inappropriate_pattern_only` — policy `none`, recommendation `hold`; blocked because Same-exercise successful exposures 2 is below 3.
- `v14_load_inappropriate_recent_swap` — policy `none`, recommendation `consolidate`; blocked because Swap or new-exercise uncertainty exists.
- `v14_load_inappropriate_shutdown` — policy `none`, recommendation `reduce`; blocked because Safety Gate is not clear. Recovery capacity 52 is below 80. Recent shutdown or pain evidence exists.
- `v14_load_recovery_compressed_consolidate` — policy `none`, recommendation `consolidate`; blocked because Recent recovery compression exists.
- `v14_load_pain_flag_blocks_push` — policy `none`, recommendation `stop_movement`; blocked because Safety Gate is not clear. Recovery capacity 0 is below 80. Confidence 55 is below 70.
- `v14_performance_inappropriate_one_good_session` — policy `none`, recommendation `hold`; blocked because Evidence quality 73 is below the push floor of 90. Same-exercise successful exposures 1 is below 3.
- `v14_performance_inappropriate_hidden_fatigue` — policy `none`, recommendation `consolidate`; blocked because Safety Gate is not clear. Recovery capacity 52 is below 80. Recent recovery compression exists.
- `v14_performance_blocked_by_safety_caution` — policy `none`, recommendation `stop_movement`; blocked because Safety Gate is not clear. Recovery capacity 0 is below 80. Confidence 55 is below 70.

## Before / After Metrics

| Metric | Before Policy Context | After Policy / Current Lab |
| --- | ---: | ---: |
| Overall correctness | 94% | 94% |
| Push correctness | 100% | 100% |
| Premature pushes | 0 | 0 |
| Missed pushes | 20 | 20 |
| High-confidence wrong decisions | 0 | 0 |
| Total opportunity cost | 475 | 475 |
| Four-week positive outcome rate | n/a | 59% |

The main 52-week Simulation v0.2 audit is unchanged in broad shape because it already used conservative push thresholds and does not heavily exercise higher-risk push types. The targeted Simulation v0.3 confirms the policy still allows higher-risk pushes when deliberately earned.

## Targeted Higher-Risk Push Behaviour

| Push Type | Actual | Correct | Incorrect | Missed | Avg Confidence | 4w Outcome |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `micro_push` | 3 | 3 | 0 | 0 | 85 | 100% |
| `volume_push` | 10 | 10 | 0 | 0 | 85 | 63% |
| `load_push` | 9 | 9 | 0 | 0 | 85 | 40% |
| `performance_push` | 5 | 5 | 0 | 0 | 85 | 75% |

## Simulation v0.3 Summary

- Targeted athletes/cases: 5
- Targeted weeks/cases: 43
- Push count: 27
- Missed expected pushes: 0
- Wrong push categories: 0
- Unsafe pushes: 0
- Verdict: promising

| Push Type | Total | Correct Category | Premature |
| --- | ---: | ---: | ---: |
| `micro_push` | 3 | 3 | 0 |
| `volume_push` | 10 | 10 | 0 |
| `load_push` | 9 | 9 | 0 |
| `performance_push` | 5 | 5 | 0 |

## Outcome Learning Context

Push Outcome Learning v0.2 remains advisory and synthetic:

| Push Type | Events | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: |
| `micro_push` | 612 | 55% | 37% | 81 |
| `volume_push` | 40 | 53% | 10% | 78 |
| `load_push` | 36 | 58% | 8% | 69 |
| `performance_push` | 20 | 60% | 20% | 68 |

- Advisory threshold candidates: 3
- Rejected findings: 60
- Sample-size warnings: 29

## Did The Policy Improve Outcome Learning?

The policy improves decision explicitness and testability more than it changes the existing long-horizon synthetic totals.

- It prevents generic `push` recommendations from leaving the Decision Engine without a push type.
- It blocks push when safety, evidence quality, same-exercise exposure, recovery, momentum, missed-range, density, or uncertainty rules are not met.
- It allows `volume_push`, `load_push`, and `performance_push` in targeted validation instead of collapsing into `micro_push` only.
- It does not claim the synthetic outcome rates prove production readiness.

## Remaining Weaknesses

- Outcome learning is still synthetic and should not be treated as athlete truth.
- Main 52-week Simulation v0.2 under-exercises higher-risk pushes, so v0.3 targeted cases remain necessary.
- `micro_push` remains mixed in synthetic outcome learning despite clean scenario correctness.
- Load ownership can still be `unknown`; future policy should require explicit ownership for production prototype.
- Get Lean push policy needs real body-composition confidence rules before production use.
- Athletic Performance needs explicit power/dynamic performance evidence; no sensor-free bar-speed inference.

## Open Aaron Decisions

1. Should future production prototype require explicit `owned` load state before any `load_push`, or allow unknown ownership in early versions?
2. Should `volume_push` ever be allowed during Get Lean when performance preservation is excellent?
3. Should `performance_push` remain limited to planned milestone blocks?
4. What minimum real-world success rate is acceptable for each push type before production integration?
5. Should micro-push be renamed internally if synthetic outcomes continue showing it is not reliably low risk?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
