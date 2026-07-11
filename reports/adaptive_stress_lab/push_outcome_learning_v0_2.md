# Push Outcome Learning v0.2

Generated: 2026-06-28T16:47:31.257Z

## Scope

Sprint 17 analyses push outcomes by context and generates advisory thresholds for when push is actually worthwhile.

This is research-only. It does not mutate the Decision Engine, production app code, V1 progression, or subscription logic.

## Success Criteria

A push is treated as successful only if it improves or preserves:

- goal progress
- recovery capacity
- momentum
- confidence/safety proxy
- safety status

A push is negative if follow-up suggests recovery collapse, target failure proxy, safety escalation, momentum drop, or worse goal progress. One immediate positive result is not enough if the 2-4 week window is poor.

## Dataset Summary

- Total push outcome events: 708
- Best contexts analysed: 11
- Worst contexts analysed: 12
- Advisory threshold candidates: 3
- Rejected findings: 60
- Sample-size warnings: 29

## Outcome Distribution By Push Type

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `micro_push` | 612 | 336 | 49 | 209 | 18 | 0 | 55% | 37% | 81 |
| `volume_push` | 40 | 21 | 15 | 4 | 0 | 0 | 53% | 10% | 78 |
| `load_push` | 36 | 21 | 12 | 2 | 1 | 0 | 58% | 8% | 69 |
| `performance_push` | 20 | 12 | 4 | 3 | 1 | 0 | 60% | 20% | 68 |

## Outcome Distribution By Goal

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `strength` | 216 | 121 | 20 | 69 | 6 | 0 | 56% | 35% | 81 |
| `build_muscle` | 192 | 108 | 19 | 59 | 6 | 0 | 56% | 34% | 81 |
| `build_muscle_strength` | 192 | 96 | 10 | 80 | 6 | 0 | 50% | 45% | 81 |
| `hypertrophy` | 56 | 36 | 16 | 4 | 0 | 0 | 64% | 7% | 70 |
| `powerlifting` | 48 | 25 | 15 | 6 | 2 | 0 | 52% | 17% | 73 |
| `strength_hypertrophy` | 4 | 4 | 0 | 0 | 0 | 0 | 100% | 0% | 54 |

## Outcome Distribution By Follow-Up Window

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `next_session` | 177 | 96 | 26 | 49 | 6 | 0 | 54% | 31% | 78 |
| `two_week` | 177 | 91 | 21 | 59 | 6 | 0 | 51% | 37% | 78 |
| `four_week` | 177 | 91 | 21 | 58 | 7 | 0 | 51% | 37% | 86 |
| `eight_week` | 177 | 112 | 12 | 52 | 1 | 0 | 63% | 30% | 77 |

## Outcome Distribution By Evidence Quality Band

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `95+` | 484 | 252 | 52 | 160 | 20 | 0 | 52% | 37% | 80 |
| `90-94` | 224 | 138 | 28 | 58 | 0 | 0 | 62% | 26% | 80 |

## Best Push Contexts

- `push_type_goal_window:volume_push:hypertrophy:next_session` — sample 10, success 80%, negative/unsafe 0%, confidence 79. Candidate: context may support push when Charter/Safety allow.
- `push_type_goal_window:volume_push:hypertrophy:two_week` — sample 10, success 70%, negative/unsafe 10%, confidence 79. Candidate: context may support push when Charter/Safety allow.
- `push_type_goal_window:micro_push:strength:eight_week` — sample 54, success 65%, negative/unsafe 28%, confidence 79. Neutral: keep observing before tuning.
- `goal:hypertrophy` — sample 56, success 64%, negative/unsafe 7%, confidence 70. Candidate: context may support push when Charter/Safety allow.
- `push_type_goal_window:micro_push:build_muscle:eight_week` — sample 48, success 63%, negative/unsafe 33%, confidence 79. Review conservatively: negative/unsafe rate is high.
- `push_type_goal_window:micro_push:build_muscle_strength:eight_week` — sample 48, success 63%, negative/unsafe 38%, confidence 79. Review conservatively: negative/unsafe rate is high.
- `evidence_quality_band:90-94` — sample 224, success 62%, negative/unsafe 26%, confidence 80. Neutral: keep observing before tuning.
- `push_type:volume_push` — sample 40, success 53%, negative/unsafe 10%, confidence 78. Neutral: keep observing before tuning.
- `same_exercise_exposures:4` — sample 44, success 45%, negative/unsafe 14%, confidence 77. Neutral: keep observing before tuning.
- `push_type_goal_window:volume_push:hypertrophy:four_week` — sample 10, success 30%, negative/unsafe 10%, confidence 80. Neutral: keep observing before tuning.
- `push_type_goal_window:volume_push:hypertrophy:eight_week` — sample 10, success 30%, negative/unsafe 20%, confidence 74. Neutral: keep observing before tuning.

## Worst Push Contexts

- `push_type_goal_window:micro_push:build_muscle_strength:two_week` — sample 48, success 42%, negative/unsafe 52%, confidence 79. Reject: unsafe outcomes cannot support push aggression.
- `recovery_capacity_band:85-94` — sample 248, success 44%, negative/unsafe 49%, confidence 82. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle_strength:four_week` — sample 48, success 46%, negative/unsafe 48%, confidence 88. Reject: unsafe outcomes cannot support push aggression.
- `goal:build_muscle_strength` — sample 192, success 50%, negative/unsafe 45%, confidence 81. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle_strength:next_session` — sample 48, success 50%, negative/unsafe 42%, confidence 79. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle:four_week` — sample 48, success 46%, negative/unsafe 40%, confidence 88. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:strength:two_week` — sample 54, success 54%, negative/unsafe 39%, confidence 78. Reject: unsafe outcomes cannot support push aggression.
- `adaptation_band:85-94` — sample 600, success 54%, negative/unsafe 38%, confidence 81. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle_strength:eight_week` — sample 48, success 63%, negative/unsafe 38%, confidence 79. Review conservatively: negative/unsafe rate is high.
- `push_type_goal_window:micro_push:strength:next_session` — sample 54, success 48%, negative/unsafe 37%, confidence 79. Reject: unsafe outcomes cannot support push aggression.
- `follow_up_window:two_week` — sample 177, success 51%, negative/unsafe 37%, confidence 78. Reject: unsafe outcomes cannot support push aggression.
- `follow_up_window:four_week` — sample 177, success 51%, negative/unsafe 37%, confidence 86. Reject: unsafe outcomes cannot support push aggression.

## Advisory Threshold Candidates

### `micro_push` — `evidence_quality_band:95+`

- Sample size: 484
- Success rate: 52%
- Negative/unsafe rate: 37%
- Confidence: 80
- Status: `weak_or_rejected`
- Binding: no
- Rationale: Keep micro_push evidence quality high; synthetic outcomes are mixed below stronger evidence bands.

### `volume_push` — `recovery_capacity_band:85-94`

- Sample size: 248
- Success rate: 44%
- Negative/unsafe rate: 49%
- Confidence: 82
- Status: `weak_or_rejected`
- Binding: no
- Rationale: Volume push should remain tied to high recovery capacity and no density warning.

### `load_push` — `same_exercise_exposures:5+`

- Sample size: 48
- Success rate: 67%
- Negative/unsafe rate: 13%
- Confidence: 69
- Status: `weak_or_rejected`
- Binding: no
- Rationale: Load push should require repeated same-exercise exposures before another meaningful increase.

## Rejected Findings

- `push_type:micro_push` — sample 612, confidence 81, unsafe 18. Reject: unsafe outcomes cannot support push aggression.
- `push_type:load_push` — sample 36, confidence 69, unsafe 1. Reject: unsafe outcomes cannot support push aggression.
- `push_type:performance_push` — sample 20, confidence 68, unsafe 1. Reject: unsafe outcomes cannot support push aggression.
- `goal:strength` — sample 216, confidence 81, unsafe 6. Reject: unsafe outcomes cannot support push aggression.
- `goal:build_muscle` — sample 192, confidence 81, unsafe 6. Reject: unsafe outcomes cannot support push aggression.
- `goal:build_muscle_strength` — sample 192, confidence 81, unsafe 6. Reject: unsafe outcomes cannot support push aggression.
- `goal:powerlifting` — sample 48, confidence 73, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `goal:strength_hypertrophy` — sample 4, confidence 54, unsafe 0. Reject: sample size too low.
- `follow_up_window:next_session` — sample 177, confidence 78, unsafe 6. Reject: unsafe outcomes cannot support push aggression.
- `follow_up_window:two_week` — sample 177, confidence 78, unsafe 6. Reject: unsafe outcomes cannot support push aggression.
- `follow_up_window:four_week` — sample 177, confidence 86, unsafe 7. Reject: unsafe outcomes cannot support push aggression.
- `follow_up_window:eight_week` — sample 177, confidence 77, unsafe 1. Reject: unsafe outcomes cannot support push aggression.
- `evidence_quality_band:95+` — sample 484, confidence 80, unsafe 20. Reject: unsafe outcomes cannot support push aggression.
- `recovery_capacity_band:95+` — sample 460, confidence 78, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `recovery_capacity_band:85-94` — sample 248, confidence 82, unsafe 18. Reject: unsafe outcomes cannot support push aggression.
- `momentum_band:95+` — sample 708, confidence 80, unsafe 20. Reject: unsafe outcomes cannot support push aggression.
- `adaptation_band:85-94` — sample 600, confidence 81, unsafe 18. Reject: unsafe outcomes cannot support push aggression.
- `adaptation_band:95+` — sample 108, confidence 71, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `same_exercise_exposures:3` — sample 616, confidence 81, unsafe 18. Reject: unsafe outcomes cannot support push aggression.
- `same_exercise_exposures:5+` — sample 48, confidence 69, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `load_ownership_state:unknown` — sample 708, confidence 80, unsafe 20. Reject: unsafe outcomes cannot support push aggression.
- `recent_shutdown_or_pain:false` — sample 708, confidence 80, unsafe 20. Reject: unsafe outcomes cannot support push aggression.
- `recent_missed_range:false` — sample 708, confidence 80, unsafe 20. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:strength:next_session` — sample 54, confidence 79, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:strength:two_week` — sample 54, confidence 78, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:strength:four_week` — sample 54, confidence 87, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle:next_session` — sample 48, confidence 79, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle:two_week` — sample 48, confidence 79, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle:four_week` — sample 48, confidence 88, unsafe 2. Reject: unsafe outcomes cannot support push aggression.
- `push_type_goal_window:micro_push:build_muscle_strength:next_session` — sample 48, confidence 79, unsafe 2. Reject: unsafe outcomes cannot support push aggression.

## Synthetic Limitations

- All events come from synthetic Simulation v0.2/v0.3 outputs.
- The analysis is advisory and does not mutate Decision Engine rules.
- Outcome windows are weekly approximations, not real logged exposure timestamps.
- Population-level patterns cannot override individual athlete context.
- Unsafe outcomes are rejected even if short-term progress appears positive.

## Open Aaron Decisions

1. What minimum real-world success rate should a push context need before future production prototype consideration?
2. Should `micro_push` be considered successful with neutral 4-week outcomes, or only clearly positive outcomes?
3. Should `load_push` require `owned` previous load even when same-exercise exposure count is high?
4. Should `performance_push` remain disabled outside explicit milestone blocks?
5. Should push outcome learning be grouped first by goal, exercise category, or ownership state?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
