# Decision Engine v0.2 Report

Generated: 2026-06-28T15:02:02.967Z

## Scope

Decision Engine v0.2 is a research-only prototype inside `research/adaptive_stress_lab`.

It consumes Athlete profile, Training evidence, Coaching State, and Safety Gate output. It does not modify production workout generation, V1 progression, subscriptions, or app behaviour.

## Scenario Recommendations

### Performance improving / fatigue low

- Scenario ID: `performance_improving_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, evidence_quality 90, opportunity 78
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold until excellent performance is backed by enough comparable evidence.
- Confidence: 82

Secondary interventions:
- Push requires high-confidence repeated same-exercise success.
- Push withheld: evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Let the evidence earn the next increase.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 80, recovery_capacity 98, momentum 98, confidence 80, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 85 is below 90; same-exercise successful exposures 1 is below 3; successful comparable exposures 1 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:performance_improving_fatigue_low
- coaching_state:adaptation:80
- coaching_state:recovery_capacity:98
- coaching_state:momentum:98
- coaching_state:confidence:80
- coaching_state:evidence_quality:90
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does performance_improving_fatigue_low need a human-review state before production automation?

### Performance improving / fatigue high

- Scenario ID: `performance_improving_fatigue_high`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, evidence_quality 66, opportunity 42
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `consolidate`
- Aggressiveness: `low`
- Primary intervention: Hold recent progress steady and let recovery capacity catch up.
- Confidence: 71

Secondary interventions:
- Avoid adding load or volume.
- Use controlled execution as the win.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 30, momentum 91, confidence 80, opportunity 42.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.

User message:

You've earned the progress. We'll hold steady and let it stick.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Progress is allowed to stick before adding more stress.

Evidence sources:
- scenario:performance_improving_fatigue_high
- coaching_state:adaptation:80
- coaching_state:recovery_capacity:30
- coaching_state:momentum:91
- coaching_state:confidence:80
- coaching_state:evidence_quality:66
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:consolidate

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'consolidate' could affect real users?
- Research question: does performance_improving_fatigue_high need a human-review state before production automation?

### Performance stagnant / fatigue low

- Scenario ID: `performance_stagnant_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, evidence_quality 66, opportunity 68
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold and gather clearer evidence.
- Confidence: 75

Secondary interventions:
- Avoid unnecessary changes.
- Keep the next session simple and finishable.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 98, momentum 74, confidence 60, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:performance_stagnant_fatigue_low
- coaching_state:adaptation:50
- coaching_state:recovery_capacity:98
- coaching_state:momentum:74
- coaching_state:confidence:60
- coaching_state:evidence_quality:66
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does performance_stagnant_fatigue_low need a human-review state before production automation?

### Performance stagnant / fatigue high

- Scenario ID: `performance_stagnant_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 41, recovery_capacity 0, momentum 61, confidence 47, evidence_quality 66, opportunity 32
- Safety Gate: `caution`, veto false, affected squat/lower-body pattern

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Keep the work controlled while monitoring the concern.
- Confidence: 75

Secondary interventions:
- Avoid aggressive progression today.
- Let objective evidence confirm the next step.

Blocked interventions:
- aggressive progression without confirmation
- aggressive load increase

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 41, recovery_capacity 0, momentum 61, confidence 47, opportunity 32.
- Safety Gate is caution.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:performance_stagnant_fatigue_high
- coaching_state:adaptation:41
- coaching_state:recovery_capacity:0
- coaching_state:momentum:61
- coaching_state:confidence:47
- coaching_state:evidence_quality:66
- safety_gate:caution
- objective:leg_press:dropoff
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does performance_stagnant_fatigue_high need a human-review state before production automation?

### Performance declining / fatigue high

- Scenario ID: `performance_declining_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true, affected squat/lower-body pattern, pressing pattern, systemic

#### Coaching Recommendation

- Type: `recover`
- Aggressiveness: `very_low`
- Primary intervention: Use a recovery-biased prescription because fatigue is systemic, not local.
- Confidence: 100

Secondary interventions:
- Preserve movement quality.
- Do not chase load or volume while multiple patterns are down.

Blocked interventions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading
- aggressive load increase
- extra volume
- high-fatigue movement selection

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 20, confidence 7, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Recovery is treated as productive when systemic evidence warrants it.

Evidence sources:
- scenario:performance_declining_fatigue_high
- coaching_state:adaptation:0
- coaching_state:recovery_capacity:0
- coaching_state:momentum:20
- coaching_state:confidence:7
- coaching_state:evidence_quality:92
- safety_gate:restrict
- objective:squat:below_range
- objective:bench_press:below_range
- explicit:systemic:multi_pattern_fatigue
- decision_rule:recover

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'recover' could affect real users?
- Research question: does performance_declining_fatigue_high need a human-review state before production automation?

### One local lift failing

- Scenario ID: `one_local_lift_failing`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 90, opportunity 62
- Safety Gate: `caution`, veto false, affected pressing pattern

#### Coaching Recommendation

- Type: `reduce`
- Aggressiveness: `low`
- Primary intervention: Adjust the local movement only and keep unrelated training stable.
- Confidence: 94

Secondary interventions:
- Avoid load increases for the affected lift.
- Monitor the next comparable set or session.

Blocked interventions:
- aggressive progression without confirmation
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Local problems are handled locally when possible.

Evidence sources:
- scenario:one_local_lift_failing
- coaching_state:adaptation:30
- coaching_state:recovery_capacity:42
- coaching_state:momentum:50
- coaching_state:confidence:41
- coaching_state:evidence_quality:90
- safety_gate:caution
- objective:bench_press:below_range
- decision_rule:reduce

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'reduce' could affect real users?
- Research question: does one_local_lift_failing need a human-review state before production automation?

### Systemic fatigue across multiple lifts

- Scenario ID: `systemic_fatigue_across_multiple_lifts`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true, affected squat/lower-body pattern, hinge/pull pattern, pressing pattern, systemic

#### Coaching Recommendation

- Type: `recover`
- Aggressiveness: `very_low`
- Primary intervention: Use a recovery-biased prescription because fatigue is systemic, not local.
- Confidence: 100

Secondary interventions:
- Preserve movement quality.
- Do not chase load or volume while multiple patterns are down.

Blocked interventions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading
- aggressive load increase
- extra volume
- high-fatigue movement selection

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 15, confidence 8, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Recovery is treated as productive when systemic evidence warrants it.

Evidence sources:
- scenario:systemic_fatigue_across_multiple_lifts
- coaching_state:adaptation:0
- coaching_state:recovery_capacity:0
- coaching_state:momentum:15
- coaching_state:confidence:8
- coaching_state:evidence_quality:92
- safety_gate:restrict
- objective:squat:below_range
- objective:deadlift:below_range
- objective:bench_press:dropoff
- explicit:systemic:multi_pattern_fatigue
- decision_rule:recover

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'recover' could affect real users?
- Research question: does systemic_fatigue_across_multiple_lifts need a human-review state before production automation?

### Missed training week

- Scenario ID: `missed_training_week`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, evidence_quality 30, opportunity 50
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold the prescription and collect clearer evidence.
- Confidence: 53

Secondary interventions:
- Keep the session simple.
- Avoid major coaching changes from sparse evidence.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 46, recovery_capacity 35, momentum 6, confidence 25, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:missed_training_week
- coaching_state:adaptation:46
- coaching_state:recovery_capacity:35
- coaching_state:momentum:6
- coaching_state:confidence:25
- coaching_state:evidence_quality:30
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does missed_training_week need a human-review state before production automation?

### Successful load progression with productive fatigue

- Scenario ID: `successful_load_progression_productive_fatigue`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, evidence_quality 90, opportunity 78
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `consolidate`
- Aggressiveness: `low`
- Primary intervention: Recognise the heavier-load progress and consolidate at the new level.
- Confidence: 94

Secondary interventions:
- Do not classify expected fatigue as failure.
- Avoid another aggressive jump immediately.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 99, confidence 88, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.

User message:

You've earned the progress. We'll hold steady and let it stick.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Progress is allowed to stick before adding more stress.

Evidence sources:
- scenario:successful_load_progression_productive_fatigue
- coaching_state:adaptation:90
- coaching_state:recovery_capacity:66
- coaching_state:momentum:99
- coaching_state:confidence:88
- coaching_state:evidence_quality:90
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:consolidate

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'consolidate' could affect real users?
- Research question: does successful_load_progression_productive_fatigue need a human-review state before production automation?

### Low training frequency constraint

- Scenario ID: `low_training_frequency_constraint`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, evidence_quality 66, opportunity 50
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold and gather clearer evidence.
- Confidence: 75

Secondary interventions:
- Avoid unnecessary changes.
- Keep the next session simple and finishable.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 60, recovery_capacity 49, momentum 80, confidence 59, opportunity 50.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:low_training_frequency_constraint
- coaching_state:adaptation:60
- coaching_state:recovery_capacity:49
- coaching_state:momentum:80
- coaching_state:confidence:59
- coaching_state:evidence_quality:66
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does low_training_frequency_constraint need a human-review state before production automation?

### User reports poor readiness but performance is strong

- Scenario ID: `poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 94, recovery_capacity 94, momentum 98, confidence 76, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold until excellent performance is backed by enough comparable evidence.
- Confidence: 82

Secondary interventions:
- Push requires high-confidence repeated same-exercise success.
- Push withheld: evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Let the evidence earn the next increase.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 94, recovery_capacity 94, momentum 98, confidence 76, opportunity 74.
- Safety Gate is clear.
- Push withheld because evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:poor_readiness_strong_performance
- coaching_state:adaptation:94
- coaching_state:recovery_capacity:94
- coaching_state:momentum:98
- coaching_state:confidence:76
- coaching_state:evidence_quality:92
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does poor_readiness_strong_performance need a human-review state before production automation?

### User reports feeling great but performance is declining

- Scenario ID: `feels_great_performance_declining`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 32, confidence 29, evidence_quality 92, opportunity 47
- Safety Gate: `restrict`, veto true, affected squat/lower-body pattern, hinge/pull pattern, systemic

#### Coaching Recommendation

- Type: `recover`
- Aggressiveness: `very_low`
- Primary intervention: Use a recovery-biased prescription because fatigue is systemic, not local.
- Confidence: 100

Secondary interventions:
- Preserve movement quality.
- Do not chase load or volume while multiple patterns are down.

Blocked interventions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading
- aggressive load increase
- extra volume
- high-fatigue movement selection

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 32, confidence 29, opportunity 47.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- Systemic fatigue evidence is broader than one local lift.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Recovery is treated as productive when systemic evidence warrants it.

Evidence sources:
- scenario:feels_great_performance_declining
- coaching_state:adaptation:0
- coaching_state:recovery_capacity:0
- coaching_state:momentum:32
- coaching_state:confidence:29
- coaching_state:evidence_quality:92
- safety_gate:restrict
- objective:squat:below_range
- objective:deadlift:dropoff
- explicit:systemic:multi_pattern_fatigue
- decision_rule:recover

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'recover' could affect real users?
- Research question: does feels_great_performance_declining need a human-review state before production automation?

### User reports high stress but objective data is stable

- Scenario ID: `high_stress_objective_stable`
- Athlete: Busy Parent / Time-Constrained Lifter
- Coaching State summary: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, evidence_quality 68, opportunity 46
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold and gather clearer evidence.
- Confidence: 76

Secondary interventions:
- Avoid unnecessary changes.
- Keep the next session simple and finishable.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Busy Parent / Time-Constrained Lifter.
- Coaching State: adaptation 66, recovery_capacity 45, momentum 80, confidence 55, opportunity 46.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:high_stress_objective_stable
- coaching_state:adaptation:66
- coaching_state:recovery_capacity:45
- coaching_state:momentum:80
- coaching_state:confidence:55
- coaching_state:evidence_quality:68
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does high_stress_objective_stable need a human-review state before production automation?

### User reports low motivation but completed sessions are consistent

- Scenario ID: `low_motivation_consistent_sessions`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Own the current work before adding more stress.
- Confidence: 76

Secondary interventions:
- Let repeatable performance confirm the next push.
- Protect confidence and momentum.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:low_motivation_consistent_sessions
- coaching_state:adaptation:66
- coaching_state:recovery_capacity:98
- coaching_state:momentum:83
- coaching_state:confidence:58
- coaching_state:evidence_quality:68
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does low_motivation_consistent_sessions need a human-review state before production automation?

### Severe pain/safety flag with otherwise stable training

- Scenario ID: `severe_pain_safety_flag`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 66, recovery_capacity 43, momentum 90, confidence 49, evidence_quality 68, opportunity 10
- Safety Gate: `stop`, veto true, affected squat/lower-body pattern

#### Coaching Recommendation

- Type: `stop_movement`
- Aggressiveness: `very_low`
- Primary intervention: Stop the affected movement or pattern for today.
- Confidence: 84

Secondary interventions:
- Keep any remaining work limited to unaffected, comfortable movement only.
- Use calm safety guidance and avoid medical diagnosis.

Blocked interventions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area
- aggressive load increase
- progression for affected movement
- affected-pattern loading

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 66, recovery_capacity 43, momentum 90, confidence 49, opportunity 10.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Safety veto protects long-term training integrity.

Evidence sources:
- scenario:severe_pain_safety_flag
- coaching_state:adaptation:66
- coaching_state:recovery_capacity:43
- coaching_state:momentum:90
- coaching_state:confidence:49
- coaching_state:evidence_quality:68
- safety_gate:stop
- subjective_safety:severe_pain
- decision_rule:stop_movement

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'stop_movement' could affect real users?
- Research question: does severe_pain_safety_flag need a human-review state before production automation?

### Strong performance with no safety concern

- Scenario ID: `safety_clear_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 88, recovery_capacity 98, momentum 100, confidence 83, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold until excellent performance is backed by enough comparable evidence.
- Confidence: 82

Secondary interventions:
- Push requires high-confidence repeated same-exercise success.
- Push withheld: evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Let the evidence earn the next increase.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 98, momentum 100, confidence 83, opportunity 78.
- Safety Gate is clear.
- Push withheld because evidence quality 88 is below 90; same-exercise successful exposures 2 is below 3; successful comparable exposures 2 is below 3.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:safety_clear_strong_performance
- coaching_state:adaptation:88
- coaching_state:recovery_capacity:98
- coaching_state:momentum:100
- coaching_state:confidence:83
- coaching_state:evidence_quality:92
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does safety_clear_strong_performance need a human-review state before production automation?

### Poor readiness but strong performance

- Scenario ID: `safety_poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, evidence_quality 92, opportunity 74
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold the prescription until above-range performance repeats.
- Confidence: 99

Secondary interventions:
- Treat one above-range set as promising, not enough to push.
- Let stronger evidence earn the next progression.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 88, recovery_capacity 94, momentum 92, confidence 69, opportunity 74.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:safety_poor_readiness_strong_performance
- coaching_state:adaptation:88
- coaching_state:recovery_capacity:94
- coaching_state:momentum:92
- coaching_state:confidence:69
- coaching_state:evidence_quality:92
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does safety_poor_readiness_strong_performance need a human-review state before production automation?

### Severe pain flag despite strong performance

- Scenario ID: `safety_severe_pain_strong_performance`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 80, recovery_capacity 43, momentum 100, confidence 58, evidence_quality 92, opportunity 20
- Safety Gate: `stop`, veto true, affected hinge/pull pattern

#### Coaching Recommendation

- Type: `stop_movement`
- Aggressiveness: `very_low`
- Primary intervention: Stop the affected movement or pattern for today.
- Confidence: 100

Secondary interventions:
- Keep any remaining work limited to unaffected, comfortable movement only.
- Use calm safety guidance and avoid medical diagnosis.

Blocked interventions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area
- aggressive load increase
- progression for affected movement
- affected-pattern loading

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 80, recovery_capacity 43, momentum 100, confidence 58, opportunity 20.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Safety veto protects long-term training integrity.

Evidence sources:
- scenario:safety_severe_pain_strong_performance
- coaching_state:adaptation:80
- coaching_state:recovery_capacity:43
- coaching_state:momentum:100
- coaching_state:confidence:58
- coaching_state:evidence_quality:92
- safety_gate:stop
- subjective_safety:severe_pain
- decision_rule:stop_movement

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'stop_movement' could affect real users?
- Research question: does safety_severe_pain_strong_performance need a human-review state before production automation?

### Repeated same-load collapse

- Scenario ID: `safety_repeated_same_load_collapse`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 1, recovery_capacity 0, momentum 43, confidence 32, evidence_quality 92, opportunity 44
- Safety Gate: `restrict`, veto true, affected squat/lower-body pattern

#### Coaching Recommendation

- Type: `reduce`
- Aggressiveness: `low`
- Primary intervention: Reduce the affected movement stress and keep the correction local.
- Confidence: 100

Secondary interventions:
- Block load increases for the affected area.
- Keep unaffected work controlled.

Blocked interventions:
- aggressive progression
- PR attempts
- load increases for affected area
- extra volume for affected area
- high-fatigue movements for affected area
- affected-pattern loading
- aggressive load increase
- extra volume
- high-fatigue movement selection

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 1, recovery_capacity 0, momentum 43, confidence 32, opportunity 44.
- Safety Gate is restrict with veto active.
- Restrict blocks aggressive actions while still allowing conservative alternatives.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Local problems are handled locally when possible.

Evidence sources:
- scenario:safety_repeated_same_load_collapse
- coaching_state:adaptation:1
- coaching_state:recovery_capacity:0
- coaching_state:momentum:43
- coaching_state:confidence:32
- coaching_state:evidence_quality:92
- safety_gate:restrict
- objective:squat:same_load_collapse
- objective:leg_press:dropoff
- decision_rule:reduce

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'reduce' could affect real users?
- Research question: does safety_repeated_same_load_collapse need a human-review state before production automation?

### Local exercise failure below range

- Scenario ID: `safety_local_below_range_failure`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, evidence_quality 92, opportunity 62
- Safety Gate: `caution`, veto false, affected pressing pattern

#### Coaching Recommendation

- Type: `reduce`
- Aggressiveness: `low`
- Primary intervention: Adjust the local movement only and keep unrelated training stable.
- Confidence: 95

Secondary interventions:
- Avoid load increases for the affected lift.
- Monitor the next comparable set or session.

Blocked interventions:
- aggressive progression without confirmation
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 30, recovery_capacity 42, momentum 50, confidence 41, opportunity 62.
- Safety Gate is caution.
- The issue is local enough to adjust the affected movement without rewriting the whole programme.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

This looks too heavy for today. We'll reduce the load and keep the work productive.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Local problems are handled locally when possible.

Evidence sources:
- scenario:safety_local_below_range_failure
- coaching_state:adaptation:30
- coaching_state:recovery_capacity:42
- coaching_state:momentum:50
- coaching_state:confidence:41
- coaching_state:evidence_quality:92
- safety_gate:caution
- objective:bench_press:below_range
- decision_rule:reduce

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'reduce' could affect real users?
- Research question: does safety_local_below_range_failure need a human-review state before production automation?

### Sharp pain on squat pattern

- Scenario ID: `safety_sharp_pain_squat`
- Athlete: Advanced Powerlifting
- Coaching State summary: adaptation 48, recovery_capacity 0, momentum 77, confidence 34, evidence_quality 68, opportunity 0
- Safety Gate: `stop`, veto true, affected squat/lower-body pattern

#### Coaching Recommendation

- Type: `stop_movement`
- Aggressiveness: `very_low`
- Primary intervention: Stop the affected movement or pattern for today.
- Confidence: 84

Secondary interventions:
- Keep any remaining work limited to unaffected, comfortable movement only.
- Use calm safety guidance and avoid medical diagnosis.

Blocked interventions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area
- aggressive load increase
- progression for affected movement
- affected-pattern loading

Rationale:
- Athlete profile: Advanced Powerlifting.
- Coaching State: adaptation 48, recovery_capacity 0, momentum 77, confidence 34, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Safety veto protects long-term training integrity.

Evidence sources:
- scenario:safety_sharp_pain_squat
- coaching_state:adaptation:48
- coaching_state:recovery_capacity:0
- coaching_state:momentum:77
- coaching_state:confidence:34
- coaching_state:evidence_quality:68
- safety_gate:stop
- objective:squat:technique_limit
- subjective_safety:sharp_pain
- decision_rule:stop_movement

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'stop_movement' could affect real users?
- Research question: does safety_sharp_pain_squat need a human-review state before production automation?

### Worsening pain over multiple sessions

- Scenario ID: `safety_worsening_pain_multiple_sessions`
- Athlete: Recovery-Limited Lifter
- Coaching State summary: adaptation 0, recovery_capacity 0, momentum 34, confidence 0, evidence_quality 92, opportunity 0
- Safety Gate: `stop`, veto true, affected hinge/pull pattern, systemic

#### Coaching Recommendation

- Type: `stop_movement`
- Aggressiveness: `very_low`
- Primary intervention: Stop the affected movement or pattern for today.
- Confidence: 100

Secondary interventions:
- Keep any remaining work limited to unaffected, comfortable movement only.
- Use calm safety guidance and avoid medical diagnosis.

Blocked interventions:
- affected movement training today
- PR attempts
- load increases for affected area
- high-fatigue work for affected area
- aggressive load increase
- progression for affected movement
- affected-pattern loading

Rationale:
- Athlete profile: Recovery-Limited Lifter.
- Coaching State: adaptation 0, recovery_capacity 0, momentum 34, confidence 0, opportunity 0.
- Safety Gate is stop with veto active.
- Safety Gate has priority over otherwise productive training evidence.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

Stop this movement for today. We'll avoid pushing this area.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Safety veto protects long-term training integrity.

Evidence sources:
- scenario:safety_worsening_pain_multiple_sessions
- coaching_state:adaptation:0
- coaching_state:recovery_capacity:0
- coaching_state:momentum:34
- coaching_state:confidence:0
- coaching_state:evidence_quality:92
- safety_gate:stop
- objective:deadlift:below_range
- objective:barbell_row:dropoff
- explicit:systemic:multi_pattern_fatigue
- subjective_safety:worsening_pain
- decision_rule:stop_movement

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'stop_movement' could affect real users?
- Research question: does safety_worsening_pain_multiple_sessions need a human-review state before production automation?

### Productive fatigue from load progression inside range

- Scenario ID: `safety_productive_fatigue_progression`
- Athlete: Intermediate Strength/Hypertrophy
- Coaching State summary: adaptation 90, recovery_capacity 66, momentum 100, confidence 91, evidence_quality 92, opportunity 78
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `consolidate`
- Aggressiveness: `low`
- Primary intervention: Recognise the heavier-load progress and consolidate at the new level.
- Confidence: 95

Secondary interventions:
- Do not classify expected fatigue as failure.
- Avoid another aggressive jump immediately.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Intermediate Strength/Hypertrophy.
- Coaching State: adaptation 90, recovery_capacity 66, momentum 100, confidence 91, opportunity 78.
- Safety Gate is clear.
- The goal is to keep progress while avoiding unnecessary fatigue.
- Productive fatigue inside range is recognised as progress, not failure.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You've earned the progress. We'll hold steady and let it stick.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: Progress is allowed to stick before adding more stress.

Evidence sources:
- scenario:safety_productive_fatigue_progression
- coaching_state:adaptation:90
- coaching_state:recovery_capacity:66
- coaching_state:momentum:100
- coaching_state:confidence:91
- coaching_state:evidence_quality:92
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:consolidate

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'consolidate' could affect real users?
- Research question: does safety_productive_fatigue_progression need a human-review state before production automation?

### Low evidence new athlete

- Scenario ID: `decision_low_evidence_new_athlete`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, evidence_quality 40, opportunity 62
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Hold the prescription and collect clearer evidence.
- Confidence: 56

Secondary interventions:
- Keep the session simple.
- Avoid major coaching changes from sparse evidence.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 46, recovery_capacity 52, momentum 36, confidence 42, opportunity 62.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:decision_low_evidence_new_athlete
- coaching_state:adaptation:46
- coaching_state:recovery_capacity:52
- coaching_state:momentum:36
- coaching_state:confidence:42
- coaching_state:evidence_quality:40
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does decision_low_evidence_new_athlete need a human-review state before production automation?

### Momentum low but recovery good

- Scenario ID: `decision_momentum_low_recovery_good`
- Athlete: Beginner Hypertrophy
- Coaching State summary: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, evidence_quality 68, opportunity 68
- Safety Gate: `clear`, veto false, affected none

#### Coaching Recommendation

- Type: `hold`
- Aggressiveness: `low`
- Primary intervention: Create a clear, manageable win without forcing load.
- Confidence: 76

Secondary interventions:
- Use an achievable rep or technique target.
- Keep the session finishable.

Blocked interventions:
- aggressive load increase

Rationale:
- Athlete profile: Beginner Hypertrophy.
- Coaching State: adaptation 50, recovery_capacity 92, momentum 33, confidence 47, opportunity 68.
- Safety Gate is clear.
- Holding is the smallest effective intervention while evidence clarifies.
- Subjective context was considered but did not dominate objective training evidence unless safety-relevant.

User message:

You're progressing. Today is about owning the work, not forcing more.

Charter alignment:

- Long-term progress: prioritised
- Adaptation: supported without treating performance as the only objective
- Recovery: protected by avoiding unnecessary fatigue cost
- Confidence: protected through manageable next steps
- Enjoyment: protected by keeping the recommendation simple and non-dramatic
- Momentum: protected by preserving a clear path forward
- Notes: The smallest effective intervention is no unnecessary change.

Evidence sources:
- scenario:decision_momentum_low_recovery_good
- coaching_state:adaptation:50
- coaching_state:recovery_capacity:92
- coaching_state:momentum:33
- coaching_state:confidence:47
- coaching_state:evidence_quality:68
- safety_gate:clear
- safety_gate:no_concern
- decision_rule:hold

Open questions:
- Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?
- Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?
- Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?
- Research question: what production evidence threshold is required before 'hold' could affect real users?
- Research question: does decision_momentum_low_recovery_good need a human-review state before production automation?


## Summary Counts

- `consolidate`: 3
- `hold`: 12
- `recover`: 3
- `reduce`: 3
- `stop_movement`: 4

## Open Aaron Decisions

1. Should `stop_session` include severe/worsening pain by default, or only systemic symptoms such as dizziness, faintness, chest pain, and unusual symptoms?
2. Should `restrict` always allow substitute/reduce/consolidate, or should some affected-pattern restrictions require human review?
3. Should `push` ever use `high` aggressiveness, or should V2 cap all pushes at moderate?
4. Should `coaching_opportunity` be split into opportunity and caution before Decision Engine v0.3?
5. What confidence threshold is required before a recommendation can move from research to simulation?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
