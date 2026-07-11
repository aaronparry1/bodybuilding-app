# Coaching State Objective-First Report

Generated: 2026-06-27T19:05:57.221Z

## Scope

This is V2 Sprint 1B inside `research/adaptive_stress_lab`.

It describes Coaching State only. It does not prescribe interventions, does not modify V1 workout generation, does not modify V1 progression, and does not touch production app behaviour.

## Approved Semantics

- 100 always means more positive, more coachable, or better state.
- `fatigue` has been replaced by `recovery_capacity`.
- Permanent top-level state fields are `adaptation`, `recovery_capacity`, `momentum`, `confidence`, `evidence_quality`, and `coaching_opportunity`.
- Adherence, readiness, stress, sleep, and motivation remain context inputs, not permanent dominant states.
- Subjective feedback cannot dominate objective training evidence unless a severe pain/safety flag is present.
- RPE/RIR-led and wellness-questionnaire-led coaching are deliberately avoided.

## Signal Authority Hierarchy

1. Objective performance evidence: completed planned workouts, working sets, load, reps/seconds, target success, missed ranges, shutdowns, progression, comparable workload trends.
2. Training behaviour: consistency, missed sessions, skipped work, repeated swaps.
3. Recovery behaviour: session spacing, recovery week completion, recovery/cardio/capacity completion where relevant.
4. Subjective feedback: soreness, motivation, stress, sleep, perceived readiness.
5. Future wearable data: HRV, resting heart rate, sleep duration/quality, treated as context until validated.

## Scenario States

### Performance improving / fatigue low

- Scenario ID: `performance_improving_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 6
- Confidence reason: High confidence because 6 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 80 |
| Recovery capacity | 98 |
| Momentum | 98 |
| Confidence | 80 |
| Evidence quality | 92 |
| Coaching opportunity | 78 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance improving / fatigue low.
- Objective performance: improving; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:inside_range:low.
- Systemic signals: good_readiness.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] bench_press stayed inside the target range. (increased score, movement +6, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] bench_press was completed inside range. (increased score, movement +6, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] bench_press stayed in range. (increased score, movement +7, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Performance improving / fatigue low?

### Performance improving / fatigue high

- Scenario ID: `performance_improving_fatigue_high`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 7
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 80 |
| Recovery capacity | 30 |
| Momentum | 91 |
| Confidence | 80 |
| Evidence quality | 68 |
| Coaching opportunity | 42 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Performance improving / fatigue high.
- Objective performance: improving; fatigue marker: high; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: squat:inside_range:low.
- Systemic signals: high_soreness, sleep_disrupted.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence moderate)
  - [objective_performance] squat stayed inside the target range. (increased score, movement +6, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence moderate)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [objective_performance] squat was completed inside range. (increased score, movement +6, confidence moderate)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence moderate)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] squat stayed in range. (increased score, movement +7, confidence moderate)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 7 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

**coaching_opportunity**

  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence moderate)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Advanced Powerlifting use goal-specific weighting for Performance improving / fatigue high?

### Performance stagnant / fatigue low

- Scenario ID: `performance_stagnant_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 6
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 50 |
| Recovery capacity | 98 |
| Momentum | 74 |
| Confidence | 60 |
| Evidence quality | 68 |
| Coaching opportunity | 68 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance stagnant / fatigue low.
- Objective performance: stagnant; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: row:inside_range:none.
- Systemic signals: good_readiness.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - [objective_performance] row stayed inside the target range. (neutral, movement 0, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence moderate)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence moderate)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence moderate)
  - [objective_performance] row was completed inside range. (increased score, movement +6, confidence moderate)

**confidence**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -3, confidence moderate)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] row stayed in range. (increased score, movement +7, confidence moderate)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Performance stagnant / fatigue low?

### Performance stagnant / fatigue high

- Scenario ID: `performance_stagnant_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 8
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 41 |
| Recovery capacity | 0 |
| Momentum | 61 |
| Confidence | 47 |
| Evidence quality | 68 |
| Coaching opportunity | 32 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance stagnant / fatigue high.
- Objective performance: stagnant; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: leg_press:dropoff:moderate.
- Systemic signals: high_soreness, sleep_disrupted, high_stress.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - [objective_performance] leg_press shows comparable-workload drop-off evidence. (decreased score, movement -9, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence moderate)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence moderate)
  - [objective_performance] leg_press drop-off lowers recovery capacity. (decreased score, movement -8, confidence moderate)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)
  - [subjective_context] Poor sleep context slightly softens recovery capacity, but remains lower authority than performance. (decreased score, movement -4, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)

**confidence**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -3, confidence moderate)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 8 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

**coaching_opportunity**

  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Recovery-Limited Lifter use goal-specific weighting for Performance stagnant / fatigue high?

### Performance declining / fatigue high

- Scenario ID: `performance_declining_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 9
- Confidence reason: High confidence because 9 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Recovery capacity | 0 |
| Momentum | 20 |
| Confidence | 7 |
| Evidence quality | 92 |
| Coaching opportunity | 44 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance declining / fatigue high.
- Objective performance: declining; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: squat:below_range:high, bench_press:below_range:moderate.
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [objective_performance] squat missed the prescribed range. (decreased score, movement -24, confidence high)
  - [objective_performance] bench_press missed the prescribed range. (decreased score, movement -16, confidence high)
  - [objective_performance] Multiple lifts are down, reducing adaptation expression. (decreased score, movement -18, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence high)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence high)
  - [objective_performance] Multiple lifts down suggests reduced recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] squat below-range evidence lowers recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] bench_press below-range evidence lowers recovery capacity. (decreased score, movement -10, confidence high)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)
  - [subjective_context] Poor sleep context slightly softens recovery capacity, but remains lower authority than performance. (decreased score, movement -4, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] squat below-range evidence reduces momentum. (decreased score, movement -14, confidence high)
  - [objective_performance] bench_press below-range evidence reduces momentum. (decreased score, movement -9, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -18, confidence high)
  - [objective_performance] squat missed range and may reduce confidence. (decreased score, movement -15, confidence high)
  - [objective_performance] bench_press missed range and may reduce confidence. (decreased score, movement -10, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 9 evidence items are available in the fixture. (increased score, movement +12, confidence high)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Recovery-Limited Lifter use goal-specific weighting for Performance declining / fatigue high?

### One local lift failing

- Scenario ID: `one_local_lift_failing`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 5
- Confidence reason: High confidence because 5 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 30 |
| Recovery capacity | 42 |
| Momentum | 50 |
| Confidence | 41 |
| Evidence quality | 90 |
| Coaching opportunity | 62 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: One local lift failing.
- Objective performance: mixed; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:below_range:moderate.
- Systemic signals: none.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -4, confidence high)
  - [objective_performance] bench_press missed the prescribed range. (decreased score, movement -16, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence high)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence high)
  - [objective_performance] bench_press below-range evidence lowers recovery capacity. (decreased score, movement -10, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -6, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] bench_press below-range evidence reduces momentum. (decreased score, movement -9, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -5, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] bench_press missed range and may reduce confidence. (decreased score, movement -10, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 5 evidence items are available in the fixture. (increased score, movement +10, confidence high)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for One local lift failing?

### Systemic fatigue across multiple lifts

- Scenario ID: `systemic_fatigue_across_multiple_lifts`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 10
- Confidence reason: High confidence because 10 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Recovery capacity | 0 |
| Momentum | 15 |
| Confidence | 8 |
| Evidence quality | 92 |
| Coaching opportunity | 44 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Systemic fatigue across multiple lifts.
- Objective performance: declining; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: squat:below_range:high, deadlift:below_range:high, bench_press:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [objective_performance] squat missed the prescribed range. (decreased score, movement -24, confidence high)
  - [objective_performance] deadlift missed the prescribed range. (decreased score, movement -24, confidence high)
  - [objective_performance] bench_press shows comparable-workload drop-off evidence. (decreased score, movement -9, confidence high)
  - [objective_performance] Multiple lifts are down, reducing adaptation expression. (decreased score, movement -18, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence high)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence high)
  - [objective_performance] Multiple lifts down suggests reduced recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] squat below-range evidence lowers recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] deadlift below-range evidence lowers recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] bench_press drop-off lowers recovery capacity. (decreased score, movement -8, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] squat below-range evidence reduces momentum. (decreased score, movement -14, confidence high)
  - [objective_performance] deadlift below-range evidence reduces momentum. (decreased score, movement -14, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -18, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] squat missed range and may reduce confidence. (decreased score, movement -15, confidence high)
  - [objective_performance] deadlift missed range and may reduce confidence. (decreased score, movement -15, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 10 evidence items are available in the fixture. (increased score, movement +12, confidence high)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Advanced Powerlifting use goal-specific weighting for Systemic fatigue across multiple lifts?

### Missed training week

- Scenario ID: `missed_training_week`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 7
- Confidence reason: Low confidence because evidence is sparse, interrupted, or fixture-level only.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 46 |
| Recovery capacity | 35 |
| Momentum | 1 |
| Confidence | 25 |
| Evidence quality | 32 |
| Coaching opportunity | 50 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: Missed training week.
- Objective performance: mixed; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: missed_week.
- Evidence quality: low.
- Local objective signals: all:none:none.
- Systemic signals: missed_sessions, time_constraint.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -4, confidence low)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence low)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence low)
  - [training_behaviour] Missed week lowers confidence in current training tolerance. (decreased score, movement -8, confidence low)
  - [training_behaviour] Missed sessions reduce continuity but are not treated as recovery failure alone. (decreased score, movement -6, confidence low)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -6, confidence low)
  - [training_behaviour] Training continuity is missed_week. (decreased score, movement -24, confidence low)
  - [training_behaviour] Missed sessions reduce momentum. (decreased score, movement -14, confidence low)
  - [training_behaviour] Time constraints add training-friction context. (decreased score, movement -5, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -5, confidence low)
  - [training_behaviour] Fragile adherence context slightly lowers confidence. (decreased score, movement -6, confidence moderate)
  - [training_behaviour] A missed week can reduce training confidence. (decreased score, movement -14, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is low. (decreased score, movement -22, confidence low)
  - [fixture_quality] 7 evidence items are available in the fixture. (increased score, movement +12, confidence low)
  - [training_behaviour] A missed week makes current performance evidence less complete. (decreased score, movement -8, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence low)
  - [training_behaviour] Interrupted training lowers immediate coaching opportunity. (decreased score, movement -12, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific weighting for Missed training week?

### Successful load progression with productive fatigue

- Scenario ID: `successful_load_progression_productive_fatigue`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 6
- Confidence reason: High confidence because 6 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 90 |
| Recovery capacity | 74 |
| Momentum | 100 |
| Confidence | 88 |
| Evidence quality | 92 |
| Coaching opportunity | 78 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Successful load progression with productive fatigue.
- Objective performance: improving; fatigue marker: moderate; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: spider_curl:productive_fatigue:low.
- Systemic signals: good_readiness.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] spider_curl shows successful progression with productive fatigue. (increased score, movement +16, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)
  - [objective_performance] spider_curl productive fatigue adds a small expected recovery cost. (decreased score, movement -4, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] spider_curl creates a clear productive win. (increased score, movement +14, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] spider_curl is a successful progression signal. (increased score, movement +15, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Successful load progression with productive fatigue?

### Low training frequency constraint

- Scenario ID: `low_training_frequency_constraint`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 7
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 60 |
| Recovery capacity | 49 |
| Momentum | 75 |
| Confidence | 59 |
| Evidence quality | 68 |
| Coaching opportunity | 50 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: Low training frequency constraint.
- Objective performance: stable; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: all:inside_range:none.
- Systemic signals: low_frequency, time_constraint.
- Subjective context: none supplied.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was absent.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- No subjective context supplied.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +10, confidence moderate)
  - [objective_performance] all stayed inside the target range. (neutral, movement 0, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence moderate)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence moderate)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +9, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [training_behaviour] Time constraints add training-friction context. (decreased score, movement -5, confidence moderate)
  - [objective_performance] all was completed inside range. (increased score, movement +6, confidence moderate)

**confidence**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +8, confidence moderate)
  - [training_behaviour] Fragile adherence context slightly lowers confidence. (decreased score, movement -6, confidence moderate)
  - [objective_performance] all stayed in range. (increased score, movement +7, confidence moderate)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 7 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

**coaching_opportunity**

  - [objective_performance] No strong objective coaching opportunity signal was present; state remains neutral. (neutral, movement 0, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific weighting for Low training frequency constraint?

### User reports poor readiness but performance is strong

- Scenario ID: `poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 13
- Confidence reason: High confidence because 13 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 94 |
| Recovery capacity | 94 |
| Momentum | 98 |
| Confidence | 76 |
| Evidence quality | 92 |
| Coaching opportunity | 74 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: User reports poor readiness but performance is strong.
- Objective performance: improving; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:above_range:moderate, row:inside_range:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=poor, stress=moderate, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] bench_press exceeded the target range. (increased score, movement +14, confidence high)
  - [objective_performance] row stayed inside the target range. (increased score, movement +6, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] row was completed inside range. (increased score, movement +6, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] row stayed in range. (increased score, movement +7, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 13 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for User reports poor readiness but performance is strong?

### User reports feeling great but performance is declining

- Scenario ID: `feels_great_performance_declining`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 13
- Confidence reason: High confidence because 13 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Recovery capacity | 0 |
| Momentum | 32 |
| Confidence | 29 |
| Evidence quality | 92 |
| Coaching opportunity | 47 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: User reports feeling great but performance is declining.
- Objective performance: declining; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: squat:below_range:high, deadlift:dropoff:moderate.
- Systemic signals: multiple_lifts_down.
- Subjective context: readiness=great, stress=low, sleep=good, motivation=high, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [objective_performance] squat missed the prescribed range. (decreased score, movement -24, confidence high)
  - [objective_performance] deadlift shows comparable-workload drop-off evidence. (decreased score, movement -9, confidence high)
  - [objective_performance] Multiple lifts are down, reducing adaptation expression. (decreased score, movement -18, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence high)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence high)
  - [objective_performance] Multiple lifts down suggests reduced recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] squat below-range evidence lowers recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] deadlift drop-off lowers recovery capacity. (decreased score, movement -8, confidence high)
  - [subjective_context] Great reported readiness adds only a small context boost. (increased score, movement +3, confidence low)

**momentum**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] squat below-range evidence reduces momentum. (decreased score, movement -14, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -18, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] squat missed range and may reduce confidence. (decreased score, movement -15, confidence high)
  - [subjective_context] Great reported readiness adds only a small context boost. (increased score, movement +3, confidence low)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 13 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence high)
  - [subjective_context] Great reported readiness adds only a small context boost. (increased score, movement +3, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Advanced Powerlifting use goal-specific weighting for User reports feeling great but performance is declining?

### User reports high stress but objective data is stable

- Scenario ID: `high_stress_objective_stable`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 66 |
| Recovery capacity | 45 |
| Momentum | 75 |
| Confidence | 55 |
| Evidence quality | 68 |
| Coaching opportunity | 46 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: User reports high stress but objective data is stable.
- Objective performance: stable; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: leg_press:inside_range:low.
- Systemic signals: time_constraint.
- Subjective context: readiness=mixed, stress=high, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +10, confidence moderate)
  - [objective_performance] leg_press stayed inside the target range. (increased score, movement +6, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence moderate)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence moderate)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)
  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)

**momentum**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +9, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [training_behaviour] Time constraints add training-friction context. (decreased score, movement -5, confidence moderate)
  - [objective_performance] leg_press was completed inside range. (increased score, movement +6, confidence moderate)

**confidence**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +8, confidence moderate)
  - [training_behaviour] Fragile adherence context slightly lowers confidence. (decreased score, movement -6, confidence moderate)
  - [objective_performance] leg_press stayed in range. (increased score, movement +7, confidence moderate)
  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific weighting for User reports high stress but objective data is stable?

### User reports low motivation but completed sessions are consistent

- Scenario ID: `low_motivation_consistent_sessions`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 66 |
| Recovery capacity | 98 |
| Momentum | 83 |
| Confidence | 58 |
| Evidence quality | 68 |
| Coaching opportunity | 68 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: User reports low motivation but completed sessions are consistent.
- Objective performance: stable; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: machine_chest_press:inside_range:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=good, stress=moderate, sleep=good, motivation=low, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +10, confidence moderate)
  - [objective_performance] machine_chest_press stayed inside the target range. (increased score, movement +6, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence moderate)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence moderate)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +9, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence moderate)
  - [objective_performance] machine_chest_press was completed inside range. (increased score, movement +6, confidence moderate)
  - [subjective_context] Low motivation is noted but weighed below completed training behaviour. (decreased score, movement -4, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +8, confidence moderate)
  - [training_behaviour] Beginner status makes confidence more sensitive to unclear evidence. (decreased score, movement -3, confidence moderate)
  - [objective_performance] machine_chest_press stayed in range. (increased score, movement +7, confidence moderate)
  - [subjective_context] Low motivation is noted but weighed below completed training behaviour. (decreased score, movement -4, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Beginner Hypertrophy use goal-specific weighting for User reports low motivation but completed sessions are consistent?

### Severe pain/safety flag with otherwise stable training

- Scenario ID: `severe_pain_safety_flag`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 13
- Confidence reason: High caution because a severe safety flag is present; this is the only subjective path allowed to override normal weighting.
- Safety flags: subjective_severe_pain

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 66 |
| Recovery capacity | 43 |
| Momentum | 90 |
| Confidence | 49 |
| Evidence quality | 68 |
| Coaching opportunity | 10 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Severe pain/safety flag with otherwise stable training.
- Objective performance: stable; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: squat:inside_range:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=good, stress=low, sleep=good, motivation=high, safety=severe_pain.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.
- Severe pain/safety flag was allowed to override normal subjective weighting for safety.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +10, confidence moderate)
  - [objective_performance] squat stayed inside the target range. (increased score, movement +6, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence moderate)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence moderate)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence moderate)
  - [safety_flag] Severe pain/safety flag can override normal subjective weighting. (decreased score, movement -55, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +9, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence moderate)
  - [objective_performance] squat was completed inside range. (increased score, movement +6, confidence moderate)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +8, confidence moderate)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] squat stayed in range. (increased score, movement +7, confidence moderate)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)
  - [safety_flag] Severe pain/safety flag lowers confidence regardless of otherwise positive context. (decreased score, movement -25, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 13 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [safety_flag] Severe pain/safety flag constrains coaching opportunity. (decreased score, movement -40, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Severe pain/safety flag with otherwise stable training?

### Strong performance with no safety concern

- Scenario ID: `safety_clear_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 13
- Confidence reason: High confidence because 13 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 88 |
| Recovery capacity | 98 |
| Momentum | 100 |
| Confidence | 83 |
| Evidence quality | 92 |
| Coaching opportunity | 78 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Strong performance with no safety concern.
- Objective performance: improving; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:inside_range:low, row:above_range:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=good, stress=low, sleep=good, motivation=high, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] bench_press stayed inside the target range. (increased score, movement +6, confidence high)
  - [objective_performance] row exceeded the target range. (increased score, movement +8, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] bench_press was completed inside range. (increased score, movement +6, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] bench_press stayed in range. (increased score, movement +7, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 13 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Strong performance with no safety concern?

### Poor readiness but strong performance

- Scenario ID: `safety_poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: High confidence because 12 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 88 |
| Recovery capacity | 94 |
| Momentum | 92 |
| Confidence | 69 |
| Evidence quality | 92 |
| Coaching opportunity | 74 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Poor readiness but strong performance.
- Objective performance: improving; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:above_range:moderate.
- Systemic signals: good_readiness.
- Subjective context: readiness=poor, stress=moderate, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] bench_press exceeded the target range. (increased score, movement +14, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Poor readiness but strong performance?

### Severe pain flag despite strong performance

- Scenario ID: `safety_severe_pain_strong_performance`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 13
- Confidence reason: High caution because a severe safety flag is present; this is the only subjective path allowed to override normal weighting.
- Safety flags: subjective_severe_pain

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 80 |
| Recovery capacity | 43 |
| Momentum | 100 |
| Confidence | 58 |
| Evidence quality | 92 |
| Coaching opportunity | 20 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Severe pain flag despite strong performance.
- Objective performance: improving; fatigue marker: low; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: deadlift:inside_range:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=good, stress=low, sleep=good, motivation=high, safety=severe_pain.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.
- Severe pain/safety flag was allowed to override normal subjective weighting for safety.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] deadlift stayed inside the target range. (increased score, movement +6, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)
  - [safety_flag] Severe pain/safety flag can override normal subjective weighting. (decreased score, movement -55, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] deadlift was completed inside range. (increased score, movement +6, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] deadlift stayed in range. (increased score, movement +7, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)
  - [safety_flag] Severe pain/safety flag lowers confidence regardless of otherwise positive context. (decreased score, movement -25, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 13 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)
  - [safety_flag] Severe pain/safety flag constrains coaching opportunity. (decreased score, movement -40, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Advanced Powerlifting use goal-specific weighting for Severe pain flag despite strong performance?

### Repeated same-load collapse

- Scenario ID: `safety_repeated_same_load_collapse`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 14
- Confidence reason: High confidence because 14 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 1 |
| Recovery capacity | 0 |
| Momentum | 43 |
| Confidence | 32 |
| Evidence quality | 92 |
| Coaching opportunity | 44 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Repeated same-load collapse.
- Objective performance: declining; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: squat:same_load_collapse:high, leg_press:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness.
- Subjective context: readiness=mixed, stress=moderate, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [objective_performance] leg_press shows comparable-workload drop-off evidence. (decreased score, movement -9, confidence high)
  - [objective_performance] Multiple lifts are down, reducing adaptation expression. (decreased score, movement -18, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence high)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence high)
  - [objective_performance] Multiple lifts down suggests reduced recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] leg_press drop-off lowers recovery capacity. (decreased score, movement -8, confidence high)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)
  - [subjective_context] Poor sleep context slightly softens recovery capacity, but remains lower authority than performance. (decreased score, movement -4, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -18, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 14 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Recovery-Limited Lifter use goal-specific weighting for Repeated same-load collapse?

### Local exercise failure below range

- Scenario ID: `safety_local_below_range_failure`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 11
- Confidence reason: High confidence because 11 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 30 |
| Recovery capacity | 42 |
| Momentum | 50 |
| Confidence | 41 |
| Evidence quality | 92 |
| Coaching opportunity | 62 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Local exercise failure below range.
- Objective performance: mixed; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: bench_press:below_range:moderate.
- Systemic signals: none.
- Subjective context: readiness=mixed, stress=moderate, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -4, confidence high)
  - [objective_performance] bench_press missed the prescribed range. (decreased score, movement -16, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence high)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence high)
  - [objective_performance] bench_press below-range evidence lowers recovery capacity. (decreased score, movement -10, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -6, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] bench_press below-range evidence reduces momentum. (decreased score, movement -9, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -5, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] bench_press missed range and may reduce confidence. (decreased score, movement -10, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 11 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Local exercise failure below range?

### Sharp pain on squat pattern

- Scenario ID: `safety_sharp_pain_squat`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: High caution because a severe safety flag is present; this is the only subjective path allowed to override normal weighting.
- Safety flags: subjective_sharp_pain

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 48 |
| Recovery capacity | 0 |
| Momentum | 77 |
| Confidence | 34 |
| Evidence quality | 68 |
| Coaching opportunity | 0 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Sharp pain on squat pattern.
- Objective performance: stable; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: consistent.
- Evidence quality: moderate.
- Local objective signals: squat:technique_limit:moderate.
- Systemic signals: none.
- Subjective context: readiness=good, stress=moderate, sleep=good, motivation=high, safety=sharp_pain.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.
- Severe pain/safety flag was allowed to override normal subjective weighting for safety.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +10, confidence moderate)
  - [objective_performance] squat has technique-limited evidence. (decreased score, movement -12, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence moderate)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence moderate)
  - [safety_flag] Severe pain/safety flag can override normal subjective weighting. (decreased score, movement -55, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +9, confidence moderate)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence moderate)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is stable. (increased score, movement +8, confidence moderate)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] squat technique limitation may reduce confidence. (decreased score, movement -8, confidence moderate)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)
  - [safety_flag] Severe pain/safety flag lowers confidence regardless of otherwise positive context. (decreased score, movement -25, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence moderate)
  - [safety_flag] Severe pain/safety flag constrains coaching opportunity. (decreased score, movement -40, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Advanced Powerlifting use goal-specific weighting for Sharp pain on squat pattern?

### Worsening pain over multiple sessions

- Scenario ID: `safety_worsening_pain_multiple_sessions`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 15
- Confidence reason: High caution because a severe safety flag is present; this is the only subjective path allowed to override normal weighting.
- Safety flags: subjective_worsening_pain

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Recovery capacity | 0 |
| Momentum | 34 |
| Confidence | 0 |
| Evidence quality | 92 |
| Coaching opportunity | 0 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Worsening pain over multiple sessions.
- Objective performance: declining; fatigue marker: high; recovery marker: poor.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: deadlift:below_range:moderate, barbell_row:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness.
- Subjective context: readiness=poor, stress=high, sleep=poor, motivation=moderate, safety=worsening_pain.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.
- Severe pain/safety flag was allowed to override normal subjective weighting for safety.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [objective_performance] deadlift missed the prescribed range. (decreased score, movement -16, confidence high)
  - [objective_performance] barbell_row shows comparable-workload drop-off evidence. (decreased score, movement -9, confidence high)
  - [objective_performance] Multiple lifts are down, reducing adaptation expression. (decreased score, movement -18, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is high; recovery capacity uses positive score semantics. (decreased score, movement -22, confidence high)
  - [recovery_behaviour] Recovery state is poor. (decreased score, movement -24, confidence high)
  - [objective_performance] Multiple lifts down suggests reduced recovery capacity. (decreased score, movement -16, confidence high)
  - [objective_performance] deadlift below-range evidence lowers recovery capacity. (decreased score, movement -10, confidence high)
  - [objective_performance] barbell_row drop-off lowers recovery capacity. (decreased score, movement -8, confidence high)
  - [subjective_context] High stress context slightly softens recovery capacity, but does not dominate objective evidence. (decreased score, movement -3, confidence moderate)
  - [subjective_context] Poor sleep context slightly softens recovery capacity, but remains lower authority than performance. (decreased score, movement -4, confidence moderate)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)
  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)
  - [subjective_context] Poor reported sleep is considered as context only. (decreased score, movement -4, confidence low)
  - [safety_flag] Severe pain/safety flag can override normal subjective weighting. (decreased score, movement -55, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -22, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] deadlift below-range evidence reduces momentum. (decreased score, movement -9, confidence high)

**confidence**

  - [objective_performance] Objective performance trend is declining. (decreased score, movement -18, confidence high)
  - [objective_performance] deadlift missed range and may reduce confidence. (decreased score, movement -10, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)
  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)
  - [safety_flag] Severe pain/safety flag lowers confidence regardless of otherwise positive context. (decreased score, movement -25, confidence high)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 15 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence high)
  - [objective_performance] Low recovery capacity limits coaching opportunity despite any desire to push. (decreased score, movement -18, confidence high)
  - [safety_flag] Severe pain/safety flag constrains coaching opportunity. (decreased score, movement -40, confidence high)
  - [subjective_context] Poor reported readiness softens the score slightly but cannot dominate objective evidence. (decreased score, movement -4, confidence low)
  - [subjective_context] High reported stress softens the score slightly but cannot trigger a major change alone. (decreased score, movement -4, confidence low)
  - [subjective_context] Poor reported sleep is considered as context only. (decreased score, movement -4, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Recovery-Limited Lifter use goal-specific weighting for Worsening pain over multiple sessions?

### Productive fatigue from load progression inside range

- Scenario ID: `safety_productive_fatigue_progression`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: High confidence because 12 evidence items are available and objective performance evidence is present.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 90 |
| Recovery capacity | 74 |
| Momentum | 100 |
| Confidence | 91 |
| Evidence quality | 92 |
| Coaching opportunity | 78 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Productive fatigue from load progression inside range.
- Objective performance: improving; fatigue marker: moderate; recovery marker: good.
- Training behaviour: consistent.
- Evidence quality: high.
- Local objective signals: spider_curl:productive_fatigue:low.
- Systemic signals: good_readiness.
- Subjective context: readiness=good, stress=low, sleep=good, motivation=high, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +24, confidence high)
  - [objective_performance] spider_curl shows successful progression with productive fatigue. (increased score, movement +16, confidence high)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence high)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence high)
  - [objective_performance] Good objective readiness signal supports recovery capacity. (increased score, movement +8, confidence high)
  - [objective_performance] spider_curl productive fatigue adds a small expected recovery cost. (decreased score, movement -4, confidence high)

**momentum**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +20, confidence high)
  - [training_behaviour] Training continuity is consistent. (increased score, movement +15, confidence high)
  - [objective_performance] Good objective readiness supports momentum. (increased score, movement +7, confidence high)
  - [objective_performance] spider_curl creates a clear productive win. (increased score, movement +14, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is improving. (increased score, movement +17, confidence high)
  - [training_behaviour] Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - [objective_performance] spider_curl is a successful progression signal. (increased score, movement +15, confidence high)
  - [subjective_context] High motivation adds only a small context boost. (increased score, movement +3, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is high. (increased score, movement +30, confidence high)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence high)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Strong objective performance and adequate recovery capacity create useful coaching opportunity. (increased score, movement +18, confidence high)
  - [objective_performance] High adaptation and momentum create room for careful future coaching. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific weighting for Productive fatigue from load progression inside range?

### Low evidence new athlete

- Scenario ID: `decision_low_evidence_new_athlete`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 11
- Confidence reason: Low confidence because evidence is sparse, interrupted, or fixture-level only.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 46 |
| Recovery capacity | 52 |
| Momentum | 36 |
| Confidence | 42 |
| Evidence quality | 40 |
| Coaching opportunity | 62 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: Low evidence new athlete.
- Objective performance: mixed; fatigue marker: moderate; recovery marker: mixed.
- Training behaviour: interrupted.
- Evidence quality: low.
- Local objective signals: all:none:none.
- Systemic signals: none.
- Subjective context: readiness=mixed, stress=moderate, sleep=mixed, motivation=moderate, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -4, confidence low)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is moderate; recovery capacity uses positive score semantics. (neutral, movement 0, confidence low)
  - [recovery_behaviour] Recovery state is mixed. (increased score, movement +2, confidence low)

**momentum**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -6, confidence low)
  - [training_behaviour] Training continuity is interrupted. (decreased score, movement -8, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is mixed. (decreased score, movement -5, confidence low)
  - [training_behaviour] Beginner status makes confidence more sensitive to unclear evidence. (decreased score, movement -3, confidence moderate)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is low. (decreased score, movement -22, confidence low)
  - [fixture_quality] 11 evidence items are available in the fixture. (increased score, movement +12, confidence low)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] Objective problems create an opportunity for coaching attention. (increased score, movement +12, confidence low)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Beginner Hypertrophy use goal-specific weighting for Low evidence new athlete?

### Momentum low but recovery good

- Scenario ID: `decision_momentum_low_recovery_good`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.221Z
- Evidence count: 12
- Confidence reason: Moderate confidence because objective evidence is usable but still fixture-level.
- Safety flags: none

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | 50 |
| Recovery capacity | 84 |
| Momentum | 26 |
| Confidence | 47 |
| Evidence quality | 68 |
| Coaching opportunity | 50 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: Momentum low but recovery good.
- Objective performance: stagnant; fatigue marker: low; recovery marker: good.
- Training behaviour: interrupted.
- Evidence quality: moderate.
- Local objective signals: machine_chest_press:inside_range:none.
- Systemic signals: missed_sessions.
- Subjective context: readiness=good, stress=moderate, sleep=good, motivation=low, safety=none.

#### Authority Handling

- Authority 1: objective performance evidence controls the primary state movement.
- Authority 2: training behaviour modifies momentum and evidence quality.
- Authority 3: recovery behaviour modifies recovery capacity only when present.
- Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence.
- Authority 5: future wearable data is not used in this lab.

#### Subjective Context Handling

- Subjective inputs were considered as context, not dominant state drivers.
- Objective evidence was mixed or stable, so subjective feedback explained uncertainty without taking control.

#### Score Explanations

**adaptation**

  - [objective_performance] Objective performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - [objective_performance] machine_chest_press stayed inside the target range. (neutral, movement 0, confidence moderate)

**recovery_capacity**

  - [objective_performance] Objective fatigue state is low; recovery capacity uses positive score semantics. (increased score, movement +20, confidence moderate)
  - [recovery_behaviour] Recovery state is good. (increased score, movement +20, confidence moderate)
  - [training_behaviour] Missed sessions reduce continuity but are not treated as recovery failure alone. (decreased score, movement -6, confidence moderate)

**momentum**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - [training_behaviour] Training continuity is interrupted. (decreased score, movement -8, confidence moderate)
  - [training_behaviour] Missed sessions reduce momentum. (decreased score, movement -14, confidence moderate)
  - [objective_performance] machine_chest_press was completed inside range. (increased score, movement +6, confidence moderate)
  - [subjective_context] Low motivation is noted but weighed below completed training behaviour. (decreased score, movement -4, confidence low)

**confidence**

  - [objective_performance] Objective performance trend is stagnant. (decreased score, movement -3, confidence moderate)
  - [training_behaviour] Beginner status makes confidence more sensitive to unclear evidence. (decreased score, movement -3, confidence moderate)
  - [objective_performance] machine_chest_press stayed in range. (increased score, movement +7, confidence moderate)
  - [subjective_context] Low motivation is noted but weighed below completed training behaviour. (decreased score, movement -4, confidence low)

**evidence_quality**

  - [fixture_quality] Scenario evidence quality is moderate. (increased score, movement +6, confidence moderate)
  - [fixture_quality] 12 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)
  - [subjective_context] Subjective context was present but did not increase evidence authority. (neutral, movement 0, confidence low)

**coaching_opportunity**

  - [objective_performance] No strong objective coaching opportunity signal was present; state remains neutral. (neutral, movement 0, confidence moderate)

#### Open Questions

- Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?
- Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?
- Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?
- Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?
- Research question: should Beginner Hypertrophy use goal-specific weighting for Momentum low but recovery good?


## Objective-First Checks

- `poor_readiness_strong_performance`: adaptation 94, recovery_capacity 94, momentum 98, confidence 76, coaching_opportunity 74, safety none
- `feels_great_performance_declining`: adaptation 0, recovery_capacity 0, momentum 32, confidence 29, coaching_opportunity 47, safety none
- `high_stress_objective_stable`: adaptation 66, recovery_capacity 45, momentum 75, confidence 55, coaching_opportunity 46, safety none
- `low_motivation_consistent_sessions`: adaptation 66, recovery_capacity 98, momentum 83, confidence 58, coaching_opportunity 68, safety none
- `severe_pain_safety_flag`: adaptation 66, recovery_capacity 43, momentum 90, confidence 49, coaching_opportunity 10, safety subjective_severe_pain

## Global Open Decisions For Aaron

1. Confirm whether `coaching_opportunity` should remain a single field or split into `opportunity` and `caution`.
2. Confirm whether severe pain/safety flags belong inside CoachingState or a separate pre-coaching safety gate.
3. Confirm whether subjective context should be ignored entirely until a minimum objective evidence count is reached.
4. Confirm whether `confidence` means athlete confidence, model confidence, or whether those must split before V2 advances.
5. Confirm how future wearable data should be validated before it can move above low-authority context.

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
