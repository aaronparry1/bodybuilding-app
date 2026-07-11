# Simulation v0.1 Report

Generated: 2026-06-28T16:47:30.648Z

## Scope

Simulation v0.1 runs five research athlete profiles over twelve synthetic weeks. Each week generates:

- Coaching State
- Safety Gate
- Decision Recommendation
- Goal Progress

This is not production logic and does not modify V1.

## Goal Metrics Defined

- Strength: Competition Squat, Competition Bench Press, and Competition Deadlift are primary. Standing Overhead Press / Military Press and Bent Over Row are secondary.
- Build Muscle: primary progress is quality work volume and quality target-muscle sets, not scale weight.
- Build Muscle + Strength: combines strength and quality-volume evidence.
- Get Lean: body fat percentage is primary when supplied; missing body-fat data keeps body-composition confidence low.
- Athletic Performance: combines compound strength with programmed power/dynamic work; no bar-speed claims without sensors.
- Maintenance / General Fitness: stable quality work, consistency, recovery, and retained strength can be success.

## Simulation Profiles

- Beginner Hypertrophy: build_muscle (Beginner hypertrophy: normal wave progress)
- Intermediate Strength/Hypertrophy: build_muscle_strength (Intermediate hybrid: smooth progress with local stall)
- Advanced Powerlifting: strength (Advanced powerlifting: systemic fatigue and recovery week)
- Busy Parent / Time-Constrained Lifter: get_lean (Busy parent: missed week and low body-composition confidence)
- Recovery-Limited Lifter: athletic_performance (Recovery-limited lifter: productive load progression with conservative recovery)

## Summary Results

### Beginner Hypertrophy

- Goal: `build_muscle`
- Week 1 progress: 95 / improving / confidence 63
- Week 12 progress: 98 / improving / confidence 99
- Recommendation distribution: hold 6, consolidate 2, reduce 1, recover 1, push 2
- Final primary metric summary: Quality volume trend is improving; target-range completion 82%; junk volume 4%.

### Intermediate Strength/Hypertrophy

- Goal: `build_muscle_strength`
- Week 1 progress: 76 / improving / confidence 63
- Week 12 progress: 91 / improving / confidence 99
- Recommendation distribution: hold 6, consolidate 2, reduce 1, recover 1, push 2
- Final primary metric summary: Strength: Competition lift trend score 83 from 3 primary lift(s). Muscle: Quality volume trend is improving; target-range completion 82%; junk volume 4%.

### Advanced Powerlifting

- Goal: `strength`
- Week 1 progress: 59 / stable / confidence 63
- Week 12 progress: 85 / improving / confidence 100
- Recommendation distribution: hold 5, consolidate 2, reduce 1, recover 1, push 3
- Final primary metric summary: Competition lift trend score 83 from 3 primary lift(s).

### Busy Parent / Time-Constrained Lifter

- Goal: `get_lean`
- Week 1 progress: 60 / stable / confidence 42
- Week 12 progress: 60 / stable / confidence 42
- Recommendation distribution: hold 8, consolidate 2, reduce 1, recover 1
- Final primary metric summary: No body-fat trend supplied; progress can only be judged from retention and consistency.

### Recovery-Limited Lifter

- Goal: `athletic_performance`
- Week 1 progress: 58 / stable / confidence 63
- Week 12 progress: 81 / improving / confidence 66
- Recommendation distribution: hold 5, consolidate 3, reduce 1, recover 1, push 2
- Final primary metric summary: Dynamic performance score 74 from 2 programmed power/dynamic metric(s).


## Examples Of Progress Scoring

### Beginner Hypertrophy

- Week 1: progress 95 (improving, confidence 63); recommendation `hold`; safety `clear`.
- Week 4: progress 98 (improving, confidence 95); recommendation `consolidate`; safety `clear`.
- Week 8: progress 17 (declining, confidence 95); recommendation `recover`; safety `restrict`.
- Week 9: progress 97 (improving, confidence 84); recommendation `consolidate`; safety `clear`.
- Week 12: progress 98 (improving, confidence 99); recommendation `push`; safety `clear`.

### Intermediate Strength/Hypertrophy

- Week 1: progress 76 (improving, confidence 63); recommendation `hold`; safety `clear`.
- Week 4: progress 91 (improving, confidence 95); recommendation `consolidate`; safety `clear`.
- Week 8: progress 13 (declining, confidence 95); recommendation `recover`; safety `restrict`.
- Week 9: progress 77 (improving, confidence 87); recommendation `consolidate`; safety `clear`.
- Week 12: progress 91 (improving, confidence 99); recommendation `push`; safety `clear`.

### Advanced Powerlifting

- Week 1: progress 59 (stable, confidence 63); recommendation `hold`; safety `clear`.
- Week 4: progress 85 (improving, confidence 97); recommendation `consolidate`; safety `clear`.
- Week 8: progress 22 (declining, confidence 97); recommendation `recover`; safety `restrict`.
- Week 9: progress 61 (improving, confidence 87); recommendation `consolidate`; safety `clear`.
- Week 12: progress 85 (improving, confidence 100); recommendation `push`; safety `clear`.

### Busy Parent / Time-Constrained Lifter

- Week 1: progress 60 (stable, confidence 42); recommendation `hold`; safety `clear`.
- Week 4: progress 60 (stable, confidence 42); recommendation `consolidate`; safety `clear`.
- Week 8: progress 44 (declining, confidence 42); recommendation `recover`; safety `restrict`.
- Week 9: progress 60 (improving, confidence 42); recommendation `consolidate`; safety `clear`.
- Week 12: progress 60 (stable, confidence 42); recommendation `hold`; safety `clear`.

### Recovery-Limited Lifter

- Week 1: progress 58 (stable, confidence 63); recommendation `hold`; safety `clear`.
- Week 4: progress 78 (improving, confidence 66); recommendation `consolidate`; safety `clear`.
- Week 8: progress 26 (declining, confidence 66); recommendation `recover`; safety `restrict`.
- Week 9: progress 63 (improving, confidence 66); recommendation `consolidate`; safety `clear`.
- Week 12: progress 81 (improving, confidence 66); recommendation `push`; safety `clear`.


## Failures / Weird Decisions

- Busy Parent / Time-Constrained Lifter week 8: recover with low progress confidence (42).

## Unrealistic Assumptions

- Weekly evidence is synthetic and simplified.
- Goal progress metrics use transparent heuristic weights, not validated production coefficients.
- Body-composition data is mocked or absent; Get Lean cannot claim fat loss without user-supplied body-fat data.
- Athletic performance lacks real jump, sprint, throw, bar-speed, or timing data.
- Simulation does not yet model annual training, injury history, exact exercise prescriptions, or user behaviour after recommendations.

## Open Aaron Decisions

1. Should Strength progress require all three competition lifts to be stable/improving, or can two of three be enough?
2. Should Build Muscle quality volume be scored by muscle group before total volume?
3. Should Get Lean prompt for body-fat/waist data, or keep body-composition confidence low by default?
4. Should Athletic Performance remain a lower-confidence goal until explicit power metrics are added?
5. What minimum simulation pass criteria should exist before any V2 production prototype?

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
