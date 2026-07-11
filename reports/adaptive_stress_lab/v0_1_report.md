# Adaptive Stress Lab v0.1 Report

Generated: 2026-06-27T19:05:57.171Z

## Executive Summary

Adaptive Stress Lab v0.1 is a research-only test bench for future Adaptive Strength Coach V2 coaching decisions. It does not modify production app behaviour, workout generation, progression logic, subscriptions, or paywall code.

The lab currently contains:

- 5 draft athlete profiles
- 25 draft training scenarios
- 25 draft coaching decision outputs
- 3 JSON schemas
- 1 simple decision-engine stub
- 1 validation-scoring stub

No output is production eligible. All profile fields, stress scoring, intervention categories, and language require Aaron approval.

## Foundation Documents

- docs/adaptive-coaching-manifesto-v1.md
- docs/adaptive-stress-allocation-v1.md
- docs/adaptive-load-management-v1.md
- docs/coaching-playbook-v1.md
- docs/scientific-validation-framework-v1.md
- docs/exercise-stimulus-fatigue-classification.md
- docs/training-days-stimulus-audit.md

## Starter Athlete Profiles

### Beginner Hypertrophy

- ID: `beginner_hypertrophy`
- Goal: hypertrophy
- Training age: beginner
- Days/week: 3
- Session time: 50 min
- Constraints: needs simple decisions, technique still developing
- Approval status: draft_requires_aaron_approval

### Intermediate Strength/Hypertrophy

- ID: `intermediate_strength_hypertrophy`
- Goal: strength_hypertrophy
- Training age: intermediate
- Days/week: 4
- Session time: 60 min
- Constraints: wants strength and size, can tolerate moderate variation
- Approval status: draft_requires_aaron_approval

### Advanced Powerlifting

- ID: `advanced_powerlifting`
- Goal: powerlifting
- Training age: advanced
- Days/week: 5
- Session time: 85 min
- Constraints: high specificity need, higher joint and systemic cost
- Approval status: draft_requires_aaron_approval

### Busy Parent / Time-Constrained Lifter

- ID: `busy_parent_time_constrained`
- Goal: strength_hypertrophy
- Training age: intermediate
- Days/week: 3
- Session time: 40 min
- Constraints: short sessions, variable schedule, adherence risk
- Approval status: draft_requires_aaron_approval

### Recovery-Limited Lifter

- ID: `recovery_limited_lifter`
- Goal: hypertrophy
- Training age: intermediate
- Days/week: 4
- Session time: 55 min
- Constraints: poor sleep, fatigue accumulates quickly, needs conservative stress allocation
- Approval status: draft_requires_aaron_approval


## Starter Scenarios

### Performance improving / fatigue low

- ID: `performance_improving_fatigue_low`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: low
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Performance improving / fatigue high

- ID: `performance_improving_fatigue_high`
- Athlete: `advanced_powerlifting`
- Performance: improving
- Fatigue: high
- Recovery: mixed
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: high_soreness, sleep_disrupted

### Performance stagnant / fatigue low

- ID: `performance_stagnant_fatigue_low`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: stagnant
- Fatigue: low
- Recovery: good
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: good_readiness

### Performance stagnant / fatigue high

- ID: `performance_stagnant_fatigue_high`
- Athlete: `recovery_limited_lifter`
- Performance: stagnant
- Fatigue: high
- Recovery: poor
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: high_soreness, sleep_disrupted, high_stress

### Performance declining / fatigue high

- ID: `performance_declining_fatigue_high`
- Athlete: `recovery_limited_lifter`
- Performance: declining
- Fatigue: high
- Recovery: poor
- Evidence quality: high
- Continuity: consistent
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted

### One local lift failing

- ID: `one_local_lift_failing`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: mixed
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: high
- Continuity: consistent
- Systemic signals: none

### Systemic fatigue across multiple lifts

- ID: `systemic_fatigue_across_multiple_lifts`
- Athlete: `advanced_powerlifting`
- Performance: declining
- Fatigue: high
- Recovery: poor
- Evidence quality: high
- Continuity: consistent
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted

### Missed training week

- ID: `missed_training_week`
- Athlete: `busy_parent_time_constrained`
- Performance: mixed
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: low
- Continuity: missed_week
- Systemic signals: missed_sessions, time_constraint

### Successful load progression with productive fatigue

- ID: `successful_load_progression_productive_fatigue`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: moderate
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Low training frequency constraint

- ID: `low_training_frequency_constraint`
- Athlete: `busy_parent_time_constrained`
- Performance: stable
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: low_frequency, time_constraint

### User reports poor readiness but performance is strong

- ID: `poor_readiness_strong_performance`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: low
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### User reports feeling great but performance is declining

- ID: `feels_great_performance_declining`
- Athlete: `advanced_powerlifting`
- Performance: declining
- Fatigue: high
- Recovery: poor
- Evidence quality: high
- Continuity: consistent
- Systemic signals: multiple_lifts_down

### User reports high stress but objective data is stable

- ID: `high_stress_objective_stable`
- Athlete: `busy_parent_time_constrained`
- Performance: stable
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: time_constraint

### User reports low motivation but completed sessions are consistent

- ID: `low_motivation_consistent_sessions`
- Athlete: `beginner_hypertrophy`
- Performance: stable
- Fatigue: low
- Recovery: good
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: good_readiness

### Severe pain/safety flag with otherwise stable training

- ID: `severe_pain_safety_flag`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: stable
- Fatigue: low
- Recovery: good
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: good_readiness

### Strong performance with no safety concern

- ID: `safety_clear_strong_performance`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: low
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Poor readiness but strong performance

- ID: `safety_poor_readiness_strong_performance`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: low
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Severe pain flag despite strong performance

- ID: `safety_severe_pain_strong_performance`
- Athlete: `advanced_powerlifting`
- Performance: improving
- Fatigue: low
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Repeated same-load collapse

- ID: `safety_repeated_same_load_collapse`
- Athlete: `recovery_limited_lifter`
- Performance: declining
- Fatigue: high
- Recovery: poor
- Evidence quality: high
- Continuity: consistent
- Systemic signals: multiple_lifts_down, high_soreness

### Local exercise failure below range

- ID: `safety_local_below_range_failure`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: mixed
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: high
- Continuity: consistent
- Systemic signals: none

### Sharp pain on squat pattern

- ID: `safety_sharp_pain_squat`
- Athlete: `advanced_powerlifting`
- Performance: stable
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: moderate
- Continuity: consistent
- Systemic signals: none

### Worsening pain over multiple sessions

- ID: `safety_worsening_pain_multiple_sessions`
- Athlete: `recovery_limited_lifter`
- Performance: declining
- Fatigue: high
- Recovery: poor
- Evidence quality: high
- Continuity: consistent
- Systemic signals: multiple_lifts_down, high_soreness

### Productive fatigue from load progression inside range

- ID: `safety_productive_fatigue_progression`
- Athlete: `intermediate_strength_hypertrophy`
- Performance: improving
- Fatigue: moderate
- Recovery: good
- Evidence quality: high
- Continuity: consistent
- Systemic signals: good_readiness

### Low evidence new athlete

- ID: `decision_low_evidence_new_athlete`
- Athlete: `beginner_hypertrophy`
- Performance: mixed
- Fatigue: moderate
- Recovery: mixed
- Evidence quality: low
- Continuity: interrupted
- Systemic signals: none

### Momentum low but recovery good

- ID: `decision_momentum_low_recovery_good`
- Athlete: `beginner_hypertrophy`
- Performance: stagnant
- Fatigue: low
- Recovery: good
- Evidence quality: moderate
- Continuity: interrupted
- Systemic signals: missed_sessions


## Example Outputs

### performance_improving_fatigue_low

- Recommendation: `push_cautiously`
- Interventions: `add_rep` (exercise), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 4/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Improving performance and low fatigue may justify a small progression, but not an aggressive jump.

### performance_improving_fatigue_high

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Advanced Powerlifting.
  - Evidence state: performance improving, fatigue high, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### performance_stagnant_fatigue_low

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance stagnant, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### performance_stagnant_fatigue_high

- Recommendation: `reduce_session_stress`
- Interventions: `reduce_sets` (session), `recovery_guidance` (week)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Recovery-Limited Lifter.
  - Evidence state: performance stagnant, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### performance_declining_fatigue_high

- Recommendation: `recovery_bias`
- Interventions: `consolidation_week` (week), `reduce_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Recovery-Limited Lifter.
  - Evidence state: performance declining, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Systemic signals suggest the issue is broader than one lift.

### one_local_lift_failing

- Recommendation: `reduce_local_stress`
- Interventions: `reduce_load` (exercise), `hold_load` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 4/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance mixed, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Local lift failure should be corrected locally before changing the whole training week.

### systemic_fatigue_across_multiple_lifts

- Recommendation: `recovery_bias`
- Interventions: `consolidation_week` (week), `reduce_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Advanced Powerlifting.
  - Evidence state: performance declining, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Systemic signals suggest the issue is broader than one lift.

### missed_training_week

- Recommendation: `resume_gently`
- Interventions: `hold_load` (session), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 2/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 4/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Busy Parent / Time-Constrained Lifter.
  - Evidence state: performance mixed, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### successful_load_progression_productive_fatigue

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue moderate, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### low_training_frequency_constraint

- Recommendation: `redistribute_stimulus`
- Interventions: `redistribute_volume` (week), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 2/5
  - Overall confidence: 3/5
- Production eligible: false
- Rationale:
  - Athlete profile: Busy Parent / Time-Constrained Lifter.
  - Evidence state: performance stable, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Low frequency or time pressure requires stimulus distribution, not simple set counting.

### poor_readiness_strong_performance

- Recommendation: `push_cautiously`
- Interventions: `add_rep` (exercise), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 4/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Improving performance and low fatigue may justify a small progression, but not an aggressive jump.

### feels_great_performance_declining

- Recommendation: `recovery_bias`
- Interventions: `consolidation_week` (week), `reduce_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Advanced Powerlifting.
  - Evidence state: performance declining, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Systemic signals suggest the issue is broader than one lift.

### high_stress_objective_stable

- Recommendation: `redistribute_stimulus`
- Interventions: `redistribute_volume` (week), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 2/5
  - Overall confidence: 3/5
- Production eligible: false
- Rationale:
  - Athlete profile: Busy Parent / Time-Constrained Lifter.
  - Evidence state: performance stable, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Low frequency or time pressure requires stimulus distribution, not simple set counting.

### low_motivation_consistent_sessions

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Beginner Hypertrophy.
  - Evidence state: performance stable, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### severe_pain_safety_flag

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance stable, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### safety_clear_strong_performance

- Recommendation: `push_cautiously`
- Interventions: `add_rep` (exercise), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 4/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Improving performance and low fatigue may justify a small progression, but not an aggressive jump.

### safety_poor_readiness_strong_performance

- Recommendation: `push_cautiously`
- Interventions: `add_rep` (exercise), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 4/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Improving performance and low fatigue may justify a small progression, but not an aggressive jump.

### safety_severe_pain_strong_performance

- Recommendation: `push_cautiously`
- Interventions: `add_rep` (exercise), `maintain_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 4/5
  - Fatigue cost: 3/5
  - Safety: 3/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Advanced Powerlifting.
  - Evidence state: performance improving, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Improving performance and low fatigue may justify a small progression, but not an aggressive jump.

### safety_repeated_same_load_collapse

- Recommendation: `recovery_bias`
- Interventions: `consolidation_week` (week), `reduce_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Recovery-Limited Lifter.
  - Evidence state: performance declining, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Systemic signals suggest the issue is broader than one lift.

### safety_local_below_range_failure

- Recommendation: `reduce_local_stress`
- Interventions: `reduce_load` (exercise), `hold_load` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 4/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance mixed, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Local lift failure should be corrected locally before changing the whole training week.

### safety_sharp_pain_squat

- Recommendation: `reduce_local_stress`
- Interventions: `reduce_load` (exercise), `hold_load` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 4/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Advanced Powerlifting.
  - Evidence state: performance stable, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Local lift failure should be corrected locally before changing the whole training week.

### safety_worsening_pain_multiple_sessions

- Recommendation: `recovery_bias`
- Interventions: `consolidation_week` (week), `reduce_sets` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 1/5
  - Safety: 5/5
  - Behavioural simplicity: 4/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Recovery-Limited Lifter.
  - Evidence state: performance declining, fatigue high, recovery poor.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.
  - Systemic signals suggest the issue is broader than one lift.

### safety_productive_fatigue_progression

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 4/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Intermediate Strength/Hypertrophy.
  - Evidence state: performance improving, fatigue moderate, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### decision_low_evidence_new_athlete

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 2/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 3/5
- Production eligible: false
- Rationale:
  - Athlete profile: Beginner Hypertrophy.
  - Evidence state: performance mixed, fatigue moderate, recovery mixed.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.

### decision_momentum_low_recovery_good

- Recommendation: `hold_and_confirm`
- Interventions: `hold_load` (exercise), `no_change` (session)
- Validation score:
  - Scientific confidence: 3/5
  - Adaptation potential: 3/5
  - Fatigue cost: 2/5
  - Safety: 3/5
  - Behavioural simplicity: 5/5
  - Overall confidence: 4/5
- Production eligible: false
- Rationale:
  - Athlete profile: Beginner Hypertrophy.
  - Evidence state: performance stagnant, fatigue low, recovery good.
  - Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.


## Recommendation Distribution

- `push_cautiously`: 5
- `hold_and_confirm`: 8
- `reduce_session_stress`: 1
- `recovery_bias`: 5
- `reduce_local_stress`: 3
- `resume_gently`: 1
- `redistribute_stimulus`: 2

## Open Decisions Requiring Aaron

1. Athlete profile fields: approve current draft fields, simplify them, or add context such as injury history, preferred exercises, schedule volatility, or competitive date.
2. Stress/fatigue scoring model: choose whether v0.2 should use 1-5 numeric scoring, traffic-light states, or both.
3. Intervention hierarchy: approve whether the draft categories are the right internal vocabulary before any deeper simulation.
4. Progression philosophy changes: decide whether future ASA should explicitly prefer reps/quality before load in most cases, or keep that goal-specific.
5. Frequency/stimulus distribution rules: approve whether the lab should prototype weekly stimulus budgets using exercise stimulus/fatigue scores.
6. User-facing language: decide whether terms like "recovery bias", "hold and confirm", and "redistribute stimulus" are internal only or candidates for user copy.
7. Production threshold: decide what validation score and scenario coverage are required before any future production experiment.

## v0.2 Candidate Work

- Add schema validation with a pinned JSON-schema validator if adding dependencies is acceptable.
- Add scenario families from the full Coaching Playbook.
- Add exercise stimulus/fatigue fixture samples.
- Add annual simulation stubs without touching production generation.
- Add report diffs so coaching rule changes are reviewable.

## Production Safety Confirmation

- Production app code was not imported by this lab.
- Production app behaviour was not modified by this lab.
- Workout generation was not modified.
- Progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
