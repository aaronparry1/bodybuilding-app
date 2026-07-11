# Coaching Gauntlet v0.7

Generated: 2026-06-28T16:47:30.573Z

## Scope

The Coaching Gauntlet v0.7 removes supplied `evidenceQuality` from new scenario inputs. Evidence quality must be earned from explicit session history, exercise history, source quality, planned-vs-extra evidence, working-set completeness, recency, and consistency.

## Pass/Fail Summary

- Total scenarios: 224
- Passed: 224
- Failed: 0
- Pass rate: 100%
- Decisions changed from v0.6: 3

## Evidence Quality Derivation

Derived evidence quality uses:

- `data_completeness`
- `recency`
- `planned_evidence`
- `comparable_exposures`
- `source_quality`
- `consistency`
- `final_score`

- `v07_high_quality_many_planned_sessions`: `push` / `moderate`, Safety Gate `clear`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 4, recommendation confidence 75
- `v07_low_quality_one_session`: `hold` / `low`, Safety Gate `clear`, quality 62 (data 59, recency 95, planned 48, comparable 33, source 77, consistency 87), same-exercise successes 1, recommendation confidence 64
- `v07_extra_session_noise_low_planned`: `hold` / `low`, Safety Gate `clear`, quality 69 (data 72, recency 95, planned 21, comparable 100, source 72, consistency 59), same-exercise successes 4, recommendation confidence 68
- `v07_warmup_only_low_quality`: `hold` / `low`, Safety Gate `clear`, quality 58 (data 53, recency 95, planned 83, comparable 0, source 48, consistency 87), same-exercise successes 0, recommendation confidence 48

## Push Threshold Examples

Push now requires high derived evidence quality, at least three successful comparable exposures of the same exercise, Safety Gate clear, strong recovery capacity, strong momentum, no recent shutdown/pain flags, no swap/new-exercise uncertainty, and a positive push signal.

- `v07_pattern_improves_same_exercise_missing`: `hold` / `low`, Safety Gate `clear`, quality 89 (data 94, recency 95, planned 100, comparable 67, source 94, consistency 87), same-exercise successes 2, recommendation confidence 82
- `v07_same_exercise_three_successes_push`: `push` / `moderate`, Safety Gate `clear`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 3, recommendation confidence 75
- `v07_same_exercise_two_successes_hold`: `hold` / `low`, Safety Gate `clear`, quality 88 (data 88, recency 95, planned 100, comparable 67, source 94, consistency 87), same-exercise successes 2, recommendation confidence 82
- `v07_new_exercise_blocks_push`: `hold` / `low`, Safety Gate `clear`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 4, recommendation confidence 82
- `v07_post_swap_one_exposure_blocks_push`: `consolidate` / `low`, Safety Gate `clear`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 4, recommendation confidence 95
- `v07_post_swap_three_successes_permit_push`: `push` / `moderate`, Safety Gate `clear`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 3, recommendation confidence 75

## Recover Threshold Examples

Recover now requires stricter systemic evidence. Thin, local, or compressed-spacing fatigue consolidates or reduces rather than becoming a whole-programme recovery recommendation.

- `v07_systemic_fatigue_enough_evidence_recovers`: `recover` / `very_low`, Safety Gate `restrict`, quality 81 (data 94, recency 95, planned 100, comparable 33, source 94, consistency 75), same-exercise successes 1, recommendation confidence 92
- `v07_systemic_looking_low_evidence_consolidates`: `consolidate` / `low`, Safety Gate `restrict`, quality 65 (data 69, recency 95, planned 48, comparable 33, source 94, consistency 75), same-exercise successes 1, recommendation confidence 69
- `v07_local_decline_only_reduces`: `reduce` / `very_low`, Safety Gate `restrict`, quality 80 (data 88, recency 95, planned 100, comparable 33, source 94, consistency 75), same-exercise successes 1, recommendation confidence 91
- `v07_multiple_movement_declines_recover`: `recover` / `very_low`, Safety Gate `restrict`, quality 81 (data 94, recency 95, planned 100, comparable 33, source 94, consistency 75), same-exercise successes 1, recommendation confidence 92
- `v07_poor_response_after_rest_recovers`: `recover` / `very_low`, Safety Gate `restrict`, quality 75 (data 94, recency 70, planned 100, comparable 33, source 94, consistency 57), same-exercise successes 1, recommendation confidence 74
- `v07_recovery_request_without_objective_evidence_holds`: `hold` / `low`, Safety Gate `clear`, quality 88 (data 88, recency 95, planned 100, comparable 67, source 94, consistency 87), same-exercise successes 2, recommendation confidence 98

## Safety Wording Examples

Safety vetoes are unchanged. Low confidence changes wording only.

- `v07_low_confidence_safety_caution_wording`: `reduce` / `low`, Safety Gate `caution`, quality 58 (data 57, recency 95, planned 48, comparable 33, source 58, consistency 75), same-exercise successes 1, recommendation confidence 44
- `v07_high_confidence_safety_caution_wording`: `reduce` / `low`, Safety Gate `caution`, quality 80 (data 88, recency 95, planned 100, comparable 33, source 94, consistency 75), same-exercise successes 1, recommendation confidence 83
- `v07_severe_pain_low_evidence_veto`: `stop_movement` / `very_low`, Safety Gate `stop`, quality 64 (data 59, recency 95, planned 48, comparable 33, source 94, consistency 87), same-exercise successes 1, recommendation confidence 77
- `v07_severe_pain_high_evidence_veto`: `stop_movement` / `very_low`, Safety Gate `stop`, quality 94 (data 88, recency 95, planned 100, comparable 100, source 94, consistency 87), same-exercise successes 4, recommendation confidence 100

## Level Summary

- Level 1 - Normal Progression: 32/32 passed (100%)
- Level 2 - Real Life: 34/34 passed (100%)
- Level 3 - Coaching Judgement: 40/40 passed (100%)
- Level 4 - Expert Coaching: 118/118 passed (100%)

## Recommendation Distribution

- `consolidate`: 26
- `hold`: 118
- `push`: 14
- `recover`: 14
- `reduce`: 36
- `stop_movement`: 9
- `stop_session`: 6
- `substitute`: 1

## Decisions Changed From v0.6

### Work trip poor sleep and declining lifts

- ID: `v07_l2_work_trip_sleep_poor_declining`
- v0.6: `recover` / `very_low`, Safety Gate `restrict`
- v0.7: `consolidate` / `low`, Safety Gate `restrict`
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:6, session_quality:poor, exercise_records:2, continuity:interrupted, data_completeness:high, derived_quality:69

### Mixed evidence stress test

- ID: `v07_l4_final_stress_test_mixed_everything`
- v0.6: `reduce` / `low`, Safety Gate `restrict`
- v0.7: `consolidate` / `low`, Safety Gate `restrict`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:mixed, exercise_records:3, continuity:consistent, data_completeness:high, derived_quality:88

### Fatigue inferred from shutdowns and compressed spacing

- ID: `v07_shutdown_spacing_infer_fatigue`
- v0.6: `reduce` / `low`, Safety Gate `restrict`
- v0.7: `consolidate` / `low`, Safety Gate `restrict`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:mixed, exercise_records:2, stimulus:high_frequency_fatigue, continuity:interrupted, data_completeness:high, derived_quality:81


## Failed Scenarios

- No failed scenarios in this run.

## Remaining Broad Assumptions

- Evidence quality weights are transparent research heuristics, not validated production weights.
- Same-exercise push threshold is intentionally conservative and may need goal-specific calibration.
- Recover threshold now prefers under-recovery to be proven systemically; Aaron should approve whether this is conservative enough.
- Source quality still comes from explicit evidence-confidence factors in the lab; production must derive those factors from actual data provenance.

## Open Aaron Decisions

1. Are the v0.7 derived-quality weights acceptable as a research default?
2. Should push always require the exact same exercise, or can close variants earn partial future credit?
3. Should recover require shutdown evidence, or can repeated below-minimum events across patterns be enough when session spacing is normal?
4. Should low-confidence Safety Gate language be used in eventual user-facing copy, or kept internal for now?

## Full Scenario Results

### v07_l1_clean_progression

- Title: Clean progression with high recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_l1_above_range_first_signal

- Title: Above range once, avoid reckless jump
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_bare_minimum_success

- Title: Bare minimum success should not over-push
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_productive_heavier_load

- Title: Heavier load stays inside target range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l1_same_load_stable

- Title: Same load stable with good recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_local_miss

- Title: One local lift misses range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l1_local_dropoff

- Title: Local drop-off without systemic signal
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 75, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_accessory_stall

- Title: Accessory exercise stagnant but safe
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_duration_progress

- Title: Duration exercise progressing
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l1_clear_repeated_success

- Title: Repeated success with strong momentum
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_l1_low_evidence_new_block

- Title: New block with sparse evidence
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:57
- Evidence quality score: 57
- Derived quality breakdown: data 47, recency 95, planned 65, comparable 33, source 48, consistency 67, final 57
- Same-exercise successful exposures: 1
- Recommendation confidence: 48

### v07_l1_minor_technique_limit

- Title: Minor technique limit
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l2_missed_week

- Title: Missed week after busy period
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 13
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:26
- Evidence quality score: 26
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 23, consistency 43, final 26
- Same-exercise successful exposures: 1
- Recommendation confidence: 24

### v07_l2_time_constrained_stable

- Title: Time constrained but stable training
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_poor_readiness_strong_performance

- Title: Poor readiness, strong performance
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l2_feels_great_declining

- Title: Feels great but objective decline
- Level: Level 2 - Real Life
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l2_high_stress_stable

- Title: High stress, objective data stable
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_low_motivation_consistent

- Title: Low motivation, consistent sessions
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_sleep_poor_performance_ok

- Title: Poor sleep report, performance okay
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_repeated_skips_time

- Title: Repeated skipped accessories from time
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_travel_interruption

- Title: Travel interruption, no clear performance loss
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:56
- Evidence quality score: 56
- Derived quality breakdown: data 47, recency 95, planned 65, comparable 33, source 48, consistency 59, final 56
- Same-exercise successful exposures: 1
- Recommendation confidence: 48

### v07_l2_recovery_work_completed

- Title: Recovery work completed and training stable
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_cardio_added_no_strength_drop

- Title: Cardio added, strength stable
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_late_session_density

- Title: Training compressed but work completed
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_one_bad_day

- Title: One bad day after normal progress
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l2_equipment_swap

- Title: Equipment swap but training completed
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l3_adaptation_high_recovery_low

- Title: Adaptation high, recovery low
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_systemic_fatigue

- Title: Systemic fatigue across multiple lifts
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_repeated_same_load_collapse

- Title: Repeated same-load collapse
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_repeated_shutdown_same_pattern

- Title: Repeated shutdown same pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_local_failure_not_systemic

- Title: Local failure should stay local
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_momentum_low_recovery_good

- Title: Momentum low, recovery good
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:66
- Evidence quality score: 66
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 77, consistency 79, final 66
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l3_confidence_low_stable_objective

- Title: Confidence low, objective stable
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l3_low_evidence_promising

- Title: Low evidence but promising performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:64
- Evidence quality score: 64
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 87, final 64
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l3_good_progress_high_soreness

- Title: Good progress with high soreness
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_minor_pain_no_performance_loss

- Title: Mild pain report, no performance loss
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 63
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l3_worsening_pain

- Title: Worsening pain across sessions
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `stop`, veto true, confidence 88
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l3_sharp_pain_movement

- Title: Sharp pain on squat pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 75, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 82

### v07_l4_advanced_powerlifter_peak_fatigue

- Title: Advanced lifter progressing but fatigue cost high
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_bodybuilder_local_failure

- Title: Bodybuilder local isolation failure
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l4_compound_axial_stack

- Title: High cost compound fatigue stack
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_productive_isolation_fatigue

- Title: High-rep isolation productive fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_low_frequency_stimulus

- Title: Low frequency requires clear but not brutal work
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_return_after_illness

- Title: Return after interruption with low evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 13
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:26
- Evidence quality score: 26
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 23, consistency 43, final 26
- Same-exercise successful exposures: 1
- Recommendation confidence: 24

### v07_l4_unsafe_report

- Title: User explicitly reports unsafe training
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 82

### v07_l4_dizziness_systemic

- Title: Dizziness reported during session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate, derived_quality:70
- Evidence quality score: 70
- Derived quality breakdown: data 58, recency 95, planned 100, comparable 33, source 67, consistency 75, final 70
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l4_repeated_swap_possible_pain

- Title: Repeated swap with technique concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l4_long_run_of_success

- Title: Long successful run with no fatigue concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:96
- Evidence quality score: 96
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 100, source 94, consistency 87, final 96
- Same-exercise successful exposures: 4
- Recommendation confidence: 85

### v07_l4_conflicting_signals

- Title: Strong upper body, lower body down
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:85
- Evidence quality score: 85
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 67, source 94, consistency 67, final 85
- Same-exercise successful exposures: 2
- Recommendation confidence: 93

### v07_l4_recovery_week_needed

- Title: Systemic decline after overload
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:poor, exercise_records:3, continuity:consistent, data_completeness:high, derived_quality:82
- Evidence quality score: 82
- Derived quality breakdown: data 98, recency 95, planned 100, comparable 33, source 94, consistency 75, final 82
- Same-exercise successful exposures: 1
- Recommendation confidence: 92

### v07_l4_not_enough_data_do_not_overfit

- Title: Not enough data, do not overfit
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:66
- Evidence quality score: 66
- Derived quality breakdown: data 58, recency 95, planned 100, comparable 33, source 48, consistency 67, final 66
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l1_steady_double_progression

- Title: Steady load and rep progression
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_l1_repeated_rep_prs

- Title: Repeated rep PRs across sessions
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 67, source 94, consistency 87, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_l1_single_rep_pr_hold

- Title: One rep PR only
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_productive_fatigue_upper

- Title: Productive fatigue after upper-body load increase
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l1_planned_consolidation_after_push

- Title: Planned consolidation after a push
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, consolidation:planned_due, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l1_successful_recovery_week_return

- Title: Successful return after recovery week
- Level: Level 1 - Normal Progression
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_accessory_progress_no_compound_change

- Title: Accessory improves while compounds stable
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:moderate, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 77, consistency 87, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l1_duration_hold_progress

- Title: Duration hold improves
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l1_barely_in_range_high_fatigue

- Title: Barely in range with fatigue
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l1_clean_low_frequency_progress

- Title: Clean progress on low frequency
- Level: Level 1 - Normal Progression
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l1_high_frequency_clean_but_tired

- Title: High frequency clean performance but tired
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_l1_new_exercise_uncertain_success

- Title: New exercise success but uncertain
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:73
- Evidence quality score: 73
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 58, consistency 79, final 73
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l1_repeated_success_no_pr

- Title: No PRs but steady work
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 88

### v07_l1_momentum_positive_not_aggressive

- Title: Momentum positive but no need to chase
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_above_range_repeated_is_earned

- Title: Repeated above range is earned progression
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 67, source 94, consistency 87, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_l1_productive_fatigue_not_recovery

- Title: Productive fatigue should not become recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l1_mild_dropoff_after_pr

- Title: Mild drop-off after a PR
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 77, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_recovery_week_completed_stable

- Title: Recovery week completed, stable return
- Level: Level 1 - Normal Progression
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l1_strength_skill_stable

- Title: Strength skill stable, avoid novelty
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l1_beginner_confidence_win

- Title: Beginner needs a confidence win
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_holiday_two_sessions_missed

- Title: Holiday with two missed sessions
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:56
- Evidence quality score: 56
- Derived quality breakdown: data 47, recency 95, planned 65, comparable 33, source 48, consistency 59, final 56
- Same-exercise successful exposures: 1
- Recommendation confidence: 48

### v07_l2_illness_return_low_evidence

- Title: Illness return with low evidence
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 13
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:26
- Evidence quality score: 26
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 23, consistency 43, final 26
- Same-exercise successful exposures: 1
- Recommendation confidence: 24

### v07_l2_work_stress_but_strong_sets

- Title: Work stress but strong sets
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l2_shift_work_sleep_poor_stable

- Title: Shift work poor sleep, stable training
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_new_baby_consistent_short_sessions

- Title: New baby, consistent short sessions
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_inconsistent_schedule_good_performance

- Title: Inconsistent schedule but good performance
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:66
- Evidence quality score: 66
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 77, consistency 79, final 66
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l2_short_training_week_one_good_session

- Title: Short week with one good session
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 79, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l2_claims_fatigue_keeps_progressing

- Title: Claims fatigue but keeps progressing
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l2_low_motivation_high_adherence

- Title: Low motivation but high adherence
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l2_feels_awful_hits_targets

- Title: Feels awful but hits targets
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l2_feels_great_misses_targets

- Title: Feels great but misses targets
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l2_stress_high_performance_stable

- Title: High stress, performance stable
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_missed_sessions_after_overload

- Title: Missed sessions after overload
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `caution`, veto false, confidence 31
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:moderate, derived_quality:28
- Evidence quality score: 28
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 42, consistency 43, final 28
- Same-exercise successful exposures: 1
- Recommendation confidence: 29

### v07_l2_session_cut_short_no_failure

- Title: Session cut short without failure
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_after_travel_first_week_back

- Title: First week back after travel
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:56
- Evidence quality score: 56
- Derived quality breakdown: data 47, recency 95, planned 65, comparable 33, source 48, consistency 59, final 56
- Same-exercise successful exposures: 1
- Recommendation confidence: 48

### v07_l2_holiday_then_pr

- Title: Holiday then one PR
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 79, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l2_work_trip_sleep_poor_declining

- Title: Work trip poor sleep and declining lifts
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:6, session_quality:poor, exercise_records:2, continuity:interrupted, data_completeness:high, derived_quality:69
- Evidence quality score: 69
- Derived quality breakdown: data 76, recency 95, planned 65, comparable 33, source 94, consistency 67, final 69
- Same-exercise successful exposures: 1
- Recommendation confidence: 72

### v07_l2_family_disruption_stable

- Title: Family disruption, stable behaviour
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l2_inconsistent_but_no_decline

- Title: Inconsistent but no decline
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 79, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l2_short_sessions_progressing

- Title: Short sessions progressing
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l3_bench_stalls_lower_improves

- Title: Bench stalls while lower body improves
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 67, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l3_squat_stalls_accessories_improve

- Title: Squat stalls, accessories improve
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:85
- Evidence quality score: 85
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 67, source 94, consistency 67, final 85
- Same-exercise successful exposures: 2
- Recommendation confidence: 93

### v07_l3_deadlift_fatigue_accumulates

- Title: Deadlift fatigue accumulates
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_isolation_stall_only

- Title: Isolation exercise stalls only
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 75, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_swap_improves_performance

- Title: Exercise swap improves performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, swap_exposures:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_new_exercise_uncertainty

- Title: New exercise uncertainty
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:73
- Evidence quality score: 73
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 58, consistency 79, final 73
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_multiple_lifts_declining

- Title: Multiple lifts declining
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_repeated_shutdowns_same_pattern

- Title: Repeated shutdowns same pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_dropping_despite_rest

- Title: Performance dropping despite rest
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_recovery_week_needed

- Title: Recovery week appears needed
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_recovery_week_not_needed_one_bad_lift

- Title: Recovery week not needed from one bad lift
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_mild_discomfort_improving

- Title: Mild discomfort with improving performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 63
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 72

### v07_l3_pain_improving_performance

- Title: Pain report but performance improving
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 63
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 72

### v07_l3_pain_declining_performance

- Title: Pain with declining performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 63
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 76

### v07_l3_tech_breakdown_bench

- Title: Bench technique breakdown
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_tech_breakdown_deadlift

- Title: Deadlift technique breakdown
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `substitute` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_stop_movement_not_session

- Title: Movement-specific stop, not session stop
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 75, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 82

### v07_l3_session_stop_systemic_red_flag

- Title: Session-wide stop for systemic red flag
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate, derived_quality:70
- Evidence quality score: 70
- Derived quality breakdown: data 58, recency 95, planned 100, comparable 33, source 67, consistency 75, final 70
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l3_confidence_low_after_failed_lift

- Title: Confidence low after failed lift
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l3_confidence_high_weak_evidence

- Title: Confidence high but evidence weak
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 58, consistency 87, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l3_needs_clear_win

- Title: Needs a clear win after stagnation
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l3_variety_needed_adherence

- Title: Variety needed for adherence but performance okay
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l3_6_to_3_days_constraint

- Title: Six days to three days constraint
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:66
- Evidence quality score: 66
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 77, consistency 79, final 66
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l3_3_to_5_days_progressing

- Title: Three to five days, progressing
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l3_high_frequency_fatigue

- Title: High frequency accumulating fatigue
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, stimulus:high_frequency_fatigue, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l3_low_frequency_progressing

- Title: Low frequency lifter progressing
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 77, consistency 87, final 89
- Same-exercise successful exposures: 4
- Recommendation confidence: 98

### v07_l3_long_sessions_quality_dropping

- Title: Long sessions causing quality drop
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l3_short_sessions_no_issue

- Title: Short sessions without issue
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_advanced_plateau_no_fatigue

- Title: Advanced plateau without fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l4_repeated_deload_requests_no_need

- Title: Repeated deload requests without objective need
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l4_aggressive_progress_hidden_fatigue

- Title: Aggressive progress with hidden fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:86
- Evidence quality score: 86
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 67, source 94, consistency 75, final 86
- Same-exercise successful exposures: 2
- Recommendation confidence: 93

### v07_l4_high_performing_bored

- Title: High-performing but bored athlete
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l4_successful_but_high_joint_cost

- Title: Technically successful but high long-term cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_too_many_compounds_low_frequency

- Title: Too many compounds in low-frequency plan
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:mixed, exercise_records:3, stimulus:compound_density_high, stimulus:low_frequency_high_density, continuity:consistent, data_completeness:moderate, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 98, recency 95, planned 100, comparable 33, source 77, consistency 67, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_excessive_isolation_volume

- Title: Excessive isolation volume
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:moderate, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 77, consistency 75, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l4_returning_after_time_away

- Title: Returning after time away
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 13
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:26
- Evidence quality score: 26
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 23, consistency 43, final 26
- Same-exercise successful exposures: 1
- Recommendation confidence: 24

### v07_l4_cutting_phase_stable

- Title: Cutting phase, stable performance
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_cutting_phase_decline

- Title: Cutting phase, performance declining
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_maintenance_low_stress

- Title: Maintenance phase low stress
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_recomposition_slow_progress

- Title: Recomposition slow progress
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_peaking_high_fatigue

- Title: Peaking with high fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_l4_post_peak_return

- Title: Post-peak return
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 79, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l4_powerlifter_mild_pain_good_lifts

- Title: Powerlifter mild pain with good lifts
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 63
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 72

### v07_l4_bodybuilder_local_pump_dropoff

- Title: Bodybuilder local pump drop-off
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 75, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_advanced_hidden_overreach

- Title: Advanced hidden overreach
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:good, exercise_records:3, continuity:consistent, data_completeness:high, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 98, recency 95, planned 100, comparable 67, source 94, consistency 75, final 89
- Same-exercise successful exposures: 2
- Recommendation confidence: 100

### v07_l4_repeated_swap_avoidance

- Title: Repeated swaps may signal avoidance
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l4_high_load_low_reps_joint_cost

- Title: High-load low-rep work with joint cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_multiple_small_wins_after_slump

- Title: Multiple small wins after slump
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:moderate, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 100, source 77, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l4_weak_evidence_big_claims

- Title: Weak evidence with big claims
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 58, consistency 87, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_systemic_red_flag_good_performance

- Title: Systemic red flag despite good performance
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 83

### v07_l4_worsening_pain_no_systemic

- Title: Worsening pain without systemic red flags
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `stop`, veto true, confidence 88
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l4_worsening_pain_with_systemic

- Title: Worsening pain with unsafe feeling
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:poor, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:high, derived_quality:72
- Evidence quality score: 72
- Derived quality breakdown: data 58, recency 95, planned 100, comparable 33, source 84, consistency 75, final 72
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l4_good_week_after_deload

- Title: Good week after deload
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:92
- Evidence quality score: 92
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 100, source 94, consistency 87, final 92
- Same-exercise successful exposures: 4
- Recommendation confidence: 99

### v07_l4_deload_requested_after_one_bad_day

- Title: Deload requested after one bad day
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 67, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l4_recovery_week_completed_but_still_declining

- Title: Recovery week completed but still declining
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_progressing_but_adherence_fragile

- Title: Progressing but adherence fragile
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_high_volume_not_failure

- Title: High volume completed, not failure
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_l4_compound_cost_high_accessory_available

- Title: Compound cost high, accessory available
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 67, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_technical_success_bad_cost

- Title: Technical success with bad fatigue cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_post_illness_too_eager

- Title: Post-illness too eager
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 13
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:26
- Evidence quality score: 26
- Derived quality breakdown: data 36, recency 25, planned 0, comparable 33, source 23, consistency 43, final 26
- Same-exercise successful exposures: 1
- Recommendation confidence: 24

### v07_l4_powerlifting_peak_success_no_extra

- Title: Powerlifting peak success, no extra fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_l4_body_recomp_stress_high_stable

- Title: Recomp with high stress but stable
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_maintenance_after_busy_month

- Title: Maintenance after busy month
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 64, recency 95, planned 65, comparable 33, source 58, consistency 79, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_l4_advanced_plateau_with_good_recovery

- Title: Advanced plateau with good recovery
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:78
- Evidence quality score: 78
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 87, final 78
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_l4_hidden_pain_plus_pr

- Title: PR paired with hidden pain
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 84
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:85
- Evidence quality score: 85
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 67, source 94, consistency 87, final 85
- Same-exercise successful exposures: 2
- Recommendation confidence: 98

### v07_l4_new_exercise_pr_not_true_adaptation

- Title: New exercise PR is not true adaptation
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:74
- Evidence quality score: 74
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 58, consistency 87, final 74
- Same-exercise successful exposures: 1
- Recommendation confidence: 67

### v07_l4_local_failure_after_big_block

- Title: Local failure after big block
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 57
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 94, consistency 67, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 66

### v07_l4_systemic_fatigue_without_pain

- Title: Systemic fatigue without pain
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_unusual_symptoms_mid_session

- Title: Unusual symptoms mid-session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate, derived_quality:70
- Evidence quality score: 70
- Derived quality breakdown: data 58, recency 95, planned 100, comparable 33, source 67, consistency 75, final 70
- Same-exercise successful exposures: 1
- Recommendation confidence: 81

### v07_l4_low_back_capacity_success

- Title: Low Back Capacity success should not drive main push
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_cardio_recovery_good_strength_stable

- Title: Cardio recovery good, strength stable
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:76
- Evidence quality score: 76
- Derived quality breakdown: data 75, recency 95, planned 100, comparable 33, source 77, consistency 87, final 76
- Same-exercise successful exposures: 1
- Recommendation confidence: 70

### v07_l4_cardio_interference_signal

- Title: Cardio interference signal
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 87, recency 95, planned 100, comparable 33, source 94, consistency 75, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 75

### v07_l4_final_stress_test_mixed_everything

- Title: Mixed evidence stress test
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:mixed, exercise_records:3, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 98, recency 95, planned 100, comparable 67, source 94, consistency 67, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 100

### v07_label_leak_single_good_exposure_hold

- Title: Single good exposure should not push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 86

### v07_label_leak_repeated_good_exposures_push

- Title: Repeated good exposures can push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_label_leak_one_post_swap_consolidate

- Title: One post-swap improvement should consolidate
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, swap_exposures:1, continuity:consistent, data_completeness:moderate, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_label_leak_repeated_post_swap_push

- Title: Repeated post-swap success can push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, swap_exposures:4, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_label_leak_high_frequency_good_recovery_continue

- Title: High frequency with good recovery can continue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 88

### v07_label_leak_high_frequency_declining_recovery

- Title: High frequency with declining recovery should consolidate or reduce
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:2, stimulus:high_frequency_fatigue, continuity:consistent, data_completeness:high, derived_quality:82
- Evidence quality score: 82
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 87, final 82
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_label_leak_low_frequency_compound_dense_reduce

- Title: Low-frequency compound-dense plan should reduce density
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:2, stimulus:compound_density_high, stimulus:low_frequency_high_density, continuity:consistent, data_completeness:high, derived_quality:82
- Evidence quality score: 82
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 87, final 82
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_label_leak_low_frequency_balanced_hold

- Title: Low-frequency balanced plan should not be punished
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 88

### v07_label_leak_hidden_overreach_consolidate

- Title: Hidden overreach should consolidate
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:82
- Evidence quality score: 82
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 87, final 82
- Same-exercise successful exposures: 1
- Recommendation confidence: 84

### v07_label_leak_high_workload_good_recovery_not_overreach

- Title: Stable high workload with good recovery is not overreach
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:82
- Evidence quality score: 82
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 87, final 82
- Same-exercise successful exposures: 1
- Recommendation confidence: 88

### v07_incomplete_new_athlete_one_excellent_workout

- Title: New athlete, one excellent workout
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 86

### v07_incomplete_new_athlete_one_poor_workout

- Title: New athlete, one poor workout
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 47
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:63
- Evidence quality score: 63
- Derived quality breakdown: data 59, recency 95, planned 48, comparable 33, source 94, consistency 75, final 63
- Same-exercise successful exposures: 1
- Recommendation confidence: 61

### v07_missing_comparable_load_trend

- Title: Missing comparable-load trend
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 79, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 85

### v07_missing_safety_context

- Title: Missing safety context
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 77, consistency 87, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 71

### v07_incomplete_session_history

- Title: Incomplete session history
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 27
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:45
- Evidence quality score: 45
- Derived quality breakdown: data 36, recency 95, planned 0, comparable 33, source 59, consistency 87, final 45
- Same-exercise successful exposures: 1
- Recommendation confidence: 33

### v07_incomplete_exercise_history

- Title: Incomplete exercise history
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 79, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 85

### v07_subjective_great_missing_objective

- Title: Strong subjective readiness but missing objective evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 79, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 85

### v07_subjective_poor_missing_objective

- Title: Poor subjective readiness but missing objective evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 68
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 79, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 85

### v07_severe_pain_low_confidence_veto

- Title: Severe pain flag with low evidence confidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:low, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 87, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 96

### v07_worsening_pain_incomplete_history

- Title: Worsening pain with incomplete training history
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:low, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 79, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 95

### v07_raw_exposures_infer_improving

- Title: Performance trend inferred from raw exposures
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_shutdown_spacing_infer_fatigue

- Title: Fatigue inferred from shutdowns and compressed spacing
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:mixed, exercise_records:2, stimulus:high_frequency_fatigue, continuity:interrupted, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 75, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 92

### v07_local_issue_from_movement_history

- Title: Local lift issue inferred from movement pattern history
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 75, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 83

### v07_high_confidence_repeated_success_push

- Title: High confidence repeated success permits push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 5
- Recommendation confidence: 75

### v07_low_confidence_repeated_looking_success_hold

- Title: Low confidence repeated-looking success stays hold
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 60
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:90
- Evidence quality score: 90
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 58, consistency 87, final 90
- Same-exercise successful exposures: 3
- Recommendation confidence: 95

### v07_systemic_fatigue_from_multiple_declines

- Title: Systemic fatigue inferred from multiple movement declines
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:8, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 90, recency 95, planned 100, comparable 33, source 94, consistency 75, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 91

### v07_local_fatigue_not_systemic

- Title: Local fatigue only, no systemic recovery
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 75, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 83

### v07_missed_week_from_session_history

- Title: Missed week inferred from session history
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 27
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:0, planned_sessions_missed:4, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:37
- Evidence quality score: 37
- Derived quality breakdown: data 36, recency 70, planned 0, comparable 33, source 59, consistency 44, final 37
- Same-exercise successful exposures: 1
- Recommendation confidence: 30

### v07_inconsistent_attendance_from_spacing

- Title: Inconsistent attendance inferred from session spacing
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:6, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:68
- Evidence quality score: 68
- Derived quality breakdown: data 70, recency 95, planned 65, comparable 33, source 94, consistency 69, final 68
- Same-exercise successful exposures: 1
- Recommendation confidence: 68

### v07_good_continuity_from_completed_sessions

- Title: Good continuity inferred from completed planned sessions
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 3
- Recommendation confidence: 82

### v07_poor_continuity_strong_return

- Title: Poor continuity but strong return performance
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 47
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:3, completed_sets:3, session_quality:good, exercise_records:1, continuity:missed_week, data_completeness:low, derived_quality:56
- Evidence quality score: 56
- Derived quality breakdown: data 59, recency 70, planned 48, comparable 33, source 94, consistency 45, final 56
- Same-exercise successful exposures: 1
- Recommendation confidence: 49

### v07_high_evidence_push_allowed

- Title: High evidence push allowed
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:6, planned_sessions_missed:0, completed_sets:18, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 5
- Recommendation confidence: 75

### v07_moderate_evidence_push_withheld

- Title: Moderate evidence push withheld
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate, derived_quality:86
- Evidence quality score: 86
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 67, source 77, consistency 87, final 86
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_three_successful_exposures_allow_push

- Title: Three comparable successful exposures allow push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 3
- Recommendation confidence: 75

### v07_two_successful_exposures_do_not_push

- Title: Two successful exposures do not allow push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 67, source 94, consistency 87, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_new_exercise_uncertainty_prevents_push

- Title: New exercise uncertainty prevents push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 82

### v07_recent_swap_uncertainty_prevents_push

- Title: Recent swap uncertainty prevents push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, swap_exposures:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 95

### v07_pain_veto_low_confidence

- Title: Safety pain veto with low evidence confidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 82
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:low, derived_quality:77
- Evidence quality score: 77
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 58, consistency 87, final 77
- Same-exercise successful exposures: 1
- Recommendation confidence: 80

### v07_low_confidence_caution_wording

- Title: Low-confidence caution wording
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 47
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:79
- Evidence quality score: 79
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 67, final 79
- Same-exercise successful exposures: 1
- Recommendation confidence: 65

### v07_strong_recovery_incomplete_evidence_holds

- Title: Strong recovery but incomplete evidence still holds
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 47
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:64
- Evidence quality score: 64
- Derived quality breakdown: data 59, recency 95, planned 48, comparable 33, source 94, consistency 87, final 64
- Same-exercise successful exposures: 1
- Recommendation confidence: 65

### v07_high_quality_many_planned_sessions

- Title: High-quality evidence from many planned sessions
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:8, planned_sessions_missed:0, completed_sets:24, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 75

### v07_low_quality_one_session

- Title: Low-quality evidence from one session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 47
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:62
- Evidence quality score: 62
- Derived quality breakdown: data 59, recency 95, planned 48, comparable 33, source 77, consistency 87, final 62
- Same-exercise successful exposures: 1
- Recommendation confidence: 64

### v07_extra_session_noise_low_planned

- Title: High extra-session noise but low planned evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Safety Gate: `clear`, veto false, confidence 57
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:18, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate, derived_quality:69
- Evidence quality score: 69
- Derived quality breakdown: data 72, recency 95, planned 21, comparable 100, source 72, consistency 59, final 69
- Same-exercise successful exposures: 4
- Recommendation confidence: 68

### v07_warmup_only_low_quality

- Title: Warm-up-only data should not create high evidence quality
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `clear`, veto false, confidence 39
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:3, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low, derived_quality:58
- Evidence quality score: 58
- Derived quality breakdown: data 53, recency 95, planned 83, comparable 0, source 48, consistency 87, final 58
- Same-exercise successful exposures: 0
- Recommendation confidence: 48

### v07_pattern_improves_same_exercise_missing

- Title: Same movement pattern improves but same exercise lacks exposures
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:89
- Evidence quality score: 89
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 67, source 94, consistency 87, final 89
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_same_exercise_three_successes_push

- Title: Same exercise three successful exposures permits push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 3
- Recommendation confidence: 75

### v07_same_exercise_two_successes_hold

- Title: Same exercise two successful exposures withholds push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 67, source 94, consistency 87, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 82

### v07_new_exercise_blocks_push

- Title: New exercise uncertainty blocks push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 82

### v07_post_swap_one_exposure_blocks_push

- Title: Post-swap one exposure blocks push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, swap_exposures:1, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 95

### v07_post_swap_three_successes_permit_push

- Title: Post-swap three successful exposures permits push
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, swap_exposures:3, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 3
- Recommendation confidence: 75

### v07_systemic_fatigue_enough_evidence_recovers

- Title: Systemic fatigue with enough evidence permits recover
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:6, planned_sessions_missed:0, completed_sets:16, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 75, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 92

### v07_systemic_looking_low_evidence_consolidates

- Title: Systemic-looking fatigue with low evidence consolidates
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 47
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:5, session_quality:poor, exercise_records:2, continuity:interrupted, data_completeness:low, derived_quality:65
- Evidence quality score: 65
- Derived quality breakdown: data 69, recency 95, planned 48, comparable 33, source 94, consistency 75, final 65
- Same-exercise successful exposures: 1
- Recommendation confidence: 69

### v07_local_decline_only_reduces

- Title: Local decline only reduces or substitutes
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 91%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 75, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 91

### v07_multiple_movement_declines_recover

- Title: Multiple movement declines permit recover
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `restrict`, veto true, confidence 78
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:14, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:81
- Evidence quality score: 81
- Derived quality breakdown: data 94, recency 95, planned 100, comparable 33, source 94, consistency 75, final 81
- Same-exercise successful exposures: 1
- Recommendation confidence: 92

### v07_poor_response_after_rest_recovers

- Title: Poor response after rest permits recover
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `restrict`, veto true, confidence 57
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:10, session_quality:poor, exercise_records:2, continuity:missed_week, data_completeness:high, derived_quality:75
- Evidence quality score: 75
- Derived quality breakdown: data 94, recency 70, planned 100, comparable 33, source 94, consistency 57, final 75
- Same-exercise successful exposures: 1
- Recommendation confidence: 74

### v07_low_confidence_safety_caution_wording

- Title: Low-confidence safety caution wording
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Safety Gate: `caution`, veto false, confidence 39
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:2, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low, derived_quality:58
- Evidence quality score: 58
- Derived quality breakdown: data 57, recency 95, planned 48, comparable 33, source 58, consistency 75, final 58
- Same-exercise successful exposures: 1
- Recommendation confidence: 44

### v07_high_confidence_safety_caution_wording

- Title: High-confidence safety caution wording
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Safety Gate: `caution`, veto false, confidence 78
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:80
- Evidence quality score: 80
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 33, source 94, consistency 75, final 80
- Same-exercise successful exposures: 1
- Recommendation confidence: 83

### v07_severe_pain_low_evidence_veto

- Title: Severe pain veto with low evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 90
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:1, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:interrupted, data_completeness:low, derived_quality:64
- Evidence quality score: 64
- Derived quality breakdown: data 59, recency 95, planned 48, comparable 33, source 94, consistency 87, final 64
- Same-exercise successful exposures: 1
- Recommendation confidence: 77

### v07_severe_pain_high_evidence_veto

- Title: Severe pain veto with high evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Safety Gate: `stop`, veto true, confidence 100
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high, derived_quality:94
- Evidence quality score: 94
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 100, source 94, consistency 87, final 94
- Same-exercise successful exposures: 4
- Recommendation confidence: 100

### v07_recovery_request_without_objective_evidence_holds

- Title: Recovery request without objective evidence does not recover
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Safety Gate: `clear`, veto false, confidence 78
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:12, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:88
- Evidence quality score: 88
- Derived quality breakdown: data 88, recency 95, planned 100, comparable 67, source 94, consistency 87, final 88
- Same-exercise successful exposures: 2
- Recommendation confidence: 98


## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
