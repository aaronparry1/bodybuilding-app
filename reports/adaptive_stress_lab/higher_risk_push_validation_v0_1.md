# Higher-Risk Push Validation v0.1

Generated: 2026-06-28T16:47:30.940Z

## Scope

Sprint 14 validates that the V2 research coach can use higher-risk push categories without becoming reckless or collapsing into micro-push only behaviour.

This is research-lab validation only. It does not modify production app behaviour, V1 workout generation, V1 progression, subscription logic, or EAS build configuration.

## Push Type Eligibility Rules

### `micro_push`

- Smallest possible progression.
- Default positive progression option.
- Used when evidence is strong but not exceptional enough for volume, load, or performance pushing.

### `volume_push`

- Adds a small amount of productive work without increasing load.
- Requires high evidence quality, high recovery capacity, high quality-volume tolerance, high target-range completion, no workload-density warning, no recovery compression, and a muscle-building relevant goal.

### `load_push`

- Increases actual load by the smallest sensible jump.
- Requires repeated same-exercise success, repeated top-end target-range evidence, high evidence quality, strength-relevant goal progress, clear Safety Gate, no recent recovery compression, and a sensible available load jump.

### `performance_push`

- Planned milestone or rep-PR attempt.
- Requires exceptional evidence, 5+ same-exercise successful exposures, long stable block, clear Safety Gate, high recovery capacity, high momentum, high confidence, and an explicit milestone opportunity.
- Remains rare and deliberately scheduled, not reactive.

## Scenario Results

- Total scenarios: 44
- Passed: 44
- Failed: 0
- Categories exercised: load_push, micro_push, performance_push, volume_push

- No failed Sprint 14 scenarios.

## Scenario Category Summary

| Expected | Count | Passed |
| --- | ---: | ---: |
| `micro_push` | 4 | 4 |
| `volume_push` | 9 | 9 |
| `load_push` | 8 | 8 |
| `performance_push` | 4 | 4 |
| `hold` | 8 | 8 |
| `consolidate` | 5 | 5 |
| `reduce` | 3 | 3 |
| `recover` | 1 | 1 |
| `stop_movement` | 2 | 2 |

## Simulation v0.3 Results

- Targeted athletes: 5
- Targeted weeks/cases: 43
- Push count: 27
- Missed expected pushes: 0
- Wrong push categories: 0
- Unsafe pushes: 0
- Verdict: promising

## Push Type Audit

| Push Type | Actual | Correct | Incorrect | Correctness | Premature | Missed | Avg Confidence | 4w Outcome |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `micro_push` | 3 | 3 | 0 | 100% | 0 | 0 | 85 | 100% |
| `volume_push` | 10 | 10 | 0 | 100% | 0 | 0 | 85 | 63% |
| `load_push` | 9 | 9 | 0 | 100% | 0 | 0 | 85 | 40% |
| `performance_push` | 5 | 5 | 0 | 100% | 0 | 0 | 85 | 75% |

## Before / After

| Metric | Before Sprint 14 | Sprint 14 Targeted Validation |
| --- | ---: | ---: |
| Actual `micro_push` | 150 | 3 |
| Actual `volume_push` | 0 | 10 |
| Actual `load_push` | 0 | 9 |
| Actual `performance_push` | 0 | 5 |
| Premature pushes | 0 | 0 |
| Missed pushes | 20 | 0 |
| High-confidence wrong decisions | 0 | 0 |

## Weird Decisions / Failures

- No wrong push categories or unsafe pushes in targeted simulation v0.3.

## Interpretation

The V2 lab coach is no longer micro-push only under targeted evidence. It can choose `volume_push`, `load_push`, and `performance_push` when the evidence is intentionally strong enough, while still blocking poor-recovery, post-swap, pain, excessive-jump, low-confidence, and get-lean volume-push cases.

This does not prove production readiness. It proves the category rules are reachable and testable in the lab.

## Open Aaron Decisions

1. Should `performance_push` remain available only for powerlifting, strength, and athletic-performance contexts?
2. Should `volume_push` ever be allowed in a Get Lean phase when performance preservation is excellent?
3. Should `load_push` require exactly the same exercise, or can close competition variants count after a future validation sprint?
4. Should higher-risk push confidence remain capped at 85 until real-world validation exists?
5. What is the minimum acceptable four-week outcome rate for each push category before production prototype work begins?

## Production Status

Production app untouched. No V1 changes. No EAS build started.
