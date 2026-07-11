# Coaching Gauntlet v0.1

Generated: 2026-06-28T16:47:30.139Z

## Scope

The Coaching Gauntlet is a research-only stress test for Adaptive Strength Coach V2.

It runs Decision Engine v0.2 against realistic scenarios before any production integration. Production app code, V1 workout generation, V1 progression, subscription logic, and EAS builds are untouched.

## Pass/Fail Summary

- Total scenarios: 51
- Passed: 51
- Failed: 0
- Pass rate: 100%

## Level Summary

- Level 1 - Normal Progression: 12/12 passed (100%)
- Level 2 - Real Life: 14/14 passed (100%)
- Level 3 - Coaching Judgement: 12/12 passed (100%)
- Level 4 - Expert Coaching: 13/13 passed (100%)

## Recommendation Distribution

- `consolidate`: 5
- `hold`: 27
- `push`: 2
- `recover`: 3
- `reduce`: 10
- `stop_movement`: 2
- `stop_session`: 2

## Weakest Scenarios

### Repeated success with strong momentum

- ID: `l1_clear_repeated_success`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 91%
- Expected: `push`
- Actual: `push` / `moderate`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Long successful run with no fatigue concern

- ID: `l4_long_run_of_success`
- Level: Level 4 - Expert Coaching
- Pass: true
- Score: 91%
- Expected: `push`
- Actual: `push` / `moderate`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Duration exercise progressing

- ID: `l1_duration_progress`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 94%
- Expected: `push`, `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Clean progression with high recovery

- ID: `l1_clean_progression`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `push`, `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Above range once, avoid reckless jump

- ID: `l1_above_range_first_signal`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Bare minimum success should not over-push

- ID: `l1_bare_minimum_success`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Same load stable with good recovery

- ID: `l1_same_load_stable`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`, `push`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Local drop-off without systemic signal

- ID: `l1_local_dropoff`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`, `reduce`
- Actual: `hold` / `low`
- Safety Gate: expected `caution`, actual `caution`
- Failure reasons: none

### Accessory exercise stagnant but safe

- ID: `l1_accessory_stall`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### New block with sparse evidence

- ID: `l1_low_evidence_new_block`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 97%
- Expected: `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none


## Strongest Scenarios

### Heavier load stays inside target range

- ID: `l1_productive_heavier_load`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 100%
- Expected: `consolidate`, `hold`
- Actual: `consolidate` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### One local lift misses range

- ID: `l1_local_miss`
- Level: Level 1 - Normal Progression
- Pass: true
- Score: 100%
- Expected: `reduce`
- Actual: `reduce` / `low`
- Safety Gate: expected `caution`, actual `caution`
- Failure reasons: none

### Poor readiness, strong performance

- ID: `l2_poor_readiness_strong_performance`
- Level: Level 2 - Real Life
- Pass: true
- Score: 100%
- Expected: `push`, `hold`
- Actual: `hold` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none

### Feels great but objective decline

- ID: `l2_feels_great_declining`
- Level: Level 2 - Real Life
- Pass: true
- Score: 100%
- Expected: `recover`, `consolidate`, `reduce`
- Actual: `reduce` / `very_low`
- Safety Gate: expected `restrict`, actual `restrict`
- Failure reasons: none

### Systemic fatigue across multiple lifts

- ID: `l3_systemic_fatigue`
- Level: Level 3 - Coaching Judgement
- Pass: true
- Score: 100%
- Expected: `recover`, `consolidate`
- Actual: `recover` / `very_low`
- Safety Gate: expected `restrict`, actual `restrict`
- Failure reasons: none

### Repeated same-load collapse

- ID: `l3_repeated_same_load_collapse`
- Level: Level 3 - Coaching Judgement
- Pass: true
- Score: 100%
- Expected: `substitute`, `reduce`, `consolidate`
- Actual: `reduce` / `low`
- Safety Gate: expected `restrict`, actual `restrict`
- Failure reasons: none

### Repeated shutdown same pattern

- ID: `l3_repeated_shutdown_same_pattern`
- Level: Level 3 - Coaching Judgement
- Pass: true
- Score: 100%
- Expected: `substitute`, `reduce`, `recover`
- Actual: `reduce` / `low`
- Safety Gate: expected `restrict`, actual `restrict`
- Failure reasons: none

### Local failure should stay local

- ID: `l3_local_failure_not_systemic`
- Level: Level 3 - Coaching Judgement
- Pass: true
- Score: 100%
- Expected: `reduce`
- Actual: `reduce` / `low`
- Safety Gate: expected `caution`, actual `caution`
- Failure reasons: none

### Worsening pain across sessions

- ID: `l3_worsening_pain`
- Level: Level 3 - Coaching Judgement
- Pass: true
- Score: 100%
- Expected: `stop_session`, `stop_movement`
- Actual: `stop_movement` / `very_low`
- Safety Gate: expected `stop`, actual `stop`
- Failure reasons: none

### Advanced lifter progressing but fatigue cost high

- ID: `l4_advanced_powerlifter_peak_fatigue`
- Level: Level 4 - Expert Coaching
- Pass: true
- Score: 100%
- Expected: `consolidate`
- Actual: `consolidate` / `low`
- Safety Gate: expected `clear`, actual `clear`
- Failure reasons: none


## Recommendations Requiring Aaron Review

- No failed scenarios in this run.

## Patterns Of Failure

- No failure patterns found.

## Open Research Questions

1. Should `recover` be considered acceptable for restrict scenarios caused by local collapse, or should local collapse always prefer `substitute` or `reduce`?
2. Should the gauntlet fail `push` recommendations when poor readiness is reported but objective performance is strong, or allow controlled push?
3. Should sharp/worsening pain always produce `stop_session`, or should `stop_movement` remain the default unless symptoms are systemic?
4. Should low evidence always force `hold`, even when objective performance looks promising?
5. What pass-rate threshold should be required before a Decision Engine version can advance to simulation?

## Full Scenario Results

### l1_clean_progression

- Title: Clean progression with high recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 90, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: push or hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 82
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 4/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_above_range_first_signal

- Title: Above range once, avoid reckless jump
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 66, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_bare_minimum_success

- Title: Bare minimum success should not over-push
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 62, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 52, momentum 80, confidence 62, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_productive_heavier_load

- Title: Heavier load stays inside target range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 90, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: consolidate or hold
- Actual recommendation: `consolidate`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### l1_same_load_stable

- Title: Same load stable with good recovery
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 66, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_local_miss

- Title: One local lift misses range
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 90, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: reduce
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l1_local_dropoff

- Title: Local drop-off without systemic signal
- Level: Level 1 - Normal Progression
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 37, recovery_capacity 44, momentum 59, confidence 51, evidence_quality 66, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: hold or reduce
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 37, recovery_capacity 44, momentum 59, confidence 51, opportunity 62.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_accessory_stall

- Title: Accessory exercise stagnant but safe
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 51, evidence_quality 66, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 51, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_duration_progress

- Title: Duration exercise progressing
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, evidence_quality 66, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: push or hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 94%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 4/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 71, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 63 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_clear_repeated_success

- Title: Repeated success with strong momentum
- Level: Level 1 - Normal Progression
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 94, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: push
- Actual recommendation: `push`
- Aggressiveness: `moderate`
- Confidence: 75
- Pass: true
- Score: 91%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 3/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Excellent state and clear safety allow a small controlled push.
- Push category: micro_push.
- Push Decision Policy: Micro push is allowed only when stronger push types are not a fit but objective evidence still earns a small step. Micro push is not assumed safe by default.

User message:

You're adapting well. We'll make a small push today and keep it controlled.

### l1_low_evidence_new_block

- Title: New block with sparse evidence
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, evidence_quality 38, opportunity 62
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 56
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l1_minor_technique_limit

- Title: Minor technique limit
- Level: Level 1 - Normal Progression
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 40, recovery_capacity 52, momentum 59, confidence 38, evidence_quality 66, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: hold or reduce
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 71
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 40, recovery_capacity 52, momentum 59, confidence 38, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l2_missed_week

- Title: Missed week after busy period
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, evidence_quality 30, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 53
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_time_constrained_stable

- Title: Time constrained but stable training
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_poor_readiness_strong_performance

- Title: Poor readiness, strong performance
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false
- Expected recommendation: push or hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 99
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, opportunity 74.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_feels_great_declining

- Title: Feels great but objective decline
- Level: Level 2 - Real Life
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, evidence_quality 92, opportunity 47
- Safety Gate: `restrict`, veto true
- Expected recommendation: recover or consolidate or reduce
- Actual recommendation: `reduce`
- Aggressiveness: `very_low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 4, recovery_capacity 0, momentum 32, confidence 29, opportunity 47.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l2_high_stress_stable

- Title: High stress, objective data stable
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 76
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_low_motivation_consistent

- Title: Low motivation, consistent sessions
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 76
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_sleep_poor_performance_ok

- Title: Poor sleep report, performance okay
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 94, momentum 87, confidence 71, evidence_quality 68, opportunity 64
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 76
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 94, momentum 87, confidence 71, opportunity 64.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_repeated_skips_time

- Title: Repeated skipped accessories from time
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_travel_interruption

- Title: Travel interruption, no clear performance loss
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, evidence_quality 38, opportunity 62
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 56
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 81, momentum 22, confidence 39, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_recovery_work_completed

- Title: Recovery work completed and training stable
- Level: Level 2 - Real Life
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 60, recovery_capacity 45, momentum 80, confidence 65, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 60, recovery_capacity 45, momentum 80, confidence 65, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_cardio_added_no_strength_drop

- Title: Cardio added, strength stable
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 66, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_late_session_density

- Title: Training compressed but work completed
- Level: Level 2 - Real Life
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 66, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l2_one_bad_day

- Title: One bad day after normal progress
- Level: Level 2 - Real Life
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 37, recovery_capacity 47, momentum 54, confidence 46, evidence_quality 66, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: reduce or hold
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 71
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 37, recovery_capacity 47, momentum 54, confidence 46, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l2_equipment_swap

- Title: Equipment swap but training completed
- Level: Level 2 - Real Life
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 62, evidence_quality 66, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 62, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l3_adaptation_high_recovery_low

- Title: Adaptation high, recovery low
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, evidence_quality 66, opportunity 42
- Safety Gate: `clear`, veto false
- Expected recommendation: consolidate
- Actual recommendation: `consolidate`
- Aggressiveness: `low`
- Confidence: 71
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### l3_systemic_fatigue

- Title: Systemic fatigue across multiple lifts
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Expected recommendation: recover or consolidate
- Actual recommendation: `recover`
- Aggressiveness: `very_low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### l3_repeated_same_load_collapse

- Title: Repeated same-load collapse
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 32, evidence_quality 90, opportunity 44
- Safety Gate: `restrict`, veto true
- Expected recommendation: substitute or reduce or consolidate
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 28, recovery_capacity 0, momentum 43, confidence 32, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l3_repeated_shutdown_same_pattern

- Title: Repeated shutdown same pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 28, recovery_capacity 4, momentum 43, confidence 38, evidence_quality 90, opportunity 44
- Safety Gate: `restrict`, veto true
- Expected recommendation: substitute or reduce or recover
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 28, recovery_capacity 4, momentum 43, confidence 38, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l3_local_failure_not_systemic

- Title: Local failure should stay local
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 90, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: reduce
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l3_momentum_low_recovery_good

- Title: Momentum low, recovery good
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 76
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l3_confidence_low_stable_objective

- Title: Confidence low, objective stable
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold or push
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 76
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l3_low_evidence_promising

- Title: Low evidence but promising performance
- Level: Level 3 - Coaching Judgement
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 82, recovery_capacity 98, momentum 69, confidence 64, evidence_quality 38, opportunity 68
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 56
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 82, recovery_capacity 98, momentum 69, confidence 64, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l3_good_progress_high_soreness

- Title: Good progress with high soreness
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 80, recovery_capacity 23, momentum 91, confidence 74, evidence_quality 66, opportunity 42
- Safety Gate: `clear`, veto false
- Expected recommendation: consolidate or hold
- Actual recommendation: `consolidate`
- Aggressiveness: `low`
- Confidence: 71
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 80, recovery_capacity 23, momentum 91, confidence 74, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### l3_minor_pain_no_performance_loss

- Title: Mild pain report, no performance loss
- Level: Level 3 - Coaching Judgement
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, evidence_quality 68, opportunity 68
- Safety Gate: `caution`, veto false
- Expected recommendation: hold or reduce
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 77
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 87, confidence 71, opportunity 68.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l3_worsening_pain

- Title: Worsening pain across sessions
- Level: Level 3 - Coaching Judgement
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 12, recovery_capacity 0, momentum 34, confidence 0, evidence_quality 92, opportunity 0
- Safety Gate: `stop`, veto true
- Expected recommendation: stop_session or stop_movement
- Actual recommendation: `stop_movement`
- Aggressiveness: `very_low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 12, recovery_capacity 0, momentum 34, confidence 0, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### l3_sharp_pain_movement

- Title: Sharp pain on squat pattern
- Level: Level 3 - Coaching Judgement
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Expected recommendation: stop_movement
- Actual recommendation: `stop_movement`
- Aggressiveness: `very_low`
- Confidence: 84
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 48, recovery_capacity 0, momentum 74, confidence 31, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

### l4_advanced_powerlifter_peak_fatigue

- Title: Advanced lifter progressing but fatigue cost high
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, evidence_quality 90, opportunity 42
- Safety Gate: `clear`, veto false
- Expected recommendation: consolidate
- Actual recommendation: `consolidate`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

### l4_bodybuilder_local_failure

- Title: Bodybuilder local isolation failure
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 30, recovery_capacity 35, momentum 50, confidence 35, evidence_quality 90, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: reduce
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 30, recovery_capacity 35, momentum 50, confidence 35, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l4_compound_axial_stack

- Title: High cost compound fatigue stack
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 0, recovery_capacity 0, momentum 43, confidence 38, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Expected recommendation: recover or consolidate
- Actual recommendation: `recover`
- Aggressiveness: `very_low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 43, confidence 38, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### l4_productive_isolation_fatigue

- Title: High-rep isolation productive fatigue
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 90, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: consolidate or hold
- Actual recommendation: `consolidate`
- Aggressiveness: `low`
- Confidence: 94
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

### l4_low_frequency_stimulus

- Title: Low frequency requires clear but not brutal work
- Level: Level 4 - Expert Coaching
- Athlete profile: Busy Parent / Time-Constrained Lifter
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 75
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l4_return_after_illness

- Title: Return after interruption with low evidence
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 46, recovery_capacity 31, momentum 6, confidence 31, evidence_quality 30, opportunity 32
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 53
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 46, recovery_capacity 31, momentum 6, confidence 31, opportunity 32.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

### l4_unsafe_report

- Title: User explicitly reports unsafe training
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 66, recovery_capacity 43, momentum 87, confidence 46, evidence_quality 68, opportunity 10
- Safety Gate: `stop`, veto true
- Expected recommendation: stop_session
- Actual recommendation: `stop_session`
- Aggressiveness: `very_low`
- Confidence: 84
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 43, momentum 87, confidence 46, opportunity 10.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### l4_dizziness_systemic

- Title: Dizziness reported during session
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true
- Expected recommendation: stop_session
- Actual recommendation: `stop_session`
- Aggressiveness: `very_low`
- Confidence: 84
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 60, recovery_capacity 0, momentum 74, confidence 30, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.

### l4_repeated_swap_possible_pain

- Title: Repeated swap with technique concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, evidence_quality 66, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: hold or reduce or substitute
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 71
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 34, recovery_capacity 52, momentum 59, confidence 43, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l4_long_run_of_success

- Title: Long successful run with no fatigue concern
- Level: Level 4 - Expert Coaching
- Athlete profile: Intermediate Strength/Hypertrophy
- Coaching State: adaptation 90, recovery_capacity 98, momentum 92, confidence 73, evidence_quality 96, opportunity 78
- Safety Gate: `clear`, veto false
- Expected recommendation: push
- Actual recommendation: `push`
- Aggressiveness: `moderate`
- Confidence: 85
- Pass: true
- Score: 91%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 3/5

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 98, momentum 92, confidence 73, opportunity 78.
- Safety Gate is clear.
- Excellent state and clear safety allow a small controlled push.
- Push category: micro_push.
- Push Decision Policy: Micro push is allowed only when stronger push types are not a fit but objective evidence still earns a small step. Micro push is not assumed safe by default.

User message:

You're adapting well. We'll make a small push today and keep it controlled.

### l4_conflicting_signals

- Title: Strong upper body, lower body down
- Level: Level 4 - Expert Coaching
- Athlete profile: Advanced Powerlifting
- Coaching State: adaptation 38, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false
- Expected recommendation: reduce or hold
- Actual recommendation: `reduce`
- Aggressiveness: `low`
- Confidence: 95
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 38, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

### l4_recovery_week_needed

- Title: Systemic decline after overload
- Level: Level 4 - Expert Coaching
- Athlete profile: Recovery-Limited Lifter
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true
- Expected recommendation: recover or consolidate
- Actual recommendation: `recover`
- Aggressiveness: `very_low`
- Confidence: 100
- Pass: true
- Score: 100%

Rubric:
- charter_alignment: 5/5
- scientific_support: 5/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

### l4_not_enough_data_do_not_overfit

- Title: Not enough data, do not overfit
- Level: Level 4 - Expert Coaching
- Athlete profile: Beginner Hypertrophy
- Coaching State: adaptation 46, recovery_capacity 90, momentum 59, confidence 42, evidence_quality 38, opportunity 50
- Safety Gate: `clear`, veto false
- Expected recommendation: hold
- Actual recommendation: `hold`
- Aggressiveness: `low`
- Confidence: 56
- Pass: true
- Score: 97%

Rubric:
- charter_alignment: 5/5
- scientific_support: 4/5
- coaching_quality: 5/5
- safety: 5/5
- long_term_progress: 5/5
- confidence_building: 5/5
- simplicity: 5/5

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 90, momentum 59, confidence 42, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.


## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
