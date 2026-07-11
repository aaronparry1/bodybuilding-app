# Iron Logic Training Logic Audit

Date: 2026-06-04

This document explains how Iron Logic currently works from first setup through workout execution, history, Progress, and strategic coaching.

It describes the current code behaviour. It does not describe intended future behaviour unless clearly marked as a gap or placeholder.

## Executive Summary

Iron Logic currently has two separate layers:

1. Strategic layer: onboarding, active plan, block sequence, weekly split, workout generation, Home, Plan, Progress, and strategic recommendations.
2. Tactical layer: workout logging, warm-up/work sets, best set, rep drop-off, exercise shutdown, progression recommendation, history summaries, analytics, and sync metadata.

The tactical layer is the strongest part of the app. Work sets are the source of truth. Warm-ups are stored but excluded from best set, drop-off, quality sets, progression, volume summaries, analytics, and strategic signals.

The strategic layer is usable but less centralized. There is an active training plan store and a separate training-year/block store. They usually align after onboarding, but they can drift because they are not yet one source of truth.

The workout generator is template-driven, role-based, taxonomy-aware, equipment-aware, and block-aware. It is not a large language model. It is deterministic scoring plus structured variability.

## 1. Onboarding

### Questions Asked

The onboarding flow asks the user:

- Training goal:
  - Build Muscle
  - Build Strength
  - Build Muscle & Strength
  - Athletic Performance
  - Prepare For Event
  - Just Help Me Train
- Plan style:
  - Recommended 12-month plan
  - Custom date/event plan
  - Single block only
  - Build my own plan
- Event details, only for custom date/event:
  - event type
  - target date
- Single-block choice, only for single-block mode:
  - hypertrophy
  - powerbuilding
  - strength
  - power
  - deload/maintenance style
- Equipment preset:
  - full gym
  - machines only
  - dumbbells only
  - barbell + dumbbells
  - home gym
  - custom
- Days per week:
  - 2 to 6
- Preferred split:
  - let app choose
  - push/pull/legs
  - upper/lower
  - full body
  - body part split
- Experience level:
  - beginner
  - intermediate
  - advanced
- Unit:
  - kg
  - lb

### How Answers Affect the Programme

The onboarding answers are passed into `createActiveTrainingPlan()`.

- Goal affects the plan label, programme goal, and default block choice.
- Plan style affects the block sequence.
- Event type and target date affect event-plan block sequence.
- Single-block choice creates a one-block sequence instead of the guided annual sequence.
- Equipment preset becomes the equipment filter for workout generation.
- Days per week and preferred split create the weekly structure.
- Experience level filters or penalizes exercises in generated workouts.
- Unit is saved into app settings and then applied to progression settings.

### Defaults Used

Current defaults are:

- goal: Build Muscle
- plan style: Recommended 12-month plan
- equipment: Full gym
- days per week: 4
- preferred split: Let app choose
- experience: Intermediate
- unit: kg
- rotation frequency: every 4 weeks
- rep strategy: Recommended
- default drop-off setting in app settings: 15%
- default load jump in app settings: 2.5

Block-specific drop-off rules can override the app default.

### Where Data Is Stored

On completion, onboarding writes to:

- `activeTrainingPlanRepository`
  - stores the active plan, blocks, equipment, split, schedule, experience, and mode.
- `trainingYearRepository`
  - starts the first block type from the active plan.
- `appSettingsStore`
  - stores unit, training goal, experience level, and `onboardingCompleted`.

Current weakness: active plan and training year are separate local stores. They normally start aligned but can become inconsistent because one is not derived from the other.

## 2. Plan Creation

### Recommended 12-Month Plan

Recommended mode creates this block sequence:

1. Hypertrophy
2. Powerbuilding
3. Strength
4. Power
5. Peak
6. Deload

Each block is created with `createTrainingBlock()` and then marked as active or planned. The first block is active.

### Single-Block Plans

Single-block mode creates a sequence with only the chosen block. It does not pretend that later blocks are coming.

If no explicit block is chosen, the app chooses a block from the goal:

- strength goals tend toward Strength
- most muscle/general goals tend toward Hypertrophy

### Event/Custom Plans

Event mode chooses blocks from event type and time available:

- Powerlifting:
  - 8 weeks or less: Strength -> Peak
  - more than 8 weeks: Powerbuilding -> Strength -> Peak
- Holiday/photoshoot:
  - 8 weeks or less: Hypertrophy -> Deload
  - more than 8 weeks: Hypertrophy -> Hypertrophy -> Deload
- Sport season:
  - Powerbuilding -> Power -> Deload
- Generic event:
  - short: goal-derived block
  - longer: Hypertrophy -> Powerbuilding -> Deload

Custom sequence support exists structurally. Full user-facing custom sequence editing is not mature yet.

### Current Block, Week, and Day

The active plan stores `activeBlockId`. The active block is resolved from that id.

Each training block has `currentWeek`, `durationWeeks`, and a list of weeks. Most created blocks start at week 1.

The current day index is calculated from the local date:

- Monday maps to index 0.
- Tuesday maps to index 1.
- Sunday is clamped to index 0.

This means Sunday handling is simplistic.

## 3. Weekly Structure

### Days Per Week

The app uses `weeklySplitForPlan(daysPerWeek, preferredSplit)`.

If the user selects "Let app choose":

- 3 days or fewer: Full Body
- 4 days: Upper/Lower
- 5 or 6 days: Push/Pull/Legs

Then it takes the first `daysPerWeek` entries from the chosen split template.

### Split Templates

Current split templates:

- Push/Pull/Legs:
  - Push, Pull, Legs, Rest, Upper, Lower, Rest
- Upper/Lower:
  - Upper, Lower, Rest, Upper, Lower, Rest, Rest
- Full Body:
  - Full Body, Rest, Full Body, Rest, Full Body, Rest, Rest
- Body Part Split:
  - Chest, Back, Legs, Shoulders, Arms, Rest, Rest
- Let App Choose fallback:
  - Push, Pull, Legs, Upper, Full Body, Rest, Rest

Because the app slices the template to the requested number of days, a 4-day upper/lower plan currently becomes:

- Upper
- Lower
- Rest
- Upper

That includes a rest day inside a 4-day list. This is probably not what a user expects if "4 days/week" means four training days.

### Today’s Workout Selection

Home and planned workout generation use the active plan's weekly split. The app looks at today's index and picks the planned label.

If today is rest, some flows look for the next trainable day.

Completed sessions can mark a weekly item as done if the completed workout name contains the split label.

### Completed Sessions and What Comes Next

Home checks completed workout history for today:

- If an open workout exists, Home prioritizes continuing it.
- If today's workout is completed, Home shows completed state and can point to the next planned workout.
- If today is rest, Home shows rest-day language and the next trainable workout.

The "what comes next" logic is name-based. It is not yet a full calendar scheduler.

## 4. Exercise Selection

### Exercise Library Inputs

Exercises have metadata:

- category
- primary muscles
- secondary muscles
- equipment
- movement pattern
- kind
- role
- roles
- family
- tier
- fatigue cost
- joint stress
- suitability
- suitable blocks
- swap tags
- default rep range
- default load jump

### How Exercises Are Chosen

Generated workouts are built from templates. A template defines slots such as:

- primary compound
- secondary compound
- isolation
- power
- accessory

For each slot, the generator filters and scores library exercises.

It considers:

- current workout type
- block type
- slot role
- target muscles
- movement pattern
- exercise family
- equipment availability
- experience level
- suitable blocks
- recent exercises used
- stalled exercises
- fatigue signals
- overused muscles
- stable primary exercise ids
- structured variability seed

It avoids exact duplicate exercises inside a workout.

### Role Effects

Exercise roles decide where an exercise can appear:

- Primary Compound: main slot.
- Secondary Compound: supporting compound slot.
- Accessory: supporting hypertrophy/maintenance slot.
- Isolation: direct muscle work.
- Power: power slots only.
- Corrective/Recovery: used in corrective or low-fatigue contexts.

### Tier Effects

Exercise tiers guide stability:

- Tier A: core exercises. Favoured for stable primary slots.
- Tier B: important supporting exercises. Can rotate occasionally.
- Tier C: accessories. Rotate more freely.

The generator prefers keeping Tier A primary exercises stable when there is a stable primary id and no stall.

### Family Effects

Families are used to avoid redundancy and support swaps.

Examples:

- horizontal press
- vertical pull
- horizontal pull
- squat pattern
- hip hinge
- chest isolation
- shoulder isolation
- biceps isolation
- triceps isolation

The generator penalizes repeated families where a slot asks it to avoid redundant patterns.

### Equipment Effects

Equipment filtering happens before scoring. If the user only has dumbbells, barbell or machine exercises are filtered out.

Bodyweight exercises can appear when bodyweight is in the equipment list.

### Experience Effects

Beginner users are protected from advanced-only exercises:

- Beginner users do not get exercises marked as advanced.
- Beginner-friendly exercises get a small scoring bonus.
- Advanced users can receive advanced movements.

### Block Type Effects

Block type changes both:

- the workout template
- the candidate exercises and rep ranges

Power workouts require actual power-role exercises in power slots. Strength workouts bias lower-rep compounds and smaller hypertrophy maintenance doses. Hypertrophy workouts carry more direct muscle work.

### AI/Generated Sessions vs Planned Sessions

User-facing names should not show "AI".

Internally, generated sessions are rule-generated template sessions. They are not random and not an LLM response.

Planned sessions come from:

- selected programme day
- active plan's generated day
- explicit session generation flow

The app currently generates planned workout programmes on demand from the active plan rather than storing a whole mesocycle's exact exercise choices for weeks 1-4, weeks 5-8, etc.

There is a utility for stable planned exercise selection across weeks, including rotation frequency, but the current active plan workout creation path mostly uses on-demand generation.

### Duplicate/Redundant Exercise Avoidance

The generator:

- blocks exact duplicate exercises
- penalizes repeated exercise families
- penalizes repeated movement patterns when the slot asks for it
- requires vertical and horizontal pull patterns in relevant pull templates where possible
- prevents normal Push templates from using rear-delt corrective work as a standard slot
- forces power slots to use power-role exercises

### Swap Suggestions

Swaps are suggested from the full exercise list.

Narrow swap mode prioritizes:

1. same family
2. same role
3. same primary muscles
4. same movement pattern
5. same equipment
6. swap tag overlap

Broad search relaxes the filter and sorts with penalties for poorer matches.

### Added Exercises

Adding an exercise during a workout:

- affects only the current workout session.
- does not alter the programme or active plan.
- marks the exercise origin as `added_during_workout`.
- can insert after the current exercise or at the end.
- uses previous exact exercise load if available.
- otherwise starts with unknown load.

## 5. Number of Exercises

Exercise count is template-driven.

The generator has separate templates for:

- Push
- Pull
- Legs
- Upper
- Lower
- Full Body
- Arms

And separate template sets for:

- Hypertrophy
- Powerbuilding
- Strength
- Power

Examples:

- Hypertrophy Push has 6 slots.
- Hypertrophy Pull has 5 slots.
- Hypertrophy Legs has 6 slots.
- Hypertrophy Upper has 6 slots.
- Hypertrophy Lower has 5 slots.
- Hypertrophy Full Body has 6 slots.
- Hypertrophy Arms has 5 slots.
- Strength and Power templates are generally shorter.

Time available can reduce exercise count:

- 35 minutes or less: cap around 4 exercises.
- 50 minutes or less: cap around 5 exercises.
- otherwise use the full template.

Fatigue-aware trimming can also reduce the template if recent volume is high or repeated drop-offs are present.

Current limitation: the active plan/Home path does not appear to pass a user-selected session length consistently, so most planned workouts use the template's normal count.

## 6. Rep Range Logic

Rep ranges are resolved by `resolveRepRange()`.

Priority:

1. Explicit programme/session prescription.
2. Block plus exercise role prescription.
3. Family-specific override.
4. Exercise default rep range.
5. Advanced user override only if enabled.
6. Safe fallback.

### Block and Role Effects

Hypertrophy:

- Primary compound: 6-10
- Secondary compound: 8-12
- Accessory: 10-15
- Isolation: 10-20
- Small muscle isolation: 12-25

Powerbuilding:

- Primary compound: 4-8
- Secondary compound: 6-10
- Accessory: 8-15
- Isolation: 10-15
- Small muscle: 12-20
- Power: 1-3

Strength:

- Primary compound: 3-5
- Secondary compound: 5-8
- Accessory/maintenance: 8-12
- Isolation: 10-15
- Small muscle: 12-20

Power:

- Power: 1-3
- Primary strength: 3-5
- Secondary compound: 5-8
- Hypertrophy maintenance: 8-12
- Small muscle/corrective: 10-20

Peak:

- Primary strength/power: 1-3
- Secondary: 3-5
- Accessory maintenance: 8-12
- Corrective: 10-15

### Family Overrides

Family-specific overrides include:

- Calves: 10-25
- Rear delts: 12-25
- Core flexion: 10-20
- Core stability: 8-15
- Forearms: 12-25
- Adductors/abductors: 12-25
- Olympic power: 1-3
- Jumps/throws: 1-5

### Programme and Session Overrides

If a programme or generated session slot already has a rep range, that range wins. Starting a workout preserves the planned slot settings.

### Settings Effects

Global rep min/max were removed from normal settings because they implied every exercise should use the same rep target.

The old `defaultRepRange` still exists in app settings as a legacy fallback and for future advanced custom support.

Current caveat: in the resolver, advanced user override is lower priority than exercise default. That is acceptable while Advanced Custom is a placeholder, but it would need changing if advanced rep control becomes real.

## 7. Starting Load Logic

### Exact Logic

The app decides starting load like this:

- If the planned programme slot has `suggestedLoad`, use it.
- If the exercise is bodyweight, load is 0 and considered known.
- If there is previous exact exercise history, generated sessions can use:
  - next recommended load if progression was earned.
  - otherwise the last load used.
- If there is no history, load is 0 and `loadKnown` is false.

In the active exercise UI, unknown loads show as "Choose" or "Choose starting load" rather than pretending a number is known.

### Previous History

Previous performance is exact-exercise based. The app looks for the last completed history entry for the same exercise id, excluding the current session.

### No History

If no previous exact history exists:

- the app leaves load unknown.
- the user must enter a load before logging work.
- the UI tells the user to pick a weight they expect to hit the target range with.

### Similar Exercise / Family History

Similar exercise or same-family load estimation is not currently implemented.

Example: if the user has Machine Chest Press history but no Bench Press history, Bench Press will not currently estimate from Machine Chest Press.

### Experience or Bodyweight Estimates

Experience-based load estimates and bodyweight-based estimates are not currently implemented.

### Warm-Up/Ramp Role

Warm-up mode helps the user find a working load. Warm-up sets can be logged while load is being adjusted, then the user switches to work sets when ready.

## 8. Warm-Up Logic

Warm-up sets are `SetLog` rows with `type: "warmup"`.

Warm-ups record:

- reps
- load
- timestamp
- set number within warm-up sets

Warm-ups do not count toward:

- best set
- drop-off threshold
- minimum acceptable reps
- quality sets
- progression earned
- volume load
- analytics hard sets
- strategic coaching signals

Warm-ups are shown separately from work sets in the active exercise UI.

Warm-ups sync to Supabase through `performed_sets.set_type = 'warmup'`.

## 9. Work Set Logic

When the user logs a work set:

1. The app commits the current load input.
2. A new set is created with reps, load, timestamp, and `type: "work"`.
3. The app evaluates progression using work sets only.
4. If the latest work set falls below the minimum acceptable reps, the exercise status becomes `shutdown`.
5. Otherwise the exercise remains active.
6. A rest timer starts for work sets.
7. The session is saved locally.

### Best Set

Best set is the highest reps from work sets.

### Minimum Acceptable Performance

Minimum acceptable reps are calculated as:

`floor(bestSetReps - bestSetReps * dropOffPercent / 100)`

Example:

- best set: 12
- drop-off: 15%
- threshold reps: 1.8
- minimum acceptable: floor(10.2) = 10

### Continue vs Stop

An exercise stops when:

- there is more than one work set
- the latest work-set reps are below the minimum acceptable reps

If latest reps equal the minimum, the app warns that the user is close but does not stop.

### Rest Timer

Rest starts after work sets only.

Default rest:

- Power work or Power block: 180 seconds
- Strength/Powerbuilding compound: 180 seconds
- Hypertrophy compound: 120 seconds
- Isolation: 75 seconds
- General default: 90 seconds

The user can skip rest or adjust by 15 seconds. Rest is clamped between 0 and 600 seconds.

### Undo

Undo removes the last logged set, whether warm-up or work. It then re-evaluates progression from remaining work sets.

If undo removes the set that caused shutdown, the exercise can become active again.

## 10. Stop / Shutdown Logic

The app stops an exercise when the latest work set drops below the minimum acceptable reps from the best work set and drop-off percentage.

It does not use RPE or RIR.

### Drop-Off Percentage Source

Drop-off can come from:

- current block default
- planned slot settings
- exercise default settings
- app default as fallback

Current block defaults:

- Hypertrophy: 18% default range 15-20
- Powerbuilding: 12% default range 10-15
- Strength: 10% default range 8-12
- Power: 0% placeholder speed-drop rule
- Peak: 5%
- Deload: 20%

Important caveat: Power block has a speed-drop placeholder, but the tactical engine still evaluates reps because bar-speed tracking is not implemented.

### After Shutdown

After shutdown:

- the exercise status is `shutdown`.
- the UI shows a calm stop message.
- logging is disabled.
- the user can undo the last set.
- the user can move to the next exercise.
- the user can explicitly "Reopen anyway".

### Reopening

Manually completed exercises can be reopened normally.

Shutdown exercises require explicit `allowShutdown` reopening. When reopened, the shutdown reason becomes a warning that reopening after drop-off should only be used when the previous set was logged incorrectly.

## 11. Progression Logic

Progression is evaluated by `evaluateExerciseProgression()`.

The app recommends increasing load when:

1. The exercise did not hit shutdown.
2. The best work set reaches the top of the target rep range.
3. The number of acceptable work sets is at least `requiredWorkSets`.

Acceptable work sets must:

- be at or above the minimum acceptable reps
- be within the target rep range

Default required work sets are currently 3.

### Best Set vs Multiple Sets

Progression is not based on best set alone.

The best set must reach the top of the range, and enough acceptable work sets must be completed.

Example target 8-12:

- 12, 11, 10, 10:
  - best set 12
  - no shutdown
  - 4 acceptable sets
  - progression earned if required work sets are 3

- 12, 11, 10, 8:
  - best set 12
  - latest set below minimum 10
  - shutdown
  - progression not earned

- 10, 10, 9:
  - no shutdown if minimum allows it
  - best set below 12
  - no progression
  - keep load and aim for more reps next time

### Load Jump

Next load is:

`currentLoad + settings.loadIncrease`

Only if progression is earned.

If progression is not earned, next load equals current load.

Default load jumps come from exercise settings, planned slot settings, or app settings. Exercises have their own default load jumps.

### Productive But Not Progressed

If the exercise stays above threshold but does not earn progression, the app recommends keeping load and getting more clean reps next time.

### Early Shutdowns

If shutdown happens, tactical progression does not increase load. The recommendation is to stop the exercise and save the next load decision for the next session.

## 12. Decrease-Load Logic

The tactical progression engine does not directly decrease load after a single workout.

Decrease-load recommendations exist in the coaching layer.

Evidence that can cause reduced load recommendation:

- regression trend across recent entries
- worsening best-set trend
- worsening load trend
- declining volume load
- repeated early drop-offs
- fatigue signals

The progression coach detects:

- no progression for 3 sessions
- no progression for 5 sessions
- regression trend over a configurable window
- repeated drop-offs over a fatigue window
- declining sets completed

If regression or worsening performance appears, the coach can recommend reducing load to about 95% of current load.

Current limitation: load reduction is a recommendation, not an automatic change to the next workout's load. The exact point where that recommendation becomes the planned load is not fully closed-loop yet.

## 13. Volume Logic

### How Sets Emerge

The app does not prescribe fixed weekly set increases.

Within an exercise, the user keeps logging work sets until:

- they manually complete the exercise
- they skip/complete it
- performance drops below threshold and the app shuts it down

This means volume emerges from actual performance.

### Minimum / Target / Maximum Quality Sets

`requiredWorkSets` exists and is used for progression qualification.

There is no hard tactical maximum number of sets for an exercise if the user continues staying above threshold.

The workout template has suggested slot sets, but the active workout does not force-stop at that number.

Current risk: a user could theoretically keep doing too many sets if they remain above threshold and ignore good judgment.

### Quality Sets

Quality sets are counted as acceptable work sets:

- reps within target rep range
- reps at or above minimum acceptable reps

Warm-ups are excluded.

### Volume Landmarks

MEV/MAV/MRV-style volume landmarks are partially represented by:

- weekly muscle target ranges in analytics
- strategic signals for quality set trend and volume tolerance
- deload/fatigue trigger utilities

They are not yet personalized and stored as user-specific MEV/MAV/MRV landmarks.

### Volume Tolerance

Volume tolerance is inferred from quality-set trend:

- rising quality sets -> rising volume tolerance
- falling quality sets -> declining volume tolerance
- flat quality sets -> stable

This is useful but simplistic.

## 14. Deload / Fatigue Logic

Fatigue is detected from objective performance data:

- shutdown rate
- falling quality sets
- falling best-set performance
- repeated early drop-offs
- declining volume tolerance
- optional recovery signals placeholder

### Strategic Coaching

Strategic coaching converts workout history into `StrategicSignals`.

Signals include:

- progression rate
- quality set trend
- fatigue trend
- volume tolerance
- exercise performance trend
- recovery trend placeholder
- stalled exercises
- progressing muscles
- undertrained muscles
- overreached muscles
- average quality sets
- shutdown rate

### Block Readiness

Readiness score is 0-100.

Default factor weights:

- progression: 30%
- quality sets: 25%
- fatigue: 25%
- volume tolerance: 15%
- recovery placeholder: 5%

Bands:

- 85+: ready
- 60-84: continue
- 40-59: monitor
- below 40: deload or adjust

### Training Momentum

Training momentum is also 0-100.

It uses:

- progression score
- volume tolerance
- fatigue
- quality set trend

Bands:

- Strong
- Stable
- Slowing
- Declining

### Recommendations

Strategic recommendations include:

- continue block
- extend block
- deload then continue
- advance block
- repeat block
- reduce volume
- increase volume

Deloads are recommendations, not automatic. The app does not currently force a deload because a calendar week arrived.

## 15. Progress Screen Logic

Progress uses completed workout history summaries.

It filters out normal recent workout cards that have zero work sets.

It cleans generated names:

- `AI Push • Push` becomes `Push`.

Progress combines:

- strategic coaching view model
- hypertrophy coach report
- recent workout cards
- recent progression highlights

### Coach Verdict

Progress shows low-history state until at least 3 completed workouts.

If fatigue/recovery is the priority, Progress leads with recovery before load jumps.

This prevents contradiction such as:

- "Fatigue is the limiter"
- "Increase load now"

Exercise-specific progression can still be mentioned as a lower-priority note, but recovery takes precedence.

### Recent Workouts

Recent workout cards show:

- cleaned workout name
- date
- duration
- work sets
- one highlight

Warm-ups do not count as work sets.

## 16. Home Logic

Home builds a view model from:

- training year
- active plan
- completed history
- exercise library
- programmes
- open workout
- date

### No-Plan State

If no active plan exists:

- Home shows "Set up your training plan".
- It does not show a fake workout.
- CTA goes to onboarding/setup.

### Planned Workout State

If active plan exists and no active workout is open:

- Home reads today's workout from the active plan weekly split.
- It shows the current block.
- It shows the current week's schedule.
- CTA starts today's planned workout.

### Active Workout State

If any open, non-legacy workout exists:

- Home prioritizes "Continue workout".
- It uses the open workout name.
- It does not generate a conflicting new workout.

### Completed-Today State

If today's matching workout is completed:

- Home shows completion state.
- It can point to the next planned workout if one exists.

### Rest-Day State

If today's split label is Rest:

- Home shows rest-day language.
- It can point to the next trainable workout.

### Next Session

Next session is found by scanning forward through the weekly split for the next non-rest label.

Current limitation: this is schedule-label based, not a full calendar or programme-day completion model.

## 17. Cloud Sync Logic

### Local Data

The app saves locally first:

- workout sessions
- sets
- warm-up/work set type
- added exercises
- swap metadata
- custom exercises
- programmes
- settings
- active plan
- training year

### Supabase Sync

Cloud repositories support:

- workout sessions
- performed exercises
- performed sets
- custom exercises
- programmes
- user settings

Workout sessions sync through a queue after completion.

Cloud sync is gated by subscription entitlement unless bypassed for diagnostics/dev flow.

### Warm-Up / Work Metadata

`performed_sets.set_type` stores:

- warmup
- work

Hydration maps missing or old values back to work.

### Swap Metadata

Performed exercises can store:

- exercise origin
- swapped from id/name
- swapped to id/name
- archived swapped sets JSON
- swapped timestamp
- metadata JSON

The active workout remains clean while history can preserve the old exercise and sets.

### Added Exercise Metadata

Added exercises use:

- `exercise_origin = added_during_workout`
- `added_at`
- metadata JSON

### Current Schema Limitations

The schema now supports the new metadata, but staging must have the migrations applied.

Current cloud sync does not fully solve:

- active plan sync
- training year sync
- exact programme-day completion state
- local conflict resolution beyond queue skip/failed state
- mapping strategic recommendations into future planned load automatically

## Robust Logic

The following areas are robust:

- work sets are separated from warm-ups.
- best set uses actual reps only.
- drop-off shutdown uses actual logged reps only.
- progression requires top-of-range plus enough acceptable work sets.
- shutdown disables further logging unless user undoes or explicitly reopens.
- set history records actual load per set.
- history summaries exclude warm-ups from progression and volume.
- swap history preserves old logged work without cluttering active session.
- generated workouts use templates, roles, families, tiers, equipment, experience, and block type.
- Progress filters zero-set sessions and avoids fatigue/load-increase contradiction.

## Incomplete or Placeholder Logic

The following areas are incomplete:

- Active plan and training year are separate sources of truth.
- Weekly schedule uses simple array slicing and can include Rest inside the requested training-day count.
- Body-part split labels such as Chest, Back, and Shoulders are not fully mapped into generated workout types.
- Planned mesocycle exercise consistency exists as a utility but is not fully integrated into current workout generation.
- Similar-exercise load estimation is not implemented.
- Experience/bodyweight-based load estimates are not implemented.
- Power block speed-drop logic is a placeholder; tactical execution still uses reps.
- Personalized MEV/MAV/MRV landmarks are not fully implemented.
- Strategic recommendations do not automatically update future planned loads or volumes.
- Active plan and training year are not fully synced to Supabase.
- Cloud conflict resolution is basic.

## Logic That May Be Too Simplistic

- Sunday current-day handling clamps to Monday.
- Completed-session matching is name-based.
- Undertrained/overtrained muscle detection uses generic weekly set targets, not individual tolerance.
- Volume tolerance is inferred mainly from quality-set trend.
- Fatigue trend is based on shutdown rate and simple trends.
- Decrease-load recommendation is not tightly connected to next workout load selection.
- The user can keep adding many productive sets because there is no tactical maximum set cap.
- Current block week does not appear to advance from actual calendar/training completion in a mature way.

## Areas Needing Scientific / Programming Review

- Weekly split generation should distinguish "training days" from "entries including rest".
- The generator templates should be reviewed against the intended programme philosophy for each block.
- Power block execution needs a true speed/quality proxy or a deliberately rep-only substitute.
- Volume landmarks should become individualized from history, not only generic muscle targets.
- Readiness weights should be validated against real training histories.
- Load reduction rules need clearer integration with next-session prescriptions.
- Block advancement should use both minimum duration and real readiness, but should not drift because of separate stores.

## Areas Where Poor Recommendations Could Occur

- A user with little history may get generic plans and blank loads.
- A body-part split user may get weak generation because Chest/Back/Shoulders labels do not map cleanly to workout generator types.
- A strong user with high tolerance may overdo sets if they keep beating threshold.
- A user with fatigue but one exercise progression win may still see that exercise win in lower-priority notes.
- Similar exercises are not used for load estimates, so useful prior history can be ignored.
- Power workouts can be prescribed, but execution cannot actually measure bar speed.

## Flowchart-Style Training Flow

```text
User opens app
  -> Home loads active plan, training year, local history, and open workout
  -> If no plan:
       show setup CTA
  -> If open workout:
       show continue workout CTA
  -> If planned workout:
       show today's workout and start CTA

User starts workout
  -> Active plan weekly split picks today's workout label
  -> Workout type is mapped from label
  -> Generator creates a programme day from current block, equipment, experience, and workout type
  -> Programme day is selected
  -> Train creates a workout session from the selected day

User opens exercise
  -> Exercise shows planned rep range, load state, set history, status
  -> If load is unknown:
       user must choose starting load
  -> User can log warm-up sets
       warm-ups are stored but excluded from progression
  -> User switches to work sets

User logs work set
  -> Set stores actual reps, actual load, type=work, timestamp
  -> App recalculates best set from work sets
  -> App calculates minimum acceptable reps from best set and drop-off percent
  -> App counts acceptable work sets
  -> App checks shutdown

If latest work set is below minimum acceptable reps
  -> Exercise status becomes shutdown
  -> Logging is disabled
  -> User can undo last set, reopen explicitly, or move to next exercise

If not below threshold
  -> Exercise remains active
  -> Rest timer starts
  -> If top of rep range + enough acceptable work sets:
       next load increase is recommended
  -> Otherwise:
       keep load and aim for more reps next time

User completes workout
  -> Session gets completedAt
  -> Workout is saved locally
  -> Sync queue enqueues completed session
  -> History summarizes work sets only
  -> Progress uses summaries for coach verdict, recent progress, analytics, and strategic signals
  -> Strategic coaching updates readiness, momentum, and recommendation
```

## Recommended Next Fixes

1. Centralize active plan and training year so Home, Plan, Train, and Progress read the same block/week truth.
2. Fix weekly schedule generation so "4 days/week" means four training days, not a slice that can include Rest.
3. Add explicit mapping or templates for body-part split labels: Chest, Back, Shoulders.
4. Wire planned exercise consistency utility into active plan workout generation so planned sessions stay stable across a block.
5. Add same-family load estimate as an optional fallback when exact exercise history is missing.
6. Add a tactical maximum or soft cap for work sets based on exercise role/block to reduce runaway set accumulation.
7. Decide whether Power block should remain rep-only for v1 or wait until speed/quality tracking exists.
8. Create a clearer bridge from coaching recommendations to next-session prescriptions, especially reduce-load and reduce-volume calls.
9. Sync active plan and training year to Supabase when authenticated.
10. Replace generic volume targets with user-specific volume tolerance over time.
