# Coaching Opportunity Audit v0.1

Generated: 2026-06-28T16:47:30.868Z

## Scope

This audit retrospectively evaluates every V2 recommendation from Simulation v0.2. It asks whether the coach missed opportunities, pushed too early, recovered unnecessarily, or assigned confidence that did not match correctness.

Production app code is untouched.

## Summary

- Total decisions audited: 1040
- Correct decisions: 975
- Incorrect decisions: 65
- Correctness rate: 94%
- Four-week positive outcome rate: 59%
- Total opportunity cost: 475
- Average opportunity cost: 0

## Opportunity Cost

| Metric | Count |
|---|---:|
| Missed Pushes | 20 |
| Missed Consolidations | 0 |
| Unnecessary Recovery | 0 |
| Premature Pushes | 0 |
| Correct Pushes | 150 |
| Correct Holds | 300 |
| Correct Recoveries | 75 |
| Correct Consolidations | 270 |

## Aggression Calibration

| Calibration | Count |
|---|---:|
| Too Conservative | 0 |
| Balanced | 995 |
| Too Aggressive | 45 |

## Decision Calibration

| Recommendation | Total | Correct | Correctness Rate | Avg Confidence | Avg Opportunity Cost |
|---|---:|---:|---:|---:|---:|
| `consolidate` | 315 | 270 | 86% | 90 | 1 |
| `hold` | 320 | 300 | 94% | 75 | 0 |
| `push` | 150 | 150 | 100% | 81 | 0 |
| `recover` | 75 | 75 | 100% | 92 | 0 |
| `reduce` | 140 | 140 | 100% | 78 | 0 |
| `stop_movement` | 40 | 40 | 100% | 100 | 0 |

## Push Type Calibration

| Push Type | Total | Correct | Incorrect | Correctness Rate | Premature | Missed | Avg Confidence | Avg Cost | 4w Outcome Rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `micro_push` | 150 | 150 | 0 | 100% | 0 | 9 | 81 | 0 | 37% |
| `volume_push` | 0 | 0 | 0 | 0% | 0 | 11 | 0 | 0 | 0% |
| `load_push` | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0% |
| `performance_push` | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0% |
| `uncategorized_push` | 0 | 0 | 0 | 0% | 0 | 0 | 0 | 0 | 0% |

### Push Type Failure Patterns

- `micro_push`
  - No failures recorded.
- `volume_push`
  - No failures recorded.
- `load_push`
  - No failures recorded.
- `performance_push`
  - No failures recorded.
- `uncategorized_push`
  - No failures recorded.

## Confidence Calibration

| Confidence Bucket | Total | Correct | Incorrect | Correctness Rate | Avg Opportunity Cost |
|---|---:|---:|---:|---:|---:|
| 0-59 | 0 | 0 | 0 | 0% | 0 |
| 60-74 | 230 | 185 | 45 | 80% | 2 |
| 75-89 | 475 | 455 | 20 | 96% | 0 |
| 90-100 | 335 | 335 | 0 | 100% | 0 |

- High-confidence wrong decisions: 0
- Low-confidence correct decisions: 185

## Long-Term Four-Week Outcome

Each decision was checked against the state four weeks later where available.

Tracked deltas:

- adaptation
- goal progress
- momentum
- confidence
- recovery

Four-week positive outcome rate: 59%

## Best Decisions

- vathlete_10_build_muscle_strength week 18 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 80, momentum 12, confidence 50, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_10_build_muscle_strength week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 80, momentum 10, confidence 50, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_6_build_muscle week 18 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 76, momentum 12, confidence 50, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_6_build_muscle week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 76, momentum 12, confidence 50, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_11_build_muscle_strength week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 80, momentum 12, confidence 46, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_12_build_muscle_strength week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 80, momentum 12, confidence 46, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_7_build_muscle week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 76, momentum 12, confidence 46, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_8_build_muscle week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 75, momentum 12, confidence 46, recovery -2. Reason: Exact match to retrospective ideal action.
- vathlete_10_build_muscle_strength week 45 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 80, momentum 4, confidence 49, recovery 0. Reason: Exact match to retrospective ideal action.
- vathlete_2_strength week 27 (systemic_fatigue): actual `recover`, ideal `recover`, confidence 92, cost 0; 4w progress 70, momentum 12, confidence 50, recovery -2. Reason: Exact match to retrospective ideal action.

## Worst Decisions

- vathlete_1_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -39, momentum 10, confidence -59, recovery 4. Reason: Expected push, got hold.
- vathlete_2_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -39, momentum 3, confidence -59, recovery 6. Reason: Expected push, got hold.
- vathlete_9_build_muscle_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -21, momentum 10, confidence -59, recovery 4. Reason: Expected push, got hold.
- vathlete_10_build_muscle_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -21, momentum 3, confidence -59, recovery 6. Reason: Expected push, got hold.
- vathlete_2_strength week 17 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 2, confidence 63, recovery 0. Reason: Expected recover, got consolidate.
- vathlete_2_strength week 34 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 6, confidence 64, recovery -2. Reason: Expected recover, got consolidate.
- vathlete_2_strength week 51 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w outcome unavailable. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 17 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 2, confidence 63, recovery 0. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 34 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 6, confidence 60, recovery -4. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 51 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w outcome unavailable. Reason: Expected recover, got consolidate.

## Most Expensive Mistakes

- vathlete_1_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -39, momentum 10, confidence -59, recovery 4. Reason: Expected push, got hold.
- vathlete_2_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -39, momentum 3, confidence -59, recovery 6. Reason: Expected push, got hold.
- vathlete_9_build_muscle_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -21, momentum 10, confidence -59, recovery 4. Reason: Expected push, got hold.
- vathlete_10_build_muscle_strength week 11 (normal_progress): actual `hold`, ideal `push`, confidence 82, cost 12; 4w progress -21, momentum 3, confidence -59, recovery 6. Reason: Expected push, got hold.
- vathlete_2_strength week 17 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 2, confidence 63, recovery 0. Reason: Expected recover, got consolidate.
- vathlete_2_strength week 34 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 6, confidence 64, recovery -2. Reason: Expected recover, got consolidate.
- vathlete_2_strength week 51 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w outcome unavailable. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 17 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 2, confidence 63, recovery 0. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 34 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w progress 80, momentum 6, confidence 60, recovery -4. Reason: Expected recover, got consolidate.
- vathlete_3_strength week 51 (illness): actual `consolidate`, ideal `recover`, confidence 70, cost 8; 4w outcome unavailable. Reason: Expected recover, got consolidate.

## Recommendations For Engine Tuning

- Review push threshold: missed pushes materially exceed premature pushes.
- Aggressive mistakes remain; inspect push/recover recommendations under disruption.

## Remaining Weaknesses

- The retrospective ideal action is still heuristic.
- Four-week effects are simulated, not biological reality.
- Confidence calibration is based on synthetic outcomes.
- Get Lean recovery decisions can be training-correct while body-composition confidence remains low.
- The audit currently evaluates recommendation type more strongly than exact intervention details.

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
