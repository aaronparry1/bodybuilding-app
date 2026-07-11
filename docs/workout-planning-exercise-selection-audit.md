# Workout Planning and Exercise Selection Audit

## 1. Executive summary

Adaptive Strength Coach currently plans workouts through a deterministic, rule-based generator. It is not random, not LLM-generated, and not chaotic. Weekly sessions come from the user's plan type, goal, days per week, and split. Exercises are then selected from template slots using equipment, experience, block suitability, training role, muscle targets, history, preference evidence, fatigue signals, and exercise scoring.

The system has strong foundations: block-aware templates, training lanes, hybrid set ranges, goal-aware progression, primary-lift variation logic, preference learning, volume ladder adjustments, and structured swap recommendations.

Post-fix status:

The two high-priority issues found in this audit have been addressed:

- Body-part split labels now have first-class generator contexts for Chest, Back, and Shoulders.
- Active planned workouts now use the controlled planned exercise selection path.

The main product risk is no longer broken generation or fake rotation controls. The remaining risk is product tuning: how much accessory variation feels right for beta users.

Key findings:

- Weekly session selection is real and plan-driven through `weeklySplitForPlan`, Home session selection, and `buildPlannedWorkoutProgramme`.
- Exercise selection is deterministic and scored, not random.
- Main lifts are generally protected by templates, tiers, scoring, primary-lift variation logic, and future-session replacements.
- Accessories vary through controlled rotation windows, scoring, history penalties, preference learning, and volume adjustments.
- `rotationFrequency` is now wired into the active `buildPlannedWorkoutProgramme` path through `selectPlannedExercisesForWeek`.
- Body-part split labels use dedicated contexts where needed: Chest, Back, and Shoulders have their own templates; Legs, Arms, and Full Body use the existing templates.

Build recommendation:

The original no-build recommendation has been resolved for the two audited blockers. Remaining exercise-variety tuning is not a build blocker unless beta testing shows users find accessory selection stale.

## 2. Current planning flow

### Plan creation

Primary files:

- `src/domain/training/plan-setup.ts`
- `src/domain/training/home-dashboard.ts`
- `src/domain/training/training-session-selection.ts`
- `src/domain/training/planned-workout.ts`
- `src/features/workout-logging/use-workout-logger.ts`

`createActiveTrainingPlan` builds the active plan from onboarding/settings:

- goal
- programme type
- experience level
- days per week
- equipment
- units/load increments
- recovery/cardio preference
- selected block or event date where applicable

Programme type controls block sequencing:

- `recommended_12_month` uses goal-specific annual macrocycles.
- `single_block` creates one selected block.
- `custom_date_event` and `powerlifting_meet` use event-date planning.
- `custom_sequence` exists internally but has been hidden/limited for normal users elsewhere.

### Weekly split selection

`weeklySplitForPlan(daysPerWeek, preferredSplit)` creates the week structure.

Observed behaviour:

- `let_app_choose`
  - 1-3 days: Full Body
  - 4 days: Upper / Lower / Upper / Lower
  - 5+ days: Push / Pull / Legs style
- `push_pull_legs`
  - 4 days: Push / Pull / Legs / Upper
  - 5 days: Push / Pull / Legs / Upper / Lower
  - 6 days: Push / Pull / Legs / Push / Pull / Legs
- `upper_lower`
  - Alternates Upper / Lower
- `full_body`
  - Repeats Full Body
- `body_part_split`
  - Chest / Back / Legs / Shoulders / Arms / Full Body, depending selected days

Home uses `resolveSelectedSessionIndex` and `resolveRecommendedSessionIndex` to choose the current planned session. Planned sessions are tracked separately from extra sessions.

### Active workout generation

`buildPlannedWorkoutProgramme` is the main production path used to create planned workouts for Home preview and Train.

The flow is:

1. Resolve current plan block.
2. Resolve the weekly split.
3. Resolve selected session index.
4. Convert session name to a generator workout type.
5. Call `generateWorkoutByFocus` to create the programme shell.
6. Use `selectPlannedExercisesForWeek` to choose the active exercise slots with deterministic rotation.
7. Apply approved plan exercise replacements.
8. Apply approved personalised volume ladder adjustments.
9. Convert the programme day into an active workout session.

The active session is then built by `buildWorkoutSessionFromProgrammeDay`.

Important production detail:

`buildPlannedWorkoutProgramme` now routes exercise-slot selection through the planned rotation selector when a current block is available. The selection seed includes stable plan/block/session context, and the rotation key uses the block week and rotation frequency.

## 3. Current exercise selection logic

Primary files:

- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/exercise-library.ts`
- `src/domain/training/block-training-lanes.ts`
- `src/domain/training/rep-range-strategy.ts`
- `src/domain/training/volume-adjustments.ts`
- `src/domain/training/exercise-rotation.ts`
- `src/domain/training/primary-lift-variations.ts`
- `src/domain/training/exercise-preferences.ts`
- `src/domain/training/preference-learning.ts`
- `src/domain/training/exercise-swaps.ts`

### Generator templates

`generateWorkoutByFocus` uses block-family templates.

Block family mapping:

- Hypertrophy block -> hypertrophy templates
- Powerbuilding / strength-hypertrophy -> powerbuilding templates
- Strength -> strength templates
- Peak -> strength templates with peak lane constraints
- Power -> power templates
- Deload -> hypertrophy-family templates with deload/recovery constraints applied later

Workout types include:

- push
- pull
- legs
- upper
- lower
- full_body
- arms
- chest
- back
- shoulders

Each template is made of slots such as:

- primary compound
- heavy primary
- secondary compound
- power movement
- hypertrophy accessory
- isolation
- maintenance work

Body-part templates use session context separately from movement pattern:

- Chest sessions prioritise chest pressing and pec isolation, with optional push accessories.
- Back sessions prioritise vertical pulls, rows, lat/upper-back work, and rear-delt/trap support.
- Shoulders sessions prioritise shoulder press patterns, lateral delts, rear delts, and trap/scapular support.

Controlled crossover is intentional:

- Overhead/shoulder press patterns can appear in Shoulder, Push, Upper, and Full Body contexts.
- Lateral raises can appear in Shoulder, Push, Upper, and Full Body accessory slots.
- Face Pull, Rear Delt Fly, and related rear-delt work can appear in Shoulder, Pull, Upper, and Full Body support slots.
- Shrugs and trap work can appear in Shoulder, Pull, and Upper support slots.
- Chest fly work can appear in Chest, Push, and Upper accessory slots.

### Candidate filtering

Exercises are filtered by:

- equipment overlap
- experience level
- suitable block
- slot role
- movement pattern
- exercise family
- target muscles
- forbidden movement patterns/families
- whether the exercise is already selected in the session

Beginner filtering excludes advanced exercises. Intermediate and advanced users have broader access.

Equipment filtering checks whether an exercise shares equipment with the user's available equipment. This is useful, but it is not the same as requiring every equipment dependency to be available. Specialty variants should be reviewed carefully where entries include broad equipment tags.

### Scoring

`scoreExerciseForSlot` ranks candidate exercises using:

- role fit
- primary muscle fit
- movement pattern/family fit
- tier fit
- beginner friendliness
- custom exercise bonus
- recent progression evidence
- repeated drop-off/stall penalties
- stale-use penalty from history
- fatigue cost penalties
- structured variability scoring
- preference learning
- family redundancy penalties
- same-pattern redundancy penalties

This is not random selection. The highest scoring candidates win.

### Variant offset

After scoring, the generator chooses from a top pool using a deterministic offset.

Primary-like slots are stable by default:

- primary/heavy/power slots keep the highest-scoring stable candidate rather than rotating for novelty

Accessory/isolation slots rotate faster:

- isolation uses `variant + slotIndex * 2`
- other slots use `variant + slotIndex`

Accessory/isolation variation now comes from the controlled planned-rotation selector in active planned workouts.

### Block-specific behaviour

Hypertrophy:

- More accessories and isolation work.
- Larger productive set ranges.
- Accessories are where volume learning is most useful.
- Main compounds can appear, but the block bias is useful work and muscle-building volume.

Powerbuilding:

- Blends heavy primary work with hypertrophy support.
- Main lifts are more prominent.
- Accessories still matter.

Strength:

- Fewer exercise slots.
- Heavier primary/secondary work.
- Accessories become maintenance/support.
- Main-lift stability is more important.

Power:

- Power slots appear first.
- Strength support and maintenance work follow.
- Lower soft caps and quality emphasis are applied through lane/set logic.

Peak:

- Uses strength-family templates, then lane constraints make the main lift more specific and accessories more conservative.
- Variation should be limited through primary-lift specificity logic.

Deload:

- Uses hypertrophy-family selection fallback, but deload/recovery behaviour is applied through block/lane/set constraints.
- This is probably functional, but it is less explicit than a dedicated deload template.

### Goals

Goals affect planning and coaching more strongly than raw exercise selection.

Goal-specific effects are mostly applied through:

- macrocycle/block sequence
- block lanes
- progression throttle
- recovery/cardio system
- volume learning
- event/taper logic
- success model copy

Exercise selection changes by goal indirectly because different goals produce different blocks, and blocks change templates, lanes, rep ranges, and progression constraints.

### Experience level

Experience affects:

- candidate filtering
- generated exercise count
- generated set count
- advanced/high-skill exercise access
- progression conservatism elsewhere

Beginner users get fewer exercises/sets and avoid advanced exercises.

### Preferences, pain, and availability

Preference/reason systems influence future recommendations and swap ranking.

Reasons such as pain, unavailable equipment, dislike, preference, and temporary skip are tracked without treating every removal as performance failure.

Preference learning can:

- reduce ranking of avoided exercises
- suppress painful/limited exercises and close relatives temporarily
- boost preferred replacements
- avoid turning temporary skips into permanent dislikes
- protect primary lifts from accidental permanent suppression

### Fatigue and history

History and fatigue can influence selection through:

- stale exercise penalties
- repeated drop-off penalties
- stalled/progressing exercise scoring
- template trimming from repeated drop-offs
- primary-lift rotation recommendations
- personalised volume adjustments

The main planned-workout generation path now uses the planned selection layer for active planned workouts. Explicit historical selected-slot persistence is still a future enhancement, but active generation no longer bypasses the rotation path.

## 4. Current randomness/variation behaviour

### Is there randomness?

There is no meaningful randomness in workout exercise selection.

Search results show `Math.random` is not used by the workout generator for exercise choice. Randomness appears in unrelated places such as generated custom exercise IDs or rotating rest timer copy.

### Is selection seeded?

Exercise selection is deterministic, but not seeded in the usual sense.

The generator uses:

- input settings
- exercise library ordering
- scoring
- session index / supplied variant
- history and preference signals

The same user with the same plan, same history, same equipment, same preferences, and same selected session can receive the same workout.

### Can the same user get different workouts from the same settings?

Yes, but mainly when one of these changes:

- selected session index
- block
- history/stale-use score
- performance trend
- fatigue/drop-off evidence
- preference records
- approved volume adjustment
- approved exercise replacement
- explicit generator variant

The current production path now produces deterministic week-window rotation from the same settings when a current block is available.

### Controlled rotation utility

`src/domain/training/exercise-selection.ts` contains a stronger planned-selection utility:

- `selectPlannedExercisesForWeek`
- supports `rotationFrequency`
- can keep exercises stable inside a 4-week window
- can rotate after the window
- can preserve Tier A primary lifts
- can react to stalled exercise IDs
- has tests for 4-week stability and week-5 rotation

Current status:

This utility is now used by the main `buildPlannedWorkoutProgramme` path that creates active planned workouts. The app now has controlled planned rotation in production workout generation.

## 5. What is stable

### Main session structure

The weekly split is stable. Users will see the same session types each week until the plan/block changes.

Examples:

- Upper / Lower / Upper / Lower
- Push / Pull / Legs / Upper / Lower
- Full Body repeated

### Main lifts

Main lifts are relatively stable because:

- templates explicitly contain primary/heavy slots
- Tier A/primary exercises score well
- primary-like slots rotate more slowly than accessories
- structured primary lift variation logic exists
- accepted variation/replacement recommendations can apply to future sessions
- peak/strength lanes preserve specificity

Main-lift stability in the active generation path is now explicit: primary-like slots do not rotate for novelty when deterministic accessory rotation changes.

### Progression and coaching state

The programme adapts through:

- progression throttle
- rep range occupancy
- fatigue separation
- training gap adjustment
- power quality
- personalised volume learning
- volume ladder actions
- primary lift variations
- preference learning
- event/taper logic
- recovery/cardio recommendations

This means the app can feel adaptive even when exercise selection itself is stable.

### Approved replacements

Approved exercise replacements are applied to future planned sessions through plan recommendation state. This is a good stability mechanism because user-approved changes persist rather than disappearing.

## 6. What is repetitive

### Weekly sessions

Users should expect the same weekly session names each week inside a block. That is normal and appropriate for strength/hypertrophy training.

The question is whether the exercise contents vary enough.

Current risk:

- Same split
- Same session index
- Same block
- Same exercise library order
- Same scoring
- Wired week-based rotation key

That now produces stable workouts inside a rotation window and controlled accessory changes when the rotation window changes.

### Accessories

Accessories may rotate through:

- deterministic variant offset
- stale-use penalties
- preference learning
- volume ladder changes
- block transitions

There is now a production rule saying:

- keep accessories stable inside the configured rotation window
- allow accessories to rotate when the window changes
- keep productive accessories unless stale or disliked
- keep approved user replacements and preference suppression respected

The app should now feel more intentionally varied without becoming random.

### Blocks

Block changes affect rep ranges, set ranges, lanes, and templates. They may also change exercise selection because templates differ by block.

But if the same high-scoring exercises fit multiple blocks, users can still see many of the same movements unless history/preference/rotation pressure changes them.

## 7. Risks

### Resolved: body-part split has dedicated generator contexts

`weeklySplitForPlan` can output body-part sessions such as:

- Chest
- Back
- Shoulders

`workoutTypeForName` now maps:

- Chest -> Chest
- Back -> Back
- Shoulders -> Shoulders
- Legs -> Legs
- Arms -> Arms
- Full Body -> Full Body

Why it matters:

Visible body-part split sessions no longer fall through to blank planned workouts or crude Push/Pull/Upper fallbacks.

### Resolved: rotation frequency is wired into active planned workouts

`rotationFrequency` is stored on the active plan and the active planned-workout path now calls `selectPlannedExercisesForWeek`.

Why it matters:

The app's controlled-variation promise now matches the active planned workout path.

### Medium: tune accessory variation after beta feedback

Accessory selection has useful scoring, stale penalties, and an active block/week rotation contract.

Why it matters:

Hypertrophy and powerbuilding users may expect intelligently varied accessories over time. If the same accessories repeat every week, the app can feel less adaptive than the coaching system actually is.

Recommended fix:

After beta feedback, consider adding explicit stored accessory selection memory by block/week/session and user-facing keep/rotate controls.

Priority:

Medium.

Complexity:

Medium.

### Medium: deload exercise selection is not a dedicated template

Deload blocks fall back to hypertrophy-family templates, then deload/recovery constraints reduce the prescription.

Why it matters:

The load/set behaviour can still be conservative, but selection itself may not feel intentionally deload-specific.

Recommended fix:

Add explicit deload templates or a deload selection filter that favours familiar, low-skill, low-fatigue movements.

Priority:

Medium.

Complexity:

Low to medium.

### Medium: equipment matching may be too permissive for mixed-requirement exercises

Exercise filtering checks for equipment overlap. For exercises that effectively require multiple items or specialty equipment, overlap may be too broad.

Why it matters:

Specialty bar, chains, bands, boards, boxes, trap bars, and machines should not appear just because the user has generic barbell access.

Recommended fix:

Separate required equipment from optional equipment, or add stricter equipment groups for specialty variants.

Priority:

Medium.

Complexity:

Medium.

### Low: main-lift stability can be made even more explicit later

Main lifts are protected by templates/scoring/primary variation logic, and primary-like planned slots do not rotate for novelty.

Why it matters:

Strength progress depends on stable exposure. Primary lift changes should be deliberate, not score-order side effects.

Recommended fix:

Persist canonical primary lift anchors per block/session as a future auditability improvement.

Priority:

Low to medium.

Complexity:

Medium.

### Medium: user-facing “adaptive” promise may outpace exercise-selection delivery

The coaching intelligence is genuinely adaptive. Exercise selection is adaptive in scoring and recommendations, but less clearly adaptive as a planned rotation system.

Why it matters:

Users may expect visible workout variety. The app may instead deliver stable templates plus coaching adaptations.

Recommended fix:

Position stability as intentional, and add controlled visible rotation where it improves the product.

Priority:

Medium.

Complexity:

Low for copy, medium for system behaviour.

## 8. Recommended implementation

### 1. Keep body-part split templates covered by tests

Current mapping:

- `Chest` -> `chest`
- `Back` -> `back`
- `Shoulders` -> `shoulders`
- `Legs` -> `legs`
- `Arms` -> `arms`
- `Full Body` -> `full_body`

Current support:

- Chest, Back, and Shoulders have dedicated body-part templates.
- Exercise crossover is controlled by slot role, muscle target, movement pattern, and family.

Long-term option:

Tune exact body-part split volume/frequency after beta feedback.

### 2. Deepen planned exercise selection memory later

`selectPlannedExercisesForWeek` is wired into `buildPlannedWorkoutProgramme`.

Future improvement:

Persist selected exercise slots per plan/block/week/session for easier auditability and user-visible "keep/rotate" controls.

The selection layer should store:

- plan id
- block id
- week index
- session index
- selected exercise ids
- rotation window
- stable primary anchors
- accessory rotation candidates
- user locks/preferences
- reason for changes

Expected behaviour now:

- Main lifts remain stable.
- Accessories rotate at defined windows.
- Stalled primary lifts use structured variations.
- Preferences and equipment are respected.
- The same plan produces the same selections unless inputs change.

### 3. Maintain deterministic variation

The active path uses deterministic seed inputs such as:

- plan id
- block id
- week index
- session index
- rotation window
- goal
- experience level

Continue avoiding unseeded randomness.

Why:

Users should not get chaotic workouts, but the system should avoid stale identical accessories forever.

### 4. Define exercise stability tiers

Suggested rules:

- Tier A primary lifts: stable until block transition, stall, approved variation, pain/limitation, or equipment issue.
- Tier B secondary compounds: stable for a block or rotation window.
- Tier C accessories/isolation: rotate every 4-6 weeks, when stale, or when preference/fatigue evidence supports it.
- Power/peak specific lifts: very stable and highly constrained.
- Deload movements: familiar, low-skill, low-fatigue.

### 5. Add stale-exercise detection as a first-class recommendation

Current scoring has stale penalties. Make this visible and controlled.

Examples:

- “This accessory has done its job. Rotate next block?”
- “Keep Cable Fly”
- “Try Pec Deck”

This should affect accessories first, not primary lifts.

### 6. Add user controls

Useful controls:

- Keep this exercise
- Rotate next block
- Prefer this replacement
- Do not suggest this again for now

These should feed the existing preference-learning system.

### 7. Add dedicated deload selection policy

Deload should prefer:

- familiar exercises
- lower setup complexity
- lower skill demand
- low-fatigue machines/cables/dumbbells where appropriate
- fewer novelty movements

Avoid:

- new high-skill strength variations
- aggressive overload variants
- high-fatigue accessories

### 8. Improve equipment taxonomy strictness

Add or enforce:

- required equipment
- optional equipment
- specialty equipment
- substitute equipment

This will make expanded exercise library recommendations safer.

### 9. Keep the product promise honest

Recommended copy direction:

- “Your main lifts stay stable so progress has a target.”
- “Accessories rotate when they stop earning their place.”
- “Variation is controlled. Random workouts are not coaching.”

This is true to the app’s direction and avoids promising chaos disguised as variety.

## 9. Build/no-build recommendation

Recommendation:

The two build-blocking findings from this audit are fixed.

Build can proceed after normal regression if:

- body-part split generation remains covered by tests
- controlled planned rotation remains covered by tests
- beta accepts deterministic variation rather than random novelty

For serious beta:

Monitor whether users want more accessory variety or user-facing keep/rotate controls. That is now product tuning, not a known generation blocker.
