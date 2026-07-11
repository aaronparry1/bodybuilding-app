# Settings Behaviour Audit

Status: June 7, 2026

Core rule: no fake controls. If a normal user can choose a setting, it must change training behaviour or be clearly marked as future/coming later.

## Summary

| User-facing choice | Stored field | Production readers | Behaviour changed | Tests | Status |
| --- | --- | --- | --- | --- | --- |
| Goal: Build Muscle | `ActiveTrainingPlan.goal`, `AppSettings.trainingGoal` | `createActiveTrainingPlan`, `resolveBlockSequence`, `recommendStrategicAction`, Progress presenters | Hypertrophy-first planning, success model weights productive volume and recoverable muscle-building work | `strategic-coaching.test.ts`, `plan-page-view-model.test.ts`, `design-qa-fixtures.test.ts` | Working |
| Goal: Build Strength | `ActiveTrainingPlan.goal`, `AppSettings.trainingGoal` | Plan setup, strategic coaching, success model | Strength block bias, compound lift performance priority, lower main-lift rep ranges through block selection | `strategic-coaching.test.ts`, `rep-range-strategy.test.ts` | Working |
| Goal: Build Muscle & Strength | `ActiveTrainingPlan.goal` | Plan setup, annual roadmap, success model | Powerbuilding/strength-hypertrophy emphasis, compound progression plus productive volume | `plan-page-view-model.test.ts`, `strategic-coaching.test.ts` | Working |
| Goal: Athletic Performance | `ActiveTrainingPlan.goal` | Plan setup, block selection, success model | Power block bias, quality/recovery priority, lower junk-volume interpretation | `strategic-coaching.test.ts`, `design-qa-fixtures.test.ts` | Working |
| Goal: Prepare For Event | `ActiveTrainingPlan.goal`, `targetDate`, `eventType` | `resolveBlockSequence`, Plan screen, Progress recommendation priority | Event-specific block sequence and readiness/adherence priority | `plan-page-view-model.test.ts`, `strategic-coaching.test.ts` | Working |
| Goal: Just Help Me Train | `ActiveTrainingPlan.goal` | Plan setup, success model | Conservative hypertrophy defaults and simpler recommendation priority | `strategic-coaching.test.ts`, `design-qa-fixtures.test.ts` | Working |
| 12-month programme | `ActiveTrainingPlan.mode` | `resolveBlockPlanSpecs`, Plan roadmap, Home planned workout | Goal-specific 48-52 week macrocycle with planned deload/recovery blocks | `product-flow-architecture.test.ts`, `plan-page-view-model.test.ts` | Working |
| One block at a time | `ActiveTrainingPlan.mode`, `singleBlockType` | `resolveBlockPlanSpecs`, Plan roadmap, block transition actions | Only selected block exists; Plan exposes choose-next-block at the endpoint | `plan-page-view-model.test.ts`, `recommendation-actions.test.ts` | Working |
| Bespoke/event date | `ActiveTrainingPlan.mode`, `eventType`, `targetDate` | `resolveBlockPlanSpecs`, Plan roadmap | Event/date changes sequence and block durations based on available weeks | `plan-page-view-model.test.ts`, `product-flow-architecture.test.ts` | Working |
| Experience: Beginner | `ActiveTrainingPlan.experienceLevel`, `AppSettings.experienceLevel` | Planned workout generator, extra session generator, exercise filters | Excludes advanced exercises, trims generated exercise count, lowers planned set targets | `ad-hoc-workout-generator.test.ts`, `extra-session-generator.test.ts` | Working |
| Experience: Intermediate | `ActiveTrainingPlan.experienceLevel` | Planned/extra session generators | Normal defaults | `ad-hoc-workout-generator.test.ts` | Working |
| Experience: Advanced | `ActiveTrainingPlan.experienceLevel` | Planned/extra session generators | Allows advanced exercises and more work where template allows | `ad-hoc-workout-generator.test.ts`, `extra-session-generator.test.ts` | Working |
| Training days/week | `ActiveTrainingPlan.daysPerWeek` | `weeklySplitForPlan`, Home, Plan, completion gate | Number of planned sessions per week; rest does not consume a training slot | `plan-page-view-model.test.ts`, `planned-workout.test.ts` | Working |
| Preferred split | `ActiveTrainingPlan.preferredSplit` | `weeklySplitForPlan`, Home, Plan, planned workout generator | Determines the weekly workout sequence | `plan-page-view-model.test.ts` | Working |
| Equipment access | `ActiveTrainingPlan.equipment` | Planned workout generator, extra sessions, Add/Swap recommendation flows | Filters generated programmes to available equipment; search can still find library items deliberately | `ad-hoc-workout-generator.test.ts`, `extra-session-generator.test.ts` | Working |
| Units | `AppSettings.unit` | Workout settings resolver, load display, generators, history summaries | Displays kg/lb consistently and stores session settings in chosen unit | `app-settings.test.ts`, `load-display.test.ts` | Working |
| Weight jumps: barbell/dumbbell/machine/cable | `AppSettings.loadIncrementProfile` | Load increment resolver, starting load, escalation, reductions, generated slots | Rounds recommendations to the user's available increments | `load-increment-strategy.test.ts`, `app-settings.test.ts`, `ad-hoc-workout-generator.test.ts` | Working |
| Rep strategy | `AppSettings.repStrategy` | `resolveWorkoutExerciseSettings` legacy path only | Normal UI now shows Recommended only; advanced custom is marked coming later, not selectable as a fake control | `settings-simplification.test.ts`, `rep-range-strategy.test.ts` | Hidden/future |
| Capacity Focus: Low Back | `AppSettings.capacityFocus.low_back` | Capacity Focus screen, capacity routine list | Enables real Low Back levels 1-3 and completion tracking separate from progression | `session-prep-capacity.test.ts` | Working |
| Capacity Focus: Hips/Ankles/Shoulders/Neck | `AppSettings.capacityFocus.*` legacy fields | Settings/Capacity Focus display only | Marked Coming later and not returned as enabled live routines | `session-prep-capacity.test.ts`, `settings-simplification.test.ts` | Future |

## Fixes Made In This Audit

### Experience Level

Previous behaviour:
Experience was stored and passed into planned workouts, and beginners excluded advanced exercises. The difference was real but too shallow.

Changed behaviour:

IF the user is a beginner  
-> generated workouts use fewer exercise slots and lower planned set targets  
-> BECAUSE beginners need simpler sessions and a longer consistency runway.

IF the user is advanced  
-> generated workouts can use more available template slots and higher planned set targets where appropriate  
-> BECAUSE advanced users can usually tolerate more complexity and volume when performance supports it.

IF the user creates an extra session  
-> the extra session now inherits the active plan experience level  
-> BECAUSE ad-hoc work should not ignore the user's setup.

### Rep Strategy

Previous behaviour:
Settings exposed a selectable `Advanced Custom` option without exposing custom rep range controls. That made the control feel more real than it was.

Changed behaviour:

IF the user opens normal Settings  
-> Rep strategy is shown as `Recommended` with advanced custom marked coming later  
-> BECAUSE the app should not offer a fake control.

### Capacity Focus

Previous behaviour:
Low Back was implemented. Hips, Ankles, Shoulders, and Neck were placeholder routines that could still appear as enabled tracks if toggled.

Changed behaviour:

IF the user enables Low Back  
-> Low Back levels 1-3 appear and can be completed  
-> BECAUSE that track has real routines.

IF the user sees Hips, Ankles, Shoulders, or Neck  
-> they are shown as Coming later and cannot be completed as real training  
-> BECAUSE placeholder tracks should not pretend to be finished features.

## Remaining Limitations

- Equipment access is preset-based. Per-machine availability and custom machine-specific increments can come later.
- Expanded exercise taxonomy did not add new normal-user equipment controls. Chains, specialty bars, boards, blocks, medicine balls, slam balls, trap bars, and similar implements are filtered conservatively through `other` plus the base equipment where relevant. Bands use the existing `bands` category.
- Event planning uses broad event categories and date-sized block sequences, not detailed sport calendars.
- Custom sequence remains internal/future and is hidden from normal onboarding until a real builder exists.
- Advanced custom rep ranges remain a future feature.
- Capacity Focus is fully live for Low Back only. Other tracks are intentionally future-labelled.
