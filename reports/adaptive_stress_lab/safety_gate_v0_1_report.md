# Safety Gate v0.1 Report

Generated: 2026-06-28T15:02:03.014Z

## Scope

Safety Gate is a research-only veto layer inside `research/adaptive_stress_lab`.

Architecture:

Objective evidence -> Coaching State -> Safety Gate -> future coaching decision.

Safety Gate does not prescribe training. It only describes whether future coaching decisions should be clear, cautious, restricted, or stopped.

## Status Rules

- `clear`: no meaningful safety concern.
- `caution`: mild concern; monitor and reduce aggression.
- `restrict`: meaningful concern; veto aggressive progression, PR attempts, and affected-area load increases.
- `stop`: severe concern; stop affected movement/session and suggest professional advice where appropriate.

## Scenario Outputs

### Performance improving / fatigue low

- Scenario ID: `performance_improving_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, coaching_opportunity 78
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Performance improving / fatigue high

- Scenario ID: `performance_improving_fatigue_high`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, coaching_opportunity 42
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Performance stagnant / fatigue low

- Scenario ID: `performance_stagnant_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, coaching_opportunity 68
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Performance stagnant / fatigue high

- Scenario ID: `performance_stagnant_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 41, recovery_capacity 0, momentum 61, confidence 47, coaching_opportunity 32
- Safety Gate status: `caution`
- Severity: `low`
- Veto: false
- Confidence: 57
- Affected areas: squat/lower-body pattern

Reasons:
- leg_press shows comparable-workload drop-off.

Allowed actions:
- continue with controlled execution
- monitor the next comparable set or session
- keep aggressive progression off by default

Blocked actions:
- aggressive progression without confirmation

Recommended user message:

We don't have enough history to be certain, so we'll keep this controlled.

Evidence sources:
- objective:leg_press:dropoff

### Performance declining / fatigue high

- Scenario ID: `performance_declining_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, coaching_opportunity 44
- Safety Gate status: `restrict`
- Severity: `moderate`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern, pressing pattern, systemic

Reasons:
- squat missed the prescribed minimum range.
- bench_press missed the prescribed minimum range.
- Multiple movement patterns are down with poor session quality.

Allowed actions:
- use conservative alternatives for affected area
- reduce aggression for affected movement pattern
- continue unaffected training if comfortable
- monitor symptoms and performance trend

Blocked actions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading

Recommended user message:

We'll avoid pushing this area today and choose a safer option.

Evidence sources:
- objective:squat:below_range
- objective:bench_press:below_range
- explicit:systemic:multi_pattern_fatigue

### One local lift failing

- Scenario ID: `one_local_lift_failing`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, coaching_opportunity 62
- Safety Gate status: `caution`
- Severity: `low`
- Veto: false
- Confidence: 78
- Affected areas: pressing pattern

Reasons:
- bench_press missed the prescribed minimum range.

Allowed actions:
- continue with controlled execution
- monitor the next comparable set or session
- keep aggressive progression off by default

Blocked actions:
- aggressive progression without confirmation

Recommended user message:

Your recent training shows a clear pattern, so we'll keep this controlled and monitor the next session.

Evidence sources:
- objective:bench_press:below_range

### Systemic fatigue across multiple lifts

- Scenario ID: `systemic_fatigue_across_multiple_lifts`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, coaching_opportunity 44
- Safety Gate status: `restrict`
- Severity: `moderate`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern, hinge/pull pattern, pressing pattern, systemic

Reasons:
- squat missed the prescribed minimum range.
- deadlift missed the prescribed minimum range.
- bench_press shows comparable-workload drop-off.
- Multiple movement patterns are down with poor session quality.

Allowed actions:
- use conservative alternatives for affected area
- reduce aggression for affected movement pattern
- continue unaffected training if comfortable
- monitor symptoms and performance trend

Blocked actions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading

Recommended user message:

We'll avoid pushing this area today and choose a safer option.

Evidence sources:
- objective:squat:below_range
- objective:deadlift:below_range
- objective:bench_press:dropoff
- explicit:systemic:multi_pattern_fatigue

### Missed training week

- Scenario ID: `missed_training_week`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, coaching_opportunity 50
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 45
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Successful load progression with productive fatigue

- Scenario ID: `successful_load_progression_productive_fatigue`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, coaching_opportunity 78
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Low training frequency constraint

- Scenario ID: `low_training_frequency_constraint`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, coaching_opportunity 50
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### User reports poor readiness but performance is strong

- Scenario ID: `poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 94, recovery_capacity 94, momentum 98, confidence 76, coaching_opportunity 74
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### User reports feeling great but performance is declining

- Scenario ID: `feels_great_performance_declining`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 32, confidence 29, coaching_opportunity 47
- Safety Gate status: `restrict`
- Severity: `moderate`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern, hinge/pull pattern, systemic

Reasons:
- squat missed the prescribed minimum range.
- deadlift shows comparable-workload drop-off.
- Multiple movement patterns are down with poor session quality.

Allowed actions:
- use conservative alternatives for affected area
- reduce aggression for affected movement pattern
- continue unaffected training if comfortable
- monitor symptoms and performance trend

Blocked actions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading

Recommended user message:

We'll avoid pushing this area today and choose a safer option.

Evidence sources:
- objective:squat:below_range
- objective:deadlift:dropoff
- explicit:systemic:multi_pattern_fatigue

### User reports high stress but objective data is stable

- Scenario ID: `high_stress_objective_stable`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, coaching_opportunity 46
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### User reports low motivation but completed sessions are consistent

- Scenario ID: `low_motivation_consistent_sessions`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, coaching_opportunity 68
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Severe pain/safety flag with otherwise stable training

- Scenario ID: `severe_pain_safety_flag`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 66, recovery_capacity 43, momentum 90, confidence 49, coaching_opportunity 10
- Safety Gate status: `stop`
- Severity: `severe`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern

Reasons:
- Severe pain was reported.

Allowed actions:
- stop the affected movement today
- continue only unaffected, comfortable work if appropriate
- seek professional advice when pain is sharp, worsening, unusual, or concerning

Blocked actions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area

Recommended user message:

Stop this movement for today. If pain is sharp, worsening or unusual, seek professional advice.

Evidence sources:
- subjective_safety:severe_pain

### Strong performance with no safety concern

- Scenario ID: `safety_clear_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 88, recovery_capacity 98, momentum 100, confidence 83, coaching_opportunity 78
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Poor readiness but strong performance

- Scenario ID: `safety_poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, coaching_opportunity 74
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Severe pain flag despite strong performance

- Scenario ID: `safety_severe_pain_strong_performance`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 80, recovery_capacity 43, momentum 100, confidence 58, coaching_opportunity 20
- Safety Gate status: `stop`
- Severity: `severe`
- Veto: true
- Confidence: 99
- Affected areas: hinge/pull pattern

Reasons:
- Severe pain was reported.

Allowed actions:
- stop the affected movement today
- continue only unaffected, comfortable work if appropriate
- seek professional advice when pain is sharp, worsening, unusual, or concerning

Blocked actions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area

Recommended user message:

Stop this movement for today. If pain is sharp, worsening or unusual, seek professional advice.

Evidence sources:
- subjective_safety:severe_pain

### Repeated same-load collapse

- Scenario ID: `safety_repeated_same_load_collapse`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 1, recovery_capacity 0, momentum 43, confidence 32, coaching_opportunity 44
- Safety Gate status: `restrict`
- Severity: `moderate`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern

Reasons:
- squat shows repeated same-load collapse.
- leg_press shows comparable-workload drop-off.

Allowed actions:
- use conservative alternatives for affected area
- reduce aggression for affected movement pattern
- continue unaffected training if comfortable
- monitor symptoms and performance trend

Blocked actions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading

Recommended user message:

We'll avoid pushing this area today and choose a safer option.

Evidence sources:
- objective:squat:same_load_collapse
- objective:leg_press:dropoff

### Local exercise failure below range

- Scenario ID: `safety_local_below_range_failure`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, coaching_opportunity 62
- Safety Gate status: `caution`
- Severity: `low`
- Veto: false
- Confidence: 78
- Affected areas: pressing pattern

Reasons:
- bench_press missed the prescribed minimum range.

Allowed actions:
- continue with controlled execution
- monitor the next comparable set or session
- keep aggressive progression off by default

Blocked actions:
- aggressive progression without confirmation

Recommended user message:

Your recent training shows a clear pattern, so we'll keep this controlled and monitor the next session.

Evidence sources:
- objective:bench_press:below_range

### Sharp pain on squat pattern

- Scenario ID: `safety_sharp_pain_squat`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 48, recovery_capacity 0, momentum 77, confidence 34, coaching_opportunity 0
- Safety Gate status: `stop`
- Severity: `severe`
- Veto: true
- Confidence: 78
- Affected areas: squat/lower-body pattern

Reasons:
- squat has technique-limited evidence.
- Sharp pain was reported.

Allowed actions:
- stop the affected movement today
- continue only unaffected, comfortable work if appropriate
- seek professional advice when pain is sharp, worsening, unusual, or concerning

Blocked actions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area

Recommended user message:

Stop this movement for today. If pain is sharp, worsening or unusual, seek professional advice.

Evidence sources:
- objective:squat:technique_limit
- subjective_safety:sharp_pain

### Worsening pain over multiple sessions

- Scenario ID: `safety_worsening_pain_multiple_sessions`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 34, confidence 0, coaching_opportunity 0
- Safety Gate status: `stop`
- Severity: `severe`
- Veto: true
- Confidence: 99
- Affected areas: hinge/pull pattern, systemic

Reasons:
- deadlift missed the prescribed minimum range.
- barbell_row shows comparable-workload drop-off.
- Multiple movement patterns are down with poor session quality.
- Pain is worsening across sessions.

Allowed actions:
- stop the affected movement today
- continue only unaffected, comfortable work if appropriate
- seek professional advice when pain is sharp, worsening, unusual, or concerning

Blocked actions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area

Recommended user message:

Stop this movement for today. If pain is sharp, worsening or unusual, seek professional advice.

Evidence sources:
- objective:deadlift:below_range
- objective:barbell_row:dropoff
- explicit:systemic:multi_pattern_fatigue
- subjective_safety:worsening_pain

### Productive fatigue from load progression inside range

- Scenario ID: `safety_productive_fatigue_progression`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 90, recovery_capacity 66, momentum 100, confidence 91, coaching_opportunity 78
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 78
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Low evidence new athlete

- Scenario ID: `decision_low_evidence_new_athlete`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, coaching_opportunity 62
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 45
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern

### Momentum low but recovery good

- Scenario ID: `decision_momentum_low_recovery_good`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, coaching_opportunity 68
- Safety Gate status: `clear`
- Severity: `none`
- Veto: false
- Confidence: 57
- Affected areas: none

Reasons:
- No meaningful safety concern found in objective evidence or safety context.

Allowed actions:
- continue normal planned training
- monitor next comparable workload
- use normal coaching state downstream

Blocked actions:
- none

Recommended user message:

No safety concern detected. Continue with normal controlled training.

Evidence sources:
- safety_gate:no_concern


## Open Questions

1. Should `restrict` always veto future coaching decisions, or should future decisions be able to request human review?
2. Should `stop` be movement-specific, session-specific, or both?
3. Which exact production signals should count as repeated shutdowns versus ordinary fatigue?
4. How should the gate handle user-entered pain notes without encouraging medical self-diagnosis?
5. Should professional-advice copy vary by region, app store policy, or severity?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
