# Phase 5 — non-planned session and Programme Builder boundary map

Date: 2026-07-11
Scope: ad-hoc/custom/extra session creation and Programme Builder only. Active-plan construction, Train execution, Progress, Analytics, evidence, and interventions are out of scope.

## Verified boundaries

| File | Symbol | Caller / path | Inputs that matter | Output / write capability | Current classification | Legacy dependency | Phase 5 action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/domain/training/ad-hoc-workout-generator.ts` | `generateWorkoutByFocus` | `programmes/ai.tsx`; extra-session generator; legacy tests | Exercises, optional `currentBlock`, history, range settings | A `Programme` template only | Non-planned generator | `TrainingBlock` selects template/filtering and `repRange` supplies boundary metadata | Remove `currentBlock` from production callers and make the generator use a non-planned design policy. Retain ranges only as non-executable settings. |
| `src/domain/training/extra-session-generator.ts` | `buildExtraFullSessionProgramme` | Home extra-session action | Extra type, legacy `blockType`, exercises | One custom `Programme` for an extra session | Non-planned session | `BlockType` is passed into the ad-hoc generator | Replace `blockType` with no planning-block authority; preserve dedicated extra-session target boundaries. |
| `src/domain/training/extra-session-generator.ts` | `buildExtraVolumeSessionProgramme`, capacity/cardio builders | Home extra-session action | Exercises, user settings, optional equipment | One custom `Programme` for an extra session | Non-planned session | Uses hypertrophy range as non-planned slot guidance | Keep non-planned guidance explicitly separate from planned exact targets. |
| `src/data/local/programme-repository.ts` | `SelectedProgrammeDay`, `selectProgrammeDay` | Extra/AI/session-builder starts | `programmeId`, `dayId`, optional session kind and legacy plan fields | Persists a selected programme-day request | Shared selection boundary | Carries obsolete plan block/week fields; accepts absent kind | Require a non-planned kind for programme/template selection and prevent plan identity fields on it. |
| `src/domain/training/session-builder.ts` | `buildWorkoutSessionFromProgrammeDay` | Legacy tests and the disabled programme selection bridge | Programme/day, selection options | Persists a `WorkoutSession` shape with a forced extra kind | Non-planned construction boundary | Legacy `TrainingBlock` parameter is unused; slots retain range metadata | Remove the unused block argument; reject planned kind/plan identity instead of accepting it then coercing it. |
| `src/features/workout-logging/use-workout-logger.ts` | `createSessionFromProgrammeDay` | Logger initialisation/resume path | Selected programme day, legacy current block/year | Currently clears selection and returns `null` | Deliberately disabled legacy bridge | Large commented legacy block contains block/year generation | Leave the disabled bridge and its comment untouched; only update types/callers if a narrow boundary requires it. |
| `src/domain/training/active-workout.ts` | `getLatestOpenSession` | Logger resume and conflict handling | Persisted sessions | Returns latest open session regardless of kind | Resume, not planned selection | None directly | Preserve custom/extra resume; add a separate planned-only selector if needed for tests/authority proof. |
| `src/features/workout-logging/use-workout-logger.ts` | `advanceTrainingWeekIfEarned` | Completion loop | Completed session, active plan | Advances a microcycle only for `sessionKind === "planned"` | Planned authority guard | None for explicit extras | Strengthen tests around this existing guard; do not refactor the logger. |
| `src/domain/training/workout-history.ts` | `summarizeWorkoutSession` | History/progression consumers | Session kind and logged work | Marks explicit extras as non-planned evidence | Historical/progression boundary | Legacy sessions without kind remain compatibility evidence | Keep legacy compatibility behaviour; prove explicit non-planned sessions do not qualify planned progression. |
| `src/domain/training/programme-builder.ts` | `createCustomProgramme`, day/exercise mutators, `createOneOffSession` | Programme Builder and Session Builder UI | Builder preferences and `ProgressionSettings.repRange` | A custom `Programme` draft/template | Builder draft / preview | Range fields are editable; function names imply planned exercises | Introduce explicit draft/preview terminology and validation; retain ranges as builder guidance only. |
| `app/(protected)/programmes/builder.tsx` | `ProgrammeBuilderScreen` | Builder route | In-memory `Programme` draft | Saves programme library entry, then opens its detail page | Builder UI | Shows raw Min/Max range labels; calls no active-plan creation command | Clarify draft/preview status and boundary wording; do not create active plan or workout. |
| `app/(protected)/programmes/session.tsx` | `SessionBuilderScreen` | One-off custom-session route | One-off template | Saves/selects a programme-day then routes to prep | Custom non-planned UI | Selection currently has no explicit kind | Pass an explicit non-planned custom kind through selection. |
| `app/(protected)/programmes/ai.tsx` | `AIWorkoutScreen` | Create-session route | Uses `useTrainingYear().currentBlock` | Saves/selects extra programme | Non-planned UI | Current block controls generator | Remove training-year input and label output as a custom/extra session. |
| `app/(protected)/(tabs)/index.tsx` | `startExtraSession` | Home extra-session flow | Active plan used for admission only; `blockType` supplied to full-extra builder | Saves/selects extra programme | Extra session UI | Uses `activePlan.activeBlockId` to select block type | Preserve admission context but remove block prescription authority. |
| `src/features/programme-builder/use-programme-builder.ts` | `saveProgramme`, `startProgrammeDay` | Builder detail screen | Programme template | Saves draft/template and selects day | Builder persistence | No active-plan write | Retain draft persistence; make selection explicitly non-planned. |
| `app/(protected)/programmes/[id].tsx` | `ProgrammeDetailScreen` | Saved programme screen | Programme template | Starts programme day via library hook | Builder/library preview | Displays range as executable-looking text | Mark sessions as non-planned and label ranges as design guidance. |

## Authority conclusions

1. `buildRecoveryWorkoutSession` remains the sole authoritative planned-workout constructor. Phase 5 will not change it.
2. The local programme-day selection bridge is disabled in the logger. Existing extra/custom screens write selection state but cannot currently create an active planned workout through the logger.
3. Extra/custom programme templates are at risk of being confused with planned templates because they share `Programme` and `ProgramExercise`. The safe boundary is the selected-session kind and the session builder: a programme-template session must be explicitly non-planned and must not accept plan identity.
4. Extra completion already has an explicit microcycle-advance guard (`sessionKind !== "planned"`). Tests must prove it cannot affect planned selection, completion, or progression evidence.
5. Programme Builder has no approved active-plan creation/replacement command today. Saving a builder draft persists only to the programme library. This phase must preserve that boundary rather than fabricate a handoff.

## Planned Phase 5 changes

1. Add an explicit non-planned custom session kind and central predicates for planned versus non-planned authority.
2. Require programme/template session construction and selected programme-day requests to use a non-planned kind; strip/reject plan identity at that boundary.
3. Remove current-block/year inputs from AI and extra-full generation; use a dedicated non-planned generation policy rather than a block type.
4. Make builder draft/preview validation explicit and document that its range values are design guidance, not final exact prescriptions.
5. Add focused boundary tests for planned-session selection, session construction, extra completion isolation, builder preview isolation, and legacy compatibility.

## Deferred by design

- Existing disabled/commented V2/V3 logger bridge and its legacy current-block helpers.
- Active-plan constructor, planned Train execution, post-workout review, Progress, Analytics, evidence, interventions, and broad persistence migrations.
- Legacy anonymous sessions (`sessionKind` absent): they remain a compatibility case and are not reclassified automatically in this phase.
