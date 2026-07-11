# Outcome Learning Framework v0.1

Generated: 2026-06-28T16:47:31.119Z

## Scope

This report creates the first lab-only outcome learning framework for Adaptive Strength Coach V2.

Outcome data informs the coach. It does not override the Charter, Safety Gate, or human review.

Production app code was not touched. V1 was not modified. No EAS build was started.

## Outcome Event Model

Each `OutcomeEvent` links:

- athlete profile
- Coaching State summary
- Safety Gate status
- recommendation type
- push type where relevant
- intervention type
- goal
- exercise / movement pattern where available
- week / timestamp
- follow-up window
- follow-up evidence
- outcome classification
- confidence

Outcome classifications:

- `positive`
- `neutral`
- `negative`
- `unsafe`
- `inconclusive`

## Outcome Windows

- `immediate_session`
- `next_session`
- `two_week`
- `four_week`
- `eight_week`

Different interventions should be judged over different windows. Load pushes care most about the next 2-4 exposures. Recovery weeks care about 2-4 week rebound. Larger block-level decisions need 4-8 week evidence. Safety interventions care immediately and next session.

## Dataset Summary

- Total outcome events: 5415
- Learning records: 220
- Candidate learning signals: 21
- Rejected signals: 156
- Sample-size warnings: 130
- Low-confidence findings: 124

## Outcome Distribution By Recommendation

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Positive Rate | Negative/Unsafe Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `hold` | 1630 | 549 | 689 | 237 | 44 | 111 | 34% | 17% |
| `consolidate` | 1600 | 529 | 636 | 318 | 1 | 116 | 33% | 20% |
| `push` | 885 | 159 | 422 | 216 | 20 | 68 | 18% | 27% |
| `reduce` | 715 | 463 | 119 | 84 | 0 | 49 | 65% | 12% |
| `recover` | 375 | 351 | 7 | 2 | 0 | 15 | 94% | 1% |
| `stop_movement` | 210 | 90 | 60 | 54 | 0 | 6 | 43% | 26% |

## Outcome Distribution By Push Type

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Positive Rate | Negative/Unsafe Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `micro_push` | 765 | 140 | 359 | 207 | 18 | 41 | 18% | 29% |
| `volume_push` | 50 | 2 | 39 | 4 | 0 | 5 | 4% | 8% |
| `load_push` | 45 | 10 | 18 | 2 | 1 | 14 | 22% | 7% |
| `performance_push` | 25 | 7 | 6 | 3 | 1 | 8 | 28% | 16% |

## Outcome Distribution By Goal

| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Positive Rate | Negative/Unsafe Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `strength` | 1040 | 502 | 274 | 192 | 12 | 60 | 48% | 20% |
| `build_muscle` | 1040 | 357 | 438 | 173 | 12 | 60 | 34% | 18% |
| `build_muscle_strength` | 1040 | 434 | 305 | 229 | 12 | 60 | 42% | 23% |
| `get_lean` | 1040 | 386 | 444 | 138 | 12 | 60 | 37% | 14% |
| `athletic_performance` | 1040 | 420 | 382 | 166 | 12 | 60 | 40% | 17% |
| `powerlifting` | 105 | 28 | 34 | 8 | 5 | 30 | 27% | 12% |
| `hypertrophy` | 90 | 10 | 51 | 5 | 0 | 24 | 11% | 6% |
| `strength_hypertrophy` | 20 | 4 | 5 | 0 | 0 | 11 | 20% | 0% |

## Candidate Learning Signals

### `strength:consolidate:immediate_session`

- Recommendation: `consolidate`
- Push type: none
- Sample size: 63
- Confidence: 77
- Distribution: positive 44, neutral 19, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `strength:reduce:immediate_session`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 28, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `strength:reduce:four_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 74
- Distribution: positive 24, neutral 0, negative 0, unsafe 0, inconclusive 4
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `strength:reduce:eight_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 73
- Distribution: positive 23, neutral 0, negative 0, unsafe 0, inconclusive 5
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `strength:push:micro_push:immediate_session`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 54
- Confidence: 78
- Distribution: positive 54, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle:hold:two_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 46
- Confidence: 73
- Distribution: positive 32, neutral 4, negative 6, unsafe 0, inconclusive 4
- Suggested adjustment: `review_missed_push_opportunity`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle:reduce:next_session`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 6, neutral 12, negative 10, unsafe 0, inconclusive 0
- Suggested adjustment: `review_rule_conservatively`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle:reduce:two_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 10, neutral 8, negative 10, unsafe 0, inconclusive 0
- Suggested adjustment: `review_rule_conservatively`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:hold:two_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 46
- Confidence: 73
- Distribution: positive 31, neutral 1, negative 10, unsafe 0, inconclusive 4
- Suggested adjustment: `review_missed_push_opportunity`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:consolidate:next_session`

- Recommendation: `consolidate`
- Push type: none
- Sample size: 63
- Confidence: 77
- Distribution: positive 7, neutral 32, negative 23, unsafe 0, inconclusive 1
- Suggested adjustment: `review_rule_conservatively`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:consolidate:four_week`

- Recommendation: `consolidate`
- Push type: none
- Sample size: 63
- Confidence: 77
- Distribution: positive 17, neutral 14, negative 25, unsafe 0, inconclusive 7
- Suggested adjustment: `review_rule_conservatively`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:reduce:immediate_session`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 28, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:reduce:four_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 74
- Distribution: positive 21, neutral 1, negative 2, unsafe 0, inconclusive 4
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:reduce:eight_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 73
- Distribution: positive 21, neutral 2, negative 0, unsafe 0, inconclusive 5
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `build_muscle_strength:push:micro_push:eight_week`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 48
- Confidence: 73
- Distribution: positive 6, neutral 15, negative 18, unsafe 0, inconclusive 9
- Suggested adjustment: `review_rule_conservatively`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `get_lean:consolidate:immediate_session`

- Recommendation: `consolidate`
- Push type: none
- Sample size: 63
- Confidence: 77
- Distribution: positive 44, neutral 19, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `get_lean:reduce:immediate_session`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 28, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `athletic_performance:consolidate:immediate_session`

- Recommendation: `consolidate`
- Push type: none
- Sample size: 63
- Confidence: 77
- Distribution: positive 44, neutral 19, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `athletic_performance:reduce:immediate_session`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 76
- Distribution: positive 28, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `athletic_performance:reduce:four_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 74
- Distribution: positive 24, neutral 0, negative 0, unsafe 0, inconclusive 4
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


### `athletic_performance:reduce:eight_week`

- Recommendation: `reduce`
- Push type: none
- Sample size: 28
- Confidence: 73
- Distribution: positive 23, neutral 0, negative 0, unsafe 0, inconclusive 5
- Suggested adjustment: `consider_preserving_rule`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency.


## Rejected Unsafe / Low-Confidence Signals

### `strength:hold:next_session`

- Recommendation: `hold`
- Push type: none
- Sample size: 40
- Confidence: 81
- Distribution: positive 14, neutral 10, negative 11, unsafe 2, inconclusive 3
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:hold:four_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 40
- Confidence: 86
- Distribution: positive 24, neutral 2, negative 9, unsafe 2, inconclusive 3
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:hold:eight_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 40
- Confidence: 83
- Distribution: positive 25, neutral 2, negative 6, unsafe 2, inconclusive 5
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:push:micro_push:next_session`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 54
- Confidence: 86
- Distribution: positive 0, neutral 34, negative 18, unsafe 2, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:push:micro_push:two_week`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 54
- Confidence: 86
- Distribution: positive 6, neutral 26, negative 19, unsafe 2, inconclusive 1
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:push:micro_push:four_week`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 54
- Confidence: 90
- Distribution: positive 11, neutral 22, negative 17, unsafe 2, inconclusive 2
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `strength:recover:immediate_session`

- Recommendation: `recover`
- Push type: none
- Sample size: 15
- Confidence: 64
- Distribution: positive 15, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:recover:next_session`

- Recommendation: `recover`
- Push type: none
- Sample size: 15
- Confidence: 64
- Distribution: positive 15, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:recover:two_week`

- Recommendation: `recover`
- Push type: none
- Sample size: 15
- Confidence: 64
- Distribution: positive 15, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:recover:four_week`

- Recommendation: `recover`
- Push type: none
- Sample size: 15
- Confidence: 70
- Distribution: positive 15, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning.


### `strength:recover:eight_week`

- Recommendation: `recover`
- Push type: none
- Sample size: 15
- Confidence: 59
- Distribution: positive 11, neutral 1, negative 0, unsafe 0, inconclusive 3
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:stop_movement:immediate_session`

- Recommendation: `stop_movement`
- Push type: none
- Sample size: 8
- Confidence: 55
- Distribution: positive 8, neutral 0, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:stop_movement:next_session`

- Recommendation: `stop_movement`
- Push type: none
- Sample size: 8
- Confidence: 55
- Distribution: positive 4, neutral 0, negative 4, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:stop_movement:two_week`

- Recommendation: `stop_movement`
- Push type: none
- Sample size: 8
- Confidence: 55
- Distribution: positive 6, neutral 2, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:stop_movement:four_week`

- Recommendation: `stop_movement`
- Push type: none
- Sample size: 8
- Confidence: 61
- Distribution: positive 4, neutral 4, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `strength:stop_movement:eight_week`

- Recommendation: `stop_movement`
- Push type: none
- Sample size: 8
- Confidence: 60
- Distribution: positive 6, neutral 2, negative 0, unsafe 0, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected low-sample signal: sample size is too small for tuning. Rejected low-confidence signal: outcome confidence is too low for tuning.


### `build_muscle:hold:next_session`

- Recommendation: `hold`
- Push type: none
- Sample size: 46
- Confidence: 81
- Distribution: positive 23, neutral 8, negative 10, unsafe 2, inconclusive 3
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `build_muscle:hold:four_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 46
- Confidence: 86
- Distribution: positive 35, neutral 2, negative 3, unsafe 2, inconclusive 4
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `build_muscle:hold:eight_week`

- Recommendation: `hold`
- Push type: none
- Sample size: 46
- Confidence: 83
- Distribution: positive 25, neutral 8, negative 5, unsafe 2, inconclusive 6
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


### `build_muscle:push:micro_push:next_session`

- Recommendation: `push`
- Push type: `micro_push`
- Sample size: 48
- Confidence: 86
- Distribution: positive 2, neutral 33, negative 11, unsafe 2, inconclusive 0
- Suggested adjustment: `no_change`
- Guardrails: Advisory only: does not mutate rules. Safety Gate and Charter remain higher authority than outcome frequency. Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.


## Suggested But Non-Binding Refinements

- `no_change`: 199 record(s)
- `consider_preserving_rule`: 14 record(s)
- `review_rule_conservatively`: 5 record(s)
- `review_missed_push_opportunity`: 2 record(s)

## Guardrails

- Outcome data informs the coach; it does not override the Charter.
- Never reward unsafe decisions.
- Never optimise for engagement over progress.
- Never reward excessive fatigue or short-term performance at the cost of long-term progress.
- Never treat population data as absolute truth.
- Never ignore individual athlete context.
- Never override Safety Gate.
- Never mutate production rules automatically.

## Synthetic Limitations

- Simulation v0.2 and v0.3 are synthetic and cannot validate true physiology.
- Outcome confidence is a modelled score, not a real-world posterior probability.
- Four-week and eight-week windows are approximate because simulations are weekly.
- Population-level aggregates are not individual truth.
- The framework intentionally does not mutate rules.

## Open Aaron Decisions

1. What minimum real-world sample size should be required before an advisory learning record can influence engine design?
2. Should learning records be grouped by goal first, exercise first, or decision context first?
3. Should unsafe outcomes permanently blacklist a rule shape, or only trigger human review?
4. Should ASC use anonymised real-world outcomes only after explicit user consent?
5. What should count as a meaningful long-term outcome: 4-week improvement, 8-week improvement, block completion, or annual progress?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
