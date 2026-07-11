# Athlete State Engine v0.1 Report

Generated: 2026-06-27T19:05:57.189Z

## Scope

This is a research-only Athlete State Engine inside `research/adaptive_stress_lab`.

It describes the athlete. It does not make coaching decisions, does not prescribe interventions, does not modify progression, and does not touch production app behaviour.

## AthleteState Object

Each scenario produces:

- `adaptation`: 0-100
- `fatigue`: 0-100, where higher means more fatigue
- `recovery`: 0-100
- `momentum`: 0-100
- `confidence`: 0-100
- `evidence_quality`: 0-100
- `confidence_reason`
- `last_updated`
- `evidence_count`
- score explanations for every field

## Scoring Method

The scoring is deliberately simple, transparent, and not tuned.

Scores begin from a neutral midpoint and move according to available fixture evidence:

- planned/completed training continuity is represented by `trainingContinuity`
- working-set outcomes are represented by `localLiftSignals`
- missed reps are represented by `below_range`
- shutdown/drop-off is represented by `dropoff`
- load progression is represented by `productive_fatigue` or `above_range`
- consistency and missed sessions are represented by `trainingContinuity` and `missed_sessions`
- recovery weeks are reserved for future evidence fixtures and are not inferred here

No sleep, HRV, wearable, or external sensor data is used.

## Scenario States

### Performance improving / fatigue low

- Scenario ID: `performance_improving_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: High confidence because 6 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 78 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 95 |
| Confidence | 86 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance improving / fatigue low.
- Performance: improving; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:inside_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - bench_press is inside the target range. (increased score, movement +6, confidence high)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - bench_press was completed inside range. (increased score, movement +5, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - bench_press stayed in range. (increased score, movement +6, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Performance improving / fatigue low?

### Performance improving / fatigue high

- Scenario ID: `performance_improving_fatigue_high`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 78 |
| Fatigue | 96 |
| Recovery | 24 |
| Momentum | 87 |
| Confidence | 78 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Performance improving / fatigue high.
- Performance: improving; fatigue: high; recovery: mixed.
- Continuity: consistent; evidence quality: moderate.
- Local signals: squat:inside_range:low.
- Systemic signals: high_soreness, sleep_disrupted.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence moderate)
  - squat is inside the target range. (increased score, movement +6, confidence moderate)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence moderate)
  - High soreness is present. (increased score, movement +12, confidence moderate)
  - Sleep disruption is present. (increased score, movement +10, confidence moderate)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence moderate)
  - Sleep disruption lowers recovery. (decreased score, movement -16, confidence moderate)
  - High soreness lowers recovery. (decreased score, movement -12, confidence moderate)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - squat was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence moderate)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - squat stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Advanced Powerlifting use goal-specific state weighting for Performance improving / fatigue high?

### Performance stagnant / fatigue low

- Scenario ID: `performance_stagnant_fatigue_low`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 50 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 73 |
| Confidence | 67 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance stagnant / fatigue low.
- Performance: stagnant; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: moderate.
- Local signals: row:inside_range:none.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - row is inside the target range. (neutral, movement 0, confidence moderate)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence moderate)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence moderate)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence moderate)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence moderate)

**momentum**

  - Performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - Good readiness supports momentum. (increased score, movement +8, confidence moderate)
  - row was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stagnant. (decreased score, movement -3, confidence moderate)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence moderate)
  - row stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Performance stagnant / fatigue low?

### Performance stagnant / fatigue high

- Scenario ID: `performance_stagnant_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 8
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 42 |
| Fatigue | 100 |
| Recovery | 0 |
| Momentum | 60 |
| Confidence | 47 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance stagnant / fatigue high.
- Performance: stagnant; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: moderate.
- Local signals: leg_press:dropoff:moderate.
- Systemic signals: high_soreness, sleep_disrupted, high_stress.

#### Score Explanations

**adaptation**

  - Performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - leg_press shows rep drop-off evidence. (decreased score, movement -8, confidence moderate)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence moderate)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)
  - High soreness is present. (increased score, movement +12, confidence moderate)
  - Sleep disruption is present. (increased score, movement +10, confidence moderate)
  - High stress is present. (increased score, movement +10, confidence moderate)
  - leg_press drop-off adds fatigue evidence. (increased score, movement +8, confidence moderate)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence moderate)
  - Athlete profile readiness is low. (decreased score, movement -10, confidence moderate)
  - Athlete profile sleep quality is poor. (decreased score, movement -10, confidence moderate)
  - Sleep disruption lowers recovery. (decreased score, movement -16, confidence moderate)
  - High soreness lowers recovery. (decreased score, movement -12, confidence moderate)

**momentum**

  - Performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)

**confidence**

  - Performance trend is stagnant. (decreased score, movement -3, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 8 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Recovery-Limited Lifter use goal-specific state weighting for Performance stagnant / fatigue high?

### Performance declining / fatigue high

- Scenario ID: `performance_declining_fatigue_high`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 9
- Confidence reason: High confidence because 9 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Fatigue | 100 |
| Recovery | 0 |
| Momentum | 24 |
| Confidence | 12 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Performance declining / fatigue high.
- Performance: declining; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: high.
- Local signals: squat:below_range:high, bench_press:below_range:moderate.
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted.

#### Score Explanations

**adaptation**

  - Performance trend is declining. (decreased score, movement -18, confidence high)
  - squat missed the prescribed range. (decreased score, movement -20, confidence high)
  - bench_press missed the prescribed range. (decreased score, movement -14, confidence high)
  - Multiple lifts are down, so current adaptation expression is less reliable. (decreased score, movement -16, confidence high)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence high)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)
  - High soreness is present. (increased score, movement +12, confidence high)
  - Sleep disruption is present. (increased score, movement +10, confidence high)
  - Multiple lifts are down. (increased score, movement +12, confidence high)
  - squat below-range evidence adds local fatigue cost. (increased score, movement +13, confidence high)
  - bench_press below-range evidence adds local fatigue cost. (increased score, movement +9, confidence high)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence high)
  - Athlete profile readiness is low. (decreased score, movement -10, confidence moderate)
  - Athlete profile sleep quality is poor. (decreased score, movement -10, confidence moderate)
  - Sleep disruption lowers recovery. (decreased score, movement -16, confidence high)
  - High soreness lowers recovery. (decreased score, movement -12, confidence high)

**momentum**

  - Performance trend is declining. (decreased score, movement -20, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - squat below-range evidence reduces momentum. (decreased score, movement -12, confidence high)
  - bench_press below-range evidence reduces momentum. (decreased score, movement -8, confidence high)

**confidence**

  - Performance trend is declining. (decreased score, movement -16, confidence high)
  - squat missed range and may reduce confidence. (decreased score, movement -13, confidence high)
  - bench_press missed range and may reduce confidence. (decreased score, movement -9, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 9 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Recovery-Limited Lifter use goal-specific state weighting for Performance declining / fatigue high?

### One local lift failing

- Scenario ID: `one_local_lift_failing`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 5
- Confidence reason: High confidence because 5 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 32 |
| Fatigue | 59 |
| Recovery | 60 |
| Momentum | 50 |
| Confidence | 42 |
| Evidence quality | 88 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: One local lift failing.
- Performance: mixed; fatigue: moderate; recovery: mixed.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:below_range:moderate.
- Systemic signals: none.

#### Score Explanations

**adaptation**

  - Performance trend is mixed. (decreased score, movement -4, confidence high)
  - bench_press missed the prescribed range. (decreased score, movement -14, confidence high)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence high)
  - bench_press below-range evidence adds local fatigue cost. (increased score, movement +9, confidence high)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)

**momentum**

  - Performance trend is mixed. (decreased score, movement -6, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - bench_press below-range evidence reduces momentum. (decreased score, movement -8, confidence high)

**confidence**

  - Performance trend is mixed. (decreased score, movement -5, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - bench_press missed range and may reduce confidence. (decreased score, movement -9, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 5 evidence items are available in the fixture. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for One local lift failing?

### Systemic fatigue across multiple lifts

- Scenario ID: `systemic_fatigue_across_multiple_lifts`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 10
- Confidence reason: High confidence because 10 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Fatigue | 100 |
| Recovery | 0 |
| Momentum | 20 |
| Confidence | 14 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Systemic fatigue across multiple lifts.
- Performance: declining; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: high.
- Local signals: squat:below_range:high, deadlift:below_range:high, bench_press:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness, sleep_disrupted.

#### Score Explanations

**adaptation**

  - Performance trend is declining. (decreased score, movement -18, confidence high)
  - squat missed the prescribed range. (decreased score, movement -20, confidence high)
  - deadlift missed the prescribed range. (decreased score, movement -20, confidence high)
  - bench_press shows rep drop-off evidence. (decreased score, movement -8, confidence high)
  - Multiple lifts are down, so current adaptation expression is less reliable. (decreased score, movement -16, confidence high)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence high)
  - High soreness is present. (increased score, movement +12, confidence high)
  - Sleep disruption is present. (increased score, movement +10, confidence high)
  - Multiple lifts are down. (increased score, movement +12, confidence high)
  - squat below-range evidence adds local fatigue cost. (increased score, movement +13, confidence high)
  - deadlift below-range evidence adds local fatigue cost. (increased score, movement +13, confidence high)
  - bench_press drop-off adds fatigue evidence. (increased score, movement +8, confidence high)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence high)
  - Sleep disruption lowers recovery. (decreased score, movement -16, confidence high)
  - High soreness lowers recovery. (decreased score, movement -12, confidence high)

**momentum**

  - Performance trend is declining. (decreased score, movement -20, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - squat below-range evidence reduces momentum. (decreased score, movement -12, confidence high)
  - deadlift below-range evidence reduces momentum. (decreased score, movement -12, confidence high)

**confidence**

  - Performance trend is declining. (decreased score, movement -16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - squat missed range and may reduce confidence. (decreased score, movement -13, confidence high)
  - deadlift missed range and may reduce confidence. (decreased score, movement -13, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 10 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Advanced Powerlifting use goal-specific state weighting for Systemic fatigue across multiple lifts?

### Missed training week

- Scenario ID: `missed_training_week`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: Low confidence because evidence is sparse or interrupted; the state should be descriptive only.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 36 |
| Fatigue | 64 |
| Recovery | 46 |
| Momentum | 2 |
| Confidence | 23 |
| Evidence quality | 34 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: Missed training week.
- Performance: mixed; fatigue: moderate; recovery: mixed.
- Continuity: missed_week; evidence quality: low.
- Local signals: all:none:none.
- Systemic signals: missed_sessions, time_constraint.

#### Score Explanations

**adaptation**

  - Performance trend is mixed. (decreased score, movement -4, confidence low)
  - A missed week reduces confidence in current adaptation expression. (decreased score, movement -10, confidence low)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence low)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence low)
  - Missed sessions reduce continuity but do not automatically mean poor recovery. (decreased score, movement -6, confidence low)

**momentum**

  - Performance trend is mixed. (decreased score, movement -6, confidence low)
  - Training continuity is missed_week. (decreased score, movement -24, confidence low)
  - Missed sessions reduce training rhythm. (decreased score, movement -12, confidence low)
  - Time constraints add adherence friction. (decreased score, movement -6, confidence low)

**confidence**

  - Performance trend is mixed. (decreased score, movement -5, confidence low)
  - Fragile adherence increases confidence risk. (decreased score, movement -8, confidence moderate)
  - A missed week can reduce training confidence. (decreased score, movement -14, confidence low)

**evidence_quality**

  - Scenario evidence quality is low. (decreased score, movement -20, confidence low)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence low)
  - A missed week makes recent performance evidence less complete. (decreased score, movement -8, confidence low)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific state weighting for Missed training week?

### Successful load progression with productive fatigue

- Scenario ID: `successful_load_progression_productive_fatigue`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: High confidence because 6 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 86 |
| Fatigue | 47 |
| Recovery | 94 |
| Momentum | 100 |
| Confidence | 94 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Successful load progression with productive fatigue.
- Performance: improving; fatigue: moderate; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: spider_curl:productive_fatigue:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - spider_curl shows successful load progression with productive fatigue. (increased score, movement +14, confidence high)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)
  - spider_curl productive fatigue adds a small expected fatigue cost. (increased score, movement +5, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - spider_curl creates a clear productive win. (increased score, movement +12, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - spider_curl is a successful progression signal. (increased score, movement +14, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Successful load progression with productive fatigue?

### Low training frequency constraint

- Scenario ID: `low_training_frequency_constraint`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 58 |
| Fatigue | 64 |
| Recovery | 52 |
| Momentum | 71 |
| Confidence | 55 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: Low training frequency constraint.
- Performance: stable; fatigue: moderate; recovery: mixed.
- Continuity: consistent; evidence quality: moderate.
- Local signals: all:inside_range:none.
- Systemic signals: low_frequency, time_constraint.

#### Score Explanations

**adaptation**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - all is inside the target range. (neutral, movement 0, confidence moderate)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence moderate)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence moderate)

**momentum**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - Time constraints add adherence friction. (decreased score, movement -6, confidence moderate)
  - all was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stable. (increased score, movement +7, confidence moderate)
  - Fragile adherence increases confidence risk. (decreased score, movement -8, confidence moderate)
  - all stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific state weighting for Low training frequency constraint?

### User reports poor readiness but performance is strong

- Scenario ID: `poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: High confidence because 7 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 92 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 95 |
| Confidence | 86 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: User reports poor readiness but performance is strong.
- Performance: improving; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:above_range:moderate, row:inside_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - bench_press is above the target range. (increased score, movement +14, confidence high)
  - row is inside the target range. (increased score, movement +6, confidence high)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - row was completed inside range. (increased score, movement +5, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - row stayed in range. (increased score, movement +6, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for User reports poor readiness but performance is strong?

### User reports feeling great but performance is declining

- Scenario ID: `feels_great_performance_declining`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: High confidence because 7 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Fatigue | 100 |
| Recovery | 26 |
| Momentum | 32 |
| Confidence | 27 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: User reports feeling great but performance is declining.
- Performance: declining; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: high.
- Local signals: squat:below_range:high, deadlift:dropoff:moderate.
- Systemic signals: multiple_lifts_down.

#### Score Explanations

**adaptation**

  - Performance trend is declining. (decreased score, movement -18, confidence high)
  - squat missed the prescribed range. (decreased score, movement -20, confidence high)
  - deadlift shows rep drop-off evidence. (decreased score, movement -8, confidence high)
  - Multiple lifts are down, so current adaptation expression is less reliable. (decreased score, movement -16, confidence high)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence high)
  - Multiple lifts are down. (increased score, movement +12, confidence high)
  - squat below-range evidence adds local fatigue cost. (increased score, movement +13, confidence high)
  - deadlift drop-off adds fatigue evidence. (increased score, movement +8, confidence high)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence high)

**momentum**

  - Performance trend is declining. (decreased score, movement -20, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - squat below-range evidence reduces momentum. (decreased score, movement -12, confidence high)

**confidence**

  - Performance trend is declining. (decreased score, movement -16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - squat missed range and may reduce confidence. (decreased score, movement -13, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Advanced Powerlifting use goal-specific state weighting for User reports feeling great but performance is declining?

### User reports high stress but objective data is stable

- Scenario ID: `high_stress_objective_stable`
- Athlete: Busy Parent / Time-Constrained Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 64 |
| Fatigue | 64 |
| Recovery | 52 |
| Momentum | 71 |
| Confidence | 55 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Busy Parent / Time-Constrained Lifter.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 3 days/week.
- Scenario: User reports high stress but objective data is stable.
- Performance: stable; fatigue: moderate; recovery: mixed.
- Continuity: consistent; evidence quality: moderate.
- Local signals: leg_press:inside_range:low.
- Systemic signals: time_constraint.

#### Score Explanations

**adaptation**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - leg_press is inside the target range. (increased score, movement +6, confidence moderate)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence moderate)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence moderate)

**momentum**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - Time constraints add adherence friction. (decreased score, movement -6, confidence moderate)
  - leg_press was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stable. (increased score, movement +7, confidence moderate)
  - Fragile adherence increases confidence risk. (decreased score, movement -8, confidence moderate)
  - leg_press stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Busy Parent / Time-Constrained Lifter use goal-specific state weighting for User reports high stress but objective data is stable?

### User reports low motivation but completed sessions are consistent

- Scenario ID: `low_motivation_consistent_sessions`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 64 |
| Fatigue | 20 |
| Recovery | 86 |
| Momentum | 85 |
| Confidence | 67 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: User reports low motivation but completed sessions are consistent.
- Performance: stable; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: moderate.
- Local signals: machine_chest_press:inside_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - machine_chest_press is inside the target range. (increased score, movement +6, confidence moderate)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence moderate)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence moderate)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence moderate)

**momentum**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - Good readiness supports momentum. (increased score, movement +8, confidence moderate)
  - machine_chest_press was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stable. (increased score, movement +7, confidence moderate)
  - Beginner status means confidence is more sensitive to unclear feedback. (decreased score, movement -4, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence moderate)
  - machine_chest_press stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Beginner Hypertrophy use goal-specific state weighting for User reports low motivation but completed sessions are consistent?

### Severe pain/safety flag with otherwise stable training

- Scenario ID: `severe_pain_safety_flag`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 64 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 85 |
| Confidence | 77 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Severe pain/safety flag with otherwise stable training.
- Performance: stable; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: moderate.
- Local signals: squat:inside_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - squat is inside the target range. (increased score, movement +6, confidence moderate)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence moderate)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence moderate)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence moderate)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence moderate)

**momentum**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)
  - Good readiness supports momentum. (increased score, movement +8, confidence moderate)
  - squat was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stable. (increased score, movement +7, confidence moderate)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence moderate)
  - squat stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Severe pain/safety flag with otherwise stable training?

### Strong performance with no safety concern

- Scenario ID: `safety_clear_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 7
- Confidence reason: High confidence because 7 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 86 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 95 |
| Confidence | 86 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Strong performance with no safety concern.
- Performance: improving; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:inside_range:low, row:above_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - bench_press is inside the target range. (increased score, movement +6, confidence high)
  - row is above the target range. (increased score, movement +8, confidence high)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - bench_press was completed inside range. (increased score, movement +5, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - bench_press stayed in range. (increased score, movement +6, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 7 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Strong performance with no safety concern?

### Poor readiness but strong performance

- Scenario ID: `safety_poor_readiness_strong_performance`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: High confidence because 6 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 86 |
| Fatigue | 20 |
| Recovery | 94 |
| Momentum | 90 |
| Confidence | 80 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Poor readiness but strong performance.
- Performance: improving; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:above_range:moderate.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - bench_press is above the target range. (increased score, movement +14, confidence high)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Poor readiness but strong performance?

### Severe pain flag despite strong performance

- Scenario ID: `safety_severe_pain_strong_performance`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: High confidence because 6 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 78 |
| Fatigue | 20 |
| Recovery | 86 |
| Momentum | 95 |
| Confidence | 86 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Severe pain flag despite strong performance.
- Performance: improving; fatigue: low; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: deadlift:inside_range:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - deadlift is inside the target range. (increased score, movement +6, confidence high)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - deadlift was completed inside range. (increased score, movement +5, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - deadlift stayed in range. (increased score, movement +6, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Advanced Powerlifting use goal-specific state weighting for Severe pain flag despite strong performance?

### Repeated same-load collapse

- Scenario ID: `safety_repeated_same_load_collapse`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 8
- Confidence reason: High confidence because 8 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 8 |
| Fatigue | 100 |
| Recovery | 0 |
| Momentum | 44 |
| Confidence | 34 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Repeated same-load collapse.
- Performance: declining; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: high.
- Local signals: squat:same_load_collapse:high, leg_press:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness.

#### Score Explanations

**adaptation**

  - Performance trend is declining. (decreased score, movement -18, confidence high)
  - leg_press shows rep drop-off evidence. (decreased score, movement -8, confidence high)
  - Multiple lifts are down, so current adaptation expression is less reliable. (decreased score, movement -16, confidence high)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence high)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)
  - High soreness is present. (increased score, movement +12, confidence high)
  - Multiple lifts are down. (increased score, movement +12, confidence high)
  - leg_press drop-off adds fatigue evidence. (increased score, movement +8, confidence high)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence high)
  - Athlete profile readiness is low. (decreased score, movement -10, confidence moderate)
  - Athlete profile sleep quality is poor. (decreased score, movement -10, confidence moderate)
  - High soreness lowers recovery. (decreased score, movement -12, confidence high)

**momentum**

  - Performance trend is declining. (decreased score, movement -20, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)

**confidence**

  - Performance trend is declining. (decreased score, movement -16, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 8 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Recovery-Limited Lifter use goal-specific state weighting for Repeated same-load collapse?

### Local exercise failure below range

- Scenario ID: `safety_local_below_range_failure`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 5
- Confidence reason: High confidence because 5 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 32 |
| Fatigue | 59 |
| Recovery | 60 |
| Momentum | 50 |
| Confidence | 42 |
| Evidence quality | 88 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Local exercise failure below range.
- Performance: mixed; fatigue: moderate; recovery: mixed.
- Continuity: consistent; evidence quality: high.
- Local signals: bench_press:below_range:moderate.
- Systemic signals: none.

#### Score Explanations

**adaptation**

  - Performance trend is mixed. (decreased score, movement -4, confidence high)
  - bench_press missed the prescribed range. (decreased score, movement -14, confidence high)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence high)
  - bench_press below-range evidence adds local fatigue cost. (increased score, movement +9, confidence high)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)

**momentum**

  - Performance trend is mixed. (decreased score, movement -6, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - bench_press below-range evidence reduces momentum. (decreased score, movement -8, confidence high)

**confidence**

  - Performance trend is mixed. (decreased score, movement -5, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - bench_press missed range and may reduce confidence. (decreased score, movement -9, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 5 evidence items are available in the fixture. (increased score, movement +10, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Local exercise failure below range?

### Sharp pain on squat pattern

- Scenario ID: `safety_sharp_pain_squat`
- Athlete: Advanced Powerlifting
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 5
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 46 |
| Fatigue | 50 |
| Recovery | 52 |
| Momentum | 72 |
| Confidence | 55 |
| Evidence quality | 65 |

#### Evidence Summary

- Athlete: Advanced Powerlifting.
- Goal: powerlifting; training age: advanced; schedule: 5 days/week.
- Scenario: Sharp pain on squat pattern.
- Performance: stable; fatigue: moderate; recovery: mixed.
- Continuity: consistent; evidence quality: moderate.
- Local signals: squat:technique_limit:moderate.
- Systemic signals: none.

#### Score Explanations

**adaptation**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - squat has technique-limited evidence. (decreased score, movement -12, confidence moderate)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence moderate)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence moderate)

**momentum**

  - Performance trend is stable. (increased score, movement +8, confidence moderate)
  - Training continuity is consistent. (increased score, movement +14, confidence moderate)

**confidence**

  - Performance trend is stable. (increased score, movement +7, confidence moderate)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - squat technique limitation may reduce confidence. (decreased score, movement -8, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 5 evidence items are available in the fixture. (increased score, movement +10, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Advanced Powerlifting use goal-specific state weighting for Sharp pain on squat pattern?

### Worsening pain over multiple sessions

- Scenario ID: `safety_worsening_pain_multiple_sessions`
- Athlete: Recovery-Limited Lifter
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 8
- Confidence reason: High confidence because 8 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 0 |
| Fatigue | 100 |
| Recovery | 0 |
| Momentum | 36 |
| Confidence | 25 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Recovery-Limited Lifter.
- Goal: hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Worsening pain over multiple sessions.
- Performance: declining; fatigue: high; recovery: poor.
- Continuity: consistent; evidence quality: high.
- Local signals: deadlift:below_range:moderate, barbell_row:dropoff:moderate.
- Systemic signals: multiple_lifts_down, high_soreness.

#### Score Explanations

**adaptation**

  - Performance trend is declining. (decreased score, movement -18, confidence high)
  - deadlift missed the prescribed range. (decreased score, movement -14, confidence high)
  - barbell_row shows rep drop-off evidence. (decreased score, movement -8, confidence high)
  - Multiple lifts are down, so current adaptation expression is less reliable. (decreased score, movement -16, confidence high)

**fatigue**

  - Fatigue state is high. (increased score, movement +24, confidence high)
  - Athlete profile has a rising fatigue trend. (increased score, movement +8, confidence moderate)
  - Athlete profile includes high life stress. (increased score, movement +6, confidence moderate)
  - High soreness is present. (increased score, movement +12, confidence high)
  - Multiple lifts are down. (increased score, movement +12, confidence high)
  - deadlift below-range evidence adds local fatigue cost. (increased score, movement +9, confidence high)
  - barbell_row drop-off adds fatigue evidence. (increased score, movement +8, confidence high)

**recovery**

  - Recovery state is poor. (decreased score, movement -24, confidence high)
  - Athlete profile readiness is low. (decreased score, movement -10, confidence moderate)
  - Athlete profile sleep quality is poor. (decreased score, movement -10, confidence moderate)
  - High soreness lowers recovery. (decreased score, movement -12, confidence high)

**momentum**

  - Performance trend is declining. (decreased score, movement -20, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - deadlift below-range evidence reduces momentum. (decreased score, movement -8, confidence high)

**confidence**

  - Performance trend is declining. (decreased score, movement -16, confidence high)
  - deadlift missed range and may reduce confidence. (decreased score, movement -9, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 8 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Recovery-Limited Lifter use goal-specific state weighting for Worsening pain over multiple sessions?

### Productive fatigue from load progression inside range

- Scenario ID: `safety_productive_fatigue_progression`
- Athlete: Intermediate Strength/Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: High confidence because 6 scenario evidence items are available and the fixture marks evidence quality as high.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 86 |
| Fatigue | 47 |
| Recovery | 94 |
| Momentum | 100 |
| Confidence | 94 |
| Evidence quality | 90 |

#### Evidence Summary

- Athlete: Intermediate Strength/Hypertrophy.
- Goal: strength_hypertrophy; training age: intermediate; schedule: 4 days/week.
- Scenario: Productive fatigue from load progression inside range.
- Performance: improving; fatigue: moderate; recovery: good.
- Continuity: consistent; evidence quality: high.
- Local signals: spider_curl:productive_fatigue:low.
- Systemic signals: good_readiness.

#### Score Explanations

**adaptation**

  - Performance trend is improving. (increased score, movement +22, confidence high)
  - spider_curl shows successful load progression with productive fatigue. (increased score, movement +14, confidence high)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence high)
  - Good readiness lowers current fatigue concern. (decreased score, movement -8, confidence high)
  - spider_curl productive fatigue adds a small expected fatigue cost. (increased score, movement +5, confidence high)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence high)
  - Athlete profile readiness is high. (increased score, movement +8, confidence moderate)
  - Good readiness is present. (increased score, movement +14, confidence high)

**momentum**

  - Performance trend is improving. (increased score, movement +18, confidence high)
  - Training continuity is consistent. (increased score, movement +14, confidence high)
  - Good readiness supports momentum. (increased score, movement +8, confidence high)
  - spider_curl creates a clear productive win. (increased score, movement +12, confidence high)

**confidence**

  - Performance trend is improving. (increased score, movement +16, confidence high)
  - Strong adherence history supports confidence. (increased score, movement +6, confidence moderate)
  - Good readiness supports confidence. (increased score, movement +8, confidence high)
  - spider_curl is a successful progression signal. (increased score, movement +14, confidence high)

**evidence_quality**

  - Scenario evidence quality is high. (increased score, movement +28, confidence high)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence high)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Intermediate Strength/Hypertrophy use goal-specific state weighting for Productive fatigue from load progression inside range?

### Low evidence new athlete

- Scenario ID: `decision_low_evidence_new_athlete`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 5
- Confidence reason: Low confidence because evidence is sparse or interrupted; the state should be descriptive only.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 46 |
| Fatigue | 50 |
| Recovery | 52 |
| Momentum | 36 |
| Confidence | 41 |
| Evidence quality | 40 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: Low evidence new athlete.
- Performance: mixed; fatigue: moderate; recovery: mixed.
- Continuity: interrupted; evidence quality: low.
- Local signals: all:none:none.
- Systemic signals: none.

#### Score Explanations

**adaptation**

  - Performance trend is mixed. (decreased score, movement -4, confidence low)

**fatigue**

  - Fatigue state is moderate. (neutral, movement 0, confidence low)

**recovery**

  - Recovery state is mixed. (increased score, movement +2, confidence low)

**momentum**

  - Performance trend is mixed. (decreased score, movement -6, confidence low)
  - Training continuity is interrupted. (decreased score, movement -8, confidence low)

**confidence**

  - Performance trend is mixed. (decreased score, movement -5, confidence low)
  - Beginner status means confidence is more sensitive to unclear feedback. (decreased score, movement -4, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is low. (decreased score, movement -20, confidence low)
  - 5 evidence items are available in the fixture. (increased score, movement +10, confidence low)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Beginner Hypertrophy use goal-specific state weighting for Low evidence new athlete?

### Momentum low but recovery good

- Scenario ID: `decision_momentum_low_recovery_good`
- Athlete: Beginner Hypertrophy
- Last updated: 2026-06-27T19:05:57.189Z
- Evidence count: 6
- Confidence reason: Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | 50 |
| Fatigue | 28 |
| Recovery | 66 |
| Momentum | 31 |
| Confidence | 49 |
| Evidence quality | 67 |

#### Evidence Summary

- Athlete: Beginner Hypertrophy.
- Goal: hypertrophy; training age: beginner; schedule: 3 days/week.
- Scenario: Momentum low but recovery good.
- Performance: stagnant; fatigue: low; recovery: good.
- Continuity: interrupted; evidence quality: moderate.
- Local signals: machine_chest_press:inside_range:none.
- Systemic signals: missed_sessions.

#### Score Explanations

**adaptation**

  - Performance trend is stagnant. (neutral, movement 0, confidence moderate)
  - machine_chest_press is inside the target range. (neutral, movement 0, confidence moderate)

**fatigue**

  - Fatigue state is low. (decreased score, movement -22, confidence moderate)

**recovery**

  - Recovery state is good. (increased score, movement +22, confidence moderate)
  - Missed sessions reduce continuity but do not automatically mean poor recovery. (decreased score, movement -6, confidence moderate)

**momentum**

  - Performance trend is stagnant. (decreased score, movement -4, confidence moderate)
  - Training continuity is interrupted. (decreased score, movement -8, confidence moderate)
  - Missed sessions reduce training rhythm. (decreased score, movement -12, confidence moderate)
  - machine_chest_press was completed inside range. (increased score, movement +5, confidence moderate)

**confidence**

  - Performance trend is stagnant. (decreased score, movement -3, confidence moderate)
  - Beginner status means confidence is more sensitive to unclear feedback. (decreased score, movement -4, confidence moderate)
  - machine_chest_press stayed in range. (increased score, movement +6, confidence moderate)

**evidence_quality**

  - Scenario evidence quality is moderate. (increased score, movement +5, confidence moderate)
  - 6 evidence items are available in the fixture. (increased score, movement +12, confidence moderate)

#### Open Questions

- Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?
- Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?
- Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?
- Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?
- Research question: should Beginner Hypertrophy use goal-specific state weighting for Momentum low but recovery good?


## Global Open Questions

1. Should fatigue remain higher-is-worse while the other fields are higher-is-better?
2. Should evidence quality be a score, a confidence label, or both?
3. What minimum real workout history is required before athlete state should influence production coaching?
4. How should recovery weeks be represented: as an input, a state modifier, or both?
5. Should confidence mean athlete belief, model confidence, or should those be separated permanently?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- Workout generation was not modified.
- Progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
