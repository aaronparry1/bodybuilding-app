# Session Prep Audit

Date: 2026-06-18

Status: audit only. No code changes. No EAS build.

## Executive Summary

Session Prep is **workout-type-specific**, not fully exercise-specific.

The app currently chooses one static prep routine based on the workout label/type:

- Push
- Pull
- Legs
- Upper
- Lower
- Full Body
- Arms
- Custom fallback

That means Session Prep is not purely generic filler. Push, Pull, Legs, Upper, Lower, and Full Body receive different prep menus and different Wenning-style primer movements. However, it does **not** inspect:

- the actual upcoming exercise list
- the first compound lift
- goal
- block
- exercise equipment
- user history
- fatigue/readiness
- pain/unavailable preferences

Coach verdict:

An experienced coach would likely approve the current routines as **reasonable general preparation menus**, especially because they are optional, low-fatigue, and separated from progression. But a coach would not call them fully adaptive or highly specific. They prepare the broad session category, not the exact session.

Final verdict: **B) polish**

Session Prep should not be rebuilt from scratch. It is useful and directionally sound, but the next quality step is to make it upcoming-exercise-aware and reduce the chance that the Wenning primer looks like mandatory high-volume work.

## Current Generation Logic

Implementation:

- `src/domain/training/session-prep.ts`
- `app/(protected)/session-prep.tsx`
- `app/(protected)/(tabs)/train.tsx`
- `src/data/local/session-prep-repository.ts`

The main selector is:

```ts
getSessionPrepRoutine(workoutNameOrType)
```

It calls:

```ts
inferSessionPrepWorkoutType(value)
```

The inference is string-based:

- contains `full_body` -> Full Body Prep
- contains `push` -> Push Prep
- contains `pull` -> Pull Prep
- contains `legs` or `leg` -> Leg Prep
- contains `upper` -> Upper Prep
- contains `lower` -> Lower Prep
- contains `arms` or `arm` -> Arms Prep
- otherwise -> Custom Prep

The routine is a hard-coded map keyed by workout type. There is no dynamic exercise analysis at this stage.

## How Exercises Are Selected

Exercises are not selected from a candidate pool. They are explicitly listed inside each routine.

Each routine contains:

- a small fixed list of movement prep exercises
- one Wenning Warm-up entry
- a workout-type-specific list of Wenning movements
- movement guide metadata via `getMovementGuide(name)`

Session Prep records can be:

- completed
- skipped

Tests confirm these records do not create workout sessions, do not enter the sync queue, and do not affect workout history, volume, or progression.

## Does Session Type Influence Prep?

Yes. This is the strongest part of the current design.

Push, Pull, Legs, Upper, Lower, Full Body, Arms, and Custom all have different routines.

The Wenning Warm-up also changes by session type.

## Does Goal Influence Prep?

No.

Build Muscle, Build Strength, Build Muscle & Strength, Get Leaner, Athletic Performance, and Powerlifting Meet do not currently alter Session Prep.

Impact:

- A powerlifting meet Bench session and a general hypertrophy Push session both receive Push Prep.
- Athletic Performance Power work does not receive more explicit jump/landing/throw prep.
- Get Leaner does not receive a lower-fatigue prep variant.

This is acceptable for the current release, but it limits coaching specificity.

## Does Block Influence Prep?

No.

Hypertrophy, Powerbuilding, Strength, Power, Peak, and Recovery Window do not alter Session Prep.

Impact:

- Peak sessions get the same prep as ordinary sessions of the same type.
- Power sessions do not receive speed/power-specific readiness work.
- Recovery Window sessions are not simplified further.

This is not a blocker because Session Prep is optional and low-fatigue, but it is not fully aligned with the sophistication of the workout generation system.

## Do Upcoming Exercises Influence Prep?

No.

The current logic does not inspect the planned exercise list.

Examples:

- Bench Press opener vs Overhead Press opener both get Push Prep.
- Squat-focused Lower vs Deadlift-focused Lower both get Lower Prep.
- Row-heavy Pull vs vertical-pull-heavy Pull both get Pull Prep.
- Full Body with heavy deadlift vs Full Body with light machine work both get Full Body Prep.

This is the main reason the verdict is polish rather than keep/freeze.

## Current Routine Catalogue

### Push Prep

Purpose:

Prepare shoulders and pressing mechanics without adding fatigue.

Estimated time:

5 minutes.

Exercises:

- Cuban Press: 1 x 8 controlled reps
- External Rotation: 1 x 10 each side
- Trap 3 Raise: 2 x 10 reps
- Light Pullover: 1 x 10 easy reps
- Wenning Warm-up

Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Face Pull: 2-4 x 15-25
- Triceps Pushdown: 2-4 x 15-25
- Light DB Floor Press or Push-Up: 2-4 x 15-25

Coach assessment:

Good general pressing prep. It covers cuff, scapular position, upper-back support, and light pressing/triceps exposure. It is most appropriate before bench, incline, machine press, and general Push sessions.

Weakness:

It does not distinguish bench-dominant, overhead-dominant, shoulder-dominant, or chest-isolation-heavy sessions.

Verdict:

**Keep with polish.**

### Pull Prep

Purpose:

Prepare trunk position and pulling mechanics before heavier work.

Estimated time:

6 minutes.

Exercises:

- Bird Dog: 1 x 5 each side
- Hip Hinge Drill: 1 x 8 slow reps
- Light Pullover: 1 x 10 easy reps
- Trap 3 Raise: 2 x 10 reps
- Wenning Warm-up

Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Face Pull: 2-4 x 15-25
- Straight-Arm Pulldown: 2-4 x 15-25
- Light Row or Light Curl: 2-4 x 15-25

Coach assessment:

Good broad Pull preparation. It addresses trunk control, hinge shape, lat path, scapular positioning, and upper-back tissue readiness.

Weakness:

Hip Hinge Drill makes sense if Pull includes deadlift/RDL/heavy row patterns, but can feel less relevant for a pulldown/curl-focused Pull day. It does not adapt to whether the session is vertical-pull dominant, row dominant, deadlift dominant, or arm-support dominant.

Verdict:

**Keep with polish.**

### Legs Prep

Purpose:

Prepare hips, knees, ankles, and squat mechanics.

Estimated time:

7 minutes.

Exercises:

- Deep Squat Hold: 2 x 20 sec
- Ankle Floss: 1 x 8 each side
- Hip Flexor Kick Out: 1 x 8 each side
- Loaded Butterfly: 1 x 30 sec
- Wenning Warm-up

Wenning movements:

- Goblet Squat: 2-4 x 15-25
- Back Extension: 2-4 x 15-25
- Leg Curl: 2-4 x 15-25
- Dead Bug or Hanging Knee Raise: 2-4 x 10-25

Coach assessment:

Good general lower-body prep for squat-pattern and hypertrophy leg sessions. It covers ankle range, squat bottom position, hip extension, adductors, trunk, hamstrings, and posterior chain.

Weakness:

It is squat-biased. If the workout is hinge/deadlift-dominant, it should probably shift toward bracing, hinge patterning, hamstrings, glutes, and posterior-chain ramping. The Wenning portion can look like a lot of work if interpreted literally.

Verdict:

**Keep with polish.**

### Upper Prep

Purpose:

Blend pressing and pulling preparation for an upper session.

Estimated time:

6 minutes.

Exercises:

- External Rotation: 1 x 10 each side
- Trap 3 Raise: 2 x 10 reps
- Bird Dog: 1 x 5 each side
- Light Pullover: 1 x 10 easy reps
- Wenning Warm-up

Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Face Pull: 2-4 x 15-25
- Triceps Pushdown: 2-4 x 15-25
- Light DB Floor Press or Push-Up: 2-4 x 15-25

Coach assessment:

Appropriate for a mixed upper session. It prepares shoulders, scapular control, trunk, lats, and light pressing.

Weakness:

Upper prep uses the Push Wenning movements rather than a more balanced press/pull blend. It includes triceps and light press, but no row/curl/straight-arm pulldown option.

Verdict:

**Polish.**

### Lower Prep

Purpose:

Prepare squat and hinge mechanics without turning warm-up into work.

Estimated time:

7 minutes.

Exercises:

- Cat-Camel: 5 easy reps
- Hip Hinge Drill: 1 x 8 slow reps
- Deep Squat Hold: 1 x 30 sec
- Glute Bridge: 1 x 10 easy reps
- Wenning Warm-up

Wenning movements:

- Goblet Squat: 2-4 x 15-25
- Back Extension: 2-4 x 15-25
- Leg Curl: 2-4 x 15-25
- Dead Bug or Hanging Knee Raise: 2-4 x 10-25

Coach assessment:

Better balanced than Legs Prep for squat plus hinge sessions. Cat-Camel, hinge drill, squat hold, glute bridge, back extension, leg curl, and trunk work make sense.

Weakness:

Still does not distinguish squat-first and deadlift-first sessions. It should eventually branch based on the first lower-body primary lift.

Verdict:

**Keep with polish.**

### Full Body Prep

Purpose:

A short mixed preparation for full-body training.

Estimated time:

6 minutes.

Exercises:

- Cat-Camel: 5 easy reps
- External Rotation: 1 x 10 each side
- Deep Squat Hold: 1 x 20 sec
- Hip Hinge Drill: 1 x 8 slow reps
- Wenning Warm-up

Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Goblet Squat: 2-4 x 15-25
- Back Extension: 2-4 x 15-25
- Push-Up or Light Row: 2-4 x 15-25

Coach assessment:

Good general mixed prep. It is the most generic by necessity, but it covers spine movement, shoulders, squat, hinge, upper-back, lower-body, posterior chain, and a light upper movement.

Weakness:

Full Body varies widely. A full-body Peak/Strength session with squat and bench should not necessarily use the same prep as a light full-body hypertrophy session.

Verdict:

**Keep with polish.**

## Evidence-Based Assessment

Good preparation usually aims to:

- increase tissue temperature
- rehearse upcoming movement patterns
- expose key joints to controlled ranges
- activate/support relevant musculature
- avoid fatigue before work sets
- reduce uncertainty before heavier loading

Current Session Prep does several of these well:

- uses low-load, controlled movement
- includes movement-specific prep by broad session type
- includes light high-rep primer work
- tells users to stay well before failure
- is optional
- is separated from progression evidence
- has movement guides and safety copy

Where it falls short:

- not based on actual first lift
- not based on actual exercise list
- not modified by block or goal
- not modified by fatigue/history
- not clearly constrained enough around Wenning set volume

## Is Session Prep Generic?

Answer:

**Partly.**

It is not a single generic warm-up for every workout. It is meaningfully different across Push, Pull, Legs, Upper, Lower, Full Body, Arms, and Custom.

But it is generic within each workout type. Every Push session gets the same Push Prep. Every Lower session gets the same Lower Prep.

Best description:

**Workout-type-specific static prep.**

Not:

- exercise-specific prep
- block-specific prep
- adaptive readiness prep

## Would a Coach Approve?

### Push

Likely yes.

The exercise choices are defensible for pressing readiness. A coach may reduce volume or tailor it more tightly to bench vs overhead press.

### Pull

Likely yes, with caveat.

Good for row/hinge-heavy Pull. Slightly overbroad for a simple pulldown/curl session.

### Legs

Likely yes, with caveat.

Good squat-biased prep. Needs better differentiation for hinge/deadlift-dominant sessions.

### Upper

Mostly yes.

Good shoulder/trunk prep, but Wenning movements are too push-biased for a balanced Upper day.

### Lower

Likely yes.

Best lower-body mixed prep. Needs squat vs deadlift branching later.

### Full Body

Yes as a general fallback.

It is reasonable, but necessarily broad.

## Do These Improve Readiness?

Yes, for general readiness.

They likely improve:

- shoulder/scapular awareness before pressing and pulling
- trunk/bracing awareness
- hip/ankle/squat position familiarity
- tissue temperature and low-load rehearsal
- transition into work-set warm-up ramps

They are less likely to improve:

- exact competition lift readiness
- power/speed readiness
- peak/taper specificity
- individualized problem areas
- fatigue-specific readiness decisions

## Main Weaknesses

1. **No upcoming-exercise awareness**

The app knows the workout exercises, but Session Prep does not use them.

2. **No first-lift awareness**

Bench, OHP, squat, deadlift, row, leg press, and machine-based sessions should not always share the same prep inside their broad type.

3. **No block/goal awareness**

Power and Peak should probably be sharper and lower novelty. Hypertrophy can tolerate more general pump/primer work. Recovery Window should be easiest.

4. **Wenning volume can read too high**

“2-4 x 15-25” across several movements can look like a full accessory circuit. The copy says very light, but the prescription could still intimidate or over-prescribe.

5. **Upper Prep is push-biased**

Upper currently borrows Push Wenning movements. It should probably include a more balanced upper option.

## Recommended Next Build Changes

Keep the current Session Prep system, but polish it:

1. Make Wenning Warm-up clearer:

   - “Choose 2-3 movements”
   - “1-2 easy sets each for most users”
   - “Use more only if you need extra preparation”

2. Add first-lift modifiers:

   - Bench / horizontal press
   - OHP / vertical press
   - Squat
   - Deadlift / hinge
   - Row / pull
   - Full Body mixed

3. Add block sensitivity:

   - Hypertrophy: light high-rep primer acceptable
   - Strength: more specific bracing and main-pattern rehearsal
   - Power: sharper, lower-fatigue, speed-focused prep
   - Peak: familiar, minimal, low-novelty prep
   - Recovery Window: easiest and shortest

4. Balance Upper Prep:

   - Add row/lat option to Upper Wenning movements.
   - Reduce triceps/press bias unless the session is press-led.

5. Preserve evidence separation:

   - Prep should still not count toward progression, PRs, fatigue, volume, or workout completion.

## Rebuild Not Recommended

Do not rebuild Session Prep from scratch.

The current structure is:

- simple
- safe
- understandable
- tested
- optional
- separate from training evidence
- already more specific than a generic warm-up

The right next step is a small selector layer above the existing routines, not a new system.

## Final Verdict

**B) polish**

Session Prep is not merely generic filler. It is workout-type-specific and mostly coach-defensible. It likely improves general readiness for the upcoming session.

However, it is not yet as adaptive or specific as the rest of the coaching system. The next iteration should make it first-lift-aware, slightly block-aware, and clearer about light primer volume.

