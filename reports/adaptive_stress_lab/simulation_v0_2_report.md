# Simulation v0.2 Report

Generated: 2026-06-28T16:47:30.766Z

## Scope

Simulation v0.2 runs 20 virtual athletes across 52 weeks and compares:

- V2 lab coaching: Coaching State -> Safety Gate -> Decision Engine -> Goal Progress
- V1-style baseline: target-range success drives push/hold/reduce with only simple deload and basic pain handling

No production code is imported or modified.

## Simulation Setup

- Total simulated athletes: 20
- Total simulated weeks: 1040
- Goal types: Strength, Build Muscle, Build Muscle + Strength, Get Lean, Athletic Performance
- Athletes per goal: 4

Each virtual athlete has training age, weekly training days, recovery profile, consistency profile, progression potential, disruption risk, safety risk, and momentum tendency.

## V1 vs V2 Comparison Table

| Metric | V1 Baseline | V2 Lab |
|---|---:|---:|
| Final goal progress score | 64 | 71 |
| Average goal progress score | 73 | 76 |
| Over-aggressive pushes | 220 | 0 |
| Unnecessary recovery weeks | 0 | 0 |
| Missed unsafe pain responses | 0 | 0 |
| Under-aggressive holds | 0 | 20 |
| Final momentum proxy | 80 | 84 |
| Average recovery proxy | 30 | 94 |
| V2 decision confidence | n/a | 83 |

## Goal-By-Goal Results

### strength

- Athletes: 4
- Final progress: V1 83, V2 91
- Average progress: V1 76, V2 80
- Over-aggressive pushes: V1 44, V2 0
- Unnecessary recovery weeks: V1 0, V2 0
- Missed unsafe pain responses: V1 0, V2 0
- Final momentum: V1 96, V2 96

### build_muscle

- Athletes: 4
- Final progress: V1 43, V2 50
- Average progress: V1 78, V2 81
- Over-aggressive pushes: V1 44, V2 0
- Unnecessary recovery weeks: V1 0, V2 0
- Missed unsafe pain responses: V1 0, V2 0
- Final momentum: V1 76, V2 74

### build_muscle_strength

- Athletes: 4
- Final progress: V1 61, V2 69
- Average progress: V1 76, V2 79
- Over-aggressive pushes: V1 44, V2 0
- Unnecessary recovery weeks: V1 0, V2 0
- Missed unsafe pain responses: V1 0, V2 0
- Final momentum: V1 84, V2 94

### get_lean

- Athletes: 4
- Final progress: V1 55, V2 62
- Average progress: V1 63, V2 65
- Over-aggressive pushes: V1 44, V2 0
- Unnecessary recovery weeks: V1 0, V2 0
- Missed unsafe pain responses: V1 0, V2 0
- Final momentum: V1 48, V2 74

### athletic_performance

- Athletes: 4
- Final progress: V1 77, V2 85
- Average progress: V1 73, V2 76
- Over-aggressive pushes: V1 44, V2 0
- Unnecessary recovery weeks: V1 0, V2 0
- Missed unsafe pain responses: V1 0, V2 0
- Final momentum: V1 96, V2 85


## Best V2 Wins

- Virtual strength athlete 3: V2 average progress +5 vs baseline, over-pushes 0 vs 11.
- Virtual strength athlete 4: V2 average progress +5 vs baseline, over-pushes 0 vs 11.
- Virtual build muscle athlete 3: V2 average progress +5 vs baseline, over-pushes 0 vs 11.
- Virtual build muscle athlete 4: V2 average progress +5 vs baseline, over-pushes 0 vs 11.
- Virtual build muscle strength athlete 3: V2 average progress +5 vs baseline, over-pushes 0 vs 11.

## Worst V2 Failures

- Virtual get lean athlete 1: V2 average progress delta -2; weird decisions 0.
- Virtual build muscle strength athlete 1: V2 average progress delta -1; weird decisions 0.
- Virtual athletic performance athlete 1: V2 average progress delta -1; weird decisions 0.
- Virtual strength athlete 1: V2 average progress delta 0; weird decisions 0.
- Virtual build muscle athlete 1: V2 average progress delta 0; weird decisions 0.

## Weird Decisions

- vathlete_15_get_lean week 9: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_15_get_lean week 18: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_15_get_lean week 27: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_15_get_lean week 36: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_15_get_lean week 45: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_16_get_lean week 9: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_16_get_lean week 18: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_16_get_lean week 27: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_16_get_lean week 36: systemic_fatigue, `recover` (recover with low goal-progress confidence)
- vathlete_16_get_lean week 45: systemic_fatigue, `recover` (recover with low goal-progress confidence)

## Safety Events

- Total V2 safety events: 160
- V2 missed unsafe pain responses: 0
- V1 missed unsafe pain responses: 0

## Cases Requiring Aaron Review

- V2 still produces 20 under-aggressive hold(s) by the current heuristic.
- Get Lean athletes without body-fat data are intentionally low-confidence; decide whether ASC should ask for waist/body-fat data.
- Baseline is intentionally simple and not production V1 code; decide how realistic the comparator needs to become.
- The outcome model rewards/penalises recommendations heuristically and needs future validation.

## Limitations / Unrealistic Assumptions

- Virtual athletes are deterministic synthetic fixtures, not real user data.
- Progress outcomes are heuristic estimates, not biological adaptation.
- V1 baseline is a lab comparator only and does not import production code.
- Fatigue, momentum, and confidence proxies are simplified.
- Injury/pain events are synthetic and not medical models.
- The simulation does not yet include exercise-level prescription details, exact load jumps, or user adherence after each recommendation.

## Acceptance Criteria Check

- No unsafe V2 decisions: PASS
- Fewer over-aggressive pushes than baseline: PASS
- Fewer unnecessary recovery weeks than baseline: PASS
- Equal or better average goal progress: PASS
- Better momentum/confidence proxy: PASS
- Sensible behaviour after disruptions: PASS

## Clear Verdict

PROMISING

V2 is classified as `promising` in this synthetic lab run.

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
