# Coaching Gauntlet v0.3

Generated: 2026-06-28T16:47:30.268Z

## Scope

The Coaching Gauntlet v0.3 migrates the 164-scenario v0.2 lab to explicit evidence fields. Legacy broad fixture labels are retained for compatibility comparison, but the lab engines now prefer concrete v0.3 fields where rules support them.

## Pass/Fail Summary

- Total scenarios: 164
- Passed: 164
- Failed: 0
- Pass rate: 100%
- Decisions changed from v0.2: 0

## Explicit Evidence Fields Added

- Session history: planned completed/missed, extra sessions, spacing, completed sets, skipped exercises, duration, completion quality.
- Exercise history: movement pattern, target range, loads, reps/seconds, range success, comparable-load trend, load events, shutdowns, below-minimum events, above-range events, productive fatigue, new-exercise flag.
- Swap history: from/to, reason, post-swap performance, exposure count, improvement confirmation.
- Consolidation history: recent push, planned consolidation, completion, owns-new-load, repeated successful exposures.
- Frequency/stimulus constraints: available days, current frequency, session density, compound density, hard-set estimate, axial loading, high-fatigue clustering, low-frequency/high-density warning.
- Safety context: affected area/pattern, pain trend, pain severity, technique breakdown, systemic red flags, movement-specific vs session-wide scope.
- Evidence confidence: planned evidence count, comparable exposure count, recency, completeness, source quality.

## Level Summary

- Level 1 - Normal Progression: 32/32 passed (100%)
- Level 2 - Real Life: 34/34 passed (100%)
- Level 3 - Coaching Judgement: 40/40 passed (100%)
- Level 4 - Expert Coaching: 58/58 passed (100%)

## Recommendation Distribution

- `consolidate`: 12
- `hold`: 100
- `push`: 2
- `recover`: 11
- `reduce`: 28
- `stop_movement`: 4
- `stop_session`: 6
- `substitute`: 1

## Evidence Drivers

- planned_sessions_completed: 164
- planned_sessions_missed: 164
- completed_sets: 164
- session_quality: 164
- exercise_records: 164
- continuity: 164
- data_completeness: 164
- safety_scope: 16
- stimulus: 3
- derived_quality: 2
- consolidation: 1
- swap_exposures: 1

## Decisions Changed Due To Evidence Detail

- No recommendation, aggressiveness, or Safety Gate status changed versus v0.2. Evidence detail made the reasoning more traceable without changing outputs.

## Remaining Broad Fixture Signals

- systemicSignals still contains lab-only marker `compound_density_high`
- systemicSignals still contains lab-only marker `hidden_overreach`
- systemicSignals still contains lab-only marker `high_frequency`
- systemicSignals still contains lab-only marker `planned_consolidation`
- systemicSignals still contains lab-only marker `post_swap_improvement`

## Failed Scenarios

- No failed scenarios in this run.

## Weakest Scenarios

### Repeated success with strong momentum

- ID: `v03_l1_clear_repeated_success`
- Pass: true
- Score: 91%
- Expected: `push`
- Actual: `push` / `moderate`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94
- Failure reasons: none

### Long successful run with no fatigue concern

- ID: `v03_l4_long_run_of_success`
- Pass: true
- Score: 91%
- Expected: `push`
- Actual: `push` / `moderate`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:96
- Failure reasons: none

### Duration exercise progressing

- ID: `v03_l1_duration_progress`
- Pass: true
- Score: 94%
- Expected: `push`, `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Duration hold improves

- ID: `v03_l1_duration_hold_progress`
- Pass: true
- Score: 94%
- Expected: `hold`, `push`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Three to five days, progressing

- ID: `v03_l3_3_to_5_days_progressing`
- Pass: true
- Score: 94%
- Expected: `hold`, `push`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Long sessions causing quality drop

- ID: `v03_l3_long_sessions_quality_dropping`
- Pass: true
- Score: 94%
- Expected: `reduce`, `consolidate`
- Actual: `reduce` / `very_low`
- Safety Gate: expected `restrict`, actual `restrict`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high
- Failure reasons: aggressiveness outside expected range

### Multiple small wins after slump

- ID: `v03_l4_multiple_small_wins_after_slump`
- Pass: true
- Score: 94%
- Expected: `hold`, `push`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Clean progression with high recovery

- ID: `v03_l1_clean_progression`
- Pass: true
- Score: 97%
- Expected: `push`, `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high
- Failure reasons: none

### Above range once, avoid reckless jump

- ID: `v03_l1_above_range_first_signal`
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Bare minimum success should not over-push

- ID: `v03_l1_bare_minimum_success`
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Same load stable with good recovery

- ID: `v03_l1_same_load_stable`
- Pass: true
- Score: 97%
- Expected: `hold`, `push`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none

### Local drop-off without systemic signal

- ID: `v03_l1_local_dropoff`
- Pass: true
- Score: 97%
- Expected: `hold`, `reduce`
- Actual: `hold` / `low`
- Safety Gate: expected `caution`, actual `caution`
- Evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate
- Failure reasons: none


## Open Aaron Decisions

1. Should v0.4 remove legacy broad fixture labels entirely and force every rule through explicit evidence fields?
2. Should explicit evidence confidence change score magnitudes, or remain explanatory until validated against simulation?
3. Which explicit fields should become mandatory before a future production prototype can make an intervention?
4. Should swap/consolidation/frequency evidence become first-class production data tables later?

## Full Scenario Results

### v03_l1_clean_progression

- Title: Clean progression with high recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_above_range_first_signal

- Title: Above range once, avoid reckless jump
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_bare_minimum_success

- Title: Bare minimum success should not over-push
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 62, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 62, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_productive_heavier_load

- Title: Heavier load stays inside target range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l1_same_load_stable

- Title: Same load stable with good recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_local_miss

- Title: One local lift misses range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l1_local_dropoff

- Title: Local drop-off without systemic signal
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 37, recovery_capacity 44, momentum 59, confidence 51, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 37, recovery_capacity 44, momentum 59, confidence 51, opportunity 62.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_accessory_stall

- Title: Accessory exercise stagnant but safe
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 51, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 51, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_duration_progress

- Title: Duration exercise progressing
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 63 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_clear_repeated_success

- Title: Repeated success with strong momentum
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 94, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Explicit evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high, derived_quality:94

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Excellent state and clear safety allow a small controlled push.
- Push category: micro_push.
- Push Decision Policy: Micro push is allowed only when stronger push types are not a fit but objective evidence still earns a small step. Micro push is not assumed safe by default.

User message:

You're adapting well. We'll make a small push today and keep it controlled.

### v03_l1_low_evidence_new_block

- Title: New block with sparse evidence
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_minor_technique_limit

- Title: Minor technique limit
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 40, recovery_capacity 52, momentum 59, confidence 38, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 40, recovery_capacity 52, momentum 59, confidence 38, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l2_missed_week

- Title: Missed week after busy period
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, evidence_quality 32, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_time_constrained_stable

- Title: Time constrained but stable training
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_poor_readiness_strong_performance

- Title: Poor readiness, strong performance
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, opportunity 74.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_feels_great_declining

- Title: Feels great but objective decline
- Level: Level 2 - Real Life
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, evidence_quality 92, opportunity 47
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, opportunity 47.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l2_high_stress_stable

- Title: High stress, objective data stable
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_low_motivation_consistent

- Title: Low motivation, consistent sessions
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_sleep_poor_performance_ok

- Title: Poor sleep report, performance okay
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 94, momentum 87, confidence 71, evidence_quality 68, opportunity 64
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 94, momentum 87, confidence 71, opportunity 64.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_repeated_skips_time

- Title: Repeated skipped accessories from time
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_travel_interruption

- Title: Travel interruption, no clear performance loss
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_recovery_work_completed

- Title: Recovery work completed and training stable
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 60, recovery_capacity 45, momentum 80, confidence 65, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 60, recovery_capacity 45, momentum 80, confidence 65, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_cardio_added_no_strength_drop

- Title: Cardio added, strength stable
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_late_session_density

- Title: Training compressed but work completed
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_one_bad_day

- Title: One bad day after normal progress
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 37, recovery_capacity 47, momentum 54, confidence 46, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 37, recovery_capacity 47, momentum 54, confidence 46, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l2_equipment_swap

- Title: Equipment swap but training completed
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 62, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 62, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_adaptation_high_recovery_low

- Title: Adaptation high, recovery low
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, evidence_quality 68, opportunity 42
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l3_systemic_fatigue

- Title: Systemic fatigue across multiple lifts
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l3_repeated_same_load_collapse

- Title: Repeated same-load collapse
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 32, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 32, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_repeated_shutdown_same_pattern

- Title: Repeated shutdown same pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 28, recovery_capacity 4, momentum 43, confidence 38, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 28, recovery_capacity 4, momentum 43, confidence 38, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_local_failure_not_systemic

- Title: Local failure should stay local
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_momentum_low_recovery_good

- Title: Momentum low, recovery good
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_confidence_low_stable_objective

- Title: Confidence low, objective stable
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_low_evidence_promising

- Title: Low evidence but promising performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 98, momentum 69, confidence 64, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 69, confidence 64, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_good_progress_high_soreness

- Title: Good progress with high soreness
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 80, recovery_capacity 23, momentum 91, confidence 74, evidence_quality 68, opportunity 42
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 80, recovery_capacity 23, momentum 91, confidence 74, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l3_minor_pain_no_performance_loss

- Title: Mild pain report, no performance loss
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_worsening_pain

- Title: Worsening pain across sessions
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 12, recovery_capacity 0, momentum 34, confidence 0, evidence_quality 92, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 12, recovery_capacity 0, momentum 34, confidence 0, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### v03_l3_sharp_pain_movement

- Title: Sharp pain on squat pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### v03_l4_advanced_powerlifter_peak_fatigue

- Title: Advanced lifter progressing but fatigue cost high
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, evidence_quality 92, opportunity 42
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l4_bodybuilder_local_failure

- Title: Bodybuilder local isolation failure
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 30, recovery_capacity 35, momentum 50, confidence 35, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 30, recovery_capacity 35, momentum 50, confidence 35, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_compound_axial_stack

- Title: High cost compound fatigue stack
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 0, recovery_capacity 0, momentum 43, confidence 38, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 43, confidence 38, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_productive_isolation_fatigue

- Title: High-rep isolation productive fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l4_low_frequency_stimulus

- Title: Low frequency requires clear but not brutal work
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_return_after_illness

- Title: Return after interruption with low evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 46, recovery_capacity 31, momentum 6, confidence 31, evidence_quality 32, opportunity 32
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 46, recovery_capacity 31, momentum 6, confidence 31, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_unsafe_report

- Title: User explicitly reports unsafe training
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 43, momentum 87, confidence 46, evidence_quality 68, opportunity 10
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 43, momentum 87, confidence 46, opportunity 10.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l4_dizziness_systemic

- Title: Dizziness reported during session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l4_repeated_swap_possible_pain

- Title: Repeated swap with technique concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_long_run_of_success

- Title: Long successful run with no fatigue concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 96, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `push` / `moderate`
- Pass: true
- Score: 91%
- Explicit evidence drivers: planned_sessions_completed:5, planned_sessions_missed:0, completed_sets:15, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high, derived_quality:96

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Excellent state and clear safety allow a small controlled push.
- Push category: micro_push.
- Push Decision Policy: Micro push is allowed only when stronger push types are not a fit but objective evidence still earns a small step. Micro push is not assumed safe by default.

User message:

You're adapting well. We'll make a small push today and keep it controlled.

### v03_l4_conflicting_signals

- Title: Strong upper body, lower body down
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 38, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 38, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_recovery_week_needed

- Title: Systemic decline after overload
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:poor, exercise_records:3, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_not_enough_data_do_not_overfit

- Title: Not enough data, do not overfit
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 90, momentum 59, confidence 42, evidence_quality 40, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 90, momentum 59, confidence 42, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_steady_double_progression

- Title: Steady load and rep progression
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 86, recovery_capacity 98, momentum 100, confidence 87, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 86, recovery_capacity 98, momentum 100, confidence 87, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 88 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_repeated_rep_prs

- Title: Repeated rep PRs across sessions
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 100, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 100, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_single_rep_pr_hold

- Title: One rep PR only
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 64, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 64, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_productive_fatigue_upper

- Title: Productive fatigue after upper-body load increase
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l1_planned_consolidation_after_push

- Title: Planned consolidation after a push
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 52, momentum 91, confidence 80, evidence_quality 92, opportunity 60
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, consolidation:planned_due, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 52, momentum 91, confidence 80, opportunity 60.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l1_successful_recovery_week_return

- Title: Successful return after recovery week
- Level: Level 1 - Normal Progression
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_accessory_progress_no_compound_change

- Title: Accessory improves while compounds stable
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 74, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 74, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_duration_hold_progress

- Title: Duration hold improves
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 63 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_barely_in_range_high_fatigue

- Title: Barely in range with fatigue
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 30, momentum 80, confidence 71, evidence_quality 68, opportunity 32
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 30, momentum 80, confidence 71, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_clean_low_frequency_progress

- Title: Clean progress on low frequency
- Level: Level 1 - Normal Progression
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_high_frequency_clean_but_tired

- Title: High frequency clean performance but tired
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 86, recovery_capacity 52, momentum 97, confidence 87, evidence_quality 92, opportunity 60
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 86, recovery_capacity 52, momentum 97, confidence 87, opportunity 60.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_new_exercise_uncertain_success

- Title: New exercise success but uncertain
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 52, recovery_capacity 90, momentum 65, confidence 49, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 52, recovery_capacity 90, momentum 65, confidence 49, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_repeated_success_no_pr

- Title: No PRs but steady work
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 72, recovery_capacity 98, momentum 93, confidence 78, evidence_quality 92, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 72, recovery_capacity 98, momentum 93, confidence 78, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_momentum_positive_not_aggressive

- Title: Momentum positive but no need to chase
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 52, momentum 91, confidence 71, evidence_quality 68, opportunity 60
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 52, momentum 91, confidence 71, opportunity 60.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_above_range_repeated_is_earned

- Title: Repeated above range is earned progression
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 100, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 100, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_productive_fatigue_not_recovery

- Title: Productive fatigue should not become recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 48, momentum 99, confidence 88, evidence_quality 92, opportunity 60
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 48, momentum 99, confidence 88, opportunity 60.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l1_mild_dropoff_after_pr

- Title: Mild drop-off after a PR
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 50, recovery_capacity 48, momentum 59, confidence 51, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 48, momentum 59, confidence 51, opportunity 62.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_recovery_week_completed_stable

- Title: Recovery week completed, stable return
- Level: Level 1 - Normal Progression
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, evidence_quality 92, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_strength_skill_stable

- Title: Strength skill stable, avoid novelty
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l1_beginner_confidence_win

- Title: Beginner needs a confidence win
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_holiday_two_sessions_missed

- Title: Holiday with two missed sessions
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_illness_return_low_evidence

- Title: Illness return with low evidence
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 46, recovery_capacity 23, momentum 6, confidence 27, evidence_quality 32, opportunity 24
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 46, recovery_capacity 23, momentum 6, confidence 27, opportunity 24.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_work_stress_but_strong_sets

- Title: Work stress but strong sets
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 91, momentum 98, confidence 64, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 91, momentum 98, confidence 64, opportunity 74.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_shift_work_sleep_poor_stable

- Title: Shift work poor sleep, stable training
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 41, momentum 80, confidence 55, evidence_quality 68, opportunity 42
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 41, momentum 80, confidence 55, opportunity 42.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_new_baby_consistent_short_sessions

- Title: New baby, consistent short sessions
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 59, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 59, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_inconsistent_schedule_good_performance

- Title: Inconsistent schedule but good performance
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 89, momentum 61, confidence 68, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 89, momentum 61, confidence 68, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_short_training_week_one_good_session

- Title: Short week with one good session
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 92, momentum 55, confidence 73, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 92, momentum 55, confidence 73, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_claims_fatigue_keeps_progressing

- Title: Claims fatigue but keeps progressing
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 94, momentum 98, confidence 76, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 94, momentum 98, confidence 76, opportunity 74.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_low_motivation_high_adherence

- Title: Low motivation but high adherence
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 67, evidence_quality 92, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 67, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_feels_awful_hits_targets

- Title: Feels awful but hits targets
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 66, recovery_capacity 79, momentum 87, confidence 57, evidence_quality 92, opportunity 56
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 66, recovery_capacity 79, momentum 87, confidence 57, opportunity 56.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_feels_great_misses_targets

- Title: Feels great but misses targets
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, evidence_quality 92, opportunity 47
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, opportunity 47.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l2_stress_high_performance_stable

- Title: High stress, performance stable
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_missed_sessions_after_overload

- Title: Missed sessions after overload
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 46, recovery_capacity 0, momentum 6, confidence 27, evidence_quality 60, opportunity 28
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:moderate

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 46, recovery_capacity 0, momentum 6, confidence 27, opportunity 28.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_session_cut_short_no_failure

- Title: Session cut short without failure
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_after_travel_first_week_back

- Title: First week back after travel
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 46, momentum 22, confidence 51, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 46, momentum 22, confidence 51, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_holiday_then_pr

- Title: Holiday then one PR
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 92, momentum 55, confidence 73, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 92, momentum 55, confidence 73, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_work_trip_sleep_poor_declining

- Title: Work trip poor sleep and declining lifts
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 0, confidence 2, evidence_quality 92, opportunity 36
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:6, session_quality:poor, exercise_records:2, continuity:interrupted, data_completeness:high

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 0, confidence 2, opportunity 36.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l2_family_disruption_stable

- Title: Family disruption, stable behaviour
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 76, confidence 51, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 76, confidence 51, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_inconsistent_but_no_decline

- Title: Inconsistent but no decline
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 92, momentum 50, confidence 62, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 92, momentum 50, confidence 62, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l2_short_sessions_progressing

- Title: Short sessions progressing
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_bench_stalls_lower_improves

- Title: Bench stalls while lower body improves
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 36, recovery_capacity 42, momentum 56, confidence 48, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 36, recovery_capacity 42, momentum 56, confidence 48, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_squat_stalls_accessories_improve

- Title: Squat stalls, accessories improve
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 44, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 44, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_deadlift_fatigue_accumulates

- Title: Deadlift fatigue accumulates
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 32, recovery_capacity 18, momentum 59, confidence 51, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 32, recovery_capacity 18, momentum 59, confidence 51, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_isolation_stall_only

- Title: Isolation exercise stalls only
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 41, recovery_capacity 93, momentum 63, confidence 39, evidence_quality 68, opportunity 68
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 41, recovery_capacity 93, momentum 63, confidence 39, opportunity 68.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_swap_improves_performance

- Title: Exercise swap improves performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, swap_exposures:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l3_new_exercise_uncertainty

- Title: New exercise uncertainty
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 52, momentum 65, confidence 49, evidence_quality 40, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 52, momentum 65, confidence 49, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_multiple_lifts_declining

- Title: Multiple lifts declining
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 13, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 13, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l3_repeated_shutdowns_same_pattern

- Title: Repeated shutdowns same pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 28, recovery_capacity 30, momentum 43, confidence 38, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 28, recovery_capacity 30, momentum 43, confidence 38, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_dropping_despite_rest

- Title: Performance dropping despite rest
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l3_recovery_week_needed

- Title: Recovery week appears needed
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l3_recovery_week_not_needed_one_bad_lift

- Title: Recovery week not needed from one bad lift
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_mild_discomfort_improving

- Title: Mild discomfort with improving performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 92, opportunity 78
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_pain_improving_performance

- Title: Pain report but performance improving
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 100, momentum 98, confidence 83, evidence_quality 92, opportunity 81
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 100, momentum 98, confidence 83, opportunity 81.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_pain_declining_performance

- Title: Pain with declining performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 4, recovery_capacity 0, momentum 29, confidence 13, evidence_quality 92, opportunity 40
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:poor, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 4, recovery_capacity 0, momentum 29, confidence 13, opportunity 40.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_tech_breakdown_bench

- Title: Bench technique breakdown
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_tech_breakdown_deadlift

- Title: Deadlift technique breakdown
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 28, recovery_capacity 30, momentum 59, confidence 39, evidence_quality 92, opportunity 44
- Safety Gate: `caution`, veto false
- Actual recommendation: `substitute` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 28, recovery_capacity 30, momentum 59, confidence 39, opportunity 44.
- Safety Gate is caution.

User message:

We'll avoid pushing this area today and choose a safer option.

### v03_l3_stop_movement_not_session

- Title: Movement-specific stop, not session stop
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### v03_l3_session_stop_systemic_red_flag

- Title: Session-wide stop for systemic red flag
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l3_confidence_low_after_failed_lift

- Title: Confidence low after failed lift
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 38, momentum 46, confidence 24, evidence_quality 68, opportunity 58
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 38, momentum 46, confidence 24, opportunity 58.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_confidence_high_weak_evidence

- Title: Confidence high but evidence weak
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 100, momentum 95, confidence 70, evidence_quality 40, opportunity 81
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 100, momentum 95, confidence 70, opportunity 81.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_needs_clear_win

- Title: Needs a clear win after stagnation
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 50, recovery_capacity 95, momentum 70, confidence 44, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 50, recovery_capacity 95, momentum 70, confidence 44, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_variety_needed_adherence

- Title: Variety needed for adherence but performance okay
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 95, momentum 83, confidence 55, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 95, momentum 83, confidence 55, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_6_to_3_days_constraint

- Title: Six days to three days constraint
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 49, momentum 42, confidence 46, evidence_quality 68, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 49, momentum 42, confidence 46, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_3_to_5_days_progressing

- Title: Three to five days, progressing
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 63 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_high_frequency_fatigue

- Title: High frequency accumulating fatigue
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 10, recovery_capacity 0, momentum 59, confidence 51, evidence_quality 92, opportunity 44
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, stimulus:high_frequency_fatigue, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 10, recovery_capacity 0, momentum 59, confidence 51, opportunity 44.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_low_frequency_progressing

- Title: Low frequency lifter progressing
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 95, momentum 98, confidence 68, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l3_long_sessions_quality_dropping

- Title: Long sessions causing quality drop
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 32, recovery_capacity 18, momentum 59, confidence 51, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 94%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 32, recovery_capacity 18, momentum 59, confidence 51, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l3_short_sessions_no_issue

- Title: Short sessions without issue
- Level: Level 3 - Coaching Judgement
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 95, momentum 87, confidence 59, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 95, momentum 87, confidence 59, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_advanced_plateau_no_fatigue

- Title: Advanced plateau without fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, evidence_quality 92, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_repeated_deload_requests_no_need

- Title: Repeated deload requests without objective need
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 66, recovery_capacity 87, momentum 83, confidence 57, evidence_quality 92, opportunity 64
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 66, recovery_capacity 87, momentum 83, confidence 57, opportunity 64.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_aggressive_progress_hidden_fatigue

- Title: Aggressive progress with hidden fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 79, recovery_capacity 0, momentum 85, confidence 73, evidence_quality 92, opportunity 42
- Safety Gate: `caution`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 79, recovery_capacity 0, momentum 85, confidence 73, opportunity 42.
- Safety Gate is caution.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l4_high_performing_bored

- Title: High-performing but bored athlete
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 94, confidence 76, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 94, confidence 76, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_successful_but_high_joint_cost

- Title: Technically successful but high long-term cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 66, recovery_capacity 30, momentum 80, confidence 71, evidence_quality 92, opportunity 32
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 66, recovery_capacity 30, momentum 80, confidence 71, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_too_many_compounds_low_frequency

- Title: Too many compounds in low-frequency plan
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 16, recovery_capacity 0, momentum 65, confidence 46, evidence_quality 68, opportunity 44
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:mixed, exercise_records:3, stimulus:compound_density_high, stimulus:low_frequency_high_density, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 16, recovery_capacity 0, momentum 65, confidence 46, opportunity 44.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_excessive_isolation_volume

- Title: Excessive isolation volume
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 10, recovery_capacity 20, momentum 59, confidence 42, evidence_quality 68, opportunity 44
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 10, recovery_capacity 20, momentum 59, confidence 42, opportunity 44.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_returning_after_time_away

- Title: Returning after time away
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 38, momentum 6, confidence 37, evidence_quality 32, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 38, momentum 6, confidence 37, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_cutting_phase_stable

- Title: Cutting phase, stable performance
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 52, momentum 80, confidence 71, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 52, momentum 80, confidence 71, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_cutting_phase_decline

- Title: Cutting phase, performance declining
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 0, recovery_capacity 0, momentum 25, confidence 18, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 25, confidence 18, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_maintenance_low_stress

- Title: Maintenance phase low stress
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 95, momentum 87, confidence 59, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 95, momentum 87, confidence 59, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_recomposition_slow_progress

- Title: Recomposition slow progress
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 71, evidence_quality 68, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 71, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_peaking_high_fatigue

- Title: Peaking with high fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 86, recovery_capacity 4, momentum 97, confidence 87, evidence_quality 92, opportunity 42
- Safety Gate: `clear`, veto false
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 86, recovery_capacity 4, momentum 97, confidence 87, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l4_post_peak_return

- Title: Post-peak return
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 46, recovery_capacity 52, momentum 42, confidence 58, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 46, recovery_capacity 52, momentum 42, confidence 58, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_powerlifter_mild_pain_good_lifts

- Title: Powerlifter mild pain with good lifts
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 100, momentum 98, confidence 83, evidence_quality 92, opportunity 81
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 100, momentum 98, confidence 83, opportunity 81.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_bodybuilder_local_pump_dropoff

- Title: Bodybuilder local pump drop-off
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 42, recovery_capacity 66, momentum 59, confidence 42, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 42, recovery_capacity 66, momentum 59, confidence 42, opportunity 62.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_advanced_hidden_overreach

- Title: Advanced hidden overreach
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 76, recovery_capacity 0, momentum 85, confidence 73, evidence_quality 92, opportunity 42
- Safety Gate: `restrict`, veto true
- Actual recommendation: `consolidate` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:good, exercise_records:3, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 76, recovery_capacity 0, momentum 85, confidence 73, opportunity 42.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### v03_l4_repeated_swap_avoidance

- Title: Repeated swaps may signal avoidance
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 40, recovery_capacity 49, momentum 55, confidence 31, evidence_quality 68, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 40, recovery_capacity 49, momentum 55, confidence 31, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_high_load_low_reps_joint_cost

- Title: High-load low-rep work with joint cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 66, recovery_capacity 30, momentum 80, confidence 71, evidence_quality 92, opportunity 32
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 66, recovery_capacity 30, momentum 80, confidence 71, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_multiple_small_wins_after_slump

- Title: Multiple small wins after slump
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 86, recovery_capacity 98, momentum 100, confidence 78, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 94%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 86, recovery_capacity 98, momentum 100, confidence 78, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 66 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_weak_evidence_big_claims

- Title: Weak evidence with big claims
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 100, momentum 95, confidence 79, evidence_quality 40, opportunity 81
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 100, momentum 95, confidence 79, opportunity 81.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_systemic_red_flag_good_performance

- Title: Systemic red flag despite good performance
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 46, momentum 98, confidence 58, evidence_quality 92, opportunity 23
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 46, momentum 98, confidence 58, opportunity 23.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l4_worsening_pain_no_systemic

- Title: Worsening pain without systemic red flags
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 0, momentum 80, confidence 46, evidence_quality 92, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_movement` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 0, momentum 80, confidence 46, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### v03_l4_worsening_pain_with_systemic

- Title: Worsening pain with unsafe feeling
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 3, evidence_quality 92, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:poor, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 3, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l4_good_week_after_deload

- Title: Good week after deload
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 80, recovery_capacity 91, momentum 98, confidence 74, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 80, recovery_capacity 91, momentum 98, confidence 74, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_deload_requested_after_one_bad_day

- Title: Deload requested after one bad day
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 37, recovery_capacity 43, momentum 50, confidence 38, evidence_quality 68, opportunity 58
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 37, recovery_capacity 43, momentum 50, confidence 38, opportunity 58.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_recovery_week_completed_but_still_declining

- Title: Recovery week completed but still declining
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_progressing_but_adherence_fragile

- Title: Progressing but adherence fragile
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 80, recovery_capacity 95, momentum 94, confidence 64, evidence_quality 68, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 80, recovery_capacity 95, momentum 94, confidence 64, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_high_volume_not_failure

- Title: High volume completed, not failure
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 72, recovery_capacity 52, momentum 86, confidence 78, evidence_quality 92, opportunity 50
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 72, recovery_capacity 52, momentum 86, confidence 78, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_compound_cost_high_accessory_available

- Title: Compound cost high, accessory available
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 38, recovery_capacity 11, momentum 65, confidence 52, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:mixed, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 38, recovery_capacity 11, momentum 65, confidence 52, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_technical_success_bad_cost

- Title: Technical success with bad fatigue cost
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 66, recovery_capacity 4, momentum 80, confidence 71, evidence_quality 92, opportunity 32
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 66, recovery_capacity 4, momentum 80, confidence 71, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_post_illness_too_eager

- Title: Post-illness too eager
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 41, momentum 9, confidence 34, evidence_quality 32, opportunity 53
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:0, planned_sessions_missed:3, completed_sets:0, session_quality:mixed, exercise_records:1, continuity:missed_week, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 41, momentum 9, confidence 34, opportunity 53.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_powerlifting_peak_success_no_extra

- Title: Powerlifting peak success, no extra fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 86, recovery_capacity 52, momentum 97, confidence 87, evidence_quality 92, opportunity 60
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:good, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 86, recovery_capacity 52, momentum 97, confidence 87, opportunity 60.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_body_recomp_stress_high_stable

- Title: Recomp with high stress but stable
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_maintenance_after_busy_month

- Title: Maintenance after busy month
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 89, momentum 50, confidence 59, evidence_quality 40, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:2, planned_sessions_missed:1, completed_sets:3, session_quality:good, exercise_records:1, continuity:interrupted, data_completeness:low

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 89, momentum 50, confidence 59, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_advanced_plateau_with_good_recovery

- Title: Advanced plateau with good recovery
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, evidence_quality 92, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_hidden_pain_plus_pr

- Title: PR paired with hidden pain
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 100, momentum 92, confidence 76, evidence_quality 92, opportunity 81
- Safety Gate: `caution`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, safety_scope:movement_specific, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 100, momentum 92, confidence 76, opportunity 81.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_new_exercise_pr_not_true_adaptation

- Title: New exercise PR is not true adaptation
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 98, momentum 92, confidence 64, evidence_quality 40, opportunity 78
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:low

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 98, momentum 92, confidence 64, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_local_failure_after_big_block

- Title: Local failure after big block
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:mixed, exercise_records:1, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### v03_l4_systemic_fatigue_without_pain

- Title: Systemic fatigue without pain
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_unusual_symptoms_mid_session

- Title: Unusual symptoms mid-session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Actual recommendation: `stop_session` / `very_low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:0, session_quality:good, exercise_records:1, safety_scope:session_wide, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### v03_l4_low_back_capacity_success

- Title: Low Back Capacity success should not drive main push
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 66, recovery_capacity 91, momentum 87, confidence 65, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_cardio_recovery_good_strength_stable

- Title: Cardio recovery good, strength stable
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Actual recommendation: `hold` / `low`
- Pass: true
- Score: 97%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:3, session_quality:good, exercise_records:1, continuity:consistent, data_completeness:moderate

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### v03_l4_cardio_interference_signal

- Title: Cardio interference signal
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Actual recommendation: `recover` / `very_low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:6, session_quality:poor, exercise_records:2, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 22, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### v03_l4_final_stress_test_mixed_everything

- Title: Mixed evidence stress test
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 6, recovery_capacity 0, momentum 50, confidence 40, evidence_quality 92, opportunity 39
- Safety Gate: `restrict`, veto true
- Actual recommendation: `reduce` / `low`
- Pass: true
- Score: 100%
- Explicit evidence drivers: planned_sessions_completed:4, planned_sessions_missed:0, completed_sets:9, session_quality:mixed, exercise_records:3, continuity:consistent, data_completeness:high

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 6, recovery_capacity 0, momentum 50, confidence 40, opportunity 39.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.


## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
