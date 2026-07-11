# Training Days / Weekly Stimulus Distribution Audit

Date: June 27, 2026  
Scope: Track A production audit only. No app code, workout generation, progression, or subscription logic changed.

## Executive Summary

The current generator changes the **weekly split sequence** when training days change, but it does not materially scale the **per-session stimulus** by weekly frequency.

In the audited profile, every plan from 2 to 6 days/week averaged roughly **6 exercises per session** and **23-29 recommended max working sets per session**. As a result, weekly volume scales mostly by multiplying similar session templates:

| Days/week | Default split | Weekly exercises | Recommended max working sets/week | Avg max sets/session |
|---:|---|---:|---:|---:|
| 2 | Full Body / Full Body | 12 | 52 | 26.0 |
| 3 | Full Body / Full Body / Full Body | 18 | 78 | 26.0 |
| 4 | Upper / Lower / Upper / Lower | 24 | 106 | 26.5 |
| 5 | Push / Pull / Legs / Upper / Lower | 30 | 131 | 26.2 |
| 6 | Push / Pull / Legs / Push / Pull / Legs | 36 | 156 | 26.0 |

Verdict: the generator currently preserves **per-session template size**, not weekly stimulus, session-length guardrails, or muscle-group target ranges. The 3-day plan does become full-body, which is directionally right, but it is not built from a weekly stimulus budget. The 6-day plan can become very high volume because the same per-session dose is repeated more often.

Recommended v1 fix: add a small frequency-aware weekly stimulus layer before exercise selection. It should set target weekly set ranges, max exercises/session, max working sets/session, and split-specific allocation rules, then pass that context into planned exercise selection. Do not rewrite the whole generator.

## Audit Method

I generated comparison fixtures from the current production generator using the same profile, changing only `daysPerWeek`.

Constant profile:

- Goal: Build Muscle & Strength
- Planning choice: Recommended 12-month plan
- Experience: Intermediate
- Equipment: Full gym
- Preferred split: Let app choose
- Block: Hypertrophy, week 1
- History: none
- Unit/equipment jumps: default production values

Metrics are generated from `buildPlannedWorkoutProgramme` for each session in `weeklySplitForPlan`.

Estimated weekly sets by muscle group count the recommended max working sets assigned to each exercise's primary muscles. This is useful for spotting distribution problems, but it is not a perfect physiological hypertrophy dose because compound lifts train secondary muscles too.

## Current Architecture

### Split Selection

`weeklySplitForPlan` clamps the requested days and chooses a split:

- `<= 3 days`: Full Body
- `4 days`: Upper / Lower
- `5+ days`: Push / Pull / Legs

Relevant source:

- `src/domain/training/plan-setup.ts`
  - `weeklySplitForPlan`
  - `defaultSplit`
  - `workoutSequenceForSplit`

### Session Generation

Each planned session is generated independently:

- `buildPlannedWorkoutProgramme` resolves the current session name.
- It calls `generateWorkoutByFocus` for that one session.
- `selectPlannedExercisesForWeek` also calls `generateWorkoutByFocus`.
- `daysPerWeek` is not passed into the session generator as a weekly volume constraint.
- Generated programmes are one-day programmes with `daysPerWeek: 1`.

Relevant source:

- `src/domain/training/planned-workout.ts`
- `src/domain/training/exercise-selection.ts`
- `src/domain/training/ad-hoc-workout-generator.ts`

### What The Generator Keeps Constant

The generator mainly keeps these stable:

- Exercise count per session
- Template role structure per workout type
- Set prescription by training lane/block/exercise role
- Default split family by weekly days

It does not currently keep these stable:

- Weekly working sets
- Weekly sets by muscle group
- Weekly movement-pattern exposure
- Main lift frequency as a deliberately budgeted variable
- Session length across low-frequency vs high-frequency plans
- Weekly recoverability target

## Current Behaviour By Frequency

### 2 Days / Week

Split: Full Body / Full Body

Weekly output:

- Weekly exercises: 12
- Required working sets: 30
- Recommended max working sets: 52
- Average exercises/session: 6.0
- Average max sets/session: 26.0
- Primary compounds/week: 6

Estimated primary-muscle set exposure:

- Back: 18
- Chest: 10
- Quads: 10
- Glutes: 8
- Hamstrings: 8
- Shoulders: 8
- Abs: 6

Sessions:

- Full Body: Hack Squat, Bench Press, Barbell Row, Deficit Deadlift, Machine Shoulder Press, Front Plank
- Full Body: Hack Squat, Bench Press, Barbell Row, Pause Deadlift, Plate Loaded Shoulder Press Machine, Front Plank

Assessment: the plan is coherent and efficient, but weekly stimulus is likely low for intermediate hypertrophy/strength goals unless the user is time-constrained or recovering poorly. It also gives limited direct arm/calves/rear-delt work.

### 3 Days / Week

Split: Full Body / Full Body / Full Body

Weekly output:

- Weekly exercises: 18
- Required working sets: 45
- Recommended max working sets: 78
- Average exercises/session: 6.0
- Average max sets/session: 26.0
- Primary compounds/week: 9

Estimated primary-muscle set exposure:

- Back: 27
- Chest: 15
- Quads: 15
- Glutes: 12
- Hamstrings: 12
- Shoulders: 12
- Abs: 9

Sessions:

- Full Body: Hack Squat, Bench Press, Barbell Row, Deficit Deadlift, Machine Shoulder Press, Front Plank
- Full Body: Hack Squat, Bench Press, Barbell Row, Pause Deadlift, Plate Loaded Shoulder Press Machine, Front Plank
- Full Body: Hack Squat, Bench Press, Barbell Row, Snatch-Grip Deadlift, Smith Shoulder Press, Front Plank

Assessment: full-body selection is appropriate for 3 days/week, but the plan mostly repeats the same six-exercise structure. It does not add much targeted assistance to compensate for lower weekly frequency. It meaningfully redistributes movement frequency, but not enough variety or direct local stimulus for a premium strength-and-physique plan.

### 4 Days / Week

Split: Upper / Lower / Upper / Lower

Weekly output:

- Weekly exercises: 24
- Required working sets: 54
- Recommended max working sets: 106
- Average exercises/session: 6.0
- Average max sets/session: 26.5
- Primary compounds/week: 6

Estimated primary-muscle set exposure:

- Back: 26
- Glutes: 16
- Hamstrings: 16
- Quads: 14
- Biceps: 10
- Calves: 10
- Chest: 10
- Triceps: 10
- Shoulders: 8
- Abs: 6
- Forearms: 5

Assessment: this is the strongest current frequency shape. Upper/lower gives better accessory coverage than 3-day while keeping sessions similar in size. It still inherits the lack of a formal weekly set target.

### 5 Days / Week

Split: Push / Pull / Legs / Upper / Lower

Weekly output:

- Weekly exercises: 30
- Required working sets: 66
- Recommended max working sets: 131
- Average exercises/session: 6.0
- Average max sets/session: 26.2
- Primary compounds/week: 6

Estimated primary-muscle set exposure:

- Back: 22
- Chest: 18
- Glutes: 16
- Hamstrings: 16
- Quads: 14
- Shoulders: 12
- Biceps: 10
- Calves: 10
- Triceps: 10
- Abs: 6
- Forearms: 5
- Rear delts: 5

Assessment: the mixed PPL plus upper/lower structure is plausible. Weekly volume is high but not automatically broken for an intermediate lifter. However, the system gets there accidentally through repeated session templates, not through a weekly stimulus model.

### 6 Days / Week

Split: Push / Pull / Legs / Push / Pull / Legs

Weekly output:

- Weekly exercises: 36
- Required working sets: 78
- Recommended max working sets: 156
- Average exercises/session: 6.0
- Average max sets/session: 26.0
- Primary compounds/week: 6

Estimated primary-muscle set exposure:

- Back: 26
- Chest: 26
- Quads: 18
- Glutes: 16
- Hamstrings: 16
- Shoulders: 16
- Biceps: 10
- Calves: 10
- Rear delts: 10
- Triceps: 10
- Abs: 6
- Forearms: 5

Assessment: 6 days/week is probably too high in total session volume for many users because each session retains roughly the same dose as lower-frequency plans. It may work for high-adherence intermediate/advanced lifters, but it needs per-session caps, fatigue guardrails, and weekly set targets to avoid junk volume.

## Weekly Stimulus Findings

### Exercises Per Session

The average stays essentially constant:

- 2 days: 6.0
- 3 days: 6.0
- 4 days: 6.0
- 5 days: 6.0
- 6 days: 6.0

This strongly suggests the generator preserves per-session structure.

### Working Sets Per Session

The average recommended max set count also stays essentially constant:

- 2 days: 26.0
- 3 days: 26.0
- 4 days: 26.5
- 5 days: 26.2
- 6 days: 26.0

This is the central issue. A 3-day plan should normally carry more per-session responsibility than a 6-day plan, while a 6-day plan should usually be shorter and more focused per session.

### Weekly Working Sets

Weekly recommended max sets scale almost linearly:

- 2 days: 52
- 3 days: 78
- 4 days: 106
- 5 days: 131
- 6 days: 156

This is not inherently wrong, but it should be deliberate. Right now it appears to be an emergent result of repeating one-day templates.

### Movement Pattern Distribution

The 3-day plan heavily repeats the same full-body pattern:

- Horizontal pull: 15
- Horizontal push: 15
- Squat: 15
- Hinge: 12
- Vertical push: 12
- Core: 9

The 6-day plan heavily accumulates isolation exposure:

- Isolation: 72
- Horizontal push: 18
- Vertical pull: 18
- Squat: 10
- Hinge: 8
- Hip thrust: 8
- Horizontal pull: 8
- Vertical push: 8
- Core: 6

This supports the concern that the generator is not redistributing weekly stimulus intelligently enough.

## Coaching Principle

When training days change, Adaptive Strength Coach should optimise in this order:

1. Weekly stimulus appropriate to goal and training age
2. Recoverability
3. Session quality
4. Session length
5. Movement frequency
6. Exercise variety

The app should not blindly preserve total weekly volume if sessions become too long.

The app should not blindly preserve per-session volume if weekly stimulus collapses or explodes.

The user should experience:

- Fewer days: each session becomes more complete and better balanced.
- More days: each session becomes more focused, shorter, and more recoverable.
- Same goal: weekly stimulus remains in a defensible range.

## Is 3-Day Too Low?

For the audited intermediate Build Muscle & Strength profile: yes, somewhat.

The 3-day plan gives strong compound exposure and good movement frequency, but it has limited direct assistance and repeats the same structure. Compared with 4 days/week, it drops from 106 to 78 recommended max weekly sets while retaining the same average per-session size. A better 3-day plan would likely keep full-body frequency but selectively add or rotate assistance so weekly local stimulus does not collapse.

## Is 6-Day Too Much?

For many users: likely yes.

The 6-day plan reaches 156 recommended max weekly sets with no reduction in average per-session dose. It is not automatically unsafe, but it is high and should be justified by experience, goal, recovery, and session-length constraints. The biggest risk is not the split itself; it is that 6-day frequency receives almost the same per-session volume as lower-frequency plans.

## Is Any Day Junk Volume?

No single session is obviously nonsensical, but the 6-day plan has a junk-volume risk because the second Push/Pull/Legs cycle repeats a similar amount of work instead of clearly reducing per-session dose or applying weekly muscle caps.

## Does 3-Day Meaningfully Redistribute Work?

Partially.

It correctly moves to full-body training. That is a meaningful structural change. But it does not meaningfully increase per-session stimulus relative to 6 days/week, and it does not appear to use weekly target ranges to decide what each session must cover.

## Safe v1 Fix Recommendation

Recommended verdict: **B) Minor-to-moderate production refinement needed.**

Do not rewrite the generator. Add a small frequency-aware layer that sets constraints before planned session generation.

### 1. Add Weekly Stimulus Targets

Create goal/experience/block-aware weekly set target ranges by broad muscle group or movement pattern.

Example shape, not final prescription:

- 2 days/week: lower total weekly ceiling, higher per-session completeness
- 3 days/week: balanced full-body sessions with enough accessory coverage
- 4 days/week: current upper/lower base is close
- 5 days/week: moderate per-session caps
- 6 days/week: lower per-session cap and weekly muscle cap

### 2. Pass Frequency Context Into Generation

Pass these into `selectPlannedExercisesForWeek` / `generateWorkoutByFocus`:

- `daysPerWeek`
- `weeklySplit`
- `sessionIndex`
- `weeklyStimulusTargets`
- `maxExercisesPerSession`
- `maxRecommendedSetsPerSession`
- `muscleGroupWeeklyCaps`

### 3. Add Session-Length Guardrails

Suggested first-pass guardrails:

- 2-day: 6-8 exercises, but avoid excessive hinge/squat stacking
- 3-day: 6-8 exercises with balanced assistance rotation
- 4-day: 5-7 exercises
- 5-day: 5-6 exercises
- 6-day: 4-6 exercises, lower accessory redundancy

### 4. Add Muscle-Group Weekly Caps

The 6-day audit generated estimated weekly exposure of:

- Chest: 26
- Back: 26
- Isolation movement pattern: 72

Those should trip a weekly cap or at least force the second cycle to choose lower-fatigue alternatives.

### 5. Add Regression Tests After Implementation

Useful tests after the v1 fix:

- 3-day plan has higher average per-session stimulus than 6-day.
- 6-day plan has lower average per-session stimulus than 3-day.
- 3-day weekly set exposure does not collapse below a defensible percentage of 4-day.
- 6-day weekly set exposure stays under configured weekly caps.
- Changing training days regenerates meaningful structure.
- Extra sessions remain separate from planned weekly stimulus.

I did not add these tests now because they would either fail against current behaviour or lock the bad behaviour in place.

## Final Verdict

The current generator is not random, and the split choices are directionally sensible, but weekly stimulus distribution is under-specified.

Current behaviour preserves:

- Per-session exercise count
- Per-session set prescription
- Split family
- Template role structure

Current behaviour does not adequately preserve:

- Weekly stimulus target
- Recoverability across frequencies
- Muscle-group weekly set ranges
- Session-length scaling
- Low-frequency redistribution
- High-frequency volume caps

Recommended next step: implement a **frequency-aware weekly stimulus guardrail layer** before planned exercise selection. This is the smallest safe v1 fix and avoids a full generator rewrite.
