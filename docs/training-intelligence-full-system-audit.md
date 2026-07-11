# Training Intelligence Full System Audit

Date: 2026-07-09

Scope: source-level audit of the current programming, progression, recovery, deload, session-generation and workout-start lifecycle.

Production code changed: no.

## Executive Verdict

Adaptive Strength Coach currently contains several strong isolated coaching modules, but the full system is not yet a coherent, single-source programming engine.

The most important finding is a split-brain architecture:

- The legacy/planned workout path can generate multi-exercise, goal-shaped sessions using templates, exercise filters, evidence-based set prescriptions, load history, progression throttles, fatigue trimming and volume adjustments.
- The active V2 CoachingPacket path used by the live workout logger can still produce a one-exercise planned workout from a single matched exercise, with hardcoded loading inputs and weak validation.
- The Home/Today preview path can differ from the active workout path, especially when the legacy rollback flag is off.

This means the app may look like it has a sophisticated training brain in tests, docs or preview utilities, while the actual “Start Workout” path can bypass much of that intelligence.

Shippability verdict:

- Safe as an app runtime: partially.
- Safe as an adaptive programming engine: not yet.
- Coherent: no.
- Trustworthy enough to market as elite adaptive coaching: no.
- Ready for broad TestFlight coaching-quality validation: only if the goal is to find programming failures, not to prove readiness.

The current engine is not reckless in every direction. Many modules are conservative and well-guarded: deload evidence requires multiple sessions, load regression requires repeated signals, and progression throttles often suppress risky increases. The problem is deeper: the system does not have one authoritative path that assembles the final workout from all coaching decisions.

## Architecture Map

```text
Onboarding / Setup
  -> createActiveTrainingPlan
  -> ActiveTrainingPlanRepository
  -> blocks, split, goal, experience, equipment default

Home / Today
  -> buildHomeDashboardViewModel
  -> optional planned workout preview only when legacy rollback is enabled
  -> Start Today action
      -> selected programme day if preview exists
      -> open workout if present
      -> onboarding route otherwise

Train / Start Workout
  -> useWorkoutLogger initializer
      -> latest open workout if present
      -> selected programme day
          -> createSessionFromProgrammeDay
              -> createV2LiveWorkoutSession
                  -> createProductionWorkoutFromCoachingPacketPipeline
                  -> buildWorkoutSessionFromCoachingPacket
              -> legacy fallback only if rollback enabled
      -> active training plan
          -> createSessionFromActivePlan
              -> createV2LiveWorkoutSession
              -> legacy fallback only if rollback enabled
      -> selected single exercise fallback
      -> selected fallback session

Legacy / Planned Session Path
  -> buildPlannedWorkoutProgramme
      -> generateWorkoutByFocus
      -> templateMap by block family and workout type
      -> selectPlannedExercisesForWeek
      -> apply exercise replacements
      -> applyVolumeAdjustmentsToProgramme
      -> buildWorkoutSessionFromProgrammeDay

V2 CoachingPacket Path
  -> createProductionCoachingPacket
      -> living athlete snapshot
      -> adaptation status
      -> recovery management
      -> intervention resolver
      -> session objective
      -> required support functions
      -> exercise matching
      -> method selection
      -> loading progression policy
      -> session composition/resource allocation
      -> selected_exercises
  -> validateResolvedWorkoutIntent
  -> buildWorkoutSessionFromCoachingPacket

Workout Logging
  -> logSetAtIndex
      -> progression-engine drop-off and load increase
      -> in-session load drop suggestion
      -> live session events/state/evidence/decision/candidates/mutations
  -> finishWorkout
      -> post-workout loop
      -> living athlete model save
      -> workout history save
      -> week advancement check

History / Learning
  -> summarizeWorkoutHistory
  -> load regression recommendations
  -> strategic coaching signals
  -> personalized volume analysis
  -> deload prescription
  -> training momentum
```

## Primary Files And Responsibilities

| Area | File | Current responsibility |
|---|---|---|
| Active workout startup | `src/features/workout-logging/use-workout-logger.ts` | Decides whether to resume an open workout, build from selected programme day, build from active plan, or fall back. This is the most important runtime path. |
| CoachingPacket pipeline | `src/domain/training/coaching-packet-pipeline.ts` | Builds the production ResolvedWorkoutIntent/CoachingPacket and converts it into a workout session. Currently can select only one exercise. |
| CoachingPacket validation/build | `src/domain/training/coaching-packet.ts` | Validates packet shape and builds `WorkoutSession`. Validation is structural, not coach-quality validation. |
| Planned workout builder | `src/domain/training/planned-workout.ts` | Builds planned multi-exercise programme days using ad-hoc generator, exercise rotation and volume adjustments. |
| Ad-hoc workout generator | `src/domain/training/ad-hoc-workout-generator.ts` | Template-based multi-exercise session generator by block family and workout type. |
| Exercise rotation | `src/domain/training/exercise-selection.ts` | Selects planned exercises for a week; supports rotation and stale exercise detection, but production call does not appear to pass prior selections. |
| Plan setup | `src/domain/training/plan-setup.ts` | Creates active plans, blocks, split, equipment defaults and week progression. |
| Annual/block model | `src/domain/training/annual-planner.ts` | Defines block defaults, macrocycle structure, and some block action recommendations. |
| Load selection | `src/domain/training/load-selection.ts` | Exact-history and same-family load recommendation for planned path. |
| Loading policy | `src/domain/training/loading-progression-policy.ts` | Packet-path load/method policy. Currently fed hardcoded load inputs in the packet pipeline. |
| Progression engine | `src/domain/training/progression-engine.ts` | Set-level drop-off, completion and load-increase logic. |
| Progression throttle | `src/domain/training/progression-throttle.ts` | Holds/pulls/pushes progressions based on fatigue, phase, taper, gaps and session evidence. |
| Training gaps | `src/domain/training/training-gap-adjustment.ts` | Reduces load after short/moderate/long/extended gaps. |
| Workout history | `src/domain/training/workout-history.ts` | Converts completed workouts into progression/load evidence. |
| Strategic coaching | `src/domain/training/strategic-coaching.ts` | Produces strategic signals and recommendations from history. |
| Deload prescription | `src/domain/training/deload-prescription.ts` | Data-led deload recommendation with minimum evidence requirements. |
| Recovery engine | `src/domain/training/recovery-management-engine.ts` | Assesses recovery-management state for intervention decisions. |
| Fatigue evidence | `src/domain/training/fatigue-evidence.ts` | Classifies shutdowns as productive, expected, regressive or neutral. |
| Fatigue classifier | `src/domain/training/fatigue-classifier.ts` | Classifies local/systemic/mixed fatigue when enough evidence exists. |
| Personalized volume | `src/domain/training/personalised-volume.ts` | Estimates per-muscle volume status and recommends ladder actions. |
| Volume adjustments | `src/domain/training/volume-adjustments.ts` | Applies approved volume actions to planned programme slots. |
| Home dashboard | `src/domain/training/home-dashboard.ts` and `app/(protected)/(tabs)/index.tsx` | Displays today state and optionally previews planned workouts. |

## All Session-Generation Paths

### 1. Active Plan Start, Default Runtime Path

Entry:

- `useWorkoutLogger`
- `createSessionFromActivePlan`
- `createV2LiveWorkoutSession`
- `createProductionWorkoutFromCoachingPacketPipeline`

Current behaviour:

- Picks the recommended split session from the active plan.
- Builds a V2 CoachingPacket.
- Returns a workout only if the packet path succeeds.
- Falls back to legacy planned generation only if the legacy workout rollback flag is enabled.

Major issue:

The V2 packet path currently creates one selected exercise in `createProductionCoachingPacket`. The live session validator only requires at least one exercise. Therefore a normal planned workout can pass as valid with one exercise.

### 2. Selected Programme Day Path

Entry:

- `useWorkoutLogger`
- `programmeRepository.getSelectedProgrammeDay`
- `createSessionFromProgrammeDay`

Current behaviour:

- If selected day is `planned`, it attempts the V2 packet path.
- If selected day is not planned, it builds from the selected programme day using `buildWorkoutSessionFromProgrammeDay`.
- If V2 fails and rollback is off, it clears the selected day and returns null.

Risk:

The selected day can be richer than the generated V2 session, but the V2 path becomes authoritative for planned days. This can discard the richer programme-day structure.

### 3. Legacy/Planned Workout Path

Entry:

- `buildPlannedWorkoutProgramme`
- `generateWorkoutByFocus`
- `selectPlannedExercisesForWeek`
- `buildWorkoutSessionFromProgrammeDay`

Current behaviour:

- Uses templates by block family and workout type.
- Creates multi-exercise sessions.
- Uses role, movement pattern, muscle, equipment, fatigue cost, experience, block and recent exercise exposure.
- Applies replacements and volume adjustments.

This path is materially more complete as a session generator than the active packet path, but it is not the default active path when rollback is disabled.

### 4. Home/Today Preview Path

Entry:

- `app/(protected)/(tabs)/index.tsx`
- `buildHomeDashboardViewModel`
- optional `buildPlannedWorkoutProgramme`

Current behaviour:

- Home builds `todayProgramme` only if an active plan exists, workout type exists and legacy rollback is enabled.
- If rollback is off, the home screen may not have a planned programme preview.
- The Start action uses the preview if present, continues an open workout if present, otherwise can route to onboarding.

Major issue:

Preview and active workout generation can differ. Worse, with rollback off, Home may not build a programme preview at all, even though Train can build from the active plan through the packet path.

### 5. Selected Single-Exercise/Fallback Path

Entry:

- `useWorkoutLogger`
- selected exercise repository
- `createSelectedFallbackSession`

Current behaviour:

- Builds a one-exercise session intentionally.

This is valid only when the user explicitly selected a single movement or fallback state. It must not be confused with normal programme generation.

### 6. Extra Session / Capacity Path

Entry:

- Home extra session utilities
- extra session generator

Current behaviour:

- Extra sessions are treated differently in history. They do not count as planned progression evidence.

This is good, but it creates another path with separate assumptions.

### 7. Test / Sample / QA Paths

Several tests and sample generators exercise the planned path, the packet path, or synthetic session builders independently.

Risk:

Many tests prove modules work in isolation, but they do not prove the production Start Workout path produces a complete, goal-matched session.

## Progression, Load And Volume Rules

### Load Selection

Current intended rule:

Use the highest-quality available evidence:

1. exact exercise history
2. related/same-family estimate
3. training gap adjustment
4. conservative fallback

Implemented in:

- `src/domain/training/load-selection.ts`
- `src/domain/training/workout-history.ts`
- `src/domain/training/training-gap-adjustment.ts`

What can increase load:

- Completed required work sets within range.
- Best set reaches top of rep range.
- Progression throttle returns `push`.
- Recent exercise history supports next recommended load.

What can decrease load:

- Clear rep-range miss across required sets.
- Repeated regression over multiple exposures.
- Training gap.
- Fatigue/recovery/taper/phase throttle.
- In-session below-minimum set can trigger a next-set drop.

Good guardrails:

- Load regression requires repeated evidence.
- Training gap reductions are scoped by gap length and exercise context.
- One bad set does not normally create long-term regression by itself.

Major inconsistency:

The planned path uses `resolveStartingLoadRecommendation`. The active packet path uses `decideLoadingProgression` with hardcoded values:

- `estimatedAbility: 100`
- `trainingMax: 90`
- `previousLoad: 60`

That means the packet path can ignore the stronger load-selection hierarchy.

### Progression Rules

Current intended rule:

Progress only when the athlete has completed the required quality work and the current phase/fatigue context permits it.

Implemented in:

- `progression-engine.ts`
- `progression-throttle.ts`
- `load-selection.ts`
- `workout-history.ts`

Increase triggers:

- Required sets completed.
- Best set reaches or exceeds rep-range maximum.
- Load was stable enough.
- Fatigue and phase allow progression.

Decrease/hold triggers:

- Deload/recovery/peak lanes.
- Training gap.
- Systemic or local fatigue.
- Repeated decline.
- Repeated drop-off.
- Event taper.
- Power-quality degradation.

Risk:

The planned path has nuanced progression throttles. The packet path collapses much of the evidence into coarse `recentPerformanceSignal`, `loadOwnership` and hardcoded loading data.

### Volume Rules

Current intended rule:

Volume should respond to goal, phase, experience, exercise role, fatigue, history and personalized volume status.

Implemented in:

- `ad-hoc-workout-generator.ts`
- `personalised-volume.ts`
- `volume-adjustments.ts`
- `strategic-coaching.ts`

Increase triggers:

- Under-dosed muscle with enough history.
- Low fatigue.
- Poor progression rate with stable/recoverable signals.
- Goal-specific bias toward more volume.
- Approved volume adjustment record.

Decrease triggers:

- High cost / overreaching volume status.
- Deload/taper/peak suppression.
- Systemic or mixed fatigue.
- Repeated shutdowns.
- Recent high volume and drop-offs in generator trimming.

Good guardrails:

- Personalized volume requires minimum weeks, exposures and productive sets.
- Deload and peak blocks suppress aggressive volume changes.
- Approval logic prevents repeated weekly increases for the same muscle.

Major inconsistency:

Volume adjustments are applied inside `buildPlannedWorkoutProgramme`. The active V2 packet path does not use this final slot-level volume machinery. Therefore the app may calculate volume intelligence that does not affect the active workout.

## Fatigue, Recovery And Deload Rules

### In-Session Fatigue

Implemented in:

- `progression-engine.ts`
- `adaptive-set-allocation.ts`
- `fatigue-evidence.ts`

Rules:

- Compare latest set against best set and configured drop-off threshold.
- Stop or hold when performance drop-off suggests fatigue.
- Classify shutdowns contextually as productive, expected, regressive or neutral.

Strength:

The fatigue evidence classifier is more nuanced than a simple “stopped equals bad” model.

Weakness:

The active session startup helper `recentPerformanceSignalFor` treats any recent `stoppedByDropOff` as `overreached`, which is less nuanced than the fatigue evidence classifier.

### Recovery Management

Implemented in:

- `recovery-management-engine.ts`
- `strategic-coaching.ts`
- `use-workout-logger.ts`

Rules:

- Confidence-gated recovery assessment.
- Pain, repeated failed sets, fatigue trends, high density and missed sessions can influence recovery status.
- Low confidence returns monitor/insufficient evidence.

Weakness:

In the active packet pipeline, `missedSessions` is hardcoded to zero. That means the recovery engine has a missed-session input, but the active packet path does not currently feed it meaningful data.

### Deload Logic

Implemented in:

- `deload-prescription.ts`
- `strategic-coaching.ts`
- `annual-planner.ts`
- block specs from `plan-setup.ts`

Rules:

- Data-led deload prescription requires at least four planned sessions and four exercise entries.
- Shutdown rate must be high and paired with fatigue/declining volume tolerance/falling quality.
- Severity adjusts set and load reductions.

Good guardrail:

The app should not data-trigger a deload after one or two bad sessions.

Risk:

Fixed deload blocks exist in macrocycle construction, while data-led deloads exist separately. The active plan transition logic does not clearly unify calendar deloads, evidence-led deloads and actual block activation.

## Missed-Session Handling

Current implementation:

- There is no clear first-class missed-session event in the active plan lifecycle.
- Absence from training is mostly represented by training gaps.
- Training gap adjustment reduces load based on days since last workout or exercise.
- Some engines accept `missedSessions`, but active packet construction sets it to zero.
- Week advancement requires completed planned sessions. A missed session does not appear to be explicitly marked, skipped, rescheduled or interpreted.

Risks:

- The app can confuse “life got busy” with fatigue if missed sessions later feed recovery engines without context.
- The app can also ignore missed sessions entirely in the current packet path.
- Uncompleted planned weeks may stall because advancement is completion-based.
- There is no obvious authoritative policy for rescheduling, compressing, repeating or skipping missed work.

## Block Transition Logic

Current implementation:

- `createActiveTrainingPlan` creates a sequence of blocks.
- `completeCurrentPlanWeek` increments `currentWeek`.
- At the end of a block it sets `recommendationState.blockDecision` to `decided_later`.
- It does not clearly activate the next block.
- `annual-planner.ts` has a separate `completeBlock` function for a `TrainingYear` structure, not obviously the same structure as `ActiveTrainingPlan`.
- `strategic-coaching.ts` can recommend advancing, extending, deloading, increasing or reducing volume, but this appears more advisory than authoritative mutation.

Risk:

Long-term programming can become stuck or advisory-only at block boundaries unless another uninspected route resolves `decided_later`.

## Fallback And Default Prescription Paths

Important fallbacks/defaults:

| Default/fallback | Where | Risk |
|---|---|---|
| Full gym equipment regardless of preset/custom input | `plan-setup.ts` | User can receive exercises requiring unavailable equipment. |
| V2 packet load inputs `100/90/60` | `coaching-packet-pipeline.ts` | Active workouts may receive fake load context. |
| Packet selected exercises array contains one selected candidate | `coaching-packet-pipeline.ts` | Normal sessions can become one-exercise workouts. |
| Packet validation only requires at least one exercise | `coaching-packet.ts` and `use-workout-logger.ts` | Invalid/underbuilt sessions pass validation. |
| Home preview only builds planned workout when rollback enabled | `app/(protected)/(tabs)/index.tsx` | Start flow can diverge or route to onboarding. |
| Same-family load estimate requires enough related evidence; otherwise blank | `load-selection.ts` | Planned path may show no load where packet path invents one. |
| Active plan block end becomes `decided_later` | `plan-setup.ts` | Block transition may not occur automatically. |
| Missed sessions hardcoded to zero in packet path | `coaching-packet-pipeline.ts` | Recovery/adaptation misses an important input. |
| Recovery flag marks deload block as poor recovery | `use-workout-logger.ts` | Phase and recovery can be conflated. |
| Swap copies target prescription to replacement | `use-workout-logger.ts` | Replacement exercise can inherit unsuitable load/reps. |

## Where Active Workouts Differ From Previews And Tests

### Active path vs planned preview

The active path defaults to V2 CoachingPacket generation. The preview/planned path uses `buildPlannedWorkoutProgramme` only when legacy rollback is enabled.

Therefore:

- Home can preview one thing and Train can start another.
- Home can lack a preview while Train can still generate something.
- Start Today can route to onboarding when no preview/open workout exists, even though the active plan may be workout-ready through another path.

### Active path vs planned tests

Planned workout tests assert multi-exercise sessions and rich templates. Packet pipeline tests only assert that selected exercises are greater than zero.

This means the test suite can pass while the runtime V2 path still produces a one-exercise normal workout.

### Active path vs load tests

Load-selection tests validate exact history, related history, training gap and regression logic. But the packet path currently feeds hardcoded loading inputs into the loading progression policy.

Therefore load-selection correctness does not guarantee active packet load correctness.

### Active path vs volume tests

Personalized volume and volume adjustment tests validate thoughtful volume laddering. But volume adjustments apply to planned programme slots, not the packet selected exercise list.

Therefore personalized volume correctness does not guarantee active session volume quality.

### Active path vs fatigue tests

Fatigue classifiers distinguish productive shutdowns from regressive fatigue. But active startup helpers use coarser rules such as “any stopped by drop-off means overreached.”

Therefore fatigue evidence tests can pass while active session state receives a crude performance signal.

## Full Lifecycle Audit By Area

### 1. Programme / Block Generation

Intended rule:

Create a goal-appropriate training year/block sequence with a weekly split and block defaults.

Implemented in:

- `plan-setup.ts`
- `annual-planner.ts`

Inputs:

- goal
- days per week
- experience
- recovery/cardio
- event date/type
- equipment preset/custom equipment

Current assumptions:

- Equipment is effectively full gym.
- Block sequence is mostly fixed by goal/event.
- Deload blocks are inserted by plan templates.

Bad edge cases:

- User equipment limits can be ignored.
- Blocks can reach `decided_later` without clear activation of the next block.
- Strategic recommendations may not mutate the actual active plan.

Protected by tests:

- Some plan setup and weekly split tests exist.

Missing tests:

- End-of-block transition in active plan.
- Equipment-limited plan generation.
- Event-driven block transition through real completion history.

### 2. Session Generation

Intended rule:

Generate a complete, goal-matched, workout-ready session from programme context and CoachingPacket.

Implemented in:

- `use-workout-logger.ts`
- `coaching-packet-pipeline.ts`
- `planned-workout.ts`
- `ad-hoc-workout-generator.ts`

Current assumptions:

- V2 packet path is valid if at least one exercise exists.
- Legacy fallback is only allowed with rollback.

Bad edge cases:

- Normal session can be one exercise.
- Packet objective can be broad (`hypertrophy_focus`, `posterior_chain_development`) rather than a precise mission.
- The active path can bypass planned generator quality.

Protected by tests:

- Packet tests prove structural packet building.
- Planned tests prove templates can produce multi-exercise days.

Missing tests:

- Production start path must produce complete sessions for every current plan type.
- Home preview and Train active workout parity.
- Packet validator rejecting one-exercise normal sessions.

### 3. Exercise Selection

Intended rule:

Select exercises by role, movement, muscle, fatigue cost, phase, experience and progression value.

Implemented in:

- `ad-hoc-workout-generator.ts`
- `exercise-selection.ts`
- `exercise-matching.ts`
- `coaching-packet-pipeline.ts`

Current assumptions:

- Planned path uses template slot scoring.
- Packet path uses support function matching and selects one candidate.

Bad edge cases:

- Active packet path cannot create a coherent session composition if only one exercise is selected.
- Equipment comes from the entire library in active packet context.
- Planned rotation may not use previous selections because previous selections are not passed by the main planned builder.

Protected by tests:

- Planned generator and exercise swap tests.
- Exercise intelligence tests from recent work may exist, but active path still must be validated.

Missing tests:

- Active path exercise selection across goals/splits.
- Equipment restrictions.
- Rotation persistence.

### 4. Set / Rep Prescription

Intended rule:

Sets and reps should reflect goal, phase, method, role, experience and recovery.

Implemented in:

- `ad-hoc-workout-generator.ts`
- `annual-planner.ts`
- `progression-engine.ts`
- `loading-progression-policy.ts`
- recent Session Engine V2 modules if present

Current assumptions:

- Planned path has evidence-based slot prescription and lane constraints.
- Packet loading policy can still return range-like text and generic method prescriptions.

Bad edge cases:

- Packet method/loading text may not guarantee exact per-set reps.
- UI tests may confirm packet values match rendered values, but not that the packet values are coach-quality.

Protected by tests:

- Recent rep prescription tests may cover sample engine functions.
- Planned workout tests cover block-family rep ranges.

Missing tests:

- Active packet `WorkoutSession` contains exact set-level reps for every rendered set.
- No unresolved ranges in final athlete-facing prescription across active path.

### 5. Load Prescription

Intended rule:

Use exercise-specific history first, then related history, then conservative fallback.

Implemented in:

- `load-selection.ts`
- `training-gap-adjustment.ts`
- `workout-history.ts`
- `loading-progression-policy.ts`

Current assumptions:

- Planned path has proper history hierarchy.
- Packet path has hardcoded loading context.

Bad edge cases:

- Active path can ignore exact history.
- Packet can prescribe from fake defaults.
- Swaps can inherit inappropriate load from the replaced exercise.

Protected by tests:

- Load-selection tests.
- Regression tests.

Missing tests:

- Active packet path uses exact history.
- Swap replacement load is recalculated or clearly marked uncertain.

### 6. Volume Progression

Intended rule:

Volume should increase, decrease, bias or hold based on productive volume evidence and fatigue.

Implemented in:

- `personalised-volume.ts`
- `volume-adjustments.ts`
- `ad-hoc-workout-generator.ts`

Current assumptions:

- Minimum evidence protects against premature changes.
- Adjustments apply to planned programme slots.

Bad edge cases:

- Active packet path may not consume volume adjustment output.
- Volume intelligence can be visible/advisory but not authoritative.

Protected by tests:

- Personalized volume tests.
- Volume adjustment tests.

Missing tests:

- Personalized volume changes alter the next active workout.
- Volume changes do not affect extra-session evidence as planned progression.

### 7. Intensity Progression

Intended rule:

Progress intensity only when performance and context support it.

Implemented in:

- `progression-engine.ts`
- `progression-throttle.ts`
- `load-selection.ts`

Increase triggers:

- Top-of-range performance.
- Required quality work completed.
- Fatigue and phase allow push.

Decrease/hold triggers:

- Failed ranges.
- Regression.
- Fatigue.
- Deload/peak/taper/gap.

Risk:

The throttle is conservative, but can potentially create a low-progress trap if many caution signals stack without a clear path back to push.

Missing tests:

- Recovery from hold/pull-back state into progression once performance improves.

### 8. Fatigue Modelling

Intended rule:

Separate local fatigue, systemic fatigue, productive shutdown and regressive fatigue.

Implemented in:

- `fatigue-evidence.ts`
- `fatigue-classifier.ts`
- `recovery-management-engine.ts`

Strength:

The source modules are nuanced and evidence-gated.

Weakness:

Active startup summarisation is cruder than the detailed fatigue modules.

Missing tests:

- Productive hypertrophy shutdown does not cause the next active workout to be treated as overreached.

### 9. Recovery / Readiness Logic

Intended rule:

Use objective response and recovery signals to adjust stress without overreacting.

Implemented in:

- `recovery-management-engine.ts`
- `strategic-coaching.ts`
- `use-workout-logger.ts`

Risk:

Some recovery inputs exist but are not fed in active packet generation. Others are compressed into coarse flags.

Missing tests:

- Active packet stress changes after high-confidence poor response.
- Active packet does not change mission after one noisy poor session.

### 10. Missed-Session Handling

Intended rule:

A missed session should be distinguished from fatigue, regression and lack of ability.

Implemented in:

- partly `training-gap-adjustment.ts`
- partly `recovery-management-engine.ts`
- partly not implemented as a first-class workflow

Risk:

Missed sessions are not clearly represented. Absence becomes either a training gap or nothing.

Missing tests:

- Missed one planned session.
- Missed a full week.
- Returned after 2, 4, 8 weeks.
- Missed training does not falsely trigger deload.
- Missed training does trigger appropriate ease-in.

### 11. Deload Logic

Intended rule:

Deload only with enough objective evidence or planned block structure.

Implemented in:

- `deload-prescription.ts`
- `annual-planner.ts`
- `strategic-coaching.ts`

Strength:

Evidence-led deload is well guarded.

Risk:

Calendar deload blocks, strategic deload recommendations and active block mutation are not unified into one authoritative policy.

Missing tests:

- Planned deload block versus evidence-led deload conflict resolution.

### 12. Overreach / Push Phases

Intended rule:

Use overreach only deliberately, not accidentally.

Implemented in:

- block defaults
- personalized volume actions
- progression throttle

Current weakness:

There is no obviously authoritative overreach state in the active workout path. Overreach can be inferred from volume/fatigue but not clearly owned.

Missing tests:

- Planned overreach phase increases stress and recovery expectation coherently.
- Non-overreach phases cannot accidentally overreach through stacked increases.

### 13. Plateau Detection

Intended rule:

Detect plateau only after repeated evidence, not one bad workout.

Implemented in:

- `adaptation-detection-engine.ts`
- `annual-planner.ts`
- `load-selection.ts`

Strength:

Requires comparable exposure and confidence.

Weakness:

Active packet path simplifies trends heavily and may not benefit from the richer logic.

Missing tests:

- Sparse history remains unknown, not plateaued.
- Improving performance exits plateau/hold state.

### 14. Regression Handling

Intended rule:

Reduce load/volume only after repeated or high-confidence poor response.

Implemented in:

- `load-selection.ts`
- `workout-history.ts`
- `strategic-coaching.ts`

Strength:

Load regression requires repeated evidence.

Risk:

Workout history summary mutates nextRecommendedLoad through regression recommendations, so downstream consumers may not see raw versus adjusted evidence clearly.

Missing tests:

- Raw history and adjusted recommendation are both inspectable.

### 15. Return-To-Training Logic

Intended rule:

Reduce load based on training gap and confidence.

Implemented in:

- `training-gap-adjustment.ts`

Strength:

Specific gap thresholds and reductions exist.

Risk:

Return-to-training may stack with conservative recovery and progression throttle holds, creating an overly timid restart.

Missing tests:

- Return from long gap restores progression after successful sessions.

### 16. Swap Logic Impact

Intended rule:

Swaps should preserve workout flow without corrupting progression evidence.

Implemented in:

- `use-workout-logger.ts`
- `exercise-swaps.ts`
- `workout-history.ts`

Strength:

Swap history is preserved.

Risk:

Replacement can inherit load/settings from the original exercise. This is dangerous when the replacement has different loading characteristics.

Missing tests:

- Swap from machine to free weight.
- Swap bilateral to unilateral.
- Swap heavy compound to isolation.
- Swap does not create false direct history for replacement.

### 17. Completion / Incomplete-Session Impact

Intended rule:

Completed planned work should influence progression. Incomplete sessions should be interpreted carefully.

Implemented in:

- `workout-history.ts`
- `training-session-selection.ts`
- `use-workout-logger.ts`

Current behaviour:

- Only completed sessions summarize into history.
- Extra sessions do not count as planned progression.
- Manual finish can suppress progression unless reason is acceptable.

Risk:

Aborted/open/incomplete sessions may have little structured impact unless encoded as completion evidence.

Missing tests:

- Aborted workout because of pain.
- Incomplete because of time.
- Incomplete because user quit.
- Incomplete because app crash/open session.

### 18. Long-Term Block Transitions

Intended rule:

Blocks should advance, repeat, deload or adjust based on plan and evidence.

Implemented in:

- `plan-setup.ts`
- `annual-planner.ts`
- `strategic-coaching.ts`

Weakness:

There is no clear single mutation path that turns strategic recommendation into active plan transition.

Missing tests:

- Full block lifecycle through multiple weeks.
- End-of-block with high readiness.
- End-of-block with low readiness.
- Evidence-led deload inserted before next block.

## Top 10 Highest-Risk Behaviours

1. Normal active workouts can be generated as one-exercise sessions.
2. Active packet path uses hardcoded load context instead of the load history hierarchy.
3. Home/Today preview and Train active workout generation can diverge.
4. Start Today can route completed users to onboarding when preview/open workout state is missing.
5. Equipment constraints are effectively full gym.
6. Volume and personalized progression modules can be bypassed by the active packet path.
7. Deload/recovery/block recommendations are fragmented and not clearly authoritative.
8. Missed sessions are not first-class and can be ignored or misread.
9. Swap logic can inherit inappropriate load/prescription.
10. Tests validate modules but not the complete production generation path.

## Root-Cause Candidates For Unreliable Programming

### Root Cause 1: Split-Brain Session Generation

There are two main brains:

- planned template engine
- V2 CoachingPacket engine

The active workout path prefers the packet engine, while many quality protections and tests live in the planned engine.

### Root Cause 2: Packet Validation Is Not Coaching QA

Packet validation checks that a packet has fields. It does not check that the workout deserves to exist.

It does not enforce:

- complete normal session composition
- minimum productive volume
- multiple responsibilities
- valid primary/support balance
- load source trust
- equipment compatibility
- goal-specific session quality

### Root Cause 3: Hardcoded Active Loading Inputs

The packet pipeline feeds fake/default loading values to the loading progression policy. This undermines exact history, related history and training gap logic.

### Root Cause 4: Feedback Loops Are Advisory Or Path-Specific

Strategic coaching, volume recommendations, fatigue classification and deload prescriptions exist, but not all of them authoritatively shape the active workout.

### Root Cause 5: Tests Protect The Wrong Boundaries

Most tests protect individual modules. The most important product boundary is:

```text
Completed onboarding / active plan
  -> Start Workout
  -> rendered active workout
  -> log workout
  -> finish
  -> next workout changes correctly
```

That boundary is under-tested.

## Proposed Architecture Fix

Do not patch individual examples first. Fix the authority model.

### 1. Choose One Authoritative Session Builder

The final active workout must come from one path:

```text
ActivePlan + AthleteHistory + ProgrammeState
  -> SessionEngine
  -> CoachingPacket
  -> WorkoutSession
  -> UI
```

The planned generator can be absorbed as an implementation detail, but it should not be a separate fallback brain.

### 2. Make CoachingPacket The Final Contract, Not The Whole Brain

The packet should be the authoritative rendered output, but not a thin one-exercise artifact.

It must carry:

- objective
- supporting focus
- block/phase
- recovery/volume/loading/progression budgets
- exercise responsibilities
- selected exercises
- method
- sets
- exact reps
- load
- rest
- warm-up
- rationale
- quality state

### 3. Replace Structural Validation With Coaching QA

Validation should reject or repair:

- one-exercise normal sessions
- missing primary movement
- missing support responsibilities
- missing/placeholder loads
- unsupported equipment
- excessive systemic fatigue
- unplanned deload/overreach
- fake PR targets
- unresolved ranges
- preview/active mismatch

### 4. Wire Existing Intelligence Into Active Path

The active session builder must consume:

- exact exercise history
- related history
- training gaps
- personalized volume
- strategic signals
- deload prescription
- fatigue classifier
- active plan block/week state
- equipment constraints
- missed-session state

### 5. Make Missed Sessions First-Class

Add a policy for:

- skipped session
- missed week
- late completion
- reschedule
- repeat week
- compress week
- return-to-training

Absence must not automatically mean fatigue, and it must not be ignored.

### 6. Unify Block Transition Authority

One module should own:

- week advancement
- block completion
- next block activation
- evidence-led extension
- evidence-led deload
- event taper
- block repeat

### 7. Build End-To-End Smoke Matrices

Tests should cover the real production path, not just modules.

## Test Plan Before Implementation

### A. Production Path Session Generation

For every current onboarding-supported plan type:

- create active plan
- complete onboarding
- Start Workout
- assert active workout does not route to onboarding
- assert normal session has complete session structure
- assert packet and UI values match
- assert no one-exercise normal session

Cover:

- push
- pull
- legs/lower
- upper
- full body
- hypertrophy
- strength
- fat loss
- athletic
- general fitness
- new user
- existing user
- reduced recovery
- deload
- variation/rejuvenation

### B. Packet Contract Tests

Assert packet contains:

- primary objective
- secondary objective
- block/phase
- progression target
- exercise responsibilities
- exact sets/reps/load/rest
- source/confidence for load
- rationale without debug wording
- quality state

Reject:

- one-exercise normal session
- unresolved ranges
- missing loads for loaded movements
- fake first benchmark when direct history exists
- full-gym exercise when equipment unavailable

### C. Active vs Preview Parity

For each active plan:

- Home preview workout
- Train active workout
- Session Prep selected day

All must resolve to the same packet/session identity or explicitly explain why they differ.

### D. Load Progression Tests

Cover:

- exact history
- close variation history
- same movement family history
- machine to free weight
- free weight to machine
- bilateral to unilateral
- training gap
- repeated regression
- successful progression after hold
- swap replacement load recalculation

### E. Volume Progression Tests

Cover:

- insufficient data no volume change
- earned volume increase
- high-cost volume reduction
- deload suppression
- taper suppression
- extra sessions not counted as planned progression
- personalized volume affects active workout
- low-volume trap escape after good evidence

### F. Fatigue / Recovery Tests

Cover:

- productive hypertrophy shutdown
- regressive shutdown
- local fatigue
- systemic fatigue
- pain/safety
- one bad session does not deload
- repeated poor response does reduce stress
- missed session does not equal fatigue

### G. Missed Session Tests

Cover:

- missed one session
- missed all sessions in week
- returned after 8, 14, 21, 35+ days
- repeat week
- compress week
- skip/reschedule
- return-to-training ramp

### H. Block Transition Tests

Cover:

- complete week
- complete block
- activate next block
- evidence-led extend
- evidence-led deload
- planned deload block
- high-readiness advance
- low-readiness repeat/reduce
- event taper

### I. Swap Tests

Cover:

- machine to dumbbell
- barbell to machine
- bilateral to unilateral
- compound to isolation
- exercise-specific history preservation
- replacement load confidence
- swap does not corrupt future progression

### J. Longitudinal Simulation Tests

Run 8-12 simulated weeks per goal:

- improving athlete
- struggling athlete
- inconsistent athlete
- returning athlete
- equipment-limited athlete
- advanced strength athlete
- beginner hypertrophy athlete

Assert:

- sessions remain complete
- progression happens when earned
- deloads happen only with evidence or plan
- volume does not collapse permanently
- loading does not overreach too soon
- block transitions happen

## Final Assessment

The current system is not fundamentally devoid of intelligence. In fact, many modules are promising and conservative. The problem is that the app has not yet made those modules authoritative over the actual workout the user starts.

The programming engine is currently:

- Template-capable: yes.
- Rules-aware: yes.
- Partially adaptive: yes, in isolated modules.
- Coherent end-to-end: no.
- Safe from obvious one-session deload overreaction: mostly yes.
- Safe from incomplete or generic active sessions: no.
- Shippable as elite adaptive programming: no.

The next implementation should not add more coaching concepts. It should make one production session engine authoritative, wire the existing evidence into that path, and make final CoachingPacket QA reject any workout an experienced coach would not put in front of a paying athlete.
